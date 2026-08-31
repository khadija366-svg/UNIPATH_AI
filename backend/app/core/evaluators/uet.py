from typing import Dict, Any
from app.core.evaluators.base import UniversityEvaluator


class UetEvaluator(UniversityEvaluator):
    """Evaluator for University of Engineering and Technology — Lahore."""

    def __init__(self, university_data: Dict[str, Any]):
        super().__init__("uet_lahore", university_data)
