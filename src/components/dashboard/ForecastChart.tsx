import type { DemandDataPoint } from '../../types/energy';
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
  title = 'Demand Curve & Probabilistic Confidence Bands',
  subtitle = 'Comparing OpenSTEF P50 forecast, P10-P90 uncertainty bounds, and actual SLDC load',
  height = 400,
  showTemperature = true,
  className = '',
}: ForecastChartProps) => {
  return (
    <div className={`liquid-glass p-6 rounded-2xl border border-white/10 ${className}`}>
      {title && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-cyan-400 inline-block"></span>
              <span className="text-gray-300">P50 Forecast</span>
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
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                backdropFilter: 'blur(8px)',
                fontSize: '12px',
              }}
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

            {/* P50 Primary Forecast Line */}
            <Line
              type="monotone"
              dataKey="predictedMW"
              stroke="#06b6d4"
              strokeWidth={3}
              dot={false}
              name="OpenSTEF P50 Forecast (MW)"
            />

            {/* Actual Load Line */}
            <Line
              type="monotone"
              dataKey="actualMW"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 3, fill: '#10b981' }}
              name="Actual SLDC Load (MW)"
            />

            {/* Temperature Overlay */}
            {showTemperature && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="temperature"
                stroke="#f59e0b"
                strokeWidth={1.5}
                dot={false}
                name="Temperature (°C)"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
