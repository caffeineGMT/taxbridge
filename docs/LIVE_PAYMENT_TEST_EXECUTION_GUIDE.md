# Live Payment Test - Execution Guide

**Purpose**: Validate end-to-end payment flow in production with real credit card
**Duration**: 20-30 minutes
**Cost**: $0 net ($299 charge + $299 refund, ~$0.30 Stripe fee non-refundable)

---

## Prerequisites

### Required Access
- [ ] Real credit card (will be charged $299, then refunded)
- [ ] Stripe Dashboard access (https://dashboard.stripe.com)
- [ ] Vercel Dashboard access (for logs)
- [ ] Database access (local or production)
- [ ] Email access (for test account signup)

### Pre-Flight Verification

**MUST RUN FIRST:**
```bash
npm run verify:payment-test
# Or: npx tsx scripts/verify-payment-test-prerequisites.ts
```

This script checks:
- ✅ Database connection and schema
- ✅ Stripe production mode (sk_live_* keys)
- ✅ Production deployment accessible
- ✅ Webhook endpoint responding
- ✅ Clerk authentication configured

**Do not proceed if any checks fail!**

---

## Test Execution Steps

### Part 1: Create Test Account (5 minutes)

1. **Choose test email**
   ```
   Format: youremail+livetest-MMDD@gmail.com
   Example: michael+livetest-0318@gmail.com

   Note: Using +alias allows emails to same inbox while creating unique accounts
   ```

2. **Sign up on production**
   - Navigate to: https://cross-border-tax.vercel.app/sign-up
   - Enter test email
   - Complete Clerk signup flow (verify email if required)
   - Complete onboarding wizard (enter sample tax info)

3. **Verify initial state**
   ```bash
   # Replace %livetest% with your actual email pattern
   sqlite3 data/taxbridge.db \
     "SELECT id, email, subscription_tier, stripe_customer_id
      FROM user_profiles WHERE email LIKE '%livetest-0318%';"
   ```

   **Expected output:**
   ```
   id         | email                              | subscription_tier | stripe_customer_id
   ---------- | ---------------------------------- | ----------------- | ------------------
   123        | michael+livetest-0318@gmail.com    | free              | NULL
   ```

   **✅ Checkpoint:** User exists with tier='free', no Stripe IDs

---

### Part 2: Execute Live Payment (3 minutes)

1. **Navigate to pricing page**
   - URL: https://cross-border-tax.vercel.app/pricing
   - Verify Pro tier shows $299/year

2. **Click "Upgrade to Pro"**
   - Button should be clearly visible
   - Click initiates Stripe Checkout

3. **Verify Checkout session**
   - Redirected to: `https://checkout.stripe.com/c/pay/cs_live_...`
   - **CRITICAL:** URL must start with `cs_live_` (not `cs_test_`)
   - Session shows: "TaxBridge Pro - $299.00/year"

4. **Complete payment**
   - Card number: Your real credit card (will be charged)
   - Expiry: Valid date
   - CVC: Valid code
   - Name: Your name
   - Billing address: Your address
   - Click "Subscribe"

5. **Wait for redirect**
   - Should redirect to: `/dashboard?upgrade=success`
   - Page shows: "Payment successful! Welcome to Pro."
   - **⏱️ Time this redirect** (should be < 3 seconds)

   **✅ Checkpoint:** Payment completed, redirected to success page

---

### Part 3: Verify Webhook & Database Update (5 minutes)

**Wait 30 seconds** for webhook processing.

1. **Check Stripe Dashboard - Payment**
   - Navigate to: https://dashboard.stripe.com/payments
   - Filter by date: Today
   - Find payment of $299.00
   - Status should be: **Succeeded**
   - Customer ID: `cus_...` (note this down)
   - Subscription ID: `sub_...` (note this down)

2. **Check Stripe Dashboard - Webhook**
   - Navigate to: https://dashboard.stripe.com/webhooks
   - Click your webhook endpoint
   - Scroll to "Events" section
   - Find event: `checkout.session.completed` (most recent)
   - Click event → View "Response" tab
   - Response should be: `{"received":true}` with HTTP 200

   **If webhook failed:**
   - Status will show "Failed" or "Pending"
   - Check "Logs" tab for error message
   - **DO NOT PROCEED** - fix webhook issue first

3. **Verify database upgrade**
   ```bash
   sqlite3 data/taxbridge.db \
     "SELECT subscription_tier, stripe_customer_id, stripe_subscription_id, subscription_status
      FROM user_profiles WHERE email LIKE '%livetest-0318%';"
   ```

   **Expected output:**
   ```
   subscription_tier | stripe_customer_id | stripe_subscription_id | subscription_status
   ----------------- | ------------------ | ---------------------- | -------------------
   pro               | cus_XXXXX          | sub_XXXXX              | active
   ```

   **✅ Checkpoint:** Tier=pro, Stripe IDs populated, status=active

---

### Part 4: Test Pro Features (5 minutes)

1. **Log in to production app**
   - URL: https://cross-border-tax.vercel.app/sign-in
   - Use test account credentials

2. **Test: Unlimited RSU entries**
   - Navigate to: `/dashboard`
   - Click "Add RSU Entry" button
   - Create **5 RSU entries** (free tier limit is 1)
   - Fill in sample data:
     ```
     Entry 1: Meta, 2024-01-15, 100 shares, $400/share
     Entry 2: Meta, 2024-04-15, 100 shares, $450/share
     Entry 3: Meta, 2024-07-15, 100 shares, $425/share
     Entry 4: Meta, 2024-10-15, 100 shares, $475/share
     Entry 5: Meta, 2025-01-15, 100 shares, $500/share
     ```
   - Save all 5 entries
   - Verify: No "Upgrade to Pro" paywall appears
   - All 5 entries should save successfully

3. **Test: PDF Export**
   - Navigate to: `/dashboard`
   - Click "Export PDF" button
   - Verify: PDF downloads successfully (no upgrade modal)
   - Open PDF and verify it contains all 5 RSU entries

4. **Test: Pro Badge**
   - Dashboard should show "Pro" badge in header
   - Navigate to: `/settings/billing`
   - Verify: Shows subscription details (next billing date, cancel button)

5. **Verify RSU entry count**
   ```bash
   # Replace X with user ID from Part 1
   sqlite3 data/taxbridge.db \
     "SELECT COUNT(*) as rsu_count FROM rsu_entries WHERE user_id = X;"
   ```

   **Expected output:**
   ```
   rsu_count
   ---------
   5
   ```

   **✅ Checkpoint:** All Pro features working, 5 RSU entries created

---

### Part 5: Process Full Refund (3 minutes)

1. **Open Stripe Dashboard - Payments**
   - Navigate to: https://dashboard.stripe.com/payments
   - Find the $299.00 payment (from Part 3, step 1)
   - Click the payment to open details

2. **Initiate refund**
   - Click "Refund" button (top-right)
   - Refund amount: **Full refund** ($299.00)
   - Reason: "Test transaction - verifying production payment flow"
   - Click "Refund payment"

3. **Wait for refund confirmation**
   - Refund processes instantly for most cards
   - Payment status changes to: **Refunded**
   - Timeline shows refund event

4. **Verify refund in dashboard**
   - Payment details page shows "Refunded" badge
   - Amount shows: $299.00 (refunded)
   - **⏱️ Note the timestamp** for webhook tracking

   **✅ Checkpoint:** Refund processed, payment status=Refunded

---

### Part 6: Verify Downgrade (5 minutes)

**Wait 5 minutes** for webhook delivery and processing.

1. **Check Stripe Dashboard - Webhook**
   - Navigate to: https://dashboard.stripe.com/webhooks
   - Click your webhook endpoint
   - Look for event: `customer.subscription.deleted`
   - Timestamp should be ~5 minutes after refund
   - Response should be: `{"received":true}` with HTTP 200

   **If webhook hasn't fired yet:**
   - Wait another 2-3 minutes (Stripe can be slow)
   - Refresh the webhook events list

2. **Verify database downgrade**
   ```bash
   sqlite3 data/taxbridge.db \
     "SELECT subscription_tier, subscription_status, stripe_customer_id, stripe_subscription_id
      FROM user_profiles WHERE email LIKE '%livetest-0318%';"
   ```

   **Expected output:**
   ```
   subscription_tier | subscription_status | stripe_customer_id | stripe_subscription_id
   ----------------- | ------------------- | ------------------ | ----------------------
   free              | canceled            | cus_XXXXX          | sub_XXXXX
   ```

   **Important:** Stripe IDs should be **PRESERVED** (not deleted) for audit trail.

3. **Verify data preservation**
   ```bash
   # Replace X with user ID
   sqlite3 data/taxbridge.db \
     "SELECT COUNT(*) as rsu_count FROM rsu_entries WHERE user_id = X;"
   ```

   **Expected output:**
   ```
   rsu_count
   ---------
   5
   ```

   **CRITICAL:** RSU entries must NOT be deleted (count should still be 5)

4. **Test in production app**
   - Refresh dashboard page
   - Verify: "Pro" badge is gone
   - Dashboard shows "Free" tier
   - "Upgrade to Pro" CTAs visible again
   - Existing RSU entries still visible (data preserved)

   **✅ Checkpoint:** Tier=free, status=canceled, data preserved

---

### Part 7: Final Verification & Cleanup (3 minutes)

1. **Run comprehensive database query**
   ```bash
   sqlite3 data/taxbridge.db < scripts/payment-test-db-queries.sql
   ```

   Review all output sections:
   - Initial state
   - Post-payment state
   - Pro feature usage
   - Post-refund downgrade
   - Data preservation

2. **Check Vercel production logs**
   ```bash
   vercel logs https://cross-border-tax.vercel.app --since=1h
   ```

   Look for:
   - No errors during checkout creation
   - No errors during webhook processing
   - No errors during downgrade

3. **Test account cleanup decision**

   **Option A: Archive (RECOMMENDED)**
   - Keep account for audit trail
   - Mark in database:
     ```sql
     UPDATE user_profiles
     SET email = 'archived_livetest_' || email
     WHERE email LIKE '%livetest-0318%';
     ```
   - Prevents accidental login, preserves data

   **Option B: Delete**
   - Only if absolutely necessary
   - Delete RSU entries first, then user profile
   - Loses audit trail

   **Recommendation:** Archive, don't delete

---

## Success Criteria

**All of the following must be TRUE:**

- [x] Real credit card charged $299.00 (Stripe Dashboard shows payment)
- [x] Webhook `checkout.session.completed` delivered with HTTP 200
- [x] User tier upgraded to `pro` in database within 30 seconds
- [x] Pro features accessible (unlimited RSU entries, PDF export)
- [x] 5+ RSU entries created successfully
- [x] Refund processed successfully ($299.00 returned to card)
- [x] Webhook `customer.subscription.deleted` delivered with HTTP 200
- [x] User tier downgraded to `free` after refund
- [x] User data preserved (RSU entries intact)
- [x] No errors in Vercel production logs
- [x] Stripe IDs preserved in database (for audit trail)

---

## Common Issues & Troubleshooting

### Issue 1: Webhook Not Delivered

**Symptoms:**
- Database tier not updated after payment
- Stripe Dashboard shows "Failed" or "Pending" webhook

**Fix:**
1. Check webhook URL: Must be `https://cross-border-tax.vercel.app/api/stripe/webhook`
2. Check webhook secret: Must match `STRIPE_WEBHOOK_SECRET` env var
3. Manually replay webhook in Stripe Dashboard:
   - Find failed event → Click "..." → "Resend event"

### Issue 2: Payment Succeeds But No Redirect

**Symptoms:**
- Payment shows "Succeeded" in Stripe
- User stuck on Stripe Checkout page (no redirect)

**Fix:**
- Check `NEXT_PUBLIC_APP_URL` env var (must be production domain)
- Check Stripe Checkout success_url configuration
- User can manually navigate to `/dashboard` (database should still be updated)

### Issue 3: Refund Doesn't Trigger Downgrade

**Symptoms:**
- Refund processed, but tier still "pro" after 10 minutes

**Fix:**
1. Check Stripe Dashboard → Webhooks for `customer.subscription.deleted` event
2. If event missing, subscription might not have been canceled
3. Manually cancel subscription in Stripe Dashboard:
   - Customers → Find customer → Subscriptions → Cancel
4. Wait 2-3 minutes, check database again

### Issue 4: Pro Features Not Working After Upgrade

**Symptoms:**
- Database shows tier=pro
- But app still shows "Upgrade to Pro" modals

**Fix:**
- Clear browser cache and cookies
- Log out and log back in
- Check Clerk session refresh (can take 1-2 minutes)

---

## Test Report Template

Document results in: `docs/LIVE_PAYMENT_TEST_REPORT.md`

Fill in:
- Test account email
- Payment ID, customer ID, subscription ID
- Webhook event IDs
- Timestamps for each step
- Screenshots (save in `screenshots/` directory)
- Any issues encountered
- Final pass/fail status

---

## Post-Test Actions

1. **Update test report** with all results and screenshots
2. **Notify team** that payment flow is verified in production
3. **Enable customer payments** (if test passed)
4. **Set up monitoring alerts**:
   - Stripe webhook failures
   - Payment success rate
   - Subscription churn rate
5. **Review Stripe fraud detection settings**
6. **Update documentation** with any findings from test

---

## Emergency Rollback

If critical issues are found during test:

1. **Immediately pause new signups**:
   - Add banner to homepage: "Temporarily unavailable"
   - Or redirect pricing page to waitlist

2. **Fix identified issues** in staging first

3. **Re-run this test** after fixes

4. **Do not enable customer payments** until all checks pass

---

## Questions?

- Test execution guide: This file
- Database queries: `scripts/payment-test-db-queries.sql`
- Prerequisites check: `scripts/verify-payment-test-prerequisites.ts`
- Test report: `docs/LIVE_PAYMENT_TEST_REPORT.md`

**Ready to begin?** Start with Part 1: Create Test Account
