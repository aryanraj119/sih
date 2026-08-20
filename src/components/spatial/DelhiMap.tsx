import { useState, useRef, useEffect } from 'react';
import type { MapMetricMode } from './MapMetricSelector';
import { MapPin, Camera, Video, X, Zap, Activity, ShieldCheck, Layers } from 'lucide-react';

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

interface SubstationNode {
  id: string;
  name: string;
  type: 'existing_400' | 'proposed_400' | 'existing_220' | 'proposed_220' | 'generation';
  x: number;
  y: number;
  voltage: string;
  capacityMW: number;
  status: 'Optimal' | 'Alert' | 'Proposed';
  regionId: string;
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
  const [viewMode, setViewMode] = useState<'analytical' | 'grid_network'>('analytical');
  const [activeCameraSubstation, setActiveCameraSubstation] = useState<SubstationNode | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Substation dataset matching the SLDC Delhi Power Generation & Transmission Map
  const substations: SubstationNode[] = [
    { id: 'bawana_400', name: 'Bawana 400kV', type: 'existing_400', x: 140, y: 105, voltage: '400/220 kV', capacityMW: 1800, status: 'Optimal', regionId: 'north_west' },
    { id: 'mundka_400', name: 'Mundka 400kV', type: 'existing_400', x: 120, y: 235, voltage: '400/220 kV', capacityMW: 1500, status: 'Optimal', regionId: 'west' },
    { id: 'maharani_bagh_400', name: 'Maharani Bagh 400kV', type: 'existing_400', x: 340, y: 340, voltage: '400/220 kV', capacityMW: 2100, status: 'Alert', regionId: 'south_east' },
    { id: 'bamnaul_400', name: 'Bamnaul 400kV', type: 'existing_400', x: 90, y: 375, voltage: '400/220 kV', capacityMW: 1200, status: 'Optimal', regionId: 'south_west' },
    { id: 'mandola_400', name: 'Mandola 400kV', type: 'existing_400', x: 350, y: 55, voltage: '400/220 kV', capacityMW: 2000, status: 'Optimal', regionId: 'north_east' },
    { id: 'jhatikalan_400', name: 'Jhatikalan 400kV', type: 'existing_400', x: 45, y: 350, voltage: '400/220 kV', capacityMW: 1000, status: 'Optimal', regionId: 'south_west' },
    { id: 'shalimar_bagh_400', name: 'Shalimar Bagh 400kV', type: 'proposed_400', x: 215, y: 155, voltage: '400/220 kV', capacityMW: 1500, status: 'Proposed', regionId: 'north' },
    { id: 'karmapura_400', name: 'Karmapura 400kV', type: 'proposed_400', x: 240, y: 275, voltage: '400/220 kV', capacityMW: 1200, status: 'Proposed', regionId: 'central' },
    { id: 'tughlakabad_400', name: 'Tughlakabad 400kV', type: 'proposed_400', x: 280, y: 430, voltage: '400/220 kV', capacityMW: 1400, status: 'Proposed', regionId: 'south' },
    { id: 'narela_220', name: 'Narela 220kV', type: 'existing_220', x: 210, y: 65, voltage: '220 kV', capacityMW: 600, status: 'Optimal', regionId: 'north_west' },
    { id: 'gopalpur_220', name: 'Gopalpur 220kV', type: 'existing_220', x: 280, y: 155, voltage: '220 kV', capacityMW: 500, status: 'Optimal', regionId: 'north' },
    { id: 'wazirabad_220', name: 'Wazirabad 220kV', type: 'existing_220', x: 310, y: 160, voltage: '220 kV', capacityMW: 700, status: 'Optimal', regionId: 'north_east' },
    { id: 'patparganj_220', name: 'Patparganj 220kV', type: 'existing_220', x: 375, y: 255, voltage: '220 kV', capacityMW: 650, status: 'Optimal', regionId: 'east' },
    { id: 'okhla_220', name: 'Okhla 220kV', type: 'existing_220', x: 310, y: 390, voltage: '220 kV', capacityMW: 800, status: 'Alert', regionId: 'south_east' },
    { id: 'vasant_kunj_220', name: 'Vasant Kunj 220kV', type: 'existing_220', x: 215, y: 340, voltage: '220 kV', capacityMW: 550, status: 'Alert', regionId: 'south' },
    { id: 'hamidpur_220', name: 'Hamidpur 220kV', type: 'proposed_220', x: 245, y: 85, voltage: '220 kV', capacityMW: 450, status: 'Proposed', regionId: 'north' },
    { id: 'sgtn_220', name: 'SGTN 220kV', type: 'proposed_220', x: 240, y: 130, voltage: '220 kV', capacityMW: 400, status: 'Proposed', regionId: 'north' },
    { id: 'ccgt_bawana', name: 'Bawana CCGT Power Gen', type: 'generation', x: 125, y: 105, voltage: 'Generation', capacityMW: 1500, status: 'Optimal', regionId: 'north_west' },
    { id: 'jhajjar_gen', name: 'Jhajjar Power Gen', type: 'generation', x: 25, y: 220, voltage: 'Generation', capacityMW: 1320, status: 'Optimal', regionId: 'west' },
    { id: 'pragati_gt', name: 'Pragati GT Power Gen', type: 'generation', x: 360, y: 320, voltage: 'Generation', capacityMW: 330, status: 'Optimal', regionId: 'south_east' },
    { id: 'btps_gen', name: 'BTPS Power Gen', type: 'generation', x: 340, y: 435, voltage: 'Generation', capacityMW: 705, status: 'Optimal', regionId: 'south_east' },
  ];

  // Camera initialization hook
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    if (activeCameraSubstation) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          activeStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setIsCameraActive(true);
          }
        })
        .catch((err) => {
          setCameraError(err.message || 'Camera permission denied or camera hardware not detected');
          setIsCameraActive(false);
        });
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [activeCameraSubstation]);

  const closeCameraModal = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setActiveCameraSubstation(null);
    setIsCameraActive(false);
    setCameraError(null);
  };

  // Geographic SVG path layouts representing Delhi's 9 analytical regions
  const regionPaths: Record<string, { path: string; labelX: number; labelY: number }> = {
    north: { path: 'M 190 40 L 310 40 L 290 130 L 200 130 Z', labelX: 240, labelY: 85 },
    north_west: { path: 'M 40 50 L 180 40 L 190 170 L 60 170 Z', labelX: 115, labelY: 110 },
    north_east: { path: 'M 320 40 L 440 50 L 420 140 L 300 130 Z', labelX: 370, labelY: 90 },
    west: { path: 'M 40 180 L 180 180 L 170 300 L 30 280 Z', labelX: 105, labelY: 240 },
    central: { path: 'M 190 140 L 300 140 L 290 240 L 180 230 Z', labelX: 240, labelY: 185 },
    east: { path: 'M 310 140 L 440 150 L 420 250 L 300 240 Z', labelX: 370, labelY: 195 },
    south_west: { path: 'M 30 290 L 170 310 L 160 440 L 20 410 Z', labelX: 95, labelY: 375 },
    south: { path: 'M 180 240 L 290 250 L 270 450 L 170 440 Z', labelX: 225, labelY: 345 },
    south_east: { path: 'M 300 250 L 430 260 L 400 440 L 280 440 Z', labelX: 350, labelY: 345 },
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
            Delhi Spatial Grid Intelligence & Transmission Network
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Click any region or tap the <span className="text-cyan-300 font-bold">📹 Camera Circle</span> to open live laptop camera inspection feed
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setViewMode('analytical')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'analytical'
                ? 'bg-cyan-500 text-black shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Heatmap Regions</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('grid_network')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'grid_network'
                ? 'bg-cyan-500 text-black shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Grid Transmission Map</span>
          </button>
        </div>
      </div>

      {/* SVG Interactive Map Container */}
      <div className="relative w-full h-[480px] flex items-center justify-center bg-black/50 rounded-xl border border-white/5 p-4 overflow-hidden">
        <svg
          viewBox="0 0 460 480"
          className="w-full h-full max-w-[500px] max-h-[480px] drop-shadow-2xl transition-all"
        >
          {/* Base Region Polygons */}
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
                  fillOpacity={viewMode === 'grid_network' ? 0.25 : isSelected ? 0.95 : isHovered ? 0.8 : 0.5}
                  stroke={isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.25)'}
                  strokeWidth={isSelected ? 3 : 1.5}
                  className="transition-all duration-200 hover:stroke-white hover:stroke-2"
                />

                {/* Region Text Labels */}
                {viewMode === 'analytical' && (
                  <>
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
                  </>
                )}
              </g>
            );
          })}

          {/* SLDC Power Transmission Lines Overlay (400kV & 220kV OH/UG) */}
          {/* Existing 400kV Double Circuit (Red Solid Line) */}
          <line x1="350" y1="55" x2="310" y2="160" stroke="#ef4444" strokeWidth="2.5" />
          <line x1="310" y1="160" x2="340" y2="340" stroke="#ef4444" strokeWidth="2.5" />
          <line x1="340" y1="340" x2="280" y2="430" stroke="#ef4444" strokeWidth="2.5" />
          
          {/* Proposed 400kV Double Circuit (Red Dotted Line) */}
          <line x1="140" y1="105" x2="215" y2="155" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" />
          <line x1="215" y1="155" x2="240" y2="275" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" />
          <line x1="240" y1="275" x2="340" y2="340" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" />

          {/* Existing 220kV Overhead Line (Green Solid Line) */}
          <line x1="210" y1="65" x2="140" y2="105" stroke="#10b981" strokeWidth="2" />
          <line x1="140" y1="105" x2="120" y2="235" stroke="#10b981" strokeWidth="2" />
          <line x1="120" y1="235" x2="90" y2="375" stroke="#10b981" strokeWidth="2" />
          <line x1="90" y1="375" x2="45" y2="350" stroke="#10b981" strokeWidth="2" />

          {/* Existing 220kV Underground Cable Line (Blue Solid Line) */}
          <line x1="310" y1="160" x2="375" y2="255" stroke="#3b82f6" strokeWidth="2" />
          <line x1="375" y1="255" x2="310" y2="390" stroke="#3b82f6" strokeWidth="2" />
          <line x1="310" y1="390" x2="215" y2="340" stroke="#3b82f6" strokeWidth="2" />
          <line x1="215" y1="340" x2="90" y2="375" stroke="#3b82f6" strokeWidth="2" />

          {/* Substation Nodes & Clickable Camera Circles */}
          {substations.map((sub) => (
            <g
              key={sub.id}
              onClick={(e) => {
                e.stopPropagation();
                setActiveCameraSubstation(sub);
              }}
              className="cursor-pointer group"
            >
              {/* Generation Nodes (Red Rectangle) */}
              {sub.type === 'generation' && (
                <g>
                  <rect x={sub.x - 10} y={sub.y - 7} width="20" height="14" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" rx="2" />
                  <text x={sub.x} y={sub.y + 3} textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold" pointerEvents="none">GEN</text>
                </g>
              )}

              {/* Existing 400/220kV Substation (Red Triangle with Blue Circle Inside) */}
              {sub.type === 'existing_400' && (
                <g>
                  <polygon points={`${sub.x},${sub.y - 12} ${sub.x - 10},${sub.y + 7} ${sub.x + 10},${sub.y + 7}`} fill="none" stroke="#ef4444" strokeWidth="2" />
                  <circle cx={sub.x} cy={sub.y} r="4" fill="#3b82f6" />
                </g>
              )}

              {/* Proposed 400/220kV Substation (Red Triangle with Green Circle Inside) */}
              {sub.type === 'proposed_400' && (
                <g>
                  <polygon points={`${sub.x},${sub.y - 12} ${sub.x - 10},${sub.y + 7} ${sub.x + 10},${sub.y + 7}`} fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="2 2" />
                  <circle cx={sub.x} cy={sub.y} r="4" fill="#10b981" />
                </g>
              )}

              {/* Existing 220kV Substation (Blue Circle) */}
              {sub.type === 'existing_220' && (
                <circle cx={sub.x} cy={sub.y} r="6" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
              )}

              {/* Proposed 220kV Substation (Green Circle) */}
              {sub.type === 'proposed_220' && (
                <circle cx={sub.x} cy={sub.y} r="6" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="2 2" />
              )}

              {/* PULSING CLICKABLE CAMERA TRIGGER CIRCLE (Tap to open laptop camera) */}
              <circle
                cx={sub.x}
                cy={sub.y}
                r="12"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="1.5"
                className="animate-ping opacity-75 group-hover:stroke-amber-400"
              />
              <circle
                cx={sub.x}
                cy={sub.y}
                r="10"
                fill="rgba(6, 182, 212, 0.2)"
                stroke="#22d3ee"
                strokeWidth="1"
                className="group-hover:fill-amber-500/30 group-hover:stroke-amber-300 transition-colors"
              />

              {/* Substation Label */}
              <text
                x={sub.x}
                y={sub.y + 16}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="8"
                fontWeight="600"
                className="drop-shadow-sm pointer-events-none group-hover:fill-cyan-300"
              >
                {sub.name}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Card */}
        {hoveredRegion && !activeCameraSubstation && (
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

        {/* Transmission & Substation Dynamic Map Legend */}
        <div className="absolute bottom-3 left-3 liquid-glass p-3 rounded-xl border border-white/10 text-[10px] bg-black/80 max-w-[380px] shadow-xl backdrop-blur-md">
          <div className="text-white font-bold text-xs mb-1.5 flex items-center gap-1.5 border-b border-white/10 pb-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>POWER GENERATION & TRANSMISSION LEGEND</span>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-gray-300">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-2 bg-rose-500 rounded-sm border border-white"></span>
              <span>Generation (XX)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white"></span>
              <span>Existing 220kV Substation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 flex items-center justify-center border border-rose-500">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              </span>
              <span>Existing 400/220kV Grid</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white"></span>
              <span>Proposed 220kV Substation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 flex items-center justify-center border border-rose-500 border-dashed">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </span>
              <span>Proposed 400/220kV Grid</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-rose-500"></span>
              <span>400kV Line (Existing)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-emerald-500"></span>
              <span>220kV Overhead (Existing)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-rose-500 border-b border-dashed border-rose-500"></span>
              <span>400kV Line (Proposed)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-blue-500"></span>
              <span>220kV Underground (Cable)</span>
            </div>
            <div className="flex items-center gap-1.5 text-cyan-300 font-semibold col-span-2 mt-1 border-t border-white/10 pt-1">
              <Camera className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>Tap Substation Circle to Open Laptop Camera</span>
            </div>
          </div>
        </div>
      </div>

      {/* LIVE SUBSTATION LAPTOP CAMERA FEED MODAL */}
      {activeCameraSubstation && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-2xl liquid-glass rounded-2xl border border-cyan-500/50 bg-black/95 overflow-hidden shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 bg-cyan-950/70 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                  <Video className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <span>{activeCameraSubstation.name}</span>
                    <span className="px-2 py-0.5 text-[10px] rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 uppercase font-mono">
                      LIVE OPTICAL FEED
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400">
                    SLDC Optical Inspection • Voltage: {activeCameraSubstation.voltage} • Capacity: {activeCameraSubstation.capacityMW} MW
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeCameraModal}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Feed Screen */}
            <div className="relative w-full h-[360px] bg-gray-950 flex items-center justify-center overflow-hidden border-b border-white/10">
              
              {/* Live Laptop Video Stream Element */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
              />

              {/* Camera Offline / Fallback Optical Scanner Feed */}
              {!isCameraActive && (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 animate-pulse">
                    <Camera className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-sm text-white mb-1">Substation Optical Camera Initializing...</h4>
                  <p className="text-xs text-gray-400 max-w-md mb-4">
                    {cameraError || 'Requesting web browser camera permissions to display live optical substation inspection feed.'}
                  </p>
                  
                  {/* Simulated High-Tech Substation Surveillance Radar */}
                  <div className="w-64 h-32 liquid-glass rounded-xl border border-cyan-500/30 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.15),transparent)] animate-pulse" />
                    <Activity className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
                    <span className="text-[10px] text-cyan-300 font-mono">SLDC OPTICAL SIMULATION ACTIVE</span>
                    <span className="text-[9px] text-gray-400 font-mono mt-0.5">SUBSTATION TEMP: 34.2°C • THERMAL NORMAL</span>
                  </div>
                </div>
              )}

              {/* Live HUD Overlay */}
              <div className="absolute top-3 left-3 bg-black/60 px-3 py-1.5 rounded-lg border border-white/10 text-[11px] font-mono text-cyan-300 flex items-center gap-2 backdrop-blur-sm pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>REC • SLDC-CAM-{activeCameraSubstation.id.toUpperCase()}</span>
              </div>

              <div className="absolute bottom-3 right-3 bg-black/60 px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-mono text-gray-300 flex items-center gap-3 backdrop-blur-sm pointer-events-none">
                <span>FPS: 30.0</span>
                <span>RES: 1280x720</span>
                <span>STATUS: OPTIMAL</span>
              </div>
            </div>

            {/* Modal Footer Telemetry */}
            <div className="p-4 bg-black/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-4 text-gray-300">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Substation Telemetry: Normal</span>
                </div>
                <div>
                  <span>Current Load: </span>
                  <strong className="text-white">{(activeCameraSubstation.capacityMW * 0.72).toFixed(0)} MW</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={closeCameraModal}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-colors cursor-pointer"
              >
                Close Inspection Feed
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
