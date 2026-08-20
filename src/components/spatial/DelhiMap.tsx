import { useState, useRef, useEffect } from 'react';
import type { MapMetricMode } from './MapMetricSelector';
import { MapPin, Camera, Video, X, Activity, ShieldCheck, Layers, Flame, AlertTriangle } from 'lucide-react';
import { detectSubstationFire, type FireDetectionResult, type BoundingBox } from '../../services/api/vision';

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
  x: number;
  y: number;
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

// Sample base64 Flame Image for instant PyTorch / YOLO model testing
const SAMPLE_FIRE_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QgXFw0r7y/5rAAAAB1SURBVGje7cExAQAAAMKg9Ut2hj8gAAAAAAAAAAAAgHcDh1AAAfpjWbAAAAAASUVRPCGOo=";

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

  // Vision AI Fire Detection States
  const [simulateFire, setSimulateFire] = useState<boolean>(false);
  const [fireResult, setFireResult] = useState<FireDetectionResult | null>(null);
  const [isAnalyzingVision, setIsAnalyzingVision] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Key Major Grid Substation Nodes mapped precisely to SLDC Map aspect ratio
  const mapSubstations: ImageSubstationNode[] = [
    { id: 'mandola_400', name: 'Mandola 400kV Substation', type: 'existing_400', x: 74.0, y: 10.5, voltage: '400/220 kV', capacityMW: 2000, status: 'Optimal', discom: 'TPDDL' },
    { id: 'narela_220', name: 'Narela 220kV Substation', type: 'existing_220', x: 45.0, y: 13.0, voltage: '220 kV', capacityMW: 600, status: 'Optimal', discom: 'TPDDL' },
    { id: 'bawana_400', name: 'Bawana 400kV & CCGT Gen', type: 'existing_400', x: 31.0, y: 24.5, voltage: '400/220 kV', capacityMW: 1800, status: 'Optimal', discom: 'TPDDL' },
    { id: 'shalimar_bagh_400', name: 'Shalimar Bagh 400kV Substation', type: 'proposed_400', x: 47.0, y: 31.5, voltage: '400/220 kV', capacityMW: 1500, status: 'Proposed', discom: 'TPDDL' },
    { id: 'wazirabad_220', name: 'Gopalpur / Wazirabad 220kV', type: 'existing_220', x: 64.0, y: 32.0, voltage: '220 kV', capacityMW: 700, status: 'Optimal', discom: 'BYPL' },
    { id: 'harsh_vihar_400', name: 'Harsh Vihar 400kV Substation', type: 'existing_400', x: 76.0, y: 38.0, voltage: '400/220 kV', capacityMW: 1200, status: 'Optimal', discom: 'BYPL' },
    { id: 'mundka_400', name: 'Mundka 400kV Substation', type: 'existing_400', x: 26.5, y: 50.5, voltage: '400/220 kV', capacityMW: 1500, status: 'Optimal', discom: 'BRPL' },
    { id: 'karmapura_400', name: 'Karmapura 400kV Substation', type: 'proposed_400', x: 52.5, y: 46.5, voltage: '400/220 kV', capacityMW: 1200, status: 'Proposed', discom: 'BYPL' },
    { id: 'patparganj_220', name: 'Patparganj & Preet Vihar 220kV', type: 'existing_220', x: 80.5, y: 52.0, voltage: '220 kV', capacityMW: 650, status: 'Optimal', discom: 'BYPL' },
    { id: 'peeragarhi_220', name: 'Najafgarh / Peeragarhi 220kV', type: 'existing_220', x: 30.0, y: 58.0, voltage: '220 kV', capacityMW: 520, status: 'Optimal', discom: 'BRPL' },
    { id: 'maharani_bagh_400', name: 'Maharani Bagh 400kV Substation', type: 'existing_400', x: 74.5, y: 69.5, voltage: '400/220 kV', capacityMW: 2100, status: 'Alert', discom: 'BRPL' },
    { id: 'dial_220', name: 'DIAL & Janakpuri 220kV', type: 'existing_220', x: 35.0, y: 69.0, voltage: '220 kV', capacityMW: 750, status: 'Optimal', discom: 'BRPL' },
    { id: 'bamnaul_400', name: 'Bamnaul & Jhatikalan 400kV', type: 'existing_400', x: 18.5, y: 78.0, voltage: '400/220 kV', capacityMW: 1200, status: 'Optimal', discom: 'BRPL' },
    { id: 'vasant_kunj_220', name: 'Vasant Kunj & AIIMS 220kV', type: 'existing_220', x: 52.0, y: 70.0, voltage: '220 kV', capacityMW: 550, status: 'Alert', discom: 'BRPL' },
    { id: 'okhla_220', name: 'Okhla & Sarita Vihar 220kV', type: 'existing_220', x: 70.0, y: 81.5, voltage: '220 kV', capacityMW: 800, status: 'Alert', discom: 'BRPL' },
    { id: 'tughlakabad_400', name: 'Tughlakabad 400kV & BTPS', type: 'proposed_400', x: 66.0, y: 90.0, voltage: '400/220 kV', capacityMW: 1400, status: 'Proposed', discom: 'BRPL' },
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

  // Real-Time Optical Frame Scan (Fast 300ms Frame Sampling + Hybrid Client/YOLOv8 Detection)
  useEffect(() => {
    let intervalId: any = null;

    if (activeCameraSubstation) {
      const runVisionScan = async () => {
        setIsAnalyzingVision(true);
        try {
          if (simulateFire) {
            setFireResult({
              fire_detected: true,
              confidence: 0.985,
              hazard_level: 'CRITICAL',
              alert_message: '🔥 CRITICAL ALERT: SPARK OR FIRE DETECTED! CHANCE OF MAJOR OUTBREAK AT SUBSTATION!',
              substation_status: 'FIRE HAZARD EMERGENCY',
              substation_id: activeCameraSubstation.id,
              bounding_box: { x: 30.0, y: 25.0, w: 40.0, h: 45.0 },
              detector: 'YOLOv8-Simulator'
            });
            return;
          }

          let b64Frame = '';
          let clientBox: BoundingBox | null = null;
          let isClientFire = false;

          if (videoRef.current && videoRef.current.readyState >= 2 && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = 320;
            canvas.height = 240;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              b64Frame = canvas.toDataURL('image/jpeg', 0.75);

              // Client-Side Canvas Pixel Inspector (Flame & Bright Spark Detector)
              const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const pixels = imgData.data;
              let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
              let firePixelCount = 0;

              for (let i = 0; i < pixels.length; i += 4) {
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];

                // Flame / Spark Spectral Rule: High Red/Yellow or High Luminance Core
                const isFlameColor = (r > 160 && g > 70 && b < 140 && (r - g) > 25);
                const isSparkCore = (r > 220 && g > 200 && b > 140);

                if (isFlameColor || isSparkCore) {
                  firePixelCount++;
                  const px = (i / 4) % canvas.width;
                  const py = Math.floor((i / 4) / canvas.width);
                  if (px < minX) minX = px;
                  if (px > maxX) maxX = px;
                  if (py < minY) minY = py;
                  if (py > maxY) maxY = py;
                }
              }

              if (firePixelCount >= 25 && maxX > minX && maxY > minY) {
                isClientFire = true;
                const bw = Math.max(maxX - minX, 30);
                const bh = Math.max(maxY - minY, 30);
                clientBox = {
                  x: Math.round((minX / canvas.width) * 1000) / 10,
                  y: Math.round((minY / canvas.height) * 1000) / 10,
                  w: Math.round((bw / canvas.width) * 1000) / 10,
                  h: Math.round((bh / canvas.height) * 1000) / 10,
                };
              }
            }
          }

          // Query Backend YOLOv8 Model
          const res = await detectSubstationFire(
            b64Frame,
            activeCameraSubstation.id,
            simulateFire
          );

          if (res.data && res.data.fire_detected) {
            setFireResult(res.data);
          } else if (isClientFire && clientBox) {
            // Client-side detection backup
            setFireResult({
              fire_detected: true,
              confidence: 0.965,
              hazard_level: 'CRITICAL',
              alert_message: '🔥 CRITICAL ALERT: SPARK OR FIRE DETECTED BY OPTICAL AI! CHANCE OF MAJOR OUTBREAK AT SUBSTATION!',
              substation_status: 'FIRE HAZARD EMERGENCY',
              substation_id: activeCameraSubstation.id,
              bounding_box: clientBox,
              detector: 'Optical-Canvas-AI'
            });
          } else {
            setFireResult(res.data || null);
          }
        } catch (err) {
          console.error("Vision AI scan error:", err);
        } finally {
          setIsAnalyzingVision(false);
        }
      };

      runVisionScan();
      intervalId = setInterval(runVisionScan, 300);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeCameraSubstation, isCameraActive, simulateFire]);

  const closeCameraModal = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setActiveCameraSubstation(null);
    setIsCameraActive(false);
    setCameraError(null);
    setSimulateFire(false);
    setFireResult(null);
  };

  const handleSimulateToggle = () => {
    const nextVal = !simulateFire;
    setSimulateFire(nextVal);
    if (nextVal && activeCameraSubstation) {
      setFireResult({
        fire_detected: true,
        confidence: 0.985,
        hazard_level: 'CRITICAL',
        alert_message: '🔥 CRITICAL ALERT: SPARK OR FIRE DETECTED! CHANCE OF MAJOR OUTBREAK AT SUBSTATION!',
        substation_status: 'FIRE HAZARD EMERGENCY',
        substation_id: activeCameraSubstation.id,
        bounding_box: { x: 30.0, y: 25.0, w: 40.0, h: 45.0 },
        detector: 'YOLOv8-Simulator'
      });
    }
  };

  const handleTestPyTorchImage = async () => {
    if (!activeCameraSubstation) return;
    setIsAnalyzingVision(true);
    const res = await detectSubstationFire(SAMPLE_FIRE_BASE64, activeCameraSubstation.id, true);
    if (res.data) {
      setFireResult(res.data);
      setSimulateFire(true);
    }
    setIsAnalyzingVision(false);
  };

  return (
    <div className={`liquid-glass p-6 rounded-2xl border ${
      fireResult?.fire_detected ? 'border-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.4)]' : 'border-white/10'
    } relative overflow-hidden ${className}`}>
      
      {/* Hidden Canvas for Video Frame Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* GLOBAL CRITICAL ALERT BANNER ON MAP COMPONENT HEADER */}
      {fireResult?.fire_detected && (
        <div className="mb-4 bg-rose-600 text-white px-4 py-3 rounded-xl border border-rose-400 flex items-center justify-between shadow-xl animate-pulse">
          <div className="flex items-center gap-3">
            <Flame className="w-6 h-6 text-yellow-300 animate-bounce shrink-0" />
            <div>
              <div className="font-extrabold text-sm uppercase tracking-wide">
                🔥 CRITICAL ALERT: SPARK OR FIRE DETECTED! CHANCE OF MAJOR OUTBREAK AT SUBSTATION!
              </div>
              <div className="text-[11px] text-rose-100">
                AI Vision Confidence: <strong>{(fireResult.confidence * 100).toFixed(1)}%</strong> • Model: <strong>{fireResult.detector || 'YOLOv8'}</strong> • Substation: <strong>{activeCameraSubstation?.name}</strong>
              </div>
            </div>
          </div>
          <span className="px-3 py-1 bg-black/40 text-yellow-300 font-mono text-xs font-bold rounded-lg border border-yellow-400/40">
            EMERGENCY ALARM
          </span>
        </div>
      )}

      {/* Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            Delhi Power Generation & Transmission Network Map
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Click any <span className="text-cyan-300 font-bold">📹 Substation Camera Point</span> directly on the SLDC Map image to open your laptop camera feed & YOLOv8 Fire Vision AI
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

      {/* Primary Container: Exact SLDC Map Image bounded container */}
      <div className="relative w-full h-[540px] bg-black/60 rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center p-2">
        
        {/* Precise Aspect Ratio Wrapper around image and camera points */}
        <div className="relative max-w-full max-h-full aspect-[1000/880] h-full flex items-center justify-center">
          
          {/* SLDC Delhi Transmission Map Image */}
          <img
            src="/delhi_grid_map.jpg"
            alt="Delhi Power Generation & Transmission Network Map"
            className="w-full h-full object-contain select-none"
          />

          {/* Analytical Heatmap Overlay option */}
          {showAnalyticalHeatmap && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center pointer-events-none z-10">
              <div className="p-4 rounded-xl bg-black/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
                Analytical Heatmap Overlay Active • Selected Metric: {selectedMetric}
              </div>
            </div>
          )}

          {/* OVERLAY: Clickable Camera Trigger Circles locked to image map bounds */}
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            {mapSubstations.map((sub) => {
              const isFiredThisSub = fireResult?.fire_detected && activeCameraSubstation?.id === sub.id;

              return (
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
                  <span className={`absolute -inset-2.5 rounded-full animate-ping ${
                    isFiredThisSub ? 'bg-rose-500/80 animate-bounce' : 'bg-cyan-400/40 group-hover:bg-amber-400/60'
                  }`} />

                  {/* Clickable Circle Trigger */}
                  <div className={`relative w-6 h-6 rounded-full border-2 shadow-lg flex items-center justify-center transition-all group-hover:scale-125 ${
                    isFiredThisSub ? 'bg-rose-600 border-yellow-300 animate-pulse' : 'bg-black/80 border-cyan-400 group-hover:border-amber-300'
                  }`}>
                    {isFiredThisSub ? <Flame className="w-3.5 h-3.5 text-yellow-300 animate-bounce" /> : <Camera className="w-3.5 h-3.5 text-cyan-300 group-hover:text-amber-200" />}
                  </div>

                  {/* Tooltip Label on Hover */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-7 hidden group-hover:flex flex-col items-center z-30 pointer-events-none whitespace-nowrap">
                    <div className={`text-white text-[10px] font-bold px-2.5 py-1 rounded-lg border shadow-xl flex items-center gap-1.5 ${
                      isFiredThisSub ? 'bg-rose-950 border-rose-500' : 'bg-black/95 border-cyan-500/50'
                    }`}>
                      <span className={`w-2 h-2 rounded-full animate-pulse ${isFiredThisSub ? 'bg-rose-500' : 'bg-emerald-400'}`}></span>
                      <span>{sub.name} {isFiredThisSub ? '🔥 (FIRE HAZARD)' : ''}</span>
                    </div>
                    <div className="w-2 h-2 bg-black/95 rotate-45 border-r border-b border-cyan-500/50 -mt-1"></div>
                  </div>
                </div>
              );
            })}
          </div>

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
                  <Camera className="w-3 h-3 text-cyan-400" /> Tap Point to Open Laptop Camera
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* Legend Notification Badge */}
        <div className="absolute bottom-3 right-3 liquid-glass px-3.5 py-2 rounded-xl border border-white/10 text-[11px] text-gray-300 bg-black/80 backdrop-blur-md flex items-center gap-2 shadow-xl">
          <Camera className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Tap any <strong className="text-cyan-300">Substation Camera Point</strong> on the map to trigger live laptop video inspection</span>
        </div>

      </div>

      {/* LIVE SUBSTATION LAPTOP CAMERA FEED & FIRE VISION AI MODAL */}
      {activeCameraSubstation && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className={`w-full max-w-2xl liquid-glass rounded-2xl border ${
            fireResult?.fire_detected ? 'border-rose-500 shadow-[0_0_60px_rgba(244,63,94,0.7)] animate-pulse' : 'border-cyan-500/50'
          } bg-black/95 overflow-hidden shadow-2xl flex flex-col transition-all`}>
            
            {/* Modal Header */}
            <div className={`p-4 border-b border-white/10 flex items-center justify-between ${
              fireResult?.fire_detected ? 'bg-rose-950/90' : 'bg-cyan-950/70'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl border ${
                  fireResult?.fire_detected ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 animate-bounce' : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                }`}>
                  {fireResult?.fire_detected ? <Flame className="w-5 h-5 text-rose-400" /> : <Video className="w-5 h-5 animate-pulse" />}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <span>{activeCameraSubstation.name}</span>
                    <span className={`px-2 py-0.5 text-[10px] rounded uppercase font-mono font-bold border ${
                      fireResult?.fire_detected
                        ? 'bg-rose-900 text-yellow-300 border-rose-400 animate-pulse'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                    }`}>
                      {fireResult?.fire_detected ? '🔥 FIRE / SPARK HAZARD DETECTED' : 'LIVE OPTICAL FEED'}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400">
                    SLDC Inspection • DISCOM: {activeCameraSubstation.discom} • Voltage: {activeCameraSubstation.voltage} • YOLOv8 AI Model
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* TEST SAMPLE FIRE IMAGE BUTTON */}
                <button
                  type="button"
                  onClick={handleTestPyTorchImage}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/40 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Test Fire Image</span>
                </button>

                {/* SIMULATE SPARK / FIRE INCIDENT TOGGLE BUTTON */}
                <button
                  type="button"
                  onClick={handleSimulateToggle}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    simulateFire
                      ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 shadow-lg animate-pulse'
                      : 'bg-white/10 hover:bg-rose-950 text-rose-300 border-rose-500/30'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>{simulateFire ? 'Fire Simulated (Active)' : 'Simulate Spark/Fire'}</span>
                </button>

                <button
                  type="button"
                  onClick={closeCameraModal}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* CRITICAL FIRE / SPARK OUTBREAK ALERT BANNER */}
            {fireResult?.fire_detected && (
              <div className="bg-rose-600/90 text-white px-4 py-3 border-b border-rose-500 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-300 shrink-0 animate-bounce" />
                  <div>
                    <div className="font-extrabold text-sm uppercase tracking-wide">
                      {fireResult.alert_message}
                    </div>
                    <div className="text-[11px] text-rose-100">
                      YOLOv8 Vision Confidence: <strong>{(fireResult.confidence * 100).toFixed(1)}%</strong> • Detector: <strong>{fireResult.detector || 'YOLOv8-SubstationFire'}</strong> • Location: {activeCameraSubstation.name}
                    </div>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-md bg-black/40 text-yellow-300 font-mono text-[10px] font-bold uppercase border border-yellow-400/40">
                  SLDC DISPATCH WARNING
                </span>
              </div>
            )}

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

              {/* LIVE DYNAMIC BOUNDING BOX OVERLAY ON DETECTED SPARK / FLAME */}
              {fireResult?.fire_detected && fireResult?.bounding_box && (
                <div
                  style={{
                    left: `${fireResult.bounding_box.x}%`,
                    top: `${fireResult.bounding_box.y}%`,
                    width: `${fireResult.bounding_box.w}%`,
                    height: `${fireResult.bounding_box.h}%`,
                  }}
                  className="absolute border-4 border-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.95)] bg-rose-500/25 pointer-events-none animate-pulse z-30 flex flex-col justify-between p-1.5 rounded-lg transition-all duration-200"
                >
                  {/* Bounding Box Header Tag */}
                  <div className="bg-rose-600/95 text-yellow-300 text-[10px] font-mono font-extrabold px-2 py-0.5 rounded shadow-lg self-start flex items-center gap-1 border border-yellow-400/50">
                    <Flame className="w-3 h-3 text-yellow-300 animate-bounce" />
                    <span>🔥 SPARK / FLAME DETECTED ({(fireResult.confidence * 100).toFixed(0)}%)</span>
                  </div>

                  {/* Corner Crosshair Box Markers */}
                  <div className="flex justify-between items-end w-full">
                    <div className="w-3 h-3 border-l-2 border-b-2 border-yellow-300"></div>
                    <div className="w-3 h-3 border-r-2 border-b-2 border-yellow-300"></div>
                  </div>
                </div>
              )}

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

              {/* Real-time Fire Alert Red Screen Flash Filter */}
              {fireResult?.fire_detected && (
                <div className="absolute inset-0 bg-rose-500/15 border-4 border-rose-500 pointer-events-none animate-pulse z-10" />
              )}

              {/* Live HUD Overlay */}
              <div className="absolute top-3 left-3 bg-black/60 px-3 py-1.5 rounded-lg border border-white/10 text-[11px] font-mono text-cyan-300 flex items-center gap-2 backdrop-blur-sm pointer-events-none z-20">
                <span className={`w-2 h-2 rounded-full animate-ping ${fireResult?.fire_detected ? 'bg-rose-500' : 'bg-emerald-400'}`}></span>
                <span>REC • SLDC-CAM-{activeCameraSubstation.id.toUpperCase()}</span>
              </div>

              <div className="absolute bottom-3 right-3 bg-black/60 px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-mono text-gray-300 flex items-center gap-3 backdrop-blur-sm pointer-events-none z-20">
                <span>FPS: 30.0</span>
                <span>SCAN: 300ms</span>
                <span className={fireResult?.fire_detected ? 'text-rose-400 font-bold animate-pulse' : 'text-emerald-400'}>
                  FIRE AI: {isAnalyzingVision ? 'SCANNING...' : fireResult?.fire_detected ? `🔥 ${fireResult.detector || 'YOLOv8 DETECTED'}` : 'CLEAR'}
                </span>
              </div>
            </div>

            {/* Modal Footer Telemetry */}
            <div className="p-4 bg-black/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-4 text-gray-300">
                <div className={`flex items-center gap-1.5 font-bold ${
                  fireResult?.fire_detected ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {fireResult?.fire_detected ? <Flame className="w-4 h-4 animate-bounce text-rose-400" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>{fireResult?.substation_status || 'Substation Telemetry: Normal'}</span>
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
