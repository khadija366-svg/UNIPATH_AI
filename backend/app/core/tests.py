from typing import Dict, Any, List, Optional


def evaluate_tests(profile: Dict[str, Any], program: Dict[str, Any]) -> Dict[str, Any]:
    tests_cfg = program.get("tests", {})
    if not tests_cfg.get("required", False):
        return {
            "status": "TEST_NOT_REQUIRED",
            "detail": "No entry test required for this program",
            "accepted_test": None,
            "score_percentage": None,
        }

    accepted = tests_cfg.get("accepted_tests", [])
    minimum_score = tests_cfg.get("minimum_score")
    student_tests = profile.get("tests", []) or []

    if not accepted:
        return {
            "status": "TEST_INFORMATION_MISSING",
            "detail": "Accepted tests not verified",
            "accepted_test": None,
            "score_percentage": None,
        }

    matched_test = None
    for st in student_tests:
        if isinstance(st, dict) and st.get("name") in accepted:
            matched_test = st
            break
        elif hasattr(st, "name") and st.name in accepted:
            matched_test = {"name": st.name, "score": st.score, "total": st.total}
            break

    if matched_test is None:
        if len(student_tests) > 0:
            provided_names = [st.get("name") if isinstance(st, dict) else st.name for st in student_tests]
            return {
                "status": "WRONG_TEST",
                "detail": f"Requires {', '.join(accepted)}, but student provided {', '.join(filter(None, provided_names))}",
                "accepted_test": None,
                "score_percentage": None,
            }
        return {
            "status": "TEST_REQUIRED",
            "detail": f"Accepted test required: {', '.join(accepted)}",
            "accepted_test": None,
            "score_percentage": None,
        }

    total = matched_test.get("total", 0)
    score = matched_test.get("score", 0)
    if total <= 0 or score < 0 or score > total:
        return {
            "status": "TEST_SCORE_INVALID",
            "detail": f"Invalid test score {score}/{total} for {matched_test.get('name')}",
            "accepted_test": matched_test,
            "score_percentage": None,
        }

    score_pct = round((score / total) * 100, 2)
    if minimum_score is not None and score_pct < minimum_score:
        return {
            "status": "TEST_SCORE_INVALID",
            "detail": f"{matched_test['name']} score {score_pct:.1f}% ({score}/{total}) is below minimum requirement of {minimum_score}%",
            "accepted_test": matched_test,
            "score_percentage": score_pct,
        }

    return {
        "status": "ACCEPTED_TEST_AVAILABLE",
        "detail": f"{matched_test['name']} accepted ({score}/{total} — {score_pct:.1f}%)",
        "accepted_test": matched_test,
        "score_percentage": score_pct,
    }
