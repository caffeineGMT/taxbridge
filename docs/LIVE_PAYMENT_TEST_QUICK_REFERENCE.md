# Live Payment Test - Quick Reference Card

**🎯 Mission**: Validate $299 payment → Pro upgrade → Refund → Downgrade in production

---

## 🏃 TL;DR - Command Cheatsheet

```bash
# Check status anytime
npm run test:live-status livetest

# Detailed verification
npm run test:live-payment livetest

# Database query
sqlite3 data/taxbridge.db "SELECT * FROM user_profiles WHERE email LIKE '%livetest%';"

# Production logs
vercel logs --prod | grep -E "webhook|stripe|payment"
```

---

## 📝 7-Step Test Flow

| # | Step | Action | Verification |
|---|------|--------|--------------|
| 1 | **Account** | Sign up at `/sign-up` | `npm run test:live-status livetest` → tier=free |
| 2 | **Checkout** | Click "Upgrade" → Pay $299 | URL shows `cs_live_...` |
| 3 | **Payment** | Confirm in Stripe Dashboard | Status = "Succeeded" |
| 4 | **Webhook** | Check webhook delivery | Response = 200, `{"received":true}` |
| 5 | **Upgrade** | Verify DB + UI | `npm run test:live-payment livetest` → tier=pro |
| 6 | **Features** | Test RSU (5×) + PDF | All work, no paywall |
| 7 | **Refund** | Issue refund in Stripe | Wait 5min, tier=free |

---

## ⚡ Quick Commands

### During Test

```bash
# Where am I in the flow?
npm run test:live-status livetest

# Full validation
npm run test:live-payment livetest

# Watch logs live
vercel logs --prod --follow
```

### Database Checks

```bash
# Subscription status
sqlite3 data/taxbridge.db "SELECT subscription_tier, subscription_status FROM user_profiles WHERE email LIKE '%livetest%';"

# Stripe IDs
sqlite3 data/taxbridge.db "SELECT stripe_customer_id, stripe_subscription_id FROM user_profiles WHERE email LIKE '%livetest%';"

# RSU count
sqlite3 data/taxbridge.db "SELECT COUNT(*) FROM rsu_entries WHERE user_id = [ID];"
```

### Stripe Dashboard

```bash
# Open in browser
open https://dashboard.stripe.com/payments      # Payments
open https://dashboard.stripe.com/webhooks      # Webhooks
open https://dashboard.stripe.com/events        # All events
```

---

## ✅ Expected States

### State 1: Account Created
```
Tier: free
Status: (none)
Customer ID: NULL
Subscription ID: NULL
RSU Count: 0
```

### State 2: Payment Successful
```
Tier: pro
Status: active
Customer ID: cus_...
Subscription ID: sub_...
RSU Count: 0
```

### State 3: Features Tested
```
Tier: pro
Status: active
Customer ID: cus_...
Subscription ID: sub_...
RSU Count: 5
```

### State 4: Refund Complete
```
Tier: free
Status: canceled
Customer ID: cus_... (preserved)
Subscription ID: sub_... (preserved)
RSU Count: 5 (preserved)
```

---

## 🎯 Success Checklist

- [ ] Charged $299 (real card)
- [ ] Stripe shows "Succeeded"
- [ ] Webhook 200 response
- [ ] DB tier = 'pro'
- [ ] RSU unlimited (created 5+)
- [ ] PDF exports
- [ ] Pro badge shows
- [ ] Refunded $299
- [ ] DB tier = 'free'
- [ ] Data preserved

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Webhook not delivered | Check Stripe webhook endpoint config + `STRIPE_WEBHOOK_SECRET` |
| Tier not upgrading | Check `vercel logs --prod` for errors |
| Refund not downgrading | Wait 5 min, check for `subscription.deleted` event |
| Test card used | Verify env has `pk_live_...` not `pk_test_...` |

---

## 📸 Screenshot Checklist

Save to `screenshots/`:

1. ✅ `01-account-creation.png`
2. ✅ `02-payment-success.png`
3. ✅ `03-stripe-payment.png`
4. ✅ `04-webhook-success.png`
5. ✅ `05-database-upgrade.png`
6. ✅ `06-pro-features.png`
7. ✅ `07-refund-success.png`
8. ✅ `08-downgrade.png`
9. ✅ `09-free-tier-ui.png`

---

## 💡 Pro Tips

- **Use email alias**: `youremail+livetest@gmail.com` (easier to search)
- **Don't delete test account**: Archive it for audit trail
- **Screenshot everything**: Easier than recreating the test
- **Check status often**: `npm run test:live-status livetest`
- **Wait after refund**: Webhook takes 1-5 minutes

---

## 📋 After Test

```bash
# 1. Fill report
open docs/LIVE_PAYMENT_TEST_REPORT.md

# 2. Archive test user
sqlite3 data/taxbridge.db "UPDATE user_profiles SET email='archived_livetest@taxbridge.test' WHERE email LIKE '%livetest%';"

# 3. Commit results
git add docs/LIVE_PAYMENT_TEST_REPORT.md screenshots/
git commit -m "Complete live payment test - production validated"
git push origin main

# 4. Enable revenue 💰
echo "Ready to accept real customer payments!"
```

---

## 🚀 You're Ready!

**Cost**: ~$0.30 (Stripe fee)
**Time**: 20 minutes
**Risk**: Zero (full refund)
**Reward**: Production payment validation ✅

Start here: **`docs/LIVE_PAYMENT_TEST_GUIDE.md`**
