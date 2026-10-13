import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import TripInputForm from './components/TripInputForm';
import RouteMap from './components/RouteMap';
import RouteCardList from './components/RouteCardList';
import ForecastSlider from './components/ForecastSlider';
import WeatherProfileChart from './components/WeatherProfileChart';
import RiskModal from './components/RiskModal';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [corridorHeatmap, setCorridorHeatmap] = useState(null);
  const [departureTimeStr, setDepartureTimeStr] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [forecastHour, setForecastHour] = useState(0);
  const [activeLayer, setActiveLayer] = useState('risk');
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || '';

  // Fetch routes from Django backend API
  const handleCalculateRoutes = async (params) => {
    setIsLoading(true);
    setError(null);
    setDepartureTimeStr(params.departure_time);

    try {
      const response = await fetch(`${API_BASE}/api/calculate-routes/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      setRoutes(data.routes || []);
      setCorridorHeatmap(data.corridor_heatmap || null);

      // Default select the recommended route (Rank 1)
      if (data.routes && data.routes.length > 0) {
        setSelectedRouteId(data.routes[0].id);
      }
    } catch (err) {
      console.error('Error calculating routes:', err);
      setError(err.message || 'Failed to calculate routes. Check backend server connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load: calculate default scenario
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);

    handleCalculateRoutes({
      origin: { name: 'Chicago, IL', lat: 41.8781, lon: -87.6298 },
      destination: { name: 'Denver, CO', lat: 39.7392, lon: -104.9903 },
      departure_time: tomorrow.toISOString(),
      load_weight_lbs: 42000,
      sampling_interval_miles: 25,
    });
  }, []);

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        onOpenRulesModal={() => setIsRulesModalOpen(true)}
        isCalculating={isLoading}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* Error notification banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-200 font-semibold underline ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Input Form & Evaluated Route Cards */}
          <div className="lg:col-span-5 space-y-5">
            <TripInputForm
              onSubmit={handleCalculateRoutes}
              isLoading={isLoading}
            />

            <RouteCardList
              routes={routes}
              selectedRouteId={selectedRouteId}
              onSelectRoute={setSelectedRouteId}
            />
          </div>

          {/* Right Column: Forecast Slider, Interactive Map & Elevation Chart */}
          <div className="lg:col-span-7 space-y-4">
            {/* 0-48 Hour Forecast Slider with play/pause and layer controls */}
            <ForecastSlider
              forecastHour={forecastHour}
              onChangeForecastHour={setForecastHour}
              maxHours={48}
              activeLayer={activeLayer}
              onChangeLayer={setActiveLayer}
              departureTimeStr={departureTimeStr}
            />

            {/* Interactive Map */}
            <div className="h-[480px]">
              <RouteMap
                routes={routes}
                selectedRouteId={selectedRouteId}
                onSelectRoute={setSelectedRouteId}
                forecastHour={forecastHour}
                corridorHeatmap={corridorHeatmap}
                activeLayer={activeLayer}
              />
            </div>

            {/* Weather & Hazard Profile Curve */}
            {selectedRoute && (
              <WeatherProfileChart route={selectedRoute} />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        Weather-Aware Heavy Truck Routing System &copy; Spotter Engineering Assignment
      </footer>

      {/* Rules & Rubric Explanation Modal */}
      <RiskModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />
    </div>
  );
}
