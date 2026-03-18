# Product Hunt Launch - Quick Start Guide

**Launch Date:** Tuesday, March 25, 2026 @ 12:01 AM PST
**Status:** Ready to Execute ✅

---

## 🚀 5-Minute Quick Start

Execute these steps in order to prepare for Product Hunt launch:

### Step 1: Create HUNT20 Discount Code (2 minutes)

```bash
# Create 20% discount code valid for 48 hours
npm run create:hunt20

# Test the discount code works
npm run test:hunt20
```

**Expected Output:**
- Stripe coupon created (20% off)
- Promotion code HUNT20 created
- Valid for 48 hours
- Max 200 redemptions
- Pro plan: $299 → $239

**Verify in Stripe Dashboard:**
https://dashboard.stripe.com/promotion_codes

---

### Step 2: Generate Screenshots (3 minutes)

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Generate all 5 screenshots
npm run capture:screenshots
```

**Expected Output:**
- 5 screenshots generated at 1280x800px
- Saved to `/public/product-hunt/screenshots/`
- Ready for Product Hunt upload

**Files Generated:**
1. `hero-dashboard.png` - Main dashboard
2. `ftc-optimizer.png` - FTC calculation
3. `forms-checklist.png` - Forms checklist
4. `pricing-page.png` - Pricing page
5. `pdf-export.png` - PDF export

---

### Step 3: Schedule Product Hunt Submission (1 minute)

**Go to:** https://www.producthunt.com/posts/new

**Fill in form using:** `/docs/PRODUCT_HUNT_SUBMISSION.md`

**Key Fields:**
- **Product Name:** TaxBridge
- **Tagline:** Cross-border tax calculator for H-1B tech workers with RSUs
- **Description:** (Copy from PRODUCT_HUNT_SUBMISSION.md)
- **Screenshots:** Upload all 5 from `/public/product-hunt/screenshots/`
- **Topics:** SaaS, Finance, Productivity

**Save as draft** - DO NOT SUBMIT until Tuesday 12:01 AM PST

---

### Step 4: Prepare First Comment (1 minute)

**Copy first comment template from:**
`/docs/PRODUCT_HUNT_SUBMISSION.md` (line 241)

**Key Elements:**
- Founder story (Michael's tax nightmare)
- Problem statement
- Solution features
- Beta user testimonials
- **HUNT20 discount code** (20% off for 48 hours)
- FAQ prompts

**Save to clipboard** - Ready to paste at 12:05 AM on launch day

---

## ✅ Pre-Launch Checklist

Complete before Tuesday 12:01 AM:

**Technical:**
- [ ] HUNT20 code created in Stripe ✓
- [ ] HUNT20 code tested and working ✓
- [ ] 5 screenshots generated ✓
- [ ] Demo video recorded (optional)
- [ ] Product Hunt draft saved
- [ ] First comment ready in clipboard

**Marketing:**
- [ ] Beta users emailed (24hr heads-up)
- [ ] Social media posts drafted
- [ ] Phone alerts enabled for Product Hunt
- [ ] Calendar cleared for 12+ hours Tuesday

---

## 📅 Launch Day Timeline

### 11:45 PM Monday - Final Prep
- Log into Product Hunt
- Open draft submission
- Review all fields one last time
- Have first comment in clipboard

### 12:01 AM Tuesday - LAUNCH! 🎉
1. Click "Submit for Review"
2. Wait 5-10 minutes for approval
3. Post first comment immediately
4. Pin first comment
5. Email beta users with link

### 12:01 AM - 11:59 PM - Engage!
- Respond to EVERY comment within 15 minutes
- Monitor upvotes (target: 500+)
- Track HUNT20 redemptions in Stripe
- Share on social media throughout day
- Post in communities (Reddit, Slack, Discord)

**Full schedule:** See `/docs/PRODUCT_HUNT_LAUNCH_SCHEDULER.md`

---

## 🎯 Success Metrics

**Primary Goal:** 500+ upvotes → #1 Product of the Day

**Revenue Target:**
- 1,000+ website visitors
- 100+ signups
- 20+ Pro subscriptions × $239 = **$4,780**
- Stretch: 50 subs = **$11,950**

**Tracking:**
- PostHog: `?ref=producthunt`
- Stripe: Monitor HUNT20 redemptions
- Product Hunt: Upvote count & ranking

---

## 💬 Response Templates

**"How is this different from TurboTax?"**
```
TurboTax is for single-country filers. TaxBridge handles cross-border (US + Canada)
where you file in BOTH countries on the same RSU income. We do Foreign Tax Credit
optimization, Treaty Article XV compliance, and dual-country calculation - which
TurboTax doesn't address. Our FTC optimizer saves $2,000-$4,000 in overpaid taxes.
```

**"Why not hire a CPA?"**
```
CPAs charge $500-$1,200/year for RSU calculations. TaxBridge is $299/year (or $239
with HUNT20) and our beta users found $2,000-$4,000 in errors their CPAs missed.
You can still share our PDF reports with your CPA for final review. Best of both
worlds at 1/4 the cost!
```

**"What about [other country]?"**
```
Currently TaxBridge focuses on US-Canada cross-border (where Canada-US Tax Treaty
applies). We're exploring UK, Australia, India next. Drop your email at
taxbridge.app and we'll notify you when we expand!
```

---

## 📊 Real-Time Monitoring

**During Launch Day, Monitor:**

**Stripe Dashboard:**
- HUNT20 redemptions: https://dashboard.stripe.com/promotion_codes
- Revenue in real-time: https://dashboard.stripe.com/payments

**PostHog:**
- Traffic funnel: https://app.posthog.com
- Conversion rate: Product Hunt → Signup → Paid

**Product Hunt:**
- Upvote count & ranking
- Comments (respond within 15 min!)
- Competitor activity

---

## 🔧 Troubleshooting

**If HUNT20 code doesn't work:**
```bash
# Check if code exists
npm run test:hunt20

# Recreate if needed (delete old one in Stripe first)
npm run create:hunt20
```

**If screenshots look wrong:**
```bash
# Make sure dev server is running
npm run dev

# Regenerate screenshots
npm run capture:screenshots

# Review in folder
open public/product-hunt/screenshots/
```

**If Product Hunt submission fails:**
- Verify all fields are filled
- Check screenshot file sizes (<5MB each)
- Ensure video URL is public
- Try different browser (Chrome recommended)

---

## 📂 Key Files Reference

**Documentation:**
- `/docs/PRODUCT_HUNT_SUBMISSION.md` - Complete submission form
- `/docs/PRODUCT_HUNT_LAUNCH_SCHEDULER.md` - 7-day countdown + hour-by-hour
- `/docs/product-hunt-launch-kit.md` - Original strategy doc
- `/docs/demo-video-script.md` - Video recording guide

**Scripts:**
- `/scripts/create-hunt20-promo.ts` - Create HUNT20 code
- `/scripts/test-hunt20-code.ts` - Test discount code
- `/scripts/capture-screenshots.ts` - Generate screenshots

**Assets:**
- `/public/product-hunt/screenshots/` - All 5 screenshots

---

## 🎉 You're Ready!

**Everything is prepared. Just follow the timeline above and execute.**

**Commands to run:**
1. `npm run create:hunt20` - Create discount code
2. `npm run test:hunt20` - Test discount code
3. `npm run capture:screenshots` - Generate screenshots
4. Submit on Product Hunt Tuesday 12:01 AM PST
5. Post first comment with HUNT20 code
6. Engage all day!

**Target: #1 Product of the Day with 500+ upvotes! 🚀**

---

**Last Updated:** March 18, 2026
**Launch:** Tuesday, March 25, 2026 @ 12:01 AM PST
**HUNT20 Valid:** 48 hours (Tuesday-Thursday)
