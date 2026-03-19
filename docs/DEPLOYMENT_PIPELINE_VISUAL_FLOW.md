# 🚀 DEPLOYMENT PIPELINE - VISUAL FLOW DIAGRAM

**Date:** March 19, 2026
**Purpose:** Visualize why tasks keep recurring

---

## 📊 CURRENT (BROKEN) WORKFLOW

```
┌─────────────────────────────────────────────────────────────┐
│                   WHAT ENGINEERS THINK HAPPENS                │
└─────────────────────────────────────────────────────────────┘

   Step 1: Write Code
      │
      ▼
   ┌──────────────────┐
   │  lib/paywall.ts  │  ✅ Code changes made
   │  app/api/*.ts    │
   └──────────────────┘
      │
      ▼
   Step 2: Update .env.production
      │
      ▼
   ┌───────────────────────────────┐
   │  .env.production (in Git)     │  ✅ Keys updated (documentation)
   │  STRIPE_SECRET_KEY=sk_live... │
   └───────────────────────────────┘
      │
      ▼
   Step 3: Build & Test Locally
      │
      ▼
   ┌──────────────────┐
   │  npm run build   │  ✅ Build passes
   └──────────────────┘
      │
      ▼
   Step 4: Commit & Push
      │
      ▼
   ┌──────────────────┐
   │  git push origin │  ✅ Pushed to GitHub
   │  main            │
   └──────────────────┘
      │
      ▼
   Step 5: Task Marked "Done"
      │
      ▼
   ┌──────────────────┐
   │  ✅ Task Complete │  ✅ Evidence: "Build passes, code pushed"
   └──────────────────┘

                         ENGINEER THINKS: "Production is now configured with live keys!"



┌─────────────────────────────────────────────────────────────┐
│                   WHAT ACTUALLY HAPPENS                       │
└─────────────────────────────────────────────────────────────┘

   Step 1-4: Same as above ✅
      │
      ▼
   ┌─────────────────────────┐
   │  GitHub Webhook         │  ⚡ Auto-trigger
   │  → Vercel Build         │
   └─────────────────────────┘
      │
      ▼
   ┌─────────────────────────────────────────────────────────┐
   │  Vercel Build Process                                   │
   │  ┌─────────────────────────────────────────────────┐   │
   │  │  Source: GitHub code ✅ (latest commit)         │   │
   │  │  Config: Vercel Dashboard env vars ❌ (old)    │   │
   │  └─────────────────────────────────────────────────┘   │
   │                                                         │
   │  🔍 WHERE DOES VERCEL GET ENVIRONMENT VARIABLES?       │
   │  ❌ NOT from .env.production (Git)                     │
   │  ✅ FROM Vercel Dashboard → Settings → Env Vars       │
   │                                                         │
   │  Current Vercel Dashboard env vars (never updated):    │
   │  STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY_HERE  │
   │  CLERK_SECRET_KEY=sk_live_YOUR_CLERK_SECRET_KEY       │
   │  (Placeholders from 8 sprints ago)                     │
   └─────────────────────────────────────────────────────────┘
      │
      ▼
   ┌─────────────────────────────────────────────────────────┐
   │  Production Site (taxbridge.vercel.app)                 │
   │  ┌─────────────────────────────────────────────────┐   │
   │  │  Code: ✅ Latest (from GitHub)                  │   │
   │  │  Config: ❌ Placeholders (from Vercel Dashboard)│   │
   │  └─────────────────────────────────────────────────┘   │
   │                                                         │
   │  Stripe checkout → 401 Unauthorized ❌                 │
   │  Clerk signup → 500 Internal Server Error ❌            │
   │  PostHog tracking → No events ❌                        │
   └─────────────────────────────────────────────────────────┘
      │
      ▼
   Next Sprint: "Why is Stripe still in test mode?" 🔁
   Next Sprint: "Why is production site returning 500?" 🔁
   Next Sprint: "Why is PostHog not tracking?" 🔁

                         REALITY: "Production is still broken!"
```

---

## ✅ CORRECT (FIXED) WORKFLOW

```
┌─────────────────────────────────────────────────────────────┐
│                   NEW VERIFIED WORKFLOW                       │
└─────────────────────────────────────────────────────────────┘

   Step 1-4: Write code, build, commit, push ✅
      │
      ▼
   Step 5: UPDATE BOTH LOCATIONS
      │
      ├─────────────────────────────┐
      │                             │
      ▼                             ▼
   ┌──────────────────────┐   ┌──────────────────────────┐
   │  .env.production     │   │  Vercel Dashboard        │
   │  (Git - Docs)        │   │  (Production Reality)    │
   │                      │   │                          │
   │  STRIPE_SECRET_KEY=  │   │  Settings → Env Vars     │
   │  sk_live_REAL_KEY    │   │  STRIPE_SECRET_KEY=      │
   │  ✅ Documentation    │   │  sk_live_REAL_KEY        │
   └──────────────────────┘   │  ✅ ACTUAL PRODUCTION    │
                              └──────────────────────────┘
      │                             │
      └─────────────┬───────────────┘
                    ▼
   Step 6: WAIT FOR VERCEL DEPLOY (2-3 min)
      │
      ▼
   Step 7: TEST ON PRODUCTION
      │
      ▼
   ┌─────────────────────────────────────────────────────────┐
   │  Manual Testing on taxbridge.vercel.app                 │
   │  ┌─────────────────────────────────────────────────┐   │
   │  │  ✅ Stripe: Complete checkout with 4242 card   │   │
   │  │  ✅ Clerk: Create test account, login          │   │
   │  │  ✅ PostHog: Verify events in dashboard        │   │
   │  │  ✅ Sentry: Trigger test error, check capture  │   │
   │  └─────────────────────────────────────────────────┘   │
   └─────────────────────────────────────────────────────────┘
      │
      ▼
   Step 8: COLLECT EVIDENCE
      │
      ▼
   ┌─────────────────────────────────────────────────────────┐
   │  Evidence Collection                                     │
   │  ┌─────────────────────────────────────────────────┐   │
   │  │  📸 Screenshots: Checkout success, login works  │   │
   │  │  📄 Stripe Dashboard: Payment received (live)   │   │
   │  │  📊 PostHog: Events flowing                     │   │
   │  │  🐛 Sentry: Error captured                      │   │
   │  │  📝 Verification Report: All tests passed       │   │
   │  └─────────────────────────────────────────────────┘   │
   └─────────────────────────────────────────────────────────┘
      │
      ▼
   Step 9: Mark Task "Done" with Evidence ✅
      │
      ▼
   ┌─────────────────────────────────────────────────────────┐
   │  ✅ Task Actually Complete                              │
   │  Evidence:                                               │
   │  - Code pushed ✅                                        │
   │  - Vercel env vars updated ✅                            │
   │  - Production tested ✅                                  │
   │  - Screenshots collected ✅                              │
   │  - Verification report created ✅                        │
   └─────────────────────────────────────────────────────────┘

                         RESULT: "Task complete, won't recur!"
```

---

## 🔍 THE KEY DISCONNECT

```
┌─────────────────────────────────────────────────────────────┐
│                   TWO SEPARATE LOCATIONS                      │
└─────────────────────────────────────────────────────────────┘

Location 1: .env.production (Git Repository)
┌───────────────────────────────────────────────────────────┐
│  PATH: /cross-border-tax/.env.production                  │
│  PURPOSE: Documentation / Template                        │
│  USED BY: Engineers for reference                         │
│  AFFECTS: Nothing (not used in production)                │
│  SYNCED TO VERCEL: ❌ NO                                  │
│                                                           │
│  Contains:                                                │
│  STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY_HERE     │
│                                                           │
│  ⚠️  Updating this file does NOT affect production!       │
└───────────────────────────────────────────────────────────┘


Location 2: Vercel Dashboard Environment Variables
┌───────────────────────────────────────────────────────────┐
│  PATH: vercel.com/taxbridge/settings/environment-variables│
│  PURPOSE: Actual production configuration                 │
│  USED BY: Vercel during build & runtime                   │
│  AFFECTS: Production site (taxbridge.vercel.app)          │
│  SYNCED TO GIT: ❌ NO (security - never commit secrets)   │
│                                                           │
│  Current value (NEVER UPDATED):                           │
│  STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY_HERE     │
│                                                           │
│  ✅  THIS is what controls production behavior!           │
└───────────────────────────────────────────────────────────┘


THE PROBLEM:
┌───────────────────────────────────────────────────────────┐
│  Engineers update Location 1 (Git)                        │
│  → Think they configured production ✅                    │
│  → Mark task "done" ✅                                    │
│                                                           │
│  But Location 2 (Vercel Dashboard) NEVER CHANGES          │
│  → Production still broken ❌                             │
│  → Task recurs next sprint 🔁                             │
└───────────────────────────────────────────────────────────┘
```

---

## 📊 ENVIRONMENT VARIABLE FLOW

```
┌─────────────────────────────────────────────────────────────┐
│           ENVIRONMENT VARIABLES IN DEPLOYMENT                 │
└─────────────────────────────────────────────────────────────┘

LOCAL DEVELOPMENT:
┌──────────────────┐
│  .env.local      │ ─┐
│  (developer PC)  │  │ Used by: npm run dev
└──────────────────┘  │ Values: Test mode placeholders
                      │ Example: STRIPE_SECRET_KEY=sk_test_...
                      └─► Works for local testing ✅


GIT REPOSITORY:
┌──────────────────┐
│  .env.production │ ─┐
│  (GitHub)        │  │ Used by: NOTHING (documentation only)
└──────────────────┘  │ Values: Placeholders with instructions
                      │ Example: STRIPE_SECRET_KEY=sk_live_YOUR_KEY_HERE
                      │ Purpose: Document what keys are needed
                      └─► NOT used by production ❌


VERCEL PRODUCTION:
┌──────────────────┐
│  Vercel          │ ─┐
│  Dashboard       │  │ Used by: Production build & runtime
│  Env Vars        │  │ Values: SHOULD be real live keys
└──────────────────┘  │ Current: Placeholders (never updated)
                      │ Example: STRIPE_SECRET_KEY=sk_live_YOUR_KEY_HERE
                      └─► Controls production behavior ⚠️


THE FLOW:
┌─────────────────────────────────────────────────────────────┐
│  Developer updates .env.production (Git)                     │
│  → Commits to GitHub                                        │
│  → Vercel pulls code from GitHub ✅                         │
│  → Vercel ignores .env.production ❌                        │
│  → Vercel uses Dashboard env vars (old placeholders) ❌     │
│  → Production broken ❌                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 REAL-WORLD EXAMPLE: STRIPE

```
┌─────────────────────────────────────────────────────────────┐
│           STRIPE CONFIGURATION ACROSS 7 SPRINTS               │
└─────────────────────────────────────────────────────────────┘

SPRINT 06 (Mar 19):
Engineer Action:  Updated .env.production with instructions
Git Status:       STRIPE_SECRET_KEY=sk_live_YOUR_KEY_HERE
Vercel Status:    STRIPE_SECRET_KEY=sk_live_YOUR_KEY_HERE (unchanged)
Production:       ❌ Stripe returns 401 Unauthorized
Task Status:      ✅ "Done" - "Updated Stripe production setup"

SPRINT 07 (Mar 19):
Engineer Action:  Created scripts/activate-stripe-production-annual.ts
Git Status:       STRIPE_SECRET_KEY=sk_live_YOUR_KEY_HERE (no change)
Vercel Status:    STRIPE_SECRET_KEY=sk_live_YOUR_KEY_HERE (unchanged)
Production:       ❌ Stripe still returns 401
Task Status:      ✅ "Done" - "Stripe production mode activated"

SPRINT 08 (Mar 19):
Engineer Action:  Created 12+ documentation files
Git Status:       STRIPE_SECRET_KEY=sk_live_YOUR_KEY_HERE (no change)
Vercel Status:    STRIPE_SECRET_KEY=sk_live_YOUR_KEY_HERE (unchanged)
Production:       ❌ Stripe still returns 401
Task Status:      ✅ "Done" - "Move Stripe to production - REVENUE BLOCKER"

SPRINT 10-15 (Mar 19):
Engineer Action:  More docs, more verification scripts, more reports
Git Status:       STRIPE_SECRET_KEY=sk_live_YOUR_KEY_HERE (never changed)
Vercel Status:    STRIPE_SECRET_KEY=sk_live_YOUR_KEY_HERE (NEVER UPDATED)
Production:       ❌ Stripe STILL returns 401
Task Status:      ✅ "Done" × 4 more times


WHAT SHOULD HAVE HAPPENED (ONE TIME):

1. Login to Stripe Dashboard → Get real key: sk_live_ABC123DEF456...
2. Login to Vercel Dashboard → Paste real key in env vars
3. Redeploy
4. Test checkout on taxbridge.vercel.app
5. ✅ Done - never recurs


TIME WASTED: 7 sprints × 2-4 hours = 14-28 hours
TIME NEEDED: 1 sprint × 1 hour = 1 hour (if done correctly)
```

---

## 📋 QUICK REFERENCE CARD

```
┌─────────────────────────────────────────────────────────────┐
│           DEPLOYMENT CHECKLIST (LAMINATED CARD)               │
└─────────────────────────────────────────────────────────────┘

BEFORE marking a task "done", verify ALL:

□ 1. CODE CHANGES
     ├─ Files modified and committed ✅
     ├─ Build passes: npm run build ✅
     └─ Pushed to GitHub: git push origin main ✅

□ 2. CONFIGURATION (if task needs env vars)
     ├─ .env.production updated (Git documentation) ✅
     ├─ Vercel Dashboard env vars updated ✅
     └─ Vercel redeployed (automatic after push) ✅

□ 3. PRODUCTION VERIFICATION
     ├─ Wait 2-3 min for Vercel deploy ✅
     ├─ Open https://taxbridge.vercel.app ✅
     ├─ Test the specific feature ✅
     └─ Feature works on production URL ✅

□ 4. EVIDENCE COLLECTION
     ├─ Screenshots of working feature ✅
     ├─ Service dashboard proof (Stripe, PostHog, etc.) ✅
     ├─ Verification report created ✅
     └─ Evidence saved to docs/screenshots/ ✅

□ 5. TASK COMPLETION
     ├─ All 4 steps above complete ✅
     ├─ No errors or warnings ✅
     └─ Task marked "done" with evidence ✅

⚠️  IF ANY STEP FAILS: Task is NOT done, do not mark complete!
```

---

**Prepared by:** Alfie (Senior Engineer)
**Date:** March 19, 2026 18:51 UTC
**Purpose:** Visual reference for deployment pipeline diagnosis
