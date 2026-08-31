from app.core.merit import calculate_merit_details, calculate_merit


def test_merit_calculation_uet_ecat(demo_student_profile):
    # Matric: 88, Inter: 82, ECAT: 350/400 (87.5%)
    # Formula: 25% Matric + 45% Inter + 30% ECAT
    # Expected: (88 * 0.25) + (82 * 0.45) + (87.5 * 0.30) = 22.0 + 36.9 + 26.25 = 85.15
    program = {
        "tests": {
            "required": True,
            "accepted_tests": ["ECAT"],
        },
        "merit_formula": {
            "components": {
                "matric": 0.25,
                "intermediate": 0.45,
                "entry_test": 0.30,
            }
        }
    }
    details = calculate_merit_details(demo_student_profile, program)
    assert details["status"] == "CALCULATED"
    assert details["merit"] == 85.15
    assert len(details["breakdown"]) == 3
    assert details["breakdown"][0]["contribution"] == 22.0
    assert details["breakdown"][1]["contribution"] == 36.9
    assert details["breakdown"][2]["contribution"] == 26.25


def test_merit_calculation_comsats_nat(nat_student_profile):
    # Matric: 85, Inter: 80, NAT: 78/100 (78%)
    # Formula: 10% Matric + 40% Inter + 50% NAT
    # Expected: (85 * 0.10) + (80 * 0.40) + (78 * 0.50) = 8.5 + 32.0 + 39.0 = 79.5
    program = {
        "tests": {
            "required": True,
            "accepted_tests": ["NAT", "NTS"],
        },
        "merit_formula": {
            "components": {
                "matric": 0.10,
                "intermediate": 0.40,
                "entry_test": 0.50,
            }
        }
    }
    details = calculate_merit_details(nat_student_profile, program)
    assert details["status"] == "CALCULATED"
    assert details["merit"] == 79.5
    assert len(details["breakdown"]) == 3


def test_merit_calculation_missing_test_when_test_required():
    profile = {
        "matric_percentage": 88,
        "intermediate_percentage": 82,
        "tests": [],
    }
    program = {
        "tests": {
            "required": True,
            "accepted_tests": ["ECAT"],
        },
        "merit_formula": {
            "components": {
                "matric": 0.25,
                "intermediate": 0.45,
                "entry_test": 0.30,
            }
        }
    }
    details = calculate_merit_details(profile, program)
    assert details["status"] == "TEST_REQUIRED"
    assert details["merit"] is None


def test_merit_calculation_missing_formula():
    profile = {
        "matric_percentage": 88,
        "intermediate_percentage": 82,
    }
    program = {
        "merit_formula": {}
    }
    details = calculate_merit_details(profile, program)
    assert details["status"] == "UNKNOWN"
    assert details["merit"] is None
