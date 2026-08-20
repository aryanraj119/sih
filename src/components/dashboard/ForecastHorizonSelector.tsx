import type { ForecastHorizon } from '../../types/energy';
import { Zap, Cpu, Compass } from 'lucide-react';

interface ForecastHorizonSelectorProps {
  selectedHorizon: ForecastHorizon;
  onChange: (horizon: ForecastHorizon) => void;
  className?: string;
}

export const ForecastHorizonSelector = ({
  selectedHorizon = 'day_ahead', // 1-7 Days selected by default ⭐
  onChange,
  className = '',
}: ForecastHorizonSelectorProps) => {
  const options = [
    {
      id: 'short_term' as ForecastHorizon,
      title: '15 MIN – 6 HRS',
      prediction: 'Demand + Peak + Ramp',
      purpose: 'Real-time operational awareness',
      icon: Zap,
      activeColor: 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20',
      badgeColor: 'bg-cyan-950/60 border-cyan-500/30 text-cyan-300',
    },
    {
      id: 'day_ahead' as ForecastHorizon,
      title: '1 – 7 DAYS ⭐',
      prediction: 'Day-ahead demand + peak',
      purpose: 'Power procurement & scheduling',
      icon: Cpu,
      activeColor: 'bg-emerald-400 text-black shadow-lg shadow-emerald-400/20 ring-1 ring-emerald-500/40',
      badgeColor: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300',
    },
    {
      id: 'long_term' as ForecastHorizon,
      title: '1 – 5 YEARS',
      prediction: 'Demand growth by zone',
      purpose: 'Grid / infrastructure planning',
      icon: Compass,
      activeColor: 'bg-amber-400 text-black shadow-lg shadow-amber-400/20',
      badgeColor: 'bg-amber-950/60 border-amber-500/30 text-amber-300',
    },
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 ${className}`}>
      {options.map((opt) => {
        const IconComp = opt.icon;
        const isSelected = selectedHorizon === opt.id;

        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              isSelected
                ? `${opt.activeColor} border-transparent`
                : 'liquid-glass border-white/10 text-white hover:border-white/20'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold tracking-tight uppercase flex items-center gap-1.5">
                  <IconComp className="w-4 h-4" /> {opt.title}
                </span>
                {opt.id === 'day_ahead' && (
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border uppercase ${
                    isSelected ? 'bg-black/20 text-black border-black/30' : opt.badgeColor
                  }`}>
                    OpenSTEF Core
                  </span>
                )}
              </div>

              <div className={`text-xs font-semibold mb-1 ${isSelected ? 'text-black/90' : 'text-cyan-300'}`}>
                {opt.prediction}
              </div>

              <p className={`text-[11px] font-light leading-snug ${isSelected ? 'text-black/80' : 'text-gray-400'}`}>
                {opt.purpose}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
