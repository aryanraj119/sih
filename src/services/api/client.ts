/**
 * URJADRISHTI — Centralized Frontend API Client
 * Connects directly to FastAPI backend server (http://127.0.0.1:8000) for real CSV dataset telemetry.
 */

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  isDemoMode: boolean;
}

export async function fetchFromBackend<T>(endpoint: string, fallbackFn: () => T): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${BACKEND_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }
    const json = await response.json();
    return {
      data: json.data || json,
      error: null,
      isDemoMode: false,
    };
  } catch (err: any) {
    console.warn(`[URJADRISHTI API] Live backend query (${endpoint}) fallback:`, err.message);
    return {
      data: fallbackFn(),
      error: null,
      isDemoMode: true,
    };
  }
}
