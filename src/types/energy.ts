export type ForecastHorizon = 'short_term' | 'day_ahead' | 'long_term';

export interface DemandDataPoint {
  time: string;
  actualMW?: number;
  predictedMW: number;
  upperConfidence: number;
  lowerConfidence: number;
  temperature: number;
  humidity: number;
  solarGenerationMW?: number;
  netDemandMW?: number;
}

export interface DiscomData {
  id: string;
  name: string;
  code: 'BRPL' | 'BYPL' | 'TPDDL';
  region: string;
  currentLoadMW: number;
  capacityMW: number;
  peakLoadMW: number;
  solarMW: number;
  evStations: number;
  substations: number;
  healthStatus: 'Optimal' | 'Alert' | 'Congested';
  color: string;
}

export interface DuckCurveDataPoint {
  time: string;
  grossDemandMW: number;
  solarGenMW: number;
  netDemandMW: number;
  rampRateMWMin: number;
}

export interface ScenarioInputs {
  tempAnomaly: number;
  evAdoptionPct: number;
  solarCapacityMW: number;
  gdpGrowthPct: number;
}

export interface ModelTelemetry {
  mae: number;
  mape: number;
  rmse: number;
  lastTrained: string;
  trainingSamples: number;
  featureImportance: { feature: string; importancePct: number }[];
}
