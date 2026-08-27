from typing import Dict, Any, List


def evaluate_tests(profile: Dict[str, Any], program: Dict[str, Any]) -> Dict[str, Any]:
    tests = program.get("tests", {})
    if not tests.get("required", False):
        return {"status": "TEST_NOT_REQUIRED", "detail": "No entry test required for this program"}

    accepted = tests.get("accepted_tests", [])
    minimum_score = tests.get("minimum_score")
    student_tests = profile.get("tests", [])

    if not accepted:
        return {"status": "TEST_INFORMATION_MISSING", "detail": "Accepted tests not verified"}

    matched_test = None
    for st in student_tests:
        if st["name"] in accepted:
            matched_test = st
            break

    if matched_test is None:
        return {"status": "TEST_REQUIRED", "detail": f"Accepted test required: {', '.join(accepted)}"}

    score_pct = (matched_test["score"] / matched_test["total"]) * 100
    if minimum_score is not None and score_pct < minimum_score:
        return {
            "status": "TEST_SCORE_INVALID",
            "detail": f"{matched_test['name']} score {score_pct:.1f}% below minimum {minimum_score}%",
        }

    return {
        "status": "ACCEPTED_TEST_AVAILABLE",
        "detail": f"{matched_test['name']} accepted ({matched_test['score']}/{matched_test['total']})",
    }
