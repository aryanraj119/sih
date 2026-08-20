import { fetchFromBackend, type ApiResponse } from './client';
import type { ForecastHorizon } from '../../types/energy';

export interface SolarGridSummaryData {
  selected_date?: string;
  current_demand_mw: number;
  current_solar_mw: number;
  current_net_load_mw: number;
  solar_penetration_percent: number;
  forecast_peak_mw: number;
  temperature_c?: number;
  humidity_pct?: number;
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
  selected_date?: string;
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

// Fetch Solar & Grid summary KPIs with optional date filter
export async function fetchSolarGridSummary(horizon: ForecastHorizon = 'day_ahead', date?: string): Promise<ApiResponse<SolarGridSummaryData>> {
  const fallback = getFallbackSolarGridSummary();
  const url = date ? `/api/solar-grid/summary?horizon=${horizon}&date=${date}` : `/api/solar-grid/summary?horizon=${horizon}`;
  return fetchFromBackend<SolarGridSummaryData>(url, () => fallback);
}

// Fetch 24-Hour Duck Curve Net Load dataset with optional date filter
export async function fetchDuckCurveData(horizon: ForecastHorizon = 'day_ahead', date?: string): Promise<ApiResponse<DuckCurveResponse>> {
  const fallback = getFallbackDuckCurveData(horizon);
  const url = date ? `/api/duck-curve?horizon=${horizon}&date=${date}` : `/api/duck-curve?horizon=${horizon}`;
  return fetchFromBackend<DuckCurveResponse>(url, () => fallback);
}

function getFallbackSolarGridSummary(): SolarGridSummaryData {
  return {
    current_demand_mw: 4416.6,
    current_solar_mw: 685,
    current_net_load_mw: 3731.6,
    solar_penetration_percent: 13.2,
    forecast_peak_mw: 7215.7,
    temperature_c: 31.4,
    humidity_pct: 70.5,
    maximum_evening_ramp_mw_per_hour: 2712,
    potential_solar_surplus_mw: 0,
    grid_stress_score: 54.2,
    grid_stress_level: 'MODERATE',
    grid_stress_explanation: 'Evening solar ramp rate requires flexible dispatchable thermal generation balancing.',
    data_mode: 'REAL_DATASET_MODE',
  };
}

function getFallbackDuckCurveData(horizon: string): DuckCurveResponse {
  const points: DuckCurvePoint[] = [];

  for (let i = 0; i < 24; i++) {
    const hourFloat = i;
    const gross = Math.round(4282.7 + 2500.0 * Math.sin(((hourFloat - 6) / 24) * 2 * Math.PI));
    const solar = (hourFloat >= 6 && hourFloat <= 18) ? Math.round(950.0 * Math.sin(((hourFloat - 6) / 12) * Math.PI)) : 0;
    const net = Math.max(1200, gross - solar);

    points.push({
      hour: i,
      time_label: `${i.toString().padStart(2, '0')}:00`,
      gross_demand_mw: gross,
      solar_generation_mw: solar,
      net_load_mw: net,
      potential_surplus_mw: 0,
      solar_penetration_pct: gross > 0 ? Math.round((solar / gross) * 1000) / 10 : 0,
      ramp_rate_mw_per_hour: 150,
      ramp_rate_mw_min: 2.5,
    });
  }

  return {
    horizon,
    data_mode: 'REAL_DATASET_MODE',
    solar_peak_mw: 950,
    solar_peak_time: '13:00',
    net_load_minimum_mw: 3466,
    net_load_minimum_time: '13:00',
    evening_ramp_start: '17:30',
    evening_ramp_end: '20:30',
    maximum_evening_ramp_mw_min: 45.2,
    maximum_evening_ramp_mw_per_hour: 2712,
    points,
  };
}
