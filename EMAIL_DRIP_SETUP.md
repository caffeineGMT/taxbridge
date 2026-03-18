# Email Drip Campaign Setup Guide

## Overview

TaxBridge implements a 4-email drip campaign using SendGrid Dynamic Templates and Vercel Cron. The campaign runs automatically to engage free users and convert them to premium subscribers.

## Campaign Schedule

| Day | Email Type | Subject | Purpose | Template ID |
|-----|-----------|---------|---------|-------------|
| 0 | Welcome | "Welcome to TaxBridge" | Onboarding, quick start | DRIP_WELCOME |
| 3 | Education | "Understanding Foreign Tax Credits" | FTC basics, treaty Article XV | DRIP_DAY3 |
| 7 | Features | "TaxBridge Features You Might Have Missed" | Feature highlights | DRIP_DAY7 |
| 14 | Upgrade | "Save 20% on TaxBridge Premium" | Premium offer + discount code | DRIP_DAY14 |

## Setup Instructions

### 1. SendGrid Account Setup

1. Create a free SendGrid account at https://sendgrid.com
2. Verify your sender email address (e.g., `noreply@taxbridge.app`)
3. Create an API key with "Mail Send" permissions:
   - Go to Settings → API Keys
   - Create API Key → Restricted Access
   - Select "Mail Send" → Full Access
   - Copy the API key (you won't see it again!)

### 2. Create SendGrid Dynamic Templates

Create 4 dynamic templates in SendGrid Dashboard (https://app.sendgrid.com/dynamic_templates):

#### Template 1: Welcome Email (DRIP_WELCOME)

**Subject:** `Welcome to TaxBridge - Your Cross-Border Tax Solution`

**Template Variables:**
- `{{first_name}}` - User's first name
- `{{email}}` - User's email
- `{{unsubscribe_url}}` - Unsubscribe link
- `{{dashboard_url}}` - Dashboard URL
- `{{rsu_entry_url}}` - RSU entry URL
- `{{support_email}}` - Support email

**Content Outline:**
```
Hi {{first_name}},

Welcome to TaxBridge! We're here to simplify your US-Canada cross-border tax calculations.

🚀 Get Started:
1. Add your first RSU vesting entry
2. Calculate your dual-country tax liability
3. Optimize with Foreign Tax Credits

[Get Started →]

Questions? Reply to this email or contact {{support_email}}

[Unsubscribe]
```

#### Template 2: Day 3 Email (DRIP_DAY3)

**Subject:** `Understanding Foreign Tax Credits - Avoid Double Taxation`

**Template Variables:**
- `{{first_name}}`
- `{{email}}`
- `{{unsubscribe_url}}`
- `{{ftc_calculator_url}}`
- `{{knowledge_base_url}}`
- `{{treaty_article_url}}`
- `{{support_email}}`

**Content Outline:**
```
Hi {{first_name}},

Did you know you might be paying double tax on your RSU income?

The Foreign Tax Credit (FTC) allows you to claim US taxes as a credit on your Canadian return.

📚 Learn More:
- What is FTC and how it works
- US-Canada Tax Treaty Article XV
- Real examples and calculations

[Calculate Your FTC →]

[Unsubscribe]
```

#### Template 3: Day 7 Email (DRIP_DAY7)

**Subject:** `TaxBridge Features You Might Have Missed`

**Template Variables:**
- `{{first_name}}`
- `{{email}}`
- `{{unsubscribe_url}}`
- `{{dual_calculator_url}}`
- `{{form_checklist_url}}`
- `{{exchange_rate_url}}`
- `{{demo_video_url}}`
- `{{support_email}}`

**Content Outline:**
```
Hi {{first_name}},

Here are some powerful TaxBridge features you might not know about:

✅ Dual-Country Tax Calculator
✅ Required Forms Checklist (W-2, 1040, T1, 8833)
✅ Bank of Canada Exchange Rates
✅ Filing Strategy Recommendations

[Explore Features →]

[Unsubscribe]
```

#### Template 4: Day 14 Email (DRIP_DAY14)

**Subject:** `Special Offer: Save 20% on TaxBridge Premium ⏰`

**Template Variables:**
- `{{first_name}}`
- `{{email}}`
- `{{unsubscribe_url}}`
- `{{upgrade_url}}`
- `{{discount_code}}`
- `{{discount_amount}}`
- `{{valid_until}}`
- `{{premium_features}}` (array)
- `{{pricing_url}}`
- `{{support_email}}`

**Content Outline:**
```
Hi {{first_name}},

As a valued TaxBridge user, we're offering you 20% OFF Premium:

🎯 Premium Features:
• Unlimited RSU calculations
• Multi-year tax planning
• PDF tax reports generation
• Priority email support
• Tax form pre-fill assistance

💰 Use code: {{discount_code}}
⏰ Valid until: {{valid_until}}

[Upgrade Now →]

[Unsubscribe]
```

**IMPORTANT:** Each template MUST include an unsubscribe link at the bottom:
```html
<a href="{{unsubscribe_url}}">Unsubscribe from marketing emails</a>
```

### 3. Environment Variables

Add these to `.env.local` (local development) and Vercel Environment Variables (production):

```bash
# SendGrid Configuration
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@taxbridge.app
SENDGRID_FROM_NAME=TaxBridge
SENDGRID_REPLY_TO=support@taxbridge.app

# SendGrid Template IDs (copy from SendGrid dashboard)
SENDGRID_TEMPLATE_WELCOME=d-abc123def456
SENDGRID_TEMPLATE_DAY3=d-def456ghi789
SENDGRID_TEMPLATE_DAY7=d-ghi789jkl012
SENDGRID_TEMPLATE_DAY14=d-jkl012mno345

# Cron Secret (generate a secure random string)
CRON_SECRET=your_secure_random_string_here
```

**Generate CRON_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Vercel Deployment

The `vercel.json` file is already configured to run the cron job daily at 9:00 AM UTC:

```json
{
  "crons": [
    {
      "path": "/api/cron/email-drip",
      "schedule": "0 9 * * *"
    }
  ]
}
```

Deploy to Vercel:
```bash
vercel --prod
```

### 5. Database Setup

The email features require these database tables:
- `user_profiles.email_preferences` - JSON field for opt-in/opt-out
- `email_events` - Tracks sent/opened/clicked events

Run migrations:
```bash
npm run db:migrate
```

## Testing

### Manual Testing (Local)

1. **Test email sending:**
```bash
curl http://localhost:3000/api/cron/email-drip \
  -H "Authorization: Bearer your_cron_secret"
```

2. **Create test users:**
```sql
INSERT INTO user_profiles (email, first_name, last_name, created_at)
VALUES ('test@example.com', 'Test', 'User', DATE('now', '-3 days'));
```

3. **Check email events:**
```sql
SELECT * FROM email_events ORDER BY sent_at DESC;
```

### Production Testing

1. **Manual trigger (use Vercel CLI or Dashboard):**
```bash
curl https://taxbridge.app/api/cron/email-drip \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

2. **Monitor logs in Vercel Dashboard:**
   - Go to your project → Deployments → Latest
   - Click "Functions" → View logs for `/api/cron/email-drip`

3. **SendGrid Dashboard:**
   - Check "Activity" for delivery/open/click rates
   - Expected open rate: >25%
   - Expected click rate: >5%

## Unsubscribe Flow

Users can unsubscribe via:

1. **Link in email:** `https://taxbridge.app/unsubscribe?email=user@example.com`
2. **Unsubscribe page:** Direct visit to `/unsubscribe`

When a user unsubscribes:
- `user_profiles.email_preferences` is updated to `{"marketing_emails": false}`
- They will NOT receive future drip emails
- They WILL still receive transactional emails (password resets, etc.)

## Monitoring & Analytics

### Email Stats Query

```typescript
import { getEmailStats } from '@/lib/db/queries/drip-campaign';

// Get stats for all email types
const stats = getEmailStats();

// Get stats for specific email type
const welcomeStats = getEmailStats('drip_welcome');
```

### Success Metrics (After 30 Days)

| Metric | Target | Formula |
|--------|--------|---------|
| Delivery Rate | >95% | (Delivered / Sent) × 100 |
| Open Rate | >25% | (Opened / Delivered) × 100 |
| Click Rate | >5% | (Clicked / Delivered) × 100 |
| Unsubscribe Rate | <2% | (Unsubscribed / Delivered) × 100 |
| Conversion Rate | >1% | (Upgraded / Day14 Recipients) × 100 |

### SendGrid Webhooks (Optional)

To track opens/clicks, configure SendGrid Event Webhook:

1. SendGrid Dashboard → Settings → Mail Settings → Event Webhook
2. HTTP Post URL: `https://taxbridge.app/api/webhooks/sendgrid`
3. Enable: Delivered, Opened, Clicked, Unsubscribed

## Troubleshooting

### Emails Not Sending

1. **Check SendGrid API key:**
   ```bash
   echo $SENDGRID_API_KEY
   ```

2. **Check Vercel logs:**
   - Look for "SENDGRID_API_KEY not found" warnings
   - Check for SendGrid API errors

3. **Verify cron is running:**
   - Vercel Dashboard → Project → Settings → Cron Jobs
   - Should show last run time

### Users Not Receiving Emails

1. **Check email_preferences:**
   ```sql
   SELECT email, email_preferences FROM user_profiles WHERE email = 'user@example.com';
   ```

2. **Check email_events:**
   ```sql
   SELECT * FROM email_events WHERE user_id = 123;
   ```

3. **Verify user signup date:**
   ```sql
   SELECT email, created_at, DATE('now', '-3 days') as trigger_date
   FROM user_profiles
   WHERE email = 'user@example.com';
   ```

### Duplicate Emails

The `idx_email_events_user_type` unique index prevents duplicates. If you see duplicates:
- Check database integrity
- Verify the unique constraint exists:
  ```sql
  SELECT * FROM sqlite_master WHERE type='index' AND name='idx_email_events_user_type';
  ```

## Best Practices

1. **Subject Lines:**
   - Keep under 50 characters
   - Avoid spam trigger words (FREE, ACT NOW, !!!)
   - Personalize with {{first_name}}

2. **Email Content:**
   - Mobile-responsive design
   - Clear single CTA (Call-To-Action)
   - Branded footer with social links

3. **Timing:**
   - 9:00 AM UTC = 1:00 AM PST / 4:00 AM EST
   - Consider adjusting for better engagement
   - Test different send times with A/B testing

4. **Compliance:**
   - Include physical mailing address (CAN-SPAM Act)
   - Clear unsubscribe link in every email
   - Honor unsubscribe requests immediately

## Revenue Impact

Based on industry benchmarks:

| Scenario | Calculation | Monthly Revenue |
|----------|-------------|-----------------|
| 1000 signups/month | 1000 × 1% conversion × $20/month | $200/month |
| 5000 signups/month | 5000 × 1% conversion × $20/month | $1,000/month |
| 10000 signups/month | 10000 × 1.5% conversion × $20/month | $3,000/month |

**Target:** 1% conversion rate from drip campaign = $1M ARR at scale

## Next Steps

1. ✅ Install @sendgrid/mail dependency
2. ✅ Create database migrations
3. ✅ Implement SendGrid client
4. ✅ Create email templates
5. ✅ Build cron endpoint
6. ✅ Add unsubscribe flow
7. ⏳ Create SendGrid templates in dashboard
8. ⏳ Configure environment variables
9. ⏳ Deploy to Vercel
10. ⏳ Monitor first 100 emails
11. ⏳ Optimize based on analytics

## Support

Questions or issues? Contact the development team or check:
- SendGrid Documentation: https://docs.sendgrid.com
- Vercel Cron Jobs: https://vercel.com/docs/cron-jobs
- TaxBridge Slack: #engineering
