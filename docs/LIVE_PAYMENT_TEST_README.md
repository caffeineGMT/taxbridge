# 🧪 Live Payment Test Package

**Status**: ⏸️ **BLOCKED - Prerequisites Not Met (Task 3 Required)**

This package contains everything needed to execute a comprehensive live payment test with real credit card in production. However, **Stripe production activation (Task 3) must be completed first**.

---

## 🚨 CRITICAL: Prerequisites Not Met

**Current Status** (as of 2026-03-18):
```
✅ Database Connection: PASS (11 users)
❌ Stripe Configuration: FAIL (using sk_test_/pk_test_ keys) 🔴 BLOCKER
❌ Production Deployment: FAIL (localhost URL instead of production) 🔴 BLOCKER
⚠️ Clerk Authentication: WARNING (TEST mode - can proceed)

Summary: 1 PASS, 2 FAIL, 1 WARNING
❌ CANNOT PROCEED WITH LIVE PAYMENT TEST
```

**Required Action**: Complete **Task 3: Stripe Production Activation** before executing Task 4.

---

## 📦 What's Included

### Documentation
- **`LIVE_PAYMENT_TEST_README.md`** - This file (status overview)
- **`LIVE_PAYMENT_TEST_EXECUTION_GUIDE.md`** - Step-by-step execution instructions (use after unblocked)
- **`LIVE_PAYMENT_TEST_REPORT.md`** - Test results template to fill during test

### Scripts
- **`scripts/verify-payment-test-prerequisites.ts`** - Pre-flight verification (run first)
- **`scripts/payment-test-db-queries.sql`** - Database verification queries
- **`scripts/test-payment-flow.ts`** - Automated integration test (test mode only)

### Package Scripts
```bash
npm run verify:payment-test    # Pre-flight verification (START HERE)
npm run verify:stripe          # Stripe configuration check
npm run setup:stripe           # Create Stripe products (production mode)
```

---

## 🚀 Quick Start (When Unblocked)

### Step 1: Pre-Flight Verification

**MUST RUN FIRST:**
```bash
npm run verify:payment-test
```

Expected output when ready:
```
✅ Database Connection: PASS
✅ Stripe Configuration: PASS (production mode)
✅ Production Deployment: PASS
✅ Clerk Authentication: PASS

Summary: 4 PASS, 0 FAIL, 0 WARNING
✅ ALL PREREQUISITES MET - Ready for live payment test!
```

**Current output** (blockers present):
```
❌ Stripe Configuration: FAIL (using sk_test_/pk_test_ keys)
❌ Production Deployment: FAIL (NEXT_PUBLIC_APP_URL=localhost)
```

### Step 2: Execute Test (When Unblocked)

Follow the comprehensive execution guide:

```bash
# Open the guide
open docs/LIVE_PAYMENT_TEST_EXECUTION_GUIDE.md

# Or view in browser
cat docs/LIVE_PAYMENT_TEST_EXECUTION_GUIDE.md
```

The guide includes:
- Part 1: Create test account (5 min)
- Part 2: Execute live payment ($299 charge) (3 min)
- Part 3: Verify webhook & database update (5 min)
- Part 4: Test Pro features (5 min)
- Part 5: Process full refund (3 min)
- Part 6: Verify downgrade (5 min)
- Part 7: Final verification & cleanup (3 min)

**Total Duration**: 20-30 minutes

### Step 3: Monitor Progress

During test execution, verify database state:

```bash
# Run all verification queries
sqlite3 data/taxbridge.db < scripts/payment-test-db-queries.sql

# Or run individual queries for specific checkpoints
sqlite3 data/taxbridge.db "SELECT * FROM user_profiles WHERE email LIKE '%livetest%';"
```

### Step 4: Document Results

After test completion, fill out the comprehensive report:

```bash
# Open the report template
open docs/LIVE_PAYMENT_TEST_REPORT.md
```

The report captures:
- Test account details (email, user ID)
- Payment IDs (customer ID, subscription ID)
- Webhook event IDs and timestamps
- Database state at each checkpoint
- Screenshots (9 required)
- Issues encountered
- Final pass/fail status

---

## 🚨 Current Blockers

### Blocker #1: Stripe in TEST Mode

**Issue**: Environment variables use test keys (sk_test_*, pk_test_*), not production keys (sk_live_*, pk_live_*).

**Impact**: Cannot charge real credit cards. Webhooks will only process test events.

**Fix Required**: Complete **Task 3: Stripe Production Activation**

Steps:
1. Log into Stripe Dashboard → Switch to "Production" mode
2. Copy production API keys from https://dashboard.stripe.com/apikeys
3. Run `npm run setup:stripe` to create production products
4. Update Vercel environment variables:
   - `STRIPE_SECRET_KEY` → sk_live_...
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → pk_live_...
   - `STRIPE_PRO_PRICE_ID` → price_... (from setup script output)
   - `STRIPE_WEBHOOK_SECRET` → whsec_... (from webhook endpoint creation)
5. Create webhook endpoint in Stripe Dashboard:
   - URL: https://cross-border-tax.vercel.app/api/stripe/webhook
   - Events: checkout.session.completed, customer.subscription.deleted, customer.subscription.updated, invoice.payment_failed
6. Redeploy to production

### Blocker #2: Production URL Not Configured

**Issue**: `NEXT_PUBLIC_APP_URL` points to localhost instead of production domain.

**Impact**: Stripe checkout redirects will fail. Webhooks cannot be delivered to localhost.

**Fix Required**: Update Vercel environment variable

```bash
vercel env add NEXT_PUBLIC_APP_URL production
# Enter: https://cross-border-tax.vercel.app
```

Then redeploy:
```bash
git push origin main  # Triggers automatic deployment
```

---

## ✅ What's Already Ready

### 1. Database Infrastructure ✅
- Schema exists and validated
- 11 existing users in production
- Ready for subscription tier updates

### 2. Webhook Endpoint Code ✅
- Implemented: `/app/api/stripe/webhook/route.ts`
- Handles all required events:
  - ✅ `checkout.session.completed` (upgrade to Pro)
  - ✅ `customer.subscription.deleted` (downgrade to free)
  - ✅ `customer.subscription.updated` (status changes)
  - ✅ `invoice.payment_failed` (payment failures)
- Includes error handling, logging, and Sentry integration

### 3. Test Infrastructure ✅
- ✅ Pre-flight verification script (`npm run verify:payment-test`)
- ✅ Comprehensive execution guide (step-by-step)
- ✅ Database verification queries (copy-paste ready)
- ✅ Test report template (fill-in-the-blank)

### 4. Production Deployment ✅
- Site live at: https://cross-border-tax.vercel.app
- Last successful deployment: 3 hours ago
- Health endpoint: https://cross-border-tax.vercel.app/api/health (404 - needs fixing but not blocking)

---

## 🛠️ Verification Tools

### Pre-Flight Verification Script

**MUST RUN BEFORE STARTING TEST:**

```bash
npm run verify:payment-test
```

This automated script checks:
- Database connection and schema
- Stripe production mode (sk_live_* keys)
- Production deployment URL
- Clerk authentication mode

**Exit codes:**
- `0` = All checks passed, ready to proceed
- `1` = One or more checks failed, cannot proceed

### Database Verification Queries

Pre-written SQL queries for each test checkpoint:

```bash
# Run all verification queries
sqlite3 data/taxbridge.db < scripts/payment-test-db-queries.sql
```

Queries included:
- Part 1: Initial state (tier=free, no Stripe IDs)
- Part 3: Post-payment upgrade (tier=pro, Stripe IDs populated)
- Part 4: Pro feature usage (RSU entry count)
- Part 6: Post-refund downgrade (tier=free, status=canceled)
- Part 6: Data preservation (RSU entries intact)
- Audit trail (full history)

### Manual Database Inspection

```bash
# Check test account status
sqlite3 data/taxbridge.db "SELECT id, email, subscription_tier, subscription_status, stripe_customer_id FROM user_profiles WHERE email LIKE '%livetest%';"

# Check RSU entry count
sqlite3 data/taxbridge.db "SELECT COUNT(*) as rsu_count FROM rsu_entries WHERE user_id = [USER_ID];"

# Full user profile
sqlite3 data/taxbridge.db "SELECT * FROM user_profiles WHERE email LIKE '%livetest%';"
```

---

## 📋 Test Execution Checklist

### ❌ Before Starting (BLOCKERS PRESENT)

- [x] Production deployed at https://cross-border-tax.vercel.app
- [ ] **Stripe in LIVE mode** (keys: `sk_live_`, `pk_live_`) 🔴 **BLOCKER**
- [ ] **NEXT_PUBLIC_APP_URL set to production domain** 🔴 **BLOCKER**
- [x] Real credit card available (will charge $299, then refund)
- [x] Stripe Dashboard access
- [x] Database access
- [x] Unique test email prepared (youremail+livetest-MMDD@gmail.com)

### ✅ During Test (Once Unblocked)

- [ ] Part 1: Create test account (5 min)
- [ ] Part 2: Execute live payment - $299 charge (3 min)
- [ ] Part 3: Verify webhook & database update (5 min)
- [ ] Part 4: Test Pro features - RSU, PDF, badge (5 min)
- [ ] Part 5: Process full refund (3 min)
- [ ] Part 6: Verify downgrade to free tier (5 min)
- [ ] Part 7: Final verification & cleanup (3 min)

**Total Duration**: 20-30 minutes

### ✅ After Test Completion

- [ ] Test report filled out (docs/LIVE_PAYMENT_TEST_REPORT.md)
- [ ] Screenshots captured (if needed for documentation)
- [ ] No errors in Vercel production logs
- [ ] Test account archived (not deleted)
- [ ] Results committed to git
- [ ] Team notified that payments are validated

---

## ⏱️ Timeline to Revenue

### Current Status (2026-03-18)
```
You are here: ⏸️ Task 4 preparation complete, but blocked by Task 3
```

### Estimated Timeline

**Task 3: Stripe Production Activation** (30-45 minutes)
- Switch Stripe to production mode
- Copy production API keys
- Run setup script to create products
- Create webhook endpoint
- Update Vercel environment variables
- Redeploy
- Verify with `npm run verify:payment-test`

**Task 4: Live Payment Test** (20-30 minutes)
- Execute comprehensive payment flow test
- Verify charge, upgrade, features, refund, downgrade
- Document results
- Sign off on production readiness

**Revenue Activation** (5 minutes)
- Enable payment CTAs for all users
- Remove any "test mode" warnings
- Monitor first customer payment

**Total Time to Revenue**: ~1-2 hours from now

---

## 🎯 Next Steps

### Immediate (Required Before Test)

1. **Complete Task 3** - Stripe Production Activation
   - Follow guide from commit 612f406
   - Estimated time: 30-45 minutes

2. **Update Vercel environment variables**
   - STRIPE_SECRET_KEY → sk_live_...
   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY → pk_live_...
   - STRIPE_PRO_PRICE_ID → price_...
   - STRIPE_WEBHOOK_SECRET → whsec_...
   - NEXT_PUBLIC_APP_URL → https://cross-border-tax.vercel.app

3. **Redeploy to production**
   ```bash
   git push origin main
   ```

4. **Re-run verification**
   ```bash
   npm run verify:payment-test
   # Should show: ✅ ALL PREREQUISITES MET
   ```

### After Unblocking

5. **Execute live payment test**
   - Follow: docs/LIVE_PAYMENT_TEST_EXECUTION_GUIDE.md
   - Duration: 20-30 minutes
   - Cost: $0 net (charge + refund, ~$0.30 Stripe fee)

6. **Document results**
   - Fill out: docs/LIVE_PAYMENT_TEST_REPORT.md
   - Commit results to git

7. **Enable revenue**
   - Remove test mode restrictions
   - Launch marketing campaigns (Product Hunt, Google Ads)
   - Monitor first customer payments

---

## 📊 Test Flow Visualization

**Expected sequence once test begins:**

```
START
  ↓
Part 1: CREATE TEST ACCOUNT
  ├─ Visit /sign-up
  ├─ Email: youremail+livetest-0318@gmail.com
  ├─ Complete Clerk signup
  └─ ✅ Checkpoint: tier=free, no Stripe IDs
  ↓
Part 2: EXECUTE PAYMENT
  ├─ Visit /pricing
  ├─ Click "Upgrade to Pro" ($299)
  ├─ Redirected to checkout.stripe.com/c/pay/cs_live_...
  ├─ Enter real credit card details
  ├─ Complete payment
  └─ ✅ Checkpoint: Redirected to /dashboard?upgrade=success
  ↓
Part 3: VERIFY WEBHOOK & DATABASE
  ├─ Wait 30 seconds for webhook processing
  ├─ Check Stripe Dashboard → Payments (status: Succeeded)
  ├─ Check Stripe Dashboard → Webhooks (event: checkout.session.completed, HTTP 200)
  └─ ✅ Checkpoint: tier=pro, Stripe IDs populated, status=active
  ↓
Part 4: TEST PRO FEATURES
  ├─ Create 5 RSU entries (free limit = 1)
  ├─ Export PDF (free tier shows paywall)
  ├─ Verify Pro badge visible
  └─ ✅ Checkpoint: All Pro features accessible
  ↓
Part 5: PROCESS REFUND
  ├─ Stripe Dashboard → Find payment
  ├─ Click "Refund" → Full refund ($299)
  ├─ Confirm refund
  └─ ✅ Checkpoint: Payment status=Refunded
  ↓
Part 6: VERIFY DOWNGRADE
  ├─ Wait 5 minutes for webhook processing
  ├─ Check Stripe Dashboard → Webhooks (event: customer.subscription.deleted)
  ├─ Check database: tier=free, status=canceled
  └─ ✅ Checkpoint: Downgraded, data preserved (RSU count unchanged)
  ↓
Part 7: FINAL VERIFICATION
  ├─ Run: sqlite3 data/taxbridge.db < scripts/payment-test-db-queries.sql
  ├─ Review audit trail
  ├─ Check Vercel logs (no errors)
  └─ ✅ Checkpoint: Test complete, all checks passed
  ↓
END - DOCUMENT RESULTS
```

---

## 📊 Verification Commands

### Pre-Flight Verification
```bash
# Check all prerequisites (run first)
npm run verify:payment-test
```

### Database Verification
```bash
# Run all checkpoint queries
sqlite3 data/taxbridge.db < scripts/payment-test-db-queries.sql

# Check test account status
sqlite3 data/taxbridge.db "SELECT id, email, subscription_tier, subscription_status, stripe_customer_id FROM user_profiles WHERE email LIKE '%livetest%';"

# Check RSU entry count
sqlite3 data/taxbridge.db "SELECT COUNT(*) as count FROM rsu_entries WHERE user_id = X;"
```

### Production Logs
```bash
# Check recent logs
vercel logs https://cross-border-tax.vercel.app --since=1h

# Filter for webhook events
vercel logs https://cross-border-tax.vercel.app | grep webhook

# Filter for errors
vercel logs https://cross-border-tax.vercel.app | grep -i error
```

### Stripe Dashboard
```
Payments:    https://dashboard.stripe.com/payments
Webhooks:    https://dashboard.stripe.com/webhooks
Events:      https://dashboard.stripe.com/events
Customers:   https://dashboard.stripe.com/customers
```

---

## 💰 Cost Breakdown

| Item | Amount | Refundable | Notes |
|------|--------|------------|-------|
| Pro Plan Charge | $299.00 | ✅ Yes | Charged in Part 2, refunded in Part 5 |
| Stripe Processing Fee | ~$0.30 | ❌ No | Non-refundable transaction fee |
| **Net Cost** | **~$0.30** | - | **Total cost to validate production payments** |

**Note**: The $299 charge is fully refunded, but Stripe keeps the processing fee (~$0.30). This is expected and acceptable for validating the entire payment flow in production.

---

## ✅ Success Criteria

Test is successful when **ALL** of these are true:

- [ ] Real credit card charged $299.00 (not test card 4242...)
- [ ] Payment shows "Succeeded" in Stripe Dashboard
- [ ] Webhook `checkout.session.completed` delivered with HTTP 200
- [ ] Database tier upgraded to 'pro' within 30 seconds
- [ ] Pro features accessible (unlimited RSU entries, PDF export, Pro badge)
- [ ] 5+ RSU entries created (proves unlimited feature works)
- [ ] Refund processed successfully ($299 returned to card)
- [ ] Webhook `customer.subscription.deleted` delivered with HTTP 200
- [ ] Database tier downgraded to 'free'
- [ ] User data preserved (RSU entries intact, count unchanged)
- [ ] No errors in Vercel production logs
- [ ] No webhook delivery failures (both events 200 OK)

**Pass Rate**: 12/12 required for sign-off

---

## 🚀 After Test Passes

### Immediate Actions (5 minutes)

1. **Document results**
   - Fill out: `docs/LIVE_PAYMENT_TEST_REPORT.md`
   - Include all payment IDs, webhook event IDs, timestamps
   - Note any issues encountered (even if resolved)

2. **Archive test account** (don't delete - keep for audit)
   ```bash
   sqlite3 data/taxbridge.db "UPDATE user_profiles SET email='archived_livetest_2026-03-18@taxbridge.test' WHERE email LIKE '%livetest%';"
   ```

3. **Commit test results**
   ```bash
   git add docs/LIVE_PAYMENT_TEST_REPORT.md
   git add scripts/verify-payment-test-prerequisites.ts
   git add scripts/payment-test-db-queries.sql
   git add docs/LIVE_PAYMENT_TEST_EXECUTION_GUIDE.md
   git add docs/LIVE_PAYMENT_TEST_README.md
   git commit -m "Complete live payment test - production payment flow validated"
   git push origin main
   ```

### Enable Revenue (10 minutes)

4. **Remove test mode restrictions**
   - Verify no "test mode" banners in production
   - Ensure all payment CTAs are visible to users
   - Remove any beta access restrictions

5. **Set up monitoring alerts**
   - Stripe webhook failures (email notifications)
   - Payment success rate < 95% (Sentry alert)
   - Subscription churn rate > 5% (weekly email)

6. **Launch revenue-generating activities**
   - Product Hunt launch (see docs/PRODUCT_HUNT_LAUNCH.md)
   - Google Ads campaign ($500/month budget)
   - Social media announcement (LinkedIn, Twitter)

### Target Metrics (48 hours)

- **First paying customer**: Within 24 hours
- **10 paying customers**: Within 48 hours
- **$3,000 MRR**: Within 7 days
- **$10,000 MRR**: Within 30 days

---

## 📂 Package Files

```
docs/
├── LIVE_PAYMENT_TEST_README.md              ← Overview & status (this file)
├── LIVE_PAYMENT_TEST_EXECUTION_GUIDE.md     ← Step-by-step instructions (20-30 min)
└── LIVE_PAYMENT_TEST_REPORT.md              ← Test results template (fill during test)

scripts/
├── verify-payment-test-prerequisites.ts     ← Pre-flight checker (npm run verify:payment-test)
└── payment-test-db-queries.sql              ← Database verification queries (all checkpoints)

package.json
└── "verify:payment-test": "tsx scripts/verify-payment-test-prerequisites.ts"
```

---

## 📞 Questions & Support

**Verification failed?** Run `npm run verify:payment-test` for detailed error messages

**Execution questions?** See `docs/LIVE_PAYMENT_TEST_EXECUTION_GUIDE.md` (comprehensive 7-part guide)

**Database queries?** See `scripts/payment-test-db-queries.sql` (ready to copy-paste)

**Stripe issues?** Check webhook delivery in dashboard: https://dashboard.stripe.com/webhooks

**Vercel issues?** Check logs: `vercel logs https://cross-border-tax.vercel.app --since=1h`

---

## 🎯 Summary

**Current Status**: ⏸️ **Task 4 preparation complete, blocked by Task 3**

**Blockers**:
- ❌ Stripe in TEST mode (need production keys)
- ❌ NEXT_PUBLIC_APP_URL = localhost (need production domain)

**Ready**:
- ✅ Database schema and infrastructure
- ✅ Webhook endpoint code
- ✅ Verification scripts
- ✅ Execution guide
- ✅ Test report template

**Next Step**: Complete Task 3 (Stripe Production Activation), then re-run `npm run verify:payment-test`

**Time to Revenue**: ~1-2 hours (Task 3: 30-45 min, Task 4: 20-30 min, Launch: 10 min)

---

**Last Updated**: 2026-03-18
**Package Version**: 1.0
**Status**: ⏸️ Awaiting Task 3 completion
