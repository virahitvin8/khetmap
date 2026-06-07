import { useState, useCallback } from 'react';
import { TileLayer } from 'react-leaflet';

// ============================================================
// NDVI Layer — Dual Mode
// ============================================================
// Mode 1 (FREE): NASA GIBS MODIS NDVI — 250m resolution, no API key
// Mode 2 (OPTIONAL): Sentinel Hub — 10m resolution when configured
// ============================================================

const INSTANCE_ID = import.meta.env.VITE_SENTINEL_INSTANCE_ID || '';
const LAYER_NAME = import.meta.env.VITE_SENTINEL_NDVI_LAYER || '';
const USE_SENTINEL = !!(INSTANCE_ID && LAYER_NAME);

function buildNASATileUrl(date: string): string {
  return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI/default/${date}/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png`;
}

function buildSentinelTileUrl(date: string): string {
  const timeRange = `${date}T00:00:00Z/${date}T23:59:59Z`;
  return `https://services.sentinel-hub.com/ogc/wmts/${INSTANCE_ID}?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${LAYER_NAME}&TILEMATRIXSET=PopularWebMercator&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png&TIME=${timeRange}`;
}

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

interface NDVILayerProps {
  opacity?: number;
}

function NDVIDatePicker({ date, onChange }: { date: string; onChange: (d: string) => void }) {
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
        color: USE_SENTINEL ? '#66BB6A' : '#6B8E6B',
        padding: '2px 4px',
        borderRadius: 3,
        background: USE_SENTINEL ? 'rgba(102,187,106,0.15)' : 'transparent',
      }}>
        {USE_SENTINEL ? '10m' : '250m'}
      </span>
    </div>
  );
}

export default function NDVILayer({ opacity = 0.55 }: NDVILayerProps) {
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
        key={`ndvi-${date}-${USE_SENTINEL ? 'sentinel' : 'nasa'}`}
        url={tileUrl}
        attribution={USE_SENTINEL
          ? `&copy; Sentinel-2 via <a href='https://www.sentinel-hub.com/'>Sentinel Hub</a>`
          : "MODIS NDVI &copy; NASA GIBS"
        }
        opacity={opacity}
        maxZoom={18}
      />
      <NDVIDatePicker date={date} onChange={handleDateChange} />
    </>
  );
}
