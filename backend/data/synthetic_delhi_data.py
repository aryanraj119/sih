"""
URJADRISHTI — Deterministic Synthetic Delhi Grid Dataset
Reproducible demo data generator for electricity demand, weather drivers, solar generation, and regional growth.
"""

from datetime import datetime, timedelta
import math

class SyntheticDelhiDataGenerator:
    """
    Generates reproducible synthetic Delhi grid telemetry.
    Uses deterministic mathematical profiles (diurnal sine waves, weather sensitivity, peak shifts)
    so output is identical for identical parameters.
    """

    def __init__(self, seed: int = 42):
        self.seed = seed

    def generate_interval_data(self, horizon: str = "day_ahead", start_time: datetime = None):
        """
        Generates 15-minute / hourly interval data.
        15-min data: 96 intervals / day. 7 days: 672 intervals.
        """
        if start_time is None:
            # Deterministic reference base time: 2026-08-20 00:00
            start_time = datetime(2026, 8, 20, 0, 0, 0)

        intervals = []
        
        if horizon == "short_term":
            # Next 6 hours = 24 intervals (15-min steps)
            count = 24
            step_minutes = 15
        elif horizon == "day_ahead":
            # 7 days = 168 hours (hourly steps for crisp visualization)
            count = 168
            step_minutes = 60
        else:
            count = 24
            step_minutes = 15

        base_mw = 5800

        for i in range(count):
            t = start_time + timedelta(minutes=i * step_minutes)
            hour = t.hour
            hour_float = hour + (t.minute / 60.0)
            day_of_week = t.weekday()
            is_weekend = 1 if day_of_week >= 5 else 0
            month = t.month

            # Temperature profile: afternoon heat peak around 15:00
            temp_c = round(34.0 + 5.5 * math.sin(((hour_float - 9.0) / 12.0) * math.pi), 1)
            humidity_percent = round(65.0 - 15.0 * math.sin(((hour_float - 9.0) / 12.0) * math.pi), 1)
            rainfall_mm = 0.0
            wind_speed_kmh = round(12.0 + 3.0 * math.sin(i / 10.0), 1)

            # Diurnal load curve for Delhi (afternoon AC peak at 15:30 + night AC peak at 22:30)
            afternoon_peak = 1400.0 * math.exp(-((hour_float - 15.5) ** 2) / 12.0)
            night_peak = 1100.0 * math.exp(-((hour_float - 22.5) ** 2) / 8.0)
            temp_sensitivity = (temp_c - 30.0) * 180.0 if temp_c > 30.0 else 0.0
            weekend_reduction = -350.0 if is_weekend else 0.0

            predicted_mw = int(base_mw + afternoon_peak + night_peak + temp_sensitivity + weekend_reduction)
            
            # Solar generation bell curve (peaks at 13:00)
            if 6.0 <= hour_float <= 18.0:
                solar_mw = int(980.0 * math.sin(((hour_float - 6.0) / 12.0) * math.pi))
            else:
                solar_mw = 0

            net_load_mw = max(2500, predicted_mw - solar_mw)

            # Probabilistic Confidence Bands (P10, P50, P90)
            p50 = predicted_mw
            p10 = int(predicted_mw * 0.965)
            p90 = int(predicted_mw * 1.035)
            actual_mw = int(predicted_mw + math.sin(i * 0.7) * 45.0) if i < 12 else None

            intervals.append({
                "timestamp": t.strftime("%Y-%m-%dT%H:%M:%S"),
                "time_label": t.strftime("%a %H:%M") if horizon == "day_ahead" else t.strftime("%H:%M"),
                "actual_mw": actual_mw,
                "predicted_mw": p50,
                "p10_mw": p10,
                "p50_mw": p50,
                "p90_mw": p90,
                "temperature_c": temp_c,
                "humidity_percent": humidity_percent,
                "rainfall_mm": rainfall_mm,
                "wind_speed_kmh": wind_speed_kmh,
                "solar_mw": solar_mw,
                "net_load_mw": net_load_mw,
                "is_weekend": is_weekend,
                "is_holiday": 0,
                "hour": hour,
                "day_of_week": day_of_week,
                "month": month,
            })

        return intervals

    def generate_regional_data(self):
        """
        Generates Delhi analytical region load breakdown.
        """
        regions = [
            {"id": "north", "name": "North Delhi", "discom": "TPDDL", "current_load_mw": 1150, "peak_load_mw": 1320, "capacity_mw": 1500, "solar_mw": 140, "ev_stations": 280, "health_status": "Optimal"},
            {"id": "north_west", "name": "North-West Delhi", "discom": "TPDDL", "current_load_mw": 1000, "peak_load_mw": 1140, "capacity_mw": 1300, "solar_mw": 170, "ev_stations": 340, "health_status": "Optimal"},
            {"id": "north_east", "name": "North-East Delhi", "discom": "BYPL", "current_load_mw": 580, "peak_load_mw": 660, "capacity_mw": 750, "solar_mw": 50, "ev_stations": 110, "health_status": "Alert"},
            {"id": "west", "name": "West Delhi", "discom": "BRPL", "current_load_mw": 1420, "peak_load_mw": 1610, "capacity_mw": 1750, "solar_mw": 180, "ev_stations": 390, "health_status": "Optimal"},
            {"id": "central", "name": "Central Delhi", "discom": "BYPL", "current_load_mw": 640, "peak_load_mw": 730, "capacity_mw": 800, "solar_mw": 60, "ev_stations": 150, "health_status": "Optimal"},
            {"id": "south", "name": "South Delhi", "discom": "BRPL", "current_load_mw": 1820, "peak_load_mw": 2070, "capacity_mw": 2250, "solar_mw": 240, "ev_stations": 460, "health_status": "Optimal"},
            {"id": "south_east", "name": "South-East Delhi", "discom": "BRPL", "current_load_mw": 880, "peak_load_mw": 990, "capacity_mw": 1100, "solar_mw": 110, "ev_stations": 210, "health_status": "Optimal"},
            {"id": "south_west", "name": "South-West Delhi", "discom": "BRPL", "current_load_mw": 1250, "peak_load_mw": 1420, "capacity_mw": 1550, "solar_mw": 190, "ev_stations": 360, "health_status": "Optimal"},
            {"id": "east", "name": "East Delhi", "discom": "BYPL", "current_load_mw": 600, "peak_load_mw": 660, "capacity_mw": 750, "solar_mw": 70, "ev_stations": 150, "health_status": "Alert"},
        ]
        return regions

    def generate_long_term_data(self):
        """
        Generates 1-5 year macro-spatial growth horizon (2026-2030).
        """
        years = [2026, 2027, 2028, 2029, 2030]
        base_peak_mw = 8350
        result = []

        for idx, yr in enumerate(years):
            growth_pct = 6.2
            peak_mw = int(base_peak_mw * math.pow(1 + (growth_pct / 100.0), idx))
            annual_mwh = int(peak_mw * 8760 * 0.52) # 52% capacity factor
            
            result.append({
                "year": yr,
                "annual_peak_mw": peak_mw,
                "annual_demand_mwh": annual_mwh,
                "growth_percent": growth_pct,
                "p10_mw": int(peak_mw * 0.95),
                "p50_mw": peak_mw,
                "p90_mw": int(peak_mw * 1.05),
                "ev_adoption_pct": round(8.0 + idx * 4.5, 1),
                "solar_capacity_mw": 1000 + idx * 350,
            })

        return result
