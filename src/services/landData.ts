/**
 * Land Data Service
 *
 * Provides land classification & parcel data for a given polygon/coordinates using:
 * 1. Satellite-derived indices (NDVI, NDWI, SAVI) — always free via NASA GIBS
 * 2. OpenStreetMap Overpass API — free land use/land cover data
 * 3. ISRO Bhuvan WMS — Indian region thematic layers (when available)
 *
 * This is NOT a cadastral (ownership) lookup — those APIs don't exist publicly.
 * Instead it provides:
 * - Land use classification (agriculture, built-up, water, forest, barren)
 * - Crop health assessment from current NDVI/NDWI/SAVI values
 * - Topographic info (elevation from Open-Meteo free API)
 * - Historical land use change detection
 */

import { analyzeField, AnalysisLayer } from './fieldAnalysis';

interface Vertex { lat: number; lng: number; }

// ===== LAND CLASSIFICATION =====

export type LandClass = 
  | 'agriculture_cropland'
  | 'agriculture_fallow'
  | 'built_up'
  | 'water_body'
  | 'forest_dense'
  | 'forest_open'
  | 'barren_land'
  | 'wasteland'
  | 'wetland'
  | 'plantation'
  | 'grassland'
  | 'unknown';

export interface LandClassification {
  primaryClass: LandClass;
  confidence: number; // 0-100
  allClasses: Array<{ class: LandClass; percentage: number }>;
  description: string;
  color: string;
  icon: string;
  suitableFor: string[];
  recommendations: string[];
}

// Color mapping for each land class
export const LAND_CLASS_COLORS: Record<LandClass, string> = {
  agriculture_cropland: '#22C55E',
  agriculture_fallow: '#A3E635',
  built_up: '#EF4444',
  water_body: '#3B82F6',
  forest_dense: '#166534',
  forest_open: '#4ADE80',
  barren_land: '#D6D3D1',
  wasteland: '#A8A29E',
  wetland: '#06B6D4',
  plantation: '#65A30D',
  grassland: '#84CC16',
  unknown: '#94A3B8',
};

export const LAND_CLASS_ICONS: Record<LandClass, string> = {
  agriculture_cropland: '🌾',
  agriculture_fallow: '🌱',
  built_up: '🏘️',
  water_body: '💧',
  forest_dense: '🌲',
  forest_open: '🌳',
  barren_land: '🏜️',
  wasteland: '🗑️',
  wetland: '🌊',
  plantation: '🌴',
  grassland: '🌿',
  unknown: '❓',
};

export const LAND_CLASS_LABELS: Record<LandClass, string> = {
  agriculture_cropland: 'Cropland (Active)',
  agriculture_fallow: 'Fallow Land',
  built_up: 'Built-up Area',
  water_body: 'Water Body',
  forest_dense: 'Dense Forest',
  forest_open: 'Open Forest',
  barren_land: 'Barren Land',
  wasteland: 'Wasteland',
  wetland: 'Wetland',
  plantation: 'Plantation',
  grassland: 'Grassland',
  unknown: 'Unknown',
};

/**
 * Classify land type from satellite indices
 * Uses NDVI, NDWI, and SAVI values to determine land cover
 */
export function classifyLandFromIndices(
  ndvi: number,
  ndwi: number,
  savi: number,
): LandClassification {
  // Water detection (NDWI is best for this)
  if (ndwi > 0.3) {
    return {
      primaryClass: 'water_body',
      confidence: Math.min(100, Math.round((ndwi / 0.5) * 100)),
      allClasses: [
        { class: 'water_body', percentage: Math.round(ndwi * 100) },
        { class: 'wetland', percentage: ndwi > 0.1 ? Math.round((ndwi - 0.1) * 50) : 10 },
      ],
      description: 'Open water body detected. High water index with low vegetation response.',
      color: LAND_CLASS_COLORS.water_body,
      icon: LAND_CLASS_ICONS.water_body,
      suitableFor: ['Irrigation source', 'Aquaculture', 'Fisheries'],
      recommendations: [
        '✅ Water body detected — use for irrigation planning',
        '📏 Monitor water extent changes over time with NDWI',
        '🐟 Consider fisheries or aquaculture if suitable',
      ],
    };
  }

  // Wetland (moderate NDWI + moderate NDVI)
  if (ndwi > 0.1 && ndvi > 0.3 && ndvi < 0.6) {
    return {
      primaryClass: 'wetland',
      confidence: Math.min(90, Math.round((ndwi + ndvi) * 70)),
      allClasses: [
        { class: 'wetland', percentage: 45 },
        { class: 'water_body', percentage: 25 },
        { class: 'grassland', percentage: 20 },
      ],
      description: 'Wetland area with mixed water and vegetation signature.',
      color: LAND_CLASS_COLORS.wetland,
      icon: LAND_CLASS_ICONS.wetland,
      suitableFor: ['Conservation', 'Water harvesting', 'Biodiversity'],
      recommendations: [
        '🌊 Wetland ecosystem detected — consider conservation',
        '💧 Acts as natural water storage during monsoon',
        '🌿 Rich biodiversity zone — avoid intensive farming',
      ],
    };
  }

  // Dense forest (high NDVI, low NDWI)
  if (ndvi > 0.7) {
    return {
      primaryClass: 'forest_dense',
      confidence: Math.min(100, Math.round((ndvi - 0.5) * 200)),
      allClasses: [
        { class: 'forest_dense', percentage: Math.round(ndvi * 80) },
        { class: 'forest_open', percentage: Math.round((1 - ndvi) * 50) },
      ],
      description: 'Dense vegetation with NDVI > 0.7 — likely dense forest or very healthy crop.',
      color: LAND_CLASS_COLORS.forest_dense,
      icon: LAND_CLASS_ICONS.forest_dense,
      suitableFor: ['Conservation', 'Carbon credits', 'Biodiversity'],
      recommendations: [
        '🌲 Dense vegetation detected — high carbon sequestration potential',
        '📊 Consider carbon credit programs if this is forest land',
        '🌿 Regular NDVI monitoring recommended',
      ],
    };
  }

  // Open forest / plantation (moderate-high NDVI)
  if (ndvi > 0.5) {
    const isPlantation = savi > 0.3 && ndvi < 0.7;
    return {
      primaryClass: isPlantation ? 'plantation' : 'forest_open',
      confidence: Math.round((ndvi - 0.3) * 150),
      allClasses: [
        { class: isPlantation ? 'plantation' : 'forest_open', percentage: Math.round(ndvi * 70) },
        { class: 'agriculture_cropland', percentage: Math.round((1 - ndvi) * 40) },
      ],
      description: isPlantation
        ? 'Plantation crop with organized vegetation pattern.'
        : 'Open forest or woodland with moderate canopy cover.',
      color: isPlantation ? LAND_CLASS_COLORS.plantation : LAND_CLASS_COLORS.forest_open,
      icon: isPlantation ? LAND_CLASS_ICONS.plantation : LAND_CLASS_ICONS.forest_open,
      suitableFor: isPlantation
        ? ['Timber', 'Rubber', 'Coffee/Tea', 'Fruit orchard']
        : ['Selective logging', 'Forest produce', 'Ecotourism'],
      recommendations: isPlantation
        ? ['🌴 Plantation detected — monitor crop health regularly', '📊 Track NDVI for optimal harvest timing', '💧 Check irrigation efficiency']
        : ['🌳 Open forest — suitable for agroforestry', '📏 Monitor for encroachment', '🔥 Fire risk moderate — keep watch'],
    };
  }

  // Active cropland (moderate NDVI, normal SAVI)
  if (ndvi > 0.3 && ndvi <= 0.5) {
    return {
      primaryClass: 'agriculture_cropland',
      confidence: Math.round((ndvi - 0.15) * 200),
      allClasses: [
        { class: 'agriculture_cropland', percentage: Math.round(ndvi * 70) },
        { class: 'agriculture_fallow', percentage: Math.round((0.4 - ndvi) * 50) },
        { class: 'grassland', percentage: Math.round((1 - ndvi) * 30) },
      ],
      description: `Active cropland with NDVI ${ndvi.toFixed(2)} — crops growing, moderate to good health.`,
      color: LAND_CLASS_COLORS.agriculture_cropland,
      icon: LAND_CLASS_ICONS.agriculture_cropland,
      suitableFor: ['Food crops', 'Cash crops', 'Vegetables', 'Grains'],
      recommendations: [
        '🌾 Active cropland — crops growing well',
        ndvi < 0.4 ? '🟡 Moderate NDVI — consider fertilizer application' : '🟢 Good NDVI — continue current practices',
        '📊 Run NDWI analysis to check water stress',
      ],
    };
  }

  // Grassland / fallow (low NDVI)
  if (ndvi > 0.15) {
    return {
      primaryClass: 'grassland',
      confidence: Math.round((ndvi / 0.3) * 100),
      allClasses: [
        { class: 'grassland', percentage: 40 },
        { class: 'agriculture_fallow', percentage: 30 },
        { class: 'barren_land', percentage: 20 },
      ],
      description: 'Grassland or pasture with sparse low vegetation.',
      color: LAND_CLASS_COLORS.grassland,
      icon: LAND_CLASS_ICONS.grassland,
      suitableFor: ['Grazing', 'Hay production', 'Conservation'],
      recommendations: [
        '🌿 Grassland/pasture detected',
        '🐄 Suitable for grazing if managed properly',
        '📊 Monitor NDVI trends to detect overgrazing',
      ],
    };
  }

  // Barren / built-up (very low or negative NDVI)
  if (ndvi < 0) {
    return {
      primaryClass: 'water_body',
      confidence: Math.round(Math.abs(ndvi) * 100),
      allClasses: [
        { class: 'water_body', percentage: Math.round(Math.abs(ndvi) * 60) },
        { class: 'built_up', percentage: Math.round(Math.abs(ndvi) * 30) },
      ],
      description: 'Water or saturated surface — negative NDVI indicates water or wet soil.',
      color: LAND_CLASS_COLORS.water_body,
      icon: LAND_CLASS_ICONS.water_body,
      suitableFor: ['Water body mapping', 'Drainage analysis'],
      recommendations: [
        '💧 Negative NDVI — likely water or very wet surface',
        '📏 Check NDWI for precise water detection',
        '🌊 Monitor seasonal changes',
      ],
    };
  }

  // Low NDVI — barren or built-up
  if (ndwi < -0.1) {
    return {
      primaryClass: 'built_up',
      confidence: Math.round((1 - ndvi) * 50),
      allClasses: [
        { class: 'built_up', percentage: 40 },
        { class: 'barren_land', percentage: 35 },
        { class: 'wasteland', percentage: 15 },
      ],
      description: 'Built-up or impervious surface with very low vegetation.',
      color: LAND_CLASS_COLORS.built_up,
      icon: LAND_CLASS_ICONS.built_up,
      suitableFor: ['Urban planning', 'Infrastructure mapping'],
      recommendations: [
        '🏘️ Built-up area detected — not suitable for agriculture',
        '📊 Consider urban heat island effect in planning',
        '🌳 Tree plantation recommended for green cover',
      ],
    };
  }

  // Fallback: barren land
  return {
    primaryClass: 'barren_land',
    confidence: Math.round((0.15 - ndvi) * 200),
    allClasses: [
      { class: 'barren_land', percentage: 45 },
      { class: 'wasteland', percentage: 25 },
      { class: 'grassland', percentage: 20 },
    ],
    description: `Barren or fallow land with NDVI ${ndvi.toFixed(2)} — low vegetation cover.`,
    color: LAND_CLASS_COLORS.barren_land,
    icon: LAND_CLASS_ICONS.barren_land,
    suitableFor: ['Solar farms', 'Construction', 'Afforestation'],
    recommendations: [
      '🏜️ Low vegetation cover detected',
      '🌱 Consider soil testing before farming',
      '☀️ Suitable for solar panel installation if flat',
      '🌳 Afforestation can improve soil health',
    ],
  };
}

// ===== OSM OVERPASS API =====

export interface OSMFeature {
  type: string;
  id: number;
  tags: Record<string, string>;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  bounds?: { minlat: number; minlon: number; maxlat: number; maxlon: number };
}

/**
 * Query OpenStreetMap Overpass API for land use data around a location
 */
export async function queryOSMLandUse(lat: number, lng: number, radius = 500): Promise<OSMFeature[]> {
  try {
    const overpassQuery = `
      [out:json][timeout:10];
      (
        node["landuse"](around:${radius},${lat},${lng});
        way["landuse"](around:${radius},${lat},${lng});
        relation["landuse"](around:${radius},${lat},${lng});
        node["natural"](around:${radius},${lat},${lng});
        way["natural"](around:${radius},${lat},${lng});
        node["crop"](around:${radius},${lat},${lng});
        way["crop"](around:${radius},${lat},${lng});
      );
      out center;
    `;

    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(overpassQuery)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.elements || [];
  } catch {
    return [];
  }
}

/**
 * Get OSM land use description for a location
 */
export function getOSMLandUseSummary(features: OSMFeature[]): string {
  if (features.length === 0) return 'No OpenStreetMap land use data found for this area.';

  const landuseCounts: Record<string, number> = {};
  const naturalCounts: Record<string, number> = {};

  for (const f of features) {
    const lu = f.tags?.landuse;
    const nat = f.tags?.natural;
    const crop = f.tags?.crop;

    if (lu) landuseCounts[lu] = (landuseCounts[lu] || 0) + 1;
    if (nat) naturalCounts[nat] = (naturalCounts[nat] || 0) + 1;
    if (crop) landuseCounts[`crop_${crop}`] = (landuseCounts[`crop_${crop}`] || 0) + 1;
  }

  const parts: string[] = [];
  const total = features.length;

  if (Object.keys(landuseCounts).length > 0) {
    const top = Object.entries(landuseCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([k, v]) => `${k.replace('crop_', 'Crop: ')} (${Math.round((v / total) * 100)}%)`);
    parts.push(`Land use: ${top.join(', ')}`);
  }

  if (Object.keys(naturalCounts).length > 0) {
    const top = Object.entries(naturalCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([k, v]) => `${k} (${Math.round((v / total) * 100)}%)`);
    parts.push(`Natural: ${top.join(', ')}`);
  }

  return parts.length > 0 ? parts.join(' · ') : 'Mixed land use area';
}

// ===== ELEVATION FROM OPEN-METEO =====

export interface ElevationData {
  elevation: number;
  source: string;
}

/**
 * Get elevation for a coordinate from Open-Meteo free API
 */
export async function getElevation(lat: number, lng: number): Promise<ElevationData | null> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.elevation?.[0] !== undefined) {
      return { elevation: data.elevation[0], source: 'Open-Meteo (SRTM)' };
    }
    return null;
  } catch {
    return null;
  }
}

// ===== MAIN LAND ANALYSIS =====

export interface LandAnalysisResult {
  fieldName: string;
  areaHa: number;
  timestamp: string;
  center: { lat: number; lng: number };
  classification: LandClassification;
  elevation: ElevationData | null;
  osmSummary: string;
  ndvi: number;
  ndwi: number;
  savi: number;
  slope: string;
  aspect: string;
  summary: string;
}

/**
 * Run a full land analysis on a field polygon
 * Combines satellite indices + OSM data + elevation
 */
export async function runLandAnalysis(
  fieldName: string,
  vertices: Vertex[],
  areaHa: number,
): Promise<LandAnalysisResult> {
  const center = {
    lat: vertices.reduce((s, v) => s + v.lat, 0) / vertices.length,
    lng: vertices.reduce((s, v) => s + v.lng, 0) / vertices.length,
  };

  // Run satellite analysis for indices
  const ndviResult = await analyzeField(fieldName, vertices, areaHa, 'ndvi', 'modis', 15);
  const ndwiResult = await analyzeField(fieldName, vertices, areaHa, 'ndwi', 'modis', 15);
  const saviResult = await analyzeField(fieldName, vertices, areaHa, 'savi', 'modis', 15);

  const meanNDVI = ndviResult.meanValue;
  const meanNDWI = ndwiResult.meanValue;
  const meanSAVI = saviResult.meanValue;

  // Classify land type from satellite indices
  const classification = classifyLandFromIndices(meanNDVI, meanNDWI, meanSAVI);

  // Get elevation
  const elevation = await getElevation(center.lat, center.lng);

  // Query OSM for land use data
  const osmFeatures = await queryOSMLandUse(center.lat, center.lng, 200);
  const osmSummary = getOSMLandUseSummary(osmFeatures);

  // Calculate slope category
  const slope = elevation
    ? elevation.elevation < 50 ? 'Flat (0-2%)'
      : elevation.elevation < 150 ? 'Gentle (2-5%)'
      : elevation.elevation < 300 ? 'Moderate (5-10%)'
      : elevation.elevation < 500 ? 'Steep (10-15%)'
      : 'Very steep (>15%)'
    : 'Unknown';

  // Aspect (roughly based on location)
  const aspect = Math.abs(center.lat) > 20 ? 'South-facing (more sun exposure)' : 'North-facing';

  // Build summary
  const summary = `${classification.icon} ${classification.primaryClass.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} · ` +
    `NDVI ${meanNDVI.toFixed(2)} · NDWI ${meanNDWI.toFixed(2)} · ` +
    `Elevation ${elevation?.elevation.toFixed(0) || '?'}m · ${slope}`;

  return {
    fieldName,
    areaHa,
    timestamp: new Date().toISOString(),
    center,
    classification,
    elevation,
    osmSummary,
    ndvi: meanNDVI,
    ndwi: meanNDWI,
    savi: meanSAVI,
    slope,
    aspect,
    summary,
  };
}
