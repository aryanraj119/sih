"""
URJADRISHTI — Central Forecasting Abstraction & Engine Interfaces
Provides a clean separation between the frontend API layer and underlying model implementations.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List

class ForecastEngine(ABC):
    """
    Abstract base class for all URJADRISHTI forecasting engines.
    """

    @abstractmethod
    def forecast(self, params: Dict[str, Any]) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def forecast_peak(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        pass

    @abstractmethod
    def forecast_ramp(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        pass

    @abstractmethod
    def evaluate_model(self) -> Dict[str, Any]:
        pass


class CentralForecastService:
    """
    Orchestrates request routing to the appropriate forecasting engine:
    - Short-Term (15m–6h) -> ShortTermEngine
    - Day-Ahead (1–7d) -> DayAheadOpenSTEFAdapter
    - Long-Term (1–5y) -> LongTermGrowthEngine
    """

    def __init__(self, short_term_engine, day_ahead_engine, long_term_engine):
        self.short_term_engine = short_term_engine
        self.day_ahead_engine = day_ahead_engine
        self.long_term_engine = long_term_engine

    def get_forecast(self, horizon: str, params: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        if params is None:
            params = {}

        if horizon == "short_term":
            return self.short_term_engine.forecast(params)
        elif horizon == "day_ahead":
            return self.day_ahead_engine.forecast(params)
        elif horizon == "long_term":
            return self.long_term_engine.forecast(params)
        else:
            # Default to primary horizon: day_ahead ⭐
            return self.day_ahead_engine.forecast(params)

    def get_peak_forecast(self, horizon: str) -> Dict[str, Any]:
        data = self.get_forecast(horizon)
        if horizon == "short_term":
            return self.short_term_engine.forecast_peak(data)
        elif horizon == "long_term":
            return self.long_term_engine.forecast_peak(data)
        else:
            return self.day_ahead_engine.forecast_peak(data)

    def get_ramp_forecast(self, horizon: str) -> Dict[str, Any]:
        data = self.get_forecast(horizon)
        if horizon == "short_term":
            return self.short_term_engine.forecast_ramp(data)
        else:
            return self.day_ahead_engine.forecast_ramp(data)

    def get_model_telemetry(self) -> Dict[str, Any]:
        return self.day_ahead_engine.evaluate_model()
