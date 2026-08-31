import pytest
from pydantic import ValidationError
from app.schemas.profile import StudentProfile, TestScore


def test_valid_student_profile(demo_student_profile):
    profile = StudentProfile(**demo_student_profile)
    assert profile.name == "Demo Student"
    assert profile.matric_percentage == 88.0
    assert profile.intermediate_percentage == 82.0
    assert len(profile.tests) == 1
    assert profile.tests[0].name == "ECAT"
    assert profile.tests[0].score == 350.0
    assert profile.tests[0].total == 400.0


def test_invalid_percentage_limits():
    with pytest.raises(ValidationError):
        StudentProfile(
            name="Invalid Student",
            matric_percentage=105.0,
            intermediate_percentage=80.0,
            qualification="FSc Pre-Engineering",
            preferred_program="Computer Science",
            budget=500000.0,
        )

    with pytest.raises(ValidationError):
        StudentProfile(
            name="Invalid Student",
            matric_percentage=80.0,
            intermediate_percentage=-5.0,
            qualification="FSc Pre-Engineering",
            preferred_program="Computer Science",
            budget=500000.0,
        )


def test_invalid_budget():
    with pytest.raises(ValidationError):
        StudentProfile(
            name="Invalid Budget",
            matric_percentage=80.0,
            intermediate_percentage=80.0,
            qualification="FSc Pre-Engineering",
            preferred_program="Computer Science",
            budget=-100.0,
        )


def test_test_score_exceeding_total():
    with pytest.raises(ValidationError):
        TestScore(name="ECAT", score=450.0, total=400.0)


def test_test_score_negative():
    with pytest.raises(ValidationError):
        TestScore(name="NAT", score=-10.0, total=100.0)


def test_test_score_mismatched_config_total():
    # ECAT official total is 400
    with pytest.raises(ValidationError):
        TestScore(name="ECAT", score=350.0, total=100.0)
