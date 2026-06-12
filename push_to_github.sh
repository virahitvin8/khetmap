#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# KhetMap — Push all changes to GitHub & trigger APK release
# ═══════════════════════════════════════════════════════════════════
set -e

REPO_URL="https://github.com/virahitvin8/khetmap.git"
VERSION="v1.0.0"

echo "🌾 KhetMap GitHub Push Script"
echo "================================"

# ── Check git ──
if ! command -v git &> /dev/null; then
  echo "❌ git not found. Install with: sudo apt-get install git"
  exit 1
fi

cd "$(dirname "$0")"

# ── Configure git (if not set) ──
git config --global user.email "akshitvinay4636@gmail.com" 2>/dev/null || true
git config --global user.name "Akshit Vinay" 2>/dev/null || true

# ── Init git if needed ──
if [ ! -d ".git" ]; then
  git init
  git remote add origin "$REPO_URL"
  git branch -M main
fi

# ── Stage all files ──
git add -A

# ── Commit ──
git commit -m "🌾 feat: Full Khet Map v1.0 — HARI AI + Satellite NDVI + Phone OTP + PWA + GitHub Actions APK release

## What's new
- Premium animated auth (Google OAuth + Phone OTP + Email)
- Live Copernicus Sentinel-2 NDVI WMS overlay
- Sentinel-1 SAR waterlogging layer
- HARI AI (Hinglish crop advisor, voice + text, Gemini integration)
- KML / GeoJSON / CSV field import with drag-drop
- Farms dashboard with health scores & NDVI trend charts
- Analyze page with live Open-Meteo weather + 7-day forecast
- PWA manifest (Android installable)
- Capacitor config for native APK build
- GitHub Actions CI/CD: auto-build APK + release on git tag
- Full README with GitHub stats, capsule-render banners, badges

🛰️ Powered by: Sentinel-2 · Sentinel-1 · NASA POWER · Open-Meteo · Firebase
📱 Android: PWA install + Capacitor APK
🤖 AI: HARI (rule-based + Gemini 2.0)

Jai Kisan! 🙏" || echo "Nothing to commit"

# ── Push to main ──
echo ""
echo "📤 Pushing to GitHub..."
git push origin main

echo ""
echo "🏷️  Creating release tag $VERSION..."
git tag -a "$VERSION" -m "KhetMap $VERSION — Satellite Farming Intelligence for India

🌾 First major release of KhetMap Android PWA
📱 Install on any Android phone via Chrome (no Play Store needed)
🛰️ NDVI · SAR · Weather · HARI AI · Field Mapping" 2>/dev/null || echo "Tag already exists"

git push origin "$VERSION" 2>/dev/null || echo "Tag already pushed"

echo ""
echo "✅ Done! GitHub Actions will now:"
echo "   1. Build the React PWA"
echo "   2. Compile Android APK via Capacitor"
echo "   3. Create GitHub Release with APK download"
echo ""
echo "🔗 Check progress: https://github.com/virahitvin8/khetmap/actions"
echo "📦 Release will appear: https://github.com/virahitvin8/khetmap/releases"
echo ""
echo "📱 To install APK: Download from release → Enable 'Unknown sources' → Install"
echo "🌐 Web app: https://astonishing-begonia-79345d.netlify.app/"
echo ""
echo "Jai Kisan! 🌾🛰️"
