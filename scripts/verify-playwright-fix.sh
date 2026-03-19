#!/bin/bash

# Playwright Test Infrastructure - Verification Script
# This script verifies that the Playwright test infrastructure is properly configured

echo "🧪 Playwright Test Infrastructure - Verification"
echo "================================================"
echo ""

# Check if required files exist
echo "✅ Checking required files..."
FILES=(
  "tests/global-setup.ts"
  "tests/auth.setup.ts"
  "playwright.config.ts"
  "middleware.ts"
  ".env.test"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✓ $file exists"
  else
    echo "  ✗ $file MISSING"
    exit 1
  fi
done

echo ""
echo "✅ Checking Playwright config..."
if grep -q "globalSetup" playwright.config.ts; then
  echo "  ✓ globalSetup configured"
else
  echo "  ✗ globalSetup NOT configured"
  exit 1
fi

if grep -q "storageState" playwright.config.ts; then
  ✓ storageState configured"
else
  echo "  ✗ storageState NOT configured"
  exit 1
fi

echo ""
echo "✅ Checking middleware test bypass..."
if grep -q "PLAYWRIGHT_TEST_MODE" middleware.ts; then
  echo "  ✓ Test mode bypass implemented"
else
  echo "  ✗ Test mode bypass MISSING"
  exit 1
fi

echo ""
echo "✅ Checking package.json scripts..."
if grep -q "PLAYWRIGHT_TEST_MODE=true" package.json; then
  echo "  ✓ Test scripts updated"
else
  echo "  ✗ Test scripts NOT updated"
  exit 1
fi

echo ""
echo "✅ Creating auth directory..."
mkdir -p .playwright/.auth
echo "  ✓ .playwright/.auth created"

echo ""
echo "================================================"
echo "✅ All checks passed! Playwright infrastructure is configured correctly."
echo ""
echo "Next steps:"
echo "  1. Start dev server: npm run dev"
echo "  2. Run E2E tests: npm run test:e2e:chrome"
echo ""
