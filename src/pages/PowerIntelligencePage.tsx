import { useState, useEffect } from 'react';
import { fetchSpatialRegions, fetchRegionsSummary } from '../services/api/regions';
import type { RegionalMapData } from '../components/spatial/DelhiMap';
import type { RegionalSummaryData } from '../services/api/regions';
import type { MapMetricMode } from '../components/spatial/MapMetricSelector';
import { DelhiMap } from '../components/spatial/DelhiMap';
import { MapMetricSelector } from '../components/spatial/MapMetricSelector';
import { RegionalIntelligencePanel } from '../components/spatial/RegionalIntelligencePanel';
import { RegionalRankingTable } from '../components/spatial/RegionalRankingTable';
import { GridAttentionCard } from '../components/spatial/GridAttentionCard';
import { DataModeBadge } from '../components/dashboard/DataModeBadge';
import { LoadingState } from '../components/dashboard/LoadingState';
import { ErrorState } from '../components/dashboard/ErrorState';
import { MapPin, Zap, TrendingUp, Sun, Activity, Compass, AlertTriangle, ShieldAlert } from 'lucide-react';

export const PowerIntelligencePage = () => {
  const [regions, setRegions] = useState<RegionalMapData[]>([]);
  const [summary, setSummary] = useState<RegionalSummaryData | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<MapMetricMode>('risk_score');
  const [selectedRegionId, setSelectedRegionId] = useState<string>('south');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [regionsRes, summaryRes] = await Promise.all([
        fetchSpatialRegions(),
        fetchRegionsSummary(),
      ]);

      if (regionsRes.data) {
        setRegions(regionsRes.data);
        setIsDemoMode(regionsRes.isDemoMode);
      }
      if (summaryRes.data) {
        setSummary(summaryRes.data);
      }

      if (regionsRes.error) {
        setError(regionsRes.error);
      }
    } catch (err: any) {
      setError('Failed to fetch spatial regional power intelligence.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedRegion = regions.find((r) => r.region_id === selectedRegionId) || regions[0];

  const highestDemandReg = regions.length > 0 ? regions.reduce((prev, curr) => (curr.current_demand_mw > prev.current_demand_mw ? curr : prev)) : null;
  const fastestGrowthReg = regions.length > 0 ? regions.reduce((prev, curr) => (curr.growth_percent > prev.growth_percent ? curr : prev)) : null;
  const highestPeakReg = regions.length > 0 ? regions.reduce((prev, curr) => (curr.forecast_peak_mw > prev.forecast_peak_mw ? curr : prev)) : null;
  const highestRiskReg = regions.length > 0 ? regions.reduce((prev, curr) => (curr.risk_score > prev.risk_score ? curr : prev)) : null;

  return (
    <div className="w-full min-h-screen bg-black text-white px-4 md:px-8 lg:px-12 pt-8 pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              Delhi Power Intelligence
            </div>
            <DataModeBadge isDemoMode={isDemoMode} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Spatial Grid Intelligence & Regional Risk Mapping
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Analyzing electricity demand, peak projections, growth rates, and URJADRISHTI risk scores across 9 Delhi analytical regions
          </p>
        </div>
      </div>

      {loading && <LoadingState message="Connecting to spatial regional power intelligence engine..." className="mb-8" />}
      {error && !loading && <ErrorState message={error} onRetry={loadData} className="mb-8" />}

      {!loading && summary && regions.length > 0 && (
        <>
          {/* Delhi-Wide Summary KPIs Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            <div className="liquid-glass p-3.5 rounded-xl border border-white/10">
              <div className="text-[10px] text-gray-400 font-medium flex items-center justify-between">
                <span>Total Demand</span>
                <Activity className="w-3 h-3 text-cyan-400" />
              </div>
              <div className="text-lg font-bold text-cyan-400 mt-1">
                {summary.total_current_demand_mw.toLocaleString()} <span className="text-xs font-normal">MW</span>
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">Across 9 Regions</div>
            </div>

            <div className="liquid-glass p-3.5 rounded-xl border border-white/10">
              <div className="text-[10px] text-gray-400 font-medium flex items-center justify-between">
                <span>Forecast Peak</span>
                <Zap className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="text-lg font-bold text-emerald-400 mt-1">
                {summary.total_peak_mw.toLocaleString()} <span className="text-xs font-normal">MW</span>
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">Summer Peak Target</div>
            </div>

            <div className="liquid-glass p-3.5 rounded-xl border border-white/10">
              <div className="text-[10px] text-gray-400 font-medium flex items-center justify-between">
                <span>5-Yr Growth Rate</span>
                <Compass className="w-3 h-3 text-amber-400" />
              </div>
              <div className="text-lg font-bold text-amber-400 mt-1">
                +{summary.fastest_growth_pct} % <span className="text-xs font-normal">CAGR</span>
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">Macro-Spatial Model</div>
            </div>

            <div className="liquid-glass p-3.5 rounded-xl border border-white/10">
              <div className="text-[10px] text-gray-400 font-medium flex items-center justify-between">
                <span>Rooftop Solar</span>
                <Sun className="w-3 h-3 text-amber-400" />
              </div>
              <div className="text-lg font-bold text-white mt-1">
                {summary.total_solar_mw.toLocaleString()} <span className="text-xs font-normal">MW</span>
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">Midday Bell Peak</div>
            </div>

            <div className="liquid-glass p-3.5 rounded-xl border border-white/10">
              <div className="text-[10px] text-gray-400 font-medium flex items-center justify-between">
                <span>Net Grid Load</span>
                <TrendingUp className="w-3 h-3 text-cyan-400" />
              </div>
              <div className="text-lg font-bold text-cyan-300 mt-1">
                {summary.total_net_load_mw.toLocaleString()} <span className="text-xs font-normal">MW</span>
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">Demand - Solar</div>
            </div>

            <div className="liquid-glass p-3.5 rounded-xl border border-rose-500/30 bg-rose-950/20">
              <div className="text-[10px] text-rose-300 font-medium flex items-center justify-between">
                <span>Attention Needed</span>
                <AlertTriangle className="w-3 h-3 text-rose-400" />
              </div>
              <div className="text-lg font-bold text-rose-400 mt-1">
                {summary.highest_risk_region}
              </div>
              <div className="text-[10px] text-rose-300 mt-0.5">Risk Score: {summary.highest_risk_score}</div>
            </div>
          </div>

          {/* Metric Selector & Interactive Map Layout */}
          <div className="space-y-4 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Select Spatial Map Visualization Mode:
              </span>
              <MapMetricSelector selectedMetric={selectedMetric} onChange={setSelectedMetric} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Interactive SVG Map */}
              <div className="lg:col-span-2">
                <DelhiMap
                  regions={regions}
                  selectedMetric={selectedMetric}
                  selectedRegionId={selectedRegionId}
                  onSelectRegion={setSelectedRegionId}
                />
              </div>

              {/* Right Col: Top Insights Cards */}
              <div className="liquid-glass p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-cyan-400" />
                    Top Regional Insights
                  </h3>

                  <div className="space-y-3 text-xs">
                    {highestDemandReg && (
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <div>
                          <span className="text-gray-400 text-[10px]">Highest Current Demand</span>
                          <div className="font-bold text-white text-sm">{highestDemandReg.region_name}</div>
                        </div>
                        <span className="font-bold text-cyan-400 text-sm">{highestDemandReg.current_demand_mw} MW</span>
                      </div>
                    )}

                    {fastestGrowthReg && (
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <div>
                          <span className="text-gray-400 text-[10px]">Fastest Growing Zone</span>
                          <div className="font-bold text-white text-sm">{fastestGrowthReg.region_name}</div>
                        </div>
                        <span className="font-bold text-amber-400 text-sm">+{fastestGrowthReg.growth_percent}%</span>
                      </div>
                    )}

                    {highestPeakReg && (
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <div>
                          <span className="text-gray-400 text-[10px]">Highest Forecast Peak</span>
                          <div className="font-bold text-white text-sm">{highestPeakReg.region_name}</div>
                        </div>
                        <span className="font-bold text-emerald-400 text-sm">{highestPeakReg.forecast_peak_mw} MW</span>
                      </div>
                    )}

                    {highestRiskReg && (
                      <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-between">
                        <div>
                          <span className="text-rose-300 text-[10px]">Highest URJADRISHTI Risk</span>
                          <div className="font-bold text-white text-sm">{highestRiskReg.region_name}</div>
                        </div>
                        <span className="font-bold text-rose-400 text-sm">{highestRiskReg.risk_score} ({highestRiskReg.risk_level})</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-gray-400">
                  Click any region on the map or ranking table to view detailed load curves and planning profiles.
                </div>
              </div>
            </div>
          </div>

          {/* Selected Region Intelligence Panel */}
          {selectedRegion && (
            <div className="mb-8">
              <RegionalIntelligencePanel region={selectedRegion} />
            </div>
          )}

          {/* Grid Attention Advisory Card */}
          <div className="mb-8">
            <GridAttentionCard regions={regions} onSelectRegion={setSelectedRegionId} />
          </div>

          {/* Sortable Regional Ranking Table */}
          <RegionalRankingTable
            regions={regions}
            selectedRegionId={selectedRegionId}
            onSelectRegion={setSelectedRegionId}
          />
        </>
      )}

    </div>
  );
};
