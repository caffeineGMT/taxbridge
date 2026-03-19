# 🔴 STRIPE PRODUCTION ACTIVATION CHECKLIST
**REVENUE BLOCKER - P0-CRITICAL**

**Current Status**: 100% TEST MODE - ZERO revenue capability
**Impact**: Blocking all payments, $0 MRR
**Time to Fix**: 2 hours
**Owner**: Michael (CTO)

---

## BEFORE STATE (Current - All Placeholders ❌)

### Development Environment (.env.local)
```bash
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
STRIPE_PRO_PRICE_ID=price_1ProAnnual
STRIPE_ENTERPRISE_PRICE_ID=price_1EntAnnual
```

### Production Environment (.env.production + Vercel)
```bash
STRIPE_SECRET_KEY=sk_live_[YOUR_PRODUCTION_KEY]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_[YOUR_PRODUCTION_KEY]
STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET_HERE
STRIPE_BASIC_PRICE_ID=price_YOUR_LIVE_BASIC_PRICE_ID
STRIPE_PRO_PRICE_ID=price_YOUR_LIVE_PRO_PRICE_ID
STRIPE_ENTERPRISE_PRICE_ID=prod_YOUR_LIVE_ENTERPRISE_PRODUCT_ID
```

**ALL VALUES ARE PLACEHOLDERS** ❌

---

## ACTIVATION STEPS

### 📸 STEP 1: Login to Stripe Dashboard & Screenshot Mode Indicator
**Time**: 5 minutes

1. Go to: https://dashboard.stripe.com
2. Login with your Stripe account credentials
3. **CRITICAL**: Look at the top-left corner for the mode toggle
   - It should show either "Test mode" or "Live mode"
4. **SCREENSHOT REQUIRED**: Take a screenshot showing:
   - The mode indicator (top-left)
   - The current date/time (visible in screenshot)
   - The dashboard homepage
5. Save screenshot as: `docs/screenshots/stripe-mode-BEFORE.png`

**What you should see**:
- If in TEST mode: Toggle shows "Test mode" with orange indicator
- If in LIVE mode: Toggle shows "Live mode" with green indicator

**Action**: Toggle to "Live mode" by clicking the mode toggle

---

### 🔑 STEP 2: Get Production API Keys
**Time**: 10 minutes

1. In Stripe Dashboard (Live mode), go to: **Developers** → **API keys**
2. You should see two keys:
   - **Publishable key**: Starts with `pk_live_`
   - **Secret key**: Click "Reveal test key" to show, starts with `sk_live_`

3. **SCREENSHOT REQUIRED**: Take a screenshot showing:
   - The "API keys" page
   - Mode indicator showing "Live mode"
   - The publishable key visible (it's safe to show)
   - The secret key HIDDEN (do NOT reveal it in the screenshot)
4. Save screenshot as: `docs/screenshots/stripe-api-keys-LIVE.png`

5. **Copy the keys**:
   ```bash
   # Publishable Key (safe to expose)
   pk_live_[REDACTED - 51+ characters]

   # Secret Key (KEEP PRIVATE - do not commit to git)
   sk_live_[REDACTED - 51+ characters]
   ```

6. Temporarily save these to a secure note (1Password, LastPass, etc.)

---

### 💳 STEP 3: Create Production Price IDs
**Time**: 15 minutes

1. Make sure you're in **Live mode** (check top-left toggle)

2. Run the production setup script:
   ```bash
   export STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_KEY_FROM_STEP_2
   npx tsx scripts/activate-stripe-production-annual.ts
   ```

3. The script will create 3 products and return price IDs:
   ```
   ✅ Created: Basic Plan - $49/year
      Price ID: price_1XXXXXXXXXXXXX

   ✅ Created: Pro Plan - $79/year
      Price ID: price_1YYYYYYYYYYYYY

   ✅ Created: Enterprise Plan (contact sales)
      Product ID: prod_ZZZZZZZZZZZZZ
   ```

4. **Copy these price IDs** - you'll need them for Step 5

5. **VERIFICATION**: Go to Stripe Dashboard → Products
   - You should see 3 new products: Basic, Pro, Enterprise
   - All should be in "Live mode"

6. **SCREENSHOT REQUIRED**: Screenshot the Products page showing all 3 products
   - Save as: `docs/screenshots/stripe-products-LIVE.png`

---

### 🔗 STEP 4: Create Webhook Endpoint
**Time**: 10 minutes

1. In Stripe Dashboard (Live mode), go to: **Developers** → **Webhooks**

2. Click **"+ Add endpoint"**

3. Configure webhook:
   ```
   Endpoint URL: https://taxbridge.vercel.app/api/stripe/webhook
   Description: TaxBridge Production Webhook

   Events to send:
   ✅ checkout.session.completed
   ✅ customer.subscription.created
   ✅ customer.subscription.updated
   ✅ customer.subscription.deleted
   ✅ invoice.payment_succeeded
   ✅ invoice.payment_failed
   ```

4. Click **"Add endpoint"**

5. **Copy the Signing Secret**:
   - After creating the endpoint, you'll see "Signing secret"
   - Click "Reveal" to show it
   - It starts with `whsec_`
   - Example: `whsec_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

6. **SCREENSHOT REQUIRED**: Screenshot the webhook page showing:
   - The endpoint URL
   - Status: "Enabled"
   - The events being sent
   - Save as: `docs/screenshots/stripe-webhook-LIVE.png`

---

### 🔐 STEP 5: Update Production Environment Variables
**Time**: 30 minutes

#### Option A: Update Vercel Dashboard (Recommended)
1. Go to: https://vercel.com/your-username/taxbridge/settings/environment-variables
2. Update/Add these variables (select "Production" environment):

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_live_[FROM STEP 2]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_[FROM STEP 2]
STRIPE_WEBHOOK_SECRET=whsec_[FROM STEP 4]

# Price IDs from Step 3
STRIPE_BASIC_PRICE_ID=price_[FROM STEP 3]
NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID=price_[FROM STEP 3]
STRIPE_PRO_PRICE_ID=price_[FROM STEP 3]
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_[FROM STEP 3]
STRIPE_ENTERPRISE_PRICE_ID=prod_[FROM STEP 3]
NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=prod_[FROM STEP 3]
```

3. **SCREENSHOT REQUIRED**: Screenshot the Vercel environment variables page
   - Blur/hide the secret values
   - Show that variables are set for "Production" environment
   - Save as: `docs/screenshots/vercel-env-vars-PRODUCTION.png`

#### Option B: Update .env.production File (For reference only)
**⚠️ WARNING**: Do NOT commit real keys to git. This is for local reference only.

1. Update `/Users/michaelguo/hivemind-projects/cross-border-tax/.env.production`:
   ```bash
   STRIPE_SECRET_KEY=sk_live_[FROM STEP 2]
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_[FROM STEP 2]
   STRIPE_WEBHOOK_SECRET=whsec_[FROM STEP 4]

   STRIPE_BASIC_PRICE_ID=price_[FROM STEP 3]
   NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID=price_[FROM STEP 3]
   STRIPE_PRO_PRICE_ID=price_[FROM STEP 3]
   NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_[FROM STEP 3]
   STRIPE_ENTERPRISE_PRICE_ID=prod_[FROM STEP 3]
   NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=prod_[FROM STEP 3]
   ```

2. **Verify .env.production is in .gitignore** (it should be)
   ```bash
   grep ".env.production" .gitignore
   # Should return: .env.production
   ```

---

### ✅ STEP 6: Trigger Production Deployment
**Time**: 10 minutes

1. Redeploy the production site to pick up new env vars:
   ```bash
   # Option A: Push a trivial commit to trigger deployment
   git commit --allow-empty -m "chore: trigger redeploy for Stripe production keys"
   git push origin main

   # Option B: Manually redeploy in Vercel dashboard
   # Go to: https://vercel.com/your-username/taxbridge/deployments
   # Click the latest deployment → "Redeploy"
   ```

2. Wait for deployment to complete (~2 minutes)

3. **SCREENSHOT REQUIRED**: Screenshot Vercel deployment success
   - Save as: `docs/screenshots/vercel-deployment-SUCCESS.png`

---

### 🧪 STEP 7: Execute Test Payment with REAL Card
**Time**: 15 minutes

**⚠️ CRITICAL**: You will use a REAL credit card and be charged REAL money. Refund immediately after testing.

1. Open an **incognito browser window** (to simulate a real user)

2. Go to: https://taxbridge.vercel.app

3. Complete the full payment flow:
   ```
   Step 1: Complete the tax calculator
   Step 2: Click "Unlock Full Report" or "Upgrade to Pro"
   Step 3: Sign up with a NEW email (e.g., test+stripe@taxbridge.app)
   Step 4: Select "Pro - $79/year"
   Step 5: Enter REAL credit card details:
           Card: Your personal card (will be charged)
           Or use: 4242 4242 4242 4242 (Stripe test card - if it works, keys are wrong!)
   Step 6: Click "Subscribe"
   ```

4. **EXPECTED OUTCOMES**:
   - ✅ **SUCCESS**: Payment goes through, you see success page, charged $79
     - This means production mode is ACTIVE ✅
   - ❌ **FAILURE**: "Your card was declined" or test card works
     - This means test mode is still active ❌
     - Go back to Step 2 and verify you copied LIVE keys (sk_live_, not sk_test_)

5. **SCREENSHOT REQUIRED**:
   - Screenshot 1: Stripe checkout page (before payment)
     - Save as: `docs/screenshots/stripe-checkout-BEFORE.png`
   - Screenshot 2: Success page after payment
     - Save as: `docs/screenshots/stripe-checkout-SUCCESS.png`
   - Screenshot 3: Stripe Dashboard → Payments showing the new payment
     - Save as: `docs/screenshots/stripe-dashboard-payment-LIVE.png`

6. **REFUND THE TEST PAYMENT**:
   - Go to Stripe Dashboard → Payments
   - Click on the test payment
   - Click "Refund payment"
   - Refund the full $79
   - **SCREENSHOT**: Screenshot the refund confirmation
     - Save as: `docs/screenshots/stripe-refund-COMPLETE.png`

---

### 📊 STEP 8: Verify in Stripe Dashboard
**Time**: 10 minutes

1. Check that the payment appears in Stripe Dashboard:
   - Go to: **Payments** tab
   - Filter by: "Live mode"
   - You should see your test payment (and refund)

2. Check webhook events:
   - Go to: **Developers** → **Webhooks** → Click your webhook
   - Click "Events" tab
   - You should see events for `checkout.session.completed`

3. **SCREENSHOT REQUIRED**: Screenshot the webhook events
   - Save as: `docs/screenshots/stripe-webhook-events-LIVE.png`

---

### 📝 STEP 9: Run Automated Verification Script
**Time**: 5 minutes

1. Run the verification script:
   ```bash
   npm run verify:stripe-production
   ```

2. **Expected output**:
   ```
   ✅ STRIPE_SECRET_KEY starts with sk_live_
   ✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY starts with pk_live_
   ✅ STRIPE_WEBHOOK_SECRET starts with whsec_
   ✅ STRIPE_BASIC_PRICE_ID is set and not placeholder
   ✅ STRIPE_PRO_PRICE_ID is set and not placeholder
   ✅ STRIPE_ENTERPRISE_PRICE_ID is set and not placeholder
   ✅ Webhook endpoint is accessible
   ✅ All production keys verified

   🎉 STRIPE PRODUCTION MODE: ACTIVE
   ```

3. If any checks fail, review the failed step and fix it

4. **Copy the verification output** to `docs/verification-reports/stripe-production-VERIFIED.txt`

---

### 📄 STEP 10: Document Before/After
**Time**: 10 minutes

1. Create a summary document: `docs/STRIPE_PRODUCTION_ACTIVATION_SUMMARY.md`

2. Include:
   - Date/time of activation
   - Screenshot paths (all 8+ screenshots)
   - Before state: "All placeholder keys"
   - After state: "All production keys activated"
   - Test payment result: "✅ Successfully charged $79, refunded immediately"
   - Verification script output: "✅ All checks passed"
   - Next steps: "Monitor first real customer payment"

3. **Commit the documentation** (NOT the keys):
   ```bash
   git add docs/screenshots/stripe-*.png
   git add docs/STRIPE_PRODUCTION_ACTIVATION_SUMMARY.md
   git add docs/verification-reports/stripe-production-VERIFIED.txt
   git commit -m "[P0-CRITICAL] Stripe Production Keys Activated - Revenue Unblocked + VERIFICATION"
   git push origin main
   ```

---

## AFTER STATE (Expected Result ✅)

### Vercel Production Environment
```bash
STRIPE_SECRET_KEY=sk_live_51XXXXX... (real key, 108 chars)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51XXXXX... (real key, 108 chars)
STRIPE_WEBHOOK_SECRET=whsec_XXXXX... (real key, 64 chars)
STRIPE_BASIC_PRICE_ID=price_1XXXXX... (real price, 29 chars)
STRIPE_PRO_PRICE_ID=price_1XXXXX... (real price, 29 chars)
STRIPE_ENTERPRISE_PRICE_ID=prod_XXXXX... (real product, 24 chars)
```

**ALL VALUES ARE REAL PRODUCTION KEYS** ✅

---

## VERIFICATION CRITERIA (Task Completion Evidence)

To mark this task as COMPLETE, you MUST provide:

1. ✅ **Screenshot**: Stripe Dashboard showing "Live mode" indicator
2. ✅ **Screenshot**: Stripe API keys page (publishable key visible, secret key hidden)
3. ✅ **Screenshot**: Stripe Products page showing 3 products in Live mode
4. ✅ **Screenshot**: Stripe Webhook configuration page
5. ✅ **Screenshot**: Vercel environment variables (production, values blurred)
6. ✅ **Screenshot**: Stripe checkout page (before payment)
7. ✅ **Screenshot**: Stripe success page (after payment)
8. ✅ **Screenshot**: Stripe Dashboard payment entry showing $79 charge + refund
9. ✅ **Screenshot**: Stripe webhook events showing checkout.session.completed
10. ✅ **Screenshot**: Verification script output showing all checks passed
11. ✅ **Before/After .env diff**: Documented in summary file
12. ✅ **Test payment result**: Charged $79, refunded immediately

**All 12 pieces of evidence MUST be provided.**

---

## SECURITY CHECKLIST

- [ ] .env.production is in .gitignore ✅
- [ ] No secret keys committed to GitHub ✅
- [ ] Secret keys stored securely in Vercel only ✅
- [ ] Webhook signing secret verified in webhook handler ✅
- [ ] Test payment refunded immediately ✅
- [ ] Production keys NOT exposed in client-side code ✅

---

## TROUBLESHOOTING

### "Payment succeeded but used test card 4242..."
❌ **Problem**: You're still in test mode
✅ **Solution**:
1. Go back to Stripe Dashboard
2. Verify the mode toggle shows "Live mode" (not Test mode)
3. Verify API keys start with `sk_live_` and `pk_live_` (not `sk_test_`, `pk_test_`)
4. Update Vercel env vars with LIVE keys
5. Redeploy
6. Try again

### "Card was declined"
❌ **Problem**: Either (a) you're in production mode and your real card was declined, or (b) bank blocked the charge
✅ **Solution**:
1. Try a different card
2. Contact your bank to authorize the charge
3. Use a card with sufficient funds

### "Webhook events not appearing"
❌ **Problem**: Webhook not configured correctly
✅ **Solution**:
1. Verify webhook URL: `https://taxbridge.vercel.app/api/stripe/webhook`
2. Verify webhook is in "Live mode" (not Test mode)
3. Check Vercel logs for incoming webhook requests
4. Verify STRIPE_WEBHOOK_SECRET matches the webhook signing secret

### "Verification script fails"
❌ **Problem**: Environment variables not set correctly
✅ **Solution**:
1. Run: `npx tsx scripts/verify-stripe-production.ts --debug`
2. Review which checks are failing
3. Fix the specific env vars that are failing
4. Redeploy
5. Run verification again

---

## TIMELINE

| Step | Time | Cumulative |
|------|------|------------|
| 1. Screenshot mode | 5 min | 5 min |
| 2. Get API keys | 10 min | 15 min |
| 3. Create price IDs | 15 min | 30 min |
| 4. Create webhook | 10 min | 40 min |
| 5. Update env vars | 30 min | 70 min |
| 6. Deploy | 10 min | 80 min |
| 7. Test payment | 15 min | 95 min |
| 8. Verify dashboard | 10 min | 105 min |
| 9. Run verification | 5 min | 110 min |
| 10. Document | 10 min | 120 min |

**Total: 2 hours**

---

## SUCCESS CRITERIA

✅ Stripe Dashboard shows "Live mode"
✅ All API keys start with `sk_live_`, `pk_live_`, `whsec_`
✅ 3 products created in Stripe (Basic $49, Pro $79, Enterprise)
✅ Webhook endpoint created and verified
✅ Vercel environment variables updated
✅ Test payment successful with REAL card (charged $79)
✅ Test payment refunded immediately
✅ Verification script passes all checks
✅ 12 screenshots provided as evidence
✅ Documentation committed to git

**Revenue: UNBLOCKED** 🎉

---

## NEXT STEPS (After Activation)

1. Monitor first real customer payment in Stripe Dashboard
2. Set up Stripe alerts for failed payments
3. Configure Stripe billing portal for customers to manage subscriptions
4. Set up Stripe tax collection (if needed)
5. Connect Stripe to accounting software (QuickBooks, Xero)

---

**Last Updated**: 2026-03-19
**Status**: READY TO EXECUTE
**Owner**: Michael (CTO)
**Priority**: P0-CRITICAL
**Revenue Impact**: Unblocks ALL revenue ($0 → potential $5K-$20K MRR)**
