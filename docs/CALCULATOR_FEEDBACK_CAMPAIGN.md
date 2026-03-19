# Calculator Feedback Collection Campaign

## Overview

Automated system to collect feedback from users who completed the tax calculator but didn't convert to paid customers. Offers 20% discount codes for their feedback to understand conversion barriers and improve the product.

## Features

✅ **Email Templates** - Professional, conversion-focused emails with discount codes
✅ **Discount Code Generation** - Unique 20% off codes (valid 30 days)
✅ **Automated Email Sending** - Identifies and emails non-converting users
✅ **Reminder System** - Automatic follow-ups after 5 days
✅ **Response Tracking** - Full database tracking of feedback and conversions
✅ **Admin Dashboard** - Real-time analytics and response monitoring
✅ **Analytics Views** - Pre-built SQL views for campaign performance

## Quick Start

### 1. Run Database Migration

```bash
npm run db:migrate
```

This creates the following tables:
- `discount_codes` - 20% discount code tracking
- `calculator_feedback_requests` - Email send tracking
- `calculator_feedback_responses` - User feedback storage

### 2. Send Initial Feedback Emails

```bash
# Dry run (preview without sending)
npm run feedback:send:dry-run

# Send to 10 users (default)
npm run feedback:send

# Send to 50 users
npm run feedback:send -- --limit=50
```

**Criteria for eligible users:**
- Completed at least 1 tax calculation
- Subscription tier = 'free' (not paid)
- First calculation was 3-30 days ago
- Haven't been sent a feedback request yet

### 3. Send Reminder Emails

```bash
# Send reminders to users who haven't responded after 5 days
npm run feedback:send:reminders
```

### 4. View Dashboard

```bash
npm run dev
```

Then visit: `http://localhost:3000/admin/calculator-feedback`

## Email Templates

### Initial Email
- **Subject:** "Quick question: What stopped you? (20% discount inside)"
- **Incentive:** 20% discount code (valid 30 days)
- **Main Question:** "What stopped you from purchasing TaxBridge?"
- **Includes:** Discount code, response tracking link

### Reminder Email (5 days later)
- **Subject:** "[Reminder] 20% off + your feedback = better product"
- **Tone:** Shorter, friendlier reminder
- **Includes:** Same discount code

### Thank You Email
- **Subject:** "Thank you for your feedback! 🙏"
- **Content:** Gratitude + discount code reminder

## Feedback Questions

Users are asked:

**Primary Question:**
- What stopped you from purchasing TaxBridge?

**Structured Feedback:**
- Price perception (too expensive, fair, cheap, unsure)
- Missing features
- Competitor considered
- Trust concerns
- Timing reason
- Would consider later? (yes/no)
- Likelihood to purchase (1-10 scale)
- Calculator rating (1-5 stars)
- Testimonial (optional)

## Database Schema

### `discount_codes`
```sql
- code (UNIQUE) - e.g., "FEEDBACK20-A7K9M2"
- user_id
- email
- discount_percent (20)
- valid_from / valid_until (30 days)
- used (boolean)
- created_for ('calculator_feedback')
```

### `calculator_feedback_requests`
```sql
- user_id
- email
- total_calculations
- request_sent_at
- reminder_sent_at
- responded (boolean)
- discount_code
- discount_used (boolean)
```

### `calculator_feedback_responses`
```sql
- user_id
- email
- stopped_reason (free text)
- stopped_reasons_categorized (price, trust, features, timing, alternative, complexity)
- price_perception
- missing_features
- competitor_considered
- trust_concerns
- would_consider_later
- likelihood_to_purchase (1-10)
- calculator_rating (1-5)
- testimonial_text
```

## Analytics & Reporting

### Built-in SQL Views

**Campaign Stats** (`calculator_feedback_campaign_stats`):
```sql
SELECT * FROM calculator_feedback_campaign_stats;
-- Returns: response rate, discount usage, conversion rate
```

**Top Reasons** (`calculator_feedback_top_reasons`):
```sql
SELECT * FROM calculator_feedback_top_reasons;
-- Returns: Top reasons why users didn't convert
```

### Admin Dashboard Metrics

- Total requests sent
- Total responses
- Response rate
- Discounts used
- Discount usage rate
- Response-to-conversion rate
- Reminders sent
- Responses after reminder

### Real-time Feedback Display

- Recent responses (last 20)
- Full feedback details
- Discount code usage
- Would reconsider status
- Calculator ratings

## Campaign Goals

🎯 **Target:** 10 responses
📧 **Initial batch:** 10-50 emails
🔁 **Reminders:** After 5 days
💰 **Discount:** 20% off, valid 30 days

## Expected Results

Based on industry benchmarks:

- **Response rate:** 15-25% (initial + reminder)
- **10 responses from ~50 emails sent**
- **Discount usage rate:** 5-10% (5-10 conversions from 100 responses)
- **Feedback quality:** High (incentivized responses)

## Implementation Files

```
lib/
  email-templates/calculator-feedback.ts     # Email templates
  discount-codes.ts                          # Discount code system
  queries/non-converting-users.ts            # User queries
  db/migrations/021_calculator_feedback.sql  # Database migration

app/
  api/calculator-feedback/route.ts           # API endpoint
  admin/calculator-feedback/page.tsx         # Admin dashboard

scripts/
  send-calculator-feedback-emails.ts         # Automation script
```

## Customization

### Change Discount Amount

Edit `lib/discount-codes.ts`:
```typescript
const prefix = params.discountPercent === 20 ? 'FEEDBACK20' : `DISCOUNT${params.discountPercent}`;
```

### Change Email Copy

Edit `lib/email-templates/calculator-feedback.ts`:
```typescript
const subject = `Quick question: What stopped you? (20% discount inside)`;
```

### Change Eligibility Criteria

Edit `lib/queries/non-converting-users.ts`:
```typescript
getNonConvertingUsers({
  minCalculations: 1,      // Change minimum calculations
  minDaysSinceFirst: 3,    // Change min days
  maxDaysSinceFirst: 30,   // Change max days
  limit: 100,
});
```

## Monitoring

### Check Campaign Performance

```bash
npm run feedback:stats
```

Shows:
- Total sent
- Response rate
- Top reasons for not converting
- Discount usage

### Admin Dashboard

Visit `/admin/calculator-feedback` for:
- Real-time metrics
- Recent responses
- Full feedback details
- Discount code tracking

## Best Practices

1. **Start small:** Send to 10-20 users first, verify everything works
2. **Monitor responses:** Check admin dashboard daily
3. **Read feedback carefully:** Use insights to improve product
4. **Send reminders:** After 5 days for non-responders
5. **Track conversions:** Monitor discount code usage in Stripe
6. **Update email copy:** Based on response rates

## Troubleshooting

### No eligible users found

**Cause:** No users meet the criteria (completed calculator 3-30 days ago, free tier, no feedback request sent)

**Solution:** Adjust criteria in `getNonConvertingUsers()` or wait for more calculator usage

### Emails not sending

**Cause:** Email service not configured in `send-calculator-feedback-emails.ts`

**Solution:** Implement real email service (SendGrid, Resend, etc.) - see TODO comments in script

### Dashboard shows 0 responses

**Cause:** No users have submitted feedback yet

**Solution:** Normal for new campaign - wait for responses to come in

## Revenue Impact

**Expected revenue from 10 responses:**

- If 10% convert with 20% discount (1 conversion): **$63 revenue** ($79 * 0.8)
- If 20% convert (2 conversions): **$126 revenue**
- If 30% convert (3 conversions): **$189 revenue**

**Plus:**
- Qualitative insights to improve product
- Understanding of conversion barriers
- Testimonials from satisfied calculator users
- Potential future conversions from warm leads

## Next Steps

1. ✅ Run database migration
2. ✅ Send initial batch (10-20 users dry run first)
3. ✅ Monitor admin dashboard
4. ✅ Send reminders after 5 days
5. ✅ Analyze top reasons for not converting
6. ✅ Use feedback to improve product
7. ✅ Track discount code conversions in Stripe
8. ✅ Scale up if response rate is good (>15%)

---

**Questions?** Check the code comments or create an issue.
