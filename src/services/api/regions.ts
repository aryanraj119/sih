import { fetchFromBackend, type ApiResponse } from './client';
import type { DiscomData } from '../../types/energy';
import type { RegionalMapData } from '../../components/spatial/DelhiMap';

export interface RegionalSummaryData {
  total_current_demand_mw: number;
  total_forecast_demand_mw: number;
  total_peak_mw: number;
  total_solar_mw: number;
  total_net_load_mw: number;
  highest_demand_region: string;
  highest_demand_mw: number;
  fastest_growing_region: string;
  fastest_growth_pct: number;
  highest_risk_region: string;
  highest_risk_score: number;
  highest_risk_level: string;
  total_regions: number;
  data_mode: string;
}

// Fetch DISCOM zonal data
export async function fetchRegions(date?: string): Promise<ApiResponse<DiscomData[]>> {
  const url = date ? `/api/regions?date=${date}` : '/api/regions';
  return fetchFromBackend<DiscomData[]>(url, () => []);
}

// Fetch 9 Delhi analytical regions for spatial map
export async function fetchSpatialRegions(date?: string): Promise<ApiResponse<RegionalMapData[]>> {
  const fallback = getFallbackSpatialRegions();
  const url = date ? `/api/regions?date=${date}` : '/api/regions';
  const result = await fetchFromBackend<{ regions: RegionalMapData[] }>(url, () => ({ regions: fallback }));
  if (result.data && Array.isArray(result.data.regions)) {
    return { data: result.data.regions, error: null, isDemoMode: result.isDemoMode };
  }
  return { data: fallback, error: result.error, isDemoMode: true };
}

// Fetch Delhi-wide regional summary metrics
export async function fetchRegionsSummary(date?: string): Promise<ApiResponse<RegionalSummaryData>> {
  const fallback = getFallbackSummaryData();
  const url = date ? `/api/regions/summary?date=${date}` : '/api/regions/summary';
  const result = await fetchFromBackend<RegionalSummaryData>(url, () => fallback);
  if (result.data) {
    return result;
  }
  return { data: fallback, error: result.error, isDemoMode: true };
}

function getFallbackSummaryData(): RegionalSummaryData {
  return {
    total_current_demand_mw: 4416.6,
    total_forecast_demand_mw: 4610,
    total_peak_mw: 7215.7,
    total_solar_mw: 980,
    total_net_load_mw: 3731.6,
    highest_demand_region: 'South Delhi',
    highest_demand_mw: 1820,
    fastest_growing_region: 'South Delhi',
    fastest_growth_pct: 7.5,
    highest_risk_region: 'South Delhi',
    highest_risk_score: 68.4,
    highest_risk_level: 'HIGH',
    total_regions: 9,
    data_mode: 'REAL_DATASET_MODE',
  };
}

function getFallbackSpatialRegions(): RegionalMapData[] {
  return [
    { region_id: 'south', region_name: 'South Delhi', discom: 'BRPL', current_demand_mw: 1820, forecast_demand_mw: 1910, forecast_peak_mw: 2070, growth_percent: 7.5, solar_generation_mw: 220, net_load_mw: 1600, risk_score: 68.4, risk_level: 'HIGH', explanation: 'Elevated forecast peak load combined with high regional demand growth.', utilisation_pct: 86.4, peak_time: '15:30' },
    { region_id: 'west', region_name: 'West Delhi', discom: 'BRPL', current_demand_mw: 1420, forecast_demand_mw: 1490, forecast_peak_mw: 1610, growth_percent: 7.5, solar_generation_mw: 140, net_load_mw: 1280, risk_score: 54.2, risk_level: 'HIGH', explanation: 'Substation capacity utilisation approaching 80% during afternoon peak.', utilisation_pct: 78.5, peak_time: '15:30' },
    { region_id: 'south_west', region_name: 'South-West Delhi', discom: 'BRPL', current_demand_mw: 1250, forecast_demand_mw: 1310, forecast_peak_mw: 1420, growth_percent: 7.5, solar_generation_mw: 120, net_load_mw: 1130, risk_score: 48.6, risk_level: 'MODERATE', explanation: 'Moderate growth rate with steady EV charger load expansion.', utilisation_pct: 72.1, peak_time: '15:30' },
    { region_id: 'north', region_name: 'North Delhi', discom: 'TPDDL', current_demand_mw: 1150, forecast_demand_mw: 1210, forecast_peak_mw: 1320, growth_percent: 6.2, solar_generation_mw: 150, net_load_mw: 1000, risk_score: 42.1, risk_level: 'MODERATE', explanation: 'Stable load distribution with high rooftop solar offsets.', utilisation_pct: 68.4, peak_time: '15:30' },
    { region_id: 'north_west', region_name: 'North-West Delhi', discom: 'TPDDL', current_demand_mw: 1000, forecast_demand_mw: 1050, forecast_peak_mw: 1140, growth_percent: 6.2, solar_generation_mw: 110, net_load_mw: 890, risk_score: 38.5, risk_level: 'MODERATE', explanation: 'Manageable load ramping and optimal transformer headroom.', utilisation_pct: 64.2, peak_time: '15:30' },
    { region_id: 'south_east', region_name: 'South-East Delhi', discom: 'BRPL', current_demand_mw: 880, forecast_demand_mw: 920, forecast_peak_mw: 990, growth_percent: 7.5, solar_generation_mw: 80, net_load_mw: 800, risk_score: 62.0, region_name_full: 'South-East Delhi', risk_level: 'HIGH', explanation: 'High commercial peak demand density requiring grid transformer planning.', utilisation_pct: 82.0, peak_time: '15:30' } as any,
    { region_id: 'central', region_name: 'Central Delhi', discom: 'BYPL', current_demand_mw: 640, forecast_demand_mw: 670, forecast_peak_mw: 730, growth_percent: 5.1, solar_generation_mw: 60, net_load_mw: 580, risk_score: 28.4, risk_level: 'MODERATE', explanation: 'Low growth pressure with steady commercial baseline.', utilisation_pct: 58.2, peak_time: '15:30' },
    { region_id: 'east', region_name: 'East Delhi', discom: 'BYPL', current_demand_mw: 600, forecast_demand_mw: 630, forecast_peak_mw: 660, growth_percent: 5.1, solar_generation_mw: 50, net_load_mw: 550, risk_score: 24.1, risk_level: 'LOW', explanation: 'Minimal ramping volatility and stable load profile.', utilisation_pct: 54.0, peak_time: '15:30' },
    { region_id: 'north_east', region_name: 'North-East Delhi', discom: 'BYPL', current_demand_mw: 580, forecast_demand_mw: 610, forecast_peak_mw: 660, growth_percent: 5.1, solar_generation_mw: 40, net_load_mw: 540, risk_score: 22.8, risk_level: 'LOW', explanation: 'Optimal grid reserve margin with low risk score.', utilisation_pct: 52.1, peak_time: '15:30' },
  ];
}
