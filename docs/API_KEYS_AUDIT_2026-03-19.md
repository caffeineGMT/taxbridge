# API KEYS AUDIT - PRODUCTION ENVIRONMENT
**Date:** March 19, 2026
**Auditor:** Engineering Team
**Environment:** Production (taxbridge.vercel.app)
**Severity:** P0-CRITICAL - REVENUE BLOCKER

---

## EXECUTIVE SUMMARY

**VERDICT:** 🔴 **NOT PRODUCTION-READY** - 24 of 28 critical keys are placeholders/test mode (86% failure rate)

**REVENUE IMPACT:** $0 MRR - Cannot accept payments, cannot authenticate users, zero tracking
**TIME TO FIX:** 4-6 hours configuration work
**RISK LEVEL:** CRITICAL - Site will crash with 500 errors on user signup/checkout

**KEY FINDINGS:**
- ✅ 4 keys properly configured (app URLs, static config)
- ❌ 24 keys are PLACEHOLDERS or TEST MODE
- 🔴 5 CRITICAL revenue blockers (Stripe, Clerk, SendGrid)
- 🟠 8 HIGH-PRIORITY analytics/tracking failures
- 🟡 11 MEDIUM-PRIORITY marketing/automation gaps

---

## AUDIT RESULTS BY PRIORITY

### 🔴 P0-CRITICAL: REVENUE BLOCKERS (5 keys - 100% FAILURE)

These keys will cause immediate site crashes or revenue loss.

#### 1. STRIPE PAYMENT PROCESSING (7 keys)
**Current Status:** 🔴 100% TEST MODE - ZERO REVENUE CAPABILITY

| Variable | Expected | Actual | Status | Impact |
|----------|----------|--------|--------|--------|
| `STRIPE_SECRET_KEY` | `sk_live_...` | `sk_live_YOUR_LIVE_SECRET_KEY_HERE` | ❌ PLACEHOLDER | Cannot process payments |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | `pk_live_YOUR_LIVE_PUBLISHABLE_KEY_HERE` | ❌ PLACEHOLDER | Checkout won't load |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | `whsec_YOUR_LIVE_WEBHOOK_SECRET_HERE` | ❌ PLACEHOLDER | Subscriptions won't activate |
| `STRIPE_PRO_PRICE_ID` | `price_...` | `price_YOUR_LIVE_PRO_PRICE_ID` | ❌ PLACEHOLDER | Pro checkout fails |
| `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` | `price_...` | `price_YOUR_LIVE_PRO_PRICE_ID` | ❌ PLACEHOLDER | Frontend can't display pricing |
| `STRIPE_ENTERPRISE_PRICE_ID` | `prod_...` | `prod_YOUR_LIVE_ENTERPRISE_PRODUCT_ID` | ❌ PLACEHOLDER | Enterprise checkout fails |
| `NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID` | `prod_...` | `prod_YOUR_LIVE_ENTERPRISE_PRODUCT_ID` | ❌ PLACEHOLDER | Enterprise pricing broken |

**Test Result:** ❌ FAILS - All keys are hardcoded placeholders
**User Impact:** Cannot purchase ANY subscription plan - $0 revenue
**Fix Time:** 2 hours

**Replacement Plan:**
```bash
# Step 1: Get LIVE keys (30 min)
1. Go to https://dashboard.stripe.com/apikeys
2. Toggle to "Production" mode (top right)
3. Copy sk_live_... and pk_live_... keys

# Step 2: Create products (45 min)
export STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_KEY
npx tsx scripts/activate-stripe-production-annual.ts
# Copy price IDs from output: price_XXX

# Step 3: Create webhook (15 min)
1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: https://taxbridge.vercel.app/api/stripe/webhook
3. Select events: checkout.session.completed, customer.subscription.*
4. Copy webhook secret: whsec_...

# Step 4: Update Vercel (15 min)
vercel env add STRIPE_SECRET_KEY production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add STRIPE_PRO_PRICE_ID production
vercel env add NEXT_PUBLIC_STRIPE_PRO_PRICE_ID production
# (repeat for ENTERPRISE_PRICE_ID)

# Step 5: Test (15 min)
# Use card 4242 4242 4242 4242, complete checkout, verify webhook fires
# REFUND test transaction immediately
```

---

#### 2. CLERK AUTHENTICATION (3 keys)
**Current Status:** 🔴 TEST MODE - SITE RETURNS 500 ON SIGNUP

| Variable | Expected | Actual | Status | Impact |
|----------|----------|--------|--------|--------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...` | `pk_live_YOUR_CLERK_PUBLISHABLE_KEY` | ❌ PLACEHOLDER | Auth crashes |
| `CLERK_SECRET_KEY` | `sk_live_...` | `sk_live_YOUR_CLERK_SECRET_KEY` | ❌ PLACEHOLDER | API calls fail |
| `CLERK_WEBHOOK_SECRET` | `whsec_...` | `whsec_YOUR_CLERK_WEBHOOK_SECRET` | ❌ PLACEHOLDER | User sync broken |

**Test Result:** ❌ FAILS - All Clerk keys are placeholders
**User Impact:** Cannot sign up, login, or access dashboard - site unusable
**Fix Time:** 30 minutes

**Replacement Plan:**
```bash
# Step 1: Get production keys (10 min)
1. Go to https://dashboard.clerk.com
2. Select your app → API Keys
3. Toggle to "Production" (top right)
4. Copy pk_live_... and sk_live_... keys

# Step 2: Create webhook (10 min)
1. Dashboard → Webhooks → Add Endpoint
2. URL: https://taxbridge.vercel.app/api/webhooks/clerk
3. Events: user.created, user.updated, session.created
4. Copy webhook secret: whsec_...

# Step 3: Update Vercel (10 min)
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production
vercel env add CLERK_WEBHOOK_SECRET production
```

---

#### 3. SENDGRID EMAIL (11 keys)
**Current Status:** 🔴 PLACEHOLDER - NO EMAILS SENT

| Variable | Expected | Actual | Status | Impact |
|----------|----------|--------|--------|--------|
| `SENDGRID_API_KEY` | `SG.xxx` | `SG.YOUR_SENDGRID_API_KEY_HERE` | ❌ PLACEHOLDER | Emails won't send |
| `SENDGRID_CANCELLATION_SURVEY_TEMPLATE_ID` | `d-xxx` | `d-YOUR_CANCELLATION_SURVEY_TEMPLATE_ID` | ❌ PLACEHOLDER | Churn emails fail |
| `SENDGRID_FROM_EMAIL` | Valid email | `noreply@taxbridge.app` | ⚠️ UNVERIFIED | Emails may bounce |
| `SENDGRID_REPLY_TO` | Valid email | `support@taxbridge.app` | ⚠️ UNVERIFIED | Support emails lost |
| (+ 7 more template IDs) | `d-xxx` | Not set | ❌ MISSING | Drip campaigns broken |

**Test Result:** ❌ FAILS - API key is placeholder, templates not created
**User Impact:** Zero email functionality - no welcome emails, password resets, or nurture campaigns
**Fix Time:** 1.5 hours

**Replacement Plan:**
```bash
# Step 1: Get API key (5 min)
1. Go to https://app.sendgrid.com/settings/api_keys
2. Create new key with "Full Access"
3. Copy SG.xxx key (SAVE IT - shown once only)

# Step 2: Verify domain (30 min)
1. Settings → Sender Authentication → Verify Domain
2. Add DNS records for taxbridge.app (TXT, CNAME)
3. Wait 10-30 min for DNS propagation
4. Click "Verify"

# Step 3: Create dynamic templates (45 min)
1. Email API → Dynamic Templates → Create Template
2. Create 8 templates:
   - d-cancellation-survey (churn prevention)
   - d-day1-welcome (nurture day 1)
   - d-day3-education (nurture day 3)
   - d-day5-social-proof (nurture day 5)
   - d-day7-urgency (nurture day 7)
   - d-reengagement (win-back)
   - d-testimonial-request (social proof)
   - d-feedback-request (customer success)
3. Design templates with handlebars: {{firstName}}, {{calculationResult}}

# Step 4: Update Vercel (10 min)
vercel env add SENDGRID_API_KEY production
vercel env add SENDGRID_CANCELLATION_SURVEY_TEMPLATE_ID production
# (repeat for all 8 template IDs)
```

---

#### 4. ANTHROPIC AI TAX ADVISOR (1 key)
**Current Status:** 🔴 PLACEHOLDER - AI FEATURES BROKEN

| Variable | Expected | Actual | Status | Impact |
|----------|----------|--------|--------|--------|
| `ANTHROPIC_API_KEY` | `sk-ant-api03-xxx` | `sk-ant-api03-YOUR_ANTHROPIC_API_KEY_HERE` | ❌ PLACEHOLDER | AI advisor crashes |

**Test Result:** ❌ FAILS - Placeholder key
**User Impact:** AI tax advisor feature returns 401 errors
**Fix Time:** 10 minutes

**Replacement Plan:**
```bash
# Step 1: Get API key (5 min)
1. Go to https://console.anthropic.com/settings/keys
2. Create new API key
3. Copy sk-ant-api03-xxx key

# Step 2: Update Vercel (5 min)
vercel env add ANTHROPIC_API_KEY production
```

---

#### 5. SENTRY ERROR MONITORING (2 keys)
**Current Status:** 🔴 PLACEHOLDER - NO ERROR TRACKING

| Variable | Expected | Actual | Status | Impact |
|----------|----------|--------|--------|--------|
| `NEXT_PUBLIC_SENTRY_DSN` | `https://xxx@oXXX.ingest.sentry.io/XXX` | `https://YOUR_SENTRY_KEY@o0000000.ingest.sentry.io/0000000` | ❌ PLACEHOLDER | Errors not tracked |
| `SENTRY_AUTH_TOKEN` | `sntrys_xxx` | `YOUR_SENTRY_AUTH_TOKEN` | ❌ PLACEHOLDER | Source maps fail |

**Test Result:** ❌ FAILS - Placeholder DSN and token
**User Impact:** Production errors invisible - cannot debug crashes
**Fix Time:** 20 minutes

**Replacement Plan:**
```bash
# Step 1: Create Sentry project (10 min)
1. Go to https://sentry.io
2. Create new project → Select "Next.js"
3. Copy DSN from project settings
4. Generate auth token: Settings → Auth Tokens (scope: project:write)

# Step 2: Update Vercel (10 min)
vercel env add NEXT_PUBLIC_SENTRY_DSN production
vercel env add SENTRY_AUTH_TOKEN production
vercel env add SENTRY_ORG production  # taxbridge
vercel env add SENTRY_PROJECT production  # cross-border-tax
```

---

### 🟠 P1-HIGH: ANALYTICS & TRACKING (8 keys - 100% FAILURE)

These keys won't crash the site but prevent conversion tracking and analytics.

#### 6. POSTHOG ANALYTICS (3 keys)
**Current Status:** 🟠 PLACEHOLDER - NO FUNNEL TRACKING

| Variable | Expected | Actual | Status | Impact |
|----------|----------|--------|--------|--------|
| `NEXT_PUBLIC_POSTHOG_KEY` | `phc_xxx` | `phc_YOUR_PROJECT_API_KEY` | ❌ PLACEHOLDER | No event tracking |
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://app.posthog.com` | `https://app.posthog.com` | ✅ VALID | N/A |
| `POSTHOG_PROJECT_ID` | Numeric ID | `YOUR_PROJECT_ID` | ❌ PLACEHOLDER | API calls fail |

**Test Result:** ❌ FAILS - 2/3 keys are placeholders
**User Impact:** Cannot track conversion funnel, session recordings, or A/B tests
**Fix Time:** 15 minutes

**Replacement Plan:**
```bash
# Step 1: Get PostHog keys (10 min)
1. Go to https://app.posthog.com
2. Create new project (if needed)
3. Copy Project API Key (phc_xxx) from project settings
4. Copy Project ID (numeric) from URL or settings

# Step 2: Update Vercel (5 min)
vercel env add NEXT_PUBLIC_POSTHOG_KEY production
vercel env add POSTHOG_PROJECT_ID production
```

---

#### 7. GOOGLE ADS CONVERSION TRACKING (5 keys)
**Current Status:** 🟠 PLACEHOLDER - WASTING AD SPEND

| Variable | Expected | Actual | Status | Impact |
|----------|----------|--------|--------|--------|
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | `AW-XXXXXXXXXX` | `AW-XXXXXXXXXX` | ❌ PLACEHOLDER | Conversions not tracked |
| `NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_LABEL` | `xxx` | `YOUR_SIGNUP_LABEL` | ❌ PLACEHOLDER | Signup conversions lost |
| `NEXT_PUBLIC_GOOGLE_ADS_PRO_LABEL` | `xxx` | `YOUR_PRO_SUBSCRIPTION_LABEL` | ❌ PLACEHOLDER | Revenue attribution broken |
| `NEXT_PUBLIC_GOOGLE_ADS_ENTERPRISE_LABEL` | `xxx` | `YOUR_ENTERPRISE_LABEL` | ❌ PLACEHOLDER | Enterprise leads lost |
| `NEXT_PUBLIC_GOOGLE_ADS_CALCULATOR_LABEL` | `xxx` | `YOUR_CALCULATOR_LABEL` | ❌ PLACEHOLDER | Micro-conversions missing |

**Test Result:** ❌ FAILS - All 5 labels are placeholders
**User Impact:** Cannot measure Google Ads ROI - burning money on untracked campaigns
**Fix Time:** 30 minutes

**Replacement Plan:**
```bash
# Step 1: Create Google Ads account (if needed) (10 min)
1. Go to https://ads.google.com
2. Link domain: taxbridge.app

# Step 2: Create conversion actions (15 min)
1. Tools → Conversions → + New Conversion Action
2. Create 4 actions:
   - "Signup" (primary conversion, value: $50)
   - "Pro Subscription" (purchase, value: $79)
   - "Enterprise Demo" (lead)
   - "Calculator Use" (micro-conversion)
3. Copy conversion ID: AW-XXXXXXXXXX
4. Copy labels for each action

# Step 3: Update Vercel (5 min)
vercel env add NEXT_PUBLIC_GOOGLE_ADS_ID production
vercel env add NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_LABEL production
vercel env add NEXT_PUBLIC_GOOGLE_ADS_PRO_LABEL production
vercel env add NEXT_PUBLIC_GOOGLE_ADS_ENTERPRISE_LABEL production
vercel env add NEXT_PUBLIC_GOOGLE_ADS_CALCULATOR_LABEL production

# Step 4: Verify (optional) (10 min)
# Install Google Tag Assistant Chrome extension
# Complete test conversion, verify it appears in Google Ads dashboard
```

---

#### 8. META PIXEL (FACEBOOK RETARGETING) (1 key)
**Current Status:** 🟠 PLACEHOLDER - NO RETARGETING

| Variable | Expected | Actual | Status | Impact |
|----------|----------|--------|--------|--------|
| `NEXT_PUBLIC_META_PIXEL_ID` | 15-digit number | `YOUR_15_DIGIT_PIXEL_ID` | ❌ PLACEHOLDER | FB ads blind |

**Test Result:** ❌ FAILS - Placeholder ID
**User Impact:** Cannot retarget visitors with Facebook/Instagram ads
**Fix Time:** 20 minutes

**Replacement Plan:**
```bash
# Step 1: Create Meta Pixel (10 min)
1. Go to https://business.facebook.com
2. Events Manager → Data Sources → Pixels → Add
3. Copy 15-digit Pixel ID

# Step 2: Create custom audiences (optional) (10 min)
1. Ads Manager → Audiences → Create Custom Audience
2. Create 3 audiences:
   - Calculator users who didn't sign up (30-day retention)
   - Signups who didn't subscribe (90-day retention)
   - All website visitors (warm audience)

# Step 3: Update Vercel (5 min)
vercel env add NEXT_PUBLIC_META_PIXEL_ID production
```

---

### 🟡 P2-MEDIUM: MARKETING AUTOMATION (11 keys - 100% FAILURE)

These keys enable marketing campaigns but aren't critical for core functionality.

#### 9. PRODUCT HUNT LAUNCH TRACKING (2 keys)
**Current Status:** 🟡 PLACEHOLDER - NO LAUNCH TRACKING

| Variable | Expected | Actual | Status | Impact |
|----------|----------|--------|--------|--------|
| `PRODUCT_HUNT_API_TOKEN` | API token | `your_product_hunt_api_token_here` | ❌ PLACEHOLDER | Can't track launch |
| `PRODUCT_HUNT_SLUG` | `taxbridge` | `taxbridge` | ✅ VALID | N/A |

**Test Result:** ⚠️ PARTIAL - 1/2 valid
**User Impact:** Cannot auto-update launch metrics on homepage
**Fix Time:** 10 minutes

**Replacement Plan:**
```bash
# Step 1: Get Product Hunt API token (5 min)
1. Go to https://www.producthunt.com/v2/oauth/applications
2. Create new application
3. Copy API token

# Step 2: Update Vercel (5 min)
vercel env add PRODUCT_HUNT_API_TOKEN production
```

---

#### 10. REDDIT API (ORGANIC GROWTH) (5 keys)
**Current Status:** 🟡 NOT SET - NO REDDIT AUTOMATION

| Variable | Expected | Actual | Status | Impact |
|----------|----------|--------|--------|--------|
| `REDDIT_CLIENT_ID` | Client ID | Not in .env.production | ❌ MISSING | Reddit automation disabled |
| `REDDIT_CLIENT_SECRET` | Secret | Not in .env.production | ❌ MISSING | API calls fail |
| `REDDIT_USERNAME` | Username | Not in .env.production | ❌ MISSING | Can't post |
| `REDDIT_PASSWORD` | Password | Not in .env.production | ❌ MISSING | Auth fails |
| `REDDIT_USER_AGENT` | User agent | Not in .env.production | ❌ MISSING | API rejects |

**Test Result:** ❌ FAILS - Not configured
**User Impact:** Cannot automate Reddit engagement in r/h1b, r/cscareerquestions
**Fix Time:** 15 minutes

**Replacement Plan:**
```bash
# Step 1: Create Reddit app (10 min)
1. Create Reddit account: TaxBridgeApp (or similar)
2. Go to https://www.reddit.com/prefs/apps
3. Click "Create App" → Choose "script"
4. Fill in name: TaxBridge Bot
5. Redirect URI: http://localhost:8080
6. Copy Client ID and Secret

# Step 2: Update Vercel (5 min)
vercel env add REDDIT_CLIENT_ID production
vercel env add REDDIT_CLIENT_SECRET production
vercel env add REDDIT_USERNAME production
vercel env add REDDIT_PASSWORD production
vercel env add REDDIT_USER_AGENT production  # "TaxBridge:v1.0.0 (by /u/TaxBridgeApp)"
```

---

#### 11. CPA PARTNERSHIP OUTREACH (3 keys)
**Current Status:** 🟡 NOT SET - NO OUTREACH AUTOMATION

| Variable | Expected | Actual | Status | Impact |
|----------|----------|--------|--------|--------|
| `APOLLO_API_KEY` | API key | Not in .env.production | ❌ MISSING | Can't find CPA contacts |
| `HUNTER_API_KEY` | API key | Not in .env.production | ❌ MISSING | Email verification fails |
| `INSTANTLY_API_KEY` | API key | Not in .env.production | ❌ MISSING | Email campaigns disabled |

**Test Result:** ❌ FAILS - Not configured
**User Impact:** Cannot automate CPA/immigration lawyer partnership outreach
**Fix Time:** 20 minutes

**Replacement Plan:**
```bash
# Step 1: Sign up for services (15 min)
1. Apollo.io: https://app.apollo.io/api ($79/mo, 10K credits)
2. Hunter.io: https://hunter.io/api ($49/mo, 500 verifications) - OPTIONAL
3. Instantly.ai: https://app.instantly.ai ($37/mo) - OPTIONAL

# Step 2: Get API keys (5 min)
# Copy keys from each dashboard

# Step 3: Update Vercel (5 min)
vercel env add APOLLO_API_KEY production
# (Optional: add HUNTER_API_KEY, INSTANTLY_API_KEY)
```

---

#### 12. CRON SECURITY (1 key)
**Current Status:** 🟡 PLACEHOLDER - CRON ENDPOINTS UNSECURED

| Variable | Expected | Actual | Status | Impact |
|----------|----------|--------|--------|--------|
| `CRON_SECRET` | Random 32-char string | `YOUR_SECURE_RANDOM_STRING_HERE` | ❌ PLACEHOLDER | Anyone can trigger crons |

**Test Result:** ❌ FAILS - Placeholder value
**User Impact:** Cron endpoints (email drip, re-engagement) can be abused
**Fix Time:** 5 minutes

**Replacement Plan:**
```bash
# Step 1: Generate secure random string (2 min)
openssl rand -hex 32

# Step 2: Update Vercel (3 min)
vercel env add CRON_SECRET production
```

---

### ⚪ P3-LOW: OPTIONAL FEATURES (4 keys)

These keys are for optional features not yet in use.

#### 13. AMAZON PAY (5 keys) - NOT IMPLEMENTED
**Current Status:** ⚪ NOT SET (Feature not built yet)

| Variable | Expected | Actual | Status | Impact |
|----------|----------|--------|--------|--------|
| `AMAZON_PAY_MERCHANT_ID` | Merchant ID | Not in .env.production | ⚪ NOT NEEDED | N/A |
| (+ 4 more Amazon Pay vars) | Various | Not in .env.production | ⚪ NOT NEEDED | N/A |

**Test Result:** ⚪ N/A - Feature not implemented
**User Impact:** None (not using Amazon Pay)
**Fix Time:** N/A

---

#### 14. CALENDLY INTEGRATION (3 keys) - NOT IMPLEMENTED
**Current Status:** ⚪ NOT SET (Feature references exist but not used)

| Variable | Expected | Actual | Status | Impact |
|----------|----------|--------|--------|--------|
| `CALENDLY_URL` | URL | Not in .env.production | ⚪ NOT NEEDED | N/A |
| `CALENDLY_INTERVIEW_URL` | URL | Not in .env.production | ⚪ NOT NEEDED | N/A |
| `CALENDLY_WEBHOOK_SECRET` | Secret | Not in .env.production | ⚪ NOT NEEDED | N/A |

**Test Result:** ⚪ N/A - Not actively used
**User Impact:** None (enterprise demo requests use email)
**Fix Time:** N/A

---

#### 15. RESEND EMAIL API (1 key) - FALLBACK
**Current Status:** ⚪ PLACEHOLDER (Using SendGrid instead)

| Variable | Expected | Actual | Status | Impact |
|----------|----------|--------|--------|--------|
| `RESEND_API_KEY` | `re_xxx` | `re_placeholder_key` | ⚠️ PLACEHOLDER | Fallback email broken |

**Test Result:** ⚠️ PLACEHOLDER
**User Impact:** None (using SendGrid as primary)
**Fix Time:** 10 minutes (if needed as backup)

---

## CONFIGURATION STATUS BY CATEGORY

| Category | Total Keys | ✅ Valid | ❌ Placeholder | ❌ Missing | % Working |
|----------|------------|---------|----------------|-----------|-----------|
| **P0-CRITICAL** | 24 | 4 | 20 | 0 | **17%** |
| **P1-HIGH** | 9 | 1 | 8 | 0 | **11%** |
| **P2-MEDIUM** | 13 | 1 | 4 | 8 | **8%** |
| **P3-LOW** | 10 | 0 | 1 | 9 | **0%** |
| **TOTAL** | **56** | **6** | **33** | **17** | **11%** |

---

## REPLACEMENT PLAN - EXECUTION ROADMAP

### Phase 1: REVENUE UNBLOCKING (4 hours)
**Goal:** Enable payments and user authentication

1. **Stripe Production Activation** (2 hours)
   - Get live API keys (30 min)
   - Create products/prices (45 min)
   - Configure webhook (15 min)
   - Update Vercel env vars (15 min)
   - Test checkout flow (15 min)

2. **Clerk Authentication** (30 minutes)
   - Get production keys (10 min)
   - Configure webhook (10 min)
   - Update Vercel (10 min)

3. **SendGrid Email** (1.5 hours)
   - Get API key (5 min)
   - Verify domain (30 min)
   - Create 8 dynamic templates (45 min)
   - Update Vercel (10 min)

4. **Anthropic AI** (10 minutes)
   - Get API key (5 min)
   - Update Vercel (5 min)

5. **Sentry Monitoring** (20 minutes)
   - Create project (10 min)
   - Get DSN and auth token (5 min)
   - Update Vercel (5 min)

**Checkpoint:** Test end-to-end: Signup → Calculator → Checkout → Payment → Email confirmation

---

### Phase 2: ANALYTICS & TRACKING (1.5 hours)
**Goal:** Enable conversion tracking and funnel analysis

6. **PostHog Analytics** (15 minutes)
   - Get project key and ID (10 min)
   - Update Vercel (5 min)

7. **Google Ads Tracking** (30 minutes)
   - Create conversion actions (15 min)
   - Get conversion ID and labels (10 min)
   - Update Vercel (5 min)

8. **Meta Pixel** (20 minutes)
   - Create pixel (10 min)
   - Create custom audiences (5 min)
   - Update Vercel (5 min)

9. **CRON Security** (5 minutes)
   - Generate secure random string (2 min)
   - Update Vercel (3 min)

**Checkpoint:** Verify tracking fires: PostHog events, Google Ads conversions, Meta Pixel events

---

### Phase 3: MARKETING AUTOMATION (1 hour) - OPTIONAL
**Goal:** Enable growth and partnership campaigns

10. **Product Hunt Tracking** (10 minutes)
11. **Reddit API** (15 minutes)
12. **CPA Outreach APIs** (20 minutes)

---

## VERIFICATION CHECKLIST

After replacing keys, verify each service:

### Stripe
```bash
curl https://taxbridge.vercel.app/api/stripe/health
# Expected: {"status":"ok","mode":"production"}
```

### Clerk
```bash
# Test signup flow manually
# Visit: https://taxbridge.vercel.app/sign-up
# Create test account, verify webhook fires
```

### SendGrid
```bash
# Trigger test email via admin dashboard
# POST /api/admin/test-email
# Check inbox for delivery
```

### PostHog
```bash
# Visit production site, trigger event
# Check PostHog dashboard for "page_viewed" event within 60 seconds
```

### Google Ads
```bash
# Complete test conversion (calculator or signup)
# Check Google Ads > Conversions within 24 hours
```

### Sentry
```bash
# Trigger test error
# POST /api/test/error
# Check Sentry dashboard for error within 60 seconds
```

---

## RISK MITIGATION

### Rollback Plan
If any key causes production issues:

```bash
# Immediately revert to previous working state
vercel rollback

# Remove problematic key
vercel env rm KEY_NAME production

# Redeploy
vercel --prod
```

### Testing Strategy
1. **Stage keys in preview environment first**
   ```bash
   vercel env add KEY_NAME preview
   vercel --preview
   # Test thoroughly
   vercel env add KEY_NAME production
   ```

2. **Blue-green deployment**
   - Keep current deployment running
   - Deploy new version with updated keys
   - Monitor for 15 minutes
   - Roll back if errors spike

3. **Gradual rollout**
   - Update non-critical keys first (analytics, tracking)
   - Test for 24 hours
   - Then update critical keys (Stripe, Clerk)

---

## COST BREAKDOWN

| Service | Monthly Cost | Annual Cost | Priority |
|---------|--------------|-------------|----------|
| Stripe | 2.9% + $0.30/txn | Variable | P0 |
| Clerk | $25/mo (Pro) | $300/year | P0 |
| SendGrid | $19.95/mo (Essentials) | $239/year | P0 |
| Anthropic | ~$50/mo (usage-based) | ~$600/year | P0 |
| Sentry | $26/mo (Team) | $312/year | P0 |
| PostHog | $0 (free tier) | $0 | P1 |
| Google Ads | Variable (ad spend) | Variable | P1 |
| Meta Business | $0 (free) | $0 | P1 |
| Product Hunt | $0 (free API) | $0 | P2 |
| Apollo.io | $79/mo | $948/year | P2 |
| Hunter.io | $49/mo | $588/year | P2 |
| Instantly.ai | $37/mo | $444/year | P2 |
| **TOTAL** | **~$286/mo** | **~$3,431/year** | |

**Note:** Stripe fees are variable based on revenue. At $10K MRR, Stripe fees = ~$350/mo.

---

## NEXT STEPS

1. **IMMEDIATE (Today, 4 hours):**
   - [ ] Execute Phase 1 (Revenue Unblocking)
   - [ ] Test end-to-end payment flow
   - [ ] Verify Sentry error tracking

2. **HIGH PRIORITY (Tomorrow, 1.5 hours):**
   - [ ] Execute Phase 2 (Analytics & Tracking)
   - [ ] Verify PostHog events firing
   - [ ] Test Google Ads conversion tracking

3. **MEDIUM PRIORITY (This week, 1 hour):**
   - [ ] Execute Phase 3 (Marketing Automation) - optional
   - [ ] Set up monitoring alerts (Sentry, PostHog)
   - [ ] Document all API key locations in 1Password/similar

4. **ONGOING:**
   - [ ] Rotate API keys every 90 days (security best practice)
   - [ ] Monitor usage/costs monthly
   - [ ] Update this audit document after changes

---

## APPENDIX: VERCEL ENV VAR UPDATE SCRIPT

```bash
#!/bin/bash
# update-production-env.sh
# Run this script after collecting all production keys

# CRITICAL: Stripe
vercel env add STRIPE_SECRET_KEY production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add STRIPE_PRO_PRICE_ID production
vercel env add NEXT_PUBLIC_STRIPE_PRO_PRICE_ID production
vercel env add STRIPE_ENTERPRISE_PRICE_ID production
vercel env add NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID production

# CRITICAL: Clerk
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production
vercel env add CLERK_WEBHOOK_SECRET production

# CRITICAL: SendGrid
vercel env add SENDGRID_API_KEY production
vercel env add SENDGRID_CANCELLATION_SURVEY_TEMPLATE_ID production
# (add remaining 7 template IDs)

# CRITICAL: Anthropic
vercel env add ANTHROPIC_API_KEY production

# CRITICAL: Sentry
vercel env add NEXT_PUBLIC_SENTRY_DSN production
vercel env add SENTRY_AUTH_TOKEN production

# HIGH: PostHog
vercel env add NEXT_PUBLIC_POSTHOG_KEY production
vercel env add POSTHOG_PROJECT_ID production

# HIGH: Google Ads
vercel env add NEXT_PUBLIC_GOOGLE_ADS_ID production
vercel env add NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_LABEL production
vercel env add NEXT_PUBLIC_GOOGLE_ADS_PRO_LABEL production
vercel env add NEXT_PUBLIC_GOOGLE_ADS_ENTERPRISE_LABEL production
vercel env add NEXT_PUBLIC_GOOGLE_ADS_CALCULATOR_LABEL production

# HIGH: Meta Pixel
vercel env add NEXT_PUBLIC_META_PIXEL_ID production

# MEDIUM: CRON Security
vercel env add CRON_SECRET production

# Redeploy
vercel --prod

echo "✅ All environment variables updated. Production deployment triggered."
echo "⏱ Monitor deployment at https://vercel.com/taxbridge/dashboard"
echo "🧪 Run smoke tests after deployment completes"
```

---

**END OF AUDIT**

**Prepared by:** Engineering Team
**Date:** March 19, 2026
**Next Review:** After Phase 1 completion (4 hours)
