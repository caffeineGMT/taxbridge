# Stripe Production Setup Guide

Complete guide to setting up Stripe for TaxBridge production environment.

## Prerequisites

- Stripe account (sign up at https://stripe.com)
- Verified business details in Stripe
- Bank account connected for payouts

## Step 1: Get Production API Keys

1. Go to https://dashboard.stripe.com/apikeys
2. Toggle to **Production mode** (top right)
3. Copy your **Publishable key** (starts with `pk_live_`)
4. Click **Reveal test key** to get your **Secret key** (starts with `sk_live_`)

## Step 2: Create Products and Prices

Run the automated setup script:

```bash
npm run setup:stripe
```

This will create:
- **TaxBridge Pro**: $299/year subscription
- **TaxBridge Enterprise**: $2,000/year subscription

The script outputs the Price IDs you need for your environment variables.

## Step 3: Configure Environment Variables

Update `.env.local` with production values:

```bash
# Stripe Configuration (PRODUCTION)
STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY_HERE

# Stripe Product Price IDs (from setup script)
STRIPE_PRO_PRICE_ID=price_XXXXXXXXXXXXX
STRIPE_ENTERPRISE_PRICE_ID=price_XXXXXXXXXXXXX
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_XXXXXXXXXXXXX
NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=price_XXXXXXXXXXXXX

# App URL (production)
NEXT_PUBLIC_APP_URL=https://taxbridge.vercel.app
```

## Step 4: Set Up Webhook Endpoint

1. Go to https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. Set endpoint URL: `https://your-domain.vercel.app/api/stripe/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add to `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_...`

## Step 5: Deploy to Vercel

Deploy with production environment variables:

```bash
# Build and deploy
vercel --prod

# Set environment variables in Vercel dashboard
# Or use Vercel CLI:
vercel env add STRIPE_SECRET_KEY production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add STRIPE_PRO_PRICE_ID production
vercel env add STRIPE_ENTERPRISE_PRICE_ID production
vercel env add NEXT_PUBLIC_STRIPE_PRO_PRICE_ID production
vercel env add NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID production
```

## Step 6: Test Production Checkout

1. Visit your pricing page: `https://your-domain.vercel.app/pricing`
2. Click "Start Pro Trial" or "Contact Sales"
3. Complete checkout with a test card:
   - Card: `4242 4242 4242 4242`
   - Date: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
4. Verify subscription appears in Stripe Dashboard
5. Check webhook delivery in Stripe Dashboard

## Step 7: Enable Production Mode

Once testing is complete:

1. Remove any test transactions
2. Verify all environment variables are production values
3. Test with a real payment method
4. Monitor webhook logs for any errors

## Troubleshooting

### Webhook Not Receiving Events

- Verify webhook URL is accessible (not localhost)
- Check webhook signing secret is correct
- Look at webhook logs in Stripe Dashboard
- Ensure your API route is handling POST requests

### Checkout Session Not Creating

- Verify price IDs are correct
- Check API key has correct permissions
- Look at browser console for errors
- Verify NEXT_PUBLIC_APP_URL is set correctly

### Payment Fails

- Verify Stripe account is fully activated
- Check for any account restrictions
- Ensure products are active in dashboard
- Verify currency settings (USD)

## Security Checklist

- [ ] Never commit API keys to git
- [ ] Use environment variables for all secrets
- [ ] Webhook endpoint validates signatures
- [ ] Production keys only on production
- [ ] Test keys only on development
- [ ] Rotate keys if compromised
- [ ] Monitor Stripe Dashboard for suspicious activity

## Monitoring

### Important Metrics to Track

1. **Conversion Rate**: Pricing page visits → Checkouts started
2. **Checkout Completion**: Checkouts started → Payments completed
3. **Churn Rate**: Active subscriptions → Cancellations
4. **MRR Growth**: Monthly Recurring Revenue trend
5. **Failed Payments**: Track and retry failed charges

### Stripe Dashboard Links

- Products: https://dashboard.stripe.com/products
- Subscriptions: https://dashboard.stripe.com/subscriptions
- Webhooks: https://dashboard.stripe.com/webhooks
- Customers: https://dashboard.stripe.com/customers
- Logs: https://dashboard.stripe.com/logs

## Revenue Targets

Based on $1M annual revenue goal:

- **Pro Plan ($299/year)**: Need ~3,344 customers
- **Enterprise Plan ($2,000/year)**: Need ~500 customers
- **Mixed (80% Pro, 20% Enterprise)**: Need ~2,675 Pro + 100 Enterprise

Focus on high-volume Pro tier with enterprise upsells.

## Next Steps

1. Set up email notifications for failed payments
2. Create customer portal for subscription management
3. Implement promo codes for marketing campaigns
4. Add annual vs monthly toggle on pricing page
5. Track affiliate conversions via metadata
6. Set up Stripe Radar for fraud prevention
