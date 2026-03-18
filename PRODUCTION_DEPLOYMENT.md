# Production Deployment Checklist

Complete checklist for deploying TaxBridge to production with live Stripe payments.

## Pre-Deployment Checklist

### 1. Stripe Production Setup

- [ ] Create Stripe account at https://stripe.com
- [ ] Complete business verification
- [ ] Connect bank account for payouts
- [ ] Get production API keys (sk_live_, pk_live_)
- [ ] Run `npm run setup:stripe` to create products
- [ ] Set up webhook endpoint in Stripe Dashboard
- [ ] Update .env.local with production Stripe keys
- [ ] Run `npm run verify:stripe` to validate configuration

### 2. Authentication (Clerk)

- [ ] Create Clerk account at https://clerk.com
- [ ] Set up production instance
- [ ] Configure sign-in/sign-up pages
- [ ] Get production API keys
- [ ] Set up webhook for user sync
- [ ] Update .env.local with Clerk keys

### 3. Email (SendGrid)

- [ ] Create SendGrid account at https://sendgrid.com
- [ ] Verify sender email domain
- [ ] Create API key
- [ ] Create dynamic email templates
- [ ] Update .env.local with SendGrid keys
- [ ] Test email delivery

### 4. AI Features (Anthropic)

- [ ] Create Anthropic account at https://console.anthropic.com
- [ ] Get API key
- [ ] Set usage limits
- [ ] Update .env.local with Anthropic key

### 5. Database

- [ ] Run all migrations: `npm run db:migrate`
- [ ] Verify schema: `npm run db:schema`
- [ ] Backup database before deployment
- [ ] Set production DATABASE_PATH

### 6. Environment Variables

- [ ] Copy .env.production.template to .env.local
- [ ] Fill in all production values
- [ ] Never commit .env.local to git
- [ ] Verify with `npm run verify:stripe`

## Deployment Steps

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Set environment variables
vercel env add STRIPE_SECRET_KEY production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add STRIPE_PRO_PRICE_ID production
vercel env add STRIPE_ENTERPRISE_PRICE_ID production
vercel env add NEXT_PUBLIC_STRIPE_PRO_PRICE_ID production
vercel env add NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID production
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add CLERK_SECRET_KEY production
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_WEBHOOK_SECRET production
vercel env add SENDGRID_API_KEY production
vercel env add ANTHROPIC_API_KEY production
vercel env add CRON_SECRET production
vercel env add ADMIN_EMAILS production

# Redeploy with environment variables
vercel --prod
```

### Option 2: Manual Deploy

1. Build the application:
   ```bash
   npm run build
   ```

2. Set environment variables on your hosting platform

3. Deploy the `.next` directory

4. Start the production server:
   ```bash
   npm run start
   ```

## Post-Deployment Verification

### 1. Test Stripe Checkout

- [ ] Visit pricing page: `https://your-domain.com/pricing`
- [ ] Click "Start Pro Trial"
- [ ] Complete checkout with test card: 4242 4242 4242 4242
- [ ] Verify subscription created in Stripe Dashboard
- [ ] Check webhook delivery in Stripe Dashboard
- [ ] Verify user upgraded in database

### 2. Test Authentication

- [ ] Sign up with new account
- [ ] Verify email sent
- [ ] Complete onboarding flow
- [ ] Check user created in database
- [ ] Test sign out and sign in

### 3. Test Core Features

- [ ] Create RSU entry
- [ ] View tax calculation
- [ ] Export PDF report
- [ ] Test multi-year dashboard
- [ ] Verify FTC optimizer
- [ ] Test CSV import

### 4. Test Email Drip Campaign

- [ ] Create new user
- [ ] Verify welcome email received
- [ ] Check drip campaign schedule
- [ ] Test unsubscribe link

### 5. Monitor & Alerts

- [ ] Set up Stripe webhook monitoring
- [ ] Configure error tracking (Sentry)
- [ ] Set up uptime monitoring
- [ ] Configure payment failure alerts
- [ ] Monitor database growth

## Performance Optimization

### 1. Database

- [ ] Enable SQLite WAL mode for better concurrency
- [ ] Add indexes on frequently queried columns
- [ ] Set up automated backups
- [ ] Monitor database size

### 2. Caching

- [ ] Enable Next.js caching for static pages
- [ ] Cache exchange rates (1 hour TTL)
- [ ] Cache tax calculation results
- [ ] Use SWR for client-side caching

### 3. CDN & Assets

- [ ] Optimize images (use next/image)
- [ ] Enable Vercel CDN for static assets
- [ ] Minify CSS/JS (automatic with Next.js)
- [ ] Enable gzip compression

## Security Checklist

- [ ] All API keys in environment variables
- [ ] Webhook endpoints validate signatures
- [ ] HTTPS only (force redirect)
- [ ] Rate limiting on API endpoints
- [ ] Input validation on all forms
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (React escaping)
- [ ] CSRF protection (Next.js built-in)
- [ ] Content Security Policy headers
- [ ] Regular dependency updates

## Monitoring Dashboards

### Stripe Dashboard
- Revenue: https://dashboard.stripe.com/dashboard
- Subscriptions: https://dashboard.stripe.com/subscriptions
- Customers: https://dashboard.stripe.com/customers
- Webhooks: https://dashboard.stripe.com/webhooks
- Logs: https://dashboard.stripe.com/logs

### Vercel Dashboard
- Deployments: https://vercel.com/dashboard
- Analytics: https://vercel.com/analytics
- Logs: https://vercel.com/logs
- Environment Variables: https://vercel.com/settings/environment-variables

### Clerk Dashboard
- Users: https://dashboard.clerk.com/users
- Sessions: https://dashboard.clerk.com/sessions
- Webhooks: https://dashboard.clerk.com/webhooks

## Rollback Plan

If deployment fails or critical issues found:

1. **Immediate Rollback**:
   ```bash
   # Revert to previous deployment in Vercel
   vercel rollback
   ```

2. **Database Rollback**:
   ```bash
   # Restore from backup
   cp data/taxbridge.db.backup data/taxbridge.db
   ```

3. **Disable New Signups**:
   - Add maintenance mode flag
   - Redirect pricing page to maintenance notice
   - Keep existing users functional

4. **Communicate Issues**:
   - Post status update
   - Email affected users
   - Update status page

## Revenue Monitoring

### Key Metrics to Track

1. **MRR (Monthly Recurring Revenue)**
   - Track in Stripe Dashboard
   - Goal: $83,333/month to reach $1M/year

2. **Conversion Funnel**
   - Visitors → Sign ups → Paid conversions
   - Monitor in analytics dashboard

3. **Churn Rate**
   - Track subscription cancellations
   - Goal: <5% monthly churn

4. **Customer Lifetime Value (LTV)**
   - Average subscription duration × plan price
   - Goal: Maximize through retention

5. **Customer Acquisition Cost (CAC)**
   - Marketing spend / new customers
   - Goal: CAC < 3-month revenue

## Support & Maintenance

### Daily Tasks
- [ ] Monitor error logs
- [ ] Check webhook delivery
- [ ] Review support tickets
- [ ] Monitor uptime

### Weekly Tasks
- [ ] Review revenue metrics
- [ ] Analyze user behavior
- [ ] Update content/docs
- [ ] Review and respond to feedback

### Monthly Tasks
- [ ] Database backup verification
- [ ] Security audit
- [ ] Dependency updates
- [ ] Performance review
- [ ] Revenue report

## Emergency Contacts

- Stripe Support: https://support.stripe.com
- Vercel Support: https://vercel.com/support
- Clerk Support: https://clerk.com/support
- SendGrid Support: https://support.sendgrid.com

## Success Criteria

Deployment is successful when:

- [ ] All tests pass
- [ ] Zero critical errors in logs
- [ ] Stripe webhooks delivering successfully
- [ ] First paid conversion completed
- [ ] Email drip campaign working
- [ ] Uptime > 99.9%
- [ ] Page load time < 2 seconds
- [ ] Zero security vulnerabilities

---

**Remember**: Test with real payment in test mode first, then switch to live mode only when everything is verified.
