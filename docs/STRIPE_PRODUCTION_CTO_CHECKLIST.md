# STRIPE PRODUCTION ACTIVATION - CTO QUICK START

**PRIORITY:** P0-CRITICAL - REVENUE BLOCKER
**TIMELINE:** 2 hours
**IMPACT:** Unblocks ALL revenue
**CONFIDENCE:** 99%

**CURRENT STATUS:** 🔴 100% TEST MODE - CANNOT ACCEPT PAYMENTS
**TARGET STATUS:** ✅ LIVE MODE - REVENUE FLOWING

---

## EXECUTIVE SUMMARY

Replace Stripe test keys (`sk_test_`, `pk_test_`) with live keys (`sk_live_`, `pk_live_`), create production Price IDs for Basic ($49/year) and Pro ($79/year), test checkout with real card then refund, verify webhooks work.

**Before:** Zero revenue capability, all payments in test mode
**After:** Production-ready payments, first customer = revenue starts

---

## 30-SECOND CHECKLIST

```bash
# Terminal execution (copy-paste these commands):

# 1. Get live keys from Stripe Dashboard (2 min)
open https://dashboard.stripe.com/apikeys

# 2. Export live secret key (1 min)
export STRIPE_SECRET_KEY=sk_live_PASTE_YOUR_KEY_HERE

# 3. Run setup script (3 min)
npx tsx scripts/activate-stripe-production-annual.ts

# 4. Copy price IDs from output to Vercel env vars (5 min)
# (Script will print exact commands)

# 5. Setup webhook endpoint (5 min)
open https://dashboard.stripe.com/webhooks
# Create endpoint: https://taxbridgecpa.com/api/stripe/webhook
# Copy webhook secret to Vercel

# 6. Test checkout + refund (15 min)
# Follow: docs/STRIPE_PRODUCTION_TESTING_GUIDE.md

# DONE! Revenue is LIVE! 🚀
```

**Total Time:** ~30 minutes (including testing)

---

## DETAILED STEP-BY-STEP

### STEP 1: Get Stripe Live API Keys (3 minutes)

1. Go to: https://dashboard.stripe.com/apikeys
2. **Toggle to "Production" mode** (top-left corner)
3. Copy these 2 keys:

   | Key Type | Format | Location |
   |----------|--------|----------|
   | **Secret Key** | `sk_live_...` | Click "Reveal" → Copy |
   | **Publishable Key** | `pk_live_...` | Visible by default → Copy |

4. **Save both keys** in a secure note (you'll need them for Vercel)

---

### STEP 2: Run Production Setup Script (5 minutes)

Open terminal in project root:

```bash
# Set live secret key (CRITICAL: Must be sk_live_, NOT sk_test_)
export STRIPE_SECRET_KEY=sk_live_PASTE_YOUR_ACTUAL_KEY_HERE

# Verify key is set correctly (should print "sk_live_...")
echo $STRIPE_SECRET_KEY

# Run setup script
npx tsx scripts/activate-stripe-production-annual.ts
```

**Expected Output:**
```
✅ VALIDATION PASSED: Using LIVE Stripe key
📦 Creating Basic Plan ($49/year)...
   ✓ Product: prod_ABC123
   ✓ Price: price_XYZ789 ($49/year)
📦 Creating Pro Plan ($79/year - Standard)...
   ✓ Product: prod_DEF456
   ✓ Price: price_UVW012 ($79/year)
✅ SUCCESS! Stripe products created in LIVE mode

📋 COPY THESE TO VERCEL ENVIRONMENT VARIABLES:
STRIPE_BASIC_PRICE_ID=price_XYZ789
NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID=price_XYZ789
STRIPE_PRO_PRICE_ID=price_UVW012
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_UVW012
```

**Save this output** - you'll need the price IDs for Vercel!

---

### STEP 3: Update Vercel Environment Variables (5 minutes)

1. Go to: https://vercel.com/taxbridge/cross-border-tax/settings/environment-variables
2. Add/Update these 6 variables:

   | Variable | Value | Source |
   |----------|-------|--------|
   | `STRIPE_SECRET_KEY` | `sk_live_...` | From Step 1 |
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | From Step 1 |
   | `STRIPE_BASIC_PRICE_ID` | `price_...` | From Step 2 output |
   | `NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID` | `price_...` | Same as above |
   | `STRIPE_PRO_PRICE_ID` | `price_...` | From Step 2 output |
   | `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` | `price_...` | Same as above |

3. **Environment:** Select **"Production"** ✅
4. Click **"Save"**
5. Redeploy: Go to **Deployments** → Click latest → **"Redeploy"**

**Wait 2-3 minutes for deployment to complete.**

---

### STEP 4: Setup Webhook Endpoint (5 minutes)

1. Go to: https://dashboard.stripe.com/webhooks
2. Click: **"Add endpoint"**
3. Fill in:

   | Field | Value |
   |-------|-------|
   | Endpoint URL | `https://taxbridgecpa.com/api/stripe/webhook` |
   | Description | `TaxBridge Production Webhook` |
   | Events | Select these 5 events: |

   **Required Events:**
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
   - ✅ `charge.refunded`

4. Click: **"Add endpoint"**
5. Click: **"Signing secret"** → **"Reveal"** → Copy `whsec_...`
6. Go to Vercel env vars (Step 3) and add:
   - Variable: `STRIPE_WEBHOOK_SECRET`
   - Value: `whsec_...` (paste secret)
   - Environment: **Production** ✅
7. Redeploy again (Vercel → Deployments → Redeploy)

---

### STEP 5: Test Checkout Flow (15 minutes)

**USE TEST CARD - WILL NOT CHARGE REAL MONEY:**

1. Go to: https://taxbridgecpa.com/pricing
2. Click: **"Subscribe to Pro - $79/year"**
3. Fill payment form:

   | Field | Value |
   |-------|-------|
   | Card number | `4242 4242 4242 4242` |
   | Expiry | `12/28` (any future date) |
   | CVC | `123` (any 3 digits) |
   | ZIP | `12345` (any 5 digits) |

4. Click **"Subscribe"**
5. **Verify redirect to success page** (https://taxbridgecpa.com/dashboard)

---

### STEP 6: Verify Webhooks Received (2 minutes)

1. Go to: https://dashboard.stripe.com/webhooks
2. Click on your webhook endpoint
3. Check **"Recent events"** tab
4. **Verify these events show 200 OK:**
   - ✅ `checkout.session.completed` (Status: 200 OK)
   - ✅ `customer.subscription.created` (Status: 200 OK)
   - ✅ `invoice.payment_succeeded` (Status: 200 OK)

**If any shows 4xx or 5xx:** See troubleshooting section below.

---

### STEP 7: Refund Test Transaction (3 minutes)

**CRITICAL: Do this immediately to avoid test charges**

1. Go to: https://dashboard.stripe.com/payments
2. Click on the test payment (should be first in list)
3. Click: **"Refund"** button (top right)
4. Select: **"Full refund"** ($79.00)
5. Reason: "Test transaction"
6. Click: **"Refund payment"**
7. **Verify refund webhook:**
   - Go to: Webhooks → Recent events
   - Check `charge.refunded` shows **200 OK**

---

## ✅ SUCCESS CRITERIA

**Before announcing "REVENUE IS LIVE", verify ALL these:**

- [ ] Stripe Dashboard shows **"Production mode"** (not test mode)
- [ ] Checkout page loaded without "test mode" banner
- [ ] Payment succeeded with test card 4242...
- [ ] 3 webhook events received (checkout.session.completed, subscription.created, invoice.payment_succeeded)
- [ ] All webhook events returned **200 OK**
- [ ] Subscription created in Stripe Dashboard → Customers
- [ ] Refund processed successfully
- [ ] Refund webhook received (charge.refunded → 200 OK)

**ALL ✅ = PRODUCTION PAYMENTS ARE LIVE! 🎉**

**Announce:**
- Internal team: "Stripe is live, revenue enabled!"
- Marketing: "Go live with Product Hunt launch"
- Sales: "We can accept payments now"

---

## 🔥 TROUBLESHOOTING

### Issue: Script fails with "Invalid API key"

**Fix:**
```bash
# Verify you copied the LIVE key (starts with sk_live_)
echo $STRIPE_SECRET_KEY | head -c 10
# Should print: sk_live_51

# If it prints sk_test_, you used test key. Get live key:
open https://dashboard.stripe.com/apikeys
# Toggle to Production → Copy sk_live_ key
```

### Issue: Webhook returns 401 Unauthorized

**Cause:** Webhook secret not set in Vercel

**Fix:**
1. Get secret: Stripe Dashboard → Webhooks → Click endpoint → Signing secret → Reveal
2. Copy `whsec_...`
3. Vercel → Settings → Environment Variables
4. Add: `STRIPE_WEBHOOK_SECRET=whsec_...`
5. Environment: **Production** ✅
6. Redeploy

### Issue: Checkout shows "test mode" banner

**Cause:** Vercel env vars not updated or cached

**Fix:**
1. Verify Vercel env vars: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...`
2. Redeploy production
3. Hard refresh browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
4. Check again

### Issue: Webhook returns 500 Internal Server Error

**Debug:**
1. Click webhook event → View response body
2. Check Sentry for error details
3. Common causes:
   - Database connection failed
   - Missing env var
   - Code error in webhook handler
4. Fix code, redeploy, resend webhook

---

## 📊 POST-ACTIVATION MONITORING

**First 24 Hours:**

Monitor these dashboards:

1. **Stripe Dashboard:** https://dashboard.stripe.com/dashboard
   - Watch for first real payment
   - Verify MRR chart updates
   - Check webhook success rate >99%

2. **Vercel Logs:** https://vercel.com/taxbridge/cross-border-tax/logs
   - Watch for webhook errors
   - Verify checkout API calls succeed

3. **Database:**
   - Check `user_profiles` table
   - Verify `subscription_status='active'` for test user
   - Verify `stripe_customer_id` populated

**Set Alerts:**
- Stripe: Email notifications for failed payments
- Sentry: Webhook error rate >1%
- Daily revenue report: MRR, new customers, churn

---

## 🎯 NEXT STEPS AFTER GO-LIVE

**Immediate (Day 1):**
1. Monitor Stripe Dashboard for first real customer
2. Manually verify their subscription activated
3. Send welcome email

**Week 1:**
1. Enable marketing campaigns (Google Ads, Product Hunt)
2. Announce on social media: "We're live!"
3. Email waitlist: "Start your free trial"

**Week 2:**
1. Analyze conversion funnel: Landing → Signup → Payment
2. Identify drop-off points
3. A/B test pricing page

**Month 1 Goal:**
- First $1,000 MRR
- 10+ paying customers
- <5% churn rate

---

## 📞 SUPPORT CONTACTS

**If you get stuck:**

1. **Stripe Support:** https://support.stripe.com/
   - Live chat available 24/7
   - Response time: <5 minutes

2. **Vercel Support:** https://vercel.com/support
   - Email: support@vercel.com
   - Response time: <24 hours

3. **Internal:**
   - CEO: Michael (this repo owner)
   - CTO: Assign yourself if needed

**Escalation:**
- P0 blocker: Tag CEO in Slack
- Production down: Page on-call engineer

---

## CHECKLIST SUMMARY

Print this and check off as you go:

```
STRIPE PRODUCTION ACTIVATION CHECKLIST
======================================

[ ] Step 1: Get Stripe live keys (sk_live_, pk_live_)
[ ] Step 2: Run setup script with live key
[ ] Step 3: Update 6 Vercel env vars
[ ] Step 4: Setup webhook endpoint + 7 events
[ ] Step 5: Test checkout with card 4242...
[ ] Step 6: Verify 3 webhooks returned 200 OK
[ ] Step 7: Refund test transaction
[ ] Verify: All success criteria ✅
[ ] Announce: Revenue is LIVE! 🚀

TIME SPENT: _____ minutes
ISSUES ENCOUNTERED: _________________
STATUS: PASS / FAIL
```

**PASS = GO LIVE! Start marketing! 💰**

---

**Questions? Check:**
- Full testing guide: `docs/STRIPE_PRODUCTION_TESTING_GUIDE.md`
- Webhook verification: `docs/STRIPE_WEBHOOK_VERIFICATION.md`
- Setup script: `scripts/activate-stripe-production-annual.ts`
