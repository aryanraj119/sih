"""
URJADRISHTI — Regional Power Intelligence Engine
Manages Delhi's 9 analytical regions, regional forecast scaling, long-term growth, and summary aggregations.
"""

from typing import Dict, Any, List
from backend.forecasting.risk_engine import RegionalRiskEngine
from backend.data.synthetic_delhi_data import SyntheticDelhiDataGenerator

class RegionalEngine:
    """
    Orchestrates spatial energy intelligence for Delhi's 9 analytical regions.
    """

    def __init__(self, data_generator: SyntheticDelhiDataGenerator = None):
        self.data_generator = data_generator or SyntheticDelhiDataGenerator(seed=42)

    def get_all_regions(self) -> List[Dict[str, Any]]:
        raw_regions = self.data_generator.generate_regional_data()
        result = []

        for r in raw_regions:
            current_mw = r["current_load_mw"]
            peak_mw = r["peak_load_mw"]
            capacity_mw = r["capacity_mw"]
            solar_mw = r["solar_mw"]
            net_load_mw = max(100, current_mw - solar_mw)
            
            # Growth % varies by zone
            growth_pct = 7.5 if r["id"] in ["south", "west", "south_west"] else (6.2 if r["id"] in ["north", "north_west"] else 5.1)
            annual_mwh = int(peak_mw * 8760 * 0.52)
            ramp_mw_min = round(current_mw * 0.025, 1)

            risk_info = RegionalRiskEngine.calculate_risk_score(
                current_demand_mw=current_mw,
                capacity_mw=capacity_mw,
                growth_percent=growth_pct,
                ramp_rate_mw_min=ramp_mw_min,
                solar_penetration_mw=solar_mw
            )

            result.append({
                "region_id": r["id"],
                "region_name": r["name"],
                "discom": r["discom"],
                "current_demand_mw": current_mw,
                "forecast_demand_mw": int(current_mw * 1.05),
                "forecast_peak_mw": peak_mw,
                "capacity_mw": capacity_mw,
                "peak_time": "15:30",
                "growth_percent": growth_pct,
                "annual_demand_mwh": annual_mwh,
                "annual_peak_mw": int(peak_mw * 1.062),
                "solar_generation_mw": solar_mw,
                "net_load_mw": net_load_mw,
                "ev_stations": r["ev_stations"],
                "risk_score": risk_info["risk_score"],
                "risk_level": risk_info["risk_level"],
                "explanation": risk_info["explanation"],
                "utilisation_pct": risk_info["utilisation_pct"],
                "last_updated": "2026-08-20T10:00:00Z",
                "data_mode": "demo"
            })

        return result

    def get_region_by_id(self, region_id: str) -> Dict[str, Any]:
        all_regions = self.get_all_regions()
        for r in all_regions:
            if r["region_id"] == region_id:
                return r
        return all_regions[0]  # Fallback to South Delhi

    def get_regional_summary(self) -> Dict[str, Any]:
        regions = self.get_all_regions()
        
        total_current_demand = sum(r["current_demand_mw"] for r in regions)
        total_forecast_demand = sum(r["forecast_demand_mw"] for r in regions)
        total_peak_mw = sum(r["forecast_peak_mw"] for r in regions)
        total_solar_mw = sum(r["solar_generation_mw"] for r in regions)
        total_net_load_mw = sum(r["net_load_mw"] for r in regions)

        highest_demand = max(regions, key=lambda x: x["current_demand_mw"])
        fastest_growing = max(regions, key=lambda x: x["growth_percent"])
        highest_risk = max(regions, key=lambda x: x["risk_score"])

        return {
            "total_current_demand_mw": total_current_demand,
            "total_forecast_demand_mw": total_forecast_demand,
            "total_peak_mw": total_peak_mw,
            "total_solar_mw": total_solar_mw,
            "total_net_load_mw": total_net_load_mw,
            "highest_demand_region": highest_demand["region_name"],
            "highest_demand_mw": highest_demand["current_demand_mw"],
            "fastest_growing_region": fastest_growing["region_name"],
            "fastest_growth_pct": fastest_growing["growth_percent"],
            "highest_risk_region": highest_risk["region_name"],
            "highest_risk_score": highest_risk["risk_score"],
            "highest_risk_level": highest_risk["risk_level"],
            "total_regions": len(regions),
            "data_mode": "demo"
        }

    def get_regional_forecast(self, region_id: str, horizon: str = "day_ahead") -> List[Dict[str, Any]]:
        base_points = self.data_generator.generate_interval_data(horizon=horizon)
        region = self.get_region_by_id(region_id)
        
        scale_factor = region["current_demand_mw"] / 6485.0

        scaled_points = []
        for pt in base_points:
            pred = int(pt["predicted_mw"] * scale_factor)
            solar = int(pt["solar_mw"] * (region["solar_generation_mw"] / 685.0))
            net = max(100, pred - solar)

            scaled_points.append({
                "timestamp": pt["timestamp"],
                "time_label": pt["time_label"],
                "predicted_mw": pred,
                "p10_mw": int(pred * 0.96),
                "p50_mw": pred,
                "p90_mw": int(pred * 1.04),
                "solar_mw": solar,
                "net_load_mw": net,
                "temperature_c": pt["temperature_c"],
            })
        return scaled_points

    def get_regional_growth(self, region_id: str) -> List[Dict[str, Any]]:
        region = self.get_region_by_id(region_id)
        years = [2026, 2027, 2028, 2029, 2030]
        base_peak = region["forecast_peak_mw"]
        growth_rate = region["growth_percent"] / 100.0

        points = []
        for idx, yr in enumerate(years):
            peak = int(base_peak * ((1.0 + growth_rate) ** idx))
            annual_mwh = int(peak * 8760 * 0.52)
            points.append({
                "year": yr,
                "annual_peak_mw": peak,
                "annual_demand_mwh": annual_mwh,
                "growth_percent": region["growth_percent"],
                "p10_mw": int(peak * 0.95),
                "p50_mw": peak,
                "p90_mw": int(peak * 1.05),
            })
        return points
