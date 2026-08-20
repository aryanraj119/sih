export type ForecastHorizon = 'short_term' | 'day_ahead' | 'long_term';

export interface DemandDataPoint {
  time: string;
  timestamp?: string;
  time_label?: string;
  actualMW?: number | null;
  predictedMW: number;
  lowerConfidence: number;
  upperConfidence: number;
  p10MW?: number;
  p50MW?: number;
  p90MW?: number;
  temperature: number;
  humidity?: number;
  solarMW?: number;
  solarGenerationMW?: number;
  netLoadMW?: number;
}

export interface SubstationInfo {
  name: string;
  voltage: string;
  loadMW: number;
  utilisationPct: number;
  status: 'Optimal' | 'Alert' | 'Overload';
}

export interface DiscomData {
  id: string;
  name: string;
  shortName: string;
  fullName: string;
  status: string;
  currentLoadMW: number;
  peakMW: number;
  capacityMW: number;
  gridCapacityMW: number;
  solarCapacityMW: number;
  evChargerCount: number;
  coverageArea: string;
  consumerCount: string;
  substations: SubstationInfo[];
}

export interface DuckCurveDataPoint {
  hour: number;
  hourLabel: string;
  grossDemandMW: number;
  solarGenerationMW: number;
  solarGeneration?: number;
  netDemandMW: number;
  rampRateMWMin: number;
  rampRateMWPerMin?: number;
}

export interface ScenarioInputs {
  tempAnomaly?: number;
  tempAnomalyC?: number;
  evAdoptionPct: number;
  solarCapacityMW: number;
  gdpGrowthPct: number;
}

export interface FeatureImportanceItem {
  feature: string;
  importance_pct: number;
}

export interface ModelTelemetry {
  mae: number;
  maeMW?: number;
  rmse: number;
  rmseMW?: number;
  mape: number;
  mapePercent?: number;
  p10P90CoveragePct?: number;
  lastTrained: string;
  lastRetrainedUTC?: string;
  sampleCount: number;
  featureImportance: FeatureImportanceItem[];
}

export interface DelhiGridStatus {
  currentLoadMW: number;
  peakLoadTodayMW: number;
  frequencyHz: number;
  solarGenerationMW: number;
  gridHealth: string;
  lastUpdated: string;
}
