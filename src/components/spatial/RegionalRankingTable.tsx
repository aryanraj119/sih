import { useState } from 'react';
import type { RegionalMapData } from './DelhiMap';
import { ArrowUpDown } from 'lucide-react';

interface RegionalRankingTableProps {
  regions: RegionalMapData[];
  selectedRegionId: string;
  onSelectRegion: (regionId: string) => void;
  className?: string;
}

export const RegionalRankingTable = ({
  regions,
  selectedRegionId,
  onSelectRegion,
  className = '',
}: RegionalRankingTableProps) => {
  const [sortKey, setSortKey] = useState<keyof RegionalMapData>('risk_score');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const handleSort = (key: keyof RegionalMapData) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const sortedRegions = [...regions].sort((a, b) => {
    const valA = a[sortKey];
    const valB = b[sortKey];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    return sortAsc ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
  });

  return (
    <div className={`liquid-glass p-6 rounded-2xl border border-white/10 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white">Delhi Regional Power Ranking</h2>
          <p className="text-xs text-gray-400">Sortable comparison across all 9 analytical regions</p>
        </div>

        <span className="text-xs font-semibold text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-500/30">
          9 Analytical Regions
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px] tracking-wider">
              <th className="pb-3 cursor-pointer hover:text-white" onClick={() => handleSort('region_name')}>
                <div className="flex items-center gap-1">Region <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="pb-3 cursor-pointer hover:text-white" onClick={() => handleSort('discom')}>
                <div className="flex items-center gap-1">DISCOM <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="pb-3 cursor-pointer hover:text-white" onClick={() => handleSort('current_demand_mw')}>
                <div className="flex items-center gap-1">Current Load <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="pb-3 cursor-pointer hover:text-white" onClick={() => handleSort('forecast_peak_mw')}>
                <div className="flex items-center gap-1">Forecast Peak <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="pb-3 cursor-pointer hover:text-white" onClick={() => handleSort('growth_percent')}>
                <div className="flex items-center gap-1">5-Yr Growth <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="pb-3 cursor-pointer hover:text-white" onClick={() => handleSort('net_load_mw')}>
                <div className="flex items-center gap-1">Net Load <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="pb-3 cursor-pointer hover:text-white" onClick={() => handleSort('risk_score')}>
                <div className="flex items-center gap-1">Risk Score <ArrowUpDown className="w-3 h-3" /></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-gray-300">
            {sortedRegions.map((r) => {
              const isSelected = r.region_id === selectedRegionId;
              return (
                <tr
                  key={r.region_id}
                  onClick={() => onSelectRegion(r.region_id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'bg-cyan-950/40 text-white font-semibold' : 'hover:bg-white/5'
                  }`}
                >
                  <td className="py-3 font-semibold text-white">{r.region_name}</td>
                  <td className="py-3 text-cyan-400 font-mono">{r.discom}</td>
                  <td className="py-3 font-bold">{r.current_demand_mw.toLocaleString()} MW</td>
                  <td className="py-3 text-emerald-400 font-bold">{r.forecast_peak_mw.toLocaleString()} MW</td>
                  <td className="py-3 text-amber-400">+{r.growth_percent}%</td>
                  <td className="py-3 text-gray-200">{r.net_load_mw.toLocaleString()} MW</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.risk_level === 'HIGH' ? 'bg-rose-950 text-rose-300 border border-rose-500/30' :
                      r.risk_level === 'MODERATE' ? 'bg-amber-950 text-amber-300 border border-amber-500/30' :
                      'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {r.risk_score} ({r.risk_level})
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
