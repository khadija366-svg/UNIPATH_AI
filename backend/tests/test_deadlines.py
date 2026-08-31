from datetime import date, timedelta
from app.core.deadlines import evaluate_deadline


def test_evaluate_deadline_open():
    future_date = (date.today() + timedelta(days=30)).strftime("%Y-%m-%d")
    program = {"deadline": future_date}
    result = evaluate_deadline(program)
    assert result["status"] == "OPEN"
    assert result["days_remaining"] == 30


def test_evaluate_deadline_closing_soon():
    soon_date = (date.today() + timedelta(days=5)).strftime("%Y-%m-%d")
    program = {"deadline": soon_date}
    result = evaluate_deadline(program)
    assert result["status"] == "CLOSING_SOON"
    assert result["days_remaining"] == 5


def test_evaluate_deadline_closed():
    past_date = (date.today() - timedelta(days=5)).strftime("%Y-%m-%d")
    program = {"deadline": past_date}
    result = evaluate_deadline(program)
    assert result["status"] == "CLOSED"
    assert result["days_remaining"] < 0


def test_evaluate_deadline_unknown():
    program = {"deadline": None}
    result = evaluate_deadline(program)
    assert result["status"] == "UNKNOWN"
    assert result["date"] is None
