import { useState, useEffect, useMemo } from 'react';
import { fetchForecast, simulateScenario } from '../services/api';
import type { ScenarioInputs, DemandDataPoint } from '../types/energy';
import { useDate } from '../context/DateContext';
import { DataModeBadge } from '../components/dashboard/DataModeBadge';
import { LoadingState } from '../components/dashboard/LoadingState';
import { ErrorState } from '../components/dashboard/ErrorState';
import { Sliders, Thermometer, Car, Sun, TrendingUp, Calendar, Activity, Cpu, Sparkles, RefreshCw } from 'lucide-react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const SimulatorPage = () => {
  const { selectedDate } = useDate();
  const [inputs, setInputs] = useState<ScenarioInputs>({
    tempAnomaly: 2.5,
    tempAnomalyC: 2.5,
    evAdoptionPct: 15,
    solarCapacityMW: 1200,
    gdpGrowthPct: 6.5,
  });

  const [baselineData, setBaselineData] = useState<DemandDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Fetch ground-truth CSV baseline data when selectedDate changes
  useEffect(() => {
    let isMounted = true;
    const loadBaseline = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchForecast('day_ahead', selectedDate);
        if (isMounted) {
          if (res.data && res.data.length > 0) {
            setBaselineData(res.data);
            setIsDemoMode(res.isDemoMode);
          } else {
            setError('No dataset points received for selected date.');
          }
        }
      } catch (err: any) {
        if (isMounted) setError('Failed to fetch ground truth CSV data for simulator.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadBaseline();
    return () => { isMounted = false; };
  }, [selectedDate]);

  const currTempAnomaly = inputs.tempAnomaly ?? inputs.tempAnomalyC ?? 0;

  // INSTANTLY compute AI scenario points in real-time whenever sliders change
  const simulatedData = useMemo(() => {
    if (!baselineData || baselineData.length === 0) return [];

    const tempImpact = currTempAnomaly * 280.0; // +280 MW per +1°C heatwave (or negative if cold)
    const evImpact = (inputs.evAdoptionPct / 10.0) * 220.0; // EV charging impact
    const gdpFactor = 1.0 + (inputs.gdpGrowthPct - 6.0) * 0.015; // Economic multiplier

    return baselineData.map((pt, idx) => {
      const baseMW = pt.actualMW ?? pt.predictedMW ?? 4416;
      
      // Solar output during daylight hours (06:00 to 18:00)
      const hour = pt.time ? parseInt(pt.time.split(':')[0], 10) : idx;
      const solarRatio = (hour >= 6 && hour <= 18) ? Math.sin(((hour - 6) / 12) * Math.PI) : 0;
      const solarGenMW = (pt.solarGenerationMW ?? pt.solarMW ?? (solarRatio * 950));
      const solarOffset = (inputs.solarCapacityMW / 1000.0) * solarGenMW;

      // Calculate AI Simulated Load (MW)
      const simPredMW = Math.round((baseMW + tempImpact + evImpact - solarOffset) * gdpFactor);

      return {
        ...pt,
        actualMW: baseMW, // CSV Baseline
        predictedMW: Math.max(1000, simPredMW), // AI Simulated Load
        upperConfidence: Math.round(simPredMW * 1.035),
        lowerConfidence: Math.round(simPredMW * 0.965),
      };
    });
  }, [baselineData, inputs, currTempAnomaly]);

  // Optionally sync with backend /api/scenario asynchronously
  useEffect(() => {
    const syncBackend = async () => {
      try {
        await simulateScenario(inputs, selectedDate);
      } catch (e) {
        // silent sync
      }
    };
    const timer = setTimeout(syncBackend, 500);
    return () => clearTimeout(timer);
  }, [inputs, selectedDate]);

  const maxSimulatedMW = simulatedData.length > 0 ? Math.max(...simulatedData.map((d) => d.predictedMW)) : 7650;
  const maxBaselineMW = baselineData.length > 0 ? Math.max(...baselineData.map((d) => d.actualMW ?? d.predictedMW)) : 7215;
  const deltaMW = maxSimulatedMW - maxBaselineMW;

  const resetControls = () => {
    setInputs({
      tempAnomaly: 0,
      tempAnomalyC: 0,
      evAdoptionPct: 10,
      solarCapacityMW: 1000,
      gdpGrowthPct: 6.0,
    });
  };

  return (
    <div className="w-full min-h-screen bg-black text-white px-4 md:px-8 lg:px-12 pt-8 pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <Sliders className="w-7 h-7 text-cyan-400" />
              AI Grid Scenario & Stress Simulator (CSV Ground Truth)
            </h1>
            <DataModeBadge isDemoMode={isDemoMode} />
          </div>
          <p className="text-xs md:text-sm text-gray-400 mt-1 flex items-center gap-2">
            <span>Drag controls to see <strong>instant real-time electricity demand shifts</strong> on top of <strong>Power Demand Data.csv</strong></span>
            <span className="bg-cyan-950/80 text-cyan-300 font-mono text-xs px-2.5 py-0.5 rounded border border-cyan-500/40 font-bold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-yellow-300" /> {selectedDate}
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={resetControls}
          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-cyan-400" />
          <span>Reset to Baseline (0°C, 10% EV)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Left Column: Interactive Scenario Controls */}
        <div className="liquid-glass p-6 rounded-2xl border border-white/10 flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Interactive Scenario Controls ({selectedDate})
            </h2>
            <span className="text-[10px] text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30 font-mono font-bold">
              Instant 0ms Shift
            </span>
          </div>

          {/* Temperature Anomaly Slider */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
            <div className="flex justify-between items-center text-xs font-semibold mb-2">
              <span className="text-gray-300 flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-rose-400" /> Heatwave Temp Anomaly
              </span>
              <span className={`font-mono font-bold text-sm ${currTempAnomaly > 0 ? 'text-rose-400' : currTempAnomaly < 0 ? 'text-cyan-400' : 'text-gray-300'}`}>
                {currTempAnomaly > 0 ? `+${currTempAnomaly}°C` : `${currTempAnomaly}°C`}
              </span>
            </div>
            <input
              type="range"
              min="-2"
              max="6"
              step="0.5"
              value={currTempAnomaly}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setInputs({ ...inputs, tempAnomaly: val, tempAnomalyC: val });
              }}
              className="w-full accent-rose-500 cursor-pointer h-2 bg-gray-800 rounded-lg"
            />
            <div className="text-[10px] text-gray-400 mt-2 flex justify-between font-mono">
              <span>-2°C Cold</span>
              <span>0°C Normal</span>
              <span>+3°C Heat</span>
              <span className="text-rose-400 font-bold">+6°C Extreme</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">
              Impact: <strong className={currTempAnomaly >= 0 ? 'text-rose-400' : 'text-cyan-400'}>
                {currTempAnomaly >= 0 ? `+${Math.round(currTempAnomaly * 280)} MW AC Cooling Surge` : `${Math.round(currTempAnomaly * 280)} MW Reduced Load`}
              </strong>
            </p>
          </div>

          {/* EV Adoption Slider */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
            <div className="flex justify-between items-center text-xs font-semibold mb-2">
              <span className="text-gray-300 flex items-center gap-1.5">
                <Car className="w-4 h-4 text-cyan-400" /> EV Fleet Penetration
              </span>
              <span className="text-cyan-400 font-mono font-bold text-sm">{inputs.evAdoptionPct}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={inputs.evAdoptionPct}
              onChange={(e) => setInputs({ ...inputs, evAdoptionPct: parseInt(e.target.value, 10) })}
              className="w-full accent-cyan-500 cursor-pointer h-2 bg-gray-800 rounded-lg"
            />
            <div className="text-[10px] text-gray-400 mt-2 flex justify-between font-mono">
              <span>5% Fleet</span>
              <span>25% Growth</span>
              <span className="text-cyan-400 font-bold">50% High EV</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">
              Impact: <strong className="text-cyan-400">+{Math.round((inputs.evAdoptionPct / 10) * 220)} MW EV Charging Ramp</strong>
            </p>
          </div>

          {/* Installed Solar Capacity Slider */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
            <div className="flex justify-between items-center text-xs font-semibold mb-2">
              <span className="text-gray-300 flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-400" /> Rooftop Solar Capacity
              </span>
              <span className="text-amber-400 font-mono font-bold text-sm">{inputs.solarCapacityMW} MW</span>
            </div>
            <input
              type="range"
              min="500"
              max="3000"
              step="100"
              value={inputs.solarCapacityMW}
              onChange={(e) => setInputs({ ...inputs, solarCapacityMW: parseInt(e.target.value, 10) })}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-gray-800 rounded-lg"
            />
            <div className="text-[10px] text-gray-400 mt-2 flex justify-between font-mono">
              <span>500 MW</span>
              <span>1500 MW</span>
              <span className="text-amber-400 font-bold">3000 MW Target</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">
              Impact: <strong className="text-amber-400">-{Math.round((inputs.solarCapacityMW / 1000) * 950)} MW Max Daytime Offset</strong>
            </p>
          </div>

          {/* GDP Growth Slider */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
            <div className="flex justify-between items-center text-xs font-semibold mb-2">
              <span className="text-gray-300 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Economic Growth Rate
              </span>
              <span className="text-emerald-400 font-mono font-bold text-sm">{inputs.gdpGrowthPct}%</span>
            </div>
            <input
              type="range"
              min="4"
              max="10"
              step="0.5"
              value={inputs.gdpGrowthPct}
              onChange={(e) => setInputs({ ...inputs, gdpGrowthPct: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-gray-800 rounded-lg"
            />
            <div className="text-[10px] text-gray-400 mt-2 flex justify-between font-mono">
              <span>4.0% Low</span>
              <span>6.5% Baseline</span>
              <span className="text-emerald-400 font-bold">10.0% High</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">
              Impact: <strong className="text-emerald-400">{inputs.gdpGrowthPct >= 6 ? '+' : ''}{((inputs.gdpGrowthPct - 6.0) * 1.5).toFixed(1)}% Demand Scale</strong>
            </p>
          </div>

          {/* Real-Time Impact Summary Metrics Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/80 to-black border border-cyan-500/40 text-xs shadow-xl">
            <div className="font-bold text-white mb-2.5 flex items-center justify-between border-b border-white/10 pb-2">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Live CSV Scenario Metrics ({selectedDate})
              </span>
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400">Power Demand Data.csv Peak:</span>
              <strong className="text-white font-mono">{Math.round(maxBaselineMW).toLocaleString()} MW</strong>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400">AI Predictable Peak:</span>
              <strong className="text-cyan-400 font-mono text-sm">{Math.round(maxSimulatedMW).toLocaleString()} MW</strong>
            </div>
            <div className="flex justify-between items-center py-1.5 border-t border-white/10 mt-1">
              <span className="text-gray-300 font-bold">Net Peak Shift (Delta):</span>
              <strong className={`font-mono text-sm ${deltaMW >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {deltaMW >= 0 ? `+${Math.round(deltaMW).toLocaleString()} MW` : `${Math.round(deltaMW).toLocaleString()} MW`}
              </strong>
            </div>
          </div>

        </div>

        {/* Right 2 Columns: Dynamic Graph & Curve Visualization */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="liquid-glass p-6 rounded-2xl border border-white/10 shadow-2xl flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  AI Predictable Load Curve vs Power Demand Data.csv — {selectedDate}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Watch the graph shift in real-time as you drag heatwave, EV fleet, and solar sliders above
                </p>
              </div>

              <div className="flex items-center gap-2 bg-cyan-950/80 px-3.5 py-1.5 rounded-xl border border-cyan-500/40 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                <span className="text-cyan-300 font-mono font-bold">
                  Net Shift: {deltaMW >= 0 ? `+${Math.round(deltaMW).toLocaleString()} MW` : `${Math.round(deltaMW).toLocaleString()} MW`}
                </span>
              </div>
            </div>

            {loading ? (
              <LoadingState message={`Fetching baseline CSV curves for ${selectedDate}...`} />
            ) : error ? (
              <ErrorState message={error} onRetry={() => setLoading(true)} />
            ) : (
              <div className="w-full h-[440px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={simulatedData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                    <XAxis dataKey="time" stroke="#9ca3af" fontSize={11} />
                    <YAxis stroke="#9ca3af" fontSize={11} unit=" MW" domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.95)', borderColor: 'rgba(6,182,212,0.4)', borderRadius: '0.75rem' }}
                      formatter={(val: any, name: any) => [`${Number(val).toLocaleString()} MW`, name]}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                    {/* CSV Baseline Demand Curve */}
                    <Line
                      type="monotone"
                      dataKey="actualMW"
                      name="Power Demand Data.csv Baseline (MW)"
                      stroke="#9ca3af"
                      strokeWidth={2.5}
                      strokeDasharray="5 5"
                      dot={false}
                      isAnimationActive={false}
                    />

                    {/* AI Predictable Simulated Curve (Instantly Animates on Slider Drag) */}
                    <Line
                      type="monotone"
                      dataKey="predictedMW"
                      name="AI Predictable Scenario Load (MW)"
                      stroke="#06b6d4"
                      strokeWidth={4}
                      dot={false}
                      isAnimationActive={true}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Quick Scenario Preset Buttons */}
          <div className="liquid-glass p-4 rounded-xl border border-white/10 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> Quick Preset Scenarios:
            </span>
            
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setInputs({ tempAnomaly: 0, tempAnomalyC: 0, evAdoptionPct: 5, solarCapacityMW: 500, gdpGrowthPct: 6.0 })}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 font-bold transition-all cursor-pointer"
              >
                🌱 Mild Spring (0°C, Low EV)
              </button>
              
              <button
                type="button"
                onClick={() => setInputs({ tempAnomaly: 3.5, tempAnomalyC: 3.5, evAdoptionPct: 25, solarCapacityMW: 1500, gdpGrowthPct: 7.0 })}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs text-amber-300 font-bold transition-all cursor-pointer"
              >
                🔥 Summer Heatwave (+3.5°C)
              </button>

              <button
                type="button"
                onClick={() => setInputs({ tempAnomaly: 5.5, tempAnomalyC: 5.5, evAdoptionPct: 45, solarCapacityMW: 1000, gdpGrowthPct: 8.5 })}
                className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-xs text-rose-300 font-bold transition-all cursor-pointer"
              >
                ⚡ Extreme Stress (+5.5°C, 45% EV)
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
