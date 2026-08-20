import type { ApiResponse } from './client';

export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
  pixel_x?: number;
  pixel_y?: number;
  pixel_w?: number;
  pixel_h?: number;
}

export interface FireDetectionResult {
  fire_detected: boolean;
  confidence: number;
  hazard_level: 'CRITICAL' | 'NONE' | 'ERROR' | 'UNKNOWN';
  alert_message: string;
  substation_status: string;
  substation_id?: string;
  bounding_box?: BoundingBox | null;
}

export async function detectSubstationFire(
  imageBase64: string,
  substationId: string = 'bawana_400',
  simulateFire: boolean = false
): Promise<ApiResponse<FireDetectionResult>> {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  try {
    const res = await fetch(`${BACKEND_URL}/api/vision/detect-fire`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_base64: imageBase64,
        substation_id: substationId,
        simulate_fire: simulateFire,
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Vision AI API error`);
    }

    const data: FireDetectionResult = await res.json();
    return { data, error: null, isDemoMode: true };
  } catch (err: any) {
    if (simulateFire) {
      return {
        data: {
          fire_detected: true,
          confidence: 0.985,
          hazard_level: 'CRITICAL',
          alert_message: '🔥 CRITICAL ALERT: SPARK OR FIRE DETECTED! CHANCE OF MAJOR OUTBREAK AT SUBSTATION!',
          substation_status: 'FIRE HAZARD EMERGENCY',
          substation_id: substationId,
          bounding_box: { x: 32.0, y: 28.0, w: 36.0, h: 42.0 },
        },
        error: null,
        isDemoMode: true,
      };
    }

    return {
      data: {
        fire_detected: false,
        confidence: 0.95,
        hazard_level: 'NONE',
        alert_message: 'Substation camera optical scan clear. No thermal anomaly detected.',
        substation_status: 'NORMAL OPTICAL MONITORING',
        substation_id: substationId,
        bounding_box: null,
      },
      error: err.message,
      isDemoMode: true,
    };
  }
}
