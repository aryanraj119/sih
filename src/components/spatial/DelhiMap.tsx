import { useState } from 'react';
import type { MapMetricMode } from './MapMetricSelector';
import { MapPin, Info } from 'lucide-react';

export interface RegionalMapData {
  region_id: string;
  region_name: string;
  discom: string;
  current_demand_mw: number;
  forecast_demand_mw: number;
  forecast_peak_mw: number;
  growth_percent: number;
  solar_generation_mw: number;
  net_load_mw: number;
  risk_score: number;
  risk_level: string;
  explanation?: string;
  utilisation_pct?: number;
  peak_time?: string;
}

interface DelhiMapProps {
  regions: RegionalMapData[];
  selectedMetric: MapMetricMode;
  selectedRegionId: string;
  onSelectRegion: (regionId: string) => void;
  className?: string;
}

export const DelhiMap = ({
  regions,
  selectedMetric,
  selectedRegionId,
  onSelectRegion,
  className = '',
}: DelhiMapProps) => {
  const [hoveredRegion, setHoveredRegion] = useState<RegionalMapData | null>(null);

  // Geographic SVG path layouts representing Delhi's 9 analytical regions
  const regionPaths: Record<string, { path: string; labelX: number; labelY: number }> = {
    north: {
      path: 'M 190 40 L 310 40 L 290 130 L 200 130 Z',
      labelX: 240,
      labelY: 85,
    },
    north_west: {
      path: 'M 40 50 L 180 40 L 190 170 L 60 170 Z',
      labelX: 115,
      labelY: 110,
    },
    north_east: {
      path: 'M 320 40 L 440 50 L 420 140 L 300 130 Z',
      labelX: 370,
      labelY: 90,
    },
    west: {
      path: 'M 40 180 L 180 180 L 170 300 L 30 280 Z',
      labelX: 105,
      labelY: 240,
    },
    central: {
      path: 'M 190 140 L 300 140 L 290 240 L 180 230 Z',
      labelX: 240,
      labelY: 185,
    },
    east: {
      path: 'M 310 140 L 440 150 L 420 250 L 300 240 Z',
      labelX: 370,
      labelY: 195,
    },
    south_west: {
      path: 'M 30 290 L 170 310 L 160 440 L 20 410 Z',
      labelX: 95,
      labelY: 375,
    },
    south: {
      path: 'M 180 240 L 290 250 L 270 450 L 170 440 Z',
      labelX: 225,
      labelY: 345,
    },
    south_east: {
      path: 'M 300 250 L 430 260 L 400 440 L 280 440 Z',
      labelX: 350,
      labelY: 345,
    },
  };

  const getMetricValue = (reg: RegionalMapData) => {
    switch (selectedMetric) {
      case 'current_demand':
        return `${reg.current_demand_mw.toLocaleString()} MW`;
      case 'forecast_demand':
        return `${reg.forecast_demand_mw.toLocaleString()} MW`;
      case 'peak_demand':
        return `${reg.forecast_peak_mw.toLocaleString()} MW`;
      case 'growth_percent':
        return `+${reg.growth_percent}%`;
      case 'risk_score':
        return `${reg.risk_score} (${reg.risk_level})`;
      case 'net_load':
        return `${reg.net_load_mw.toLocaleString()} MW`;
      default:
        return `${reg.current_demand_mw} MW`;
    }
  };

  const getFillColor = (reg: RegionalMapData) => {
    const isSelected = reg.region_id === selectedRegionId;
    
    if (selectedMetric === 'risk_score') {
      if (reg.risk_score >= 75) return isSelected ? '#f43f5e' : '#e11d48';
      if (reg.risk_score >= 50) return isSelected ? '#fb923c' : '#f97316';
      if (reg.risk_score >= 25) return isSelected ? '#facc15' : '#eab308';
      return isSelected ? '#34d399' : '#10b981';
    }

    if (selectedMetric === 'growth_percent') {
      if (reg.growth_percent >= 7.0) return isSelected ? '#c084fc' : '#a855f7';
      if (reg.growth_percent >= 6.0) return isSelected ? '#818cf8' : '#6366f1';
      return isSelected ? '#38bdf8' : '#0284c7';
    }

    // Default Demand & Net Load scale (cyan to emerald)
    const ratio = reg.current_demand_mw / 2000.0;
    if (ratio > 0.8) return isSelected ? '#22d3ee' : '#06b6d4';
    if (ratio > 0.5) return isSelected ? '#34d399' : '#10b981';
    return isSelected ? '#60a5fa' : '#3b82f6';
  };

  return (
    <div className={`liquid-glass p-6 rounded-2xl border border-white/10 relative overflow-hidden ${className}`}>
      
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            Delhi Spatial Grid Map
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Click any region to inspect telemetry, load curves, and grid attention advisories
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded border border-amber-500/30 font-mono font-semibold flex items-center gap-1">
            <Info className="w-3 h-3 text-amber-400" /> ANALYTICAL REGIONAL VIEW (DEMO)
          </span>
        </div>
      </div>

      {/* SVG Interactive Map Container */}
      <div className="relative w-full h-[460px] flex items-center justify-center bg-black/40 rounded-xl border border-white/5 p-4">
        <svg
          viewBox="0 0 460 480"
          className="w-full h-full max-w-[500px] max-h-[460px] drop-shadow-2xl transition-all"
        >
          {regions.map((reg) => {
            const pathInfo = regionPaths[reg.region_id];
            if (!pathInfo) return null;

            const isSelected = reg.region_id === selectedRegionId;
            const isHovered = hoveredRegion?.region_id === reg.region_id;
            const color = getFillColor(reg);

            return (
              <g
                key={reg.region_id}
                onClick={() => onSelectRegion(reg.region_id)}
                onMouseEnter={() => setHoveredRegion(reg)}
                onMouseLeave={() => setHoveredRegion(null)}
                className="cursor-pointer transition-all duration-200"
              >
                <path
                  d={pathInfo.path}
                  fill={color}
                  fillOpacity={isSelected ? 0.95 : isHovered ? 0.8 : 0.5}
                  stroke={isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.25)'}
                  strokeWidth={isSelected ? 3 : 1.5}
                  className="transition-all duration-200 hover:stroke-white hover:stroke-2"
                />

                {/* Region Code & Metric Label */}
                <text
                  x={pathInfo.labelX}
                  y={pathInfo.labelY - 6}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="700"
                  pointerEvents="none"
                  className="drop-shadow-md"
                >
                  {reg.region_name.split(' ')[0]}
                </text>

                <text
                  x={pathInfo.labelX}
                  y={pathInfo.labelY + 8}
                  textAnchor="middle"
                  fill="rgba(255, 255, 255, 0.85)"
                  fontSize="9"
                  fontWeight="600"
                  pointerEvents="none"
                >
                  {getMetricValue(reg)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Card */}
        {hoveredRegion && (
          <div className="absolute top-4 right-4 liquid-glass p-3.5 rounded-xl border border-cyan-500/40 bg-black/90 text-xs shadow-xl backdrop-blur-md pointer-events-none z-20 animate-fadeIn">
            <div className="font-bold text-white text-sm mb-1">{hoveredRegion.region_name}</div>
            <div className="text-[11px] text-cyan-300 mb-2">DISCOM: {hoveredRegion.discom}</div>

            <div className="space-y-1 text-gray-300 text-[11px]">
              <div className="flex justify-between gap-4">
                <span>Current Load:</span>
                <strong className="text-white">{hoveredRegion.current_demand_mw} MW</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span>Forecast Peak:</span>
                <strong className="text-emerald-400">{hoveredRegion.forecast_peak_mw} MW</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span>5-Yr Growth:</span>
                <strong className="text-amber-400">+{hoveredRegion.growth_percent}%</strong>
              </div>
              <div className="flex justify-between gap-4 border-t border-white/10 pt-1">
                <span>Risk Score:</span>
                <strong className="text-rose-400">{hoveredRegion.risk_score} ({hoveredRegion.risk_level})</strong>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Legend */}
        <div className="absolute bottom-4 left-4 liquid-glass px-3.5 py-2 rounded-lg border border-white/10 text-[11px] flex items-center gap-3">
          <span className="text-gray-400 font-semibold uppercase">Legend:</span>
          {selectedMetric === 'risk_score' ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Low</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> Moderate</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> High</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Critical</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Moderate Load</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> High Demand</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Peak Load</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
