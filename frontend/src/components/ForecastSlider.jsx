import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Clock, Wind, CloudRain, ShieldAlert, EyeOff } from 'lucide-react';

export default function ForecastSlider({
  forecastHour,
  onChangeForecastHour,
  maxHours = 48,
  activeLayer,
  onChangeLayer,
  departureTimeStr,
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        onChangeForecastHour((prev) => {
          if (prev >= maxHours) {
            setIsPlaying(false);
            return 0;
          }
          return Math.min(maxHours, prev + 3);
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, maxHours, onChangeForecastHour]);

  const togglePlay = () => {
    if (forecastHour >= maxHours) {
      onChangeForecastHour(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // Formatted forecast target time
  const getDisplayTime = () => {
    try {
      const base = departureTimeStr ? new Date(departureTimeStr) : new Date();
      const target = new Date(base.getTime() + forecastHour * 3600 * 1000);
      return target.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return `+${forecastHour} hours`;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Trip Corridor 0–48h Forecast Slider
          </span>
          <span className="text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            T + {forecastHour} hrs
          </span>
        </div>

        <div className="text-xs font-medium text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
          Forecast Window: <strong className="text-white">{getDisplayTime()}</strong>
        </div>
      </div>

      {/* Slider & Transport Controls */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={togglePlay}
          className={`p-2 rounded-xl transition-all flex items-center justify-center ${
            isPlaying
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500'
          }`}
          title={isPlaying ? 'Pause corridor timeline' : 'Animate corridor timeline'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={() => {
            setIsPlaying(false);
            onChangeForecastHour(0);
          }}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          title="Reset to departure time (Hour 0)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="flex-1 relative">
          <input
            type="range"
            min="0"
            max={maxHours}
            step="1"
            value={forecastHour}
            onChange={(e) => {
              setIsPlaying(false);
              onChangeForecastHour(Number(e.target.value));
            }}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>Departure (0h)</span>
            <span>+12h</span>
            <span>+24h</span>
            <span>+36h</span>
            <span>+48h</span>
          </div>
        </div>
      </div>

      {/* Heatmap Layer Selectors */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Corridor Heatmap Overlay:
        </span>
        <div className="flex items-center space-x-1.5">
          {[
            { id: 'risk', label: 'Weather Risk', icon: ShieldAlert, color: 'text-red-400' },
            { id: 'wind', label: 'Wind Field', icon: Wind, color: 'text-amber-400' },
            { id: 'precip', label: 'Precip & Snow', icon: CloudRain, color: 'text-blue-400' },
            { id: 'none', label: 'Overlay Off', icon: EyeOff, color: 'text-slate-400' },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeLayer === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeLayer(item.id)}
                className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  active
                    ? 'bg-slate-800 text-white border border-emerald-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
