import { useState, useEffect } from 'react';
import { simulateScenario } from '../services/api';
import type { ScenarioInputs, DemandDataPoint } from '../types/energy';
import { useDate } from '../context/DateContext';
import { DataModeBadge } from '../components/dashboard/DataModeBadge';
import { LoadingState } from '../components/dashboard/LoadingState';
import { ErrorState } from '../components/dashboard/ErrorState';
import { Sliders, Thermometer, Car, Sun, TrendingUp, Calendar, Activity, Cpu, Sparkles } from 'lucide-react';
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

  const [data, setData] = useState<DemandDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  const runSimulation = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await simulateScenario(inputs, selectedDate);
      if (response.data) {
        setData(response.data);
        setIsDemoMode(response.isDemoMode);
      }
      if (response.error) {
        setError(response.error);
      }
    } catch (err: any) {
      setError('Failed to execute AI scenario simulation.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [inputs, selectedDate]);

  const maxSimulatedMW = data.length > 0 ? Math.max(...data.map((d) => d.predictedMW)) : 7650;
  const maxBaselineMW = data.length > 0 ? Math.max(...data.map((d) => d.actualMW || d.predictedMW * 0.94)) : 7215;
  const deltaMW = maxSimulatedMW - maxBaselineMW;

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
            <span>Simulating heatwaves, EV charging, and solar rooftop output on top of <strong>Power Demand Data.csv</strong> load profile</span>
            <span className="bg-cyan-950/80 text-cyan-300 font-mono text-xs px-2.5 py-0.5 rounded border border-cyan-500/40 font-bold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-yellow-300" /> {selectedDate}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Left Column: Interactive Scenario Controls */}
        <div className="liquid-glass p-6 rounded-2xl border border-white/10 flex flex-col gap-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Interactive Scenario Controls ({selectedDate})
          </h2>

          {/* Temperature Anomaly Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold mb-2">
              <span className="text-gray-300 flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-rose-400" /> Heatwave Temp Anomaly
              </span>
              <span className="text-rose-400 font-mono font-bold">+{inputs.tempAnomaly}°C</span>
            </div>
            <input
              type="range"
              min="0"
              max="6"
              step="0.5"
              value={inputs.tempAnomaly}
              onChange={(e) => setInputs({ ...inputs, tempAnomaly: parseFloat(e.target.value), tempAnomalyC: parseFloat(e.target.value) })}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="text-[10px] text-gray-500 mt-1 flex justify-between">
              <span>0°C Baseline</span>
              <span>+3°C Heatwave</span>
              <span>+6°C Extreme</span>
            </div>
          </div>

          {/* EV Adoption Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold mb-2">
              <span className="text-gray-300 flex items-center gap-1.5">
                <Car className="w-4 h-4 text-cyan-400" /> EV Fleet Penetration
              </span>
              <span className="text-cyan-400 font-mono font-bold">{inputs.evAdoptionPct}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={inputs.evAdoptionPct}
              onChange={(e) => setInputs({ ...inputs, evAdoptionPct: parseInt(e.target.value, 10) })}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="text-[10px] text-gray-500 mt-1 flex justify-between">
              <span>5% Fleet</span>
              <span>25% Growth</span>
              <span>50% High Adoption</span>
            </div>
          </div>

          {/* Installed Solar Capacity Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold mb-2">
              <span className="text-gray-300 flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-400" /> Rooftop Solar Capacity
              </span>
              <span className="text-amber-400 font-mono font-bold">{inputs.solarCapacityMW} MW</span>
            </div>
            <input
              type="range"
              min="500"
              max="3000"
              step="100"
              value={inputs.solarCapacityMW}
              onChange={(e) => setInputs({ ...inputs, solarCapacityMW: parseInt(e.target.value, 10) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="text-[10px] text-gray-500 mt-1 flex justify-between">
              <span>500 MW</span>
              <span>1500 MW</span>
              <span>3000 MW Target</span>
            </div>
          </div>

          {/* GDP Growth Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold mb-2">
              <span className="text-gray-300 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Economic Growth Rate
              </span>
              <span className="text-emerald-400 font-mono font-bold">{inputs.gdpGrowthPct}%</span>
            </div>
            <input
              type="range"
              min="4"
              max="10"
              step="0.5"
              value={inputs.gdpGrowthPct}
              onChange={(e) => setInputs({ ...inputs, gdpGrowthPct: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="text-[10px] text-gray-500 mt-1 flex justify-between">
              <span>4.0%</span>
              <span>6.5% Baseline</span>
              <span>10.0% High Growth</span>
            </div>
          </div>

          {/* Impact Summary Box */}
          <div className="p-4 rounded-xl bg-black/60 border border-white/10 text-xs shadow-xl">
            <div className="font-bold text-gray-300 mb-2 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Simulated CSV Peak Impact ({selectedDate}):
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">CSV Baseline Peak:</span>
              <strong className="text-white">{Math.round(maxBaselineMW).toLocaleString()} MW</strong>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-gray-400">AI Simulated Peak:</span>
              <strong className="text-cyan-400">{Math.round(maxSimulatedMW).toLocaleString()} MW</strong>
            </div>
            <div className="flex justify-between items-center mt-1 border-t border-white/10 pt-1">
              <span className="text-gray-400">Peak Shift (Delta):</span>
              <strong className={deltaMW >= 0 ? 'text-rose-400' : 'text-emerald-400'}>
                {deltaMW >= 0 ? `+${Math.round(deltaMW).toLocaleString()} MW` : `${Math.round(deltaMW).toLocaleString()} MW`}
              </strong>
            </div>
          </div>

        </div>

        {/* Right 2 Columns: Simulated Graph & Comparison */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="liquid-glass p-6 rounded-2xl border border-white/10 shadow-2xl flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  AI Predictable Load Curve vs Power Demand Data.csv Baseline — {selectedDate}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Dynamic mathematical transformation of 24,312 real CSV demand records for {selectedDate}
                </p>
              </div>

              <div className="flex items-center gap-2 bg-cyan-950/60 px-3 py-1.5 rounded-xl border border-cyan-500/30 text-xs">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                <span className="text-cyan-300 font-mono font-bold">
                  AI Predictable Delta: {deltaMW >= 0 ? `+${Math.round(deltaMW).toLocaleString()} MW` : `${Math.round(deltaMW).toLocaleString()} MW`}
                </span>
              </div>
            </div>

            {loading ? (
              <LoadingState message={`Running AI scenario prediction on CSV telemetry for ${selectedDate}...`} />
            ) : error ? (
              <ErrorState message={error} onRetry={runSimulation} />
            ) : (
              <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                    <XAxis dataKey="time" stroke="#9ca3af" fontSize={11} />
                    <YAxis stroke="#9ca3af" fontSize={11} unit=" MW" domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.95)', borderColor: 'rgba(6,182,212,0.4)', borderRadius: '0.75rem' }}
                      formatter={(val: any, name: any) => [`${Number(val).toLocaleString()} MW`, name]}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                    {/* CSV Baseline Demand */}
                    <Line type="monotone" dataKey="actualMW" name="Power Demand Data.csv Baseline (MW)" stroke="#9ca3af" strokeWidth={2.5} strokeDasharray="5 5" dot={false} />

                    {/* AI Predicted Scenario Curve */}
                    <Line type="monotone" dataKey="predictedMW" name="AI Predictable Scenario Load (MW)" stroke="#06b6d4" strokeWidth={3.5} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
