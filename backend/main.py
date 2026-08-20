from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import os

from backend.data.synthetic_delhi_data import SyntheticDelhiDataGenerator
from backend.forecasting.openstef_adapter import OpenSTEFAdapter
from backend.forecasting.short_term_engine import ShortTermEngine
from backend.forecasting.day_ahead_engine import DayAheadEngine
from backend.forecasting.long_term_engine import LongTermGrowthEngine
from backend.forecasting.engine import CentralForecastService

app = FastAPI(
    title="URJADRISHTI API",
    description="AI-Powered Energy Intelligence for Delhi powered by OpenSTEF",
    version="0.1.0"
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

# Pydantic Schema for Scenario Simulation API
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
        "version": "0.1.0",
        "data_mode": "demo" if demo_mode else "live",
        "forecasting_service_status": "ready",
        "framework": "OpenSTEF Adapter + Macro Growth Engine",
    }

@app.get("/api/forecast")
def get_forecast(horizon: str = Query("day_ahead", description="Forecasting horizon: short_term | day_ahead | long_term")):
    """
    Returns time-series demand predictions, P10/P50/P90 confidence bands, weather drivers, and solar generation.
    Default horizon is day_ahead (1-7 Days ⭐).
    """
    points = forecast_service.get_forecast(horizon)
    return {
        "horizon": horizon,
        "data_mode": "DEMO_MODE",
        "count": len(points),
        "data": points,
    }

@app.get("/api/forecast/peak")
def get_peak_forecast(horizon: str = Query("day_ahead")):
    """
    Returns predicted peak demand (MW) and peak timestamp for the specified horizon.
    """
    return forecast_service.get_peak_forecast(horizon)

@app.get("/api/regions")
def get_regions():
    """
    Returns spatial Delhi regional DISCOM load metrics (TPDDL, BRPL, BYPL).
    """
    regions = data_generator.generate_regional_data()
    return {
        "data_mode": "DEMO_MODE",
        "total_count": len(regions),
        "regions": regions,
    }

@app.get("/api/model-performance")
def get_model_performance():
    """
    Returns OpenSTEF model telemetry, error metrics (MAE, RMSE, MAPE), and feature importance.
    """
    return forecast_service.get_model_telemetry()

@app.post("/api/scenario")
def simulate_scenario(req: ScenarioRequest):
    """
    Executes real-time demand scenario simulation based on heatwaves, EV adoption, rooftop solar MW, and GDP.
    """
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
