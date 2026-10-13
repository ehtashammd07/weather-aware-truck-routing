import pytest
from datetime import datetime, timezone
from router_api.services.routing_service import (
    haversine_distance_miles,
    sample_route_checkpoints,
    generate_fallback_routes,
)


def test_haversine_distance():
    # Chicago (41.8781, -87.6298) to Denver (39.7392, -104.9903) ~ 915-920 miles straight line
    dist = haversine_distance_miles(41.8781, -87.6298, 39.7392, -104.9903)
    assert 910 < dist < 930


def test_sampling_intervals():
    # Straight line of ~100 miles
    coords = [
        (40.0, -80.0),
        (40.0, -81.0), # ~53 miles
        (40.0, -82.0), # ~106 miles
    ]
    dep_time = datetime(2026, 10, 15, 8, 0, tzinfo=timezone.utc)
    dur_seconds = 7200 # 2 hours

    # Sample at 25 miles
    cps_25 = sample_route_checkpoints(coords, dur_seconds, dep_time, sampling_interval_miles=25.0)
    assert len(cps_25) >= 4
    assert cps_25[0]["distance_from_origin_miles"] == 0.0
    assert cps_25[1]["distance_from_origin_miles"] == 25.0
    assert cps_25[2]["distance_from_origin_miles"] == 50.0

    # Verify ETA progresses forward
    for i in range(1, len(cps_25)):
        assert cps_25[i]["eta_relative_hours"] >= cps_25[i-1]["eta_relative_hours"]

    # Sample at 50 miles
    cps_50 = sample_route_checkpoints(coords, dur_seconds, dep_time, sampling_interval_miles=50.0)
    assert len(cps_50) < len(cps_25)
    assert cps_50[1]["distance_from_origin_miles"] == 50.0

    # Sample at 10 miles
    cps_10 = sample_route_checkpoints(coords, dur_seconds, dep_time, sampling_interval_miles=10.0)
    assert len(cps_10) > len(cps_25)
    assert cps_10[1]["distance_from_origin_miles"] == 10.0


def test_fallback_routes_generator():
    chicago = (41.8781, -87.6298)
    denver = (39.7392, -104.9903)
    dep_time = datetime.now(timezone.utc)

    routes = generate_fallback_routes(chicago, denver, dep_time, sampling_interval_miles=25.0)
    assert len(routes) == 3
    for r in routes:
        assert r["distance_miles"] > 900
        assert r["duration_hours"] > 10
        assert len(r["checkpoints"]) > 10
        assert len(r["polyline"]) > 20
