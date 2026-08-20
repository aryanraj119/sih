import { useState, useEffect } from 'react';
import { simulateScenario } from '../services/api';
import type { ScenarioInputs, DemandDataPoint } from '../types/energy';
import { DataModeBadge } from '../components/dashboard/DataModeBadge';
import { LoadingState } from '../components/dashboard/LoadingState';
import { ErrorState } from '../components/dashboard/ErrorState';
import { Sliders, AlertTriangle, Thermometer, Car, Sun, TrendingUp } from 'lucide-react';
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
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  const runSimulation = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await simulateScenario(inputs);
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
  }, [inputs]);

  const baselinePeak = data.length > 0 ? Math.max(...data.map((d) => d.actualMW || d.predictedMW)) : 6800;
  const simulatedPeak = data.length > 0 ? Math.max(...data.map((d) => d.predictedMW)) : 7450;
  const deltaMW = simulatedPeak - baselinePeak;
  const deltaPct = baselinePeak > 0 ? ((deltaMW / baselinePeak) * 100).toFixed(1) : '0';

  const currentTemp = inputs.tempAnomalyC ?? inputs.tempAnomaly ?? 0;

  return (
    <div className="w-full min-h-screen bg-black text-white px-4 md:px-8 lg:px-12 pt-8 pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              AI Stress Sandbox
            </div>
            <DataModeBadge isDemoMode={isDemoMode} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Delhi Grid AI Scenario Simulator
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Simulate heatwaves, EV fleet penetration, rooftop solar expansion, and GDP growth on Delhi's grid
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Left Col: Interactive Sandbox Sliders */}
        <div className="liquid-glass p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Simulation Stress Controls
            </h2>

            {/* Slider 1: Temp Anomaly */}
            <div className="mb-6">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-gray-300 font-medium flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-amber-400" /> Heatwave Temp Anomaly
                </span>
                <span className="font-bold text-amber-400 text-sm">+{currentTemp} °C</span>
              </div>
              <input
                type="range"
                min="-2"
                max="6"
                step="0.5"
                value={currentTemp}
                onChange={(e) => setInputs({ ...inputs, tempAnomaly: parseFloat(e.target.value), tempAnomalyC: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>-2°C Cool</span>
                <span>0°C Normal</span>
                <span>+6°C Severe Heatwave</span>
              </div>
            </div>

            {/* Slider 2: EV Adoption */}
            <div className="mb-6">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-gray-300 font-medium flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-cyan-400" /> EV Fleet Penetration
                </span>
                <span className="font-bold text-cyan-400 text-sm">{inputs.evAdoptionPct} %</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={inputs.evAdoptionPct}
                onChange={(e) => setInputs({ ...inputs, evAdoptionPct: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>5% Baseline</span>
                <span>25% Moderate</span>
                <span>50% High EV</span>
              </div>
            </div>

            {/* Slider 3: Rooftop Solar */}
            <div className="mb-6">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-gray-300 font-medium flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-emerald-400" /> Rooftop Solar Capacity
                </span>
                <span className="font-bold text-emerald-400 text-sm">{inputs.solarCapacityMW} MW</span>
              </div>
              <input
                type="range"
                min="500"
                max="3500"
                step="100"
                value={inputs.solarCapacityMW}
                onChange={(e) => setInputs({ ...inputs, solarCapacityMW: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>500 MW</span>
                <span>2,000 MW</span>
                <span>3,500 MW Target</span>
              </div>
            </div>

            {/* Slider 4: GDP Growth */}
            <div className="mb-4">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-gray-300 font-medium flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-purple-400" /> Annual GDP Growth
                </span>
                <span className="font-bold text-purple-400 text-sm">{inputs.gdpGrowthPct} %</span>
              </div>
              <input
                type="range"
                min="4"
                max="10"
                step="0.5"
                value={inputs.gdpGrowthPct}
                onChange={(e) => setInputs({ ...inputs, gdpGrowthPct: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>4.0%</span>
                <span>7.0% Target</span>
                <span>10.0% Rapid</span>
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <button
            type="button"
            onClick={() => setInputs({ tempAnomaly: 0, tempAnomalyC: 0, evAdoptionPct: 10, solarCapacityMW: 1000, gdpGrowthPct: 6.0 })}
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 transition-colors cursor-pointer"
          >
            Reset to Baseline Parameters
          </button>
        </div>

        {/* Right 2 Cols: Simulation Results & Comparison Chart */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Summary Delta Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="liquid-glass p-4 rounded-xl border border-white/10">
              <div className="text-xs text-gray-400 font-medium">Baseline Peak Demand</div>
              <div className="text-xl font-bold text-white mt-1">{baselinePeak.toLocaleString()} MW</div>
              <div className="text-[11px] text-gray-400 mt-1">Normal Weather & EV Profile</div>
            </div>

            <div className="liquid-glass p-4 rounded-xl border border-white/10">
              <div className="text-xs text-gray-400 font-medium">Simulated Peak Demand</div>
              <div className="text-xl font-bold text-amber-400 mt-1">{simulatedPeak.toLocaleString()} MW</div>
              <div className="text-[11px] text-amber-300 mt-1">Under Stress Parameters</div>
            </div>

            <div className="liquid-glass p-4 rounded-xl border border-white/10">
              <div className="text-xs text-gray-400 font-medium">Delta Peak Impact</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">
                +{deltaMW} MW <span className="text-xs font-normal">({deltaPct}%)</span>
              </div>
              <div className="text-[11px] text-emerald-400 mt-1">Net Load Shift</div>
            </div>
          </div>

          {/* Main Simulation Chart */}
          <div className="liquid-glass p-6 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Baseline vs Simulated Demand Curve</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Real-time recalculated load curves under simulated climate and grid adoption drivers
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-gray-400 inline-block"></span>
                  <span className="text-gray-300">Baseline Demand</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-amber-400 inline-block"></span>
                  <span className="text-amber-300">Simulated Stress Demand</span>
                </div>
              </div>
            </div>

            {loading && <LoadingState message="Recalculating AI scenario simulation..." />}
            {error && !loading && <ErrorState message={error} onRetry={runSimulation} />}

            {!loading && (
              <div className="h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="time" stroke="#9ca3af" tick={{ fontSize: 11 }} />
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

                    {/* Baseline Line */}
                    <Line
                      type="monotone"
                      dataKey="actualMW"
                      stroke="#9ca3af"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                      name="Baseline Demand (MW)"
                    />

                    {/* Simulated Stress Line */}
                    <Line
                      type="monotone"
                      dataKey="predictedMW"
                      stroke="#f59e0b"
                      strokeWidth={3.5}
                      dot={false}
                      name="Simulated Stress Load (MW)"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Grid Mitigation Advice */}
          <div className="liquid-glass p-5 rounded-2xl border border-white/10 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Transmission Corridor Thermal Advisory</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Simulated peak demand of <strong>{simulatedPeak.toLocaleString()} MW</strong> requires dispatching 400 MW additional gas turbine reserve and triggering EV smart-charging curtailment protocols between 18:00 and 21:00.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
