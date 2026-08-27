from fastapi import APIRouter
from app.services.university_service import get_all_programs
from app.core.deadlines import evaluate_deadline

router = APIRouter()


@router.get("/deadlines")
def list_deadlines():
    deadlines = []
    for program in get_all_programs():
        result = evaluate_deadline(program)
        if program.get("deadline"):
            deadlines.append({
                "university": program["university_name"],
                "program": program["name"],
                "program_id": program["program_id"],
                "date": result["date"],
                "status": result["status"],
                "days_remaining": result["days_remaining"],
            })

    deadlines.sort(key=lambda d: (d["days_remaining"] if d["days_remaining"] is not None else 999))
    return {"deadlines": deadlines}
