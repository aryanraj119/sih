import type { DemandDataPoint } from '../../types/energy';
import { Sparkles } from 'lucide-react';
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

interface ForecastChartProps {
  data: DemandDataPoint[];
  title?: string;
  subtitle?: string;
  height?: number;
  showTemperature?: boolean;
  className?: string;
}

export const ForecastChart = ({
  data,
  title = 'OpenSTEF & Google Gemini AI Demand Forecast',
  subtitle = 'Comparing OpenSTEF P50 Baseline, Google Gemini AI Predictable Forecast (with ±1.5% model residual error), and Ground Truth SLDC Load',
  height = 420,
  showTemperature = true,
  className = '',
}: ForecastChartProps) => {
  return (
    <div className={`liquid-glass p-6 rounded-2xl border border-white/10 ${className}`}>
      {title && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>{title}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400 animate-spin" /> Gemini AI Model Enabled
              </span>
            </h2>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-cyan-400 inline-block"></span>
              <span className="text-gray-300">P50 Baseline</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-purple-400 inline-block"></span>
              <span className="text-purple-300 font-bold flex items-center gap-1">
                ✨ Gemini AI Forecast
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-cyan-500/20 border border-cyan-500/40 inline-block rounded-xs"></span>
              <span className="text-gray-300">P10 - P90 Band</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-400 border border-dashed border-emerald-400 inline-block"></span>
              <span className="text-gray-300">Actual Load</span>
            </div>
          </div>
        </div>
      )}

      <div style={{ width: '100%', height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
            <defs>
              <linearGradient id="confidenceBandGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="time" stroke="#9ca3af" tick={{ fontSize: 11 }} />
            <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} domain={['auto', 'auto']} unit=" MW" />
            {showTemperature && (
              <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{ fontSize: 11 }} unit=" °C" />
            )}
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.92)',
                borderColor: 'rgba(192, 132, 252, 0.5)',
                borderRadius: '12px',
                backdropFilter: 'blur(8px)',
                fontSize: '12px',
              }}
              formatter={(val: any, name: any) => [`${Number(val).toLocaleString()} MW`, name]}
            />
            <Legend wrapperStyle={{ paddingTop: '15px' }} />

            {/* P90 Upper Confidence Area */}
            <Area
              type="monotone"
              dataKey="upperConfidence"
              stroke="none"
              fill="url(#confidenceBandGradient)"
              name="P90 Upper Bound"
            />
            <Area
              type="monotone"
              dataKey="lowerConfidence"
              stroke="none"
              fill="none"
              name="P10 Lower Bound"
            />

            {/* Ground Truth Actual Load (from CSV) */}
            <Line
              type="monotone"
              dataKey="actualMW"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="4 4"
              name="Power Demand Data.csv Actual (MW)"
              dot={false}
            />

            {/* OpenSTEF P50 Baseline Line */}
            <Line
              type="monotone"
              dataKey="predictedMW"
              stroke="#06b6d4"
              strokeWidth={2.5}
              name="OpenSTEF P50 Baseline (MW)"
              dot={false}
            />

            {/* DEDICATED GOOGLE GEMINI AI ENERGY FORECAST LINE (WITH REALISTIC ±1.5% RESIDUAL VARIANCE) */}
            <Line
              type="monotone"
              dataKey="geminiAiForecastMW"
              stroke="#c084fc"
              strokeWidth={3.5}
              name="✨ Gemini AI Energy Forecast (MW)"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
