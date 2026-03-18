# Production Deployment Checklist

## Pre-Deployment

### Stripe Configuration
- [ ] Stripe account fully verified (business details, bank account, tax info)
- [ ] Production API keys obtained (sk_live_ and pk_live_)
- [ ] Products created in live mode (run `npm run stripe:quickstart`)
- [ ] Live price IDs generated (price_...)
- [ ] Webhook endpoint configured (https://taxbridge.app/api/stripe/webhook)
- [ ] Webhook secret obtained (whsec_...)
- [ ] All 6 webhook events selected:
  - [ ] checkout.session.completed
  - [ ] customer.subscription.created
  - [ ] customer.subscription.updated
  - [ ] customer.subscription.deleted
  - [ ] invoice.payment_succeeded
  - [ ] invoice.payment_failed

### Environment Variables

#### Vercel Dashboard Setup
Go to: Vercel → Project → Settings → Environment Variables

**Stripe (Production - CRITICAL)**
- [ ] `STRIPE_SECRET_KEY` = sk_live_...
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = pk_live_...
- [ ] `STRIPE_WEBHOOK_SECRET` = whsec_...
- [ ] `STRIPE_PRO_PRICE_ID` = price_...
- [ ] `STRIPE_ENTERPRISE_PRICE_ID` = price_...
- [ ] `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` = price_...
- [ ] `NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID` = price_...

**App Configuration**
- [ ] `NEXT_PUBLIC_APP_URL` = https://taxbridge.app
- [ ] `DATABASE_PATH` = ./data/taxbridge.db

**Clerk Authentication (Production)**
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = pk_live_...
- [ ] `CLERK_SECRET_KEY` = sk_live_...
- [ ] `CLERK_WEBHOOK_SECRET` = whsec_...

**Anthropic AI**
- [ ] `ANTHROPIC_API_KEY` = sk-ant-api03-...

**SendGrid Email**
- [ ] `SENDGRID_API_KEY` = SG....
- [ ] `SENDGRID_FROM_EMAIL` = noreply@taxbridge.app
- [ ] `SENDGRID_FROM_NAME` = TaxBridge
- [ ] `SENDGRID_REPLY_TO` = support@taxbridge.app
- [ ] `SENDGRID_CANCELLATION_SURVEY_TEMPLATE_ID` = d-...

**Analytics & Monitoring**
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` = phc_...
- [ ] `NEXT_PUBLIC_POSTHOG_HOST` = https://app.posthog.com
- [ ] `NEXT_PUBLIC_SENTRY_DSN` = https://...
- [ ] `SENTRY_AUTH_TOKEN` = ...
- [ ] `NEXT_PUBLIC_GOOGLE_ADS_ID` = AW-...
- [ ] `NEXT_PUBLIC_META_PIXEL_ID` = ...

**Security**
- [ ] `CRON_SECRET` = (generate with: openssl rand -hex 32)
- [ ] `ADMIN_EMAILS` = admin@taxbridge.app,michael@taxbridge.app

### Code Verification
- [ ] Run `npm run verify:stripe` locally (with production .env.production)
- [ ] All tests passing: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] No console errors in development mode
- [ ] TypeScript types check: `npx tsc --noEmit`

### Domain & SSL
- [ ] Custom domain configured in Vercel: taxbridge.app
- [ ] SSL certificate auto-generated and active
- [ ] www.taxbridge.app redirects to taxbridge.app
- [ ] DNS records configured correctly

## Deployment

### Deploy to Production
```bash
git add .
git commit -m "Configure Stripe production mode and live payment flow"
git push origin main
```

**OR** via Vercel CLI:
```bash
vercel --prod
```

### Post-Deployment Verification
- [ ] Deployment succeeded (green checkmark in Vercel)
- [ ] No build errors
- [ ] Function logs show no errors
- [ ] Environment variables loaded correctly (check Vercel function logs)

## Testing (CRITICAL)

### Stripe Payment Flow
1. [ ] Go to https://taxbridge.app/pricing
2. [ ] Click "Start 7-Day Free Trial" on Pro plan
3. [ ] Verify checkout page loads (Stripe hosted)
4. [ ] **Use real credit card** (test cards won't work in live mode)
   - Recommendation: Use your own card, complete payment, then cancel immediately
5. [ ] Verify payment succeeds
6. [ ] Verify redirect to /dashboard?upgrade=success
7. [ ] Verify user tier updated to "pro" in database
8. [ ] Verify Stripe dashboard shows successful payment
9. [ ] Verify webhook event shows "Succeeded" in Stripe dashboard

### Webhook Testing
1. [ ] Go to https://dashboard.stripe.com/webhooks
2. [ ] Select your webhook endpoint
3. [ ] Find recent `checkout.session.completed` event
4. [ ] Status should be "Succeeded" (green checkmark)
5. [ ] If failed, check:
   - [ ] Endpoint URL matches exactly: https://taxbridge.app/api/stripe/webhook
   - [ ] Webhook secret matches Vercel environment variable
   - [ ] Check Vercel function logs for errors

### Subscription Management
- [ ] Test subscription shows in Stripe dashboard under "Subscriptions"
- [ ] Test cancellation flow (Stripe customer portal)
- [ ] Verify webhook fires on cancellation
- [ ] Verify user downgraded to "free" tier after cancellation

### Error Handling
- [ ] Test with declined card (if possible in test environment)
- [ ] Verify error messages display correctly
- [ ] Verify failed payments logged in Stripe dashboard

## Monitoring Setup

### Stripe Dashboard
- [ ] Set up email alerts for:
  - [ ] Failed payments
  - [ ] Disputed charges
  - [ ] Webhook failures
- [ ] Enable Stripe Radar (fraud prevention)
- [ ] Configure Smart Retries for failed payments

### Application Monitoring
- [ ] Sentry error tracking active
- [ ] PostHog analytics tracking events:
  - [ ] pricing_page_viewed
  - [ ] checkout_started
  - [ ] checkout_completed
  - [ ] subscription_activated
- [ ] Google Ads conversion tracking firing
- [ ] Meta Pixel events tracking

### Revenue Tracking
- [ ] Set up daily revenue email reports from Stripe
- [ ] Connect Stripe to accounting software (QuickBooks/Xero)
- [ ] Create MRR dashboard (Monthly Recurring Revenue)

## Security Checklist

- [ ] All API keys are sk_live_ or pk_live_ (not test keys)
- [ ] Webhook secret is whsec_... format
- [ ] Environment variables ONLY in Vercel Dashboard (not in code)
- [ ] .env.production NOT committed to Git (contains sensitive data)
- [ ] CRON_SECRET is a strong random string
- [ ] HTTPS enforced (Vercel handles this automatically)
- [ ] Security headers configured (check vercel.json)

## Rollback Plan

If critical issues occur after deployment:

### Immediate Rollback
```bash
# Via Vercel Dashboard
1. Go to Deployments tab
2. Find previous successful deployment
3. Click "⋯" menu → "Promote to Production"
```

```bash
# Via Vercel CLI
vercel rollback
```

### Temporary Disable Payments
If Stripe issues occur but app is otherwise working:

1. Set environment variable in Vercel:
   ```
   STRIPE_PAYMENTS_DISABLED=true
   ```
2. Show maintenance message on pricing page
3. Investigate and fix root cause
4. Remove flag when fixed

## Go-Live Announcement

After successful deployment and testing:

- [ ] Announce on social media (Twitter, LinkedIn)
- [ ] Send email to beta users about live payments
- [ ] Update website banner: "Now accepting payments!"
- [ ] Monitor first 24 hours closely for any issues

## Revenue Milestones

Track progress toward $1M annual revenue target:

| Milestone | Subscriptions | MRR | ARR | Timeline |
|-----------|---------------|-----|-----|----------|
| First Sale | 1 Pro | $25 | $299 | Day 1 |
| $1K MRR | 40 Pro | $1,000 | $12,000 | Month 1 |
| $5K MRR | 200 Pro + 5 Ent | $5,000 | $60,000 | Month 3 |
| $10K MRR | 350 Pro + 15 Ent | $10,000 | $120,000 | Month 6 |
| $50K MRR | 1,500 Pro + 100 Ent | $50,000 | $600,000 | Month 12 |
| $83K MRR | 2,500 Pro + 200 Ent | $83,000 | $1,000,000 | Month 18 |

## Support Resources

- **Stripe Support**: https://support.stripe.com
- **Vercel Support**: https://vercel.com/support
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Documentation**: See STRIPE_PRODUCTION_SETUP.md

---

**IMPORTANT**: Keep this checklist updated as you deploy. Check off items as you complete them.

**Last Updated**: {{ current_date }}
**Deployed By**: {{ deployer_name }}
**Production URL**: https://taxbridge.app
