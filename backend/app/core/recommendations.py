from typing import Dict, Any, List
from concurrent.futures import ThreadPoolExecutor

from app.services.university_service import get_all_programs
from app.core.eligibility import evaluate_eligibility
from app.core.tests import evaluate_tests
from app.core.merit import calculate_merit
from app.core.budget import evaluate_budget
from app.core.deadlines import evaluate_deadline
from app.core.program_matching import match_program


def evaluate_program(profile: Dict[str, Any], program: Dict[str, Any]) -> Dict[str, Any]:
    eligibility = evaluate_eligibility(profile, program)
    test_status = evaluate_tests(profile, program)
    merit = calculate_merit(profile, program)
    budget = evaluate_budget(profile, program)
    deadline = evaluate_deadline(program)
    program_match = match_program(profile, program)

    return {
        "program_id": program["program_id"],
        "university_id": program["university_id"],
        "university": program["university_name"],
        "program": program["name"],
        "campus": program["campus"],
        "city": program["city"],
        "eligibility": eligibility,
        "test_status": test_status["status"],
        "test_detail": test_status["detail"],
        "merit": merit,
        "fee": program.get("fees", {}).get("amount"),
        "fee_period": program.get("fees", {}).get("period", "semester"),
        "budget_status": budget["status"],
        "budget_detail": budget["detail"],
        "deadline_status": deadline["status"],
        "deadline_date": deadline["date"],
        "days_remaining": deadline["days_remaining"],
        "program_match": program_match,
        "source": program.get("source", {}),
        "confidence": program.get("source", {}).get("confidence", "MEDIUM"),
    }


def calculate_match_score(evaluation: Dict[str, Any]) -> float:
    if evaluation["eligibility"]["status"] == "NOT_ELIGIBLE":
        return 0

    academic_fit = 0
    if evaluation["eligibility"]["status"] == "ELIGIBLE":
        academic_fit = 40
    elif evaluation["eligibility"]["status"] == "INFORMATION_MISSING":
        academic_fit = 20

    # Fold entry-test status into academic fit (missing/invalid test reduces
    # the score but does not zero it — it is recoverable, not a hard rejection).
    test_status = evaluation.get("test_status", "")
    if test_status in ("TEST_REQUIRED", "TEST_SCORE_INVALID"):
        academic_fit = max(academic_fit - 15, 0)

    program_match_score = {"EXACT_MATCH": 25, "RELATED_MATCH": 15, "NO_MATCH": 0}.get(evaluation["program_match"], 0)

    budget_fit = {"WITHIN_BUDGET": 20, "UNKNOWN": 10, "ABOVE_BUDGET": 0}.get(evaluation["budget_status"], 0)

    deadline_score = {"OPEN": 10, "CLOSING_SOON": 7, "UNKNOWN": 3, "CLOSED": 0}.get(evaluation["deadline_status"], 0)

    preference = 5 if evaluation["program_match"] == "EXACT_MATCH" else 2

    return academic_fit + program_match_score + budget_fit + deadline_score + preference


def categorize(score: float) -> str:
    if score >= 90:
        return "Excellent Match"
    if score >= 75:
        return "Strong Match"
    if score >= 60:
        return "Moderate Match"
    return "Low Match"


def build_reasons(evaluation: Dict[str, Any]) -> List[str]:
    reasons = []
    if evaluation["eligibility"]["status"] == "ELIGIBLE":
        reasons.append("Academic requirements satisfied")
    if evaluation["program_match"] == "EXACT_MATCH":
        reasons.append("Program matches your preference exactly")
    elif evaluation["program_match"] == "RELATED_MATCH":
        reasons.append("Program is related to your preference")
    if evaluation["budget_status"] == "WITHIN_BUDGET":
        reasons.append("Within your stated budget")
    if evaluation["deadline_status"] == "OPEN":
        reasons.append("Admission currently open")
    elif evaluation["deadline_status"] == "CLOSING_SOON":
        reasons.append("Admission closing soon")
    if evaluation["test_status"] == "ACCEPTED_TEST_AVAILABLE":
        reasons.append("Accepted entry test available")
    elif evaluation["test_status"] == "TEST_REQUIRED":
        reasons.append("Accepted entry test not yet provided")
    elif evaluation["test_status"] == "TEST_SCORE_INVALID":
        reasons.append("Entry test score below minimum requirement")
    if evaluation["merit"] is not None:
        reasons.append(f"Calculated merit: {evaluation['merit']}%")
    if evaluation["confidence"] == "HIGH":
        reasons.append("Verified from official source")
    if not reasons:
        reasons.append("Review details for more information")
    return reasons


def generate_recommendations(profile: Dict[str, Any]) -> List[Dict[str, Any]]:
    programs = get_all_programs()

    with ThreadPoolExecutor(max_workers=8) as executor:
        evaluations = list(executor.map(lambda p: evaluate_program(profile, p), programs))

    # Filter out unrelated programs (NO_MATCH) before ranking
    evaluations = [ev for ev in evaluations if ev["program_match"] != "NO_MATCH"]

    recommendations = []
    for ev in evaluations:
        score = calculate_match_score(ev)
        rec = {
            **ev,
            "match_score": score,
            "category": categorize(score),
            "reasons": build_reasons(ev),
        }
        recommendations.append(rec)

    recommendations.sort(key=lambda r: r["match_score"], reverse=True)
    return recommendations
