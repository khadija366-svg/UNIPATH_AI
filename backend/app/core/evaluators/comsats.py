from typing import Dict, Any
from app.core.evaluators.base import UniversityEvaluator


class ComsatsEvaluator(UniversityEvaluator):
    """Evaluator for COMSATS University Islamabad — Lahore Campus."""

    def __init__(self, university_data: Dict[str, Any]):
        super().__init__("comsats_lahore", university_data)
