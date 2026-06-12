import { useState, useCallback } from 'react';
import { TileLayer } from 'react-leaflet';

// NASA GIBS MODIS Terra NDVI tile URL
// Uses `best` TileMatrixSet which auto-selects the appropriate resolution
function buildNDVITileUrl(date: string): string {
  return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI/default/${date}/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png`;
}

// Format a Date object as YYYY-MM-DD
function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Get a reasonable recent date (MODIS data has ~2-5 day latency)
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
    </div>
  );
}

export default function NDVILayer({ opacity = 0.55 }: NDVILayerProps) {
  const [date, setDate] = useState(getDefaultDate());
  const [tileUrl, setTileUrl] = useState(buildNDVITileUrl(getDefaultDate()));

  const handleDateChange = useCallback((newDate: string) => {
    setDate(newDate);
    setTileUrl(buildNDVITileUrl(newDate));
  }, []);

  return (
    <>
      <TileLayer
        key={`ndvi-${date}`}
        url={tileUrl}
        attribution="MODIS NDVI &copy; NASA GIBS"
        opacity={opacity}
        maxZoom={18}
      />
      <NDVIDatePicker date={date} onChange={handleDateChange} />
    </>
  );
}
