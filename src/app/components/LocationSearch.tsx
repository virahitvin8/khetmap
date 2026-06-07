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
      params: {
        countrycodes: 'IN',
        limit: 5,
      },
    });

    const markerIcon = new L.DivIcon({
      className: 'search-marker',
      html: `<div style="
        width: 20px; height: 20px;
        background: #52B788;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      "></div>`,
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

    // Style the search input to match dark theme
    const style = document.createElement('style');
    style.textContent = `
      .leaflet-control-geosearch {
        background: transparent !important;
      }
      .leaflet-control-geosearch form {
        background: rgba(10, 31, 10, 0.95) !important;
        border: 1px solid #1B4D2E !important;
        border-radius: 10px !important;
        backdrop-filter: blur(8px) !important;
        overflow: hidden;
      }
      .leaflet-control-geosearch .results {
        background: rgba(10, 31, 10, 0.98) !important;
        border: 1px solid #1B4D2E !important;
        border-radius: 0 0 10px 10px !important;
        margin-top: -1px !important;
      }
      .leaflet-control-geosearch .results div {
        color: #E8F5E9 !important;
        border-bottom: 1px solid #1B4D2E !important;
        padding: 8px 12px !important;
        font-size: 12px !important;
      }
      .leaflet-control-geosearch .results div:hover,
      .leaflet-control-geosearch .results div.active {
        background: rgba(82, 183, 136, 0.15) !important;
        color: #52B788 !important;
      }
      .leaflet-control-geosearch input {
        background: transparent !important;
        border: none !important;
        color: #E8F5E9 !important;
        font-size: 13px !important;
        padding: 10px 14px !important;
        outline: none !important;
        width: 220px !important;
      }
      .leaflet-control-geosearch input::placeholder {
        color: #6B8E6B !important;
        font-size: 11px !important;
      }
      .leaflet-control-geosearch .reset {
        color: #6B8E6B !important;
      }
      .leaflet-control-geosearch .glass {
        margin: 0 0 0 10px !important;
        filter: invert(0.6) !important;
      }
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
