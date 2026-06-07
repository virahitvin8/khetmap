#!/bin/bash
# KhetMap Deployment Script
# =========================
# Usage: bash deploy.sh YOUR_GITHUB_USERNAME
#
# This script deploys KhetMap to Vercel in one go.
# Prerequisites: git, vercel CLI installed and logged in.

set -e

if [ -z "$1" ]; then
  echo "❌ Usage: bash deploy.sh YOUR_GITHUB_USERNAME"
  echo ""
  echo "Example: bash deploy.sh johndoe"
  exit 1
fi

USERNAME=$1
REPO_NAME="khetmap"

echo "🚀 Deploying KhetMap to Vercel..."
echo ""

# Step 1: Initialize git repo
echo "📦 Step 1: Setting up git..."
rm -rf .git 2>/dev/null || true
git init
git add .
git commit -m "Initial commit — KhetMap full build" --allow-empty
echo "✅ Git initialized"

# Step 2: Create GitHub repo and push
echo ""
echo "📤 Step 2: Push to GitHub..."
echo "   Make sure: https://github.com/$USERNAME/$REPO_NAME exists (create it first!)"
echo "   Press ENTER when ready..."
read -r

# Try to add remote and push
if git remote get-url origin 2>/dev/null; then
  echo "Remote already exists, skipping..."
else
  git remote add origin "https://github.com/$USERNAME/$REPO_NAME.git"
fi
git branch -M main
git push -u origin main 2>&1 || {
  echo ""
  echo "⚠️  GitHub push failed. Make sure:"
  echo "   1. The repo exists at https://github.com/$USERNAME/$REPO_NAME"
  echo "   2. You have push access"
  echo "   3. You're authenticated via 'gh auth login' or personal access token"
  echo ""
  echo "Fix the issue and run: git push -u origin main"
}

# Step 3: Deploy to Vercel
echo ""
echo "⚡ Step 3: Deploying to Vercel..."
npx vercel --prod --yes 2>&1 || {
  echo ""
  echo "⚠️  Vercel deploy failed. You can deploy manually:"
  echo "   1. Go to https://vercel.com/new"
  echo "   2. Import your $USERNAME/$REPO_NAME repo"
  echo "   3. It's pre-configured via vercel.json"
}

echo ""
echo "🎉 Done! Your KhetMap is being deployed."
echo ""
echo "📌 Next steps:"
echo "   1. Add env vars in Vercel Dashboard → Project → Settings → Environment Variables"
echo "   2. See DEPLOY.md for the complete variable list"
echo "   3. Enable Google Sign-in in Firebase Console"
echo ""
echo "🔗 Vercel Dashboard: https://vercel.com/dashboard"
echo "🔗 Firebase Console: https://console.firebase.google.com/project/kheat-map"
