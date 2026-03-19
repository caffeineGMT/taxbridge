# Production Uptime Monitoring Setup Guide

**Status:** Ready to implement
**Priority:** P2-MEDIUM
**Estimated Time:** 30-45 minutes
**Production URL:** https://taxbridge.vercel.app

---

## Overview

This guide sets up external uptime monitoring for TaxBridge using UptimeRobot (free tier, 50 monitors). Monitors production site availability and sends alerts on downtime.

## Why External Monitoring?

**Internal monitoring (Sentry, Vercel) won't catch:**
- DNS failures
- Vercel platform outages
- Network routing issues
- Complete datacenter failures

**UptimeRobot monitors from external servers** → catches ALL failure modes.

---

## Step 1: Create UptimeRobot Account (5 minutes)

1. Visit: https://uptimerobot.com
2. Click "Free Sign Up"
3. Enter email: michael@taxbridge.app (or your email)
4. Verify email
5. Log in to dashboard

**Free tier includes:**
- 50 monitors
- 5-minute check intervals
- Email/SMS/Slack/webhook alerts
- 2-month log retention
- Status page (public or private)

---

## Step 2: Create Monitors (10 minutes)

### Monitor 1: Homepage Health Check

**Settings:**
```
Monitor Type: HTTP(s)
Friendly Name: TaxBridge - Homepage
URL: https://taxbridge.vercel.app
Monitoring Interval: 5 minutes
Monitor Timeout: 30 seconds
```

**Advanced Settings:**
```
Request Method: GET
Expected Status Code: 200
Keyword to Check: "Cross-Border Tax Calculator"
Alert When: Keyword Not Found
```

**Why keyword check?**
- Catches cases where Vercel returns 200 but shows error page
- Ensures actual content is rendering

---

### Monitor 2: Calculator Page

**Settings:**
```
Monitor Type: HTTP(s)
Friendly Name: TaxBridge - Calculator
URL: https://taxbridge.vercel.app/calculator
Monitoring Interval: 5 minutes
Monitor Timeout: 30 seconds
Expected Status Code: 200
Keyword to Check: "RSU Tax Calculator"
```

---

### Monitor 3: API Health Check

**Settings:**
```
Monitor Type: HTTP(s)
Friendly Name: TaxBridge - API Health
URL: https://taxbridge.vercel.app/api/health
Monitoring Interval: 5 minutes
Monitor Timeout: 30 seconds
Expected Status Code: 200
```

**Note:** You'll need to create `/api/health` endpoint (see Step 6)

---

### Monitor 4: Pricing/Checkout Page

**Settings:**
```
Monitor Type: HTTP(s)
Friendly Name: TaxBridge - Pricing
URL: https://taxbridge.vercel.app/pricing
Monitoring Interval: 5 minutes
Monitor Timeout: 30 seconds
Expected Status Code: 200
Keyword to Check: "Professional"
```

**Critical:** This catches checkout flow failures before users see them.

---

## Step 3: Configure Alert Contacts (5 minutes)

### Email Alerts

1. Go to "My Settings" → "Alert Contacts"
2. Click "Add Alert Contact"
3. Select type: "E-mail"
4. Enter email: your@email.com
5. Verify email
6. Set threshold: **Alert me when monitor is down**

### Slack Alerts (Recommended)

1. Create Slack webhook URL:
   - Go to https://api.slack.com/apps
   - Create new app → "Incoming Webhooks"
   - Activate webhooks
   - Add to #alerts channel
   - Copy webhook URL

2. In UptimeRobot:
   - Add Alert Contact → "Web-Hook"
   - Paste Slack webhook URL
   - POST as JSON
   - Threshold: Alert when down

**Slack message format:**
```json
{
  "text": "🚨 *PRODUCTION DOWN* 🚨\n*Monitor:* {{monitorFriendlyName}}\n*URL:* {{monitorURL}}\n*Reason:* {{alertDetails}}\n*Time:* {{alertDateTime}}"
}
```

---

## Step 4: Configure Alert Thresholds

**Recommended settings:**
```
Alert When Down For: 5 minutes (1 check)
Re-Alert If Down: Every 30 minutes
Send "Up" Notification: Yes (confirms recovery)
```

**Why 5 minutes?**
- Avoids false positives from brief network hiccups
- Catches real outages quickly
- Vercel restarts usually resolve within 2-3 minutes

---

## Step 5: Create Status Page (10 minutes)

**Public status page** → show users when there's an issue

1. Go to "Public Status Pages"
2. Click "Add New PSP"
3. Settings:
   ```
   Name: TaxBridge Status
   Friendly URL: taxbridge (becomes status-taxbridge.uptimerobot.com)
   Monitors: Select all 4 monitors
   Show Uptime: Last 7 days, Last 30 days
   Custom Domain: status.taxbridge.app (optional, requires DNS)
   ```

4. Customize appearance:
   ```
   Logo: Upload TaxBridge logo
   Custom CSS: Match brand colors
   Footer: "Need help? Email support@taxbridge.app"
   ```

5. Add to website:
   ```tsx
   // components/StatusBanner.tsx
   export function StatusBanner() {
     return (
       <Link
         href="https://status-taxbridge.uptimerobot.com"
         className="text-xs text-muted-foreground"
       >
         System Status ✅
       </Link>
     );
   }
   ```

---

## Step 6: Create API Health Endpoint (5 minutes)

UptimeRobot needs a `/api/health` endpoint to monitor API availability.

**Create:** `app/api/health/route.ts`

```typescript
import { NextResponse } from 'next/server';

/**
 * Health check endpoint for external monitoring (UptimeRobot, Pingdom)
 *
 * Returns 200 OK if:
 * - Server is running
 * - Database is accessible
 * - Core services are healthy
 *
 * Returns 503 Service Unavailable if critical services are down
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // Check database connectivity
    const db = await import('@/lib/db');
    await db.getDatabase().prepare('SELECT 1').get();

    // Check Stripe API availability (optional, adds latency)
    // const stripe = await import('@/lib/stripe');
    // await stripe.stripe.accounts.retrieve();

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      checks: {
        database: 'ok',
        server: 'ok',
      },
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
```

**Test locally:**
```bash
npm run dev
curl http://localhost:3000/api/health
# Expected: {"status":"healthy", ...}
```

**Test production:**
```bash
curl https://taxbridge.vercel.app/api/health
# Expected: 200 OK
```

---

## Step 7: Test Alerts (5 minutes)

### Trigger Test Alert

**Method 1: Pause Monitor**
1. In UptimeRobot dashboard
2. Find any monitor
3. Click "..." → "Pause"
4. Wait 5 minutes
5. Check email/Slack for alert
6. Resume monitor
7. Check email/Slack for "UP" notification

**Method 2: Break Keyword**
1. Temporarily change keyword to "WILL_NOT_MATCH_ANYTHING"
2. Wait 5 minutes
3. Check alerts
4. Restore correct keyword

**Expected alerts:**
- 🚨 Email: "TaxBridge - Homepage is DOWN"
- 🚨 Slack: Red notification in #alerts
- ✅ Email: "TaxBridge - Homepage is UP"
- ✅ Slack: Green notification in #alerts

---

## Step 8: Configure Advanced Monitoring (Optional)

### SSL Certificate Monitoring

**Monitor SSL expiry:**
```
Monitor Type: HTTP(s)
Alert When: SSL certificate expires in 7 days
```

Vercel auto-renews SSL, but good to catch issues early.

### Response Time Tracking

**Set performance baseline:**
```
Alert When: Response time > 3 seconds for 3 consecutive checks
```

Catches performance degradation before users complain.

### Geographic Monitoring (Paid Tier)

**Monitor from multiple regions:**
- US East (free tier only checks from here)
- Europe (paid)
- Asia (paid)

**Upgrade to Pro if:**
- You have international users
- Need <5 minute check intervals
- Want custom status page domain

---

## Step 9: Integration with Sentry (See SENTRY_ERROR_TRACKING_SETUP.md)

**UptimeRobot + Sentry = Complete Monitoring**

| Tool | Monitors | Alerts On |
|------|----------|-----------|
| UptimeRobot | External availability | Site down, slow response |
| Sentry | Application errors | 500 errors, exceptions, crashes |
| Vercel Analytics | Traffic & performance | Build failures, function timeouts |

**All three are complementary** → catch different failure modes.

---

## Verification Checklist

After setup, verify:

- [ ] 4 monitors active in UptimeRobot dashboard
- [ ] All monitors showing "Up" (green)
- [ ] Email alert contact verified
- [ ] Slack alert contact added (optional)
- [ ] Test alert sent and received
- [ ] Status page accessible at status-taxbridge.uptimerobot.com
- [ ] `/api/health` endpoint returns 200 OK
- [ ] Keyword checks passing (view monitor details)

---

## Ongoing Maintenance

### Daily
- Check UptimeRobot dashboard for any red monitors
- Review downtime incidents in Slack #alerts

### Weekly
- Review uptime % (target: 99.9%+)
- Check response time trends
- Verify all monitors still active

### Monthly
- Review alert history
- Update keywords if site copy changes
- Audit monitor list (add new critical pages)

---

## Cost Breakdown

**Free Tier (Current):**
- 50 monitors
- 5-minute checks
- Email + Slack alerts
- 2-month logs
- **Cost: $0/month**

**Pro Tier (If Needed):**
- 1-minute checks
- Geographic monitoring
- Custom status page domain
- SMS alerts
- **Cost: $7/month**

**Recommendation:** Start with free tier. Upgrade only if you need <5min checks or global monitoring.

---

## Troubleshooting

### Monitor shows "Down" but site is accessible

**Cause:** Keyword not found (page changed)
**Fix:** Update keyword in monitor settings

### No alerts received

**Cause:** Alert contact not verified
**Fix:** Check email for verification link, re-verify

### False positives (frequent up/down)

**Cause:** Vercel cold starts or network hiccups
**Fix:** Increase "Alert when down for" threshold to 10 minutes

### Status page not loading

**Cause:** PSP not published
**Fix:** Go to PSP settings → ensure "Status" is "Active"

---

## Next Steps

1. **Set up Sentry error tracking** → See `SENTRY_ERROR_TRACKING_SETUP.md`
2. **Configure alert escalation** → Email → Slack → SMS for critical issues
3. **Add dashboard widget** → Embed UptimeRobot widget on admin panel
4. **Set up runbook** → Document response procedures for common outages

---

## Resources

- UptimeRobot Dashboard: https://uptimerobot.com/dashboard
- Status Page: https://status-taxbridge.uptimerobot.com
- API Documentation: https://uptimerobot.com/api/
- Slack Integration: https://uptimerobot.com/help/slack-integration/

---

**Implementation Status:** ⏳ Pending (follow this guide)
**Estimated Setup Time:** 30-45 minutes
**Priority:** P2-MEDIUM (important for production, not revenue-blocking)

Ready to proceed? Start with Step 1 above. ✅
