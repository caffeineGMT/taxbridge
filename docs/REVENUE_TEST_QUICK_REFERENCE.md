# REVENUE TEST - QUICK REFERENCE

## One-Line Summary
Execute end-to-end payment test: calculator → signup → checkout → verify payment → refund → verify downgrade.

---

## Quick Start (Automated)

```bash
# 1. Set Stripe key
export STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_KEY

# 2. Run test
npm run revenue:test

# 3. Check report
cat docs/REVENUE_TEST_REPORT.md
```

**Duration:** 2-3 minutes
**Evidence:** docs/screenshots/revenue-test-*/ + REVENUE_TEST_REPORT.md

---

## Prerequisites (5-Minute Checklist)

```bash
# ✅ Stripe is LIVE
npm run verify:stripe:mode  # Should show "sk_live_"

# ✅ Clerk is LIVE
npm run verify:clerk  # Should show "pk_live_"

# ✅ Site is UP
curl -I https://taxbridge.vercel.app  # Should return "200 OK"

# ✅ Pricing page loads
curl -I https://taxbridge.vercel.app/pricing  # Should return "200 OK"
```

If any check fails → **STOP** → Fix prerequisites first.

---

## Manual Test (Step-by-Step)

If automated test fails, follow these 7 steps:

### 1. Calculator
- URL: https://taxbridge.vercel.app/us-canada-tax-calculator
- Input: $150,000 RSU
- State: WA, Province: BC
- 📸 Screenshot results

### 2. Signup
- URL: https://taxbridge.vercel.app/sign-up
- Email: `test-revenue-{timestamp}@example.com`
- Password: `TestPassword123!`
- 📸 Screenshot confirmation

### 3. Checkout
- URL: https://taxbridge.vercel.app/pricing
- Click: "Subscribe" on Pro plan
- Card: `4242 4242 4242 4242`
- Expiry: `12/34`, CVC: `123`, ZIP: `12345`
- 📸 Screenshot success page

### 4. Verify Payment in Stripe
- URL: https://dashboard.stripe.com/payments
- Check: Most recent payment
- Verify: Amount = $79, Status = "Succeeded"
- 📸 Screenshot payment ← **REQUIRED**

### 5. Verify Pro Status
- URL: https://taxbridge.vercel.app/dashboard
- Check: Pro badge visible
- 📸 Screenshot Pro status ← **REQUIRED**

### 6. Refund
- In Stripe Dashboard: Click payment → Refund
- Amount: Full refund
- Reason: "Requested by customer"
- 📸 Screenshot refund

### 7. Verify Free Tier
- Refresh: https://taxbridge.vercel.app/dashboard
- Check: Free tier indicator visible
- 📸 Screenshot Free status

---

## Success = 2 Screenshots

Minimum evidence required:
1. **Stripe payment** (showing $79 "Succeeded")
2. **User Pro status** (showing Pro badge in app)

If you have these 2 screenshots → **REVENUE TEST PASSES** ✅

---

## If It Fails

**Most common causes:**

1. **Stripe keys are test mode** → Replace with `sk_live_` and `pk_live_`
2. **Clerk keys are test mode** → Replace with production keys
3. **Webhook not working** → Check Stripe webhook logs
4. **User not logged in** → Complete signup before checkout
5. **Production site down** → Check Vercel deployment status

---

## After Success

```bash
# Commit evidence
git add docs/REVENUE_TEST_REPORT.md docs/screenshots/
git commit -m "[P1-HIGH] Revenue Test COMPLETE - First $1 Captured"
git push origin main

# Update task
# Mark task COMPLETE with screenshot links
```

**Next steps:**
- ✅ Activate Product Hunt launch
- ✅ Enable paid ads
- ✅ Set up revenue monitoring

---

## Contact

**Questions?** See full guide: `docs/REVENUE_TEST_EXECUTION_GUIDE.md`

**Quick help:**
- Script: `scripts/execute-revenue-test.ts`
- Run: `npm run revenue:test`
- Verify Stripe: `npm run verify:stripe:mode`
- Verify Clerk: `npm run verify:clerk`

---

**Last Updated:** 2026-03-19
