# API Rate Limiting & DoS Protection

## Overview

TaxBridge implements comprehensive API rate limiting to prevent DoS attacks, API abuse, and ensure fair resource usage across all users.

## Implementation

All API endpoints are protected with **per-IP** rate limiting using an in-memory store. Rate limits are enforced before any request processing occurs.

### Rate Limit Tiers

| Tier | Limit | Window | Use Case |
|------|-------|--------|----------|
| **STRICT** | 10 requests | 60 seconds | Public forms, expensive operations, AI endpoints |
| **STANDARD** | 60 requests | 60 seconds | Authenticated API endpoints, normal operations |
| **GENEROUS** | 120 requests | 60 seconds | Lightweight metadata, health checks, monitoring |
| **PUBLIC_CALCULATOR** | 5 requests | 300 seconds | Calculator abuse prevention |

### Protected Endpoints

#### STRICT (10 req/min)
- `/api/v1/bulk-import` - Bulk CSV processing
- `/api/enterprise/demo-request` - Demo request form
- `/api/marketing/capture-lead` - Lead capture
- `/api/newsletter/subscribe` - Newsletter signup
- `/api/ai/tax-advice` - AI-powered tax advice (if implemented)

#### STANDARD (60 req/min)
- `/api/v1/calculate` - Tax calculation (authenticated)
- `/api/rsu/*` - RSU data management
- `/api/user/*` - User profile operations
- `/api/billing/*` - Billing operations
- `/api/stripe/*` - Stripe integration (except webhook)

#### GENEROUS (120 req/min)
- `/api/health` - Health check
- `/api/exchange-rate` - Exchange rate data
- `/api/openapi.yaml` - API documentation
- `/api/stripe/webhook` - Stripe webhooks (signature-verified)

## Response Headers

All rate-limited responses include:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 2026-03-19T12:34:56.789Z
```

When rate limit is exceeded (429 response):
```
Retry-After: 42
```

## Rate Limit Exceeded Response

```json
{
  "error": "Too many requests. Please try again later.",
  "retryAfter": 42
}
```

HTTP Status: `429 Too Many Requests`

## Monitoring & Alerting

Rate limit violations are automatically logged to **Sentry** with:
- IP address (for investigation)
- Endpoint path
- Timestamp
- Reset time
- Limit configuration

Alert level: `warning` (not critical, but worth monitoring for patterns)

## Adding Rate Limiting to New Endpoints

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // Apply rate limiting (choose appropriate tier)
  const rateLimitResult = await rateLimit(request, RateLimitPresets.STRICT);
  if (rateLimitResult) return rateLimitResult;

  // Your endpoint logic here
  try {
    // ...
  } catch (error) {
    // ...
  }
}
```

### Custom Rate Limits

```typescript
import { rateLimit, RateLimitConfig } from '@/lib/rate-limit';

const customConfig: RateLimitConfig = {
  maxRequests: 5,
  windowSeconds: 300, // 5 requests per 5 minutes
  message: 'Custom error message'
};

const rateLimitResult = await rateLimit(request, customConfig);
```

## CAPTCHA Integration (Optional)

For public calculator endpoints, hCaptcha integration is available:

### Environment Variables

```bash
HCAPTCHA_SECRET_KEY=0x...
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=your-site-key
```

### Server-Side Verification

```typescript
import { verifyHCaptcha } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { captchaToken } = body;

  // Verify CAPTCHA
  const captchaValid = await verifyHCaptcha(captchaToken);
  if (!captchaValid) {
    return NextResponse.json(
      { error: 'CAPTCHA verification failed' },
      { status: 400 }
    );
  }

  // Continue with request processing
}
```

### Client-Side Integration

```tsx
import HCaptcha from '@hcaptcha/react-hcaptcha';

function MyForm() {
  const [captchaToken, setCaptchaToken] = useState('');

  return (
    <form>
      {/* Form fields */}
      <HCaptcha
        sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
        onVerify={(token) => setCaptchaToken(token)}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Testing

Run the rate limiting test suite:

```bash
# Start the dev server
npm run dev

# In another terminal, run tests
npm run test:rate-limiting
```

Or add to package.json:
```json
{
  "scripts": {
    "test:rate-limiting": "tsx scripts/test-rate-limiting.ts"
  }
}
```

## Production Considerations

### Current Implementation (In-Memory)
- ✅ Fast and simple
- ✅ Zero external dependencies
- ❌ Per-instance (resets on deploy)
- ❌ Not shared across serverless functions

### Future: Distributed Rate Limiting
For production at scale, consider upgrading to **Vercel KV** or **Redis**:

```typescript
// Example with Vercel KV
import { kv } from '@vercel/kv';

export async function checkRateLimit(identifier: string, config: RateLimitConfig) {
  const key = `ratelimit:${identifier}`;
  const count = await kv.incr(key);

  if (count === 1) {
    await kv.expire(key, config.windowSeconds);
  }

  return {
    allowed: count <= config.maxRequests,
    remaining: Math.max(0, config.maxRequests - count),
    resetAt: Date.now() + (config.windowSeconds * 1000)
  };
}
```

## Security Notes

1. **IP Detection**: Works with Vercel (`x-forwarded-for`), Cloudflare (`cf-connecting-ip`), and direct connections.

2. **Proxy Headers**: Always uses the leftmost IP in `x-forwarded-for` to prevent spoofing.

3. **DDoS Protection**: Rate limiting is a defense-in-depth layer. For large-scale DDoS, rely on Vercel/Cloudflare's infrastructure-level protection.

4. **Webhook Security**: Stripe/Clerk webhooks use signature verification as primary auth. Rate limiting is secondary protection against replay attacks.

## Bypassing Rate Limits

Enterprise customers can request higher rate limits:
- Contact: sales@taxbridge.app
- Custom tiers: 1000+ req/min available
- Authentication required (API keys)

## Troubleshooting

### Rate limit too aggressive?
Adjust the preset in `/lib/rate-limit.ts`:
```typescript
export const RateLimitPresets = {
  STRICT: {
    maxRequests: 20, // Increased from 10
    windowSeconds: 60,
  },
  // ...
};
```

### False positives from load testing?
Use a dedicated test API key or disable rate limiting in development:
```typescript
if (process.env.NODE_ENV === 'development') {
  return null; // Skip rate limiting
}
```

### Monitoring rate limit hits
Check Sentry for warnings tagged with `type: 'rate_limit'`

## Implementation Checklist

- [x] Install dependencies (`@hcaptcha/react-hcaptcha`)
- [x] Create rate limiting middleware (`lib/rate-limit.ts`)
- [x] Apply to public endpoints (strict)
- [x] Apply to authenticated endpoints (standard)
- [x] Apply to health/metadata endpoints (generous)
- [x] Add Sentry logging for violations
- [x] Create test script
- [x] Document configuration
- [ ] Add CAPTCHA to calculator (optional, as needed)
- [ ] Upgrade to Vercel KV for distributed limiting (production scale)

## References

- [Vercel KV Rate Limiting Guide](https://vercel.com/docs/storage/vercel-kv/kv-reference#rate-limiting)
- [hCaptcha Documentation](https://docs.hcaptcha.com/)
- [OWASP Rate Limiting Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html)
