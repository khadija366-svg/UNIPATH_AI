from typing import Dict, Any
from app.core.evaluators.base import UniversityEvaluator


class LumsEvaluator(UniversityEvaluator):
    """Evaluator for Lahore University of Management Sciences — Lahore."""

    def __init__(self, university_data: Dict[str, Any]):
        super().__init__("lums", university_data)
