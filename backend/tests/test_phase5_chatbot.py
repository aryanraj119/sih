"""
URJADRISHTI — Phase 5 AI Chatbot Engine Unit Test Suite
Validates Gemini AI Chatbot multi-horizon query routing, ground-truth context parameters, and OpenSTEF telemetry integration.
"""

from backend.forecasting.chatbot_engine import URJADRISHTIChatbotEngine

def test_chatbot_context_parameters():
    engine = URJADRISHTIChatbotEngine()
    ctx = engine.build_system_context()

    assert ctx["platform_name"] == "URJADRISHTI (ऊर्जादृष्टि)"
    assert ctx["operational_telemetry"]["current_electricity_demand_mw"] > 1000.0
    assert ctx["openstef_model_telemetry"]["model_name"] == "URJADRISHTI OpenSTEF LightGBM Predictor"
    assert ctx["openstef_model_telemetry"]["mape_percent"] == 1.18
    assert len(ctx["spatial_intelligence_9_regions"]) == 9
    print("[PASS] Chatbot System Context Parameters Passed!")

def test_multi_horizon_classification():
    engine = URJADRISHTIChatbotEngine()

    # Horizon 1 Query Test
    res1 = engine.generate_response("What is the current 15 min electricity demand ramp in South Delhi?")
    assert "Horizon 1" in res1["classified_horizon"]

    # Horizon 2 Query Test
    res2 = engine.generate_response("What is tomorrow forecast peak MW and solar generation curve?")
    assert "Horizon 2" in res2["classified_horizon"]

    # Horizon 3 Query Test
    res3 = engine.generate_response("How will EV adoption and population growth impact Delhi demand in 2030?")
    assert "Horizon 3" in res3["classified_horizon"]

    print("[PASS] Multi-Horizon Classification & Response Generation Passed!")

if __name__ == "__main__":
    test_chatbot_context_parameters()
    test_multi_horizon_classification()
    print("\nALL GEMINI AI CHATBOT TEST SUITE PASSED SUCCESSFULLY!\n")
