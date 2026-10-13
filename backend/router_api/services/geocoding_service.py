"""
Geocoding service providing instant US freight terminal suggestions
and fallback to OSM Nominatim / Photon API.
"""

from typing import List, Dict, Any
import requests

PRESET_CITIES = [
    {"name": "Chicago, IL", "lat": 41.8781, "lon": -87.6298, "state": "IL", "hub": "Major Midwest Rail & Trucking Hub"},
    {"name": "Denver, CO", "lat": 39.7392, "lon": -104.9903, "state": "CO", "hub": "Rocky Mountain Crossroads"},
    {"name": "Dallas, TX", "lat": 32.7767, "lon": -96.7970, "state": "TX", "hub": "Southern Logistics Corridor"},
    {"name": "Atlanta, GA", "lat": 33.7490, "lon": -84.3880, "state": "GA", "hub": "Southeast Distribution Center"},
    {"name": "Seattle, WA", "lat": 47.6062, "lon": -122.3321, "state": "WA", "hub": "Pacific Northwest Port Hub"},
    {"name": "Salt Lake City, UT", "lat": 40.7608, "lon": -111.8910, "state": "UT", "hub": "Intermountain Freight Gateway"},
    {"name": "Los Angeles, CA", "lat": 34.0522, "lon": -118.2437, "state": "CA", "hub": "Port of LA / Long Beach Container Terminal"},
    {"name": "Phoenix, AZ", "lat": 33.4484, "lon": -112.0740, "state": "AZ", "hub": "Southwest Freight Corridor"},
    {"name": "New York, NY", "lat": 40.7128, "lon": -74.0060, "state": "NY", "hub": "East Coast Terminal"},
    {"name": "Kansas City, MO", "lat": 39.0997, "lon": -94.5786, "state": "MO", "hub": "Central Intermodal Terminal"},
    {"name": "Memphis, TN", "lat": 35.1495, "lon": -90.0490, "state": "TN", "hub": "Global Air/Truck Logistics Capital"},
    {"name": "Minneapolis, MN", "lat": 44.9778, "lon": -93.2650, "state": "MN", "hub": "Upper Midwest Distribution Hub"},
    {"name": "Indianapolis, IN", "lat": 39.7684, "lon": -86.1581, "state": "IN", "hub": "Crossroads of America"},
    {"name": "Cheyenne, WY", "lat": 41.1400, "lon": -104.8202, "state": "WY", "hub": "I-80 High Wind Corridor Depot"},
    {"name": "Omaha, NE", "lat": 41.2565, "lon": -95.9345, "state": "NE", "hub": "Great Plains Rail & Interstate Hub"},
    {"name": "Houston, TX", "lat": 29.7604, "lon": -95.3698, "state": "TX", "hub": "Gulf Coast Port & Petrochemical Hub"},
]


def search_locations(query: str) -> List[Dict[str, Any]]:
    """Search for locations matching query text."""
    q = query.strip().lower()
    if not q:
        return PRESET_CITIES[:8]

    matches = [c for c in PRESET_CITIES if q in c["name"].lower() or q in c["state"].lower()]

    # If presets don't cover it, try Photon API
    if len(matches) < 3:
        try:
            resp = requests.get(f"https://photon.komoot.io/api/?q={query}&limit=5", timeout=3)
            if resp.status_code == 200:
                features = resp.json().get("features", [])
                for f in features:
                    props = f.get("properties", {})
                    coords = f.get("geometry", {}).get("coordinates", [])
                    if len(coords) >= 2:
                        name_parts = [props.get("name", "")]
                        if props.get("state"):
                            name_parts.append(props["state"])
                        if props.get("country"):
                            name_parts.append(props["country"])
                        label = ", ".join([p for p in name_parts if p])
                        matches.append({
                            "name": label,
                            "lat": coords[1],
                            "lon": coords[0],
                            "state": props.get("state", ""),
                            "hub": props.get("type", "City"),
                        })
        except Exception:
            pass

    return matches[:10]
