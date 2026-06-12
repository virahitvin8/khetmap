#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# KhetMap — Push to GitHub with Personal Access Token
# Run this after creating a token at: https://github.com/settings/tokens
# ═══════════════════════════════════════════════════════════════════

# ── STEP 1: Paste your GitHub Personal Access Token below ──────────
# Create at: https://github.com/settings/tokens/new
# Required scopes: repo (full control)
GITHUB_TOKEN="YOUR_GITHUB_PAT_HERE"

# ── STEP 2: Your GitHub username ───────────────────────────────────
GITHUB_USER="virahitvin8"
REPO="khetmap"
VERSION="v1.0.0"

# ── Validate token ─────────────────────────────────────────────────
if [ "$GITHUB_TOKEN" = "YOUR_GITHUB_PAT_HERE" ]; then
  echo ""
  echo "❌ Please add your GitHub Personal Access Token!"
  echo ""
  echo "   How to get it:"
  echo "   1. Go to: https://github.com/settings/tokens/new"
  echo "   2. Note: 'KhetMap Push'"
  echo "   3. Expiration: 30 days"
  echo "   4. Scopes: ✅ repo (check this)"
  echo "   5. Click 'Generate token'"
  echo "   6. Copy the token and paste it in this file as GITHUB_TOKEN="
  echo ""
  exit 1
fi

cd "$(dirname "$0")"

echo "🌾 KhetMap GitHub Push — $VERSION"
echo "====================================="
echo "User: $GITHUB_USER"
echo "Repo: $REPO"
echo ""

# ── Configure remote with token ────────────────────────────────────
git remote set-url origin "https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${REPO}.git"

# ── Push main branch ───────────────────────────────────────────────
echo "📤 Pushing main branch..."
git push -u origin main --force

echo ""
echo "🏷️  Creating release tag $VERSION..."
git tag -d "$VERSION" 2>/dev/null || true
git tag -a "$VERSION" -m "KhetMap $VERSION — Satellite Farming Intelligence for India

🌾 First major release of KhetMap Android PWA

Features:
- Premium auth: Google OAuth + Phone OTP + Email
- Copernicus Sentinel-2 NDVI WMS (live crop health)
- Sentinel-1 SAR waterlogging detection
- HARI AI: Hinglish voice + text crop advisor (Gemini 2.0)
- KML / GeoJSON / CSV field importer
- Farms dashboard with NDVI health bars
- Analyze: weather, ET0, 7-day forecast
- Android PWA installable
- Capacitor APK config
- GitHub Actions auto-build + release

Jai Kisan! 🙏"

git push origin "$VERSION"

echo ""
echo "✅ PUSHED SUCCESSFULLY!"
echo ""
echo "📊 GitHub Actions is now building your APK..."
echo "   Watch: https://github.com/${GITHUB_USER}/${REPO}/actions"
echo ""
echo "📦 APK release will appear at:"
echo "   https://github.com/${GITHUB_USER}/${REPO}/releases/tag/${VERSION}"
echo ""
echo "📱 Install APK on Android:"
echo "   1. Download KhetMap-${VERSION}.apk from the release page"
echo "   2. On phone: Settings → Apps → Install unknown apps → Allow Chrome"
echo "   3. Tap the downloaded APK to install"
echo ""
echo "🌐 Web app (no install needed):"
echo "   https://astonishing-begonia-79345d.netlify.app/"
echo ""
echo "Jai Kisan! 🌾🛰️"
