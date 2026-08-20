import type { ModelTelemetry } from '../../types/energy';
import { getModelTelemetry as getMockModelTelemetry } from '../api';
import { fetchFromBackend, type ApiResponse } from './client';

export async function fetchModelTelemetry(): Promise<ApiResponse<ModelTelemetry>> {
  return fetchFromBackend<ModelTelemetry>('/api/model-performance', () => getMockModelTelemetry());
}
