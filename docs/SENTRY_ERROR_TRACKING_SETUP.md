# Sentry Error Tracking Setup Guide

**Status:** Infrastructure ready, needs DSN configuration
**Priority:** P2-MEDIUM
**Estimated Time:** 20-30 minutes
**Current Status:** Placeholder DSN blocking error monitoring

---

## Overview

Sentry is **already installed** and integrated into TaxBridge codebase. You just need to:

1. Create Sentry account (free tier: 5,000 errors/month)
2. Get real DSN keys
3. Replace placeholder values in `.env.production`
4. Test error tracking
5. Configure alerts

**Current Issue:** Production uses placeholder DSN → all errors lost in the void ❌

---

## Step 1: Create Sentry Account (5 minutes)

1. Visit: https://sentry.io/signup/
2. Sign up with GitHub (recommended) or email
3. Select plan: **Developer (Free)**
   - 5,000 errors/month
   - 30-day retention
   - Email alerts
   - Unlimited projects

4. Create organization:
   ```
   Organization name: TaxBridge
   Organization slug: taxbridge
   ```

---

## Step 2: Create Project (3 minutes)

1. Click "Create Project"
2. Select platform: **Next.js**
3. Project settings:
   ```
   Project name: cross-border-tax
   Set your alert frequency: On every new issue
   ```

4. Click "Create Project"

5. **SAVE THIS DSN** (you'll need it next):
   ```
   https://abc123def456ghi789jkl012mno345p@o1234567.ingest.sentry.io/9876543
   ```

---

## Step 3: Configure Environment Variables (5 minutes)

### Update `.env.production`

Replace placeholder values:

```bash
# BEFORE (placeholder)
NEXT_PUBLIC_SENTRY_DSN=https://YOUR_SENTRY_KEY@o0000000.ingest.sentry.io/0000000
SENTRY_AUTH_TOKEN=YOUR_SENTRY_AUTH_TOKEN
SENTRY_ORG=taxbridge
SENTRY_PROJECT=cross-border-tax

# AFTER (real values)
NEXT_PUBLIC_SENTRY_DSN=https://abc123def456ghi789jkl012mno345p@o1234567.ingest.sentry.io/9876543
SENTRY_AUTH_TOKEN=sntrys_abc123def456... (from Step 4)
SENTRY_ORG=taxbridge
SENTRY_PROJECT=cross-border-tax
```

### Update `.env.local` (for local testing)

Same values as above for testing error tracking locally.

---

## Step 4: Create Auth Token (3 minutes)

**Why needed?** For uploading source maps (better stack traces)

1. Go to: https://sentry.io/settings/account/api/auth-tokens/
2. Click "Create New Token"
3. Token settings:
   ```
   Name: Vercel Deployment
   Scopes:
     ✅ project:read
     ✅ project:releases
     ✅ org:read
   ```

4. Click "Create Token"
5. **COPY TOKEN IMMEDIATELY** (you can't see it again):
   ```
   sntrys_abc123def456...
   ```

6. Paste into `.env.production` as `SENTRY_AUTH_TOKEN`

---

## Step 5: Configure Vercel Environment Variables (5 minutes)

**Critical:** Vercel needs these env vars to send errors to Sentry

1. Go to: https://vercel.com/taxbridge/cross-border-tax/settings/environment-variables
2. Add each variable:

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_SENTRY_DSN` | (your DSN from Step 2) | Production |
| `SENTRY_AUTH_TOKEN` | (your token from Step 4) | Production |
| `SENTRY_ORG` | `taxbridge` | Production |
| `SENTRY_PROJECT` | `cross-border-tax` | Production |

3. Click "Save"

**Important:** Redeploy after adding env vars:
```bash
git commit --allow-empty -m "Trigger Vercel redeploy for Sentry env vars"
git push origin main
```

---

## Step 6: Test Error Tracking (5 minutes)

### Local Testing

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Trigger test error:
   ```bash
   curl http://localhost:3000/api/test-sentry
   ```

3. Check terminal output:
   ```
   [Sentry] Sending error to Sentry...
   Error: Sentry test error - error tracking is working! ✅
   ```

4. Go to Sentry dashboard: https://sentry.io/organizations/taxbridge/issues/
5. You should see the error appear within 10 seconds ✅

---

### Production Testing

**After deploying with real DSN:**

1. Trigger production test error:
   ```bash
   curl https://taxbridge.vercel.app/api/test-sentry
   ```

2. Check Sentry dashboard for new error
3. Verify error details:
   - Stack trace visible
   - Environment: production
   - Release version
   - User context (if logged in)

**Expected:** Error appears in Sentry within 30 seconds ✅

---

## Step 7: Configure Alerts (5 minutes)

### Email Alerts

1. Go to: https://sentry.io/organizations/taxbridge/projects/cross-border-tax/alerts/
2. Default rule already exists: "Alert on every new issue"
3. Click to customize:
   ```
   When: A new issue is created
   Then: Send email to: your@email.com
   ```

### Slack Alerts (Recommended)

1. Go to Settings → Integrations
2. Find "Slack" → Click "Install"
3. Authorize Slack workspace
4. Select channel: #alerts
5. Create alert rule:
   ```
   When: A new issue is created OR issue count > 10 in 5 minutes
   Then: Send Slack notification to #alerts
   ```

**Slack message includes:**
- Error message
- Stack trace (first few lines)
- Link to Sentry dashboard
- Affected users count

---

## Step 8: Configure Source Maps (Automatic)

**Good news:** Already configured in `next.config.mjs`:

```javascript
// Sentry source maps configuration
sentry: {
  hideSourceMaps: true, // Don't expose source code in browser
  autoInstrumentServerFunctions: true, // Track server-side errors
  widenClientFileUpload: true, // Upload all client files for better traces
},
```

**Source maps are uploaded automatically** during Vercel deployment.

**Verification:**
1. Trigger error in production
2. Check stack trace in Sentry
3. Should show **actual file names and line numbers**, not minified code ✅

---

## Step 9: Set Up Performance Monitoring (Optional)

**Free tier:** 10,000 transactions/month

1. Enable in `sentry.client.config.ts` (already done):
   ```typescript
   Sentry.init({
     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
     tracesSampleRate: 0.1, // Sample 10% of transactions
   });
   ```

2. Go to Sentry → Performance
3. See transaction data:
   - Page load times
   - API response times
   - Database query performance

**Useful for finding performance bottlenecks** before users complain.

---

## What Errors Are Tracked?

### Automatically Captured

✅ **Server-Side Errors:**
- API route crashes (500 errors)
- Database connection failures
- Stripe payment errors
- Unhandled promise rejections

✅ **Client-Side Errors:**
- JavaScript exceptions
- React component errors
- Network request failures
- Unhandled promise rejections

✅ **Next.js Framework Errors:**
- Build errors (if source maps uploaded)
- SSR failures
- Middleware crashes

### Custom Error Tracking

**Already integrated in codebase:**

```typescript
// All API routes use this pattern
import { handleApiError } from '@/lib/api-error-handler';

export async function POST(req: NextRequest) {
  try {
    // Your code
  } catch (error) {
    return handleApiError(error, {
      route: '/api/example',
      method: 'POST',
      userId: user.id,
    });
  }
}
```

**This sends 500 errors to Sentry automatically** with full context.

---

## Alert Thresholds

**Recommended settings:**

| Alert | Threshold | Action |
|-------|-----------|--------|
| New Issue | 1 occurrence | Email + Slack |
| High Frequency | 10 errors in 5 min | Slack @channel |
| Critical Error | Payment/auth failure | SMS (paid tier) |
| Performance | Response time >3s | Email |

---

## Error Grouping

**Sentry groups similar errors together.** Example:

```
Issue #1: "Database connection failed"
  - 47 occurrences
  - Affects 12 users
  - First seen: 2 hours ago
  - Last seen: 5 minutes ago
```

**Helps prioritize** → fix high-impact issues first.

---

## Release Tracking

**Automatically tracked via Git commits:**

```javascript
// sentry.client.config.ts
Sentry.init({
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
});
```

**In Sentry dashboard:**
- See which release introduced a bug
- Compare error rates between releases
- Rollback if new deploy breaks things

---

## Privacy & PII

**Sentry scrubs PII by default:**
- Passwords redacted
- Cookies filtered
- Authorization headers removed

**Custom scrubbing:**

```typescript
// sentry.client.config.ts
Sentry.init({
  beforeSend(event) {
    // Remove sensitive data
    if (event.request?.headers) {
      delete event.request.headers['x-api-key'];
    }
    return event;
  },
});
```

---

## Cost Breakdown

**Free Tier (Current Plan):**
- 5,000 errors/month
- 10,000 transactions/month (performance)
- 30-day retention
- Email alerts
- **Cost: $0/month**

**Team Tier (If Needed):**
- 50,000 errors/month
- 100,000 transactions/month
- 90-day retention
- SMS alerts
- **Cost: $26/month**

**Recommendation:** Start with free tier. Upgrade only if you hit limits.

---

## Verification Checklist

After setup:

- [ ] Sentry account created
- [ ] Project created in Sentry
- [ ] DSN copied to `.env.production`
- [ ] Auth token created and saved
- [ ] Vercel env vars configured
- [ ] Test error sent from local dev
- [ ] Test error sent from production
- [ ] Error appears in Sentry dashboard
- [ ] Email alert received
- [ ] Slack alert received (if configured)
- [ ] Source maps working (readable stack traces)

---

## Monitoring Dashboard

**Sentry provides:**

1. **Issues Dashboard**
   - All errors grouped by type
   - Frequency graph
   - Affected users count

2. **Performance Dashboard**
   - Transaction list (API routes, pages)
   - Response time percentiles
   - Slow database queries

3. **Releases Dashboard**
   - Error rate per deploy
   - Crash-free users %
   - Regression detection

**Access:** https://sentry.io/organizations/taxbridge/projects/cross-border-tax/

---

## Integration with UptimeRobot

**Full monitoring stack:**

| Tool | Monitors | Example Alert |
|------|----------|---------------|
| UptimeRobot | External availability | "Site down for 5 minutes" |
| Sentry | Application errors | "500 error spike: 47 occurrences" |
| Vercel | Platform health | "Build failed" |

**All three complement each other** → catch different failure modes.

---

## Troubleshooting

### No errors showing in Sentry

**Cause 1:** Wrong DSN
**Fix:** Double-check DSN in Vercel env vars matches Sentry project DSN

**Cause 2:** Vercel env vars not deployed
**Fix:** Trigger redeploy after adding env vars

**Cause 3:** Sentry disabled in dev
**Fix:** Check `sentry.client.config.ts` → `enabled: true`

### Stack traces are minified (unreadable)

**Cause:** Source maps not uploaded
**Fix:** Check `SENTRY_AUTH_TOKEN` is set in Vercel env vars

### Too many alerts (noise)

**Cause:** Alerting on every error (including minor 400s)
**Fix:** Adjust alert rules → only alert on 500 errors

---

## Next Steps

1. **Complete UptimeRobot setup** → See `UPTIME_MONITORING_SETUP.md`
2. **Configure error budget** → Set acceptable error rate (e.g., <0.1%)
3. **Set up on-call rotation** → Who responds to Sentry alerts?
4. **Create runbook** → Document response procedures for common errors

---

## Resources

- Sentry Dashboard: https://sentry.io/organizations/taxbridge/
- Documentation: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- Slack Integration: https://docs.sentry.io/product/integrations/notification-incidents/slack/
- Performance Monitoring: https://docs.sentry.io/product/performance/

---

**Implementation Status:** ⏳ Pending (follow this guide)
**Estimated Setup Time:** 20-30 minutes
**Priority:** P2-MEDIUM (important for production debugging)

**Blocker:** Needs real Sentry DSN to activate error tracking ✅
