import json
import os
from typing import Dict, Any, Optional

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "tests.json")


def load_test_config() -> Dict[str, Any]:
    try:
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f).get("tests", {})
    except Exception:
        return {}


_TEST_CONFIG = load_test_config()


def get_test_definition(name: str) -> Optional[Dict[str, Any]]:
    config = _TEST_CONFIG or load_test_config()
    return config.get(name)


def get_test_total(name: str) -> Optional[int]:
    cfg = get_test_definition(name)
    return cfg.get("total") if cfg else None


def is_known_test(name: str) -> bool:
    config = _TEST_CONFIG or load_test_config()
    return name in config


def normalize_test_percentage(score: float, total: float) -> float:
    if total <= 0:
        raise ValueError("Total marks must be greater than 0")
    if score < 0 or score > total:
        raise ValueError(f"Score {score} must be between 0 and {total}")
    return round((score / total) * 100, 2)


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
