"""
URJADRISHTI — Uncertainty Estimator
Generates probabilistic prediction intervals (P10, P50, P90) and evaluates prediction interval coverage.
"""

from typing import Dict, Any

class UncertaintyEstimator:
    """
    Computes P10, P50, and P90 uncertainty bands for probabilistic forecasting.
    """

    @staticmethod
    def calculate_bounds(predicted_mw: int, std_ratio: float = 0.035) -> Dict[str, Any]:
        p50 = predicted_mw
        p10 = int(predicted_mw * (1.0 - std_ratio))
        p90 = int(predicted_mw * (1.0 + std_ratio))
        width = p90 - p10

        return {
            "p10_mw": p10,
            "p50_mw": p50,
            "p90_mw": p90,
            "prediction_interval_width_mw": width,
            "coverage_target_pct": 95.0,
        }

    @staticmethod
    def calculate_coverage(actual_mw: int, p10_mw: int, p90_mw: int) -> bool:
        return p10_mw <= actual_mw <= p90_mw
