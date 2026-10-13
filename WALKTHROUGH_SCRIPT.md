# 5–10 Minute Loom Walkthrough Script

Use this structured script to record your video walkthrough for the **Weather-Aware Truck Routing** assignment.

---

## 🎬 Video Overview & Outline

- **Total Duration**: ~6–8 minutes
- **Target Audience**: Spotter Engineering Evaluation Team
- **Key Message**: Demonstrating algorithmic correctness, robust error handling, responsive React architecture, and strict adherence to the weather risk rubric and load escalation rules.

---

## ⏱️ Scene-by-Scene Script

### 0:00 – 1:00 | Introduction & Architecture Overview
**Visual**: Show the running application at `http://localhost:3000` alongside the code repository structure.

> *"Hi everyone, welcome to the walkthrough of my solution for Spotter's Weather-Aware Truck Routing assessment.*
>
> *The application is built using a decoupled architecture:*
> 1. *A **Django REST Framework** backend providing high-precision route generation, checkpoint sampling at 10, 25, or 50 miles, and weather risk classification factoring in vehicle load dynamics.*
> 2. *A **React + Vite** frontend styled with Tailwind CSS, utilizing Leaflet for interactive map rendering and a 0–48 hour corridor weather heatmap slider.*
> 3. *Third-party integrations with **OSRM** for driving routing and **Open-Meteo** for hourly meteorological forecasts, backed by an intelligent deterministic meteorological simulator for 100% offline resilience and zero flaky test runs."*

---

### 1:00 – 2:30 | Core Dispatch Parameters & Load Weight Escalations
**Visual**: Focus on the left sidebar: `TripInputForm.jsx`.

> *"Let's look at the user input requirements:*
> - *We enter an Origin and Destination (e.g., Chicago to Denver).*
> - *We specify the departure timestamp.*
> - *We select the sampling interval: 10, 25, or 50 miles.*
> - *And most importantly, the truck load weight.*
>
> *Notice what happens when I adjust the weight slider:*
> - *At 25,000 lbs, standard wind thresholds apply.*
> - *When the load exceeds **30,000 lbs**, the alert banner highlights that wind speeds between 45–54 mph are automatically escalated from Severe to **No Travel**.*
> - *When the load exceeds **40,000 lbs**, wind speeds between 35–44 mph escalate from High to **Severe**.*
>
> *This provides instant visual feedback to dispatchers before dispatching the load."*

---

### 2:30 – 4:00 | Route Generation & The Recommendation Engine
**Visual**: Click "Evaluate 3 Routes & Recommend Safest". Show the 3 route cards and the map.

> *"When we submit the trip:*
> 1. *The backend generates **3 distinct route options** using OSRM, utilizing geometric alternative corridors when highway options are limited.*
> 2. *Along each polyline, checkpoints are sampled using the Haversine formula at exact equidistant intervals (e.g. 25 miles).*
> 3. *For each checkpoint, the truck's estimated arrival time (ETA) is computed based on distance and route speed, and weather is sampled for that exact hour.*
> 4. *Our recommendation engine evaluates all routes against the specification's preference order:*
>    - *Priority 1: Fewest Severe miles (and No Travel miles)*
>    - *Priority 2: Fewest High miles*
>    - *Priority 3: Lowest average risk index*
>    - *Priority 4: Shortest travel time*
>
> *Here, Route Option 1 is designated as **Recommended Route #1**. Notice the reason text: 'Safest route: Completely avoids No Travel and Severe weather with lowest average risk index (1.6/5.0) despite being 18 minutes longer than the northern interstate.' This clearly prioritizes driver safety over pure distance."*

---

### 4:00 – 5:30 | Interactive Map, Checkpoints & Popups
**Visual**: Zoom into the Leaflet map and hover over checkpoints.

> *"On the map, we display all candidate routes with distinct visual themes. The recommended route is highlighted in emerald green.*
>
> *Notice the checkpoint circles color-coded by risk level:*
> - *Green = Low risk*
> - *Amber = Moderate risk*
> - *Orange = High risk*
> - *Red = Severe risk*
> - *Dark Red/Black = No Travel hazard*
>
> *Clicking on any checkpoint opens a detailed telemetry popup:*
> - *Checkpoint index and exact ETA formatted to the driver's local time.*
> - *Distance from origin (e.g. Mile 250).*
> - *Exact wind speed, rain precipitation rate, snowfall accumulation rate, and temperature.*
> - *The primary hazard reason explaining exactly which rule was triggered."*

---

### 5:30 – 6:45 | Corridor Weather Heatmap & 0–48 Hour Forecast Slider
**Visual**: Move the forecast slider from 0 to 48 hours and press the Play button.

> *"A critical requirement is the **weather heatmap along the trip corridor with a 0–48 hour forecast slider**.*
>
> *Along the top of the map, we have an interactive timeline slider.*
> - *As I scrub forward in time—say, from Hour 0 to Hour 18—the meteorological field across the entire corridor updates smoothly.*
> - *We can toggle between **Combined Risk**, **Wind Field**, and **Precipitation & Snow** overlays.*
> - *Pressing Play starts an animated simulation of the approaching weather front across the corridor.*
> - *Below the map, our Weather & Hazard Profile chart shows the wind curve and precipitation bars plotted directly against route mileage with horizontal threshold lines."*

---

### 6:45 – 7:30 | Test Suite & Code Quality
**Visual**: Switch to terminal and run pytest.

> *"To ensure reliability and code quality, the backend includes a comprehensive automated test suite:*
> - *`test_risk_rules.py`: Verifies every single boundary condition for Wind, Rain, Snow, and load escalations.*
> - *`test_recommendation.py`: Validates the 4-step tie-breaking preference order.*
> - *`test_sampling.py`: Tests Haversine distance and equidistant sampling at 10, 25, and 50 miles.*
> - *`test_api_endpoints.py`: Integration tests for all REST endpoints.*
>
> *All 15 tests pass in sub-second time. The codebase is fully modular, type-annotated, and includes Docker Compose configuration for one-command deployment.*
>
> *Thank you for reviewing my project!"*
