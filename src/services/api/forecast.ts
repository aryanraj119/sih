import type { ForecastHorizon, DemandDataPoint, DuckCurveDataPoint } from '../../types/energy';
import { getForecastData as getMockForecastData, getDuckCurveData as getMockDuckCurveData } from '../api';
import { fetchFromBackend, type ApiResponse } from './client';

export async function fetchForecast(horizon: ForecastHorizon): Promise<ApiResponse<DemandDataPoint[]>> {
  return fetchFromBackend<DemandDataPoint[]>(`/api/forecast?horizon=${horizon}`, () => getMockForecastData(horizon));
}

export async function fetchDuckCurve(): Promise<ApiResponse<DuckCurveDataPoint[]>> {
  return fetchFromBackend<DuckCurveDataPoint[]>('/api/forecast/duck-curve', () => getMockDuckCurveData());
}
