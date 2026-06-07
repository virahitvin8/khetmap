import { useState } from 'react';
import { TileLayer } from 'react-leaflet';

const OWM_BASE = 'https://tile.openweathermap.org/map';
const API_KEY = import.meta.env.VITE_OWM_API_KEY || '';
type WeatherLayer = 'precipitation_new' | 'temp_new' | 'clouds_new' | 'wind_new';

const LAYER_LABELS: Record<WeatherLayer, string> = {
  'precipitation_new': 'Rain',
  'temp_new': 'Temperature',
  'clouds_new': 'Clouds',
  'wind_new': 'Wind',
};

const LAYER_COLORS: Record<WeatherLayer, string> = {
  'precipitation_new': '#3B82F6',
  'temp_new': '#F97316',
  'clouds_new': '#94A3B8',
  'wind_new': '#22C55E',
};

interface WeatherOverlayProps { opacity?: number; }

function WeatherLayerToggle({ activeLayer, onChange }: { activeLayer: WeatherLayer; onChange: (layer: WeatherLayer) => void }) {
  const layers: WeatherLayer[] = ['precipitation_new', 'temp_new', 'clouds_new', 'wind_new'];
  return (
    <div className="absolute top-[170px] right-3 z-[1000] flex flex-col gap-1">
      {layers.map((layer) => (
        <button key={layer} onClick={() => onChange(layer)}
          className={`w-9 h-7 rounded-md border flex items-center justify-center text-xs transition-all backdrop-blur-sm ${
            activeLayer === layer
              ? 'bg-white border-[#2563EB] shadow-sm'
              : 'bg-white border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]'
          }`}
          style={activeLayer === layer ? { borderColor: LAYER_COLORS[layer], boxShadow: `0 0 0 1px ${LAYER_COLORS[layer]}20` } : undefined}
          title={LAYER_LABELS[layer]}>
          {layer === 'precipitation_new' ? '🌧' : layer === 'temp_new' ? '🌡' : layer === 'clouds_new' ? '☁️' : '💨'}
        </button>
      ))}
    </div>
  );
}

export default function WeatherOverlay({ opacity = 0.5 }: WeatherOverlayProps) {
  const [activeLayer, setActiveLayer] = useState<WeatherLayer>('precipitation_new');
  const hasKey = !!API_KEY;
  const tileUrl = hasKey ? `${OWM_BASE}/${activeLayer}/{z}/{y}/{x}.png?appid=${API_KEY}` : null;

  return (
    <>
      {tileUrl && <TileLayer key={`weather-${activeLayer}`} url={tileUrl} attribution="&copy; <a href='https://openweathermap.org'>OpenWeatherMap</a>" opacity={opacity} maxZoom={18} />}
      {!hasKey && (
        <div className="absolute top-[175px] left-1/2 -translate-x-1/2 z-[1000] bg-[#FEF2F2] text-[#EF4444] px-3 py-1.5 rounded-lg text-[10px] font-medium backdrop-blur-sm whitespace-nowrap border border-[#FECACA] shadow-sm">
          ⚠️ Set VITE_OWM_API_KEY in .env for weather tiles
        </div>
      )}
      <WeatherLayerToggle activeLayer={activeLayer} onChange={setActiveLayer} />
    </>
  );
}
