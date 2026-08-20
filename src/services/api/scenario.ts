import type { ScenarioInputs, DemandDataPoint } from '../../types/energy';
import { runScenarioSimulation as runMockScenarioSimulation } from '../api';
import { fetchFromBackend, type ApiResponse } from './client';

export async function simulateScenario(inputs: ScenarioInputs): Promise<ApiResponse<DemandDataPoint[]>> {
  return fetchFromBackend<DemandDataPoint[]>('/api/scenario', () => runMockScenarioSimulation(inputs));
}
