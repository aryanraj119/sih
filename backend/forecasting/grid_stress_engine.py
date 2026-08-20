"""
URJADRISHTI — Grid Stress Engine
Calculates the URJADRISHTI Grid Stress Score (0-100), classification levels, and explainable text rationale.
"""

from typing import Dict, Any

class GridStressEngine:
    """
    Computes explainable grid operational stress scores combining peak load, evening ramp rates, and solar penetration.
    """

    @staticmethod
    def calculate_stress_score(
        forecast_peak_mw: float,
        max_evening_ramp_mw_per_hour: float,
        solar_penetration_pct: float,
        forecast_uncertainty_pct: float = 5.2
    ) -> Dict[str, Any]:
        
        # 1. Peak Load Stress (0-40 points, normalized against 10,000 MW Delhi summer limit)
        peak_score = min(40.0, (forecast_peak_mw / 10000.0) * 40.0)

        # 2. Evening Ramp Stress (0-35 points, normalized against 3,000 MW/h max ramp)
        ramp_score = min(35.0, (max_evening_ramp_mw_per_hour / 3000.0) * 35.0)

        # 3. Solar Penetration Volatility (0-15 points)
        solar_score = min(15.0, (solar_penetration_pct / 30.0) * 15.0)

        # 4. Uncertainty Margin (0-10 points)
        uncertainty_score = min(10.0, (forecast_uncertainty_pct / 10.0) * 10.0)

        raw_score = peak_score + ramp_score + solar_score + uncertainty_score
        final_score = round(min(100.0, max(0.0, raw_score)), 1)

        # Classify Grid Stress Level
        if final_score >= 75.0:
            level = "CRITICAL"
            explanation = f"Critical grid stress! Steep evening ramp (+{int(max_evening_ramp_mw_per_hour)} MW/h) approaching peak capacity of {int(forecast_peak_mw)} MW."
        elif final_score >= 50.0:
            level = "HIGH"
            explanation = f"Elevated evening net-load ramp (+{int(max_evening_ramp_mw_per_hour)} MW/h) combined with high afternoon peak demand ({int(forecast_peak_mw)} MW)."
        elif final_score >= 25.0:
            level = "MODERATE"
            explanation = f"Moderate peak pressure ({int(forecast_peak_mw)} MW) with manageable evening net-load ramp rates within operational limits."
        else:
            level = "LOW"
            explanation = "Stable grid load, minimal evening ramping volatility, and optimal thermal generation headroom."

        return {
            "grid_stress_score": final_score,
            "grid_stress_level": level,
            "explanation": explanation,
            "score_breakdown": {
                "peak_stress": round(peak_score, 1),
                "ramp_stress": round(ramp_score, 1),
                "solar_volatility": round(solar_score, 1),
                "uncertainty_margin": round(uncertainty_score, 1),
            },
            "data_mode": "demo"
        }
