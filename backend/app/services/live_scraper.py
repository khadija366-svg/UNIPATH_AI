"""Bounded, observable live scraping for official university admission pages."""

from __future__ import annotations

import logging
import json
import os
import re
import tempfile
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from typing import Any, Dict, Iterable, List, Optional

import requests
from bs4 import BeautifulSoup
from requests import Response
from requests.exceptions import RequestException, SSLError, Timeout

logger = logging.getLogger(__name__)

USER_AGENT = (
    "UniPathAI/1.0 (+https://unipath.ai; admission information research; "
    "contact site administrator before automated access)"
)
DEFAULT_TIMEOUT = (5.0, 15.0)
MAX_ATTEMPTS = 3
MAX_WORKERS = 3
MAX_SOURCE_PAGES = 4
DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "universities.json")


@dataclass
class ScrapeResult:
    university_id: str
    university: str
    url: str
    status: str
    data_source: str
    scraped_at: str
    http_status: Optional[int] = None
    response_time_ms: Optional[int] = None
    extracted_fields: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

    def as_dict(self) -> Dict[str, Any]:
        return asdict(self)


class FetchError(Exception):
    def __init__(self, code: str, message: str, http_status: Optional[int] = None):
        super().__init__(message)
        self.code = code
        self.http_status = http_status


class UniversityParser:
    university_id = "generic"

    def extract_program_updates(self, text: str, university: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
        updates: Dict[str, Dict[str, Any]] = {}
        date_pattern = r"(?:deadline|last date|apply before|closing date)[^.;]{0,100}?((?:\d{4}[-/]\d{1,2}[-/]\d{1,2})|(?:\d{1,2}[-/]\d{1,2}[-/]\d{2,4})|(?:\d{1,2}\s+[A-Za-z]{3,9},?\s+\d{4})|(?:[A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4}))"
        deadline_match = re.search(date_pattern, text, re.IGNORECASE)
        deadline = None
        if deadline_match:
            raw_date = deadline_match.group(1).replace("/", "-")
            for pattern in ("%Y-%m-%d", "%d-%m-%Y", "%d-%m-%y", "%d %B %Y", "%d %b %Y", "%B %d %Y", "%b %d %Y"):
                try:
                    deadline = datetime.strptime(raw_date, pattern).date().isoformat()
                    break
                except ValueError:
                    continue
        status_match = re.search(r"\b(?:admissions?|applications?)[^.;]{0,80}\b(open|closed)\b", text, re.IGNORECASE)
        status = None
        if status_match:
            status = "OPEN" if status_match.group(1).lower() == "open" else "CLOSED"

        for program in university.get("programs", []):
            program_name = program.get("name", "")
            window_start = text.lower().find(program_name.lower()) if program_name else -1
            window = text[window_start:window_start + 900] if window_start >= 0 else ""
            fee_match = re.search(r"(?:pkr|rs\.?|rupees?)\s*([\d,]+)", window, re.IGNORECASE)
            program_update: Dict[str, Any] = {}
            if deadline:
                program_update["deadline"] = deadline
            if status:
                program_update["deadline_status"] = status
            if fee_match:
                program_update["fees"] = {**program.get("fees", {}), "amount": float(fee_match.group(1).replace(",", ""))}
            if program_update:
                updates[program["program_id"]] = program_update
        return updates


class ItuParser(UniversityParser):
    university_id = "itu_lahore"


class FastParser(UniversityParser):
    university_id = "fast_lahore"


class UetParser(UniversityParser):
    university_id = "uet_lahore"

    def extract_program_updates(self, text: str, university: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
        updates = super().extract_program_updates(text, university)
        if updates or not re.search(r"\b(?:applications?|admissions?)[^.;]{0,80}\bopen\b", text, re.IGNORECASE):
            return updates
        return {
            program["program_id"]: {"deadline_status": "OPEN"}
            for program in university.get("programs", [])
        }


class PunjabParser(UniversityParser):
    university_id = "pu_lahore"


class LumsParser(UniversityParser):
    university_id = "lums"


PARSER_REGISTRY = {parser.university_id: parser for parser in (ItuParser, FastParser, UetParser, PunjabParser, LumsParser)}


class BaseScraper:
    def __init__(self, timeout=DEFAULT_TIMEOUT, max_attempts=MAX_ATTEMPTS):
        self.timeout = timeout
        self.max_attempts = max_attempts

    def fetch(self, url: str) -> Response:
        headers = {
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.8",
            "Accept-Encoding": "gzip, deflate",
            "Connection": "keep-alive",
        }
        session = requests.Session()
        started = time.monotonic()
        for attempt in range(1, self.max_attempts + 1):
            logger.info("SCRAPE REQUEST university_url=%s attempt=%d", url, attempt)
            try:
                response = session.get(url, headers=headers, timeout=self.timeout, allow_redirects=True)
                logger.info(
                    "SCRAPE RESPONSE url=%s status=%d response_time_ms=%d",
                    url,
                    response.status_code,
                    int((time.monotonic() - started) * 1000),
                )
                if response.status_code == 429:
                    if attempt < self.max_attempts:
                        retry_after = response.headers.get("Retry-After", "")
                        delay = min(float(retry_after) if retry_after.isdigit() else 2 ** (attempt - 1), 8)
                        time.sleep(delay)
                        continue
                    raise FetchError("RATE_LIMITED", "The source rate-limited the scraper", 429)
                if response.status_code in {500, 502, 503, 504} and attempt < self.max_attempts:
                    time.sleep(min(2 ** (attempt - 1), 8))
                    continue
                if response.status_code in {401, 403}:
                    raise FetchError("BLOCKED", "The source denied automated access", response.status_code)
                if response.status_code == 404:
                    raise FetchError("NOT_FOUND", "The configured source URL was not found", 404)
                if response.status_code >= 400:
                    raise FetchError("HTTP_ERROR", f"Source returned HTTP {response.status_code}", response.status_code)
                return response
            except Timeout as exc:
                if attempt == self.max_attempts:
                    raise FetchError("TIMEOUT", "Source connection/read timeout") from exc
            except SSLError as exc:
                raise FetchError("SSL_ERROR", "TLS certificate validation failed") from exc
            except RequestException as exc:
                if attempt == self.max_attempts:
                    raise FetchError("NETWORK_ERROR", "Could not connect to the source") from exc
                time.sleep(min(2 ** (attempt - 1), 8))
        raise FetchError("NETWORK_ERROR", "Source request failed")

    def parse(self, response: Response, university: Dict[str, Any]) -> Dict[str, Any]:
        content_type = response.headers.get("Content-Type", "").lower()
        if "html" not in content_type and not response.text.lstrip().startswith(("<!doctype", "<html", "<HTML")):
            raise FetchError("INVALID_CONTENT", "Source response was not HTML", response.status_code)
        soup = BeautifulSoup(response.content, "html.parser")
        for element in soup(["script", "style", "noscript"]):
            element.decompose()
        text = " ".join(soup.stripped_strings)
        if len(text) < 80:
            raise FetchError("PARSER_FAILURE", "HTML contained no meaningful page text", response.status_code)

        parser = PARSER_REGISTRY.get(university["university_id"], UniversityParser)()
        updates = parser.extract_program_updates(text, university)
        if not updates:
            raise FetchError("PARSER_FAILURE", "Page loaded but no structured program fields were recognized", response.status_code)
        fields: Dict[str, Any] = {
            "title": soup.title.get_text(" ", strip=True) if soup.title else None,
            "program_updates": updates,
            "recognized_fields": sorted({field for update in updates.values() for field in update}),
        }
        return fields

    def scrape(self, university: Dict[str, Any]) -> ScrapeResult:
        source = university.get("source", {})
        url = source.get("url", "")
        timestamp = datetime.now(timezone.utc).isoformat()
        if not url:
            return ScrapeResult(university["university_id"], university["name"], url, "CONFIG_ERROR", "cache", timestamp, error="No source URL configured")
        started = time.monotonic()
        logger.info("SCRAPE START university=%s url=%s", university["university_id"], url)
        try:
            urls = [url]
            for program in university.get("programs", []):
                program_url = program.get("source", {}).get("url")
                if program_url and program_url not in urls:
                    urls.append(program_url)
                if len(urls) >= MAX_SOURCE_PAGES:
                    break
            page_text = []
            last_response = None
            failures = []
            for page_url in urls:
                try:
                    response = self.fetch(page_url)
                    last_response = response
                    page_text.append(response.content)
                except FetchError as exc:
                    failures.append((page_url, exc.code, exc.http_status))
            if not page_text:
                first_failure = failures[0][1] if failures else "SOURCE_PAGES_FAILED"
                code = first_failure if first_failure in {"BLOCKED", "NOT_FOUND", "RATE_LIMITED", "TIMEOUT", "SSL_ERROR", "NETWORK_ERROR", "HTTP_ERROR"} else "SOURCE_PAGES_FAILED"
                http_status = failures[0][2] if failures else None
                details = "; ".join(f"{page_url}: {failure_code}" for page_url, failure_code, _ in failures)
                raise FetchError(code, details or "No source pages were available", http_status)
            combined = Response()
            combined.status_code = last_response.status_code
            combined.headers = last_response.headers
            combined._content = b"<html><body>" + b"\n".join(page_text) + b"</body></html>"
            fields = self.parse(combined, university)
            fields["source_pages"] = urls
            if failures:
                fields["source_page_failures"] = [f"{page_url}: {failure_code}" for page_url, failure_code, _ in failures]
            result = ScrapeResult(
                university["university_id"], university["name"], url, "success", "live", timestamp,
                last_response.status_code, int((time.monotonic() - started) * 1000), fields,
            )
            logger.info("SCRAPE VALIDATION university=%s result=success fields=%s", university["university_id"], fields["recognized_fields"])
            return result
        except FetchError as exc:
            logger.warning("SCRAPE FAILURE university=%s code=%s status=%s error=%s", university["university_id"], exc.code, exc.http_status, exc)
            return ScrapeResult(university["university_id"], university["name"], url, exc.code, "cache", timestamp, exc.http_status, int((time.monotonic() - started) * 1000), error=str(exc))


def scrape_universities(universities: Iterable[Dict[str, Any]], max_workers: int = MAX_WORKERS) -> List[Dict[str, Any]]:
    """Scrape independently; one unavailable university never aborts the batch."""
    items = list(universities)
    results: List[Dict[str, Any]] = []
    with ThreadPoolExecutor(max_workers=min(max_workers, max(len(items), 1))) as executor:
        futures = {executor.submit(BaseScraper().scrape, university): university for university in items}
        for future in as_completed(futures):
            university = futures[future]
            try:
                results.append(future.result().as_dict())
            except Exception as exc:  # Defensive isolation around worker failures.
                logger.exception("SCRAPE WORKER FAILURE university=%s", university.get("university_id"))
                results.append(ScrapeResult(university["university_id"], university["name"], university.get("source", {}).get("url", ""), "WORKER_ERROR", "cache", datetime.now(timezone.utc).isoformat(), error=str(exc)).as_dict())
    return sorted(results, key=lambda result: result["university_id"])


def persist_live_updates(results: List[Dict[str, Any]]) -> int:
    """Atomically replace only validated fields in the JSON cache."""
    with open(DATA_PATH, "r", encoding="utf-8") as handle:
        payload = json.load(handle)
    timestamp = datetime.now(timezone.utc).isoformat()
    result_by_id = {result["university_id"]: result for result in results if result["status"] == "success"}
    updated_programs = 0
    for university in payload.get("universities", []):
        result = result_by_id.get(university["university_id"])
        if not result:
            continue
        updates = result.get("extracted_fields", {}).get("program_updates", {})
        university_updated = 0
        for program in university.get("programs", []):
            update = updates.get(program["program_id"])
            if not update:
                continue
            program.update(update)
            program["source"] = {**program.get("source", {}), "data_source": "live", "status": "live", "verified_at": timestamp, "confidence": "HIGH"}
            updated_programs += 1
            university_updated += 1
        if university_updated:
            university["source"] = {**university.get("source", {}), "data_source": "live", "status": "live", "verified_at": timestamp, "confidence": "HIGH"}
    if not updated_programs:
        return 0
    directory = os.path.dirname(DATA_PATH)
    fd, temporary_path = tempfile.mkstemp(prefix="universities-", suffix=".json", dir=directory, text=True)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            json.dump(payload, handle, indent=2, ensure_ascii=False)
            handle.write("\n")
        os.replace(temporary_path, DATA_PATH)
    finally:
        if os.path.exists(temporary_path):
            os.unlink(temporary_path)
    logger.info("SCRAPE CACHE operation=write updated_programs=%d", updated_programs)
    return updated_programs
