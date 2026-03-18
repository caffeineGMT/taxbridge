# Stripe Production Quick Start ⚡

**Goal**: Get Stripe live payments working in 15 minutes.

## 🚀 Option 1: Interactive Setup (Recommended)

Run the interactive script that walks you through the entire process:

```bash
npm run stripe:quickstart
```

This will:
1. Prompt for your Stripe live API keys
2. Create products in Stripe live mode
3. Generate .env.production with all Stripe configuration
4. Provide next steps for Vercel deployment

## 🛠️ Option 2: Manual Setup

### Step 1: Get Stripe Live Keys (2 min)

1. Go to https://dashboard.stripe.com/apikeys
2. Toggle to **"Production"** mode (top right)
3. Copy:
   - Secret key: `sk_live_...`
   - Publishable key: `pk_live_...`

### Step 2: Create Products (3 min)

Update `.env.production` with your keys:
```bash
STRIPE_SECRET_KEY=sk_live_YOUR_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY_HERE
```

Run setup:
```bash
npm run setup:stripe
```

Copy the price IDs from output and add to `.env.production`:
```bash
STRIPE_PRO_PRICE_ID=price_1xxxxxxxxxxxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_1xxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_1xxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=price_1xxxxxxxxxxxxxx
```

### Step 3: Set Up Webhook (3 min)

1. Go to https://dashboard.stripe.com/webhooks
2. Click **"+ Add endpoint"**
3. **Endpoint URL**: `https://taxbridge.app/api/stripe/webhook`
4. **Events**: Select all these:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**
6. Copy webhook signing secret: `whsec_...`

Add to `.env.production`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
```

### Step 4: Verify Configuration (1 min)

```bash
npm run verify:stripe
```

Should output:
```
✅ All Stripe configuration checks passed!
🚀 Ready for production deployment.
```

### Step 5: Deploy to Vercel (5 min)

**Option A: Vercel Dashboard**

1. Go to https://vercel.com → Your Project → Settings → Environment Variables
2. Add each variable from `.env.production`
3. Set environment to **"Production"**
4. Deploy: `git push origin main`

**Option B: Vercel CLI**

```bash
# Add all Stripe variables
vercel env add STRIPE_SECRET_KEY production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add STRIPE_PRO_PRICE_ID production
vercel env add STRIPE_ENTERPRISE_PRICE_ID production
vercel env add NEXT_PUBLIC_STRIPE_PRO_PRICE_ID production
vercel env add NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID production
vercel env add NEXT_PUBLIC_APP_URL production

# Deploy
vercel --prod
```

### Step 6: Test Live Payment (1 min)

1. Go to https://taxbridge.app/pricing
2. Click **"Start 7-Day Free Trial"**
3. Use **real credit card** (Stripe test cards won't work)
4. Complete payment
5. Verify redirect to dashboard
6. **Immediately cancel subscription** if testing with personal card

## ✅ Success Criteria

After deployment, verify:

- [ ] Payment completes successfully
- [ ] User redirected to `/dashboard?upgrade=success`
- [ ] Subscription appears in Stripe dashboard
- [ ] Webhook shows "Succeeded" status
- [ ] User tier updated to "pro" in database

## 🔍 Troubleshooting

### "No such price: price_1..."

→ You're using a test mode price ID. Run `npm run setup:stripe` with live keys.

### "Webhook signature verification failed"

→ Webhook secret doesn't match. Check Vercel environment variable.

### Checkout fails immediately

→ You're using test keys. Make sure keys start with `sk_live_` and `pk_live_`.

### Payment completes but user not upgraded

→ Webhook not firing. Check Stripe dashboard → Webhooks for errors.

## 📚 Detailed Documentation

- **Full Setup Guide**: See [STRIPE_PRODUCTION_SETUP.md](./STRIPE_PRODUCTION_SETUP.md)
- **Deployment Checklist**: See [PRODUCTION_DEPLOYMENT_CHECKLIST.md](./PRODUCTION_DEPLOYMENT_CHECKLIST.md)

## 🆘 Need Help?

- Stripe Support: https://support.stripe.com
- Stripe Dashboard: https://dashboard.stripe.com
- Vercel Dashboard: https://vercel.com/dashboard

---

**Time to Revenue**: ~15 minutes from start to accepting real payments 💰
