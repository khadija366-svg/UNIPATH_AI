from datetime import datetime, date
from typing import Dict, Any, Optional
from app.config import CLOSING_SOON_DAYS


def evaluate_deadline(program: Dict[str, Any]) -> Dict[str, Any]:
    deadline_str = program.get("deadline")
    if not deadline_str:
        return {"status": "UNKNOWN", "date": None, "days_remaining": None}

    deadline = datetime.strptime(deadline_str, "%Y-%m-%d").date()
    today = date.today()
    days = (deadline - today).days

    if days < 0:
        status = "CLOSED"
    elif days <= CLOSING_SOON_DAYS:
        status = "CLOSING_SOON"
    else:
        status = "OPEN"

    return {"status": status, "date": deadline_str, "days_remaining": days}
