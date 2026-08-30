from collections import defaultdict
from fastapi import APIRouter
from app.schemas.profile import StudentProfile
from app.core.recommendations import generate_recommendations
from app.core.budget import annualize_fee

router = APIRouter()


@router.post("/analytics")
def get_analytics(profile: StudentProfile):
    recommendations = generate_recommendations(profile.model_dump())

    eligibility_distribution = defaultdict(int)
    deadline_urgency = defaultdict(int)
    test_counts = defaultdict(int)
    program_counts = defaultdict(int)
    fee_comparison = []

    max_fee = 0
    for rec in recommendations:
        eligibility_distribution[rec["eligibility"]["status"]] += 1
        deadline_urgency[rec["deadline_status"]] += 1
        test_counts[rec["test_status"]] += 1
        program_counts[rec["program"]] += 1
        if rec["fee"]:
            annual = annualize_fee(rec["fee"], rec.get("fee_period", "semester")) or 0
            fee_comparison.append({
                "program_id": rec["program_id"],
                "university": rec["university"],
                "program": rec["program"],
                "fee": annual,
            })
            max_fee = max(max_fee, annual)

    fee_comparison.sort(key=lambda x: x["fee"])

    return {
        "eligibility_distribution": dict(eligibility_distribution),
        "deadline_urgency": [{"status": k, "count": v} for k, v in deadline_urgency.items()],
        "test_requirements": [{"test": k, "count": v} for k, v in test_counts.items()],
        "program_counts": [{"program": k, "count": v} for k, v in program_counts.items()],
        "fee_comparison": fee_comparison,
        "max_fee": max_fee,
        "total_programs": len(recommendations),
    }
