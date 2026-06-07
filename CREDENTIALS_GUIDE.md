# 🔑 KhetMap Credentials Setup Guide

## Complete walkthrough for all API keys — 100% free

---

## 📊 Services Overview

| Service | What It Does | Cost | Do I Need It? |
|---------|-------------|------|---------------|
| **Firebase** (or Supabase) | User login + database to save fields | **$0** forever | 🔴 REQUIRED |
| **OpenWeatherMap** | Weather overlay + 5-day forecast | **$0** forever | 🟡 RECOMMENDED |
| **Sentinel Hub / Copernicus** | High-res NDWI water analysis (10m) | **$0** forever | 🟢 OPTIONAL |
| **NASA GIBS** | NDVI crop health (250m) — *already works* | **$0** forever | ✅ Built-in |
| **ESRI Satellite** | Satellite basemap — *already works* | **$0** forever | ✅ Built-in |
| **OpenStreetMap** | Street map + search — *already works* | **$0** forever | ✅ Built-in |

---

## CHOOSE: Firebase OR Supabase (both free)

| Feature | Firebase (Google) | Supabase (Open Source) |
|---------|-------------------|----------------------|
| **Free tier** | Spark Plan | Free Plan |
| **Database** | 50K reads/day, 20K writes/day | 500MB database |
| **Auth** | Google, Email, 10+ providers | Google, Email, GitHub, 10+ |
| **Users** | Unlimited | 50,000 monthly active |
| **Credit card?** | ❌ Not needed | ❌ Not needed |
| **Learning curve** | Easy | Medium |
| **KhetMap currently uses** | ✅ Yes (built-in) | ❌ Would need migration |

**Current KhetMap uses Firebase.** To switch to Supabase would require rewriting the auth and database code. Since Firebase Spark plan is completely free with no credit card, I recommend sticking with Firebase.

---

## 1. 🔥 Firebase Setup *(10 minutes, FREE)*

### Steps:

| # | Step | Link |
|---|------|------|
| 1 | Go to Firebase Console | [console.firebase.google.com](https://console.firebase.google.com/) |
| 2 | Click **"Create a project"** | |
| 3 | Name: **`khetmap`** → Disable Google Analytics → **Create** | |
| 4 | Click **Web icon** (`</>`) | |
| 5 | App nickname: **`khetmap-web`** → **Register** | |
| 6 | **Copy the 6 config values** shown → paste into `.env` | |
| 7 | Go to **Authentication → Sign-in method → Google → Enable** | |
| 8 | Go to **Firestore Database → Create → Start in test mode → Enable** | |

### Paste these 6 values in `.env`:

```env
VITE_FIREBASE_API_KEY=AIzaSy... (paste the long string)
VITE_FIREBASE_AUTH_DOMAIN=khetmap.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=khetmap
VITE_FIREBASE_STORAGE_BUCKET=khetmap.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc...
```

---

## 2. 🌤️ OpenWeatherMap Setup *(3 minutes, FREE)*

| # | Step | Link |
|---|------|------|
| 1 | Go to signup page | [home.openweathermap.org/users/sign_up](https://home.openweathermap.org/users/sign_up) |
| 2 | Create account with your email | |
| 3 | Verify your email | |
| 4 | Go to API Keys page | [home.openweathermap.org/api_keys](https://home.openweathermap.org/api_keys) |
| 5 | Copy the default API key shown | |

### Paste in `.env`:

```env
VITE_OWM_API_KEY=your_api_key_here
```

> ⚠️ New keys can take up to 2 hours to activate.

---

## 3. 🛰️ Sentinel Hub for High-Res NDWI *(Optional, FREE)*

### ✅ Recommended: Copernicus Data Space (FREE forever)

This gives you **10m resolution** NDWI (vs 250m from NASA). Same Sentinel-2 data, free forever.

| # | Step | Link |
|---|------|------|
| 1 | Register at Copernicus Data Space | [dataspace.copernicus.eu](https://dataspace.copernicus.eu/) |
| 2 | Click **"Sign up"** → fill email, name, password | |
| 3 | Verify email → Log in | |
| 4 | Open Sentinel Hub Dashboard | [sentinel-hub.com/develop/dashboard](https://www.sentinel-hub.com/develop/dashboard/) |
| 5 | Click **"Sign in with Copernicus Data Space"** | |
| 6 | Go to **Configuration Utility** → **Create new configuration** | |
| 7 | Name: `khetmap-ndwi` → **Add layer** | |
| 8 | Name: `NDWI` → Source: `Sentinel-2 L2A` | |
| 9 | **Paste this evalscript:** | |
| 10 | Save → Copy the **Instance ID** from the config card | |

```javascript
//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B03", "B08"] }],
    output: { bands: 1, sampleType: "FLOAT32" }
  };
}
function evaluatePixel(sample) {
  let ndwi = (sample.B03 - sample.B08) / (sample.B03 + sample.B08);
  return [ndwi];
}
```

### Paste in `.env`:

```env
VITE_SENTINEL_INSTANCE_ID=1234abcd-5678-ef90-1234-567890abcdef
VITE_SENTINEL_LAYER_NAME=NDWI
```

### ⏳ Alternative: Planet.com (30-day trial)

If your Planet.com subscription is still active, you can use it. After it expires, switch to Copernicus above.

---

## 📋 Complete `.env` File

Create `KhetMap/.env` with:

```env
# 🔥 Firebase (REQUIRED)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# 🌤️ OpenWeatherMap (RECOMMENDED)
VITE_OWM_API_KEY=

# 🛰️ Sentinel Hub (OPTIONAL — falls back to free NASA GIBS)
VITE_SENTINEL_INSTANCE_ID=
VITE_SENTINEL_LAYER_NAME=NDWI
```

---

## ❓ What If I Can't Access These?

**Don't worry.** The app still works without any API keys for:

- ✅ Satellite map (ESRI: free)
- ✅ Street map (OSM: free)
- ✅ NDVI crop health (NASA GIBS: free)
- ✅ NDWI water index (NASA GIBS: free, 250m)
- ✅ SAVI soil analysis (NASA GIBS: free)
- ✅ Location search (Nominatim: free)
- ✅ Draw fields on map
- ✅ Upload KML/CSV/GeoJSON
- ✅ Export fields as files
- ✅ Multi-language (Telugu/Hindi/English)

**Only these need API keys:**
- ❌ Google Sign-in → needs Firebase
- ❌ Save fields to cloud → needs Firebase
- ❌ Weather overlay → needs OpenWeatherMap
- ❌ High-res NDWI (10m) → needs Sentinel Hub (optional; 250m free)

---

## 📘 Need More Help?

Choose a walkthrough below and I'll guide you through every click!
