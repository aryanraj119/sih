import { useState, useEffect } from 'react';
import { fetchDuckCurve } from '../services/api';
import type { DuckCurveDataPoint } from '../types/energy';
import { DataModeBadge } from '../components/dashboard/DataModeBadge';
import { LoadingState } from '../components/dashboard/LoadingState';
import { ErrorState } from '../components/dashboard/ErrorState';
import { Sun, Zap, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
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
  const [data, setData] = useState<DuckCurveDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchDuckCurve();
      if (response.data) {
        setData(response.data);
        setIsDemoMode(response.isDemoMode);
      }
      if (response.error) {
        setError(response.error);
      }
    } catch (err: any) {
      setError('Failed to fetch Duck Curve solar grid telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const maxSolar = data.length > 0 ? Math.max(...data.map((d) => d.solarGenerationMW ?? d.solarGeneration ?? 0)) : 0;
  const minNetLoad = data.length > 0 ? Math.min(...data.map((d) => d.netDemandMW)) : 0;
  const maxRampRate = data.length > 0 ? Math.max(...data.map((d) => d.rampRateMWPerMin ?? d.rampRateMWMin ?? 0)) : 0;

  return (
    <div className="w-full min-h-screen bg-black text-white px-4 md:px-8 lg:px-12 pt-8 pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              Solar Penetration & Net Load
            </div>
            <DataModeBadge isDemoMode={isDemoMode} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            24-Hour Duck Curve & Evening Ramp Telemetry
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Analyzing rooftop solar generation, net load trough ("Duck Belly"), and rapid evening ramping stress
          </p>
        </div>
      </div>

      {loading && <LoadingState message="Loading 24-hour Duck Curve telemetry..." className="mb-8" />}
      {error && !loading && <ErrorState message={error} onRetry={loadData} className="mb-8" />}

      {!loading && (
        <>
          {/* Key Solar & Net Load KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="liquid-glass p-4 rounded-xl border border-white/10">
              <div className="text-xs text-gray-400 font-medium flex items-center justify-between">
                <span>Peak Rooftop Solar</span>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-xl font-bold text-amber-400 mt-1">
                {maxSolar.toLocaleString()} <span className="text-xs text-gray-300 font-normal">MW</span>
              </div>
              <div className="text-[11px] text-gray-400 mt-1">Midday Bell Curve Peak (13:00)</div>
            </div>

            <div className="liquid-glass p-4 rounded-xl border border-white/10">
              <div className="text-xs text-gray-400 font-medium flex items-center justify-between">
                <span>Net Load Trough ("Duck Belly")</span>
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-xl font-bold text-cyan-400 mt-1">
                {minNetLoad.toLocaleString()} <span className="text-xs text-gray-300 font-normal">MW</span>
              </div>
              <div className="text-[11px] text-gray-400 mt-1">Formula: Net Load = Gross - Solar</div>
            </div>

            <div className="liquid-glass p-4 rounded-xl border border-white/10">
              <div className="text-xs text-gray-400 font-medium flex items-center justify-between">
                <span>Max Evening Ramp Rate</span>
                <Zap className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-xl font-bold text-amber-400 mt-1">
                +{maxRampRate} <span className="text-xs text-gray-300 font-normal">MW/min</span>
              </div>
              <div className="text-[11px] text-amber-300 mt-1">17:30 - 20:30 Solar Decline</div>
            </div>

            <div className="liquid-glass p-4 rounded-xl border border-white/10">
              <div className="text-xs text-gray-400 font-medium flex items-center justify-between">
                <span>Ramp Duration</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xl font-bold text-white mt-1">3.5 Hours</div>
              <div className="text-[11px] text-emerald-400 mt-1">BESS & Hydro Pre-Scheduled</div>
            </div>
          </div>

          {/* Main 24-Hour Duck Curve Chart */}
          <div className="liquid-glass p-6 rounded-2xl border border-white/10 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">24-Hour Duck Curve & Net Load Profile</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Visualizing Gross Demand, Rooftop Solar Output, Net Grid Load, and Evening Ramp Rate
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
                <ComposedChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                  <defs>
                    <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="hourLabel" stroke="#9ca3af" tick={{ fontSize: 11 }} />
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
                    dataKey="solarGenerationMW"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fill="url(#solarGradient)"
                    name="Rooftop Solar Generation (MW)"
                  />

                  {/* Gross Demand Line */}
                  <Line
                    type="monotone"
                    dataKey="grossDemandMW"
                    stroke="#9ca3af"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    dot={false}
                    name="Gross Electricity Demand (MW)"
                  />

                  {/* Net Load Line */}
                  <Line
                    type="monotone"
                    dataKey="netDemandMW"
                    stroke="#06b6d4"
                    strokeWidth={3.5}
                    dot={false}
                    name="Net Grid Demand (MW)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grid Advisory Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="liquid-glass p-5 rounded-2xl border border-white/10">
              <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Duck Curve Ramping Advisory
              </h3>
              <div className="space-y-3 text-xs text-gray-300">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="font-semibold text-white">Midday Minimum Net Load (13:00)</span>
                  <p className="text-gray-400 text-[11px] mt-0.5">
                    Net load drops to <strong>4,820 MW</strong> during peak solar generation. Thermal generators must back down to minimum technical limits.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="font-semibold text-white">Steep Evening Ramp (17:30 - 20:30)</span>
                  <p className="text-gray-400 text-[11px] mt-0.5">
                    Ramp rate reaches <strong>+{maxRampRate} MW/min</strong> as 950 MW solar generation collapses while evening residential AC load surges.
                  </p>
                </div>
              </div>
            </div>

            <div className="liquid-glass p-5 rounded-2xl border border-white/10">
              <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Grid Balancing Mitigation Strategy
              </h3>
              <div className="space-y-3 text-xs text-gray-300">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="font-semibold text-emerald-400">Battery Storage (BESS) Discharge</span>
                  <p className="text-gray-400 text-[11px] mt-0.5">
                    Dispatch 400 MWh utility-scale battery energy storage systems starting at 17:45 to absorb initial ramp shock.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="font-semibold text-emerald-400">Northern Regional Hydro Ramp</span>
                  <p className="text-gray-400 text-[11px] mt-0.5">
                    Request 800 MW flexible hydro power allocation from Tehri & NHPC stations during 18:30 peak ramp window.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};
