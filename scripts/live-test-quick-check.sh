#!/bin/bash

# Live Payment Test - Quick Status Check
# Run this script at any point during the test to get current status

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}  🧪 Live Payment Test - Quick Status Check${RESET}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if email provided
EMAIL=${1:-"livetest"}

echo -e "${CYAN}🔍 Checking test user: ${EMAIL}${RESET}"
echo ""

# Check if database exists
if [ ! -f "data/taxbridge.db" ]; then
    echo -e "${RED}❌ Database not found: data/taxbridge.db${RESET}"
    echo "   Make sure you're in the project root directory."
    exit 1
fi

# Check if user exists
USER_COUNT=$(sqlite3 data/taxbridge.db "SELECT COUNT(*) FROM user_profiles WHERE email LIKE '%${EMAIL}%';")

if [ "$USER_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No test user found matching: ${EMAIL}${RESET}"
    echo ""
    echo "Expected at this stage:"
    echo "  • User should be created via sign-up at https://taxbridge.app/sign-up"
    echo "  • Use email: youremail+livetest@gmail.com"
    echo ""
    echo "Next step:"
    echo "  → Go to Part 1 in LIVE_PAYMENT_TEST_GUIDE.md"
    echo ""
    exit 0
fi

# Get user details
USER_DATA=$(sqlite3 data/taxbridge.db "SELECT id, email, subscription_tier, subscription_status, stripe_customer_id, stripe_subscription_id FROM user_profiles WHERE email LIKE '%${EMAIL}%' LIMIT 1;")

IFS='|' read -r USER_ID USER_EMAIL TIER STATUS CUSTOMER_ID SUB_ID <<< "$USER_DATA"

echo -e "${GREEN}✓ User found${RESET}"
echo "  User ID: ${USER_ID}"
echo "  Email: ${USER_EMAIL}"
echo ""

# Check tier
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}  💳 Subscription Status${RESET}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$TIER" == "free" ]; then
    echo -e "  Tier: ${YELLOW}FREE${RESET}"
elif [ "$TIER" == "pro" ]; then
    echo -e "  Tier: ${GREEN}PRO${RESET}"
elif [ "$TIER" == "enterprise" ]; then
    echo -e "  Tier: ${BLUE}ENTERPRISE${RESET}"
else
    echo -e "  Tier: ${RED}${TIER}${RESET}"
fi

if [ -z "$STATUS" ] || [ "$STATUS" == "null" ]; then
    echo "  Status: (none)"
elif [ "$STATUS" == "active" ]; then
    echo -e "  Status: ${GREEN}${STATUS}${RESET}"
elif [ "$STATUS" == "canceled" ]; then
    echo -e "  Status: ${RED}${STATUS}${RESET}"
else
    echo -e "  Status: ${YELLOW}${STATUS}${RESET}"
fi

echo ""

# Check Stripe integration
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}  🔗 Stripe Integration${RESET}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -z "$CUSTOMER_ID" ] || [ "$CUSTOMER_ID" == "null" ]; then
    echo -e "  Customer ID: ${YELLOW}Not set${RESET}"
else
    echo -e "  Customer ID: ${GREEN}${CUSTOMER_ID}${RESET}"
fi

if [ -z "$SUB_ID" ] || [ "$SUB_ID" == "null" ]; then
    echo -e "  Subscription ID: ${YELLOW}Not set${RESET}"
else
    echo -e "  Subscription ID: ${GREEN}${SUB_ID}${RESET}"
fi

echo ""

# Check RSU entries
RSU_COUNT=$(sqlite3 data/taxbridge.db "SELECT COUNT(*) FROM rsu_entries WHERE user_id = ${USER_ID};")

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}  📊 User Data${RESET}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  RSU Entries: ${RSU_COUNT}"
echo ""

# Determine current stage
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}  🎯 Test Progress${RESET}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$TIER" == "free" ] && [ -z "$CUSTOMER_ID" ]; then
    echo -e "${YELLOW}📍 Stage: ACCOUNT CREATED${RESET}"
    echo ""
    echo "  ✓ Part 1: Account created"
    echo "  → Part 2: Execute checkout (IN PROGRESS)"
    echo "    Part 3: Verify payment"
    echo "    Part 4: Verify webhook"
    echo "    Part 5: Test Pro features"
    echo "    Part 6: Process refund"
    echo "    Part 7: Verify downgrade"
    echo ""
    echo "Next action:"
    echo "  1. Go to https://taxbridge.app/pricing"
    echo "  2. Click 'Upgrade to Pro'"
    echo "  3. Complete payment with real card"
    echo ""

elif [ "$TIER" == "pro" ] && [ "$STATUS" == "active" ] && [ -n "$CUSTOMER_ID" ]; then
    if [ "$RSU_COUNT" -lt 5 ]; then
        echo -e "${GREEN}📍 Stage: PAYMENT SUCCESS - TESTING FEATURES${RESET}"
        echo ""
        echo "  ✓ Part 1: Account created"
        echo "  ✓ Part 2: Checkout completed"
        echo "  ✓ Part 3: Payment verified"
        echo "  ✓ Part 4: Webhook processed"
        echo "  → Part 5: Test Pro features (IN PROGRESS)"
        echo "    Part 6: Process refund"
        echo "    Part 7: Verify downgrade"
        echo ""
        echo "Current RSU count: ${RSU_COUNT} / 5"
        echo ""
        echo "Next action:"
        echo "  1. Go to https://taxbridge.app/dashboard"
        echo "  2. Create 5 RSU entries (currently have ${RSU_COUNT})"
        echo "  3. Test PDF export"
        echo "  4. Verify Pro badge displayed"
        echo ""
    else
        echo -e "${GREEN}📍 Stage: PRO FEATURES VERIFIED - READY FOR REFUND${RESET}"
        echo ""
        echo "  ✓ Part 1: Account created"
        echo "  ✓ Part 2: Checkout completed"
        echo "  ✓ Part 3: Payment verified"
        echo "  ✓ Part 4: Webhook processed"
        echo "  ✓ Part 5: Pro features tested"
        echo "  → Part 6: Process refund (NEXT)"
        echo "    Part 7: Verify downgrade"
        echo ""
        echo "Next action:"
        echo "  1. Go to https://dashboard.stripe.com/payments"
        echo "  2. Find payment for customer: ${CUSTOMER_ID}"
        echo "  3. Click 'Refund' → Full refund (\$299.00)"
        echo "  4. Reason: 'Test transaction - verifying production payment flow'"
        echo ""
    fi

elif [ "$TIER" == "free" ] && [ "$STATUS" == "canceled" ] && [ -n "$CUSTOMER_ID" ]; then
    echo -e "${BLUE}📍 Stage: REFUND PROCESSED - TEST COMPLETE${RESET}"
    echo ""
    echo "  ✓ Part 1: Account created"
    echo "  ✓ Part 2: Checkout completed"
    echo "  ✓ Part 3: Payment verified"
    echo "  ✓ Part 4: Webhook processed"
    echo "  ✓ Part 5: Pro features tested"
    echo "  ✓ Part 6: Refund processed"
    echo "  ✓ Part 7: Downgrade verified"
    echo ""
    echo -e "${GREEN}✅ LIVE PAYMENT TEST COMPLETE!${RESET}"
    echo ""
    echo "Final verification:"
    echo "  • Tier: ${TIER} ✓"
    echo "  • Status: ${STATUS} ✓"
    echo "  • RSU entries preserved: ${RSU_COUNT} ✓"
    echo "  • Stripe IDs retained: ✓"
    echo ""
    echo "Next steps:"
    echo "  1. Fill out test report: docs/LIVE_PAYMENT_TEST_REPORT.md"
    echo "  2. Verify all screenshots captured (9 total)"
    echo "  3. Archive test account"
    echo "  4. Enable production payment acceptance 🚀"
    echo ""

else
    echo -e "${RED}📍 Stage: UNEXPECTED STATE${RESET}"
    echo ""
    echo "Current state:"
    echo "  Tier: ${TIER}"
    echo "  Status: ${STATUS}"
    echo "  Customer ID: ${CUSTOMER_ID}"
    echo "  Subscription ID: ${SUB_ID}"
    echo ""
    echo "This doesn't match expected flow. Check:"
    echo "  1. Webhook delivery in Stripe Dashboard"
    echo "  2. Vercel logs: vercel logs --prod | grep webhook"
    echo "  3. Database manually: sqlite3 data/taxbridge.db"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Detailed verification option
echo -e "${CYAN}For detailed verification, run:${RESET}"
echo "  tsx scripts/verify-live-payment-test.ts ${EMAIL}"
echo ""

exit 0
