/**
 * URJADRISHTI — Centralized Frontend API Client
 * Provides unified data fetching, error handling, and DEMO_MODE fallback capabilities.
 */

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
export const IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  isDemoMode: boolean;
}

export async function fetchFromBackend<T>(endpoint: string, fallbackFn: () => T): Promise<ApiResponse<T>> {
  if (IS_DEMO_MODE) {
    return {
      data: fallbackFn(),
      error: null,
      isDemoMode: true,
    };
  }

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
    console.warn(`[URJADRISHTI API] Backend connection failed (${err.message}). Falling back to DEMO_MODE.`);
    return {
      data: fallbackFn(),
      error: `Forecast service connection offline (${err.message}). Showing DEMO_MODE synthetic data.`,
      isDemoMode: true,
    };
  }
}
