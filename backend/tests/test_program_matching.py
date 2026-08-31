from app.core.program_matching import match_program
from app.services.university_service import normalize_program_name


def test_normalize_program_name():
    assert normalize_program_name("BSCS") == "computer_science"
    assert normalize_program_name("BS Computer Science") == "computer_science"
    assert normalize_program_name("Software Engineering") == "software_engineering"
    assert normalize_program_name("BS Artificial Intelligence") == "artificial_intelligence"
    assert normalize_program_name("BBA") == "business_administration"
    assert normalize_program_name("Electrical Engineering") == "electrical_engineering"


def test_match_program_exact():
    profile = {"preferred_program": "Computer Science"}
    program = {"normalized_name": "computer_science"}
    assert match_program(profile, program) == "EXACT_MATCH"


def test_match_program_related():
    profile = {"preferred_program": "Computer Science"}
    program_se = {"normalized_name": "software_engineering"}
    program_ai = {"normalized_name": "artificial_intelligence"}
    program_ds = {"normalized_name": "data_science"}

    assert match_program(profile, program_se) == "RELATED_MATCH"
    assert match_program(profile, program_ai) == "RELATED_MATCH"
    assert match_program(profile, program_ds) == "RELATED_MATCH"


def test_match_program_no_match():
    profile = {"preferred_program": "Computer Science"}
    program_bba = {"normalized_name": "business_administration"}
    program_civil = {"normalized_name": "civil_engineering"}

    assert match_program(profile, program_bba) == "NO_MATCH"
    assert match_program(profile, program_civil) == "NO_MATCH"
