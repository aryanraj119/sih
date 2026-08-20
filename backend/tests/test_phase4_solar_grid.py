"""
URJADRISHTI — Phase 4 Solar, Duck Curve & Grid Intelligence Test Suite
Verifies solar data generation, net load calculations, evening ramp rate engine, grid stress scoring, and API outputs.
"""

import pytest
from backend.forecasting.solar_provider import DemoSolarProvider
from backend.forecasting.duck_curve_engine import DuckCurveEngine
from backend.forecasting.ramp_engine import RampEngine
from backend.forecasting.grid_stress_engine import GridStressEngine
from backend.data.synthetic_delhi_data import SyntheticDelhiDataGenerator

def test_demo_solar_provider():
    """Verify solar provider produces realistic diurnal bell curves (0 at night, peak at midday)."""
    provider = DemoSolarProvider(capacity_mw=1200.0)
    current = provider.get_current_solar()
    assert current["current_solar_mw"] > 0.0

    forecast = provider.get_forecast_solar(horizon="day_ahead")
    assert len(forecast) == 24
    
    # Night solar (02:00) should be 0
    assert forecast[2]["solar_mw"] == 0.0
    # Midday solar (12:00) should peak
    assert forecast[12]["solar_mw"] > 500.0
    print("[PASS] Demo Solar Provider Diurnal Bell Curve Passed!")

def test_duck_curve_net_load_formula():
    """Verify Net Load = Demand - Solar formula holds for all interval points."""
    gen = SyntheticDelhiDataGenerator(seed=42)
    solar_prov = DemoSolarProvider(capacity_mw=1200.0)
    engine = DuckCurveEngine(solar_provider=solar_prov, data_generator=gen)

    duck = engine.calculate_duck_curve(horizon="short_term")
    assert len(duck["points"]) == 24

    for pt in duck["points"]:
        demand = pt["gross_demand_mw"]
        solar = pt["solar_generation_mw"]
        net = pt["net_load_mw"]
        assert net == max(0.0, demand - solar), f"Net load mismatch: {net} != max(0, {demand} - {solar})"
        assert pt["potential_surplus_mw"] == max(0.0, solar - demand)
    print("[PASS] Duck Curve Net Load Formula Passed!")

def test_ramp_rate_calculations():
    """Verify RampEngine calculates upward/downward ramp rates (MW/h and MW/min)."""
    gen = SyntheticDelhiDataGenerator(seed=42)
    solar_prov = DemoSolarProvider(capacity_mw=1200.0)
    duck_eng = DuckCurveEngine(solar_provider=solar_prov, data_generator=gen)

    duck = duck_eng.calculate_duck_curve(horizon="short_term")
    ramps = RampEngine.calculate_ramps(duck["points"])

    assert ramps["maximum_upward_ramp_mw_per_hour"] > 0.0
    assert ramps["maximum_upward_ramp_mw_min"] == round(ramps["maximum_upward_ramp_mw_per_hour"] / 60.0, 1)
    assert ramps["ramp_start"] == "17:30"
    assert ramps["ramp_end"] == "20:30"
    print("[PASS] Ramp Engine Rate Calculations Passed!")

def test_grid_stress_engine_scoring():
    """Verify GridStressEngine score normalization (0-100), levels, and explainable rationale."""
    stress = GridStressEngine.calculate_stress_score(
        forecast_peak_mw=7820.0,
        max_evening_ramp_mw_per_hour=2712.0,
        solar_penetration_pct=14.5,
        forecast_uncertainty_pct=5.2
    )

    assert 0.0 <= stress["grid_stress_score"] <= 100.0
    assert stress["grid_stress_level"] in ["LOW", "MODERATE", "HIGH", "CRITICAL"]
    assert "explanation" in stress and len(stress["explanation"]) > 10
    print("[PASS] Grid Stress Engine Scoring & Explanation Passed!")

if __name__ == "__main__":
    test_demo_solar_provider()
    test_duck_curve_net_load_formula()
    test_ramp_rate_calculations()
    test_grid_stress_engine_scoring()
    print("\nALL PHASE 4 SOLAR & GRID TEST SUITE PASSED SUCCESSFULLY!")
