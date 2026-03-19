# Production Smoke Test Report
## TaxBridge - US-Canada Cross-Border Tax Calculator

**Test Date:** March 19, 2026
**Tester:** AI Senior Engineer (Automated QA)
**Production URL:** https://taxbridge.vercel.app
**Status:** ❌ **CRITICAL FAILURE - TEST ABORTED**

---

## 🚨 P0-CRITICAL: WRONG APPLICATION DEPLOYED

### Finding #1: Incorrect Application Served from Production URL

**Severity:** P0-CRITICAL (Revenue Blocker)
**Status:** BLOCKING - No further testing possible

#### Expected Behavior:
- Production URL should serve the **US-Canada Cross-Border Tax Calculator** for H-1B/TN workers
- Homepage should display "TaxBridge - US-Canada Cross-Border Tax Calculator for H-1B/TN Workers"
- Target audience: H-1B and TN visa tech workers with RSU income

#### Actual Behavior:
- Production URL is serving a **completely different application**: "TaxBridge Admin Dashboard"
- Application description: "Nigeria's first offline-first, NRS-compliant e-invoicing platform for SMEs"
- Target market: Nigeria (og:locale: en_NG)
- Wrong business model: E-invoicing platform vs. Tax calculator

#### Evidence:

```html
<title>TaxBridge Admin Dashboard</title>
<meta name="description" content="Comprehensive admin dashboard for TaxBridge operations
and compliance monitoring — Nigeria's first offline-first, NRS-compliant e-invoicing
platform for SMEs."/>
<meta property="og:locale" content="en_NG"/>
<meta property="og:title" content="TaxBridge Admin Dashboard"/>
```

Homepage H1 tag: "TaxBridge Admin Dashboard"

#### HTTP Status Code Test Results:

```
Production URL: taxbridge.vercel.app
/                  → 200 (WRONG APP)
/pricing           → 404 (Not Found)
/calculator        → 404 (Not Found)
/dashboard         → 200 (Wrong dashboard - Nigeria admin panel)
/api/health        → 404 (Not Found)
/sign-in           → 404 (Not Found)
/sign-up           → 404 (Not Found)
```

#### Impact Assessment:
- **Revenue Impact:** $1M annual revenue target at ZERO - cannot accept payments
- **User Impact:** 100% of visitors see wrong product
- **SEO Impact:** Google is indexing Nigeria e-invoicing content instead of US-Canada tax calculator
- **Brand Impact:** Severe - users searching for "H1B RSU tax calculator" land on irrelevant Nigeria SME invoicing platform
- **Compliance Risk:** Potential confusion with financial/tax services in wrong jurisdiction

#### Root Cause Analysis:
The production Vercel deployment is pointing to the wrong project directory or wrong git repository. The codebase at `/Users/michaelguo/hivemind-projects/cross-border-tax` contains the correct US-Canada tax calculator code (verified by reading `app/page.tsx`), but Vercel is deploying a different TaxBridge project.

Possible causes:
1. Vercel project linked to wrong GitHub repository
2. Multiple TaxBridge projects exist and wrong one is connected to taxbridge.vercel.app domain
3. Build configuration error causing wrong output directory
4. Deployment from outdated or incorrect git branch

#### Recommended Fix:
1. **IMMEDIATE:** Identify correct Vercel project ID for US-Canada tax calculator
2. Verify Vercel project is linked to correct GitHub repository: `michaelguo/cross-border-tax` (or actual repo name)
3. Check Vercel deployment logs for build errors
4. Trigger fresh deployment from `main` branch
5. Verify post-deployment that homepage shows correct content
6. Update DNS/domain routing if needed

---

## Test Plan Status

### ✅ Completed Tests:
- [x] Production URL accessibility check
- [x] HTTP status code verification for critical pages
- [x] Homepage HTML/metadata inspection

### ❌ Blocked Tests (Cannot Proceed):
- [ ] Calculator accuracy testing - Route /calculator returns 404
- [ ] Signup flow testing - Routes /sign-in and /sign-up return 404
- [ ] Stripe checkout testing - Pricing page returns 404, payment flows unreachable
- [ ] Refund process testing - No payment system accessible
- [ ] Analytics tracking verification - Cannot test PostHog events on wrong application
- [ ] Dashboard functionality - Wrong dashboard deployed (Nigeria admin panel)
- [ ] Mobile responsiveness - Wrong application UI
- [ ] Cross-browser compatibility - Wrong application
- [ ] SEO validation - Wrong metadata deployed

---

## Next Steps

### Immediate Actions Required:
1. **DO NOT PROCEED** with Product Hunt launch or marketing campaigns
2. **STOP** all traffic acquisition activities (Google Ads, Meta Pixel)
3. **FIX DEPLOYMENT:** Redeploy correct US-Canada tax calculator application
4. **VERIFY FIX:** Run this smoke test script again after deployment
5. **POST-DEPLOYMENT:** Complete full smoke test checklist

### Deployment Verification Checklist (Run After Fix):
- [ ] Homepage title: "TaxBridge - US-Canada Cross-Border Tax Calculator for H-1B/TN Workers"
- [ ] Homepage H1: Contains "Cross-Border Tax" and mentions H-1B/TN workers
- [ ] /pricing returns 200 status (if pricing page exists) or redirects appropriately
- [ ] /dashboard returns 200 and shows correct user dashboard
- [ ] /sign-in and /sign-up return 200 with Clerk authentication
- [ ] Calculator is accessible and functional
- [ ] All API routes return appropriate responses (not 404)

---

## Timeline Impact

**Original Deadline:** March 20, 2026 12:00 PM PST (P0-CRITICAL)
**Current Status:** MISSED - Application not deployable in current state
**Revised Timeline:**
- Fix deployment: 2-4 hours (Vercel configuration + DNS propagation)
- Re-run smoke test: 1-2 hours
- Fix any additional bugs found: TBD

**Revenue Impact:** Every day delayed = ~$2,740 lost revenue (based on $1M annual target ÷ 365 days)

---

## Smoke Test Script (For Future Use After Fix)

```bash
#!/bin/bash
# Production Smoke Test Script
# Run after deployment fix to verify all critical flows

PROD_URL="https://taxbridge.vercel.app"

echo "=== TaxBridge Production Smoke Test ==="
echo "Testing: $PROD_URL"
echo ""

# Test 1: Homepage
echo "Test 1: Homepage"
status=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL/")
title=$(curl -s "$PROD_URL/" | grep -o "<title>[^<]*</title>")
echo "  Status: $status"
echo "  Title: $title"
echo "  Expected: <title>TaxBridge - US-Canada Cross-Border Tax Calculator for H-1B/TN Workers</title>"
echo ""

# Test 2: Critical Pages
echo "Test 2: Critical Pages"
for page in "/pricing" "/dashboard" "/sign-in" "/sign-up"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL$page")
  echo "  $page → $status"
done
echo ""

# Test 3: API Health
echo "Test 3: API Endpoints"
for endpoint in "/api/health" "/api/calculate-tax" "/api/stripe/checkout"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL$endpoint")
  echo "  $endpoint → $status"
done
echo ""

# Test 4: Metadata Validation
echo "Test 4: SEO Metadata"
curl -s "$PROD_URL/" | grep -E "og:title|og:description|og:locale" | head -5
echo ""

echo "=== End of Smoke Test ==="
```

---

## Appendix: Expected vs Actual Content

### Expected (from codebase at app/page.tsx):
```typescript
export const metadata: Metadata = {
  title: 'TaxBridge - US-Canada Cross-Border Tax Calculator for H-1B/TN Workers',
  description: 'Free cross-border tax calculator built for H-1B and TN visa tech workers...',
  alternates: { canonical: 'https://taxbridge.app' }
};
```

### Actual (from production HTML):
```html
<title>TaxBridge Admin Dashboard</title>
<meta name="description" content="Comprehensive admin dashboard for TaxBridge operations
and compliance monitoring — Nigeria's first offline-first, NRS-compliant e-invoicing platform for SMEs."/>
<meta property="og:locale" content="en_NG"/>
```

---

**Test Result:** ❌ **FAILED - CRITICAL DEPLOYMENT ERROR**
**Recommendation:** DO NOT LAUNCH until production deployment is fixed and verified.
