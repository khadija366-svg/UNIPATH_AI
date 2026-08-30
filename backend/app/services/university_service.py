import json
import os
import re
from typing import List, Dict, Any

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "universities.json")

# Single source of truth for program-name normalization.
# Keys are lowercase aliases; values are the normalized_name used in universities.json.
PROGRAM_ALIASES: Dict[str, str] = {
    # Computer Science
    "bscs": "computer_science",
    "bs computer science": "computer_science",
    "computer science": "computer_science",
    # Software Engineering
    "bsse": "software_engineering",
    "bs software engineering": "software_engineering",
    "software engineering": "software_engineering",
    # Electrical Engineering
    "bsee": "electrical_engineering",
    "bs electrical engineering": "electrical_engineering",
    "electrical engineering": "electrical_engineering",
    # Business Administration
    "bba": "business_administration",
    "business administration": "business_administration",
}


def load_universities() -> List[Dict[str, Any]]:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    universities = data.get("universities", [])
    for uni in universities:
        source = uni.get("source", {})
        confidence = source.get("confidence", "CACHED")
        for program in uni.get("programs", []):
            program.setdefault("source", source)
            program.setdefault("data_confidence", confidence)
    return universities


def get_all_programs() -> List[Dict[str, Any]]:
    programs = []
    for uni in load_universities():
        source = uni.get("source", {})
        for program in uni.get("programs", []):
            program["university_name"] = uni["name"]
            program["city"] = uni["city"]
            program.setdefault("source", source)
            program.setdefault("data_confidence", source.get("confidence", "CACHED"))
            programs.append(program)
    return programs


def get_university_by_id(university_id: str) -> Dict[str, Any] | None:
    for uni in load_universities():
        if uni["university_id"] == university_id:
            return uni
    return None


def normalize_program_name(name: str) -> str:
    lower = name.strip().lower()
    if lower in PROGRAM_ALIASES:
        return PROGRAM_ALIASES[lower]
    # Fallback: lowercase + non-alphanumeric to underscore
    return re.sub(r"[^a-z0-9]+", "_", lower).strip("_")
