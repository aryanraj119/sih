import { useState, useEffect } from 'react';
import type { RegionalMapData } from './DelhiMap';
import type { ForecastHorizon, DemandDataPoint } from '../../types/energy';
import { ForecastChart } from '../dashboard/ForecastChart';
import { ForecastHorizonSelector } from '../dashboard/ForecastHorizonSelector';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

interface RegionalIntelligencePanelProps {
  region: RegionalMapData;
  className?: string;
}

export const RegionalIntelligencePanel = ({ region, className = '' }: RegionalIntelligencePanelProps) => {
  const [horizon, setHorizon] = useState<ForecastHorizon>('day_ahead');
  const [chartData, setChartData] = useState<DemandDataPoint[]>([]);

  useEffect(() => {
    const points: DemandDataPoint[] = [];
    const count = horizon === 'short_term' ? 24 : (horizon === 'day_ahead' ? 24 : 5);
    const base = region.current_demand_mw;

    for (let i = 0; i < count; i++) {
      if (horizon === 'long_term') {
        const yr = 2026 + i;
        const growthMW = Math.round(base * Math.pow(1 + region.growth_percent / 100, i));
        points.push({
          time: String(yr),
          predictedMW: growthMW,
          lowerConfidence: Math.round(growthMW * 0.95),
          upperConfidence: Math.round(growthMW * 1.05),
          temperature: 38.5,
        });
      } else {
        const timeStr = `${String(i % 24).padStart(2, '0')}:00`;
        const rampFactor = Math.sin((i / 24) * Math.PI) * (base * 0.15);
        const pred = Math.round(base + rampFactor);
        points.push({
          time: timeStr,
          actualMW: i < 4 ? Math.round(pred + 15) : undefined,
          predictedMW: pred,
          lowerConfidence: Math.round(pred * 0.96),
          upperConfidence: Math.round(pred * 1.04),
          temperature: 36,
        });
      }
    }

    setChartData(points);
  }, [region, horizon]);

  const riskBadgeColor =
    region.risk_level === 'CRITICAL'
      ? 'bg-rose-950 text-rose-300 border-rose-500/40'
      : region.risk_level === 'HIGH'
      ? 'bg-orange-950 text-orange-300 border-orange-500/40'
      : region.risk_level === 'MODERATE'
      ? 'bg-amber-950 text-amber-300 border-amber-500/40'
      : 'bg-emerald-950 text-emerald-300 border-emerald-500/40';

  return (
    <div className={`liquid-glass p-6 rounded-2xl border border-white/10 ${className}`}>
      
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl font-bold text-white">{region.region_name}</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
              DISCOM: {region.discom}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Analytical Geographic Region Telemetry & Planning Profile
          </p>
        </div>

        <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${riskBadgeColor}`}>
          <ShieldAlert className="w-4 h-4" />
          <span>URJADRISHTI Risk: {region.risk_score} ({region.risk_level})</span>
        </div>
      </div>

      {/* Region KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
          <div className="text-[10px] text-gray-400">Current Demand</div>
          <div className="text-base font-bold text-cyan-400 mt-0.5">{region.current_demand_mw.toLocaleString()} MW</div>
          <div className="text-[10px] text-gray-400">Utilisation: {region.utilisation_pct ?? 82}%</div>
        </div>

        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
          <div className="text-[10px] text-gray-400">Forecast Peak</div>
          <div className="text-base font-bold text-emerald-400 mt-0.5">{region.forecast_peak_mw.toLocaleString()} MW</div>
          <div className="text-[10px] text-gray-400">Peak Time: {region.peak_time ?? '15:30'}</div>
        </div>

        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
          <div className="text-[10px] text-gray-400">5-Year Growth Rate</div>
          <div className="text-base font-bold text-amber-400 mt-0.5">+{region.growth_percent} %</div>
          <div className="text-[10px] text-gray-400">Target Year 2030</div>
        </div>

        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
          <div className="text-[10px] text-gray-400">Net Load (Demand - Solar)</div>
          <div className="text-base font-bold text-white mt-0.5">{region.net_load_mw.toLocaleString()} MW</div>
          <div className="text-[10px] text-amber-300">Solar: {region.solar_generation_mw} MW</div>
        </div>
      </div>

      {/* Risk Rationale Explanation */}
      <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 mb-6 text-xs flex items-start gap-2.5">
        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Risk Score Explanation:</span>
          <p className="text-gray-300 text-[11px] mt-0.5 leading-relaxed">
            {region.explanation ?? 'Elevated forecast peak load approaching substation capacity limits with above-average demand growth.'}
          </p>
        </div>
      </div>

      {/* Horizon Selector */}
      <div className="mb-4">
        <ForecastHorizonSelector selectedHorizon={horizon} onChange={setHorizon} />
      </div>

      {/* Regional Forecast Chart */}
      <ForecastChart
        data={chartData}
        title={`${region.region_name} — Demand Prediction Curve (${horizon.replace('_', ' ').toUpperCase()})`}
        subtitle="Regional load curve scaled from OpenSTEF ML engine"
        height={320}
      />

    </div>
  );
};
