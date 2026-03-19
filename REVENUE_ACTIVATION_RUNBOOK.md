# Revenue Activation Runbook - Go Live with Stripe Payments

**Target:** Activate $49/year Pro plan subscription revenue stream
**Deadline:** March 21, 2026
**Assigned To:** CFO + CMO
**Status:** ⚠️ BLOCKED - Production build hangs (must fix first)

---

## 🚨 CRITICAL BLOCKER

**Issue:** `npm run build` hangs during "Creating an optimized production build" phase
**Impact:** Cannot deploy to production without successful build
**Root Cause:** Unknown - hangs even with Sentry and package optimization disabled
**Next Steps:**
- Investigate circular dependencies
- Check for infinite loops in build-time code
- Try isolating problematic routes/components
- Consider using Vercel CLI for remote build as workaround

**Fix Owner:** CTO
**Required Before:** Revenue activation can proceed

---

## Prerequisites Checklist

Before executing revenue activation:

- [ ] **Production build succeeds** (`npm run build` completes without hanging)
- [ ] **Staging deployment complete** (deployed to Vercel staging environment)
- [ ] **Quality gates passed:**
  - [ ] All critical user flows tested
  - [ ] Payment flow tested end-to-end
  - [ ] Error boundaries working
  - [ ] Analytics tracking verified (PostHog + Google Ads + Meta Pixel)
  - [ ] SEO meta tags verified
  - [ ] Mobile responsiveness confirmed
- [ ] **Legal compliance:**
  - [ ] Terms of Service published
  - [ ] Privacy Policy published
  - [ ] Subscription cancellation policy clear
- [ ] **Support readiness:**
  - [ ] Support email active (support@taxbridge.app)
  - [ ] Cancellation survey configured (SendGrid template)
  - [ ] Refund policy documented

---

## Execution Steps

### Phase 1: Enable Stripe Live Mode (30 minutes)

1. **Switch to Stripe Live Mode**
   ```bash
   # Go to: https://dashboard.stripe.com/apikeys
   # Toggle from "Test mode" to "Live mode" (top-right switch)
   ```

2. **Get Live API Keys**
   - Copy `Publishable key` → starts with `pk_live_`
   - Copy `Secret key` → starts with `sk_live_` (NEVER commit to git!)

3. **Create Live Product & Price**
   ```bash
   # Set environment variables for the script
   export STRIPE_SECRET_KEY="sk_live_YOUR_KEY_HERE"
   export STRIPE_PUBLISHABLE_KEY="pk_live_YOUR_KEY_HERE"

   # Run setup script to create Pro plan
   npm run stripe:setup-live

   # Expected output:
   # ✓ Product created: prod_XXXXX
   # ✓ Price created: price_XXXXX ($49/year)
   #
   # Add to .env.production:
   # STRIPE_PRO_PRICE_ID=price_XXXXX
   ```

4. **Set Up Webhook Endpoint**
   - Go to: https://dashboard.stripe.com/webhooks
   - Click "Add endpoint"
   - **URL:** `https://taxbridge.app/api/stripe/webhook`
   - **Events to listen to:**
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Click "Add endpoint"
   - Copy the **Signing secret** (starts with `whsec_`)

5. **Update Production Environment Variables**

   Update `.env.production` (or Vercel environment variables):

   ```bash
   # Stripe Live Mode Keys
   STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

   # Live Price IDs
   STRIPE_PRO_PRICE_ID=price_YOUR_LIVE_PRICE_ID
   NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_YOUR_LIVE_PRICE_ID

   # Production Domain
   NEXT_PUBLIC_APP_URL=https://taxbridge.app
   ```

6. **Deploy to Production**
   ```bash
   # Commit environment variable changes (encrypted in Vercel dashboard)
   # DO NOT commit actual keys to git

   # Deploy via Vercel
   vercel --prod

   # Or push to main branch for auto-deployment
   git push origin main
   ```

7. **Verify Payment Flow**
   - Visit: https://taxbridge.app/pricing
   - Click "Subscribe to Pro"
   - **Use Stripe test card:** 4242 4242 4242 4242
   - Complete checkout
   - Verify:
     - [ ] Redirect to /dashboard after success
     - [ ] Subscription status shows "Pro"
     - [ ] Stripe Dashboard shows completed payment
     - [ ] PostHog event captured: `subscription_activated`
     - [ ] User receives confirmation email (if configured)

---

### Phase 2: Update Pricing Page CTA (15 minutes)

1. **Add Pro Plan CTA**

   Edit `app/pricing/page.tsx`:

   ```tsx
   // Highlight the $49/year Pro plan as recommended
   <div className="relative">
     <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
       <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
         ⭐ Recommended
       </span>
     </div>

     <Card className="border-2 border-blue-600">
       {/* Pro plan content */}
       <Button className="w-full bg-blue-600 hover:bg-blue-700">
         Start Pro Trial (14 days free)
       </Button>
     </Card>
   </div>
   ```

2. **Add Social Proof**
   ```tsx
   <div className="mt-4 text-center text-sm text-muted-foreground">
     <p>💳 Cancel anytime • No credit card required for trial</p>
     <p className="mt-1">✨ Join 127+ H-1B/TN workers saving $2,400/year</p>
   </div>
   ```

3. **Add Exit-Intent Popup (if not present)**
   - Trigger when user moves cursor to exit browser
   - Offer: "Wait! Get 20% off your first year - Use code WELCOME20"
   - Convert abandoning users into paying customers

---

### Phase 3: Revenue Monitoring Setup (45 minutes)

1. **Stripe Dashboard Setup**
   - Go to: https://dashboard.stripe.com/settings/dashboard
   - Pin these widgets to dashboard:
     - **MRR (Monthly Recurring Revenue)**
     - **New Subscriptions (last 7 days)**
     - **Churn Rate**
     - **Failed Payments**
   - Set up email alerts:
     - Daily revenue summary (8 AM PT)
     - Failed payment notifications (immediate)
     - Subscription cancellations (immediate)

2. **PostHog Funnel Setup**
   - Go to: https://app.posthog.com
   - Create conversion funnel:
     ```
     1. landing_page_viewed
     2. pricing_page_viewed
     3. checkout_started
     4. subscription_activated
     ```
   - Set goal: **10% conversion rate** (landing → paid)
   - Enable session recordings for drop-off analysis

3. **Google Ads Conversion Tracking**
   - Verify `gtag('event', 'conversion', ...)` fires on checkout success
   - Test with Google Tag Assistant Chrome extension
   - Expected conversion value: $49 (annual Pro plan)

4. **Create Revenue Dashboard**

   Create `app/admin/revenue/page.tsx`:

   ```tsx
   // Real-time revenue metrics dashboard
   // - MRR (Monthly Recurring Revenue)
   // - ARR (Annual Recurring Revenue)
   // - LTV (Customer Lifetime Value)
   // - CAC (Customer Acquisition Cost)
   // - Churn Rate %
   // - Revenue per visitor
   //
   // Data sources:
   // - Stripe API for subscription data
   // - PostHog API for traffic metrics
   // - Google Ads API for ad spend (CAC calculation)
   ```

5. **Set Revenue Targets**
   - **Week 1:** 10 paying customers ($490 MRR)
   - **Month 1:** 50 paying customers ($2,450 MRR)
   - **Month 3:** 200 paying customers ($9,800 MRR)
   - **Year 1:** 1,000 customers ($49,000 MRR = $588k ARR)

---

### Phase 4: First 48 Hours Monitoring (CMO Lead)

**Critical Monitoring Period:** First 48 hours after going live

1. **Hour 0-6: Launch & Immediate Monitoring**
   - [ ] Announce launch on ProductHunt
   - [ ] Post on Reddit r/h1b, r/PersonalFinanceCanada
   - [ ] Email existing free users (if any) about Pro launch
   - [ ] Monitor Stripe Dashboard every 30 minutes
   - [ ] Check for error spikes in Sentry
   - [ ] Verify webhook delivery (Stripe → your server)

2. **Hour 6-24: Early Conversion Tracking**
   - [ ] Track first 10 signups
     - Conversion source (ProductHunt / Reddit / Organic)?
     - Time from signup to payment decision?
     - Drop-off points in funnel?
   - [ ] Monitor PostHog session recordings
     - Are users confused by pricing?
     - Do they abandon at checkout?
     - Are payment errors occurring?
   - [ ] Respond to customer questions within 15 minutes

3. **Hour 24-48: Optimization Phase**
   - [ ] A/B test pricing page headlines
   - [ ] Adjust CTA copy based on feedback
   - [ ] Fix any discovered bugs IMMEDIATELY
   - [ ] Send personalized thank-you email to first 10 customers
   - [ ] Ask for testimonials/feedback
   - [ ] Calculate actual conversion rate vs. 10% target

4. **Red Flags to Watch For**
   - 🚨 **CRITICAL:** Failed payments (card declined, insufficient funds)
     - Action: Follow up within 1 hour, offer to retry
   - 🚨 **CRITICAL:** High bounce rate on pricing page (>80%)
     - Action: Review page speed, clarity of pricing tiers
   - ⚠️ **WARNING:** Low trial-to-paid conversion (<20%)
     - Action: Add more value in trial period, improve onboarding
   - ⚠️ **WARNING:** Same-day cancellations
     - Action: Trigger immediate email asking why, offer discount

---

## Success Metrics

**Primary KPI:** $490 MRR by March 28, 2026 (10 paying customers)

**Secondary KPIs:**
- **Conversion Rate:** 5-10% (visitors → paid)
- **Trial Conversion:** 30-40% (trial → paid)
- **Churn Rate:** <5% monthly
- **Average LTV:** $147 (3 years × $49/year)
- **CAC (target):** <$50 per customer

---

## Rollback Plan

If critical issues occur within first 48 hours:

1. **Pause New Signups**
   - Add banner: "We're experiencing high demand. New signups resume March XX."
   - Prevents more customers from hitting the bug

2. **Disable Stripe Checkout**
   - Comment out pricing page CTAs temporarily
   - Or set environment variable: `PAYMENTS_ENABLED=false`

3. **Issue Refunds if Necessary**
   - Go to Stripe Dashboard → Payments
   - Select payment → Click "Refund"
   - Send apology email with explanation + discount code

4. **Fix & Redeploy**
   - Fix the bug in staging
   - Test payment flow 10 times manually
   - Redeploy to production
   - Re-enable signups

5. **Communicate Transparently**
   - Email affected customers with update
   - Post status on homepage: "Issue resolved ✓"
   - Offer 1 month free for inconvenience

---

## Post-Launch Tasks (Week 1)

- [ ] Send personalized welcome emails to first 20 customers
- [ ] Request testimonials/reviews
- [ ] Set up automated drip campaign for trial users
- [ ] Create referral program (10% discount for referrer + referee)
- [ ] Write blog post: "How We Launched TaxBridge Pro"
- [ ] Monitor customer support volume (expect 5-10 questions/day)
- [ ] Calculate actual CAC from ad spend
- [ ] Optimize payment page based on drop-off data

---

## Notes

- **DO NOT** share live Stripe API keys in Slack, email, or code repositories
- **DO** test payment flow on staging environment before going live
- **DO** have rollback plan ready in case of critical bugs
- **DO** respond to customer questions within 1 hour during launch weekend

**This runbook is ready for execution once the production build blocker is resolved.**

---

**Last Updated:** March 18, 2026
**Next Review:** March 21, 2026 (post-launch)
