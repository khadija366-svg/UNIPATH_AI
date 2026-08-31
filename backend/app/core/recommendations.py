from typing import Dict, Any, List
from app.core.orchestrator import AdmissionOrchestrator
from app.core.evaluators.base import (
    UniversityEvaluator,
    calculate_match_score,
    categorize,
    build_reasons,
)
from app.services.university_service import get_all_programs


def evaluate_program(profile: Dict[str, Any], program: Dict[str, Any]) -> Dict[str, Any]:
    """Helper to evaluate a single program using UniversityEvaluator."""
    evaluator = UniversityEvaluator(
        program.get("university_id", "unknown"),
        {
            "name": program.get("university_name", "Unknown"),
            "campus": program.get("campus", "Lahore"),
            "city": program.get("city", "Lahore"),
            "programs": [program],
        }
    )
    return evaluator.evaluate_program(profile, program)


def run_orchestrated_analysis(profile: Dict[str, Any]) -> Dict[str, Any]:
    """Runs the AdmissionOrchestrator across all university evaluators in parallel."""
    orchestrator = AdmissionOrchestrator()
    return orchestrator.evaluate_profile(profile)


def generate_recommendations(profile: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Generates ranked recommendations for matched programs."""
    result = run_orchestrated_analysis(profile)
    return result["recommendations"]
