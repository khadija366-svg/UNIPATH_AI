import pytest
from datetime import date, timedelta
from app.core.deadlines import evaluate_deadline
from app.services.university_service import load_universities, get_all_programs
from app.api.routes.counselor import _clean_markdown


def test_specific_deadline_status_classifications():
    """Verify that past deadlines are CLOSED and far-future deadlines (>7 days) are OPEN."""
    today = date.today()
    # Past dates must be CLOSED
    past_1 = (today - timedelta(days=9)).strftime("%Y-%m-%d")  # e.g. Aug 28 relative to Sep 6
    past_2 = (today - timedelta(days=7)).strftime("%Y-%m-%d")  # e.g. Aug 30 relative to Sep 6
    past_3 = (today - timedelta(days=1)).strftime("%Y-%m-%d")  # e.g. Sep 5 relative to Sep 6
    assert evaluate_deadline({"deadline": past_1})["status"] == "CLOSED"
    assert evaluate_deadline({"deadline": past_2})["status"] == "CLOSED"
    assert evaluate_deadline({"deadline": past_3})["status"] == "CLOSED"

    # Within 7 days must be CLOSING_SOON
    soon_1 = (today + timedelta(days=3)).strftime("%Y-%m-%d")
    soon_2 = (today + timedelta(days=7)).strftime("%Y-%m-%d")
    assert evaluate_deadline({"deadline": soon_1})["status"] == "CLOSING_SOON"
    assert evaluate_deadline({"deadline": soon_2})["status"] == "CLOSING_SOON"

    # Beyond 7 days must be OPEN
    future_1 = (today + timedelta(days=9)).strftime("%Y-%m-%d")   # e.g. Sep 15 relative to Sep 6
    future_2 = (today + timedelta(days=14)).strftime("%Y-%m-%d")  # e.g. Sep 20 relative to Sep 6
    assert evaluate_deadline({"deadline": future_1})["status"] == "OPEN"
    assert evaluate_deadline({"deadline": future_2})["status"] == "OPEN"


def test_load_universities_dynamic_deadline_status():
    """Verify that load_universities dynamically evaluates deadline statuses for all programs."""
    universities = load_universities()
    uni_map = {u["university_id"]: u for u in universities}

    # FAST (2026-08-30) should be CLOSED as of Sep 6, 2026
    fast_progs = uni_map["fast_lahore"]["programs"]
    for p in fast_progs:
        assert p["deadline_status"] == "CLOSED"

    # UET (2026-09-05) should be CLOSED as of Sep 6, 2026
    uet_progs = uni_map["uet_lahore"]["programs"]
    for p in uet_progs:
        assert p["deadline_status"] == "CLOSED"

    # LUMS (2026-08-28) should be CLOSED as of Sep 6, 2026
    lums_progs = uni_map["lums"]["programs"]
    for p in lums_progs:
        assert p["deadline_status"] == "CLOSED"

    # ITU (2026-09-15) should be OPEN (9 days away > 7)
    itu_progs = uni_map["itu_lahore"]["programs"]
    for p in itu_progs:
        assert p["deadline_status"] == "OPEN"

    # PU (2026-09-20) should be OPEN (14 days away > 7)
    pu_progs = uni_map["pu_lahore"]["programs"]
    for p in pu_progs:
        assert p["deadline_status"] == "OPEN"


def test_clean_markdown_unescapes_tokens():
    """Verify that escaped markdown backslashes are sanitized correctly."""
    raw = r"\### Short Answer\n\*\*Universities offer BSCS\*\*\n\---"
    cleaned = _clean_markdown(raw)
    assert r"\###" not in cleaned
    assert "### Short Answer" in cleaned
    assert r"\*\*" not in cleaned
    assert "**Universities offer BSCS**" in cleaned
    assert r"\---" not in cleaned
    assert "---" in cleaned
