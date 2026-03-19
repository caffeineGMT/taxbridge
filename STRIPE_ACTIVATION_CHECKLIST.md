# STRIPE PRODUCTION ACTIVATION - ONE-PAGE CHECKLIST

**Date**: _____________  **Started**: _____  **Completed**: _____

---

## PRE-FLIGHT (Check all before starting)

- [ ] Stripe account verified (https://dashboard.stripe.com/settings/account)
- [ ] Bank account connected
- [ ] Tax info submitted
- [ ] Domain live: https://taxbridge.app
- [ ] Vercel dashboard access
- [ ] Credit card ready for testing

---

## STEP 1: Get Stripe Keys (3 min)

Website: https://dashboard.stripe.com/apikeys

- [ ] Toggle to **"Production"** mode (top-right)
- [ ] Copy Secret key: `sk_live_________________________`
- [ ] Copy Publishable key: `pk_live_________________________`

---

## STEP 2: Run Activation Script (5 min)

Command:
```bash
npm run stripe:activate-production
```

- [ ] Paste `sk_live_` key when prompted
- [ ] Paste `pk_live_` key when prompted
- [ ] Press Enter to skip webhook (do in Step 3)
- [ ] Script completes successfully
- [ ] Copy Pro price ID: `price_________________________`
- [ ] Copy Enterprise price ID: `price_________________________`

---

## STEP 3: Create Webhook (5 min)

Website: https://dashboard.stripe.com/webhooks

- [ ] Click "+ Add endpoint"
- [ ] URL: `https://taxbridge.app/api/stripe/webhook`
- [ ] Select 6 events:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_succeeded`
  - [ ] `invoice.payment_failed`
- [ ] Click "Add endpoint"
- [ ] Reveal signing secret: `whsec_________________________`

---

## STEP 4: Configure Vercel (7 min)

Website: https://vercel.com → TaxBridge → Settings → Environment Variables

Add these 8 variables (Environment: **Production only**):

- [ ] `STRIPE_SECRET_KEY` = _sk_live\__ from Step 1
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = _pk_live\__ from Step 1
- [ ] `STRIPE_WEBHOOK_SECRET` = _whsec\__ from Step 3
- [ ] `STRIPE_PRO_PRICE_ID` = _price\__ from Step 2
- [ ] `STRIPE_ENTERPRISE_PRICE_ID` = _price\__ from Step 2
- [ ] `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` = _price\__ (same as above)
- [ ] `NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID` = _price\__ (same as above)
- [ ] `NEXT_PUBLIC_APP_URL` = `https://taxbridge.app`

After adding:
- [ ] Click "Save"
- [ ] Go to Deployments → Redeploy latest (Production)
- [ ] Wait for deployment to finish (~2 min)

---

## STEP 5: Test Live Payment (10 min)

Command:
```bash
npm run test:live-payment
```

- [ ] Script outputs payment URL
- [ ] Open URL in browser
- [ ] Complete payment with REAL credit card
- [ ] Charged $299.00
- [ ] Redirected to dashboard
- [ ] Return to terminal - shows "Payment received"
- [ ] Type "yes" to refund
- [ ] Refund processed successfully

---

## VERIFICATION

Stripe Dashboard checks:

**Payments** (https://dashboard.stripe.com/payments)
- [ ] $299.00 payment visible
- [ ] Status: "Refunded"

**Subscriptions** (https://dashboard.stripe.com/subscriptions)
- [ ] Subscription created
- [ ] Status: "Canceled"

**Webhooks** (https://dashboard.stripe.com/webhooks)
- [ ] Endpoint shows "Enabled"
- [ ] Recent deliveries show "Succeeded"

**Products** (https://dashboard.stripe.com/products)
- [ ] TaxBridge Pro ($299/year)
- [ ] TaxBridge Enterprise ($2,000/year)

---

## POST-ACTIVATION

- [ ] Test subscription cancelled
- [ ] Refund confirmed
- [ ] No errors in Vercel logs
- [ ] No errors in Sentry
- [ ] Team notified: "Payments live!"

---

## ✅ DONE!

**Stripe production mode is ACTIVE and ready for real customers!**

Signed: ________________  Date: ________  Time: ______

---

**Troubleshooting**: See `STRIPE_PRODUCTION_ACTIVATION_FINAL.md`

**Support**:
- Stripe: https://support.stripe.com (24/7)
- Vercel: https://vercel.com/support
