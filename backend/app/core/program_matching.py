from typing import Dict, Any
from app.services.university_service import normalize_program_name


PROGRAM_RELATIONS = {
    "computer_science": ["software_engineering", "artificial_intelligence", "data_science"],
    "software_engineering": ["computer_science", "artificial_intelligence"],
    "artificial_intelligence": ["computer_science", "data_science"],
    "data_science": ["computer_science", "artificial_intelligence"],
    "electrical_engineering": ["mechanical_engineering", "civil_engineering"],
    "mechanical_engineering": ["electrical_engineering", "civil_engineering"],
    "civil_engineering": ["electrical_engineering", "mechanical_engineering"],
    "business_administration": ["accounting", "finance"],
}


def match_program(profile: Dict[str, Any], program: Dict[str, Any]) -> str:
    preferred = normalize_program_name(profile.get("preferred_program", ""))
    target = program.get("normalized_name", "")

    if preferred == target:
        return "EXACT_MATCH"
    if target in PROGRAM_RELATIONS.get(preferred, []):
        return "RELATED_MATCH"
    return "NO_MATCH"
