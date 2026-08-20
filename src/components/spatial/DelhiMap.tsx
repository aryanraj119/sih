import { useState, useRef, useEffect } from 'react';
import type { MapMetricMode } from './MapMetricSelector';
import { MapPin, Camera, Video, X, Activity, ShieldCheck, Layers } from 'lucide-react';

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

interface ImageSubstationNode {
  id: string;
  name: string;
  type: 'existing_400' | 'proposed_400' | 'existing_220' | 'proposed_220' | 'generation';
  x: number; // % X coordinate on image map
  y: number; // % Y coordinate on image map
  voltage: string;
  capacityMW: number;
  status: 'Optimal' | 'Alert' | 'Proposed';
  discom: 'BRPL' | 'BYPL' | 'TPDDL';
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
  const [hoveredSubstation, setHoveredSubstation] = useState<ImageSubstationNode | null>(null);
  const [activeCameraSubstation, setActiveCameraSubstation] = useState<ImageSubstationNode | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [showAnalyticalHeatmap, setShowAnalyticalHeatmap] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Exact Substation Coordinates mapped directly onto the SLDC Delhi Power Generation & Transmission Map Image
  const mapSubstations: ImageSubstationNode[] = [
    { id: 'mandola_400', name: 'Mandola 400kV Substation', type: 'existing_400', x: 74.0, y: 10.5, voltage: '400/220 kV', capacityMW: 2000, status: 'Optimal', discom: 'TPDDL' },
    { id: 'narela_220', name: 'Narela 220kV Substation', type: 'existing_220', x: 45.0, y: 13.0, voltage: '220 kV', capacityMW: 600, status: 'Optimal', discom: 'TPDDL' },
    { id: 'hamidpur_400', name: 'Hamidpur 400kV Substation', type: 'proposed_400', x: 52.0, y: 19.0, voltage: '400/220 kV', capacityMW: 1500, status: 'Proposed', discom: 'TPDDL' },
    { id: 'ccgt_bawana', name: 'Bawana CCGT Power Gen', type: 'generation', x: 30.0, y: 23.5, voltage: 'Generation', capacityMW: 1500, status: 'Optimal', discom: 'TPDDL' },
    { id: 'bawana_400', name: 'Bawana 400kV Substation', type: 'existing_400', x: 31.0, y: 24.5, voltage: '400/220 kV', capacityMW: 1800, status: 'Optimal', discom: 'TPDDL' },
    { id: 'kanjhawala_220', name: 'Kanjhawala 220kV Substation', type: 'existing_220', x: 27.0, y: 32.0, voltage: '220 kV', capacityMW: 450, status: 'Optimal', discom: 'TPDDL' },
    { id: 'rohini_2', name: 'Rohini-2 220kV Substation', type: 'existing_220', x: 35.0, y: 30.5, voltage: '220 kV', capacityMW: 500, status: 'Optimal', discom: 'TPDDL' },
    { id: 'rohini_1', name: 'Rohini-1 220kV Substation', type: 'existing_220', x: 34.5, y: 38.0, voltage: '220 kV', capacityMW: 480, status: 'Optimal', discom: 'TPDDL' },
    { id: 'rohini_34', name: 'Rohini-34 220kV Substation', type: 'proposed_220', x: 31.5, y: 40.5, voltage: '220 kV', capacityMW: 400, status: 'Proposed', discom: 'TPDDL' },
    { id: 'shalimar_bagh_400', name: 'Shalimar Bagh 400kV Substation', type: 'proposed_400', x: 47.0, y: 31.5, voltage: '400/220 kV', capacityMW: 1500, status: 'Proposed', discom: 'TPDDL' },
    { id: 'sgtn_220', name: 'SGTN 220kV Substation', type: 'proposed_220', x: 51.0, y: 26.0, voltage: '220 kV', capacityMW: 400, status: 'Proposed', discom: 'TPDDL' },
    { id: 'gopalpur_220', name: 'Gopalpur 220kV Substation', type: 'existing_220', x: 60.0, y: 31.0, voltage: '220 kV', capacityMW: 500, status: 'Optimal', discom: 'TPDDL' },
    { id: 'wazirabad_220', name: 'Wazirabad 220kV Substation', type: 'existing_220', x: 68.5, y: 33.0, voltage: '220 kV', capacityMW: 700, status: 'Optimal', discom: 'BYPL' },
    { id: 'harsh_vihar_400', name: 'Harsh Vihar 400kV Substation', type: 'existing_400', x: 76.0, y: 38.0, voltage: '400/220 kV', capacityMW: 1200, status: 'Optimal', discom: 'BYPL' },
    { id: 'mundka_400', name: 'Mundka 400kV Substation', type: 'existing_400', x: 26.5, y: 50.5, voltage: '400/220 kV', capacityMW: 1500, status: 'Optimal', discom: 'BRPL' },
    { id: 'jhajjar_gen', name: 'Jhajjar Power Gen', type: 'generation', x: 7.0, y: 46.0, voltage: 'Generation', capacityMW: 1320, status: 'Optimal', discom: 'BRPL' },
    { id: 'peeragarhi_220', name: 'Peeragarhi 220kV Substation', type: 'existing_220', x: 37.5, y: 52.5, voltage: '220 kV', capacityMW: 520, status: 'Optimal', discom: 'BRPL' },
    { id: 'karmapura_400', name: 'Karmapura 400kV Substation', type: 'proposed_400', x: 52.5, y: 46.5, voltage: '400/220 kV', capacityMW: 1200, status: 'Proposed', discom: 'BYPL' },
    { id: 'seelampur_220', name: 'Seelampur 220kV Substation', type: 'existing_220', x: 74.0, y: 44.0, voltage: '220 kV', capacityMW: 450, status: 'Optimal', discom: 'BYPL' },
    { id: 'geeta_colony_220', name: 'Geeta Colony 220kV Substation', type: 'existing_220', x: 76.0, y: 48.0, voltage: '220 kV', capacityMW: 500, status: 'Optimal', discom: 'BYPL' },
    { id: 'preet_vihar_220', name: 'Preet Vihar 220kV Substation', type: 'existing_220', x: 84.0, y: 45.0, voltage: '220 kV', capacityMW: 550, status: 'Optimal', discom: 'BYPL' },
    { id: 'patparganj_220', name: 'Patparganj 220kV Substation', type: 'existing_220', x: 80.5, y: 52.0, voltage: '220 kV', capacityMW: 650, status: 'Optimal', discom: 'BYPL' },
    { id: 'gazipur_220', name: 'Gazipur 220kV Substation', type: 'existing_220', x: 87.5, y: 57.5, voltage: '220 kV', capacityMW: 600, status: 'Optimal', discom: 'BYPL' },
    { id: 'najafgarh_220', name: 'Najafgarh 220kV Substation', type: 'existing_220', x: 24.5, y: 61.5, voltage: '220 kV', capacityMW: 480, status: 'Optimal', discom: 'BRPL' },
    { id: 'budeila_220', name: 'Budeila 220kV Substation', type: 'proposed_220', x: 38.5, y: 57.0, voltage: '220 kV', capacityMW: 400, status: 'Proposed', discom: 'BRPL' },
    { id: 'pusa_220', name: 'Pusa 220kV Substation', type: 'proposed_220', x: 46.5, y: 56.5, voltage: '220 kV', capacityMW: 450, status: 'Proposed', discom: 'BYPL' },
    { id: 'park_st_220', name: 'Park St 220kV Substation', type: 'existing_220', x: 58.5, y: 54.5, voltage: '220 kV', capacityMW: 500, status: 'Optimal', discom: 'BYPL' },
    { id: 'electric_lane_220', name: 'Electric Lane 220kV Substation', type: 'existing_220', x: 64.5, y: 60.5, voltage: '220 kV', capacityMW: 420, status: 'Optimal', discom: 'BYPL' },
    { id: 'pragati_gt', name: 'Pragati GT Power Gen', type: 'generation', x: 79.0, y: 64.5, voltage: 'Generation', capacityMW: 330, status: 'Optimal', discom: 'BRPL' },
    { id: 'maharani_bagh_400', name: 'Maharani Bagh 400kV Substation', type: 'existing_400', x: 74.5, y: 69.5, voltage: '400/220 kV', capacityMW: 2100, status: 'Alert', discom: 'BRPL' },
    { id: 'jhatikalan_400', name: 'Jhatikalan 400kV Substation', type: 'existing_400', x: 8.0, y: 71.5, voltage: '400/220 kV', capacityMW: 1000, status: 'Optimal', discom: 'BRPL' },
    { id: 'bamnaul_400', name: 'Bamnaul 400kV Substation', type: 'existing_400', x: 18.5, y: 78.0, voltage: '400/220 kV', capacityMW: 1200, status: 'Optimal', discom: 'BRPL' },
    { id: 'papan_kalan_220', name: 'Papan Kalan 220kV Substation', type: 'existing_220', x: 24.0, y: 69.5, voltage: '220 kV', capacityMW: 550, status: 'Optimal', discom: 'BRPL' },
    { id: 'janakpuri_220', name: 'Janakpuri 220kV Substation', type: 'existing_220', x: 32.5, y: 66.5, voltage: '220 kV', capacityMW: 600, status: 'Optimal', discom: 'BRPL' },
    { id: 'naraina_220', name: 'Naraina 220kV Substation', type: 'existing_220', x: 39.5, y: 63.5, voltage: '220 kV', capacityMW: 480, status: 'Optimal', discom: 'BRPL' },
    { id: 'dial_220', name: 'DIAL 220kV Substation', type: 'existing_220', x: 38.0, y: 71.5, voltage: '220 kV', capacityMW: 750, status: 'Optimal', discom: 'BRPL' },
    { id: 'ridge_valley_220', name: 'Ridge Valley 220kV Substation', type: 'existing_220', x: 50.5, y: 63.0, voltage: '220 kV', capacityMW: 420, status: 'Optimal', discom: 'BRPL' },
    { id: 'vasant_kunj_220', name: 'Vasant Kunj 220kV Substation', type: 'existing_220', x: 47.5, y: 69.5, voltage: '220 kV', capacityMW: 550, status: 'Alert', discom: 'BRPL' },
    { id: 'mehrauli_220', name: 'Mehrauli 220kV Substation', type: 'existing_220', x: 45.0, y: 74.5, voltage: '220 kV', capacityMW: 500, status: 'Optimal', discom: 'BRPL' },
    { id: 'rangpuri_400', name: 'Rangpuri 400kV Substation', type: 'proposed_400', x: 39.0, y: 78.5, voltage: '400/220 kV', capacityMW: 1000, status: 'Proposed', discom: 'BRPL' },
    { id: 'lodhi_rd_220', name: 'Lodhi Rd 220kV Substation', type: 'existing_220', x: 59.5, y: 66.5, voltage: '220 kV', capacityMW: 480, status: 'Optimal', discom: 'BRPL' },
    { id: 'rk_puram_220', name: 'RK Puram 220kV Substation', type: 'proposed_220', x: 55.0, y: 71.5, voltage: '220 kV', capacityMW: 400, status: 'Proposed', discom: 'BRPL' },
    { id: 'maidan_garhi_220', name: 'Maidan Garhi 220kV Substation', type: 'proposed_220', x: 53.5, y: 76.5, voltage: '220 kV', capacityMW: 380, status: 'Proposed', discom: 'BRPL' },
    { id: 'aiims_220', name: 'AIIMS 220kV Substation', type: 'existing_220', x: 59.0, y: 71.5, voltage: '220 kV', capacityMW: 600, status: 'Optimal', discom: 'BRPL' },
    { id: 'masjid_moth_220', name: 'Masjid Moth 220kV Substation', type: 'proposed_220', x: 58.5, y: 79.5, voltage: '220 kV', capacityMW: 400, status: 'Proposed', discom: 'BRPL' },
    { id: 'okhla_220', name: 'Okhla 220kV Substation', type: 'existing_220', x: 67.0, y: 81.5, voltage: '220 kV', capacityMW: 800, status: 'Alert', discom: 'BRPL' },
    { id: 'nehru_place_220', name: 'Nehru Place 220kV Substation', type: 'proposed_220', x: 66.0, y: 75.5, voltage: '220 kV', capacityMW: 450, status: 'Proposed', discom: 'BRPL' },
    { id: 'jasola_220', name: 'Jasola 220kV Substation', type: 'proposed_220', x: 75.5, y: 76.0, voltage: '220 kV', capacityMW: 420, status: 'Proposed', discom: 'BRPL' },
    { id: 'sarita_vihar_220', name: 'Sarita Vihar 220kV Substation', type: 'existing_220', x: 74.0, y: 82.0, voltage: '220 kV', capacityMW: 580, status: 'Optimal', discom: 'BRPL' },
    { id: 'btps_gen', name: 'BTPS Power Gen', type: 'generation', x: 71.5, y: 91.5, voltage: 'Generation', capacityMW: 705, status: 'Optimal', discom: 'BRPL' },
    { id: 'tughlakabad_400', name: 'Tughlakabad 400kV Substation', type: 'proposed_400', x: 60.0, y: 89.0, voltage: '400/220 kV', capacityMW: 1400, status: 'Proposed', discom: 'BRPL' },
    { id: 'samaypur_400', name: 'Samaypur 400kV Substation', type: 'existing_400', x: 75.5, y: 98.0, voltage: '400/220 kV', capacityMW: 1800, status: 'Optimal', discom: 'BRPL' },
  ];

  const selectedRegion = regions.find((r) => r.region_id === selectedRegionId);

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

  return (
    <div className={`liquid-glass p-6 rounded-2xl border border-white/10 relative overflow-hidden ${className}`}>
      
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            Delhi Power Generation & Transmission Network Map
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Click any <span className="text-cyan-300 font-bold">📹 Glowing Substation Node</span> directly on the SLDC Map image to open your laptop camera feed
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedRegion && (
            <span className="text-xs font-semibold text-cyan-300 bg-cyan-950/60 px-3 py-1.5 rounded-xl border border-cyan-500/30">
              Selected: {selectedRegion.region_name} ({selectedMetric})
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowAnalyticalHeatmap(!showAnalyticalHeatmap)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
              showAnalyticalHeatmap
                ? 'bg-cyan-500 text-black border-cyan-400 shadow-lg'
                : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showAnalyticalHeatmap ? 'Hide Analytical Overlay' : 'Show Analytical Overlay'}</span>
          </button>
        </div>
      </div>

      {/* Primary Container: Exact SLDC Map Image with SVG Clickable Camera Circles Overlay */}
      <div className="relative w-full h-[540px] bg-black/60 rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center p-2">
        
        {/* Exact User-Uploaded SLDC Delhi Transmission Map Image */}
        <img
          src="/delhi_grid_map.jpg"
          alt="Delhi Power Generation & Transmission Network Map"
          className="w-full h-full object-contain select-none"
        />

        {/* Analytical Heatmap Overlay option */}
        {showAnalyticalHeatmap && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center pointer-events-none">
            <div className="p-4 rounded-xl bg-black/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              Analytical Heatmap Overlay Active • Selected Metric: {selectedMetric}
            </div>
          </div>
        )}

        {/* OVERLAY: Clickable Camera Trigger Circles directly over map image substations */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          {mapSubstations.map((sub) => (
            <div
              key={sub.id}
              style={{ left: `${sub.x}%`, top: `${sub.y}%` }}
              onClick={(e) => {
                e.stopPropagation();
                setActiveCameraSubstation(sub);
                const matchedReg = regions.find((r) => r.region_name.toLowerCase().includes(sub.discom.toLowerCase()));
                if (matchedReg) onSelectRegion(matchedReg.region_id);
              }}
              onMouseEnter={() => setHoveredSubstation(sub)}
              onMouseLeave={() => setHoveredSubstation(null)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto group z-20"
            >
              {/* Pulsing Outer Camera Ring */}
              <span className="absolute -inset-2.5 rounded-full bg-cyan-400/40 animate-ping group-hover:bg-amber-400/60" />

              {/* Clickable Circle Trigger */}
              <div className="relative w-6 h-6 rounded-full bg-black/80 border-2 border-cyan-400 group-hover:border-amber-300 shadow-lg flex items-center justify-center transition-all group-hover:scale-125">
                <Camera className="w-3.5 h-3.5 text-cyan-300 group-hover:text-amber-200" />
              </div>

              {/* Tooltip Label on Hover */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-7 hidden group-hover:flex flex-col items-center z-30 pointer-events-none whitespace-nowrap">
                <div className="bg-black/95 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg border border-cyan-500/50 shadow-xl flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>{sub.name}</span>
                </div>
                <div className="w-2 h-2 bg-black/95 rotate-45 border-r border-b border-cyan-500/50 -mt-1"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Hover Information Card */}
        {hoveredSubstation && !activeCameraSubstation && (
          <div className="absolute top-4 right-4 liquid-glass p-3.5 rounded-xl border border-cyan-500/40 bg-black/90 text-xs shadow-xl backdrop-blur-md pointer-events-none z-30 animate-fadeIn">
            <div className="font-bold text-white text-sm mb-1">{hoveredSubstation.name}</div>
            <div className="text-[11px] text-cyan-300 mb-2">DISCOM: {hoveredSubstation.discom} • Voltage: {hoveredSubstation.voltage}</div>

            <div className="space-y-1 text-gray-300 text-[11px]">
              <div className="flex justify-between gap-4">
                <span>Transforming Capacity:</span>
                <strong className="text-white">{hoveredSubstation.capacityMW} MW</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span>Estimated Current Load:</span>
                <strong className="text-emerald-400">{(hoveredSubstation.capacityMW * 0.72).toFixed(0)} MW</strong>
              </div>
              <div className="flex justify-between gap-4 border-t border-white/10 pt-1">
                <span>Optical Inspection:</span>
                <strong className="text-amber-300 flex items-center gap-1">
                  <Camera className="w-3 h-3 text-cyan-400" /> Tap Circle to Open Laptop Camera
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* Legend Notification Badge */}
        <div className="absolute bottom-3 right-3 liquid-glass px-3.5 py-2 rounded-xl border border-white/10 text-[11px] text-gray-300 bg-black/80 backdrop-blur-md flex items-center gap-2 shadow-xl">
          <Camera className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Tap any <strong className="text-cyan-300">Camera Circle</strong> on the map to trigger live laptop video inspection</span>
        </div>

      </div>

      {/* LIVE SUBSTATION LAPTOP CAMERA FEED MODAL */}
      {activeCameraSubstation && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
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
                      LIVE LAPTOP CAMERA FEED
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400">
                    SLDC Inspection • DISCOM: {activeCameraSubstation.discom} • Voltage: {activeCameraSubstation.voltage} • Capacity: {activeCameraSubstation.capacityMW} MW
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
                  <h4 className="font-bold text-sm text-white mb-1">Opening Laptop Web Camera...</h4>
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
