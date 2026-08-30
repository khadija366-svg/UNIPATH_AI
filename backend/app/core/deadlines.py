import logging
from datetime import datetime, date
from typing import Dict, Any, Optional
from app.config import CLOSING_SOON_DAYS

logger = logging.getLogger(__name__)


def evaluate_deadline(program: Dict[str, Any]) -> Dict[str, Any]:
    deadline_str = program.get("deadline")
    if not deadline_str:
        return {"status": "UNKNOWN", "date": None, "days_remaining": None}

    try:
        deadline = datetime.strptime(deadline_str, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        logger.warning(
            "Malformed deadline for program %s: %r",
            program.get("program_id", "unknown"),
            deadline_str,
        )
        return {"status": "UNKNOWN", "date": None, "days_remaining": None}

    today = date.today()
    days = (deadline - today).days

    if days < 0:
        status = "CLOSED"
    elif days <= CLOSING_SOON_DAYS:
        status = "CLOSING_SOON"
    else:
        status = "OPEN"

    return {"status": status, "date": deadline_str, "days_remaining": days}
