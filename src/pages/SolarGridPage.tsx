import { useState } from 'react';
import { getDuckCurveData } from '../services/api';
import type { DuckCurveDataPoint } from '../types/energy';
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
import { Sun, Zap, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';

export const SolarGridPage = () => {
  const [data] = useState<DuckCurveDataPoint[]>(getDuckCurveData());

  const peakSolarMW = Math.max(...data.map((d) => d.solarGenMW));
  const maxRampRate = Math.max(...data.map((d) => d.rampRateMWMin));
  const minNetDemand = Math.min(...data.map((d) => d.netDemandMW));

  return (
    <div className="w-full min-h-screen bg-black text-white px-4 md:px-8 lg:px-12 pt-8 pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-950/60 border border-yellow-500/30 text-yellow-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sun className="w-3.5 h-3.5 text-yellow-400" />
            Solar & Duck Curve Analytics
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Rooftop Solar & Net Demand Ramping
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Analyzing Delhi's solar generation duck curve, midday net demand drops, and evening ramp stress
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="liquid-glass px-4 py-2 rounded-xl border border-white/10 text-xs flex items-center gap-2">
            <span className="text-gray-400">Peak Solar Generation:</span>
            <span className="font-bold text-yellow-300 text-sm">{peakSolarMW} MW</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="liquid-glass p-4 rounded-xl border border-white/10">
          <div className="text-xs text-gray-400 font-medium">Midday Solar Peak</div>
          <div className="text-xl font-bold text-yellow-300 mt-1">
            {peakSolarMW} <span className="text-xs text-gray-400">MW</span>
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Delhi Rooftop Capacity Peak (12:00-14:00)</div>
        </div>

        <div className="liquid-glass p-4 rounded-xl border border-white/10">
          <div className="text-xs text-gray-400 font-medium">Net Demand Trough</div>
          <div className="text-xl font-bold text-cyan-400 mt-1">
            {minNetDemand} <span className="text-xs text-gray-400">MW</span>
          </div>
          <div className="text-[11px] text-gray-400 mt-1">"Duck Belly" lowest net thermal load</div>
        </div>

        <div className="liquid-glass p-4 rounded-xl border border-white/10">
          <div className="text-xs text-gray-400 font-medium flex items-center justify-between">
            <span>Max Evening Ramp</span>
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 mt-1">
            +{maxRampRate} <span className="text-xs text-gray-400">MW/min</span>
          </div>
          <div className="text-[11px] text-amber-300/80 mt-1">Evening solar fade (17:00 - 20:00)</div>
        </div>

        <div className="liquid-glass p-4 rounded-xl border border-white/10">
          <div className="text-xs text-gray-400 font-medium">Grid Stability Index</div>
          <div className="text-xl font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" /> STABLE
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Frequency controlled within 50.02 Hz</div>
        </div>
      </div>

      {/* Main Duck Curve Chart Container */}
      <div className="liquid-glass p-6 rounded-2xl border border-white/10 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              24-Hour Duck Curve: Gross Demand vs Net Demand
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Notice how midday solar peak reduces net thermal grid load, followed by a steep evening ramp rate as solar drops off.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-gray-400 border border-dashed border-gray-400 inline-block"></span>
              <span className="text-gray-300">Gross Demand</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-yellow-400/30 border border-yellow-400 inline-block rounded-xs"></span>
              <span className="text-yellow-300">Solar Gen (MW)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-cyan-400 inline-block"></span>
              <span className="text-cyan-300">Net Demand (Duck Curve)</span>
            </div>
          </div>
        </div>

        {/* Duck Curve Chart */}
        <div className="h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#facc15" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#facc15" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="time" stroke="#9ca3af" tick={{ fontSize: 11 }} />
              <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} unit=" MW" domain={[0, 'auto']} />
              <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{ fontSize: 11 }} unit=" MW/min" />
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

              {/* Solar Generation Area */}
              <Area
                type="monotone"
                dataKey="solarGenMW"
                stroke="#facc15"
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
                strokeDasharray="4 4"
                dot={false}
                name="Gross Demand (MW)"
              />

              {/* Net Demand Line (Duck Curve) */}
              <Line
                type="monotone"
                dataKey="netDemandMW"
                stroke="#06b6d4"
                strokeWidth={3.5}
                dot={false}
                name="Net Grid Demand (Duck Curve)"
              />

              {/* Ramp Rate Line */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="rampRateMWMin"
                stroke="#f59e0b"
                strokeWidth={1.5}
                dot={false}
                name="Ramp Rate (MW/min)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ramping Insights Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="liquid-glass p-5 rounded-2xl border border-white/10 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Midday Net Demand Trough ("Duck Belly")
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed font-light">
            Between 11:00 and 15:00, Delhi's rooftop solar generation peaks at over <strong>950 MW</strong>, reducing net thermal generation requirements. 
            Gas-fired thermal plants must ramp down output to prevent over-frequency tripping.
          </p>
        </div>

        <div className="liquid-glass p-5 rounded-2xl border border-white/10 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Evening Ramp Up Challenge (17:00 – 21:00)
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed font-light">
            As sunset coincides with evening domestic air conditioning peaks, net grid load ramps up rapidly at up to <strong>+{maxRampRate} MW/min</strong>. 
            OpenSTEF pre-triggers fast-acting hydro and battery energy storage (BESS) dispatch to absorb the ramp smoothly.
          </p>
        </div>
      </div>

    </div>
  );
};
