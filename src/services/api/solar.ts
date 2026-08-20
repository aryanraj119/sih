import { fetchFromBackend, type ApiResponse } from './client';
import type { ForecastHorizon } from '../../types/energy';

export interface SolarGridSummaryData {
  current_demand_mw: number;
  current_solar_mw: number;
  current_net_load_mw: number;
  solar_penetration_percent: number;
  forecast_peak_mw: number;
  maximum_evening_ramp_mw_per_hour: number;
  potential_solar_surplus_mw: number;
  grid_stress_score: number;
  grid_stress_level: string;
  grid_stress_explanation: string;
  data_mode: string;
}

export interface DuckCurvePoint {
  hour: number;
  time_label: string;
  gross_demand_mw: number;
  solar_generation_mw: number;
  net_load_mw: number;
  potential_surplus_mw: number;
  solar_penetration_pct: number;
  ramp_rate_mw_per_hour: number;
  ramp_rate_mw_min: number;
}

export interface DuckCurveResponse {
  horizon: string;
  data_mode: string;
  solar_peak_mw: number;
  solar_peak_time: string;
  net_load_minimum_mw: number;
  net_load_minimum_time: string;
  evening_ramp_start: string;
  evening_ramp_end: string;
  maximum_evening_ramp_mw_min: number;
  maximum_evening_ramp_mw_per_hour: number;
  points: DuckCurvePoint[];
}

// Fetch Solar & Grid summary KPIs
export async function fetchSolarGridSummary(horizon: ForecastHorizon = 'day_ahead'): Promise<ApiResponse<SolarGridSummaryData>> {
  const fallback = getFallbackSolarGridSummary();
  return fetchFromBackend<SolarGridSummaryData>(`/api/solar-grid/summary?horizon=${horizon}`, () => fallback);
}

// Fetch 24-Hour Duck Curve Net Load dataset
export async function fetchDuckCurveData(horizon: ForecastHorizon = 'day_ahead'): Promise<ApiResponse<DuckCurveResponse>> {
  const fallback = getFallbackDuckCurveData(horizon);
  return fetchFromBackend<DuckCurveResponse>(`/api/duck-curve?horizon=${horizon}`, () => fallback);
}

function getFallbackSolarGridSummary(): SolarGridSummaryData {
  return {
    current_demand_mw: 6485,
    current_solar_mw: 685,
    current_net_load_mw: 5800,
    solar_penetration_percent: 10.6,
    forecast_peak_mw: 7820,
    maximum_evening_ramp_mw_per_hour: 2712,
    potential_solar_surplus_mw: 0,
    grid_stress_score: 64.2,
    grid_stress_level: 'HIGH',
    grid_stress_explanation: 'Elevated evening net-load ramp (+2,712 MW/h) combined with high afternoon peak demand (7,820 MW).',
    data_mode: 'demo',
  };
}

function getFallbackDuckCurveData(horizon: string): DuckCurveResponse {
  const points: DuckCurvePoint[] = [];
  for (let h = 0; h < 24; h++) {
    const gross = 5200 + Math.sin((h / 24) * Math.PI) * 2200;
    const solar = (h >= 6 && h <= 18) ? Math.sin(((h - 6) / 12) * Math.PI) * 950 : 0;
    const net = Math.max(2500, gross - solar);
    const prevNet = h > 0 ? points[h - 1].net_load_mw : net;
    const rampRateH = Math.round(net - prevNet);

    points.push({
      hour: h,
      time_label: `${String(h).padStart(2, '0')}:00`,
      gross_demand_mw: Math.round(gross),
      solar_generation_mw: Math.round(solar),
      net_load_mw: Math.round(net),
      potential_surplus_mw: 0,
      solar_penetration_pct: Math.round((solar / gross) * 1000) / 10,
      ramp_rate_mw_per_hour: rampRateH,
      ramp_rate_mw_min: Math.round((rampRateH / 60) * 10) / 10,
    });
  }

  return {
    horizon,
    data_mode: 'demo',
    solar_peak_mw: 950,
    solar_peak_time: '13:00',
    net_load_minimum_mw: 4820,
    net_load_minimum_time: '13:00',
    evening_ramp_start: '17:30',
    evening_ramp_end: '20:30',
    maximum_evening_ramp_mw_min: 45.2,
    maximum_evening_ramp_mw_per_hour: 2712,
    points,
  };
}
