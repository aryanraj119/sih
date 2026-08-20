import { useState, useEffect } from 'react';
import { fetchSolarGridSummary, fetchDuckCurveData } from '../services/api/solar';
import { sendChatMessage } from '../services/api/chat';
import type { SolarGridSummaryData, DuckCurveResponse } from '../services/api/solar';
import type { ForecastHorizon } from '../types/energy';
import { useDate } from '../context/DateContext';
import { ForecastHorizonSelector } from '../components/dashboard/ForecastHorizonSelector';
import { DataModeBadge } from '../components/dashboard/DataModeBadge';
import { LoadingState } from '../components/dashboard/LoadingState';
import { ErrorState } from '../components/dashboard/ErrorState';
import { Sun, Compass, Calendar, Sparkles, Bot } from 'lucide-react';
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
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Gemini AI Insights States
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiModelUsed, setAiModelUsed] = useState<string>('Gemini AI (gemini-3.6-flash)');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

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

  const fetchGeminiAiInsight = async (dateStr: string) => {
    setLoadingAi(true);
    try {
      const peakSolarMW = duckData?.solar_peak_mw || summary?.current_solar_mw || 1115.2;
      const minNetMW = duckData?.net_load_minimum_mw || summary?.current_net_load_mw || 3325.0;
      const peakDemandMW = summary?.forecast_peak_mw || 7215;

      const prompt = `Analyze Delhi solar grid Duck Curve net load for date ${dateStr} (mapped from 2021 dataset). Peak electricity demand is expected at ${peakDemandMW} MW, rooftop solar generation peaks at ${peakSolarMW} MW, creating a net load trough of ${minNetMW} MW followed by an evening ramp rate of +${summary?.maximum_evening_ramp_mw_per_hour || 2712} MW/h between 17:30 and 20:30. Provide short 3-bullet dispatch advisory for DISCOM engineers.`;
      
      const res = await sendChatMessage(prompt);
      if (res.data && res.data.response) {
        setAiInsight(res.data.response);
        setAiModelUsed(res.data.model_used || 'Gemini AI (gemini-3.6-flash)');
      }
    } catch (err) {
      console.error("Gemini AI insight error:", err);
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    loadData(horizon, selectedDate);
    fetchGeminiAiInsight(selectedDate);
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
            <span>Rooftop solar output from <strong>delhi_simulated_solar_data_june_aug_2021.docx</strong> & power load from <strong>Power Demand Data.csv</strong></span>
            <span className="bg-amber-950/80 text-amber-300 font-mono text-xs px-2.5 py-0.5 rounded border border-amber-500/40 font-bold flex items-center gap-1">
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
        <LoadingState message={`Fetching Solar & Net Load curves from 2021 dataset for ${selectedDate}...`} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadData(horizon, selectedDate)} />
      ) : (
        <>
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            
            <div className="liquid-glass p-4 rounded-xl border border-white/10">
              <div className="text-xs text-gray-400 font-medium">Power Demand Data.csv Load</div>
              <div className="text-2xl font-bold text-cyan-400 mt-1">
                {summary ? `${summary.current_demand_mw.toLocaleString()} MW` : '4,416 MW'}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Peak Forecast: <strong className="text-white">{summary?.forecast_peak_mw.toLocaleString()} MW</strong>
              </div>
            </div>

            <div className="liquid-glass p-4 rounded-xl border border-white/10">
              <div className="text-xs text-gray-400 font-medium">Solar Dataset Peak ({selectedDate})</div>
              <div className="text-2xl font-bold text-amber-400 mt-1">
                {duckData ? `${duckData.solar_peak_mw} MW` : '1,115.2 MW'}
              </div>
              <div className="text-[11px] text-amber-300 mt-1">
                Penetration: <strong>{summary?.solar_penetration_percent}%</strong> (Peak at {duckData?.solar_peak_time})
              </div>
            </div>

            <div className="liquid-glass p-4 rounded-xl border border-white/10">
              <div className="text-xs text-gray-400 font-medium">Net Load Trough ({selectedDate})</div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">
                {duckData ? `${duckData.net_load_minimum_mw.toLocaleString()} MW` : '3,325.0 MW'}
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
                  24-Hour Duck Curve & Net Load Profile — {selectedDate} (Exact 2021 Dataset Match)
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Comparison between Power Demand Data.csv Load and delhi_simulated_solar_data_june_aug_2021.docx Solar Irradiance
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
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.95)', borderColor: 'rgba(251,191,36,0.4)', borderRadius: '0.75rem' }}
                      formatter={(val: any, name: any) => [`${Number(val).toLocaleString()} MW`, name]}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                    {/* Gross Demand */}
                    <Line type="monotone" dataKey="gross_demand_mw" name="Power Demand Data.csv Load (MW)" stroke="#06b6d4" strokeWidth={2.5} dot={false} />

                    {/* Solar Generation */}
                    <Area type="monotone" dataKey="solar_generation_mw" name="2021 Solar Dataset Output (MW)" fill="rgba(251,191,36,0.25)" stroke="#fbbf24" strokeWidth={2} />

                    {/* Net Load Curve */}
                    <Line type="monotone" dataKey="net_load_mw" name="Net Dispatch Load (MW)" stroke="#10b981" strokeWidth={3} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* GEMINI AI SOLAR GRID ADVISORY INSIGHTS PANEL */}
          <div className="liquid-glass p-6 rounded-2xl border border-cyan-500/40 shadow-2xl bg-gradient-to-r from-cyan-950/40 via-black to-emerald-950/40 mb-8">
            <div className="flex items-center justify-between gap-4 mb-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-black shadow-lg">
                  <Bot className="w-6 h-6 fill-black" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Google Gemini AI Solar & Duck Curve Advisory</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold">
                      {aiModelUsed}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400">
                    Real-time operational guidance for Delhi grid dispatchers on {selectedDate} (2021 Solar Telemetry)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => fetchGeminiAiInsight(selectedDate)}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className={`w-3.5 h-3.5 ${loadingAi ? 'animate-spin' : ''}`} />
                <span>{loadingAi ? 'Querying Gemini API...' : 'Refresh AI Analysis'}</span>
              </button>
            </div>

            <div className="text-xs text-gray-200 leading-relaxed font-sans prose prose-invert max-w-none">
              {loadingAi ? (
                <div className="flex items-center gap-3 py-4 text-cyan-400 font-mono">
                  <Sparkles className="w-5 h-5 animate-spin" />
                  <span>Generating Google Gemini AI solar net load insight for {selectedDate}...</span>
                </div>
              ) : aiInsight ? (
                <div className="whitespace-pre-line bg-black/60 p-4 rounded-xl border border-white/10">
                  {aiInsight}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-black/60 border border-white/10 text-gray-300">
                  <strong className="text-yellow-300">Operational Summary ({selectedDate}):</strong> Peak rooftop solar output reaches {duckData?.solar_peak_mw || 1115.2} MW at {duckData?.solar_peak_time || '13:00'}, creating a net load trough of {duckData?.net_load_minimum_mw || 3325.0} MW. Grid dispatchers must prepare fast-ramping gas CCGT and battery storage systems for the evening ramp starting at 17:30.
                </div>
              )}
            </div>
          </div>
        </>
      )}

    </div>
  );
};
