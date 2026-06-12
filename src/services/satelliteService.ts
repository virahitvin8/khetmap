/**
 * Satellite Service — KhetMap
 * Integrates: Copernicus NDVI WMS, Open-Meteo weather, NASA POWER
 */

// ─── Copernicus Sentinel Hub WMS ────────────────────────────────
// Instance ID from Copernicus Data Space Ecosystem
const COPERNICUS_INSTANCE = import.meta.env.VITE_COPERNICUS_INSTANCE_ID || 'demo';
const CDSE_WMS_BASE = `https://sh.dataspace.copernicus.eu/ogc/wms/${COPERNICUS_INSTANCE}`;

export type SatLayer = 'NDVI' | 'SAR_WATER' | 'TRUE_COLOR' | 'EVI' | 'NDWI';

export function getSentinelWMSUrl(layer: SatLayer): string {
  // Using Copernicus CDSE OGC WMS
  return CDSE_WMS_BASE;
}

export function getSentinelWMSParams(layer: SatLayer, date?: string) {
  const today = date || new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const layerMap: Record<SatLayer, string> = {
    NDVI: 'NDVI',
    SAR_WATER: 'SENTINEL-1-IW',
    TRUE_COLOR: 'TRUE-COLOR',
    EVI: 'EVI',
    NDWI: 'NDWI',
  };

  return {
    service: 'WMS',
    request: 'GetMap',
    version: '1.3.0',
    layers: layerMap[layer],
    format: 'image/png',
    transparent: true,
    time: `${thirtyDaysAgo}/${today}`,
    maxcc: 30, // max cloud coverage %
  };
}

// ─── NASA GIBS MODIS (fallback free layer, no auth needed) ───────
export function getNASAGIBSUrl(layer: 'NDVI' | 'LST'): string {
  const layerMap = {
    NDVI: 'MODIS_Terra_L3_NDVI_Monthly',
    LST: 'MODIS_Terra_L3_LST_Day_1km_Monthly',
  };
  return `https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=${layerMap[layer]}&FORMAT=image/png&TRANSPARENT=TRUE`;
}

// ─── Open-Meteo Weather API (free, no API key) ───────────────────
export interface WeatherData {
  temperature: number;        // °C
  rainfall: number;           // mm today
  humidity: number;           // %
  windSpeed: number;          // km/h
  et0: number;                // mm/day (reference evapotranspiration)
  soilMoisture: number;       // m³/m³
  uvIndex: number;
  description: string;
  irrigationAdvice: string;
  forecast: ForecastDay[];
}

export interface ForecastDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  rainfall: number;
  et0: number;
}

export async function getWeatherData(lat: number, lng: number): Promise<WeatherData> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', lat.toString());
  url.searchParams.set('longitude', lng.toString());
  url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,et0_fao_evapotranspiration,soil_moisture_0_to_1cm,uv_index');
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_sum,et0_fao_evapotranspiration');
  url.searchParams.set('forecast_days', '7');
  url.searchParams.set('timezone', 'Asia/Kolkata');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Weather API failed');
  const data = await res.json();

  const current = data.current;
  const daily = data.daily;
  const et0 = current.et0_fao_evapotranspiration ?? 0;
  const rainfall = current.precipitation ?? 0;
  const soilMoisture = current.soil_moisture_0_to_1cm ?? 0;

  // Smart irrigation advice
  let irrigationAdvice = '';
  if (rainfall > 10) {
    irrigationAdvice = '🌧️ Heavy rain today — skip irrigation';
  } else if (et0 > 6 && soilMoisture < 0.2) {
    irrigationAdvice = '🌊 High ET₀ + dry soil — irrigate today!';
  } else if (et0 > 4) {
    irrigationAdvice = '💧 Moderate stress — light irrigation advised';
  } else {
    irrigationAdvice = '✅ Soil moisture adequate — no irrigation needed';
  }

  const forecast: ForecastDay[] = (daily.time || []).map((date: string, i: number) => ({
    date,
    maxTemp: daily.temperature_2m_max[i],
    minTemp: daily.temperature_2m_min[i],
    rainfall: daily.precipitation_sum[i],
    et0: daily.et0_fao_evapotranspiration[i],
  }));

  return {
    temperature: current.temperature_2m,
    rainfall,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    et0,
    soilMoisture,
    uvIndex: current.uv_index ?? 0,
    description: getWeatherDescription(current.temperature_2m, rainfall, et0),
    irrigationAdvice,
    forecast,
  };
}

function getWeatherDescription(temp: number, rain: number, et0: number): string {
  if (rain > 20) return 'Heavy rain — good for crops';
  if (rain > 5) return 'Moderate rain';
  if (temp > 38 && et0 > 7) return 'Very hot & dry — high stress risk';
  if (temp > 32) return 'Hot day — monitor crop stress';
  if (temp < 15) return 'Cool — check for frost risk';
  return 'Moderate conditions';
}

// ─── NDVI Health Score Calculator ───────────────────────────────
export function ndviToHealthScore(ndvi: number): { score: number; label: string; color: string } {
  if (ndvi >= 0.6) return { score: Math.round(ndvi * 100), label: 'Excellent', color: '#2D6A4F' };
  if (ndvi >= 0.4) return { score: Math.round(ndvi * 100), label: 'Good',      color: '#52B788' };
  if (ndvi >= 0.2) return { score: Math.round(ndvi * 100), label: 'Moderate',  color: '#F4A261' };
  if (ndvi >= 0)   return { score: Math.round(ndvi * 100), label: 'Poor',      color: '#E76F51' };
  return             { score: 0,                          label: 'Bare Soil', color: '#8B7355' };
}
