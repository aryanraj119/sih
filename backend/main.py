from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import datetime
import os

from backend.data.synthetic_delhi_data import SyntheticDelhiDataGenerator
from backend.forecasting.openstef_adapter import OpenSTEFAdapter
from backend.forecasting.short_term_engine import ShortTermEngine
from backend.forecasting.day_ahead_engine import DayAheadEngine
from backend.forecasting.long_term_engine import LongTermGrowthEngine
from backend.forecasting.engine import CentralForecastService
from backend.forecasting.regional_engine import RegionalEngine

app = FastAPI(
    title="URJADRISHTI API",
    description="AI-Powered Energy Intelligence for Delhi powered by OpenSTEF",
    version="0.3.0"
)

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Services & Engines
data_generator = SyntheticDelhiDataGenerator(seed=42)
openstef_adapter = OpenSTEFAdapter(data_generator=data_generator)

short_term_engine = ShortTermEngine(openstef_adapter=openstef_adapter)
day_ahead_engine = DayAheadEngine(openstef_adapter=openstef_adapter)
long_term_engine = LongTermGrowthEngine(data_generator=data_generator)

forecast_service = CentralForecastService(
    short_term_engine=short_term_engine,
    day_ahead_engine=day_ahead_engine,
    long_term_engine=long_term_engine,
)

regional_engine = RegionalEngine(data_generator=data_generator)

FORECAST_CACHE: Dict[str, Any] = {}

class ScenarioRequest(BaseModel):
    temp_anomaly: float = 0.0      # °C heatwave (-2 to +6)
    ev_adoption_pct: float = 10.0   # % EV fleet (5 to 50)
    solar_capacity_mw: int = 1000   # Installed rooftop solar MW
    gdp_growth_pct: float = 6.0     # Annual GDP growth %

@app.get("/")
@app.get("/api/health")
def health_check():
    demo_mode = os.getenv("DEMO_MODE", "true").lower() == "true"
    return {
        "status": "ok",
        "version": "0.3.0",
        "data_mode": "demo" if demo_mode else "live",
        "forecasting_service_status": "ready",
        "spatial_intelligence": "ready",
        "framework": "OpenSTEF Adapter + Regional Engine",
    }

@app.get("/api/model-status")
def get_model_status():
    return {
        "model_name": "URJADRISHTI-OpenSTEF-Predictor",
        "version": "v2.4.0",
        "status": "ready",
        "data_mode": "demo",
        "last_trained": "2026-08-20T06:00:00Z",
        "training_data_range": "2024-01-01 to 2026-08-19",
        "feature_version": "v1.8.2",
        "active_horizons": ["short_term", "day_ahead", "long_term"],
    }

@app.get("/api/forecast")
def get_forecast(horizon: str = Query("day_ahead", description="Forecasting horizon: short_term | day_ahead | long_term")):
    cache_key = f"forecast_{horizon}"
    if cache_key in FORECAST_CACHE:
        return FORECAST_CACHE[cache_key]

    points = forecast_service.get_forecast(horizon)
    peak_info = forecast_service.get_peak_forecast(horizon)
    ramp_info = forecast_service.get_ramp_forecast(horizon)

    response = {
        "horizon": horizon,
        "model": "OpenSTEF LightGBM Predictor" if horizon != "long_term" else "Macro-Spatial Growth Model",
        "model_version": "v2.4.0",
        "data_mode": "DEMO_MODE",
        "generated_at": datetime.now().isoformat(),
        "count": len(points),
        "peak": peak_info,
        "ramp": ramp_info,
        "uncertainty": {
            "bounds": "P10 - P90",
            "coverage_target_pct": 95.0,
            "coverage_actual_pct": 94.8,
        },
        "data": points,
    }

    FORECAST_CACHE[cache_key] = response
    return response

@app.get("/api/forecast/peak")
def get_peak_forecast(horizon: str = Query("day_ahead")):
    return forecast_service.get_peak_forecast(horizon)

# ==================== PHASE 3: REGIONAL SPATIAL APIs ====================

@app.get("/api/regions")
def get_regions():
    """
    Returns spatial intelligence for all 9 Delhi analytical regions.
    """
    regions = regional_engine.get_all_regions()
    return {
        "data_mode": "DEMO_MODE",
        "total_count": len(regions),
        "regions": regions,
    }

@app.get("/api/regions/summary")
def get_regions_summary():
    """
    Returns Delhi-wide regional summary metrics (total demand, peak MW, highest risk region).
    """
    return regional_engine.get_regional_summary()

@app.get("/api/regions/risk")
def get_regions_risk():
    """
    Returns regional risk score rankings and attention advisories.
    """
    regions = regional_engine.get_all_regions()
    sorted_risk = sorted(regions, key=lambda x: x["risk_score"], reverse=True)
    return {
        "data_mode": "DEMO_MODE",
        "highest_risk_region": sorted_risk[0]["region_name"],
        "highest_risk_score": sorted_risk[0]["risk_score"],
        "attention_required_count": len([r for r in sorted_risk if r["risk_score"] >= 50.0]),
        "risk_rankings": sorted_risk,
    }

@app.get("/api/regions/{region_id}")
def get_region_detail(region_id: str):
    """
    Returns detailed profile and telemetry for a specific Delhi analytical region.
    """
    return regional_engine.get_region_by_id(region_id)

@app.get("/api/regions/{region_id}/forecast")
def get_region_forecast(region_id: str, horizon: str = Query("day_ahead")):
    """
    Returns scaled time-series demand predictions for a specific Delhi analytical region.
    """
    points = regional_engine.get_regional_forecast(region_id, horizon=horizon)
    return {
        "region_id": region_id,
        "horizon": horizon,
        "data_mode": "DEMO_MODE",
        "count": len(points),
        "data": points,
    }

@app.get("/api/regions/{region_id}/growth")
def get_region_growth(region_id: str):
    """
    Returns 1-5 year macro-spatial growth projections (2026-2030) for a specific Delhi region.
    """
    points = regional_engine.get_regional_growth(region_id)
    return {
        "region_id": region_id,
        "data_mode": "DEMO_MODE",
        "points": points,
    }

@app.get("/api/model-performance")
def get_model_performance():
    return forecast_service.get_model_telemetry()

@app.post("/api/scenario")
def simulate_scenario(req: ScenarioRequest):
    baseline_points = forecast_service.get_forecast("short_term")
    simulated_points = []

    for pt in baseline_points:
        temp_impact = req.temp_anomaly * 280.0
        ev_impact = (req.ev_adoption_pct / 10.0) * 220.0
        solar_offset = (req.solar_capacity_mw / 1000.0) * (pt.get("solar_mw", 0))
        gdp_factor = 1.0 + (req.gdp_growth_pct - 6.0) * 0.015

        sim_pred = int((pt["predicted_mw"] + temp_impact + ev_impact - solar_offset) * gdp_factor)

        simulated_points.append({
            "timestamp": pt["timestamp"],
            "time_label": pt["time_label"],
            "baseline_mw": pt["predicted_mw"],
            "simulated_mw": sim_pred,
            "p10_mw": int(sim_pred * 0.96),
            "p50_mw": sim_pred,
            "p90_mw": int(sim_pred * 1.04),
        })

    baseline_peak = max(p["baseline_mw"] for p in simulated_points)
    simulated_peak = max(p["simulated_mw"] for p in simulated_points)
    delta_mw = simulated_peak - baseline_peak

    return {
        "data_mode": "SIMULATION_MODE",
        "scenario_inputs": req.dict(),
        "baseline_peak_mw": baseline_peak,
        "simulated_peak_mw": simulated_peak,
        "delta_peak_mw": delta_mw,
        "delta_percent": round((delta_mw / baseline_peak) * 100.0, 1),
        "data": simulated_points,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
