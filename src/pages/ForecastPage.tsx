import { useState, useEffect } from 'react';
import { fetchForecast } from '../services/api';
import type { ForecastHorizon, DemandDataPoint } from '../types/energy';
import { ForecastHorizonSelector } from '../components/dashboard/ForecastHorizonSelector';
import { DataModeBadge } from '../components/dashboard/DataModeBadge';
import { ForecastChart } from '../components/dashboard/ForecastChart';
import { LoadingState } from '../components/dashboard/LoadingState';
import { ErrorState } from '../components/dashboard/ErrorState';
import { Activity, ShieldAlert, Cpu } from 'lucide-react';

export const ForecastPage = () => {
  const [activeHorizon, setActiveHorizon] = useState<ForecastHorizon>('day_ahead');
  const [data, setData] = useState<DemandDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  const loadData = async (horizon: ForecastHorizon) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchForecast(horizon);
      if (response.data) {
        setData(response.data);
        setIsDemoMode(response.isDemoMode);
      }
      if (response.error) {
        setError(response.error);
      }
    } catch (err: any) {
      setError('Failed to fetch forecasting telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(activeHorizon);
  }, [activeHorizon]);

  const maxDemand = data.length > 0 ? Math.max(...data.map((d) => d.predictedMW)) : 0;
  const avgDemand = data.length > 0 ? Math.round(data.reduce((acc, curr) => acc + curr.predictedMW, 0) / data.length) : 0;
  const peakTime = data.length > 0 ? data.reduce((prev, curr) => (curr.predictedMW > prev.predictedMW ? curr : prev)).time : '15:30';

  return (
    <div className="w-full min-h-screen bg-black text-white px-4 md:px-8 lg:px-12 pt-8 pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              AI Demand Engine
            </div>
            <DataModeBadge isDemoMode={isDemoMode} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Delhi Electricity Demand Forecasting
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Multi-horizon operational machine learning predictions powered by OpenSTEF and weather models
          </p>
        </div>
      </div>

      {/* Reusable Horizon Selector */}
      <div className="mb-8">
        <ForecastHorizonSelector selectedHorizon={activeHorizon} onChange={setActiveHorizon} />
      </div>

      {/* Loading & Error States */}
      {loading && <LoadingState message="Connecting to OpenSTEF forecasting service..." className="mb-8" />}
      {error && !loading && (
        <ErrorState message={error} onRetry={() => loadData(activeHorizon)} className="mb-8" />
      )}

      {!loading && (
        <>
          {/* Horizon-Specific Metric Cards Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {activeHorizon === 'short_term' && (
              <>
                <div className="liquid-glass p-4 rounded-xl border border-white/10">
                  <div className="text-xs text-gray-400 font-medium">Current Delhi Load</div>
                  <div className="text-xl font-bold text-white mt-1">6,485 MW</div>
                  <div className="text-[11px] text-emerald-400 mt-1">Live SLDC Telemetry</div>
                </div>
                <div className="liquid-glass p-4 rounded-xl border border-white/10">
                  <div className="text-xs text-gray-400 font-medium">Forecast Load (Next 1h)</div>
                  <div className="text-xl font-bold text-cyan-400 mt-1">6,720 MW</div>
                  <div className="text-[11px] text-gray-400 mt-1">+235 MW Delta</div>
                </div>
                <div className="liquid-glass p-4 rounded-xl border border-white/10">
                  <div className="text-xs text-gray-400 font-medium">Near-Term Peak</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">{maxDemand.toLocaleString()} MW</div>
                  <div className="text-[11px] text-gray-400 mt-1">Time: {peakTime}</div>
                </div>
                <div className="liquid-glass p-4 rounded-xl border border-white/10">
                  <div className="text-xs text-gray-400 font-medium">Max Ramp Rate</div>
                  <div className="text-xl font-bold text-amber-400 mt-1">+38.5 MW/min</div>
                  <div className="text-[11px] text-amber-300 mt-1">Moderate Evening Ramp</div>
                </div>
                <div className="liquid-glass p-4 rounded-xl border border-white/10">
                  <div className="text-xs text-gray-400 font-medium">Peak Exceedance Prob.</div>
                  <div className="text-xl font-bold text-white mt-1">12.4 %</div>
                  <div className="text-[11px] text-emerald-400 mt-1">P95 Grid Safe Margin</div>
                </div>
              </>
            )}

            {activeHorizon === 'day_ahead' && (
              <>
                <div className="liquid-glass p-4 rounded-xl border border-white/10">
                  <div className="text-xs text-gray-400 font-medium">Day-Ahead Peak Load</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">{maxDemand.toLocaleString()} MW</div>
                  <div className="text-[11px] text-cyan-400 mt-1">⭐ OpenSTEF Primary</div>
                </div>
                <div className="liquid-glass p-4 rounded-xl border border-white/10">
                  <div className="text-xs text-gray-400 font-medium">Peak Load Time</div>
                  <div className="text-xl font-bold text-white mt-1">{peakTime}</div>
                  <div className="text-[11px] text-gray-400 mt-1">Afternoon AC Surge</div>
                </div>
                <div className="liquid-glass p-4 rounded-xl border border-white/10">
                  <div className="text-xs text-gray-400 font-medium">7-Day Maximum Peak</div>
                  <div className="text-xl font-bold text-amber-400 mt-1">7,820 MW</div>
                  <div className="text-[11px] text-gray-400 mt-1">Expected on Friday</div>
                </div>
                <div className="liquid-glass p-4 rounded-xl border border-white/10">
                  <div className="text-xs text-gray-400 font-medium">Average Grid Demand</div>
                  <div className="text-xl font-bold text-cyan-400 mt-1">{avgDemand.toLocaleString()} MW</div>
                  <div className="text-[11px] text-gray-400 mt-1">Base Thermal Allocation</div>
                </div>
                <div className="liquid-glass p-4 rounded-xl border border-white/10">
                  <div className="text-xs text-gray-400 font-medium">Peak Probability</div>
                  <div className="text-xl font-bold text-white mt-1">94.8 %</div>
                  <div className="text-[11px] text-emerald-400 mt-1">OpenSTEF Confidence</div>
                </div>
              </>
            )}

            {activeHorizon === 'long_term' && (
              <>
                <div className="liquid-glass p-4 rounded-xl border border-white/10">
                  <div className="text-xs text-gray-400 font-medium">Current Baseline (2026)</div>
                  <div className="text-xl font-bold text-white mt-1">8,350 MW</div>
                  <div className="text-[11px] text-cyan-400 mt-1">Historical Summer Peak</div>
                </div>
                <div className="liquid-glass p-4 rounded-xl border border-white/10">
                  <div className="text-xs text-gray-400 font-medium">5-Year Projected Peak</div>
                  <div className="text-xl font-bold text-amber-400 mt-1">10,580 MW</div>
                  <div className="text-[11px] text-gray-400 mt-1">Target Year 2030</div>
                </div>
                <div className="liquid-glass p-4 rounded-xl border border-white/10">
                  <div className="text-xs text-gray-400 font-medium">5-Year Growth Rate</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">+6.2 % CAGR</div>
                  <div className="text-[11px] text-emerald-400 mt-1">Macro-Spatial Model</div>
                </div>
                <div className="liquid-glass p-4 rounded-xl border border-white/10">
                  <div className="text-xs text-gray-400 font-medium">Fastest Growing Zone</div>
                  <div className="text-xl font-bold text-cyan-400 mt-1">South Delhi</div>
                  <div className="text-[11px] text-gray-400 mt-1">BRPL DISCOM Corridor</div>
                </div>
                <div className="liquid-glass p-4 rounded-xl border border-white/10">
                  <div className="text-xs text-gray-400 font-medium">Projected EV Adoption</div>
                  <div className="text-xl font-bold text-white mt-1">26.0 %</div>
                  <div className="text-[11px] text-cyan-400 mt-1">Grid Charging Load</div>
                </div>
              </>
            )}
          </div>

          {/* Reusable Chart Component */}
          <ForecastChart
            data={data}
            title={
              activeHorizon === 'short_term'
                ? 'Intra-Day Demand & Ramp Prediction Curve'
                : activeHorizon === 'day_ahead'
                ? 'OpenSTEF Day-Ahead Demand & Confidence Bands (P10 - P90)'
                : '1 - 5 Year Zonal Demand Growth Trajectory (2026 - 2030)'
            }
            subtitle={
              activeHorizon === 'day_ahead'
                ? '⭐ Primary operational horizon comparing OpenSTEF LightGBM model, 95% uncertainty bounds, and actual SLDC load'
                : 'Intra-day load shifts, temperature correlation, and probability bands'
            }
            className="mb-8"
          />

          {/* Operational Ramping & Alert Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="liquid-glass p-5 rounded-2xl border border-white/10 lg:col-span-2">
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                Operational Ramp Rate & Dispatch Recommendations
              </h3>
              <div className="space-y-3 text-xs text-gray-300">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start justify-between">
                  <div>
                    <span className="font-semibold text-white">Evening Peak Ramp (17:30 - 20:30)</span>
                    <p className="text-gray-400 text-[11px] mt-0.5">
                      Predicted ramp rate of <strong>+38.5 MW/min</strong> as residential air conditioning peaks.
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 text-[10px]">
                    MODERATE RAMP
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start justify-between">
                  <div>
                    <span className="font-semibold text-white">Thermal Generation Commitment</span>
                    <p className="text-gray-400 text-[11px] mt-0.5">
                      Pre-schedule 1,200 MW gas turbine response capacity by 16:00 to prevent frequency dips below 49.95 Hz.
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 text-[10px]">
                    ACTION READY
                  </span>
                </div>
              </div>
            </div>

            {/* Model Telemetry Quick Glance */}
            <div className="liquid-glass p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-white">Model Telemetry</h3>
                  <Cpu className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-gray-400">Mean Absolute Error (MAE)</span>
                    <span className="font-bold text-cyan-400">84.2 MW</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-gray-400">MAPE Accuracy</span>
                    <span className="font-bold text-emerald-400">1.38 %</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-gray-400">Training Samples</span>
                    <span className="font-bold text-white">145,200</span>
                  </div>
                </div>
              </div>

              <a
                href="/model"
                className="mt-4 w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 text-center text-xs font-semibold text-white transition-colors block"
              >
                View Full Model Intelligence →
              </a>
            </div>
          </div>
        </>
      )}

    </div>
  );
};
