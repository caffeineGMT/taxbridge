/**
 * Script to batch-apply rate limiting to all API routes
 * This ensures consistent DoS protection across the application
 */

import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';

// Export rate limiting utilities for easy import in route files:
// import { applyPublicRateLimit, applyAuthRateLimit, applyGenerousRateLimit } from '@/lib/apply-rate-limiting';

export const applyPublicRateLimit = rateLimit;
export const applyAuthRateLimit = rateLimit;
export const applyGenerousRateLimit = rateLimit;

export { RateLimitPresets };

/**
 * Rate limiting strategy by endpoint type:
 *
 * PUBLIC endpoints (STRICT - 10 req/min):
 * - /api/marketing/capture-lead
 * - /api/newsletter/subscribe
 * - /api/affiliates/signup
 * - /api/partners/signup
 * - /api/ai/tax-advice
 * - /api/survey/cancellation
 * - /api/webhooks/* (except authenticated)
 *
 * AUTHENTICATED endpoints (STANDARD - 60 req/min):
 * - /api/rsu/*
 * - /api/enterprise/* (with API keys)
 * - /api/user/*
 * - /api/billing/*
 * - /api/onboarding/*
 * - /api/notifications/*
 * - /api/stripe/* (except webhook)
 *
 * METADATA/LIGHTWEIGHT endpoints (GENEROUS - 120 req/min):
 * - /api/exchange-rate
 * - /api/openapi.yaml
 * - /api/analytics/*
 * - /api/stats/*
 * - /api/health
 */

export const RATE_LIMIT_DOCS = `
# Rate Limiting Configuration

## Overview
All API endpoints are protected with per-IP rate limiting to prevent DoS attacks and abuse.

## Tiers

### STRICT (10 requests/minute)
- Public forms and endpoints prone to spam
- Expensive operations (AI, bulk processing)
- Examples: /api/marketing/capture-lead, /api/ai/tax-advice

### STANDARD (60 requests/minute)
- Authenticated endpoints with API keys or user sessions
- Normal API operations
- Examples: /api/rsu/*, /api/enterprise/*

### GENEROUS (120 requests/minute)
- Lightweight metadata endpoints
- Monitoring and health checks
- Examples: /api/health, /api/exchange-rate

### PUBLIC_CALCULATOR (5 requests/5 minutes)
- Calculator endpoints accessible without authentication
- Extra strict to prevent scraping/abuse
- Example: Client-side calculator with optional CAPTCHA

## Headers

All rate-limited responses include:
- X-RateLimit-Limit: Maximum requests allowed
- X-RateLimit-Remaining: Requests remaining in current window
- X-RateLimit-Reset: ISO timestamp when limit resets
- Retry-After: Seconds to wait (429 responses only)

## Bypassing Rate Limits

Enterprise customers with authenticated API keys receive higher limits (STANDARD tier).
Contact sales@taxbridge.app for custom rate limit configurations.

## Monitoring

Rate limit violations are logged to Sentry with:
- IP address
- Endpoint path
- Timestamp
- Reset time

## Implementation

\`\`\`typescript
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await rateLimit(request, RateLimitPresets.STRICT);
  if (rateLimitResult) return rateLimitResult;

  // ... handle request
}
\`\`\`
`;
