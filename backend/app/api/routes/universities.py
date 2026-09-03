from typing import Optional
from fastapi import APIRouter, Query, HTTPException
from app.services.university_service import load_universities, normalize_program_name
from app.services.live_scraper import persist_live_updates, scrape_universities

router = APIRouter()


@router.get("/universities")
def list_universities(
    program: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    test_required: Optional[str] = Query(None),
):
    universities = load_universities()

    if program or city or test_required is not None:
        filtered = []
        for uni in universities:
            programs = []
            for p in uni.get("programs", []):
                if program and normalize_program_name(program) != p["normalized_name"]:
                    continue
                if city and city.lower() != uni["city"].lower():
                    continue
                if test_required is not None:
                    required = test_required.lower() == "true"
                    if p.get("tests", {}).get("required") != required:
                        continue
                programs.append(p)
            if programs:
                uni_copy = {**uni, "programs": programs}
                filtered.append(uni_copy)
        universities = filtered

    return {
        "universities": universities,
        "count": len(universities),
        "data_source": "cache",
        "scrape_status": "not_requested",
    }


@router.post("/universities/refresh")
def refresh_universities(ids: Optional[str] = Query(None, description="Comma-separated university IDs")):
    """Fetch official pages and report live evidence without replacing trusted cache data."""
    universities = load_universities()
    requested = {item.strip() for item in ids.split(",")} if ids else None
    selected = [uni for uni in universities if requested is None or uni["university_id"] in requested]
    if requested is not None and len(selected) != len(requested):
        missing = sorted(requested - {uni["university_id"] for uni in selected})
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "universities": missing})

    results = scrape_universities(selected)
    live_successes = [result for result in results if result["status"] == "success"]
    if len(live_successes) == len(results):
        status = "success"
    elif live_successes:
        status = "partial"
    else:
        status = "failed"
    updated_programs = persist_live_updates(results)
    if updated_programs:
        universities = load_universities()
    return {
        "status": status,
        "data_source": "live" if updated_programs else "cache",
        "live_fetch": "success" if len(live_successes) == len(results) else status,
        "updated_programs": updated_programs,
        "cache_fallback": bool(not live_successes or len(live_successes) < len(results)),
        "results": results,
        "universities": universities,
        "count": len(universities),
    }


@router.get("/universities/{university_id}")
def get_university(university_id: str):
    for uni in load_universities():
        if uni["university_id"] == university_id:
            return uni
    raise HTTPException(
        status_code=404,
        detail={"code": "NOT_FOUND", "message": "University not found"},
    )
