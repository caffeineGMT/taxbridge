# Stripe HUNT20 Promo Code - Setup Guide

**Purpose:** Create 20% discount code for Product Hunt launch (48-hour limited offer)

**Timeline:** 5 minutes

---

## Step 1: Log into Stripe Dashboard

1. Go to https://dashboard.stripe.com
2. **CRITICAL:** Ensure you're in **PRODUCTION mode** (not test mode)
   - Check top-left toggle: Should say "Production" not "Test"

---

## Step 2: Navigate to Coupons

1. Click "Products" in left sidebar
2. Click "Coupons" tab
3. Click "+ Create coupon" button

---

## Step 3: Create HUNT20 Coupon

**Fill in the form:**

- **Name:** `Product Hunt Launch - 20% Off`
- **ID:** `HUNT20` (case-sensitive)
- **Type:** `Percentage discount`
- **Percent off:** `20`
- **Duration:** `Once`
  - Applies once, forever discount on first payment
- **Redemption limits:**
  - Check "Limit total redemptions"
  - Max redemptions: `200` (or unlimited for unlimited budget)
  - Check "Set expiration date"
  - Expires: `March 21, 2026 11:59 PM PST` (48 hours after launch)

**Click "Create coupon"**

---

## Step 4: Verify Coupon Works

1. Open incognito browser
2. Go to https://cross-border-tax.vercel.app/pricing
3. Click "Get Started" on Pro plan
4. At checkout, enter promo code: `HUNT20`
5. Verify price changes from $299 → $239.20 (20% off)
6. **DO NOT complete checkout** - just verify discount works
7. Close incognito window

---

## Step 5: Update Product Hunt First Comment

Already done ✅ - First comment includes:

```markdown
**Special Launch Offer:**
Use code **HUNT20** for 20% off Pro plan for the next 48 hours ($299 → $239/year)
```

---

## Troubleshooting

**Error: "Coupon ID already exists"**
- Solution: Use `HUNT20_2026` instead, update first comment

**Error: "Invalid duration"**
- Solution: Choose "Forever" if "Once" isn't available

**Checkout doesn't apply discount:**
- Check: Is Stripe in Production mode?
- Check: Is coupon ID exactly `HUNT20` (case-sensitive)?
- Check: Has coupon expired?

---

## Post-Launch Monitoring

**Track coupon usage:**
1. Stripe Dashboard → Products → Coupons
2. Click `HUNT20`
3. View "Redemptions" tab
4. Monitor total uses (should see spike on launch day)

**Expected usage:**
- Pessimistic: 10-20 redemptions = $600-$1,200 revenue
- Realistic: 30-50 redemptions = $3,590-$5,980 revenue
- Optimistic: 80-100 redemptions = $9,568-$11,960 revenue

---

## Status

- [x] Coupon configuration documented
- [ ] **MANUAL STEP:** Michael must create HUNT20 in Stripe Production
- [ ] **MANUAL STEP:** Verify HUNT20 works in checkout
- [x] Product Hunt first comment includes HUNT20 code

**Estimated time:** 5 minutes
**Blocker:** Requires Stripe Production access (Michael only)
