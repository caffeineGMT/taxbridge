# Live Payment Test - Step-by-Step Execution Guide

**🎯 Objective**: Validate complete production payment flow with real credit card

**⏱️ Estimated Time**: 20-30 minutes

**💰 Cost**: $0 (charge + full refund, minus ~$0.30 Stripe fee)

**⚠️ IMPORTANT**: This test uses a REAL credit card and will charge $299. The charge will be fully refunded, but Stripe keeps a ~$0.30 processing fee.

---

## 📋 Prerequisites Checklist

Before starting, verify:

- [ ] Production deployment is live at https://taxbridge.app
- [ ] Stripe is in LIVE mode (keys start with `sk_live_` and `pk_live_`)
- [ ] Real credit card available (NOT test card 4242...)
- [ ] Access to Stripe Dashboard (https://dashboard.stripe.com)
- [ ] Database access via `sqlite3 data/taxbridge.db`
- [ ] Unique test email ready (e.g., `youremail+livetest@gmail.com`)

### Quick Pre-Flight Check

```bash
# 1. Verify production deployment
curl -I https://taxbridge.app

# 2. Check Stripe configuration (should show sk_live_ keys)
vercel env ls production | grep STRIPE

# 3. Test database access
sqlite3 data/taxbridge.db "SELECT COUNT(*) FROM user_profiles;"

# 4. Verify helper script works
tsx scripts/verify-live-payment-test.ts
```

**Expected**: All checks pass ✅

---

## 🚀 Test Execution

### **Part 1: Create Test Account** (2 minutes)

#### Step 1.1: Sign Up

1. Open browser to https://taxbridge.app/sign-up
2. Enter test email: `youremail+livetest@gmail.com`
3. Create password and complete Clerk signup
4. Verify email if prompted
5. Complete onboarding flow

#### Step 1.2: Verify Account Created

```bash
# Run verification script
tsx scripts/verify-live-payment-test.ts livetest

# Or manually check database
sqlite3 data/taxbridge.db "SELECT id, email, subscription_tier FROM user_profiles WHERE email LIKE '%livetest%';"
```

**Expected Output**:
```
User ID: [some number]
Email: youremail+livetest@gmail.com
Tier: free
Status: none
Customer ID: NULL
Subscription ID: NULL
```

**✅ Checkpoint**: User exists with tier = 'free'

**📸 Screenshot**: Save as `screenshots/01-account-creation.png`

---

### **Part 2: Execute Live Checkout** (3 minutes)

#### Step 2.1: Navigate to Pricing

1. Go to https://taxbridge.app/pricing
2. Find "Pro" plan ($299/year)
3. Click **"Upgrade to Pro"** button

#### Step 2.2: Verify Checkout Session

**Check URL**: Should redirect to `https://checkout.stripe.com/c/pay/cs_live_...`

**✅ Checkpoint**: URL starts with `cs_live_` (NOT `cs_test_`)

#### Step 2.3: Complete Payment

⚠️ **CRITICAL**: You are about to charge a REAL credit card $299

Fill in payment form:
- **Card Number**: Your real credit card (will charge $299)
- **Expiry**: Valid expiration date
- **CVC**: Valid security code
- **Name on Card**: Your name
- **Billing Address**: Your real address

Click **"Subscribe"** button

**⏱️ Wait for Processing**: 5-10 seconds

#### Step 2.4: Verify Success Redirect

**Expected**: Redirect to `https://taxbridge.app/dashboard?upgrade=success`

**✅ Checkpoint**: Success message displayed

**📸 Screenshot**: Save as `screenshots/02-payment-success.png`

---

### **Part 3: Verify Stripe Payment** (2 minutes)

#### Step 3.1: Check Stripe Dashboard

1. Open https://dashboard.stripe.com/payments
2. Find the most recent payment (should be $299.00)
3. Click to view details

**Verify**:
- [ ] Status: **Succeeded** (green badge)
- [ ] Amount: **$299.00**
- [ ] Customer ID: `cus_...` (note this down)
- [ ] Description: "Pro Plan - Annual Subscription"

**Copy these values for later**:
- Customer ID: `cus_________________`
- Payment ID: `pi_________________`
- Subscription ID: `sub_________________`

**📸 Screenshot**: Save as `screenshots/03-stripe-payment.png`

---

### **Part 4: Verify Webhook Processing** (2 minutes)

#### Step 4.1: Check Webhook Delivery

1. Go to https://dashboard.stripe.com/webhooks
2. Click your webhook endpoint (should be `https://taxbridge.app/api/stripe/webhook`)
3. Scroll to "Events" section
4. Find the most recent `checkout.session.completed` event
5. Click to view details

**Verify**:
- [ ] Status: **Succeeded** (green checkmark)
- [ ] Response: `{"received":true}` with 200 status code
- [ ] Timestamp: Within last 5 minutes

**📸 Screenshot**: Save as `screenshots/04-webhook-success.png`

#### Step 4.2: Verify Database Update

```bash
# Run verification script
tsx scripts/verify-live-payment-test.ts livetest
```

**Expected Output**:
```
✅ User Found
📧 Email: youremail+livetest@gmail.com
🆔 User ID: [number]

💳 Subscription Status
Tier: PRO
Status: active

🔗 Stripe Integration
✓ Customer ID: cus_...
✓ Subscription ID: sub_...

✅ ALL CHECKS PASSED
```

**Manual Database Check** (alternative):
```bash
sqlite3 data/taxbridge.db "SELECT subscription_tier, stripe_customer_id, stripe_subscription_id, subscription_status FROM user_profiles WHERE email LIKE '%livetest%';"
```

**Expected**:
```
pro|cus_...|sub_...|active
```

**✅ Checkpoint**: Tier = 'pro', Status = 'active', Stripe IDs populated

**📸 Screenshot**: Save terminal output as `screenshots/05-database-upgrade.png`

---

### **Part 5: Verify Pro Features Unlocked** (5 minutes)

#### Step 5.1: Test Unlimited RSU Entries

1. Go to https://taxbridge.app/dashboard
2. Click **"Add RSU Entry"**
3. Fill in sample data:
   - Vest Date: 2025-03-15
   - FMV (USD): $100.00
   - Shares: 10
   - Employer: Meta
4. Click "Save"
5. **Repeat 4 more times** to create 5 total entries

**Verify**:
- [ ] All 5 entries saved successfully
- [ ] No "Upgrade to Pro" paywall shown
- [ ] Free tier limit (10 entries) bypassed

#### Step 5.2: Test PDF Export

1. On dashboard, click **"Export PDF"** button
2. Wait for PDF to generate

**Verify**:
- [ ] PDF downloads successfully
- [ ] No upgrade modal shown (would show on free tier)
- [ ] PDF contains all RSU entries

#### Step 5.3: Verify Pro Badge

1. Check dashboard header
2. Check settings page

**Verify**:
- [ ] "Pro" badge displayed
- [ ] Settings shows subscription details
- [ ] Next billing date shown (1 year from today)

**✅ Checkpoint**: All Pro features accessible

**📸 Screenshot**: Save as `screenshots/06-pro-features.png`

---

### **Part 6: Process Full Refund** (3 minutes)

⚠️ **IMPORTANT**: This will refund your $299 charge

#### Step 6.1: Navigate to Payment

1. Go to https://dashboard.stripe.com/payments
2. Find the $299 payment from this test
3. Click to open payment details

#### Step 6.2: Issue Refund

1. Click **"Refund"** button (top-right)
2. Select **"Full refund"** ($299.00)
3. Reason: `Test transaction - verifying production payment flow`
4. Click **"Refund payment"**

**⏱️ Wait**: Refund processes instantly for most cards

#### Step 6.3: Verify Refund

**Check payment page**:
- [ ] Status changed to **"Refunded"** (orange badge)
- [ ] Timeline shows refund event
- [ ] Amount refunded: $299.00

**Note Refund ID**: `re_________________`

**✅ Checkpoint**: Refund succeeded

**📸 Screenshot**: Save as `screenshots/07-refund-success.png`

---

### **Part 7: Verify Downgrade to Free Tier** (10 minutes)

⚠️ **WAIT TIME REQUIRED**: Webhook delivery may take 1-5 minutes

#### Step 7.1: Wait for Webhook

**Expected webhook**: `customer.subscription.deleted` (triggered by refund)

**Check webhook delivery**:
1. Go to https://dashboard.stripe.com/webhooks
2. Refresh page every 30 seconds
3. Look for `customer.subscription.deleted` event

**⏱️ Maximum wait**: 5 minutes

If not delivered after 5 minutes:
```bash
# Check Vercel logs for errors
vercel logs --prod | grep webhook
```

#### Step 7.2: Verify Database Downgrade

```bash
# Run verification script
tsx scripts/verify-live-payment-test.ts livetest
```

**Expected Output**:
```
💳 Subscription Status
Tier: FREE
Status: canceled

🔗 Stripe Integration
✓ Customer ID: cus_... (preserved)
✓ Subscription ID: sub_... (preserved)
```

**Manual Database Check**:
```bash
sqlite3 data/taxbridge.db "SELECT subscription_tier, subscription_status FROM user_profiles WHERE email LIKE '%livetest%';"
```

**Expected**:
```
free|canceled
```

**✅ Checkpoint**: Tier = 'free', Status = 'canceled'

**📸 Screenshot**: Save terminal output as `screenshots/08-downgrade.png`

#### Step 7.3: Verify Data Preservation

```bash
# Check RSU entries still exist
sqlite3 data/taxbridge.db "SELECT COUNT(*) FROM rsu_entries WHERE user_id = [YOUR_USER_ID];"
```

**Expected**: Should show `5` (entries created in Part 5)

**✅ Checkpoint**: User data preserved after downgrade

#### Step 7.4: Verify UI Changes

1. Log in to https://taxbridge.app
2. Go to dashboard

**Verify**:
- [ ] "Free" tier badge (NOT "Pro")
- [ ] "Upgrade to Pro" CTAs visible again
- [ ] Existing RSU entries still displayed
- [ ] PDF export shows upgrade modal
- [ ] New RSU creation blocked after 1 entry

**📸 Screenshot**: Save as `screenshots/09-free-tier-ui.png`

---

## ✅ Test Completion Checklist

### All Steps Completed

- [ ] Part 1: Account created ✅
- [ ] Part 2: Checkout completed ✅
- [ ] Part 3: Payment verified ✅
- [ ] Part 4: Webhook processed ✅
- [ ] Part 5: Pro features unlocked ✅
- [ ] Part 6: Refund processed ✅
- [ ] Part 7: Downgrade verified ✅
- [ ] Part 8: Data preserved ✅

### Documentation

- [ ] All screenshots captured (9 total)
- [ ] Test report filled: `docs/LIVE_PAYMENT_TEST_REPORT.md`
- [ ] No errors in Vercel logs
- [ ] No errors in Stripe webhook logs

### Financial

- [ ] Payment charged: $299.00 ✅
- [ ] Payment refunded: $299.00 ✅
- [ ] Net cost: $0.00 (plus ~$0.30 Stripe fee)

---

## 📊 Fill Out Test Report

Now complete the official test report:

```bash
# Open report template
open docs/LIVE_PAYMENT_TEST_REPORT.md

# Or edit directly
code docs/LIVE_PAYMENT_TEST_REPORT.md
```

Fill in all sections with:
- Timestamps
- IDs (session, payment, customer, subscription, refund)
- Screenshot references
- Test results (✅ or ❌)
- Any issues found

---

## 🐛 Troubleshooting

### Issue: Webhook not delivered

**Symptoms**: Database not updating after payment

**Fix**:
1. Check webhook endpoint configuration in Stripe
2. Verify `STRIPE_WEBHOOK_SECRET` matches in Vercel environment
3. Check Vercel logs: `vercel logs --prod | grep webhook`
4. Manually trigger webhook event in Stripe Dashboard

### Issue: Payment succeeds but no tier upgrade

**Symptoms**: Payment in Stripe, but tier still 'free'

**Checklist**:
1. Check webhook events in Stripe (should show 200 response)
2. Verify database connection in production
3. Check Vercel logs for errors
4. Verify user ID matches in webhook metadata

### Issue: Refund doesn't trigger downgrade

**Symptoms**: Refund processed but tier still 'pro'

**Fix**:
1. Wait 5 minutes for webhook delivery
2. Check for `customer.subscription.deleted` event in Stripe
3. Manually update database if needed:
```bash
sqlite3 data/taxbridge.db "UPDATE user_profiles SET subscription_tier='free', subscription_status='canceled' WHERE email LIKE '%livetest%';"
```

### Issue: Test card used instead of real card

**Symptoms**: Payment succeeds but shows `cs_test_` instead of `cs_live_`

**Fix**:
1. Verify Stripe publishable key in Vercel starts with `pk_live_`
2. Clear browser cache and retry
3. Check network tab in DevTools for Stripe API calls

---

## 🚀 Next Steps After Successful Test

### Immediate Actions

1. **Archive test account** (do NOT delete)
   ```bash
   sqlite3 data/taxbridge.db "UPDATE user_profiles SET email='archived_livetest@taxbridge.test' WHERE email LIKE '%livetest%';"
   ```

2. **Update production monitoring**
   - Set up Stripe webhook monitoring alerts
   - Configure payment failure notifications
   - Enable fraud detection rules

3. **Document results**
   - Commit test report to git
   - Share with team
   - Update runbook

### Enable Revenue 💰

**You are now ready to accept real customer payments!**

1. **Remove test mode warnings** (if any)
2. **Enable payment pages for all users**
3. **Monitor first 10 real payments closely**
4. **Set up automated refund policies**
5. **Configure subscription management settings**

### Marketing Go-Live

- [ ] Announce payment acceptance on Product Hunt
- [ ] Update landing page CTAs to "Start Free Trial"
- [ ] Enable Google Ads payment conversion tracking
- [ ] Launch email drip for free-to-paid conversion
- [ ] Set up customer success onboarding for Pro users

---

## 📞 Support

If you encounter issues during the test:

1. **Check Stripe Dashboard**: https://dashboard.stripe.com/events
2. **Check Vercel Logs**: `vercel logs --prod --since 30m`
3. **Check Database State**: `tsx scripts/verify-live-payment-test.ts`
4. **Review Webhook Events**: Look for 4xx/5xx errors

---

**Last Updated**: 2026-03-18
**Test Version**: 1.0
**Production URL**: https://taxbridge.app
