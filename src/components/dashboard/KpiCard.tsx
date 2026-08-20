import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon?: LucideIcon;
  accentColor?: 'cyan' | 'emerald' | 'amber' | 'yellow';
  className?: string;
}

export const KpiCard = ({
  label,
  value,
  unit = '',
  subtitle = '',
  icon: Icon,
  accentColor = 'cyan',
  className = '',
}: KpiCardProps) => {
  const colorMap = {
    cyan: 'text-cyan-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    yellow: 'text-yellow-300',
  };

  return (
    <div className={`liquid-glass p-4 rounded-xl border border-white/10 ${className}`}>
      <div className="flex items-center justify-between text-xs text-gray-400 font-medium mb-1">
        <span>{label}</span>
        {Icon && <Icon className={`w-3.5 h-3.5 ${colorMap[accentColor]}`} />}
      </div>
      <div className={`text-xl font-bold ${colorMap[accentColor]} flex items-baseline gap-1`}>
        {value} {unit && <span className="text-xs text-gray-300 font-normal">{unit}</span>}
      </div>
      {subtitle && <div className="text-[11px] text-gray-400 mt-1">{subtitle}</div>}
    </div>
  );
};
