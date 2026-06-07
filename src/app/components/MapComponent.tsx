import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents, Marker, Popup, ZoomControl, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DrawingUI from './DrawFieldControl';
import NDVILayer from './NDVILayer';
import NDVILegend from './NDVILegend';
import NDWILayer from './NDWILayer';
import NDWILegend from './NDWILegend';
import SAVILayer from './SAVILayer';
import SAVILegend from './SAVILegend';
import WeatherOverlay from './WeatherOverlay';
import WeatherForecast from './WeatherForecast';
import LocationSearch from './LocationSearch';
import { POLYGON_COLORS } from '../../constants/map';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icon for selected location
const selectedIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="
    width: 24px; height: 24px; 
    background: #52B788; 
    border: 3px solid white; 
    border-radius: 50%; 
    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
  "></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Farm marker icon
const farmIcon = new L.DivIcon({
  className: 'farm-marker',
  html: `<div style="
    width: 16px; height: 16px; 
    background: #2D6A4F; 
    border: 2px solid #95D5B2; 
    border-radius: 50%;
    box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const DEFAULT_CENTER: [number, number] = [17.385, 78.4867];
const DEFAULT_ZOOM = 10;

interface Vertex {
  lat: number;
  lng: number;
}

interface FarmPolygon {
  id: string;
  name: string;
  vertices: Vertex[];
  color?: string;
}

interface MapComponentProps {
  onLocationSelect?: (lat: number, lng: number) => void;
  selectedLocation?: [number, number] | null;
  farms?: Array<{ id: string; name: string; center: [number, number] }>;
  farmPolygons?: FarmPolygon[];
  isDrawing?: boolean;
  onPolygonCreated?: (vertices: Vertex[]) => void;
  onDrawingCancel?: () => void;
  showNDVI?: boolean;
  onNDVIToggle?: () => void;
  showNDWI?: boolean;
  onNDWIToggle?: () => void;
  showSAVI?: boolean;
  onSAVIToggle?: () => void;
  showSearch?: boolean;
  onSearchToggle?: () => void;
  showWeather?: boolean;
  onWeatherToggle?: () => void;
  weatherLocation?: [number, number] | null;
  onCloseWeather?: () => void;
  className?: string;
}

function MapEvents({ onLocationSelect }: { onLocationSelect?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function LayerControl({
  activeLayer,
  onLayerChange,
  showNDVI,
  onNDVIToggle,
  showNDWI,
  onNDWIToggle,
  showSAVI,
  onSAVIToggle,
  showSearch,
  onSearchToggle,
  showWeather,
  onWeatherToggle,
}: {
  activeLayer: 'satellite' | 'street';
  onLayerChange: (layer: 'satellite' | 'street') => void;
  showNDVI?: boolean;
  onNDVIToggle?: () => void;
  showNDWI?: boolean;
  onNDWIToggle?: () => void;
  showSAVI?: boolean;
  onSAVIToggle?: () => void;
  showSearch?: boolean;
  onSearchToggle?: () => void;
  showWeather?: boolean;
  onWeatherToggle?: () => void;
}) {
  const layers = [
    { id: 'satellite' as const, icon: '🛰️', title: 'Satellite view' },
    { id: 'street' as const, icon: '🗺️', title: 'Street map' },
  ];

  return (
    <div style={{
      position: 'absolute',
      top: 70,
      right: 12,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    }}>
      {layers.map((layer) => (
        <button
          key={layer.id}
          onClick={() => onLayerChange(layer.id)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            border: `2px solid ${activeLayer === layer.id ? '#52B788' : '#1B4D2E'}`,
            background: activeLayer === layer.id ? '#1A3A2A' : '#0D2818',
            color: '#E8F5E9',
            cursor: 'pointer',
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            backdropFilter: 'blur(8px)',
          }}
          title={layer.title}
        >
          {layer.icon}
        </button>
      ))}

      {/* Search toggle */}
      <button
        onClick={onSearchToggle}
        title="Search location"
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          border: `2px solid ${showSearch ? '#52B788' : '#1B4D2E'}`,
          background: showSearch ? '#1A3A2A' : '#0D2818',
          color: '#E8F5E9',
          cursor: 'pointer',
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          backdropFilter: 'blur(8px)',
          marginTop: 4,
        }}
      >
        🔍
      </button>

      {/* NDVI toggle */}
      <button
        onClick={onNDVIToggle}
        title={`${showNDVI ? 'Hide' : 'Show'} NDVI overlay`}
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          border: `2px solid ${showNDVI ? '#66BB6A' : '#1B4D2E'}`,
          background: showNDVI ? 'rgba(102, 187, 106, 0.2)' : '#0D2818',
          color: '#E8F5E9',
          cursor: 'pointer',
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          backdropFilter: 'blur(8px)',
        }}
      >
        🌿
      </button>

      {/* NDWI toggle */}
      <button
        onClick={onNDWIToggle}
        title={`${showNDWI ? 'Hide' : 'Show'} Water Index`}
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          border: `2px solid ${showNDWI ? '#42A5F5' : '#1B4D2E'}`,
          background: showNDWI ? 'rgba(66, 165, 245, 0.2)' : '#0D2818',
          color: '#E8F5E9',
          cursor: 'pointer',
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          backdropFilter: 'blur(8px)',
        }}
      >
        💧
      </button>

      {/* SAVI toggle */}
      <button
        onClick={onSAVIToggle}
        title={`${showSAVI ? 'Hide' : 'Show'} SAVI overlay`}
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          border: `2px solid ${showSAVI ? '#FFA726' : '#1B4D2E'}`,
          background: showSAVI ? 'rgba(255, 167, 38, 0.2)' : '#0D2818',
          color: '#E8F5E9',
          cursor: 'pointer',
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          backdropFilter: 'blur(8px)',
        }}
      >
        🪨
      </button>

      {/* Weather toggle */}
      <button
        onClick={onWeatherToggle}
        title={`${showWeather ? 'Hide' : 'Show'} Weather`}
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          border: `2px solid ${showWeather ? '#FFD54F' : '#1B4D2E'}`,
          background: showWeather ? 'rgba(255, 213, 79, 0.2)' : '#0D2818',
          color: '#E8F5E9',
          cursor: 'pointer',
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          backdropFilter: 'blur(8px)',
          marginTop: 4,
        }}
      >
        🌤️
      </button>
    </div>
  );
}

function MyLocationButton() {
  const map = useMap();
  const [isLocating, setIsLocating] = useState(false);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.flyTo([pos.coords.latitude, pos.coords.longitude], 15, { duration: 1.5 });
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [map]);

  return (
    <button
      onClick={handleLocate}
      disabled={isLocating}
      style={{
        position: 'absolute',
        bottom: 24,
        right: 12,
        zIndex: 1000,
        width: 40,
        height: 40,
        borderRadius: 8,
        border: '2px solid #1B4D2E',
        background: '#0D2818',
        color: '#E8F5E9',
        cursor: 'pointer',
        fontSize: 18,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isLocating ? 0.6 : 1,
        backdropFilter: 'blur(8px)',
        transition: 'all 0.2s',
      }}
      title="My Location"
    >
      {isLocating ? (
        <div style={{
          width: 16, height: 16,
          border: '2px solid #52B788',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="3" fill="#52B788" stroke="#52B788" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
      )}
    </button>
  );
}

function InitialZoom() {
  const map = useMap();
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => map.setView([pos.coords.latitude, pos.coords.longitude], 14),
        () => map.setView(DEFAULT_CENTER, DEFAULT_ZOOM),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, [map]);
  return null;
}

export default function MapComponent({
  onLocationSelect,
  selectedLocation,
  farms = [],
  farmPolygons = [],
  isDrawing = false,
  onPolygonCreated,
  onDrawingCancel,
  showNDVI = false,
  onNDVIToggle,
  showNDWI = false,
  onNDWIToggle,
  showSAVI = false,
  onSAVIToggle,
  showSearch = false,
  onSearchToggle,
  showWeather = false,
  onWeatherToggle,
  weatherLocation = null,
  onCloseWeather,
  className = '',
}: MapComponentProps) {
  const [activeLayer, setActiveLayer] = useState<'satellite' | 'street'>('satellite');
  const [searchVisible, setSearchVisible] = useState(false);

  const handlePolygonComplete = useCallback((vertices: Vertex[]) => {
    onPolygonCreated?.(vertices);
  }, [onPolygonCreated]);

  const handleSearchToggle = useCallback(() => {
    const next = !searchVisible;
    setSearchVisible(next);
    onSearchToggle?.();
  }, [searchVisible, onSearchToggle]);

  const activeAnalysisCount = [showNDVI, showNDWI, showSAVI].filter(Boolean).length;

  return (
    <div className={`relative h-full w-full ${className}`}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .leaflet-container { background: #0A1F0A !important; }
        .leaflet-control-zoom a {
          background: #0D2818 !important;
          color: #E8F5E9 !important;
          border-color: #1B4D2E !important;
        }
        .leaflet-control-zoom a:hover { background: #1A3A2A !important; }
        .leaflet-popup-content-wrapper {
          background: #132A1A !important;
          color: #E8F5E9 !important;
          border: 1px solid #1B4D2E !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4) !important;
        }
        .leaflet-popup-tip { background: #132A1A !important; border: 1px solid #1B4D2E !important; }
        .leaflet-popup-close-button { color: #6B8E6B !important; }
      `}</style>

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        zoomControl={false}
        attributionControl={true}
        doubleClickZoom={!isDrawing}
      >
        <ZoomControl position="bottomright" />

        {activeLayer === 'satellite' ? (
          <TileLayer
            key="esri-satellite"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="&copy; Esri, Maxar, Earthstar Geographics"
            maxZoom={20}
          />
        ) : (
          <TileLayer
            key="osm-street"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
            maxZoom={19}
          />
        )}

        {activeLayer === 'satellite' && (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution=""
            opacity={0.12}
            maxZoom={19}
          />
        )}

        {!isDrawing && <MapEvents onLocationSelect={onLocationSelect} />}
        <DrawingUI
          isActive={isDrawing}
          onPolygonComplete={handlePolygonComplete}
          onCancel={() => onDrawingCancel?.()}
        />

        {/* Analysis overlays */}
        {showNDVI && <NDVILayer />}
        {showNDWI && <NDWILayer />}
        {showSAVI && <SAVILayer />}

        {/* Location search */}
        {searchVisible && <LocationSearch />}

        {/* Weather overlay */}
        {showWeather && <WeatherOverlay />}

        {!isDrawing && <InitialZoom />}
        <MyLocationButton />

        {selectedLocation && !isDrawing && (
          <Marker position={selectedLocation} icon={selectedIcon}>
            <Popup>
              <div style={{ fontSize: 12, lineHeight: 1.6 }}>
                <strong style={{ color: '#52B788' }}>Selected Location</strong><br />
                Lat: <span style={{ color: '#A5D6A7' }}>{selectedLocation[0].toFixed(6)}</span><br />
                Lng: <span style={{ color: '#A5D6A7' }}>{selectedLocation[1].toFixed(6)}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {farms.map((farm) => (
          <Marker key={farm.id} position={farm.center} icon={farmIcon}>
            <Popup>
              <div style={{ fontSize: 12, lineHeight: 1.6 }}>
                <strong style={{ color: '#95D5B2' }}>{farm.name}</strong>
              </div>
            </Popup>
          </Marker>
        ))}

        {farmPolygons.map((poly, idx) => (
          <Polygon
            key={poly.id}
            positions={poly.vertices.map(v => [v.lat, v.lng] as [number, number])}
            pathOptions={{
              color: poly.color || POLYGON_COLORS[idx % POLYGON_COLORS.length],
              fillColor: poly.color || POLYGON_COLORS[idx % POLYGON_COLORS.length],
              fillOpacity: 0.12,
              weight: 2,
            }}
          >
            <Popup>
              <div style={{ fontSize: 12, lineHeight: 1.6 }}>
                <strong style={{ color: '#95D5B2' }}>{poly.name}</strong>
              </div>
            </Popup>
          </Polygon>
        ))}
      </MapContainer>

      {/* Floating legends */}
      {showNDVI && <NDVILegend />}
      {showNDWI && <NDWILegend />}
      {showSAVI && <SAVILegend />}

      {/* Weather Forecast Panel */}
      {weatherLocation && (
        <WeatherForecast
          key={`${weatherLocation[0]}-${weatherLocation[1]}`}
          lat={weatherLocation[0]}
          lng={weatherLocation[1]}
          onClose={() => onCloseWeather?.()}
        />
      )}

      {/* Analysis indicator badge */}
      {activeAnalysisCount > 0 && (
        <div style={{
          position: 'absolute',
          bottom: 24,
          left: 12,
          zIndex: 1000,
          background: 'rgba(10, 31, 10, 0.9)',
          border: '1px solid #1B4D2E',
          borderRadius: 8,
          padding: '4px 10px',
          fontSize: 10,
          color: '#52B788',
          backdropFilter: 'blur(8px)',
        }}>
          {activeAnalysisCount} analysis overlay{activeAnalysisCount > 1 ? 's' : ''} active
        </div>
      )}

      <LayerControl
        activeLayer={activeLayer}
        onLayerChange={setActiveLayer}
        showNDVI={showNDVI}
        onNDVIToggle={() => onNDVIToggle?.()}
        showNDWI={showNDWI}
        onNDWIToggle={() => onNDWIToggle?.()}
        showSAVI={showSAVI}
        onSAVIToggle={() => onSAVIToggle?.()}
        showSearch={searchVisible}
        onSearchToggle={handleSearchToggle}
        showWeather={showWeather}
        onWeatherToggle={() => onWeatherToggle?.()}
      />
    </div>
  );
}
