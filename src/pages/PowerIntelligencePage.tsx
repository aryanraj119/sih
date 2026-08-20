import { useState, useEffect } from 'react';
import { fetchRegions } from '../services/api';
import type { DiscomData } from '../types/energy';
import { DataModeBadge } from '../components/dashboard/DataModeBadge';
import { LoadingState } from '../components/dashboard/LoadingState';
import { ErrorState } from '../components/dashboard/ErrorState';
import { MapPin, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';

export const PowerIntelligencePage = () => {
  const [discoms, setDiscoms] = useState<DiscomData[]>([]);
  const [selectedDiscomId, setSelectedDiscomId] = useState<string>('brpl');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchRegions();
      if (response.data) {
        setDiscoms(response.data);
        setIsDemoMode(response.isDemoMode);
      }
      if (response.error) {
        setError(response.error);
      }
    } catch (err: any) {
      setError('Failed to fetch spatial regional telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedDiscom = discoms.find((d) => d.id === selectedDiscomId) || discoms[0];

  const analyticalRegions = [
    { name: 'North Delhi', discom: 'TPDDL', load: '1,150 MW', peak: '1,320 MW', status: 'Optimal' },
    { name: 'North-West Delhi', discom: 'TPDDL', load: '1,000 MW', peak: '1,140 MW', status: 'Optimal' },
    { name: 'North-East Delhi', discom: 'BYPL', load: '580 MW', peak: '660 MW', status: 'Alert' },
    { name: 'West Delhi', discom: 'BRPL', load: '1,420 MW', peak: '1,610 MW', status: 'Optimal' },
    { name: 'Central Delhi', discom: 'BYPL', load: '640 MW', peak: '730 MW', status: 'Optimal' },
    { name: 'South Delhi', discom: 'BRPL', load: '1,820 MW', peak: '2,070 MW', status: 'Optimal' },
    { name: 'South-East Delhi', discom: 'BRPL', load: '880 MW', peak: '990 MW', status: 'Optimal' },
    { name: 'South-West Delhi', discom: 'BRPL', load: '1,250 MW', peak: '1,420 MW', status: 'Optimal' },
    { name: 'East Delhi', discom: 'BYPL', load: '600 MW', peak: '660 MW', status: 'Alert' },
  ];

  return (
    <div className="w-full min-h-screen bg-black text-white px-4 md:px-8 lg:px-12 pt-8 pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              Spatial Grid Intelligence
            </div>
            <DataModeBadge isDemoMode={isDemoMode} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Delhi DISCOM Zonal Power Intelligence
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Zonal demand distribution across BRPL, BYPL, and TPDDL distribution corridors
          </p>
        </div>
      </div>

      {loading && <LoadingState message="Loading spatial DISCOM telemetry..." className="mb-8" />}
      {error && !loading && <ErrorState message={error} onRetry={loadData} className="mb-8" />}

      {!loading && selectedDiscom && (
        <>
          {/* DISCOM Switcher Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {discoms.map((d) => {
              const isSelected = d.id === selectedDiscomId;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDiscomId(d.id)}
                  className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'liquid-glass border-cyan-400/80 bg-cyan-950/30 text-white ring-1 ring-cyan-500/30 shadow-lg shadow-cyan-500/10'
                      : 'liquid-glass border-white/10 text-gray-300 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-white tracking-tight">{d.shortName}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                        d.status === 'Normal' ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                      }`}>
                        {d.status}
                      </span>
                    </div>

                    <div className="text-xs text-gray-400 mb-3">{d.fullName}</div>

                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/10 pt-3">
                      <div>
                        <div className="text-[10px] text-gray-500">Current Load</div>
                        <div className="font-bold text-cyan-400 text-sm">{d.currentLoadMW.toLocaleString()} MW</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500">All-Time Peak</div>
                        <div className="font-bold text-white text-sm">{d.peakMW.toLocaleString()} MW</div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed Selected DISCOM Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Left 2 Cols: Substation Layout & Metrics */}
            <div className="liquid-glass p-6 rounded-2xl border border-white/10 lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-cyan-400" />
                    {selectedDiscom.fullName} Grid Status
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Coverage Area: <strong className="text-white">{selectedDiscom.coverageArea}</strong> | Total Consumers: <strong className="text-white">{selectedDiscom.consumerCount}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Substation Health:</span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> 99.4% Operational
                  </span>
                </div>
              </div>

              {/* DISCOM KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-[10px] text-gray-400">Current Load</div>
                  <div className="text-lg font-bold text-cyan-400">{selectedDiscom.currentLoadMW.toLocaleString()} MW</div>
                  <div className="text-[10px] text-gray-400">Cap: {selectedDiscom.gridCapacityMW.toLocaleString()} MW</div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-[10px] text-gray-400">Capacity Utilisation</div>
                  <div className="text-lg font-bold text-emerald-400">
                    {Math.round((selectedDiscom.currentLoadMW / selectedDiscom.gridCapacityMW) * 100)}%
                  </div>
                  <div className="text-[10px] text-gray-400">Within Thermal Limits</div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-[10px] text-gray-400">Solar Penetration</div>
                  <div className="text-lg font-bold text-amber-400">{selectedDiscom.solarCapacityMW} MW</div>
                  <div className="text-[10px] text-gray-400">Rooftop Generation</div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-[10px] text-gray-400">Public EV Chargers</div>
                  <div className="text-lg font-bold text-white">{selectedDiscom.evChargerCount}</div>
                  <div className="text-[10px] text-gray-400">Active Stations</div>
                </div>
              </div>

              {/* Primary Substations Table */}
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Major Grid Substations (66kV / 220kV)
              </h3>

              <div className="space-y-2">
                {selectedDiscom.substations.map((sub, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        sub.status === 'Optimal' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                      }`} />
                      <div>
                        <span className="font-bold text-white">{sub.name}</span>
                        <div className="text-[10px] text-gray-400">Voltage: {sub.voltage}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="font-semibold text-cyan-400">{sub.loadMW} MW</div>
                        <div className="text-[10px] text-gray-400">Utilisation: {sub.utilisationPct}%</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sub.status === 'Optimal' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                      }`}>
                        {sub.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Col: Analytical Delhi Regions List */}
            <div className="liquid-glass p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white">9 Analytical Regions</h2>
                  <span className="text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                    Geographic Breakdown
                  </span>
                </div>

                <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                  Delhi demand divided into 9 analytical geographic zones for regional growth & load density tracking:
                </p>

                <div className="space-y-2 text-xs">
                  {analyticalRegions.map((reg, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-white">{reg.name}</span>
                        <div className="text-[10px] text-gray-400">DISCOM: <strong className="text-cyan-400">{reg.discom}</strong></div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-400">{reg.load}</div>
                        <div className="text-[10px] text-gray-400">Peak: {reg.peak}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-[11px] text-amber-200/90 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Note:</strong> Regional boundaries are analytical geographical representations for grid research and do not represent internal feeder switching configurations.
                </span>
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
};
