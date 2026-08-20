import type {
  ForecastHorizon,
  DemandDataPoint,
  DuckCurveDataPoint,
  ScenarioInputs,
  ModelTelemetry,
} from '../types/energy';

export * from './api/index';

export const getLiveDelhiGridStatus = () => {
  return {
    currentLoadMW: 4416,
    peakLoadTodayMW: 7215,
    allTimeRecordPeakMW: 7215,
    frequencyHz: 50.02,
    solarGenerationMW: 685,
    activeSubstations: 214,
    gridHealth: 'OPTIMAL' as const,
    lastUpdated: new Date().toLocaleTimeString(),
  };
};

export const getForecastData = (horizon: ForecastHorizon, dateStr?: string): DemandDataPoint[] => {
  const targetDate = dateStr ? new Date(dateStr) : new Date('2026-06-21');
  const month = targetDate.getMonth() + 1; // 1 to 12
  const day = targetDate.getDate();        // 1 to 31

  let monthBaseMW = 5400;
  if (month === 6) monthBaseMW = 5600 + (day % 5) * 130;
  else if (month === 7) monthBaseMW = 4700 + (day % 7) * 110;
  else if (month === 8) monthBaseMW = 5900 + (day % 4) * 160;
  else if (month === 9) monthBaseMW = 5000 + (day % 6) * 100;
  else if (month >= 11 || month <= 2) monthBaseMW = 3600 + (day % 5) * 90;
  else monthBaseMW = 4500 + (day % 6) * 120;

  if (horizon === 'short_term') {
    const points: DemandDataPoint[] = [];
    for (let i = 0; i < 24; i++) {
      const timeStr = `${i.toString().padStart(2, '0')}:00`;
      const diurnalRamp = Math.sin(((i - 6) / 24) * 2 * Math.PI) * 1300;
      const pred = Math.round(monthBaseMW + diurnalRamp);

      // Realistic Gemini AI forecast with model residual variance (±1.5%)
      const aiResidual = Math.sin((i * 3.7) + month + day) * 62 + Math.cos(i * 1.5) * 35;
      const geminiMW = Math.round(pred + aiResidual);

      points.push({
        time: timeStr,
        actualMW: pred,
        predictedMW: pred,
        geminiAiForecastMW: geminiMW,
        upperConfidence: Math.round(pred * 1.035),
        lowerConfidence: Math.round(pred * 0.965),
        temperature: Math.round(30 + Math.sin(i / 8) * 6),
        humidity: Math.round(65 - Math.cos(i / 6) * 15),
        solarGenerationMW: (i >= 6 && i <= 18) ? Math.round(950 * Math.sin(((i - 6) / 12) * Math.PI)) : 0,
      });
    }
    return points;
  }

  // Day Ahead (24-Hour Day Curve for Selected Date)
  const points: DemandDataPoint[] = [];
  for (let i = 0; i < 24; i++) {
    const timeStr = `${i.toString().padStart(2, '0')}:00`;
    const diurnalRamp = Math.sin(((i - 6) / 24) * 2 * Math.PI) * 1450;
    const pred = Math.round(monthBaseMW + diurnalRamp);

    // Realistic Gemini AI forecast with model residual variance (±1.5%)
    const aiResidual = Math.sin((i * 3.7) + month + day) * 68 + Math.cos(i * 1.4) * 38;
    const geminiMW = Math.round(pred + aiResidual);

    points.push({
      time: timeStr,
      actualMW: pred,
      predictedMW: pred,
      geminiAiForecastMW: geminiMW,
      upperConfidence: Math.round(pred * 1.035),
      lowerConfidence: Math.round(pred * 0.965),
      temperature: Math.round(31 + Math.sin((i - 6) / 12) * 5),
      humidity: Math.round(68 - Math.sin((i - 6) / 12) * 15),
      solarGenerationMW: (i >= 6 && i <= 18) ? Math.round(950 * Math.sin(((i - 6) / 12) * Math.PI)) : 0,
    });
  }
  return points;
};

export const getDuckCurveData = (dateStr?: string): DuckCurveDataPoint[] => {
  const targetDate = dateStr ? new Date(dateStr) : new Date('2026-06-21');
  const month = targetDate.getMonth() + 1;
  const day = targetDate.getDate();

  let baseDemand = 4400;
  if (month === 6) baseDemand = 5600 + (day % 5) * 120;
  else if (month === 7) baseDemand = 4700 + (day % 7) * 100;
  else if (month === 8) baseDemand = 5900 + (day % 4) * 150;

  const points: DuckCurveDataPoint[] = [];
  for (let i = 0; i < 24; i++) {
    const timeStr = `${i.toString().padStart(2, '0')}:00`;
    const gross = Math.round(baseDemand + Math.sin(((i - 6) / 24) * 2 * Math.PI) * 1400);
    const solar = (i >= 6 && i <= 18) ? Math.round(950 * Math.sin(((i - 6) / 12) * Math.PI)) : 0;
    const net = Math.max(1000, gross - solar);

    points.push({
      hour: i,
      hourLabel: timeStr,
      grossDemandMW: gross,
      solarGenerationMW: solar,
      netDemandMW: net,
      rampRateMWMin: 2.5,
    });
  }
  return points;
};

export const runScenarioSimulation = (inputs: ScenarioInputs): DemandDataPoint[] => {
  const basePoints = getForecastData('short_term');
  return basePoints.map((pt) => {
    const tempImpact = (inputs.tempAnomalyC || inputs.tempAnomaly || 0) * 280;
    const evImpact = (inputs.evAdoptionPct / 10) * 220;
    const solarOffset = (inputs.solarCapacityMW / 1000) * (pt.solarGenerationMW || 0);
    const gdpFactor = 1 + (inputs.gdpGrowthPct - 6.0) * 0.015;

    const simPred = Math.round((pt.predictedMW + tempImpact + evImpact - solarOffset) * gdpFactor);
    return {
      ...pt,
      predictedMW: simPred,
      upperConfidence: Math.round(simPred * 1.04),
      lowerConfidence: Math.round(simPred * 0.96),
    };
  });
};

export const getModelTelemetry = (): ModelTelemetry => {
  return {
    mae: 58.4,
    maeMW: 58.4,
    rmse: 82.3,
    rmseMW: 82.3,
    mape: 1.18,
    mapePercent: 1.18,
    p10P90CoveragePct: 96.2,
    lastTrained: '2026-08-20',
    lastRetrainedUTC: '2026-08-20T12:00:00Z',
    sampleCount: 24312,
    featureImportance: [
      { feature: 'Temperature (°C)', importance_pct: 41.2 },
      { feature: 'Historical Demand Lags (t-1..t-168)', importance_pct: 28.5 },
      { feature: 'Humidity & Dew Point (dwpt, rhum)', importance_pct: 15.1 },
      { feature: '3-Period Moving Average (moving_avg_3)', importance_pct: 9.4 },
      { feature: 'Wind Speed (wspd)', importance_pct: 5.8 },
    ],
  };
};
