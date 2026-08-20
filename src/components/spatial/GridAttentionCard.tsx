import type { RegionalMapData } from './DelhiMap';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface GridAttentionCardProps {
  regions: RegionalMapData[];
  onSelectRegion: (regionId: string) => void;
  className?: string;
}

export const GridAttentionCard = ({ regions, onSelectRegion, className = '' }: GridAttentionCardProps) => {
  const highRiskRegions = regions.filter((r) => r.risk_score >= 50.0 || r.risk_level === 'HIGH' || r.risk_level === 'CRITICAL');

  return (
    <div className={`liquid-glass p-6 rounded-2xl border border-rose-500/30 bg-rose-950/10 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Grid Attention & Planning Advisory</h2>
            <p className="text-xs text-gray-400">Regions requiring heightened operational & transformer planning attention</p>
          </div>
        </div>

        <span className="text-xs font-bold text-rose-300 bg-rose-950/80 px-3 py-1 rounded-full border border-rose-500/40">
          {highRiskRegions.length} Regions Highlighted
        </span>
      </div>

      <div className="space-y-3">
        {highRiskRegions.map((r) => (
          <div
            key={r.region_id}
            onClick={() => onSelectRegion(r.region_id)}
            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{r.region_name}</span>
                <span className="text-xs font-semibold text-cyan-400">({r.discom})</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-500/40">
                  Risk: {r.risk_score} ({r.risk_level})
                </span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">{r.explanation}</p>
            </div>

            <div className="shrink-0 text-right">
              <div className="text-xs font-bold text-emerald-400">{r.forecast_peak_mw.toLocaleString()} MW Peak</div>
              <div className="text-[10px] text-amber-300">Growth: +{r.growth_percent}%</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-rose-500/20 text-[11px] text-rose-200/80 flex items-center gap-1.5">
        <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
        <span>
          <strong>Planning Notice:</strong> Risk scores represent analytical planning indicators for grid asset management and do not constitute emergency power cut warnings.
        </span>
      </div>
    </div>
  );
};
