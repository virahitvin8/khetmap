# 🔑 KhetMap Credentials Setup Guide

## Complete walkthrough for optional API keys — FREE

---

## 📊 Services Overview

| Service | What It Does | Cost | Do I Need It? |
|---------|-------------|------|---------------|
| **OpenWeatherMap** | Weather overlay + 5-day forecast | **$0** forever | 🟡 RECOMMENDED |
| **Sentinel Hub / Copernicus** | High-res NDWI water analysis (10m) | **$0** forever | 🟢 OPTIONAL |
| **NASA GIBS** | NDVI crop health (250m) — *already works* | **$0** forever | ✅ Built-in |
| **ESRI Satellite** | Satellite basemap — *already works* | **$0** forever | ✅ Built-in |
| **OpenStreetMap** | Street map + search — *already works* | **$0** forever | ✅ Built-in |

---

## 🌤️ OpenWeatherMap Setup *(3 minutes, FREE)*

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

## 🛰️ Sentinel Hub for High-Res NDWI *(Optional, FREE)*

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

---

## 📋 Complete `.env` File

Create `KhetMap/.env` with:

```env
# 🌤️ OpenWeatherMap (RECOMMENDED)
VITE_OWM_API_KEY=

# 🛰️ Sentinel Hub (OPTIONAL — falls back to free NASA GIBS)
VITE_SENTINEL_INSTANCE_ID=
VITE_SENTINEL_LAYER_NAME=NDWI
```

---

## ✅ What Works Without Any API Keys

The app works fully without any API keys for:

- ✅ Satellite map (ESRI: free)
- ✅ Street map (OSM: free)
- ✅ NDVI crop health (NASA GIBS: free)
- ✅ NDWI water index (NASA GIBS: free, 250m)
- ✅ SAVI soil analysis (NASA GIBS: free)
- ✅ Location search (Nominatim: free)
- ✅ Draw fields on map
- ✅ Upload KML/CSV/GeoJSON
- ✅ Export fields as files
- ✅ Save fields locally (localStorage)
- ✅ Multi-language (Telugu/Hindi/English)

**Only these need API keys:**
- ❌ Weather overlay → needs OpenWeatherMap
- ❌ High-res NDWI (10m) → needs Sentinel Hub (optional; 250m free)

---

## 📘 Need More Help?

Choose a walkthrough below and I'll guide you through every click!
