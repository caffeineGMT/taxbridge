#!/bin/bash

# Production Site Health Check Script
# Verifies taxbridgecpa.com is fully operational

echo "🔍 TaxBridge Production Health Check"
echo "====================================="
echo ""

DOMAIN="${1:-taxbridgecpa.com}"
FAIL_COUNT=0

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_dns() {
    echo "1️⃣  Checking DNS resolution for $DOMAIN..."
    if nslookup $DOMAIN > /dev/null 2>&1; then
        echo -e "${GREEN}✅ DNS resolves successfully${NC}"
        nslookup $DOMAIN | grep "Address:" | tail -1
        return 0
    else
        echo -e "${RED}❌ DNS FAILURE: $DOMAIN does not resolve (NXDOMAIN)${NC}"
        echo "   → Action: Configure DNS records or register domain"
        return 1
    fi
}

check_route() {
    local route=$1
    local url="https://${DOMAIN}${route}"
    echo ""
    echo "Checking: $url"

    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>&1)

    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ 200 OK${NC}"
        return 0
    else
        echo -e "${RED}❌ HTTP $HTTP_CODE (Expected 200)${NC}"
        ((FAIL_COUNT++))
        return 1
    fi
}

check_content() {
    local url="https://${DOMAIN}/"
    echo ""
    echo "3️⃣  Verifying correct application is deployed..."

    TITLE=$(curl -s "$url" 2>&1 | grep -o '<title>.*</title>' | head -1)

    if echo "$TITLE" | grep -q "US-Canada Cross-Border"; then
        echo -e "${GREEN}✅ Correct application deployed${NC}"
        echo "   Title: $TITLE"
        return 0
    elif echo "$TITLE" | grep -q "Uganda"; then
        echo -e "${RED}❌ WRONG APPLICATION: Uganda fiscal app deployed${NC}"
        echo "   Title: $TITLE"
        echo "   → Action: Fix Vercel custom domain configuration"
        ((FAIL_COUNT++))
        return 1
    else
        echo -e "${YELLOW}⚠️  Unable to verify application${NC}"
        echo "   Title: $TITLE"
        return 1
    fi
}

# Run checks
check_dns
DNS_OK=$?

if [ $DNS_OK -eq 0 ]; then
    echo ""
    echo "2️⃣  Checking critical routes..."

    check_route "/"
    check_route "/calculator"
    check_route "/pricing"
    check_route "/api/health"
    check_route "/sitemap.xml"

    check_content
else
    echo ""
    echo -e "${RED}⚠️  Skipping route checks - DNS must be fixed first${NC}"
    FAIL_COUNT=10  # Force overall failure
fi

echo ""
echo "====================================="
if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED - Site is healthy!${NC}"
    exit 0
else
    echo -e "${RED}❌ $FAIL_COUNT CHECKS FAILED - Action required${NC}"
    echo ""
    echo "📖 See docs/PRODUCTION_503_EMERGENCY_FIX.md for detailed fix instructions"
    exit 1
fi
