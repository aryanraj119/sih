"""
URJADRISHTI — Gemini AI Chatbot Engine Test Suite
Verifies parameter context building, multi-horizon query routing, and chatbot engine response contracts.
"""

import pytest
from backend.forecasting.chatbot_engine import URJADRISHTIChatbotEngine

def test_chatbot_context_parameters():
    """Verify system context gathers complete real-time, weather, OpenSTEF, spatial, and development parameters."""
    engine = URJADRISHTIChatbotEngine()
    ctx = engine.build_system_context()

    assert ctx["platform_name"] == "URJADRISHTI (ऊर्जादृष्टि)"
    assert ctx["operational_telemetry"]["current_electricity_demand_mw"] == 6485.0
    assert ctx["operational_telemetry"]["daily_peak_demand_mw"] == 7820.0
    assert ctx["meteorological_drivers"]["temperature_c"] == 36.5
    assert ctx["renewable_and_net_load"]["solar_generation_mw"] == 685.0
    assert ctx["renewable_and_net_load"]["duck_curve_trough_mw"] == 4820.0
    assert ctx["openstef_model_telemetry"]["mape_percent"] == 1.38
    assert ctx["openstef_model_telemetry"]["mae_mw"] == 84.2
    assert len(ctx["spatial_intelligence_9_regions"]) == 9
    assert ctx["long_term_development_drivers"]["ev_adoption_pct"] == 15.0
    print("[PASS] Chatbot System Context Parameters Passed!")

def test_multi_horizon_classification_and_response():
    """Verify chatbot classifies query horizons (Horizon 1: 15m-6h, Horizon 2: 1-7d, Horizon 3: 1-5y)."""
    engine = URJADRISHTIChatbotEngine()

    # Test Horizon 1 Query
    h1_res = engine.generate_response("What is the current load 15 min ago?")
    assert "Horizon 1" in h1_res["classified_horizon"]
    assert "response" in h1_res and len(h1_res["response"]) > 20

    # Test Horizon 3 Query
    h3_res = engine.generate_response("What is the projected 5-year growth in 2030?")
    assert "Horizon 3" in h3_res["classified_horizon"]

    # Test Horizon 2 Query (Default)
    h2_res = engine.generate_response("What is tomorrow's forecast peak MW?")
    assert "Horizon 2" in h2_res["classified_horizon"]
    print("[PASS] Multi-Horizon Classification & Response Generation Passed!")

if __name__ == "__main__":
    test_chatbot_context_parameters()
    test_multi_horizon_classification_and_response()
    print("\nALL GEMINI AI CHATBOT TEST SUITE PASSED SUCCESSFULLY!")
