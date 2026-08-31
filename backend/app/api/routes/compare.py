from typing import List
from fastapi import APIRouter
from pydantic import BaseModel
from app.core.recommendations import evaluate_program, calculate_match_score, categorize, build_reasons
from app.services.university_service import get_all_programs

router = APIRouter()


class Selection(BaseModel):
    university_id: str
    program_id: str


class CompareRequest(BaseModel):
    profile: dict
    selections: List[Selection]


@router.post("/compare")
def compare_programs(request: CompareRequest):
    programs = {p["program_id"]: p for p in get_all_programs()}
    items = []

    for sel in request.selections:
        program = programs.get(sel.program_id)
        if program and program["university_id"] == sel.university_id:
            ev = evaluate_program(request.profile, program)
            score = calculate_match_score(ev)
            ev["match_score"] = score
            items.append({
                "program_id": program["program_id"],
                "university_id": program["university_id"],
                "university": program["university_name"],
                "program": program["name"],
                "campus": program.get("campus", "Lahore"),
                "city": program.get("city", "Lahore"),
                "eligibility_status": ev["eligibility"]["status"],
                "eligibility_details": ev["eligibility"],
                "test_status": ev["test_status"],
                "test_detail": ev.get("test_detail"),
                "merit": ev["merit"],
                "merit_breakdown": ev.get("merit_breakdown"),
                "fee": ev.get("annual_fee") or ev.get("fee"),
                "semester_fee": ev.get("fee"),
                "deadline_status": ev["deadline_status"],
                "deadline_date": ev.get("deadline_date"),
                "program_match": ev["program_match"],
                "match_score": score,
                "confidence": ev["confidence"],
                "reasons": build_reasons(ev),
            })

    return {"items": items}
