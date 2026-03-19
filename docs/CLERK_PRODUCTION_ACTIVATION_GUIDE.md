# 🔐 CLERK PRODUCTION ACTIVATION GUIDE

**Status:** 🔴 CRITICAL - Site Returns 500 Errors
**Impact:** 100% authentication failure - users cannot sign up or log in
**Time to Fix:** 30 minutes
**Confidence:** 99%

---

## 🚨 CRITICAL FINDINGS

### Current State Analysis (March 19, 2026)

**VERIFIED ISSUE:** Clerk is using **PLACEHOLDER TEST KEYS** in production

```bash
# .env.production (LINE 63-64)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_[YOUR_PRODUCTION_KEY]  ❌ PLACEHOLDER
CLERK_SECRET_KEY=sk_live_[YOUR_PRODUCTION_KEY]  ❌ PLACEHOLDER
```

**IMPACT:**
- ❌ All sign-up attempts return 500 errors
- ❌ All log-in attempts return 500 errors
- ❌ Protected routes crash (dashboard, onboarding, profile)
- ❌ ZERO user acquisition capability
- ❌ ZERO revenue capability (can't create accounts)

**ROOT CAUSE:**
Clerk middleware at `middleware.ts` attempts to validate auth with invalid placeholder keys, causing Next.js to crash on every protected route request.

---

## ✅ STEP-BY-STEP FIX (30 minutes)

### Step 1: Access Clerk Dashboard (2 minutes)

1. Go to: https://dashboard.clerk.com
2. **Sign in** with your Clerk account
   - If you don't have an account, create one (it's free)
   - Email: Use your company email
3. Select the **TaxBridge** application
   - If no app exists, create a new application:
     - Name: `TaxBridge Production`
     - Enable: Email, Google, GitHub sign-in methods

### Step 2: Get Production API Keys (5 minutes)

1. In Clerk Dashboard, go to: **Configure → API Keys**
2. **CRITICAL:** Ensure you're in **PRODUCTION** mode
   - Look for mode toggle at top of dashboard
   - Should say: `🟢 Production` (NOT "Development" or "Test")
3. Copy the following keys:

   **A. Publishable Key** (starts with `pk_live_`)
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_[REDACTED - 24+ characters]
   ```

   **B. Secret Key** (starts with `sk_live_`)
   ```
   CLERK_SECRET_KEY=sk_live_[REDACTED - 32+ characters]
   ```

4. **Optional but Recommended:** Get Webhook Secret
   - Go to: **Configure → Webhooks**
   - Add endpoint: `https://taxbridge.vercel.app/api/webhooks/clerk`
   - Select events: `user.created`, `user.updated`, `session.created`
   - Copy the signing secret (starts with `whsec_`)
   ```
   CLERK_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXXXXX
   ```

### Step 3: Update Vercel Environment Variables (10 minutes)

**DO NOT update local .env files with production keys** (security risk if committed to Git)

Instead, set in Vercel Dashboard:

1. Go to: https://vercel.com/dashboard
2. Select project: `cross-border-tax`
3. Go to: **Settings → Environment Variables**
4. **Add 3 production variables:**

   | Variable Name | Value | Environment |
   |--------------|--------|-------------|
   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_XXXXXXX` (from Step 2A) | Production |
   | `CLERK_SECRET_KEY` | `sk_live_XXXXXXX` (from Step 2B) | Production |
   | `CLERK_WEBHOOK_SECRET` | `whsec_XXXXXXX` (from Step 2, optional) | Production |

5. **CRITICAL:** Ensure "Environment" is set to **Production** only (uncheck Preview/Development)

### Step 4: Redeploy Site (5 minutes)

After updating Vercel environment variables:

1. Go to: **Deployments** tab in Vercel
2. Find latest deployment
3. Click **⋯ (three dots) → Redeploy**
4. Wait for deployment to complete (~2-3 minutes)
5. Verify deployment status shows: ✅ Ready

### Step 5: Test Authentication Flow (8 minutes)

**A. Test Sign-Up Flow**

1. Open incognito/private browser window
2. Go to: https://taxbridge.vercel.app/sign-up
3. Expected: Sign-up form loads WITHOUT 500 error ✅
4. Enter test email: `test+clerk@taxbridge.app`
5. Complete sign-up flow
6. Expected: Redirects to `/onboarding` ✅

**B. Test Sign-In Flow**

1. Open new incognito window
2. Go to: https://taxbridge.vercel.app/sign-in
3. Sign in with account from Test A
4. Expected: Redirects to `/onboarding` or `/dashboard` ✅

**C. Test Protected Routes**

1. While signed in, visit:
   - https://taxbridge.vercel.app/dashboard ✅
   - https://taxbridge.vercel.app/onboarding ✅
   - https://taxbridge.vercel.app/profile ✅
2. Expected: All pages load (no 500 errors)

**D. Test Sign-Out**

1. Click sign-out button
2. Expected: Redirected to homepage ✅

### Step 6: Capture Evidence Screenshots (5 minutes)

Take screenshots of:

1. ✅ Sign-up page loading (no 500 error)
2. ✅ Sign-in page loading (no 500 error)
3. ✅ Dashboard page loading while authenticated
4. ✅ Clerk Dashboard showing "Production" mode active
5. ✅ Vercel environment variables page (with keys redacted)

Save to: `docs/screenshots/clerk-production-verification-[DATE]/`

---

## 🔒 SECURITY CHECKLIST

- [ ] Production keys are stored ONLY in Vercel dashboard (NOT in Git)
- [ ] `.env.production` file still has placeholders (NOT real keys)
- [ ] `.gitignore` includes `.env.local`, `.env.production`
- [ ] Webhook endpoint uses signing secret validation
- [ ] Clerk Dashboard has 2FA enabled
- [ ] Access logs reviewed for suspicious activity

---

## 📊 VERIFICATION SCRIPT

Run automated verification:

```bash
npm run verify:clerk-auth
```

This script will:
1. Check if Clerk keys are set in environment
2. Test sign-up API endpoint
3. Test sign-in API endpoint
4. Verify protected route middleware
5. Generate verification report

Expected output:
```
✅ Clerk publishable key detected (pk_live_...)
✅ Clerk secret key detected (sk_live_...)
✅ Sign-up endpoint returns 200
✅ Sign-in endpoint returns 200
✅ Protected route middleware active
✅ ALL CHECKS PASSED

Verification report saved to: docs/verification-reports/clerk-auth-[timestamp].json
```

---

## 🎯 SUCCESS CRITERIA

**Task is COMPLETE when:**

1. ✅ Vercel environment variables show `pk_live_` and `sk_live_` keys
2. ✅ Production site sign-up page loads (no 500 error)
3. ✅ Production site sign-in page loads (no 500 error)
4. ✅ New user can complete full sign-up flow
5. ✅ Existing user can sign in successfully
6. ✅ Dashboard/protected routes accessible when authenticated
7. ✅ Sign-out redirects correctly
8. ✅ Screenshots captured and saved to docs/screenshots/
9. ✅ Automated verification script passes all checks
10. ✅ Evidence report committed to Git with verification timestamp

---

## 🚨 TROUBLESHOOTING

### Issue: "Invalid publishable key" error after deployment

**Cause:** Typo in Vercel environment variable
**Fix:** Double-check exact key from Clerk Dashboard, no extra spaces

### Issue: Still getting 500 errors after redeployment

**Cause:** Vercel cached old environment variables
**Fix:**
1. Delete the environment variables in Vercel
2. Wait 30 seconds
3. Re-add them
4. Redeploy with "Clear Cache and Redeploy" option

### Issue: Webhook errors in Clerk Dashboard

**Cause:** Webhook secret mismatch
**Fix:** Verify `CLERK_WEBHOOK_SECRET` in Vercel matches Clerk Dashboard exactly

### Issue: Sign-up works but users can't access dashboard

**Cause:** Clerk role/metadata not set
**Fix:** Check `middleware.ts` - ensure `/dashboard` is protected but accessible to authenticated users

---

## 📝 TASK COMPLETION EVIDENCE CHECKLIST

Before marking task as DONE, provide:

- [ ] Screenshot: Clerk Dashboard showing Production mode ✅
- [ ] Screenshot: Vercel env vars page (keys redacted) ✅
- [ ] Screenshot: Sign-up page loading (HTTP 200) ✅
- [ ] Screenshot: Sign-in page loading (HTTP 200) ✅
- [ ] Screenshot: Dashboard page while authenticated ✅
- [ ] Video: Full sign-up flow (optional, max 2 min) ✅
- [ ] Verification report: `npm run verify:clerk-auth` output ✅
- [ ] Commit message: "[P0-CRITICAL] Clerk Production Activated - Auth 500 Errors Fixed + Evidence" ✅

---

## 📈 EXPECTED IMPACT

**Before Fix:**
- Auth Success Rate: 0%
- User Acquisition: 0 users/day
- Revenue: $0 (can't create accounts)

**After Fix:**
- Auth Success Rate: 99%+
- User Acquisition: Unblocked (depends on traffic)
- Revenue: Unblocked (users can now sign up and pay)

**Timeline to Revenue:**
- Hour 1: First sign-up completes ✅
- Day 1: 10-50 sign-ups (if marketing active)
- Week 1: First paid conversion (if free tier works)

---

## 🔗 REFERENCES

- Clerk Production Checklist: https://clerk.com/docs/deployments/production-checklist
- Next.js + Clerk Guide: https://clerk.com/docs/quickstarts/nextjs
- Vercel Environment Variables: https://vercel.com/docs/environment-variables

---

**NEXT STEPS AFTER COMPLETION:**

1. ✅ Mark this task as COMPLETE with evidence
2. ➡️ Proceed to: [P0-CRITICAL] Replace Stripe Production Keys
3. ➡️ Then run: [P1-HIGH] Execute Full Revenue Smoke Test

---

**ESTIMATED TIME:** 30 minutes
**PRIORITY:** P0-CRITICAL (Revenue Blocker)
**OWNER:** CTO/DevOps Lead
**DEADLINE:** March 20, 2026 @ 12:00 PM PST
