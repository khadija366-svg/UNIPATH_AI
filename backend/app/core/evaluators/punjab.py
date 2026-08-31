from typing import Dict, Any
from app.core.evaluators.base import UniversityEvaluator


class PunjabEvaluator(UniversityEvaluator):
    """Evaluator for University of the Punjab — Lahore."""

    def __init__(self, university_data: Dict[str, Any]):
        super().__init__("pu_lahore", university_data)
