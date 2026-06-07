import { TileLayer } from 'react-leaflet';
import { isSentinelConfigured, getWMTSLayerUrl, SENTINEL_LAYERS, SentinelLayerInfo } from '../../services/sentinelHub';

interface SentinelTileLayerProps {
  activeLayer?: string;
  opacity?: number;
}

export default function SentinelTileLayerComponent({ activeLayer = 'TRUE_COLOR', opacity = 1 }: SentinelTileLayerProps) {
  if (!isSentinelConfigured()) return null;

  const wmtsUrl = getWMTSLayerUrl(activeLayer);
  if (!wmtsUrl) return null;

  return (
    <TileLayer
      key={`sentinel-${activeLayer}`}
      url={wmtsUrl}
      attribution="&copy; <a href='https://dataspace.copernicus.eu/'>Copernicus Data Space</a> &amp; Sentinel Hub"
      maxZoom={18}
      opacity={opacity}
    />
  );
}

/** Sentinel-2 layer selector (use in map controls) */
export function SentinelLayerSelector({
  selectedLayer,
  onChange,
}: {
  selectedLayer: string;
  onChange: (layerId: string) => void;
}) {
  if (!isSentinelConfigured()) return null;

  return (
    <div className="absolute top-[380px] right-3 z-[1000] flex flex-col gap-1">
      {SENTINEL_LAYERS.map((layer) => (
        <button
          key={layer.id}
          onClick={() => onChange(layer.id)}
          className={`w-9 h-9 rounded-lg border flex items-center justify-center text-xs transition-all shadow-sm backdrop-blur-sm ${
            selectedLayer === layer.id
              ? 'bg-white border-[#2563EB] shadow-blue-500/10'
              : 'bg-white border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]'
          }`}
          title={`${layer.name} (${layer.resolution})`}
        >
          {layer.icon}
        </button>
      ))}
    </div>
  );
}
