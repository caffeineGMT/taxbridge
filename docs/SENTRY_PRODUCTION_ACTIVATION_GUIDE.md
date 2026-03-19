# 🚨 SENTRY PRODUCTION ACTIVATION GUIDE
**P0-CRITICAL REVENUE BLOCKER** - No Error Monitoring Active

---

## ⏱️ EXECUTIVE SUMMARY
- **Current Status**: 🔴 Sentry is 100% DISABLED - placeholder credentials blocking all error tracking
- **Impact**: Zero visibility into production errors, bugs go undetected, revenue loss unknown
- **Time to Fix**: **15 minutes** (account setup + key replacement)
- **Difficulty**: ⭐ Easy (copy-paste credentials, no code changes)
- **Blocker Type**: Environment configuration only
- **Revenue Impact**: Indirect - inability to detect/fix payment bugs = lost conversions

---

## 🎯 WHAT NEEDS TO BE DONE

### Current Placeholder Values (❌ BROKEN)
```bash
# .env.production - THESE ARE FAKE
NEXT_PUBLIC_SENTRY_DSN=https://YOUR_SENTRY_KEY@o0000000.ingest.sentry.io/0000000
SENTRY_AUTH_TOKEN=YOUR_SENTRY_AUTH_TOKEN
SENTRY_ORG=taxbridge
SENTRY_PROJECT=cross-border-tax
```

### What We Need (✅ WORKING)
```bash
# Real values from sentry.io
NEXT_PUBLIC_SENTRY_DSN=https://abc123def456@o4506742148276224.ingest.sentry.io/4506742152470528
SENTRY_AUTH_TOKEN=sntrys_abc...xyz123  # 64-char token
SENTRY_ORG=taxbridge  # Your org slug
SENTRY_PROJECT=cross-border-tax  # Your project slug
```

---

## 📋 ACTIVATION CHECKLIST (15 minutes)

### ✅ STEP 1: Create Sentry Account (3 minutes)
1. Go to https://sentry.io/signup/
2. Sign up with `michael@taxbridge.app` (or your email)
3. Choose **"Team" plan** (FREE for 5k errors/month)
4. Verify email

### ✅ STEP 2: Create Project (2 minutes)
1. Click **"Create Project"**
2. Select platform: **"Next.js"**
3. Set alert frequency: **"Alert on every new issue"**
4. Project name: `cross-border-tax`
5. Click **"Create Project"**

### ✅ STEP 3: Get DSN (1 minute)
After project creation, Sentry shows your DSN immediately:

```
Copy this DSN:
https://abc123def456@o4506742148276224.ingest.sentry.io/4506742152470528
       ^^^^^^^^^^ ^^^^^^^^^^^^^^^^^^                    ^^^^^^^^^^^^^^^^^^
       Public Key Organization ID                       Project ID
```

**Alternative way to find DSN:**
1. Go to **Settings** → **Projects** → **cross-border-tax**
2. Click **"Client Keys (DSN)"**
3. Copy the DSN value

### ✅ STEP 4: Create Auth Token (3 minutes)
1. Click your avatar (top right) → **"Settings"**
2. Navigate to **"Auth Tokens"** (left sidebar)
3. Click **"Create New Token"**
4. Configuration:
   - **Name**: `TaxBridge Production Deploys`
   - **Scopes**: Check these boxes:
     - ✅ `project:read`
     - ✅ `project:releases`
     - ✅ `org:read`
   - **Click "Create Token"**
5. **COPY THE TOKEN IMMEDIATELY** (you can't see it again!)
   - Format: `sntrys_abc...xyz123` (64 characters)

### ✅ STEP 5: Update Vercel Environment Variables (4 minutes)
1. Go to https://vercel.com/caffeineGMT/taxbridge/settings/environment-variables
2. Find and UPDATE these 4 variables (click Edit icon):

| Variable | Value | Source |
|----------|-------|--------|
| `NEXT_PUBLIC_SENTRY_DSN` | `https://abc...@o123.ingest.sentry.io/456` | Step 3 |
| `SENTRY_AUTH_TOKEN` | `sntrys_abc...xyz123` | Step 4 |
| `SENTRY_ORG` | `taxbridge` | Your org slug from Settings |
| `SENTRY_PROJECT` | `cross-border-tax` | Project name from Step 2 |

3. Make sure **"Production"** is checked
4. Click **"Save"** for each

### ✅ STEP 6: Redeploy (2 minutes)
Vercel needs to rebuild with new env vars:

**Option A: Git Push (Automatic)**
```bash
git commit --allow-empty -m "[SENTRY] Activate production error tracking"
git push origin main
# Vercel auto-deploys in ~2 minutes
```

**Option B: Manual Redeploy**
1. Go to https://vercel.com/caffeineGMT/taxbridge
2. Click **"Deployments"**
3. Find latest deployment → Click **"..."** → **"Redeploy"**

---

## 🧪 STEP 7: VERIFICATION (2 minutes)

### Test 1: Trigger Test Error
Visit this URL to send a test error to Sentry:
```
https://taxbridge.vercel.app/api/test-sentry
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Test error sent to Sentry",
  "eventId": "a1b2c3d4e5f6..."
}
```

### Test 2: Check Sentry Dashboard
1. Go to https://sentry.io/organizations/taxbridge/issues/
2. You should see the test error within 30 seconds:
   - **Title**: "This is a test error from TaxBridge"
   - **Environment**: production
   - **Release**: (git commit SHA)

### Test 3: Run Verification Script
```bash
npm run verify:sentry
```

**Expected Output:**
```
🔍 Verifying Sentry configuration...
✅ NEXT_PUBLIC_SENTRY_DSN is set (not placeholder)
✅ SENTRY_AUTH_TOKEN is set (not placeholder)
✅ SENTRY_ORG is set
✅ SENTRY_PROJECT is set
✅ Sentry is initialized in client config
✅ Sentry is initialized in server config

📊 Testing Sentry error capture...
✅ Test error sent successfully (Event ID: abc123)

🎉 SENTRY IS FULLY OPERATIONAL
```

---

## 📸 EVIDENCE REQUIRED FOR TASK COMPLETION

Per CLAUDE.md Task Completion Policy, provide:

### Evidence Option 1: Screenshot (RECOMMENDED)
Take screenshot showing:
1. Sentry dashboard at https://sentry.io/organizations/taxbridge/issues/
2. Test error visible with:
   - ✅ Environment: production
   - ✅ Timestamp: last 5 minutes
   - ✅ Error message: "This is a test error from TaxBridge"

Save as: `docs/verification-evidence/sentry-production-active-YYYY-MM-DD.png`

### Evidence Option 2: Logs
```bash
npm run verify:sentry > docs/verification-reports/sentry-verification-$(date +%F).log
```

### Evidence Option 3: Live URL
Provide working test endpoint:
```
https://taxbridge.vercel.app/api/test-sentry
→ Returns eventId
→ Error appears in Sentry within 30s
```

---

## 🚨 TROUBLESHOOTING

### Issue 1: "DSN is not set" error
**Symptom:** Console shows `Sentry DSN is not configured`

**Fix:**
1. Verify env var in Vercel: `NEXT_PUBLIC_SENTRY_DSN` starts with `https://`
2. Must have `NEXT_PUBLIC_` prefix (public var)
3. Redeploy after saving

### Issue 2: Events not appearing in Sentry
**Symptom:** Test error sent but not visible in dashboard

**Fix:**
1. Check project name matches: Settings → Project → cross-border-tax
2. Verify organization slug: Should be `taxbridge` not `taxbridge-team`
3. Wait 60 seconds (Sentry has ingestion delay)
4. Check "All Environments" filter (not just production)

### Issue 3: "Invalid DSN" error
**Symptom:** Sentry throws `Invalid DSN format`

**Fix:**
DSN format must be:
```
https://PUBLIC_KEY@ORGANIZATION_ID.ingest.sentry.io/PROJECT_ID
```

Example valid DSN:
```
https://abc123def456@o4506742148276224.ingest.sentry.io/4506742152470528
```

### Issue 4: Build fails with Sentry auth error
**Symptom:** Vercel build logs show `Sentry authentication failed`

**Fix:**
1. Verify `SENTRY_AUTH_TOKEN` has correct scopes:
   - `project:read`
   - `project:releases`
   - `org:read`
2. Token format: `sntrys_...` (64 chars)
3. Regenerate token if expired (Settings → Auth Tokens)

---

## 🎯 SUCCESS CRITERIA

Mark this task COMPLETE when ALL of these are true:

- [ ] Sentry account created at sentry.io
- [ ] Project "cross-border-tax" exists in Sentry
- [ ] All 4 environment variables set in Vercel (no placeholders)
- [ ] Production deployment successful with new env vars
- [ ] Test error visible in Sentry dashboard (screenshot captured)
- [ ] Verification script passes (`npm run verify:sentry`)
- [ ] Evidence file saved to `docs/verification-evidence/`

---

## 📊 EXPECTED OUTCOMES

### Immediate (After Activation)
- ✅ All production errors logged to Sentry
- ✅ Email alerts on new issues
- ✅ Stack traces with source maps
- ✅ User context (browser, device, location)
- ✅ Release tracking (git commits)

### 7 Days After Activation
- ✅ Identify top 5 most frequent errors
- ✅ Fix critical bugs affecting conversions
- ✅ Reduce error rate by 50%+
- ✅ Improve payment success rate

### 30 Days After Activation
- ✅ Zero unmonitored errors
- ✅ Average resolution time <24 hours
- ✅ Error budget: <0.1% error rate
- ✅ Customer satisfaction improvement

---

## 🔗 USEFUL LINKS

- **Sentry Dashboard**: https://sentry.io/organizations/taxbridge/
- **Vercel Env Vars**: https://vercel.com/caffeineGMT/taxbridge/settings/environment-variables
- **Sentry Docs**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Test Endpoint**: https://taxbridge.vercel.app/api/test-sentry

---

## 📅 TIMELINE

| Step | Duration | Cumulative |
|------|----------|------------|
| Create account | 3 min | 3 min |
| Create project | 2 min | 5 min |
| Get DSN | 1 min | 6 min |
| Create auth token | 3 min | 9 min |
| Update Vercel vars | 4 min | 13 min |
| Redeploy | 2 min | 15 min |
| Verification | 2 min | **17 min** |

**Total Time: 15-17 minutes** ⏱️

---

## ✅ NEXT STEPS AFTER COMPLETION

1. Set up Sentry alerts:
   - Email on new issues
   - Slack integration (optional)
   - PagerDuty for P0 errors (optional)

2. Configure error budget:
   - Target: <0.1% error rate
   - Alert when threshold exceeded

3. Review errors weekly:
   - Triage new issues
   - Assign to engineers
   - Track resolution time

4. Monitor key metrics:
   - Error volume trend
   - Most common errors
   - Affected users count

---

**Last Updated**: March 19, 2026
**Owner**: CTO (Michael Guo)
**Priority**: P0-CRITICAL
**Status**: 🔴 BLOCKED - Awaiting activation
