"""
URJADRISHTI — Peak Detector & Peak Accuracy Evaluator
Identifies daily and multi-day peak load spikes and calculates peak prediction accuracy.
"""

from typing import Dict, Any, List

class PeakDetector:
    """
    Extracts peak demand insights and evaluates peak load forecast accuracy.
    """

    @staticmethod
    def detect_peak(data: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not data:
            return {
                "peak_mw": 0,
                "peak_time": "N/A",
                "time_label": "N/A",
                "margin_status": "UNKNOWN"
            }

        peak_item = max(data, key=lambda x: x.get("predicted_mw", 0))
        peak_mw = peak_item.get("predicted_mw", 0)
        peak_time = peak_item.get("timestamp", "")
        time_label = peak_item.get("time_label", "")

        return {
            "peak_mw": peak_mw,
            "peak_time": peak_time,
            "time_label": time_label,
            "margin_status": "SAFE" if peak_mw < 8500 else "EXPANSION_REQUIRED",
        }

    @staticmethod
    def evaluate_peak_accuracy(actual_peak_mw: float, forecast_peak_mw: float, actual_time_str: str, forecast_time_str: str) -> Dict[str, Any]:
        peak_error_mw = round(forecast_peak_mw - actual_peak_mw, 1)
        peak_error_percent = round((abs(peak_error_mw) / actual_peak_mw) * 100.0, 2) if actual_peak_mw > 0 else 0.0

        # Simplified 15-minute time difference estimate
        peak_time_error_minutes = 15 if actual_time_str != forecast_time_str else 0

        return {
            "actual_peak_mw": actual_peak_mw,
            "forecast_peak_mw": forecast_peak_mw,
            "peak_error_mw": peak_error_mw,
            "peak_error_percent": peak_error_percent,
            "actual_peak_time": actual_time_str,
            "forecast_peak_time": forecast_time_str,
            "peak_time_error_minutes": peak_time_error_minutes,
        }
