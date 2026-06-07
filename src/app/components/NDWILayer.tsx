import { useState, useCallback } from 'react';
import { TileLayer } from 'react-leaflet';

// ============================================================
// NDWI Layer — Dual Mode
// ============================================================
// Mode 1 (FREE): NASA GIBS MODIS NDVI tiles — 250m resolution
//   → Water appears as dark/low-NDVI areas
//   → No API key needed
//
// Mode 2 (OPTIONAL): Sentinel Hub WMTS with computed NDWI evalscript
//   → Sentinel-2 L2A, 10m resolution (much sharper!)
//   → Set VITE_SENTINEL_INSTANCE_ID and VITE_SENTINEL_LAYER_NAME in .env
//   → Free via Copernicus Data Space OR paid via Planet/Sentinel Hub
// ============================================================

const INSTANCE_ID = import.meta.env.VITE_SENTINEL_INSTANCE_ID || '';
const LAYER_NAME = import.meta.env.VITE_SENTINEL_NDWI_LAYER || 'NDWI';
const USE_SENTINEL = !!(INSTANCE_ID && LAYER_NAME);

// --- NASA GIBS (free fallback) ---
function buildNASATileUrl(date: string): string {
  return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI/default/${date}/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png`;
}

// --- Sentinel Hub WMTS (high-res, when configured) ---
function buildSentinelTileUrl(date: string): string {
  // Format: YYYY-MM-DDT00:00:00Z/YYYY-MM-DDT23:59:59Z
  const timeRange = `${date}T00:00:00Z/${date}T23:59:59Z`;
  return `https://services.sentinel-hub.com/ogc/wmts/${INSTANCE_ID}?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${LAYER_NAME}&TILEMATRIXSET=PopularWebMercator&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png&TIME=${timeRange}`;
}

// --- Shared date utilities ---
function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getDefaultDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return formatDate(d);
}

// --- Date Picker Component ---
function DatePicker({ date, onChange }: { date: string; onChange: (d: string) => void }) {
  return (
    <div style={{
      position: 'absolute',
      top: 115,
      right: 12,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      background: 'rgba(10, 31, 10, 0.9)',
      border: '1px solid #1B4D2E',
      borderRadius: 8,
      padding: '4px 8px',
      backdropFilter: 'blur(8px)',
    }}>
      <input
        type="date"
        value={date}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#E8F5E9',
          fontSize: 11,
          fontFamily: 'monospace',
          outline: 'none',
          width: 110,
          colorScheme: 'dark',
        }}
      />
      <span style={{
        fontSize: 8,
        color: USE_SENTINEL ? '#42A5F5' : '#6B8E6B',
        padding: '2px 4px',
        borderRadius: 3,
        background: USE_SENTINEL ? 'rgba(66,165,245,0.15)' : 'transparent',
      }}>
        {USE_SENTINEL ? '10m' : '250m'}
      </span>
    </div>
  );
}

export default function NDWILayer({ opacity = 0.5 }: { opacity?: number }) {
  const [date, setDate] = useState(getDefaultDate());
  const [tileUrl, setTileUrl] = useState(
    USE_SENTINEL ? buildSentinelTileUrl(getDefaultDate()) : buildNASATileUrl(getDefaultDate())
  );

  const handleDateChange = useCallback((newDate: string) => {
    setDate(newDate);
    setTileUrl(
      USE_SENTINEL ? buildSentinelTileUrl(newDate) : buildNASATileUrl(newDate)
    );
  }, []);

  return (
    <>
      <TileLayer
        key={`ndwi-${date}-${USE_SENTINEL ? 'sentinel' : 'nasa'}`}
        url={tileUrl}
        attribution={USE_SENTINEL
          ? `&copy; Sentinel-2 via <a href='https://www.sentinel-hub.com/'>Sentinel Hub</a>`
          : "MODIS NDVI &copy; NASA GIBS"
        }
        opacity={opacity}
        maxZoom={USE_SENTINEL ? 18 : 18}
      />
      <DatePicker date={date} onChange={handleDateChange} />
    </>
  );
}
