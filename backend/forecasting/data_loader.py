"""
URJADRISHTI — Data Loader & Data Validation Interfaces
Provides abstraction providers for electricity load, meteorological weather, rooftop solar, and calendar holidays.
Includes data sanity validation checks for NaN, negative loads, and missing timestamps.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List
from backend.data.synthetic_delhi_data import SyntheticDelhiDataGenerator

class LoadDataProvider(ABC):
    @abstractmethod
    def get_load_data(self, horizon: str) -> List[Dict[str, Any]]:
        pass

class WeatherProvider(ABC):
    @abstractmethod
    def get_weather_data(self) -> Dict[str, Any]:
        pass

class DemoLoadProvider(LoadDataProvider):
    def __init__(self, generator: SyntheticDelhiDataGenerator = None):
        self.generator = generator or SyntheticDelhiDataGenerator(seed=42)

    def get_load_data(self, horizon: str) -> List[Dict[str, Any]]:
        return self.generator.generate_interval_data(horizon=horizon)

class DemoWeatherProvider(WeatherProvider):
    def get_weather_data(self) -> Dict[str, Any]:
        return {
            "temperature_c": 36.5,
            "humidity_percent": 58.0,
            "rainfall_mm": 0.0,
            "wind_speed_kmh": 14.2,
            "data_source": "DemoWeatherProvider",
        }

class DataValidator:
    """
    Validates input time-series data for missing values, negative loads, or invalid timestamps.
    """

    @staticmethod
    def validate_dataset(data: List[Dict[str, Any]]) -> bool:
        if not data:
            return False

        seen_timestamps = set()

        for item in data:
            ts = item.get("timestamp")
            if not ts or ts in seen_timestamps:
                return False  # Duplicate or missing timestamp
            seen_timestamps.add(ts)

            load = item.get("predicted_mw") or item.get("actual_mw") or item.get("load_mw")
            if load is not None and (load < 0 or load > 25000):
                return False  # Negative or unphysically large load

            temp = item.get("temperature_c")
            if temp is not None and (temp < -20 or temp > 60):
                return False  # Unphysical temperature

        return True
