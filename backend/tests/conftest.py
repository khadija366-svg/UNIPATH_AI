import pytest
import sys
import os

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))


@pytest.fixture
def demo_student_profile():
    return {
        "name": "Demo Student",
        "matric_percentage": 88.0,
        "intermediate_percentage": 82.0,
        "qualification": "FSc Pre-Engineering",
        "subjects": ["Mathematics", "Physics", "Chemistry"],
        "tests": [
            {
                "name": "ECAT",
                "score": 350.0,
                "total": 400.0,
            }
        ],
        "preferred_program": "Computer Science",
        "budget": 600000.0,
        "location": "Lahore",
    }


@pytest.fixture
def nat_student_profile():
    return {
        "name": "NAT Student",
        "matric_percentage": 85.0,
        "intermediate_percentage": 80.0,
        "qualification": "ICS",
        "subjects": ["Mathematics", "Physics", "Computer Science"],
        "tests": [
            {
                "name": "NAT",
                "score": 78.0,
                "total": 100.0,
            }
        ],
        "preferred_program": "Computer Science",
        "budget": 500000.0,
        "location": "Lahore",
    }
