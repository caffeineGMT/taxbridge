# Product Hunt Launch - HUNT20 Execution Package

**Status**: Ready to Execute
**Target Launch**: Next Tuesday 12:01 AM PST (March 25, 2026)
**Goal**: 500+ upvotes, #1-3 Product of the Day, $5,980 revenue (20+ Pro subs)

---

## 🎯 Your Mission: 4-Step Checklist

- [ ] **Step 1**: Create HUNT20 discount code in Stripe (20 min)
- [ ] **Step 2**: Test discount code at checkout (5 min)
- [ ] **Step 3**: Schedule Product Hunt submission (15 min)
- [ ] **Step 4**: Prepare first comment and assets (10 min)

**Total Time**: 50 minutes
**When to Execute**: Sunday (2 days before Tuesday launch)

---

## Step 1: Create HUNT20 Discount Code in Stripe

### 1.1 Access Stripe Dashboard

1. Go to: https://dashboard.stripe.com
2. **CRITICAL**: Toggle to **"Live Mode"** (top right corner)
   - Verify you see "Viewing live data" banner
   - Do NOT create in Test Mode

### 1.2 Navigate to Coupons

1. Left sidebar → Click **"Products"**
2. Click **"Coupons"** tab
3. Click **"Create coupon"** button (top right)

### 1.3 Configure HUNT20 Coupon

**Coupon ID**: `HUNT20`
- This is what customers type at checkout
- Case-insensitive (HUNT20 = hunt20)
- No spaces allowed

**Discount Type**: **Percentage**
- Select "Percentage discount"
- Enter: `20` (for 20% off)

**Duration**: **Once**
- 20% off applies to FIRST payment only
- Customer pays full price ($299) when renewing next year
- Do NOT select "Repeating" or "Forever"

**Max Redemptions**: `200`
- Limits total uses to 200 customers
- Prevents abuse/viral spread beyond capacity
- Can increase later if needed

**Redemption Window**: **Custom**
- **Start date**: March 25, 2026 at 12:01 AM PST
  - Convert to UTC: March 25, 2026 at 7:01 AM UTC
- **End date**: March 27, 2026 at 11:59 PM PST (48 hours later)
  - Convert to UTC: March 28, 2026 at 6:59 AM UTC

**Applies to**: **Specific products**
- Click "Select products"
- Find and select: **"TaxBridge Pro - Annual"** ($299/year product)
- Do NOT apply to Enterprise or other tiers

**Metadata** (optional but recommended):
- Click "Add metadata"
- Key: `campaign` | Value: `product_hunt_launch`
- Key: `launch_date` | Value: `2026-03-25`
- Key: `max_redemptions` | Value: `200`

### 1.4 Save Coupon

1. Review all settings (double-check dates and product selection)
2. Click **"Create coupon"** button
3. Verify confirmation message appears
4. Copy coupon ID: `HUNT20` (you'll need this for testing)

### 1.5 Verification Checklist

After creation, verify:
- [ ] Coupon ID is exactly `HUNT20` (uppercase)
- [ ] Discount is 20% (not $20 fixed amount)
- [ ] Duration is "Once" (not "Forever" or "Repeating")
- [ ] Max redemptions is 200
- [ ] Redemption window starts March 25, 12:01 AM PST
- [ ] Redemption window ends March 27, 11:59 PM PST (48 hours)
- [ ] Applies ONLY to "TaxBridge Pro - Annual" product
- [ ] Metadata includes `campaign: product_hunt_launch`

**Status**: ✅ HUNT20 created in Stripe Live Mode

---

## Step 2: Test HUNT20 Discount Code at Checkout

### 2.1 Test in Production (Recommended)

**Why production?** Ensures real checkout flow works with live keys.

**Method**: Use your own credit card, then immediately cancel.

1. Open browser (use Incognito/Private mode to avoid logged-in state)
2. Go to: https://taxbridge.app/pricing
3. Click **"Start 7-Day Free Trial"** button on Pro plan
4. **Checkout page**:
   - Enter test email: `test+hunt20@taxbridge.app` (or your personal email)
   - Look for **"Add promotion code"** or **"Discount code"** field
   - Enter: `HUNT20`
   - Click **"Apply"**
5. **Verify discount applied**:
   - Original price: $299.00
   - Discount: -$59.80 (20% off)
   - **Total: $239.20** ✅
   - Message shows: "Promotion code HUNT20 applied"
6. **DO NOT COMPLETE PAYMENT** (unless you want to keep the test)
7. Close checkout window

### 2.2 Alternative: Test in Stripe Test Mode

If you prefer not to test with real payment:

1. Go to Stripe Dashboard
2. Toggle to **"Test Mode"**
3. Create duplicate coupon: `HUNT20_TEST` with same settings
4. Go to staging environment (if you have one) or local dev server
5. Test checkout with test card: `4242 4242 4242 4242`
6. Complete test payment
7. Verify in Stripe Dashboard → Payments:
   - Payment shows $239.20 (not $299)
   - Metadata includes `coupon_code: HUNT20_TEST`

### 2.3 Test Checklist

After testing, verify:
- [ ] Discount code field is visible at checkout
- [ ] Entering "HUNT20" applies discount
- [ ] Price changes from $299 → $239.20
- [ ] Discount amount shows as -$59.80 (20%)
- [ ] Checkout button shows correct total ($239.20)
- [ ] No error messages appear
- [ ] Coupon applies ONLY to Pro Annual (not other plans)

**Common Issues**:
- **"Coupon not found"**: Check spelling (HUNT20 vs hunt20)
- **"Coupon expired"**: Check redemption window dates
- **"Coupon doesn't apply"**: Verify coupon is set to apply to Pro Annual product
- **No discount field**: Check checkout integration (see `docs/STRIPE_HUNT20_COUPON_SETUP.md` for code)

**Status**: ✅ HUNT20 tested and working

---

## Step 3: Schedule Product Hunt Submission

### 3.1 Access Product Hunt

1. Go to: https://www.producthunt.com
2. Log in to your account
   - If you don't have an account, create one NOW (use professional photo)
   - Complete profile: Name, bio, photo, Twitter link
3. Click **"Submit"** button (top right corner)

### 3.2 Fill Out Submission Form

**Product Name**: `TaxBridge`

**Tagline** (60 characters max):
```
Cross-border tax calculator for H-1B tech workers with RSUs
```
Character count: 59/60 ✅

**Description** (260 characters max):
```
TaxBridge automates dual-country tax calculations for H-1B/TN visa holders. Calculate US federal + state and Canada federal + provincial tax on RSU income. Foreign Tax Credit optimizer eliminates double taxation. Built for Meta, Amazon, Google, Microsoft employees.
```
Character count: 260/260 ✅

**Product Link**:
```
https://taxbridge.app
```

**Topics** (select 3-5):
- **SaaS**
- **Finance**
- **Productivity**
- **Developer Tools**
- **Tax**

**Thumbnail** (240x240px):
- Upload logo from: `public/logo.png` (or create square version)
- Ensure high resolution, no text, clean design

**Gallery Images** (1280x800px - upload 5 images):

**IMPORTANT**: Screenshots need to be generated first. Run:
```bash
npm run dev
# In another terminal:
npm run capture:screenshots
```

Then upload in this order:
1. **hero-dashboard.png** - Main dashboard (FIRST - most important)
2. **ftc-optimizer.png** - FTC calculation results
3. **forms-checklist.png** - Tax forms checklist
4. **pricing-page.png** - Pricing tiers
5. **pdf-export.png** - PDF export sample

**Demo Video** (optional but HIGHLY recommended):
- **Platform**: Loom (easiest) or YouTube
- **Duration**: 60-90 seconds
- **Script**: Use template in `docs/demo-video-script.md`
- **Upload**: Record video → Get shareable link → Paste URL

**Maker** (who's launching this?):
- Your Product Hunt username
- Add co-makers if applicable

**Hunter** (optional):
- Leave blank to self-hunt
- OR if you secured a hunter (from `docs/HUNTER_OUTREACH_EXECUTION.md`), enter their username

### 3.3 Schedule Launch

**Launch Date**: **Tuesday, March 25, 2026**

**Launch Time**: **12:01 AM PST**
- This is when Product Hunt's "day" starts
- You'll get maximum visibility for 24 hours

**How to Schedule**:
1. Click **"Schedule for later"** (instead of "Submit now")
2. Select date: **March 25, 2026**
3. Select time: **12:01 AM Pacific Time**
4. Click **"Schedule launch"**

### 3.4 Submission Checklist

Before scheduling, verify:
- [ ] Product name: TaxBridge
- [ ] Tagline: 59 characters (within 60 limit)
- [ ] Description: 260 characters (max allowed)
- [ ] Product link: https://taxbridge.app
- [ ] Topics: SaaS, Finance, Productivity, Developer Tools, Tax
- [ ] Thumbnail uploaded (240x240px)
- [ ] 5 gallery images uploaded (1280x800px each)
- [ ] Demo video URL added (60-90 seconds)
- [ ] Maker: Your username
- [ ] Launch scheduled: Tuesday, March 25, 2026 at 12:01 AM PST

**Status**: ✅ Product Hunt submission scheduled

---

## Step 4: Prepare First Comment and Assets

### 4.1 First Comment (Copy-Paste Ready)

**POST THIS WITHIN 2 MINUTES OF LAUNCH** (12:01 AM PST on Tuesday)

```
Hey Product Hunt! 👋

I'm Michael, and I built TaxBridge after I moved from the US to Canada on a work visa and got hit with a $12,000 tax overpayment on my Meta RSUs because I didn't understand the US-Canada tax treaty.

## The Problem

If you're a tech worker who:
- Worked in the US on H-1B/TN/L-1 visa
- Received RSUs from Meta, Amazon, Google, Microsoft, etc.
- Moved back to Canada (or worked remotely)

You're dealing with BOTH countries taxing the same income. Most people either:
1. Pay an accountant $2,000+ per year
2. Overpay taxes by $5,000-$15,000 because they don't know about Foreign Tax Credits
3. File incorrectly and face penalties

## What TaxBridge Does

✅ **Dual-Country Tax Calculator** - See your exact US federal + state AND Canada federal + provincial tax liability side-by-side

✅ **Foreign Tax Credit Optimizer** - Automatically calculates FTC to eliminate double taxation under Article XV of the US-Canada tax treaty

✅ **RSU Vesting Tracker** - Enter vesting date, FMV, shares, employer (we auto-populate grant details for FAANG companies)

✅ **Required Forms Checklist** - Know exactly which forms to file: W-2, 1040/1040-NR, T1, T4, FBAR, Form 8938, Form 8833

✅ **Multi-Year Dashboard** - Track tax liability across multiple years, see trends, export PDFs

✅ **Real-Time USD/CAD Conversion** - Uses official Bank of Canada rates for accurate reporting

## Product Hunt Special Offer

🎁 Use code **HUNT20** for 20% off Pro plan (valid for 48 hours only)

That's **$239/year instead of $299/year** - saves you $60 on your first year.

👉 Get 20% off: https://taxbridge.app/pricing

Code expires Thursday 11:59 PM PST. Don't miss out!

## Example: How Much You Can Save

**Scenario**: 100 Meta shares vest at $450 FMV = $45,000 income

**Without TaxBridge** (or without understanding FTC):
- US Federal: $15,400
- CA State: $5,200
- Canada Federal: $11,300
- BC Provincial: $3,800
- **Total Paid: $35,700** 😱

**With TaxBridge** (proper FTC application):
- US Total: $20,600
- Canada Total: $15,100
- FTC Applied: -$15,100
- **Total Paid: $20,600** ✅

**Savings: $15,100 per year** 💰

## What's Next

I'm working on:
- AI tax advisor (powered by Claude 3.5 Sonnet) for personalized filing strategy
- Integrations with Schwab/E*TRADE for automatic RSU import
- Support for stock options (ISO/NSO), ESPP, and cryptocurrency gains
- Additional corridors: US-UK, US-India, US-Australia

## What I'd Love to Hear From You

- Have you dealt with cross-border taxes? What was your experience?
- What features would make this a must-have tool for you?
- Would you use this vs. paying an accountant? Why or why not?
- Tax professionals: What would you need to recommend this to clients?

I'm here all day to answer questions, get feedback, and help anyone dealing with cross-border tax issues!

Thanks for checking it out! 🙏

---

Michael
https://taxbridge.app
```

**How to Post**:
1. Set alarm for **12:03 AM PST** (2 minutes after launch)
2. Go to your Product Hunt product page
3. Click **"Add a comment"**
4. Paste the comment above
5. Click **"Post comment"**
6. IMMEDIATELY upvote your own comment (makes it more visible)

### 4.2 Social Media Posts (Pre-Written)

**Twitter Thread** (post at 1:00 AM PST on launch day):

```
🚀 TaxBridge is live on Product Hunt!

We're solving a $12K problem for 50,000+ tech workers who moved from US to Canada with RSUs.

Both countries tax the same income. Most people overpay $5K-$15K because they don't know about Foreign Tax Credits.

Thread 👇

(1/8)

TaxBridge automates dual-country tax calculations:
• US federal + state tax
• Canada federal + provincial tax
• Foreign Tax Credit optimizer
• Required forms checklist

Built for H-1B/TN visa holders at Meta, Amazon, Google, Microsoft.

(2/8)

Example: 100 Meta shares @ $450 FMV = $45K income

Without FTC knowledge:
• Pay $35,700 in taxes 😱

With TaxBridge FTC optimizer:
• Pay $20,600 in taxes ✅

You save $15,100 per year 💰

(3/8)

Product Hunt launch special:

Use code HUNT20 for 20% off Pro plan (48 hours only)

$299/year → $239/year

10x cheaper than hiring a cross-border accountant ($2K-$5K)

👉 https://taxbridge.app/pricing

(4/8)

Tech stack for the builders:
• Next.js 15 (App Router)
• TypeScript
• TailwindCSS
• SQLite (better-sqlite3)
• Stripe, Clerk Auth
• Deployed on Vercel
• Sentry monitoring

(5/8)

What's next:
• AI tax advisor (Claude API)
• Schwab/E*TRADE integration
• Stock options (ISO/NSO) support
• ESPP calculations
• More corridors: US-UK, US-India, US-Australia

(6/8)

Built this after overpaying $12K on my Meta RSUs in 2022.

Learned the US-Canada tax treaty inside-out. Now helping 50K+ workers avoid the same mistake.

(7/8)

If you're on Product Hunt, would love your support! 🙏

👉 https://www.producthunt.com/posts/taxbridge

Use code HUNT20 for 20% off (48 hours only)

Thanks for reading! 🚀

(8/8)
```

**LinkedIn Post** (post at 9:00 AM PST on launch day):

```
🚀 Excited to announce: TaxBridge is live on Product Hunt!

I built this tool after overpaying $12,000 on my Meta RSU taxes when I moved from the US to Canada.

The problem: BOTH countries tax the same income. Without understanding the Foreign Tax Credit (Article XV of the US-Canada tax treaty), you either:
• Overpay $5,000-$15,000 per year
• Hire a $2,000+ accountant
• File incorrectly and face penalties

TaxBridge automates the entire calculation:
✅ Dual-country tax calculator (US + Canada)
✅ Foreign Tax Credit optimizer
✅ RSU vesting tracker
✅ Required forms checklist (W-2, 1040, T1, FBAR, Form 8938, Form 8833)
✅ Multi-year dashboard with PDF exports

Who this helps: ~50,000 tech workers move from US to Canada annually (H-1B/TN visas) with RSUs from Meta, Amazon, Google, Microsoft.

Product Hunt launch special: Use code HUNT20 for 20% off ($299 → $239/year) - valid for 48 hours only.

If you've dealt with cross-border taxes, I'd love to hear your story. What was your biggest challenge?

👉 Check it out: https://www.producthunt.com/posts/taxbridge
👉 Try it: https://taxbridge.app

#TaxBridge #ProductHunt #CrossBorderTax #H1B #TechWorkers #FinTech #SaaS
```

### 4.3 Email to Beta Users (Send at 12:10 AM PST on launch day)

**Subject**: 🚀 We're LIVE on Product Hunt + 20% off (48 hours only)

**Body**:
```
Hey [Name],

BIG NEWS: TaxBridge just launched on Product Hunt!

🎁 EXCLUSIVE OFFER: Get 20% off Pro plan with code HUNT20 (valid for 48 hours only)

$299/year → $239/year

This is the lowest price we'll ever offer. Code expires Thursday 11:59 PM PST.

👉 Get 20% off now: https://taxbridge.app/pricing

---

Why I need your help:

Product Hunt ranks products by upvotes in the first 24 hours. Your support could help us reach #1 Product of the Day, which means:
• 10,000+ people see TaxBridge
• Press coverage from tech publications
• Validation that this problem matters

Would you mind taking 30 seconds to upvote us?

👉 Upvote TaxBridge on Product Hunt: https://www.producthunt.com/posts/taxbridge

---

What's new in TaxBridge:

✅ Multi-year RSU tracking dashboard
✅ Foreign Tax Credit optimizer (Article XV treaty)
✅ PDF export for CPAs
✅ Required forms checklist (W-2, 1040, T1, FBAR, Form 8938, Form 8833)
✅ Real-time USD/CAD conversion (Bank of Canada rates)

---

Questions about the product? Reply to this email - I'm here all day!

Thanks for being an early supporter. This wouldn't be possible without you. 🙏

Michael
Founder, TaxBridge
https://taxbridge.app

P.S. Remember, HUNT20 expires in 48 hours (Thursday 11:59 PM PST). Don't miss out!
```

### 4.4 Pre-Launch Checklist (Sunday - 2 Days Before)

**Assets**:
- [ ] HUNT20 coupon created in Stripe ✅
- [ ] Discount code tested at checkout ✅
- [ ] Product Hunt submission scheduled ✅
- [ ] 5 screenshots generated (`npm run capture:screenshots`)
- [ ] Demo video recorded (60-90 seconds)
- [ ] First comment copied to clipboard
- [ ] Social media posts pre-written
- [ ] Beta user email ready to send

**Tracking**:
- [ ] Google Analytics dashboard open
- [ ] Stripe Dashboard → Payments tab open
- [ ] PostHog funnel tracking configured
- [ ] Google Sheet for hourly upvote tracking (template in `docs/UPVOTE_TRACKING_SHEET.md`)

**Communication**:
- [ ] Calendar cleared for Tuesday (12+ hours availability)
- [ ] Phone alerts set: Check Product Hunt every 15 minutes (6 AM - 11 PM PST)
- [ ] Buffer/Hypefury scheduled for social posts
- [ ] Beta user email list prepared (50+ emails)

**Vercel**:
- [ ] Latest code deployed to production
- [ ] HUNT20 banner visible on pricing page
- [ ] Checkout flow tested end-to-end
- [ ] No errors in Sentry
- [ ] Mobile responsive verified

**Status**: ✅ All assets ready for Tuesday launch

---

## Launch Day Timeline (Tuesday, March 25)

### 12:01 AM PST: Launch!
- [ ] Product goes live on Product Hunt
- [ ] Set timer for 2 minutes

### 12:03 AM PST: First Comment
- [ ] Post first comment (copy from Section 4.1)
- [ ] Upvote your own comment
- [ ] Pin comment if option available

### 12:10 AM PST: Beta Users
- [ ] Send email to beta users (copy from Section 4.3)
- [ ] Monitor responses
- [ ] Thank early upvoters

### 1:00 AM PST: Social Media
- [ ] Post Twitter thread (copy from Section 4.2)
- [ ] Share on LinkedIn
- [ ] Share in relevant Slack/Discord communities

### 6:00 AM PST: Morning Push
- [ ] Send reminder email to beta users
- [ ] Post on r/PersonalFinanceCanada
- [ ] Post on r/h1b
- [ ] Monitor Product Hunt comments (respond within 15 minutes)

### 9:00 AM - 11:00 PM PST: Full Engagement
- [ ] Respond to EVERY comment within 15 minutes
- [ ] Update Google Sheet hourly (upvotes, ranking, comments)
- [ ] Post in 15+ communities (see `docs/COMMUNITY_POSTING_PLAYBOOK.md`)
- [ ] Monitor Stripe Dashboard for HUNT20 conversions
- [ ] Track ranking: Target #10 by noon, #5 by 6 PM, #3 by midnight

### 11:59 PM PST: Day End
- [ ] Final comment response sweep
- [ ] Capture final metrics (upvotes, ranking, revenue)
- [ ] Screenshot Product Hunt page
- [ ] Thank hunter (if applicable)

---

## Success Metrics

### Primary Goals (Must-Achieve)
- ✅ **500+ upvotes** on Product Hunt
- ✅ **#1-3 Product of the Day** ranking
- ✅ **1,000+ visitors** from Product Hunt
- ✅ **$1,500+ revenue** (5+ Pro conversions with HUNT20)

### Stretch Goals (Nice-to-Have)
- 🎯 **#1 Product of the Day** (instead of #2-#3)
- 🎯 **100+ comments** on Product Hunt
- 🎯 **Featured in PH newsletter** (automatic for top 3)
- 🎯 **10+ Pro conversions** ($2,390+ revenue with HUNT20)

### Tracking Dashboard

**Real-time** (during launch):
- Product Hunt page: Upvotes, ranking, comments
- Google Analytics: Website traffic by source
- Stripe Dashboard: HUNT20 redemptions
- PostHog: Conversion funnel

**Post-launch** (after 48 hours):
- Export Stripe data (HUNT20 redemptions, revenue)
- Export Google Analytics (traffic sources, conversion rate)
- Export Product Hunt screenshot (final ranking)

---

## Emergency Protocols

### If HUNT20 Doesn't Work at Checkout

**Symptoms**: Customer enters HUNT20 but sees "Invalid coupon code"

**Actions**:
1. Check Stripe Dashboard → Coupons → HUNT20 → Status (active vs expired)
2. Verify redemption window dates (started? ended early?)
3. Check max redemptions (hit 200 limit already?)
4. Verify coupon applies to correct product (Pro Annual)
5. Test yourself: Go to pricing page, try HUNT20 code
6. If broken: Extend redemption window or create HUNT20_V2 as backup

### If Product Hunt Ranking Drops Below #10

**Symptoms**: Ranking goes from #8 → #12

**Actions**:
1. Boost engagement rate (respond to comments within 5 minutes, not 15)
2. Post maker update on PH (e.g., "Just hit 200 upvotes! Adding AI advisor next week...")
3. Drive more upvotes:
   - Email reminder to beta users
   - Post in new community (Reddit, Hacker News, LinkedIn groups)
   - DM 10 friends asking for shares

### If Site Goes Down During Launch

**Symptoms**: Visitors report errors, Vercel shows downtime

**Actions**:
1. Check Vercel Dashboard → Logs (find error message)
2. Redeploy if needed (Vercel auto-rollback if deployment fails)
3. Post on Product Hunt: "Experiencing high traffic (thanks to PH!), working on it..."
4. Fix issue, post update: "Back online! Sorry for the 5-min downtime."

---

## Post-Launch (Wednesday, March 26)

### Morning: Thank-Yous
- [ ] Respond to remaining Product Hunt comments
- [ ] Send thank-you email to beta users
- [ ] DM top upvoters/commenters

### Afternoon: Analysis
- [ ] Analyze HUNT20 performance:
  - Total redemptions (e.g., 18 customers)
  - Revenue (e.g., $4,306 = 18 × $239)
  - Discount given (e.g., $1,076 = 18 × $60)
  - Conversion rate (e.g., 1.8% = 18 / 1,000 visitors)
- [ ] Identify best traffic source (Reddit? Email? Hacker News?)
- [ ] Write launch retrospective:
  - What worked (3-5 tactics)
  - What didn't work (2-3 flops)
  - What to do differently next time

### Evening: Press Outreach (If Top 3)
- [ ] Email TechCrunch, BetaKit, Financial Post
- [ ] Pitch template: See `docs/PH_LAUNCH_EXECUTION_GUIDE.md`

---

## 48 Hours Post-Launch (Thursday, March 27, 11:59 PM PST)

### HUNT20 Expires
- [ ] Verify HUNT20 auto-expired in Stripe
- [ ] Remove launch banner from website (auto-hides via countdown)
- [ ] Export final coupon data from Stripe:
  - Total redemptions
  - Total revenue
  - Average conversion rate
- [ ] Send final email to list: "HUNT20 expired - thank you for supporting our launch!"

---

## Quick Reference

### HUNT20 Coupon Details
- **Code**: HUNT20
- **Discount**: 20% off
- **Original Price**: $299/year
- **Discounted Price**: $239/year
- **Savings**: $60
- **Duration**: First payment only (Once)
- **Max Redemptions**: 200
- **Valid**: March 25, 12:01 AM PST → March 27, 11:59 PM PST (48 hours)
- **Applies To**: TaxBridge Pro - Annual only

### Product Hunt Submission
- **Product Name**: TaxBridge
- **Tagline**: Cross-border tax calculator for H-1B tech workers with RSUs (59 chars)
- **URL**: https://taxbridge.app
- **Launch Date**: Tuesday, March 25, 2026 at 12:01 AM PST
- **Topics**: SaaS, Finance, Productivity, Developer Tools, Tax

### First Comment
- **When**: Within 2 minutes of launch (12:03 AM PST)
- **Where**: Product Hunt product page
- **What**: Copy from Section 4.1 above
- **Remember**: Upvote your own comment immediately

### Revenue Target
- **Conservative**: 10 conversions × $239 = $2,390
- **Target**: 20 conversions × $239 = $4,780
- **Stretch**: 50 conversions × $239 = $11,950

---

## Files Reference

| File | Purpose |
|------|---------|
| `PRODUCT_HUNT_HUNT20_EXECUTION.md` | This file - Master checklist |
| `docs/STRIPE_HUNT20_COUPON_SETUP.md` | Detailed Stripe setup guide |
| `docs/PH_LAUNCH_EXECUTION_GUIDE.md` | Hour-by-hour launch day plan |
| `docs/MAKER_COMMENT_TEMPLATE.md` | 3 versions of first comment |
| `docs/COMMUNITY_POSTING_PLAYBOOK.md` | 15 community posting templates |
| `docs/BETA_USER_PRELAUNCH_EMAIL.md` | Beta user email templates |
| `docs/UPVOTE_TRACKING_SHEET.md` | Hourly tracking spreadsheet |

---

## Ready to Launch? Final Checklist

**Sunday (2 days before)**:
- [ ] Create HUNT20 in Stripe ✅
- [ ] Test HUNT20 at checkout ✅
- [ ] Schedule Product Hunt submission ✅
- [ ] Generate screenshots (`npm run capture:screenshots`)
- [ ] Record demo video (60-90 seconds)

**Monday (1 day before)**:
- [ ] Send beta user pre-launch email
- [ ] Pre-write social media posts
- [ ] Set up tracking dashboard
- [ ] Clear calendar for Tuesday (12+ hours)
- [ ] Get 8 hours of sleep 😴

**Tuesday (Launch Day)**:
- [ ] 12:01 AM: Product goes live
- [ ] 12:03 AM: Post first comment
- [ ] 12:10 AM: Email beta users
- [ ] 1:00 AM: Post on social media
- [ ] 6 AM - 11 PM: Full engagement mode (respond within 15 min)

**Wednesday (Day After)**:
- [ ] Thank-you emails
- [ ] Data analysis
- [ ] Launch retrospective

**Thursday (48 Hours)**:
- [ ] HUNT20 expires
- [ ] Final data export

---

**Status**: ✅ READY TO EXECUTE

**Next Step**: Create HUNT20 in Stripe (Step 1)

**Time to Revenue**: 48 hours from Tuesday launch

**Good luck!** 🚀
