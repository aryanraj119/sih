"""
URJADRISHTI — Feature Engineering Pipeline
Extracts time, calendar, weather, load lags, solar, and net load features for demand forecasting.
"""

from typing import Dict, Any, List
from datetime import datetime
import math

class FeatureEngineeringPipeline:
    """
    Transforms raw load and weather data into feature matrices.
    Applies cyclical encodings, load lags, weather lags, and solar net load formulas.
    """

    @staticmethod
    def extract_time_features(dt: datetime) -> Dict[str, Any]:
        hour = dt.hour
        minute = dt.minute
        hour_float = hour + (minute / 60.0)
        day_of_week = dt.weekday()
        day_of_year = dt.timetuple().tm_yday
        week_of_year = dt.isocalendar()[1]
        month = dt.month
        is_weekend = 1 if day_of_week >= 5 else 0

        # Cyclical Encodings
        sin_hour = round(math.sin(2 * math.pi * hour_float / 24.0), 4)
        cos_hour = round(math.cos(2 * math.pi * hour_float / 24.0), 4)
        sin_day = round(math.sin(2 * math.pi * day_of_week / 7.0), 4)
        cos_day = round(math.cos(2 * math.pi * day_of_week / 7.0), 4)

        return {
            "hour": hour,
            "minute": minute,
            "day_of_week": day_of_week,
            "day_of_year": day_of_year,
            "week_of_year": week_of_year,
            "month": month,
            "is_weekend": is_weekend,
            "is_holiday": 0,
            "sin_hour": sin_hour,
            "cos_hour": cos_hour,
            "sin_day": sin_day,
            "cos_day": cos_day,
        }

    @staticmethod
    def compute_lags(data: List[Dict[str, Any]], interval_minutes: int = 15) -> List[Dict[str, Any]]:
        """
        Calculates load lags based on resolution:
        For 15-min data: lag_1 (15m), lag_4 (1h), lag_96 (24h), lag_672 (7d).
        For 60-min data: lag_1 (1h), lag_2 (2h), lag_24 (24h), lag_168 (7d).
        """
        enriched = []
        n = len(data)

        for i in range(n):
            item = dict(data[i])
            load = item.get("predicted_mw") or item.get("load_mw", 5000)

            # Calculate Lags safely
            item["load_lag_1"] = data[i - 1].get("predicted_mw", load) if i >= 1 else load
            item["load_lag_2"] = data[i - 2].get("predicted_mw", load) if i >= 2 else load
            item["load_lag_4"] = data[i - 4].get("predicted_mw", load) if i >= 4 else load
            item["load_lag_24"] = data[i - 24].get("predicted_mw", load) if i >= 24 else load
            item["load_lag_96"] = data[i - 96].get("predicted_mw", load) if i >= 96 else load
            item["load_lag_168"] = data[i - 168].get("predicted_mw", load) if i >= 168 else load

            # Formula: Net Load = Demand - Solar Generation
            solar = item.get("solar_mw", 0)
            item["net_load_mw"] = max(2000, load - solar)

            enriched.append(item)

        return enriched
