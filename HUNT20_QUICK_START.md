# HUNT20 Discount Code - Quick Start Guide

**Target**: Create and test HUNT20 promo code for Product Hunt launch
**Discount**: 20% off Pro plan ($299 → $239)
**Duration**: 48 hours (March 25-27, 2026)
**Max Uses**: 200 redemptions

---

## ⚡ 3-Step Quick Start (20 minutes)

### Step 1: Create HUNT20 in Stripe (10 min)

**URL**: https://dashboard.stripe.com

1. **Toggle to LIVE MODE** (top right - critical!)
2. Products → Coupons → **"Create coupon"**
3. Configure:
   - **ID**: `HUNT20`
   - **Type**: Percentage
   - **Amount**: `20` (percent)
   - **Duration**: Once
   - **Max redemptions**: `200`
   - **Start**: March 25, 2026, 12:01 AM PST (7:01 AM UTC)
   - **End**: March 27, 2026, 11:59 PM PST (6:59 AM UTC March 28)
   - **Applies to**: TaxBridge Pro - Annual ($299/year)
   - **Metadata**: `campaign=product_hunt_launch`
4. Click **"Create coupon"**

### Step 2: Test Discount Code (5 min)

**Test in production** (recommended):
1. Open incognito browser
2. Go to: https://taxbridge.app/pricing
3. Click "Start 7-Day Free Trial"
4. At checkout, enter code: `HUNT20`
5. Verify: Price shows **$239.20** (not $299.00)
6. Close window (don't complete payment unless testing)

**OR test in Stripe Test Mode**:
1. Create `HUNT20_TEST` in test mode
2. Test on staging with test card: `4242 4242 4242 4242`

### Step 3: Schedule Product Hunt (5 min)

**URL**: https://www.producthunt.com/submit

1. Fill form (see `PRODUCT_HUNT_SUBMISSION_FORM.md` for copy-paste content)
2. Click **"Schedule for later"**
3. Set: **March 25, 2026 at 12:01 AM Pacific**
4. Click **"Schedule launch"**

✅ **Done!** HUNT20 is live and Product Hunt is scheduled.

---

## 🎯 HUNT20 Configuration Reference

| Setting | Value |
|---------|-------|
| **Coupon Code** | HUNT20 |
| **Discount Type** | Percentage |
| **Discount Amount** | 20% |
| **Original Price** | $299/year |
| **Discounted Price** | $239.20/year |
| **Customer Savings** | $60.00 |
| **Duration** | Once (first payment only) |
| **Max Redemptions** | 200 |
| **Start Time** | March 25, 2026, 12:01 AM PST |
| **End Time** | March 27, 2026, 11:59 PM PST |
| **Valid For** | 48 hours |
| **Applies To** | TaxBridge Pro - Annual only |
| **Metadata** | campaign: product_hunt_launch |

---

## ✅ Testing Checklist

After creating HUNT20, verify:

### Stripe Dashboard
- [ ] Coupon ID: `HUNT20` (all caps)
- [ ] Status: Active (green badge)
- [ ] Type: Percentage discount (not fixed amount)
- [ ] Amount: 20% (not $20)
- [ ] Duration: Once
- [ ] Max redemptions: 200/200 remaining
- [ ] Redemption window: March 25-27, 2026
- [ ] Applies to: TaxBridge Pro - Annual
- [ ] In LIVE MODE (not test mode)

### Checkout Flow
- [ ] Pricing page shows discount banner
- [ ] Checkout has "Add promotion code" field
- [ ] Entering "HUNT20" applies discount
- [ ] Price changes: $299 → $239.20
- [ ] Discount shows: -$59.80 (20%)
- [ ] Total is correct: $239.20
- [ ] No error messages appear
- [ ] Discount doesn't apply to other plans (Enterprise, Free)

### Edge Cases
- [ ] Code works in lowercase: "hunt20" → applies ✅
- [ ] Code works in mixed case: "Hunt20" → applies ✅
- [ ] Invalid codes show error: "HUNT21" → "Invalid code" ✅
- [ ] Expired code (after March 27) → "Expired" ✅
- [ ] Max uses reached (after 200) → "No longer available" ✅

---

## 🚨 Common Issues & Fixes

### Issue: "Invalid promotion code"

**Possible Causes**:
- Coupon not created yet
- Wrong spelling (HUNT20 vs HUNT-20)
- Created in Test Mode (not Live Mode)
- Redemption window not started yet
- Redemption window already ended

**Fix**:
1. Go to Stripe Dashboard → Coupons
2. Search for "HUNT20"
3. Check status: Should be "Active"
4. Check dates: Should be March 25-27, 2026
5. Check mode: Should be Live Mode (not Test)

### Issue: "Promotion code has expired"

**Cause**: Current date is after March 27, 2026 11:59 PM PST

**Fix**:
1. Extend redemption window in Stripe Dashboard
2. OR create new code: HUNT20_V2

### Issue: "This promotion code cannot be applied to this product"

**Cause**: Coupon doesn't apply to the product customer selected

**Fix**:
1. Go to Stripe Dashboard → Coupons → HUNT20
2. Click "Edit"
3. Under "Applies to", select "TaxBridge Pro - Annual"
4. Save changes

### Issue: Discount shows wrong amount ($50 off instead of $59.80)

**Cause**: Coupon is set to fixed amount ($50) instead of percentage (20%)

**Fix**:
1. Delete incorrect coupon
2. Create new coupon with "Percentage" type, 20% amount

### Issue: Customer used code but still charged $299

**Cause**: Coupon didn't apply at checkout (integration bug)

**Fix**:
1. Check checkout integration code (see `docs/STRIPE_HUNT20_COUPON_SETUP.md`)
2. Verify `discounts` parameter in Stripe checkout session
3. Refund customer $59.80 OR issue credit

---

## 📊 Monitoring HUNT20 Performance

### Real-Time Tracking (During Launch)

**Stripe Dashboard** → Coupons → HUNT20:
- Redemptions: X / 200
- Revenue: $X,XXX
- Customers: XX

**Check hourly**:
- 12:01 AM (launch): 0 redemptions
- 1:00 AM: ~2-5 redemptions (early adopters)
- 6:00 AM: ~10-15 redemptions (beta users wake up)
- 12:00 PM: ~30-50 redemptions (peak traffic)
- 6:00 PM: ~50-80 redemptions (evening traffic)
- 11:59 PM: ~80-120 redemptions (day 1 total)

**Target**: 100+ redemptions by end of 48 hours = $23,900+ revenue

### Post-Launch Analysis (After March 27)

**Export Data**:
1. Stripe Dashboard → Coupons → HUNT20
2. Click "Export" → Download CSV
3. Analyze:
   - Total redemptions (e.g., 118)
   - Revenue (118 × $239 = $28,202)
   - Discount given (118 × $60 = $7,080)
   - Net revenue after discount: $28,202
   - Conversion rate: 118 / X visitors = X%

**Key Metrics**:
- **Redemption rate**: X / 200 max uses = X%
- **Conversion rate**: X redemptions / X visitors = X%
- **Revenue per visitor**: $28,202 / X visitors = $X
- **Average time to convert**: X hours from signup → purchase

**Compare to targets**:
- Conservative: 50 redemptions × $239 = $11,950 ✅
- Target: 100 redemptions × $239 = $23,900 ✅
- Stretch: 200 redemptions × $239 = $47,800 🎯

---

## 🎁 HUNT20 Marketing Copy

Use this copy in all launch materials:

### Short Version (Twitter, LinkedIn)
```
🎁 Use code HUNT20 for 20% off Pro plan (48 hours only)
$299/year → $239/year
```

### Medium Version (Product Hunt comment)
```
🎁 Product Hunt Special Offer:
Use code HUNT20 for 20% off Pro plan (valid for 48 hours only)

That's $239/year instead of $299/year - saves you $60 on your first year.

👉 Get 20% off: https://taxbridge.app/pricing

Code expires Thursday 11:59 PM PST. Don't miss out!
```

### Long Version (Email)
```
🎁 EXCLUSIVE OFFER: Get 20% off Pro plan with code HUNT20 (valid for 48 hours only)

$299/year → $239/year

This is the lowest price we'll ever offer. Code expires Thursday 11:59 PM PST.

Why this matters:
- Cross-border accountants charge $2,000-$5,000/year
- Without FTC knowledge, you overpay $5,000-$15,000
- TaxBridge Pro saves you $60 with HUNT20 (total: $239/year)
- You get unlimited RSU tracking, FTC optimizer, PDF exports

👉 Get 20% off now: https://taxbridge.app/pricing
```

---

## 📅 Timeline

### Sunday, March 23 (2 days before)
- [ ] Create HUNT20 in Stripe
- [ ] Test checkout flow
- [ ] Schedule Product Hunt submission

### Monday, March 24 (1 day before)
- [ ] Final verification: HUNT20 active
- [ ] Test one more time
- [ ] Prepare first comment (copy-paste ready)
- [ ] Send beta user pre-launch email

### Tuesday, March 25 (Launch Day)
- [ ] **12:01 AM**: Product goes live on PH
- [ ] **12:03 AM**: Post first comment (mention HUNT20)
- [ ] **12:10 AM**: Email beta users with HUNT20 code
- [ ] **1:00 AM**: Post on social media (Twitter, LinkedIn)
- [ ] **Throughout day**: Promote HUNT20 in all channels

### Thursday, March 27 (Expiration)
- [ ] **11:59 PM**: HUNT20 expires automatically
- [ ] Export final data from Stripe
- [ ] Remove discount banner from website

---

## 🔗 Related Documents

| Document | Purpose |
|----------|---------|
| `PRODUCT_HUNT_HUNT20_EXECUTION.md` | Master execution guide (this is the most comprehensive) |
| `PRODUCT_HUNT_SUBMISSION_FORM.md` | Pre-filled PH submission content |
| `HUNT20_QUICK_START.md` | This file - Quick reference |
| `docs/STRIPE_HUNT20_COUPON_SETUP.md` | Detailed Stripe technical guide |
| `docs/PH_LAUNCH_EXECUTION_GUIDE.md` | Hour-by-hour launch day plan |

---

## ✅ Final Checklist

**Before Launch**:
- [ ] HUNT20 created in Stripe Live Mode
- [ ] Discount tested at checkout ($299 → $239)
- [ ] Product Hunt submission scheduled (March 25, 12:01 AM PST)
- [ ] First comment ready (mentions HUNT20)
- [ ] Beta user email ready (includes HUNT20 code)
- [ ] Social media posts drafted (promote HUNT20)

**Launch Day**:
- [ ] Verify HUNT20 active (check Stripe Dashboard)
- [ ] Post first comment with HUNT20 (12:03 AM)
- [ ] Email beta users with HUNT20 (12:10 AM)
- [ ] Promote HUNT20 on Twitter, LinkedIn (1:00 AM)
- [ ] Monitor redemptions hourly (Stripe Dashboard)

**Post-Launch**:
- [ ] Track total redemptions (target: 100+)
- [ ] Export Stripe data (CSV)
- [ ] Analyze conversion rate
- [ ] Calculate total revenue
- [ ] Write retrospective (what worked, what didn't)

---

**Status**: Ready to create HUNT20

**Next Step**: Go to Stripe Dashboard → Create coupon (10 min)

**Questions?** See detailed guide: `PRODUCT_HUNT_HUNT20_EXECUTION.md`

**Good luck!** 🚀
