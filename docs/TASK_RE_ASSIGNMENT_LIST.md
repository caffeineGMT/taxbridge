# TASK RE-ASSIGNMENT LIST - Evidence Required
**Date:** March 19, 2026
**Status:** INCOMPLETE - Awaiting Evidence
**Assigned To:** All Engineers
**Deadline:** March 22, 2026 (P0), March 25, 2026 (P1), March 31, 2026 (P2/P3)

---

## 🚨 CRITICAL INSTRUCTIONS

**ALL TASKS BELOW ARE MARKED "INCOMPLETE" UNTIL EVIDENCE IS PROVIDED.**

These tasks were previously marked "done" but **failed the evidence audit** (see `EVIDENCE_AUDIT_2026-03-19.md`).

**To complete each task, you MUST provide:**
1. ✅ Code committed to Git
2. ✅ Pushed to GitHub
3. ✅ Deployed to production
4. ✅ Production URL verified (HTTP 200)
5. ✅ Screenshots (desktop + mobile if UI)
6. ✅ Verification report
7. ✅ Evidence committed to docs/

**Use automated verification:**
```bash
npm run verify:task -- \
  --task-id=[TASK-ID] \
  --feature-url=/[path] \
  --title="[Task Name]"
```

---

## 🔴 P0-CRITICAL TASKS (Due: March 20, 2026)

### REVENUE-BLOCKING TASKS

#### 1. Move Stripe to Production Mode
**Previously Claimed Done:** 10 times (Sprints 6-15)
**Evidence Found:** ❌ ZERO
**Current Status:** Still in TEST MODE

**Re-Assignment Requirements:**
- [ ] Login to Stripe dashboard → switch to Live mode
- [ ] Update .env.production with sk_live_... keys
- [ ] Update Vercel environment variables
- [ ] Create live price IDs ($29/year, $49/year, $79/year)
- [ ] Test real payment (charge $1.00, verify transaction ID starts with "tx_")
- [ ] Screenshot Stripe dashboard showing "Live mode" badge
- [ ] Screenshot successful test payment
- [ ] Verification report: `docs/verification-reports/stripe-production-[DATE].md`
- [ ] Commit message: "[P0-CRITICAL] Stripe Production Mode Activated + VERIFICATION"

**Expected Evidence:**
```
docs/screenshots/stripe-production-[DATE]/
  - stripe-dashboard-live-mode.png
  - test-payment-success.png
  - price-ids-live.png
docs/verification-reports/stripe-production-[DATE].md
```

**Verification Command:**
```bash
npm run verify:task -- \
  --task-id=P0-STRIPE \
  --feature-url=/pricing \
  --title="Stripe Production Mode Activated"
```

---

#### 2. Replace Clerk Production Keys
**Previously Claimed Done:** 4 times (Sprints 8, 12, 13, 14)
**Evidence Found:** ⚠️ PARTIAL (JSON report exists, no screenshots)
**Current Status:** Unknown - needs re-verification

**Re-Assignment Requirements:**
- [ ] Login to Clerk dashboard → create production application
- [ ] Update .env.production with pk_live_... and sk_live_... keys
- [ ] Update Vercel environment variables
- [ ] Test login on production site (taxbridge.vercel.app)
- [ ] Test signup on production site
- [ ] Screenshot Clerk dashboard showing production app
- [ ] Screenshot successful login on production
- [ ] Verification report: `docs/verification-reports/clerk-production-[DATE].md`
- [ ] Commit message: "[P0-CRITICAL] Clerk Production Keys Activated + VERIFICATION"

**Expected Evidence:**
```
docs/screenshots/clerk-production-[DATE]/
  - clerk-dashboard-production-app.png
  - production-login-working.png
  - production-signup-working.png
docs/verification-reports/clerk-production-[DATE].md
```

**Verification Command:**
```bash
npm run verify:task -- \
  --task-id=P0-CLERK \
  --feature-url=/sign-in \
  --title="Clerk Production Keys Activated"
```

---

#### 3. Activate PostHog Production Tracking
**Previously Claimed Done:** 3 times (Sprints 12-14)
**Evidence Found:** ❌ ZERO
**Current Status:** Placeholder project ID in .env.production

**Re-Assignment Requirements:**
- [ ] Login to PostHog → create production project
- [ ] Update .env.production with real project ID
- [ ] Update Vercel environment variables
- [ ] Configure funnels: Calculator → Signup → Payment
- [ ] Test event firing (use browser DevTools)
- [ ] Screenshot PostHog dashboard showing events
- [ ] Screenshot browser DevTools showing posthog.capture() calls
- [ ] Verification report: `docs/verification-reports/posthog-production-[DATE].md`
- [ ] Commit message: "[P0-CRITICAL] PostHog Production Tracking Activated + VERIFICATION"

**Expected Evidence:**
```
docs/screenshots/posthog-production-[DATE]/
  - posthog-dashboard-events.png
  - posthog-funnel-configured.png
  - browser-devtools-events.png
docs/verification-reports/posthog-production-[DATE].md
```

**Verification Command:**
```bash
npm run verify:task -- \
  --task-id=P0-POSTHOG \
  --feature-url=/us-canada-tax-calculator \
  --title="PostHog Production Tracking Activated"
```

---

#### 4. Activate Sentry Error Monitoring
**Previously Claimed Done:** Unknown (not in completed task list)
**Evidence Found:** ❌ ZERO
**Current Status:** Placeholder DSN and auth token

**Re-Assignment Requirements:**
- [ ] Login to Sentry → create production project
- [ ] Update .env.production with real DSN and auth token
- [ ] Update Vercel environment variables
- [ ] Trigger test error in production
- [ ] Verify error appears in Sentry dashboard
- [ ] Screenshot Sentry dashboard showing error
- [ ] Screenshot error details with stack trace
- [ ] Verification report: `docs/verification-reports/sentry-production-[DATE].md`
- [ ] Commit message: "[P0-CRITICAL] Sentry Error Monitoring Activated + VERIFICATION"

**Expected Evidence:**
```
docs/screenshots/sentry-production-[DATE]/
  - sentry-dashboard-error.png
  - sentry-error-details.png
docs/verification-reports/sentry-production-[DATE].md
```

---

#### 5. Activate SendGrid Email Service
**Previously Claimed Done:** 4 times (Sprints 7, 8, 9, 11)
**Evidence Found:** ❌ ZERO
**Current Status:** Placeholder API key

**Re-Assignment Requirements:**
- [ ] Login to SendGrid → create API key
- [ ] Update .env.production with real API key
- [ ] Update Vercel environment variables
- [ ] Send test email (welcome email)
- [ ] Verify email received in inbox
- [ ] Screenshot SendGrid dashboard showing sent email
- [ ] Screenshot received email in inbox
- [ ] Verification report: `docs/verification-reports/sendgrid-production-[DATE].md`
- [ ] Commit message: "[P0-CRITICAL] SendGrid Email Service Activated + VERIFICATION"

**Expected Evidence:**
```
docs/screenshots/sendgrid-production-[DATE]/
  - sendgrid-dashboard-sent.png
  - email-inbox-received.png
docs/verification-reports/sendgrid-production-[DATE].md
```

---

### INFRASTRUCTURE TASKS

#### 6. Production Site Health Verification
**Previously Claimed Done:** ✅ COMPLETE (March 19)
**Evidence Found:** ✅ VERIFIED (11 screenshots, 3 reports)
**Current Status:** ✅ PASSING

**No action required** - This task has proper evidence.

---

#### 7. Fix Build Errors - Zero Errors Required
**Previously Claimed Done:** 10+ times
**Evidence Found:** ❌ ZERO before/after comparison
**Current Status:** Build passing per Sprint 15, but no historical evidence

**Re-Assignment Requirements:**
- [ ] Run npm run build
- [ ] Verify ZERO errors in output
- [ ] Verify ZERO TypeScript errors
- [ ] Verify ZERO ESLint errors
- [ ] Save build output to docs/logs/build-[DATE].txt
- [ ] Screenshot build success message
- [ ] Verification report: `docs/verification-reports/build-quality-[DATE].md`
- [ ] Commit message: "[P0-CRITICAL] Build Quality Verified - Zero Errors + VERIFICATION"

**Expected Evidence:**
```
docs/logs/build-[DATE].txt (full build output showing 0 errors)
docs/screenshots/build-[DATE]/build-success.png
docs/verification-reports/build-quality-[DATE].md
```

---

#### 8. Fix npm Security Vulnerabilities (19 → 0)
**Previously Claimed Done:** 2 times (Sprints 7, 8)
**Evidence Found:** ❌ ZERO before/after audit
**Current Status:** Sprint 15 claims 0 vulnerabilities, but no evidence

**Re-Assignment Requirements:**
- [ ] Run npm audit
- [ ] Verify 0 vulnerabilities in output
- [ ] Save npm audit output to docs/logs/npm-audit-[DATE].txt
- [ ] Screenshot npm audit output
- [ ] Verification report: `docs/verification-reports/npm-security-[DATE].md`
- [ ] Commit message: "[P0-CRITICAL] npm Security Verified - Zero Vulnerabilities + VERIFICATION"

**Expected Evidence:**
```
docs/logs/npm-audit-[DATE].txt (showing "found 0 vulnerabilities")
docs/screenshots/npm-audit-[DATE]/npm-audit-zero.png
docs/verification-reports/npm-security-[DATE].md
```

---

## 🟠 P1-HIGH TASKS (Due: March 22, 2026)

### TESTING & QUALITY TASKS

#### 9. Fix Playwright E2E Tests (206 Tests)
**Previously Claimed Done:** 2 times (Sprints 7, 8)
**Evidence Found:** ❌ ZERO
**Current Status:** Unknown if tests are passing

**Re-Assignment Requirements:**
- [ ] Run npm run test:e2e
- [ ] Verify 206/206 tests passing (or document current count)
- [ ] Save test output to docs/logs/playwright-[DATE].txt
- [ ] Screenshot test results summary
- [ ] Fix any failing tests
- [ ] Verification report: `docs/verification-reports/playwright-[DATE].md`
- [ ] Commit message: "[P1-HIGH] Playwright E2E Tests Verified + VERIFICATION"

**Expected Evidence:**
```
docs/logs/playwright-[DATE].txt (showing X/X tests passing)
docs/screenshots/playwright-[DATE]/test-results.png
docs/verification-reports/playwright-[DATE].md
```

---

#### 10. Unit Test Verification (191 Tests)
**Previously Claimed Done:** Multiple times
**Evidence Found:** ❌ No dedicated verification
**Current Status:** 191/191 passing per memory, but no evidence

**Re-Assignment Requirements:**
- [ ] Run npm test
- [ ] Verify 191/191 tests passing
- [ ] Save test output to docs/logs/unit-tests-[DATE].txt
- [ ] Screenshot test results with coverage
- [ ] Verification report: `docs/verification-reports/unit-tests-[DATE].md`
- [ ] Commit message: "[P1-HIGH] Unit Tests Verified - 191/191 Passing + VERIFICATION"

**Expected Evidence:**
```
docs/logs/unit-tests-[DATE].txt
docs/screenshots/unit-tests-[DATE]/test-coverage.png
docs/verification-reports/unit-tests-[DATE].md
```

---

### UX & ACCESSIBILITY TASKS

#### 11. Accessibility Audit - WCAG 2.1 AA Compliance
**Previously Claimed Done:** 1 time (Sprint 4)
**Evidence Found:** ❌ ZERO
**Current Status:** Sprint 15 shows 35% ARIA coverage (89/251 files)

**Re-Assignment Requirements:**
- [ ] Run Axe DevTools on all major pages (homepage, calculator, pricing, checkout)
- [ ] Fix all WCAG 2.1 AA violations
- [ ] Test with screen reader (VoiceOver on Mac or NVDA on Windows)
- [ ] Record 2-min video of screen reader navigation
- [ ] Screenshot Axe DevTools report (before/after)
- [ ] Verification report: `docs/verification-reports/accessibility-[DATE].md`
- [ ] Commit message: "[P1-HIGH] Accessibility WCAG 2.1 AA Verified + VERIFICATION"

**Expected Evidence:**
```
docs/screenshots/accessibility-[DATE]/
  - axe-devtools-before.png
  - axe-devtools-after.png
  - wcag-violations-fixed.png
docs/videos/accessibility-[DATE]/screen-reader-test.mp4
docs/verification-reports/accessibility-[DATE].md
```

---

#### 12. Mobile Responsiveness Audit
**Previously Claimed Done:** 2 times (Sprints 4, 5)
**Evidence Found:** ❌ ZERO (only 2 general site check screenshots)
**Current Status:** Unknown

**Re-Assignment Requirements:**
- [ ] Test on real iPhone (Safari, iOS 16+)
- [ ] Test on real Android device (Chrome, Android 12+)
- [ ] Screenshot calculator on mobile (375x667)
- [ ] Screenshot pricing page on mobile
- [ ] Screenshot checkout flow on mobile
- [ ] Video of mobile navigation (2 min max)
- [ ] Verification report: `docs/verification-reports/mobile-responsive-[DATE].md`
- [ ] Commit message: "[P1-HIGH] Mobile Responsiveness Verified + VERIFICATION"

**Expected Evidence:**
```
docs/screenshots/mobile-responsive-[DATE]/
  - iphone-safari-calculator.png
  - iphone-safari-pricing.png
  - android-chrome-calculator.png
  - android-chrome-pricing.png
docs/videos/mobile-responsive-[DATE]/mobile-navigation.mp4
docs/verification-reports/mobile-responsive-[DATE].md
```

---

#### 13. Cross-Browser Testing
**Previously Claimed Done:** 3 times (Sprints 4, 5, 6)
**Evidence Found:** ❌ ZERO
**Current Status:** Unknown

**Re-Assignment Requirements:**
- [ ] Test on Chrome (latest version)
- [ ] Test on Safari (latest version)
- [ ] Test on Firefox (latest version)
- [ ] Test on Edge (latest version)
- [ ] Screenshot calculator page in each browser (4 browsers × 1 page = 4 screenshots minimum)
- [ ] Document any browser-specific bugs
- [ ] Verification report: `docs/verification-reports/cross-browser-[DATE].md`
- [ ] Commit message: "[P1-HIGH] Cross-Browser Testing Verified + VERIFICATION"

**Expected Evidence:**
```
docs/screenshots/cross-browser-[DATE]/
  - chrome-calculator.png
  - safari-calculator.png
  - firefox-calculator.png
  - edge-calculator.png
docs/verification-reports/cross-browser-[DATE].md (testing matrix)
```

---

### PERFORMANCE TASKS

#### 14. Performance Optimization - Lighthouse Audit
**Previously Claimed Done:** 4 times (Sprints 4, 7, 8, 9)
**Evidence Found:** ❌ ZERO
**Current Status:** Sprint 15 shows good scores, but no baseline

**Re-Assignment Requirements:**
- [ ] Run Lighthouse audit on production (taxbridge.vercel.app)
- [ ] Run on homepage, calculator, pricing pages
- [ ] Export Lighthouse reports (JSON)
- [ ] Screenshot Lighthouse scores (Performance, Accessibility, SEO, Best Practices)
- [ ] Document Core Web Vitals (LCP, FID, CLS)
- [ ] Verification report: `docs/verification-reports/lighthouse-[DATE].md`
- [ ] Commit message: "[P1-HIGH] Lighthouse Audit Complete - Baseline Established + VERIFICATION"

**Expected Evidence:**
```
docs/lighthouse-reports/
  - homepage-[DATE].json
  - calculator-[DATE].json
  - pricing-[DATE].json
docs/screenshots/lighthouse-[DATE]/
  - homepage-scores.png
  - calculator-scores.png
  - pricing-scores.png
docs/verification-reports/lighthouse-[DATE].md
```

---

### ANALYTICS & TRACKING TASKS

#### 15. Conversion Funnel Analysis - PostHog
**Previously Claimed Done:** 9 times (Sprints 6-14)
**Evidence Found:** ❌ ZERO
**Current Status:** PostHog not configured (placeholder keys)

**Re-Assignment Requirements:**
- [ ] **First, complete P0-3: Activate PostHog Production Tracking**
- [ ] Configure funnel in PostHog: Landing → Calculator → Signup → Payment
- [ ] Collect 7 days of baseline data
- [ ] Screenshot PostHog funnel visualization
- [ ] Screenshot conversion rates at each stage
- [ ] Verification report: `docs/verification-reports/posthog-funnel-[DATE].md`
- [ ] Commit message: "[P1-HIGH] PostHog Funnel Analysis - Baseline Established + VERIFICATION"

**Expected Evidence:**
```
docs/screenshots/posthog-funnel-[DATE]/
  - funnel-visualization.png
  - conversion-rates.png
  - drop-off-analysis.png
docs/verification-reports/posthog-funnel-[DATE].md
```

**Dependency:** Requires P0-3 (PostHog activation) to be completed first

---

## 🔵 P2-MEDIUM TASKS (Due: March 25, 2026)

### SEO TASKS

#### 16. SEO Technical Audit
**Previously Claimed Done:** 2 times (Sprints 4, 5)
**Evidence Found:** ❌ ZERO
**Current Status:** Sprint 15 identifies metadata bug ("Nigeria invoicing")

**Re-Assignment Requirements:**
- [ ] Fix metadata bug (update description to cross-border tax calculator)
- [ ] Verify sitemap.xml accessible (https://taxbridge.vercel.app/sitemap.xml)
- [ ] Verify robots.txt accessible
- [ ] Run Schema.org validator on calculator page
- [ ] Screenshot Google Search Console (if set up)
- [ ] Screenshot meta tags in browser DevTools
- [ ] Verification report: `docs/verification-reports/seo-audit-[DATE].md`
- [ ] Commit message: "[P2-MEDIUM] SEO Technical Audit Complete + VERIFICATION"

**Expected Evidence:**
```
docs/screenshots/seo-audit-[DATE]/
  - meta-tags-corrected.png
  - sitemap-accessible.png
  - schema-validator-passing.png
  - google-search-console.png
docs/verification-reports/seo-audit-[DATE].md
```

---

#### 17. SEO Blog Content - Verify 42 Articles Published
**Previously Claimed Done:** 4 times (Sprints 7, 8, 9, 10)
**Evidence Found:** ❌ ZERO
**Current Status:** Unknown if articles are actually live

**Re-Assignment Requirements:**
- [ ] List all blog article URLs (should be 42)
- [ ] Verify each URL returns HTTP 200
- [ ] Screenshot homepage showing blog section
- [ ] Screenshot 5 sample blog articles
- [ ] Submit sitemap to Google Search Console
- [ ] Verification report: `docs/verification-reports/blog-publication-[DATE].md`
- [ ] Commit message: "[P2-MEDIUM] SEO Blog Content Verified - 42 Articles Live + VERIFICATION"

**Expected Evidence:**
```
docs/screenshots/blog-publication-[DATE]/
  - blog-homepage.png
  - sample-article-1.png
  - sample-article-2.png
  - sample-article-3.png
  - google-search-console-indexing.png
docs/verification-reports/blog-publication-[DATE].md (list of all 42 URLs with HTTP status)
```

---

### MARKETING TASKS

#### 18. Product Hunt Launch Execution
**Previously Claimed Done:** 10 times (Sprints 6-15)
**Evidence Found:** ❌ ZERO
**Current Status:** Never launched

**Re-Assignment Requirements:**
- [ ] Create Product Hunt listing
- [ ] Submit product for launch
- [ ] Screenshot Product Hunt listing (live URL)
- [ ] Screenshot launch metrics after 24 hours (upvotes, comments)
- [ ] Track traffic spike in Google Analytics
- [ ] Verification report: `docs/verification-reports/product-hunt-launch-[DATE].md`
- [ ] Commit message: "[P2-MEDIUM] Product Hunt Launch COMPLETE + VERIFICATION"

**Expected Evidence:**
```
docs/screenshots/product-hunt-launch-[DATE]/
  - product-hunt-listing.png
  - launch-metrics-24hr.png
  - traffic-spike-analytics.png
docs/verification-reports/product-hunt-launch-[DATE].md
```

**Note:** This requires Stripe production to be live first (P0-1)

---

#### 19. Google Ads Campaign Launch
**Previously Claimed Done:** 4 times (Sprints 7, 8, 11, 13)
**Evidence Found:** ❌ ZERO
**Current Status:** Placeholder tracking IDs (AW-XXXXXXXXXX)

**Re-Assignment Requirements:**
- [ ] Create Google Ads account
- [ ] Set up campaigns for: "H1B RSU tax calculator", "TN visa stock options"
- [ ] Update tracking IDs in code (replace AW-XXXXXXXXXX)
- [ ] Set initial budget ($500)
- [ ] Screenshot Google Ads dashboard showing active campaigns
- [ ] Screenshot campaign performance after 7 days
- [ ] Verification report: `docs/verification-reports/google-ads-[DATE].md`
- [ ] Commit message: "[P2-MEDIUM] Google Ads Campaign Live + VERIFICATION"

**Expected Evidence:**
```
docs/screenshots/google-ads-[DATE]/
  - google-ads-dashboard.png
  - campaign-settings.png
  - 7-day-performance.png
docs/verification-reports/google-ads-[DATE].md
```

---

#### 20. Email Drip Campaign Activation
**Previously Claimed Done:** 4 times (Sprints 7, 8, 9, 11)
**Evidence Found:** ❌ ZERO
**Current Status:** SendGrid not configured (placeholder keys)

**Re-Assignment Requirements:**
- [ ] **First, complete P0-5: Activate SendGrid Email Service**
- [ ] Create 7-day drip campaign (Day 1: Welcome, Day 3: Calculator tips, Day 7: Upgrade)
- [ ] Send test emails to self
- [ ] Screenshot SendGrid campaign configuration
- [ ] Screenshot email templates (3 emails)
- [ ] Screenshot email delivery stats after 7 days
- [ ] Verification report: `docs/verification-reports/email-drip-[DATE].md`
- [ ] Commit message: "[P2-MEDIUM] Email Drip Campaign Live + VERIFICATION"

**Expected Evidence:**
```
docs/screenshots/email-drip-[DATE]/
  - sendgrid-campaign-config.png
  - email-template-day1.png
  - email-template-day3.png
  - email-template-day7.png
  - delivery-stats-7day.png
docs/verification-reports/email-drip-[DATE].md
```

**Dependency:** Requires P0-5 (SendGrid activation) to be completed first

---

## ⚪ P3-LOW TASKS (Due: March 31, 2026)

### FEATURE TASKS

#### 21. Referral Program UI
**Previously Claimed Done:** 2 times (Sprints 7, 8)
**Evidence Found:** ❌ ZERO
**Current Status:** Unknown

**Re-Assignment Requirements:**
- [ ] Verify /referrals page exists and loads
- [ ] Test referral link generation
- [ ] Test referral tracking (create test referral)
- [ ] Screenshot referral dashboard
- [ ] Screenshot referral link generation
- [ ] Verification report: `docs/verification-reports/referral-program-[DATE].md`
- [ ] Commit message: "[P3-LOW] Referral Program UI Verified + VERIFICATION"

**Expected Evidence:**
```
docs/screenshots/referral-program-[DATE]/
  - referral-dashboard.png
  - referral-link-generation.png
  - referral-tracking-test.png
docs/verification-reports/referral-program-[DATE].md
```

---

## 📊 SUMMARY

**Total Tasks Requiring Re-Verification:** 21

| Priority | Count | Deadline |
|----------|-------|----------|
| P0-CRITICAL | 8 | March 20, 2026 |
| P1-HIGH | 7 | March 22, 2026 |
| P2-MEDIUM | 4 | March 25, 2026 |
| P3-LOW | 1 | March 31, 2026 |
| **TOTAL** | **21** | - |

**Note:** This is a subset of the 194 falsely marked done tasks. These 21 are the highest priority revenue-blockers and infrastructure tasks. Additional tasks will be re-assigned in subsequent phases.

---

## 🚀 GETTING STARTED

1. **Read the policy:** `docs/TASK_COMPLETION_POLICY.md`
2. **Pick a task** from this list (start with P0)
3. **Use automation:** `npm run verify:task --task-id=[ID] --feature-url=[path] --title="[name]"`
4. **Capture evidence:** Screenshots, logs, verification reports
5. **Commit evidence:** `git add docs/screenshots/ docs/verification-reports/`
6. **Push:** `git push origin main`
7. **Mark done:** Only after evidence is committed

---

**Document:** `docs/TASK_RE_ASSIGNMENT_LIST.md`
**Related:** `docs/EVIDENCE_AUDIT_2026-03-19.md`
**Policy:** `docs/TASK_COMPLETION_POLICY.md`

**Status:** 🔴 INCOMPLETE - Awaiting Evidence
**Deadline:** Rolling (see individual tasks)
**Enforcement:** MANDATORY
