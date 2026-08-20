"""
URJADRISHTI — Solar Data Provider Layer
Abstract interface and deterministic synthetic provider for Delhi rooftop & utility-scale solar generation.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List
import math

class SolarDataProvider(ABC):
    """Abstract interface for solar generation data providers."""

    @abstractmethod
    def get_current_solar(self) -> Dict[str, Any]:
        pass

    @abstractmethod
    def get_forecast_solar(self, horizon: str = "day_ahead") -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_historical_solar(self) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_regional_solar(self) -> List[Dict[str, Any]]:
        pass


class DemoSolarProvider(SolarDataProvider):
    """
    Deterministic synthetic solar generation provider modeling Delhi's rooftop solar adoption profile.
    Midday peak of ~950 MW between 12:00 and 14:00, zero at night (19:00 - 05:00).
    """

    def __init__(self, capacity_mw: float = 1200.0):
        self.capacity_mw = capacity_mw

    def _calculate_solar_mw(self, hour: float) -> float:
        # Solar active between 06:00 and 18:00
        if 6.0 <= hour <= 18.0:
            sin_val = math.sin(((hour - 6.0) / 12.0) * math.pi)
            # Peak at ~950 MW at hour 12.5 (12:30 PM)
            return round(max(0.0, 950.0 * sin_val), 1)
        return 0.0

    def get_current_solar(self) -> Dict[str, Any]:
        current_hour = 13.5  # 1:30 PM peak
        gen_mw = self._calculate_solar_mw(current_hour)
        return {
            "current_solar_mw": gen_mw,
            "installed_capacity_mw": self.capacity_mw,
            "capacity_factor_pct": round((gen_mw / self.capacity_mw) * 100.0, 1),
            "timestamp": "2026-08-20T13:30:00Z",
            "data_mode": "demo"
        }

    def get_forecast_solar(self, horizon: str = "day_ahead") -> List[Dict[str, Any]]:
        count = 24 if horizon in ["short_term", "day_ahead"] else 5
        points = []

        if horizon == "long_term":
            years = [2026, 2027, 2028, 2029, 2030]
            base_cap = self.capacity_mw
            for idx, yr in enumerate(years):
                cap = int(base_cap * ((1.25) ** idx))  # 25% annual rooftop expansion
                points.append({
                    "year": yr,
                    "installed_solar_mw": cap,
                    "peak_solar_generation_mw": int(cap * 0.82),
                    "annual_solar_mwh": int(cap * 8760 * 0.19),
                    "data_mode": "demo"
                })
        else:
            for h in range(count):
                time_str = f"{h:02d}:00"
                gen_mw = self._calculate_solar_mw(float(h))
                points.append({
                    "hour": h,
                    "time_label": time_str,
                    "solar_mw": gen_mw,
                    "potential_surplus_mw": 0.0,
                    "data_mode": "demo"
                })

        return points

    def get_historical_solar(self) -> List[Dict[str, Any]]:
        return self.get_forecast_solar(horizon="day_ahead")

    def get_regional_solar(self) -> List[Dict[str, Any]]:
        # Regional allocation across Delhi's 9 analytical regions
        regions = [
            {"region_id": "south", "region_name": "South Delhi", "solar_mw": 220.0, "capacity_mw": 280.0},
            {"region_id": "north", "region_name": "North Delhi", "solar_mw": 150.0, "capacity_mw": 190.0},
            {"region_id": "west", "region_name": "West Delhi", "solar_mw": 140.0, "capacity_mw": 180.0},
            {"region_id": "south_west", "region_name": "South-West Delhi", "solar_mw": 120.0, "capacity_mw": 150.0},
            {"region_id": "north_west", "region_name": "North-West Delhi", "solar_mw": 110.0, "capacity_mw": 140.0},
            {"region_id": "south_east", "region_name": "South-East Delhi", "solar_mw": 80.0, "capacity_mw": 100.0},
            {"region_id": "central", "region_name": "Central Delhi", "solar_mw": 60.0, "capacity_mw": 80.0},
            {"region_id": "east", "region_name": "East Delhi", "solar_mw": 50.0, "capacity_mw": 60.0},
            {"region_id": "north_east", "region_name": "North-East Delhi", "solar_mw": 40.0, "capacity_mw": 50.0},
        ]
        return regions
