# TaxBridge Deployment Guide

## 🚀 Deployment Overview

TaxBridge uses **Vercel** for hosting with automatic preview deployments serving as the staging environment.

### Deployment Flow

```
Code → Push to GitHub → GitHub Actions CI/CD ✓ → Vercel Preview Deploy (Staging) → Review → Manual Vercel Production Deploy
```

## 🔄 Staging Workflow (Vercel Preview Deployments)

### How It Works

**Every push to GitHub automatically:**
1. Triggers GitHub Actions CI/CD (lint, build, test)
2. Deploys to Vercel Preview URL (e.g., `https://taxbridge-git-main-{hash}.vercel.app`)
3. Comments on the commit/PR with the preview link

**Production deployment:**
- Manual only (you control when changes go live)
- Promotes a verified preview deployment to `taxbridge.app`

### Why Not GitHub Pages?

GitHub Pages only hosts static files. TaxBridge requires:
- ❌ API Routes (30+ endpoints in `app/api/*`)
- ❌ Server-Side Rendering
- ❌ Authentication (Clerk)
- ❌ Database operations
- ❌ Webhooks (Stripe, Clerk)

Vercel runs a Node.js server that handles all these features.

### Using Preview Deployments

#### 1. Push Code to GitHub
```bash
git add -A
git commit -m "Feature: Add tax optimization for multi-state workers"
git push origin main
```

#### 2. Automatic Preview Build
- GitHub Actions runs CI/CD checks
- Vercel automatically builds and deploys preview
- Preview URL posted as GitHub commit comment

#### 3. Review on Preview URL
Visit the Vercel preview URL to test:
- ✅ All API routes work (same as production)
- ✅ Authentication works
- ✅ Database operations work
- ✅ Payment flows work
- ✅ Exactly like production, just different URL

#### 4. Promote to Production
**When ready, deploy to production:**

```bash
# Option A: Vercel CLI
vercel --prod

# Option B: Vercel Dashboard
# Go to Deployments → Select preview → Promote to Production
```

### Configuring Vercel for Preview-Only Auto-Deploy

To prevent accidental production deployments:

**Option 1: Vercel Dashboard**
1. Project Settings → Git
2. Uncheck "Production Branch" for main

**Option 2: vercel.json**
```json
{
  "git": {
    "deploymentEnabled": {
      "main": false
    }
  }
}
```

This ensures:
- ✅ Preview deployments happen automatically
- ❌ Production deployments require manual approval

### GitHub Actions CI/CD

The `.github/workflows/ci-cd.yml` workflow runs on every push:

- ✅ Lint check
- ✅ Build validation
- ✅ Unit tests
- ✅ PR comment with build status

## 📋 Production Deployment

- [x] Vercel CLI installed and authenticated (`vercel whoami` shows: caffeinegmt)
- [x] Project linked to Vercel (Project ID: prj_9fGSkRcveBr1MYXsG9RqgAFIg672)
- [ ] Domain purchased (taxbridge.app)
- [ ] Production environment variables configured
- [ ] Stripe live mode keys obtained
- [ ] Clerk production instance configured
- [ ] SendGrid verified domain

## 📋 Step 1: Domain Purchase & DNS Configuration

### Option A: Namecheap
1. Go to [Namecheap](https://www.namecheap.com)
2. Purchase `taxbridge.app` domain (~$10-15/year)
3. Navigate to Domain List > Manage > Advanced DNS
4. Add DNS records:
   ```
   Type: CNAME Record
   Host: @
   Value: cname.vercel-dns.com.
   TTL: Automatic

   Type: CNAME Record
   Host: www
   Value: cname.vercel-dns.com.
   TTL: Automatic
   ```

### Option B: Cloudflare (Recommended for better performance)
1. Go to [Cloudflare](https://www.cloudflare.com)
2. Purchase `taxbridge.app` domain (~$10/year)
3. Domain auto-added to Cloudflare DNS
4. Add DNS records:
   ```
   Type: CNAME
   Name: @
   Target: cname.vercel-dns.com
   Proxy status: DNS only (grey cloud)

   Type: CNAME
   Name: www
   Target: cname.vercel-dns.com
   Proxy status: DNS only (grey cloud)
   ```

**Important**: Set Proxy status to "DNS only" initially. After SSL is verified, you can enable Cloudflare proxy (orange cloud) for DDoS protection and CDN.

### DNS Propagation
- DNS changes typically take 5-30 minutes to propagate
- Check status: `nslookup taxbridge.app` or use [whatsmydns.net](https://www.whatsmydns.net)

## 📋 Step 2: Configure Domain in Vercel

```bash
# Add domain to Vercel project
vercel domains add taxbridge.app

# Add www subdomain (will redirect to main domain via vercel.json)
vercel domains add www.taxbridge.app
```

Alternative: Use Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select `cross-border-tax` project
3. Settings > Domains
4. Add `taxbridge.app` and `www.taxbridge.app`
5. Vercel will automatically provision SSL via Let's Encrypt (takes 1-2 minutes)

## 📋 Step 3: Configure Production Environment Variables

### Required Environment Variables

```bash
# Set production environment variables
vercel env add NEXT_PUBLIC_APP_URL production
# Enter: https://taxbridge.app

vercel env add STRIPE_SECRET_KEY production
# Enter: sk_live_... (from Stripe Dashboard > Developers > API Keys)

vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
# Enter: pk_live_... (from Stripe Dashboard > Developers > API Keys)

vercel env add STRIPE_WEBHOOK_SECRET production
# Enter: whsec_... (from Stripe Dashboard > Developers > Webhooks)
# Create webhook endpoint: https://taxbridge.app/api/webhooks/stripe
# Events: checkout.session.completed, customer.subscription.created, customer.subscription.updated, customer.subscription.deleted

vercel env add CLERK_SECRET_KEY production
# Enter: sk_live_... (from Clerk Dashboard > API Keys)

vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
# Enter: pk_live_... (from Clerk Dashboard > API Keys)

vercel env add ANTHROPIC_API_KEY production
# Enter: sk-ant-api03-... (from Anthropic Console)

vercel env add SENDGRID_API_KEY production
# Enter: SG.... (from SendGrid Dashboard > Settings > API Keys)

vercel env add SENDGRID_FROM_EMAIL production
# Enter: noreply@taxbridge.app

vercel env add SENDGRID_FROM_NAME production
# Enter: TaxBridge

vercel env add SENDGRID_REPLY_TO production
# Enter: support@taxbridge.app

vercel env add CRON_SECRET production
# Enter: (generate with: openssl rand -hex 32)

vercel env add ADMIN_EMAILS production
# Enter: admin@taxbridge.app,michaelguo@example.com
```

### SendGrid Dynamic Template IDs
After creating templates in SendGrid Dashboard:
```bash
vercel env add SENDGRID_TEMPLATE_WELCOME production
vercel env add SENDGRID_TEMPLATE_DAY3 production
vercel env add SENDGRID_TEMPLATE_DAY7 production
vercel env add SENDGRID_TEMPLATE_DAY14 production
```

### Verify Environment Variables
```bash
vercel env ls
```

## 📋 Step 4: Pre-Deployment Checklist

### Clerk Configuration
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create production instance or switch to production mode
3. Add production domain: `taxbridge.app`
4. Configure sign-in/sign-up URLs:
   - Sign-in URL: `https://taxbridge.app/sign-in`
   - Sign-up URL: `https://taxbridge.app/sign-up`
   - After sign-in URL: `https://taxbridge.app/dashboard`
   - After sign-up URL: `https://taxbridge.app/onboarding`

### Stripe Configuration
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Switch to **Live mode** (toggle in top-right)
3. Developers > API Keys > Copy live keys
4. Developers > Webhooks > Add endpoint:
   - Endpoint URL: `https://taxbridge.app/api/webhooks/stripe`
   - Events to send:
     * `checkout.session.completed`
     * `customer.subscription.created`
     * `customer.subscription.updated`
     * `customer.subscription.deleted`
     * `invoice.payment_succeeded`
     * `invoice.payment_failed`
5. Copy webhook signing secret (starts with `whsec_`)
6. Create products (or run setup script):
   ```bash
   STRIPE_SECRET_KEY=sk_live_... npm run setup:stripe
   ```

### SendGrid Configuration
1. Go to [SendGrid Dashboard](https://app.sendgrid.com)
2. Settings > Sender Authentication > Verify a Single Sender
3. Add sender: noreply@taxbridge.app
4. Click verification link in email
5. Settings > API Keys > Create API Key (Full Access)
6. Marketing > Dynamic Templates > Create templates for:
   - Welcome email (day 0)
   - Day 3 engagement email
   - Day 7 value reminder
   - Day 14 upgrade prompt

## 📋 Step 5: Deploy to Production

### Build Test (Local)
```bash
npm run build
```

Ensure build completes without errors.

### Deploy to Production
```bash
# Deploy to production
vercel --prod

# Or if you need to specify project
vercel --prod --yes
```

The deployment will:
1. Upload source code
2. Install dependencies
3. Run build (`next build`)
4. Deploy to production
5. Assign to `taxbridge.app` domain (once DNS is configured)

### Monitor Deployment
```bash
# View deployment logs
vercel logs <deployment-url> --follow

# List recent deployments
vercel ls
```

## 📋 Step 6: Post-Deployment Verification

### 6.1 SSL Certificate Verification
```bash
# Check SSL certificate
curl -I https://taxbridge.app

# Verify SSL rating
# Go to: https://www.ssllabs.com/ssltest/analyze.html?d=taxbridge.app
# Target: A+ rating
```

### 6.2 Performance Testing
```bash
# Check page load time
curl -w "@-" -o /dev/null -s https://taxbridge.app <<'EOF'
    time_namelookup:  %{time_namelookup}\n
       time_connect:  %{time_connect}\n
    time_appconnect:  %{time_appconnect}\n
   time_pretransfer:  %{time_pretransfer}\n
      time_redirect:  %{time_redirect}\n
 time_starttransfer:  %{time_starttransfer}\n
                    ----------\n
         time_total:  %{time_total}\n
EOF
```

Target: `time_total` < 2 seconds

Use [PageSpeed Insights](https://pagespeed.web.dev/) for comprehensive analysis:
- Target: 90+ score on mobile and desktop

### 6.3 Critical Path Testing

#### Test 1: User Signup Flow
1. Go to https://taxbridge.app
2. Click "Get Started Free"
3. Sign up with test email
4. Verify email received
5. Complete onboarding
6. Check dashboard loads

#### Test 2: RSU Entry
1. Login to https://taxbridge.app/dashboard
2. Navigate to "RSU Entries"
3. Add new RSU entry:
   - Date: Recent vest date
   - Employer: Meta
   - Shares: 100
   - FMV: $500
4. Verify entry saved
5. Check tax calculation appears

#### Test 3: Tax Calculator
1. Go to https://taxbridge.app/calculator
2. Enter RSU income: $50,000
3. Select state: California
4. Select province: British Columbia
5. Verify dual-country tax calculation displays
6. Check Article XV treaty application
7. Verify Foreign Tax Credit calculation

#### Test 4: Stripe Checkout (Test Mode First)
1. Navigate to https://taxbridge.app/pricing
2. Click "Upgrade to Pro" ($29/month plan)
3. Use test card: `4242 4242 4242 4242`
4. Expiry: Any future date
5. CVC: Any 3 digits
6. Verify:
   - Checkout session created
   - Stripe hosted checkout loads
   - Payment succeeds
   - Webhook received
   - User subscription updated in database
   - Redirect to success page
   - Email confirmation sent

#### Test 5: Stripe Checkout (Live Mode)
**Only after test mode verification passes**
1. Use real credit card
2. Complete actual payment ($29)
3. Verify all steps from Test 4
4. Refund test transaction in Stripe Dashboard

### 6.4 Form Validation Testing
Test all forms submit successfully:
- [ ] Contact form
- [ ] RSU entry form
- [ ] Tax calculation form
- [ ] User profile update
- [ ] Password reset
- [ ] Newsletter signup

### 6.5 API Endpoint Testing
```bash
# Health check
curl https://taxbridge.app/api/health

# Verify cron endpoint is protected
curl https://taxbridge.app/api/cron/email-drip
# Should return 401 Unauthorized without CRON_SECRET

# Test with secret
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://taxbridge.app/api/cron/email-drip
# Should return 200 OK
```

## 📋 Step 7: Vercel Edge Config (Feature Flags)

```bash
# Create Edge Config store
vercel edge-config create taxbridge-config

# Add feature flags
vercel edge-config item add free_tier_limit '{"value": 5}' --project cross-border-tax
vercel edge-config item add pro_features_enabled '{"value": true}' --project cross-border-tax
vercel edge-config item add maintenance_mode '{"value": false}' --project cross-border-tax

# Link to project
vercel edge-config link taxbridge-config --project cross-border-tax
```

Add to environment variables:
```bash
vercel env add EDGE_CONFIG production
# Paste the Edge Config connection string from Vercel Dashboard
```

## 📋 Step 8: Monitoring & Alerts Setup

### Vercel Monitoring
1. Go to Vercel Dashboard > Project > Analytics
2. Enable Web Analytics (free)
3. Enable Speed Insights (free)

### Error Tracking (Sentry - Optional)
```bash
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard@latest -i nextjs

# Add to environment variables
vercel env add NEXT_PUBLIC_SENTRY_DSN production
vercel env add SENTRY_AUTH_TOKEN production
```

### Uptime Monitoring (UptimeRobot - Free)
1. Go to [UptimeRobot](https://uptimerobot.com)
2. Create monitor:
   - Monitor Type: HTTPS
   - URL: https://taxbridge.app/api/health
   - Interval: 5 minutes
3. Add alert contacts (email, Slack)

### Stripe Alerts
1. Stripe Dashboard > Developers > Webhooks > Endpoint
2. Enable email notifications for:
   - Endpoint failures
   - Endpoint disabled

## 📋 Step 9: DNS and Redirect Verification

### Test Redirects
```bash
# www should redirect to non-www
curl -I https://www.taxbridge.app
# Should show: Location: https://taxbridge.app/

# Verify redirect is permanent
# Should show: HTTP/2 308 (or 301)
```

### Test DNS Resolution
```bash
# Check A/CNAME records
dig taxbridge.app
dig www.taxbridge.app

# Verify both point to Vercel
# Should show: CNAME pointing to cname.vercel-dns.com
```

## 📋 Step 10: Security Hardening

### CSP Headers (Optional - Advanced)
Update `next.config.ts` to add Content Security Policy:

```typescript
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.stripe.com https://clerk.*.com; frame-src https://js.stripe.com https://challenges.cloudflare.com;"
          }
        ]
      }
    ]
  }
}
```

### Rate Limiting
Add to API routes for production:

```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});
```

## 🎯 Acceptance Criteria Checklist

- [ ] https://taxbridge.app loads in <2 seconds
- [ ] SSL Labs rating: A+ (https://www.ssllabs.com/ssltest/)
- [ ] All forms submit successfully
- [ ] Stripe live checkout completes without errors
- [ ] User signup flow works end-to-end
- [ ] RSU entry and tax calculation work
- [ ] Foreign Tax Credit optimizer displays correctly
- [ ] Email drip campaign cron job runs successfully
- [ ] www.taxbridge.app redirects to taxbridge.app
- [ ] All environment variables configured in production
- [ ] API health check returns 200 OK
- [ ] Error tracking is active
- [ ] Uptime monitoring is active
- [ ] Database migrations applied successfully

## 🚨 Rollback Procedure

If issues arise:

```bash
# List recent deployments
vercel ls

# Rollback to previous deployment
vercel rollback <deployment-url>

# Or use Vercel Dashboard > Deployments > click "..." > Redeploy
```

## 📊 Success Metrics

Monitor these KPIs post-launch:
- Page load time: <2 seconds (target: 1 second)
- Lighthouse score: 90+ (target: 95+)
- SSL Labs rating: A+
- Uptime: 99.9%
- Stripe checkout completion rate: >80%
- User signup conversion: >5%
- Time to interactive: <3 seconds

## 🔧 Troubleshooting

### Issue: Domain not resolving
**Solution**: Wait 5-30 minutes for DNS propagation. Check `nslookup taxbridge.app`

### Issue: SSL certificate not provisioning
**Solution**:
1. Verify DNS records point to Vercel
2. Remove and re-add domain in Vercel Dashboard
3. Contact Vercel support

### Issue: Environment variables not loading
**Solution**:
```bash
# Verify variables are set for production
vercel env ls

# Pull variables to local
vercel env pull .env.production.local
```

### Issue: Build fails in production
**Solution**:
```bash
# Check build logs
vercel logs <deployment-url>

# Test build locally
npm run build

# Check for missing environment variables
```

### Issue: Stripe webhook not receiving events
**Solution**:
1. Verify webhook endpoint URL is correct
2. Check webhook signing secret matches environment variable
3. Test webhook delivery in Stripe Dashboard
4. Check API route logs in Vercel

### Issue: Cron job not running
**Solution**:
1. Verify cron schedule in vercel.json
2. Check CRON_SECRET is set correctly
3. View cron logs in Vercel Dashboard > Deployments > Functions
4. Manually trigger: `curl -H "Authorization: Bearer CRON_SECRET" https://taxbridge.app/api/cron/email-drip`

## 📞 Support Contacts

- **Vercel Support**: support@vercel.com (or in-app chat)
- **Stripe Support**: https://support.stripe.com
- **Clerk Support**: support@clerk.com
- **SendGrid Support**: https://support.sendgrid.com
- **Cloudflare Support**: https://support.cloudflare.com

## 🎉 Launch Checklist

Final checks before announcing launch:

- [ ] All acceptance criteria met
- [ ] Performance targets achieved
- [ ] Security headers configured
- [ ] Monitoring and alerts active
- [ ] Error tracking configured
- [ ] Backup and rollback tested
- [ ] Support email (support@taxbridge.app) configured
- [ ] Legal pages live (Privacy Policy, Terms of Service)
- [ ] Analytics tracking active
- [ ] Social media cards configured (og:image, twitter:card)
- [ ] Sitemap submitted to Google Search Console
- [ ] robots.txt configured

---

**Deployment Date**: [To be filled]
**Deployed By**: Michael Guo
**Deployment Version**: 1.0.0
**Status**: ✅ Production Ready
