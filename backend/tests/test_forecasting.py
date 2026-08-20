"""
URJADRISHTI — Backend Unit & Integration Tests
Verifies forecast horizon routing, OpenSTEF adapter, net load calculation, and demo data reproducibility.
"""

from backend.data.synthetic_delhi_data import SyntheticDelhiDataGenerator
from backend.forecasting.openstef_adapter import OpenSTEFAdapter
from backend.forecasting.short_term_engine import ShortTermEngine
from backend.forecasting.day_ahead_engine import DayAheadEngine
from backend.forecasting.long_term_engine import LongTermGrowthEngine
from backend.forecasting.engine import CentralForecastService

def test_reproducible_synthetic_data():
    gen1 = SyntheticDelhiDataGenerator(seed=42)
    gen2 = SyntheticDelhiDataGenerator(seed=42)

    data1 = gen1.generate_interval_data("day_ahead")
    data2 = gen2.generate_interval_data("day_ahead")

    assert len(data1) == len(data2)
    assert data1[0]["predicted_mw"] == data2[0]["predicted_mw"]
    assert data1[10]["solar_mw"] == data2[10]["solar_mw"]
    print("[PASS] Test Reproducible Synthetic Data Passed!")

def test_net_load_calculation():
    gen = SyntheticDelhiDataGenerator()
    data = gen.generate_interval_data("day_ahead")

    for item in data:
        # Net Load Formula Verification: Net Load = Demand - Solar
        expected_net = max(2500, item["predicted_mw"] - item["solar_mw"])
        assert item["net_load_mw"] == expected_net
    print("[PASS] Test Net Load Formula (Demand - Solar) Passed!")

def test_forecast_horizon_routing():
    data_generator = SyntheticDelhiDataGenerator()
    adapter = OpenSTEFAdapter(data_generator=data_generator)
    service = CentralForecastService(
        short_term_engine=ShortTermEngine(adapter),
        day_ahead_engine=DayAheadEngine(adapter),
        long_term_engine=LongTermGrowthEngine(data_generator),
    )

    short_term = service.get_forecast("short_term")
    day_ahead = service.get_forecast("day_ahead")
    long_term = service.get_forecast("long_term")

    assert len(short_term) == 24
    assert len(day_ahead) == 168
    assert len(long_term) == 5

    peak_day_ahead = service.get_peak_forecast("day_ahead")
    assert "peak_mw" in peak_day_ahead
    print("[PASS] Test Forecast Horizon Routing (15m-6h, 1-7d, 1-5y) Passed!")

if __name__ == "__main__":
    test_reproducible_synthetic_data()
    test_net_load_calculation()
    test_forecast_horizon_routing()
    print("\nALL BACKEND FORECASTING TESTS PASSED SUCCESSFULLY!")
