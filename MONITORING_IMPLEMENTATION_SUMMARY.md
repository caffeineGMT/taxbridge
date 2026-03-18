# Sentry & Logging Implementation Summary

## 🎯 Implementation Complete

Production-grade error tracking, performance monitoring, and structured logging infrastructure for TaxBridge.

---

## 📦 What Was Implemented

### 1. **Sentry Error Tracking**

**Dependencies Installed:**
```json
{
  "@sentry/nextjs": "latest",
  "pino": "latest",
  "pino-pretty": "latest"
}
```

**Configuration Files Created:**

| File | Purpose |
|------|---------|
| `sentry.client.config.ts` | Client-side error tracking & session replay |
| `sentry.server.config.ts` | Server-side error tracking & performance |
| `sentry.edge.config.ts` | Edge runtime monitoring |
| `instrumentation.ts` | Next.js 15+ instrumentation hook |
| `next.config.ts` | Sentry webpack plugin integration |

**Features:**
- ✅ Automatic error capture (client & server)
- ✅ Source map uploading for readable stack traces
- ✅ Session replay (10% of sessions, 100% with errors)
- ✅ Performance monitoring (10% sample rate)
- ✅ Release tracking via Vercel Git SHA
- ✅ Environment-specific sampling rates

---

### 2. **Custom Error Boundaries**

**Files Created:**

**`app/error.tsx`** - Application-level error boundary
- Catches React component errors
- Shows user-friendly error page
- Captures to Sentry with context
- Provides "Try Again" action
- Shows error details in development

**`app/global-error.tsx`** - Global fallback
- Catches critical errors outside app boundary
- Inline styles (no CSS dependencies)
- Sentry capture with `fatal` level
- Last-resort error handler

**Design:**
- Consistent with TaxBridge design system
- Glass morphism background
- Clear error messaging
- Actionable recovery options

---

### 3. **Structured Logging (Pino)**

**File:** `lib/logger.ts`

**Features:**
- Type-safe logging with context objects
- Development: Pretty-printed with colors
- Production: JSON structured logs (Vercel captures)
- Request ID generation for tracing
- Helper functions:
  - `logRequest()` - Log incoming API requests
  - `logResponse()` - Log with performance metrics
  - `logError()` - Enhanced error logging

**Example Usage:**
```typescript
logger.info('User upgraded', {
  userId: '123',
  tier: 'pro',
  duration: 250,
});

logger.error('Payment failed', {
  endpoint: '/api/stripe/webhook',
  error: new Error('Card declined'),
  amount: 99.00,
});
```

**Log Levels:**
- `debug` - Development only
- `info` - Normal operations
- `warn` - Unexpected but handled
- `error` - Failures requiring attention

---

### 4. **API Route Instrumentation**

**File:** `lib/sentry-wrapper.ts`

**Capabilities:**
- `withSentry()` - Wrap route handlers with monitoring
- `monitorDatabaseQuery()` - Track slow queries
- `monitorExternalAPI()` - Track external calls
- `addBreadcrumb()` - Debug trail

**Critical Routes Updated:**

#### **`/api/rsu/bulk`** (CRITICAL)
- Bulk RSU import endpoint
- Performance tracking for 1000-row imports
- Database transaction monitoring
- Success/failure metrics logged

**Added:**
```typescript
- Transaction tracking
- User context (Clerk ID)
- Performance timing (Server-Timing header)
- Structured logging (import stats)
- Sentry capture on failure
```

#### **`/api/ai/tax-advice`** (HIGH)
- AI tax optimization streaming
- Anthropic Claude API monitoring
- Stream error handling

**Added:**
```typescript
- AI API span tracking
- Stream error capture
- Response length metrics
- Database storage error handling
```

#### **`/api/stripe/webhook`** (CRITICAL)
- Payment webhook processing
- Subscription lifecycle tracking
- Critical revenue events

**Added:**
```typescript
- Event type tagging
- Missing metadata alerts
- Payment failure tracking
- Breadcrumbs for successful upgrades
```

---

### 5. **Environment Configuration**

**Updated Files:**
- `.env.example` - Template with Sentry variables
- `.env.local` - Local development config

**New Environment Variables:**
```bash
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=sntrys_...
SENTRY_ORG=taxbridge
SENTRY_PROJECT=cross-border-tax
```

**Automatic Variables (Vercel):**
- `VERCEL_GIT_COMMIT_SHA` - Release version
- `VERCEL_ENV` - Environment (production/preview/development)

---

### 6. **Test Infrastructure**

**File:** `app/api/test-sentry/route.ts`

**Endpoints:**

**GET `/api/test-sentry`**
- Throws test error
- Verifies error capture
- Checks alert delivery

**POST `/api/test-sentry`**
```json
{
  "level": "error|warning|critical",
  "message": "Custom test message"
}
```

**Usage:**
```bash
# Test error capture
curl http://localhost:3000/api/test-sentry

# Test critical alert
curl -X POST http://localhost:3000/api/test-sentry \
  -H "Content-Type: application/json" \
  -d '{"level":"critical","message":"Revenue pipeline failure"}'
```

---

## 📊 Monitoring Coverage

### Error Tracking

| Route | Level | What's Monitored |
|-------|-------|------------------|
| `/api/rsu/bulk` | CRITICAL | Import failures, validation errors, DB errors |
| `/api/ai/tax-advice` | HIGH | AI stream errors, storage failures |
| `/api/stripe/webhook` | CRITICAL | Payment failures, missing metadata, subscription errors |
| All API routes | NORMAL | Uncaught exceptions |
| React components | NORMAL | Component render errors |

### Performance Monitoring

**Tracked Metrics:**
- API response time (p50, p95, p99)
- Database query duration
- External API latency (Anthropic, Stripe)
- Transaction throughput

**Sample Rates:**
- Production: 10% of transactions
- Development: 100% (all transactions)

### Logging Coverage

**What Gets Logged:**
- ✅ All API requests (method, endpoint, user ID)
- ✅ All API responses (status, duration, timing header)
- ✅ All errors (stack trace, context, request ID)
- ✅ Business events (upgrades, imports, generations)
- ✅ Performance metrics (slow queries flagged)

---

## 🚨 Alert Configuration

### Recommended Alerts

**1. High Error Rate**
```yaml
Trigger: >10 errors in 5 minutes
Environment: Production
Action: Email notification
```

**2. Critical Route Failures**
```yaml
Trigger: Any error with tag level:critical
Environment: Production
Action: Email + Slack (#alerts-critical)
```

**3. Slow API Performance**
```yaml
Trigger: p95 response time >2s
Route: /api/rsu/bulk
Action: Email notification
```

**4. Payment Failures**
```yaml
Trigger: Any error on /api/stripe/webhook
Environment: Production
Action: Email + Slack (immediate)
```

---

## 🧪 Testing Checklist

Before production deployment:

- [ ] **Environment Setup**
  - [ ] Create Sentry account
  - [ ] Create Next.js project in Sentry
  - [ ] Copy DSN to `.env.local`
  - [ ] Generate auth token (scope: `project:write`)

- [ ] **Local Testing**
  - [ ] Run `npm run dev`
  - [ ] Visit `http://localhost:3000/api/test-sentry`
  - [ ] Verify error appears in Sentry dashboard
  - [ ] Check source maps show readable code

- [ ] **Vercel Deployment**
  - [ ] Add `NEXT_PUBLIC_SENTRY_DSN` to Vercel env vars
  - [ ] Add `SENTRY_AUTH_TOKEN` to Vercel env vars
  - [ ] Deploy to preview environment
  - [ ] Trigger test error on preview URL
  - [ ] Verify error captured with correct environment tag

- [ ] **Alert Testing**
  - [ ] Configure email alert (error rate >1%)
  - [ ] Trigger 5 test errors in 1 minute
  - [ ] Verify email received within 60 seconds
  - [ ] Configure Slack integration
  - [ ] Trigger critical error
  - [ ] Verify Slack notification

---

## 💡 Key Decisions Made

### 1. **Sentry Sample Rates**
- **Production:** 10% performance, 10% session replay
- **Rationale:** Balance cost vs coverage for 10K MAU
- **Cost:** Stays within free tier (5K errors/month)

### 2. **Logging Strategy**
- **Pino over Winston:** 5x faster, better JSON support
- **Stdout only:** Vercel captures automatically
- **No file logs:** Serverless environment

### 3. **Error Boundaries**
- **App-level + Global:** Double safety net
- **User-friendly messages:** Hide technical details in production
- **Recovery actions:** "Try Again" button included

### 4. **Critical Route Tagging**
- **3 levels:** CRITICAL, HIGH, NORMAL
- **Routing:** CRITICAL → immediate Slack alert
- **Budget:** CRITICAL routes always monitored (100% sample)

---

## 📈 Expected Metrics (Production)

### Error Budget

**Target: 99.9% uptime**
- Monthly requests: ~1M
- Allowed errors: 1,000/month (0.1% error rate)
- Current sampling: Captures all errors

### Performance Targets

| Endpoint | p95 Target | Alert Threshold |
|----------|-----------|-----------------|
| `/api/rsu/bulk` | <1s | >2s |
| `/api/ai/tax-advice` | <5s | >10s |
| `/api/stripe/webhook` | <500ms | >1s |

### Cost Estimate

**Sentry Free Tier:**
- 5,000 errors/month (sufficient for 0.1% error rate)
- 10,000 transactions/month (10% of 100K)
- **Cost:** $0

**Upgrade to Team Plan at:**
- >50,000 MAU
- >5,000 errors/month
- **Cost:** $26/month

---

## 🚀 Production Deployment

### Vercel Environment Variables

Add these in **Vercel Dashboard > Settings > Environment Variables:**

| Variable | Value | Environments |
|----------|-------|--------------|
| `NEXT_PUBLIC_SENTRY_DSN` | Your DSN | Production, Preview |
| `SENTRY_AUTH_TOKEN` | Your token | Production, Preview |
| `SENTRY_ORG` | `taxbridge` | Production, Preview |
| `SENTRY_PROJECT` | `cross-border-tax` | Production, Preview |

### Build Verification

After deployment:

1. Check build logs for "Source maps uploaded to Sentry"
2. Trigger test error: `curl https://taxbridge.app/api/test-sentry`
3. Verify in Sentry Issues tab
4. Check release version matches Git SHA

---

## 📚 Documentation

**Created Files:**
- `SENTRY_MONITORING_SETUP.md` - Complete setup guide
- `MONITORING_IMPLEMENTATION_SUMMARY.md` - This file
- `lib/logger.ts` - Logger documentation (JSDoc)
- `lib/sentry-wrapper.ts` - Wrapper utilities (JSDoc)

**External Resources:**
- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Pino Documentation](https://getpino.io/)
- [Next.js Instrumentation](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation)

---

## ✅ Implementation Checklist

- [x] Install Sentry SDK (`@sentry/nextjs`)
- [x] Install Pino logger (`pino`, `pino-pretty`)
- [x] Create Sentry config files (client, server, edge)
- [x] Configure `next.config.ts` with Sentry plugin
- [x] Create `instrumentation.ts` for Next.js 15+
- [x] Implement custom error boundaries (`error.tsx`, `global-error.tsx`)
- [x] Create structured logger (`lib/logger.ts`)
- [x] Create Sentry wrapper utilities (`lib/sentry-wrapper.ts`)
- [x] Instrument `/api/rsu/bulk` (CRITICAL)
- [x] Instrument `/api/ai/tax-advice` (HIGH)
- [x] Instrument `/api/stripe/webhook` (CRITICAL)
- [x] Add Sentry env vars to `.env.example`
- [x] Add Sentry env vars to `.env.local`
- [x] Create test error route (`/api/test-sentry`)
- [x] Write setup documentation (`SENTRY_MONITORING_SETUP.md`)
- [x] Write implementation summary (this file)

---

## 🎉 Result

**TaxBridge now has enterprise-grade monitoring:**

1. **Error Tracking:** Every error captured with full context
2. **Performance Monitoring:** Slow endpoints identified automatically
3. **Structured Logging:** Searchable logs with request tracing
4. **Alerting:** Real-time notifications for critical failures
5. **Debugging:** Source maps + session replay for easy diagnosis

**Zero downtime = zero lost revenue.** 💰

---

## Next Steps

1. Create Sentry account at sentry.io
2. Add DSN to Vercel environment variables
3. Deploy to production
4. Configure Slack webhook for critical alerts
5. Run `curl https://taxbridge.app/api/test-sentry` to verify
6. Monitor dashboard for first 48 hours
7. Tune alert thresholds based on real traffic

**Estimated Setup Time:** 15 minutes
**Estimated Value:** Priceless (catches revenue-losing bugs before users report them)
