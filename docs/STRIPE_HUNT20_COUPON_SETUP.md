# Stripe HUNT20 Coupon Setup Guide

**Coupon Code**: `HUNT20`
**Discount**: 20% off Pro plan
**Duration**: 48 hours (launch day + 1 day)
**Goal**: Drive conversions during Product Hunt launch spike

---

## Stripe Dashboard Setup

### Step 1: Create Coupon in Stripe Dashboard

**Navigate to**:
1. Log in to Stripe Dashboard: https://dashboard.stripe.com
2. Click "Products" → "Coupons" (left sidebar)
3. Click "Create coupon" (top right)

**Coupon Details**:

**Coupon ID**: `HUNT20`
- This is what customers will type at checkout
- Case-insensitive (customers can type "hunt20" or "HUNT20")
- No spaces allowed

**Discount Type**: Percentage
- Select "Percentage discount"
- Enter: `20` (for 20% off)

**Duration**: Once
- This means 20% off applies to first payment only
- If customer renews next year, they pay full price ($299)
- Alternative: "Repeating" (20% off every year) - NOT recommended for launch promo

**Max Redemptions**: `100`
- Limit total uses to 100 customers
- Prevents abuse
- Can increase later if needed

**Redemption Window**: Custom
- Start date: [Launch day, 12:01 AM PST]
  - Example: April 8, 2026, 12:01 AM PST = April 8, 2026, 7:01 AM UTC
- End date: [Launch day + 48 hours, 11:59 PM PST]
  - Example: April 10, 2026, 11:59 PM PST = April 11, 2026, 6:59 AM UTC

**Applies to**: Specific products
- Select: "Pro Plan - Annual" (your $299/yr product)
- Do NOT apply to other products (if you have monthly, enterprise, etc.)

**Metadata** (optional but recommended):
- Key: `campaign` | Value: `product_hunt_launch`
- Key: `launch_date` | Value: `2026-04-08`
- This helps track conversions from PH launch

**Click "Create coupon"**

---

## Step 2: Test Coupon in Test Mode

**Before going live**, test the coupon in Stripe Test Mode:

**Navigate to**:
1. Switch to "Test mode" (toggle in top right)
2. Create test coupon with same settings (ID: `HUNT20_TEST`)
3. Go to your checkout page (local or staging environment)
4. Add Pro plan to cart
5. Enter coupon code: `HUNT20_TEST`
6. Verify:
   - Price changes from $299 → $239.20 (20% off)
   - Checkout button shows correct amount
   - "Discount applied" message displays
7. Complete test checkout using test card: `4242 4242 4242 4242`
8. Verify payment succeeded in Stripe Dashboard
9. Check metadata shows `campaign: product_hunt_launch`

**If test passes**, proceed to create live coupon (Step 1 in Live mode).

---

## Step 3: Integrate Coupon into Checkout

### Option 1: Stripe Checkout (Recommended)

**Backend** (`app/api/checkout/route.ts`):

```typescript
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { priceId, couponCode } = await request.json();

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId, // price_xxx for Pro Annual ($299/yr)
          quantity: 1,
        },
      ],
      // Apply coupon if provided
      discounts: couponCode
        ? [
            {
              coupon: couponCode, // e.g., "HUNT20"
            },
          ]
        : [],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
      metadata: {
        coupon_code: couponCode || 'none',
        source: 'product_hunt_launch',
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

**Frontend** (`app/pricing/page.tsx`):

```typescript
'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PricingPage() {
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    setLoading(true);
    setError('');

    try {
      // Create checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: 'price_xxx', // Your Pro Annual price ID
          couponCode: couponCode.trim().toUpperCase(), // Normalize coupon code
        }),
      });

      const { sessionId, error } = await response.json();

      if (error) {
        setError(error);
        setLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const { error: stripeError } = await stripe!.redirectToCheckout({ sessionId });

      if (stripeError) {
        setError(stripeError.message || 'Something went wrong');
        setLoading(false);
      }
    } catch (err) {
      setError('Failed to start checkout. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Pricing cards */}
      <div className="pricing-card">
        <h3>Pro Plan</h3>
        <p className="price">$299/year</p>

        {/* Coupon input */}
        <div className="coupon-section">
          <input
            type="text"
            placeholder="Coupon code (e.g., HUNT20)"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="coupon-input"
          />
          {couponCode && (
            <p className="coupon-hint">
              Coupon <strong>{couponCode.toUpperCase()}</strong> will be applied at checkout
            </p>
          )}
        </div>

        {/* Error message */}
        {error && <p className="error">{error}</p>}

        {/* Checkout button */}
        <button onClick={handleCheckout} disabled={loading}>
          {loading ? 'Loading...' : 'Subscribe Now'}
        </button>
      </div>
    </div>
  );
}
```

### Option 2: Stripe Payment Element (Alternative)

If using Payment Element instead of Checkout:

```typescript
// Create PaymentIntent with coupon applied
const paymentIntent = await stripe.paymentIntents.create({
  amount: 23920, // $299 - 20% = $239.20 (in cents)
  currency: 'usd',
  metadata: {
    coupon_code: 'HUNT20',
    original_price: 29900,
    discount_percent: 20,
  },
});
```

**Note**: Checkout (Option 1) is recommended because it handles coupon validation automatically.

---

## Step 4: Display Discount in UI

### Show discount badge when coupon is active

**Component** (`components/launch-banner.tsx`):

```typescript
'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function LaunchBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    // Calculate time left until coupon expires
    const launchEndDate = new Date('2026-04-10T23:59:59-07:00'); // PST

    const interval = setInterval(() => {
      const now = new Date();
      const diff = launchEndDate.getTime() - now.getTime();

      if (diff <= 0) {
        setIsVisible(false);
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft(`${hours}h ${minutes}m`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1 flex items-center justify-center gap-3">
          <span className="font-bold text-lg">🚀 Product Hunt Launch Special!</span>
          <span>
            Get <strong>20% off Pro</strong> with code <strong>HUNT20</strong>
          </span>
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
            Expires in {timeLeft}
          </span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white hover:text-gray-200 transition"
          aria-label="Close banner"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
```

**Add to layout** (`app/layout.tsx`):

```typescript
import { LaunchBanner } from '@/components/launch-banner';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <LaunchBanner />
        <main>{children}</main>
      </body>
    </html>
  );
}
```

---

## Step 5: Activate Coupon on Launch Day

### Timeline

**48 hours before launch** (Sunday, 12:01 AM PST):
- [ ] Create `HUNT20` coupon in Stripe Dashboard (Live mode)
- [ ] Set redemption window: Launch day 12:01 AM → +48 hours
- [ ] Test coupon in staging environment
- [ ] Deploy pricing page banner component

**Launch day** (Tuesday, 12:01 AM PST):
- [ ] Verify coupon is active in Stripe Dashboard
- [ ] Test checkout flow with coupon code
- [ ] Monitor first conversion with HUNT20 coupon
- [ ] Update banner with live countdown timer

**48 hours after launch** (Thursday, 11:59 PM PST):
- [ ] Coupon auto-expires (Stripe handles this)
- [ ] Remove banner from website (auto-hides via countdown)
- [ ] Analyze coupon performance (see Step 6)

---

## Step 6: Track Coupon Performance

### Stripe Dashboard Analytics

**Navigate to**:
1. Stripe Dashboard → "Products" → "Coupons"
2. Click "HUNT20" coupon
3. View metrics:
   - Total redemptions (e.g., 15 customers used it)
   - Revenue impact (e.g., $897 discount given, $3,588 revenue earned)
   - Conversion rate (redemptions / page views)

**Export data**:
1. Click "Export" (top right)
2. Download CSV with customer emails, dates, amounts
3. Analyze in Google Sheets:
   - When did most conversions happen? (launch day vs. day 2)
   - What's avg time from signup → purchase? (impulse vs. considered)
   - Which traffic source converted best? (check metadata)

### Revenue Calculation

**Without coupon**:
- 15 customers × $299 = $4,485 revenue

**With HUNT20 coupon**:
- 15 customers × $239.20 = $3,588 revenue
- Discount given: $897 (20% of $4,485)

**Net impact**:
- Revenue lost to discount: $897
- Extra conversions from discount: ???

**Question**: Did HUNT20 increase conversions?
- A/B test: 50% of users see coupon, 50% don't (NOT recommended for launch)
- Historical benchmark: Compare to non-launch-day conversion rate
- Survey: Ask customers "Would you have paid $299?" (post-purchase)

**Assumption**: 20% discount likely increased conversions by 20-50%
- Without discount: Maybe 10 conversions ($2,990 revenue)
- With discount: 15 conversions ($3,588 revenue)
- Net gain: $598 more revenue (even after discount)

---

## Step 7: Extend or Expire Coupon

### Option 1: Extend Coupon (If launch is going well)

**Scenario**: Launch day hits 500+ upvotes, but you want to keep momentum for another 24 hours.

**Action**:
1. Go to Stripe Dashboard → "Coupons" → "HUNT20"
2. Click "Edit"
3. Change "Redemption window end date" from April 10, 11:59 PM → April 11, 11:59 PM
4. Click "Save changes"
5. Update banner countdown timer (extend by 24 hours)

**Communication**:
- Tweet: "🚨 EXTENDED: HUNT20 coupon now valid through Friday! We hit #2 on PH and want to keep the momentum going. Get 20% off Pro: [link]"
- Email: Send to email list: "HUNT20 extended 24 hours - last chance!"

### Option 2: Expire Early (If you hit max redemptions)

**Scenario**: 100 customers used HUNT20 in first 12 hours (hit max redemptions).

**Action**:
1. Go to Stripe Dashboard → "Coupons" → "HUNT20"
2. Click "Edit"
3. Change "Max redemptions" from 100 → 150 (increase limit)
4. OR change "Redemption window end date" to NOW (expire immediately)
5. Click "Save changes"
6. Update banner: Remove countdown, show "SOLD OUT" message

**Communication**:
- Tweet: "🚀 HUNT20 sold out in 12 hours! 100 customers saved 20%. Thank you! Full price resumes now ($299/yr). [link]"

---

## Troubleshooting

### Issue 1: Coupon not working at checkout

**Symptoms**: Customer enters "HUNT20" but sees error: "This coupon is invalid"

**Possible causes**:
1. Coupon ID typo (check: HUNT20 vs. hunt20 vs. HUNT-20)
2. Coupon expired (check redemption window)
3. Max redemptions reached (check usage count)
4. Coupon doesn't apply to selected product (check "Applies to" settings)
5. Customer already used coupon (check "Duration: Once" setting)

**Fix**:
1. Check Stripe Dashboard → "Coupons" → "HUNT20" → Verify settings
2. Test checkout flow yourself (use different email address)
3. Check error logs: Stripe Dashboard → "Developers" → "Logs"
4. Contact Stripe support if issue persists

### Issue 2: Discount amount wrong

**Symptoms**: Customer expects $59.80 off ($299 × 20%) but sees $50 off

**Possible causes**:
1. Coupon is "Amount off" ($50) instead of "Percentage off" (20%)
2. Coupon applies to monthly plan ($20/mo) instead of annual ($299/yr)
3. Tax is calculated before discount (check tax settings)

**Fix**:
1. Verify coupon type: Should be "Percentage discount" = 20%
2. Verify coupon applies to correct product: "Pro Plan - Annual"
3. Check Stripe tax settings: Discount should apply BEFORE tax

### Issue 3: Banner not showing

**Symptoms**: Launch banner doesn't appear on website

**Possible causes**:
1. Component not imported in layout.tsx
2. Countdown timer expired (current date > April 10, 11:59 PM)
3. User dismissed banner (localStorage flag set)
4. CSS issue (banner is rendered but hidden)

**Fix**:
1. Check layout.tsx: `import { LaunchBanner } from '@/components/launch-banner'`
2. Check countdown logic: Ensure launch end date is in future
3. Clear browser localStorage: Open DevTools → Application → Local Storage → Clear All
4. Check CSS: Inspect element, ensure no `display: none` or `visibility: hidden`

---

## Best Practices

### Do's:
✅ Test coupon in test mode before going live
✅ Set max redemptions (prevents abuse)
✅ Set redemption window (creates urgency)
✅ Track coupon performance (Stripe Dashboard analytics)
✅ Communicate expiration clearly (countdown timer)
✅ Apply coupon to specific products only (not all plans)

### Don'ts:
❌ Create unlimited-use coupons (risk of abuse)
❌ Forget to set expiration date (coupon lingers forever)
❌ Apply coupon to wrong product (e.g., monthly instead of annual)
❌ Give >30% discount (devalues product long-term)
❌ Extend coupon indefinitely (loses urgency)
❌ Ignore failed redemptions (check error logs)

---

## Communication Template

### Announce HUNT20 in launch posts

**Product Hunt maker comment**:
```
Thanks for checking out TaxBridge!

🎁 Launch special: Use code **HUNT20** for 20% off Pro plan (valid for 48 hours).

That's $239/year instead of $299/year - saves you $60.

[Link to pricing page]
```

**Twitter thread**:
```
🚀 TaxBridge is live on Product Hunt!

Launch deal: 20% off Pro with code HUNT20 (48 hours only).

$239/year (normally $299). Ends Thursday 11:59 PM PST.

[PH link] | [Pricing link]
```

**Email to beta users**:
```
Subject: We're LIVE on Product Hunt + 20% off (48 hours)

Hey [Name],

We're launching TaxBridge on Product Hunt TODAY!

🎁 Exclusive offer: 20% off Pro plan with code **HUNT20** (48 hours only).

That's $239/year instead of $299/year.

[Get 20% off now →]

Code expires Thursday 11:59 PM PST. Don't miss out!

Thanks,
Michael
```

---

## Summary Checklist

**Before launch**:
- [ ] Create HUNT20 coupon in Stripe (20% off, 48 hours, max 100 uses)
- [ ] Test coupon in test mode (verify checkout works)
- [ ] Deploy pricing page banner (countdown timer)
- [ ] Update checkout flow (integrate coupon code input)

**Launch day**:
- [ ] Verify coupon is active (check Stripe Dashboard)
- [ ] Monitor first conversion with HUNT20 (confirm it works)
- [ ] Promote coupon in PH maker comment, Twitter, emails
- [ ] Track redemptions hourly (Stripe Dashboard)

**48 hours after launch**:
- [ ] Coupon expires automatically (Stripe handles this)
- [ ] Remove banner from website (countdown timer auto-hides)
- [ ] Analyze performance (redemptions, revenue, conversion rate)
- [ ] Export coupon data (customer emails, dates, amounts)

---

**Status**: HUNT20 coupon ready to activate on launch day. Set up in Stripe Dashboard 48 hours before launch.
