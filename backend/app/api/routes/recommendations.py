from fastapi import APIRouter
from app.schemas.profile import StudentProfile
from app.core.recommendations import generate_recommendations, evaluate_program
from app.services.university_service import get_all_programs
from app.config import DATASET_VERSION
from app.core.deadlines import evaluate_deadline

router = APIRouter()


def build_analysis(profile: StudentProfile):
    profile_dict = profile.model_dump()
    recommendations = generate_recommendations(profile_dict)

    program_matches = []
    for rec in recommendations:
        program_matches.append({
            "program_id": rec["program_id"],
            "program": rec["program"],
            "university": rec["university"],
            "match": rec["program_match"],
        })

    deadlines = []
    for rec in recommendations:
        if rec.get("deadline_date"):
            deadlines.append({
                "university": rec["university"],
                "program": rec["program"],
                "date": rec["deadline_date"],
                "status": rec["deadline_status"],
                "days_remaining": rec.get("days_remaining"),
                "urgency": "HIGH" if rec["deadline_status"] == "CLOSING_SOON" else "NORMAL",
            })

    stats = {
        "matched": len(recommendations),
        "eligible": sum(1 for r in recommendations if r["eligibility"]["status"] == "ELIGIBLE"),
        "strong": sum(1 for r in recommendations if r["match_score"] >= 75),
        "deadlines": len(deadlines),
    }

    return {
        "profile_summary": {
            "name": profile.name,
            "matric_percentage": profile.matric_percentage,
            "intermediate_percentage": profile.intermediate_percentage,
            "qualification": profile.qualification,
            "preferred_program": profile.preferred_program,
            "budget": profile.budget,
            "location": profile.location,
        },
        "program_matches": program_matches,
        "evaluations": recommendations,
        "recommendations": recommendations,
        "deadlines": deadlines,
        "stats": stats,
        "dataset_version": DATASET_VERSION,
    }


@router.post("/profile/analyze")
def analyze_profile(profile: StudentProfile):
    return build_analysis(profile)


@router.post("/recommendations")
def get_recommendations(profile: StudentProfile):
    return {"recommendations": generate_recommendations(profile.model_dump())}
