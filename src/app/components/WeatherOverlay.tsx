import { useState } from 'react';
import { TileLayer } from 'react-leaflet';

// OpenWeatherMap tile layers for weather visualization
// Free with valid API key — 1,000 calls/day on free tier
const OWM_BASE = 'https://tile.openweathermap.org/map';
const API_KEY = import.meta.env.VITE_OWM_API_KEY || '';

// Weather layers available
type WeatherLayer = 'precipitation_new' | 'temp_new' | 'clouds_new' | 'wind_new';

const LAYER_LABELS: Record<WeatherLayer, string> = {
  'precipitation_new': 'Rain',
  'temp_new': 'Temperature',
  'clouds_new': 'Clouds',
  'wind_new': 'Wind',
};

const LAYER_COLORS: Record<WeatherLayer, string> = {
  'precipitation_new': '#42A5F5',
  'temp_new': '#FF7043',
  'clouds_new': '#BDBDBD',
  'wind_new': '#66BB6A',
};

interface WeatherOverlayProps {
  opacity?: number;
}

function WeatherLayerToggle({
  activeLayer,
  onChange,
}: {
  activeLayer: WeatherLayer;
  onChange: (layer: WeatherLayer) => void;
}) {
  const layers: WeatherLayer[] = ['precipitation_new', 'temp_new', 'clouds_new', 'wind_new'];

  return (
    <div style={{
      position: 'absolute',
      top: 160,
      right: 12,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
    }}>
      {layers.map((layer) => (
        <button
          key={layer}
          onClick={() => onChange(layer)}
          style={{
            width: 40,
            height: 28,
            borderRadius: 6,
            border: `1.5px solid ${activeLayer === layer ? LAYER_COLORS[layer] : '#1B4D2E'}`,
            background: activeLayer === layer ? `${LAYER_COLORS[layer]}22` : '#0D2818',
            color: '#E8F5E9',
            cursor: 'pointer',
            fontSize: 9,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            backdropFilter: 'blur(8px)',
            fontWeight: activeLayer === layer ? 700 : 400,
          }}
          title={LAYER_LABELS[layer]}
        >
          {layer === 'precipitation_new' ? '🌧' :
           layer === 'temp_new' ? '🌡' :
           layer === 'clouds_new' ? '☁️' : '💨'}
        </button>
      ))}
    </div>
  );
}

export default function WeatherOverlay({ opacity = 0.5 }: WeatherOverlayProps) {
  const [activeLayer, setActiveLayer] = useState<WeatherLayer>('precipitation_new');
  const hasKey = !!API_KEY;

  const tileUrl = hasKey
    ? `${OWM_BASE}/${activeLayer}/{z}/{y}/{x}.png?appid=${API_KEY}`
    : null;

  return (
    <>
      {tileUrl && (
        <TileLayer
          key={`weather-${activeLayer}`}
          url={tileUrl}
          attribution="&copy; <a href='https://openweathermap.org'>OpenWeatherMap</a>"
          opacity={opacity}
          maxZoom={18}
        />
      )}
      {!hasKey && (
        <div style={{
          position: 'absolute',
          top: 170,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'rgba(239,83,80,0.9)',
          color: 'white',
          padding: '6px 14px',
          borderRadius: 8,
          fontSize: 11,
          fontWeight: 500,
          backdropFilter: 'blur(8px)',
          whiteSpace: 'nowrap',
        }}>
          ⚠️ Set VITE_OWM_API_KEY in .env for weather tiles
        </div>
      )}
      <WeatherLayerToggle activeLayer={activeLayer} onChange={setActiveLayer} />
    </>
  );
}
