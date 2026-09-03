from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_universities_endpoint():
    response = client.get("/api/universities")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 5
    assert len(data["universities"]) == 5


def test_deadlines_endpoint():
    response = client.get("/api/deadlines")
    assert response.status_code == 200
    data = response.json()
    assert "deadlines" in data
    assert len(data["deadlines"]) > 0


def test_profile_analyze_endpoint(demo_student_profile):
    response = client.post("/api/profile/analyze", json=demo_student_profile)
    assert response.status_code == 200
    data = response.json()
    assert "recommendations" in data
    assert "profile_summary" in data
    assert "stats" in data
    assert "successful_universities" in data
    assert len(data["recommendations"]) > 0
    assert data["profile_summary"]["name"] == "Demo Student"


def test_compare_endpoint(demo_student_profile):
    compare_payload = {
        "profile": demo_student_profile,
        "selections": [
            {"university_id": "itu_lahore", "program_id": "itu_lahore_bscs"},
            {"university_id": "uet_lahore", "program_id": "uet_lahore_bscs"},
        ]
    }
    response = client.post("/api/compare", json=compare_payload)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) == 2
    assert data["items"][0]["university_id"] in ["itu_lahore", "uet_lahore"]


def test_analytics_endpoint(demo_student_profile):
    response = client.post("/api/analytics", json=demo_student_profile)
    assert response.status_code == 200
    data = response.json()
    assert "eligibility_distribution" in data
    assert "fee_comparison" in data
    assert "total_programs" in data
