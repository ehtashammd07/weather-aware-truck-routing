"""
Route recommendation engine for Weather-Aware Truck Routing.
Ranks candidate routes based on:
  1. Fewest No Travel & Severe miles
  2. Fewest High miles
  3. Lowest average weather risk
  4. Shortest travel time
"""

from typing import List, Dict, Any


def rank_and_recommend_routes(routes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Ranks routes according to the evaluation criteria:
      1. Fewest No Travel miles
      2. Fewest Severe miles
      3. Fewest High miles
      4. Lowest average risk score
      5. Shortest travel time (duration_seconds)

    Annotates each route with:
      - recommendation_rank (1 = Best/Recommended)
      - is_recommended (True for rank 1)
      - recommendation_reason (Descriptive justification)
    """
    if not routes:
        return []

    # Helper function to compute sort key
    def sort_key(route: Dict[str, Any]):
        risk_miles = route.get("risk_miles", {})
        no_travel_miles = round(risk_miles.get("No Travel", 0.0), 2)
        severe_miles = round(risk_miles.get("Severe", 0.0), 2)
        high_miles = round(risk_miles.get("High", 0.0), 2)
        avg_risk = round(route.get("average_risk_score", 1.0), 3)
        duration_sec = route.get("duration_seconds", 0)
        return (no_travel_miles, severe_miles, high_miles, avg_risk, duration_sec)

    sorted_routes = sorted(routes, key=sort_key)

    best_route = sorted_routes[0]

    for idx, route in enumerate(sorted_routes):
        rank = idx + 1
        route["recommendation_rank"] = rank
        route["is_recommended"] = (rank == 1)

        # Build human-readable reason
        r_miles = route.get("risk_miles", {})
        no_travel = r_miles.get("No Travel", 0.0)
        severe = r_miles.get("Severe", 0.0)
        high = r_miles.get("High", 0.0)
        avg_risk = route.get("average_risk_score", 1.0)
        dur_hrs = route.get("duration_hours", 0.0)

        if rank == 1:
            if no_travel == 0.0 and severe == 0.0 and high == 0.0:
                reason = (
                    f"Optimal choice: 0 miles of High, Severe, or No Travel conditions. "
                    f"Lowest average risk ({avg_risk:.2f}/5.0) with ETA of {dur_hrs:.1f} hrs."
                )
            elif no_travel == 0.0 and severe == 0.0:
                reason = (
                    f"Safest route: Completely avoids No Travel and Severe weather "
                    f"({high:.1f} mi High risk, avg risk {avg_risk:.2f}/5.0)."
                )
            else:
                reason = (
                    f"Recommended safest compromise: Minimizes critical exposure "
                    f"({no_travel:.1f} mi No Travel, {severe:.1f} mi Severe, {high:.1f} mi High). "
                    f"Lowest weighted hazard among all 3 options."
                )
        else:
            diff_severe = severe - best_route.get("risk_miles", {}).get("Severe", 0.0)
            diff_high = high - best_route.get("risk_miles", {}).get("High", 0.0)
            diff_time_mins = round((route.get("duration_seconds", 0) - best_route.get("duration_seconds", 0)) / 60)

            crit_notes = []
            if no_travel > 0:
                crit_notes.append(f"{no_travel:.1f} miles of impassable No Travel conditions")
            if diff_severe > 0:
                crit_notes.append(f"{diff_severe:.1f} more Severe weather miles than Recommended")
            elif diff_high > 0:
                crit_notes.append(f"{diff_high:.1f} more High risk miles than Recommended")

            if diff_time_mins > 0:
                crit_notes.append(f"{diff_time_mins} minutes slower")
            elif diff_time_mins < 0:
                crit_notes.append(f"{abs(diff_time_mins)} min faster, but has higher weather hazard")

            if not crit_notes:
                crit_notes.append(f"Higher average risk index ({avg_risk:.2f} vs {best_route.get('average_risk_score', 1.0):.2f})")

            reason = f"Rank #{rank}: {', '.join(crit_notes)}."

        route["recommendation_reason"] = reason

    return sorted_routes
