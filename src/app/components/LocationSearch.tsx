import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch';
import L from 'leaflet';
import 'leaflet-geosearch/dist/geosearch.css';

export default function LocationSearch() {
  const map = useMap();
  const controlRef = useRef<any>(null);

  useEffect(() => {
    if (controlRef.current) return;

    const provider = new OpenStreetMapProvider({
      params: { countrycodes: 'IN', limit: 5 },
    });

    const markerIcon = new L.DivIcon({
      className: 'search-marker',
      html: `<div style="width:20px;height:20px;background:#2563EB;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    const searchControl = new (GeoSearchControl as any)({
      provider,
      style: 'bar',
      showMarker: true,
      marker: markerIcon,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: false,
      searchLabel: 'Search villages, cities, coordinates...',
    });

    // @ts-ignore
    map.addControl(searchControl);
    controlRef.current = searchControl;

    const style = document.createElement('style');
    style.textContent = `
      .leaflet-control-geosearch { background: transparent !important; }
      .leaflet-control-geosearch form {
        background: white !important;
        border: 1px solid #E2E8F0 !important;
        border-radius: 10px !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06) !important;
        overflow: hidden;
      }
      .leaflet-control-geosearch .results {
        background: white !important;
        border: 1px solid #E2E8F0 !important;
        border-radius: 0 0 10px 10px !important;
        margin-top: -1px !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.06) !important;
      }
      .leaflet-control-geosearch .results div {
        color: #1E293B !important;
        border-bottom: 1px solid #F1F5F9 !important;
        padding: 8px 12px !important;
        font-size: 12px !important;
      }
      .leaflet-control-geosearch .results div:hover,
      .leaflet-control-geosearch .results div.active {
        background: #EFF6FF !important;
        color: #2563EB !important;
      }
      .leaflet-control-geosearch input {
        background: transparent !important;
        border: none !important;
        color: #1E293B !important;
        font-size: 13px !important;
        padding: 10px 14px !important;
        outline: none !important;
        width: 220px !important;
      }
      .leaflet-control-geosearch input::placeholder { color: #94A3B8 !important; font-size: 11px !important; }
      .leaflet-control-geosearch .reset { color: #94A3B8 !important; }
      .leaflet-control-geosearch .glass { margin: 0 0 0 10px !important; opacity: 0.4 !important; }
    `;
    document.head.appendChild(style);

    return () => {
      // @ts-ignore
      map.removeControl(searchControl);
      style.remove();
      controlRef.current = null;
    };
  }, [map]);

  return null;
}
