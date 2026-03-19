# Sentry Production Activation Guide

**Priority**: P0-CRITICAL
**Estimated Time**: 15-20 minutes
**Business Impact**: Production error monitoring OFFLINE - cannot debug user issues, revenue loss undetectable

---

## ⚠️ Current Status

**SENTRY IS NOT WORKING IN PRODUCTION**

Evidence from smoke test (March 19, 2026):
- Screenshot: `docs/screenshots/smoke-test-2026-03-19/sentry-check-1773946783218.png`
- Status: "Sentry not detected"
- Root Cause: Placeholder environment variables in Vercel

```bash
# Current values in .env.production (PLACEHOLDERS):
NEXT_PUBLIC_SENTRY_DSN=https://YOUR_SENTRY_KEY@o0000000.ingest.sentry.io/0000000
SENTRY_AUTH_TOKEN=YOUR_SENTRY_AUTH_TOKEN
```

---

## 🎯 What You Need To Do

### Step 1: Access Sentry Dashboard (2 minutes)

1. Go to https://sentry.io/auth/login/
2. Login with your Sentry account (or create new account if needed)
3. Navigate to **Organizations** → **taxbridge** (or create organization)
4. Navigate to **Projects** → **cross-border-tax** (or create project)

**If creating NEW project:**
- Platform: **Next.js**
- Name: `cross-border-tax`
- Team: default

---

### Step 2: Get Sentry DSN (3 minutes)

1. In Sentry project dashboard, go to **Settings** → **Projects** → **cross-border-tax**
2. Click **Client Keys (DSN)**
3. Copy the **DSN** value (looks like):
   ```
   https://abc123def456@o1234567.ingest.sentry.io/9876543
   ```

**Screenshot this for evidence**: Show the DSN configuration page

---

### Step 3: Create Auth Token (5 minutes)

1. Click your **profile icon** (top right) → **Auth Tokens**
2. Click **Create New Token**
3. Configuration:
   - **Name**: `TaxBridge Production Deploy`
   - **Scopes**: Select ALL of these:
     - ✅ `project:read`
     - ✅ `project:write`
     - ✅ `project:releases`
     - ✅ `org:read`
     - ✅ `event:read`
     - ✅ `event:write`
4. Click **Create Token**
5. **IMMEDIATELY COPY** the token (starts with `sntrys_`)
   - ⚠️ **You can only see this once!**
   - Store securely (you'll need it for Vercel)

**Screenshot this for evidence**: Show the token creation success page (token will be redacted in screenshot)

---

### Step 4: Update Vercel Environment Variables (5 minutes)

1. Go to https://vercel.com/caffeineGMT/taxbridge/settings/environment-variables
2. Find and **EDIT** (or create) these variables:

#### Variable 1: `NEXT_PUBLIC_SENTRY_DSN`
- **Name**: `NEXT_PUBLIC_SENTRY_DSN`
- **Value**: `<YOUR_DSN_FROM_STEP_2>` (the full https URL)
- **Environment**: Production ✅ Preview ✅ Development ✅
- Click **Save**

#### Variable 2: `SENTRY_AUTH_TOKEN`
- **Name**: `SENTRY_AUTH_TOKEN`
- **Value**: `<YOUR_TOKEN_FROM_STEP_3>` (starts with sntrys_)
- **Environment**: Production ✅ Preview ✅ Development ✅
- Click **Save**

#### Variable 3: `SENTRY_ORG`
- **Name**: `SENTRY_ORG`
- **Value**: `taxbridge` (your organization slug)
- **Environment**: Production ✅ Preview ✅ Development ✅
- Click **Save**

#### Variable 4: `SENTRY_PROJECT`
- **Name**: `SENTRY_PROJECT`
- **Value**: `cross-border-tax` (your project slug)
- **Environment**: Production ✅ Preview ✅ Development ✅
- Click **Save**

**Screenshot this for evidence**: Show all 4 environment variables configured in Vercel

---

### Step 5: Trigger Redeploy (2 minutes)

After saving environment variables, Vercel will ask to redeploy:

1. Click **Redeploy** in the Vercel popup
2. Wait 2-5 minutes for deployment to complete
3. Verify deployment succeeds at https://vercel.com/caffeineGMT/taxbridge/deployments

---

### Step 6: Test Sentry Integration (3 minutes)

Run the automated verification script:

```bash
npm run verify:sentry
```

This will:
1. Trigger a test error in production
2. Check if Sentry captures the error
3. Generate evidence report

**Alternative Manual Test:**

1. Visit https://taxbridge.vercel.app/api/test-error
2. You should see: `{"error":"Test error triggered for Sentry"}`
3. Go to Sentry dashboard → **Issues**
4. Within 30 seconds, you should see: **"Test Error: Sentry Integration Verification"**

**Screenshot this for evidence**: Show the error appearing in Sentry Issues dashboard with:
- Error title: "Test Error: Sentry Integration Verification"
- Environment: production
- Timestamp: recent (within 5 minutes)
- Stack trace visible

---

## ✅ Success Criteria

Task is COMPLETE when you have:

1. ✅ Sentry dashboard screenshot showing DSN configuration
2. ✅ Vercel screenshot showing 4 environment variables set
3. ✅ Sentry Issues dashboard screenshot showing test error captured from production
4. ✅ All screenshots saved to `docs/screenshots/sentry-activation-YYYY-MM-DD/`
5. ✅ Verification report generated: `docs/SENTRY_ACTIVATION_VERIFICATION.md`

---

## 🚨 Troubleshooting

### Error: "Sentry not detected" after deployment

**Fix**: Check browser console at https://taxbridge.vercel.app/
- Press F12 → Console tab
- Look for Sentry initialization messages
- If you see "Sentry DSN not configured", environment variables didn't apply
- Solution: Manually redeploy from Vercel dashboard

### Error: "Invalid DSN format"

**Fix**: Ensure DSN is full URL format:
```
✅ CORRECT: https://abc123@o123.ingest.sentry.io/456
❌ WRONG: abc123@o123.ingest.sentry.io/456 (missing https://)
```

### Test error not appearing in Sentry

**Possible causes:**
1. Wait 1-2 minutes (Sentry has delay)
2. Check Sentry project matches `SENTRY_PROJECT` env var
3. Verify auth token has `event:write` scope
4. Check Sentry quota limits (free tier: 5,000 errors/month)

---

## 📊 Post-Activation Monitoring

After Sentry is active, you should see:

1. **Real-time errors** in Sentry Issues dashboard
2. **Performance monitoring** in Sentry Performance tab
3. **Release tracking** showing Git commit SHAs
4. **User session replays** (10% sample rate)

**Expected error volume:**
- Healthy production: 0-5 errors/day
- If >50 errors/day: Critical issue, investigate immediately

---

## 🔐 Security Notes

1. **NEVER commit** auth tokens to Git (they're in .env.production which is gitignored)
2. **NEVER share** auth tokens in Slack/email
3. **Rotate tokens** every 90 days (set calendar reminder)
4. **Use Vercel encrypted env vars** (they are encrypted at rest)

---

## 📝 Evidence Checklist

Before marking task complete, verify you have:

- [ ] Screenshot: Sentry DSN configuration page
- [ ] Screenshot: Vercel environment variables (4 vars set)
- [ ] Screenshot: Sentry Issues showing test error from production
- [ ] Verification report: `docs/SENTRY_ACTIVATION_VERIFICATION.md`
- [ ] Test error triggered: `/api/test-error` returns 500
- [ ] Screenshots saved to `docs/screenshots/sentry-activation-YYYY-MM-DD/`

---

## ⏱️ Time Breakdown

- Step 1 (Sentry login): 2 min
- Step 2 (Get DSN): 3 min
- Step 3 (Create token): 5 min
- Step 4 (Update Vercel): 5 min
- Step 5 (Redeploy): 2 min
- Step 6 (Test & verify): 3 min

**Total: 20 minutes**

---

## 🎯 Business Impact

**Before Sentry activation:**
- ❌ Production errors invisible
- ❌ Cannot debug user-reported issues
- ❌ Revenue loss undetectable (failed payments invisible)
- ❌ Performance regressions unknown

**After Sentry activation:**
- ✅ Real-time error alerts
- ✅ Full stack traces for debugging
- ✅ Failed payment tracking
- ✅ Performance monitoring (LCP, FID, CLS)
- ✅ User session replays for UX issues

**Estimated revenue protection:** $500-$2,000/month (catch failed payments, prevent churn)

---

## 📚 Related Documentation

- Sentry Next.js Setup: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- Vercel Environment Variables: https://vercel.com/docs/environment-variables
- Sentry Error Monitoring Best Practices: https://docs.sentry.io/product/issues/

---

**Last Updated**: March 19, 2026
**Task Priority**: P0-CRITICAL
**Deadline**: 1 hour from task creation
