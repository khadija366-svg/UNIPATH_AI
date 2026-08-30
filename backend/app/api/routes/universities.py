from typing import Optional
from fastapi import APIRouter, Query, HTTPException
from app.services.university_service import load_universities, normalize_program_name

router = APIRouter()


@router.get("/universities")
def list_universities(
    program: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    test_required: Optional[str] = Query(None),
):
    universities = load_universities()

    if program or city or test_required is not None:
        filtered = []
        for uni in universities:
            programs = []
            for p in uni.get("programs", []):
                if program and normalize_program_name(program) != p["normalized_name"]:
                    continue
                if city and city.lower() != uni["city"].lower():
                    continue
                if test_required is not None:
                    required = test_required.lower() == "true"
                    if p.get("tests", {}).get("required") != required:
                        continue
                programs.append(p)
            if programs:
                uni_copy = {**uni, "programs": programs}
                filtered.append(uni_copy)
        universities = filtered

    return {"universities": universities, "count": len(universities)}


@router.get("/universities/{university_id}")
def get_university(university_id: str):
    for uni in load_universities():
        if uni["university_id"] == university_id:
            return uni
    raise HTTPException(
        status_code=404,
        detail={"code": "NOT_FOUND", "message": "University not found"},
    )
