import React from 'react';
import { Award, Clock, Compass, ShieldAlert, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react';

export default function RouteCardList({ routes, selectedRouteId, onSelectRoute }) {
  if (!routes || routes.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
          <Compass className="w-4 h-4 text-emerald-400" />
          <span>Evaluated Route Candidates ({routes.length} Options)</span>
        </h3>
        <span className="text-[11px] text-slate-500">Sorted by Safety & Travel Time Rubric</span>
      </div>

      <div className="space-y-3">
        {routes.map((route) => {
          const isSelected = selectedRouteId === route.id;
          const isRecommended = route.is_recommended;
          const riskMiles = route.risk_miles || {};
          const severeMiles = riskMiles['Severe'] || 0;
          const highMiles = riskMiles['High'] || 0;
          const moderateMiles = riskMiles['Moderate'] || 0;
          const lowMiles = riskMiles['Low'] || 0;
          const noTravelMiles = riskMiles['No Travel'] || 0;

          return (
            <div
              key={route.id}
              onClick={() => onSelectRoute(route.id)}
              className={`p-4 rounded-2xl cursor-pointer transition-all border relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-900/90 border-emerald-500 shadow-xl shadow-emerald-950/40 ring-1 ring-emerald-500'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              {/* Highlight ribbon for recommended route */}
              {isRecommended && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-500 to-teal-500 text-slate-950 text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-xl flex items-center space-x-1 shadow-md">
                  <Award className="w-3.5 h-3.5" />
                  <span>Recommended Route #1</span>
                </div>
              )}

              <div className="pr-24">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    {route.name}
                  </h4>
                  {!isRecommended && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      Rank #{route.recommendation_rank}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {route.recommendation_reason}
                </p>
              </div>

              {/* Core metrics row */}
              <div className="grid grid-cols-3 gap-2 my-3 text-center">
                <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] text-slate-400">Total Distance</div>
                  <div className="text-sm font-bold text-slate-100 font-mono mt-0.5">
                    {route.distance_miles.toLocaleString()} mi
                  </div>
                </div>

                <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 flex items-center justify-center space-x-0.5">
                    <Clock className="w-2.5 h-2.5 text-blue-400" />
                    <span>Travel Time</span>
                  </div>
                  <div className="text-sm font-bold text-slate-100 font-mono mt-0.5">
                    {route.duration_hours} hrs
                  </div>
                </div>

                <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] text-slate-400">Avg Risk Index</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                    {route.average_risk_score} / 5.0
                  </div>
                </div>
              </div>

              {/* Risk Miles Distribution Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">Weather Exposure Profile:</span>
                  <div className="flex items-center space-x-3 text-[10px] font-mono">
                    {noTravelMiles > 0 && (
                      <span className="text-red-300 font-bold">⛔ {noTravelMiles} mi No Travel</span>
                    )}
                    <span className="text-red-400">⚠️ {severeMiles} mi Severe</span>
                    <span className="text-orange-400">⚡ {highMiles} mi High</span>
                    <span className="text-emerald-400">✓ {lowMiles} mi Low</span>
                  </div>
                </div>

                {/* Progress bar visualizing distance in each risk tier */}
                <div className="w-full h-2 rounded-full bg-slate-950 flex overflow-hidden border border-slate-800">
                  {lowMiles > 0 && (
                    <div
                      style={{ width: `${(lowMiles / route.distance_miles) * 100}%` }}
                      className="bg-emerald-500 h-full"
                      title={`Low Risk: ${lowMiles} miles`}
                    />
                  )}
                  {moderateMiles > 0 && (
                    <div
                      style={{ width: `${(moderateMiles / route.distance_miles) * 100}%` }}
                      className="bg-amber-500 h-full"
                      title={`Moderate Risk: ${moderateMiles} miles`}
                    />
                  )}
                  {highMiles > 0 && (
                    <div
                      style={{ width: `${(highMiles / route.distance_miles) * 100}%` }}
                      className="bg-orange-500 h-full"
                      title={`High Risk: ${highMiles} miles`}
                    />
                  )}
                  {severeMiles > 0 && (
                    <div
                      style={{ width: `${(severeMiles / route.distance_miles) * 100}%` }}
                      className="bg-red-500 h-full"
                      title={`Severe Risk: ${severeMiles} miles`}
                    />
                  )}
                  {noTravelMiles > 0 && (
                    <div
                      style={{ width: `${(noTravelMiles / route.distance_miles) * 100}%` }}
                      className="bg-rose-950 h-full"
                      title={`No Travel: ${noTravelMiles} miles`}
                    />
                  )}
                </div>
              </div>

              {/* Active selection cue */}
              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  Sampled every {route.checkpoints ? Math.round(route.distance_miles / (route.checkpoints.length - 1)) : 25} mi ({route.checkpoints?.length || 0} checkpoints)
                </span>
                <span className={`font-semibold flex items-center space-x-1 ${
                  isSelected ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'
                }`}>
                  <span>{isSelected ? 'Viewing on Map' : 'Inspect Route'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
