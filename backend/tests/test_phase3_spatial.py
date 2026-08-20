"""
URJADRISHTI — Phase 3 Spatial Power Intelligence Test Suite
Verifies region ID consistency, risk engine scoring, regional data aggregations, and API contracts.
"""

import pytest
from backend.forecasting.risk_engine import RegionalRiskEngine
from backend.forecasting.regional_engine import RegionalEngine
from backend.data.synthetic_delhi_data import SyntheticDelhiDataGenerator

def test_region_id_consistency():
    """Verify all 9 Delhi analytical regions have stable IDs and names."""
    gen = SyntheticDelhiDataGenerator(seed=42)
    engine = RegionalEngine(data_generator=gen)
    regions = engine.get_all_regions()

    assert len(regions) == 9
    expected_ids = {"north", "north_west", "north_east", "west", "central", "south", "south_east", "south_west", "east"}
    actual_ids = {r["region_id"] for r in regions}
    assert actual_ids == expected_ids, f"Region IDs mismatch! Expected {expected_ids}, got {actual_ids}"
    print("[PASS] Region ID Consistency Passed!")

def test_risk_engine_scoring():
    """Verify URJADRISHTI Risk Score calculation and classification levels."""
    # Low Risk Case
    low_res = RegionalRiskEngine.calculate_risk_score(
        current_demand_mw=400, capacity_mw=1000, growth_percent=3.0, ramp_rate_mw_min=5.0, solar_penetration_mw=50
    )
    assert low_res["risk_level"] in ["LOW", "MODERATE"]

    # High / Critical Risk Case
    high_res = RegionalRiskEngine.calculate_risk_score(
        current_demand_mw=1900, capacity_mw=2000, growth_percent=9.0, ramp_rate_mw_min=45.0, solar_penetration_mw=300
    )
    assert high_res["risk_level"] in ["HIGH", "CRITICAL"]
    assert "explanation" in high_res and len(high_res["explanation"]) > 10
    print("[PASS] Risk Engine Scoring & Explanation Passed!")

def test_regional_summary_aggregation():
    """Verify Delhi-wide regional summary calculations (demand, peak, solar, net load)."""
    gen = SyntheticDelhiDataGenerator(seed=42)
    engine = RegionalEngine(data_generator=gen)
    summary = engine.get_regional_summary()

    assert summary["total_regions"] == 9
    assert summary["total_current_demand_mw"] > 0
    assert summary["total_peak_mw"] >= summary["total_current_demand_mw"]
    assert summary["total_solar_mw"] > 0
    assert summary["total_net_load_mw"] == (summary["total_current_demand_mw"] - summary["total_solar_mw"])
    assert summary["highest_demand_region"] in ["South Delhi", "West Delhi", "South-West Delhi"]
    print("[PASS] Regional Summary Aggregation Passed!")

def test_regional_forecast_scaling():
    """Verify regional short-term and day-ahead forecast points scale accurately."""
    gen = SyntheticDelhiDataGenerator(seed=42)
    engine = RegionalEngine(data_generator=gen)
    points = engine.get_regional_forecast("south", horizon="day_ahead")

    assert len(points) > 0
    for pt in points:
        assert pt["predicted_mw"] > 0
        assert pt["p10_mw"] <= pt["p50_mw"] <= pt["p90_mw"]
        assert pt["net_load_mw"] == max(100, pt["predicted_mw"] - pt["solar_mw"])
    print("[PASS] Regional Forecast Scaling & Net Load Passed!")

def test_regional_growth_projection():
    """Verify 1-5 year macro-spatial growth projections (2026-2030)."""
    gen = SyntheticDelhiDataGenerator(seed=42)
    engine = RegionalEngine(data_generator=gen)
    growth_pts = engine.get_regional_growth("south")

    assert len(growth_pts) == 5
    years = [p["year"] for p in growth_pts]
    assert years == [2026, 2027, 2028, 2029, 2030]
    # Check monotonically increasing peaks
    peaks = [p["annual_peak_mw"] for p in growth_pts]
    assert peaks == sorted(peaks)
    print("[PASS] Regional Growth Projection Passed!")

if __name__ == "__main__":
    test_region_id_consistency()
    test_risk_engine_scoring()
    test_regional_summary_aggregation()
    test_regional_forecast_scaling()
    test_regional_growth_projection()
    print("\nALL PHASE 3 SPATIAL TEST SUITE PASSED SUCCESSFULLY!")
