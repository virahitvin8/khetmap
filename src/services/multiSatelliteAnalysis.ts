/**
 * Multi-Satellite Analysis Engine
 *
 * Combines data from ALL free satellite/weather sources into a unified
 * field health analysis with per-source breakdowns and smart irrigation advice.
 *
 * Source        | Key Data                          | Resolution
 * Sentinel-2    | NDVI, EVI, NDWI, REIP, SAVI       | 10m
 * Sentinel-1 SAR| Soil moisture, flood detection     | 10m
 * Landsat 8/9   | NDVI, CWSI, thermal, ET           | 30m + 100m thermal
 * MODIS         | NDVI, NDWI, LST (daily)           | 250-500m
 * VIIRS         | NDVI (daily), thermal              | 375-500m
 * Open-Meteo    | Rain, ET, temp, soil moisture     | ~11km (hourly)
 * NASA POWER    | Solar rad, dew point, wind         | ~50km (daily)
 */

import { OpenMeteoData, fetchOpenMeteo, fetchNASAPOWER, PowerData, calculateCWSI, generateIrrigationAdvice, IrrigationAdvice, calculateBenchmark, RegionalBenchmark } from './satelliteSources';
import { isSentinelAvailable } from './fieldAnalysis';

// ===== TYPE DEFINITIONS =====

export interface SatelliteResult {
  sourceId: string;
  sourceName: string;
  icon: string;
  resolution: string;
  revisitDays: string;
  dataAvailable: boolean;
  values: Record<string, number | null>;
  healthScore: number | null;    // 0-100
  status: 'excellent' | 'good' | 'moderate' | 'poor' | 'critical' | 'no_data';
}

export interface MultiSatelliteAnalysis {
  fieldName: string;
  areaHa: number;
  timestamp: string;
  satellites: SatelliteResult[];
  overallHealthScore: number;
  overallStatus: string;
  recommendations: string[];
  irrigationAdvice: IrrigationAdvice | null;
  regionalBenchmark: RegionalBenchmark | null;
  weatherSummary: string | null;
  bestSource: string;
  perSourceRecommendations: Record<string, string[]>;
}

// ===== DEFAULT VALUES =====

const SATELLITE_META: Record<string, { name: string; icon: string; resolution: string; revisit: string }> = {
  sentinel2:     { name: 'Sentinel-2 (ESA)',     icon: '🛰️', resolution: '10m',          revisit: '~5 days' },
  sentinel1_sar: { name: 'Sentinel-1 SAR (ESA)',  icon: '📡', resolution: '10m',          revisit: '6-12 days' },
  landsat:       { name: 'Landsat 8/9 (NASA)',    icon: '🌍', resolution: '30m+thermal', revisit: '16 days' },
  modis:         { name: 'MODIS (NASA)',           icon: '🛸', resolution: '250-500m',    revisit: 'Daily' },
  viirs:         { name: 'VIIRS (NASA/NOAA)',      icon: '🌙', resolution: '375-500m',    revisit: 'Daily' },
  openmeteo:     { name: 'Open-Meteo',             icon: '🌤️', resolution: '~11km',       revisit: 'Hourly' },
  nasa_power:    { name: 'NASA POWER',             icon: '☀️', resolution: '~50km',        revisit: 'Daily' },
};

// ===== CORE ANALYSIS FUNCTIONS =====

/**
 * Generate simulated satellite data for analysis.
 * In production, this would query WMS/WMTS APIs for each source.
 * For demo, we generate realistic values based on field geometry and area.
 */
function generateSimulatedResults(
  fieldName: string,
  vertices: Array<{ lat: number; lng: number }>,
  areaHa: number
): SatelliteResult[] {
  const lat = vertices.reduce((s, v) => s + v.lat, 0) / vertices.length;
  const lng = vertices.reduce((s, v) => s + v.lng, 0) / vertices.length;

  // Use lat/lng to create a deterministic but varied seed per field
  const seed = Math.abs(Math.sin(lat * lng * 100) * 10000);

  // Base NDVI varies by latitude (greener near equator, drier near tropics of cancer)
  const baseNDVI = 0.35 + Math.sin(lat * 0.5) * 0.15 + (seed % 20) / 100;
  const baseNDWI = baseNDVI * 0.3 - 0.1 + (seed % 10) / 100;
  const baseSAVI = baseNDVI * 0.7 + 0.05;

  // Modifiers per satellite (different sensitivities)
  const noise = (n: number) => (seed % (n + 1)) / (n * 10) - 0.05;

  const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));

  const results: SatelliteResult[] = [];

  // 1. Sentinel-2 (10m, highest quality)
  const s2_ndvi = clamp(baseNDVI + noise(5) * 1.2);
  const s2_ndwi = clamp(baseNDWI + noise(6) * 1.1);
  const s2_savi = clamp(baseSAVI + noise(4) * 1.0);
  const s2_reip = clamp(baseNDVI * 0.85 + 0.1 + noise(7) * 0.8); // Red Edge
  const s2_evi  = clamp(baseNDVI * 1.2 - 0.1 + noise(8) * 0.5);  // Enhanced VI

  const s2Configured = isSentinelAvailable();
  const s2Health = Math.round((s2_ndvi * 0.4 + s2_ndwi * 0.2 + s2_savi * 0.2 + s2_reip * 0.1 + s2_evi * 0.1) * 100);

  results.push({
    sourceId: 'sentinel2',
    sourceName: 'Sentinel-2 (ESA)',
    icon: '🛰️',
    resolution: '10m',
    revisitDays: '~5 days',
    dataAvailable: s2Configured,
    values: { NDVI: s2_ndvi, NDWI: s2_ndwi, SAVI: s2_savi, REIP: s2_reip, EVI: s2_evi },
    healthScore: s2Configured ? s2Health : null,
    status: s2Configured ? (s2Health >= 70 ? 'excellent' : s2Health >= 50 ? 'good' : s2Health >= 30 ? 'moderate' : 'poor') : 'no_data',
  });

  // 2. Sentinel-1 SAR (soil moisture, flood detection)
  const sarMoisture = clamp(0.2 + Math.sin(lat * 0.3) * 0.15 + noise(10) * 0.8 + areaHa / 1000 * 0.1);
  const floodRisk = sarMoisture > 0.6 ? Math.min(1, (sarMoisture - 0.6) * 2) : 0;
  const sarHealth = Math.round((1 - Math.abs(sarMoisture - 0.35) / 0.65) * 100);

  results.push({
    sourceId: 'sentinel1_sar',
    sourceName: 'Sentinel-1 SAR (ESA)',
    icon: '📡',
    resolution: '10m',
    revisitDays: '6-12 days',
    dataAvailable: s2Configured,
    values: { soil_moisture: sarMoisture, flood_risk: floodRisk },
    healthScore: s2Configured ? sarHealth : null,
    status: s2Configured
      ? (sarMoisture > 0.55 ? 'moderate' : sarMoisture > 0.45 ? 'good' : 'excellent')
      : 'no_data',
  });

  // 3. Landsat 8/9 (thermal, CWSI, ET)
  const lst = 28 + Math.sin(lat * 0.4) * 5 + noise(15) * 3 + 5; // Land surface temp °C
  const cwsi = Math.max(0, Math.min(1, 0.35 + noise(12) * 0.5 + (lst - 25) / 50));
  const landsatNDVI = clamp(baseNDVI + noise(5) * 0.7);
  const landsatHealth = Math.round((landsatNDVI * 0.6 + (1 - cwsi) * 0.4) * 100);

  results.push({
    sourceId: 'landsat',
    sourceName: 'Landsat 8/9 (NASA)',
    icon: '🌍',
    resolution: '30m+thermal',
    revisitDays: '16 days',
    dataAvailable: true,
    values: { NDVI: landsatNDVI, LST: lst, CWSI: cwsi },
    healthScore: landsatHealth,
    status: landsatHealth >= 65 ? 'good' : landsatHealth >= 40 ? 'moderate' : 'poor',
  });

  // 4. MODIS (daily, regional benchmark)
  const modisNDVI = clamp(baseNDVI - 0.03 + noise(3) * 0.3);
  const modisLST = lst - 1 + noise(8) * 0.5;
  const modisHealth = Math.round((modisNDVI / 0.8) * 100);

  results.push({
    sourceId: 'modis',
    sourceName: 'MODIS (NASA)',
    icon: '🛸',
    resolution: '250-500m',
    revisitDays: 'Daily',
    dataAvailable: true,
    values: { NDVI: modisNDVI, LST: modisLST },
    healthScore: modisHealth,
    status: modisHealth >= 55 ? 'good' : modisHealth >= 35 ? 'moderate' : 'poor',
  });

  // 5. VIIRS (night-time, thermal)
  const viirsNDVI = clamp(baseNDVI - 0.05 + noise(4) * 0.2);
  const viirsHealth = Math.round((viirsNDVI / 0.8) * 100);

  results.push({
    sourceId: 'viirs',
    sourceName: 'VIIRS (NASA/NOAA)',
    icon: '🌙',
    resolution: '375-500m',
    revisitDays: 'Daily',
    dataAvailable: true,
    values: { NDVI: viirsNDVI },
    healthScore: viirsHealth,
    status: viirsHealth >= 50 ? 'good' : viirsHealth >= 30 ? 'moderate' : 'poor',
  });

  return results;
}

/**
 * Build weather summary from cached Open-Meteo data
 */
function buildWeatherSummary(data: OpenMeteoData | null): string | null {
  if (!data?.daily) return null;
  const precip = data.daily.precipitation_sum?.reduce((s, v) => s + v, 0) || 0;
  const et = data.daily.et0_fao_evapotranspiration?.reduce((s, v) => s + v, 0) || 0;
  const maxTemp = Math.max(...(data.daily.temperature_2m_max || [25]));
  const minTemp = Math.min(...(data.daily.temperature_2m_min || [20]));
  return `🌤️ 7-day: ${precip.toFixed(1)}mm rain · ET₀ ${et.toFixed(1)}mm · ${minTemp.toFixed(0)}–${maxTemp.toFixed(0)}°C`;
}

/**
 * Generate per-source recommendations
 */
function generatePerSourceRecs(results: SatelliteResult[]): Record<string, string[]> {
  const recs: Record<string, string[]> = {};

  for (const sat of results) {
    const r: string[] = [];
    const h = sat.healthScore;

    if (sat.sourceId === 'sentinel2' && h !== null) {
      if (h < 40) r.push('🔴 Low NDVI detected — possible nutrient deficiency or pest stress');
      if ((sat.values.NDWI ?? 0) < 0) r.push('💧 Water stress detected — irrigation may be needed');
      if ((sat.values.REIP ?? 0.5) < 0.35) r.push('🔬 Low REIP (Red Edge) — chlorophyll deficiency, consider nitrogen');
      if ((sat.values.EVI ?? 0.5) > 0.7) r.push('🌿 High EVI — vigorous crop, maintain current plan');
      if (h >= 70) r.push('✅ Excellent crop health from Sentinel-2 high-res analysis');
    }

    if (sat.sourceId === 'sentinel1_sar' && h !== null) {
      const moisture = sat.values.soil_moisture ?? 0.3;
      const flood = sat.values.flood_risk ?? 0;
      if (moisture > 0.55) r.push(`💦 High soil moisture (${(moisture * 100).toFixed(0)}%) — risk of waterlogging`);
      if (flood > 0.5) r.push(`🌊 Flood risk elevated (${(flood * 100).toFixed(0)}%) — monitor drainage`);
      if (moisture < 0.2) r.push('🏜️ Low soil moisture detected — consider irrigation');
      if (moisture >= 0.25 && moisture <= 0.45) r.push('✅ Optimal soil moisture range for crop growth');
    }

    if (sat.sourceId === 'landsat' && h !== null) {
      const cwsi = sat.values.CWSI ?? 0.5;
      const lst = sat.values.LST ?? 30;
      if (cwsi > 0.7) r.push(`🌡️ High CWSI (${(cwsi * 100).toFixed(0)}%) — crop water stress, irrigate urgently`);
      if (lst > 35) r.push(`🔥 Land surface temp ${lst.toFixed(0)}°C — heat stress risk`);
      if (cwsi < 0.3) r.push('✅ Low CWSI — crops not water stressed');
    }

    if (sat.sourceId === 'modis' && h !== null) {
      if (h < 40) r.push('📊 MODIS shows below-regional average — check against district benchmarks');
      if (h >= 60) r.push('✅ MODIS daily data confirms healthy vegetation');
    }

    if (r.length === 0) {
      r.push('📡 Data acquired — no specific issues detected from this source');
    }

    recs[sat.sourceId] = r;
  }

  return recs;
}

/**
 * Aggregate all satellite results into a unified health score
 */
function aggregateHealthScore(results: SatelliteResult[]): { score: number; status: string; bestSource: string } {
  const valid = results.filter(r => r.healthScore !== null && r.dataAvailable);
  if (valid.length === 0) return { score: 50, status: 'Unknown', bestSource: 'none' };

  // Weight: higher resolution = higher weight
  const weights: Record<string, number> = {
    sentinel2: 3.0,
    sentinel1_sar: 2.0,
    landsat: 1.5,
    modis: 1.0,
    viirs: 0.8,
  };

  let totalWeight = 0;
  let weightedScore = 0;

  for (const r of valid) {
    const w = weights[r.sourceId] || 1;
    weightedScore += (r.healthScore ?? 50) * w;
    totalWeight += w;
  }

  const score = Math.round(weightedScore / totalWeight);

  // Find best source
  let best = valid[0];
  for (const r of valid) {
    if ((r.healthScore ?? 0) > (best.healthScore ?? 0) && weights[r.sourceId] >= 1) {
      best = r;
    }
  }

  const status = score >= 75 ? '✅ Excellent' : score >= 55 ? '🟢 Good' : score >= 35 ? '🟡 Needs Attention' : score >= 20 ? '🔴 Poor' : '⛔ Critical';

  return { score, status, bestSource: best.sourceName };
}

/**
 * Main entry point: run full multi-satellite analysis on a field
 */
export async function runMultiSatelliteAnalysis(
  fieldName: string,
  vertices: Array<{ lat: number; lng: number }>,
  areaHa: number
): Promise<MultiSatelliteAnalysis> {
  const lat = vertices.reduce((s, v) => s + v.lat, 0) / vertices.length;
  const lng = vertices.reduce((s, v) => s + v.lng, 0) / vertices.length;

  // 1. Generate satellite results
  const satellites = generateSimulatedResults(fieldName, vertices, areaHa);

  // 2. Fetch real weather data from Open-Meteo (single API call)
  const openMeteoData = await fetchOpenMeteo(lat, lng, 7);

  // Build weather summary
  const weatherSummary = buildWeatherSummary(openMeteoData);

  // 3. Fetch NASA POWER data
  const powerData = await fetchNASAPOWER(lat, lng, 2024, 2025);

  // 4. Calculate regional benchmark
  const s2Result = satellites.find(s => s.sourceId === 'sentinel2');
  const benchmark = calculateBenchmark(s2Result?.values.NDVI ?? 0.45, 0.45);

  // 5. Generate irrigation advice combining all sources
  const bestNDVI = s2Result?.values.NDVI ?? 0.4;
  const bestNDWI = s2Result?.values.NDWI ?? 0.1;
  const sarMoisture = satellites.find(s => s.sourceId === 'sentinel1_sar')?.values.soil_moisture ?? 0.3;
  const landsatCWSI = satellites.find(s => s.sourceId === 'landsat')?.values.CWSI ?? 0.4;

  // Extract ET₀ and precipitation from cached Open-Meteo data
  let et0 = 4.5; // default mm/day
  let precip = 0;
  if (openMeteoData?.daily?.et0_fao_evapotranspiration) {
    et0 = openMeteoData.daily.et0_fao_evapotranspiration.reduce((s, v) => s + v, 0) / openMeteoData.daily.et0_fao_evapotranspiration.length;
  }
  if (openMeteoData?.daily?.precipitation_sum) {
    precip = openMeteoData.daily.precipitation_sum.reduce((s, v) => s + v, 0) / openMeteoData.daily.precipitation_sum.length;
  }

  const irrigationAdvice = generateIrrigationAdvice(
    bestNDWI,
    bestNDVI,
    et0,
    precip,
    sarMoisture,
    satellites.find(s => s.sourceId === 'landsat')?.values.LST ?? 28
  );

  // 6. Aggregate
  const { score, status, bestSource } = aggregateHealthScore(satellites);
  const perSourceRecs = generatePerSourceRecs(satellites);

  // 7. Global recommendations
  const globalRecs: string[] = [];

  if (bestNDVI < 0.3) {
    globalRecs.push('🔴 Critical: Very low vegetation health detected across all sources. Immediate soil testing and crop evaluation recommended.');
  } else if (bestNDVI < 0.5) {
    globalRecs.push('🟡 Moderate crop health. Consider targeted fertilizer application in lower-scoring zones.');
  } else {
    globalRecs.push('🟢 Field is in good condition overall. Continue current management practices.');
  }

  if (landsatCWSI > 0.6) {
    globalRecs.push('🌡️ High Crop Water Stress Index (CWSI) from Landsat thermal. Irrigation recommended within 24-48 hours.');
  }

  if (sarMoisture > 0.55) {
    globalRecs.push('💦 Sentinel-1 SAR shows elevated soil moisture — check drainage and watch for waterlogging.');
  } else if (sarMoisture < 0.2) {
    globalRecs.push('🏜️ Soil moisture critically low from SAR data. Initiate irrigation plan.');
  }

  if (irrigationAdvice.recommended) {
    globalRecs.push(`💧 ${irrigationAdvice.reason}`);
  }

  if (benchmark.comparison === 'below') {
    globalRecs.push(`📊 Your field is ${Math.abs(benchmark.difference).toFixed(2)} NDVI below district average (${benchmark.regionalAvgNDVI.toFixed(2)}). Consider reviewing soil management practices.`);
  } else if (benchmark.comparison === 'above') {
    globalRecs.push(`📊 Your field is ${benchmark.difference.toFixed(2)} NDVI above district average — performing better than ${benchmark.percentile}% of local fields.`);
  }

  if (weatherSummary) {
    globalRecs.push(`🌤️ ${weatherSummary}`);
  }

  // Add NASA POWER insights
  if (powerData?.properties?.parameter) {
    const t2m = powerData.properties.parameter['T2M'];
    const prec = powerData.properties.parameter['PRECTOTCORR'];
    if (t2m && prec) {
      const years = Object.keys(t2m);
      const avgPrecip = years.reduce((s, y) => s + (prec[y] || 0), 0) / years.length;
      if (avgPrecip < 2) {
        globalRecs.push('☀️ NASA POWER data indicates below-average rainfall this season. Plan supplementary irrigation.');
      }
    }
  }

  return {
    fieldName,
    areaHa,
    timestamp: new Date().toISOString(),
    satellites,
    overallHealthScore: score,
    overallStatus: status,
    recommendations: globalRecs,
    irrigationAdvice,
    regionalBenchmark: benchmark,
    weatherSummary,
    bestSource,
    perSourceRecommendations: perSourceRecs,
  };
}
