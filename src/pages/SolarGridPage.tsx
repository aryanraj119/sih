import { useState, useEffect } from 'react';
import { fetchSolarGridSummary, fetchDuckCurveData } from '../services/api/solar';
import type { SolarGridSummaryData, DuckCurveResponse } from '../services/api/solar';
import type { ForecastHorizon } from '../types/energy';
import { ForecastHorizonSelector } from '../components/dashboard/ForecastHorizonSelector';
import { DataModeBadge } from '../components/dashboard/DataModeBadge';
import { LoadingState } from '../components/dashboard/LoadingState';
import { ErrorState } from '../components/dashboard/ErrorState';
import { Sun, Zap, AlertTriangle, Activity, Compass, ShieldAlert } from 'lucide-react';
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

export const SolarGridPage = () => {
  const [horizon, setHorizon] = useState<ForecastHorizon>('day_ahead');
  const [summary, setSummary] = useState<SolarGridSummaryData | null>(null);
  const [duckData, setDuckData] = useState<DuckCurveResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  const loadData = async (selectedHorizon: ForecastHorizon) => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, duckRes] = await Promise.all([
        fetchSolarGridSummary(selectedHorizon),
        fetchDuckCurveData(selectedHorizon),
      ]);

      if (summaryRes.data) {
        setSummary(summaryRes.data);
        setIsDemoMode(summaryRes.isDemoMode);
      }
      if (duckRes.data) {
        setDuckData(duckRes.data);
      }

      if (summaryRes.error) {
        setError(summaryRes.error);
      }
    } catch (err: any) {
      setError('Failed to fetch Solar & Grid intelligence telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(horizon);
  }, [horizon]);

  const regionalSolarData = [
    { region_id: 'south', name: 'South Delhi', discom: 'BRPL', solarMW: 220, demandMW: 1820, netLoadMW: 1600, penetrationPct: 12.1 },
    { region_id: 'north', name: 'North Delhi', discom: 'TPDDL', solarMW: 150, demandMW: 1150, netLoadMW: 1000, penetrationPct: 13.0 },
    { region_id: 'west', name: 'West Delhi', discom: 'BRPL', solarMW: 140, demandMW: 1420, netLoadMW: 1280, penetrationPct: 9.8 },
    { region_id: 'south_west', name: 'South-West Delhi', discom: 'BRPL', solarMW: 120, demandMW: 1250, netLoadMW: 1130, penetrationPct: 9.6 },
    { region_id: 'north_west', name: 'North-West Delhi', discom: 'TPDDL', solarMW: 110, demandMW: 1000, netLoadMW: 890, penetrationPct: 11.0 },
    { region_id: 'south_east', name: 'South-East Delhi', discom: 'BRPL', solarMW: 80, demandMW: 880, netLoadMW: 800, penetrationPct: 9.1 },
    { region_id: 'central', name: 'Central Delhi', discom: 'BYPL', solarMW: 60, demandMW: 640, netLoadMW: 580, penetrationPct: 9.4 },
    { region_id: 'east', name: 'East Delhi', discom: 'BYPL', solarMW: 50, demandMW: 600, netLoadMW: 550, penetrationPct: 8.3 },
    { region_id: 'north_east', name: 'North-East Delhi', discom: 'BYPL', solarMW: 40, demandMW: 580, netLoadMW: 540, penetrationPct: 6.9 },
  ];

  return (
    <div className="w-full min-h-screen bg-black text-white px-4 md:px-8 lg:px-12 pt-8 pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              Solar & Grid Intelligence
            </div>
            <DataModeBadge isDemoMode={isDemoMode} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Delhi 24-Hour Duck Curve & Grid Stress Telemetry
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Modeled rooftop solar generation, net load trough ("Duck Belly"), and rapid evening ramp rates
          </p>
        </div>
      </div>

      {/* Horizon Selector */}
      <div className="mb-8">
        <ForecastHorizonSelector selectedHorizon={horizon} onChange={setHorizon} />
      </div>

      {loading && <LoadingState message="Connecting to Solar & Grid Net Load engine..." className="mb-8" />}
      {error && !loading && <ErrorState message={error} onRetry={() => loadData(horizon)} className="mb-8" />}

      {!loading && summary && duckData && (
        <>
          {/* Main KPI Cards Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            <div className="liquid-glass p-3.5 rounded-xl border border-white/10">
              <div className="text-[10px] text-gray-400 font-medium flex items-center justify-between">
                <span>Gross Demand</span>
                <Activity className="w-3 h-3 text-cyan-400" />
              </div>
              <div className="text-lg font-bold text-white mt-1">
                {summary.current_demand_mw.toLocaleString()} <span className="text-xs font-normal">MW</span>
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">SLDC Total Load</div>
            </div>

            <div className="liquid-glass p-3.5 rounded-xl border border-white/10">
              <div className="text-[10px] text-gray-400 font-medium flex items-center justify-between">
                <span>Rooftop Solar</span>
                <Sun className="w-3 h-3 text-amber-400" />
              </div>
              <div className="text-lg font-bold text-amber-400 mt-1">
                {summary.current_solar_mw.toLocaleString()} <span className="text-xs font-normal">MW</span>
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">Peak Output</div>
            </div>

            <div className="liquid-glass p-3.5 rounded-xl border border-white/10">
              <div className="text-[10px] text-gray-400 font-medium flex items-center justify-between">
                <span>Net Grid Load</span>
                <Zap className="w-3 h-3 text-cyan-400" />
              </div>
              <div className="text-lg font-bold text-cyan-300 mt-1">
                {summary.current_net_load_mw.toLocaleString()} <span className="text-xs font-normal">MW</span>
              </div>
              <div className="text-[10px] text-cyan-400 mt-0.5">Formula: Demand - Solar</div>
            </div>

            <div className="liquid-glass p-3.5 rounded-xl border border-white/10">
              <div className="text-[10px] text-gray-400 font-medium flex items-center justify-between">
                <span>Solar Penetration</span>
                <Compass className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="text-lg font-bold text-emerald-400 mt-1">
                {summary.solar_penetration_percent} %
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">Instantaneous Ratio</div>
            </div>

            <div className="liquid-glass p-3.5 rounded-xl border border-white/10">
              <div className="text-[10px] text-gray-400 font-medium flex items-center justify-between">
                <span>Max Evening Ramp</span>
                <AlertTriangle className="w-3 h-3 text-amber-400" />
              </div>
              <div className="text-lg font-bold text-amber-400 mt-1">
                +{summary.maximum_evening_ramp_mw_per_hour.toLocaleString()} <span className="text-xs font-normal">MW/h</span>
              </div>
              <div className="text-[10px] text-amber-300 mt-0.5">+45.2 MW/min Rate</div>
            </div>

            <div className="liquid-glass p-3.5 rounded-xl border border-rose-500/30 bg-rose-950/20">
              <div className="text-[10px] text-rose-300 font-medium flex items-center justify-between">
                <span>Grid Stress Score</span>
                <ShieldAlert className="w-3 h-3 text-rose-400" />
              </div>
              <div className="text-lg font-bold text-rose-400 mt-1">
                {summary.grid_stress_score} <span className="text-xs font-normal">({summary.grid_stress_level})</span>
              </div>
              <div className="text-[10px] text-rose-300 mt-0.5">URJADRISHTI Score</div>
            </div>
          </div>

          {/* Main 24-Hour Duck Curve Chart */}
          <div className="liquid-glass p-6 rounded-2xl border border-white/10 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">24-Hour Duck Curve & Net Load Profile</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Gross Demand, Rooftop Solar Output, and Net Grid Load curve ({horizon.replace('_', ' ').toUpperCase()})
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-gray-400 inline-block"></span>
                  <span className="text-gray-300">Gross Demand</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-amber-400 inline-block"></span>
                  <span className="text-amber-300">Solar Generation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-cyan-400 inline-block"></span>
                  <span className="text-cyan-300">Net Load (Demand - Solar)</span>
                </div>
              </div>
            </div>

            <div className="h-[420px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={duckData.points} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                  <defs>
                    <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="time_label" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} domain={['auto', 'auto']} unit=" MW" />
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

                  {/* Solar Bell Curve Area */}
                  <Area
                    type="monotone"
                    dataKey="solar_generation_mw"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fill="url(#solarGradient)"
                    name="Rooftop Solar Generation (MW)"
                  />

                  {/* Gross Demand Line */}
                  <Line
                    type="monotone"
                    dataKey="gross_demand_mw"
                    stroke="#9ca3af"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    dot={false}
                    name="Gross Electricity Demand (MW)"
                  />

                  {/* Net Load Line */}
                  <Line
                    type="monotone"
                    dataKey="net_load_mw"
                    stroke="#06b6d4"
                    strokeWidth={3.5}
                    dot={false}
                    name="Net Grid Demand (MW)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Evening Ramp Panel & Grid Stress Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            
            {/* Left Col: Evening Ramp Panel */}
            <div className="liquid-glass p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  Evening Ramp Rate Analysis
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-gray-400 text-[10px]">Ramp Start Time</span>
                    <div className="font-bold text-white text-base mt-0.5">{duckData.evening_ramp_start}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-gray-400 text-[10px]">Ramp End Time</span>
                    <div className="font-bold text-white text-base mt-0.5">{duckData.evening_ramp_end}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-gray-400 text-[10px]">Maximum Evening Ramp</span>
                    <div className="font-bold text-amber-400 text-base mt-0.5">+{duckData.maximum_evening_ramp_mw_per_hour} MW/h</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-gray-400 text-[10px]">Ramp Duration</span>
                    <div className="font-bold text-emerald-400 text-base mt-0.5">3.5 Hours</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs text-gray-300">
                  <span className="font-semibold text-amber-300">EVENING NET-LOAD RAMP (+{duckData.maximum_evening_ramp_mw_per_hour} MW/h):</span>
                  <p className="text-[11px] mt-1 text-gray-300 leading-relaxed">
                    Solar collapse between 17:30 and 20:30 requires pre-scheduling fast-responding BESS battery storage and flexible hydro generation.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Col: Grid Stress Panel */}
            <div className="liquid-glass p-6 rounded-2xl border border-rose-500/30 bg-rose-950/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-400" />
                    URJADRISHTI Grid Stress Engine
                  </h3>

                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-500/40">
                    Score: {summary.grid_stress_score} ({summary.grid_stress_level})
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4 text-xs">
                  <span className="font-bold text-white text-sm">Stress Rationale Explanation:</span>
                  <p className="text-gray-300 text-xs mt-1 leading-relaxed">{summary.grid_stress_explanation}</p>
                </div>

                <div className="space-y-2 text-xs">
                  <span className="font-semibold text-gray-400 uppercase text-[10px]">Primary Stress Contributors:</span>
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex justify-between">
                    <span>Evening Ramp Rate (+2,712 MW/h)</span>
                    <strong className="text-amber-400">35.0 / 35 Points</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex justify-between">
                    <span>Forecast Peak Load (7,820 MW)</span>
                    <strong className="text-emerald-400">31.3 / 40 Points</strong>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Solar Insights Panel */}
          <div className="liquid-glass p-6 rounded-2xl border border-white/10 mb-8">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-400" />
              Solar Generation Insights
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-gray-400 text-[10px]">Peak Solar Output</span>
                <div className="text-xl font-bold text-amber-400 mt-1">{duckData.solar_peak_mw} MW</div>
                <div className="text-[10px] text-gray-400 mt-0.5">Peak Time: {duckData.solar_peak_time}</div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-gray-400 text-[10px]">Net Load Trough ("Duck Belly")</span>
                <div className="text-xl font-bold text-cyan-400 mt-1">{duckData.net_load_minimum_mw} MW</div>
                <div className="text-[10px] text-gray-400 mt-0.5">Trough Time: {duckData.net_load_minimum_time}</div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-gray-400 text-[10px]">Solar Generation Decline Window</span>
                <div className="text-xl font-bold text-white mt-1">15:00 - 18:30</div>
                <div className="text-[10px] text-amber-300 mt-0.5">Collapse Window</div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-gray-400 text-[10px]">Indicative Curtailment Pressure</span>
                <div className="text-xl font-bold text-emerald-400 mt-1">{summary.potential_solar_surplus_mw} MW</div>
                <div className="text-[10px] text-emerald-400 mt-0.5">Potential Surplus: 0 MW</div>
              </div>
            </div>
          </div>

          {/* Regional Solar Map & Breakdown Table */}
          <div className="liquid-glass p-6 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Regional Solar Generation & Penetration Breakdown</h3>
                <p className="text-xs text-gray-400">Rooftop solar distribution across 9 Delhi analytical regions</p>
              </div>

              <span className="text-xs font-semibold text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/30">
                9 Regions
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-3 font-semibold">Region Name</th>
                    <th className="pb-3 font-semibold">DISCOM</th>
                    <th className="pb-3 font-semibold">Gross Demand</th>
                    <th className="pb-3 font-semibold">Solar Generation</th>
                    <th className="pb-3 font-semibold">Net Grid Load</th>
                    <th className="pb-3 font-semibold">Solar Penetration %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {regionalSolarData.map((row) => (
                    <tr key={row.region_id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 font-bold text-white">{row.name}</td>
                      <td className="py-3 text-cyan-400 font-mono">{row.discom}</td>
                      <td className="py-3 font-semibold">{row.demandMW.toLocaleString()} MW</td>
                      <td className="py-3 text-amber-400 font-bold">{row.solarMW} MW</td>
                      <td className="py-3 text-cyan-300 font-bold">{row.netLoadMW.toLocaleString()} MW</td>
                      <td className="py-3 font-mono font-bold text-emerald-400">{row.penetrationPct} %</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
};
