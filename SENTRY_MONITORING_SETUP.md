# Sentry Error Tracking & Monitoring Setup

Complete implementation of production-grade error tracking, structured logging, and performance monitoring for TaxBridge.

## 🎯 Overview

**Implemented Features:**
- ✅ Sentry error tracking with source maps
- ✅ Performance monitoring (transactions & spans)
- ✅ Structured logging with Pino
- ✅ Custom error boundaries (app-level & global)
- ✅ API route instrumentation (critical routes wrapped)
- ✅ Automatic release tracking via Vercel Git SHA
- ✅ Client & server-side monitoring
- ✅ Session replay for debugging

**Critical Routes Monitored:**
1. `/api/rsu/bulk` - Bulk RSU import (CRITICAL)
2. `/api/ai/tax-advice` - AI tax advisor streaming (HIGH)
3. `/api/stripe/webhook` - Stripe payment webhooks (CRITICAL)

---

## 📦 Installation & Configuration

### 1. Install Dependencies

```bash
npm install @sentry/nextjs pino pino-pretty
```

### 2. Create Sentry Project

1. Go to [sentry.io](https://sentry.io) and create an account
2. Create a new project:
   - Platform: **Next.js**
   - Project name: `cross-border-tax` (or `taxbridge`)
   - Organization slug: `taxbridge`

3. Copy your **DSN** from project settings
   - Format: `https://abc123@o0000000.ingest.sentry.io/0000000`

### 3. Generate Auth Token

1. Navigate to: **Settings > Auth Tokens**
2. Click **Create New Token**
3. Configure:
   - Name: `TaxBridge Production`
   - Scopes: `project:write`, `project:releases`
4. Copy the token (starts with `sntrys_`)

### 4. Set Environment Variables

**Local Development (`.env.local`):**
```bash
NEXT_PUBLIC_SENTRY_DSN=https://your-key@o0000000.ingest.sentry.io/0000000
SENTRY_AUTH_TOKEN=sntrys_your_auth_token_here
SENTRY_ORG=taxbridge
SENTRY_PROJECT=cross-border-tax
```

**Vercel Production:**

Add these to Vercel project settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_SENTRY_DSN` | Your Sentry DSN | Production, Preview |
| `SENTRY_AUTH_TOKEN` | Your auth token | Production, Preview |
| `SENTRY_ORG` | `taxbridge` | Production, Preview |
| `SENTRY_PROJECT` | `cross-border-tax` | Production, Preview |

**Note:** Vercel automatically provides `VERCEL_GIT_COMMIT_SHA` and `VERCEL_ENV` for release tracking.

---

## 🚨 Alert Configuration

### Email Alerts

1. Go to: **Project Settings > Alerts**
2. Click **Create Alert Rule**

**Alert 1: High Error Rate**
```yaml
Alert Name: High Error Rate - Production
Trigger:
  - When: Error count
  - Is above: 10 errors
  - In: 5 minutes
Filter:
  - Environment: production
Actions:
  - Send email to: your-email@example.com
```

**Alert 2: Critical Route Failures**
```yaml
Alert Name: Payment/Import Failures
Trigger:
  - When: Error count
  - Is above: 1 error
  - In: 1 minute
Filter:
  - Environment: production
  - Tags: level = "critical"
Actions:
  - Send email to: your-email@example.com
```

### Slack Integration

1. Go to: **Settings > Integrations**
2. Find **Slack** and click **Install**
3. Authorize Sentry to access your Slack workspace
4. Configure channel routing:
   - `#alerts-production` → All production errors
   - `#alerts-critical` → Only `level:critical` tagged errors

5. Create alert rule for Slack:
```yaml
Alert Name: P0 Errors to Slack
Trigger:
  - When: Error count
  - Is above: 1 error
  - In: 1 minute
Filter:
  - Environment: production
  - Tags: level = "critical"
Actions:
  - Send Slack notification to: #alerts-critical
```

---

## 🧪 Testing Error Tracking

### Create Test Error Route

Create `/app/api/test-sentry/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function GET(request: NextRequest) {
  // Capture a test message
  Sentry.captureMessage('Sentry test message - everything is working!', 'info');

  // Trigger test error
  throw new Error('Sentry test error - monitoring is active!');
}
```

### Test Error Capture

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Trigger test error:**
   ```bash
   curl http://localhost:3000/api/test-sentry
   ```

3. **Verify in Sentry:**
   - Go to your Sentry dashboard
   - Navigate to **Issues**
   - You should see: `Error: Sentry test error - monitoring is active!`
   - Click to see full stack trace with source maps

4. **Verify alert fires:**
   - Within 60 seconds, you should receive:
     - Email notification (if configured)
     - Slack notification (if configured)

### Test Client-Side Error

Add to any page temporarily:

```tsx
<button onClick={() => {
  throw new Error('Client-side test error');
}}>
  Test Sentry (Client)
</button>
```

Click the button → Error should appear in Sentry with session replay.

---

## 📊 Performance Monitoring

### Viewing Performance Data

1. Go to **Performance** tab in Sentry
2. You'll see transactions for:
   - `POST /api/rsu/bulk`
   - `POST /api/ai/tax-advice`
   - `POST /api/stripe/webhook`

### Transaction Details

Each transaction includes:
- **Total Duration:** End-to-end request time
- **Spans:** Breakdown of internal operations
  - Database queries
  - External API calls (Anthropic, Stripe)
  - Processing time

### Slow Transaction Alerts

Configure performance alerts:

```yaml
Alert Name: Slow API Responses
Trigger:
  - When: p95 response time
  - Is above: 2000ms
  - In: 10 minutes
Filter:
  - Environment: production
  - Transaction: /api/rsu/bulk
Actions:
  - Send email notification
```

---

## 📝 Structured Logging

### Log Levels

```typescript
import { logger } from '@/lib/logger';

// INFO - Normal operations
logger.info('User upgraded', {
  userId: '123',
  tier: 'pro',
  duration: 250,
});

// WARN - Unexpected but handled
logger.warn('Rate limit approaching', {
  userId: '123',
  remaining: 5,
});

// ERROR - Failures requiring attention
logger.error('Payment failed', {
  userId: '123',
  error: new Error('Card declined'),
  amount: 99.00,
});

// DEBUG - Development only
logger.debug('Cache miss', { key: 'user:123' });
```

### Viewing Logs

**Local Development:**
- Logs appear in terminal with color-coded levels
- Pretty-printed with timestamps

**Vercel Production:**
- Go to Vercel Dashboard → Your Project → Logs
- All logs captured automatically from stdout
- Filter by:
  - Request ID (trace requests across services)
  - User ID (find all actions by specific user)
  - Log level (error, warn, info)

---

## 🔍 Debugging with Source Maps

Sentry automatically uploads source maps during build (configured in `next.config.ts`).

**Verify Source Maps:**

1. Go to Sentry issue
2. Click on stack trace
3. You should see:
   - ✅ Original TypeScript code (not minified)
   - ✅ Line numbers matching your source files
   - ✅ Variable names preserved

**Troubleshooting:**

If source maps don't work:

```bash
# Check auth token is set
echo $SENTRY_AUTH_TOKEN

# Manually upload (if needed)
npm run build
# Source maps upload automatically during build
```

---

## 📈 Key Metrics to Monitor

### Error Metrics

1. **Error Rate:** `errors / requests`
   - Target: <0.1% (1 error per 1000 requests)
   - Alert threshold: >1% in 5min window

2. **Unhandled Errors:** Errors not caught by try/catch
   - Target: 0
   - Alert immediately

3. **User-Affecting Errors:** Errors visible to users
   - Target: <0.01%
   - P0 alert

### Performance Metrics

1. **API Response Time (p95):**
   - `/api/rsu/bulk`: <2s (target <1s)
   - `/api/ai/tax-advice`: <5s (streaming, first byte)
   - `/api/stripe/webhook`: <500ms

2. **Database Query Time:**
   - Bulk insert: <1s for 1000 rows
   - Single query: <50ms

3. **External API Time:**
   - Anthropic Claude: 2-5s (streaming)
   - Stripe API: <500ms
   - Bank of Canada: <300ms

---

## 🚀 Production Deployment Checklist

Before deploying to production:

- [ ] Sentry project created
- [ ] DSN and auth token added to Vercel env vars
- [ ] Test error captured successfully
- [ ] Email alerts configured (error rate >1%)
- [ ] Slack integration set up (critical errors)
- [ ] Source maps uploading correctly
- [ ] Performance monitoring enabled
- [ ] Alert test passed (trigger test error → alert fires <60s)

---

## 💰 Sentry Pricing

**Free Tier:**
- 5,000 errors/month
- 10,000 performance transactions/month
- 50 session replays/month
- 90-day retention

**Recommended for Production:**
- **Team Plan:** $26/month
  - 50,000 errors/month
  - 100,000 transactions/month
  - 500 replays/month
  - 90-day retention

**Estimate for TaxBridge:**
- Projected users: 10,000 MAU
- Error budget: 0.1% error rate = ~100 errors/month
- Transactions: 100K/month (well within free tier)
- **Cost:** $0 (free tier sufficient for first 6 months)

---

## 📚 Additional Resources

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Performance Monitoring Guide](https://docs.sentry.io/product/performance/)
- [Alert Rules Documentation](https://docs.sentry.io/product/alerts/)
- [Pino Logger Docs](https://getpino.io/)

---

## ✅ Implementation Complete

All monitoring infrastructure is now in place:

1. ✅ Sentry SDK installed and configured
2. ✅ Error boundaries on all pages
3. ✅ Critical API routes instrumented
4. ✅ Structured logging with Pino
5. ✅ Performance monitoring enabled
6. ✅ Source map uploading configured
7. ✅ Alert infrastructure ready

**Next Steps:**
1. Create Sentry account
2. Add DSN to Vercel environment variables
3. Configure Slack webhook
4. Deploy to production
5. Trigger test error to verify alerts fire
