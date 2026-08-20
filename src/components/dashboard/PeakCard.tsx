import { TrendingUp, ShieldCheck } from 'lucide-react';

interface PeakCardProps {
  peakMW: number;
  peakTime: string;
  marginStatus?: string;
  className?: string;
}

export const PeakCard = ({
  peakMW,
  peakTime,
  marginStatus = 'SAFE',
  className = '',
}: PeakCardProps) => {
  return (
    <div className={`liquid-glass p-4 rounded-xl border border-white/10 ${className}`}>
      <div className="flex items-center justify-between text-xs text-gray-400 font-medium mb-1">
        <span>Predicted Peak Demand</span>
        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
      </div>
      <div className="text-xl font-bold text-emerald-400 flex items-baseline gap-1">
        {peakMW.toLocaleString()} <span className="text-xs text-gray-300 font-normal">MW</span>
      </div>
      <div className="text-[11px] text-gray-400 mt-1 flex items-center justify-between">
        <span>Time: <strong className="text-white">{peakTime}</strong></span>
        <span className="text-emerald-400 flex items-center gap-0.5">
          <ShieldCheck className="w-3 h-3" /> {marginStatus}
        </span>
      </div>
    </div>
  );
};
