from typing import Dict, Any, List, Optional


def calculate_merit(profile: Dict[str, Any], program: Dict[str, Any]) -> Optional[float]:
    formula = program.get("merit_formula", {}).get("components", {})
    if not formula:
        return None

    total_weight = sum(formula.values())
    if total_weight == 0:
        return None

    test_result = None
    test_pct = 0
    tests = program.get("tests", {})
    accepted = tests.get("accepted_tests", [])
    for st in profile.get("tests", []):
        if st["name"] in accepted:
            test_pct = (st["score"] / st["total"]) * 100
            test_result = st
            break

    if tests.get("required") and test_result is None:
        return None

    score = 0
    breakdown = []
    for component, weight in formula.items():
        if component == "matric":
            contribution = profile["matric_percentage"] * weight
            score += contribution
            breakdown.append({"component": "Matric", "value": profile["matric_percentage"], "weight": weight, "contribution": contribution})
        elif component == "intermediate":
            contribution = profile["intermediate_percentage"] * weight
            score += contribution
            breakdown.append({"component": "Intermediate", "value": profile["intermediate_percentage"], "weight": weight, "contribution": contribution})
        elif component == "entry_test":
            if test_result is None:
                return None
            contribution = test_pct * weight
            score += contribution
            breakdown.append({"component": "Entry Test", "value": test_pct, "weight": weight, "contribution": contribution})

    return round(score, 2)
