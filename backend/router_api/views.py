"""
API Views for Weather-Aware Truck Routing.
Handles route generation, weather sampling, risk assessment, and recommendation.
"""

import logging
from datetime import datetime, timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from router_api.services.routing_service import get_three_routes
from router_api.services.weather_service import (
    fetch_open_meteo_weather_batch,
    generate_corridor_heatmap_data,
)
from router_api.services.risk_calculator import (
    calculate_checkpoint_risk,
    RISK_LEVELS,
    RISK_COLORS,
)
from router_api.services.recommendation_engine import rank_and_recommend_routes
from router_api.services.geocoding_service import search_locations, PRESET_CITIES

logger = logging.getLogger(__name__)


class HealthCheckView(APIView):
    def get(self, request):
        return Response({"status": "ok", "service": "Weather-Aware Truck Routing API", "version": "1.0.0"})


class RiskRulesView(APIView):
    def get(self, request):
        return Response({
            "levels": RISK_LEVELS,
            "colors": RISK_COLORS,
            "thresholds": {
                "wind_mph": {
                    "Low": "<25 mph",
                    "Moderate": "25-34 mph",
                    "High": "35-44 mph",
                    "Severe": "45-54 mph",
                    "No Travel": ">=55 mph",
                },
                "rain_in_hr": {
                    "Low": "<0.10 in/hr",
                    "Moderate": "0.10-0.25 in/hr",
                    "High": "0.25-0.50 in/hr",
                    "Severe": "0.50-1.00 in/hr",
                    "No Travel": ">1.00 in/hr",
                },
                "snow_in_hr": {
                    "Low": "<0.5 in/hr",
                    "Moderate": "0.5-1.0 in/hr",
                    "High": "1.0-2.0 in/hr",
                    "Severe": "2.0-3.0 in/hr",
                    "No Travel": ">3.0 in/hr",
                },
            },
            "load_rules": [
                {"rule": ">=55 mph", "effect": "No Travel for any load"},
                {"rule": "45-54 mph + >30,000 lb", "effect": "No Travel"},
                {"rule": "35-44 mph + >40,000 lb", "effect": "Severe"},
            ],
            "recommendation_criteria": [
                "1. Fewest Severe miles (and No Travel miles)",
                "2. Fewest High miles",
                "3. Lowest average risk",
                "4. Shortest travel times",
            ],
        })


class GeocodeView(APIView):
    def get(self, request):
        query = request.query_params.get("q", "")
        results = search_locations(query)
        return Response({"results": results, "presets": PRESET_CITIES[:6]})


class CalculateRoutesView(APIView):
    def post(self, request):
        data = request.data

        # 1. Input parsing & validation
        origin = data.get("origin")
        destination = data.get("destination")
        departure_str = data.get("departure_time")
        load_weight_lbs = data.get("load_weight_lbs", 35000.0)
        sampling_interval = float(data.get("sampling_interval_miles", 25.0))

        if not origin or not destination:
            return Response(
                {"error": "Both origin and destination coordinates are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            origin_lat = float(origin.get("lat"))
            origin_lon = float(origin.get("lon"))
            dest_lat = float(destination.get("lat"))
            dest_lon = float(destination.get("lon"))
            load_weight_lbs = max(0.0, float(load_weight_lbs))
        except (ValueError, TypeError) as e:
            return Response(
                {"error": f"Invalid numerical coordinates or load weight: {e}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Parse departure time
        if departure_str:
            try:
                departure_time = datetime.fromisoformat(departure_str.replace("Z", "+00:00"))
            except Exception:
                departure_time = datetime.now(timezone.utc)
        else:
            departure_time = datetime.now(timezone.utc)

        # Restrict sampling interval to valid options
        if sampling_interval not in [10.0, 25.0, 50.0]:
            sampling_interval = 25.0

        # 2. Generate 3 route options
        raw_routes = get_three_routes(
            origin_lat=origin_lat,
            origin_lon=origin_lon,
            dest_lat=dest_lat,
            dest_lon=dest_lon,
            departure_time=departure_time,
            sampling_interval_miles=sampling_interval,
        )

        all_trip_checkpoints = []
        processed_routes = []

        # 3. Weather sampling & risk evaluation for each route
        for r_idx, route in enumerate(raw_routes):
            checkpoints = route.get("checkpoints", [])
            coords = [(cp["latitude"], cp["longitude"]) for cp in checkpoints]
            target_dts = [
                datetime.fromisoformat(cp["eta_datetime"].replace("Z", "+00:00"))
                for cp in checkpoints
            ]

            # Batch fetch weather for checkpoints
            weather_data = fetch_open_meteo_weather_batch(coords, target_dts)

            # Risk accumulation counters
            risk_miles = {lvl: 0.0 for lvl in RISK_LEVELS}
            risk_counts = {lvl: 0 for lvl in RISK_LEVELS}
            weighted_score_sum = 0.0
            total_route_miles = route.get("distance_miles", 0.0)

            annotated_checkpoints = []
            for cp, w in zip(checkpoints, weather_data):
                # Calculate risk using rubrics & load escalation
                risk_res = calculate_checkpoint_risk(
                    wind_mph=w["wind_speed_mph"],
                    rain_in_hr=w["precipitation_in_hr"],
                    snow_in_hr=w["snowfall_in_hr"],
                    load_weight_lbs=load_weight_lbs,
                )

                level = risk_res["overall_level"]
                score = risk_res["overall_score"]
                repr_miles = cp.get("represented_segment_miles", sampling_interval)

                risk_miles[level] = round(risk_miles[level] + repr_miles, 1)
                risk_counts[level] += 1
                weighted_score_sum += score * repr_miles

                annotated_cp = {
                    **cp,
                    "weather": w,
                    "risk": risk_res,
                }
                annotated_checkpoints.append(annotated_cp)
                all_trip_checkpoints.append(annotated_cp)

            # Normalize miles so total matches distance_miles exactly
            sum_recorded = sum(risk_miles.values())
            if sum_recorded > 0 and total_route_miles > 0:
                scale = total_route_miles / sum_recorded
                risk_miles = {k: round(v * scale, 1) for k, v in risk_miles.items()}

            avg_risk_score = (
                weighted_score_sum / total_route_miles
                if total_route_miles > 0
                else 1.0
            )

            processed_routes.append({
                **route,
                "checkpoints": annotated_checkpoints,
                "risk_miles": risk_miles,
                "risk_counts": risk_counts,
                "average_risk_score": round(avg_risk_score, 2),
            })

        # 4. Rank and recommend safest route
        ranked_routes = rank_and_recommend_routes(processed_routes)

        # 5. Generate corridor heatmap dataset for 0-48h forecast slider
        corridor_heatmap = generate_corridor_heatmap_data(
            all_trip_checkpoints,
            departure_time,
            max_forecast_hours=48,
        )

        return Response({
            "status": "success",
            "request_params": {
                "origin": origin,
                "destination": destination,
                "departure_time": departure_time.isoformat(),
                "load_weight_lbs": load_weight_lbs,
                "sampling_interval_miles": sampling_interval,
            },
            "routes": ranked_routes,
            "corridor_heatmap": corridor_heatmap,
        })
