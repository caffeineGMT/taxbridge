#!/bin/bash

###############################################################################
# Stripe Production Mode Verification Script
#
# PURPOSE: Verify Stripe is configured in LIVE production mode
# USAGE: ./scripts/verify-stripe-production.sh
#
# IMPORTANT: Run this AFTER configuring Vercel environment variables
###############################################################################

set -e  # Exit on error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 STRIPE PRODUCTION MODE VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Function to check environment variable
check_env() {
  local var_name=$1
  local expected_prefix=$2
  local var_value=${!var_name}

  if [[ -z "$var_value" ]]; then
    echo -e "${RED}❌ $var_name is NOT SET${NC}"
    ((FAILED++))
    return 1
  elif [[ "$var_value" == *"YOUR"* ]] || [[ "$var_value" == *"PLACEHOLDER"* ]]; then
    echo -e "${RED}❌ $var_name is a PLACEHOLDER: ${var_value:0:30}...${NC}"
    ((FAILED++))
    return 1
  elif [[ -n "$expected_prefix" ]] && [[ ! "$var_value" == $expected_prefix* ]]; then
    echo -e "${RED}❌ $var_name does NOT start with '$expected_prefix': ${var_value:0:20}...${NC}"
    ((FAILED++))
    return 1
  else
    echo -e "${GREEN}✅ $var_name is configured${NC}"
    if [[ -n "$expected_prefix" ]]; then
      echo -e "   ${GREEN}→ Starts with: $expected_prefix${NC}"
    fi
    ((PASSED++))
    return 0
  fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 STEP 1: CHECKING STRIPE API KEYS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

check_env "STRIPE_SECRET_KEY" "sk_live_"
check_env "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" "pk_live_"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🪝 STEP 2: CHECKING WEBHOOK SECRET"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

check_env "STRIPE_WEBHOOK_SECRET" "whsec_"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💰 STEP 3: CHECKING PRICE IDs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

check_env "STRIPE_BASIC_PRICE_ID" "price_"
check_env "NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID" "price_"
check_env "STRIPE_PRO_PRICE_ID" "price_"
check_env "NEXT_PUBLIC_STRIPE_PRO_PRICE_ID" "price_"
check_env "STRIPE_ENTERPRISE_PRICE_ID" "prod_"
check_env "NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID" "prod_"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 STEP 4: CHECKING APP URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [[ -z "$NEXT_PUBLIC_APP_URL" ]]; then
  echo -e "${RED}❌ NEXT_PUBLIC_APP_URL is NOT SET${NC}"
  ((FAILED++))
elif [[ "$NEXT_PUBLIC_APP_URL" == "http://localhost"* ]]; then
  echo -e "${YELLOW}⚠️  NEXT_PUBLIC_APP_URL is localhost (expected for local testing)${NC}"
  echo -e "   ${YELLOW}→ $NEXT_PUBLIC_APP_URL${NC}"
elif [[ "$NEXT_PUBLIC_APP_URL" == "https://taxbridgecpa.com" ]]; then
  echo -e "${GREEN}✅ NEXT_PUBLIC_APP_URL is production domain${NC}"
  echo -e "   ${GREEN}→ $NEXT_PUBLIC_APP_URL${NC}"
  ((PASSED++))
else
  echo -e "${YELLOW}⚠️  NEXT_PUBLIC_APP_URL is set to: $NEXT_PUBLIC_APP_URL${NC}"
  echo -e "   ${YELLOW}Expected: https://taxbridgecpa.com${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 VERIFICATION SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TOTAL=$((PASSED + FAILED))
echo -e "${GREEN}✅ Passed: $PASSED / $TOTAL${NC}"
echo -e "${RED}❌ Failed: $FAILED / $TOTAL${NC}"
echo ""

if [[ $FAILED -gt 0 ]]; then
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${RED}❌ VERIFICATION FAILED${NC}"
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "${YELLOW}NEXT STEPS:${NC}"
  echo ""
  echo "1. Fix the failed environment variables above"
  echo "2. Update Vercel environment variables:"
  echo "   https://vercel.com/dashboard → Settings → Environment Variables"
  echo ""
  echo "3. OR set them locally for testing:"
  echo "   export STRIPE_SECRET_KEY=sk_live_YOUR_KEY"
  echo "   export NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY"
  echo "   # ... (set all failed variables)"
  echo ""
  echo "4. Re-run this script to verify"
  echo ""
  exit 1
else
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}✅ ALL CHECKS PASSED - STRIPE IS IN PRODUCTION MODE${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "${YELLOW}NEXT STEPS:${NC}"
  echo ""
  echo "1. ✅ Run a test checkout flow:"
  echo "   → Open: https://taxbridgecpa.com"
  echo "   → Sign up → Complete calculator → Upgrade to Pro"
  echo "   → Use test card: 4242 4242 4242 4242"
  echo ""
  echo "2. ✅ Verify in Stripe Dashboard:"
  echo "   → https://dashboard.stripe.com/customers"
  echo "   → Look for NEW customer with email from test"
  echo "   → Check: Is it in PRODUCTION mode (not test)?"
  echo ""
  echo "3. ✅ Check webhook events:"
  echo "   → https://dashboard.stripe.com/webhooks"
  echo "   → Find: https://taxbridgecpa.com/api/stripe/webhook"
  echo "   → Verify: Recent events show ✅ successful delivery"
  echo ""
  echo "4. ⚠️  REFUND test payment immediately:"
  echo "   → Stripe → Customers → [Test Customer] → Refund"
  echo ""
  echo "5. 📸 Take screenshots for evidence:"
  echo "   → Vercel env vars (sk_live_*** redacted)"
  echo "   → Stripe customer created"
  echo "   → Webhook events delivered"
  echo "   → Database user with subscription_tier = 'pro'"
  echo "   → Refund confirmation"
  echo ""
  exit 0
fi
