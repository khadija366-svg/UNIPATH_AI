from unittest.mock import MagicMock, patch

import requests
from fastapi.testclient import TestClient

from app.main import app
from app.services.live_scraper import BaseScraper, UetParser, scrape_universities


UNIVERSITY = {
    "university_id": "test_uni",
    "name": "Test University",
    "source": {"url": "https://example.edu/admissions"},
}


def html_response(text="Admissions Eligibility. BS Computer Science deadline 2026-09-15. PKR 50,000. Official admission requirements and application schedule are published here."):
    response = MagicMock()
    response.status_code = 200
    response.headers = {"Content-Type": "text/html"}
    response.content = f"<html><title>Admissions</title><body>{text}</body></html>".encode()
    response.text = response.content.decode()
    return response


def test_success_requires_useful_admission_fields():
    with patch("app.services.live_scraper.requests.Session.get", return_value=html_response()):
        result = BaseScraper(max_attempts=1).scrape(UNIVERSITY).as_dict()

    assert result["status"] == "success"
    assert result["data_source"] == "live"
    assert "recognized_fields" in result["extracted_fields"]


def test_http_block_is_reported_and_uses_cache_source():
    response = html_response()
    response.status_code = 403
    with patch("app.services.live_scraper.requests.Session.get", return_value=response):
        result = BaseScraper(max_attempts=1).scrape(UNIVERSITY).as_dict()

    assert result["status"] == "BLOCKED"
    assert result["http_status"] == 403
    assert result["data_source"] == "cache"


def test_timeout_is_reported():
    with patch("app.services.live_scraper.requests.Session.get", side_effect=requests.Timeout()):
        result = BaseScraper(max_attempts=1).scrape(UNIVERSITY).as_dict()

    assert result["status"] == "TIMEOUT"
    assert result["data_source"] == "cache"


def test_empty_admission_page_is_parser_failure():
    with patch("app.services.live_scraper.requests.Session.get", return_value=html_response("Welcome to our website")):
        result = BaseScraper(max_attempts=1).scrape(UNIVERSITY).as_dict()

    assert result["status"] == "PARSER_FAILURE"
    assert result["data_source"] == "cache"


def test_uet_parser_updates_only_explicit_open_status():
    university = {"programs": [{"program_id": "uet_bscs"}, {"program_id": "uet_bsse"}]}
    updates = UetParser().extract_program_updates("Applications for leftover seats are now open.", university)

    assert updates == {
        "uet_bscs": {"deadline_status": "OPEN"},
        "uet_bsse": {"deadline_status": "OPEN"},
    }


def test_batch_isolates_failures():
    responses = [html_response(), requests.Timeout(), requests.Timeout(), requests.Timeout()]

    def get_response(*args, **kwargs):
        response = responses.pop(0)
        if isinstance(response, Exception):
            raise response
        return response

    second = {**UNIVERSITY, "university_id": "second", "name": "Second University"}
    with patch("app.services.live_scraper.requests.Session.get", side_effect=get_response):
        results = scrape_universities([UNIVERSITY, second], max_workers=2)

    assert {result["university_id"] for result in results} == {"test_uni", "second"}
    assert any(result["status"] == "success" for result in results)
    assert any(result["status"] == "TIMEOUT" for result in results)


def test_refresh_endpoint_exposes_partial_status_and_cache_fallback():
    mocked_results = [
        {"university_id": "comsats_lahore", "status": "success", "data_source": "live"},
        {"university_id": "fast_lahore", "status": "TIMEOUT", "data_source": "cache"},
    ]
    with patch("app.api.routes.universities.scrape_universities", return_value=mocked_results):
        response = TestClient(app).post("/api/universities/refresh?ids=comsats_lahore,fast_lahore")

    assert response.status_code == 200
    assert response.json()["status"] == "partial"
    assert response.json()["cache_fallback"] is True
