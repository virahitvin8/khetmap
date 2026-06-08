# 🌾 KhetMap — See Your Land from Space

**Free, open-source satellite-powered field analysis for farmers, agronomists, researchers, and GIS professionals.**

[![Firebase Hosting](https://img.shields.io/badge/deployed-firebase-yellow)](https://khet-map.web.app)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](https://github.com/akshireddy99/khetmap/pulls)

---

## 🎯 The Problem KhetMap Solves

Small and marginal farmers — who make up **86% of India's agricultural community** — lack access to affordable precision agriculture tools. Satellite imagery analysis services are either:

| Problem | Impact |
|---------|--------|
| **Paid & Expensive** | ₹10,000–₹50,000/year for commercial GIS tools |
| **Complex** | Require GIS expertise to operate |
| **Not Indian-centric** | Global tools miss local crop patterns |
| **No field management** | Can't save, organize, or track fields over time |
| **Language barrier** | English-only interfaces |

### KhetMap's Niche Solution

KhetMap bridges the gap between **space technology** and **ground-level farming decisions**:

1. **🌿 Crop Health Monitoring** — NDVI (Normalized Difference Vegetation Index) tells you exactly which parts of your field are healthy vs. stressed — so you can target irrigation/fertilizer where it's needed
2. **💧 Water Stress Detection** — NDWI (Normalized Difference Water Index) identifies waterlogged areas and moisture stress — preventing over-watering
3. **🧪 Soil-Adjusted Analysis** — SAVI (Soil-Adjusted Vegetation Index) removes soil brightness interference for accurate readings even in sparse crops
4. **🗺️ Field Boundary Management** — Draw, save, and organize your fields with area calculations — no more guessing acreage
5. **📊 Evidence-Based Decision Making** — Get actionable recommendations from satellite data, not intuition
6. **🌐 Multi-Language Support** — English, తెలుగు, हिंदी — accessible to regional farmers
7. **📱 Works Anywhere** — Mobile web + Android APK, works offline, no internet required after fields are loaded
8. **🆓 Completely Free** — No subscriptions, no hidden costs, open-source

---

## ✨ Features

| Feature | Status | Details |
|---------|--------|---------|
| 🛰️ **Live Satellite Maps** | ✅ | ESRI satellite basemap + OpenStreetMap street layer |
| 🌿 **Crop Health (NDVI)** | ✅ | Vegetation vigor monitoring via NASA GIBS MODIS (250m) |
| 💧 **Water Index (NDWI)** | ✅ | Water body & moisture detection via NASA GIBS |
| 🪨 **Soil Health (SAVI)** | ✅ | Soil-adjusted vegetation analysis via NASA GIBS |
| 🗺️ **Draw & Save Fields** | ✅ | Mark boundaries, auto-calculate area in hectares/acres |
| 📁 **Import/Export** | ✅ | KML, GeoJSON, CSV, Shapefile support |
| 🌤️ **Weather Overlay** | ✅ | Current conditions + 5-day forecast (with API key) |
| 🌐 **Multi-Language** | ✅ | English, తెలుగు, हिंदी |
| 🔐 **Authentication** | ✅ | Google & email sign-in via Clerk |
| ☁️ **Cloud Sync** | ⚡ | Firebase Firestore (optional, falls back to localStorage) |
| 📱 **Android APK** | ✅ | Wrapped via Capacitor — download from Releases |
| 🛰️ **10m Sentinel-2 Data** | 🔧 | Higher resolution — requires free Sentinel Hub API key |
| 📋 **Land Classification** | ✅ | Identifies crop type, water bodies, built-up areas |
| 📊 **Multi-Satellite Dashboard** | ✅ | Compare data from multiple sources in one view |
| 📐 **Area Measurement** | ✅ | Polygon area in hectares, acres, sq meters |

---

## 🧠 How the Models Work

### NDVI (Normalized Difference Vegetation Index)
```
NDVI = (NIR - Red) / (NIR + Red)
```
- **How it works**: Healthy plants reflect more Near-Infrared (NIR) light and absorb more Red light. NDVI measures this ratio.
- **Values**: -1 to +1
  - **> 0.6** → Dense, healthy vegetation
  - **0.2 to 0.5** → Moderate vegetation (crops)
  - **0.0 to 0.2** → Sparse vegetation, stressed crops
  - **< 0.0** → Water, bare soil, built-up areas
- **Data source**: NASA GIBS MODIS (250m resolution, free)

### NDWI (Normalized Difference Water Index)
```
NDWI = (Green - NIR) / (Green + NIR)
```
- **How it works**: Water absorbs NIR light strongly but reflects Green light. NDWI highlights water bodies.
- **Values**:
  - **> 0.3** → Open water
  - **0.0 to 0.3** → Moisture stress / flooded areas
  - **< 0.0** → Dry, non-water areas

### SAVI (Soil-Adjusted Vegetation Index)
```
SAVI = ((NIR - Red) / (NIR + Red + L)) × (1 + L)
```
- **Why it's better**: NDVI gets confused by bare soil reflectance. SAVI adds a soil brightness correction factor (L=0.5) for accurate readings even when crop cover is <30%.
- **Best for**: Arid/semi-arid regions, early-season crops, areas with prominent soil visibility

### Land Classification Algorithm
KhetMap combines satellite indices with **OpenStreetMap landuse data** to classify land into:
- Agricultural cropland
- Forests & woodlands
- Water bodies
- Built-up / urban areas
- Barren / fallow land
- Wetlands

---

## 🔑 API Keys Setup

KhetMap uses the following APIs. All have **free tiers**:

| API | Required? | Free Tier Limit | What It Does |
|-----|-----------|----------------|--------------|
| **Clerk Auth** | ✅ Required | 10,000 users | User sign-in/sign-up |
| **Firebase Firestore** | ⚡ Optional | 1GB storage | Cloud data sync across devices |
| **OpenWeatherMap** | ⚡ Optional | 1,000 calls/day | Weather overlay & 5-day forecast |
| **Sentinel Hub** | ⚡ Optional | 30-day trial | 10m resolution satellite data |
| **NASA GIBS** | ✅ Free | Unlimited | NDVI/NDWI/SAVI satellite imagery |

### Step-by-Step API Setup

#### 1. Clerk Auth (Required)
```bash
# Already configured in .env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```
Sign up at https://clerk.com → Create Application → Copy Publishable Key

#### 2. OpenWeatherMap (For Weather Features)
```bash
# In .env
VITE_OWM_API_KEY=your_key_here
```
1. Go to https://openweathermap.org → Sign up (free)
2. Go to https://home.openweathermap.org/api_keys
3. Copy your API key

#### 3. Sentinel Hub (For 10m Resolution Data)
```bash
# In .env
VITE_SENTINEL_INSTANCE_ID=your-instance-id
VITE_SENTINEL_NDVI_LAYER=NDVI
VITE_SENTINEL_NDWI_LAYER=NDWI
```
1. Go to https://www.sentinel-hub.com → Sign up (free trial)
2. Dashboard → Configuration → Create new instance
3. Copy the Instance ID

#### 4. Firebase Firestore (For Cloud Sync)
```bash
# Already configured Firebase project
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=khet-map.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=khet-map
VITE_FIREBASE_STORAGE_BUCKET=khet-map.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
```
⚠️ **Note**: Firestore requires a Google Cloud billing account (even for free tier). Without it, KhetMap falls back to **localStorage** — all data stays on your device.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 18.0
- **npm** ≥ 9.0
- **JDK 17** (for Android build)
- **Android SDK** (for Android build)

### Development
```bash
# Clone the repository
git clone https://github.com/akshireddy99/khetmap.git
cd khetmap

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm run dev
```

Open **http://localhost:5173/** in your browser.

### Production Build
```bash
# Web build
npm run build

# Preview the build
npm run preview
```

---

## 📱 Building Android APK

### Step 1: Install JDK 17
```bash
# Windows (Admin)
winget install EclipseAdoptium.Temurin.17.JDK

# Verify
java -version   # Should show 17
javac -version  # Should NOT show "not found"
```

### Step 2: Set Environment Variables
```bash
set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.xx-hotspot
set PATH=%PATH%;%ANDROID_HOME%\platform-tools;%JAVA_HOME%\bin
```

### Step 3: Build Debug APK
```bash
npm run build
npx cap copy android
cd android
gradlew assembleDebug
```

APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

### Step 4: Build Signed Release APK
```bash
# Generate signing key (one-time)
keytool -genkey -v -keystore khetmap-release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias khetmap

# Create keystore.properties
echo storeFile=khetmap-release-key.jks > android/keystore.properties
echo storePassword=YOUR_PASSWORD >> android/keystore.properties
echo keyAlias=khetmap >> android/keystore.properties
echo keyPassword=YOUR_PASSWORD >> android/keystore.properties

# Build signed APK
cd android
gradlew assembleRelease
```

---

## 🏗️ Architecture

```
User's Browser / Mobile App
        ↓
   Clerk Auth (user signs in)
        ↓
   React App (Vite + TypeScript)
        ↓
┌─────────────────────────────────────────────┐
│  Firebase Firestore (cloud) — optional sync │
│  localStorage — offline-first fallback      │
│  NASA GIBS — satellite indices (free)        │
│  OpenStreetMap — land classification        │
│  Sentinel Hub — 10m resolution (optional)   │
│  OpenWeatherMap — weather data (optional)   │
└─────────────────────────────────────────────┘
        ↓
   Capacitor wrapper → Android APK / iOS IPA
```

### Tech Stack
| Layer | Technology |
|-------|-----------|
| **Framework** | React 19 + TypeScript |
| **Build** | Vite 6 |
| **Styling** | Tailwind CSS v4 |
| **Maps** | Leaflet + react-leaflet |
| **Auth** | Clerk |
| **Backend** | Firebase Firestore (optional) |
| **Mobile** | Capacitor |
| **Hosting** | Firebase Hosting |
| **Satellite** | NASA GIBS, Sentinel Hub |
| **Web** | Vercel (deploy) |

---

## 🗺️ Project Structure

```
KhetMap/
├── public/              # Static assets (icons, manifest)
│   ├── icon.svg         # SVG favicon
│   ├── icon-192.png     # PWA 192x192
│   ├── icon-512.png     # PWA 512x512
│   ├── manifest.json    # PWA manifest
│   └── gen-icons.mjs    # Icon generator script
├── src/
│   ├── app/
│   │   ├── components/  # UI components
│   │   │   ├── MapComponent.tsx      # Main map with Leaflet
│   │   │   ├── NDVILayer.tsx         # NDVI overlay
│   │   │   ├── NDWILayer.tsx         # NDWI overlay
│   │   │   ├── SAVILayer.tsx         # SAVI overlay
│   │   │   ├── WeatherForecast.tsx   # 5-day forecast
│   │   │   ├── WeatherOverlay.tsx    # Weather map overlay
│   │   │   ├── LandAnalysisModal.tsx # Land classification
│   │   │   ├── MultiSatelliteDashboard.tsx
│   │   │   ├── LocationSearch.tsx    # Search locations
│   │   │   ├── FileUpload.tsx        # KML/GeoJSON import
│   │   │   ├── DrawFieldControl.tsx  # Field drawing tools
│   │   │   └── ...
│   │   └── pages/       # App pages
│   │       ├── Welcome.tsx
│   │       ├── MapPage.tsx
│   │       ├── Farms.tsx
│   │       ├── FarmDetail.tsx
│   │       ├── Analyze.tsx
│   │       ├── Profile.tsx
│   │       ├── SignInPage.tsx
│   │       └── SignUpPage.tsx
│   ├── services/        # Business logic
│   │   ├── firebase.ts          # Firebase init
│   │   ├── database.ts          # Storage (Firestore + localStorage)
│   │   ├── satelliteSources.ts  # Satellite data sources
│   │   ├── sentinelHub.ts       # Sentinel Hub API
│   │   ├── fieldAnalysis.ts     # Field analysis engine
│   │   ├── landData.ts          # Land classification
│   │   ├── multiSatelliteAnalysis.ts
│   │   ├── shapefile.ts         # Shapefile export
│   │   └── ...
│   ├── contexts/         # React contexts
│   ├── constants/        # Constants
│   ├── styles/           # CSS
│   └── main.tsx          # Entry point
├── android/              # Android (Capacitor)
├── ios/                  # iOS (Capacitor)
├── capacitor.config.ts   # Capacitor config
├── vite.config.ts        # Vite config
├── firebase.json         # Firebase config
├── firestore.rules       # Firestore security rules
└── package.json
```

---

## 🌐 Deployment

### Firebase Hosting (Current)
```bash
npm run build
firebase deploy --only hosting
```
Live at: https://khet-map.web.app

### Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fakshireddy99%2Fkhetmap)

```bash
npm i -g vercel
vercel --prod
```

### Environment Variables Required for Deployment
| Variable | Required | Where to Get |
|----------|----------|-------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | ✅ | [Clerk Dashboard](https://clerk.com) |
| `VITE_FIREBASE_API_KEY` | ✅ | [Firebase Console](https://console.firebase.google.com) |
| `VITE_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase Console |
| `VITE_FIREBASE_PROJECT_ID` | ✅ | Firebase Console |
| `VITE_FIREBASE_STORAGE_BUCKET` | ✅ | Firebase Console |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ✅ | Firebase Console |
| `VITE_FIREBASE_APP_ID` | ⚡ | Firebase Console (optional) |
| `VITE_OWM_API_KEY` | ⚡ | [OpenWeatherMap](https://openweathermap.org) |
| `VITE_SENTINEL_INSTANCE_ID` | ⚡ | [Sentinel Hub](https://www.sentinel-hub.com) |

---

## 🤝 Contributing

We welcome contributions! KhetMap is open-source and community-driven.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style (TypeScript, strict typing)
- Add tests for new services
- Update README for new features
- Keep it free and open — no paid API integrations

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

## 🙏 Acknowledgments

- **NASA GIBS** for free satellite imagery
- **OpenStreetMap** contributors for landuse data
- **Clerk** for auth infrastructure
- **Capacitor** for mobile wrapping
- All the farmers who inspire this work

---

## 📬 Contact & Support

- **Project Home**: https://khet-map.web.app
- **GitHub**: https://github.com/akshireddy99/khetmap
- **Issues**: https://github.com/akshireddy99/khetmap/issues

---

*Built with ❤️ for the farming community of India*
