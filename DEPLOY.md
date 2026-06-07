# 🚀 KhetMap Deployment Guide

## Deploy to Vercel in 5 Minutes (FREE)

### Prerequisites
1. A **GitHub account** — [github.com/signup](https://github.com/signup) if you don't have one
2. A **Vercel account** — [vercel.com/signup](https://vercel.com/signup) (use "Continue with GitHub" — it's free)

### Step 1: Create a GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: **`khetmap`**
3. Keep it **Public** (or Private if you prefer)
4. Click **"Create repository"**

### Step 2: Push Code to GitHub

Run these commands in your terminal (from inside the `KhetMap` folder):

```bash
cd KhetMap

# Initialize git and commit
git init
git add .
git commit -m "Initial commit — KhetMap full build"

# Push to YOUR GitHub repo (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/khetmap.git
git branch -M main
git push -u origin main
```

> ⚠️ Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 3: Import into Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Find and select **"khetmap"** (the repo you just created)
4. Vercel will auto-detect it's a **Vite** project
5. Click **"Deploy"** 🎉

### Step 4: Add Environment Variables (CRITICAL)

After the first deploy succeeds:

1. In Vercel Dashboard → your project → **Settings** → **Environment Variables**
2. Add these values (if you have the corresponding API keys):

| Name | Value | Required? |
|------|-------|-----------|
| `VITE_OWM_API_KEY` | `your_openweathermap_api_key` | 🟡 Recommended (weather) |
| `VITE_SENTINEL_INSTANCE_ID` | `your_instance_id` | 🟢 Optional (high-res NDWI) |
| `VITE_SENTINEL_NDWI_LAYER` | `NDWI` | 🟢 Optional |
| `VITE_SENTINEL_NDVI_LAYER` | `NDVI` | 🟢 Optional |

3. Click **"Save"** → **"Redeploy"**

### Step 5: ✅ Done! Your App is Live!

Your KhetMap will be available at:
`https://khetmap.vercel.app` (or whatever name Vercel assigns)

**No sign-up required** — the app works entirely in the browser with no backend needed.

---

## 🖥️ Run Locally (Optional)

```bash
cd KhetMap
npm run dev
```

Open `http://localhost:5173/` in your browser.

---

## 🔄 Auto-Deploy Updates

Every time you push to GitHub, Vercel automatically deploys:

```bash
git add .
git commit -m "your changes"
git push
```

---

## ❓ Need Help?

- **Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)
- **Get OWM key**: [home.openweathermap.org/api_keys](https://home.openweathermap.org/api_keys)
