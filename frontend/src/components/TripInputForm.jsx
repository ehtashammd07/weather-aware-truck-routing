import React, { useState } from 'react';
import { MapPin, Calendar, Scale, Gauge, Navigation, Sparkles, AlertTriangle } from 'lucide-react';

const PRESETS = [
  {
    label: 'Chicago ➔ Denver',
    subtitle: 'High Plains Crosswind Corridor',
    origin: { name: 'Chicago, IL', lat: 41.8781, lon: -87.6298 },
    destination: { name: 'Denver, CO', lat: 39.7392, lon: -104.9903 },
    weight: 42000,
    interval: 25,
  },
  {
    label: 'Dallas ➔ Atlanta',
    subtitle: 'Southern Heavy Rain Corridor',
    origin: { name: 'Dallas, TX', lat: 32.7767, lon: -96.7970 },
    destination: { name: 'Atlanta, GA', lat: 33.7490, lon: -84.3880 },
    weight: 35000,
    interval: 25,
  },
  {
    label: 'Seattle ➔ Salt Lake City',
    subtitle: 'Rockies Mountain Snow Pass',
    origin: { name: 'Seattle, WA', lat: 47.6062, lon: -122.3321 },
    destination: { name: 'Salt Lake City, UT', lat: 40.7608, lon: -111.8910 },
    weight: 45000,
    interval: 25,
  },
];

export default function TripInputForm({ onSubmit, isLoading }) {
  const [originName, setOriginName] = useState('Chicago, IL');
  const [originCoords, setOriginCoords] = useState({ lat: 41.8781, lon: -87.6298 });

  const [destName, setDestName] = useState('Denver, CO');
  const [destCoords, setDestCoords] = useState({ lat: 39.7392, lon: -104.9903 });

  // Default departure: tomorrow at 08:00 AM local
  const getDefaultDateTime = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(8, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const [departureTime, setDepartureTime] = useState(getDefaultDateTime());
  const [loadWeight, setLoadWeight] = useState(42000);
  const [samplingInterval, setSamplingInterval] = useState(25);

  const applyPreset = (preset) => {
    setOriginName(preset.origin.name);
    setOriginCoords(preset.origin);
    setDestName(preset.destination.name);
    setDestCoords(preset.destination);
    setLoadWeight(preset.weight);
    setSamplingInterval(preset.interval);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      origin: { name: originName, ...originCoords },
      destination: { name: destName, ...destCoords },
      departure_time: new Date(departureTime).toISOString(),
      load_weight_lbs: Number(loadWeight),
      sampling_interval_miles: Number(samplingInterval),
    });
  };

  // Determine active load rules triggered by weight
  const isOver30k = loadWeight > 30000;
  const isOver40k = loadWeight > 40000;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
        <div>
          <h2 className="text-sm font-bold tracking-wider text-slate-200 uppercase flex items-center space-x-2">
            <Navigation className="w-4 h-4 text-emerald-400" />
            <span>Trip Dispatch Parameters</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Define origin, freight load, and checkpoint sampling</p>
        </div>
      </div>

      {/* Preset Corridor Shortcuts */}
      <div className="mb-4">
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick Scenario Presets</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(p)}
              className="text-left p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/50 transition-all group"
            >
              <div className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">
                {p.label}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 truncate">{p.subtitle}</div>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Origin & Destination Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Origin</span>
            </label>
            <input
              type="text"
              value={originName}
              onChange={(e) => setOriginName(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder="e.g. Chicago, IL"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-red-400" />
              <span>Destination</span>
            </label>
            <input
              type="text"
              value={destName}
              onChange={(e) => setDestName(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder="e.g. Denver, CO"
            />
          </div>
        </div>

        {/* Departure Time & Sampling Interval */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>Departure Date & Time</span>
            </label>
            <input
              type="datetime-local"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <Gauge className="w-3.5 h-3.5 text-purple-400" />
                <span>Weather Sampling</span>
              </span>
              <span className="text-[10px] text-slate-400">Spec: 10 / 25 / 50 mi</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {[10, 25, 50].map((interval) => (
                <button
                  key={interval}
                  type="button"
                  onClick={() => setSamplingInterval(interval)}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    samplingInterval === interval
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {interval} miles
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Load Weight Slider & Rule Feedback */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-300 flex items-center space-x-1.5">
              <Scale className="w-4 h-4 text-amber-400" />
              <span>Truck Load Weight</span>
            </label>
            <span className="text-sm font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
              {Number(loadWeight).toLocaleString()} lbs
            </span>
          </div>

          <input
            type="range"
            min="10000"
            max="80000"
            step="1000"
            value={loadWeight}
            onChange={(e) => setLoadWeight(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />

          {/* Quick weight presets */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <button
              type="button"
              onClick={() => setLoadWeight(15000)}
              className="hover:text-emerald-400 transition"
            >
              Empty (15k)
            </button>
            <button
              type="button"
              onClick={() => setLoadWeight(32000)}
              className="hover:text-emerald-400 transition"
            >
              Medium (32k)
            </button>
            <button
              type="button"
              onClick={() => setLoadWeight(42000)}
              className="hover:text-emerald-400 transition"
            >
              Heavy (42k)
            </button>
            <button
              type="button"
              onClick={() => setLoadWeight(65000)}
              className="hover:text-emerald-400 transition"
            >
              Max Gross (65k)
            </button>
          </div>

          {/* Load Rules Trigger Alert */}
          {(isOver30k || isOver40k) && (
            <div className="mt-2 text-xs p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-[11px]">
                <div className="font-semibold text-amber-200">Active Load Rule Escalations:</div>
                {isOver30k && <div>• Wind 45–54 mph triggers <strong>No Travel</strong> (&gt;30,000 lbs)</div>}
                {isOver40k && <div>• Wind 35–44 mph escalates to <strong>Severe</strong> (&gt;40,000 lbs)</div>}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Analyzing Weather & Risk for 3 Routes...</span>
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />
              <span>Evaluate 3 Routes & Recommend Safest</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
