from app.core.evaluators.base import UniversityEvaluator, calculate_match_score, categorize, build_reasons
from app.core.evaluators.itu import ItuEvaluator
from app.core.evaluators.fast import FastEvaluator
from app.core.evaluators.uet import UetEvaluator
from app.core.evaluators.punjab import PunjabEvaluator
from app.core.evaluators.lums import LumsEvaluator

EVALUATOR_REGISTRY = {
    "itu_lahore": ItuEvaluator,
    "fast_lahore": FastEvaluator,
    "uet_lahore": UetEvaluator,
    "pu_lahore": PunjabEvaluator,
    "lums": LumsEvaluator,
}

__all__ = [
    "UniversityEvaluator",
    "calculate_match_score",
    "categorize",
    "build_reasons",
    "ItuEvaluator",
    "FastEvaluator",
    "UetEvaluator",
    "PunjabEvaluator",
    "LumsEvaluator",
    "EVALUATOR_REGISTRY",
]
