# Clerk Production Keys - Executive Summary

**Sprint:** 16 | **Priority:** P0-CRITICAL | **Deadline:** 2 hours
**Status:** 🔧 **READY FOR MANUAL EXECUTION**

---

## 🚨 The Problem (30 Seconds)

**Smoke test shows:** "Clerk widget not found on signup page"

**Root cause:** Production environment has placeholder Clerk keys:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY=sk_live_YOUR_CLERK_SECRET_KEY
```

**Impact:**
- ❌ Signup conversion: **0%** (widget won't load)
- ❌ Revenue: **BLOCKED** (can't onboard new users)
- ❌ User acquisition: **IMPOSSIBLE**

---

## ✅ The Solution (4 Steps, 32 Minutes)

### 1. Get Production Keys from Clerk (5 min)
```
1. Login: https://dashboard.clerk.com
2. Navigate: API Keys → Production tab
3. Copy: pk_live_XXX, sk_live_XXX, whsec_XXX
```

### 2. Update Vercel Environment Variables (10 min)
```
1. Go to: https://vercel.com/caffeineGMT/taxbridge/settings/environment-variables
2. Delete old placeholders
3. Add new production keys (Production environment only)
```

### 3. Update Local .env.production (2 min)
```bash
# Edit .env.production lines 63-65, then:
git add .env.production
git commit -m "[P0-CRITICAL] Replace Clerk production keys"
git push origin main
```

### 4. Verify & Test (15 min)
```bash
npm run verify:clerk          # Check keys are valid
npm run test:clerk-signup     # Test signup flow
npm run smoke-test            # Full production test
```

---

## 📸 Evidence Requirements (5 Screenshots)

**Cannot mark task DONE without:**

1. ✅ Clerk dashboard showing production keys (`pk_live_*` visible)
2. ✅ Vercel env vars showing 3 Clerk variables set to Production
3. ✅ Signup page with Clerk widget loaded
4. ✅ New user created in Clerk dashboard
5. ✅ Smoke test showing "Signup & Clerk Authentication" PASSED

**Save to:** `docs/screenshots/clerk-fix-2026-03-19/`

---

## 🎯 Success Criteria

**Task is COMPLETE when:**

| Criterion | Current | Target |
|-----------|---------|--------|
| Clerk keys format | `pk_live_YOUR_` (placeholder) | `pk_live_XXX...` (real) |
| Signup widget loads | ❌ Not found | ✅ Visible |
| `npm run verify:clerk` | ❌ 4/4 checks fail | ✅ 4/4 checks pass |
| Smoke test signup | ❌ FAIL | ✅ PASS |
| New user signup test | ❌ Impossible | ✅ Completes successfully |

---

## 📊 Current vs. Target State

### Current State (BROKEN)
```
Production URL: https://taxbridge.vercel.app/sign-up
Status: ❌ Clerk widget not found

Clerk Keys:
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: pk_live_YOUR_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY: sk_live_YOUR_CLERK_SECRET_KEY
- CLERK_WEBHOOK_SECRET: whsec_YOUR_CLERK_WEBHOOK_SECRET

Smoke Test: 1/6 PASS (16.7%)
Signup Flow: ❌ FAIL
```

### Target State (WORKING)
```
Production URL: https://taxbridge.vercel.app/sign-up
Status: ✅ Clerk widget loaded and functional

Clerk Keys:
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: pk_live_XXXXXXXXXXXXX
- CLERK_SECRET_KEY: sk_live_XXXXXXXXXXXXX
- CLERK_WEBHOOK_SECRET: whsec_XXXXXXXXXXXXX

Smoke Test: 2/6 PASS (33.3%) ← +16.6%
Signup Flow: ✅ PASS
```

---

## 🛠️ Automated Tools Created

### 1. Verification Script
```bash
npm run verify:clerk
```
**Checks:** Key format, placeholder detection, route config

### 2. E2E Signup Test
```bash
npm run test:clerk-signup
```
**Tests:** Page accessibility, widget presence, form inputs, API requests

### 3. Comprehensive Guide
```
docs/CLERK_KEY_REPLACEMENT_GUIDE.md
```
**Includes:** Step-by-step instructions, troubleshooting, evidence checklist

---

## ⚠️ Common Issues & Quick Fixes

| Issue | Fix |
|-------|-----|
| Widget not loading after deploy | `vercel --prod --force` (clear cache) |
| "Invalid publishable key" error | Use **Production** tab in Clerk, not Development |
| Webhook events not firing | Configure endpoint: `https://taxbridge.vercel.app/api/webhooks/clerk` |
| Build fails | Run `vercel env ls` to verify all 3 vars present |

---

## 🔗 Dependencies & Blockers

**This task blocks:**
- Revenue smoke test (can't test signup → payment flow)
- User acquisition campaigns (can't onboard users)
- Product Hunt launch (broken signup kills conversion)

**Related P0 tasks (same pattern):**
- Replace Stripe production keys (`pk_test_` → `pk_live_`)
- Replace PostHog production key (analytics)
- Replace Sentry auth token (error monitoring)

---

## 📈 Expected Impact

**Metrics Before:**
- Signup attempts: X visitors/day
- Signup success rate: **0%** (widget not loading)
- New users: **0/day**

**Metrics After:**
- Signup attempts: X visitors/day
- Signup success rate: **5-15%** (industry baseline)
- New users: **5-50/day** (depends on traffic)

**Revenue Impact:**
- Unblocks conversion funnel
- Enables paid user acquisition
- Required for Product Hunt launch

---

## 🚀 Action Required

**Who:** Michael (or anyone with Clerk + Vercel access)
**When:** Within 2 hours
**What:** Follow 4-step process in `docs/CLERK_KEY_REPLACEMENT_GUIDE.md`
**Time:** 32 minutes (if no issues)

**Quick Start:**
```bash
# 1. Read the guide
cat docs/CLERK_KEY_REPLACEMENT_GUIDE.md

# 2. Get keys from Clerk dashboard
open https://dashboard.clerk.com

# 3. Update Vercel env vars
open https://vercel.com/caffeineGMT/taxbridge/settings/environment-variables

# 4. Verify
npm run verify:clerk
npm run test:clerk-signup
```

---

## 📞 Support

**If stuck:**
- 📖 Full guide: `docs/CLERK_KEY_REPLACEMENT_GUIDE.md`
- 🔍 Run diagnostics: `npm run verify:clerk`
- 📚 Clerk docs: https://clerk.com/docs
- 💬 Clerk support: support@clerk.com

---

**Created:** 2026-03-19
**Deadline:** 2 hours from task start
**Status:** 🔧 Ready for manual execution
**Priority:** P0-CRITICAL (revenue blocking)
