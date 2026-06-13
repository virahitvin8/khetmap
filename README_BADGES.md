# 🌾 KhetMap — Developer Reference

> **Satellite intelligence for Indian farmers.** Full technical documentation, API reference, badges, and developer setup.

---

<!-- TECH STACK BADGES — FOR-THE-BADGE STYLE (alexandresanlim/Badges4-README.md-Profile) -->

## 🛠️ Tech Stack

### Frontend
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

### Maps & GIS
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![OpenStreetMap](https://img.shields.io/badge/OpenStreetMap-7EBC6F?style=for-the-badge&logo=openstreetmap&logoColor=white)
![NASA](https://img.shields.io/badge/NASA_GIBS-E03C31?style=for-the-badge&logo=nasa&logoColor=white)

### Satellite APIs (Free)
![Sentinel](https://img.shields.io/badge/Sentinel--2-003247?style=for-the-badge&logo=esa&logoColor=white)
![MODIS](https://img.shields.io/badge/MODIS-1B6CA8?style=for-the-badge&logo=nasa&logoColor=white)
![Landsat](https://img.shields.io/badge/Landsat--8/9-2C6FAC?style=for-the-badge&logo=usgs&logoColor=white)

### Weather (Free, No API Key)
![Open-Meteo](https://img.shields.io/badge/Open--Meteo-00B4D8?style=for-the-badge&logo=cloudflarepages&logoColor=white)
![OpenWeatherMap](https://img.shields.io/badge/OpenWeatherMap-EB6E4B?style=for-the-badge&logo=openweathermap&logoColor=white)

### Auth & Backend
![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)

### Mobile
![Android](https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)

### DevOps & Deployment
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-121013?style=for-the-badge&logo=github&logoColor=white)
![Firebase Hosting](https://img.shields.io/badge/Firebase_Hosting-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![GitLab CI](https://img.shields.io/badge/GitLab_CI-FC6D26?style=for-the-badge&logo=gitlab&logoColor=white)

---

## 📋 Table of Contents

1. [Environment Setup](#-environment-setup)
2. [API Reference](#-api-reference)
3. [Architecture Deep-Dive](#-architecture-deep-dive)
4. [Building Android APK](#-building-android-apk)
5. [Deployment Options](#-deployment-options)
6. [Project Index](#-project-index)
7. [Roadmap](#-roadmap)
8. [Contributing](#-contributing)

---

## 🔑 Environment Setup

<details>
<summary><b>📋 Full .env Reference (click to expand)</b></summary>

```bash
# ── CLERK AUTH ─────────────────────────────────────────────────────
# Get from: https://clerk.com → Dashboard → API Keys
VITE_CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXX

# ── FIREBASE ───────────────────────────────────────────────────────
# Get from: Firebase Console → Project Settings → Your apps → Web
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=000000000000
VITE_FIREBASE_APP_ID=1:000000000000:web:XXXXXXXXXXXXXXXX

# ── OPENWEATHERMAP ─────────────────────────────────────────────────
# Optional. Get from: https://openweathermap.org/api_keys
# Free tier: 1,000 calls/day. If not set, Open-Meteo is used (free, unlimited).
VITE_OWM_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ── SENTINEL HUB ──────────────────────────────────────────────────
# Optional. Get from: https://www.sentinel-hub.com → Dashboard → Configurations
# 30-day free trial available. Unlocks 10m resolution satellite data.
VITE_SENTINEL_INSTANCE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
VITE_SENTINEL_NDVI_LAYER=NDVI
VITE_SENTINEL_NDWI_LAYER=NDWI

# ── FREE APIs (NO KEY NEEDED) ─────────────────────────────────────
# NASA GIBS: Unlimited free satellite imagery (NDVI, NDWI, SAVI)
# Open-Meteo: Unlimited free weather data
# Nominatim (OSM): Unlimited free geocoding
# Overpass API: Unlimited free OSM land data
```

</details>

<details>
<summary><b>🆓 Which APIs work with ZERO configuration?</b></summary>

These APIs require **no API key** and work out-of-the-box:

| API | Provider | Rate Limit | Used For |
|-----|---------|-----------|---------|
| GIBS WMS | NASA | Unlimited | NDVI/NDWI/SAVI satellite tiles |
| Nominatim | OpenStreetMap | 1 req/sec | Location search & geocoding |
| Open-Meteo | Open-Meteo GmbH | 10,000/day | Weather data & 7-day forecast |
| Overpass API | OpenStreetMap | Reasonable use | Land classification data |
| ESRI Basemap | Esri | Limited | Satellite basemap tiles |
| Tile.openstreetmap.org | OSM Foundation | Limited | Street map tiles |

</details>

---

## 📡 API Reference

<details>
<summary><b>🛰️ NASA GIBS — Satellite Indices</b></summary>

**Base URL:** `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/`

| Layer | Product | Resolution | Latency |
|-------|---------|-----------|---------|
| `MODIS_Terra_CorrectedReflectance_TrueColor` | True color | 250m | ~3h |
| `MODIS_Terra_NDVI_8Day` | NDVI | 250m | 8-day composite |
| `MODIS_Terra_Land_Surface_Temp_Day` | LST | 1km | Daily |

**Usage in code:** `src/services/satelliteSources.ts`

</details>

<details>
<summary><b>🌤️ Open-Meteo — Free Weather (No Key)</b></summary>

**Base URL:** `https://api.open-meteo.com/v1/forecast`

```typescript
// Example request
const url = `https://api.open-meteo.com/v1/forecast?
  latitude=${lat}&longitude=${lon}
  &current=temperature_2m,precipitation,wind_speed_10m
  &daily=precipitation_sum,temperature_2m_max
  &timezone=Asia/Kolkata
  &forecast_days=7`;
```

No API key. No rate limit for reasonable use. 100% free forever.

</details>

<details>
<summary><b>📍 Nominatim — Free Geocoding (No Key)</b></summary>

**Base URL:** `https://nominatim.openstreetmap.org`

```typescript
// Forward geocoding
GET /search?q=Hyderabad,India&format=json&limit=5

// Reverse geocoding
GET /reverse?lat=17.3850&lon=78.4867&format=json
```

Rate limit: 1 request/second. Attribution required: © OpenStreetMap contributors.

</details>

<details>
<summary><b>🛰️ Sentinel Hub — 10m Resolution (Free Trial)</b></summary>

Sign up at [sentinel-hub.com](https://www.sentinel-hub.com) → Dashboard → Configurations → Create Instance.

Copy the Instance ID to `.env`:
```
VITE_SENTINEL_INSTANCE_ID=your-instance-id
```

Provides **10m resolution** Sentinel-2 imagery (vs 250m from MODIS).

</details>

---

## 🏗️ Architecture Deep-Dive

<details>
<summary><b>📊 Data Flow Diagram</b></summary>

```
User Action (draw field / change overlay)
           ↓
    React Component
    (MapPage.tsx / MapComponent.tsx)
           ↓
    Service Layer
    ┌──────────────────────────────────┐
    │ satelliteSources.ts  → NASA GIBS │
    │ fieldAnalysis.ts     → Turf.js   │
    │ landData.ts          → OSM API   │
    │ multiSatelliteAnalysis.ts        │
    └──────────────────────────────────┘
           ↓
    Storage Layer
    ┌──────────────────────────────────┐
    │ database.ts                      │
    │  ├── Firestore (if configured)   │
    │  └── localStorage (fallback)     │
    └──────────────────────────────────┘
           ↓
    Map Render (Leaflet + react-leaflet)
```

</details>

<details>
<summary><b>📁 Complete Project Index</b></summary>

### Components (`src/app/components/`)

| File | Purpose |
|------|---------|
| `MapComponent.tsx` | Main Leaflet map container with all layers |
| `NDVILayer.tsx` | NASA GIBS MODIS NDVI WMS tile layer |
| `NDWILayer.tsx` | NASA GIBS MODIS NDWI WMS tile layer |
| `SAVILayer.tsx` | NASA GIBS SAVI WMS tile layer |
| `MultiSatelliteDashboard.tsx` | Side-by-side satellite comparison panel |
| `FieldAnalysisReport.tsx` | Full field analysis report with charts |
| `LandAnalysisModal.tsx` | Land classification results modal |
| `DrawFieldControl.tsx` | Leaflet-draw toolbar for field boundary creation |
| `FileUpload.tsx` | KML/GeoJSON/Shapefile import handler |
| `WeatherForecast.tsx` | 5-day weather forecast card |
| `WeatherOverlay.tsx` | Weather layer on map |
| `LocationSearch.tsx` | Search bar (Nominatim/leaflet-geosearch) |
| `SaveFieldModal.tsx` | Save drawn field with name/notes |
| `NDVIHistoryChart.tsx` | Time-series NDVI chart (recharts) |
| `AnimatedLogo.tsx` | Animated KhetMap logo |
| `AppLayout.tsx` | Main navigation layout wrapper |
| `LanguageSelector.tsx` | EN/TE/HI language switcher |
| `SentinelTileLayer.tsx` | Sentinel Hub WMS tile layer |

### Pages (`src/app/pages/`)

| File | Route | Purpose |
|------|-------|---------|
| `Welcome.tsx` | `/` | Landing page with CTA |
| `MapPage.tsx` | `/map` | Main satellite map interface |
| `Farms.tsx` | `/farms` | List of saved fields |
| `FarmDetail.tsx` | `/farms/:id` | Single field detailed view |
| `Analyze.tsx` | `/analyze` | Bulk field analysis |
| `Profile.tsx` | `/profile` | User profile & settings |
| `SignInPage.tsx` | `/sign-in` | Clerk auth sign-in |
| `SignUpPage.tsx` | `/sign-up` | Clerk auth sign-up |

### Services (`src/services/`)

| File | Purpose |
|------|---------|
| `firebase.ts` | Firebase app initialization |
| `database.ts` | CRUD for fields (Firestore + localStorage) |
| `satelliteSources.ts` | All satellite data source configs & URLs |
| `sentinelHub.ts` | Sentinel Hub WMS URL builder |
| `fieldAnalysis.ts` | Turf.js spatial analysis engine |
| `landData.ts` | OSM Overpass API land classification |
| `multiSatelliteAnalysis.ts` | Multi-source satellite data aggregator |
| `shapefile.ts` | Shapefile import/export handler |

</details>

---

## 📱 Building Android APK

<details>
<summary><b>🔧 Prerequisites</b></summary>

| Requirement | Version | Install |
|------------|---------|---------|
| Node.js | ≥ 18.0 | [nodejs.org](https://nodejs.org) |
| npm | ≥ 9.0 | Comes with Node |
| JDK | 17 | [adoptium.net](https://adoptium.net) |
| Android Studio | Latest | [developer.android.com/studio](https://developer.android.com/studio) |
| Android SDK | API 33+ | Via Android Studio SDK Manager |

</details>

<details>
<summary><b>🐛 Build Debug APK (Unsigned, for testing)</b></summary>

```bash
# Step 1: Build web app
npm install
npm run build

# Step 2: Sync with Capacitor
npx cap copy android

# Step 3: Build APK
cd android
./gradlew assembleDebug          # Linux/Mac
gradlew.bat assembleDebug        # Windows

# APK is at:
# android/app/build/outputs/apk/debug/app-debug.apk
```

Or just download from [GitHub Releases](https://github.com/virahitvin8/khetmap/releases)!

</details>

<details>
<summary><b>🔏 Build Signed Release APK</b></summary>

```bash
# Step 1: Generate signing key (one-time only)
keytool -genkey -v \
  -keystore khetmap-release.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias khetmap \
  -storepass YOUR_STORE_PASSWORD \
  -keypass YOUR_KEY_PASSWORD

# Step 2: Create keystore.properties (DO NOT commit this file!)
cat > android/keystore.properties << EOF
storeFile=../khetmap-release.jks
storePassword=YOUR_STORE_PASSWORD
keyAlias=khetmap
keyPassword=YOUR_KEY_PASSWORD
EOF

# Step 3: Build signed APK
npm run build
npx cap copy android
cd android
./gradlew assembleRelease

# Signed APK:
# android/app/build/outputs/apk/release/app-release.apk
```

</details>

---

## 🚀 Deployment Options

| Platform | Command | URL |
|---------|---------|-----|
| **GitHub Pages** | Auto via CI/CD | `virahitvin8.github.io/khetmap` |
| **Firebase Hosting** | `npm run build && firebase deploy` | `khet-map.web.app` |
| **Vercel** | `vercel --prod` | Auto-detected |

---

## 📈 Roadmap

- [x] **v0.1** — Core map with NDVI/NDWI/SAVI overlays
- [x] **v0.2** — Field drawing & boundary management
- [x] **v0.3** — Multi-satellite dashboard
- [x] **v0.4** — Android APK via Capacitor
- [x] **v0.5** — Multi-language (EN/TE/HI)
- [x] **v0.6** — Cloud sync via Firebase
- [x] **v0.7** — KML/GeoJSON/Shapefile import-export
- [x] **v1.0** — Public release 🎉
- [ ] **v1.1** — AI crop advisory (HARI)
- [ ] **v1.2** — Historical NDVI time-series
- [ ] **v1.3** — Push notifications for crop alerts
- [ ] **v1.4** — Marathi, Tamil, Kannada support
- [ ] **v2.0** — Offline-first with service workers

---

## 🤝 Contributing

![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge)
![Open Source](https://img.shields.io/badge/open--source-100%25-22c55e?style=for-the-badge)
![Good First Issues](https://img.shields.io/github/issues/virahitvin8/khetmap/good%20first%20issue?style=for-the-badge&color=7057ff)

See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines.

**Quick contribution checklist:**
- [ ] Fork the repository
- [ ] Create a feature branch: `git checkout -b feature/my-feature`
- [ ] Make your changes (follow TypeScript strict typing)
- [ ] Test locally: `npm run dev`
- [ ] Commit: `git commit -m 'feat: describe your change'`
- [ ] Push: `git push origin feature/my-feature`
- [ ] Open a Pull Request — we review within 48 hours!

---

## 📄 License

[![License MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

MIT License — free to use, fork, modify, and distribute.

---

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-virahitvin8%2Fkhetmap-181717?style=for-the-badge&logo=github)](https://github.com/virahitvin8/khetmap)
[![Live App](https://img.shields.io/badge/Live%20App-khet--map.web.app-22c55e?style=for-the-badge&logo=firebase)](https://khet-map.web.app)

*Built with ❤️ for the farming community of India*

</div>
