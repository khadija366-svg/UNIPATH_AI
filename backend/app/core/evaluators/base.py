import logging
from typing import Dict, Any, List, Optional

from app.core.eligibility import evaluate_eligibility
from app.core.tests import evaluate_tests
from app.core.merit import calculate_merit_details
from app.core.budget import evaluate_budget, annualize_fee
from app.core.deadlines import evaluate_deadline
from app.core.program_matching import match_program

logger = logging.getLogger(__name__)


def calculate_match_score(evaluation: Dict[str, Any]) -> float:
    # Hard constraint: NOT_ELIGIBLE programs receive 0 match score
    if evaluation.get("eligibility", {}).get("status") == "NOT_ELIGIBLE":
        return 0.0

    academic_fit = 0.0
    elig_status = evaluation.get("eligibility", {}).get("status")
    if elig_status == "ELIGIBLE":
        academic_fit = 40.0
    elif elig_status == "INFORMATION_MISSING":
        academic_fit = 20.0

    # Test status adjusts academic fit
    test_status = evaluation.get("test_status", "")
    if test_status in ("TEST_REQUIRED", "WRONG_TEST", "TEST_SCORE_INVALID"):
        academic_fit = max(academic_fit - 15.0, 0.0)

    program_match_score = {
        "EXACT_MATCH": 25.0,
        "RELATED_MATCH": 15.0,
        "NO_MATCH": 0.0,
    }.get(evaluation.get("program_match", "NO_MATCH"), 0.0)

    budget_fit = {
        "WITHIN_BUDGET": 20.0,
        "UNKNOWN": 10.0,
        "ABOVE_BUDGET": 0.0,
    }.get(evaluation.get("budget_status", "UNKNOWN"), 0.0)

    deadline_score = {
        "OPEN": 10.0,
        "CLOSING_SOON": 7.0,
        "UNKNOWN": 3.0,
        "CLOSED": 0.0,
    }.get(evaluation.get("deadline_status", "UNKNOWN"), 0.0)

    preference = 5.0 if evaluation.get("program_match") == "EXACT_MATCH" else 2.0

    return round(academic_fit + program_match_score + budget_fit + deadline_score + preference, 2)


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
    elig_status = evaluation.get("eligibility", {}).get("status")
    if elig_status == "ELIGIBLE":
        reasons.append("Academic requirements satisfied")
    elif elig_status == "NOT_ELIGIBLE":
        reasons.append("Academic minimum requirements not met")
    elif elig_status == "INFORMATION_MISSING":
        reasons.append("Some eligibility requirements need verification")

    pm = evaluation.get("program_match")
    if pm == "EXACT_MATCH":
        reasons.append("Program matches your preference exactly")
    elif pm == "RELATED_MATCH":
        reasons.append("Program is related to your preference")

    bs = evaluation.get("budget_status")
    if bs == "WITHIN_BUDGET":
        reasons.append("Within your stated budget")
    elif bs == "ABOVE_BUDGET":
        reasons.append("Fee exceeds your stated budget")

    ds = evaluation.get("deadline_status")
    if ds == "OPEN":
        reasons.append("Admission currently open")
    elif ds == "CLOSING_SOON":
        reasons.append("Admission closing soon")
    elif ds == "CLOSED":
        reasons.append("Admission cycle closed")

    ts = evaluation.get("test_status")
    if ts == "ACCEPTED_TEST_AVAILABLE":
        reasons.append("Accepted entry test available")
    elif ts == "TEST_REQUIRED":
        reasons.append("Accepted entry test not yet provided")
    elif ts == "WRONG_TEST":
        reasons.append("Submitted test is not accepted for this program")
    elif ts == "TEST_SCORE_INVALID":
        reasons.append("Entry test score below required minimum")

    if evaluation.get("merit") is not None:
        reasons.append(f"Calculated merit: {evaluation['merit']}%")

    if evaluation.get("confidence") == "HIGH":
        reasons.append("Verified from official university source")

    if not reasons:
        reasons.append("Review details for more information")

    return reasons


class UniversityEvaluator:
    """Base class for independent university evaluators."""

    def __init__(self, university_id: str, university_data: Dict[str, Any]):
        self.university_id = university_id
        self.university_data = university_data
        self.university_name = university_data.get("name", university_id)
        self.campus = university_data.get("campus", "Lahore")
        self.city = university_data.get("city", "Lahore")

    def evaluate_program(self, profile: Dict[str, Any], program: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluates a single program for the student profile."""
        eligibility = evaluate_eligibility(profile, program)
        test_status = evaluate_tests(profile, program)
        merit_details = calculate_merit_details(profile, program)
        budget = evaluate_budget(profile, program)
        deadline = evaluate_deadline(program)
        program_match = match_program(profile, program)

        annual_fee = annualize_fee(
            program.get("fees", {}).get("amount"),
            program.get("fees", {}).get("period", "semester")
        )

        eval_result = {
            "program_id": program["program_id"],
            "university_id": self.university_id,
            "university": self.university_name,
            "program": program["name"],
            "campus": self.campus,
            "city": self.city,
            "eligibility": eligibility,
            "test_status": test_status["status"],
            "test_detail": test_status["detail"],
            "test_score_percentage": test_status.get("score_percentage"),
            "merit": merit_details["merit"],
            "merit_breakdown": merit_details["breakdown"],
            "merit_status": merit_details["status"],
            "fee": program.get("fees", {}).get("amount"),
            "fee_period": program.get("fees", {}).get("period", "semester"),
            "annual_fee": annual_fee,
            "budget_status": budget["status"],
            "budget_detail": budget["detail"],
            "deadline_status": deadline["status"],
            "deadline_date": deadline["date"],
            "days_remaining": deadline["days_remaining"],
            "program_match": program_match,
            "source": program.get("source", self.university_data.get("source", {})),
            "confidence": program.get("source", {}).get("confidence", "MEDIUM"),
        }

        match_score = calculate_match_score(eval_result)
        eval_result["match_score"] = match_score
        eval_result["category"] = categorize(match_score)
        eval_result["reasons"] = build_reasons(eval_result)

        return eval_result

    def evaluate(self, profile: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluates all programs of this university for the student."""
        programs = self.university_data.get("programs", [])
        evaluations = []
        for program in programs:
            try:
                # Ensure program has required university context
                program_copy = dict(program)
                program_copy["university_id"] = self.university_id
                program_copy["university_name"] = self.university_name
                program_copy["campus"] = self.campus
                program_copy["city"] = self.city

                res = self.evaluate_program(profile, program_copy)
                evaluations.append(res)
            except Exception as e:
                logger.error(
                    "Error evaluating program %s at %s: %s",
                    program.get("program_id", "unknown"),
                    self.university_name,
                    e,
                    exc_info=True
                )

        return {
            "status": "SUCCESS",
            "university_id": self.university_id,
            "university": self.university_name,
            "campus": self.campus,
            "evaluations": evaluations,
        }
