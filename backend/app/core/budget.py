from typing import Dict, Any, Optional


def annualize_fee(amount: Optional[float], period: str = "semester") -> Optional[float]:
    """Return the annual fee given a per-period amount and its billing period.

    Returns None when the amount is not known.
    """
    if amount is None:
        return None
    return amount * 2 if period == "semester" else amount


def evaluate_budget(profile: Dict[str, Any], program: Dict[str, Any]) -> Dict[str, Any]:
    fees = program.get("fees", {})
    amount = fees.get("amount")
    period = fees.get("period", "semester")
    budget = profile.get("budget", 0)

    annual_fee = annualize_fee(amount, period)
    if annual_fee is None:
        return {"status": "UNKNOWN", "detail": "Fee information not verified"}

    if budget >= annual_fee:
        return {"status": "WITHIN_BUDGET", "detail": f"Annual fee PKR {annual_fee:,.0f} within budget"}
    else:
        return {"status": "ABOVE_BUDGET", "detail": f"Annual fee PKR {annual_fee:,.0f} exceeds budget"}
