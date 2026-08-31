import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, Any, List, Optional

from app.services.university_service import load_universities
from app.core.evaluators import EVALUATOR_REGISTRY, UniversityEvaluator

logger = logging.getLogger(__name__)


class AdmissionOrchestrator:
    """Orchestrates independent admission evaluations across multiple universities in parallel."""

    def __init__(self, universities_data: Optional[List[Dict[str, Any]]] = None):
        self.universities_data = universities_data or load_universities()
        self._init_evaluators()

    def _init_evaluators(self):
        self.evaluators: List[UniversityEvaluator] = []
        for uni in self.universities_data:
            uid = uni.get("university_id")
            evaluator_cls = EVALUATOR_REGISTRY.get(uid, UniversityEvaluator)
            if evaluator_cls is UniversityEvaluator:
                evaluator_instance = UniversityEvaluator(uid, uni)
            else:
                evaluator_instance = evaluator_cls(uni)
            self.evaluators.append(evaluator_instance)

    def _evaluate_single_university(self, evaluator: UniversityEvaluator, profile: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluates one university with complete failure isolation."""
        try:
            return evaluator.evaluate(profile)
        except Exception as e:
            logger.error(
                "Evaluator failed for university %s (%s): %s",
                evaluator.university_id,
                evaluator.university_name,
                e,
                exc_info=True,
            )
            return {
                "status": "ERROR",
                "university_id": evaluator.university_id,
                "university": evaluator.university_name,
                "campus": evaluator.campus,
                "error": "University evaluation temporarily unavailable",
                "evaluations": [],
            }

    def evaluate_profile(self, profile: Dict[str, Any]) -> Dict[str, Any]:
        """Runs all university evaluators in parallel and aggregates results."""
        university_results: List[Dict[str, Any]] = []
        all_evaluations: List[Dict[str, Any]] = []
        successful_universities: List[str] = []
        failed_universities: List[Dict[str, str]] = []

        # Execute evaluations across universities concurrently
        max_workers = min(len(self.evaluators) or 1, 8)
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_evaluator = {
                executor.submit(self._evaluate_single_university, evaluator, profile): evaluator
                for evaluator in self.evaluators
            }

            for future in as_completed(future_to_evaluator):
                res = future.result()
                university_results.append(res)
                if res.get("status") == "SUCCESS":
                    successful_universities.append(res.get("university", ""))
                    all_evaluations.extend(res.get("evaluations", []))
                else:
                    failed_universities.append({
                        "university_id": res.get("university_id", ""),
                        "university": res.get("university", ""),
                        "error": res.get("error", "Evaluation failed"),
                    })

        # Rank all matched programs (excluding NO_MATCH for recommendation cards)
        matched_evaluations = [ev for ev in all_evaluations if ev.get("program_match") != "NO_MATCH"]
        matched_evaluations.sort(key=lambda r: r.get("match_score", 0), reverse=True)

        return {
            "university_results": university_results,
            "all_evaluations": all_evaluations,
            "recommendations": matched_evaluations,
            "successful_universities": successful_universities,
            "failed_universities": failed_universities,
        }
