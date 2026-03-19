# Stripe Production Verification - Quick Reference

## Current Status: ❌ NOT IN PRODUCTION MODE

**Evidence**:
- ✅ `.env.production` has placeholder keys: `sk_live_YOUR_LIVE_SECRET_KEY_HERE`
- ✅ Code architecture correct (uses env vars)
- ❌ Vercel environment variables: UNKNOWN (requires dashboard access)
- ❌ Test payment: NO EVIDENCE
- ❌ Webhook configuration: UNKNOWN

---

## What Michael Needs To Do (2 Hours)

### Quick Start
```bash
# 1. Get Stripe production keys
# Visit: https://dashboard.stripe.com → API Keys
# Toggle: Production mode → Copy sk_live_ and pk_live_

# 2. Create production prices
export STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_KEY
npx tsx scripts/activate-stripe-production-annual.ts

# 3. Configure webhook
# Visit: https://dashboard.stripe.com/webhooks
# Add endpoint: https://taxbridgecpa.com/api/stripe/webhook
# Copy: whsec_ secret

# 4. Update Vercel
# Visit: https://vercel.com/dashboard → Settings → Environment Variables
# Paste all 9 variables (see below)
# Click: Redeploy

# 5. Test
./scripts/verify-stripe-production.sh
# Then do real checkout test with card: 4242 4242 4242 4242
```

---

## Required Vercel Environment Variables

```bash
# API Keys (Step 1)
STRIPE_SECRET_KEY=sk_live_51XXXXXXXXXXXXX
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_XXXXXXXXXXXXX

# Webhook (Step 3)
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXX

# Price IDs (Step 2 output)
STRIPE_BASIC_PRICE_ID=price_XXXXXXXXXXXXX
NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID=price_XXXXXXXXXXXXX
STRIPE_PRO_PRICE_ID=price_XXXXXXXXXXXXX
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_XXXXXXXXXXXXX
STRIPE_ENTERPRISE_PRICE_ID=prod_XXXXXXXXXXXXX
NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=prod_XXXXXXXXXXXXX
```

---

## Verification Checklist

After configuration, run through this checklist:

### Environment Variables ✓
- [ ] Run: `./scripts/verify-stripe-production.sh`
- [ ] All checks show: ✅ (not ❌)

### Test Checkout ✓
- [ ] Visit: https://taxbridgecpa.com
- [ ] Sign up → Calculator → Upgrade to Pro
- [ ] Card: `4242 4242 4242 4242` | Exp: `12/34` | CVC: `123`
- [ ] Redirects to: `/dashboard?upgrade=success`

### Stripe Dashboard ✓
- [ ] https://dashboard.stripe.com/customers
- [ ] NEW customer visible (NOT test mode)
- [ ] Customer has subscription

### Webhook Events ✓
- [ ] https://dashboard.stripe.com/webhooks
- [ ] Endpoint: `https://taxbridgecpa.com/api/stripe/webhook`
- [ ] Recent events: ✅ Success (200 OK)

### Database ✓
- [ ] User profile shows `subscription_tier = 'pro'`
- [ ] User profile shows `stripe_customer_id = 'cus_...'`

### Cleanup ✓
- [ ] Refund test payment in Stripe dashboard
- [ ] Delete test customer (optional)

---

## Evidence Required (Don't Skip)

Take screenshots of:
1. 📸 Vercel env vars (redact keys: `sk_live_***`)
2. 📸 Stripe customer in production dashboard
3. 📸 Webhook events showing ✅ delivery
4. 📸 Database query: `SELECT subscription_tier FROM user_profiles WHERE email = 'test@example.com'`
5. 📸 Refund confirmation

**Without screenshots → Task INCOMPLETE**

---

## Files Created

- `docs/STRIPE_PRODUCTION_MODE_VERIFICATION_REPORT.md` - Full technical report
- `docs/STRIPE_VERIFICATION_EXECUTIVE_SUMMARY.md` - Executive summary
- `scripts/verify-stripe-production.sh` - Automated verification script
- `docs/STRIPE_VERIFICATION_QUICK_REFERENCE.md` - This file

---

## Common Issues

### Issue: Script shows ❌ NOT SET
**Fix**: You're running locally. Set env vars first:
```bash
export STRIPE_SECRET_KEY=sk_live_YOUR_KEY
export NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY
# ... (all 9 variables)
./scripts/verify-stripe-production.sh
```

### Issue: Script shows ❌ PLACEHOLDER
**Fix**: You haven't replaced the placeholder values. Get real keys from Stripe dashboard.

### Issue: Checkout fails with "Invalid API key"
**Fix**: Vercel still has test keys. Update Vercel env vars and redeploy.

### Issue: Webhook events show ❌ 400 error
**Fix**: Webhook secret mismatch. Copy new secret from Stripe → Update Vercel → Redeploy.

---

## Timeline

| When | What |
|------|------|
| **March 19, 17:00 PT** | Start configuration |
| **March 19, 19:00 PT** | Complete verification tests |
| **March 20, 12:00 PT** | Hard deadline (before Product Hunt) |

---

## Contact

- **Stripe Dashboard**: https://dashboard.stripe.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Full Documentation**: `docs/STRIPE_PRODUCTION_MODE_VERIFICATION_REPORT.md`
