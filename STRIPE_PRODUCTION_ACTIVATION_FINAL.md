# 🚀 STRIPE PRODUCTION ACTIVATION - FINAL EXECUTION GUIDE

**REVENUE BLOCKER - P0 CRITICAL**
**Deadline**: March 20, 2026 23:59:00 UTC
**Time Required**: 20-30 minutes
**Risk Level**: Low (all infrastructure ready)

---

## ✅ PRE-FLIGHT CHECKLIST

Before starting, verify these prerequisites:

- [ ] **Stripe Account Verified**
  - Go to: https://dashboard.stripe.com/settings/account
  - Verify all sections show green checkmarks:
    - ✓ Business details
    - ✓ Bank account connected
    - ✓ Tax information submitted
    - ✓ Email verified
  - If anything missing: Complete it first, this is required by Stripe

- [ ] **Domain Live**: https://taxbridge.app is accessible
- [ ] **Vercel Access**: You can log into https://vercel.com/dashboard
- [ ] **Credit Card Ready**: Have a real credit card for testing (you'll refund it)
- [ ] **30 Minutes Free**: No interruptions during activation

---

## 🎯 ACTIVATION WORKFLOW (5 Steps)

### STEP 1: Get Stripe Live API Keys (3 minutes)

1. Open: https://dashboard.stripe.com/apikeys
2. **Toggle to "Production" mode** (top-right corner - very important!)
3. Click "Reveal live key token" for Secret key
4. Copy the **Secret key** (starts with `sk_live_`)
5. Copy the **Publishable key** (starts with `pk_live_`)

**Save these somewhere safe temporarily** (you'll need them in Step 2)

---

### STEP 2: Run Production Activation Script (5 minutes)

Open terminal in project directory and run:

```bash
npm run stripe:activate-production
```

**When prompted, enter:**

1. **Stripe LIVE secret key**: Paste `sk_live_...` from Step 1
2. **Stripe LIVE publishable key**: Paste `pk_live_...` from Step 1
3. **Webhook signing secret**: Press Enter to skip (we'll do this in Step 3)

**What this script does:**
- ✅ Validates your Stripe account is production-ready
- ✅ Creates TaxBridge Pro product ($299/year)
- ✅ Creates TaxBridge Enterprise product ($2,000/year)
- ✅ Generates `.env.production` file with all configuration
- ✅ Outputs price IDs (you'll need these for Vercel)

**Expected output:**
```
✅ Products Created Successfully!
   Pro Annual: $299/year (price_XXXXXXXXXXXXX)
   Enterprise Annual: $2,000/year (price_XXXXXXXXXXXXX)
```

**IMPORTANT**: Copy the two price IDs - you need them for Step 4!

---

### STEP 3: Create Webhook Endpoint (5 minutes)

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **"+ Add endpoint"** button
3. Fill in:
   - **Endpoint URL**: `https://taxbridge.app/api/stripe/webhook`
   - **Description**: TaxBridge Production Webhook
   - **Events to send**: Click "Select events" and choose these 6:
     - ☑️ `checkout.session.completed`
     - ☑️ `customer.subscription.created`
     - ☑️ `customer.subscription.updated`
     - ☑️ `customer.subscription.deleted`
     - ☑️ `invoice.payment_succeeded`
     - ☑️ `invoice.payment_failed`
4. Click **"Add endpoint"**
5. Click the webhook you just created
6. Under "Signing secret", click **"Reveal"**
7. Copy the webhook secret (starts with `whsec_`)

**Save this webhook secret** - you need it for Step 4!

---

### STEP 4: Configure Vercel Environment Variables (7 minutes)

1. Go to: https://vercel.com/dashboard
2. Select the **TaxBridge** project
3. Click **Settings** → **Environment Variables**
4. For each variable below, click **"Add New"**:
   - Select Environment: **Production** (ONLY Production, not Preview/Development)
   - Click **"Add"**

**Add these 8 variables:**

| Variable Name | Value | Where to Get It |
|--------------|-------|-----------------|
| `STRIPE_SECRET_KEY` | `sk_live_...` | From Step 1 |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | From Step 1 |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | From Step 3 |
| `STRIPE_PRO_PRICE_ID` | `price_...` | From Step 2 script output |
| `STRIPE_ENTERPRISE_PRICE_ID` | `price_...` | From Step 2 script output |
| `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` | `price_...` | Same as STRIPE_PRO_PRICE_ID |
| `NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID` | `price_...` | Same as STRIPE_ENTERPRISE_PRICE_ID |
| `NEXT_PUBLIC_APP_URL` | `https://taxbridge.app` | Production domain |

**Alternative: Quick copy-paste method**

Open `.env.production` file (created by Step 2 script) and copy values from there.

**After adding all 8 variables:**
- Click **"Save"**
- Go to **Deployments** tab
- Click **"Redeploy"** on latest deployment
- Select **"Production"** environment
- Wait for deployment to complete (~2 minutes)

---

### STEP 5: Test Live Payment Flow (10 minutes)

**CRITICAL: This uses your REAL credit card. You'll be charged $299 and can refund immediately after.**

Run the test script:

```bash
npm run test:live-payment
```

**What happens:**

1. Script creates a Stripe checkout session
2. Opens payment URL in your browser
3. **You complete the payment** with your real credit card
4. Script polls for payment confirmation
5. Verifies webhook received the event
6. **Offers to refund** the test payment

**Step-by-step test procedure:**

1. Script outputs: `Payment URL: https://checkout.stripe.com/...`
2. **Open that URL in your browser**
3. Fill in payment form:
   - Use your **real credit card** (test cards won't work in live mode)
   - Email: Use a test email (e.g., `test@taxbridge.app`)
   - Card: Your real credit card
4. Click **"Subscribe"**
5. You'll be charged **$299.00**
6. Redirected to: `https://taxbridge.app/dashboard?upgrade=success`
7. Return to terminal - script should show:
   ```
   ✅ Payment received!
   ✅ Webhook processed successfully
   ```
8. Script asks: **"Refund this payment? (yes/no)"**
9. Type **"yes"** and press Enter
10. Verify refund processed:
    ```
    ✅ Refund issued: $299.00
    ```

---

## 🔍 VERIFICATION CHECKLIST

After completing all steps, verify in **Stripe Dashboard**:

### Payments
- Go to: https://dashboard.stripe.com/payments
- [ ] Payment of $299.00 appears
- [ ] Status: "Refunded" (green badge)
- [ ] Customer email matches test email

### Subscriptions
- Go to: https://dashboard.stripe.com/subscriptions
- [ ] Subscription created
- [ ] Status: "Canceled" (after you refunded)
- [ ] Plan: "TaxBridge Pro - $299/year"

### Webhooks
- Go to: https://dashboard.stripe.com/webhooks
- [ ] Webhook endpoint shows **"Enabled"** status
- [ ] Click the webhook → Recent deliveries tab
- [ ] Latest events show **"Succeeded"** (HTTP 200 responses)
- [ ] Events received:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `invoice.payment_succeeded`

### Products
- Go to: https://dashboard.stripe.com/products
- [ ] "TaxBridge Pro" product exists ($299/year)
- [ ] "TaxBridge Enterprise" product exists ($2,000/year)
- [ ] Both show "Active" status

---

## 🐛 TROUBLESHOOTING

### Issue: "No such price: price_..."

**Cause**: Vercel is using test mode price IDs instead of production price IDs

**Fix:**
1. Check `.env.production` file for correct price IDs (created by Step 2 script)
2. Verify those price IDs are in Vercel environment variables
3. Make sure you selected **"Production"** environment in Vercel (not Preview/Development)
4. Redeploy: Vercel → Deployments → Redeploy

---

### Issue: "Webhook signature verification failed"

**Cause**: Webhook secret in Vercel doesn't match Stripe webhook

**Fix:**
1. Go to Stripe Dashboard → Webhooks → Click your webhook
2. Click "Reveal" under "Signing secret"
3. Copy the `whsec_...` value
4. Go to Vercel → Settings → Environment Variables
5. Find `STRIPE_WEBHOOK_SECRET`, click "..." → Edit
6. Paste the correct webhook secret
7. Redeploy

---

### Issue: "Invalid API key" or "sk_test_ not allowed"

**Cause**: Using test mode keys instead of production keys

**Fix:**
1. Go to Stripe Dashboard: https://dashboard.stripe.com/apikeys
2. **Toggle to "Production" mode** (top-right corner)
3. Copy the production keys (sk_live_ and pk_live_)
4. Update Vercel environment variables
5. Redeploy

---

### Issue: Payment completes but user not upgraded

**Cause**: Webhook not firing or database error

**Fix:**
1. Check Stripe Dashboard → Webhooks → Your endpoint → Recent deliveries
2. If showing errors (red X), click to see error details
3. Common causes:
   - Wrong webhook URL (should be `https://taxbridge.app/api/stripe/webhook`)
   - Missing `STRIPE_WEBHOOK_SECRET` in Vercel
   - Database connection issue (check Vercel logs)
4. Fix the issue, then click "Resend" in Stripe webhook deliveries
5. Check Vercel → Deployments → Functions logs for errors

---

### Issue: Script can't create products

**Cause**: Stripe account not fully activated

**Fix:**
1. Go to: https://dashboard.stripe.com/settings/account
2. Complete all missing sections:
   - Business details
   - Bank account
   - Tax information
3. Wait for Stripe to verify (usually instant, can take up to 1 day)
4. Try activation script again

---

## ✅ SUCCESS CRITERIA

You'll know Stripe production is fully activated when:

- ✅ Real payment completed ($299 charged to your card)
- ✅ User automatically upgraded to Pro tier
- ✅ Subscription created in Stripe Dashboard
- ✅ Webhook logs show "Succeeded" (HTTP 200)
- ✅ Payment refunded successfully
- ✅ No errors in Vercel logs
- ✅ No errors in Stripe webhook logs
- ✅ All 8 environment variables set in Vercel

**When all checkboxes above are ✅, Stripe production is LIVE and ready for real customers!**

---

## 📊 POST-ACTIVATION TASKS

### Immediate (Next 10 minutes)
- [ ] Cancel test subscription in Stripe Dashboard
- [ ] Verify refund appears on your credit card
- [ ] Check Sentry dashboard for any errors: https://sentry.io
- [ ] Update team: "Stripe production activated - we can accept payments!"

### Within 24 Hours
- [ ] Enable Stripe Radar (fraud prevention): https://dashboard.stripe.com/radar
- [ ] Configure email receipts: https://dashboard.stripe.com/settings/emails
- [ ] Set up revenue alerts (Slack or email)
- [ ] Test checkout flow from marketing site

### Within 1 Week
- [ ] Connect Stripe to accounting software (QuickBooks/Xero)
- [ ] Set up daily revenue reports
- [ ] Monitor first real customer payments
- [ ] Review Stripe Dashboard daily

---

## 🚨 SECURITY REMINDERS

**NEVER commit these to GitHub:**
- ❌ `.env.production` file (should be in .gitignore)
- ❌ Live API keys (sk_live_, pk_live_)
- ❌ Webhook secrets (whsec_)

**WHERE to store production secrets:**
- ✅ Vercel environment variables (Production only)
- ✅ Password manager (1Password, LastPass, etc.)
- ✅ Encrypted notes app

**ALWAYS:**
- Keep Stripe API keys secret
- Never share webhook signing secret
- Rotate keys if compromised
- Use different keys for test vs production

---

## 📖 ADDITIONAL RESOURCES

**Stripe Documentation:**
- Dashboard: https://dashboard.stripe.com
- API Docs: https://stripe.com/docs/api
- Webhooks Guide: https://stripe.com/docs/webhooks
- Support: https://support.stripe.com (24/7)

**TaxBridge Documentation:**
- Full Setup Guide: `docs/STRIPE_PRODUCTION_SETUP.md`
- CTO Quick Ref: `docs/STRIPE_ACTIVATION_QUICK_REF.md`
- Live Payment Testing: `docs/LIVE_PAYMENT_TEST_GUIDE.md`

**Helpful npm Scripts:**
```bash
npm run stripe:activate-production  # Run activation script
npm run test:live-payment           # Test live payment flow
npm run verify:stripe:live          # Verify configuration
npm run stripe:quickstart           # Alternative quick setup
```

---

## 🆘 EMERGENCY CONTACTS

**Stripe Issues:**
- Dashboard: https://dashboard.stripe.com
- Support: https://support.stripe.com
- Phone: 1-888-926-2289 (24/7)

**Vercel Issues:**
- Dashboard: https://vercel.com/dashboard
- Support: https://vercel.com/support
- Docs: https://vercel.com/docs

**Critical Production Bug:**
- Check Sentry: https://sentry.io
- Check Vercel logs: Deployments → Functions
- Rollback: Vercel → Deployments → Previous deployment → Redeploy

---

## 🎯 ESTIMATED TIMELINE

| Step | Action | Time | Status |
|------|--------|------|--------|
| 0 | Pre-flight checklist | 2 min | ⏳ |
| 1 | Get Stripe API keys | 3 min | ⏳ |
| 2 | Run activation script | 5 min | ⏳ |
| 3 | Create webhook | 5 min | ⏳ |
| 4 | Configure Vercel env vars | 7 min | ⏳ |
| 5 | Test live payment | 10 min | ⏳ |
| **TOTAL** | **All steps** | **32 min** | **Ready** |

---

## 🚀 READY TO START?

**First command to run:**

```bash
npm run stripe:activate-production
```

**This is the ONLY blocker to accepting real payments and generating revenue.**

Once complete, TaxBridge will be **REVENUE-READY** and can start making money! 💰

---

**Last Updated**: March 19, 2026
**Status**: ✅ All infrastructure ready
**Blocker**: None - Just needs manual execution
**Risk**: Low - Comprehensive testing complete
**Estimated Time**: 30 minutes
**Revenue Impact**: Immediate - Can accept payments as soon as testing passes
