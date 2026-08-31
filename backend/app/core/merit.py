from typing import Dict, Any, List, Optional


def calculate_merit_details(profile: Dict[str, Any], program: Dict[str, Any]) -> Dict[str, Any]:
    merit_formula = program.get("merit_formula", {})
    formula = merit_formula.get("components", {})
    if not formula:
        return {
            "merit": None,
            "breakdown": [],
            "status": "UNKNOWN",
            "formula_components": {},
        }

    total_weight = sum(formula.values())
    if total_weight <= 0:
        return {
            "merit": None,
            "breakdown": [],
            "status": "UNKNOWN",
            "formula_components": formula,
        }

    # Identify matching test from profile
    test_result = None
    test_pct = 0.0
    tests_cfg = program.get("tests", {})
    accepted = tests_cfg.get("accepted_tests", [])
    student_tests = profile.get("tests", []) or []

    for st in student_tests:
        name = st.get("name") if isinstance(st, dict) else getattr(st, "name", None)
        score = st.get("score") if isinstance(st, dict) else getattr(st, "score", 0)
        total = st.get("total") if isinstance(st, dict) else getattr(st, "total", 0)
        if name in accepted and total > 0 and 0 <= score <= total:
            test_pct = round((score / total) * 100, 2)
            test_result = {"name": name, "score": score, "total": total, "percentage": test_pct}
            break

    # If entry test weight is non-zero but student has no accepted test
    entry_test_weight = formula.get("entry_test", 0)
    if entry_test_weight > 0 and test_result is None:
        return {
            "merit": None,
            "breakdown": [],
            "status": "TEST_REQUIRED",
            "formula_components": formula,
        }

    score_acc = 0.0
    breakdown = []

    matric_pct = profile.get("matric_percentage", 0)
    inter_pct = profile.get("intermediate_percentage", 0)

    for component, weight in formula.items():
        if component == "matric":
            contrib = round(matric_pct * weight, 2)
            score_acc += contrib
            breakdown.append({
                "component": "Matric",
                "value": matric_pct,
                "weight": weight,
                "contribution": contrib,
            })
        elif component == "intermediate":
            contrib = round(inter_pct * weight, 2)
            score_acc += contrib
            breakdown.append({
                "component": "Intermediate",
                "value": inter_pct,
                "weight": weight,
                "contribution": contrib,
            })
        elif component == "entry_test":
            if test_result is None:
                return {
                    "merit": None,
                    "breakdown": [],
                    "status": "TEST_REQUIRED",
                    "formula_components": formula,
                }
            contrib = round(test_pct * weight, 2)
            score_acc += contrib
            breakdown.append({
                "component": f"Entry Test ({test_result['name']})",
                "value": test_pct,
                "weight": weight,
                "contribution": contrib,
            })

    final_merit = round(score_acc, 2)
    return {
        "merit": final_merit,
        "breakdown": breakdown,
        "status": "CALCULATED",
        "formula_components": formula,
    }


def calculate_merit(profile: Dict[str, Any], program: Dict[str, Any]) -> Optional[float]:
    details = calculate_merit_details(profile, program)
    return details["merit"]
