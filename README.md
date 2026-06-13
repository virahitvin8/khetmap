<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:22c55e,50:16a34a,100:ca8a04&height=280&section=header&text=🌾%20KhetMap&fontSize=82&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Satellite%20Intelligence%20for%20Every%20Indian%20Farmer&descAlignY=62&descAlign=50&descSize=22&descColor=f0fdf4" alt="KhetMap" width="100%" />

</div>

<div align="center">

[![APK Download](https://img.shields.io/github/v/release/virahitvin8/khetmap?color=22c55e&style=flat-square&label=📱%20Download%20APK&logo=android&logoColor=white)](https://github.com/virahitvin8/khetmap/releases/latest)
[![License MIT](https://img.shields.io/badge/license-MIT-22c55e?style=flat-square)](LICENSE)
[![Stars](https://img.shields.io/github/stars/virahitvin8/khetmap?color=ca8a04&style=flat-square&logo=github&logoColor=white)](https://github.com/virahitvin8/khetmap/stargazers)
[![Forks](https://img.shields.io/github/forks/virahitvin8/khetmap?color=16a34a&style=flat-square&logo=github)](https://github.com/virahitvin8/khetmap/network/members)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-3b82f6?style=flat-square&logo=pwa&logoColor=white)](https://khet-map.web.app)
[![NASA GIBS](https://img.shields.io/badge/Powered%20by-NASA%20GIBS-e25b27?style=flat-square&logo=nasa&logoColor=white)](https://gibs.earthdata.nasa.gov)
[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-khet--map.web.app-22c55e?style=flat-square)](https://khet-map.web.app)

</div>

<br/>

<div align="center">
  <h3>🛰️ See Your Land from Space — 100% Free, Forever</h3>
  <p>
    Real-time NDVI · NDWI · SAVI satellite indices &nbsp;|&nbsp;
    Draw & manage field boundaries &nbsp;|&nbsp;
    Android APK &nbsp;|&nbsp;
    Works offline &nbsp;|&nbsp;
    3 Indian languages
  </p>
</div>

---

<div align="center">

## 📸 Live Preview

| 🗺️ Interactive Satellite Map | 🌿 NDVI Crop Health | 📊 Multi-Satellite Dashboard |
|:---:|:---:|:---:|
| Real-time ESRI + OSM layers | Vegetation vigor from NASA | Compare 6 satellite sources |

</div>

<div align="center">
  <a href="https://khet-map.web.app">
    <img src="https://img.shields.io/badge/%20Open%20Live%20App%20→-khet--map.web.app-22c55e?style=for-the-badge&logo=firefox&logoColor=white" alt="Open Live App" />
  </a>
</div>

---

## 🎯 Why KhetMap?

> **86% of India's farmers are smallholders** who can't afford ₹10,000–50,000/year for commercial GIS tools.
> KhetMap gives them the **same satellite intelligence** for free.

| ❌ The Old Way | ✅ KhetMap |
|---|---|
| Expensive GIS software | 100% free, open-source |
| Requires expert training | Simple tap-to-draw interface |
| No Indian crop context | Built for Indian farms |
| English-only | Telugu · Hindi · English |
| Desktop-only | Android APK + PWA |
| Manual field visits | Satellite data from space |

---

## ✨ Features

<div align="center">

| Feature | Details |
|:--------|:--------|
| 🌿 **NDVI Crop Health** | Vegetation vigor via NASA GIBS MODIS (250m resolution, free) |
| 💧 **NDWI Water Index** | Waterlogging & moisture stress detection |
| 🪨 **SAVI Soil Health** | Soil-adjusted analysis for sparse/early-season crops |
| 🗺️ **Draw & Save Fields** | Mark boundaries, auto-calculate area in hectares/acres |
| 📁 **Import / Export** | KML, GeoJSON, CSV, Shapefile — all formats |
| 🌤️ **Weather Overlay** | 5-day forecast via Open-Meteo (no API key needed!) |
| 📊 **Multi-Satellite Dashboard** | Sentinel-2, Landsat, MODIS, VIIRS in one view |
| 🌐 **3 Languages** | English, తెలుగు, हिंदी |
| 🔐 **Cloud Sync** | Firebase Firestore (optional) or local storage |
| 📱 **Android APK** | Wrapped via Capacitor — download from Releases |
| 🛰️ **10m Sentinel-2** | High-resolution data via Copernicus (free trial) |
| 📋 **Land Classification** | Cropland, water, forests, urban, fallow |
| 📐 **Area Measurement** | Polygon area in hectares, acres, sq. meters |
| 🔌 **Works Offline** | Data cached — no internet required after load |

</div>

---

## 🧠 The Science Behind It

<details>
<summary><b>📗 NDVI — Normalized Difference Vegetation Index</b></summary>

```
NDVI = (NIR - Red) / (NIR + Red)
```

| Value | Meaning |
|-------|---------|
| `> 0.6` | 🟢 Dense, healthy vegetation |
| `0.2 – 0.5` | 🟡 Moderate crops (normal growth) |
| `0.0 – 0.2` | 🟠 Stressed / sparse crops |
| `< 0.0` | 🔴 Water, bare soil, built-up |

**Source:** NASA GIBS MODIS — 250m resolution, free, no API key needed

</details>

<details>
<summary><b>💧 NDWI — Normalized Difference Water Index</b></summary>

```
NDWI = (Green - NIR) / (Green + NIR)
```

| Value | Meaning |
|-------|---------|
| `> 0.3` | 🔵 Open water bodies |
| `0.0 – 0.3` | 🟡 Moisture stress / flooded |
| `< 0.0` | 🟤 Dry, non-water areas |

</details>

<details>
<summary><b>🪨 SAVI — Soil-Adjusted Vegetation Index</b></summary>

```
SAVI = ((NIR - Red) / (NIR + Red + L)) × (1 + L)    where L = 0.5
```

**Why it's better than NDVI:** Removes soil brightness interference — gives accurate readings even when crop cover is less than 30%. Best for semi-arid regions and early-season crops.

</details>

---

## 🚀 Quick Start

### Option 1 — Use the Web App (Instant, No Setup)
```
🌐 https://khet-map.web.app
```

### Option 2 — Download Android APK

[![Download APK](https://img.shields.io/badge/⬇️%20Download%20APK-Latest%20Release-22c55e?style=for-the-badge&logo=android&logoColor=white)](https://github.com/virahitvin8/khetmap/releases/latest)

### Option 3 — Run Locally (Developers)

```bash
# 1. Clone
git clone https://github.com/virahitvin8/khetmap.git
cd khetmap

# 2. Install dependencies
npm install

# 3. Set up environment (optional — app works without keys)
cp .env.example .env
# Edit .env with your API keys (all optional)

# 4. Run!
npm run dev
```

Open **http://localhost:5173** 🎉

---

## 🔑 API Keys — All Optional

> KhetMap works **without any API keys** using NASA GIBS (free, unlimited).
> Keys only unlock extra features:

| Service | Required? | Free Tier | Extra Feature |
|---------|-----------|-----------|---------------|
| [NASA GIBS](https://gibs.earthdata.nasa.gov) | ✅ **Built-in** | Unlimited | NDVI/NDWI/SAVI maps |
| [Open-Meteo](https://open-meteo.com) | ✅ **Built-in** | Unlimited | Weather data |
| [Nominatim OSM](https://nominatim.org) | ✅ **Built-in** | Free | Location search |
| [Clerk Auth](https://clerk.com) | ⚡ Optional | 10,000 users | User sign-in |
| [Firebase Firestore](https://firebase.google.com) | ⚡ Optional | 1GB free | Cloud sync |
| [OpenWeatherMap](https://openweathermap.org) | ⚡ Optional | 1,000/day | Enhanced weather |
| [Sentinel Hub](https://www.sentinel-hub.com) | ⚡ Optional | 30-day trial | 10m resolution |

---

## 📱 Build Android APK

```bash
# Prerequisites: Node 18+, JDK 17, Android SDK
npm run build
npx cap copy android
cd android && ./gradlew assembleDebug

# APK → android/app/build/outputs/apk/debug/app-debug.apk
```

Or just **[download the pre-built APK](https://github.com/virahitvin8/khetmap/releases/latest)** from Releases! 🎉

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    KhetMap Application                          │
├─────────────────────────────────────────────────────────────────┤
│  User Interface                                                 │
│  React 19 + TypeScript + Tailwind CSS v4 + Vite 6              │
│  Leaflet Maps + react-leaflet + leaflet-draw                    │
├──────────────────────────────┬──────────────────────────────────┤
│  Free APIs (No Key Needed)   │  Optional APIs (Free Tier)       │
│  ──────────────────────────  │  ──────────────────────────────  │
│  🛰️ NASA GIBS (MODIS)        │  🔐 Clerk Auth                   │
│  🗺️ OpenStreetMap/Nominatim  │  ☁️ Firebase Firestore           │
│  🌤️ Open-Meteo Weather       │  🌦️ OpenWeatherMap               │
│  📍 Overpass API (OSM)       │  🛰️ Sentinel Hub (10m)           │
├──────────────────────────────┴──────────────────────────────────┤
│  Storage                                                        │
│  localStorage (offline-first) → Firestore (optional cloud sync) │
├─────────────────────────────────────────────────────────────────┤
│  Mobile                                                         │
│  Capacitor → Android APK / iOS IPA                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
khetmap/
├── 📄 README.md                  # This file (hero style)
├── 📄 README_BADGES.md           # Developer docs (badge style)
├── 📄 CONTRIBUTING.md            # How to contribute
├── 📄 CHANGELOG.md               # Version history
├── 📄 LICENSE                    # MIT License
├── 📄 .env.example               # Template for environment vars
├── src/
│   ├── app/
│   │   ├── components/           # 21 UI components
│   │   │   ├── MapComponent.tsx  # Main Leaflet map
│   │   │   ├── NDVILayer.tsx     # NDVI satellite overlay
│   │   │   ├── NDWILayer.tsx     # NDWI satellite overlay
│   │   │   ├── SAVILayer.tsx     # SAVI satellite overlay
│   │   │   ├── MultiSatelliteDashboard.tsx
│   │   │   ├── FieldAnalysisReport.tsx
│   │   │   └── ...
│   │   └── pages/                # 8 app pages
│   │       ├── Welcome.tsx
│   │       ├── MapPage.tsx
│   │       ├── Farms.tsx
│   │       └── ...
│   └── services/                 # Business logic
│       ├── satelliteSources.ts
│       ├── fieldAnalysis.ts
│       ├── landData.ts
│       └── ...
├── android/                      # Capacitor Android project
├── ios/                          # Capacitor iOS project
└── .github/workflows/            # CI/CD pipelines
    ├── build-apk.yml             # Auto-build Android APK
    ├── deploy-pages.yml          # Deploy to GitHub Pages
    └── mirror-gitlab.yml         # Mirror to GitLab
```

---

## 🗺️ Roadmap

- [x] NDVI / NDWI / SAVI satellite overlays
- [x] Field drawing & boundary management
- [x] Multi-satellite dashboard (Sentinel-2, MODIS, Landsat)
- [x] Android APK via Capacitor
- [x] Multi-language: English, Telugu, Hindi
- [x] Cloud sync via Firebase
- [x] KML / GeoJSON / Shapefile import-export
- [ ] 🔧 AI crop advisory (HARI assistant)
- [ ] 🔧 Field-specific yield prediction
- [ ] 🔧 Historical NDVI time-series graphs
- [ ] 🔧 Push notifications for crop alerts
- [ ] 🔧 Marathi, Tamil, Kannada support

---

## 🤝 Contributing

We welcome all contributions! KhetMap is **100% community-driven**.

```bash
# Fork → Clone → Branch → Code → PR
git checkout -b feature/your-amazing-feature
git commit -m "feat: add amazing feature"
git push origin feature/your-amazing-feature
# Open a Pull Request on GitHub!
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines.

---

## 📄 License

**MIT License** — free to use, modify, distribute, and sell.

See [LICENSE](LICENSE) for full text.

---

## 🙏 Acknowledgments

- **[NASA GIBS](https://gibs.earthdata.nasa.gov)** — Free satellite imagery for NDVI/NDWI/SAVI
- **[OpenStreetMap](https://openstreetmap.org)** — Open map data and land classification
- **[Open-Meteo](https://open-meteo.com)** — Free weather API, no key needed
- **[Capacitor](https://capacitorjs.com)** — Android/iOS wrapping
- **[Leaflet](https://leafletjs.com)** — Interactive maps
- **Every farmer** who inspired this project 🌾

---

<div align="center">

**📬 Links**

[![GitHub](https://img.shields.io/badge/GitHub-virahitvin8/khetmap-181717?style=flat-square&logo=github)](https://github.com/virahitvin8/khetmap)
[![Issues](https://img.shields.io/badge/Issues-Report%20a%20Bug-red?style=flat-square&logo=github)](https://github.com/virahitvin8/khetmap/issues)
[![Discussions](https://img.shields.io/badge/Discuss-Ideas%20%26%20Questions-blue?style=flat-square&logo=github)](https://github.com/virahitvin8/khetmap/discussions)
[![Live App](https://img.shields.io/badge/🌐-khet--map.web.app-22c55e?style=flat-square)](https://khet-map.web.app)

</div>

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:22c55e,50:16a34a,100:ca8a04&height=120&section=footer" alt="footer" width="100%" />

*Built with ❤️ for the farming community of India*

</div>
