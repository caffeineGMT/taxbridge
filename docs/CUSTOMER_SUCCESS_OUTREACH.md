# Customer Success Outreach System

Complete customer success system for engaging paid users, collecting feedback, and preventing churn.

## Overview

This system provides:

1. **Email Templates** - 4 targeted email campaigns for different stages
2. **Churn Risk Detection** - Algorithmic scoring based on engagement metrics
3. **Feedback Collection** - Structured feedback surveys with NPS tracking
4. **Outreach Automation** - Scripts to identify and email at-risk users
5. **Admin Dashboard** - Real-time view of customer health and feedback

## Email Campaigns

### 1. Paid User Check-in (Day 7)
**Purpose:** Ensure new paid users are getting value
**Triggers:** 7 days after subscription, sent once
**Template ID:** `PAID_USER_CHECKIN`
**Subject:** "How's your TaxBridge Pro experience so far?"
**CTAs:**
- Submit feedback survey
- Book 1:1 call with founder
- Email support

### 2. Feedback Request (Day 14)
**Purpose:** Collect structured feedback and NPS score
**Triggers:** 14 days after subscription, sent once
**Template ID:** `FEEDBACK_REQUEST`
**Subject:** "Quick favor? Help us improve TaxBridge"
**Incentive:** 1 month free for completing survey
**Metrics Collected:**
- NPS score (0-10)
- Satisfaction score (1-5)
- Feature usage
- Pain points
- Feature requests
- Testimonials

### 3. Churn Prevention (High/Critical Risk)
**Purpose:** Re-engage at-risk paid users before they churn
**Triggers:** Churn risk score ≥ 51, max 1 email per 14 days
**Template ID:** `CHURN_PREVENTION`
**Subject:** "Need help getting value from TaxBridge?"
**CTAs:**
- Book free support call
- Pause subscription (3 months free)
- Cancel subscription (with exit survey)

### 4. Concierge Onboarding (Days 1-3)
**Purpose:** Offer personalized onboarding to new paid customers
**Triggers:** 1-3 days after subscription, sent once
**Template ID:** `CONCIERGE_ONBOARDING`
**Subject:** "Want a personal walkthrough? (Free for Pro members)"
**Value:** Free 20-minute onboarding call ($200 value)

## Churn Risk Scoring Algorithm

### Scoring Components (0-100 scale)

1. **Days Since Last Login (0-40 points)**
   - 30+ days: 40 points
   - 14-29 days: 30 points
   - 7-13 days: 20 points
   - 3-6 days: 10 points
   - 0-2 days: 0 points

2. **Calculations Completed (0-30 points)**
   - 0 calculations: 30 points
   - 1 calculation: 20 points
   - 2 calculations: 10 points
   - 3+ calculations: 0 points

3. **Days Since Subscription (0-20 points)**
   - 14-30 days: 20 points (new user, not engaged)
   - 7-13 days: 10 points
   - Other: 0 points

4. **Logins Last 30 Days (0-10 points)**
   - 0 logins: 10 points
   - 1-4 logins: 5 points
   - 5+ logins: 0 points

### Risk Levels
- **0-25:** Low risk (no action)
- **26-50:** Medium risk (monitor)
- **51-75:** High risk (send churn prevention email)
- **76-100:** Critical risk (urgent outreach + manual follow-up)

## Database Schema

### `customer_feedback`
Stores all customer feedback submissions.

**Key fields:**
- `nps_score` (0-10)
- `satisfaction_score` (1-5)
- `upgrade_reason`, `most_used_features`, `missing_features`
- `pain_points`, `general_feedback`, `feature_requests`
- `testimonial` (can be featured on website)
- `source` (email-survey, in-app, support-ticket, call)

### `churn_risk_tracking`
Tracks churn risk scores over time.

**Key fields:**
- `churn_risk_score` (0-100)
- `risk_level` (low, medium, high, critical)
- `days_since_last_login`, `calculations_completed`
- `outreach_sent`, `responded_to_outreach`, `booked_call`

### `customer_success_outreach`
Logs all outreach emails sent.

**Key fields:**
- `template_type` (paid_user_checkin, feedback_request, etc.)
- `sent_at`, `delivered_at`, `opened_at`, `clicked_at`
- `replied`, `booked_call`, `converted_to_action`

### `concierge_calls`
Tracks 1:1 onboarding and support calls.

**Key fields:**
- `call_type` (onboarding, support, churn_prevention)
- `scheduled_at`, `completed_at`, `duration_minutes`
- `topics_covered`, `action_items`, `user_satisfaction`

## Running Customer Success Outreach

### Manual Execution

```bash
# Run all outreach campaigns (dry-run mode)
npm run customer-success -- --dry-run

# Run all outreach campaigns (LIVE - sends real emails)
npm run customer-success

# Run specific campaign only
npm run customer-success -- --type=checkin    # Day 7 check-ins only
npm run customer-success -- --type=feedback   # Day 14 feedback requests
npm run customer-success -- --type=churn      # Churn prevention only
npm run customer-success -- --type=concierge  # Concierge onboarding only
```

### Automated Execution (Cron Job)

Add to crontab or CI/CD:

```bash
# Run daily at 9 AM PT
0 9 * * * cd /path/to/project && npm run customer-success >> logs/customer-success.log 2>&1
```

### Output

```
🎯 Customer Success Outreach Script
Mode: LIVE
Type: all
---

📊 Fetching paid users...
✓ Found 23 paid users

🔍 Calculating churn risks...
✓ Identified 5 users at risk of churning

  📝 Saved churn risk for alice@example.com: high (score: 67)
  📝 Saved churn risk for bob@example.com: medium (score: 42)
  ...

---

📧 Sending outreach emails...

✓ [CHECKIN] carol@example.com (Day 7)
✓ [FEEDBACK] dave@example.com (Day 14)
✓ [CHURN] alice@example.com (Risk score: 67)
✓ [CONCIERGE] eve@example.com (Day 2)

---

📊 OUTREACH SUMMARY

Total paid users: 23
Churn risks identified: 5

Emails sent:
  • Check-in emails: 3
  • Feedback requests: 2
  • Churn prevention: 5
  • Concierge onboarding: 1

Total emails: 11
Errors: 0
```

## API Endpoints

### POST `/api/feedback/submit`
Submit customer feedback from survey or in-app form.

**Request Body:**
```json
{
  "nps_score": 9,
  "satisfaction_score": 5,
  "upgrade_reason": "Multi-year planning feature",
  "most_used_features": "Calculator, PDF export",
  "missing_features": "Quarterly estimated tax calculator",
  "pain_points": "Mobile app would be nice",
  "general_feedback": "Love the product!",
  "feature_requests": "TurboTax integration",
  "testimonial": "TaxBridge saved me $8K in taxes!",
  "email": "user@example.com",
  "user_id": 123,
  "subscription_tier": "pro",
  "source": "email-survey"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thank you for your feedback!",
  "feedback_id": 456
}
```

### GET `/api/feedback/submit?email=user@example.com&user_id=123&tier=pro`
Renders feedback survey HTML form (accessed via email link).

## Admin Dashboard

**Route:** `/admin/customer-success`

**Features:**
- Real-time metrics: Total paid users, churn risks, NPS score, feedback count
- Churn risk table: Sortable list of at-risk users with scores and actions
- Recent feedback: Full feedback submissions with NPS, satisfaction, and testimonials
- NPS summary: Promoters, passives, detractors breakdown

## SendGrid Template Setup

1. **Create Dynamic Templates** in SendGrid Dashboard:
   - Go to https://app.sendgrid.com/dynamic_templates
   - Click "Create a Dynamic Template"
   - Use the HTML/CSS editor

2. **Set Environment Variables:**
```env
SENDGRID_TEMPLATE_PAID_CHECKIN=d-xxxxx
SENDGRID_TEMPLATE_FEEDBACK_REQUEST=d-xxxxx
SENDGRID_TEMPLATE_CHURN_PREVENTION=d-xxxxx
SENDGRID_TEMPLATE_CONCIERGE=d-xxxxx
```

3. **Template Requirements:**
   - All templates MUST include `{{unsubscribe_url}}`
   - Use handlebars syntax for dynamic data: `{{first_name}}`, `{{subject}}`, etc.
   - Mobile-responsive (60%+ opens are mobile)
   - Max width: 600px
   - CTA buttons: 44px min height (touch-friendly)

## Calendly Integration

Set up Calendly for 1:1 calls:

```env
CALENDLY_URL=https://calendly.com/taxbridge-michael
```

**Event Types to Create:**
- `/onboarding-call` - 20 min, for new paid users
- `/support-call` - 15 min, for general support
- `/winback-call` - 15 min, for churn prevention

## Metrics to Monitor

### Customer Health
- **NPS Score:** Target ≥ 50 (world-class: ≥ 70)
- **Churn Rate:** Target < 5% monthly
- **Time to First Value:** Days until first calculation (target < 1 day)
- **Feature Adoption:** % of paid users using multi-year, PDF export, etc.

### Outreach Effectiveness
- **Email Open Rates:** Target ≥ 40%
- **Email Click Rates:** Target ≥ 15%
- **Survey Response Rate:** Target ≥ 30%
- **Call Booking Rate:** Target ≥ 10%

### Retention
- **Winback Success:** % of high-risk users who re-engage after outreach
- **Survey Impact:** Churn rate of users who submitted feedback vs. didn't

## Best Practices

1. **Timing Matters:**
   - Send emails during business hours (9 AM - 5 PM recipient's timezone)
   - Avoid weekends for professional audience
   - Space outreach emails at least 7 days apart

2. **Personalization:**
   - Always use first name
   - Reference specific engagement metrics (e.g., "You've completed 0 calculations")
   - Tailor CTAs based on risk level

3. **Testing:**
   - A/B test subject lines
   - Test different incentives (1 month free vs. $20 Amazon gift card)
   - Test email timing (morning vs. afternoon)

4. **Follow-up:**
   - If user books call, send calendar reminder
   - After call, send summary email with action items
   - If user submits feedback, respond within 24 hours

5. **Feedback Loop:**
   - Review all feedback weekly
   - Share testimonials with team
   - Create Jira tickets for feature requests
   - Close the loop: "You asked for X, we built it!"

## Files Reference

- **Email Templates:** `lib/email/customer-success-templates.ts`
- **Utilities:** `lib/customer-success.ts`
- **Database Migration:** `lib/db/migrations/014_customer_success_feedback.sql`
- **Outreach Script:** `scripts/customer-success-outreach.ts`
- **Feedback API:** `app/api/feedback/submit/route.ts`
- **Admin Dashboard:** `app/admin/customer-success/page.tsx`

## Next Steps

1. **Set up SendGrid Templates** (see "SendGrid Template Setup" above)
2. **Set up Calendly** (see "Calendly Integration" above)
3. **Run Migration:** `npm run migrate` (applies `014_customer_success_feedback.sql`)
4. **Test Dry Run:** `npm run customer-success -- --dry-run`
5. **Go Live:** Set up cron job for daily execution
6. **Monitor Dashboard:** `/admin/customer-success`

## Support

Questions? Email michael@taxbridge.app
