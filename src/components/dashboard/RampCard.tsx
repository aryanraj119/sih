import { Zap, AlertTriangle } from 'lucide-react';

interface RampCardProps {
  rampRateMWMin: number;
  rampTime?: string;
  status?: string;
  className?: string;
}

export const RampCard = ({
  rampRateMWMin,
  rampTime = '18:00',
  status = 'STABLE',
  className = '',
}: RampCardProps) => {
  return (
    <div className={`liquid-glass p-4 rounded-xl border border-white/10 ${className}`}>
      <div className="flex items-center justify-between text-xs text-gray-400 font-medium mb-1">
        <span>Max Ramp Rate</span>
        <Zap className="w-3.5 h-3.5 text-amber-400" />
      </div>
      <div className="text-xl font-bold text-amber-400 flex items-baseline gap-1">
        +{rampRateMWMin} <span className="text-xs text-gray-300 font-normal">MW/min</span>
      </div>
      <div className="text-[11px] text-gray-400 mt-1 flex items-center justify-between">
        <span>Peak Ramp: <strong className="text-white">{rampTime}</strong></span>
        <span className="text-amber-300 flex items-center gap-0.5 font-semibold">
          <AlertTriangle className="w-3 h-3" /> {status}
        </span>
      </div>
    </div>
  );
};
