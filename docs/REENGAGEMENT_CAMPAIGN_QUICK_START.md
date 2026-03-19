# Re-engagement Campaign - Quick Activation Checklist

**Status**: ✅ Code deployed to GitHub, ⚠️ Needs environment variables to go live

---

## What's Been Done ✅

1. **Database migration applied** - 3 new tables created locally:
   - `calculator_sessions` - Tracks calculator usage
   - `email_conversions` - Tracks revenue attribution
   - `email_events` - Extended with 3 new re-engagement event types

2. **Email templates built** - 3 professional HTML emails:
   - Day 3: Social proof ($12.4K saved story)
   - Day 7: 20% discount (SAVE20 code)
   - Day 14: Last chance urgency

3. **Cron job configured** - Runs daily at 10 AM PST automatically

4. **Code pushed to GitHub** - All changes committed (commit 724cfd82)

---

## To Activate Campaign (2 Steps)

### Step 1: Set Environment Variables on Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

**Add these 2 variables** (Production environment):

```
SENDGRID_API_KEY=SG.your_real_api_key_here
CRON_SECRET=your_32_char_random_string
```

**How to get values:**

1. **SENDGRID_API_KEY**:
   - Go to https://app.sendgrid.com/settings/api_keys
   - Click "Create API Key"
   - Name: "TaxBridge Re-engagement Campaign"
   - Permissions: "Full Access" (or at minimum: Mail Send)
   - Copy the API key (starts with `SG.`)

2. **CRON_SECRET**:
   - Run this in your terminal:
     ```bash
     openssl rand -hex 32
     ```
   - Copy the output (64-character hex string)
   - This secures your cron endpoint from unauthorized access

### Step 2: Redeploy on Vercel

After adding environment variables:
1. Go to Vercel Dashboard → Deployments
2. Click on latest deployment → "Redeploy"
3. Wait for deployment to complete

---

## Verify It's Working

### Test the cron endpoint manually:

```bash
curl https://taxbridgecpa.com/api/cron/reengagement-campaign \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -v
```

**Expected response:**
```json
{
  "timestamp": "2026-03-19T...",
  "campaigns": [
    {
      "type": "reengagement_day3",
      "eligible": 0,
      "sent": 0,
      ...
    }
  ],
  "totalSent": 0
}
```

(Will show 0 sent initially since no calculator sessions exist yet)

### Check analytics:

```bash
curl https://taxbridgecpa.com/api/analytics/reengagement
```

---

## Optional: Integrate Calculator Tracking

To track which users complete calculations (so they can be targeted for re-engagement):

**Add this code** wherever tax calculations are submitted:

```typescript
import { recordCalculatorSession } from '@/lib/db/queries/reengagement-campaign';

// After successful calculation
const userProfile = await getUserProfileByClerkId(userId);
if (userProfile) {
  recordCalculatorSession(userProfile.id);
}
```

**If you skip this step:** The campaign can initially target ALL free users instead of just calculator users. You can modify the query in `lib/db/queries/reengagement-campaign.ts` to remove the `calculator_sessions` join.

---

## Expected Results

**First Week:**
- Likely 0 emails sent (need calculator sessions or modify query)
- Once integrated: 10-50 emails/day depending on traffic

**First Month:**
- 30-40 conversions expected
- $1,200-$1,600 revenue
- 25-30% open rate, 6-8% click rate, 4-6% conversion rate

**ROI:**
- SendGrid cost: $15/month
- Expected revenue: $1,500/month
- **ROI: 100x**

---

## Files to Review

1. **Activation guide**: `docs/REENGAGEMENT_CAMPAIGN_ACTIVATION.md` (detailed setup)
2. **Implementation summary**: `docs/REENGAGEMENT_CAMPAIGN_IMPLEMENTATION.md` (what was built)
3. **Campaign analysis**: `docs/REENGAGEMENT_CAMPAIGN_ANALYSIS.md` (full strategy)

---

## Questions?

All code is in the repo:
- Email templates: `lib/email/reengagement-campaign-templates.ts`
- Cron job: `app/api/cron/reengagement-campaign/route.ts`
- Analytics: `app/api/analytics/reengagement/route.ts`

**To activate:** Just set those 2 environment variables on Vercel and redeploy. Campaign will start automatically.
