import json
import os
from typing import Dict, Any, Optional

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "tests.json")


def _load_config() -> Dict[str, Any]:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f).get("tests", {})


_TEST_CONFIG = _load_config()


def get_test_definition(name: str) -> Optional[Dict[str, Any]]:
    return _TEST_CONFIG.get(name)


def get_test_total(name: str) -> Optional[int]:
    cfg = get_test_definition(name)
    return cfg.get("total") if cfg else None


def is_known_test(name: str) -> bool:
    return name in _TEST_CONFIG


def validate_test_score(name: str, score: float, total: float) -> None:
    if total is None or total <= 0:
        raise ValueError("Total marks must be greater than 0")
    if score < 0:
        raise ValueError("Score cannot be negative")
    if score > total:
        raise ValueError("Score cannot exceed total marks")

    expected_total = get_test_total(name)
    if expected_total is not None and total != expected_total:
        raise ValueError(f"{name} total marks must be {expected_total}")
