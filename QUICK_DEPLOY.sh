#!/bin/bash
# QUICK DEPLOYMENT GUIDE - P0-CRITICAL
# Run this immediately to deploy correct app to production

echo "🚨 P0-CRITICAL: Deploying correct app to production"
echo ""
echo "Current Issue:"
echo "  ❌ www.taxbridge.app shows Uganda EFRIS app (WRONG)"
echo "  ✅ Should show: TaxBridge US-Canada Tax Calculator"
echo ""

# Step 1: Build verification
echo "[1/3] Verifying build..."
npm install
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Fix errors before deploying."
    exit 1
fi

echo "✅ Build passed"
echo ""

# Step 2: Deploy
echo "[2/3] Deploying to Vercel..."
echo ""
echo "⚠️  IMPORTANT: This requires Vercel authentication"
echo ""
echo "If using Vercel CLI:"
echo "  1. Run: vercel login"
echo "  2. Run: vercel --prod"
echo ""
echo "If using Vercel Dashboard:"
echo "  1. Go to: https://vercel.com/dashboard"
echo "  2. Find project: cross-border-tax"
echo "  3. Click: Deploy"
echo "  4. Select branch: main"
echo ""
read -p "Have you deployed? (yes/no): " deployed

if [ "$deployed" != "yes" ]; then
    echo "Deployment cancelled"
    exit 0
fi

# Step 3: Verify
echo ""
echo "[3/3] Verifying deployment..."
sleep 5

APP_NAME=$(curl -sL https://www.taxbridge.app/api/health | grep -o '"application":"[^"]*"' | cut -d'"' -f4)

if echo "$APP_NAME" | grep -q "US-Canada"; then
    echo ""
    echo "✅ SUCCESS! Correct app is now live!"
    echo "   Application: $APP_NAME"
    echo ""
    echo "Next steps:"
    echo "  1. Test calculator: https://www.taxbridge.app/us-canada-tax-calculator"
    echo "  2. Test dashboard: https://www.taxbridge.app/dashboard"
    echo "  3. Verify Stripe: https://www.taxbridge.app/pricing"
    echo "  4. Check Sentry: https://sentry.io"
else
    echo ""
    echo "❌ WARNING: Wrong app still deployed!"
    echo "   Current app: $APP_NAME"
    echo ""
    echo "Domain configuration issue detected."
    echo "Manual fix required:"
    echo "  1. Go to Vercel Dashboard"
    echo "  2. Find the Uganda EFRIS project"
    echo "  3. Remove domains: www.taxbridge.app, taxbridge.app"
    echo "  4. Go to cross-border-tax project"
    echo "  5. Add domains: www.taxbridge.app, taxbridge.app"
fi
