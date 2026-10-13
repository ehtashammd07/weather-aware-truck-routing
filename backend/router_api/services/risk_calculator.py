"""
Risk calculation service for Weather-Aware Truck Routing.
Implements the risk classification thresholds and load-weight escalation rules.
"""

from typing import Dict, Any, Tuple

# Ordered risk levels and numerical scores
RISK_LEVELS = ["Low", "Moderate", "High", "Severe", "No Travel"]
RISK_SCORES = {
    "Low": 1.0,
    "Moderate": 2.0,
    "High": 3.0,
    "Severe": 4.0,
    "No Travel": 5.0,
}

RISK_COLORS = {
    "Low": "#10b981",       # Emerald green
    "Moderate": "#f59e0b",  # Amber yellow
    "High": "#f97316",      # Orange
    "Severe": "#ef4444",    # Red
    "No Travel": "#450a0a", # Very dark red / Black
}


def classify_wind_risk(wind_mph: float, load_weight_lbs: float) -> Tuple[str, str]:
    """
    Classify wind risk considering load weight adjustments:
    Standard wind thresholds:
      - Low: < 25 mph
      - Moderate: 25-34 mph
      - High: 35-44 mph
      - Severe: 45-54 mph
      - No Travel: >= 55 mph

    Load rules:
      - >= 55 mph -> No Travel for any load
      - 45-54 mph + > 30,000 lb -> No Travel
      - 35-44 mph + > 40,000 lb -> Severe
    """
    wind = max(0.0, float(wind_mph))
    weight = max(0.0, float(load_weight_lbs))
    reason = ""

    if wind >= 55.0:
        return "No Travel", f"Wind speed {wind:.1f} mph exceeds critical threshold (>=55 mph) for any load"

    if 45.0 <= wind <= 54.99:
        if weight > 30000.0:
            return "No Travel", f"Wind {wind:.1f} mph with load {weight:,.0f} lbs (>30,000 lbs) triggers No Travel"
        return "Severe", f"Severe wind {wind:.1f} mph (45-54 mph)"

    if 35.0 <= wind <= 44.99:
        if weight > 40000.0:
            return "Severe", f"Wind {wind:.1f} mph with heavy load {weight:,.0f} lbs (>40,000 lbs) escalated to Severe"
        return "High", f"High wind {wind:.1f} mph (35-44 mph)"

    if 25.0 <= wind <= 34.99:
        return "Moderate", f"Moderate wind {wind:.1f} mph (25-34 mph)"

    return "Low", f"Wind {wind:.1f} mph is within safe operating range (<25 mph)"


def classify_rain_risk(rain_in_hr: float) -> Tuple[str, str]:
    """
    Classify rain precipitation intensity:
      - Low: < 0.10 in/hr
      - Moderate: 0.10 - 0.25 in/hr
      - High: 0.25 - 0.50 in/hr
      - Severe: 0.50 - 1.00 in/hr
      - No Travel: > 1.00 in/hr
    """
    rain = max(0.0, float(rain_in_hr))
    if rain > 1.00:
        return "No Travel", f"Extreme torrential rain {rain:.2f} in/hr (>1.00 in/hr)"
    if rain >= 0.50:
        return "Severe", f"Severe rain {rain:.2f} in/hr (0.50-1.00 in/hr)"
    if rain >= 0.25:
        return "High", f"Heavy rain {rain:.2f} in/hr (0.25-0.50 in/hr)"
    if rain >= 0.10:
        return "Moderate", f"Moderate rain {rain:.2f} in/hr (0.10-0.25 in/hr)"
    return "Low", f"Light or no rain {rain:.2f} in/hr (<0.10 in/hr)"


def classify_snow_risk(snow_in_hr: float) -> Tuple[str, str]:
    """
    Classify snow precipitation intensity:
      - Low: < 0.5 in/hr
      - Moderate: 0.5 - 1.0 in/hr
      - High: 1.0 - 2.0 in/hr
      - Severe: 2.0 - 3.0 in/hr
      - No Travel: > 3.0 in/hr
    """
    snow = max(0.0, float(snow_in_hr))
    if snow > 3.0:
        return "No Travel", f"Blizzard snowfall {snow:.2f} in/hr (>3.0 in/hr)"
    if snow >= 2.0:
        return "Severe", f"Severe snowfall {snow:.2f} in/hr (2.0-3.0 in/hr)"
    if snow >= 1.0:
        return "High", f"Heavy snowfall {snow:.2f} in/hr (1.0-2.0 in/hr)"
    if snow >= 0.5:
        return "Moderate", f"Moderate snowfall {snow:.2f} in/hr (0.5-1.0 in/hr)"
    return "Low", f"Light or no snow {snow:.2f} in/hr (<0.5 in/hr)"


def calculate_checkpoint_risk(
    wind_mph: float,
    rain_in_hr: float,
    snow_in_hr: float,
    load_weight_lbs: float,
) -> Dict[str, Any]:
    """
    Calculates combined checkpoint risk by selecting the maximum severity
    across Wind, Rain, and Snow, factoring in truck load weight.
    """
    wind_level, wind_reason = classify_wind_risk(wind_mph, load_weight_lbs)
    rain_level, rain_reason = classify_rain_risk(rain_in_hr)
    snow_level, snow_reason = classify_snow_risk(snow_in_hr)

    # Determine dominant risk level
    wind_score = RISK_SCORES[wind_level]
    rain_score = RISK_SCORES[rain_level]
    snow_score = RISK_SCORES[snow_level]

    max_score = max(wind_score, rain_score, snow_score)

    overall_level = "Low"
    for lvl, score in RISK_SCORES.items():
        if score == max_score:
            overall_level = lvl
            break

    # Identify primary hazard reasons
    hazards = []
    if wind_score == max_score and wind_level != "Low":
        hazards.append(wind_reason)
    if rain_score == max_score and rain_level != "Low":
        hazards.append(rain_reason)
    if snow_score == max_score and snow_level != "Low":
        hazards.append(snow_reason)

    if not hazards:
        hazards.append("Optimal driving conditions")

    return {
        "overall_level": overall_level,
        "overall_score": max_score,
        "color": RISK_COLORS[overall_level],
        "primary_hazard": "; ".join(hazards),
        "breakdown": {
            "wind": {
                "value_mph": round(wind_mph, 1),
                "level": wind_level,
                "score": wind_score,
                "reason": wind_reason,
            },
            "rain": {
                "value_in_hr": round(rain_in_hr, 3),
                "level": rain_level,
                "score": rain_score,
                "reason": rain_reason,
            },
            "snow": {
                "value_in_hr": round(snow_in_hr, 3),
                "level": snow_level,
                "score": snow_score,
                "reason": snow_reason,
            },
        },
    }
