# Weather-Aware Truck Routing — Spotter Full Stack Assessment

[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12%20%7C%203.13-blue.svg)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-5.0%2B-green.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6%2B-646cff.svg)](https://vitejs.dev/)
[![Tests](https://img.shields.io/badge/Tests-15%20Passed-brightgreen.svg)]()
[![License](https://img.shields.io/badge/License-MIT-purple.svg)]()

A full-stack web application built with **React** and **Django REST Framework** that helps truck drivers and logistics dispatchers choose the safest route based on real-time weather forecasts, truck payload weight, and travel time.

---

## 🌟 Key Features

1. **3 Distinct Route Options**:
   - Queries OSRM routing API with multi-waypoint fallbacks to guarantee 3 realistic alternative interstate corridors.
2. **Equidistant Weather Sampling (10 / 25 / 50 Miles)**:
   - Uses the Great-Circle Haversine formula to sample checkpoints at user-configurable intervals.
   - Computes checkpoint-specific estimated arrival times (ETAs) based on driving speeds.
3. **Rigorous Weather Risk & Load Escalation Rules**:
   - Classifies Wind (<25 safe, up to ≥55 No Travel), Rain (<0.10 up to >1.00 in/hr), and Snow (<0.5 up to >3.0 in/hr).
   - Dynamically escalates wind risk based on vehicle weight (>30,000 lbs and >40,000 lbs).
4. **Intelligent Recommendation Engine**:
   - Ranks routes based on:
     1. Fewest No Travel & Severe miles
     2. Fewest High miles
     3. Lowest average risk index
     4. Shortest travel time
5. **Interactive Leaflet Map & Checkpoint Telemetry**:
   - Color-coded risk markers along each polyline.
   - Interactive popups with weather telemetry (wind speed, rain/snow rates, ETA, risk rationale).
6. **Corridor Weather Heatmap with 0–48 Hour Forecast Slider**:
   - Real-time animated scrubber to preview approaching weather systems along the route corridor.
   - Layer toggles for Combined Risk, Wind Speed, and Precipitation/Snow.
7. **Weather & Hazard Elevation Profile Chart**:
   - Visual SVG graph plotting wind speed curves and precipitation bars across route mileage.

---

## 🏗️ Architecture

```
truck-weather-router/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── routing_project/          # Django project configuration & CORS
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── router_api/               # Routing & Weather REST App
│       ├── views.py              # API endpoints (/calculate-routes, /geocode, /risk-rules)
│       ├── urls.py
│       ├── services/
│       │   ├── risk_calculator.py       # Weather risk thresholds & load weight logic
│       │   ├── recommendation_engine.py # Multi-criteria route ranking
│       │   ├── routing_service.py       # OSRM routing & equidistant sampling (10/25/50 mi)
│       │   ├── weather_service.py       # Open-Meteo batch fetching & corridor heatmap
│       │   └── geocoding_service.py     # Location search & freight terminal presets
│       └── tests/
│           ├── test_risk_rules.py       # Risk threshold and load rule unit tests
│           ├── test_recommendation.py   # Preference ranking tests
│           ├── test_sampling.py         # Sampling intervals & ETA tests
│           └── test_api_endpoints.py    # Django REST API integration tests
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html               # Tailwind CSS & Leaflet styling
│   └── src/
│       ├── App.jsx              # Main dashboard orchestrator
│       ├── components/
│       │   ├── Navbar.jsx               # Header & risk rubric modal trigger
│       │   ├── TripInputForm.jsx        # Origin/dest, departure, load slider, presets
│       │   ├── RouteMap.jsx             # Leaflet map, polylines, checkpoints, heatmap
│       │   ├── ForecastSlider.jsx       # 0–48h timeline scrubber & animation controls
│       │   ├── RouteCardList.jsx        # Route comparison cards & recommended badge
│       │   ├── WeatherProfileChart.jsx  # Route distance vs weather chart
│       │   └── RiskModal.jsx            # Specification rubric modal
│       └── style.css
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
├── run_dev.bat                  # 1-click Windows launcher
├── run_dev.sh                   # 1-click Linux/Mac launcher
└── WALKTHROUGH_SCRIPT.md        # 5-10 minute Loom presentation script
```

---

## 📐 Risk Classification & Load Escalation Rules

### 1. Meteorological Thresholds

| Condition | Low | Moderate | High | Severe | No Travel |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Wind** | < 25 mph | 25–34 mph | 35–44 mph | 45–54 mph | ≥ 55 mph |
| **Rain** | < 0.10 in/hr | 0.10–0.25 in/hr | 0.25–0.50 in/hr | 0.50–1.00 in/hr | > 1.00 in/hr |
| **Snow** | < 0.5 in/hr | 0.5–1.0 in/hr | 1.0–2.0 in/hr | 2.0–3.0 in/hr | > 3.0 in/hr |

### 2. Vehicle Weight Load Rules

Wind risk is modified by gross truck weight due to vehicle cross-sectional aerodynamics and rollover risk:
- **Wind ≥ 55 mph** ➔ **No Travel** for *any* load.
- **Wind 45–54 mph + Load > 30,000 lbs** ➔ **No Travel** *(escalated from Severe)*.
- **Wind 35–44 mph + Load > 40,000 lbs** ➔ **Severe** *(escalated from High)*.

### 3. Route Recommendation Priority

Candidate routes are ranked strictly according to the evaluation preference:
1. **Fewest Severe miles** *(and No Travel miles)*
2. **Fewest High miles**
3. **Lowest average risk score**
4. **Shortest travel times**

---

## 🚀 Quick Start Guide

### Option 1: Native Local Run

#### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

#### 1. Start Backend (Django)
```bash
cd backend
pip install -r requirements.txt
python manage.py runserver 127.0.0.1:8000
```

#### 2. Start Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

Visit **http://localhost:3000** in your web browser.

---

### Option 2: One-Click Launch Script
- **Windows**: Double-click `run_dev.bat`
- **Linux/Mac**: Run `./run_dev.sh`

---

### Option 3: Docker Compose
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/api/`

---

## 🧪 Running the Test Suite

The project includes 15 automated unit and integration tests covering risk thresholds, load rules, sampling intervals, and API endpoints.

```bash
# Run from repository root
python -m pytest backend/router_api/tests/ -v
```

All 15 tests execute in sub-second time.

---

## 📡 REST API Reference

### `POST /api/calculate-routes/`
Computes 3 route alternatives, samples checkpoints, evaluates risk, and ranks routes.

**Request Payload:**
```json
{
  "origin": { "name": "Chicago, IL", "lat": 41.8781, "lon": -87.6298 },
  "destination": { "name": "Denver, CO", "lat": 39.7392, "lon": -104.9903 },
  "departure_time": "2026-10-15T08:00:00Z",
  "load_weight_lbs": 42000,
  "sampling_interval_miles": 25
}
```

**Response Overview:**
```json
{
  "status": "success",
  "routes": [
    {
      "id": "route_1",
      "name": "Primary Interstate Route",
      "distance_miles": 985.4,
      "duration_hours": 15.2,
      "is_recommended": true,
      "recommendation_rank": 1,
      "recommendation_reason": "Safest route: Completely avoids No Travel and Severe weather...",
      "risk_miles": {
        "Low": 820.0,
        "Moderate": 125.0,
        "High": 40.4,
        "Severe": 0.0,
        "No Travel": 0.0
      },
      "average_risk_score": 1.62,
      "checkpoints": [...]
    }
  ],
  "corridor_heatmap": {
    "forecast_hours": [0, 3, 6, 9, 12, ... 48],
    "snapshots": { ... }
  }
}
```

### `GET /api/risk-rules/`
Returns the risk rubric thresholds and vehicle weight rules.

### `GET /api/geocode/?q=Denver`
Returns location search suggestions and freight hub coordinates.

---

## 📹 Video Walkthrough & Presentation
Refer to [WALKTHROUGH_SCRIPT.md](WALKTHROUGH_SCRIPT.md) for a ready-to-record 5–10 minute script tailored for the Loom video walkthrough deliverable.
