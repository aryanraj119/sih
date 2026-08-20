import type { ApiResponse } from './client';

export interface ChatResponseData {
  classified_horizon: string;
  response: string;
  model_used: string;
  status: string;
  error?: string;
}

export async function sendChatMessage(message: string, history?: { sender: string; text: string }[]): Promise<ApiResponse<ChatResponseData>> {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  
  try {
    const res = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, history }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Chat service error`);
    }

    const data: ChatResponseData = await res.json();
    return { data, error: null, isDemoMode: true };
  } catch (err: any) {
    return {
      data: {
        classified_horizon: 'Horizon 2: Power Procurement & Scheduling (1 – 7 Days ⭐ PRIMARY)',
        response: `**[URJADRISHTI OpenSTEF Assistant]**\n\nDelhi forecast peak load is expected at **7,820 MW** at 15:30 today (MAPE 1.38%). South Delhi exhibits a HIGH risk score (68.4). 24-Hour Duck Curve net load drops to 4,820 MW at 13:00 under 950 MW rooftop solar generation, followed by an evening ramp rate of +2,712 MW/h.`,
        model_used: 'offline-fallback',
        status: 'fallback',
      },
      error: err.message,
      isDemoMode: true,
    };
  }
}
