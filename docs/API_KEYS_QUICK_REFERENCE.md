# API KEYS - QUICK REFERENCE TABLE
**Last Updated:** March 19, 2026

---

## 🔴 P0-CRITICAL: REVENUE BLOCKERS

| # | Service | Variable | Current Value | Status | Fix Time | Where to Get |
|---|---------|----------|---------------|--------|----------|--------------|
| 1 | Stripe | `STRIPE_SECRET_KEY` | `sk_live_YOUR_LIVE_SECRET_KEY_HERE` | ❌ PLACEHOLDER | 2h | https://dashboard.stripe.com/apikeys |
| 2 | Stripe | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_YOUR_LIVE_PUBLISHABLE_KEY_HERE` | ❌ PLACEHOLDER | " | " |
| 3 | Stripe | `STRIPE_WEBHOOK_SECRET` | `whsec_YOUR_LIVE_WEBHOOK_SECRET_HERE` | ❌ PLACEHOLDER | " | https://dashboard.stripe.com/webhooks |
| 4 | Stripe | `STRIPE_PRO_PRICE_ID` | `price_YOUR_LIVE_PRO_PRICE_ID` | ❌ PLACEHOLDER | " | Run script: `npx tsx scripts/activate-stripe-production-annual.ts` |
| 5 | Stripe | `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` | `price_YOUR_LIVE_PRO_PRICE_ID` | ❌ PLACEHOLDER | " | " |
| 6 | Stripe | `STRIPE_ENTERPRISE_PRICE_ID` | `prod_YOUR_LIVE_ENTERPRISE_PRODUCT_ID` | ❌ PLACEHOLDER | " | " |
| 7 | Stripe | `NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID` | `prod_YOUR_LIVE_ENTERPRISE_PRODUCT_ID` | ❌ PLACEHOLDER | " | " |
| 8 | Clerk | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_YOUR_CLERK_PUBLISHABLE_KEY` | ❌ PLACEHOLDER | 30m | https://dashboard.clerk.com |
| 9 | Clerk | `CLERK_SECRET_KEY` | `sk_live_YOUR_CLERK_SECRET_KEY` | ❌ PLACEHOLDER | " | " |
| 10 | Clerk | `CLERK_WEBHOOK_SECRET` | `whsec_YOUR_CLERK_WEBHOOK_SECRET` | ❌ PLACEHOLDER | " | " |
| 11 | SendGrid | `SENDGRID_API_KEY` | `SG.YOUR_SENDGRID_API_KEY_HERE` | ❌ PLACEHOLDER | 1.5h | https://app.sendgrid.com/settings/api_keys |
| 12 | SendGrid | `SENDGRID_FROM_EMAIL` | `noreply@taxbridge.app` | ⚠️ UNVERIFIED | " | Verify domain in SendGrid |
| 13 | SendGrid | `SENDGRID_REPLY_TO` | `support@taxbridge.app` | ⚠️ UNVERIFIED | " | " |
| 14 | SendGrid | `SENDGRID_CANCELLATION_SURVEY_TEMPLATE_ID` | `d-YOUR_CANCELLATION_SURVEY_TEMPLATE_ID` | ❌ PLACEHOLDER | " | Create in SendGrid → Dynamic Templates |
| 15 | SendGrid | (+ 7 more template IDs) | Various placeholders | ❌ PLACEHOLDER | " | " |
| 16 | Anthropic | `ANTHROPIC_API_KEY` | `sk-ant-api03-YOUR_ANTHROPIC_API_KEY_HERE` | ❌ PLACEHOLDER | 10m | https://console.anthropic.com/settings/keys |
| 17 | Sentry | `NEXT_PUBLIC_SENTRY_DSN` | `https://YOUR_SENTRY_KEY@o0000000.ingest.sentry.io/0000000` | ❌ PLACEHOLDER | 20m | https://sentry.io → Create project |
| 18 | Sentry | `SENTRY_AUTH_TOKEN` | `YOUR_SENTRY_AUTH_TOKEN` | ❌ PLACEHOLDER | " | Sentry → Settings → Auth Tokens |

**P0 Summary:** 24 keys total, 4 valid (17%), 20 broken (83%)
**Impact:** Site cannot accept payments, authenticate users, send emails, or track errors
**Total Fix Time:** ~4 hours

---

## 🟠 P1-HIGH: ANALYTICS & TRACKING

| # | Service | Variable | Current Value | Status | Fix Time | Where to Get |
|---|---------|----------|---------------|--------|----------|--------------|
| 19 | PostHog | `NEXT_PUBLIC_POSTHOG_KEY` | `phc_YOUR_PROJECT_API_KEY` | ❌ PLACEHOLDER | 15m | https://app.posthog.com → Project Settings |
| 20 | PostHog | `NEXT_PUBLIC_POSTHOG_HOST` | `https://app.posthog.com` | ✅ VALID | N/A | N/A |
| 21 | PostHog | `POSTHOG_PROJECT_ID` | `YOUR_PROJECT_ID` | ❌ PLACEHOLDER | 15m | PostHog → Project Settings or URL |
| 22 | Google Ads | `NEXT_PUBLIC_GOOGLE_ADS_ID` | `AW-XXXXXXXXXX` | ❌ PLACEHOLDER | 30m | https://ads.google.com → Tools → Conversions |
| 23 | Google Ads | `NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_LABEL` | `YOUR_SIGNUP_LABEL` | ❌ PLACEHOLDER | " | Create conversion action → Copy label |
| 24 | Google Ads | `NEXT_PUBLIC_GOOGLE_ADS_PRO_LABEL` | `YOUR_PRO_SUBSCRIPTION_LABEL` | ❌ PLACEHOLDER | " | " |
| 25 | Google Ads | `NEXT_PUBLIC_GOOGLE_ADS_ENTERPRISE_LABEL` | `YOUR_ENTERPRISE_LABEL` | ❌ PLACEHOLDER | " | " |
| 26 | Google Ads | `NEXT_PUBLIC_GOOGLE_ADS_CALCULATOR_LABEL` | `YOUR_CALCULATOR_LABEL` | ❌ PLACEHOLDER | " | " |
| 27 | Meta Pixel | `NEXT_PUBLIC_META_PIXEL_ID` | `YOUR_15_DIGIT_PIXEL_ID` | ❌ PLACEHOLDER | 20m | https://business.facebook.com → Events Manager |

**P1 Summary:** 9 keys total, 1 valid (11%), 8 broken (89%)
**Impact:** Cannot track conversion funnel, Google Ads ROI, or Facebook retargeting
**Total Fix Time:** ~1.5 hours

---

## 🟡 P2-MEDIUM: MARKETING AUTOMATION

| # | Service | Variable | Current Value | Status | Fix Time | Where to Get |
|---|---------|----------|---------------|--------|----------|--------------|
| 28 | Product Hunt | `PRODUCT_HUNT_API_TOKEN` | `your_product_hunt_api_token_here` | ❌ PLACEHOLDER | 10m | https://www.producthunt.com/v2/oauth/applications |
| 29 | Product Hunt | `PRODUCT_HUNT_SLUG` | `taxbridge` | ✅ VALID | N/A | N/A |
| 30 | Reddit | `REDDIT_CLIENT_ID` | Not set | ❌ MISSING | 15m | https://www.reddit.com/prefs/apps |
| 31 | Reddit | `REDDIT_CLIENT_SECRET` | Not set | ❌ MISSING | " | " |
| 32 | Reddit | `REDDIT_USERNAME` | Not set | ❌ MISSING | " | Your Reddit account |
| 33 | Reddit | `REDDIT_PASSWORD` | Not set | ❌ MISSING | " | " |
| 34 | Reddit | `REDDIT_USER_AGENT` | Not set | ❌ MISSING | " | Format: "TaxBridge:v1.0.0 (by /u/YourUsername)" |
| 35 | Apollo.io | `APOLLO_API_KEY` | Not set | ❌ MISSING | 20m | https://app.apollo.io/api ($79/mo) |
| 36 | Hunter.io | `HUNTER_API_KEY` | Not set | ❌ MISSING | " | https://hunter.io/api (optional) |
| 37 | Instantly.ai | `INSTANTLY_API_KEY` | Not set | ❌ MISSING | " | https://app.instantly.ai (optional) |
| 38 | CRON | `CRON_SECRET` | `YOUR_SECURE_RANDOM_STRING_HERE` | ❌ PLACEHOLDER | 5m | Generate: `openssl rand -hex 32` |

**P2 Summary:** 13 keys total, 1 valid (8%), 12 broken (92%)
**Impact:** Cannot automate marketing, partnership outreach, or secure cron endpoints
**Total Fix Time:** ~1 hour

---

## ⚪ P3-LOW: OPTIONAL FEATURES

| # | Service | Variable | Current Value | Status | Fix Time | Where to Get |
|---|---------|----------|---------------|--------|----------|--------------|
| 39-43 | Amazon Pay | 5 variables | Not set | ⚪ NOT NEEDED | N/A | Feature not implemented |
| 44-46 | Calendly | 3 variables | Not set | ⚪ NOT NEEDED | N/A | Feature not actively used |
| 47 | Resend | `RESEND_API_KEY` | `re_placeholder_key` | ⚠️ PLACEHOLDER | 10m | https://resend.com (fallback for SendGrid) |
| 48-56 | Misc | Various config | Valid | ✅ VALID | N/A | App URLs, admin emails, etc. |

**P3 Summary:** 10 keys total, 0 critical broken
**Impact:** None (optional features)
**Total Fix Time:** N/A

---

## SUMMARY BY STATUS

| Status | Count | Percentage |
|--------|-------|------------|
| ✅ **VALID** (Working) | 6 | 11% |
| ❌ **PLACEHOLDER** | 33 | 59% |
| ❌ **MISSING** | 17 | 30% |
| **TOTAL** | **56** | **100%** |

---

## EXECUTION ORDER (FASTEST PATH TO REVENUE)

### Step 1: Stripe (2 hours) - HIGHEST IMPACT
Get live keys → Create products → Configure webhook → Update Vercel → Test

### Step 2: Clerk (30 min) - BLOCKS USER ACCESS
Get production keys → Create webhook → Update Vercel → Test signup

### Step 3: SendGrid (1.5 hours) - CRITICAL FOR UX
Get API key → Verify domain → Create 8 templates → Update Vercel → Test

### Step 4: Anthropic + Sentry (30 min) - QUICK WINS
Get API keys → Update Vercel → Test

### Step 5: Analytics (1.5 hours) - OPTIONAL BUT RECOMMENDED
PostHog → Google Ads → Meta Pixel → CRON secret

**Total Time:** 4-6 hours (depending on DNS propagation for SendGrid)

---

## VERCEL ENV VAR COMMANDS (COPY-PASTE READY)

### Critical Services
```bash
# Stripe (7 vars)
vercel env add STRIPE_SECRET_KEY production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add STRIPE_PRO_PRICE_ID production
vercel env add NEXT_PUBLIC_STRIPE_PRO_PRICE_ID production
vercel env add STRIPE_ENTERPRISE_PRICE_ID production
vercel env add NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID production

# Clerk (3 vars)
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production
vercel env add CLERK_WEBHOOK_SECRET production

# SendGrid (12 vars)
vercel env add SENDGRID_API_KEY production
vercel env add SENDGRID_FROM_EMAIL production
vercel env add SENDGRID_FROM_NAME production
vercel env add SENDGRID_REPLY_TO production
vercel env add SENDGRID_CANCELLATION_SURVEY_TEMPLATE_ID production
# (+ 7 more template IDs based on what you create)

# Anthropic (1 var)
vercel env add ANTHROPIC_API_KEY production

# Sentry (4 vars)
vercel env add NEXT_PUBLIC_SENTRY_DSN production
vercel env add SENTRY_AUTH_TOKEN production
vercel env add SENTRY_ORG production
vercel env add SENTRY_PROJECT production
```

### Analytics (Optional)
```bash
# PostHog (2 vars)
vercel env add NEXT_PUBLIC_POSTHOG_KEY production
vercel env add POSTHOG_PROJECT_ID production

# Google Ads (5 vars)
vercel env add NEXT_PUBLIC_GOOGLE_ADS_ID production
vercel env add NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_LABEL production
vercel env add NEXT_PUBLIC_GOOGLE_ADS_PRO_LABEL production
vercel env add NEXT_PUBLIC_GOOGLE_ADS_ENTERPRISE_LABEL production
vercel env add NEXT_PUBLIC_GOOGLE_ADS_CALCULATOR_LABEL production

# Meta Pixel (1 var)
vercel env add NEXT_PUBLIC_META_PIXEL_ID production

# CRON Security (1 var)
vercel env add CRON_SECRET production
```

---

## VERIFICATION TESTS

After updating each service:

```bash
# Stripe
curl https://taxbridge.vercel.app/api/stripe/health
# Expected: {"status":"ok","mode":"production"}

# Clerk
# Manual test: Visit /sign-up, create account

# SendGrid
# Trigger test email from admin dashboard

# Sentry
curl https://taxbridge.vercel.app/api/test/error
# Check Sentry dashboard for error within 60s

# PostHog
# Visit homepage, check PostHog for "page_viewed" event

# Google Ads
# Complete signup, check Google Ads dashboard within 24hrs
```

---

**For detailed instructions, see:**
- 📄 `docs/API_KEYS_AUDIT_2026-03-19.md` (full audit)
- 📄 `docs/API_KEYS_AUDIT_EXECUTIVE_SUMMARY.md` (summary)
- 📋 `docs/API_KEYS_REPLACEMENT_CHECKLIST.md` (printable checklist)

**Last Updated:** March 19, 2026
**Next Review:** After completing Phase 1 (4 hours)
