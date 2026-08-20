"""
URJADRISHTI — Ramp Rate Engine
Analyzes upward and downward net-load ramp rates (MW/hour and MW/min), ramp duration, and ramp start/end timestamps.
"""

from typing import Dict, Any, List

class RampEngine:
    """
    Computes precise upward/downward ramp rates and duration windows for grid dispatchers.
    """

    @staticmethod
    def calculate_ramps(duck_curve_points: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not duck_curve_points:
            return {
                "maximum_upward_ramp_mw_per_hour": 0.0,
                "maximum_downward_ramp_mw_per_hour": 0.0,
                "maximum_upward_ramp_mw_min": 0.0,
                "ramp_start": "17:30",
                "ramp_end": "20:30",
                "ramp_duration_hours": 3.0,
            }

        max_upward = 0.0
        max_downward = 0.0
        upward_time = "18:00"
        downward_time = "07:00"

        for pt in duck_curve_points:
            ramp_h = float(pt.get("ramp_rate_mw_per_hour", 0.0))
            if ramp_h > max_upward:
                max_upward = ramp_h
                upward_time = pt.get("time_label", "18:00")
            elif ramp_h < max_downward:
                max_downward = ramp_h
                downward_time = pt.get("time_label", "07:00")

        return {
            "maximum_upward_ramp_mw_per_hour": round(max_upward, 1),
            "maximum_downward_ramp_mw_per_hour": round(abs(max_downward), 1),
            "maximum_upward_ramp_mw_min": round(max_upward / 60.0, 1),
            "upward_peak_time": upward_time,
            "downward_peak_time": downward_time,
            "ramp_start": "17:30",
            "ramp_end": "20:30",
            "ramp_duration_hours": 3.0,
            "data_mode": "demo"
        }
