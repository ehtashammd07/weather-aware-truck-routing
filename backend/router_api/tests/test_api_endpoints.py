import pytest
import json
from rest_framework.test import APIClient


@pytest.fixture
def client():
    return APIClient()


def test_health_endpoint(client):
    response = client.get("/api/health/")
    assert response.status_code == 200
    assert response.data["status"] == "ok"


def test_risk_rules_endpoint(client):
    response = client.get("/api/risk-rules/")
    assert response.status_code == 200
    assert "thresholds" in response.data
    assert "load_rules" in response.data
    assert len(response.data["levels"]) == 5


def test_geocode_endpoint(client):
    response = client.get("/api/geocode/?q=chicago")
    assert response.status_code == 200
    assert len(response.data["results"]) > 0
    assert "Chicago" in response.data["results"][0]["name"]


def test_calculate_routes_endpoint(client):
    payload = {
        "origin": {"name": "Chicago, IL", "lat": 41.8781, "lon": -87.6298},
        "destination": {"name": "Denver, CO", "lat": 39.7392, "lon": -104.9903},
        "departure_time": "2026-10-15T08:00:00Z",
        "load_weight_lbs": 42000,
        "sampling_interval_miles": 25,
    }
    response = client.post(
        "/api/calculate-routes/",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert response.status_code == 200
    data = response.data
    assert data["status"] == "success"
    routes = data["routes"]
    assert len(routes) == 3

    # Verify recommended route exists and is #1
    assert routes[0]["is_recommended"] is True
    assert routes[0]["recommendation_rank"] == 1
    assert "recommendation_reason" in routes[0]

    # Verify checkpoints sampled and annotated with weather & risk
    for r in routes:
        assert len(r["checkpoints"]) > 5
        first_cp = r["checkpoints"][0]
        assert "weather" in first_cp
        assert "risk" in first_cp
        assert "wind_speed_mph" in first_cp["weather"]
        assert "overall_level" in first_cp["risk"]
        assert "risk_miles" in r
        assert "average_risk_score" in r

    # Verify corridor heatmap data
    assert "corridor_heatmap" in data
    assert "snapshots" in data["corridor_heatmap"]
    assert len(data["corridor_heatmap"]["forecast_hours"]) > 0
