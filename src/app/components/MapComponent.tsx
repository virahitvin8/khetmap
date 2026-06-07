import { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents, Marker, Popup, ZoomControl, Polygon, Polyline } from 'react-leaflet';
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

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const selectedIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="width:20px;height:20px;background:#2563EB;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const farmIcon = new L.DivIcon({
  className: 'farm-marker',
  html: `<div style="width:14px;height:14px;background:#3B82F6;border:2px solid #93C5FD;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.2);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
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
  isMeasuring?: boolean;
  onMeasurementComplete?: (vertices: Vertex[]) => void;
  onMeasureCancel?: () => void;
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

function MeasureControl({
  isActive,
  onComplete,
  onCancel,
}: {
  isActive: boolean;
  onComplete: (vertices: Vertex[]) => void;
  onCancel: () => void;
}) {
  const map = useMap();
  const verticesRef = useRef<Vertex[]>([]);
  const [vertices, setVertices] = useState<Vertex[]>([]);
  const [line, setLine] = useState<L.Polyline | null>(null);
  const [markers, setMarkers] = useState<L.Marker[]>([]);
  const [polygon, setPolygon] = useState<L.Polygon | null>(null);

  const clearAll = useCallback(() => {
    markers.forEach(m => m.remove());
    line?.remove();
    polygon?.remove();
    setMarkers([]);
    setLine(null);
    setPolygon(null);
    setVertices([]);
    verticesRef.current = [];
  }, [markers, line, polygon]);

  useEffect(() => {
    if (!isActive) {
      clearAll();
    }
  }, [isActive]);

  const addVertex = useCallback((latlng: L.LatLng) => {
    const newV = { lat: latlng.lat, lng: latlng.lng };
    const newVertices = [...verticesRef.current, newV];
    verticesRef.current = newVertices;
    setVertices(newVertices);

    const marker = L.marker([latlng.lat, latlng.lng], {
      icon: new L.DivIcon({
        className: 'measure-vertex',
        html: `<div style="width:8px;height:8px;background:#2563EB;border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [8, 8],
        iconAnchor: [4, 4],
      }),
    }).addTo(map);

    setMarkers(prev => [...prev, marker]);

    if (newVertices.length >= 2) {
      line?.remove();
      const latlngs = newVertices.map(v => [v.lat, v.lng] as [number, number]);
      const l = L.polyline(latlngs, {
        color: '#2563EB',
        weight: 2,
        opacity: 0.7,
        dashArray: '6, 3',
      }).addTo(map);
      setLine(l);
    }

    if (newVertices.length >= 3) {
      polygon?.remove();
      const latlngs = newVertices.map(v => [v.lat, v.lng] as [number, number]);
      const p = L.polygon(latlngs, {
        color: '#2563EB',
        weight: 1.5,
        fillColor: '#2563EB',
        fillOpacity: 0.08,
      }).addTo(map);
      setPolygon(p);
    }
  }, [map, line, polygon]);

  useMapEvents({
    click(e) {
      if (!isActive) return;
      addVertex(e.latlng);
    },
    dblclick(e) {
      if (!isActive) return;
      e.originalEvent.preventDefault();
      if (verticesRef.current.length >= 3) {
        clearAll();
        onComplete(verticesRef.current);
      }
    },
    mousemove(e) {
      if (!isActive || vertices.length === 0) return;
      const allPoints = [...vertices.map(v => [v.lat, v.lng] as [number, number]), [e.latlng.lat, e.latlng.lng]];
      line?.setLatLngs(allPoints);
    },
  });

  if (!isActive) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
      <div className="bg-white rounded-lg px-4 py-2.5 border border-[#E2E8F0] shadow-lg flex items-center gap-3">
        <span className="text-xs text-[#64748B]">
          {vertices.length === 0
            ? '📏 Click to measure'
            : `📍 ${vertices.length} points — double-click to close`}
        </span>
        {vertices.length >= 3 && (
          <span className="text-xs font-semibold text-[#2563EB]">
            {calculateMeasureArea(vertices)}
          </span>
        )}
        <button
          onClick={() => { clearAll(); onCancel(); }}
          className="text-xs text-[#EF4444] hover:text-[#DC2626] font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function calculateMeasureArea(vertices: Vertex[]): string {
  if (vertices.length < 3) return '';
  const ha = calculateAreaValue(vertices);
  if (ha < 0.001) return `${(ha * 10000).toFixed(1)} m²`;
  if (ha < 1) return `${(ha * 100).toFixed(2)} cent`;
  return `${ha.toFixed(4)} ha`;
}

function calculateAreaValue(vertices: Vertex[]): number {
  if (vertices.length < 3) return 0;
  const rad = vertices.map(v => ({
    lat: v.lat * Math.PI / 180,
    lng: v.lng * Math.PI / 180,
  }));
  const R = 6371000;
  let area = 0;
  for (let i = 0; i < rad.length; i++) {
    const j = (i + 1) % rad.length;
    area += rad[i].lng * rad[j].lat - rad[j].lng * rad[i].lat;
  }
  return Math.abs(area) * R * R / 2 / 10000;
}

function LayerControl({
  activeLayer,
  onLayerChange,
  showNDVI, onNDVIToggle,
  showNDWI, onNDWIToggle,
  showSAVI, onSAVIToggle,
  showSearch, onSearchToggle,
  showWeather, onWeatherToggle,
}: {
  activeLayer: 'satellite' | 'street';
  onLayerChange: (layer: 'satellite' | 'street') => void;
  showNDVI?: boolean; onNDVIToggle?: () => void;
  showNDWI?: boolean; onNDWIToggle?: () => void;
  showSAVI?: boolean; onSAVIToggle?: () => void;
  showSearch?: boolean; onSearchToggle?: () => void;
  showWeather?: boolean; onWeatherToggle?: () => void;
}) {
  return (
    <div className="absolute top-4 right-3 z-[1000] flex flex-col gap-1.5">
      {[
        { id: 'satellite' as const, icon: '🛰️', active: activeLayer === 'satellite' },
        { id: 'street' as const, icon: '🗺️', active: activeLayer === 'street' },
      ].map(layer => (
        <button key={layer.id} onClick={() => onLayerChange(layer.id)}
          className={`w-9 h-9 rounded-lg border flex items-center justify-center text-sm transition-all shadow-sm backdrop-blur-sm ${
            layer.active
              ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-blue-500/20'
              : 'bg-white border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]'
          }`}>
          {layer.icon}
        </button>
      ))}
      <div className="h-px bg-[#E2E8F0] my-0.5" />
      <MapToggleBtn icon="🔍" active={showSearch} onClick={onSearchToggle} />
      <MapToggleBtn icon="🌿" active={showNDVI} onClick={onNDVIToggle} color="#22C55E" />
      <MapToggleBtn icon="💧" active={showNDWI} onClick={onNDWIToggle} color="#3B82F6" />
      <MapToggleBtn icon="🪨" active={showSAVI} onClick={onSAVIToggle} color="#F59E0B" />
      <MapToggleBtn icon="🌤️" active={showWeather} onClick={onWeatherToggle} color="#EAB308" />
    </div>
  );
}

function MapToggleBtn({ icon, active, onClick, color }: { icon: string; active?: boolean; onClick?: () => void; color?: string }) {
  return (
    <button onClick={onClick}
      className={`w-9 h-9 rounded-lg border flex items-center justify-center text-sm transition-all shadow-sm backdrop-blur-sm ${
        active
          ? 'bg-white border-[#2563EB] shadow-blue-500/10'
          : 'bg-white border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]'
      }`}
      style={active && color ? { borderColor: color, boxShadow: `0 0 0 1px ${color}20` } : undefined}>
      {icon}
    </button>
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
        map.flyTo([pos.coords.latitude, pos.coords.longitude], 16, { duration: 1.5 });
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [map]);

  return (
    <button onClick={handleLocate} disabled={isLocating}
      className="absolute bottom-6 right-3 z-[1000] w-9 h-9 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center shadow-sm hover:bg-[#F8FAFC] transition-all disabled:opacity-50"
      title="My Location">
      {isLocating ? (
        <div className="w-4 h-4 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5">
          <circle cx="12" cy="12" r="3" fill="#2563EB" />
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
  onLocationSelect, selectedLocation, farms = [], farmPolygons = [],
  isDrawing = false, onPolygonCreated, onDrawingCancel,
  isMeasuring = false, onMeasurementComplete, onMeasureCancel,
  showNDVI = false, onNDVIToggle, showNDWI = false, onNDWIToggle,
  showSAVI = false, onSAVIToggle, showSearch = false, onSearchToggle,
  showWeather = false, onWeatherToggle, weatherLocation = null, onCloseWeather, className = '',
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
        .leaflet-container { background: #F1F5F9 !important; }
        .leaflet-control-zoom a {
          background: white !important;
          color: #475569 !important;
          border-color: #E2E8F0 !important;
        }
        .leaflet-control-zoom a:hover { background: #F8FAFC !important; }
        .leaflet-popup-content-wrapper {
          background: white !important;
          color: #1E293B !important;
          border: 1px solid #E2E8F0 !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08) !important;
        }
        .leaflet-popup-tip { background: white !important; border: 1px solid #E2E8F0 !important; }
        .leaflet-popup-close-button { color: #94A3B8 !important; }
      `}</style>

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        zoomControl={false}
        attributionControl={true}
        doubleClickZoom={!isDrawing && !isMeasuring}
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
            opacity={0.10}
            maxZoom={19}
          />
        )}

        {!isDrawing && !isMeasuring && <MapEvents onLocationSelect={onLocationSelect} />}

        <DrawingUI
          isActive={isDrawing}
          onPolygonComplete={handlePolygonComplete}
          onCancel={() => onDrawingCancel?.()}
        />

        <MeasureControl
          isActive={isMeasuring}
          onComplete={(v) => onMeasurementComplete?.(v)}
          onCancel={() => onMeasureCancel?.()}
        />

        {showNDVI && <NDVILayer />}
        {showNDWI && <NDWILayer />}
        {showSAVI && <SAVILayer />}

        {searchVisible && <LocationSearch />}
        {showWeather && <WeatherOverlay />}

        {!isDrawing && !isMeasuring && <InitialZoom />}
        <MyLocationButton />

        {selectedLocation && !isDrawing && !isMeasuring && (
          <Marker position={selectedLocation} icon={selectedIcon}>
            <Popup>
              <div className="text-xs leading-relaxed">
                <strong className="text-[#2563EB]">Selected Location</strong><br />
                Lat: <span className="text-[#475569]">{selectedLocation[0].toFixed(6)}</span><br />
                Lng: <span className="text-[#475569]">{selectedLocation[1].toFixed(6)}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {farms.map((farm) => (
          <Marker key={farm.id} position={farm.center} icon={farmIcon}>
            <Popup>
              <div className="text-xs">
                <strong className="text-[#2563EB]">{farm.name}</strong>
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
              <div className="text-xs">
                <strong className="text-[#2563EB]">{poly.name}</strong>
              </div>
            </Popup>
          </Polygon>
        ))}
      </MapContainer>

      {showNDVI && <NDVILegend />}
      {showNDWI && <NDWILegend />}
      {showSAVI && <SAVILegend />}

      {weatherLocation && (
        <WeatherForecast
          key={`${weatherLocation[0]}-${weatherLocation[1]}`}
          lat={weatherLocation[0]}
          lng={weatherLocation[1]}
          onClose={() => onCloseWeather?.()}
        />
      )}

      {activeAnalysisCount > 0 && !isDrawing && !isMeasuring && (
        <div className="absolute bottom-6 left-3 z-[1000] bg-white/90 border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-[10px] text-[#64748B] backdrop-blur-sm shadow-sm">
          {activeAnalysisCount} overlay{activeAnalysisCount > 1 ? 's' : ''} active
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
