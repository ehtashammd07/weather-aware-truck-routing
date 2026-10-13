import React, { useEffect, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Circle,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import { Wind, CloudRain, Snowflake, AlertTriangle, ShieldAlert, Clock, ArrowRight } from 'lucide-react';

// Fix Leaflet default icon issues in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Helper component to auto-pan and zoom map to fit route coordinates
function MapBoundsUpdater({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }
  }, [bounds, map]);
  return null;
}

export default function RouteMap({
  routes,
  selectedRouteId,
  onSelectRoute,
  forecastHour,
  corridorHeatmap,
  activeLayer = 'risk',
}) {
  const selectedRoute = useMemo(
    () => routes.find((r) => r.id === selectedRouteId) || routes[0],
    [routes, selectedRouteId]
  );

  // Compute map bounds encompassing all routes
  const bounds = useMemo(() => {
    if (!routes || routes.length === 0) return null;
    const allCoords = [];
    routes.forEach((r) => {
      (r.polyline || []).forEach((pt) => allCoords.push(pt));
    });
    return allCoords.length > 0 ? allCoords : null;
  }, [routes]);

  // Corridor snapshot points for the current forecast slider hour
  const currentCorridorPoints = useMemo(() => {
    if (!corridorHeatmap || !corridorHeatmap.snapshots) return [];
    const hourKey = String(forecastHour);
    if (corridorHeatmap.snapshots[hourKey]) {
      return corridorHeatmap.snapshots[hourKey];
    }
    // Find closest available snapshot hour
    const availableHours = Object.keys(corridorHeatmap.snapshots).map(Number);
    if (availableHours.length === 0) return [];
    const closest = availableHours.reduce((prev, curr) =>
      Math.abs(curr - forecastHour) < Math.abs(prev - forecastHour) ? curr : prev
    );
    return corridorHeatmap.snapshots[String(closest)] || [];
  }, [corridorHeatmap, forecastHour]);

  // Helper for heatmap point color & radius
  const getHeatmapColorAndRadius = (pt) => {
    if (activeLayer === 'wind') {
      const w = pt.wind_speed_mph || 0;
      if (w >= 55) return { color: '#450a0a', fill: '#7f1d1d', radius: 45000, label: `${w} mph (Extreme)` };
      if (w >= 45) return { color: '#ef4444', fill: '#ef4444', radius: 40000, label: `${w} mph (Severe)` };
      if (w >= 35) return { color: '#f97316', fill: '#f97316', radius: 35000, label: `${w} mph (High)` };
      if (w >= 25) return { color: '#f59e0b', fill: '#f59e0b', radius: 30000, label: `${w} mph (Mod)` };
      return { color: '#10b981', fill: '#10b981', radius: 25000, label: `${w} mph (Safe)` };
    }

    if (activeLayer === 'precip') {
      const p = (pt.precipitation_in_hr || 0) + (pt.snowfall_in_hr || 0);
      if (p > 1.0) return { color: '#7c3aed', fill: '#6d28d9', radius: 45000, label: `${p.toFixed(2)} in/hr (Extreme)` };
      if (p >= 0.5) return { color: '#3b82f6', fill: '#2563eb', radius: 40000, label: `${p.toFixed(2)} in/hr (Severe)` };
      if (p >= 0.25) return { color: '#06b6d4', fill: '#0891b2', radius: 35000, label: `${p.toFixed(2)} in/hr (High)` };
      if (p >= 0.1) return { color: '#38bdf8', fill: '#38bdf8', radius: 30000, label: `${p.toFixed(2)} in/hr (Mod)` };
      return { color: '#94a3b8', fill: '#94a3b8', radius: 20000, label: 'Clear' };
    }

    // Default: 'risk' layer
    const w = pt.wind_speed_mph || 0;
    const r = pt.precipitation_in_hr || 0;
    const s = pt.snowfall_in_hr || 0;
    if (w >= 55 || r > 1.0 || s > 3.0) return { color: '#450a0a', fill: '#450a0a', radius: 45000, label: 'No Travel Hazard' };
    if (w >= 45 || r >= 0.5 || s >= 2.0) return { color: '#ef4444', fill: '#ef4444', radius: 40000, label: 'Severe Conditions' };
    if (w >= 35 || r >= 0.25 || s >= 1.0) return { color: '#f97316', fill: '#f97316', radius: 35000, label: 'High Risk' };
    if (w >= 25 || r >= 0.1 || s >= 0.5) return { color: '#f59e0b', fill: '#f59e0b', radius: 30000, label: 'Moderate' };
    return { color: '#10b981', fill: '#10b981', radius: 25000, label: 'Optimal' };
  };

  return (
    <div className="w-full h-full min-h-[480px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative bg-slate-950">
      <MapContainer
        center={[39.8283, -98.5795]}
        zoom={4}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* Dark Modern CartoDB Map Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> & OpenStreetMap contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {bounds && <MapBoundsUpdater bounds={bounds} />}

        {/* 1. Trip Corridor Weather Heatmap Layer */}
        {activeLayer !== 'none' &&
          currentCorridorPoints.map((pt, idx) => {
            const { color, fill, radius, label } = getHeatmapColorAndRadius(pt);
            return (
              <Circle
                key={`heatmap-${idx}-${forecastHour}`}
                center={[pt.lat, pt.lon]}
                radius={radius}
                pathOptions={{
                  color: color,
                  fillColor: fill,
                  fillOpacity: 0.25,
                  weight: 1,
                  opacity: 0.4,
                }}
              >
                <Popup className="custom-popup">
                  <div className="text-xs p-1">
                    <div className="font-bold text-slate-100 flex items-center space-x-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                      <span>Corridor Weather (T+{forecastHour}h)</span>
                    </div>
                    <div className="mt-1 text-slate-300">
                      Intensity: <strong className="text-emerald-400">{label}</strong>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Wind: {pt.wind_speed_mph} mph | Precip: {pt.precipitation_in_hr} in/hr
                    </div>
                  </div>
                </Popup>
              </Circle>
            );
          })}

        {/* 2. Candidate Route Polylines */}
        {routes.map((route) => {
          const isSelected = route.id === selectedRoute?.id;
          const isRecommended = route.is_recommended;

          // Distinct color theme for routes
          let strokeColor = '#64748b'; // Slate gray for inactive
          if (isSelected) {
            strokeColor = isRecommended ? '#10b981' : '#38bdf8'; // Emerald for rec, Cyan for other selected
          } else if (isRecommended) {
            strokeColor = '#059669'; // Dimmer emerald
          }

          return (
            <Polyline
              key={route.id}
              positions={route.polyline}
              pathOptions={{
                color: strokeColor,
                weight: isSelected ? 6 : 3.5,
                opacity: isSelected ? 0.95 : 0.45,
                dashArray: !isSelected && !isRecommended ? '4, 6' : undefined,
              }}
              eventHandlers={{
                click: () => onSelectRoute(route.id),
              }}
            >
              <Popup className="custom-popup">
                <div className="text-xs p-1">
                  <div className="font-bold text-white flex items-center space-x-1.5">
                    {isRecommended && <span className="text-emerald-400">★ RECOMMENDED</span>}
                    <span>{route.name}</span>
                  </div>
                  <div className="mt-1 text-slate-300">
                    {route.distance_miles} miles | {route.duration_hours} hours
                  </div>
                  <div className="text-emerald-400 font-semibold mt-0.5">
                    Avg Risk Score: {route.average_risk_score} / 5.0
                  </div>
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {/* 3. Sampled Checkpoints along selected route */}
        {selectedRoute?.checkpoints?.map((cp) => {
          const riskColor = cp.risk?.color || '#10b981';
          const isHazardous = cp.risk?.overall_level === 'Severe' || cp.risk?.overall_level === 'No Travel';

          return (
            <CircleMarker
              key={`cp-${cp.index}`}
              center={[cp.latitude, cp.longitude]}
              radius={isHazardous ? 7 : 5}
              pathOptions={{
                color: '#ffffff',
                fillColor: riskColor,
                fillOpacity: 0.95,
                weight: isHazardous ? 2.5 : 1.5,
              }}
            >
              <Popup className="custom-popup">
                <div className="p-1 space-y-2 text-xs min-w-[220px]">
                  {/* Header: Checkpoint Index and ETA */}
                  <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5">
                    <span className="font-bold text-white">
                      Checkpoint #{cp.index + 1}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-blue-400" />
                      <span>ETA: {cp.eta_formatted}</span>
                    </span>
                  </div>

                  {/* Distance and Location */}
                  <div className="text-[11px] text-slate-300 flex items-center justify-between">
                    <span>Mile Marker: <strong>{cp.distance_from_origin_miles} mi</strong></span>
                    <span className="font-mono text-slate-400">(+{cp.eta_relative_hours}h)</span>
                  </div>

                  {/* Risk Level Badge */}
                  <div
                    className="p-1.5 rounded-lg font-bold flex items-center justify-between text-xs"
                    style={{
                      backgroundColor: `${riskColor}22`,
                      color: riskColor,
                      border: `1px solid ${riskColor}55`,
                    }}
                  >
                    <span className="flex items-center space-x-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Risk: {cp.risk?.overall_level}</span>
                    </span>
                    <span className="font-mono">{cp.risk?.overall_score?.toFixed(1)} / 5.0</span>
                  </div>

                  {/* Primary Reason / Trigger */}
                  <p className="text-[11px] text-slate-300 leading-tight bg-slate-900/80 p-1.5 rounded border border-slate-800">
                    {cp.risk?.primary_hazard}
                  </p>

                  {/* Weather Breakdown at Arrival Time */}
                  <div className="grid grid-cols-3 gap-1 pt-1 text-center text-[10px]">
                    <div className="bg-slate-900/60 p-1 rounded border border-slate-800">
                      <div className="text-slate-400 flex items-center justify-center space-x-0.5">
                        <Wind className="w-2.5 h-2.5 text-amber-400" />
                        <span>Wind</span>
                      </div>
                      <div className="font-bold text-slate-200 mt-0.5">
                        {cp.weather?.wind_speed_mph} mph
                      </div>
                    </div>

                    <div className="bg-slate-900/60 p-1 rounded border border-slate-800">
                      <div className="text-slate-400 flex items-center justify-center space-x-0.5">
                        <CloudRain className="w-2.5 h-2.5 text-blue-400" />
                        <span>Rain</span>
                      </div>
                      <div className="font-bold text-slate-200 mt-0.5">
                        {cp.weather?.precipitation_in_hr} in/h
                      </div>
                    </div>

                    <div className="bg-slate-900/60 p-1 rounded border border-slate-800">
                      <div className="text-slate-400 flex items-center justify-center space-x-0.5">
                        <Snowflake className="w-2.5 h-2.5 text-cyan-400" />
                        <span>Snow</span>
                      </div>
                      <div className="font-bold text-slate-200 mt-0.5">
                        {cp.weather?.snowfall_in_hr} in/h
                      </div>
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Floating Map Legend Indicator */}
      <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3 py-2 rounded-xl text-xs shadow-lg flex items-center space-x-3 pointer-events-auto">
        <span className="text-slate-400 font-semibold text-[11px]">Checkpoint Risk:</span>
        <div className="flex items-center space-x-2 text-[10px] font-mono">
          <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /><span>Low</span></span>
          <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /><span>Mod</span></span>
          <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" /><span>High</span></span>
          <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /><span>Severe</span></span>
          <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-950 border border-red-500 inline-block" /><span>No Travel</span></span>
        </div>
      </div>
    </div>
  );
}
