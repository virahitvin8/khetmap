import { useState, useCallback, useEffect, useRef } from 'react';
import { useMap, useMapEvents, FeatureGroup } from 'react-leaflet';
import L from 'leaflet';

interface Vertex {
  lat: number;
  lng: number;
}

interface DrawFieldControlProps {
  isActive: boolean;
  onPolygonComplete: (vertices: Vertex[]) => void;
  onCancel: () => void;
}

// Custom marker for vertices
const vertexIcon = new L.DivIcon({
  className: 'vertex-marker',
  html: `<div style="
    width: 10px; height: 10px;
    background: #52B788;
    border: 2px solid white;
    border-radius: 50%;
    box-shadow: 0 1px 4px rgba(0,0,0,0.4);
  "></div>`,
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

// Close-polygon button icon
const closeIcon = new L.DivIcon({
  className: 'close-vertex-marker',
  html: `<div style="
    width: 16px; height: 16px;
    background: #EF5350;
    border: 2px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: white;
    font-weight: bold;
    cursor: pointer;
  ">✓</div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function DrawingUI({ isActive, onPolygonComplete, onCancel }: DrawFieldControlProps) {
  const map = useMap();
  const [vertices, setVertices] = useState<Vertex[]>([]);
  const [polygonLayer, setPolygonLayer] = useState<L.Polygon | null>(null);
  const [markerLayers, setMarkerLayers] = useState<L.Marker[]>([]);
  const [lineLayer, setLineLayer] = useState<L.Polyline | null>(null);
  const vertexRef = useRef<Vertex[]>([]);

  // Reset when deactivated
  useEffect(() => {
    if (!isActive) {
      clearDrawing();
    }
  }, [isActive]);

  const clearDrawing = useCallback(() => {
    markerLayers.forEach(m => m.remove());
    lineLayer?.remove();
    polygonLayer?.remove();
    setVertices([]);
    setMarkerLayers([]);
    setLineLayer(null);
    setPolygonLayer(null);
    vertexRef.current = [];
  }, [markerLayers, lineLayer, polygonLayer]);

  const addVertex = useCallback((latlng: L.LatLng) => {
    const newVertex = { lat: latlng.lat, lng: latlng.lng };
    const newVertices = [...vertexRef.current, newVertex];
    vertexRef.current = newVertices;
    setVertices(newVertices);

    // Add marker
    const marker = L.marker([latlng.lat, latlng.lng], { icon: vertexIcon }).addTo(map);
    setMarkerLayers(prev => [...prev, marker]);

    // Update line
    if (newVertices.length >= 2) {
      lineLayer?.remove();
      const latlngs = newVertices.map(v => [v.lat, v.lng] as [number, number]);
      const line = L.polyline(latlngs, {
        color: '#52B788',
        weight: 3,
        opacity: 0.8,
        dashArray: '8, 4',
      }).addTo(map);
      setLineLayer(line);
    }
  }, [map, lineLayer]);

  const completePolygon = useCallback(() => {
    const v = vertexRef.current;
    if (v.length < 3) return;

    // Remove line and markers
    lineLayer?.remove();
    markerLayers.forEach(m => m.remove());

    // Create polygon
    const latlngs = v.map(vtx => [vtx.lat, vtx.lng] as [number, number]);
    const polygon = L.polygon(latlngs, {
      color: '#52B788',
      weight: 2,
      fillColor: '#52B788',
      fillOpacity: 0.15,
    }).addTo(map);

    setPolygonLayer(polygon);
    setMarkerLayers([]);
    setLineLayer(null);

    // Add centroid marker
    const centroid = getCentroid(v);
    map.flyTo([centroid.lat, centroid.lng], map.getZoom());

    // Notify parent
    onPolygonComplete(v);
  }, [map, lineLayer, markerLayers, onPolygonComplete]);

  // Map click events
  useMapEvents({
    click(e) {
      if (!isActive) return;
      addVertex(e.latlng);
    },
    dblclick(e) {
      if (!isActive) return;
      e.originalEvent.preventDefault();
      if (vertices.length >= 3) {
        completePolygon();
      }
    },
    mousemove(e) {
      if (!isActive || vertices.length === 0) return;
      // Update preview line to show where the next vertex would go
      lineLayer?.setLatLngs([
        ...vertices.map(v => [v.lat, v.lng] as [number, number]),
        [e.latlng.lat, e.latlng.lng],
      ]);
    },
  });

  if (!isActive) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 12,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      display: 'flex',
      gap: 8,
      alignItems: 'center',
    }}>
      <div style={{
        background: 'rgba(13,40,24,0.95)',
        border: '1px solid #52B788',
        borderRadius: 10,
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        backdropFilter: 'blur(8px)',
      }}>
        <span style={{ color: '#A5D6A7', fontSize: 12 }}>
          {vertices.length === 0 
            ? '🖱️ Click on map to start drawing'
            : `📍 ${vertices.length} vertices — double-click to close`}
        </span>
        {vertices.length >= 3 && (
          <button
            onClick={completePolygon}
            style={{
              background: '#52B788',
              color: '#0A1F0A',
              border: 'none',
              borderRadius: 6,
              padding: '4px 12px',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ✓ Finish
          </button>
        )}
        <button
          onClick={() => { clearDrawing(); onCancel(); }}
          style={{
            background: 'rgba(239,83,80,0.2)',
            color: '#EF5350',
            border: '1px solid rgba(239,83,80,0.3)',
            borderRadius: 6,
            padding: '4px 10px',
            fontSize: 11,
            cursor: 'pointer',
          }}
        >
          ✕ Cancel
        </button>
      </div>
    </div>
  );
}

// Calculate polygon centroid
export function getCentroid(vertices: Vertex[]): Vertex {
  let lat = 0, lng = 0;
  for (const v of vertices) {
    lat += v.lat;
    lng += v.lng;
  }
  return { lat: lat / vertices.length, lng: lng / vertices.length };
}

// Calculate area using Shoelace formula (returns hectares)
export function calculateArea(vertices: Vertex[]): number {
  if (vertices.length < 3) return 0;
  
  // Convert to radians
  const radLatLngs = vertices.map(v => ({
    lat: v.lat * Math.PI / 180,
    lng: v.lng * Math.PI / 180,
  }));

  const R = 6371000; // Earth's radius in meters
  let area = 0;

  for (let i = 0; i < radLatLngs.length; i++) {
    const j = (i + 1) % radLatLngs.length;
    const xi = radLatLngs[i].lng;
    const yi = radLatLngs[i].lat;
    const xj = radLatLngs[j].lng;
    const yj = radLatLngs[j].lat;
    area += xi * yj - xj * yi;
  }

  area = Math.abs(area) * R * R / 2; // Area in m²
  return area / 10000; // Convert to hectares
}

export default DrawingUI;
