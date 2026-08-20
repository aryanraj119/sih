"""
URJADRISHTI — Short-Term Forecasting Engine (15 Min – 6 Hours)
Focus: Intra-day demand, peak load spikes, and rapid ramp rates (MW/min).
"""

from typing import Dict, Any, List
from backend.forecasting.engine import ForecastEngine
from backend.forecasting.openstef_adapter import OpenSTEFAdapter

class ShortTermEngine(ForecastEngine):
    def __init__(self, openstef_adapter: OpenSTEFAdapter):
        self.openstef = openstef_adapter

    def forecast(self, params: Dict[str, Any]) -> List[Dict[str, Any]]:
        return self.openstef.predict_short_term(params)

    def forecast_peak(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not data:
            return {"peak_mw": 0, "peak_time": "N/A"}
        
        peak_item = max(data, key=lambda x: x.get("predicted_mw", 0))
        return {
            "peak_mw": peak_item["predicted_mw"],
            "peak_time": peak_item["timestamp"],
            "time_label": peak_item["time_label"],
            "margin_status": "SAFE"
        }

    def forecast_ramp(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        if len(data) < 2:
            return {"max_ramp_mw_min": 0.0, "status": "STABLE"}
        
        max_ramp = 0.0
        max_ramp_time = ""

        for i in range(1, len(data)):
            diff_mw = data[i]["net_load_mw"] - data[i-1]["net_load_mw"]
            ramp_mw_min = round(diff_mw / 15.0, 1)
            if ramp_mw_min > max_ramp:
                max_ramp = ramp_mw_min
                max_ramp_time = data[i]["time_label"]

        return {
            "max_ramp_mw_min": max_ramp,
            "ramp_peak_time": max_ramp_time,
            "status": "MODERATE RAMP" if max_ramp > 25.0 else "STABLE"
        }

    def evaluate_model(self) -> Dict[str, Any]:
        return self.openstef.get_eval_metrics()
