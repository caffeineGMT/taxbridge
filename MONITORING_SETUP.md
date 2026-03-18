# TaxBridge Monitoring & Analytics Setup

Complete guide for production monitoring, uptime tracking, and performance analytics.

## Overview

TaxBridge uses a multi-layered monitoring approach:

1. **Vercel Analytics** - Speed Insights + Web Analytics (built-in)
2. **Web Vitals Tracking** - Core Web Vitals (CLS, FID, LCP) to SQLite
3. **UptimeRobot** - External uptime monitoring with 5-minute checks
4. **Cloudflare** - DDoS protection, CDN caching, and edge analytics
5. **Health Endpoints** - `/api/health` for monitoring integrations
6. **Status Page** - Public `/status` page showing uptime and incidents

---

## 1. Vercel Analytics Setup

### Enable in Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com)
2. Select your `taxbridge` project
3. Navigate to **Analytics** tab
4. Enable **Speed Insights** (Core Web Vitals, Real User Monitoring)
5. Enable **Web Analytics** (Pageviews, Unique Visitors, Top Pages)

### Verify Integration

- ✅ Already added: `<Analytics />` component in `app/layout.tsx`
- ✅ Automatic tracking on all pages
- View metrics: Vercel Dashboard → Analytics → Speed/Web

**Expected Metrics:**
- LCP (Largest Contentful Paint): < 2.5s ✅
- FID (First Input Delay): < 100ms ✅
- CLS (Cumulative Layout Shift): < 0.1 ✅

---

## 2. Web Vitals Tracking (Custom SQLite Analytics)

### Already Implemented

- ✅ `lib/vitals.ts` - Web Vitals collection (CLS, FID, LCP, FCP, TTFB)
- ✅ `app/api/analytics/vitals/route.ts` - API endpoint for vitals data
- ✅ `components/WebVitalsTracker.tsx` - Client-side tracker
- ✅ SQLite `analytics_events` table stores all metrics

### How It Works

1. Client-side component tracks Core Web Vitals
2. Sends data to `/api/analytics/vitals` endpoint
3. Stored in SQLite database with rating (good/needs-improvement/poor)
4. Queryable via GET `/api/analytics/vitals?days=7&metric=LCP`

### Query Vitals Data

```bash
# Get all vitals from last 7 days
curl https://taxbridge.app/api/analytics/vitals?days=7

# Get specific metric
curl https://taxbridge.app/api/analytics/vitals?days=30&metric=LCP
```

**Response includes:**
- Percentiles (p50, p75, p95)
- Rating distribution (good/needs-improvement/poor)
- Min/max/avg values

---

## 3. UptimeRobot Setup

### Create Account

1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Sign up for free account (50 monitors, 5-minute intervals)
3. Verify email

### Add Monitors (5-minute intervals)

#### Monitor 1: Homepage
- **Type:** HTTP(s)
- **Friendly Name:** TaxBridge - Homepage
- **URL:** `https://taxbridge.app`
- **Monitoring Interval:** 5 minutes
- **Monitor Timeout:** 30 seconds
- **Alert When:** Down

#### Monitor 2: API Health Check
- **Type:** HTTP(s)
- **Friendly Name:** TaxBridge - API Health
- **URL:** `https://taxbridge.app/api/health`
- **Monitoring Interval:** 5 minutes
- **Monitor Timeout:** 30 seconds
- **Alert When:** Down
- **Advanced:** Check for keyword `"status":"ok"` in response

#### Monitor 3: Dashboard (Auth Required)
- **Type:** HTTP(s)
- **Friendly Name:** TaxBridge - Dashboard
- **URL:** `https://taxbridge.app/dashboard`
- **Monitoring Interval:** 5 minutes
- **Expected Status Code:** 401 (Unauthorized - this is correct when signed out)
- **Alert When:** Status code is NOT 200/401

#### Monitor 4: Database Connection
- **Type:** Keyword
- **Friendly Name:** TaxBridge - Database
- **URL:** `https://taxbridge.app/api/health`
- **Keyword:** `"connected":true`
- **Monitoring Interval:** 5 minutes
- **Alert When:** Keyword not found

#### Monitor 5: Status Page
- **Type:** HTTP(s)
- **Friendly Name:** TaxBridge - Status Page
- **URL:** `https://taxbridge.app/status`
- **Monitoring Interval:** 5 minutes
- **Alert When:** Down

### Configure Alert Contacts

#### Email Alerts
1. Go to **My Settings** → **Alert Contacts**
2. Add email: `your-email@example.com`
3. Set threshold: Alert after **2 consecutive failures** (10 minutes down)
4. Verify email

#### SMS Alerts (Twilio Integration)
1. Create Twilio account: [twilio.com](https://www.twilio.com)
2. Get phone number and API credentials
3. In UptimeRobot: **Alert Contacts** → **Add Alert Contact**
4. Choose **SMS** → Enter Twilio credentials
5. Add phone number: `+1-XXX-XXX-XXXX`
6. Set threshold: Alert after **2 consecutive failures**

### Alert Settings Recommendation

```
✅ Email: Send on every down/up event
✅ SMS: Send only after 2 consecutive failures (avoid false alarms)
✅ Recovery Alerts: Enable (notify when service recovers)
✅ Daily/Weekly Reports: Enable weekly summary
```

### Public Status Page (Optional)

1. Go to **My Settings** → **Public Status Pages**
2. Create new status page
3. Select all 5 monitors
4. Customize subdomain: `taxbridge-status.uptimerobot.com`
5. Embed in TaxBridge `/status` page (iframe or API)

---

## 4. Cloudflare Setup

### Create Account & Add Domain

1. Sign up at [cloudflare.com](https://cloudflare.com)
2. Choose **Free** plan
3. Add site: `taxbridge.app`
4. Cloudflare scans DNS records

### Update DNS Records

1. Copy Cloudflare nameservers (e.g., `ns1.cloudflare.com`)
2. Go to your domain registrar (Namecheap, GoDaddy, etc.)
3. Replace nameservers with Cloudflare's
4. Wait for propagation (up to 24 hours)

### Configure DNS in Cloudflare

#### Vercel Integration
1. Add **A** record: `@` → Vercel IP (from Vercel Dashboard)
2. Add **CNAME** record: `www` → `taxbridge.app`
3. **Enable Proxy** (orange cloud ☁️) for both records

**Note:** Vercel handles SSL automatically. Cloudflare provides additional DDoS protection.

### Enable DDoS Protection

1. Go to **Security** → **DDoS**
2. **Mode:** Automatic (recommended)
3. Enable **Rate Limiting** (optional, for API routes)
   - Rule: `/api/*` → Max 100 requests/minute per IP
   - Action: Block for 1 hour

### Configure Caching

#### Page Rules (3 free rules)

**Rule 1: Cache Static Assets**
- **URL:** `taxbridge.app/*.{js,css,jpg,png,svg,woff,woff2}`
- **Settings:**
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
  - Browser Cache TTL: 1 day

**Rule 2: Bypass Cache for API**
- **URL:** `taxbridge.app/api/*`
- **Settings:**
  - Cache Level: Bypass

**Rule 3: Bypass Cache for Dashboard**
- **URL:** `taxbridge.app/dashboard*`
- **Settings:**
  - Cache Level: Bypass

### SSL/TLS Settings

1. Go to **SSL/TLS** → **Overview**
2. Set encryption mode: **Full (strict)**
3. Enable **Always Use HTTPS**
4. Enable **Automatic HTTPS Rewrites**

### Firewall Rules (Optional)

**Geo-blocking** (if TaxBridge is US/Canada only):
- Block countries outside North America
- Reduces bot traffic and DDoS risk

**Bot Fight Mode:**
- Enable under **Security** → **Bots**
- Automatically challenges known bad bots

---

## 5. Health Check Endpoint

### Endpoint: `/api/health`

Already implemented in `app/api/health/route.ts`

**Features:**
- ✅ Returns `200 OK` if healthy
- ✅ Returns `503 Service Unavailable` if database down
- ✅ Includes database connection test
- ✅ Shows response time and uptime
- ✅ Supports `HEAD` requests (lightweight)

### Test Locally

```bash
# Full health check
curl http://localhost:3000/api/health

# Lightweight HEAD request
curl -I http://localhost:3000/api/health
```

### Test Production

```bash
curl https://taxbridge.app/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-18T20:00:00.000Z",
  "uptime": 12345.67,
  "database": {
    "connected": true,
    "responseTime": "8ms"
  },
  "responseTime": "15ms",
  "version": "1.0.0",
  "environment": "production"
}
```

---

## 6. Status Page

### Public URL

- **Live:** `https://taxbridge.app/status`
- **No authentication required** - publicly accessible

### Features

- ✅ Real-time system status
- ✅ 30-day uptime percentage
- ✅ Component health (Web App, API, Database, Auth, Payments)
- ✅ 7-day response time chart
- ✅ Recent incidents (last 90 days)

### Data Sources (Production Integration)

Currently uses mock data. To integrate with UptimeRobot API:

1. Get UptimeRobot API key: **My Settings** → **API Settings**
2. Add to `.env.local`:
   ```bash
   UPTIMEROBOT_API_KEY=u123456-abcdef1234567890
   ```
3. Update `app/status/page.tsx` to fetch from UptimeRobot API:
   ```typescript
   const response = await fetch('https://api.uptimerobot.com/v2/getMonitors', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       api_key: process.env.UPTIMEROBOT_API_KEY,
       format: 'json',
     }),
   });
   ```

---

## 7. Acceptance Criteria

### ✅ Vercel Dashboard Shows:
- LCP < 2.5s (Largest Contentful Paint)
- FID < 100ms (First Input Delay)
- CLS < 0.1 (Cumulative Layout Shift)
- 95th percentile response time < 1s

### ✅ UptimeRobot Shows:
- 99.9%+ uptime (30-day average)
- All 5 monitors reporting "Up"
- Alert contacts configured (email + SMS)
- Recovery notifications enabled

### ✅ Cloudflare Shows:
- DNS proxied (orange cloud ☁️)
- SSL/TLS: Full (strict)
- Cache hit ratio > 80% for static assets
- DDoS protection active

### ✅ Status Page (`/status`) Shows:
- "All Systems Operational" message
- 99.9%+ uptime displayed
- Response time chart (last 7 days)
- All components marked "operational"
- No incidents in last 90 days (if clean deployment)

### ✅ Health Endpoint (`/api/health`) Returns:
- `200 OK` status
- `"status": "ok"`
- `"database.connected": true`
- Response time < 100ms

---

## 8. Monitoring Checklist

### Daily Checks
- [ ] Vercel Analytics: No spike in errors
- [ ] UptimeRobot: All monitors green
- [ ] Cloudflare: No attacks blocked (check Security Center)

### Weekly Checks
- [ ] Review Web Vitals trends (LCP, FID, CLS)
- [ ] Check uptime percentage (should be 99.9%+)
- [ ] Review Cloudflare cache hit ratio (should be 80%+)
- [ ] Check for any incidents or downtime

### Monthly Checks
- [ ] Review and archive old incidents
- [ ] Update status page with new features
- [ ] Test alert notifications (trigger test alert)
- [ ] Review and optimize Cloudflare cache rules

---

## 9. Incident Response Workflow

### When Alert Fires (Email/SMS)

1. **Acknowledge** - Log into UptimeRobot, check which monitor failed
2. **Investigate** - Check `/api/health`, review Vercel logs
3. **Diagnose** - Database connection? API error? Deployment issue?
4. **Communicate** - Update status page with incident details
5. **Resolve** - Fix underlying issue, verify monitors return to "Up"
6. **Post-mortem** - Document incident, duration, root cause, resolution

### Example Incident Update

On `/status` page:
```typescript
{
  title: 'Database Connection Timeout',
  description: 'Temporary database connection issues affecting API responses. Investigating root cause.',
  date: '2026-03-18',
  severity: 'major',
  resolved: false,
  duration: null, // Updated when resolved
}
```

---

## 10. Cost Breakdown

| Service | Plan | Cost | Features |
|---------|------|------|----------|
| Vercel Analytics | Pro | $20/mo | Speed Insights, Web Analytics |
| UptimeRobot | Free | $0 | 50 monitors, 5-min intervals |
| Cloudflare | Free | $0 | DDoS protection, CDN, SSL |
| Twilio SMS | Pay-as-you-go | ~$0.0075/SMS | Alert notifications |

**Total Monthly Cost:** ~$20-25/mo (assuming 50-100 SMS alerts/month)

---

## 11. Advanced Features (Future)

### Real-Time Monitoring Dashboard
- Build admin dashboard at `/admin/monitoring`
- Display live Web Vitals, API response times, uptime
- Integrate Chart.js or Recharts for graphs

### Error Tracking (Sentry Integration)
- Track JavaScript errors, unhandled exceptions
- Monitor API error rates (4xx, 5xx)
- Set up error budgets (e.g., < 1% error rate)

### Performance Budgets
- Set thresholds: LCP < 2s, bundle size < 200KB
- Fail CI/CD if budgets exceeded
- Lighthouse CI integration

### SLA Monitoring
- Target: 99.9% uptime = 43 minutes downtime/month
- Track SLA compliance monthly
- Automatic credits/refunds if SLA missed (Enterprise plan)

---

## 12. Support & Troubleshooting

### Common Issues

**Issue:** Web Vitals not tracking
- **Fix:** Check Network tab, ensure `/api/analytics/vitals` returns 200
- **Fix:** Verify `components/WebVitalsTracker.tsx` is rendered

**Issue:** UptimeRobot false alarms
- **Fix:** Increase timeout from 30s to 60s
- **Fix:** Change alert threshold to 3 consecutive failures (15 minutes)

**Issue:** Cloudflare breaks Vercel deployment
- **Fix:** Disable Cloudflare proxy (grey cloud) for Vercel domains
- **Fix:** Use Vercel's built-in SSL, Cloudflare as DNS-only

**Issue:** `/api/health` returns 503
- **Fix:** Check database file exists: `data/taxbridge.db`
- **Fix:** Verify database permissions (read/write)
- **Fix:** Check Vercel function logs for SQLite errors

### Contact Support
- **Vercel:** [vercel.com/support](https://vercel.com/support)
- **UptimeRobot:** support@uptimerobot.com
- **Cloudflare:** Community Forums or Support Ticket (Pro plan required)

---

## Summary

✅ **Vercel Analytics** installed and tracking Core Web Vitals
✅ **Web Vitals Tracker** sending data to SQLite analytics
✅ **Health Endpoint** (`/api/health`) ready for monitoring
✅ **Status Page** (`/status`) shows uptime and incidents
📋 **UptimeRobot** setup guide provided (5-minute monitors)
📋 **Cloudflare** setup guide provided (DDoS + caching)

**Next Steps:**
1. Deploy to Vercel production
2. Enable Vercel Analytics in dashboard
3. Create UptimeRobot account and add 5 monitors
4. Configure Cloudflare DNS and enable proxy mode
5. Test all endpoints and verify monitoring alerts
6. Set 99.9% uptime goal and track monthly compliance

**Zero Downtime = Zero Lost Revenue** 🚀
