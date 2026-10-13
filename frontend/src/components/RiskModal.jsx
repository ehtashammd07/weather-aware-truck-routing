import React from 'react';
import { X, ShieldAlert, Scale, CheckCircle2, AlertOctagon } from 'lucide-react';

export default function RiskModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Weather Risk & Load Evaluation Rubric</h2>
            <p className="text-xs text-slate-400">Official classification thresholds and vehicle weight escalation rules</p>
          </div>
        </div>

        {/* 1. Thresholds Table */}
        <div className="space-y-3 mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            1. Weather Classification Thresholds
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Condition</th>
                  <th className="py-2.5 px-3 text-emerald-400">Low</th>
                  <th className="py-2.5 px-3 text-amber-400">Moderate</th>
                  <th className="py-2.5 px-3 text-orange-400">High</th>
                  <th className="py-2.5 px-3 text-red-400">Severe</th>
                  <th className="py-2.5 px-3 text-rose-500">No Travel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-sans font-medium text-slate-200">Wind</td>
                  <td className="py-2 px-3">&lt;25 mph</td>
                  <td className="py-2 px-3">25–34 mph</td>
                  <td className="py-2 px-3">35–44 mph</td>
                  <td className="py-2 px-3">45–54 mph</td>
                  <td className="py-2 px-3 font-bold text-red-400">≥55 mph</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-sans font-medium text-slate-200">Rain</td>
                  <td className="py-2 px-3">&lt;0.10 in/hr</td>
                  <td className="py-2 px-3">0.10–0.25 in/hr</td>
                  <td className="py-2 px-3">0.25–0.50 in/hr</td>
                  <td className="py-2 px-3">0.50–1.00 in/hr</td>
                  <td className="py-2 px-3 font-bold text-red-400">&gt;1.00 in/hr</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-sans font-medium text-slate-200">Snow</td>
                  <td className="py-2 px-3">&lt;0.5 in/hr</td>
                  <td className="py-2 px-3">0.5–1.0 in/hr</td>
                  <td className="py-2 px-3">1.0–2.0 in/hr</td>
                  <td className="py-2 px-3">2.0–3.0 in/hr</td>
                  <td className="py-2 px-3 font-bold text-red-400">&gt;3.0 in/hr</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Load Weight Escalations */}
        <div className="space-y-3 mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
            <Scale className="w-4 h-4 text-amber-400" />
            <span>2. Truck Load Rules (Wind Hazard Escalations)</span>
          </h3>
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-2.5">
              <AlertOctagon className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-red-400">≥55 mph</span>
                <span className="text-slate-300"> ➔ </span>
                <span className="font-semibold text-white">No Travel for any load</span>
                <div className="text-[11px] text-slate-400 mt-0.5">Absolute hard barrier regardless of trailer weight due to imminent rollover risk.</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-2.5">
              <AlertOctagon className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-rose-300">45–54 mph + &gt;30,000 lb</span>
                <span className="text-slate-300"> ➔ </span>
                <span className="font-semibold text-white">No Travel</span>
                <div className="text-[11px] text-slate-400 mt-0.5">Normally classified as Severe, but heavy cross-sectional momentum triggers No Travel.</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-2.5">
              <AlertOctagon className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-orange-300">35–44 mph + &gt;40,000 lb</span>
                <span className="text-slate-300"> ➔ </span>
                <span className="font-semibold text-white">Severe</span>
                <div className="text-[11px] text-slate-400 mt-0.5">Normally classified as High, but heavy payload requires reduced highway speed and severe vigilance.</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Recommendation Preference Order */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            3. Route Recommendation Preference Hierarchy
          </h3>
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>1. Fewest Severe miles (and No Travel miles)</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
              <span>2. Fewest High miles</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
              <span>3. Lowest average risk index</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
              <span>4. Shortest travel time</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
