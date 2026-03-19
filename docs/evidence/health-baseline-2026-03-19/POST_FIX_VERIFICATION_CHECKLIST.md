# Post-Fix Verification Checklist

**Use this checklist AFTER:**
1. Correct app deployed to Vercel
2. Environment variables replaced (Stripe, Clerk, PostHog, Sentry)

---

## Quick Verification Commands

```bash
# 1. Run automated health baseline
npm run verify:health-baseline

# Expected: All 4 checks PASS (not 3 FAIL like before)

# 2. Manual spot checks
curl -s -o /dev/null -w "%{http_code}" https://taxbridge.vercel.app/
# Expected: 200

curl -s -o /dev/null -w "%{http_code}" https://taxbridge.vercel.app/us-canada-tax-calculator
# Expected: 200 (not 404)

curl -s https://taxbridge.vercel.app/ | grep -i "h1b\|rsu\|canada"
# Expected: Should return matches (not empty)

# 3. Check sitemap
curl -s https://taxbridge.vercel.app/sitemap.xml | head -20
# Expected: Should be XML, not HTML 404 page
```

---

## Manual Verification Steps

### 1. Homepage Content ✅

**Visit:** https://taxbridge.vercel.app/

**Verify:**
- [ ] Title contains "TaxBridge" or "Cross-Border Tax" (NOT "Nigeria" or "e-invoicing")
- [ ] Headline mentions H-1B, TN visa, or RSUs
- [ ] Calculator CTA button visible
- [ ] Page loads in <3 seconds

**Take Screenshot:**
```bash
# Use Playwright or manual screenshot
# Save to: docs/evidence/post-fix-YYYY-MM-DD/homepage.png
```

---

### 2. Calculator Accessibility ✅

**Visit:** https://taxbridge.vercel.app/us-canada-tax-calculator

**Verify:**
- [ ] Page loads (HTTP 200, not 404)
- [ ] Calculator form visible with input fields:
  - [ ] RSU value
  - [ ] Vesting date
  - [ ] US state
  - [ ] Canada province
  - [ ] Income fields
- [ ] Calculate button exists

---

### 3. Calculator Workflow (VIDEO) 📹

**Record this workflow as evidence:**

1. Visit calculator page
2. Fill in sample data:
   - RSU value: $100,000
   - Vesting date: 2026-06-15
   - US state: Washington
   - Canada province: British Columbia
   - US income: $150,000
   - Canada income: $0
3. Click "Calculate"
4. Verify results page shows:
   - Total tax breakdown
   - Foreign Tax Credit calculation
   - Savings visualization
5. Click "Upgrade to save more"
6. Verify pricing page loads

**Save video:**
- Format: MP4 or WebM
- Max length: 2 minutes
- Location: `docs/evidence/post-fix-YYYY-MM-DD/calculator-workflow.mp4`

**Tool options:**
- macOS: QuickTime Screen Recording
- Windows: Xbox Game Bar (Win + G)
- Linux: SimpleScreenRecorder
- Browser: Chrome DevTools → Capture node screenshot

---

### 4. Stripe Checkout Test (TRANSACTION ID) 💳

**Prerequisites:**
- [ ] Stripe keys replaced (test OR production mode)
- [ ] Keys visible in Vercel environment variables

**Test Workflow:**

1. Visit https://taxbridge.vercel.app/pricing
2. Click "Subscribe" on any plan
3. Fill checkout form with test card:
   - **Test mode:** Card `4242 4242 4242 4242`
   - **Production mode:** Use real card OR ask Michael for permission
4. Complete checkout
5. **CRITICAL: Save transaction ID**
   - Test mode: `ch_test_XXXXXXXXXXXX`
   - Production: `ch_live_XXXXXXXXXXXX`

**Evidence to capture:**
- [ ] Screenshot of checkout page
- [ ] Screenshot of success page
- [ ] Transaction ID from Stripe dashboard
- [ ] Email receipt (if sent)

**Save to:**
```
docs/evidence/post-fix-YYYY-MM-DD/
├── checkout-form.png
├── checkout-success.png
└── transaction-id.txt (contains: ch_XXXX...)
```

**Verify in Stripe Dashboard:**
1. Login to Stripe dashboard
2. Go to Payments → All payments
3. Confirm transaction appears
4. Take screenshot showing transaction

---

### 5. Environment Variables ✅

**Re-run audit:**
```bash
npm run verify:health-baseline
```

**Expected changes:**
- [ ] STRIPE_SECRET_KEY: Status changes from PLACEHOLDER → SET
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: PLACEHOLDER → SET
- [ ] CLERK_SECRET_KEY: PLACEHOLDER → SET
- [ ] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: PLACEHOLDER → SET
- [ ] NEXT_PUBLIC_POSTHOG_KEY: PLACEHOLDER → SET
- [ ] SENTRY_AUTH_TOKEN: PLACEHOLDER → SET (optional)

**Expected result:**
```
4️⃣ Auditing environment variables...
   PASS: All critical environment variables are properly set
```

---

### 6. Signup/Login Flow ✅

**Test Clerk integration:**

1. Visit https://taxbridge.vercel.app/sign-up
2. Create account with test email
3. Verify:
   - [ ] Signup form loads (not 500 error)
   - [ ] Email verification sent (check inbox)
   - [ ] After verification → redirects to dashboard
   - [ ] Dashboard shows user name

**Evidence:**
- [ ] Screenshot of signup form
- [ ] Screenshot of dashboard after login

---

### 7. Analytics Tracking ✅

**Test PostHog:**

1. Visit https://app.posthog.com
2. Login to project
3. Go to Activity → Live events
4. In another tab: Visit production site + interact with calculator
5. Verify events appear in PostHog live feed:
   - [ ] `pageview` event
   - [ ] `calculator_viewed` event
   - [ ] `calculation_completed` event

**Evidence:**
- [ ] Screenshot of PostHog live events showing production data

---

### 8. Error Monitoring ✅

**Test Sentry (if configured):**

1. Visit https://sentry.io
2. Login to project
3. Go to Issues
4. Trigger test error on production (optional)
5. Verify error appears in Sentry

**Evidence:**
- [ ] Screenshot of Sentry dashboard (even if 0 errors = good!)

---

## Evidence Checklist

After completing all tests above, you should have:

### Required (Cannot complete task without these)
- [x] Homepage screenshot (correct app)
- [ ] Calculator workflow video (2 min max)
- [ ] Stripe transaction ID (from test or real checkout)
- [x] Environment audit report (PASS status)

### Recommended (Nice to have)
- [ ] Checkout screenshots (form + success)
- [ ] PostHog events screenshot
- [ ] Signup flow screenshots
- [ ] Multiple device screenshots (mobile + desktop)

---

## Final Verification Report

**Run this command:**
```bash
npm run verify:health-baseline
```

**Expected output:**
```
🏥 Production Health Baseline Verification Starting...

📁 Evidence directory: docs/evidence/health-baseline-YYYY-MM-DD

1️⃣ Checking site accessibility...
   PASS: Production site is accessible (HTTP 200)

📸 Capturing production screenshot...
✅ Screenshot saved: homepage-screenshot.png

2️⃣ Checking calculator availability...
   PASS: Calculator page is accessible

3️⃣ Checking Stripe configuration...
   PASS: Stripe is in PRODUCTION mode
   (OR WARNING: Stripe is in TEST mode - can only accept test payments)

4️⃣ Auditing environment variables...
   PASS: All critical environment variables are properly set

📄 Report saved: health-baseline-report.md
📄 JSON report saved: health-baseline-report.json

✅ Health baseline verification complete!
📁 Evidence saved to: docs/evidence/health-baseline-YYYY-MM-DD
```

**Exit code:** `0` (success) - was `1` (failure) before fix

---

## Task Completion

**Once you have ALL evidence:**

1. **Organize evidence directory:**
   ```
   docs/evidence/post-fix-YYYY-MM-DD/
   ├── homepage-screenshot.png
   ├── calculator-workflow.mp4
   ├── checkout-form.png
   ├── checkout-success.png
   ├── transaction-id.txt
   ├── posthog-events.png
   ├── health-baseline-report.md
   └── VERIFICATION_COMPLETE.md (this checklist, marked complete)
   ```

2. **Create final report:**
   ```bash
   echo "# Production Health Baseline - VERIFICATION COMPLETE

   Date: $(date)
   Status: ✅ ALL CHECKS PASSED

   ## Evidence
   - Homepage screenshot: ✅
   - Calculator video: ✅ (calculator-workflow.mp4)
   - Stripe transaction: ✅ (ID: ch_XXXX...)
   - Environment audit: ✅ (6/6 P0 variables SET)

   ## Verification Results
   - Site accessibility: PASS
   - Calculator accessibility: PASS
   - Stripe configuration: PASS
   - Environment variables: PASS

   See health-baseline-report.md for full details.
   " > docs/evidence/post-fix-$(date +%Y-%m-%d)/VERIFICATION_COMPLETE.md
   ```

3. **Commit everything:**
   ```bash
   git add docs/evidence/
   git commit -m "[P0-CRITICAL] Production Health Baseline COMPLETE - 100% Evidence Collected

   VERIFICATION STATUS: ✅ ALL CHECKS PASSED

   Evidence Collected:
   ✅ Homepage screenshot (correct app deployed)
   ✅ Calculator workflow video (2min end-to-end demo)
   ✅ Stripe transaction ID (ch_XXXX...)
   ✅ Environment audit (6/6 P0 variables properly set)

   Verification Results:
   ✅ Site accessibility: PASS (HTTP 200)
   ✅ Calculator page: PASS (HTTP 200, was 404)
   ✅ Stripe configuration: PASS (production mode, was PLACEHOLDER)
   ✅ Environment variables: PASS (all P0 keys set)

   Production Health: 100% ✅
   Revenue Capability: UNBLOCKED ✅
   Evidence Quality: COMPLETE ✅

   Files:
   - docs/evidence/post-fix-YYYY-MM-DD/ (screenshots + video)
   - health-baseline-report.md (automated verification)
   - VERIFICATION_COMPLETE.md (final sign-off)

   Task Status: COMPLETE WITH EVIDENCE"
   ```

4. **Push to GitHub:**
   ```bash
   git push origin main
   ```

---

## Success Criteria

**Task is COMPLETE when:**
- [x] Correct app deployed (US-Canada tax calculator)
- [ ] Calculator accessible at `/us-canada-tax-calculator` (HTTP 200)
- [ ] Calculator workflow video recorded
- [ ] Stripe checkout completed (transaction ID obtained)
- [ ] All P0 environment variables set (not placeholders)
- [ ] All evidence saved to `docs/evidence/`
- [ ] Final report committed to Git

**Task is NOT complete if:**
- ❌ Any evidence is missing
- ❌ Video shows wrong app
- ❌ Transaction ID is fake/mocked
- ❌ Environment variables still placeholders
- ❌ Calculator returns 404

---

**This checklist will be updated as you complete each item.**
**Good luck! 🚀**
