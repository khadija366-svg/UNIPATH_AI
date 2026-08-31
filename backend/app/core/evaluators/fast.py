from typing import Dict, Any
from app.core.evaluators.base import UniversityEvaluator


class FastEvaluator(UniversityEvaluator):
    """Evaluator for FAST National University — Lahore Campus."""

    def __init__(self, university_data: Dict[str, Any]):
        super().__init__("fast_lahore", university_data)
