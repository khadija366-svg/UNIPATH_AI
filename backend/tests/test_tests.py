import pytest
from app.services.test_service import (
    get_test_total,
    is_known_test,
    normalize_test_percentage,
    validate_test_score,
)
from app.core.tests import evaluate_tests


def test_test_definitions_totals():
    assert get_test_total("ECAT") == 400
    assert get_test_total("NAT") == 100
    assert get_test_total("SAT") == 1600
    assert get_test_total("FAST-NU Test") == 100
    assert is_known_test("ECAT") is True


def test_normalize_test_percentage():
    # ECAT: 350/400 -> 87.5%
    pct = normalize_test_percentage(350, 400)
    assert pct == 87.5

    # NAT: 78/100 -> 78.0%
    pct_nat = normalize_test_percentage(78, 100)
    assert pct_nat == 78.0


def test_evaluate_tests_accepted_available():
    program = {
        "tests": {
            "required": True,
            "accepted_tests": ["ECAT"],
            "minimum_score": None,
        }
    }
    profile = {
        "tests": [
            {"name": "ECAT", "score": 350, "total": 400}
        ]
    }
    result = evaluate_tests(profile, program)
    assert result["status"] == "ACCEPTED_TEST_AVAILABLE"
    assert result["score_percentage"] == 87.5
    assert "350/400" in result["detail"]


def test_evaluate_tests_wrong_test():
    # UET requires ECAT, student only has NAT
    program = {
        "tests": {
            "required": True,
            "accepted_tests": ["ECAT"],
            "minimum_score": None,
        }
    }
    profile = {
        "tests": [
            {"name": "NAT", "score": 78, "total": 100}
        ]
    }
    result = evaluate_tests(profile, program)
    assert result["status"] == "WRONG_TEST"
    assert "Requires ECAT" in result["detail"]


def test_evaluate_tests_test_required_when_no_tests():
    program = {
        "tests": {
            "required": True,
            "accepted_tests": ["NAT", "NTS"],
            "minimum_score": 50,
        }
    }
    profile = {"tests": []}
    result = evaluate_tests(profile, program)
    assert result["status"] == "TEST_REQUIRED"


def test_evaluate_tests_not_required():
    program = {
        "tests": {
            "required": False,
            "accepted_tests": [],
        }
    }
    profile = {"tests": []}
    result = evaluate_tests(profile, program)
    assert result["status"] == "TEST_NOT_REQUIRED"


def test_evaluate_tests_score_below_minimum():
    program = {
        "tests": {
            "required": True,
            "accepted_tests": ["NAT"],
            "minimum_score": 50,
        }
    }
    profile = {
        "tests": [
            {"name": "NAT", "score": 45, "total": 100}
        ]
    }
    result = evaluate_tests(profile, program)
    assert result["status"] == "TEST_SCORE_INVALID"
    assert result["score_percentage"] == 45.0
