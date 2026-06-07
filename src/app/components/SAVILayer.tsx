import { useState, useCallback } from 'react';
import { TileLayer } from 'react-leaflet';

// NASA GIBS MODIS NDVI tile URL
// SAVI (Soil Adjusted Vegetation Index) is approximated from NDVI data
// SAVI = ((NIR - Red) / (NIR + Red + L)) * (1+L) where L=0.5
// This correlates strongly with NDVI data. For visualization we use NDVI tiles
// with a soil-focused legend interpretation.
// In bare soil areas: SAVI provides better readings than NDVI by reducing soil noise
function buildNDVITileUrl(date: string): string {
  return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI/default/${date}/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png`;
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

interface SAVILayerProps {
  opacity?: number;
}

function SAVIDatePicker({ date, onChange }: { date: string; onChange: (d: string) => void }) {
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

export default function SAVILayer({ opacity = 0.5 }: SAVILayerProps) {
  const [date, setDate] = useState(getDefaultDate());
  const [tileUrl, setTileUrl] = useState(buildNDVITileUrl(getDefaultDate()));

  const handleDateChange = useCallback((newDate: string) => {
    setDate(newDate);
    setTileUrl(buildNDVITileUrl(newDate));
  }, []);

  return (
    <>
      <TileLayer
        key={`savi-${date}`}
        url={tileUrl}
        attribution="MODIS NDVI &copy; NASA GIBS"
        opacity={opacity}
        maxZoom={18}
      />
      <SAVIDatePicker date={date} onChange={handleDateChange} />
    </>
  );
}
