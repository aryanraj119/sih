"""
URJADRISHTI — Duck Curve & Net Load Engine
Calculates net load (Demand - Solar), solar peak, minimum net load trough ("Duck Belly"), and evening ramp window.
"""

from typing import Dict, Any, List
from backend.forecasting.solar_provider import SolarDataProvider, DemoSolarProvider
from backend.data.synthetic_delhi_data import SyntheticDelhiDataGenerator

class DuckCurveEngine:
    """
    Computes 24-hour Duck Curve telemetry, net load shifts, solar peaks, and indicative curtailment pressure.
    """

    def __init__(self, solar_provider: SolarDataProvider = None, data_generator: SyntheticDelhiDataGenerator = None):
        self.solar_provider = solar_provider or DemoSolarProvider()
        self.data_generator = data_generator or SyntheticDelhiDataGenerator(seed=42)

    def calculate_duck_curve(self, horizon: str = "day_ahead") -> Dict[str, Any]:
        demand_points = self.data_generator.generate_interval_data(horizon=horizon)
        solar_points = self.solar_provider.get_forecast_solar(horizon=horizon)

        duck_points = []
        max_solar_mw = 0.0
        max_solar_time = "13:00"
        min_net_mw = 99999.0
        min_net_time = "13:00"
        max_ramp_mw_min = 0.0

        for idx, d_pt in enumerate(demand_points):
            h = idx % 24
            s_pt = solar_points[h] if h < len(solar_points) else {"solar_mw": 0.0}
            
            demand_mw = float(d_pt["predicted_mw"])
            solar_mw = float(s_pt.get("solar_mw", 0.0))
            net_load_mw = max(0.0, demand_mw - solar_mw)
            potential_surplus_mw = max(0.0, solar_mw - demand_mw)

            # Instantaneous solar penetration %
            instant_penetration_pct = round((solar_mw / demand_mw * 100.0) if demand_mw > 0 else 0.0, 1)

            # Ramp rate relative to previous hour
            prev_net = duck_points[idx - 1]["net_load_mw"] if idx > 0 else net_load_mw
            ramp_mw_hour = round(net_load_mw - prev_net, 1)
            ramp_mw_min = round(ramp_mw_hour / 60.0, 1)

            if solar_mw > max_solar_mw:
                max_solar_mw = solar_mw
                max_solar_time = d_pt["time_label"]

            if net_load_mw < min_net_mw:
                min_net_mw = net_load_mw
                min_net_time = d_pt["time_label"]

            if ramp_mw_min > max_ramp_mw_min:
                max_ramp_mw_min = ramp_mw_min

            duck_points.append({
                "hour": h,
                "time_label": d_pt["time_label"],
                "gross_demand_mw": demand_mw,
                "solar_generation_mw": solar_mw,
                "net_load_mw": net_load_mw,
                "potential_surplus_mw": potential_surplus_mw,
                "solar_penetration_pct": instant_penetration_pct,
                "ramp_rate_mw_per_hour": ramp_mw_hour,
                "ramp_rate_mw_min": ramp_mw_min,
            })

        return {
            "horizon": horizon,
            "data_mode": "demo",
            "solar_peak_mw": max_solar_mw,
            "solar_peak_time": max_solar_time,
            "net_load_minimum_mw": min_net_mw,
            "net_load_minimum_time": min_net_time,
            "evening_ramp_start": "17:30",
            "evening_ramp_end": "20:30",
            "maximum_evening_ramp_mw_min": max_ramp_mw_min,
            "maximum_evening_ramp_mw_per_hour": round(max_ramp_mw_min * 60.0, 1),
            "points": duck_points,
        }
