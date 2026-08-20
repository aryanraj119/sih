import { useState, useEffect } from 'react';
import { fetchSpatialRegions } from '../services/api/regions';
import type { RegionalMapData } from '../components/spatial/DelhiMap';
import type { MapMetricMode } from '../components/spatial/MapMetricSelector';
import { useDate } from '../context/DateContext';
import { DelhiMap } from '../components/spatial/DelhiMap';
import { MapMetricSelector } from '../components/spatial/MapMetricSelector';
import { RegionalIntelligencePanel } from '../components/spatial/RegionalIntelligencePanel';
import { RegionalRankingTable } from '../components/spatial/RegionalRankingTable';
import { GridAttentionCard } from '../components/spatial/GridAttentionCard';
import { DataModeBadge } from '../components/dashboard/DataModeBadge';
import { LoadingState } from '../components/dashboard/LoadingState';
import { ErrorState } from '../components/dashboard/ErrorState';
import { MapPin, Calendar } from 'lucide-react';

export const PowerIntelligencePage = () => {
  const { selectedDate } = useDate();
  const [regions, setRegions] = useState<RegionalMapData[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<MapMetricMode>('risk_score');
  const [selectedRegionId, setSelectedRegionId] = useState<string>('south');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  const loadData = async (dateStr: string) => {
    setLoading(true);
    setError(null);
    try {
      const regionsRes = await fetchSpatialRegions(dateStr);

      if (regionsRes.data) {
        setRegions(regionsRes.data);
        setIsDemoMode(regionsRes.isDemoMode);
      }

      if (regionsRes.error) {
        setError(regionsRes.error);
      }
    } catch (err: any) {
      setError('Failed to fetch Delhi spatial intelligence telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedDate);
  }, [selectedDate]);

  const selectedRegion = regions.find((r) => r.region_id === selectedRegionId) || regions[0];

  return (
    <div className="w-full min-h-screen bg-black text-white px-4 md:px-8 lg:px-12 pt-8 pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <MapPin className="w-7 h-7 text-cyan-400" />
              Delhi Transmission Grid & Substation Power Intelligence
            </h1>
            <DataModeBadge isDemoMode={isDemoMode} />
          </div>
          <p className="text-xs md:text-sm text-gray-400 mt-1 flex items-center gap-2">
            <span>Spatial load distribution across 9 DISCOM regions and 16 major 400kV / 220kV Grid Substations</span>
            <span className="bg-cyan-950/80 text-cyan-300 font-mono text-xs px-2 py-0.5 rounded border border-cyan-500/40 font-bold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-yellow-300" /> {selectedDate}
            </span>
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingState message={`Loading Spatial Intelligence for ${selectedDate}...`} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadData(selectedDate)} />
      ) : (
        <>
          {/* Top Metric Mode Selector */}
          <div className="mb-6">
            <MapMetricSelector
              selectedMetric={selectedMetric}
              onChange={setSelectedMetric}
            />
          </div>

          {/* Spatial Grid Map Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <DelhiMap
                regions={regions}
                selectedMetric={selectedMetric}
                selectedRegionId={selectedRegionId}
                onSelectRegion={setSelectedRegionId}
              />
            </div>

            {/* Right Zonal Intelligence Panel */}
            <div className="flex flex-col gap-6">
              {selectedRegion && (
                <RegionalIntelligencePanel region={selectedRegion} />
              )}
              <GridAttentionCard regions={regions} onSelectRegion={setSelectedRegionId} />
            </div>
          </div>

          {/* Bottom Zonal Rankings Table */}
          <div className="mb-8">
            <RegionalRankingTable
              regions={regions}
              selectedRegionId={selectedRegionId}
              onSelectRegion={setSelectedRegionId}
            />
          </div>
        </>
      )}

    </div>
  );
};
