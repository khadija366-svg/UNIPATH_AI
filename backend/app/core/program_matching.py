from typing import Dict, Any
from app.services.university_service import normalize_program_name


PROGRAM_RELATIONS = {
    "computer_science": [
        "software_engineering",
        "artificial_intelligence",
        "data_science",
        "information_technology",
        "computer_engineering",
    ],
    "software_engineering": [
        "computer_science",
        "artificial_intelligence",
        "data_science",
        "information_technology",
    ],
    "artificial_intelligence": [
        "computer_science",
        "data_science",
        "software_engineering",
    ],
    "data_science": [
        "computer_science",
        "artificial_intelligence",
        "software_engineering",
    ],
    "information_technology": [
        "computer_science",
        "software_engineering",
        "data_science",
    ],
    "electrical_engineering": [
        "computer_engineering",
        "mechanical_engineering",
        "civil_engineering",
    ],
    "computer_engineering": [
        "electrical_engineering",
        "computer_science",
    ],
    "mechanical_engineering": [
        "electrical_engineering",
        "civil_engineering",
    ],
    "civil_engineering": [
        "electrical_engineering",
        "mechanical_engineering",
    ],
    "business_administration": [
        "accounting_finance",
    ],
    "accounting_finance": [
        "business_administration",
    ],
}


def match_program(profile: Dict[str, Any], program: Dict[str, Any]) -> str:
    preferred = normalize_program_name(profile.get("preferred_program", ""))
    target = program.get("normalized_name", "")

    if not preferred or not target:
        return "NO_MATCH"
    if preferred == target:
        return "EXACT_MATCH"
    if target in PROGRAM_RELATIONS.get(preferred, []):
        return "RELATED_MATCH"
    return "NO_MATCH"
