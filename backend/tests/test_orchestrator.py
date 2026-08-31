from app.core.orchestrator import AdmissionOrchestrator
from app.core.evaluators.base import UniversityEvaluator


def test_admission_orchestrator_parallel_execution(demo_student_profile):
    orchestrator = AdmissionOrchestrator()
    assert len(orchestrator.evaluators) == 5

    results = orchestrator.evaluate_profile(demo_student_profile)
    assert len(results["university_results"]) == 5
    assert len(results["successful_universities"]) == 5
    assert len(results["failed_universities"]) == 0

    # Ensure recommendations are ranked by match_score descending
    recs = results["recommendations"]
    assert len(recs) > 0
    scores = [r["match_score"] for r in recs]
    assert scores == sorted(scores, reverse=True)


def test_orchestrator_failure_isolation(demo_student_profile):
    orchestrator = AdmissionOrchestrator()

    # Create a faulty evaluator that raises an unhandled exception
    class FaultyEvaluator(UniversityEvaluator):
        def evaluate(self, profile):
            raise RuntimeError("Database connection timed out")

    # Replace one evaluator with the faulty one
    faulty = FaultyEvaluator("uet_lahore", {"name": "University of Engineering and Technology"})
    orchestrator.evaluators = [
        faulty if ev.university_id == "uet_lahore" else ev
        for ev in orchestrator.evaluators
    ]

    results = orchestrator.evaluate_profile(demo_student_profile)

    # 4 universities must succeed, 1 must fail gracefully
    assert len(results["successful_universities"]) == 4
    assert len(results["failed_universities"]) == 1
    assert results["failed_universities"][0]["university_id"] == "uet_lahore"
    assert results["failed_universities"][0]["error"] == "University evaluation temporarily unavailable"

    # Overall analysis did NOT crash and recommendations still exist from other 4 universities
    assert len(results["recommendations"]) > 0
