# 🔄 DEPLOYMENT WORKFLOW - VISUAL GUIDE

**Date:** March 19, 2026
**Purpose:** Visual documentation of how code gets from local → production
**Audience:** Engineers, CEO (Michael)
**Status:** Current state + Recommended fixes

---

## 📊 CURRENT STATE vs DESIRED STATE

### ❌ CURRENT WORKFLOW (BROKEN)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CURRENT DEPLOYMENT FLOW                         │
│                     (WHY ISSUES KEEP RECURRING)                         │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   ENGINEER   │
│  Writes Code │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  LOCAL DEVELOPMENT   │
│                      │
│  .env.local          │
│  (TEST MODE)         │
│                      │
│  STRIPE_SECRET_KEY=  │
│  sk_test_123...      │ ← Test keys work locally
│                      │
│  npm run dev ✅      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│   BUILD LOCALLY      │
│                      │
│  npm run build       │
│                      │
│  Uses .env.local     │
│  Build passes ✅     │
│                      │
│  Pre-commit hook:    │
│  Runs build again ✅ │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  UPDATE .env.production  │ ← CRITICAL MISTAKE
│  (IN GIT REPO)          │
│                         │
│  Engineer updates this  │
│  thinking it configures │
│  production             │
│                         │
│  REALITY: This file     │
│  is NOT USED by Vercel  │
│  It's DOCUMENTATION     │
│  ONLY                   │
└──────┬──────────────────┘
       │
       ▼
┌──────────────────────┐
│  GIT COMMIT & PUSH   │
│                      │
│  git add -A          │
│  git commit -m "..."  │
│  git push origin main│
│                      │
│  ✅ Code in GitHub   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  ENGINEER STOPS      │ ← CLAUDE.md says "STOP"
│                      │
│  README says:        │
│  "Michael handles    │
│   Vercel deployment  │
│   manually"          │
│                      │
│  Engineer assumes    │
│  work is done ✅     │
│                      │
│  Task marked DONE ✅ │
└──────────────────────┘
       │
       │ (But Vercel auto-deploys anyway!)
       │
       ▼
┌──────────────────────────────────────┐
│    VERCEL AUTO-DEPLOYMENT            │
│    (Happens in background)           │
│                                      │
│  1. GitHub webhook → Vercel          │
│  2. Vercel pulls latest commit       │
│  3. Vercel runs build                │
│  4. Vercel uses DASHBOARD env vars   │ ← NOT .env.production
│                                      │
│  VERCEL DASHBOARD VARIABLES:         │
│  STRIPE_SECRET_KEY=                  │
│    sk_live_YOUR_KEY_HERE ❌          │ ← PLACEHOLDER!
│                                      │
│  CLERK_SECRET_KEY=                   │
│    sk_live_YOUR_KEY ❌               │ ← PLACEHOLDER!
│                                      │
│  (28 placeholder variables total)    │
│                                      │
│  Deploy Status: ✅ SUCCESS           │
│  Build passes (no errors)            │
│  Site is LIVE                        │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│   PRODUCTION (taxbridge.vercel.app)  │
│                                      │
│   Site is accessible ✅              │
│   HTTP 200 OK ✅                     │
│                                      │
│   But features broken:               │
│   - Stripe checkout → 401 error ❌   │
│   - User signup → 500 error ❌       │
│   - PostHog tracking → silent fail ❌│
│   - Sentry monitoring → disabled ❌  │
│                                      │
│   USERS CAN'T PAY = $0 MRR ❌        │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────┐
│  NEXT SPRINT         │
│                      │
│  CEO: "Why is Stripe │
│        still broken?"│
│                      │
│  New engineer checks │
│  task history, sees  │
│  7 previous "✅ DONE"│
│  reports             │
│                      │
│  Engineer reads code,│
│  sees .env.production│
│  has sk_live_ prefix │
│                      │
│  "Looks done to me!" │
│                      │
│  Creates ANOTHER     │
│  verification report │
│                      │
│  Marks task DONE ✅  │
└──────┬───────────────┘
       │
       │
       └─────► INFINITE LOOP 🔁
```

---

### ✅ RECOMMENDED WORKFLOW (FIXED)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      RECOMMENDED DEPLOYMENT FLOW                         │
│                      (PREVENTS RECURRING ISSUES)                         │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   ENGINEER   │
│  Writes Code │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  LOCAL DEVELOPMENT   │
│                      │
│  .env.local          │
│  (TEST MODE)         │
│                      │
│  npm run dev ✅      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│   BUILD LOCALLY      │
│                      │
│  npm run build       │
│  Build passes ✅     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  GIT COMMIT & PUSH   │
│                      │
│  git add -A          │
│  git commit -m "..."  │
│  git push origin main│
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│   WAIT FOR DEPLOYMENT (2-5 MINUTES)  │
│                                      │
│   Watch: https://vercel.com/         │
│   taxbridge/deployments              │
│                                      │
│   Status: Building... ⏳             │
│   Status: Ready ✅                   │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│   VERIFY VERCEL ENV VARS             │ ← NEW STEP!
│                                      │
│   If task added new env var:         │
│                                      │
│   1. Go to Vercel Dashboard →        │
│      Settings → Environment Vars     │
│                                      │
│   2. Check if new var exists         │
│                                      │
│   3. If missing or placeholder:      │
│      - Add REAL value                │
│      - Trigger redeploy              │
│      - Wait 2 minutes                │
│                                      │
│   4. Verify NO placeholders:         │
│      grep "YOUR_.*_HERE" should      │
│      return 0 results                │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│   PRODUCTION HEALTH CHECK            │ ← NEW STEP!
│                                      │
│   Run automated checks:              │
│                                      │
│   npm run verify:production          │
│                                      │
│   Checks:                            │
│   ✅ Site returns HTTP 200           │
│   ✅ No placeholder keys in page src │
│   ✅ Stripe uses pk_live_ (not test) │
│   ✅ PostHog tracking fires          │
│   ✅ Sentry initialized              │
│                                      │
│   All checks pass ✅                 │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│   MANUAL SMOKE TEST                  │ ← NEW STEP!
│                                      │
│   Open: https://taxbridge.vercel.app │
│                                      │
│   Test critical flows:               │
│   1. Homepage loads                  │
│   2. Calculator works                │
│   3. Pricing page loads              │
│                                      │
│   For Stripe changes:                │
│   4. Click "Upgrade to Pro"          │
│   5. Verify Stripe Checkout opens    │
│   6. Check Network tab:              │
│      pk_live_... ✅ (NOT pk_test)    │
│                                      │
│   For UI changes:                    │
│   7. Screenshot before/after         │
│   8. Test on mobile                  │
│                                      │
│   All flows work ✅                  │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│   COLLECT EVIDENCE                   │ ← NEW STEP!
│                                      │
│   Required before marking DONE:      │
│                                      │
│   1. Screenshot of working feature   │
│   2. Screenshot of Vercel deploy ✅  │
│   3. For payments: Stripe Dashboard  │
│      showing test transaction        │
│   4. Production URL returning 200    │
│                                      │
│   Save to: docs/screenshots/         │
│            YYYY-MM-DD/               │
│                                      │
│   Add to task report ✅              │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────┐
│   MARK TASK DONE     │
│                      │
│   WITH EVIDENCE:     │
│   ✅ Code deployed   │
│   ✅ Env vars set    │
│   ✅ Health check ✅ │
│   ✅ Manual test ✅  │
│   ✅ Screenshots ✅  │
│                      │
│   Task complete ✅   │
│                      │
│   Will NOT recur! 🎉 │
└──────────────────────┘
```

---

## 🔍 THE CRITICAL GAP (Environment Variables)

### Current State (BROKEN):

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    TWO SEPARATE ENVIRONMENTS                             │
│                    (NOT SYNCED!)                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────┐        ┌───────────────────────────────┐
│   .env.production (Git)       │        │   Vercel Dashboard            │
│   ❌ DOCUMENTATION ONLY        │        │   ✅ ACTUAL PRODUCTION CONFIG │
│                               │        │                               │
│   Engineers update this ❌    │   ≠    │   Never updated ❌            │
│                               │        │                               │
│   STRIPE_SECRET_KEY=          │        │   STRIPE_SECRET_KEY=          │
│   sk_live_REAL_KEY_789        │        │   sk_live_YOUR_KEY_HERE       │
│                               │        │   ↑ PLACEHOLDER!              │
│   CLERK_SECRET_KEY=           │        │                               │
│   sk_live_REAL_KEY_456        │        │   CLERK_SECRET_KEY=           │
│                               │        │   sk_live_YOUR_KEY            │
│   (Looks done ✅)             │        │   ↑ PLACEHOLDER!              │
│                               │        │                               │
│   Committed to Git ✅         │        │   (Production reads this ❌)  │
│                               │        │                               │
│   Vercel IGNORES this file    │        │   28 placeholders total ❌    │
└───────────────────────────────┘        └───────────────────────────────┘

                    Engineers update LEFT
                    Production reads RIGHT
                    = BROKEN PRODUCTION ❌
```

### Fixed State:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    BOTH ENVIRONMENTS IN SYNC                             │
│                    (PRODUCTION WORKS!)                                   │
└─────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────┐        ┌───────────────────────────────┐
│   .env.production.TEMPLATE    │        │   Vercel Dashboard            │
│   ✅ DOCUMENTATION/REFERENCE   │        │   ✅ ACTUAL PRODUCTION CONFIG │
│                               │        │                               │
│   Engineer updates as ref ✅  │   →    │   ALSO updated ✅             │
│                               │        │                               │
│   STRIPE_SECRET_KEY=          │        │   STRIPE_SECRET_KEY=          │
│   sk_live_REAL_KEY_789        │        │   sk_live_REAL_KEY_789        │
│                               │        │   ↑ REAL VALUE! ✅            │
│   CLERK_SECRET_KEY=           │        │                               │
│   sk_live_REAL_KEY_456        │        │   CLERK_SECRET_KEY=           │
│                               │        │   sk_live_REAL_KEY_456        │
│   Committed to Git ✅         │        │   ↑ REAL VALUE! ✅            │
│   (As documentation)          │        │                               │
│                               │        │   0 placeholders ✅           │
│   Renamed to .TEMPLATE to     │        │   Production works ✅         │
│   make it clear it's not used │        │                               │
└───────────────────────────────┘        └───────────────────────────────┘

                    LEFT = Documentation
                    RIGHT = Production reads this
                    = PRODUCTION WORKS ✅
```

---

## 🚨 SPECIFIC CASE: Stripe (7+ Sprints)

### Why It Kept Recurring:

```
Sprint 06:
  Engineer updates .env.production ───────┐
  STRIPE_SECRET_KEY=sk_live_123           │
  Commits to Git ✅                       │
  Marks task DONE ✅                      │
                                          │
  Production still broken ❌               │
  (Vercel has placeholder)                │
                                          ▼
Sprint 07:
  New engineer checks .env.production ◄───┘
  Sees sk_live_ prefix
  "Looks done to me!"
  Creates verification report ✅
  Marks task DONE ✅

  Production still broken ❌
  (Vercel STILL has placeholder)

Sprint 08-15: REPEAT ∞

After 7 sprints:
  - .env.production in Git: ✅ Correct
  - Vercel Dashboard: ❌ Still placeholders
  - Production: ❌ $0 MRR (can't accept payments)
```

### The Fix:

```
1. Login to Vercel Dashboard
   https://vercel.com/taxbridge/settings/environment-variables

2. Click "STRIPE_SECRET_KEY"

3. Replace:
   FROM: sk_live_YOUR_LIVE_SECRET_KEY_HERE  ❌
   TO:   sk_live_ABC123XYZ...                ✅
   (Get from Stripe Dashboard → API Keys)

4. Click "Save"

5. Trigger redeploy (or wait for next commit)

6. Test on production:
   https://taxbridge.vercel.app/pricing
   Click "Upgrade to Pro"
   Verify Stripe Checkout opens with LIVE keys

7. DONE! (For real this time)
```

---

## 📊 DEPLOYMENT PIPELINE COMPONENTS

### What EXISTS:

```
✅ Git Repository (GitHub)
   - Code is version controlled
   - All commits pushed successfully
   - Main branch up to date

✅ Vercel Auto-Deploy
   - Webhook: GitHub push → Vercel build
   - Deploy time: 2-5 minutes
   - Status: WORKING PERFECTLY
   - URL: https://taxbridge.vercel.app

✅ Pre-commit Hook (Husky)
   - Runs: npm run build
   - Blocks commit if build fails
   - Enforces code quality

✅ Build Verification
   - TypeScript compilation
   - ESLint checks
   - Next.js build
   - All passing ✅
```

### What's MISSING:

```
❌ GitHub Actions (CI/CD)
   - No .github/workflows/ directory
   - No automated tests on push
   - No automated health checks
   - No deployment notifications

❌ Production Verification
   - No health check script
   - No smoke tests
   - No screenshot automation
   - Engineers don't verify deployments

❌ Environment Variable Sync
   - No script to sync .env → Vercel
   - No validation that Vercel vars match Git
   - No placeholder detection
   - Manual process (error-prone)

❌ Deployment Monitoring
   - No UptimeRobot / Pingdom
   - No deployment notifications
   - No rollback automation
   - No error alerts post-deploy
```

---

## 🎯 THE FIX (Step-by-Step)

### Phase 1: Immediate (4 hours)

**Fix Vercel Environment Variables**

```bash
# 1. Login to Vercel
open https://vercel.com/taxbridge/settings/environment-variables

# 2. Replace ALL placeholders (28 total):

REVENUE BLOCKERS (2 hours):
├─ STRIPE_SECRET_KEY (get from Stripe Dashboard)
├─ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
├─ STRIPE_WEBHOOK_SECRET (create webhook first)
├─ STRIPE_BASIC_PRICE_ID (run activation script)
├─ STRIPE_PRO_PRICE_ID
├─ STRIPE_ENTERPRISE_PRICE_ID
│
├─ CLERK_SECRET_KEY (get from Clerk Dashboard)
├─ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
├─ CLERK_WEBHOOK_SECRET
│
└─ SENDGRID_API_KEY (get from SendGrid)
   SENDGRID_FROM_EMAIL

MONITORING (1 hour):
├─ SENTRY_DSN (create Sentry project)
├─ SENTRY_AUTH_TOKEN
│
├─ NEXT_PUBLIC_POSTHOG_KEY (get from PostHog)
└─ NEXT_PUBLIC_POSTHOG_HOST

ANALYTICS (30 minutes):
├─ NEXT_PUBLIC_GA_TRACKING_ID (Google Analytics)
├─ NEXT_PUBLIC_META_PIXEL_ID (Facebook Pixel)
└─ Various Google Ads tracking IDs

# 3. Trigger Redeploy
# (Vercel → Deployments → ... → Redeploy)

# 4. Wait 2-5 minutes

# 5. Test Production
curl -I https://taxbridge.vercel.app
# Should return HTTP 200

# 6. Test Stripe Checkout
# Open https://taxbridge.vercel.app/pricing
# Click "Upgrade to Pro"
# Verify pk_live_ (NOT pk_test_) in Network tab

# 7. Test Payment (Card 4242 4242 4242 4242)
# Complete checkout
# Verify in Stripe Dashboard → Payments (LIVE mode)
# Immediately refund

✅ DONE! Revenue unlocked 🎉
```

### Phase 2: Short-term (This Week)

**Prevent Future Issues**

```bash
# 1. Rename .env.production
mv .env.production .env.production.TEMPLATE

# Add warning at top:
cat << 'EOF' > .env.production.TEMPLATE
# ⚠️  THIS FILE IS A TEMPLATE ONLY
# ⚠️  NOT USED BY PRODUCTION
# ⚠️  Production uses: Vercel Dashboard → Environment Variables
# ⚠️  After updating this file, ALSO update Vercel Dashboard
EOF

# 2. Update CLAUDE.md deployment workflow
# (Remove "STOP - manual deployment" section)
# (Add "Verify production" section)

# 3. Create production health check script
npm run verify:production

# 4. Add to package.json:
"scripts": {
  "verify:production": "tsx scripts/verify-production-health.ts"
}

# 5. Update task completion policy
# Require: Screenshots + production URL + health check
```

### Phase 3: Long-term (This Month)

**Add Automation**

```bash
# 1. Add GitHub Actions
mkdir -p .github/workflows
# Create: production-health-check.yml
# Trigger: After every deployment
# Actions: Run health checks, notify if failing

# 2. Add environment variable sync script
# scripts/sync-env-to-vercel.ts
# Detects placeholders, prevents deployment

# 3. Add deployment notifications
# Slack/Discord webhook on deploy success/failure

# 4. Add uptime monitoring
# UptimeRobot: Ping taxbridge.vercel.app every 5 min
# Alert if down > 5 min

# 5. Add Sentry error alerts
# Notify on production errors
# Track error rate trends
```

---

## ✅ SUCCESS CRITERIA

**This deployment pipeline is FIXED when:**

1. ✅ Zero placeholder environment variables in Vercel Dashboard
2. ✅ Production site accepts real payments (Stripe LIVE mode)
3. ✅ All 28 environment variables have real values
4. ✅ Health check script runs green on every deployment
5. ✅ No task recurs more than 2 sprints
6. ✅ Engineers verify production before marking tasks "done"
7. ✅ First paying customer processed successfully

**Target Date:** March 22, 2026 (3 days from now)

---

## 📚 RELATED DOCUMENTATION

- **Full Diagnostic:** `docs/DEPLOYMENT_PIPELINE_AUDIT.md` (700+ lines)
- **Executive Summary:** `docs/DEPLOYMENT_PIPELINE_DIAGNOSIS_EXECUTIVE_SUMMARY.md` (268 lines)
- **Production Verification Checklist:** `docs/PRODUCTION_VERIFICATION_CHECKLIST.md`
- **Quick Reference:** `docs/DEPLOYMENT_QUICK_REFERENCE.md`

---

**Created:** March 19, 2026
**Author:** Alfie (Senior Engineer)
**Status:** Ready for CEO review and execution
**Time to Fix:** 4 hours → Revenue unlocked 💰
