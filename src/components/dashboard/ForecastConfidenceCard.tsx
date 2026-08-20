import { ShieldCheck, Cpu } from 'lucide-react';

interface ForecastConfidenceCardProps {
  maeMW?: number;
  mapePercent?: number;
  rmseMW?: number;
  p10P90CoveragePct?: number;
  className?: string;
}

export const ForecastConfidenceCard = ({
  maeMW = 84.2,
  mapePercent = 1.38,
  rmseMW = 112.5,
  p10P90CoveragePct = 94.8,
  className = '',
}: ForecastConfidenceCardProps) => {
  return (
    <div className={`liquid-glass p-4 rounded-xl border border-white/10 ${className}`}>
      <div className="flex items-center justify-between text-xs text-gray-400 font-medium mb-2 border-b border-white/10 pb-2">
        <span>OpenSTEF Accuracy Telemetry</span>
        <Cpu className="w-3.5 h-3.5 text-cyan-400" />
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-400">MAPE Accuracy:</span>
          <span className="font-bold text-emerald-400">{mapePercent} %</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">Mean Abs Error (MAE):</span>
          <span className="font-bold text-cyan-400">{maeMW} MW</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">P10-P90 Coverage:</span>
          <span className="font-bold text-white flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> {p10P90CoveragePct}%
          </span>
        </div>

        <div className="flex justify-between border-t border-white/10 pt-1.5 text-[11px]">
          <span className="text-gray-400">RMSE Error:</span>
          <span className="font-semibold text-amber-400">{rmseMW} MW</span>
        </div>
      </div>
    </div>
  );
};
