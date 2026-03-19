# Quick Reference: Stripe Production Activation

**ONE-PAGE GUIDE FOR CTO - ALL COMMANDS IN ONE PLACE**

---

## 🚀 The 4 Commands You Need

### 1. Activate Stripe Production
```bash
npm run stripe:activate-production
```
- Prompts for Stripe live keys
- Creates products ($299 Pro, $2000 Enterprise)
- Updates .env.production

### 2. Create Webhook (Manual)
- Go to: https://dashboard.stripe.com/webhooks
- Add endpoint: `https://taxbridge.app/api/stripe/webhook`
- Events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_*`
- Copy webhook secret (`whsec_...`)

### 3. Update Vercel Env Vars (Manual)
- Go to: https://vercel.com → Settings → Environment Variables
- Add from `.env.production` (environment: Production only)

### 4. Test Live Payment
```bash
npm run test:live-payment
```
- Creates checkout session
- Tests real payment
- Verifies webhook
- Offers refund

---

## 📋 Required Environment Variables (Vercel)

Add these in Vercel Dashboard → Settings → Environment Variables:

```bash
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=price_...
NEXT_PUBLIC_APP_URL=https://taxbridge.app
```

---

## ✅ Success Checklist

- [ ] Activation script ran successfully
- [ ] Webhook created (check Stripe Dashboard → Webhooks)
- [ ] Vercel env vars set (8 variables)
- [ ] Production deployed
- [ ] Live payment test passed ($299 charged + refunded)
- [ ] Webhook shows "Succeeded" in Stripe Dashboard
- [ ] Subscription created and cancelled
- [ ] No errors in Sentry

---

## 🐛 Quick Troubleshooting

| Error | Fix |
|-------|-----|
| "No such price" | Update `STRIPE_PRO_PRICE_ID` in Vercel from .env.production |
| "Webhook signature failed" | Copy webhook secret from Stripe → Webhooks, update Vercel |
| "Invalid API key" | Verify using `sk_live_` not `sk_test_` |
| Checkout works but no upgrade | Check webhook is firing (Stripe Dashboard → Webhooks) |

---

## 📞 Support Links

- Stripe Dashboard: https://dashboard.stripe.com
- Vercel Dashboard: https://vercel.com/dashboard
- Stripe Support: https://support.stripe.com

---

## 🎯 Total Time: 20 minutes

1. Activation script: 5 min
2. Webhook setup: 3 min
3. Vercel env vars: 5 min
4. Deploy: 2 min
5. Test payment: 5 min

---

**START HERE:** `npm run stripe:activate-production`
