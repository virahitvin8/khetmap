<!-- ═══════════════════════════════════════════════════════════════════ -->
<!--   CAPSULE-RENDER — Animated Wave Header (kyechan99/capsule-render) -->
<!-- ═══════════════════════════════════════════════════════════════════ -->

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0A1F0A,50:1B4D2E,100:52B788&height=200&section=header&text=🌾%20Khet%20Map&fontSize=60&fontColor=E8F5E9&fontAlignY=38&desc=खेत%20मैप%20·%20See%20Your%20Farm%20From%20Space&descAlignY=58&descSize=20&descColor=95D5B2&animation=fadeIn" width="100%"/>
</p>

<!-- ─── Live Badges Row (alexandresanlim/Badges4-README.md-Profile) ─── -->
<p align="center">
  <a href="https://github.com/virahitvin8/khetmap/stargazers">
    <img src="https://img.shields.io/github/stars/virahitvin8/khetmap?style=for-the-badge&logo=github&logoColor=white&color=52B788&labelColor=0A1F0A" alt="Stars"/>
  </a>
  <a href="https://github.com/virahitvin8/khetmap/forks">
    <img src="https://img.shields.io/github/forks/virahitvin8/khetmap?style=for-the-badge&logo=github&logoColor=white&color=40916C&labelColor=0A1F0A" alt="Forks"/>
  </a>
  <img src="https://img.shields.io/github/license/virahitvin8/khetmap?style=for-the-badge&color=2D6A4F&labelColor=0A1F0A&logoColor=white" alt="License"/>
  <img src="https://img.shields.io/badge/Made%20for-Indian%20Farmers-FF6B35?style=for-the-badge&logo=leaf&logoColor=white&labelColor=0A1F0A" alt="Made for Farmers"/>
  <img src="https://img.shields.io/badge/Platform-Android%20PWA-3DDC84?style=for-the-badge&logo=android&logoColor=white&labelColor=0A1F0A" alt="Android PWA"/>
  <img src="https://img.shields.io/badge/Powered%20by-Sentinel--2%20%7C%20Copernicus-003247?style=for-the-badge&logo=satellite&logoColor=white&labelColor=0A1F0A" alt="Satellite"/>
</p>

<br/>

<!-- ─── Mission Statement ─── -->
<p align="center">
  <b>🛰️ Satellite intelligence for every farmer, in every language, on every phone.</b><br/>
  <i>Free forever · Powered entirely by open satellite data · No subscription needed</i>
</p>

<p align="center">
  <a href="https://astonishing-begonia-79345d.netlify.app/">
    <img src="https://img.shields.io/badge/🌐%20Live%20Demo-Visit%20Now-52B788?style=for-the-badge&labelColor=0D2818" alt="Live Demo"/>
  </a>
  &nbsp;
  <a href="#-getting-started">
    <img src="https://img.shields.io/badge/📱%20Install%20on%20Android-PWA-3DDC84?style=for-the-badge&labelColor=0D2818" alt="Android Install"/>
  </a>
</p>

---

<!-- ─── Demo GIF / Screenshot ─── -->
<p align="center">
  <img src="https://raw.githubusercontent.com/virahitvin8/khetmap/main/public/demo-banner.png" width="85%" alt="Khet Map demo screenshot"/>
</p>

---

## 🌿 What Is Khet Map?

**Khet Map** (खेत मैप) is a **free, open-source satellite intelligence platform** built for Indian farmers. Using data from the **European Space Agency's Sentinel satellites**, **NASA**, and **Copernicus**, it brings space-grade crop monitoring to the palm of your hand — in Hindi, Telugu, Kannada, Tamil, and English.

> *"अपना खेत, अपना नक्शा"* — Your farm, your map.

### 🎯 The Problem We Solve

| Traditional Farming | With Khet Map |
|---|---|
| Walk entire farm to detect pest/disease | See crop stress from satellite in seconds |
| Guess irrigation timing | Get data-driven ET₀ + soil moisture advice |
| No record of field boundaries | Draw & save permanent field map |
| Wait for extension officer visit | Ask HARI AI anytime in your language |
| No flood early warning | Sentinel-1 SAR detects waterlogging instantly |
| Pay for agri-apps | Completely free, forever |

---

## 🛰️ Satellite Data Sources

| Satellite | Revisit | Resolution | What Farmers Get |
|---|---|---|---|
| **Sentinel-2 (ESA)** | ~5 days | 10 m | NDVI · EVI · NDWI · Crop health score |
| **Sentinel-1 SAR (ESA)** | 6–12 days | 10 m | Waterlogging · Flood maps · Rice mapping |
| **Landsat 8/9 (USGS)** | 16 days | 30 m + thermal | Long-term trends · Water stress (CWSI) |
| **MODIS/VIIRS (NASA)** | Daily | 250–500 m | Regional benchmarks · Drought alerts |
| **Open-Meteo + NASA POWER** | Hourly | High-res | Rainfall · ET₀ · Soil temp · Smart irrigation |
| **DEM/SRTM** | Static | 30 m | Slope · Drainage · Terrain analysis |

---

## ✨ Core Features

<details>
<summary><b>🗺️ Field Mapping</b></summary>

- **Draw polygons** directly on satellite basemap
- **Upload KML / GeoJSON / CSV** field boundaries
- **Copernicus-style polygon selection** — click-to-select parcels
- **Multi-field management** — unlimited farms saved to cloud
- GPS "My Location" with auto-zoom to your farm
- **Area calculator** (hectares & cents displayed live)

</details>

<details>
<summary><b>🌿 Crop Health (NDVI & Beyond)</b></summary>

- **Live NDVI overlay** from Sentinel-2 (updated every 5 days)
- Color scale: 🔴 Stressed → 🟡 Moderate → 🟢 Healthy
- **NDVI trend graph** — last 30 days per field
- EVI, NDWI, REIP indices available
- **Health Score 0–100** with actionable alerts
- Before/After satellite comparison slider

</details>

<details>
<summary><b>💧 Water & Weather Intelligence</b></summary>

- Sentinel-1 SAR **waterlogging detection** (works through clouds & monsoon)
- **Flood mapping** with early-warning alerts
- Hourly weather: rainfall, temperature, humidity
- **ET₀ (evapotranspiration)** — tells you *exactly* when to irrigate
- Soil moisture proxy from NASA POWER

</details>

<details>
<summary><b>🤖 HARI AI — Holistic Agricultural Response Intelligence</b></summary>

- Voice + text input in **Hindi, Telugu, Kannada, Tamil, English**
- Answers real farmer questions:
  - *"Mera NDVI kam kyun hai?"* → detailed explanation + fix
  - *"Aaj irrigation karna chahiye?"* → yes/no + quantity
  - *"Kab harvest karu?"* → crop-specific calendar advice
- Powered by your farm's live satellite + weather data
- Works offline for common queries

</details>

<details>
<summary><b>📱 Android PWA</b></summary>

- Install from Chrome browser — no Play Store needed
- Offline map tile cache
- Push notifications for crop alerts & weather warnings
- Works on any Android phone (Android 7+)
- Optional: Capacitor `.apk` build for Play Store

</details>

---

## 🏗️ Tech Stack

<!-- Tech stack badges (alexandresanlim/Badges4-README.md-Profile style) -->
<p align="center">
  <!-- Frontend -->
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white"/>
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white"/>
  <!-- Map -->
  <img src="https://img.shields.io/badge/Leaflet-1.9-199900?style=flat-square&logo=leaflet&logoColor=white"/>
  <img src="https://img.shields.io/badge/OpenStreetMap-blue?style=flat-square&logo=openstreetmap&logoColor=white"/>
  <!-- Backend/Auth -->
  <img src="https://img.shields.io/badge/Firebase-11-FFCA28?style=flat-square&logo=firebase&logoColor=black"/>
  <img src="https://img.shields.io/badge/Firestore-orange?style=flat-square&logo=firebase&logoColor=white"/>
  <!-- Satellite -->
  <img src="https://img.shields.io/badge/Copernicus-CDSE-003247?style=flat-square&logo=satellite&logoColor=white"/>
  <img src="https://img.shields.io/badge/Sentinel--2-ESA-003580?style=flat-square"/>
  <img src="https://img.shields.io/badge/NASA%20POWER-API-FC3D21?style=flat-square&logo=nasa&logoColor=white"/>
  <img src="https://img.shields.io/badge/Open--Meteo-Weather-00B4D8?style=flat-square"/>
  <!-- PWA -->
  <img src="https://img.shields.io/badge/PWA-Android%20Ready-3DDC84?style=flat-square&logo=android&logoColor=white"/>
  <img src="https://img.shields.io/badge/Capacitor-Android%20APK-119EFF?style=flat-square&logo=capacitor&logoColor=white"/>
</p>

```
┌─────────────────────────────────────────────────────┐
│             KHET MAP — Full Architecture            │
├──────────────┬──────────────────────────────────────┤
│  AUTH        │  Firebase Auth                       │
│              │  ├── Google OAuth                    │
│              │  └── Phone OTP (SMS, +91 India)      │
├──────────────┼──────────────────────────────────────┤
│  MAP ENGINE  │  Leaflet + react-leaflet             │
│              │  ├── ESRI World Imagery (base)       │
│              │  ├── Copernicus NDVI WMS (Sentinel-2)│
│              │  ├── Sentinel-1 SAR WMS              │
│              │  ├── NASA GIBS MODIS overlay         │
│              │  └── Open-Meteo weather layer        │
├──────────────┼──────────────────────────────────────┤
│  DATABASE    │  Firebase Firestore                  │
│              │  ├── /users/{uid}                    │
│              │  ├── /farms/{uid}/{farmId}           │
│              │  └── /alerts/{uid}                   │
├──────────────┼──────────────────────────────────────┤
│  AI LAYER    │  HARI — Crop Advisor AI              │
│              │  ├── Rule-based (offline)            │
│              │  └── Gemini API (online, enhanced)   │
├──────────────┼──────────────────────────────────────┤
│  DELIVERY    │  PWA (Chrome install)                │
│              │  └── Capacitor APK (optional)        │
└──────────────┴──────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Firebase project (free Spark plan)
- Copernicus Data Space account (free — [register here](https://dataspace.copernicus.eu/))

### 1. Clone & Install

```bash
git clone https://github.com/virahitvin8/khetmap.git
cd khetmap
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Copernicus Data Space (Sentinel-2 NDVI)
VITE_COPERNICUS_INSTANCE_ID=your_instance_id
VITE_COPERNICUS_CLIENT_ID=your_client_id

# Optional: Gemini AI for HARI
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 3. Run Locally

```bash
npm run dev
# → http://localhost:5173
```

### 4. Install on Android

Open `http://your-local-ip:5173` in Android Chrome → tap **⋮ → Add to Home Screen**

### 5. Build Production

```bash
npm run build
npm run preview
```

---

## 📱 Android APK (Optional — Capacitor)

```bash
npm install @capacitor/core @capacitor/android
npx cap init KhetMap com.khetmap.app
npx cap add android
npm run build
npx cap sync
npx cap open android   # Opens Android Studio → Build → Generate Signed APK
```

---

## 📊 Developer Stats

<!-- github-readme-stats (anuraghazra/github-readme-stats) — GitHub Stats Card -->
<p align="center">
  <img src="https://github-readme-stats.vercel.app/api?username=virahitvin8&show_icons=true&theme=dark&bg_color=0A1F0A&title_color=52B788&text_color=95D5B2&icon_color=40916C&border_color=1B4D2E&hide_border=false&rank_icon=github&card_width=450" alt="GitHub Stats"/>
  &nbsp;&nbsp;
  <!-- github-readme-stats — Top Languages Card -->
  <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=virahitvin8&layout=compact&theme=dark&bg_color=0A1F0A&title_color=52B788&text_color=95D5B2&border_color=1B4D2E&hide_border=false&langs_count=8" alt="Top Languages"/>
</p>

<!-- GitHub Streak Stats -->
<p align="center">
  <img src="https://streak-stats.demolab.com/?user=virahitvin8&theme=dark&background=0A1F0A&ring=52B788&fire=40916C&currStreakLabel=52B788&sideLabels=95D5B2&sideNums=E8F5E9&dates=6B8E6B&border=1B4D2E" alt="GitHub Streak"/>
</p>

<!-- Activity Graph (lowlighter/metrics inspired) -->
<p align="center">
  <img src="https://github-readme-activity-graph.vercel.app/graph?username=virahitvin8&theme=high-contrast&bg_color=0A1F0A&color=52B788&line=40916C&point=95D5B2&area=true&area_color=1B4D2E&hide_border=false&custom_title=Khet%20Map%20Contribution%20Graph" alt="Contribution Graph"/>
</p>

---

## 🗺️ Roadmap

```
Phase 0 ✅  Foundation — Vite + React + Firebase + Map skeleton
Phase 1 🔄  Auth — Google OAuth + Phone OTP + Premium landing page
Phase 2 🔄  Map Intelligence — Copernicus NDVI WMS + KML/CSV upload
Phase 3 🔜  Farms Dashboard — Health scores + NDVI trend charts
Phase 4 🔜  HARI AI — Voice + text crop advisor
Phase 5 🔜  PWA — Android installable + offline support
Phase 6 🔜  i18n — Hindi, Telugu, Tamil, Kannada
Phase 7 🔜  Play Store — Capacitor APK release
```

---

## 🌍 Data Credits & Open-Source Acknowledgements

| Source | Usage | License |
|---|---|---|
| **ESA Copernicus / Sentinel-2** | NDVI, EVI, NDWI overlays | Free / Open |
| **ESA Sentinel-1** | SAR waterlogging detection | Free / Open |
| **NASA POWER** | Solar radiation, wind, ET₀ | Public Domain |
| **Open-Meteo** | Hourly weather data | CC BY 4.0 |
| **USGS Landsat 8/9** | Long-term thermal trends | Public Domain |
| **OpenStreetMap** | Street map basemap | ODbL |
| **ESRI World Imagery** | Satellite basemap tiles | ESRI Terms |
| **Leaflet** | Interactive map engine | BSD-2 |
| **Firebase** | Auth, Firestore, Storage | Google ToS |

---

## 🤝 Contributing

Contributions are very welcome! Especially:
- 🌐 Translations (Hindi, Telugu, Tamil, Kannada, Marathi)
- 🐛 Bug reports from farmers testing in real fields
- 🛰️ New satellite index implementations (LAI, SAVI, VARI)
- 📱 UI/UX improvements for low-end Android devices

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
# → Open Pull Request
```

---

## 📄 License

MIT License — Free to use, modify, and distribute.

---

<!-- CAPSULE-RENDER — Animated Wave Footer (kyechan99/capsule-render) -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:52B788,50:1B4D2E,100:0A1F0A&height=120&section=footer&text=Jai%20Kisan%20🌾&fontSize=28&fontColor=E8F5E9&fontAlignY=65&animation=fadeIn" width="100%"/>
</p>

<p align="center">
  <sub>Built with ❤️ for Indian farmers · Powered by open satellite data · Free forever</sub><br/>
  <sub>🛰️ Sentinel-2 · Sentinel-1 · Landsat · MODIS · NASA POWER · Open-Meteo</sub>
</p>
