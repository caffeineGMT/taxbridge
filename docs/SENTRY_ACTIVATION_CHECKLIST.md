# ✅ SENTRY ACTIVATION - TASK COMPLETION CHECKLIST

**Quick Reference for Evidence-Based Task Completion**

---

## 🎯 COMPLETION CRITERIA

This task is marked COMPLETE when **ALL** of these are true:

### ✅ Configuration Complete
- [ ] Sentry account created at https://sentry.io
- [ ] Project "cross-border-tax" created
- [ ] DSN copied from Sentry dashboard
- [ ] Auth token generated with correct scopes
- [ ] All 4 environment variables updated in Vercel:
  - `NEXT_PUBLIC_SENTRY_DSN`
  - `SENTRY_AUTH_TOKEN`
  - `SENTRY_ORG`
  - `SENTRY_PROJECT`
- [ ] Production redeployed with new env vars

### ✅ Verification Complete
- [ ] Test endpoint returns success: `https://taxbridge.vercel.app/api/test-sentry`
- [ ] Test error visible in Sentry dashboard
- [ ] Verification script passes: `npm run verify:sentry` exits with code 0
- [ ] Screenshot captured showing live error in Sentry

### ✅ Evidence Documented
- [ ] Screenshot saved to `docs/verification-evidence/sentry-production-active-{DATE}.png`
- [ ] Verification report saved to `docs/verification-reports/sentry-verification-{DATE}.log`
- [ ] This checklist completed and committed

---

## 📋 PRE-ACTIVATION CHECKLIST

### Step 1: Create Sentry Account (3 min)
- [ ] Visit https://sentry.io/signup/
- [ ] Sign up with michael@taxbridge.app
- [ ] Verify email
- [ ] Choose "Team" plan (FREE)

### Step 2: Create Project (2 min)
- [ ] Click "Create Project"
- [ ] Platform: Next.js
- [ ] Name: cross-border-tax
- [ ] Alert frequency: "Alert on every new issue"
- [ ] Click "Create Project"

### Step 3: Get DSN (1 min)
- [ ] Copy DSN shown after project creation
- [ ] Format: `https://KEY@o###.ingest.sentry.io/###`
- [ ] Save to notes (will paste into Vercel)

### Step 4: Create Auth Token (3 min)
- [ ] Settings → Auth Tokens → Create New Token
- [ ] Name: TaxBridge Production Deploys
- [ ] Scopes checked:
  - [ ] `project:read`
  - [ ] `project:releases`
  - [ ] `org:read`
- [ ] Click "Create Token"
- [ ] **COPY TOKEN IMMEDIATELY** (can't see again)
- [ ] Save to notes (will paste into Vercel)

### Step 5: Update Vercel (4 min)
- [ ] Visit https://vercel.com/caffeineGMT/taxbridge/settings/environment-variables
- [ ] Update `NEXT_PUBLIC_SENTRY_DSN` = {DSN from Step 3}
- [ ] Update `SENTRY_AUTH_TOKEN` = {Token from Step 4}
- [ ] Update `SENTRY_ORG` = taxbridge
- [ ] Update `SENTRY_PROJECT` = cross-border-tax
- [ ] Check "Production" for all 4 variables
- [ ] Click "Save" for each

### Step 6: Redeploy (2 min)
- [ ] Option A: Push empty commit
  ```bash
  git commit --allow-empty -m "[SENTRY] Activate production error tracking"
  git push origin main
  ```
- [ ] Option B: Manual redeploy in Vercel dashboard
- [ ] Wait for deployment to finish (~2 minutes)

---

## 🧪 VERIFICATION CHECKLIST

### Test 1: API Endpoint
- [ ] Visit: https://taxbridge.vercel.app/api/test-sentry
- [ ] Response includes `"success": true`
- [ ] Response includes `"eventId": "..."`
- [ ] No error message in response

### Test 2: Sentry Dashboard
- [ ] Visit: https://sentry.io/organizations/taxbridge/issues/
- [ ] Test error visible (appears within 30 seconds)
- [ ] Error title: "This is a test error from TaxBridge"
- [ ] Environment: production
- [ ] Timestamp: last 5 minutes

### Test 3: Verification Script
```bash
npm run verify:sentry
```
- [ ] All checks show ✅ (green checkmarks)
- [ ] No ❌ (red X's) in output
- [ ] Final message: "🎉 SENTRY IS FULLY OPERATIONAL"
- [ ] Script exits with code 0

---

## 📸 EVIDENCE CAPTURE CHECKLIST

### Screenshot Evidence (REQUIRED)
- [ ] Navigate to Sentry dashboard
- [ ] Ensure test error is visible
- [ ] Take full-screen screenshot showing:
  - [ ] Error title visible
  - [ ] Timestamp visible (must be recent)
  - [ ] Environment tag shows "production"
  - [ ] Browser URL bar showing sentry.io domain
- [ ] Save as: `docs/verification-evidence/sentry-production-active-{DATE}.png`
- [ ] Verify file size >50KB (not a broken screenshot)

### Log Evidence (OPTIONAL)
```bash
npm run verify:sentry > docs/verification-reports/sentry-verification-$(date +%F).log
```
- [ ] Log file created
- [ ] Contains "SENTRY IS FULLY OPERATIONAL"
- [ ] No FAILED checks in log

### Documentation Evidence (REQUIRED)
- [ ] Create verification report (see template below)
- [ ] Include timestamp of completion
- [ ] Include screenshot path
- [ ] Include verification script output
- [ ] Save as: `docs/verification-reports/sentry-activation-complete-{DATE}.md`

---

## 📝 VERIFICATION REPORT TEMPLATE

Create file: `docs/verification-reports/sentry-activation-complete-{DATE}.md`

```markdown
# SENTRY PRODUCTION ACTIVATION - VERIFICATION REPORT

**Date**: {YYYY-MM-DD}
**Time**: {HH:MM} UTC
**Completed By**: {Name}
**Task**: [P0-CRITICAL] Replace Sentry Auth Token - No Error Monitoring

---

## ✅ ACTIVATION COMPLETE

### Credentials Configured
- Sentry Account: ✅ Created
- Project: ✅ cross-border-tax
- Organization: ✅ taxbridge
- DSN: ✅ Configured (not placeholder)
- Auth Token: ✅ Generated and set

### Vercel Environment Variables
- NEXT_PUBLIC_SENTRY_DSN: ✅ Set
- SENTRY_AUTH_TOKEN: ✅ Set
- SENTRY_ORG: ✅ Set
- SENTRY_PROJECT: ✅ Set

### Deployment
- Status: ✅ Deployed to production
- Timestamp: {deployment time}
- Git Commit: {commit SHA}

---

## 🧪 VERIFICATION RESULTS

### Test Endpoint
URL: https://taxbridge.vercel.app/api/test-sentry
Response:
{paste JSON response}

### Sentry Dashboard
URL: https://sentry.io/organizations/taxbridge/issues/
Test Error Visible: ✅ Yes
Event ID: {paste event ID}
Timestamp: {error timestamp}

### Verification Script
Command: npm run verify:sentry
Exit Code: 0
Output:
{paste script output}

---

## 📸 EVIDENCE

Screenshot: docs/verification-evidence/sentry-production-active-{DATE}.png
Size: {file size} KB
Contents: Sentry dashboard showing test error in production environment

---

## 📊 POST-ACTIVATION STATUS

- Error Monitoring: ✅ ACTIVE
- Alert Notifications: ✅ ENABLED
- Source Maps: ✅ UPLOADED
- Release Tracking: ✅ ENABLED
- Session Replay: ✅ CONFIGURED (10% sample rate)

---

## ✅ TASK STATUS: COMPLETE

All completion criteria met. Evidence captured and verified.

**Signed off**: {Date} {Time}
```

---

## 🚨 TROUBLESHOOTING CHECKLIST

### Issue: Verification script fails
- [ ] Check env vars are set in Vercel (not local .env)
- [ ] Verify redeployment completed successfully
- [ ] Wait 5 minutes after deployment
- [ ] Try clearing build cache and redeploying

### Issue: Test error not appearing in Sentry
- [ ] Wait full 60 seconds (ingestion delay)
- [ ] Check "All Environments" filter (not just production)
- [ ] Verify DSN format is correct
- [ ] Check Sentry status page: https://status.sentry.io/

### Issue: "DSN is not set" error
- [ ] Verify env var has `NEXT_PUBLIC_` prefix
- [ ] Check for typos in variable name
- [ ] Confirm variable is set to "Production" environment
- [ ] Try redeploying

### Issue: Auth token invalid
- [ ] Verify token copied correctly (64 characters)
- [ ] Check token has correct scopes
- [ ] Regenerate token if needed
- [ ] Update Vercel and redeploy

---

## 🎯 FINAL CHECKLIST BEFORE COMMITTING

Before marking task complete:

- [ ] Screenshot saved and verified readable
- [ ] Verification report created
- [ ] All evidence files committed to git
- [ ] Test endpoint working in production
- [ ] Verification script passes
- [ ] No placeholder values in production env vars
- [ ] Sentry dashboard shows test error
- [ ] Task completion commit message includes:
  - Task ID: [P0-CRITICAL]
  - What was done: "Replace Sentry Auth Token"
  - Evidence location: path to screenshot
  - Verification result: "✅ VERIFIED"

---

## 📦 COMMIT TEMPLATE

```bash
git add -A
git commit -m "[P0-CRITICAL] Replace Sentry Auth Token - Error Monitoring ACTIVATED

✅ VERIFICATION COMPLETE

Credentials:
- Sentry account: michael@taxbridge.app
- Project: cross-border-tax
- Organization: taxbridge
- DSN: Configured in Vercel (production)
- Auth Token: Generated with project:read, project:releases, org:read scopes

Evidence:
- Screenshot: docs/verification-evidence/sentry-production-active-{DATE}.png
- Verification: npm run verify:sentry → Exit code 0
- Test endpoint: https://taxbridge.vercel.app/api/test-sentry → Success
- Sentry dashboard: Error visible in production environment

Status: ✅ Sentry fully operational, capturing production errors

Files:
- docs/SENTRY_PRODUCTION_ACTIVATION_GUIDE.md (15-min guide)
- docs/SENTRY_PRODUCTION_EXECUTIVE_SUMMARY.md (quick reference)
- scripts/verify-sentry-production.ts (automated verification)
- app/api/test-sentry/route.ts (enhanced test endpoint)
- docs/SENTRY_ACTIVATION_CHECKLIST.md (this checklist)
"

git push origin main
```

---

**Total Time to Complete**: ~15-20 minutes
**Evidence Required**: Screenshot + Verification Log
**Success Rate**: 95%+ (straightforward config change)

---

**Last Updated**: March 19, 2026
**Version**: 1.0
