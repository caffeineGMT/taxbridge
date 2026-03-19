# Sentry Auth Token Replacement - Executive Summary

**Task**: [P0-CRITICAL] Replace Sentry Auth Token - No Error Monitoring
**Priority**: P0-CRITICAL
**Deadline**: 1 hour
**Business Impact**: Production errors go unnoticed, cannot debug user issues

---

## 🚨 Current Status

**SENTRY IS NOT WORKING** - Production error monitoring is OFFLINE

**Evidence**:
- Smoke test screenshot (March 19, 2026): `docs/screenshots/smoke-test-2026-03-19/sentry-check-1773946783218.png`
- Status: "Sentry not detected"
- Root cause: Placeholder environment variables in production

---

## ⚡ Quick Fix (20 minutes)

### 1. Get Sentry DSN (5 min)
- Login: https://sentry.io/auth/login/
- Go to: Settings → Projects → cross-border-tax → Client Keys (DSN)
- Copy DSN (format: `https://key@o123.ingest.sentry.io/456`)

### 2. Create Auth Token (5 min)
- Profile → Auth Tokens → Create New Token
- Name: "TaxBridge Production Deploy"
- Scopes: `project:read`, `project:write`, `project:releases`, `org:read`, `event:read`, `event:write`
- Copy token (starts with `sntrys_`)

### 3. Update Vercel (5 min)
- https://vercel.com/caffeineGMT/taxbridge/settings/environment-variables
- Set `NEXT_PUBLIC_SENTRY_DSN` = your DSN
- Set `SENTRY_AUTH_TOKEN` = your token
- Set `SENTRY_ORG` = taxbridge
- Set `SENTRY_PROJECT` = cross-border-tax
- Click "Redeploy"

### 4. Verify (5 min)
```bash
npm run verify:sentry
```

Or visit: https://taxbridge.vercel.app/api/test-error

Then check Sentry dashboard for error within 30 seconds.

---

## 📋 Evidence Required

Before marking task COMPLETE, you MUST provide:

1. ✅ Screenshot: Sentry DSN configuration page
2. ✅ Screenshot: Vercel environment variables (4 vars set)
3. ✅ Screenshot: Sentry Issues dashboard showing test error from production
4. ✅ Verification report: `docs/SENTRY_VERIFICATION_REPORT.md`

Save screenshots to: `docs/screenshots/sentry-activation-YYYY-MM-DD/`

---

## 📚 Full Documentation

- **Step-by-step guide**: `docs/SENTRY_ACTIVATION_GUIDE.md`
- **Verification script**: `scripts/verify-sentry.ts`
- **Test endpoint**: `/api/test-error`

---

## 💰 Business Impact

### Before Activation:
- ❌ Production errors invisible
- ❌ Cannot debug user issues
- ❌ Revenue loss undetectable (failed payments invisible)
- ❌ Performance regressions unknown

### After Activation:
- ✅ Real-time error alerts
- ✅ Full stack traces for debugging
- ✅ Failed payment tracking
- ✅ Performance monitoring

**Estimated revenue protection**: $500-$2,000/month

---

## ⏱️ Time Estimate

- Get DSN: 5 min
- Create token: 5 min
- Update Vercel: 5 min
- Verify: 5 min
- **Total: 20 minutes**

---

## 🔐 Security

- ✅ Auth token is encrypted at rest in Vercel
- ✅ Never commit tokens to Git
- ✅ Rotate tokens every 90 days
- ✅ Use minimum required scopes

---

## ❓ Need Help?

1. See full guide: `docs/SENTRY_ACTIVATION_GUIDE.md`
2. Run verification: `npm run verify:sentry`
3. Test manually: Visit `/api/test-error` in production
4. Check Sentry docs: https://docs.sentry.io/platforms/javascript/guides/nextjs/

---

**Last Updated**: March 19, 2026
**Status**: AWAITING MANUAL EXECUTION
