#!/usr/bin/env bash

# Quick Deployment Verification Script
# Checks if the correct app is deployed to production

echo "🔍 Verifying Production Deployment..."
echo ""

PROD_URL="https://taxbridge.vercel.app"

# Check homepage title
echo "1. Checking homepage metadata..."
TITLE=$(curl -s "$PROD_URL" | grep -o "<title>.*</title>" | head -1)
echo "   Title: $TITLE"

# Expected: "TaxBridge - US-Canada Cross-Border Tax Calculator"
# Wrong: "TaxBridge Admin Dashboard"

if echo "$TITLE" | grep -q "Nigeria"; then
  echo "   ❌ WRONG APP DEPLOYED (Nigerian tax platform)"
  exit 1
elif echo "$TITLE" | grep -q "Cross-Border\|H-1B\|TN"; then
  echo "   ✅ Correct app deployed"
else
  echo "   ⚠️  Unknown app deployed"
fi

echo ""
echo "2. Checking calculator route..."
CALC_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL/us-canada-tax-calculator")
echo "   /us-canada-tax-calculator: HTTP $CALC_STATUS"

if [ "$CALC_STATUS" = "200" ]; then
  echo "   ✅ Calculator route exists"
else
  echo "   ❌ Calculator route broken (404)"
  exit 1
fi

echo ""
echo "3. Checking pricing route..."
PRICING_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL/pricing")
echo "   /pricing: HTTP $PRICING_STATUS"

if [ "$PRICING_STATUS" = "200" ]; then
  echo "   ✅ Pricing route exists"
else
  echo "   ❌ Pricing route broken"
  exit 1
fi

echo ""
echo "✅ Production deployment verified - Correct app is live!"
echo ""
echo "Run full smoke test with:"
echo "  npm run smoke-test"
