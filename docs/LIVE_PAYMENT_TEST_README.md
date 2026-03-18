# 🧪 Live Payment Test Package

**Complete production payment validation with real credit card**

This package contains everything you need to execute and document a live payment test in production.

---

## 📦 What's Included

### Documentation
- **`LIVE_PAYMENT_TEST_GUIDE.md`** - Step-by-step execution instructions (START HERE)
- **`LIVE_PAYMENT_TEST_REPORT.md`** - Test results template to fill out
- **`LIVE_PAYMENT_TEST_README.md`** - This file (overview)

### Scripts
- **`scripts/verify-live-payment-test.ts`** - Database verification helper
- **`scripts/live-test-quick-check.sh`** - Quick status check (bash)
- **`scripts/test-payment-flow.ts`** - Automated integration test (test mode only)

### Directories
- **`screenshots/`** - Save test screenshots here (9 required)

---

## 🚀 Quick Start

### Step 1: Pre-Flight Check

```bash
# Verify production is live
curl -I https://taxbridge.app

# Check Stripe configuration
npm run verify:stripe

# Test database access
sqlite3 data/taxbridge.db "SELECT COUNT(*) FROM user_profiles;"
```

### Step 2: Execute Test

Follow the step-by-step guide:

```bash
# Open the guide
open docs/LIVE_PAYMENT_TEST_GUIDE.md

# Or read in terminal
cat docs/LIVE_PAYMENT_TEST_GUIDE.md | less
```

### Step 3: Monitor Progress

During test execution, check status anytime:

```bash
# Quick status check
./scripts/live-test-quick-check.sh livetest

# Or detailed verification
tsx scripts/verify-live-payment-test.ts livetest
```

### Step 4: Document Results

After test completion:

```bash
# Fill out the report
open docs/LIVE_PAYMENT_TEST_REPORT.md

# Save screenshots to screenshots/ directory
```

---

## 🛠️ Helper Scripts Usage

### Quick Status Check (Recommended)

Shows current test progress and next steps:

```bash
./scripts/live-test-quick-check.sh [email]
```

**Example**:
```bash
./scripts/live-test-quick-check.sh livetest
```

**Output**:
```
🧪 Live Payment Test - Quick Status Check
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 Checking test user: livetest

✓ User found
  User ID: 123
  Email: youremail+livetest@gmail.com

💳 Subscription Status
  Tier: PRO
  Status: active

📍 Stage: PAYMENT SUCCESS - TESTING FEATURES
  ✓ Part 1: Account created
  ✓ Part 2: Checkout completed
  ✓ Part 3: Payment verified
  ✓ Part 4: Webhook processed
  → Part 5: Test Pro features (IN PROGRESS)
```

### Detailed Verification

Full validation with all checks:

```bash
tsx scripts/verify-live-payment-test.ts [email]
```

**Example**:
```bash
tsx scripts/verify-live-payment-test.ts youremail+livetest@gmail.com
```

**Output**:
```
🔍 Live Payment Test - User Verification
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ User Found
📧 Email: youremail+livetest@gmail.com
🆔 User ID: 123

💳 Subscription Status
Tier: PRO
Status: active

🔗 Stripe Integration
✓ Customer ID: cus_ABC123XYZ
✓ Subscription ID: sub_XYZ789ABC

📊 User Data
RSU Entries: 5
Created: 2026-03-18 10:30:00
Updated: 2026-03-18 10:45:00

✅ Validation Checks
✓ User exists
✓ Email matches
✓ Tier is valid
✓ Has Stripe Customer ID
✓ Has Stripe Subscription ID
✓ Status is active

✅ ALL CHECKS PASSED
```

### Database Queries

Manual database inspection:

```bash
# Check user status
sqlite3 data/taxbridge.db "SELECT * FROM user_profiles WHERE email LIKE '%livetest%';"

# Check RSU count
sqlite3 data/taxbridge.db "SELECT COUNT(*) FROM rsu_entries WHERE user_id = [USER_ID];"

# Check subscription details
sqlite3 data/taxbridge.db "SELECT subscription_tier, subscription_status, stripe_customer_id FROM user_profiles WHERE id = [USER_ID];"
```

---

## 📋 Test Execution Checklist

### Before Starting

- [ ] Production deployed at https://taxbridge.app
- [ ] Stripe in LIVE mode (keys: `sk_live_`, `pk_live_`)
- [ ] Real credit card available (NOT 4242... test card)
- [ ] Stripe Dashboard access
- [ ] Database access
- [ ] Unique test email prepared

### During Test

- [ ] Part 1: Create account (free tier)
- [ ] Part 2: Complete checkout ($299 charge)
- [ ] Part 3: Verify payment in Stripe
- [ ] Part 4: Verify webhook delivery
- [ ] Part 5: Test Pro features (RSU, PDF, badge)
- [ ] Part 6: Process full refund
- [ ] Part 7: Verify downgrade (free tier)

### After Test

- [ ] All 9 screenshots captured
- [ ] Test report filled out
- [ ] No errors in logs
- [ ] Test account archived (not deleted)
- [ ] Results documented in git

---

## 💡 Usage Examples

### Scenario 1: First-time test execution

```bash
# 1. Read the guide
open docs/LIVE_PAYMENT_TEST_GUIDE.md

# 2. Create test account at https://taxbridge.app/sign-up
# Email: youremail+livetest@gmail.com

# 3. Verify account created
tsx scripts/verify-live-payment-test.ts livetest

# 4. Complete checkout (follow guide)

# 5. Check status after payment
./scripts/live-test-quick-check.sh livetest

# 6. Continue following guide...
```

### Scenario 2: Resume interrupted test

```bash
# Check where you left off
./scripts/live-test-quick-check.sh livetest

# Output will show current stage and next action
```

### Scenario 3: Verify refund processed

```bash
# Wait 5 minutes after refund, then check
tsx scripts/verify-live-payment-test.ts livetest

# Should show:
#   Tier: FREE
#   Status: canceled
```

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
