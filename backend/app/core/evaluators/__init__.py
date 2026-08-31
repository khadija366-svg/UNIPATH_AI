from app.core.evaluators.base import UniversityEvaluator, calculate_match_score, categorize, build_reasons
from app.core.evaluators.comsats import ComsatsEvaluator
from app.core.evaluators.fast import FastEvaluator
from app.core.evaluators.uet import UetEvaluator
from app.core.evaluators.punjab import PunjabEvaluator
from app.core.evaluators.lums import LumsEvaluator

EVALUATOR_REGISTRY = {
    "comsats_lahore": ComsatsEvaluator,
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
    "ComsatsEvaluator",
    "FastEvaluator",
    "UetEvaluator",
    "PunjabEvaluator",
    "LumsEvaluator",
    "EVALUATOR_REGISTRY",
]
