# API KEYS REPLACEMENT CHECKLIST
**Date:** March 19, 2026
**Estimated Time:** 4-6 hours
**Printable Action List**

---

## PHASE 1: REVENUE UNBLOCKING (4 hours)

### 1. STRIPE - Enable Payments (2 hours)

#### Step 1: Get Live API Keys (30 min)
- [ ] Go to https://dashboard.stripe.com/apikeys
- [ ] Toggle to **"Production"** mode (top right corner)
- [ ] Copy **Secret Key** (starts with `sk_live_...`)
  - Value: _______________________________________________
- [ ] Copy **Publishable Key** (starts with `pk_live_...`)
  - Value: _______________________________________________

#### Step 2: Create Products & Prices (45 min)
- [ ] Open terminal in project directory
- [ ] Export Stripe key: `export STRIPE_SECRET_KEY=sk_live_YOUR_KEY`
- [ ] Run setup script: `npx tsx scripts/activate-stripe-production-annual.ts`
- [ ] Copy **Pro Price ID** from output (starts with `price_...`)
  - Value: _______________________________________________
- [ ] Copy **Enterprise Product ID** from output (starts with `prod_...`)
  - Value: _______________________________________________

#### Step 3: Configure Webhook (15 min)
- [ ] Go to https://dashboard.stripe.com/webhooks
- [ ] Click **"Add endpoint"**
- [ ] Endpoint URL: `https://taxbridge.vercel.app/api/stripe/webhook`
- [ ] Select events:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_failed`
- [ ] Click **"Add endpoint"**
- [ ] Click on newly created webhook → Reveal **Signing Secret**
- [ ] Copy **Webhook Secret** (starts with `whsec_...`)
  - Value: _______________________________________________

#### Step 4: Update Vercel Environment Variables (15 min)
```bash
vercel env add STRIPE_SECRET_KEY production
# Paste: sk_live_...

vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
# Paste: pk_live_...

vercel env add STRIPE_WEBHOOK_SECRET production
# Paste: whsec_...

vercel env add STRIPE_PRO_PRICE_ID production
# Paste: price_...

vercel env add NEXT_PUBLIC_STRIPE_PRO_PRICE_ID production
# Paste: price_... (same as above)

vercel env add STRIPE_ENTERPRISE_PRICE_ID production
# Paste: prod_...

vercel env add NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID production
# Paste: prod_... (same as above)
```

- [ ] All 7 Stripe env vars added to Vercel
- [ ] Redeploy: `vercel --prod`

#### Step 5: Test Payment Flow (15 min)
- [ ] Visit https://taxbridge.vercel.app/pricing
- [ ] Click **"Subscribe"** on Pro plan
- [ ] Use test card: **4242 4242 4242 4242**
- [ ] Complete checkout
- [ ] Verify success message appears
- [ ] Go to Stripe dashboard → Payments
- [ ] Verify test payment appears
- [ ] **IMMEDIATELY REFUND** test payment

✅ **Stripe complete - Revenue unblocked!**

---

### 2. CLERK - Enable Authentication (30 min)

#### Step 1: Get Production Keys (10 min)
- [ ] Go to https://dashboard.clerk.com
- [ ] Select your TaxBridge app
- [ ] Click **"API Keys"** in sidebar
- [ ] Toggle to **"Production"** (top right)
- [ ] Copy **Publishable Key** (starts with `pk_live_...`)
  - Value: _______________________________________________
- [ ] Copy **Secret Key** (starts with `sk_live_...`)
  - Value: _______________________________________________

#### Step 2: Create Webhook (10 min)
- [ ] Click **"Webhooks"** in Clerk dashboard sidebar
- [ ] Click **"Add Endpoint"**
- [ ] Endpoint URL: `https://taxbridge.vercel.app/api/webhooks/clerk`
- [ ] Select events:
  - [ ] `user.created`
  - [ ] `user.updated`
  - [ ] `session.created`
- [ ] Click **"Create"**
- [ ] Copy **Webhook Secret** (starts with `whsec_...`)
  - Value: _______________________________________________

#### Step 3: Update Vercel (10 min)
```bash
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
# Paste: pk_live_...

vercel env add CLERK_SECRET_KEY production
# Paste: sk_live_...

vercel env add CLERK_WEBHOOK_SECRET production
# Paste: whsec_...
```

- [ ] All 3 Clerk env vars added to Vercel
- [ ] Redeploy: `vercel --prod`

#### Step 4: Test Authentication
- [ ] Visit https://taxbridge.vercel.app/sign-up
- [ ] Create test account with your email
- [ ] Verify email confirmation sent
- [ ] Complete signup
- [ ] Verify you're redirected to `/onboarding`
- [ ] Check Clerk dashboard → Users for new user

✅ **Clerk complete - Authentication working!**

---

### 3. SENDGRID - Enable Email (1.5 hours)

#### Step 1: Get API Key (5 min)
- [ ] Go to https://app.sendgrid.com/settings/api_keys
- [ ] Click **"Create API Key"**
- [ ] Name: "TaxBridge Production"
- [ ] Permissions: **"Full Access"**
- [ ] Copy API Key (starts with `SG.`)
  - Value: _______________________________________________
  - **SAVE THIS - It's shown only once!**

#### Step 2: Verify Domain (30 min)
- [ ] Go to Settings → **Sender Authentication** → **Verify a Domain**
- [ ] Enter domain: `taxbridge.app`
- [ ] Copy DNS records provided (3-4 records)
- [ ] Add records to your domain DNS (CloudFlare/Namecheap/etc):
  - [ ] TXT record: `_sendgrid...`
  - [ ] CNAME record: `s1._domainkey...`
  - [ ] CNAME record: `s2._domainkey...`
- [ ] Wait 10-30 minutes for DNS propagation
- [ ] Click **"Verify"** in SendGrid
- [ ] Verify status shows **"Verified"**

#### Step 3: Create Email Templates (45 min)
- [ ] Go to Email API → **Dynamic Templates** → **Create a Dynamic Template**

**Template 1: Cancellation Survey**
- [ ] Name: "Cancellation Survey"
- [ ] Click **"Add Version"** → **Blank Template** → **Code Editor**
- [ ] Design email with 3 questions survey
- [ ] Copy Template ID (starts with `d-`)
  - Value: _______________________________________________

**Template 2: Day 1 Welcome Email**
- [ ] Name: "Nurture Day 1 - Welcome"
- [ ] Design welcome email with calculator tips
- [ ] Copy Template ID: _______________________________________________

**Template 3: Day 3 Education Email**
- [ ] Name: "Nurture Day 3 - Education"
- [ ] Design educational email
- [ ] Copy Template ID: _______________________________________________

**Template 4: Day 5 Social Proof Email**
- [ ] Name: "Nurture Day 5 - Social Proof"
- [ ] Design email with case studies/testimonials
- [ ] Copy Template ID: _______________________________________________

**Template 5: Day 7 Urgency Email**
- [ ] Name: "Nurture Day 7 - Urgency"
- [ ] Design limited-time offer email
- [ ] Copy Template ID: _______________________________________________

**Template 6: Re-engagement Email**
- [ ] Name: "Re-engagement Win-back"
- [ ] Design win-back email for inactive users
- [ ] Copy Template ID: _______________________________________________

**Template 7: Testimonial Request**
- [ ] Name: "Testimonial Request"
- [ ] Design email requesting testimonials
- [ ] Copy Template ID: _______________________________________________

**Template 8: Feedback Request**
- [ ] Name: "Feedback Request"
- [ ] Design customer feedback email
- [ ] Copy Template ID: _______________________________________________

#### Step 4: Update Vercel (10 min)
```bash
vercel env add SENDGRID_API_KEY production
# Paste: SG.xxx

vercel env add SENDGRID_FROM_EMAIL production
# Enter: noreply@taxbridge.app

vercel env add SENDGRID_FROM_NAME production
# Enter: TaxBridge

vercel env add SENDGRID_REPLY_TO production
# Enter: support@taxbridge.app

vercel env add SENDGRID_CANCELLATION_SURVEY_TEMPLATE_ID production
# Paste: d-xxx (Template 1 ID)

# Add remaining 7 template IDs
# (Use variable names from .env.production file)
```

- [ ] All 12 SendGrid env vars added to Vercel
- [ ] Redeploy: `vercel --prod`

#### Step 5: Test Email Sending
- [ ] Trigger test email via admin dashboard or API
- [ ] Check your inbox for delivery
- [ ] Verify email renders correctly

✅ **SendGrid complete - Emails working!**

---

### 4. ANTHROPIC AI - Enable AI Tax Advisor (10 min)

- [ ] Go to https://console.anthropic.com/settings/keys
- [ ] Click **"Create Key"**
- [ ] Name: "TaxBridge Production"
- [ ] Copy API Key (starts with `sk-ant-api03-...`)
  - Value: _______________________________________________

```bash
vercel env add ANTHROPIC_API_KEY production
# Paste: sk-ant-api03-...
```

- [ ] Redeploy: `vercel --prod`

✅ **Anthropic complete - AI advisor working!**

---

### 5. SENTRY - Enable Error Monitoring (20 min)

#### Step 1: Create Project (10 min)
- [ ] Go to https://sentry.io (sign up if needed)
- [ ] Click **"Create Project"**
- [ ] Select platform: **"Next.js"**
- [ ] Project name: "cross-border-tax"
- [ ] Team: "taxbridge"
- [ ] Click **"Create Project"**
- [ ] Copy **DSN** from project settings
  - Value: _______________________________________________

#### Step 2: Generate Auth Token (5 min)
- [ ] Go to Settings → **Auth Tokens**
- [ ] Click **"Create New Token"**
- [ ] Name: "TaxBridge Production"
- [ ] Scopes: **"project:write"**
- [ ] Copy auth token (starts with `sntrys_...`)
  - Value: _______________________________________________

#### Step 3: Update Vercel (5 min)
```bash
vercel env add NEXT_PUBLIC_SENTRY_DSN production
# Paste: https://xxx@oXXX.ingest.sentry.io/XXX

vercel env add SENTRY_AUTH_TOKEN production
# Paste: sntrys_...

vercel env add SENTRY_ORG production
# Enter: taxbridge

vercel env add SENTRY_PROJECT production
# Enter: cross-border-tax
```

- [ ] Redeploy: `vercel --prod`

#### Step 4: Test Error Tracking
- [ ] Trigger test error: `curl https://taxbridge.vercel.app/api/test/error`
- [ ] Check Sentry dashboard → Issues
- [ ] Verify error appears within 60 seconds

✅ **Sentry complete - Error monitoring working!**

---

## 🎉 PHASE 1 COMPLETE - REVENUE UNBLOCKED!

**Checkpoint:** Your site can now:
- ✅ Accept real payments via Stripe
- ✅ Authenticate users with Clerk
- ✅ Send transactional emails
- ✅ Power AI tax advisor
- ✅ Track and debug errors

**Total time:** ~4 hours
**Revenue capability:** $1M+ annual potential unlocked

---

## PHASE 2: ANALYTICS & TRACKING (1.5 hours) - OPTIONAL

### 6. POSTHOG - Conversion Funnel Tracking (15 min)

- [ ] Go to https://app.posthog.com (sign up if needed)
- [ ] Create new project: "TaxBridge"
- [ ] Go to Project Settings
- [ ] Copy **Project API Key** (starts with `phc_...`)
  - Value: _______________________________________________
- [ ] Copy **Project ID** (numeric, from URL or settings)
  - Value: _______________________________________________

```bash
vercel env add NEXT_PUBLIC_POSTHOG_KEY production
vercel env add POSTHOG_PROJECT_ID production
```

- [ ] Redeploy: `vercel --prod`
- [ ] Visit production site
- [ ] Check PostHog dashboard for "page_viewed" event within 60s

✅ **PostHog complete!**

---

### 7. GOOGLE ADS - Conversion Tracking (30 min)

- [ ] Go to https://ads.google.com
- [ ] Tools → **Conversions** → **+ New Conversion Action**
- [ ] Select **"Website"**

**Create 4 conversion actions:**

**Conversion 1: Signup**
- [ ] Name: "Signup"
- [ ] Category: "Lead"
- [ ] Value: $50
- [ ] Copy conversion ID: `AW-XXXXXXXXXX`
  - Value: _______________________________________________
- [ ] Copy label for Signup
  - Value: _______________________________________________

**Conversion 2: Pro Subscription**
- [ ] Name: "Pro Subscription"
- [ ] Category: "Purchase"
- [ ] Value: $79
- [ ] Copy label for Pro
  - Value: _______________________________________________

**Conversion 3: Enterprise Demo**
- [ ] Name: "Enterprise Demo Request"
- [ ] Category: "Lead"
- [ ] Value: $500
- [ ] Copy label for Enterprise
  - Value: _______________________________________________

**Conversion 4: Calculator Use**
- [ ] Name: "Calculator Use"
- [ ] Category: "Micro-conversion"
- [ ] Value: $0
- [ ] Copy label for Calculator
  - Value: _______________________________________________

```bash
vercel env add NEXT_PUBLIC_GOOGLE_ADS_ID production
vercel env add NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_LABEL production
vercel env add NEXT_PUBLIC_GOOGLE_ADS_PRO_LABEL production
vercel env add NEXT_PUBLIC_GOOGLE_ADS_ENTERPRISE_LABEL production
vercel env add NEXT_PUBLIC_GOOGLE_ADS_CALCULATOR_LABEL production
```

- [ ] Redeploy: `vercel --prod`

✅ **Google Ads complete!**

---

### 8. META PIXEL - Facebook Retargeting (20 min)

- [ ] Go to https://business.facebook.com
- [ ] Events Manager → **Data Sources** → **Pixels** → **Add**
- [ ] Name: "TaxBridge Pixel"
- [ ] Copy **Pixel ID** (15-digit number)
  - Value: _______________________________________________

```bash
vercel env add NEXT_PUBLIC_META_PIXEL_ID production
```

- [ ] Redeploy: `vercel --prod`

✅ **Meta Pixel complete!**

---

### 9. CRON SECURITY - Secure Cron Endpoints (5 min)

- [ ] Generate random string: `openssl rand -hex 32`
- [ ] Copy output:
  - Value: _______________________________________________

```bash
vercel env add CRON_SECRET production
```

- [ ] Redeploy: `vercel --prod`

✅ **CRON security complete!**

---

## 🎉 PHASE 2 COMPLETE - ANALYTICS ENABLED!

Your site now tracks:
- ✅ Conversion funnel (PostHog)
- ✅ Google Ads ROI
- ✅ Facebook retargeting audiences
- ✅ Secure cron jobs

---

## FINAL VERIFICATION

### End-to-End Smoke Test
- [ ] Visit https://taxbridge.vercel.app
- [ ] Homepage loads ✅
- [ ] Calculator works ✅
- [ ] Pricing page loads ✅
- [ ] Sign up creates account ✅
- [ ] Checkout accepts payment ✅
- [ ] Email confirmation received ✅
- [ ] Dashboard accessible ✅
- [ ] Check Sentry: No errors ✅
- [ ] Check PostHog: Events tracked ✅
- [ ] Check Stripe: Payment recorded ✅

---

## COMPLETION CHECKLIST

- [ ] Phase 1 complete (4 hours) - Revenue unblocked
- [ ] Phase 2 complete (1.5 hours) - Analytics enabled
- [ ] Full smoke test passed
- [ ] All placeholder keys replaced
- [ ] Documentation updated
- [ ] 1Password/secrets manager updated with all keys
- [ ] Team notified of go-live

---

**🚀 PRODUCTION-READY STATUS: ACHIEVED**

**Prepared by:** Engineering Team
**Date:** March 19, 2026
**Completion Date:** _______________
**Sign-off:** _______________
