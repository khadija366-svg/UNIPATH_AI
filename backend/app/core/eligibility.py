from typing import Dict, Any, List

QUALIFICATION_IMPLIED_SUBJECTS = {
    "FSc Pre-Engineering": ["Mathematics", "Physics", "Chemistry"],
    "ICS": ["Mathematics", "Physics", "Computer Science"],
    "FSc Pre-Medical": ["Biology", "Chemistry", "Physics"],
    "A-Level": [],
    "FA": [],
    "Diploma": ["Mathematics"],
}


def evaluate_eligibility(profile: Dict[str, Any], program: Dict[str, Any]) -> Dict[str, Any]:
    eligibility = program.get("eligibility", {})
    passed = []
    failed = []
    missing = []

    # 1. Matric requirement
    min_matric = eligibility.get("minimum_matric")
    matric_pct = profile.get("matric_percentage")
    if min_matric is None:
        missing.append("Minimum Matric requirement not verified for this program")
    elif matric_pct is None:
        missing.append("Student Matric percentage not provided")
    elif matric_pct >= min_matric:
        passed.append(f"Matric minimum satisfied ({matric_pct}% >= {min_matric}%)")
    else:
        failed.append(f"Matric below minimum ({matric_pct}% < {min_matric}%)")

    # 2. Intermediate requirement
    min_inter = eligibility.get("minimum_intermediate")
    inter_pct = profile.get("intermediate_percentage")
    if min_inter is None:
        missing.append("Minimum Intermediate requirement not verified for this program")
    elif inter_pct is None:
        missing.append("Student Intermediate percentage not provided")
    elif inter_pct >= min_inter:
        passed.append(f"Intermediate minimum satisfied ({inter_pct}% >= {min_inter}%)")
    else:
        failed.append(f"Intermediate below minimum ({inter_pct}% < {min_inter}%)")

    # 3. Accepted qualification groups
    accepted_groups = eligibility.get("accepted_groups", [])
    student_qual = profile.get("qualification", "")
    if not accepted_groups:
        missing.append("Accepted qualification groups not verified for this program")
    elif not student_qual:
        missing.append("Student qualification group not provided")
    elif student_qual in accepted_groups:
        passed.append(f"Qualification group accepted ({student_qual})")
    else:
        failed.append(f"Qualification group '{student_qual}' not accepted (Accepted: {', '.join(accepted_groups)})")

    # 4. Required subjects
    required_subjects = eligibility.get("required_subjects", [])
    if required_subjects:
        student_subjects = profile.get("subjects", []) or []
        implied_subjects = QUALIFICATION_IMPLIED_SUBJECTS.get(student_qual, [])
        all_available_subjects = set(student_subjects) | set(implied_subjects)

        for req_subj in required_subjects:
            # Check direct or case-insensitive match
            has_subject = any(req_subj.lower() in s.lower() or s.lower() in req_subj.lower() for s in all_available_subjects)
            if has_subject or (not student_subjects and student_qual in ["FSc Pre-Engineering", "ICS"] and req_subj in ["Mathematics", "Physics"]):
                passed.append(f"Required subject satisfied: {req_subj}")
            elif student_subjects:
                failed.append(f"Missing required subject: {req_subj}")
            else:
                # Subjects list wasn't explicitly filled and not clearly implied
                missing.append(f"Subject '{req_subj}' verification needed")

    # Determine final eligibility status
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
