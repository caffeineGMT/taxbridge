# Pricing Experiment - Quick Reference

**Experiment:** $29 vs $49 vs $79 Annual Pricing Test
**Status:** ✅ Ready to Launch (Awaiting Stripe Price IDs)
**Duration:** 14 days
**Traffic:** 33/33/33 split

---

## 🚀 Launch Checklist (5 Minutes)

### 1. Create Stripe Price IDs
- [ ] Go to https://dashboard.stripe.com/test/products
- [ ] Create 3 annual prices: $29, $49, $79
- [ ] Create 1 monthly price: $19/month
- [ ] Copy all 4 price IDs

### 2. Update Environment Variables
- [ ] Vercel → Settings → Environment Variables
- [ ] Add `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_29`
- [ ] Add `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` ($49 default)
- [ ] Add `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_79`
- [ ] Add `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_MONTHLY`
- [ ] Redeploy Vercel

### 3. Verify Implementation
```bash
npm run verify:pricing-experiment
```

### 4. Test in Production
- [ ] Visit https://taxbridge.vercel.app/pricing
- [ ] Hard refresh 10 times → see 3 different prices (~3 of each)
- [ ] Click upgrade → verify correct price in checkout
- [ ] Test checkout with Stripe test card
- [ ] Verify PostHog events fire

---

## 📊 Monitoring (Daily)

### PostHog Dashboard
https://app.posthog.com

**Key Metrics:**
- Visitors by variant (should be 33/33/33)
- Conversion rate: Pricing → Checkout
- Revenue by variant

**Critical Events:**
```
pricing_experiment_exposed → variant assigned
pricing_tier_selected → user clicked upgrade
checkout_completed → payment successful
```

### Stripe Analytics
https://dashboard.stripe.com/subscriptions

**Filter by Price ID:**
- $29: `price_XXXXX_29` → X customers, $X MRR
- $49: `price_XXXXX_49` → Y customers, $Y MRR
- $79: `price_XXXXX_79` → Z customers, $Z MRR

---

## 📈 Decision Framework (Day 14)

### Calculate Revenue per 100 Visitors

| Variant | Visitors | Conversions | CR | Revenue | Rev/100 |
|---------|----------|-------------|----|---------| --------|
| A ($29) | 300 | ? | ?% | ? | **$?** |
| B ($49) | 300 | ? | ?% | ? | **$?** |
| C ($79) | 300 | ? | ?% | ? | **$?** |

**Winner:** Highest revenue/100 visitors with p < 0.05

### Implement Winner
1. Update default price in Vercel env vars
2. Archive losing variants in Stripe
3. Document results in `docs/PRICING_EXPERIMENT_RESULTS.md`
4. Update marketing materials

---

## 🔧 Common Issues

### Problem: Users see different prices on refresh
**Fix:** Check localStorage persistence in DevTools
```javascript
localStorage.getItem('pricing_experiment_variant') // Should be consistent
```

### Problem: Wrong price in checkout
**Fix:** Verify environment variables deployed
```bash
vercel env pull .env.local  # Check current env vars
```

### Problem: Uneven traffic split
**Fix:** Need more traffic (900+ views) or check variant assignment logic

### Problem: PostHog events not firing
**Fix:** Check PostHog init and API key
```bash
console.log(posthog.__loaded)  // Should be true
```

---

## 📞 Emergency Rollback

If revenue drops >20% in first 48 hours:

1. **Force all users to $79:**
   ```typescript
   // hooks/use-pricing-experiment.ts
   function getVariantAssignment(): PricingVariant {
     return 'annual_79'; // ROLLBACK
   }
   ```

2. **Deploy immediately:**
   ```bash
   git add -A
   git commit -m "[EMERGENCY] Rollback pricing experiment to $79"
   git push origin main
   ```

3. **Monitor recovery** in Stripe Dashboard

---

## 📅 Timeline

| Day | Task |
|-----|------|
| **1** | Launch, verify traffic split |
| **2-7** | Daily monitoring, collect data |
| **8** | Mid-experiment check |
| **9-14** | Final data collection |
| **15** | Analyze, decide winner |
| **16** | Implement winner, document results |

---

## 📚 Documentation

- **Setup Guide:** `docs/PRICING_EXPERIMENT_SETUP.md` (Complete guide)
- **Executive Summary:** `docs/PRICING_EXPERIMENT_EXECUTIVE_SUMMARY.md` (High-level overview)
- **Stripe Config:** `config/stripe-pricing-experiment.md` (Price ID tracking)
- **This File:** `docs/PRICING_EXPERIMENT_QUICK_REFERENCE.md` (Daily reference)

---

## 🎯 Success Criteria

- [ ] 300+ pricing page views per variant (900 total)
- [ ] Statistical significance (p < 0.05)
- [ ] Winner identified with 95% confidence
- [ ] Revenue increase documented
- [ ] Results shared with team

---

**Owner:** Michael Guo
**Start Date:** March 19, 2026
**End Date:** April 2, 2026
**Status:** ⏳ Awaiting Stripe Price IDs
