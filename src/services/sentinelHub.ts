/**
 * Sentinel Hub / Copernicus Data Space Service
 * 
 * Provides high-resolution (10m) Sentinel-2 satellite data access.
 * Requires a free Copernicus Data Space account + Sentinel Hub config.
 * 
 * Setup:
 * 1. Register at https://dataspace.copernicus.eu/
 * 2. Go to Sentinel Hub Dashboard → Configuration Utility
 * 3. Create config with layers: TRUE_COLOR, NDVI, NDWI, SAVI
 * 4. Copy Instance ID → set VITE_SENTINEL_INSTANCE_ID in .env
 */

const INSTANCE_ID = import.meta.env.VITE_SENTINEL_INSTANCE_ID || '';
const WMS_BASE = `https://services.sentinel-hub.com/ogc/wms/${INSTANCE_ID}`;
const WMTS_BASE = `https://services.sentinel-hub.com/ogc/wmts/${INSTANCE_ID}`;

export const SENTINEL_CONFIGURED = !!INSTANCE_ID;

export interface SentinelLayerInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
  resolution: string;
  evalscript?: string;
}

export const SENTINEL_LAYERS: SentinelLayerInfo[] = [
  { id: 'TRUE_COLOR', name: 'True Color', icon: '🛰️', description: 'Natural color satellite image (10m)', resolution: '10m' },
  { id: 'NDVI', name: 'Crop Health (NDVI)', icon: '🌿', description: 'Normalized Difference Vegetation Index (10m)', resolution: '10m' },
  { id: 'NDWI', name: 'Water Index (NDWI)', icon: '💧', description: 'Normalized Difference Water Index (10m)', resolution: '10m' },
  { id: 'SAVI', name: 'Soil Health (SAVI)', icon: '🪨', description: 'Soil-Adjusted Vegetation Index (10m)', resolution: '10m' },
  { id: 'MOISTURE', name: 'Moisture Index', icon: '💦', description: 'Normalized Difference Moisture Index (10m)', resolution: '10m' },
];

/** Get the WMTS tile URL for a Sentinel Hub layer */
export function getWMTSLayerUrl(layerId: string): string | null {
  if (!INSTANCE_ID) return null;
  return `${WMTS_BASE}?layer=${layerId}&tilematrixset=EPSG:3857&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/jpeg`;
}

/** Check if Sentinel Hub is configured */
export function isSentinelConfigured(): boolean {
  return SENTINEL_CONFIGURED;
}

/**
 * Get WMS GetMap URL for a field's bounding box
 * Returns high-res PNG for pixel sampling
 */
export function getSentinelWMSUrl(
  layerId: string,
  bbox: [number, number, number, number],
  width = 512,
  height = 512
): string | null {
  if (!INSTANCE_ID) return null;

  const params = new URLSearchParams({
    SERVICE: 'WMS',
    VERSION: '1.1.1',
    REQUEST: 'GetMap',
    LAYERS: layerId,
    STYLES: '',
    FORMAT: 'image/png',
    TRANSPARENT: 'TRUE',
    BBOX: bbox.join(','),
    WIDTH: String(width),
    HEIGHT: String(height),
    SRS: 'EPSG:4326',
    MAXCC: '20', // Max cloud coverage 20%
    PRIORITY: 'mostRecent', // Get the most recent available scene
  });

  return `${WMS_BASE}?${params.toString()}`;
}

/**
 * Get the WMS base URL (for constructing custom requests)
 */
export function getSentinelWMSBase(): string | null {
  return INSTANCE_ID ? WMS_BASE : null;
}

// NDVI evalscript for creating a custom NDVI layer if needed
export const NDVI_EVALSCRIPT = `//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B04", "B08"] }],
    output: { bands: 1, sampleType: "FLOAT32" }
  };
}
function evaluatePixel(sample) {
  let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
  return [ndvi];
}`;

// NDWI evalscript
export const NDWI_EVALSCRIPT = `//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B03", "B08"] }],
    output: { bands: 1, sampleType: "FLOAT32" }
  };
}
function evaluatePixel(sample) {
  let ndwi = (sample.B03 - sample.B08) / (sample.B03 + sample.B08);
  return [ndwi];
}`;
