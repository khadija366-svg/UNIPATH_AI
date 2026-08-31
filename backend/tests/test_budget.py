from app.core.budget import evaluate_budget, annualize_fee


def test_annualize_fee():
    assert annualize_fee(220000, "semester") == 440000
    assert annualize_fee(440000, "year") == 440000
    assert annualize_fee(None) is None


def test_evaluate_budget_within_budget():
    profile = {"budget": 500000}
    program = {"fees": {"amount": 220000, "period": "semester"}}
    result = evaluate_budget(profile, program)
    assert result["status"] == "WITHIN_BUDGET"
    assert "PKR 440,000 within budget" in result["detail"]


def test_evaluate_budget_above_budget():
    profile = {"budget": 300000}
    program = {"fees": {"amount": 220000, "period": "semester"}}
    result = evaluate_budget(profile, program)
    assert result["status"] == "ABOVE_BUDGET"
    assert "exceeds budget" in result["detail"]


def test_evaluate_budget_unknown():
    profile = {"budget": 500000}
    program = {"fees": {"amount": None}}
    result = evaluate_budget(profile, program)
    assert result["status"] == "UNKNOWN"
