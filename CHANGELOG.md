# Changelog

All notable changes to KhetMap are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2026-06-13

### 🎉 First Public Release

#### Added
- 🛰️ **NDVI overlay** — crop health monitoring via NASA GIBS MODIS (250m, free)
- 💧 **NDWI overlay** — water index and moisture stress detection
- 🪨 **SAVI overlay** — soil-adjusted vegetation index for sparse crops
- 🗺️ **Field drawing tool** — draw polygon boundaries with auto area calculation
- 📁 **Import/Export** — KML, GeoJSON, CSV, Shapefile support
- 📊 **Multi-Satellite Dashboard** — Sentinel-2, Landsat, MODIS, VIIRS comparison
- 🌤️ **Weather overlay** — 5-day forecast via Open-Meteo (no API key!)
- 🌐 **Multi-language** — English, తెలుగు, हिंदी
- 🔐 **Authentication** — Google & email sign-in via Clerk
- ☁️ **Cloud sync** — Firebase Firestore (optional, falls back to localStorage)
- 📱 **Android APK** — Capacitor-wrapped installable app
- 📋 **Land Classification** — Cropland, water, forest, urban, fallow detection
- 📐 **Area measurement** — Polygon area in hectares, acres, sq. meters
- 🔌 **Offline-first** — cached data, works without internet after first load
- 🛰️ **Sentinel-2 support** — 10m resolution via Sentinel Hub (optional)

#### APIs Used (All Free)
- NASA GIBS — satellite imagery (no key required)
- Open-Meteo — weather data (no key required)
- Nominatim/OSM — geocoding (no key required)
- Overpass API — land classification data (no key required)
- OpenStreetMap — base map tiles (no key required)
- ESRI — satellite basemap tiles (no key required)

---

## [0.7.0] — 2026-06-10

### Added
- KML, GeoJSON, CSV, Shapefile import/export
- Multi-language selector (EN/TE/HI)

---

## [0.6.0] — 2026-06-08

### Added
- Firebase Firestore cloud sync
- Offline localStorage fallback

---

## [0.5.0] — 2026-06-06

### Added
- Android APK via Capacitor

---

## [0.4.0] — 2026-06-04

### Added
- Multi-Satellite Dashboard (Sentinel-2, Landsat, MODIS, VIIRS)

---

## [0.3.0] — 2026-06-02

### Added
- Field drawing & boundary management with area calculation

---

## [0.2.0] — 2026-05-30

### Added
- NDWI and SAVI satellite overlays

---

## [0.1.0] — 2026-05-28

### Added
- Initial NDVI overlay via NASA GIBS
- Interactive Leaflet map
- Location search
