import type { ForecastHorizon, DemandDataPoint, DuckCurveDataPoint } from '../../types/energy';
import { getForecastData as getMockForecastData, getDuckCurveData as getMockDuckCurveData } from '../api';
import { fetchFromBackend, type ApiResponse } from './client';

export async function fetchForecast(horizon: ForecastHorizon, date?: string): Promise<ApiResponse<DemandDataPoint[]>> {
  const url = date ? `/api/forecast?horizon=${horizon}&date=${date}` : `/api/forecast?horizon=${horizon}`;
  return fetchFromBackend<DemandDataPoint[]>(url, () => getMockForecastData(horizon, date));
}

export async function fetchDuckCurve(date?: string): Promise<ApiResponse<DuckCurveDataPoint[]>> {
  const url = date ? `/api/forecast/duck-curve?date=${date}` : '/api/forecast/duck-curve';
  return fetchFromBackend<DuckCurveDataPoint[]>(url, () => getMockDuckCurveData(date));
}
