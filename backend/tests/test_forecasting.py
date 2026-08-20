"""
URJADRISHTI — Comprehensive Phase 2 Test Suite
Tests feature engineering, peak detection, ramp rate analysis, net load formulas, uncertainty bands, evaluator metrics, data validation, and forecast API contracts.
"""

from datetime import datetime
from backend.data.synthetic_delhi_data import SyntheticDelhiDataGenerator
from backend.forecasting.openstef_adapter import OpenSTEFAdapter
from backend.forecasting.short_term_engine import ShortTermEngine
from backend.forecasting.day_ahead_engine import DayAheadEngine
from backend.forecasting.long_term_engine import LongTermGrowthEngine
from backend.forecasting.engine import CentralForecastService
from backend.forecasting.feature_engineering import FeatureEngineeringPipeline
from backend.forecasting.peak_detector import PeakDetector
from backend.forecasting.ramp_detector import RampDetector
from backend.forecasting.uncertainty import UncertaintyEstimator
from backend.forecasting.evaluator import ModelEvaluator
from backend.forecasting.data_loader import DataValidator

def test_feature_engineering():
    dt = datetime(2026, 8, 20, 15, 30)
    features = FeatureEngineeringPipeline.extract_time_features(dt)

    assert features["hour"] == 15
    assert features["minute"] == 30
    assert features["day_of_week"] == 3  # Thursday
    assert -1.0 <= features["sin_hour"] <= 1.0
    assert -1.0 <= features["cos_hour"] <= 1.0

    gen = SyntheticDelhiDataGenerator(seed=42)
    raw_data = gen.generate_interval_data("day_ahead")
    enriched = FeatureEngineeringPipeline.compute_lags(raw_data)

    assert len(enriched) == len(raw_data)
    assert "load_lag_1" in enriched[1]
    assert "net_load_mw" in enriched[0]
    print("[PASS] Test Feature Engineering (Cyclical Encoding & Lags) Passed!")

def test_peak_detector():
    gen = SyntheticDelhiDataGenerator(seed=42)
    data = gen.generate_interval_data("day_ahead")

    peak_info = PeakDetector.detect_peak(data)
    assert peak_info["peak_mw"] > 5000
    assert "time_label" in peak_info

    acc = PeakDetector.evaluate_peak_accuracy(7400, 7425, "15:30", "15:30")
    assert acc["peak_error_mw"] == 25.0
    assert acc["peak_error_percent"] < 1.0
    print("[PASS] Test Peak Detector & Accuracy Evaluation Passed!")

def test_ramp_detector():
    gen = SyntheticDelhiDataGenerator(seed=42)
    data = gen.generate_interval_data("short_term")

    ramp_info = RampDetector.detect_ramps(data)
    assert "max_upward_ramp_mw_min" in ramp_info
    assert "max_upward_ramp_mw_hour" in ramp_info
    assert ramp_info["max_upward_ramp_mw_min"] >= 0

    acc = RampDetector.evaluate_ramp_accuracy(180.0, 195.0)
    assert acc["ramp_error_mw_per_hour"] == 15.0
    print("[PASS] Test Ramp Detector & Ramping Accuracy Passed!")

def test_uncertainty_estimator():
    bounds = UncertaintyEstimator.calculate_bounds(6500)
    assert bounds["p10_mw"] < 6500
    assert bounds["p50_mw"] == 6500
    assert bounds["p90_mw"] > 6500

    covered = UncertaintyEstimator.calculate_coverage(6500, 6200, 6800)
    assert covered is True
    print("[PASS] Test Uncertainty Estimator (P10/P50/P90) Passed!")

def test_model_evaluator():
    actuals = [6000.0, 6200.0, 6500.0, 7100.0, 6800.0]
    preds = [6050.0, 6180.0, 6520.0, 7080.0, 6830.0]

    mae = ModelEvaluator.calculate_mae(actuals, preds)
    rmse = ModelEvaluator.calculate_rmse(actuals, preds)
    mape = ModelEvaluator.calculate_mape(actuals, preds)

    assert mae > 0
    assert rmse > 0
    assert mape < 2.0
    print(f"[PASS] Test Model Evaluator (MAE={mae}, RMSE={rmse}, MAPE={mape}%) Passed!")

def test_data_validation():
    gen = SyntheticDelhiDataGenerator(seed=42)
    valid_data = gen.generate_interval_data("day_ahead")
    assert DataValidator.validate_dataset(valid_data) is True

    # Test invalid data detection (negative load)
    invalid_data = [dict(valid_data[0])]
    invalid_data[0]["predicted_mw"] = -500
    assert DataValidator.validate_dataset(invalid_data) is False
    print("[PASS] Test Data Validation (Sanity & Negative Load) Passed!")

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
    print("[PASS] Test Forecast Horizon Routing (15m-6h, 1-7d, 1-5y) Passed!")

if __name__ == "__main__":
    test_feature_engineering()
    test_peak_detector()
    test_ramp_detector()
    test_uncertainty_estimator()
    test_model_evaluator()
    test_data_validation()
    test_forecast_horizon_routing()
    print("\nALL PHASE 2 BACKEND TEST SUITE PASSED SUCCESSFULLY!")
