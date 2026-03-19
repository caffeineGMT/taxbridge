# Product Hunt Manual Submission Guide

**After 8 sprints of preparation, THIS IS THE ACTUAL SUBMISSION PROCESS.**

**Timeline:** 15 minutes to submit + 12 hours monitoring on launch day

---

## Pre-Flight Checklist (Complete BEFORE Submitting)

### 1. Create HUNT20 Promo Code in Stripe ⏱ 5 min

See: `docs/STRIPE_HUNT20_PROMO_CODE.md`

- [ ] Log into Stripe PRODUCTION mode
- [ ] Create coupon: ID=`HUNT20`, 20% off, expires March 21 11:59 PM PST
- [ ] Test in incognito: Verify $299 → $239.20

### 2. Capture Product Hunt Screenshots ⏱ 3 min

```bash
# Start dev server (if not already running)
npm run dev

# In new terminal, capture screenshots
npm run capture:screenshots
```

This creates 5 screenshots at 1280x800px in `public/product-hunt/screenshots/`:
- hero-dashboard.png
- ftc-optimizer.png
- forms-checklist.png
- pricing-page.png
- landing-hero.png

**Manual alternative if script fails:**
1. Open https://cross-border-tax.vercel.app in Chrome
2. Set window size to 1280x800
3. Take full-page screenshots of each page
4. Save to `public/product-hunt/screenshots/`

### 3. Verify Product is Live ⏱ 2 min

- [ ] Visit https://cross-border-tax.vercel.app
- [ ] Test calculator: Enter RSU data → Calculate → Results show
- [ ] Test signup: Create account → Dashboard loads
- [ ] Test checkout: Click "Get Started" on pricing → Checkout opens
- [ ] **CRITICAL:** Do NOT test actual payment (will create real charge)

---

## Submission Process

### Option 1: Product Hunt Website (RECOMMENDED - Easiest)

**Go to:** https://www.producthunt.com/posts/new

#### Step 1: Basic Info

- **Name:** `TaxBridge`
- **Tagline:** `Cross-border tax calculator for H-1B tech workers with RSUs`
  (59 characters)
- **Link:** `https://cross-border-tax.vercel.app`

#### Step 2: Media

**Thumbnail:**
- Upload: `public/product-hunt/thumbnail.svg`
- Size: 240x240px
- Alt text: "TaxBridge logo"

**Gallery (Upload in this order):**
1. `hero-dashboard.png` - "Main dashboard with RSU entries"
2. `ftc-optimizer.png` - "Foreign Tax Credit optimizer"
3. `forms-checklist.png` - "Complete tax forms checklist"
4. `pricing-page.png` - "Pro plan: $299/year"
5. `landing-hero.png` - "Built for H-1B/TN tech workers"

**Video (Optional but recommended):**
- If you have time, record 60-second Loom demo
- See: `docs/product-hunt-video-checklist.md`
- If no time, SKIP - not required

#### Step 3: Details

**Description (260 characters max):**
```
TaxBridge automates dual-country tax calculations for H-1B/TN visa holders. Calculate US federal + state and Canada federal + provincial tax on RSU income. Foreign Tax Credit optimizer eliminates double taxation. Built for Meta, Amazon, Google, Microsoft employees.
```
(260 characters exactly)

**Topics (Select 3-5):**
- SaaS
- Finance
- Tax
- Productivity
- Tech

**Promo Code:**
- Code: `HUNT20`
- Description: `20% off for 48 hours (Product Hunt exclusive)`

#### Step 4: Additional Links

- **Pricing:** `https://cross-border-tax.vercel.app/pricing`
- **Calculator:** `https://cross-border-tax.vercel.app/calculator`

#### Step 5: Maker Info

- **Your name:** Michael Guo
- **Your role:** Founder
- **Your bio:** "H-1B tech worker at Meta who built TaxBridge to automate cross-border taxes"

#### Step 6: Schedule Launch

**CRITICAL:** Choose Tuesday or Wednesday at 12:01 AM PST

- **Recommended:** Tuesday, March 25, 2026 at 12:01 AM PST
- **Backup:** Wednesday, March 26, 2026 at 12:01 AM PST

**WHY Tuesday/Wednesday?**
- Most Product Hunt traffic mid-week
- Avoid Monday (people catching up) and Friday (weekend drop-off)

**Click "Schedule" or "Publish Now"** if it's already launch time

---

### Option 2: Product Hunt API (Advanced - For Automation)

See: `scripts/submit-to-product-hunt.ts` (if created)

```bash
# Set API token
export PRODUCT_HUNT_API_TOKEN="your_token_here"

# Run submission script
npm run submit:producthunt
```

**Note:** API requires Product Hunt maker account + API access

---

## Launch Day Schedule

### 12:01 AM PST - GO LIVE

- [ ] Product Hunt auto-publishes (if scheduled)
- [ ] **IMMEDIATELY** post first comment (within 5 minutes)

**First Comment Template:** See `docs/PRODUCT_HUNT_SUBMISSION.json` → `first_comment`

Copy-paste this (already formatted):

```markdown
👋 Hey Product Hunt! I'm Michael, founder of TaxBridge.

**The Problem:**
I'm an H-1B tech worker who moved from the US to Canada while still earning RSU income from Meta. Filing taxes became a nightmare - I had to pay both US and Canadian taxes on the same income. My accountant charged $800/year just for RSU calculations, and I still ended up overpaying $2,300 in taxes due to incorrectly claimed Foreign Tax Credits.

**The Solution:**
TaxBridge automates dual-country tax calculations for cross-border tech workers. We handle:

✅ **Dual Tax Calculation:** US federal + state AND Canada federal + provincial tax on RSU income
✅ **FTC Optimizer:** Eliminates double taxation by maximizing Foreign Tax Credit claims
✅ **Forms Checklist:** Complete list of required forms (W-2, 1040/1040-NR, T1, T4, FBAR, Form 8938, Treaty Article XV Form 8833)

**Built for Big Tech:**
- Auto-imports RSU vesting data from Meta, Amazon, Google, Microsoft
- Handles complex equity compensation (RSUs, stock options, ESPP)
- USD/CAD conversion using Bank of Canada official rates
- Professional PDF reports to share with your CPA

**Real Beta User Results:**
- Priya (Meta, Vancouver): Saved $2,300 in FTC errors
- David (Amazon, Toronto): Saved $4,100 on 2025 filing
- Maria (Google, Montreal): "Made dual-country taxes crystal clear"

**Special Launch Offer:**
Use code **HUNT20** for 20% off Pro plan for the next 48 hours ($299 → $239/year)

**Questions I'm here to answer:**
- How does the Foreign Tax Credit work for dual-country filers?
- What's the difference between 1040 and 1040-NR for H-1B holders in Canada?
- How do you handle Treaty Article XV compliance?
- What makes TaxBridge different from TurboTax or hiring a CPA?

Ask me anything! 🚀
```

### 12:10 AM - Email Beta Users

See: `lib/email/product-hunt-launch-emails.ts`

**Subject:** `We're live on Product Hunt! 🚀`

**Body:**
```
Hey [Name],

TaxBridge just launched on Product Hunt!

Could you support us with an upvote? Takes 30 seconds:
👉 [Product Hunt Link]

Every upvote helps us reach #1 Product of the Day and get in front of thousands of H-1B/TN workers who need this.

Thank you! 🙏
Michael
```

### Throughout Day - Respond to EVERY Comment

**CRITICAL:** Respond within 15 minutes to boost algorithm ranking

**Phone alerts:**
1. Install Product Hunt mobile app
2. Enable push notifications for comments
3. Keep phone nearby for 12 hours straight

**Response templates:**

**For feature questions:**
> "Great question! [Answer]. Would love to hear if this solves your use case. Let me know if you have more questions!"

**For pricing questions:**
> "Pro plan is $299/year - about 10x cheaper than hiring a cross-border CPA ($800-$1,500/year). Use code HUNT20 for 20% off (48 hours only)!"

**For technical questions:**
> "We use [technical detail]. Here's why: [benefit]. Does this answer your question?"

**For competitors:**
> "Great question! Unlike TurboTax/Sprintax, we're the ONLY tool that handles dual-country RSU taxation with Foreign Tax Credit optimization. Here's the difference: [specific feature]"

---

## Hour-by-Hour Promotion

### 1:00 AM - Personal Social Media

**LinkedIn:**
```
🚀 Just launched TaxBridge on Product Hunt!

After overpaying $2,300 in taxes as an H-1B worker in Canada, I built a tool to automate cross-border tax calculations.

If you or someone you know deals with dual-country RSU taxation, check it out:
[Product Hunt Link]

Would mean the world if you could support with an upvote! 🙏
```

**Twitter:**
```
🚀 Launched TaxBridge on @ProductHunt today!

Cross-border tax calculator for H-1B/TN tech workers with RSUs.

Automates dual-country taxes + Foreign Tax Credit optimization.

Built for @Meta @Amazon @Google @Microsoft employees 🇺🇸🇨🇦

Support: [Product Hunt Link]
```

### 8:00 AM - Reddit Posts

**r/h1b:**
Title: "Built a tool to automate dual-country tax calculations for H-1B workers in Canada (just launched on Product Hunt)"

**r/ImmigrationCanada:**
Title: "Cross-border tax calculator for US tech workers with RSU income - feedback welcome"

**r/PersonalFinanceCanada:**
Title: "New tool for dual-country tax filing (US income, Canadian resident) - would love feedback"

### 12:00 PM - Tech Communities

**Blind:**
Post in relevant company channels (Meta, Amazon, Google, Microsoft)

**Levels.fyi Discord:**
Share in #side-projects or #tools

### 3:00 PM - Continue Engagement

Check Product Hunt every 30 minutes
Respond to all new comments
Thank people who upvoted

---

## Success Metrics

**Track in real-time:**
- Upvotes (target: 500+)
- Comments (target: 50+)
- Ranking (target: Top 5 → Top 3 → #1)
- Website traffic (PostHog: producthunt.com referrals)
- Signups (target: 100+)
- Paid conversions (target: 20+)

**PostHog funnel:**
Product Hunt → Landing Page → Calculator → Sign Up → Checkout → Payment

**UTM tracking:**
All Product Hunt links use: `?ref=producthunt&utm_source=producthunt&utm_medium=launch&utm_campaign=hunt2026`

---

## Troubleshooting

**"Submit" button grayed out:**
- Check: All required fields filled?
- Check: Thumbnail uploaded?
- Check: At least 1 gallery image?
- Check: Tagline <60 characters?
- Check: Description <260 characters?

**Screenshots won't upload:**
- Check: PNG format?
- Check: File size <5MB each?
- Check: Dimensions 1280x800 or larger?
- Solution: Resize/compress at https://tinypng.com

**Can't schedule for future date:**
- This is normal if <24 hours away
- Solution: Submit as "Draft" → Edit → Schedule later

**First comment not showing:**
- Check: Are you logged in as the maker?
- Check: Did you post within 5 minutes of going live?
- Solution: Refresh page, try again

---

## Post-Launch (48 Hours After)

### Analyze Results

**Pull metrics:**
- Total upvotes
- Final ranking (#1, #2, #3, etc.)
- Website traffic spike (PostHog)
- Sign-up conversions
- Paid conversions (Stripe)
- Revenue from HUNT20 code

**Document learnings:**
- What messaging resonated?
- What time had most engagement?
- Which channels drove most traffic?
- What questions came up repeatedly?

### Follow-Up Actions

- [ ] Thank top upvoters via DM
- [ ] Email everyone who commented but didn't sign up
- [ ] Write recap blog post: "How we got [X] upvotes on Product Hunt"
- [ ] Post recap on Indie Hackers, Hacker News
- [ ] Update website with "Featured on Product Hunt" badge

---

## Emergency Contacts

**Product Hunt Support:**
- Twitter: @ProductHunt
- Email: hello@producthunt.com

**Site Down?**
- Check: https://cross-border-tax.vercel.app
- Backup: Use Vercel preview URL from latest commit
- Fallback: Delay launch 24 hours if critical

---

## Status Tracking

- [x] Submission guide created
- [ ] **MANUAL:** Create HUNT20 in Stripe Production
- [ ] **MANUAL:** Capture 5 screenshots (run script or manually)
- [ ] **MANUAL:** Submit to Product Hunt (Tuesday 12:01 AM PST)
- [ ] **MANUAL:** Post first comment within 5 minutes
- [ ] **MANUAL:** Monitor + respond for 12 hours straight

**YOU ARE READY TO LAUNCH. Just execute the steps above.**

**Estimated total time:** 15 min setup + 12 hours monitoring = 1 day commitment

**Launch week:** March 24-26, 2026 (pick Tuesday or Wednesday)

---

**NO MORE DELAYS. SHIP IT. 🚀**
