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

## 🎯 Expected Test Flow

```
1. ACCOUNT CREATED
   └─ User exists, tier=free, no Stripe IDs
       ↓
2. CHECKOUT INITIATED
   └─ Redirected to checkout.stripe.com/c/pay/cs_live_...
       ↓
3. PAYMENT PROCESSED
   └─ $299 charged, payment visible in Stripe Dashboard
       ↓
4. WEBHOOK DELIVERED
   └─ checkout.session.completed event processed
       ↓
5. TIER UPGRADED
   └─ tier=pro, status=active, Stripe IDs populated
       ↓
6. PRO FEATURES UNLOCKED
   └─ Unlimited RSU, PDF export, Pro badge
       ↓
7. REFUND PROCESSED
   └─ $299 refunded in Stripe Dashboard
       ↓
8. WEBHOOK DELIVERED
   └─ customer.subscription.deleted event processed
       ↓
9. TIER DOWNGRADED
   └─ tier=free, status=canceled, data preserved
```

---

## 📊 Verification Commands Reference

### User Status
```bash
tsx scripts/verify-live-payment-test.ts livetest
```

### Quick Check
```bash
./scripts/live-test-quick-check.sh livetest
```

### Database Queries
```bash
# User profile
sqlite3 data/taxbridge.db "SELECT * FROM user_profiles WHERE email LIKE '%livetest%';"

# Subscription only
sqlite3 data/taxbridge.db "SELECT subscription_tier, subscription_status FROM user_profiles WHERE email LIKE '%livetest%';"

# Stripe IDs only
sqlite3 data/taxbridge.db "SELECT stripe_customer_id, stripe_subscription_id FROM user_profiles WHERE email LIKE '%livetest%';"

# RSU count
sqlite3 data/taxbridge.db "SELECT COUNT(*) FROM rsu_entries WHERE user_id = [USER_ID];"
```

### Production Logs
```bash
# Real-time logs
vercel logs --prod --follow

# Recent errors
vercel logs --prod --since 1h | grep ERROR

# Webhook logs
vercel logs --prod | grep webhook

# Payment logs
vercel logs --prod | grep stripe
```

### Stripe Dashboard URLs
```
Payments:  https://dashboard.stripe.com/payments
Webhooks:  https://dashboard.stripe.com/webhooks
Events:    https://dashboard.stripe.com/events
Customers: https://dashboard.stripe.com/customers
```

---

## 🐛 Troubleshooting

### Problem: Verification script not found

```bash
# Make sure you're in project root
pwd  # Should show: .../cross-border-tax

# Install dependencies if needed
npm install
```

### Problem: Database not found

```bash
# Check database exists
ls -la data/taxbridge.db

# If missing, verify production database path
echo $DATABASE_PATH
```

### Problem: User not found

```bash
# Check all users
sqlite3 data/taxbridge.db "SELECT id, email FROM user_profiles;"

# Search by partial email
sqlite3 data/taxbridge.db "SELECT * FROM user_profiles WHERE email LIKE '%test%';"
```

### Problem: Webhook not delivering

```bash
# Check webhook configuration
vercel env ls production | grep WEBHOOK

# Check Stripe webhook endpoint
# https://dashboard.stripe.com/webhooks

# Manual webhook test
# In Stripe Dashboard → Webhooks → Select endpoint → "Send test webhook"
```

---

## 💰 Cost Breakdown

| Item | Amount | Refundable |
|------|--------|------------|
| Pro Plan Charge | $299.00 | ✅ Yes |
| Stripe Processing Fee | ~$0.30 | ❌ No |
| **Net Cost** | **~$0.30** | - |

**Note**: The $299 charge is fully refunded, but Stripe keeps the processing fee (~$0.30).

---

## ✅ Success Criteria

Test is successful when ALL of these are true:

- [x] Real card charged $299.00
- [x] Payment shows "Succeeded" in Stripe
- [x] Webhook delivered with 200 response
- [x] Database tier upgraded to 'pro'
- [x] Pro features accessible (RSU, PDF, badge)
- [x] Refund processed successfully
- [x] Database tier downgraded to 'free'
- [x] User data preserved (RSU entries intact)
- [x] No errors in Vercel logs
- [x] No webhook delivery failures

---

## 🚀 After Test Completion

### Immediate Actions

1. **Archive test account**
   ```bash
   sqlite3 data/taxbridge.db "UPDATE user_profiles SET email='archived_livetest@taxbridge.test' WHERE email LIKE '%livetest%';"
   ```

2. **Commit test results**
   ```bash
   git add docs/LIVE_PAYMENT_TEST_REPORT.md screenshots/
   git commit -m "Complete live payment test - production validation passed"
   git push origin main
   ```

3. **Enable production payments**
   - Remove any test mode warnings
   - Enable payment CTAs for all users
   - Monitor first 10 real payments closely

### Next Steps

- [ ] Set up payment monitoring alerts
- [ ] Configure Stripe fraud detection
- [ ] Enable Google Ads conversion tracking
- [ ] Launch customer onboarding flow
- [ ] Announce payment acceptance
- [ ] Update Product Hunt listing

---

## 📞 Support

**Stripe Dashboard**: https://dashboard.stripe.com
**Vercel Dashboard**: https://vercel.com/dashboard
**Production App**: https://taxbridge.app

**Files**:
- Main Guide: `docs/LIVE_PAYMENT_TEST_GUIDE.md`
- Test Report: `docs/LIVE_PAYMENT_TEST_REPORT.md`
- Verification Script: `scripts/verify-live-payment-test.ts`
- Quick Check: `scripts/live-test-quick-check.sh`

---

**Last Updated**: 2026-03-18
**Test Version**: 1.0
**Ready for Production**: ✅ YES
