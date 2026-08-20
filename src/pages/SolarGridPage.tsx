import { useState, useEffect } from 'react';
import { fetchSolarGridSummary, fetchDuckCurveData } from '../services/api/solar';
import type { SolarGridSummaryData, DuckCurveResponse } from '../services/api/solar';
import type { ForecastHorizon } from '../types/energy';
import { useDate } from '../context/DateContext';
import { ForecastHorizonSelector } from '../components/dashboard/ForecastHorizonSelector';
import { DataModeBadge } from '../components/dashboard/DataModeBadge';
import { LoadingState } from '../components/dashboard/LoadingState';
import { ErrorState } from '../components/dashboard/ErrorState';
import { Sun, Compass, Calendar } from 'lucide-react';
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
  const { selectedDate } = useDate();
  const [horizon, setHorizon] = useState<ForecastHorizon>('day_ahead');
  const [summary, setSummary] = useState<SolarGridSummaryData | null>(null);
  const [duckData, setDuckData] = useState<DuckCurveResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  const loadData = async (selectedHorizon: ForecastHorizon, dateStr: string) => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, duckRes] = await Promise.all([
        fetchSolarGridSummary(selectedHorizon, dateStr),
        fetchDuckCurveData(selectedHorizon, dateStr),
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
      setError('Failed to fetch Solar & Grid Duck Curve telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(horizon, selectedDate);
  }, [horizon, selectedDate]);

  return (
    <div className="w-full min-h-screen bg-black text-white px-4 md:px-8 lg:px-12 pt-8 pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <Sun className="w-7 h-7 text-amber-400" />
              Solar Generation & Duck Curve Net Load Intelligence
            </h1>
            <DataModeBadge isDemoMode={isDemoMode} />
          </div>
          <p className="text-xs md:text-sm text-gray-400 mt-1 flex items-center gap-2">
            <span>Rooftop solar output, net load trough, and evening ramp rate analysis for Delhi Grid</span>
            <span className="bg-amber-950/80 text-amber-300 font-mono text-xs px-2 py-0.5 rounded border border-amber-500/40 font-bold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-yellow-300" /> {selectedDate}
            </span>
          </p>
        </div>

        <ForecastHorizonSelector
          selectedHorizon={horizon}
          onChange={setHorizon}
        />
      </div>

      {loading ? (
        <LoadingState message={`Fetching Solar & Net Load curves for ${selectedDate}...`} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadData(horizon, selectedDate)} />
      ) : (
        <>
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            
            <div className="liquid-glass p-4 rounded-xl border border-white/10">
              <div className="text-xs text-gray-400 font-medium">Selected Date ({selectedDate}) Demand</div>
              <div className="text-2xl font-bold text-cyan-400 mt-1">
                {summary ? `${summary.current_demand_mw.toLocaleString()} MW` : '4,416 MW'}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Peak Forecast: <strong className="text-white">{summary?.forecast_peak_mw.toLocaleString()} MW</strong>
              </div>
            </div>

            <div className="liquid-glass p-4 rounded-xl border border-white/10">
              <div className="text-xs text-gray-400 font-medium">Solar Generation Peak</div>
              <div className="text-2xl font-bold text-amber-400 mt-1">
                {duckData ? `${duckData.solar_peak_mw} MW` : '950 MW'}
              </div>
              <div className="text-[11px] text-amber-300 mt-1">
                Penetration: <strong>{summary?.solar_penetration_percent}%</strong> (Peak at {duckData?.solar_peak_time})
              </div>
            </div>

            <div className="liquid-glass p-4 rounded-xl border border-white/10">
              <div className="text-xs text-gray-400 font-medium">Net Load Trough ({selectedDate})</div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">
                {duckData ? `${duckData.net_load_minimum_mw.toLocaleString()} MW` : '3,466 MW'}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Minimum Net Load at <strong>{duckData?.net_load_minimum_time}</strong>
              </div>
            </div>

            <div className="liquid-glass p-4 rounded-xl border border-white/10">
              <div className="text-xs text-gray-400 font-medium">Max Evening Ramp Rate</div>
              <div className="text-2xl font-bold text-rose-400 mt-1">
                {summary ? `+${summary.maximum_evening_ramp_mw_per_hour.toLocaleString()} MW/h` : '+2,712 MW/h'}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Window: <strong>{duckData?.evening_ramp_start} - {duckData?.evening_ramp_end}</strong>
              </div>
            </div>

          </div>

          {/* Duck Curve Chart */}
          <div className="liquid-glass p-6 rounded-2xl border border-white/10 shadow-2xl mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-400" />
                  24-Hour Duck Curve & Net Load Profile — {selectedDate}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Comparison between Gross Electricity Demand, Rooftop Solar Output, and Net Dispatchable Load
                </p>
              </div>

              <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                <span className="text-gray-300">
                  Grid Stress Score: <strong className="text-rose-400">{summary?.grid_stress_score} / 100</strong> ({summary?.grid_stress_level})
                </span>
              </div>
            </div>

            {duckData && duckData.points.length > 0 && (
              <div className="w-full h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={duckData.points} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                    <XAxis dataKey="time_label" stroke="#9ca3af" fontSize={11} />
                    <YAxis stroke="#9ca3af" fontSize={11} unit=" MW" domain={[0, 'auto']} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '0.75rem' }}
                      formatter={(val: any) => [`${Number(val).toLocaleString()} MW`]}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                    {/* Gross Demand */}
                    <Line type="monotone" dataKey="gross_demand_mw" name="Gross Demand (MW)" stroke="#06b6d4" strokeWidth={2.5} dot={false} />

                    {/* Solar Generation */}
                    <Area type="monotone" dataKey="solar_generation_mw" name="Solar Generation (MW)" fill="rgba(251,191,36,0.25)" stroke="#fbbf24" strokeWidth={2} />

                    {/* Net Load Curve */}
                    <Line type="monotone" dataKey="net_load_mw" name="Net Dispatch Load (MW)" stroke="#10b981" strokeWidth={3} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
};
