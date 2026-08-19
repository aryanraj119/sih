from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import random

app = FastAPI(
    title="URJADRISHTI API",
    description="AI-Powered Energy Intelligence for Delhi powered by OpenSTEF",
    version="1.0.0"
)

# Enable CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "title": "URJADRISHTI — AI Energy Intelligence for Delhi",
        "tagline": "Predict. Prepare. Power Delhi.",
        "status": "ONLINE",
        "openstef_engine": "ACTIVE"
    }

@app.get("/api/v1/grid/live")
def get_live_grid_status():
    return {
        "currentLoadMW": 6485,
        "peakLoadTodayMW": 7820,
        "allTimeRecordPeakMW": 8656,
        "frequencyHz": 50.02,
        "solarGenerationMW": 685,
        "activeSubstations": 214,
        "gridHealth": "OPTIMAL",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/v1/forecast/{horizon}")
def get_forecast(horizon: str):
    points = []
    base_mw = 6200
    now = datetime.now()

    if horizon == "short_term":
        for i in range(24):
            t = now + timedelta(minutes=i*15)
            pred = int(base_mw + random.randint(-50, 800))
            points.append({
                "time": t.strftime("%H:%M"),
                "predictedMW": pred,
                "upperConfidence": int(pred * 1.025),
                "lowerConfidence": int(pred * 0.975),
                "temperature": 36.5,
                "humidity": 58
            })
    elif horizon == "day_ahead":
        days = ["Today", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"]
        for d in days:
            pred = int(base_mw + random.randint(200, 1500))
            points.append({
                "time": d,
                "predictedMW": pred,
                "upperConfidence": int(pred * 1.035),
                "lowerConfidence": int(pred * 0.965),
                "temperature": 38.0,
                "humidity": 52
            })
    else: # long_term
        years = ["2026", "2027", "2028", "2029", "2030"]
        for idx, yr in enumerate(years):
            pred = int(8350 * ((1.062) ** idx))
            points.append({
                "time": yr,
                "predictedMW": pred,
                "upperConfidence": int(pred * 1.05),
                "lowerConfidence": int(pred * 0.95),
                "temperature": 38.5,
                "humidity": 50
            })

    return {"horizon": horizon, "points": points}
