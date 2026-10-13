import pytest
from router_api.services.recommendation_engine import rank_and_recommend_routes


def test_recommendation_fewest_severe_miles():
    # Route A: 50 miles Severe, duration 10h
    # Route B: 0 miles Severe, 30 miles High, duration 10.5h
    # Route B should be preferred over Route A despite being 30m longer
    routes = [
        {
            "id": "route_a",
            "name": "Route via Interstate 80",
            "risk_miles": {"No Travel": 0, "Severe": 50, "High": 20, "Moderate": 100, "Low": 300},
            "average_risk_score": 2.2,
            "duration_seconds": 36000,
            "duration_hours": 10.0,
        },
        {
            "id": "route_b",
            "name": "Route via Interstate 70",
            "risk_miles": {"No Travel": 0, "Severe": 0, "High": 30, "Moderate": 120, "Low": 350},
            "average_risk_score": 1.8,
            "duration_seconds": 37800,
            "duration_hours": 10.5,
        },
    ]

    ranked = rank_and_recommend_routes(routes)
    assert ranked[0]["id"] == "route_b"
    assert ranked[0]["is_recommended"] is True
    assert ranked[1]["id"] == "route_a"
    assert ranked[1]["is_recommended"] is False


def test_recommendation_fewest_high_miles_tie_breaker():
    # Both have 0 Severe miles, but Route 1 has 10 High miles, Route 2 has 40 High miles
    routes = [
        {
            "id": "route_1",
            "risk_miles": {"No Travel": 0, "Severe": 0, "High": 10},
            "average_risk_score": 1.5,
            "duration_seconds": 40000,
        },
        {
            "id": "route_2",
            "risk_miles": {"No Travel": 0, "Severe": 0, "High": 40},
            "average_risk_score": 1.7,
            "duration_seconds": 39000,
        },
    ]
    ranked = rank_and_recommend_routes(routes)
    assert ranked[0]["id"] == "route_1"


def test_recommendation_shortest_travel_time_tie_breaker():
    # Both have 0 Severe, 0 High, same avg risk -> Faster route wins
    routes = [
        {
            "id": "route_slow",
            "risk_miles": {"No Travel": 0, "Severe": 0, "High": 0},
            "average_risk_score": 1.2,
            "duration_seconds": 50000,
        },
        {
            "id": "route_fast",
            "risk_miles": {"No Travel": 0, "Severe": 0, "High": 0},
            "average_risk_score": 1.2,
            "duration_seconds": 45000,
        },
    ]
    ranked = rank_and_recommend_routes(routes)
    assert ranked[0]["id"] == "route_fast"
