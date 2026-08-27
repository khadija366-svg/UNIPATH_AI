import json
import os
from typing import List, Dict, Any

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "universities.json")


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
    return name.lower().replace("bs ", "").replace("bsc", "").replace("bscs", "computer_science").replace(" ", "_").strip("_")
