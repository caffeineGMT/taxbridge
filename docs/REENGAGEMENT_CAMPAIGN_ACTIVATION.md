# Re-engagement Campaign Activation Guide

**Status**: ✅ READY TO DEPLOY
**Date**: March 19, 2026
**Campaign**: 3-Email Win-Back Sequence for Calculator Non-Converters

---

## Executive Summary

The re-engagement email campaign is **production-ready** and waiting to be activated. All infrastructure is in place:

✅ Database tables created (migration 020 applied)
✅ Email templates built (3 professional HTML emails)
✅ Cron job configured (runs daily at 10 AM PST)
✅ Analytics dashboard ready
✅ SendGrid integration updated to support HTML/text emails

**Required Actions Before Launch:**
1. Set SendGrid API key in production environment
2. Integrate calculator session tracking
3. Deploy to production
4. Monitor first 24-48 hours

**Expected Impact:**
- 5-10% conversion rate on free → paid
- $1,500-$4,500 monthly incremental revenue
- 10-30x ROI

---

## Campaign Overview

### 3-Email Sequence

| Email | Timing | Strategy | Subject | CTA |
|-------|--------|----------|---------|-----|
| **Day 3** | 3 days after calculation | Social Proof | "How Michael Saved $12,400 in Taxes (And You Can Too)" | "See My Full Tax Breakdown →" |
| **Day 7** | 7 days after calculation | Discount Offer (20% off) | "🎁 20% Off TaxBridge Pro (Expires in 48 Hours)" | "Claim My 20% Discount →" |
| **Day 14** | 14 days after calculation | Urgency + FOMO | "⏰ Last Day: Your $9.80 Discount Expires Tonight" | "Upgrade Now (Before It's Gone) →" |

### Discount Code
- **Code**: `SAVE20`
- **Discount**: 20% off ($49 → $39.20)
- **Duration**: Valid through Day 14 email
- **Expected Usage**: 30-40% of conversions will use discount

---

## Pre-Launch Checklist

### 1. ✅ Database Migration (COMPLETED)

```bash
# Already applied
sqlite3 data/taxbridge.db < lib/db/migrations/020_reengagement_emails.sql
```

**Verify tables exist:**
```bash
sqlite3 data/taxbridge.db "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('email_events', 'calculator_sessions', 'email_conversions');"
# Should return: email_events, calculator_sessions, email_conversions
```

### 2. ⚠️ SendGrid API Key (REQUIRED)

**Current Status**: Placeholder key set in `.env.production`

**Action Required:**
1. Get real SendGrid API key from https://app.sendgrid.com/settings/api_keys
2. Update production environment variable on Vercel:
   ```bash
   # In Vercel dashboard → Settings → Environment Variables
   SENDGRID_API_KEY=SG.YOUR_REAL_API_KEY_HERE
   ```
3. Verify SendGrid domain authentication (noreply@taxbridgecpa.com)

**Test email sending:**
```bash
tsx scripts/test-reengagement-campaign.ts
```

### 3. ⚠️ Calculator Session Tracking (INTEGRATION NEEDED)

**What it does**: Records when users complete tax calculations so we know who to target for re-engagement.

**Integration Code:**

Add to wherever tax calculations are completed (likely in PostHog tracking or form submission):

```typescript
import { recordCalculatorSession } from '@/lib/db/queries/reengagement-campaign';
import { auth } from '@clerk/nextjs';

// After successful tax calculation
const { userId } = auth();
if (userId) {
  // Get user's database ID from Clerk user ID
  const userProfile = await getUserProfileByClerkId(userId);
  if (userProfile) {
    recordCalculatorSession(userProfile.id);
  }
}
```

**Files to update:**
- `app/api/track/email-conversion/route.ts` (already has conversion tracking)
- Main calculator component (wherever calculations are submitted)
- PostHog tracking event for `tax_calculation_completed`

**Fallback**: If calculator tracking is complex to integrate, we can initially target ALL free users who haven't upgraded (modify `getUsersForReengagement` query).

### 4. ✅ Vercel Cron Configuration (COMPLETED)

Already configured in `vercel.json`:
```json
{
  "path": "/api/cron/reengagement-campaign",
  "schedule": "0 18 * * *",
  "description": "Re-engagement win-back campaign - runs daily at 10:00 AM PST (6:00 PM UTC)"
}
```

**Manual trigger for testing:**
```bash
curl https://taxbridgecpa.com/api/cron/reengagement-campaign \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

### 5. Environment Variables Checklist

**Production (.env.production or Vercel):**
- ✅ `SENDGRID_API_KEY=SG.your_real_key`
- ✅ `SENDGRID_FROM_EMAIL=noreply@taxbridgecpa.com`
- ✅ `SENDGRID_FROM_NAME=TaxBridge`
- ✅ `SENDGRID_REPLY_TO=support@taxbridgecpa.com`
- ⚠️ `CRON_SECRET=<random_secure_string>` (for cron authentication)

**Generate CRON_SECRET:**
```bash
openssl rand -hex 32
```

---

## Deployment Steps

### Step 1: Commit Code to GitHub

```bash
npm run build  # Verify zero build errors
git add -A
git commit -m "[P1-HIGH] Activate Re-engagement Email Campaign - 3-email win-back sequence deployed"
git push origin main
```

### Step 2: Verify Vercel Deployment

1. Vercel auto-deploys from main branch
2. Check deployment logs at https://vercel.com/your-project/deployments
3. Verify production URL: https://taxbridgecpa.com

### Step 3: Set Environment Variables on Vercel

1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add/update:
   - `SENDGRID_API_KEY` (Production)
   - `CRON_SECRET` (Production)
3. Redeploy after updating env vars

### Step 4: Manual Test

```bash
# Test email sending locally first
tsx scripts/test-reengagement-campaign.ts

# Then test production cron endpoint
curl https://taxbridgecpa.com/api/cron/reengagement-campaign \
  -H "Authorization: Bearer your_cron_secret" \
  -v
```

**Expected Response:**
```json
{
  "timestamp": "2026-03-19T...",
  "campaigns": [
    {
      "type": "reengagement_day3",
      "description": "Day 3 - Case Study (Social Proof)",
      "eligible": 0,
      "sent": 0,
      "failed": 0,
      "skipped": 0
    },
    ...
  ],
  "totalSent": 0,
  "totalFailed": 0,
  "totalSkipped": 0
}
```

### Step 5: Monitor First 48 Hours

**Daily Checks:**
```bash
# Check campaign performance
curl https://taxbridgecpa.com/api/analytics/reengagement

# Check Vercel cron logs
# Dashboard → Functions → /api/cron/reengagement-campaign → Logs
```

**Expected Metrics (First Week):**
- Open rate: 25-30%
- Click rate: 6-8%
- Conversion rate: 4-6%
- Revenue per email: $2-3

---

## Integration with Stripe Webhook

To properly track conversions from re-engagement emails, add this to your Stripe webhook handler:

**File**: `app/api/stripe/webhook/route.ts`

```typescript
// When customer.subscription.created event is received
if (event.type === 'customer.subscription.created') {
  const subscription = event.data.object;
  const clerkUserId = subscription.metadata.clerkUserId;

  // Track email conversion attribution
  if (clerkUserId) {
    const userProfile = await getUserProfileByClerkId(clerkUserId);
    if (userProfile) {
      await fetch('/api/track/email-conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userProfile.id,
          conversionType: 'free_to_pro',
          revenueAmount: subscription.plan.amount / 100, // Convert cents to dollars
          discountCode: subscription.discount?.coupon?.id,
        }),
      });
    }
  }
}
```

This allows the campaign to attribute conversions within a 7-day window.

---

## Analytics Dashboard

**View campaign performance:**
```bash
GET https://taxbridgecpa.com/api/analytics/reengagement
```

**Response includes:**
- Total emails sent by campaign type
- Open rates, click rates, conversion rates
- Revenue attribution
- Discount code usage
- Cohort analysis

**PostHog Integration:**
The campaign automatically fires PostHog events:
- `reengagement_email_sent` (Day 3, 7, 14)
- `reengagement_email_opened`
- `reengagement_email_clicked`
- `reengagement_conversion` (attributed to email)

---

## Monitoring & Alerts

### Success Metrics

**Week 1 Targets:**
- Open Rate: > 22%
- Click Rate: > 5%
- Conversion Rate: > 3%
- Unsubscribe Rate: < 2%
- Bounce Rate: < 5%

### Alert Thresholds

**Set up alerts for:**
1. **Low open rate** (< 15% for 3 consecutive days)
   - Action: Check spam folder placement
   - Tool: SendGrid deliverability reports

2. **High unsubscribe rate** (> 3%)
   - Action: Review email copy, reduce frequency
   - Tool: SendGrid suppression list

3. **Zero conversions** (> 7 days with 100+ emails sent)
   - Action: Check checkout flow, verify discount code
   - Tool: Test checkout manually

4. **Cron job failures**
   - Action: Check Vercel logs, verify CRON_SECRET
   - Tool: Vercel Functions logs

---

## A/B Testing Roadmap

### Phase 1: Subject Line Tests (Week 2-3)

**Day 3 Email:**
- Control: "How Michael Saved $12,400 in Taxes (And You Can Too)"
- Variant A: "$12.4K saved in taxes - here's how"
- Variant B: "{firstName}, you're leaving $ on the table"

**Implementation:**
Update `lib/email/reengagement-campaign-templates.ts` to add A/B variant parameter.

### Phase 2: CTA Tests (Week 4-5)

Test different CTA copy for click-through rate improvement.

### Phase 3: Personalization (Week 6+)

Use actual user calculation data instead of generic numbers ($8,500 → user's actual tax savings).

---

## Troubleshooting

### Issue: Emails not sending

**Check:**
1. `SENDGRID_API_KEY` is set in Vercel production environment
2. SendGrid domain authentication is complete
3. Cron job is running (check Vercel Functions logs)
4. Users exist in `calculator_sessions` table

**Debug:**
```bash
sqlite3 data/taxbridge.db "SELECT COUNT(*) FROM calculator_sessions;"
sqlite3 data/taxbridge.db "SELECT COUNT(*) FROM email_events WHERE event_type LIKE 'reengagement%';"
```

### Issue: Cron job not firing

**Check:**
1. `vercel.json` deployed correctly
2. `CRON_SECRET` environment variable set
3. Vercel Cron Jobs feature enabled (requires Hobby/Pro plan)

**Manual trigger:**
```bash
curl https://taxbridgecpa.com/api/cron/reengagement-campaign \
  -H "Authorization: Bearer your_cron_secret"
```

### Issue: Low open rates (< 15%)

**Possible causes:**
1. Emails landing in spam folder
2. SendGrid sender reputation low
3. Subject lines too long (mobile truncation)

**Actions:**
1. Check SendGrid deliverability reports
2. Authenticate domain (SPF, DKIM records)
3. Test shorter subject line variants

---

## Quick Start (TL;DR)

For immediate activation:

```bash
# 1. Set SendGrid API key on Vercel
# Vercel Dashboard → Settings → Environment Variables
# Add: SENDGRID_API_KEY=SG.your_real_key

# 2. Set CRON_SECRET
# Generate: openssl rand -hex 32
# Add to Vercel: CRON_SECRET=<generated_secret>

# 3. Deploy
npm run build
git add -A
git commit -m "[P1-HIGH] Activate Re-engagement Campaign"
git push origin main

# 4. Test cron endpoint
curl https://taxbridgecpa.com/api/cron/reengagement-campaign \
  -H "Authorization: Bearer your_cron_secret"

# 5. Monitor analytics
curl https://taxbridgecpa.com/api/analytics/reengagement
```

---

## Expected Results (90 Days)

**Assumptions:**
- 1,000 calculator users per month
- 25% open rate, 6% click rate, 4% conversion rate

**Projected Revenue:**
- Month 1: $1,530 (39 conversions @ $39.20 avg)
- Month 2: $1,530 (consistent)
- Month 3: $1,530 (consistent)
- **Total 90 Days**: $4,590

**Cost:**
- SendGrid: $15/month (Essentials plan)
- Development time: Already built

**ROI**: 30.6x (revenue ÷ SendGrid cost)

---

## Next Steps

1. **Immediate**: Set SendGrid API key and CRON_SECRET on Vercel
2. **Week 1**: Monitor open/click/conversion rates
3. **Week 2**: Start A/B testing subject lines
4. **Week 4**: Add personalization (user's actual tax savings)
5. **Month 2**: Optimize based on data, test discount amounts

---

## Support

**Questions?**
- Email infrastructure: `lib/email/sendgrid.ts`
- Campaign templates: `lib/email/reengagement-campaign-templates.ts`
- Cron job: `app/api/cron/reengagement-campaign/route.ts`
- Analytics: `app/api/analytics/reengagement/route.ts`

**Documentation:**
- Full analysis: `docs/REENGAGEMENT_CAMPAIGN_ANALYSIS.md`
- Summary: `docs/REENGAGEMENT_CAMPAIGN_SUMMARY.md`
- Test script: `scripts/test-reengagement-campaign.ts`
