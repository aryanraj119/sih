import type { ScenarioInputs, DemandDataPoint } from '../../types/energy';
import { runScenarioSimulation as runMockScenarioSimulation } from '../api';
import type { ApiResponse } from './client';

export async function simulateScenario(inputs: ScenarioInputs, date?: string): Promise<ApiResponse<DemandDataPoint[]>> {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';
  const payload = date ? { ...inputs, date } : inputs;

  try {
    const res = await fetch(`${BACKEND_URL}/api/scenario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return { data: json.data || [], error: null, isDemoMode: true };
  } catch (err: any) {
    return { data: runMockScenarioSimulation(inputs), error: null, isDemoMode: true };
  }
}
