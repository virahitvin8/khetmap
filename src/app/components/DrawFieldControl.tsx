import { useState, useCallback, useEffect, useRef } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
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

const vertexIcon = new L.DivIcon({
  className: 'vertex-marker',
  html: `<div style="width:10px;height:10px;background:#2563EB;border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

// Calculate polygon centroid
export function getCentroid(vertices: Vertex[]): Vertex {
  let lat = 0, lng = 0;
  for (const v of vertices) { lat += v.lat; lng += v.lng; }
  return { lat: lat / vertices.length, lng: lng / vertices.length };
}

// Calculate area using Shoelace formula (returns hectares)
export function calculateArea(vertices: Vertex[]): number {
  if (vertices.length < 3) return 0;
  const radLatLngs = vertices.map(v => ({
    lat: v.lat * Math.PI / 180,
    lng: v.lng * Math.PI / 180,
  }));
  const R = 6371000;
  let area = 0;
  for (let i = 0; i < radLatLngs.length; i++) {
    const j = (i + 1) % radLatLngs.length;
    area += radLatLngs[i].lng * radLatLngs[j].lat - radLatLngs[j].lng * radLatLngs[i].lat;
  }
  return Math.abs(area) * R * R / 2 / 10000;
}

// Format area in all units
export function formatAreaAllUnits(ha: number): string {
  const sqm = ha * 10000;
  const acres = ha * 2.47105;
  const sqkm = ha / 100;
  return `${sqm.toFixed(1)} m² | ${ha.toFixed(4)} ha | ${acres.toFixed(4)} ac | ${sqkm.toFixed(6)} km²`;
}

export function formatAreaShort(ha: number): string {
  if (ha < 0.001) return `${(ha * 10000).toFixed(1)} m²`;
  if (ha < 1) return `${(ha * 100).toFixed(2)} cent`;
  return `${ha.toFixed(4)} ha`;
}

function DrawingUI({ isActive, onPolygonComplete, onCancel }: DrawFieldControlProps) {
  const map = useMap();
  const [vertices, setVertices] = useState<Vertex[]>([]);
  const [polygonLayer, setPolygonLayer] = useState<L.Polygon | null>(null);
  const [markerLayers, setMarkerLayers] = useState<L.Marker[]>([]);
  const [lineLayer, setLineLayer] = useState<L.Polyline | null>(null);
  const vertexRef = useRef<Vertex[]>([]);

  useEffect(() => {
    if (!isActive) { clearDrawing(); }
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

    const marker = L.marker([latlng.lat, latlng.lng], { icon: vertexIcon }).addTo(map);
    setMarkerLayers(prev => [...prev, marker]);

    if (newVertices.length >= 2) {
      lineLayer?.remove();
      const latlngs = newVertices.map(v => [v.lat, v.lng] as [number, number]);
      const line = L.polyline(latlngs, {
        color: '#2563EB',
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

    lineLayer?.remove();
    markerLayers.forEach(m => m.remove());

    const latlngs = v.map(vtx => [vtx.lat, vtx.lng] as [number, number]);
    const polygon = L.polygon(latlngs, {
      color: '#2563EB',
      weight: 2,
      fillColor: '#2563EB',
      fillOpacity: 0.12,
    }).addTo(map);

    setPolygonLayer(polygon);
    setMarkerLayers([]);
    setLineLayer(null);

    const centroid = getCentroid(v);
    map.flyTo([centroid.lat, centroid.lng], map.getZoom());

    onPolygonComplete(v);
  }, [map, lineLayer, markerLayers, onPolygonComplete]);

  useMapEvents({
    click(e) {
      if (!isActive) return;
      addVertex(e.latlng);
    },
    dblclick(e) {
      if (!isActive) return;
      e.originalEvent.preventDefault();
      if (vertices.length >= 3) { completePolygon(); }
    },
    mousemove(e) {
      if (!isActive || vertices.length === 0) return;
      lineLayer?.setLatLngs([
        ...vertices.map(v => [v.lat, v.lng] as [number, number]),
        [e.latlng.lat, e.latlng.lng],
      ]);
    },
  });

  if (!isActive) return null;

  const area = vertices.length >= 3 ? calculateArea(vertices) : 0;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
      <div className="bg-white rounded-xl px-4 py-2.5 border border-[#E2E8F0] shadow-lg flex items-center gap-3">
        <span className="text-xs text-[#64748B]">
          {vertices.length === 0
            ? '🖱️ Click on map to draw'
            : `📍 ${vertices.length} vertices`}
        </span>
        {area > 0 && (
          <span className="text-xs font-semibold text-[#2563EB] whitespace-nowrap">
            {formatAreaShort(area)}
          </span>
        )}
        {vertices.length >= 3 && (
          <button
            onClick={completePolygon}
            className="px-3 py-1 bg-[#2563EB] text-white rounded-lg text-xs font-semibold hover:bg-[#1D4ED8] transition-colors"
          >
            ✓ Finish
          </button>
        )}
        <button
          onClick={() => { clearDrawing(); onCancel(); }}
          className="text-xs text-[#EF4444] hover:text-[#DC2626] font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default DrawingUI;
