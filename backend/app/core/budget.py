from typing import Dict, Any


def evaluate_budget(profile: Dict[str, Any], program: Dict[str, Any]) -> Dict[str, Any]:
    fees = program.get("fees", {})
    amount = fees.get("amount")
    period = fees.get("period", "semester")
    budget = profile.get("budget", 0)

    if amount is None:
        return {"status": "UNKNOWN", "detail": "Fee information not verified"}

    annual_fee = amount * 2 if period == "semester" else amount

    if budget >= annual_fee:
        return {"status": "WITHIN_BUDGET", "detail": f"Annual fee PKR {annual_fee:,.0f} within budget"}
    else:
        return {"status": "ABOVE_BUDGET", "detail": f"Annual fee PKR {annual_fee:,.0f} exceeds budget"}
