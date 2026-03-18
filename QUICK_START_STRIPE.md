# Stripe Production Setup - Quick Start

**Time: 15 minutes** | **Goal: Enable live payments on TaxBridge**

## Prerequisites

- Stripe account (sign up at https://stripe.com)
- Domain deployed to Vercel (e.g., taxbridge.vercel.app)

## Step-by-Step Setup

### 1. Get Production API Keys (2 min)

1. Go to https://dashboard.stripe.com/apikeys
2. **Toggle to "Production" mode** (top right corner - very important!)
3. Copy your **Publishable key** (starts with `pk_live_`)
4. Click **"Reveal live key"** and copy your **Secret key** (starts with `sk_live_`)
5. Save both keys somewhere safe (you'll need them in step 4)

### 2. Create Subscription Products (3 min)

Open terminal and run:

```bash
# First, temporarily add your LIVE secret key to .env.local
# Edit .env.local and replace:
# STRIPE_SECRET_KEY=sk_test_...
# with:
# STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_KEY_HERE

# Then run the setup script
npm run setup:stripe
```

The script will output:
```
STRIPE_PRO_PRICE_ID=price_1AbC123XyZ
STRIPE_ENTERPRISE_PRICE_ID=price_1DeF456XyZ
```

**Copy these price IDs** - you'll need them in step 4.

### 3. Set Up Webhook Endpoint (5 min)

1. Go to https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. Enter endpoint URL: `https://YOUR-DOMAIN.vercel.app/api/stripe/webhook`
   - Replace `YOUR-DOMAIN` with your actual Vercel domain
4. Click **"Select events"** and choose:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_failed`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)

### 4. Update Environment Variables (3 min)

Edit `.env.local` and update these values:

```bash
# Replace test keys with production keys from Step 1
STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY_FROM_STEP_1
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY_FROM_STEP_1

# Add webhook secret from Step 3
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_FROM_STEP_3

# Add price IDs from Step 2
STRIPE_PRO_PRICE_ID=price_YOUR_PRO_PRICE_ID_FROM_STEP_2
STRIPE_ENTERPRISE_PRICE_ID=price_YOUR_ENTERPRISE_PRICE_ID_FROM_STEP_2
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_YOUR_PRO_PRICE_ID_FROM_STEP_2
NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=price_YOUR_ENTERPRISE_PRICE_ID_FROM_STEP_2

# Update app URL to your production domain
NEXT_PUBLIC_APP_URL=https://YOUR-DOMAIN.vercel.app
```

### 5. Verify Configuration (1 min)

Run the verification script:

```bash
npm run verify:stripe
```

You should see:
```
✓ Production secret key configured
✓ Production publishable key configured
✓ Webhook secret configured
✓ Pro price ID configured
✓ Enterprise price ID configured
✓ Public Pro price ID configured
✓ Public Enterprise price ID configured
✓ Production app URL configured

✅ All Stripe configuration checks passed!
🚀 Ready for production deployment.
```

### 6. Deploy to Vercel (1 min)

```bash
# Deploy to production
vercel --prod --yes
```

Vercel will automatically pick up your `.env.local` variables.

**Alternative**: Set environment variables in Vercel Dashboard:
1. Go to your project settings
2. Click "Environment Variables"
3. Add all Stripe variables manually
4. Redeploy

## Testing Live Payments

**Important**: Use test card numbers first to verify everything works:

1. Visit `https://YOUR-DOMAIN.vercel.app/pricing`
2. Click **"Start Pro Trial"**
3. Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)
4. Complete checkout
5. Verify in Stripe Dashboard:
   - Go to https://dashboard.stripe.com/subscriptions
   - You should see a new subscription
   - Check webhook logs: https://dashboard.stripe.com/webhooks

## Production Payment Testing

After test card works, try with a real card:

1. Use a real credit/debit card
2. Complete checkout
3. **Immediately cancel the subscription** in Stripe Dashboard
4. Refund the payment
5. This verifies real payments work without charging yourself

## Troubleshooting

### "Invalid API Key"
- Make sure you're using `sk_live_` not `sk_test_`
- Verify key copied correctly (no extra spaces)

### "Webhook signature verification failed"
- Check `STRIPE_WEBHOOK_SECRET` starts with `whsec_`
- Verify webhook endpoint URL matches exactly
- Make sure endpoint is deployed and accessible

### "Price not found"
- Verify price IDs start with `price_`
- Make sure you copied IDs from Step 2 correctly
- Check products exist in dashboard: https://dashboard.stripe.com/products

### Checkout redirects to wrong URL
- Verify `NEXT_PUBLIC_APP_URL` has no trailing slash
- Must be `https://` not `http://` for production
- Check success/cancel URLs in lib/stripe.ts

## Quick Reference

| What | Where | Format |
|------|-------|--------|
| API Keys | https://dashboard.stripe.com/apikeys | sk_live_... / pk_live_... |
| Webhooks | https://dashboard.stripe.com/webhooks | whsec_... |
| Products | https://dashboard.stripe.com/products | price_... |
| Subscriptions | https://dashboard.stripe.com/subscriptions | sub_... |
| Customers | https://dashboard.stripe.com/customers | cus_... |

## Security Reminders

- ✅ Never commit `.env.local` to git
- ✅ Use production keys only on production
- ✅ Use test keys only on development
- ✅ Rotate keys if compromised
- ✅ Monitor webhook delivery regularly
- ✅ Set up billing alerts in Stripe Dashboard

## Next Steps After Setup

1. Test the complete checkout flow end-to-end
2. Monitor first real conversion
3. Set up email receipts (Stripe handles automatically)
4. Enable Stripe Billing Portal for customers to manage subscriptions
5. Set up failed payment recovery workflow
6. Create promo codes for marketing campaigns

---

**Need Help?**
- Stripe Support: https://support.stripe.com
- Documentation: See STRIPE_SETUP.md for detailed guide
- Verification: Run `npm run verify:stripe`
