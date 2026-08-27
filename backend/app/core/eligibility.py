from typing import Dict, Any, List


def evaluate_eligibility(profile: Dict[str, Any], program: Dict[str, Any]) -> Dict[str, Any]:
    eligibility = program.get("eligibility", {})
    passed = []
    failed = []
    missing = []

    min_matric = eligibility.get("minimum_matric")
    if min_matric is None:
        missing.append("Minimum Matric requirement not verified")
    elif profile["matric_percentage"] >= min_matric:
        passed.append(f"Matric minimum satisfied ({profile['matric_percentage']}% >= {min_matric}%)")
    else:
        failed.append(f"Matric below minimum ({profile['matric_percentage']}% < {min_matric}%)")

    min_inter = eligibility.get("minimum_intermediate")
    if min_inter is None:
        missing.append("Minimum Intermediate requirement not verified")
    elif profile["intermediate_percentage"] >= min_inter:
        passed.append(f"Intermediate minimum satisfied ({profile['intermediate_percentage']}% >= {min_inter}%)")
    else:
        failed.append(f"Intermediate below minimum ({profile['intermediate_percentage']}% < {min_inter}%)")

    accepted_groups = eligibility.get("accepted_groups", [])
    if not accepted_groups:
        missing.append("Accepted qualification groups not verified")
    elif profile["qualification"] in accepted_groups:
        passed.append(f"Qualification group accepted ({profile['qualification']})")
    else:
        failed.append(f"Qualification group not accepted ({profile['qualification']})")

    if failed:
        status = "NOT_ELIGIBLE"
    elif missing:
        status = "INFORMATION_MISSING"
    elif passed:
        status = "ELIGIBLE"
    else:
        status = "INFORMATION_MISSING"

    return {
        "status": status,
        "passed_rules": passed,
        "failed_rules": failed,
        "missing_information": missing,
    }
