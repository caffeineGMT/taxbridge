#!/bin/bash
# Fix Webpack Runtime Missing - Clean Reinstall Script
# Task: [P0-CRITICAL] Dev Server 500 Errors - Webpack Runtime Missing

set -e

echo "🔧 Fixing webpack runtime errors..."
echo ""

# Step 1: Stop any running dev servers
echo "1️⃣  Stopping dev servers..."
pkill -f "next dev" 2>/dev/null || true
sleep 2

# Step 2: Remove corrupted build artifacts and dependencies
echo "2️⃣  Removing corrupted files..."
rm -rf .next
rm -rf node_modules
rm -f package-lock.json
echo "   ✅ Cleaned .next, node_modules, package-lock.json"

# Step 3: Clear npm cache
echo "3️⃣  Clearing npm cache..."
npm cache clean --force
echo "   ✅ npm cache cleared"

# Step 4: Fresh install
echo "4️⃣  Installing dependencies (this may take 2-3 minutes)..."
npm install
echo "   ✅ Dependencies installed"

# Step 5: Verify Next.js installation
echo "5️⃣  Verifying Next.js installation..."
if [ -f "node_modules/.bin/next" ]; then
  echo "   ✅ Next.js binary found"
  ./node_modules/.bin/next --version
else
  echo "   ❌ Next.js binary missing - installation failed"
  exit 1
fi

# Step 6: Test build
echo "6️⃣  Testing production build..."
npm run build
if [ $? -eq 0 ]; then
  echo "   ✅ Build successful!"
else
  echo "   ❌ Build failed - see errors above"
  exit 1
fi

# Step 7: Start dev server
echo "7️⃣  Starting dev server..."
echo ""
echo "✨ Fix complete! Starting development server..."
echo "   Dev server will be available at http://localhost:3000"
echo ""
npm run dev
