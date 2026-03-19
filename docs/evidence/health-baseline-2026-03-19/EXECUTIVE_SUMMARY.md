# Production Health Baseline - Executive Summary

**Date:** March 19, 2026
**Status:** 🚨 **CRITICAL - WRONG APP DEPLOYED**
**Evidence Location:** `docs/evidence/health-baseline-2026-03-19/`

---

## TL;DR

✅ **EVIDENCE COLLECTED:** Screenshots, logs, environment audit
❌ **CRITICAL FINDING:** **WRONG APPLICATION DEPLOYED TO PRODUCTION**
⚠️ **REVENUE IMPACT:** $0 MRR (correct product not live for 8+ sprints)

---

## The Problem

Your Vercel deployment at **https://taxbridge.vercel.app** is serving the **WRONG APP**:

| What's Live | What Should Be Live |
|-------------|---------------------|
| 🇳🇬 "Nigeria NRS e-invoicing platform for SMEs" | 🇺🇸🇨🇦 "US-Canada cross-border tax calculator for H-1B/TN workers with RSUs" |
| Admin dashboard for Nigeria tax compliance | RSU tax calculator for tech workers |
| 0 relevant features | Calculator, pricing, checkout, 42 blog articles |

**Proof:**
- Production homepage title: "TaxBridge Admin Dashboard"
- Production description: "Nigeria's first offline-first, NRS-compliant e-invoicing"
- No mention of H-1B, TN visa, RSU, or cross-border anywhere

**Local codebase is CORRECT:**
- `npm run build` succeeds with all routes
- Description: "US-Canada cross-border tax calculator for H-1B and TN visa tech workers"
- Routes exist: `/us-canada-tax-calculator`, `/h1b-rsu-tax-guide`, 50+ tax calculators

---

## Verification Results

### ✅ COMPLETED

1. **Site Accessibility: PASS**
   - https://taxbridge.vercel.app returns HTTP 200
   - Screenshot captured: `homepage-screenshot.png`
   - **BUT:** Wrong app is live

2. **Environment Variables Audit: FAIL**
   - Scanned 14 critical variables
   - **6 P0 blockers:** Stripe, Clerk, PostHog all placeholders
   - **4 missing:** Postgres URLs, OpenAI
   - Full masked audit in report

### ❌ BLOCKED (Cannot Complete)

3. **Calculator End-to-End Test: BLOCKED**
   - Route `/us-canada-tax-calculator` returns **HTTP 404**
   - Cannot record workflow video
   - **Blocker:** Wrong app deployed

4. **Stripe Checkout Test: BLOCKED**
   - Checkout flow doesn't exist (wrong app)
   - Stripe keys are placeholders (cannot process payments)
   - Cannot obtain transaction ID
   - **Blocker:** Wrong app + placeholder keys

---

## Evidence Artifacts

📁 **Evidence Directory:** `docs/evidence/health-baseline-2026-03-19/`

**Generated:**
- ✅ `homepage-screenshot.png` (300KB) - Shows WRONG app
- ✅ `health-baseline-report.md` - Detailed report
- ✅ `health-baseline-report.json` - Machine-readable data
- ✅ `CRITICAL_FINDINGS.md` - This finding analysis

**Not Generated (Blocked):**
- ❌ Calculator workflow video
- ❌ Stripe transaction ID
- ❌ Checkout screenshots

---

## Environment Issues (P0 Revenue Blockers)

| Service | Status | Impact |
|---------|--------|--------|
| **Stripe** | ⚠️ Placeholder keys | Cannot accept payments |
| **Clerk** | ⚠️ Placeholder keys | Users cannot sign up/login |
| **PostHog** | ⚠️ Placeholder key | No analytics/funnel tracking |
| **Sentry** | ⚠️ Placeholder token | No error monitoring |

**All 4 services have placeholder values in .env.production:**
- `sk_live_YOUR_LIVE_SECRET_KEY_HERE`
- `pk_live_YOUR_PUBLISHABLE_KEY_HERE`
- `phc_YOUR_POSTHOG_KEY`
- `YOUR_SENTRY_AUTH_TOKEN`

---

## Why This Happened

**Root Cause:** 8+ sprints of tasks claimed "production verified" but all tested the **wrong deployment**.

**How It Persisted:**
1. Engineers verified "site loads" → HTTP 200 ✅ (but didn't check content)
2. Engineers fixed "build errors" → Build passes ✅ (but never deployed)
3. Engineers verified "env vars set" → Variables exist ✅ (but all placeholders)
4. No one actually **used the calculator** on production

**The Pattern:**
- ✅ Verify technical metric (HTTP 200, build success)
- ❌ Never verify **actual product works** (calculator exists, can buy)

---

## Fix Timeline

### Immediate (30 min)
1. **Redeploy correct app to Vercel**
   - Deploy from current `main` branch
   - Verify `/us-canada-tax-calculator` returns HTTP 200

### Within 1 hour
2. **Replace P0 environment variables in Vercel:**
   - Stripe keys (test OR production)
   - Clerk keys (production)
   - PostHog key (production project)

### Within 2 hours
3. **Re-run health baseline verification:**
   ```bash
   npm run verify:health-baseline
   ```
   - Should now PASS all 4 checks

### Within 3 hours
4. **Complete blocked verifications:**
   - Record calculator workflow video
   - Execute real Stripe checkout
   - Capture transaction ID

---

## Task Completion Status

**Per `TASK_COMPLETION_POLICY.md` requirements:**

| Evidence Type | Status | Blocker |
|---------------|--------|---------|
| Screenshots (desktop + mobile) | ⚠️ Partial | Only desktop, shows wrong app |
| Video recording (calculator) | ❌ Blocked | Calculator returns 404 |
| Logs/Terminal output | ✅ Complete | Build logs + verification output |
| Deployed URL (HTTP 200) | ⚠️ Wrong App | URL works, wrong product |
| Analytics data (transaction) | ❌ Blocked | Placeholder keys |

**Overall:** **40% Evidence Collected** (2/5 requirements met)

**Cannot mark task COMPLETE until:**
- Correct app deployed
- Calculator accessible (HTTP 200)
- Video recorded
- Stripe checkout executed
- Transaction ID obtained

---

## Recommendations (Priority Order)

### 🔴 DO IMMEDIATELY (Next 30 min)

1. **Deploy correct app to Vercel**
   - Verify: Homepage says "US-Canada cross-border tax"
   - Verify: `/us-canada-tax-calculator` returns HTTP 200
   - Verify: `/sitemap.xml` exists

### 🟠 DO TODAY (Next 2 hours)

2. **Replace all P0 environment variables:**
   - Stripe: Real keys (test mode OK for now, production mode better)
   - Clerk: Production keys from dashboard
   - PostHog: Project API key from settings
   - Sentry: Auth token + DSN from project settings

3. **Re-run verification and complete evidence:**
   - Run: `npm run verify:health-baseline`
   - Record: Calculator workflow video
   - Execute: Real Stripe checkout test
   - Save: Transaction ID + all evidence

### 🔵 DO THIS WEEK

4. **Set up production monitoring:**
   - UptimeRobot: Ping `/us-canada-tax-calculator` every 5 min
   - Sentry: Verify error capture working
   - PostHog: Verify funnel events firing

---

## Evidence Summary

**What We Have:**
- ✅ Automated verification script (`scripts/production-health-baseline.ts`)
- ✅ Screenshot of production homepage (proves wrong app deployed)
- ✅ Environment audit (proves all keys are placeholders)
- ✅ Build logs (proves local code is correct)
- ✅ Detailed reports (3 files: MD, JSON, Critical Findings)

**What We're Missing:**
- ❌ Video of calculator working (blocked by 404)
- ❌ Stripe transaction ID (blocked by placeholders + wrong app)

**Why We're Missing It:**
- Wrong app deployed → Calculator route doesn't exist
- Placeholder keys → Cannot process payments
- **Both must be fixed before evidence can be collected**

---

## Files Generated

```
docs/evidence/health-baseline-2026-03-19/
├── homepage-screenshot.png           (300KB - Visual proof of wrong app)
├── health-baseline-report.md         (Detailed technical report)
├── health-baseline-report.json       (Machine-readable data)
├── CRITICAL_FINDINGS.md              (Deep analysis of deployment issue)
└── EXECUTIVE_SUMMARY.md              (This file)
```

**Commit these to Git:**
```bash
git add docs/evidence/health-baseline-2026-03-19/
git add scripts/production-health-baseline.ts
git add package.json
git commit -m "[P0-CRITICAL] Production Health Baseline Evidence - WRONG APP DEPLOYED

CRITICAL FINDING: Vercel deployment serves Nigeria e-invoicing app instead of
US-Canada RSU tax calculator. Local build is correct, deployment is wrong.

EVIDENCE COLLECTED (40%):
✅ Homepage screenshot (shows wrong app)
✅ Environment audit (6 P0 placeholder keys)
✅ Build logs (local code correct)
✅ Automated verification script

EVIDENCE BLOCKED (60%):
❌ Calculator workflow video (404)
❌ Stripe transaction ID (placeholders + wrong app)

IMMEDIATE ACTION REQUIRED:
1. Redeploy correct app to Vercel (30 min)
2. Replace P0 env vars: Stripe, Clerk, PostHog (1 hour)
3. Re-run verification (15 min)
4. Complete blocked evidence (30 min)

Files:
- docs/evidence/health-baseline-2026-03-19/ (reports + screenshot)
- scripts/production-health-baseline.ts (verification script)

See CRITICAL_FINDINGS.md for full analysis."
```

---

## Questions?

**"Why can't we finish the task now?"**
- Cannot record calculator workflow when calculator returns 404
- Cannot test Stripe checkout when checkout flow doesn't exist
- Cannot obtain transaction ID when Stripe keys are placeholders

**"Is the code broken?"**
- No! Local `npm run build` succeeds perfectly
- All routes exist locally: calculator, checkout, pricing
- Problem is deployment, not code

**"How long to fix?"**
- Deploy correct app: 15-30 minutes
- Replace env vars: 30-60 minutes
- Complete evidence: 30-45 minutes
- **Total: 1.5-2 hours**

**"What's the revenue impact?"**
- **$0 MRR for 8+ sprints** (wrong product deployed)
- Real calculator has existed in code since Sprint 04
- But never deployed = $0 revenue capability

---

**Status:** ⚠️ **EVIDENCE COLLECTION INCOMPLETE - CRITICAL BLOCKERS FOUND**
**Next Action:** Michael to deploy correct app to Vercel + replace env vars
**Then:** Re-run verification script to complete evidence collection
