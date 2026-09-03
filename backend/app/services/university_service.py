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
    "bachelor of science in computer science": "computer_science",
    "bs cs": "computer_science",
    "cs": "computer_science",

    # Software Engineering
    "bsse": "software_engineering",
    "bs software engineering": "software_engineering",
    "software engineering": "software_engineering",
    "bachelor of science in software engineering": "software_engineering",
    "bs se": "software_engineering",
    "se": "software_engineering",

    # Artificial Intelligence
    "bsai": "artificial_intelligence",
    "bs artificial intelligence": "artificial_intelligence",
    "artificial intelligence": "artificial_intelligence",
    "bs ai": "artificial_intelligence",
    "ai": "artificial_intelligence",

    # Data Science
    "bsds": "data_science",
    "bs data science": "data_science",
    "data science": "data_science",
    "bs ds": "data_science",
    "ds": "data_science",

    # Information Technology
    "bsit": "information_technology",
    "bs information technology": "information_technology",
    "information technology": "information_technology",
    "bs it": "information_technology",
    "it": "information_technology",

    # Electrical Engineering
    "bsee": "electrical_engineering",
    "bs electrical engineering": "electrical_engineering",
    "electrical engineering": "electrical_engineering",
    "bs ee": "electrical_engineering",
    "ee": "electrical_engineering",

    # Computer Engineering
    "bsce": "computer_engineering",
    "bs computer engineering": "computer_engineering",
    "computer engineering": "computer_engineering",
    "bscpe": "computer_engineering",

    # Mechanical Engineering
    "bsme": "mechanical_engineering",
    "bs mechanical engineering": "mechanical_engineering",
    "mechanical engineering": "mechanical_engineering",
    "bs me": "mechanical_engineering",

    # Civil Engineering
    "civil engineering": "civil_engineering",
    "bs civil engineering": "civil_engineering",

    # Business Administration & Management
    "bba": "business_administration",
    "business administration": "business_administration",
    "bachelor of business administration": "business_administration",
    "bsc management science": "business_administration",
    "management science": "business_administration",

    # Accounting and Finance
    "bsaf": "accounting_finance",
    "bsc accounting & finance": "accounting_finance",
    "bsc accounting and finance": "accounting_finance",
    "accounting and finance": "accounting_finance",
    "accounting & finance": "accounting_finance",
}


def load_universities() -> List[Dict[str, Any]]:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    universities = data.get("universities", [])
    for uni in universities:
        source = uni.get("source", {})
        confidence = source.get("confidence", "CACHED")
        source.setdefault("data_source", "cache")
        source.setdefault("status", "cached")
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
    if not name:
        return ""
    lower = name.strip().lower()
    if lower in PROGRAM_ALIASES:
        return PROGRAM_ALIASES[lower]
    # Fallback: lowercase + non-alphanumeric to underscore
    return re.sub(r"[^a-z0-9]+", "_", lower).strip("_")
