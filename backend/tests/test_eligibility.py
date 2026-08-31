from app.core.eligibility import evaluate_eligibility


def test_eligibility_fully_eligible(demo_student_profile):
    program = {
        "eligibility": {
            "minimum_matric": 60,
            "minimum_intermediate": 60,
            "accepted_groups": ["FSc Pre-Engineering", "ICS", "A-Level"],
            "required_subjects": ["Mathematics"],
        }
    }
    result = evaluate_eligibility(demo_student_profile, program)
    assert result["status"] == "ELIGIBLE"
    assert len(result["failed_rules"]) == 0
    assert len(result["passed_rules"]) >= 3


def test_eligibility_not_eligible_low_intermediate():
    profile = {
        "matric_percentage": 70,
        "intermediate_percentage": 55,
        "qualification": "FSc Pre-Engineering",
        "subjects": ["Mathematics", "Physics"],
    }
    program = {
        "eligibility": {
            "minimum_matric": 60,
            "minimum_intermediate": 60,
            "accepted_groups": ["FSc Pre-Engineering", "ICS"],
            "required_subjects": ["Mathematics"],
        }
    }
    result = evaluate_eligibility(profile, program)
    assert result["status"] == "NOT_ELIGIBLE"
    assert any("Intermediate below minimum" in f for f in result["failed_rules"])


def test_eligibility_not_eligible_unaccepted_group():
    profile = {
        "matric_percentage": 85,
        "intermediate_percentage": 80,
        "qualification": "FA",
        "subjects": ["Civics", "History"],
    }
    program = {
        "eligibility": {
            "minimum_matric": 50,
            "minimum_intermediate": 50,
            "accepted_groups": ["FSc Pre-Engineering", "ICS"],
            "required_subjects": ["Mathematics"],
        }
    }
    result = evaluate_eligibility(profile, program)
    assert result["status"] == "NOT_ELIGIBLE"
    assert any("Qualification group 'FA' not accepted" in f for f in result["failed_rules"])


def test_eligibility_information_missing_when_unverified():
    profile = {
        "matric_percentage": 85,
        "intermediate_percentage": 80,
        "qualification": "FSc Pre-Engineering",
    }
    program = {
        "eligibility": {
            "minimum_matric": None,
            "minimum_intermediate": None,
            "accepted_groups": [],
            "required_subjects": [],
        }
    }
    result = evaluate_eligibility(profile, program)
    assert result["status"] == "INFORMATION_MISSING"
    assert len(result["missing_information"]) > 0
