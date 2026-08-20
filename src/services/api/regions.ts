import type { DiscomData } from '../../types/energy';
import { getDiscomData as getMockDiscomData } from '../api';
import { fetchFromBackend, type ApiResponse } from './client';

export async function fetchRegions(): Promise<ApiResponse<DiscomData[]>> {
  return fetchFromBackend<DiscomData[]>('/api/regions', () => getMockDiscomData());
}
