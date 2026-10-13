import pytest
from router_api.services.risk_calculator import (
    classify_wind_risk,
    classify_rain_risk,
    classify_snow_risk,
    calculate_checkpoint_risk,
)


def test_wind_risk_standard():
    # Wind < 25 mph -> Low
    level, _ = classify_wind_risk(24.9, 20000)
    assert level == "Low"

    # Wind 25-34 mph -> Moderate
    level, _ = classify_wind_risk(25.0, 20000)
    assert level == "Moderate"
    level, _ = classify_wind_risk(34.0, 20000)
    assert level == "Moderate"

    # Wind 35-44 mph with load <= 40,000 lb -> High
    level, _ = classify_wind_risk(35.0, 39999)
    assert level == "High"
    level, _ = classify_wind_risk(44.0, 40000)
    assert level == "High"

    # Wind 45-54 mph with load <= 30,000 lb -> Severe
    level, _ = classify_wind_risk(45.0, 30000)
    assert level == "Severe"
    level, _ = classify_wind_risk(54.0, 25000)
    assert level == "Severe"

    # Wind >= 55 mph -> No Travel for any load
    level, _ = classify_wind_risk(55.0, 10000)
    assert level == "No Travel"
    level, _ = classify_wind_risk(65.0, 80000)
    assert level == "No Travel"


def test_wind_risk_load_rules():
    # 35-44 mph + >40,000 lb -> Severe
    level, reason = classify_wind_risk(38.0, 42000)
    assert level == "Severe"
    assert "heavy load" in reason.lower() or "40,000" in reason

    # 45-54 mph + >30,000 lb -> No Travel
    level, reason = classify_wind_risk(48.0, 32000)
    assert level == "No Travel"
    assert "30,000" in reason

    # >= 55 mph -> No Travel regardless of weight
    level, _ = classify_wind_risk(55.0, 5000)
    assert level == "No Travel"


def test_rain_risk():
    assert classify_rain_risk(0.05)[0] == "Low"
    assert classify_rain_risk(0.10)[0] == "Moderate"
    assert classify_rain_risk(0.25)[0] == "High"
    assert classify_rain_risk(0.50)[0] == "Severe"
    assert classify_rain_risk(1.05)[0] == "No Travel"


def test_snow_risk():
    assert classify_snow_risk(0.2)[0] == "Low"
    assert classify_snow_risk(0.5)[0] == "Moderate"
    assert classify_snow_risk(1.0)[0] == "High"
    assert classify_snow_risk(2.0)[0] == "Severe"
    assert classify_snow_risk(3.5)[0] == "No Travel"


def test_checkpoint_combined_risk():
    # Wind moderate (30mph), Rain severe (0.8 in/hr), Snow none -> Overall Severe
    res = calculate_checkpoint_risk(
        wind_mph=30.0,
        rain_in_hr=0.8,
        snow_in_hr=0.0,
        load_weight_lbs=25000,
    )
    assert res["overall_level"] == "Severe"
    assert res["overall_score"] == 4.0

    # Wind 48mph + 35k lb load -> No Travel
    res2 = calculate_checkpoint_risk(
        wind_mph=48.0,
        rain_in_hr=0.0,
        snow_in_hr=0.0,
        load_weight_lbs=35000,
    )
    assert res2["overall_level"] == "No Travel"
    assert res2["overall_score"] == 5.0
