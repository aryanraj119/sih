import { useState, useEffect } from 'react';
import { getForecastData } from '../services/api';
import type { ForecastHorizon, DemandDataPoint } from '../types/energy';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Activity, ShieldAlert } from 'lucide-react';
import { ForecastHorizonSelector } from '../components/dashboard/ForecastHorizonSelector';
import { DataModeBadge } from '../components/dashboard/DataModeBadge';

export const ForecastPage = () => {
  const [activeHorizon, setActiveHorizon] = useState<ForecastHorizon>('day_ahead');
  const [data, setData] = useState<DemandDataPoint[]>([]);

  useEffect(() => {
    setData(getForecastData(activeHorizon));
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
            <DataModeBadge isDemoMode={true} />
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

      {/* Main Chart Container */}
      <div className="liquid-glass p-6 rounded-2xl border border-white/10 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Demand Curve & Probabilistic Confidence Bands</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Comparing OpenSTEF ML predictions, 95% confidence intervals, and actual SLDC historical load
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-cyan-400 inline-block"></span>
              <span className="text-gray-300">OpenSTEF Forecast</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-cyan-500/20 border border-cyan-500/40 inline-block rounded-xs"></span>
              <span className="text-gray-300">95% Confidence Band</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-400 border border-dashed border-emerald-400 inline-block"></span>
              <span className="text-gray-300">Actual Load (SLDC)</span>
            </div>
          </div>
        </div>

        {/* Recharts Composed Chart */}
        <div className="h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis
                dataKey="time"
                stroke="#9ca3af"
                tick={{ fontSize: 11 }}
                interval={activeHorizon === 'day_ahead' ? 3 : 2}
              />
              <YAxis
                stroke="#9ca3af"
                tick={{ fontSize: 11 }}
                domain={['auto', 'auto']}
                unit=" MW"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#f59e0b"
                tick={{ fontSize: 11 }}
                unit=" °C"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.85)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(8px)',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '15px' }} />

              {/* Confidence Interval Upper Band Area */}
              <Area
                type="monotone"
                dataKey="upperConfidence"
                stroke="none"
                fill="url(#confidenceGradient)"
                name="95% Upper Bound"
              />
              <Area
                type="monotone"
                dataKey="lowerConfidence"
                stroke="none"
                fill="none"
                name="95% Lower Bound"
              />

              {/* Predicted MW Line */}
              <Line
                type="monotone"
                dataKey="predictedMW"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={false}
                name="OpenSTEF Forecast (MW)"
              />

              {/* Actual MW Line */}
              <Line
                type="monotone"
                dataKey="actualMW"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#10b981' }}
                name="Actual SLDC Load (MW)"
              />

              {/* Temperature Line */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="temperature"
                stroke="#f59e0b"
                strokeWidth={1.5}
                dot={false}
                name="Temperature (°C)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

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
            <h3 className="text-base font-bold text-white mb-2">Model Telemetry</h3>
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

    </div>
  );
};
