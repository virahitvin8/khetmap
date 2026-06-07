/**
 * Multi-Satellite Source Integration
 * 
 * Unified config and data access for all satellite/weather sources.
 * 
 * Source        | Revisit | Resolution | Free?   | Key Needed?
 * Sentinel-2    | ~5d     | 10m        | ✅ Yes  | Copernicus account
 * Sentinel-1 SAR| 6-12d   | 10m        | ✅ Yes  | Copernicus account  
 * Landsat 8/9   | 16d     | 30m+thermal| ✅ Yes  | No (NASA GIBS)
 * MODIS/VIIRS   | Daily   | 250-500m   | ✅ Yes  | No (NASA GIBS)
 * Open-Meteo    | Hourly  | ~11km      | ✅ Yes  | None
 * NASA POWER    | Daily   | ~50km      | ✅ Yes  | None
 */

import { AnalysisLayer } from './fieldAnalysis';

// ===== SATELLITE SOURCE DEFINITIONS =====

export type SatelliteId = 
  | 'sentinel2' | 'sentinel1_sar' | 'landsat' | 'modis' | 'viirs'
  | 'openmeteo' | 'nasa_power';

export interface SatelliteSource {
  id: SatelliteId;
  name: string;
  icon: string;
  provider: string;
  revisitDays: string;
  resolution: string;
  apiKeyRequired: boolean;
  configured: boolean;
  setupUrl?: string;
  description: string;
  applications: string[];
  layers: SourceLayer[];
}

export interface SourceLayer {
  id: string;
  name: string;
  icon: string;
  unit: string;
  description: string;
  gibsLayer?: string; // NASA GIBS layer name
  sentinelLayer?: string; // Sentinel Hub layer name
}

export const SATELLITE_SOURCES: SatelliteSource[] = [
  {
    id: 'sentinel2',
    name: 'Sentinel-2 (ESA)',
    icon: '🛰️',
    provider: 'ESA Copernicus',
    revisitDays: '~5 days',
    resolution: '10m',
    apiKeyRequired: true,
    configured: !!import.meta.env.VITE_SENTINEL_INSTANCE_ID,
    setupUrl: 'https://dataspace.copernicus.eu/',
    description: 'High-resolution optical imagery for precision agriculture',
    applications: ['Crop Health (NDVI)', 'Water Index (NDWI)', 'Chlorophyll (REIP)', 'Nitrogen Stress', 'Yield Prediction'],
    layers: [
      { id: 'TRUE_COLOR', name: 'True Color', icon: '🖼️', unit: 'RGB', description: 'Natural color composite', sentinelLayer: 'TRUE_COLOR' },
      { id: 'NDVI', name: 'NDVI', icon: '🌿', unit: 'NDVI', description: 'Crop health & vigor', sentinelLayer: 'NDVI' },
      { id: 'NDWI', name: 'NDWI', icon: '💧', unit: 'NDWI', description: 'Water content', sentinelLayer: 'NDWI' },
      { id: 'SAVI', name: 'SAVI', icon: '🪨', unit: 'SAVI', description: 'Soil-adjusted vegetation', sentinelLayer: 'SAVI' },
      { id: 'REIP', name: 'REIP', icon: '🔬', unit: 'REIP', description: 'Chlorophyll/Red Edge', sentinelLayer: 'REIP' },
    ],
  },
  {
    id: 'sentinel1_sar',
    name: 'Sentinel-1 SAR (ESA)',
    icon: '📡',
    provider: 'ESA Copernicus',
    revisitDays: '6-12 days',
    resolution: '10m',
    apiKeyRequired: true,
    configured: !!import.meta.env.VITE_SENTINEL_INSTANCE_ID,
    setupUrl: 'https://dataspace.copernicus.eu/',
    description: 'Radar imagery — sees through clouds for monsoon monitoring',
    applications: ['Soil Moisture', 'Flood Detection', 'Rice Mapping', 'Cloud-penetrating Analysis'],
    layers: [
      { id: 'SAR_MOISTURE', name: 'Soil Moisture', icon: '💦', unit: 'dB', description: 'Surface soil moisture from SAR backscatter' },
      { id: 'FLOOD_MAP', name: 'Flood Detection', icon: '🌊', unit: 'Binary', description: 'Water extent mapping during monsoon' },
      { id: 'RICE_MAP', name: 'Rice Map', icon: '🌾', unit: 'Class', description: 'Rice field identification' },
    ],
  },
  {
    id: 'landsat',
    name: 'Landsat 8/9 (NASA/USGS)',
    icon: '🌍',
    provider: 'NASA/USGS',
    revisitDays: '16 days',
    resolution: '30m + Thermal (100m)',
    apiKeyRequired: false,
    configured: true,
    description: 'Longest-running Earth observation program with thermal bands',
    applications: ['Thermal Stress (CWSI)', 'Evapotranspiration', 'Long-term Trends', 'Thermal Anomalies'],
    layers: [
      { id: 'Landsat_WELD_NDVI', name: 'NDVI (Landsat)', icon: '🌿', unit: 'NDVI', description: '30m NDVI from Landsat WELD', gibsLayer: 'Landsat_WELD_NDVI' },
      { id: 'Landsat_WELD_NDWI', name: 'NDWI (Landsat)', icon: '💧', unit: 'NDWI', description: 'Water index at 30m', gibsLayer: 'Landsat_WELD_NDWI' },
      { id: 'Landsat_WELD_TCBRIGHT', name: 'Thermal Brightness', icon: '🌡️', unit: '°C', description: 'Thermal band brightness temperature', gibsLayer: 'Landsat_WELD_TCBRIGHT' },
    ],
  },
  {
    id: 'modis',
    name: 'MODIS (NASA)',
    icon: '🛸',
    provider: 'NASA',
    revisitDays: 'Daily',
    resolution: '250-500m',
    apiKeyRequired: false,
    configured: true,
    description: 'Daily global coverage for regional monitoring and benchmarks',
    applications: ['Regional Benchmarks', 'Drought Alerts', 'District Comparisons', 'Long-term Trends'],
    layers: [
      { id: 'MODIS_Terra_NDVI_8Day', name: 'NDVI (MODIS)', icon: '🌿', unit: 'NDVI', description: '250m NDVI, 8-day composite', gibsLayer: 'MODIS_Terra_NDVI_8Day' },
      { id: 'MODIS_Terra_NDWI_8Day', name: 'NDWI (MODIS)', icon: '💧', unit: 'NDWI', description: 'Water index, 8-day', gibsLayer: 'MODIS_Terra_NDWI_8Day' },
      { id: 'MODIS_Terra_LST_Day', name: 'Land Surface Temp', icon: '🌡️', unit: '°C', description: 'Daytime land surface temperature', gibsLayer: 'MODIS_Terra_LST_Day' },
    ],
  },
  {
    id: 'viirs',
    name: 'VIIRS (NASA/NOAA)',
    icon: '🌙',
    provider: 'NASA/NOAA',
    revisitDays: 'Daily',
    resolution: '375-500m',
    apiKeyRequired: false,
    configured: true,
    description: 'Night-time and daily visible/thermal imagery',
    applications: ['Night Monitoring', 'Fire Detection', 'Thermal Anomalies'],
    layers: [
      { id: 'VIIRS_NOAA_NDVI', name: 'NDVI (VIIRS)', icon: '🌿', unit: 'NDVI', description: 'Daily NDVI at 500m', gibsLayer: 'VIIRS_NOAA_NDVI' },
    ],
  },
  {
    id: 'openmeteo',
    name: 'Open-Meteo (Weather)',
    icon: '🌤️',
    provider: 'Open-Meteo',
    revisitDays: 'Hourly',
    resolution: '~11km',
    apiKeyRequired: false,
    configured: true,
    description: 'Free weather API — no key needed. Historical & forecast data.',
    applications: ['Rainfall History', 'Evapotranspiration (ET)', 'Temperature', 'Soil Moisture Proxy', 'Irrigation Advisory'],
    layers: [],
  },
  {
    id: 'nasa_power',
    name: 'NASA POWER (Agro-climate)',
    icon: '☀️',
    provider: 'NASA',
    revisitDays: 'Daily',
    resolution: '~50km',
    apiKeyRequired: false,
    configured: true,
    description: 'NASA Prediction Of Worldwide Energy Resources — agricultural climate data',
    applications: ['Solar Radiation', 'Dew Point', 'Wind Speed', 'Long-term Climate Normals'],
    layers: [],
  },
];

// ===== NASA GIBS WMS LAYERS =====
const GIBS_WMS = 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi';

/** Get WMS tile URL for a NASA GIBS layer */
export function getGibsTileUrl(gibsLayer: string, bbox: [number,number,number,number], width = 512, height = 512): string {
  const p = new URLSearchParams({
    SERVICE: 'WMS', VERSION: '1.1.1', REQUEST: 'GetMap',
    LAYERS: gibsLayer, STYLES: '', FORMAT: 'image/png', TRANSPARENT: 'TRUE',
    BBOX: bbox.join(','), WIDTH: String(width), HEIGHT: String(height), SRS: 'EPSG:4326',
  });
  return `${GIBS_WMS}?${p.toString()}`;
}

// ===== OPEN-METEO API (FREE, NO KEY) =====

export interface OpenMeteoData {
  hourly?: {
    time: string[];
    temperature_2m?: number[];
    precipitation?: number[];
    relative_humidity_2m?: number[];
    wind_speed_10m?: number[];
    soil_moisture_0_to_7cm?: number[];
    evapotranspiration?: number[];
  };
  daily?: {
    time: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_sum?: number[];
    et0_fao_evapotranspiration?: number[];
  };
}

/** Fetch historical weather + ET data from Open-Meteo (free) */
export async function fetchOpenMeteo(lat: number, lng: number, daysBack = 30): Promise<OpenMeteoData | null> {
  try {
    const now = new Date();
    const start = new Date(now.getTime() - daysBack * 86400000);
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lng),
      hourly: 'temperature_2m,precipitation,relative_humidity_2m,wind_speed_10m,soil_moisture_0_to_7cm,evapotranspiration',
      daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,et0_fao_evapotranspiration',
      timezone: 'auto',
      start_date: start.toISOString().split('T')[0],
      end_date: now.toISOString().split('T')[0],
    });
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

// ===== NASA POWER API =====

export interface PowerData {
  properties: {
    parameter: Record<string, Record<string, number>>;
  };
}

/** Fetch agro-climate data from NASA POWER API */
export async function fetchNASAPOWER(lat: number, lng: number, startYear = 2020, endYear = 2025): Promise<PowerData | null> {
  try {
    const params = new URLSearchParams({
      parameters: 'T2M,PRECTOTCORR,ALLSKY_SFC_SW_DWN',
      community: 'AG',
      longitude: String(lng),
      latitude: String(lat),
      start: String(startYear),
      end: String(endYear),
      format: 'JSON',
    });
    const res = await fetch(`https://power.larc.nasa.gov/api/temporal/daily/point?${params.toString()}`);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

// ===== IRRIGATION ADVISORY =====

export interface IrrigationAdvice {
  recommended: boolean;
  amountMm: number;
  urgency: 'none' | 'low' | 'medium' | 'high';
  reason: string;
  et0: number;
  precipitation: number;
  soilMoisture: number;
  cropStage?: string;
}

/** Generate smart irrigation advice from satellite + weather data */
export function generateIrrigationAdvice(
  ndwi: number,
  ndvi: number,
  et0: number,
  precipitation: number,
  soilMoisture: number,
  temp: number
): IrrigationAdvice {
  const deficit = et0 - precipitation;
  let urgency: IrrigationAdvice['urgency'] = 'none';
  let amountMm = 0;
  let reason = '';

  if (ndwi < 0.1 && ndvi < 0.3) {
    urgency = 'high';
    amountMm = Math.max(deficit, 15);
    reason = `🔴 CRITICAL: Low vegetation health (NDVI: ${ndvi.toFixed(2)}) and water stress (NDWI: ${ndwi.toFixed(2)}). ET₀ (${et0.toFixed(1)}mm) exceeds precipitation (${precipitation.toFixed(1)}mm).`;
  } else if (ndwi < 0.1) {
    urgency = 'medium';
    amountMm = Math.max(deficit * 0.7, 10);
    reason = `🟡 Water stress detected. NDWI (${ndwi.toFixed(2)}) indicates low moisture. Consider irrigation of ${amountMm.toFixed(0)}mm.`;
  } else if (precipitation < et0 * 0.6 && ndvi < 0.5) {
    urgency = 'low';
    amountMm = Math.max(deficit * 0.5, 5);
    reason = `🟢 Moderate conditions. Precipitation (${precipitation.toFixed(1)}mm) below ET₀ (${et0.toFixed(1)}mm). Light irrigation recommended.`;
  } else {
    reason = `✅ Adequate moisture. ET₀ (${et0.toFixed(1)}mm) balanced with precipitation (${precipitation.toFixed(1)}mm). No irrigation needed.`;
  }

  return { recommended: urgency !== 'none', amountMm: Math.round(amountMm), urgency, reason, et0, precipitation, soilMoisture };
}

// ===== CWSI (Crop Water Stress Index) =====

export function calculateCWSI(landsatThermal: number, airTemp: number, humidity: number): { cwsi: number; stress: string } {
  // Simplified CWSI: (T_canopy - T_wet) / (T_dry - T_wet)
  const tw = airTemp - 5;  // Wet bulb approximation
  const td = airTemp + 5;  // Dry bulb approximation
  const cwsi = Math.max(0, Math.min(1, (landsatThermal - tw) / (td - tw)));
  const stress = cwsi < 0.3 ? 'No stress' : cwsi < 0.6 ? 'Moderate stress' : cwsi < 0.8 ? 'Severe stress' : 'Critical';
  return { cwsi: Math.round(cwsi * 100) / 100, stress };
}

// ===== REGIONAL BENCHMARK =====

export interface RegionalBenchmark {
  farmNDVI: number;
  regionalAvgNDVI: number;
  percentile: number;
  comparison: 'above' | 'below' | 'average';
  difference: number;
  trend: 'improving' | 'stable' | 'declining';
}

/** Compare farm NDVI to regional MODIS benchmark */
export function calculateBenchmark(farmNDVI: number, regionalNDVI = 0.45): RegionalBenchmark {
  const diff = farmNDVI - regionalNDVI;
  const percentile = Math.max(0, Math.min(100, 50 + (diff / 0.3) * 50));
  return {
    farmNDVI,
    regionalAvgNDVI: regionalNDVI,
    percentile: Math.round(percentile),
    comparison: diff > 0.05 ? 'above' : diff < -0.05 ? 'below' : 'average',
    difference: Math.round(diff * 100) / 100,
    trend: 'stable',
  };
}
