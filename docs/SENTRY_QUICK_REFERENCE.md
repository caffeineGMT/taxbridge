# Sentry Setup Quick Reference Card

## 🎯 Goal
Replace placeholder Sentry keys to enable production error monitoring

## ⏱️ Time Required
**20 minutes**

---

## 📝 Checklist

### Step 1: Get Credentials (10 min)
- [ ] Login to https://sentry.io/
- [ ] Get DSN from: Settings → Projects → cross-border-tax → Client Keys (DSN)
- [ ] Create auth token: Profile → Auth Tokens → Create (with all project scopes)
- [ ] Screenshot both for evidence

### Step 2: Update Vercel (5 min)
Go to: https://vercel.com/caffeineGMT/taxbridge/settings/environment-variables

Update these 4 variables:
- [ ] `NEXT_PUBLIC_SENTRY_DSN` = your DSN (https://...)
- [ ] `SENTRY_AUTH_TOKEN` = your token (sntrys_...)
- [ ] `SENTRY_ORG` = taxbridge
- [ ] `SENTRY_PROJECT` = cross-border-tax
- [ ] Click "Redeploy"
- [ ] Screenshot Vercel env vars

### Step 3: Test (5 min)
- [ ] Wait 3-5 min for deployment
- [ ] Run: `npm run verify:sentry`
- [ ] OR visit: https://taxbridge.vercel.app/api/test-error
- [ ] Check Sentry dashboard for error
- [ ] Screenshot Sentry Issues showing error

---

## 📸 Evidence Required

Save to: `docs/screenshots/sentry-activation-YYYY-MM-DD/`

1. sentry-dsn-config.png (Sentry DSN page)
2. vercel-env-vars.png (4 variables set)
3. sentry-test-error.png (Error in Sentry Issues)

---

## 🔗 Resources

- Full Guide: `docs/SENTRY_ACTIVATION_GUIDE.md`
- Executive Summary: `docs/SENTRY_EXECUTIVE_SUMMARY.md`
- Verification Script: `npm run verify:sentry`
- Test Endpoint: `/api/test-error`

---

## ✅ Success Criteria

Task is COMPLETE when:
1. All 3 screenshots captured
2. Verification report generated
3. Test error visible in Sentry dashboard
4. No placeholder values in Vercel

---

## 🚨 Common Issues

**Issue**: Test error not appearing in Sentry
**Fix**: Wait 1-2 minutes, Sentry has processing delay

**Issue**: "Invalid DSN format"
**Fix**: Ensure DSN includes `https://` prefix

**Issue**: Vercel variables not applying
**Fix**: Manually trigger redeploy from Vercel dashboard

---

**Created**: March 19, 2026
**Priority**: P0-CRITICAL
**Deadline**: 1 hour
