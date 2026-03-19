# Clerk Production Keys Replacement Guide

**Task:** [P0-CRITICAL] Replace Clerk Production Keys - Site Returns 500 Errors
**Sprint:** 16
**Deadline:** 2 hours from task start
**Current Status:** ❌ Clerk in test mode with placeholder keys

---

## 🚨 Problem Summary

**Smoke test shows:** "Clerk widget not found on signup page"

**Root cause:**
- `.env.production` has placeholder values: `pk_live_YOUR_CLERK_PUBLISHABLE_KEY`
- Clerk is either in test mode or using invalid credentials
- Signup flow is completely broken in production

**Impact:**
- 0% signup conversion (users cannot create accounts)
- Revenue completely blocked (no new paid users possible)
- Production site partially functional but authentication broken

---

## ✅ Solution: Replace Keys in 4 Steps

### Step 1: Get Production Keys from Clerk Dashboard (5 minutes)

1. **Login to Clerk:**
   ```
   https://dashboard.clerk.com
   ```

2. **Select your application:**
   - Click on your TaxBridge application
   - If you don't have one, create a new application first

3. **Navigate to API Keys:**
   - Left sidebar → "Developers" → "API Keys"
   - Switch to "Production" tab (top right toggle)

4. **Copy your production keys:**
   ```
   Publishable key:  pk_live_[YOUR_PUBLISHABLE_KEY_HERE]
   Secret key:       sk_live_[YOUR_SECRET_KEY_HERE]
   ```

   **CRITICAL:** Make sure you're on the **Production** tab, NOT Development!

5. **Optional: Copy webhook secret (recommended):**
   - Left sidebar → "Webhooks"
   - Create a new webhook endpoint if needed:
     ```
     URL: https://taxbridge.vercel.app/api/webhooks/clerk
     Events: user.created, user.updated
     ```
   - Copy the signing secret: `whsec_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

---

### Step 2: Update Vercel Environment Variables (10 minutes)

**Option A: Via Vercel Dashboard (Recommended)**

1. Go to: https://vercel.com/caffeineGMT/taxbridge/settings/environment-variables

2. **Delete old placeholder variables:**
   - Find `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` → Delete
   - Find `CLERK_SECRET_KEY` → Delete
   - Find `CLERK_WEBHOOK_SECRET` → Delete

3. **Add new production variables:**

   | Variable Name | Value | Environment |
   |--------------|-------|-------------|
   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_[PASTE_HERE]` | Production |
   | `CLERK_SECRET_KEY` | `sk_live_[PASTE_HERE]` | Production |
   | `CLERK_WEBHOOK_SECRET` | `whsec_[PASTE_HERE]` | Production |

   **IMPORTANT:**
   - Set environment to **Production** only (uncheck Preview/Development)
   - `NEXT_PUBLIC_*` variables are client-side (safe to expose)
   - `CLERK_SECRET_KEY` is server-side (keep private)

**Option B: Via Vercel CLI**

```bash
# Delete old values
vercel env rm NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env rm CLERK_SECRET_KEY production
vercel env rm CLERK_WEBHOOK_SECRET production

# Add new production values
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
# Paste: pk_live_[PASTE_YOUR_KEY]

vercel env add CLERK_SECRET_KEY production
# Paste: sk_live_[PASTE_YOUR_KEY]

vercel env add CLERK_WEBHOOK_SECRET production
# Paste: whsec_[PASTE_YOUR_KEY]

# Verify
vercel env ls
```

---

### Step 3: Update Local .env.production (2 minutes)

Update `/Users/michaelguo/hivemind-projects/cross-border-tax/.env.production`:

```bash
# Find and replace lines 63-65:

# OLD (DELETE):
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY=sk_live_YOUR_CLERK_SECRET_KEY
CLERK_WEBHOOK_SECRET=whsec_YOUR_CLERK_WEBHOOK_SECRET

# NEW (PASTE YOUR ACTUAL KEYS):
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_[PASTE_YOUR_KEY]
CLERK_SECRET_KEY=sk_live_[PASTE_YOUR_KEY]
CLERK_WEBHOOK_SECRET=whsec_[PASTE_YOUR_KEY]
```

**Commit and push:**
```bash
git add .env.production
git commit -m "[P0-CRITICAL] Replace Clerk production keys - Revenue Unblocking"
git push origin main
```

---

### Step 4: Redeploy and Verify (15 minutes)

**Trigger production deployment:**

```bash
# Option 1: Push triggers auto-deploy
git push origin main
# Wait 2-5 minutes for Vercel deployment

# Option 2: Manual trigger
vercel --prod
```

**Verify deployment:**

1. **Check deployment logs:**
   ```
   https://vercel.com/caffeineGMT/taxbridge/deployments
   ```
   - Ensure latest deployment shows "Ready" status
   - Check build logs for any Clerk-related errors

2. **Run automated verification:**
   ```bash
   npm run verify:clerk
   ```

   Expected output:
   ```
   ✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is valid
   ✅ CLERK_SECRET_KEY is valid
   ✅ CLERK_WEBHOOK_SECRET is configured
   ✅ Clerk route configuration is complete
   ```

3. **Test signup flow manually:**
   - Visit: https://taxbridge.vercel.app/sign-up
   - You should see the Clerk signup widget
   - Try creating a test account
   - Verify you can complete signup successfully

4. **Run smoke test:**
   ```bash
   npm run smoke-test
   ```

   Check that "Signup & Clerk Authentication" test now **PASSES** ✅

---

## 📸 Evidence Requirements (MANDATORY)

To mark this task as DONE, you MUST provide:

### 1. Screenshot: Clerk Dashboard Showing Production Keys
   - URL: https://dashboard.clerk.com → API Keys
   - Must show "Production" tab selected
   - Publishable key visible (starts with `pk_live_`)

### 2. Screenshot: Vercel Environment Variables
   - URL: https://vercel.com/caffeineGMT/taxbridge/settings/environment-variables
   - Must show all 3 Clerk variables set to "Production" environment
   - Values should show "••••••••" (redacted)

### 3. Screenshot: Successful Signup Flow
   - Visit: https://taxbridge.vercel.app/sign-up
   - Capture: Clerk widget loaded and visible
   - Complete signup and capture: Welcome page or dashboard after signup

### 4. Screenshot: New User in Clerk Dashboard
   - URL: https://dashboard.clerk.com → Users
   - Show the test user you just created
   - Verify user was created within last 5 minutes

### 5. Smoke Test Report
   - Run: `npm run smoke-test`
   - Save output showing "Signup & Clerk Authentication" test PASSED ✅

**Save all screenshots to:**
```
docs/screenshots/clerk-fix-2026-03-19/
```

---

## 🔍 Verification Checklist

- [ ] Logged into Clerk dashboard
- [ ] Copied production publishable key (starts with `pk_live_`)
- [ ] Copied production secret key (starts with `sk_live_`)
- [ ] Copied webhook secret (starts with `whsec_`)
- [ ] Updated Vercel environment variables (all 3 keys)
- [ ] Updated local `.env.production` file
- [ ] Committed and pushed changes to GitHub
- [ ] Vercel deployment completed successfully
- [ ] Ran `npm run verify:clerk` (all checks passed)
- [ ] Tested signup flow manually (widget loads, signup works)
- [ ] Ran `npm run smoke-test` (Clerk test passed)
- [ ] Captured 5 required screenshots
- [ ] Created new user in Clerk dashboard (verified)

---

## ⚠️ Common Issues & Troubleshooting

### Issue 1: "Clerk widget not found" persists after key replacement

**Cause:** Vercel is serving cached build with old keys

**Fix:**
```bash
# Force rebuild and redeploy
vercel --prod --force

# Or clear Vercel cache via dashboard:
# Settings → General → Clear Cache
```

### Issue 2: "Invalid publishable key" error in browser console

**Cause:** Using development key (`pk_test_`) in production

**Fix:**
- Re-check Clerk dashboard
- Ensure you copied from "Production" tab, NOT "Development"
- Key must start with `pk_live_` not `pk_test_`

### Issue 3: Webhook events not firing (users not created in database)

**Cause:** Webhook secret mismatch or endpoint not configured

**Fix:**
1. Check Clerk dashboard → Webhooks
2. Verify endpoint URL: `https://taxbridge.vercel.app/api/webhooks/clerk`
3. Verify events selected: `user.created`, `user.updated`
4. Copy signing secret and update `CLERK_WEBHOOK_SECRET`

### Issue 4: Build fails with "Missing environment variable" error

**Cause:** Vercel env vars not set for production environment

**Fix:**
```bash
vercel env ls

# Ensure all 3 variables show "production" scope:
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY  production
# CLERK_SECRET_KEY                   production
# CLERK_WEBHOOK_SECRET               production
```

---

## 🎯 Success Criteria

Task is COMPLETE when:

1. ✅ `npm run verify:clerk` passes all checks
2. ✅ Clerk signup widget loads on https://taxbridge.vercel.app/sign-up
3. ✅ Test user can complete full signup flow
4. ✅ New user appears in Clerk dashboard within 1 minute
5. ✅ User profile created in database (check via webhook logs)
6. ✅ `npm run smoke-test` shows "Signup & Clerk Authentication" PASSED
7. ✅ All 5 required screenshots captured and saved

**Total time:** 2 hours max (actual: ~32 minutes if no issues)

---

## 📚 Related Documentation

- [Clerk Documentation](https://clerk.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [TaxBridge Clerk Implementation](./CLERK_AUTH_IMPLEMENTATION.md)
- [Production Smoke Test Report](./PRODUCTION_SMOKE_TEST_REPORT.md)

---

**Last Updated:** 2026-03-19
**Sprint:** 16
**Priority:** P0-CRITICAL
**Status:** 🔧 IN PROGRESS
