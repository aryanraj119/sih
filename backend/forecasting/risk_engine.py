"""
URJADRISHTI — Regional Risk Engine
Calculates the URJADRISHTI Regional Risk Score (0-100) and risk level classification.
Risk Score = Weighted Peak Pressure + Growth Pressure + Ramp Pressure + Uncertainty.
"""

from typing import Dict, Any

class RegionalRiskEngine:
    """
    Computes explainable operational and planning risk scores for Delhi analytical grid regions.
    """

    @staticmethod
    def calculate_risk_score(
        current_demand_mw: float,
        capacity_mw: float,
        growth_percent: float,
        ramp_rate_mw_min: float,
        solar_penetration_mw: float
    ) -> Dict[str, Any]:
        
        # 1. Utilisation Pressure (0-40 points)
        utilisation_pct = (current_demand_mw / capacity_mw * 100.0) if capacity_mw > 0 else 70.0
        peak_score = min(40.0, (utilisation_pct / 100.0) * 40.0)

        # 2. Growth Pressure (0-30 points)
        growth_score = min(30.0, (growth_percent / 10.0) * 30.0)

        # 3. Ramp Pressure (0-20 points)
        ramp_score = min(20.0, (ramp_rate_mw_min / 40.0) * 20.0)

        # 4. Solar Volatility Factor (0-10 points)
        solar_score = min(10.0, (solar_penetration_mw / 500.0) * 10.0)

        raw_score = peak_score + growth_score + ramp_score + solar_score
        final_score = round(min(100.0, max(0.0, raw_score)), 1)

        # Classify Risk Level
        if final_score >= 75.0:
            level = "CRITICAL"
            explanation = "Severe peak capacity pressure combined with rapid regional demand growth and high ramp rates."
        elif final_score >= 50.0:
            level = "HIGH"
            explanation = "Elevated forecast peak load approaching substation capacity limits with above-average demand growth."
        elif final_score >= 25.0:
            level = "MODERATE"
            explanation = "Moderate demand growth and manageable evening ramp rates within safe thermal operational bounds."
        else:
            level = "LOW"
            explanation = "Stable grid load, high capacity headroom, and minimal ramping volatility."

        return {
            "risk_score": final_score,
            "risk_level": level,
            "explanation": explanation,
            "utilisation_pct": round(utilisation_pct, 1),
            "score_breakdown": {
                "peak_pressure": round(peak_score, 1),
                "growth_pressure": round(growth_score, 1),
                "ramp_pressure": round(ramp_score, 1),
                "solar_volatility": round(solar_score, 1),
            }
        }
