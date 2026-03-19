# Production Monitoring Dashboard

**Last Updated:** 2026-03-19
**Status:** Infrastructure ready, setup pending

---

## Overview

TaxBridge production monitoring uses a **layered approach** to catch all failure modes:

```
┌─────────────────┐
│   UptimeRobot   │  External HTTP monitoring (site down, DNS failures)
├─────────────────┤
│     Sentry      │  Application error tracking (500 errors, exceptions)
├─────────────────┤
│ Vercel Analytics│  Platform health (deployments, functions, edge)
└─────────────────┘
```

**Why three tools?**
- UptimeRobot: Monitors from OUTSIDE → catches total outages
- Sentry: Monitors from INSIDE → catches application crashes
- Vercel: Monitors PLATFORM → catches infrastructure issues

**All three are complementary** → together provide 360° visibility.

---

## Quick Links

### Production Dashboards

| Service | Dashboard URL | Purpose |
|---------|---------------|---------|
| **UptimeRobot** | https://uptimerobot.com/dashboard | External uptime monitoring |
| **Sentry** | https://sentry.io/organizations/taxbridge/ | Error tracking & performance |
| **Vercel** | https://vercel.com/taxbridge/cross-border-tax | Platform health & deployments |
| **Status Page** | https://status-taxbridge.uptimerobot.com | Public status (for users) |

### Admin Tools

| Tool | URL | Purpose |
|------|-----|---------|
| Health Endpoint | https://taxbridge.vercel.app/api/health | Live health check |
| Sentry Test Route | https://taxbridge.vercel.app/api/test-sentry | Trigger test error |
| Vercel Logs | https://vercel.com/taxbridge/logs | Function logs & errors |

---

## Monitoring Stack Details

### 1. UptimeRobot (External Monitoring)

**What it monitors:**
- Site availability (HTTP 200 checks)
- DNS resolution
- Response time
- Keyword presence (ensures content renders)

**Monitors configured:**
1. Homepage - https://taxbridge.vercel.app
2. Calculator - https://taxbridge.vercel.app/calculator
3. API Health - https://taxbridge.vercel.app/api/health
4. Pricing Page - https://taxbridge.vercel.app/pricing

**Alert thresholds:**
```
Alert when: Down for 5 minutes (1 failed check)
Re-alert: Every 30 minutes if still down
Recovery notification: Yes
```

**Alert channels:**
- 📧 Email → your@email.com
- 💬 Slack → #alerts
- 📱 SMS (optional, paid tier)

**Check frequency:**
- Free tier: Every 5 minutes
- Paid tier: Every 1 minute

**Setup guide:** `docs/UPTIME_MONITORING_SETUP.md`

---

### 2. Sentry (Error Tracking)

**What it monitors:**
- JavaScript exceptions (client-side)
- API route errors (server-side)
- Unhandled promise rejections
- React component crashes
- Performance issues (transactions)

**Error categories tracked:**
```
✅ Validation errors (400)
✅ Authentication failures (401)
✅ Authorization denied (403)
✅ Resource not found (404)
✅ Rate limit exceeded (429)
✅ Database errors (500)
✅ Stripe API failures (502)
✅ External API timeouts (502)
```

**Alert thresholds:**
```
New issue: Alert on first occurrence
High frequency: Alert if >10 errors in 5 minutes
Critical errors: Immediate alert for payment/auth failures
```

**Alert channels:**
- 📧 Email → your@email.com
- 💬 Slack → #alerts
- 📊 Dashboard → Real-time issues list

**Error retention:**
- Free tier: 30 days
- Paid tier: 90 days

**Setup guide:** `docs/SENTRY_ERROR_TRACKING_SETUP.md`

---

### 3. Vercel Analytics (Platform Health)

**What it monitors:**
- Build status (success/failure)
- Function execution (timeouts, cold starts)
- Edge network health
- Traffic patterns
- Core Web Vitals

**Key metrics:**
```
✅ Deployment status (green = all builds passing)
✅ Function errors (should be <0.1%)
✅ Function duration (p95 < 3s)
✅ Data cache hit rate (higher = better)
✅ Edge cache hit rate (higher = better)
```

**Alert channels:**
- Built-in Vercel notifications
- Can configure webhooks to Slack

**Dashboard:** https://vercel.com/taxbridge/cross-border-tax

---

## Alert Response Procedures

### 🚨 UptimeRobot: Site Down Alert

**Alert message:**
> TaxBridge - Homepage is DOWN
> URL: https://taxbridge.vercel.app
> Reason: HTTP 503 Service Unavailable

**Response steps:**

1. **Verify outage** (30 seconds)
   ```bash
   curl -I https://taxbridge.vercel.app
   # If connection refused or 5xx error → real outage
   ```

2. **Check Vercel status** (1 minute)
   - Go to https://vercel.com/taxbridge/cross-border-tax
   - Look for deployment failures
   - Check function logs for errors

3. **Check Sentry** (1 minute)
   - Go to https://sentry.io/organizations/taxbridge/
   - Look for error spikes in last 5 minutes
   - Identify if specific route is crashing

4. **Emergency response** (5 minutes)
   - If Vercel deployment failed → Redeploy last known good version
   - If database issue → Check db connection in logs
   - If Stripe outage → Check status.stripe.com

5. **Post-incident** (30 minutes)
   - Document root cause
   - Update runbook
   - Add monitoring for similar issues

**Expected resolution time:** <10 minutes for most issues

---

### ⚠️ Sentry: Error Spike Alert

**Alert message:**
> New issue: "Database connection failed"
> 47 occurrences in last 5 minutes
> Affects 12 users

**Response steps:**

1. **Assess severity** (1 minute)
   - Check error rate: <10/min = warning, >50/min = critical
   - Check affected users: <5 = low impact, >20 = high impact
   - Check error type: 4xx = user error, 5xx = our bug

2. **Review stack trace** (2 minutes)
   - Click error in Sentry dashboard
   - Review stack trace (should show actual file:line)
   - Check breadcrumbs (what user did before error)

3. **Fix or mitigate** (10-30 minutes)
   - If database issue → Check connection pool, restart if needed
   - If Stripe issue → Add retry logic or error handling
   - If user-facing → Deploy hotfix immediately

4. **Verify fix** (5 minutes)
   - Test affected route
   - Monitor Sentry for new occurrences
   - Confirm error rate drops to zero

5. **Post-mortem** (24 hours)
   - Write incident report
   - Add tests to prevent regression
   - Update error handling if needed

**Expected resolution time:** <30 minutes for critical errors

---

## Daily Monitoring Checklist

### Morning Check (5 minutes)

- [ ] Open UptimeRobot dashboard → all monitors green?
- [ ] Check Sentry dashboard → any new critical errors?
- [ ] Check Vercel deployments → last deploy successful?
- [ ] Review overnight alerts → any incidents?

### Weekly Review (15 minutes)

- [ ] UptimeRobot: Review uptime % (target: >99.9%)
- [ ] Sentry: Review error trends (should be decreasing)
- [ ] Vercel: Review function performance (p95 < 3s)
- [ ] Check alert noise → any false positives to fix?

### Monthly Audit (30 minutes)

- [ ] Review incident history
- [ ] Update runbooks based on learnings
- [ ] Audit monitor list (add new critical pages)
- [ ] Review alert thresholds (too sensitive or too loose?)
- [ ] Check monitoring tool costs vs limits

---

## Monitoring Metrics

### Uptime Targets

| Page | Target | Current | Status |
|------|--------|---------|--------|
| Homepage | 99.9% | TBD | ⏳ Setup pending |
| Calculator | 99.9% | TBD | ⏳ Setup pending |
| API | 99.95% | TBD | ⏳ Setup pending |
| Checkout | 99.99% | TBD | ⏳ Setup pending |

**99.9% uptime = 43 minutes downtime/month max**

### Error Budgets

| Error Type | Budget | Current | Status |
|-----------|--------|---------|--------|
| 5xx errors | <0.1% | TBD | ⏳ Setup pending |
| 4xx errors | <1% | TBD | ⏳ Setup pending |
| Client errors | <5% | TBD | ⏳ Setup pending |

**0.1% error rate = 1 in 1,000 requests can fail**

### Performance Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| LCP (Largest Contentful Paint) | <2.5s | TBD | ⏳ Setup pending |
| FID (First Input Delay) | <100ms | TBD | ⏳ Setup pending |
| CLS (Cumulative Layout Shift) | <0.1 | TBD | ⏳ Setup pending |
| API Response Time (p95) | <1s | TBD | ⏳ Setup pending |

---

## Cost Summary

### Current Configuration

| Tool | Plan | Cost | Status |
|------|------|------|--------|
| UptimeRobot | Free (50 monitors) | $0/mo | ⏳ Setup pending |
| Sentry | Free (5K errors/mo) | $0/mo | ⏳ Setup pending |
| Vercel | Hobby (analytics included) | $0/mo | ✅ Active |
| **Total** | | **$0/mo** | |

### If Scaling Needed

| Tool | Plan | Cost | When to Upgrade |
|------|------|------|-----------------|
| UptimeRobot | Pro | $7/mo | Need <5min checks or global monitoring |
| Sentry | Team | $26/mo | >5K errors/month or need SMS alerts |
| Vercel | Pro | $20/mo | Need advanced analytics or more bandwidth |
| **Total** | | **$53/mo** | At ~1,000 users/day |

**Recommendation:** Start with free tier, upgrade when limits hit.

---

## Troubleshooting

### No alerts received

**Possible causes:**
1. Alert contact not verified → Check email for verification link
2. Alert threshold too high → Lower to 5 minutes downtime
3. Monitor paused → Resume in UptimeRobot dashboard
4. Slack webhook broken → Re-add integration

### False positives (frequent up/down)

**Possible causes:**
1. Vercel cold starts → Normal, increase threshold to 10 minutes
2. Network hiccups → UptimeRobot's monitoring location issue
3. Keyword changed → Update monitor keyword to match new copy

### Sentry not capturing errors

**Possible causes:**
1. Wrong DSN → Check env vars match Sentry project DSN
2. Sentry disabled → Check `sentry.client.config.ts`
3. Error happens before Sentry init → Move init earlier
4. Source maps not uploaded → Check `SENTRY_AUTH_TOKEN`

---

## Verification Scripts

### Verify all monitoring systems

```bash
npm run verify:monitoring
```

**Checks:**
- ✅ Health endpoint responding
- ✅ Sentry configuration valid
- ✅ UptimeRobot monitors active (if API key provided)
- ✅ Documentation present

### Test Sentry error tracking

```bash
curl https://taxbridge.vercel.app/api/test-sentry
```

**Expected:** Error appears in Sentry dashboard within 30 seconds

### Test health endpoint

```bash
curl https://taxbridge.vercel.app/api/health
```

**Expected:** `{"status":"healthy",...}` with 200 OK

---

## Next Steps

1. **Complete UptimeRobot setup** → See `docs/UPTIME_MONITORING_SETUP.md` (30 min)
2. **Complete Sentry setup** → See `docs/SENTRY_ERROR_TRACKING_SETUP.md` (20 min)
3. **Test alerts** → Trigger test alerts and verify delivery (10 min)
4. **Create runbooks** → Document response procedures for common issues (1 hour)
5. **Set up on-call rotation** → Who responds to alerts after hours? (30 min)

**Total setup time:** ~2.5 hours
**Maintenance:** ~15 min/week

---

## Resources

- UptimeRobot Dashboard: https://uptimerobot.com/dashboard
- Sentry Dashboard: https://sentry.io/organizations/taxbridge/
- Vercel Dashboard: https://vercel.com/taxbridge/cross-border-tax
- Public Status Page: https://status-taxbridge.uptimerobot.com

---

**Status:** 📋 Documentation complete, implementation pending
**Priority:** P2-MEDIUM (important for production stability)
**Estimated Setup:** 30-45 minutes total
