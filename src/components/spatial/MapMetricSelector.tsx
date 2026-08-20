import { Activity, TrendingUp, Zap, Compass, AlertTriangle, Sun } from 'lucide-react';

export type MapMetricMode =
  | 'current_demand'
  | 'forecast_demand'
  | 'peak_demand'
  | 'growth_percent'
  | 'risk_score'
  | 'net_load';

interface MapMetricSelectorProps {
  selectedMetric: MapMetricMode;
  onChange: (metric: MapMetricMode) => void;
  className?: string;
}

export const MapMetricSelector = ({ selectedMetric, onChange, className = '' }: MapMetricSelectorProps) => {
  const metrics = [
    { id: 'current_demand' as MapMetricMode, label: 'Current Demand', icon: Activity, color: 'text-cyan-400' },
    { id: 'forecast_demand' as MapMetricMode, label: 'Forecast Demand', icon: Zap, color: 'text-emerald-400' },
    { id: 'peak_demand' as MapMetricMode, label: 'Peak Demand', icon: TrendingUp, color: 'text-amber-400' },
    { id: 'growth_percent' as MapMetricMode, label: '5-Yr Growth %', icon: Compass, color: 'text-purple-400' },
    { id: 'risk_score' as MapMetricMode, label: 'Risk Score', icon: AlertTriangle, color: 'text-rose-400' },
    { id: 'net_load' as MapMetricMode, label: 'Net Load MW', icon: Sun, color: 'text-yellow-400' },
  ];

  return (
    <div className={`liquid-glass p-1.5 rounded-xl border border-white/10 flex flex-wrap items-center gap-1.5 ${className}`}>
      {metrics.map((m) => {
        const IconComp = m.icon;
        const isSelected = selectedMetric === m.id;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              isSelected
                ? 'bg-white text-black shadow-md shadow-white/10'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-black' : m.color}`} />
            <span>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
};
