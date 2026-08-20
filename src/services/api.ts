import type {
  ForecastHorizon,
  DemandDataPoint,
  DiscomData,
  DuckCurveDataPoint,
  ScenarioInputs,
  ModelTelemetry,
} from '../types/energy';

export * from './api/index';

// Mock Delhi SLDC Live Grid Status
export const getLiveDelhiGridStatus = () => {
  return {
    currentLoadMW: 6485,
    peakLoadTodayMW: 7820,
    allTimeRecordPeakMW: 8656,
    frequencyHz: 50.02,
    solarGenerationMW: 685,
    activeSubstations: 214,
    gridHealth: 'OPTIMAL' as const,
    lastUpdated: new Date().toLocaleTimeString(),
  };
};

// Generate realistic demand forecasting curves for 3 horizons
export const getForecastData = (horizon: ForecastHorizon): DemandDataPoint[] => {
  if (horizon === 'short_term') {
    // 15-minute resolution for next 6 hours (24 points)
    const points: DemandDataPoint[] = [];
    const baseMW = 6200;
    const now = new Date();
    
    for (let i = 0; i < 24; i++) {
      const stepTime = new Date(now.getTime() + i * 15 * 60 * 1000);
      const timeStr = stepTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const rampFactor = Math.sin((i / 24) * Math.PI) * 850;
      const noise = (Math.random() - 0.5) * 40;
      const pred = Math.round(baseMW + rampFactor + noise);
      const isPast = i < 4;

      points.push({
        time: timeStr,
        actualMW: isPast ? Math.round(pred + (Math.random() - 0.5) * 30) : undefined,
        predictedMW: pred,
        upperConfidence: Math.round(pred * 1.025),
        lowerConfidence: Math.round(pred * 0.975),
        temperature: Math.round(36.5 + Math.sin(i / 10) * 2),
        humidity: Math.round(58 + Math.cos(i / 8) * 5),
        solarGenerationMW: Math.max(0, Math.round(450 * Math.sin((i / 24) * Math.PI - 0.5))),
      });
    }
    return points;
  }

  if (horizon === 'day_ahead') {
    const points: DemandDataPoint[] = [];
    const days = ['Today', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
    const hours = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:00'];
    
    days.forEach((day, dIdx) => {
      hours.forEach((h, hIdx) => {
        const timeLabel = `${day} ${h}`;
        const isPeak = h === '16:00' || h === '20:00';
        const base = 5200 + (hIdx * 350) + (isPeak ? 1200 : 0);
        const temp = 34 + (hIdx % 4) * 2 + (dIdx % 2);
        const pred = Math.round(base + (Math.random() - 0.5) * 100);
        const isPast = dIdx === 0 && hIdx < 3;

        points.push({
          time: timeLabel,
          actualMW: isPast ? Math.round(pred + (Math.random() - 0.5) * 50) : undefined,
          predictedMW: pred,
          upperConfidence: Math.round(pred * 1.035),
          lowerConfidence: Math.round(pred * 0.965),
          temperature: temp,
          humidity: 62 - hIdx * 2,
          solarGenerationMW: h === '12:00' ? 720 : (h === '08:00' || h === '16:00' ? 380 : 0),
        });
      });
    });
    return points;
  }

  const years = ['2026', '2027', '2028', '2029', '2030'];
  const baseGrowth = 8350;
  return years.map((yr, idx) => {
    const growthMW = Math.round(baseGrowth * Math.pow(1.062, idx));
    return {
      time: yr,
      predictedMW: growthMW,
      upperConfidence: Math.round(growthMW * 1.05),
      lowerConfidence: Math.round(growthMW * 0.95),
      temperature: 38 + idx * 0.2,
      humidity: 55,
      solarGenerationMW: Math.round(800 + idx * 350),
    };
  });
};

// DISCOM Zonal Grid Data for Delhi
export const getDiscomData = (): DiscomData[] => {
  return [
    {
      id: 'brpl',
      name: 'BSES Rajdhani Power Ltd',
      shortName: 'BRPL',
      fullName: 'BSES Rajdhani Power Ltd',
      status: 'Normal',
      currentLoadMW: 3240,
      peakMW: 3680,
      capacityMW: 3900,
      gridCapacityMW: 3900,
      solarCapacityMW: 420,
      evChargerCount: 850,
      coverageArea: 'South & West Delhi',
      consumerCount: '2.8 Million',
      substations: [
        { name: 'Okhla 220kV Substation', voltage: '220kV', loadMW: 420, utilisationPct: 84, status: 'Optimal' },
        { name: 'Vasant Kunj 66kV Grid', voltage: '66kV', loadMW: 180, utilisationPct: 90, status: 'Alert' },
        { name: 'Janakpuri 220kV Line', voltage: '220kV', loadMW: 380, utilisationPct: 76, status: 'Optimal' },
      ],
    },
    {
      id: 'bypl',
      name: 'BSES Yamuna Power Ltd',
      shortName: 'BYPL',
      fullName: 'BSES Yamuna Power Ltd',
      status: 'Alert',
      currentLoadMW: 1820,
      peakMW: 2050,
      capacityMW: 2200,
      gridCapacityMW: 2200,
      solarCapacityMW: 180,
      evChargerCount: 410,
      coverageArea: 'Central & East Delhi',
      consumerCount: '1.7 Million',
      substations: [
        { name: 'Laxmi Nagar 220kV Grid', voltage: '220kV', loadMW: 310, utilisationPct: 88, status: 'Alert' },
        { name: 'Chandni Chowk 66kV Line', voltage: '66kV', loadMW: 140, utilisationPct: 82, status: 'Optimal' },
      ],
    },
    {
      id: 'tpddl',
      name: 'Tata Power Delhi Distribution Ltd',
      shortName: 'TPDDL',
      fullName: 'Tata Power Delhi Distribution Ltd',
      status: 'Normal',
      currentLoadMW: 2150,
      peakMW: 2460,
      capacityMW: 2600,
      gridCapacityMW: 2600,
      solarCapacityMW: 310,
      evChargerCount: 620,
      coverageArea: 'North & North-West Delhi',
      consumerCount: '2.0 Million',
      substations: [
        { name: 'Pitampura 220kV Substation', voltage: '220kV', loadMW: 390, utilisationPct: 78, status: 'Optimal' },
        { name: 'Model Town 66kV Grid', voltage: '66kV', loadMW: 190, utilisationPct: 79, status: 'Optimal' },
      ],
    },
  ];
};

// 24-Hour Duck Curve Data
export const getDuckCurveData = (): DuckCurveDataPoint[] => {
  const points: DuckCurveDataPoint[] = [];
  
  for (let hour = 0; hour < 24; hour++) {
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
    
    let gross = 4800;
    if (hour >= 6 && hour <= 10) gross += (hour - 6) * 350;
    else if (hour > 10 && hour <= 16) gross += 1400 + Math.sin((hour - 10) / 6 * Math.PI) * 400;
    else if (hour > 16 && hour <= 22) gross += 1600 - (hour - 16) * 150;
    else gross -= (hour - 22 > 0 ? hour - 22 : hour + 2) * 120;

    let solar = 0;
    if (hour >= 6 && hour <= 18) {
      solar = Math.round(950 * Math.sin(((hour - 6) / 12) * Math.PI));
    }

    const net = Math.max(2500, gross - solar);
    const prevNet = hour > 0 ? points[hour - 1].netDemandMW : net;
    const rampRate = Math.round(((net - prevNet) / 60) * 10) / 10;

    points.push({
      hour,
      hourLabel: timeStr,
      grossDemandMW: Math.round(gross),
      solarGenerationMW: solar,
      solarGeneration: solar,
      netDemandMW: Math.round(net),
      rampRateMWMin: rampRate,
      rampRateMWPerMin: rampRate,
    });
  }
  
  return points;
};

// Real-time AI Scenario Simulator calculation
export const runScenarioSimulation = (inputs: ScenarioInputs): DemandDataPoint[] => {
  const baseline = getForecastData('short_term');
  const tempVar = inputs.tempAnomalyC ?? inputs.tempAnomaly ?? 0;
  
  return baseline.map((pt) => {
    const tempImpact = tempVar * 280;
    const evImpact = (inputs.evAdoptionPct / 10) * 220;
    const solarOffset = (inputs.solarCapacityMW / 1000) * (pt.solarGenerationMW || 0);
    const gdpFactor = 1 + (inputs.gdpGrowthPct - 6) * 0.015;

    const simulatedPred = Math.round((pt.predictedMW + tempImpact + evImpact - solarOffset) * gdpFactor);

    return {
      ...pt,
      predictedMW: simulatedPred,
      upperConfidence: Math.round(simulatedPred * 1.04),
      lowerConfidence: Math.round(simulatedPred * 0.96),
    };
  });
};

// OpenSTEF Telemetry & Model Performance Metrics
export const getModelTelemetry = (): ModelTelemetry => {
  return {
    mae: 84.2,
    maeMW: 84.2,
    mape: 1.38,
    mapePercent: 1.38,
    rmse: 112.5,
    rmseMW: 112.5,
    p10P90CoveragePct: 94.8,
    lastTrained: '2026-08-19 18:00 UTC',
    lastRetrainedUTC: '2026-08-19T18:00:00Z',
    sampleCount: 145200,
    featureImportance: [
      { feature: 'Temperature (°C)', importance_pct: 38.5 },
      { feature: 'Historical Demand (t-1..t-24)', importance_pct: 26.2 },
      { feature: 'Humidity & Dew Point', importance_pct: 14.8 },
      { feature: 'Day of Week / Holiday Flag', importance_pct: 11.5 },
      { feature: 'Solar Radiation (W/m²)', importance_pct: 9.0 },
    ],
  };
};
