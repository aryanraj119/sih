import { useState } from 'react';
import { getDiscomData } from '../services/api';
import type { DiscomData } from '../types/energy';
import { MapPin, Zap, Sun, Car, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const PowerIntelligencePage = () => {
  const discoms = getDiscomData();
  const [selectedDiscom, setSelectedDiscom] = useState<DiscomData>(discoms[0]);

  const totalLoad = discoms.reduce((acc, d) => acc + d.currentLoadMW, 0);
  const totalCapacity = discoms.reduce((acc, d) => acc + d.capacityMW, 0);
  const totalSolar = discoms.reduce((acc, d) => acc + d.solarMW, 0);
  const totalEV = discoms.reduce((acc, d) => acc + d.evStations, 0);

  return (
    <div className="w-full min-h-screen bg-black text-white px-4 md:px-8 lg:px-12 pt-8 pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            Spatial Grid Analytics
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Delhi DISCOM Power Intelligence
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Zonal electricity demand, sub-station congestion, and EV/Solar infrastructure across Delhi
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="liquid-glass px-4 py-2 rounded-xl border border-white/10 text-xs flex items-center gap-2">
            <span className="text-gray-400">Total Delhi Demand:</span>
            <span className="font-bold text-cyan-400 text-sm">{totalLoad.toLocaleString()} MW</span>
          </div>
        </div>
      </div>

      {/* DISCOM Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {discoms.map((discom) => {
          const isSelected = selectedDiscom.id === discom.id;
          const loadPct = Math.round((discom.currentLoadMW / discom.capacityMW) * 100);

          return (
            <button
              key={discom.id}
              onClick={() => setSelectedDiscom(discom)}
              className={`liquid-glass p-6 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-cyan-500 bg-cyan-950/20 ring-1 ring-cyan-500/30'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-white/10 text-white tracking-wide">
                  {discom.code}
                </span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 ${
                  discom.healthStatus === 'Optimal'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {discom.healthStatus === 'Optimal' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                  {discom.healthStatus}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-1">{discom.name}</h3>
              <p className="text-xs text-gray-400 mb-4">{discom.region}</p>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Capacity Load</span>
                  <span className="font-semibold text-white">{discom.currentLoadMW} / {discom.capacityMW} MW ({loadPct}%)</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      loadPct > 80 ? 'bg-amber-500' : 'bg-cyan-400'
                    }`}
                    style={{ width: `${loadPct}%` }}
                  ></div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected DISCOM Zonal Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Spatial Grid Map Representation */}
        <div className="lg:col-span-7 liquid-glass p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                  Delhi Regional DISCOM Spatial Layout
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Interactive DISCOM sub-station grid map view</p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {selectedDiscom.code} Active
              </span>
            </div>

            {/* Delhi Graphical Zonal Map Illustration */}
            <div className="relative w-full h-[320px] rounded-xl bg-black/60 border border-white/10 p-6 flex flex-col justify-between overflow-hidden">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
              
              <div className="relative z-10 flex items-center justify-between text-xs text-gray-400">
                <span className="font-mono">NORTH DELHI (TPDDL)</span>
                <span className="font-mono">EAST DELHI (BYPL)</span>
              </div>

              {/* Sub-station Node Layout */}
              <div className="relative z-10 grid grid-cols-3 gap-4 my-auto">
                <div className={`p-4 rounded-xl border text-center transition-all ${
                  selectedDiscom.code === 'TPDDL' ? 'bg-amber-500/20 border-amber-400' : 'bg-white/5 border-white/10'
                }`}>
                  <div className="text-xs font-bold text-amber-300">TPDDL Zone</div>
                  <div className="text-lg font-bold text-white mt-1">2,150 MW</div>
                  <div className="text-[10px] text-gray-400">68 Sub-stations</div>
                </div>

                <div className={`p-4 rounded-xl border text-center transition-all ${
                  selectedDiscom.code === 'BRPL' ? 'bg-cyan-500/20 border-cyan-400' : 'bg-white/5 border-white/10'
                }`}>
                  <div className="text-xs font-bold text-cyan-300">BRPL Zone</div>
                  <div className="text-lg font-bold text-white mt-1">3,240 MW</div>
                  <div className="text-[10px] text-gray-400">94 Sub-stations</div>
                </div>

                <div className={`p-4 rounded-xl border text-center transition-all ${
                  selectedDiscom.code === 'BYPL' ? 'bg-emerald-500/20 border-emerald-400' : 'bg-white/5 border-white/10'
                }`}>
                  <div className="text-xs font-bold text-emerald-300">BYPL Zone</div>
                  <div className="text-lg font-bold text-white mt-1">1,820 MW</div>
                  <div className="text-[10px] text-gray-400">52 Sub-stations</div>
                </div>
              </div>

              <div className="relative z-10 flex items-center justify-between text-xs text-gray-400">
                <span className="font-mono">SOUTH & WEST DELHI (BRPL)</span>
                <span className="font-mono text-cyan-400 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 animate-pulse" /> Grid Synchronized
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
            <span>Sub-station Congestion Status: <strong className="text-emerald-400">Normal</strong></span>
            <span>Historical All-Time Peak: <strong className="text-white">8,656 MW</strong></span>
          </div>
        </div>

        {/* Right Column: Selected DISCOM Zonal Metrics */}
        <div className="lg:col-span-5 space-y-6">
          <div className="liquid-glass p-6 rounded-2xl border border-white/10 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white">{selectedDiscom.name} Details</h3>
              <span className="text-xs font-mono text-cyan-400">{selectedDiscom.region}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
                <div className="text-xs text-gray-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" /> Current Load
                </div>
                <div className="text-xl font-bold text-white mt-1">
                  {selectedDiscom.currentLoadMW} <span className="text-xs text-gray-400">MW</span>
                </div>
              </div>

              <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
                <div className="text-xs text-gray-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" /> Peak Summer Load
                </div>
                <div className="text-xl font-bold text-emerald-400 mt-1">
                  {selectedDiscom.peakLoadMW} <span className="text-xs text-gray-400">MW</span>
                </div>
              </div>

              <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
                <div className="text-xs text-gray-400 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-yellow-400" /> Rooftop Solar
                </div>
                <div className="text-xl font-bold text-yellow-400 mt-1">
                  {selectedDiscom.solarMW} <span className="text-xs text-gray-400">MW</span>
                </div>
              </div>

              <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
                <div className="text-xs text-gray-400 flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-amber-400" /> EV Chargers
                </div>
                <div className="text-xl font-bold text-amber-400 mt-1">
                  {selectedDiscom.evStations} <span className="text-xs text-gray-400">Points</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-gray-300">
              <span className="font-semibold text-cyan-300">Zonal Dispatch Note:</span>
              <p className="text-[11px] text-gray-400 mt-1">
                {selectedDiscom.code} network experiencing high air-conditioning cooling load. 
                Sub-stations operating at {Math.round((selectedDiscom.currentLoadMW / selectedDiscom.capacityMW) * 100)}% design capacity with safe transformer thermal margins.
              </p>
            </div>
          </div>

          {/* Delhi Grid Totals Box */}
          <div className="liquid-glass p-5 rounded-2xl border border-white/10 space-y-3">
            <h4 className="text-sm font-bold text-white border-b border-white/10 pb-2">
              Delhi SLDC Infrastructure Summary
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-gray-400">Total Installed Solar:</div>
              <div className="text-right font-bold text-yellow-300">{totalSolar} MW</div>

              <div className="text-gray-400">Public EV Chargers:</div>
              <div className="text-right font-bold text-cyan-300">{totalEV} Stations</div>

              <div className="text-gray-400">Grid Sub-stations:</div>
              <div className="text-right font-bold text-white">214 Active Units</div>

              <div className="text-gray-400">Peak Thermal Limit:</div>
              <div className="text-right font-bold text-emerald-400">{totalCapacity} MW</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
