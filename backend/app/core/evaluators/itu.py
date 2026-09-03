from typing import Any, Dict

from app.core.evaluators.base import UniversityEvaluator


class ItuEvaluator(UniversityEvaluator):
    """Evaluator for Information Technology University, Lahore."""

    def __init__(self, university_data: Dict[str, Any]):
        super().__init__("itu_lahore", university_data)
