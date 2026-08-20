# URJADRISHTI (ऊर्जादृष्टि) — AI-Powered Energy Intelligence for Delhi

> **"Predict. Prepare. Power Delhi."**  
> Multi-horizon electricity demand forecasting and spatial power grid intelligence for Delhi's power network.

---

## 🌟 Overview

**URJADRISHTI** is an advanced energy intelligence platform designed to equip grid dispatchers, DISCOM planners (BRPL, BYPL, TPDDL), and power procurement teams with high-precision demand predictions, duck curve ramping insights, and climate stress simulations.

---

## ⚡ Three Forecasting Horizons Architecture

URJADRISHTI abstracts forecasting into three specialized engines:

```
                    URJADRISHTI
                         |
                  Forecast Router
                         |
       ┌─────────────────┼─────────────────┐
       |                 |                 |
       ▼                 ▼                 ▼
 Short-Term         Day-Ahead        Long-Term
 Engine             Engine           Growth Engine
       |                 |                 |
       ▼                 ▼                 ▼
 15m–6h             1–7 days          1–5 years
       |                 |                 |
 Demand/Peak         Demand/Peak      Demand Growth
 Ramp/Net Load       Procurement      By Zone
```

1. **Short-Term Engine (15 Min – 6 Hours)**:
   - **Prediction**: Demand + Peak + Ramp Rate (MW/min).
   - **Purpose**: Real-time operational awareness & rapid ramp management.
2. **Day-Ahead Engine (1 – 7 Days ⭐ PRIMARY HORIZON)**:
   - **Prediction**: Day-ahead demand + peak load curve + P10/P50/P90 confidence bounds.
   - **Purpose**: Power procurement & unit commitment scheduling.
   - **Engine**: Powered by **OpenSTEF** machine learning pipelines (LightGBM/XGBoost).
3. **Long-Term Growth Engine (1 – 5 Years)**:
   - **Prediction**: Zonal demand growth (2026–2030), EV adoption %, rooftop solar penetration.
   - **Purpose**: Sub-station & grid infrastructure planning across Delhi DISCOM zones.
   - **Engine**: Independent macro-spatial growth model.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Recharts, React Router v6.
- **Backend API**: Python FastAPI (`backend/main.py`) exposing REST endpoints for forecasts, grid regions, scenario simulations, and OpenSTEF telemetry.
- **Forecasting Engine**: OpenSTEF (`backend/forecasting/openstef_adapter.py`) + Short-Term & Long-Term Growth Engines.
- **Data System**: Deterministic reproducible synthetic dataset generator (`backend/data/synthetic_delhi_data.py`) under `DEMO_MODE=true`.

---

## 🚀 Quick Start & Development

### 1. Frontend Setup & Run
```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Production Build Verification
npm run build
```

### 2. Backend API Setup & Run
```bash
# Install Python backend dependencies
pip install -r backend/requirements.txt

# Run FastAPI backend server
python -m backend.main
```

### 3. Run Backend Unit Tests
```bash
python -m backend.tests.test_forecasting
```

---

## 🔒 Environment Configuration (`.env.example`)

```env
DEMO_MODE=true
BACKEND_URL=http://localhost:8000
API_VERSION=v1
WEATHER_API_KEY=your_weather_api_key_here
WEATHER_API_URL=https://api.openweathermap.org/data/2.5
LOAD_DATA_URL=https://delhisldc.org/api/load
SOLAR_DATA_URL=https://solargrid.delhi.gov.in/api
DATABASE_URL=sqlite:///./urjadrishti.db
```

---

## 📋 API Endpoints

- `GET /api/health` — System & forecasting service health check
- `GET /api/forecast?horizon=day_ahead` — Multi-horizon demand forecasts (short_term | day_ahead | long_term)
- `GET /api/forecast/peak` — Predicted peak load & time
- `GET /api/regions` — Delhi DISCOM zonal spatial load data (BRPL, BYPL, TPDDL)
- `GET /api/model-performance` — OpenSTEF error metrics (MAE, RMSE, MAPE) & feature importance
- `POST /api/scenario` — Real-time climate stress & demand simulation
