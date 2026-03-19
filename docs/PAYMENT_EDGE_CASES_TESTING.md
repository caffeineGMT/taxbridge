/**
 * Payment Edge Cases Testing Guide
 * Complete guide for testing all payment flow edge cases
 */

# Payment Edge Cases - Testing Guide

This document outlines how to test all payment edge cases in both test and production environments.

## Setup

1. **Stripe Test Mode**
   - Use test API keys: `sk_test_...` and `pk_test_...`
   - Test cards available at: https://stripe.com/docs/testing

2. **Environment Variables**
   ```bash
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## Edge Case 1: Card Declined Scenarios

### Test Cards for Different Decline Reasons

1. **Generic Decline**
   - Card: `4000000000000002`
   - Expected: User sees "Card declined by your bank" message with retry option

2. **Insufficient Funds**
   - Card: `4000000000009995`
   - Expected: "Your card has insufficient funds" with suggestion to use different card

3. **Expired Card**
   - Card: `4000000000000069`
   - Expected: "Your card has expired" with suggestion to update card details

4. **Incorrect CVC**
   - Card: `4000000000000127`
   - Expected: "The security code (CVC) you entered is incorrect"

5. **Processing Error**
   - Card: `4000000000000119`
   - Expected: "Temporary problem processing your card" with retry suggestion

### Testing Steps

1. Go to `/pricing` page
2. Click "Start 14-Day Free Trial" for Pro plan
3. Enter test card number
4. Verify error message is user-friendly
5. Verify retry button appears
6. Verify error is logged to Sentry
7. Verify PostHog event tracks failure reason

### Expected Behavior

- ✅ User sees clear, non-technical error message
- ✅ Suggested action is provided
- ✅ Retry button is available (when applicable)
- ✅ Error is logged with full context
- ✅ User is NOT charged

## Edge Case 2: Webhook Failures & Retry Logic

### Test Webhook Deduplication

1. **Simulate Duplicate Event**
   ```bash
   # Send same webhook event twice
   stripe trigger checkout.session.completed
   stripe trigger checkout.session.completed # same event ID
   ```

2. **Expected Behavior**
   - First event: Processes normally, updates database
   - Second event: Returns 200 but logs "duplicate event"
   - Database: NO duplicate entries created
   - Webhook events table: Shows retry_count = 1

### Test Webhook Retry Scenarios

1. **Temporary Database Error**
   - Simulate by disconnecting DB during webhook processing
   - Stripe will retry with exponential backoff
   - Once DB is back, webhook should process successfully

2. **Verification**
   ```sql
   SELECT * FROM webhook_events WHERE event_type = 'checkout.session.completed' ORDER BY created_at DESC LIMIT 10;
   ```

### Expected Behavior

- ✅ No duplicate subscription activations
- ✅ Idempotency maintained across retries
- ✅ All webhook events logged in `webhook_events` table
- ✅ Retry count tracked accurately

## Edge Case 3: Partial Refunds

### Test Full Refund

1. **Create Test Subscription**
   ```bash
   # Via UI: Complete checkout with test card 4242424242424242
   ```

2. **Issue Full Refund**
   ```bash
   curl -X POST http://localhost:3000/api/stripe/refund \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
     -d '{
       "chargeId": "ch_xxxxx",
       "reason": "requested_by_customer"
     }'
   ```

3. **Verify**
   - Check Stripe dashboard: Charge shows as "Refunded"
   - Check database: `refunds` table has entry
   - Check user account: Subscription status updated
   - Check email: Refund confirmation sent

### Test Partial Refund

1. **Issue Partial Refund ($10 of $49)**
   ```bash
   curl -X POST http://localhost:3000/api/stripe/refund \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
     -d '{
       "chargeId": "ch_xxxxx",
       "amount": 10.00,
       "reason": "customer_dispute",
       "metadata": {
         "dispute_id": "123",
         "reason_details": "Partial service delivered"
       }
     }'
   ```

2. **Verify**
   - Refund amount: $10.00
   - Remaining charge: $39.00
   - Subscription: Still active
   - Analytics: Tracks partial refund event

### Expected Behavior

- ✅ Full refunds: Complete refund processed
- ✅ Partial refunds: Only specified amount refunded
- ✅ Cannot refund more than available balance
- ✅ Refund tracked in database and analytics
- ✅ User receives refund confirmation

## Edge Case 4: Subscription Cancellation Flow

### Test Immediate Cancellation

1. **Cancel Now**
   ```bash
   curl -X POST http://localhost:3000/api/stripe/cancel-subscription \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
     -d '{
       "immediate": true,
       "feedback": {
         "reason": "too_expensive",
         "comments": "Not enough value for the price",
         "satisfaction": 3,
         "wouldRecommend": false
       }
     }'
   ```

2. **Verify**
   - Subscription status: `canceled` immediately
   - User tier: Downgraded to `free` immediately
   - Feedback: Stored in `cancellation_feedback` table
   - Email: Cancellation confirmation sent
   - Analytics: Tracks cancellation with reason

### Test End-of-Period Cancellation

1. **Cancel at Period End**
   ```bash
   curl -X POST http://localhost:3000/api/stripe/cancel-subscription \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
     -d '{
       "immediate": false,
       "feedback": {
         "reason": "switching_to_competitor",
         "comments": "Found a better alternative"
       }
     }'
   ```

2. **Verify**
   - Subscription status: `canceling`
   - User tier: Remains `pro` until period end
   - Access: Full Pro features until `current_period_end`
   - Email: Shows exact date when downgrade happens

### Expected Behavior

- ✅ Immediate: Access removed immediately
- ✅ End-of-period: Access maintained until billing date
- ✅ Feedback collected and stored
- ✅ Cancellation email sent
- ✅ Webhook `customer.subscription.deleted` processes correctly
- ✅ User downgraded to free tier on schedule

## Edge Case 5: Invoice Email Delivery Verification

### Test Invoice Email Tracking

1. **Trigger Invoice Creation**
   ```bash
   # Create subscription - invoice is auto-generated
   stripe trigger customer.subscription.created
   ```

2. **Monitor Webhook Events**
   - `invoice.finalized`: Invoice created, stored in DB
   - `invoice.payment_succeeded`: Payment successful
   - `invoice.payment_failed`: Payment failed, retry email sent

3. **Verify Invoice Tracking**
   ```sql
   SELECT
     i.stripe_invoice_id,
     i.status,
     i.amount_due,
     i.hosted_url,
     i.created_at,
     up.email
   FROM invoices i
   JOIN user_profiles up ON i.user_id = up.id
   ORDER BY i.created_at DESC;
   ```

### Test Payment Failed Email Delivery

1. **Trigger Payment Failure**
   ```bash
   stripe trigger invoice.payment_failed
   ```

2. **Verify Email Sent**
   - Check Resend dashboard for delivery status
   - Check email content: Shows amount due, attempt count, urgency
   - Check database: Invoice status = `open`
   - Check user account: Status = `past_due`

### Expected Behavior

- ✅ `invoice.finalized`: Stored in database
- ✅ `invoice.payment_succeeded`: Status updated, analytics tracked
- ✅ `invoice.payment_failed`: Email sent with retry instructions
- ✅ Email delivery tracked in Resend dashboard
- ✅ Failed invoices trigger appropriate urgency levels

## Production Testing Checklist

Before launching payment flows in production:

- [ ] All test cards work correctly in test mode
- [ ] Webhook endpoint is publicly accessible
- [ ] Webhook secret is configured in environment
- [ ] Stripe webhook events are being logged
- [ ] Sentry is receiving error reports
- [ ] PostHog is tracking payment events
- [ ] Email notifications are being sent
- [ ] Refund API requires admin authentication
- [ ] All database tables exist (invoices, refunds, webhook_events, cancellation_feedback)
- [ ] Rate limiting is enabled on all payment endpoints
- [ ] SSL certificate is valid
- [ ] STRIPE_SECRET_KEY uses `sk_live_...` in production
- [ ] Test subscriptions are cleaned up

## Monitoring

### Key Metrics to Track

1. **Payment Success Rate**
   ```sql
   SELECT
     COUNT(*) as total_attempts,
     SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as successful,
     (SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as success_rate
   FROM user_profiles
   WHERE subscription_tier != 'free';
   ```

2. **Card Decline Rate**
   - Track via PostHog: `payment_failed` events
   - Filter by decline reason
   - Monitor trends over time

3. **Webhook Retry Rate**
   ```sql
   SELECT
     event_type,
     AVG(retry_count) as avg_retries,
     MAX(retry_count) as max_retries
   FROM webhook_events
   WHERE created_at > strftime('%s', 'now', '-7 days')
   GROUP BY event_type;
   ```

4. **Refund Rate**
   ```sql
   SELECT
     COUNT(*) as total_refunds,
     SUM(amount) / 100.0 as total_refunded_usd
   FROM refunds
   WHERE created_at > strftime('%s', 'now', '-30 days');
   ```

5. **Cancellation Rate**
   ```sql
   SELECT
     reason,
     COUNT(*) as count,
     AVG(satisfaction_score) as avg_satisfaction
   FROM cancellation_feedback
   WHERE created_at > strftime('%s', 'now', '-30 days')
   GROUP BY reason;
   ```

### Alerts

Set up Sentry alerts for:
- Payment processing errors (> 5% error rate)
- Webhook failures (> 10 failures in 1 hour)
- Refund API abuse (> 10 refunds in 1 hour)
- Database connection errors during checkout

## Support Playbook

### User Reports: "My card was declined"

1. Check Stripe dashboard for decline reason
2. Provide user-friendly explanation
3. Suggest specific action based on decline code
4. Offer alternative payment methods if applicable

### User Reports: "I was charged twice"

1. Check `webhook_events` table for duplicate processing
2. Verify deduplication logic worked
3. If duplicate charge exists, issue immediate refund
4. File bug report with event IDs

### User Reports: "I canceled but still have access"

1. Check `subscription_status` in database
2. Verify if immediate or end-of-period cancellation
3. Check `current_period_end` date
4. Explain access timeline

## Testing Tools

- **Stripe CLI**: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- **Stripe Dashboard**: https://dashboard.stripe.com/test/payments
- **Webhook Tester**: https://webhook.site/
- **Resend Dashboard**: https://resend.com/emails (email delivery)

## References

- Stripe Testing Guide: https://stripe.com/docs/testing
- Webhook Best Practices: https://stripe.com/docs/webhooks/best-practices
- Error Codes: https://stripe.com/docs/error-codes
- Decline Codes: https://stripe.com/docs/declines/codes
