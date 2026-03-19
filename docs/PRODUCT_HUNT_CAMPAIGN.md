# Product Hunt Post-Launch Campaign

**CRITICAL TIMELINE:** This campaign must be executed within 48 hours of Product Hunt launch for maximum momentum.

## Campaign Overview

**Objective:** Convert Product Hunt voters into paying customers
**Offer:** 20% discount with code `HUNT20`
**Channels:** Email, Twitter, LinkedIn, Hacker News
**Duration:** 48 hours

## Prerequisites

Before executing this campaign, ensure:

1. ✅ Product Hunt launch has happened
2. ✅ You know the final Product Hunt rank and upvote count
3. ✅ Stripe HUNT20 promo code exists (20% off, 7-day expiration)
4. ✅ SendGrid API key is configured in `.env.local`
5. ✅ You have a list of Product Hunt voter emails (CSV format)

## Step 1: Create HUNT20 Promo Code

If you haven't already created the HUNT20 promo code:

```bash
npm run create:hunt20
```

This creates:
- 20% discount coupon
- HUNT20 promotion code
- 7-day expiration
- Maximum 200 redemptions

**Verify in Stripe Dashboard:**
https://dashboard.stripe.com/promotion_codes

## Step 2: Test Email Campaign

Before sending to all voters, send a test email to yourself:

```bash
# Edit scripts/test-ph-campaign.ts to use your email
npm run test:ph-campaign
```

**Verify:**
- [ ] Email renders correctly
- [ ] Product Hunt rank and upvotes are correct
- [ ] HUNT20 promo code is mentioned
- [ ] Links work and have UTM tracking
- [ ] Unsubscribe link works

## Step 3: Prepare Email List

Create a CSV file with Product Hunt voter emails:

**Format:**
```csv
firstName,email
Sarah,sarah@example.com
John,john@example.com
Alex,alex@example.com
```

**Where to get voter emails:**
- Product Hunt API (if available)
- Sign-up form submissions during launch
- Email captures from landing page
- Manual CSV export

**Save as:** `ph-voters.csv`

## Step 4: Execute Campaign via Dashboard

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Open campaign dashboard:
   ```
   http://localhost:3000/admin/post-launch-campaign
   ```

3. **Update Product Hunt Stats:**
   - Enter final Product Hunt rank (e.g., 3)
   - Enter total upvotes (e.g., 247)
   - Enter Product Hunt URL

4. **Send Emails:**
   - Upload `ph-voters.csv`
   - Click "Send Emails to All Voters"
   - Monitor progress

5. **Share on Social Media:**
   - Copy Twitter post and share
   - Copy LinkedIn post and share
   - Screenshot for verification

6. **Cross-Post to Hacker News:**
   - Copy Show HN post
   - Go to: https://news.ycombinator.com/submit
   - Submit as "Show HN" post
   - Engage with comments for 2-4 hours

## Step 5: Monitor Campaign Performance

### Email Metrics (SendGrid Dashboard)

Track:
- Emails sent
- Delivery rate
- Open rate
- Click-through rate
- Unsubscribe rate

**SendGrid Dashboard:**
https://app.sendgrid.com/statistics

### Analytics (PostHog)

Track custom events:
- `ph_campaign_executed` - Campaign launched
- `ph_campaign_copy` - Social media posts copied
- `promo_code_applied` - HUNT20 used at checkout
- `ph_voter_conversion` - Voter converted to paid

**PostHog Dashboard:**
https://app.posthog.com

### Revenue (Stripe Dashboard)

Monitor:
- HUNT20 redemptions
- Revenue from PH campaign
- Conversion rate (voters → customers)

**Stripe Promotion Dashboard:**
https://dashboard.stripe.com/promotion_codes

## Step 6: Timeline Checklist

Execute in this order within 48 hours:

### Hour 0 (Immediately after PH launch)
- [ ] Note final Product Hunt rank
- [ ] Note total upvotes at end of launch day
- [ ] Capture Product Hunt URL

### Hour 1-2
- [ ] Create HUNT20 promo code if not exists
- [ ] Test email campaign (send to self)
- [ ] Prepare email list CSV

### Hour 3-4
- [ ] Send bulk emails to all PH voters
- [ ] Post on Twitter/X
- [ ] Post on LinkedIn

### Hour 6-12
- [ ] Cross-post to Hacker News
- [ ] Engage with HN comments for 2-4 hours
- [ ] Monitor email metrics in SendGrid

### Hour 24
- [ ] Check campaign stats
- [ ] Reply to email responses
- [ ] Engage with social media comments

### Hour 48
- [ ] Final campaign review
- [ ] Calculate conversion rate
- [ ] Document learnings for future launches

## Expected Results

**Conservative Estimates:**
- Email open rate: 30-40%
- Click-through rate: 10-15%
- Conversion rate: 2-5%
- Revenue: $5,000-$10,000

**If you email 200 voters:**
- 60-80 opens
- 20-30 clicks
- 4-10 conversions
- $956-$2,390 revenue (at $239/sub with HUNT20)

## Troubleshooting

### Emails not sending

1. Check SendGrid API key:
   ```bash
   echo $SENDGRID_API_KEY
   ```

2. Verify sender authentication:
   - Go to: https://app.sendgrid.com/settings/sender_auth
   - Ensure `taxbridge.app` domain is verified

3. Check email template exists:
   - Template ID should be in `.env.local` as `SENDGRID_TEMPLATE_PH_VOTER`

### HUNT20 code not working

1. Verify promo code in Stripe:
   ```bash
   npm run verify:stripe
   ```

2. Check expiration date (should be 7 days from creation)

3. Ensure max redemptions not reached (200 limit)

### Social media posts not rendering

1. Check character limits:
   - Twitter: 280 characters
   - LinkedIn: 3000 characters

2. Use link shorteners if needed:
   - bit.ly
   - TinyURL

## Post-Campaign Analysis

After 7 days (when HUNT20 expires):

1. **Calculate ROI:**
   ```
   Revenue from HUNT20 / Campaign Cost = ROI
   ```

2. **Document metrics:**
   - Total voters emailed
   - Email open rate
   - Click-through rate
   - Conversion rate
   - Total revenue
   - Customer acquisition cost (CAC)

3. **Save for future campaigns:**
   - Copy metrics to `docs/campaigns/PH_LAUNCH_RESULTS.md`
   - Note what worked well
   - Note what to improve next time

## Files Created

This campaign infrastructure includes:

1. **Email Templates:**
   - `lib/email/product-hunt-campaign.ts` - Email template logic

2. **Admin Dashboard:**
   - `app/admin/post-launch-campaign/page.tsx` - Campaign execution UI

3. **API Endpoints:**
   - `app/api/admin/send-ph-campaign/route.ts` - Bulk email sender

4. **Scripts:**
   - `scripts/create-hunt20-promo.ts` - Create HUNT20 promo code
   - `scripts/test-ph-campaign.ts` - Test email before sending
   - `scripts/test-hunt20-code.ts` - Verify HUNT20 works

5. **Documentation:**
   - `docs/PRODUCT_HUNT_CAMPAIGN.md` - This file

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review SendGrid logs: https://app.sendgrid.com/activity
3. Check Stripe logs: https://dashboard.stripe.com/logs
4. Email: michael@taxbridge.app

---

**Good luck with the launch! 🚀**
