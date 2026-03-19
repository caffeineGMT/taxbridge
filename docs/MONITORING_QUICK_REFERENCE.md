# Production Monitoring - Quick Reference

**Last Updated:** March 19, 2026

---

## 🚀 Quick Start (1 Hour Setup)

### Step 1: UptimeRobot (30 min)
```bash
# 1. Sign up: https://uptimerobot.com
# 2. Create 4 monitors:
#    - Homepage: https://taxbridge.vercel.app
#    - Calculator: https://taxbridge.vercel.app/calculator
#    - API Health: https://taxbridge.vercel.app/api/health
#    - Pricing: https://taxbridge.vercel.app/pricing
# 3. Set alerts: Email + Slack
# 4. Test: Pause a monitor, verify alert fires
```

**Full guide:** `docs/UPTIME_MONITORING_SETUP.md`

---

### Step 2: Sentry (20 min)
```bash
# 1. Sign up: https://sentry.io
# 2. Create project: "cross-border-tax"
# 3. Get DSN: https://YOUR_KEY@sentry.io/...
# 4. Update Vercel env vars:
#    NEXT_PUBLIC_SENTRY_DSN=https://...
#    SENTRY_AUTH_TOKEN=sntrys_...
# 5. Redeploy: git push origin main
# 6. Test: curl https://taxbridge.vercel.app/api/test-sentry
```

**Full guide:** `docs/SENTRY_ERROR_TRACKING_SETUP.md`

---

### Step 3: Verify (5 min)
```bash
npm run verify:monitoring -- --production
# Expected: ✅ ALL MONITORING CHECKS PASSED
```

---

## 📊 Dashboards

| What | Where | Use For |
|------|-------|---------|
| **UptimeRobot** | https://uptimerobot.com/dashboard | Site up/down status |
| **Sentry** | https://sentry.io/organizations/taxbridge/ | Error tracking |
| **Vercel** | https://vercel.com/taxbridge/ | Deployments & logs |
| **Status Page** | https://status-taxbridge.uptimerobot.com | Public status |

---

## 🧪 Test Endpoints

```bash
# Health check
curl https://taxbridge.vercel.app/api/health
# Expected: {"status":"healthy", ...}

# Trigger test error (for Sentry)
curl https://taxbridge.vercel.app/api/test-sentry
# Expected: 500 error, appears in Sentry dashboard

# Verify monitoring
npm run verify:monitoring -- --production
```

---

## 🚨 Alert Response

### Site Down (UptimeRobot Alert)

**Alert:** "TaxBridge - Homepage is DOWN"

**Quick checks:**
```bash
# 1. Verify outage
curl -I https://taxbridge.vercel.app

# 2. Check Vercel
open https://vercel.com/taxbridge/cross-border-tax

# 3. Check Sentry for error spike
open https://sentry.io/organizations/taxbridge/
```

**If down:**
1. Check Vercel deployment logs
2. Look for build failures
3. Redeploy last known good version
4. Update status page

---

### Error Spike (Sentry Alert)

**Alert:** "New issue: Database connection failed (47 occurrences)"

**Quick checks:**
```bash
# 1. Open Sentry dashboard
open https://sentry.io/organizations/taxbridge/

# 2. Review stack trace
# 3. Check affected users count
# 4. Determine severity (4xx vs 5xx)
```

**If critical (5xx, >20 users affected):**
1. Review stack trace
2. Check recent deployments
3. Deploy hotfix if needed
4. Monitor error rate

---

## 📝 Daily Checklist (5 min)

```bash
# Morning check
1. Open UptimeRobot → All green?
2. Open Sentry → New critical errors?
3. Check Slack #alerts → Overnight incidents?
4. Review Vercel → Last deploy successful?
```

---

## 💰 Cost

| Tool | Plan | Limit | Cost |
|------|------|-------|------|
| UptimeRobot | Free | 50 monitors, 5-min checks | $0 |
| Sentry | Free | 5K errors/mo | $0 |
| Vercel | Hobby | Analytics included | $0 |
| **Total** | | | **$0/mo** |

**Upgrade when:** >1,000 users/day (~$53/mo total)

---

## 🎯 Success Metrics

| Metric | Target | How to Check |
|--------|--------|--------------|
| Uptime | >99.9% | UptimeRobot dashboard |
| Error rate | <0.1% | Sentry dashboard |
| Response time | <1s (p95) | UptimeRobot monitors |
| Time to detect | <5 min | Alert timestamps |
| Time to resolve | <30 min | Incident logs |

---

## 🔧 Common Issues

### No alerts received
```bash
# Check 1: Email verified?
# Check 2: Slack webhook working?
# Check 3: Alert threshold too high?
# Fix: Lower to 5 minutes downtime
```

### Sentry not capturing errors
```bash
# Check 1: DSN configured in Vercel?
# Check 2: Vercel redeployed after env var change?
# Fix: git push origin main (trigger redeploy)
```

### False positives (frequent up/down)
```bash
# Cause: Vercel cold starts
# Fix: Increase alert threshold to 10 minutes
```

---

## 📚 Full Documentation

1. **Setup Guides:**
   - `docs/UPTIME_MONITORING_SETUP.md` (UptimeRobot)
   - `docs/SENTRY_ERROR_TRACKING_SETUP.md` (Sentry)

2. **Dashboard Guide:**
   - `docs/MONITORING_DASHBOARD.md` (all tools)

3. **Executive Summary:**
   - `docs/MONITORING_SETUP_EXECUTIVE_SUMMARY.md`

4. **This Guide:**
   - `docs/MONITORING_QUICK_REFERENCE.md`

---

## 🚀 Commands

```bash
# Verify monitoring stack
npm run verify:monitoring
npm run verify:monitoring -- --production

# Test health endpoint
curl https://taxbridge.vercel.app/api/health

# Trigger test error
curl https://taxbridge.vercel.app/api/test-sentry

# Check production site
npm run verify:production
```

---

## 📞 Support

**UptimeRobot:**
- Dashboard: https://uptimerobot.com/dashboard
- Docs: https://uptimerobot.com/help/

**Sentry:**
- Dashboard: https://sentry.io/organizations/taxbridge/
- Docs: https://docs.sentry.io/

**Vercel:**
- Dashboard: https://vercel.com/taxbridge/
- Docs: https://vercel.com/docs

---

**Status:** ✅ Infrastructure ready, manual setup required
**Setup Time:** ~1 hour
**Maintenance:** ~15 min/week
**Cost:** $0/month (free tier)
