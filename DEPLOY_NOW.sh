#!/bin/bash

###############################################################################
# EMERGENCY PRODUCTION DEPLOYMENT SCRIPT
# P0-CRITICAL: Wrong application is live on www.taxbridge.app
#
# This script will:
# 1. Verify the build passes locally
# 2. Re-authenticate with Vercel
# 3. Relink the project
# 4. Deploy to production
# 5. Verify the deployment
#
# USAGE: ./DEPLOY_NOW.sh
###############################################################################

set -e  # Exit on any error

echo "=========================================="
echo "🚨 EMERGENCY PRODUCTION DEPLOYMENT"
echo "=========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Clean build
echo -e "${YELLOW}[1/6] Cleaning build cache...${NC}"
rm -rf .next out
echo -e "${GREEN}✓ Cache cleared${NC}"
echo ""

# Step 2: Verify build
echo -e "${YELLOW}[2/6] Running production build...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build succeeded${NC}"
else
    echo -e "${RED}✗ Build failed - cannot deploy${NC}"
    exit 1
fi
echo ""

# Step 3: Verify Vercel CLI installed
echo -e "${YELLOW}[3/6] Checking Vercel CLI...${NC}"
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}✗ Vercel CLI not found${NC}"
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi
echo -e "${GREEN}✓ Vercel CLI ready ($(vercel --version))${NC}"
echo ""

# Step 4: Authenticate
echo -e "${YELLOW}[4/6] Authenticating with Vercel...${NC}"
echo "This will open a browser window. Please log in as: caffeinegmt"
vercel login
echo -e "${GREEN}✓ Authenticated${NC}"
echo ""

# Step 5: Relink project
echo -e "${YELLOW}[5/6] Relinking Vercel project...${NC}"
rm -rf .vercel
vercel link --yes
echo -e "${GREEN}✓ Project linked${NC}"
echo ""

# Step 6: Deploy to production
echo -e "${YELLOW}[6/6] Deploying to production...${NC}"
echo "⚠️  This will deploy to www.taxbridge.app"
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${RED}Deployment cancelled${NC}"
    exit 0
fi

vercel --prod

echo ""
echo -e "${GREEN}=========================================="
echo "✅ DEPLOYMENT COMPLETE"
echo "==========================================${NC}"
echo ""

# Verify deployment
echo "Verifying deployment..."
sleep 10  # Wait for DNS propagation

TITLE=$(curl -sL https://www.taxbridge.app | grep -o '<title>[^<]*</title>')
echo "Production title: $TITLE"

if echo "$TITLE" | grep -q "Uganda"; then
    echo -e "${RED}⚠️  WARNING: Wrong app still deployed!${NC}"
    echo "The Uganda EFRIS app is still live. Domain configuration issue."
    echo ""
    echo "MANUAL ACTION REQUIRED:"
    echo "1. Log into Vercel Dashboard: https://vercel.com/dashboard"
    echo "2. Go to the Uganda EFRIS project"
    echo "3. Remove domains: www.taxbridge.app and taxbridge.app"
    echo "4. Go to cross-border-tax project"
    echo "5. Add domains: www.taxbridge.app and taxbridge.app"
    exit 1
else
    echo -e "${GREEN}✅ Deployment verified - correct app is now live!${NC}"
fi

echo ""
echo "Next steps:"
echo "1. Test calculator: https://www.taxbridge.app/us-canada-tax-calculator"
echo "2. Test dashboard: https://www.taxbridge.app/dashboard"
echo "3. Verify Stripe checkout works"
echo "4. Check Sentry for errors: https://sentry.io"
echo ""
