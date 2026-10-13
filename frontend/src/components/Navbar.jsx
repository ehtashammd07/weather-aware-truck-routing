import React from 'react';
import { Truck, ShieldAlert, CloudRain, Info, CheckCircle2 } from 'lucide-react';

export default function Navbar({ onOpenRulesModal, isCalculating }) {
  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 px-6 py-3.5 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight text-white">spotter</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Weather-Aware Router
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Intelligent Heavy Freight Route Optimizer & Risk Analyzer
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {isCalculating && (
            <div className="flex items-center space-x-2 text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg animate-pulse">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Sampling corridors & evaluating risk...</span>
            </div>
          )}

          <button
            onClick={onOpenRulesModal}
            className="flex items-center space-x-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-lg transition-all shadow-sm"
          >
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span>Risk & Load Rules</span>
          </button>

          <div className="hidden md:flex items-center space-x-1 text-xs text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800/80">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
            <span>OSRM + Open-Meteo Synced</span>
          </div>
        </div>
      </div>
    </header>
  );
}
