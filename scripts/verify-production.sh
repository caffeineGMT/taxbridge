#!/bin/bash

# TaxBridge Production Deployment Verification Script
# Run this AFTER fixing the Vercel deployment to verify correct app is live
# Usage: ./scripts/verify-production.sh

set -e

PROD_URL="https://taxbridge.vercel.app"
PASS_COUNT=0
FAIL_COUNT=0
TOTAL_TESTS=8

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  TaxBridge Production Deployment Verification                 ║"
echo "║  Testing: $PROD_URL                              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Helper functions
pass() {
  echo "  ✅ PASS: $1"
  PASS_COUNT=$((PASS_COUNT + 1))
}

fail() {
  echo "  ❌ FAIL: $1"
  FAIL_COUNT=$((FAIL_COUNT + 1))
}

test_header() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Test $1: $2"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Test 1: Homepage Accessibility
test_header "1" "Homepage Accessibility"
status=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL/")
echo "  HTTP Status: $status"
if [ "$status" = "200" ]; then
  pass "Homepage returns 200 OK"
else
  fail "Homepage returns $status (expected 200)"
fi

# Test 2: Correct Page Title
test_header "2" "Page Title Verification"
title=$(curl -s "$PROD_URL/" | grep -o "<title>[^<]*</title>" | sed 's/<[^>]*>//g')
echo "  Found Title: $title"
if echo "$title" | grep -iq "US-Canada Cross-Border Tax Calculator"; then
  pass "Title contains 'US-Canada Cross-Border Tax Calculator'"
elif echo "$title" | grep -iq "Admin Dashboard"; then
  fail "Still showing 'Admin Dashboard' (wrong app deployed)"
else
  fail "Unexpected title: $title"
fi

# Test 3: Metadata Locale (should NOT be Nigeria)
test_header "3" "Metadata Locale Check"
locale=$(curl -s "$PROD_URL/" | grep 'og:locale' | grep -o 'content="[^"]*"' | cut -d'"' -f2)
echo "  Found Locale: ${locale:-'not set'}"
if [ "$locale" = "en_NG" ]; then
  fail "Locale is en_NG (Nigeria) - wrong app deployed"
elif [ -z "$locale" ]; then
  pass "No locale specified (acceptable)"
else
  pass "Locale is $locale (not Nigeria)"
fi

# Test 4: Description Content
test_header "4" "Meta Description Verification"
description=$(curl -s "$PROD_URL/" | grep 'name="description"' | grep -o 'content="[^"]*"' | cut -d'"' -f2)
echo "  Description: ${description:0:100}..."
if echo "$description" | grep -iq "Nigeria\|SME\|NRS\|e-invoicing"; then
  fail "Description mentions Nigeria/SME/NRS (wrong app)"
elif echo "$description" | grep -iq "H-1B\|TN visa\|cross-border\|RSU"; then
  pass "Description mentions H-1B/TN visa/RSU (correct app)"
else
  fail "Unexpected description content"
fi

# Test 5: H1 Heading Content
test_header "5" "Homepage H1 Heading"
# Note: This may not work perfectly with client-side rendering, but worth trying
h1_content=$(curl -s "$PROD_URL/" | grep -o '<h1[^>]*>.*</h1>' | sed 's/<[^>]*>//g' | sed 's/\s\+/ /g' | head -1)
echo "  H1 Content: ${h1_content:-'not found or client-rendered'}"
if echo "$h1_content" | grep -iq "Admin Dashboard"; then
  fail "H1 contains 'Admin Dashboard' (wrong app)"
elif echo "$h1_content" | grep -iq "Cross-Border\|Tax"; then
  pass "H1 mentions tax/cross-border content (correct app)"
elif [ -z "$h1_content" ]; then
  echo "  ⚠️  WARNING: H1 may be client-rendered, check manually in browser"
else
  echo "  ⚠️  WARNING: Unexpected H1 content, verify manually"
fi

# Test 6: Critical Routes Existence
test_header "6" "Critical Routes Accessibility"
routes=("/" "/dashboard")
all_routes_ok=true
for route in "${routes[@]}"; do
  route_status=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL$route")
  echo "  $route → $route_status"
  if [ "$route_status" != "200" ]; then
    all_routes_ok=false
  fi
done
if $all_routes_ok; then
  pass "All critical routes return 200"
else
  fail "Some critical routes failed (see above)"
fi

# Test 7: No Nigeria-Specific Content
test_header "7" "Content Validation (No Nigeria References)"
page_content=$(curl -s "$PROD_URL/" | tr '[:upper:]' '[:lower:]')
nigeria_matches=$(echo "$page_content" | grep -o "nigeria\|nrs compliance\|digitax\|remita\|sme tax" | wc -l | tr -d ' ')
echo "  Nigeria-related keywords found: $nigeria_matches"
if [ "$nigeria_matches" -eq 0 ]; then
  pass "No Nigeria-specific content found"
else
  fail "Found $nigeria_matches Nigeria-related references (wrong app)"
fi

# Test 8: Target Audience Verification
test_header "8" "Target Audience Verification"
target_keywords=$(echo "$page_content" | grep -o "h-1b\|h1b\|tn visa\|rsu\|stock\|canada\|us-canada" | wc -l | tr -d ' ')
echo "  H-1B/TN/RSU keywords found: $target_keywords"
if [ "$target_keywords" -ge 3 ]; then
  pass "Found $target_keywords target audience keywords (correct app)"
elif [ "$target_keywords" -eq 0 ]; then
  fail "No H-1B/TN/RSU keywords found (wrong app or broken content)"
else
  echo "  ⚠️  WARNING: Only $target_keywords keywords found, verify manually"
fi

# Final Summary
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  VERIFICATION SUMMARY                                          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "  Total Tests:  $TOTAL_TESTS"
echo "  Passed:       $PASS_COUNT"
echo "  Failed:       $FAIL_COUNT"
echo ""

if [ "$FAIL_COUNT" -eq 0 ]; then
  echo "  🎉 SUCCESS: Correct application is deployed!"
  echo "  ✅ Production deployment verified"
  echo ""
  echo "  Next Steps:"
  echo "    1. Run full smoke test: npm run test:e2e"
  echo "    2. Verify Stripe checkout flow manually"
  echo "    3. Check analytics (PostHog) is tracking events"
  echo "    4. Test signup/login with Clerk"
  echo "    5. Run calculator with sample data"
  echo ""
  exit 0
elif [ "$FAIL_COUNT" -le 2 ]; then
  echo "  ⚠️  WARNING: Some tests failed"
  echo "  Review failed tests above and verify manually in browser"
  echo "  This may be acceptable if failures are client-rendering related"
  echo ""
  exit 1
else
  echo "  ❌ FAILURE: Wrong application is still deployed"
  echo "  Action Required: Follow DEPLOYMENT_FIX_GUIDE.md"
  echo ""
  echo "  Likely Issues:"
  echo "    - Vercel project still linked to Nigeria admin dashboard"
  echo "    - Domain not reassigned to correct project"
  echo "    - Wrong git branch deployed"
  echo "    - DNS cache (wait 5-10 minutes and retry)"
  echo ""
  exit 1
fi
