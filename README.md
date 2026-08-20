# URJADRISHTI (ऊर्जादृष्टि)
## AI-Powered Energy Intelligence Platform for Delhi
*"Predict. Prepare. Power Delhi."*

URJADRISHTI is an enterprise-grade AI energy intelligence platform designed for the National Capital Territory (NCT) of Delhi. It delivers operational machine learning forecasting across 3 time horizons, spatial grid risk intelligence across 9 analytical regions, interactive scenario stress testing, 24-hour Duck Curve net load analysis, and OpenSTEF model telemetry.

---

## 🏛️ Project Architecture

```
                                  URJADRISHTI
                                       │
      ┌────────────────────────────────┼────────────────────────────────┐
      │                                │                                │
      ▼                                ▼                                ▼
AI Forecasting Layer           Spatial Intelligence            Solar & Grid Intelligence
 (OpenSTEF ML Engine)         (9 Analytical Regions)            (24-Hour Duck Curve Net Load)
      │                                │                                │
      ├─ Short-Term (15m–6h)           ├─ Risk Engine (0-100)          ├─ Net Load = Demand - Solar
      ├─ Day-Ahead (1–7d ⭐)           ├─ Metric Map Modes             ├─ Evening Ramp (+2,712 MW/h)
      └─ Long-Term (1–5y)              └─ Grid Attention System        └─ Grid Stress Score (0-100)
```

---

## ☀️ Phase 4: Solar & Grid Intelligence Architecture

The `/solar-grid` dashboard models the interaction between rooftop solar adoption and Delhi grid load:

$$\text{Net Load} = \text{Gross Electricity Demand} - \text{Solar Generation}$$

### Key Components:
1. **Diurnal Solar Generation Model**: Diurnal bell curve peaking at ~950 MW between 12:00 and 14:00, declining rapidly to 0 MW at night (19:00 - 05:00).
2. **24-Hour Duck Curve & Net Load Trough**: Midday minimum net load ("Duck Belly") dropping to 4,820 MW at 13:00.
3. **Evening Ramp Engine**: Tracks steep upward net-load ramping (**+2,712 MW/h** / **+45.2 MW/min**) between 17:30 and 20:30 as solar output collapses while evening residential AC load surges.
4. **Indicative Solar Surplus / Curtailment**: Calculates `potential_surplus = max(0, solar - demand)` indicative pressure.
5. **URJADRISHTI Grid Stress Score (0–100)**: Combines peak load pressure, evening ramp rates, solar penetration volatility, and forecast uncertainty.

---

## 🗺️ Phase 3: Spatial Power Intelligence Architecture

The `/power-intelligence` dashboard provides geographic energy awareness across **9 stable analytical regions** in Delhi:

| Region ID | Analytical Region | Primary DISCOM | Current Load (MW) | 5-Yr Growth % | URJADRISHTI Risk Score |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `south` | **South Delhi** | BRPL | 1,820 MW | +7.5% | **68.4 (HIGH)** |
| `west` | **West Delhi** | BRPL | 1,420 MW | +7.5% | **54.2 (HIGH)** |
| `south_west` | **South-West Delhi** | BRPL | 1,250 MW | +7.5% | **48.6 (MODERATE)** |
| `north` | **North Delhi** | TPDDL | 1,150 MW | +6.2% | **42.1 (MODERATE)** |
| `north_west` | **North-West Delhi** | TPDDL | 1,000 MW | +6.2% | **38.5 (MODERATE)** |
| `south_east` | **South-East Delhi** | BRPL | 880 MW | +7.5% | **62.0 (HIGH)** |
| `central` | **Central Delhi** | BYPL | 640 MW | +5.1% | **28.4 (MODERATE)** |
| `east` | **East Delhi** | BYPL | 600 MW | +5.1% | **24.1 (LOW)** |
| `north_east` | **North-East Delhi** | BYPL | 580 MW | +5.1% | **22.8 (LOW)** |

---

## 📡 REST API Endpoints

### 🔮 Forecasting APIs
- `GET /api/health` — System status, data mode, framework telemetry
- `GET /api/model-status` — OpenSTEF ML model version & last retrained timestamp
- `GET /api/forecast?horizon={short_term|day_ahead|long_term}` — Forecast demand curve & P10/P50/P90 confidence bounds
- `GET /api/forecast/peak?horizon={short_term|day_ahead|long_term}` — Peak demand predictions & time
- `GET /api/model-performance` — MAE, MAPE, RMSE, feature importance weights

### ☀️ Solar & Duck Curve APIs (Phase 4)
- `GET /api/solar/current` — Current rooftop solar generation MW & capacity factor %
- `GET /api/solar/forecast` — Solar generation curve across horizons
- `GET /api/solar/regional` — Solar capacity & generation breakdown across 9 Delhi regions
- `GET /api/duck-curve` — 24-Hour Duck Curve net load points, solar peak, trough minimum, ramp window
- `GET /api/ramp` — Upward/downward ramp rates in MW/h and MW/min
- `GET /api/grid-stress` — URJADRISHTI Grid Stress Score (0–100), level, and explainable rationale
- `GET /api/solar-grid/summary` — Solar & Grid KPI aggregate summary metrics

### 🗺️ Spatial & Regional APIs (Phase 3)
- `GET /api/regions` — All 9 analytical regions with load, peak, growth %, risk score & rationale
- `GET /api/regions/summary` — Delhi-wide aggregate summary metrics
- `GET /api/regions/risk` — Regional risk score ranking & grid attention advisories
- `GET /api/regions/{region_id}` — Detailed profile for a specific region
- `GET /api/regions/{region_id}/forecast?horizon={day_ahead}` — Scaled regional prediction points
- `GET /api/regions/{region_id}/growth` — 1–5 year long-term regional growth projections (2026–2030)

### 🎛️ Scenario Simulation API
- `POST /api/scenario` — Real-time climate stress simulation (Heatwave °C, EV Adoption %, Rooftop Solar MW, GDP %)

---

## 🛡️ Data Integrity & Limitations

> [!IMPORTANT]
> **Data Integrity Notice**: Regional visualizations currently use **analytical / demo geographies** (`ANALYTICAL REGIONAL VIEW`) where verified electrical network GIS data is not available. The platform explicitly labels all synthetic telemetry as **`DEMO MODE (SYNTHETIC DATA)`**. Verified live SLDC and DISCOM GIS feeds can be connected seamlessly through the modular `LoadDataProvider`, `SolarDataProvider`, and `RegionalGeoProvider` interface layer.

---

## 🛠️ Development & Testing

### 1. Backend REST Server
```bash
# Start FastAPI backend server on http://127.0.0.1:8000
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Backend Unit Test Suite
```bash
# Run Phase 2 forecasting engine tests
python -m backend.tests.test_forecasting

# Run Phase 3 spatial grid intelligence tests
python -m backend.tests.test_phase3_spatial

# Run Phase 4 solar & Duck Curve net load tests
python -m backend.tests.test_phase4_solar_grid
```

### 3. Frontend Web Client
```bash
# Install Node dependencies
npm install

# Start Vite local development server on http://127.0.0.1:5173
npm run dev

# Execute Vite production bundle compilation
npm run build
```

---

## 📄 License & Repository
- **GitHub Repository**: [https://github.com/aryanraj119/sih](https://github.com/aryanraj119/sih)
- **Built for**: Smart India Hackathon (SIH) — AI Energy Intelligence for Delhi
