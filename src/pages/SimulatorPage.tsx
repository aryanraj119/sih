import { useState, useMemo } from 'react';
import { runScenarioSimulation, getForecastData } from '../services/api';
import type { ScenarioInputs } from '../types/energy';
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
import { Cpu, Thermometer, Car, Sun, TrendingUp, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

export const SimulatorPage = () => {
  const [inputs, setInputs] = useState<ScenarioInputs>({
    tempAnomaly: 3.5,
    evAdoptionPct: 20,
    solarCapacityMW: 1800,
    gdpGrowthPct: 7.2,
  });

  const baselineData = useMemo(() => getForecastData('short_term'), []);
  const simulatedData = useMemo(() => runScenarioSimulation(inputs), [inputs]);

  const combinedChartData = useMemo(() => {
    return baselineData.map((basePoint, idx) => {
      const simPoint = simulatedData[idx];
      return {
        time: basePoint.time,
        baselineMW: basePoint.predictedMW,
        simulatedMW: simPoint ? simPoint.predictedMW : basePoint.predictedMW,
      };
    });
  }, [baselineData, simulatedData]);

  const baselinePeak = Math.max(...baselineData.map((d) => d.predictedMW));
  const simulatedPeak = Math.max(...simulatedData.map((d) => d.predictedMW));
  const deltaMW = simulatedPeak - baselinePeak;
  const deltaPct = ((deltaMW / baselinePeak) * 100).toFixed(1);

  const handleReset = () => {
    setInputs({
      tempAnomaly: 0,
      evAdoptionPct: 10,
      solarCapacityMW: 1000,
      gdpGrowthPct: 6.0,
    });
  };

  return (
    <div className="w-full min-h-screen bg-black text-white px-4 md:px-8 lg:px-12 pt-8 pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            AI Grid Sandbox
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            AI Demand & Climate Stress Simulator
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Simulate extreme heatwaves, rapid EV adoption, rooftop solar additions, and economic expansion on Delhi's power grid
          </p>
        </div>

        <button
          onClick={handleReset}
          className="liquid-glass px-4 py-2 rounded-xl border border-white/10 text-xs font-medium text-gray-300 hover:text-white flex items-center gap-2 transition-colors cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset Parameters
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Scenario Parameter Sliders */}
        <div className="lg:col-span-4 liquid-glass p-6 rounded-2xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-lg font-bold text-white">Simulation Drivers</h2>
            <span className="text-xs text-cyan-400 font-mono">Real-time Inference</span>
          </div>

          {/* Slider 1: Temperature Heatwave Anomaly */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300 font-medium flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" /> Heatwave Temp Anomaly
              </span>
              <span className="font-bold text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/30">
                +{inputs.tempAnomaly} °C
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="6"
              step="0.5"
              value={inputs.tempAnomaly}
              onChange={(e) => setInputs({ ...inputs, tempAnomaly: parseFloat(e.target.value) })}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-gray-500">
              <span>Normal (0°C)</span>
              <span>Extreme (+6°C)</span>
            </div>
          </div>

          {/* Slider 2: EV Fleet Adoption % */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300 font-medium flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-cyan-400" /> EV Adoption Rate
              </span>
              <span className="font-bold text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/30">
                {inputs.evAdoptionPct}% Fleet
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={inputs.evAdoptionPct}
              onChange={(e) => setInputs({ ...inputs, evAdoptionPct: parseInt(e.target.value) })}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-gray-500">
              <span>5% (Current)</span>
              <span>50% (High EV)</span>
            </div>
          </div>

          {/* Slider 3: Rooftop Solar MW */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300 font-medium flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-yellow-400" /> Solar Rooftop Capacity
              </span>
              <span className="font-bold text-yellow-300 bg-yellow-950/50 px-2 py-0.5 rounded border border-yellow-500/30">
                {inputs.solarCapacityMW} MW
              </span>
            </div>
            <input
              type="range"
              min="500"
              max="3500"
              step="100"
              value={inputs.solarCapacityMW}
              onChange={(e) => setInputs({ ...inputs, solarCapacityMW: parseInt(e.target.value) })}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-400"
            />
            <div className="flex justify-between text-[10px] text-gray-500">
              <span>500 MW</span>
              <span>3,500 MW Target</span>
            </div>
          </div>

          {/* Slider 4: GDP Growth % */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300 font-medium flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Annual GDP Growth
              </span>
              <span className="font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30">
                {inputs.gdpGrowthPct}% / year
              </span>
            </div>
            <input
              type="range"
              min="4"
              max="10"
              step="0.2"
              value={inputs.gdpGrowthPct}
              onChange={(e) => setInputs({ ...inputs, gdpGrowthPct: parseFloat(e.target.value) })}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <div className="flex justify-between text-[10px] text-gray-500">
              <span>4.0%</span>
              <span>10.0% Rapid</span>
            </div>
          </div>

          {/* Simulation Summary Box */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Baseline Peak Demand:</span>
              <span className="font-bold text-white">{baselinePeak.toLocaleString()} MW</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Simulated Peak Demand:</span>
              <span className="font-bold text-amber-400">{simulatedPeak.toLocaleString()} MW</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-2">
              <span className="text-gray-400">Net Demand Impact:</span>
              <span className={`font-bold ${deltaMW >= 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {deltaMW >= 0 ? `+${deltaMW.toLocaleString()}` : deltaMW.toLocaleString()} MW ({deltaPct}%)
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Recharts Simulation Display */}
        <div className="lg:col-span-8 space-y-6">
          <div className="liquid-glass p-6 rounded-2xl border border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Baseline vs Simulated Load Profile</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Real-time visualization comparing normal forecast against your custom scenario parameters
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-gray-400 border border-dashed border-gray-400 inline-block"></span>
                  <span className="text-gray-300">Normal Baseline</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-amber-400 inline-block"></span>
                  <span className="text-amber-300">Simulated Scenario</span>
                </div>
              </div>
            </div>

            {/* Simulation Chart */}
            <div className="h-[380px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={combinedChartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="time" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} unit=" MW" domain={['auto', 'auto']} />
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
                    dataKey="baselineMW"
                    stroke="#9ca3af"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                    name="Normal Baseline Forecast (MW)"
                  />

                  {/* Simulated Line */}
                  <Line
                    type="monotone"
                    dataKey="simulatedMW"
                    stroke="#f59e0b"
                    strokeWidth={3.5}
                    dot={false}
                    name="Simulated Scenario Load (MW)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grid Advisory Banner */}
          <div className={`liquid-glass p-5 rounded-2xl border flex items-start gap-4 ${
            simulatedPeak > 8300
              ? 'border-amber-500/40 bg-amber-950/20'
              : 'border-emerald-500/40 bg-emerald-950/20'
          }`}>
            {simulatedPeak > 8300 ? (
              <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            )}

            <div>
              <h3 className="text-sm font-bold text-white">
                {simulatedPeak > 8300 ? 'Grid Advisory: Severe Peak Stress Warning' : 'Grid Advisory: Safe Capacity Margins'}
              </h3>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed font-light">
                {simulatedPeak > 8300
                  ? `Simulated peak of ${simulatedPeak.toLocaleString()} MW exceeds Delhi's standard thermal transmission corridor capacity. Recommend activating 600 MW demand-side response and pre-charging DISCOM battery storage systems.`
                  : `Simulated peak of ${simulatedPeak.toLocaleString()} MW remains within Delhi's 8,656 MW peak grid rating. Sub-station thermal margins operate safely.`}
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
