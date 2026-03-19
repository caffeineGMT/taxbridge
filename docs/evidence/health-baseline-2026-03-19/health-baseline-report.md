# Production Health Baseline Report

**Timestamp:** 2026-03-19T17:57:31.505Z
**Production URL:** https://taxbridge.vercel.app

## Executive Summary

**Overall Status:** ⚠️ **FAILING** (3 critical issues)

- ✅ Passing: 1/4
- ⚠️ Warnings: 0/4
- ❌ Failing: 3/4


## Detailed Checks

### 1. Site Accessibility
- **Status:** PASS
- **Message:** Production site is accessible (HTTP 200)
- **Details:** {
  "url": "https://taxbridge.vercel.app",
  "status": 200
}

### 2. Calculator Availability
- **Status:** FAIL
- **Message:** Calculator page returned HTTP 404
- **Details:** {
  "url": "https://taxbridge.vercel.app/us-canada-tax-calculator",
  "status": 404
}

### 3. Stripe Configuration
- **Status:** FAIL
- **Message:** Stripe keys are placeholders - cannot accept payments
- **Details:** {
  "mode": "PLACEHOLDER",
  "canAcceptPayments": false
}

### 4. Environment Variables Audit

**Status:** FAIL
**Message:** Found 13 issues with environment variables

| Variable | Status | Masked Value |
|----------|--------|--------------|
| STRIPE_SECRET_KEY | PLACEHOLDER | `sk_l...HERE (33 chars)` |
| NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | PLACEHOLDER | `pk_l...HERE (38 chars)` |
| STRIPE_WEBHOOK_SECRET | PLACEHOLDER | `whse...HERE (35 chars)` |
| NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY | PLACEHOLDER | `pk_l..._KEY (34 chars)` |
| CLERK_SECRET_KEY | PLACEHOLDER | `sk_l..._KEY (29 chars)` |
| NEXT_PUBLIC_POSTHOG_KEY | PLACEHOLDER | `phc_..._KEY (24 chars)` |
| NEXT_PUBLIC_POSTHOG_HOST | SET | `http....com (23 chars)` |
| SENTRY_AUTH_TOKEN | PLACEHOLDER | `YOUR...OKEN (22 chars)` |
| NEXT_PUBLIC_SENTRY_DSN | PLACEHOLDER | `http...0000 (57 chars)` |
| DATABASE_URL | MISSING | `[NOT SET]` |
| POSTGRES_URL | MISSING | `[NOT SET]` |
| POSTGRES_PRISMA_URL | MISSING | `[NOT SET]` |
| RESEND_API_KEY | PLACEHOLDER | `re_p..._key (18 chars)` |
| OPENAI_API_KEY | MISSING | `[NOT SET]` |

## Evidence Artifacts

- Screenshot: /Users/michaelguo/hivemind-projects/cross-border-tax/docs/evidence/health-baseline-2026-03-19/homepage-screenshot.png
- Video: Not captured
- Transaction: Not executed
- Environment Audit: This report

## Recommendations

- **CRITICAL:** Fix calculator page. This is the core product feature.
- **CRITICAL:** Replace Stripe placeholder keys with real keys (test or production).
- **WARNING:** 13 environment variables need attention:
  - `STRIPE_SECRET_KEY` is PLACEHOLDER
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is PLACEHOLDER
  - `STRIPE_WEBHOOK_SECRET` is PLACEHOLDER
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is PLACEHOLDER
  - `CLERK_SECRET_KEY` is PLACEHOLDER
  - `NEXT_PUBLIC_POSTHOG_KEY` is PLACEHOLDER
  - `SENTRY_AUTH_TOKEN` is PLACEHOLDER
  - `NEXT_PUBLIC_SENTRY_DSN` is PLACEHOLDER
  - `DATABASE_URL` is MISSING
  - `POSTGRES_URL` is MISSING
  - `POSTGRES_PRISMA_URL` is MISSING
  - `RESEND_API_KEY` is PLACEHOLDER
  - `OPENAI_API_KEY` is MISSING

---

*Report generated on 2026-03-19T17:57:34.903Z*
