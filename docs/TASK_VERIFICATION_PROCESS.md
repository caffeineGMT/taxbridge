# Task Verification Process - Engineering Guide

## ⚠️ CRITICAL: Definition of "Done" Has Changed

**EFFECTIVE IMMEDIATELY:** No task can be marked "done" without completing this verification process.

This document establishes the mandatory evidence-based completion criteria for ALL engineering tasks at TaxBridge.

---

## 🎯 Why This Exists

### The Problem
- **6+ sprints** claiming "Stripe production mode activated" → still in test mode
- **8+ sprints** claiming "production site fixed" → site still returning 000/503 errors
- **Multiple sprints** claiming "tests passing" → tests still failing
- **Zero accountability** for task completion claims

### The Root Cause
Engineers marked tasks "done" based on:
- ✅ Code written (but not deployed)
- ✅ Tests passing locally (but not in CI)
- ✅ Build working (but not verified in production)
- ✅ Feature "working on my machine"

**This ends today.**

---

## 📋 The New Standard: Evidence-Based Completion

### A Task Is NOT "Done" Until:

1. **Screenshots exist** showing the feature working in production
2. **Deployment URL verified** returning HTTP 200 in production
3. **Metrics captured** proving functionality (analytics, tests, performance)
4. **Build passes** with ZERO errors
5. **Verification report** generated and committed to Git

### No Exceptions

- P0 tasks: **100% verification required**
- P1 tasks: **100% verification required**
- P2 tasks: **100% verification required**
- P3 tasks: **Automated verification optional, manual checklist required**

---

## 🚀 Quick Start: Verify Your Task in 5 Minutes

### Step 1: Run Automated Verification

```bash
npm run verify:task -- \
  --task-id=P0-001 \
  --feature-url=/calculator \
  --title="Fix calculator accuracy bug"
```

This automatically:
- ✅ Captures desktop + mobile screenshots
- ✅ Verifies deployment returns HTTP 200
- ✅ Runs build verification (zero errors required)
- ✅ Runs test suite (100% pass required)
- ✅ Runs Lighthouse performance audit
- ✅ Generates verification report with evidence

### Step 2: Review Verification Report

Check: `docs/verification-reports/YYYY-MM-DD-task-[task-id]-VERIFICATION.md`

**If verification PASSED:**
- ✅ Mark task as "done"
- ✅ Include verification report link in commit
- ✅ Move to next task

**If verification FAILED:**
- ❌ Fix issues listed in report
- ❌ Re-run verification
- ❌ DO NOT mark task as "done"

### Step 3: Commit Evidence

```bash
git add docs/screenshots/ docs/verification-reports/
git commit -m "[P0-001] Fix calculator accuracy + VERIFICATION REPORT"
git push origin main
```

---

## 📸 What Evidence Looks Like

### Example: Task P0-123 "Enable Stripe Production Mode"

**BEFORE (How tasks were claimed "done" previously):**
```
Commit: "Enable Stripe production mode"
Files changed: .env.production (1 line)
Evidence: NONE
Result: Task marked "done", but Stripe still in test mode for 6 sprints
```

**AFTER (Required evidence):**
```
Commit: "[P0-123] Enable Stripe Production Mode + VERIFICATION"

Files changed:
  - .env.production (Stripe keys updated)
  - docs/screenshots/2026-03-19-task-P0-123/
      01-desktop-view.png (checkout page with "live mode" badge visible)
      02-mobile-view.png (payment working on mobile)
      03-lighthouse-report.json (performance 92/100)
  - docs/verification-reports/2026-03-19-task-P0-123-VERIFICATION.md

Verification Report:
  ✅ Production URL: HTTP 200
  ✅ Stripe test payment: tx_abc123 ($1.00 charged successfully)
  ✅ Webhook fired: payment_intent.succeeded
  ✅ Build: PASSED (0 errors)
  ✅ Tests: 191/191 passing
  ✅ Lighthouse: Performance 92/100, Accessibility 95/100

Result: Task VERIFIED as actually complete. Can mark "done" with confidence.
```

---

## 📝 Manual Verification Checklist (If Automation Fails)

If `npm run verify:task` fails or isn't applicable, use this manual checklist:

### Required Evidence Files

Create these files manually:

1. **Screenshot 1: Desktop view**
   - Path: `docs/screenshots/YYYY-MM-DD-task-[id]/01-desktop-view.png`
   - Content: Full-page screenshot of working feature on desktop
   - How: Open https://taxbridge.vercel.app/[feature-url] in Chrome, take screenshot

2. **Screenshot 2: Mobile view**
   - Path: `docs/screenshots/YYYY-MM-DD-task-[id]/02-mobile-view.png`
   - Content: Full-page screenshot of working feature on mobile
   - How: Open in Chrome DevTools mobile emulator, iPhone 12 Pro, take screenshot

3. **Screenshot 3: Lighthouse report**
   - Path: `docs/screenshots/YYYY-MM-DD-task-[id]/03-lighthouse.png`
   - Content: Screenshot of Lighthouse scores
   - How: Run `npm run lighthouse:production`, screenshot the results

4. **Verification Report**
   - Path: `docs/verification-reports/YYYY-MM-DD-task-[id]-VERIFICATION.md`
   - Content: Copy `TASK_VERIFICATION_TEMPLATE.md` and fill in ALL sections
   - How: Fill in manually with test results, deployment URLs, metrics

### Manual Verification Steps

1. **Deploy to production:**
   ```bash
   npm run build  # MUST pass with ZERO errors
   git push origin main
   # Wait for Vercel deployment to complete
   ```

2. **Verify production URL:**
   ```bash
   curl -I https://taxbridge.vercel.app/[feature-url]
   # MUST return: HTTP/2 200
   ```

3. **Capture screenshots:**
   - Desktop: 1920x1080 viewport
   - Mobile: 375x667 viewport (iPhone 12 Pro)
   - Save to `docs/screenshots/YYYY-MM-DD-task-[id]/`

4. **Run Lighthouse audit:**
   ```bash
   npm run lighthouse:production
   # Save report screenshot
   ```

5. **Verify metrics:**
   - For revenue features: Test payment with Stripe test card
   - For calculator features: Run unit tests, verify output
   - For SEO features: Check Google Search Console indexing
   - For analytics features: Verify PostHog event firing

6. **Complete verification report:**
   - Copy template: `docs/TASK_VERIFICATION_TEMPLATE.md`
   - Fill in ALL sections (no skipping)
   - Save to: `docs/verification-reports/YYYY-MM-DD-task-[id]-VERIFICATION.md`

7. **Commit evidence:**
   ```bash
   git add docs/screenshots/ docs/verification-reports/
   git commit -m "[P0-XXX] Task Title + VERIFICATION REPORT"
   git push origin main
   ```

---

## 🔥 Real-World Examples

### Example 1: Feature Task (P0)

**Task:** "Add RSU calculator to homepage"

**Automated Verification:**
```bash
npm run verify:task -- \
  --task-id=P0-024 \
  --feature-url=/ \
  --title="Add RSU calculator to homepage"
```

**Expected Output:**
```
✅ VERIFICATION PASSED

Screenshots:
  ✅ Desktop: docs/screenshots/2026-03-19-task-P0-024/01-desktop-view.png
  ✅ Mobile: docs/screenshots/2026-03-19-task-P0-024/02-mobile-view.png

Deployment:
  ✅ URL: https://taxbridge.vercel.app/
  ✅ HTTP 200 (245ms response time)

Build:
  ✅ PASSED (0 errors, 3 warnings)
  ✅ Size: 142MB

Tests:
  ✅ 195/195 passing (4 new calculator tests added)

Lighthouse:
  ✅ Performance: 89/100
  ✅ Accessibility: 94/100
  ✅ SEO: 92/100

Report: docs/verification-reports/2026-03-19-task-P0-024-VERIFICATION.md
```

**Result:** Task verified as complete. Safe to mark "done".

---

### Example 2: Bug Fix Task (P1)

**Task:** "Fix calculator showing NaN for zero income"

**Automated Verification:**
```bash
npm run verify:task -- \
  --task-id=P1-089 \
  --feature-url=/calculator \
  --title="Fix calculator NaN bug"
```

**Expected Output:**
```
❌ VERIFICATION FAILED

Found 2 issues:

  ❌ Tests failing: 2/195 tests failing
     - test/calculator.test.ts:45 - "returns 0 for zero income"
     - test/calculator.test.ts:67 - "handles edge case: $0 RSUs"

  ⚠️  Performance: 78/100 below target (85)

Next steps:
  1. Fix failing tests
  2. Optimize performance (LCP is 3.2s, target <2.5s)
  3. Re-run: npm run verify:task -- --task-id=P1-089 --feature-url=/calculator
```

**Result:** Task NOT verified. DO NOT mark as "done". Fix issues first.

---

### Example 3: Stripe Production Activation (The Recurring Nightmare)

**Task:** "Activate Stripe production mode"

**WRONG WAY (How this was done for 6+ sprints):**
```bash
# Edit .env.production
STRIPE_SECRET_KEY=sk_live_abc123

git commit -m "Enable Stripe production"
# Mark task as "done"
```

**Result:** Task claimed "done" but Stripe never actually worked in production.

**RIGHT WAY (Evidence-based):**
```bash
# 1. Update environment variables
# Edit .env.production with REAL Stripe live keys

# 2. Deploy
npm run build  # MUST pass
git push origin main
# Wait for deployment

# 3. Run verification
npm run verify:task -- \
  --task-id=P0-STRIPE \
  --feature-url=/checkout \
  --title="Activate Stripe production mode"

# 4. Manual payment test (CRITICAL)
# - Visit https://taxbridge.vercel.app/checkout
# - Complete payment with test card: 4242 4242 4242 4242
# - Verify Stripe dashboard shows "LIVE MODE" transaction
# - Screenshot Stripe dashboard showing live transaction
# - Add screenshot to docs/screenshots/2026-03-19-task-P0-STRIPE/04-stripe-live-transaction.png

# 5. Complete verification report
# Fill in TASK_VERIFICATION_TEMPLATE.md with:
#   - Screenshot of checkout page
#   - Screenshot of successful payment
#   - Screenshot of Stripe dashboard (live mode)
#   - Transaction ID from Stripe
#   - Webhook event log showing payment_intent.succeeded

# 6. Commit ALL evidence
git add docs/screenshots/ docs/verification-reports/
git commit -m "[P0-STRIPE] Stripe Production Activated + VERIFICATION (Transaction ID: pi_abc123)"
git push origin main
```

**Result:** Task ACTUALLY complete with proof. Can never claim "done" without evidence again.

---

## ⚡ Automation Details

### What `npm run verify:task` Does

1. **Launches Playwright browser** (headless Chrome)
2. **Navigates to feature URL** in production
3. **Captures screenshots:**
   - Desktop view (1920x1080)
   - Mobile view (375x667 iPhone 12 Pro)
4. **Verifies deployment:**
   - HTTP status code (must be 200)
   - Response time (target: <3000ms)
5. **Runs build verification:**
   - Executes `npm run build`
   - Checks for errors (must be 0)
   - Measures build size (target: <150MB)
6. **Runs test suite:**
   - Executes `npm test`
   - Counts passing/failing tests (100% pass required)
7. **Runs Lighthouse audit:**
   - Performance (target: >85)
   - Accessibility (target: >90)
   - SEO (target: >90)
8. **Generates report:**
   - Markdown report with all results
   - JSON data for automation
   - Pass/fail verdict

### Requirements

All dependencies already installed:
- `@playwright/test` - Screenshot capture
- `lighthouse` - Performance audit
- `vitest` - Test runner

---

## 🎯 Success Criteria by Task Type

### Revenue Features (Stripe, Checkout, Subscriptions)

**MUST INCLUDE:**
1. ✅ Screenshot of checkout page with "LIVE MODE" indicator
2. ✅ Screenshot of successful test payment in Stripe dashboard
3. ✅ Transaction ID from Stripe (e.g., `pi_abc123`)
4. ✅ Webhook event log showing `payment_intent.succeeded`
5. ✅ Verification that Stripe keys start with `sk_live_` (NOT `sk_test_`)

**VERIFICATION SCRIPT:**
```bash
npm run verify:task -- --task-id=P0-XXX --feature-url=/checkout --title="Stripe production"
```

**MANUAL VERIFICATION:**
```bash
# Must complete real test payment
# Use Stripe test card: 4242 4242 4242 4242
# Screenshot Stripe dashboard showing transaction
# Include transaction ID in commit message
```

---

### Calculator Features

**MUST INCLUDE:**
1. ✅ Unit tests for all calculation logic (100% passing)
2. ✅ Test coverage report showing >80% coverage
3. ✅ Screenshot of calculator with sample inputs/outputs
4. ✅ Manual verification with known test cases
5. ✅ Edge case testing (zero values, negative values, large values)

**VERIFICATION SCRIPT:**
```bash
npm run verify:task -- --task-id=P1-XXX --feature-url=/calculator --title="Calculator fix"
```

**MANUAL VERIFICATION:**
```bash
# Test with known values:
# Input: RSUs=1000, Price=$100, Income=$150k, Canada resident
# Expected: US tax=$XX, Canada tax=$YY, FTC savings=$ZZ
# Screenshot showing correct output
```

---

### SEO Features (Blog, Sitemap, Meta Tags)

**MUST INCLUDE:**
1. ✅ Screenshot of Google Search Console showing indexed pages
2. ✅ Sitemap validation (https://taxbridge.vercel.app/sitemap.xml returns 200)
3. ✅ Meta tags verification (title, description, og:image present)
4. ✅ Structured data validation (Schema.org via Google Rich Results Test)
5. ✅ Lighthouse SEO score >90

**VERIFICATION SCRIPT:**
```bash
npm run verify:task -- --task-id=P1-XXX --feature-url=/blog/article --title="SEO optimization"
npm run verify:gsc  # Verify Google Search Console indexing
```

**MANUAL VERIFICATION:**
```bash
# Check sitemap
curl https://taxbridge.vercel.app/sitemap.xml | grep -c "<url>"
# Should show count of indexed URLs

# Validate structured data
# Visit: https://search.google.com/test/rich-results
# Enter URL, screenshot results
```

---

### Analytics Features (PostHog, Tracking)

**MUST INCLUDE:**
1. ✅ Screenshot of PostHog dashboard showing event firing
2. ✅ Event name and properties documented
3. ✅ Test event generated and verified in PostHog
4. ✅ Conversion funnel showing correct step tracking
5. ✅ No console errors in browser DevTools

**VERIFICATION SCRIPT:**
```bash
npm run verify:posthog-funnel  # Automated PostHog verification
npm run verify:task -- --task-id=P2-XXX --feature-url=/signup --title="Add signup tracking"
```

**MANUAL VERIFICATION:**
```bash
# 1. Open https://taxbridge.vercel.app/signup in browser
# 2. Complete signup flow
# 3. Open PostHog dashboard → Activity → Live Events
# 4. Verify "signup_completed" event appears
# 5. Screenshot event details
```

---

## 🚫 Common Mistakes (What NOT To Do)

### ❌ WRONG: Claiming "Done" Without Deployment

```bash
git commit -m "Fix bug"
# Mark task as "done"
```

**Problem:** Code not deployed. Feature not in production. No verification.

### ✅ RIGHT: Deploy + Verify + Evidence

```bash
npm run build  # Verify build passes
git push origin main  # Deploy to production
npm run verify:task -- --task-id=P1-001 --feature-url=/feature  # Verify
git add docs/screenshots/ docs/verification-reports/
git commit -m "[P1-001] Fix bug + VERIFICATION REPORT"
git push origin main
```

---

### ❌ WRONG: "Tests Pass Locally"

```bash
npm test
# All tests pass ✅
# Mark task as "done"
```

**Problem:** Tests might pass locally but fail in CI. No production verification.

### ✅ RIGHT: Build + Deploy + Verify

```bash
npm test  # Pass locally ✅
npm run build  # Pass build ✅
git push origin main  # Deploy ✅
npm run verify:task -- ...  # Verify in production ✅
```

---

### ❌ WRONG: "I Checked It Works"

```bash
# Visit localhost:3000
# Feature works ✅
# Mark task as "done"
```

**Problem:** Works on localhost ≠ works in production. No evidence. No screenshots.

### ✅ RIGHT: Production Verification with Screenshots

```bash
# Deploy to production first
git push origin main

# Visit PRODUCTION URL (not localhost)
# https://taxbridge.vercel.app/feature

# Run automated verification
npm run verify:task -- --task-id=P1-001 --feature-url=/feature

# Verification captures:
# - Screenshot of working feature in production
# - HTTP 200 status from production URL
# - Lighthouse performance metrics
# - Build verification
```

---

## 🔒 Enforcement

### Code Review Requirements

Pull requests must include:
1. ✅ Link to verification report in PR description
2. ✅ Screenshots committed to `docs/screenshots/`
3. ✅ Verification report committed to `docs/verification-reports/`
4. ✅ Commit message includes "[TASK-ID] + VERIFICATION"

**Template PR Description:**
```markdown
## Task

[P0-123] Enable Stripe production mode

## Verification Report

✅ VERIFICATION PASSED

**Report:** docs/verification-reports/2026-03-19-task-P0-123-VERIFICATION.md

**Evidence:**
- Desktop screenshot: docs/screenshots/2026-03-19-task-P0-123/01-desktop-view.png
- Mobile screenshot: docs/screenshots/2026-03-19-task-P0-123/02-mobile-view.png
- Stripe live transaction: tx_pi_abc123
- Lighthouse: Performance 92/100, Accessibility 95/100

## Testing

- [x] Automated verification passed
- [x] Manual payment test completed (Stripe live mode)
- [x] Build passes with ZERO errors
- [x] All tests passing (195/195)
```

### Task Tracker Integration

When marking tasks "done":
1. ✅ Paste verification report link in task comments
2. ✅ Include screenshots in task attachments
3. ✅ Reference commit SHA with verification

**Example Task Comment:**
```
✅ TASK COMPLETE

Verification Report: docs/verification-reports/2026-03-19-task-P0-123-VERIFICATION.md
Commit: 9f8e7d6 - "[P0-123] Enable Stripe Production + VERIFICATION"

Evidence:
- Screenshot: [attached]
- Stripe Transaction: pi_abc123
- Production URL: https://taxbridge.vercel.app/checkout (HTTP 200 ✅)
- Lighthouse: 92/100 performance ✅
```

---

## 📊 Metrics Dashboard

Track verification compliance:
```bash
# Count tasks with verification reports
ls -1 docs/verification-reports/ | wc -l

# Count tasks with screenshots
ls -1 docs/screenshots/ | wc -l

# Recent verifications
ls -lt docs/verification-reports/ | head -10
```

**Goal:** 100% of P0/P1 tasks have verification reports.

---

## 🎓 Training Examples

### Complete Workflow Example

**Task:** [P0-150] "Fix production site returning 503"

**Step-by-step verification:**

```bash
# 1. Identify the issue
curl -I https://taxbridge.vercel.app
# HTTP/2 503 Service Unavailable ❌

# 2. Fix the issue (update Clerk keys in .env.production)

# 3. Deploy
npm run build
git add .env.production
git commit -m "[P0-150] Fix Clerk production keys"
git push origin main

# 4. Wait for deployment (30 seconds)

# 5. Verify fix manually
curl -I https://taxbridge.vercel.app
# HTTP/2 200 OK ✅

# 6. Run automated verification
npm run verify:task -- \
  --task-id=P0-150 \
  --feature-url=/ \
  --title="Fix production 503 error"

# Output:
# ✅ VERIFICATION PASSED
# ✅ Production URL: HTTP 200 (312ms)
# ✅ Screenshots captured
# ✅ Build: PASSED
# ✅ Tests: 195/195 passing
# ✅ Lighthouse: Performance 91/100

# 7. Review verification report
cat docs/verification-reports/2026-03-19-task-P0-150-VERIFICATION.md
# All checks passed ✅

# 8. Commit evidence
git add docs/screenshots/ docs/verification-reports/
git commit -m "[P0-150] Fix production 503 + VERIFICATION REPORT"
git push origin main

# 9. Mark task as "done" with confidence
# Include verification report link in task tracker
```

**Result:** Task VERIFIED as complete with evidence. Cannot dispute.

---

## 🚨 Frequently Asked Questions

### Q: What if automated verification fails but the feature works?

**A:** Investigate why verification failed. Common causes:
- Production URL wrong (check `--feature-url` parameter)
- Deployment not complete (wait 60 seconds, retry)
- Lighthouse timeout (run manually: `npm run lighthouse:production`)
- Tests flaky (fix tests, not verification)

If automation genuinely broken, use manual verification checklist.

### Q: Do I need screenshots for backend tasks?

**A:** Yes, but screenshot the API response or database state:
- API endpoint: Screenshot Postman/curl response
- Database migration: Screenshot database schema
- Cron job: Screenshot logs showing execution
- Background job: Screenshot queue/job status

### Q: Can I skip verification for "quick fixes"?

**A:** No. **Every** task requires verification, no matter how small. Quick fixes are often where bugs hide.

### Q: What if I'm blocked waiting for deployment?

**A:** Verification requires production deployment. If deployment is blocked:
1. Fix deployment blocker first
2. Then verify your task
3. Don't mark as "done" until deployed + verified

### Q: How do I verify tasks that modify config files?

**A:** Config changes are HIGH RISK. Extra verification required:
1. ✅ Screenshot showing config loaded correctly (browser DevTools, logs)
2. ✅ Screenshot of service using config (e.g., Stripe dashboard showing live mode)
3. ✅ Automated test proving config is read correctly
4. ✅ Build passes with new config
5. ✅ Production deployment successful

---

## 📚 Additional Resources

- **Verification Template:** `docs/TASK_VERIFICATION_TEMPLATE.md`
- **Verification Script:** `scripts/verify-task-completion.ts`
- **Example Reports:** `docs/verification-reports/` (see previous verifications)
- **Screenshot Guidelines:** `docs/SCREENSHOT_GUIDELINES.md` (TODO)

---

## 🔄 Continuous Improvement

This process will evolve. Provide feedback:
- What verification step is too slow?
- What evidence type is missing?
- What automation would help?

**Contact:** Michael (CEO) or file issue in GitHub

---

## ✅ Summary: The New Normal

### Before You Mark Any Task "Done":

1. ✅ Feature deployed to production
2. ✅ Production URL returns HTTP 200
3. ✅ Screenshots captured (desktop + mobile)
4. ✅ Build passes (ZERO errors)
5. ✅ Tests pass (100%)
6. ✅ Lighthouse scores meet targets
7. ✅ Verification report generated
8. ✅ Evidence committed to Git

### One Command to Rule Them All:

```bash
npm run verify:task -- \
  --task-id=P0-XXX \
  --feature-url=/feature \
  --title="Task description"
```

### The Standard:

**If it's not verified, it's not done.**

**If it's not in production, it's not done.**

**If there are no screenshots, it's not done.**

---

**Document Version:** 1.0
**Last Updated:** 2026-03-19
**Owner:** Michael Guo (CEO)
**Status:** MANDATORY - All engineers must follow
