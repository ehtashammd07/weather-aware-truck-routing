import React from 'react';
import { Wind, CloudRain, ShieldCheck, AlertCircle } from 'lucide-react';

export default function WeatherProfileChart({ route }) {
  if (!route || !route.checkpoints || route.checkpoints.length === 0) return null;

  const checkpoints = route.checkpoints;
  const maxWind = Math.max(60, ...checkpoints.map((cp) => cp.weather?.wind_speed_mph || 0));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Wind className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Route Weather & Hazard Profile ({route.name})
          </h3>
        </div>
        <div className="text-[11px] text-slate-400">
          Showing wind speed & precip vs route mileage
        </div>
      </div>

      {/* SVG Weather Chart */}
      <div className="relative bg-slate-950 p-3 rounded-xl border border-slate-800/80">
        <svg viewBox="0 0 800 160" className="w-full h-36 overflow-visible">
          {/* Reference threshold lines */}
          {/* 55 mph No Travel */}
          <line x1="40" y1="20" x2="790" y2="20" stroke="#ef4444" strokeDasharray="3 3" strokeOpacity="0.4" />
          <text x="35" y="24" fill="#ef4444" fontSize="9" textAnchor="end" fontFamily="monospace">≥55mph</text>

          {/* 45 mph Severe */}
          <line x1="40" y1="45" x2="790" y2="45" stroke="#f97316" strokeDasharray="3 3" strokeOpacity="0.3" />
          <text x="35" y="49" fill="#f97316" fontSize="9" textAnchor="end" fontFamily="monospace">45mph</text>

          {/* 35 mph High */}
          <line x1="40" y1="70" x2="790" y2="70" stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity="0.3" />
          <text x="35" y="74" fill="#f59e0b" fontSize="9" textAnchor="end" fontFamily="monospace">35mph</text>

          {/* 25 mph Moderate */}
          <line x1="40" y1="95" x2="790" y2="95" stroke="#10b981" strokeDasharray="3 3" strokeOpacity="0.3" />
          <text x="35" y="99" fill="#10b981" fontSize="9" textAnchor="end" fontFamily="monospace">25mph</text>

          {/* Baseline */}
          <line x1="40" y1="130" x2="790" y2="130" stroke="#334155" strokeWidth="1" />

          {/* Points & Lines for Wind Speed */}
          {checkpoints.map((cp, idx) => {
            const x = 50 + (idx / (checkpoints.length - 1)) * 730;
            const wind = cp.weather?.wind_speed_mph || 0;
            // Map 0 - 65 mph to y: 130 -> 10
            const y = Math.max(10, 130 - (wind / 65) * 120);

            const precip = (cp.weather?.precipitation_in_hr || 0) + (cp.weather?.snowfall_in_hr || 0);
            const precipH = Math.min(40, precip * 35);

            const riskColor = cp.risk?.color || '#10b981';

            // Connect to previous point
            let prevLine = null;
            if (idx > 0) {
              const prevCp = checkpoints[idx - 1];
              const prevX = 50 + ((idx - 1) / (checkpoints.length - 1)) * 730;
              const prevWind = prevCp.weather?.wind_speed_mph || 0;
              const prevY = Math.max(10, 130 - (prevWind / 65) * 120);
              prevLine = (
                <line
                  key={`line-${idx}`}
                  x1={prevX}
                  y1={prevY}
                  x2={x}
                  y2={y}
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeOpacity="0.8"
                />
              );
            }

            return (
              <g key={`pt-${idx}`}>
                {prevLine}

                {/* Rain / Snow bar */}
                {precip > 0 && (
                  <rect
                    x={x - 2}
                    y={130 - precipH}
                    width={4}
                    height={precipH}
                    fill="#3b82f6"
                    opacity="0.6"
                    rx="1"
                  />
                )}

                {/* Wind data point with risk fill */}
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill={riskColor}
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />

                {/* Mileage label on every 4th point */}
                {idx % Math.max(1, Math.floor(checkpoints.length / 6)) === 0 && (
                  <text
                    x={x}
                    y="145"
                    fill="#94a3b8"
                    fontSize="9"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {cp.distance_from_origin_miles}m
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/80">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <span className="w-3 h-0.5 bg-sky-400 inline-block" />
              <span>Wind Curve (mph)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm inline-block" />
              <span>Rain/Snow Rate</span>
            </span>
          </div>
          <div className="font-mono text-slate-400">
            Total Route Checkpoints: {checkpoints.length}
          </div>
        </div>
      </div>
    </div>
  );
}
