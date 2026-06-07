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
2. Add these **exact** values (copy from your `KhetMap/.env` file):

| Name | Value |
|------|-------|
| `VITE_FIREBASE_API_KEY` | `AIzaSyC1gRJtgz2yGQddSx9-HE7e-I_rp8tbt_4` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `kheat-map.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `kheat-map` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `kheat-map.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `733824481645` |
| `VITE_FIREBASE_APP_ID` | `1:733824481645:web:2dff76dc4f43f91ae7c264` |
| `VITE_OWM_API_KEY` | `37da66a5fcbb269af668bec74697f9c7` |
| `VITE_SENTINEL_INSTANCE_ID` | `96f50ac6-5a50-4ea1-ad77-e7cdd2c8cc7f` |
| `VITE_SENTINEL_NDWI_LAYER` | `NDWI` |
| `VITE_SENTINEL_NDVI_LAYER` | `NDVI` |

3. Click **"Save"** → **"Redeploy"** (a new deploy will start automatically)

### Step 5: Enable Firebase Google Sign-in

1. Go to [console.firebase.google.com](https://console.firebase.google.com/)
2. Select project **"kheat-map"**
3. Left menu → **Authentication** → **Sign-in method** tab
4. Click **Google** → Toggle **Enable** ON
5. Support email: select `gsai08613@gmail.com` (or your email)
6. Click **Save**

### Step 6: Create Firestore Database

1. In Firebase Console → **Firestore Database**
2. Click **"Create database"**
3. Select **test mode** (for development) → **Next** → **Enable**

### ✅ Done! Your App is Live!

Your KhetMap will be available at:
`https://khetmap.vercel.app` (or whatever name Vercel assigns)

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
- **Firebase Console**: [console.firebase.google.com](https://console.firebase.google.com/)
- **Get new OWM key**: [home.openweathermap.org/api_keys](https://home.openweathermap.org/api_keys)
