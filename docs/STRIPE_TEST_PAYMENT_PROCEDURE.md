# Test Payment Procedure - $1 Checkout Test

## Overview
This test verifies that Stripe production mode is working correctly by:
1. Completing a real checkout with Stripe test card
2. Verifying webhook events are processed
3. Immediately refunding the test payment

**IMPORTANT:** Use Stripe test card 4242 4242 4242 4242, NOT a real card!

## Prerequisites
✅ All environment variables set in Vercel
✅ Production deployed with latest env vars
✅ Stripe webhook configured
✅ Webhook secret added to Vercel

## Step-by-Step Test Procedure

### 1. Open Production Pricing Page
```
URL: https://taxbridge.vercel.app/pricing
```

- Screenshot the pricing page
- Save as: docs/screenshots/test-payment/01-pricing-page.png

### 2. Click "Subscribe to Pro - $79/year"
- Should redirect to Stripe Checkout
- Screenshot the Stripe Checkout page
- Save as: docs/screenshots/test-payment/02-stripe-checkout.png

### 3. Fill Out Checkout Form
Email: test@example.com
Card number: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123
ZIP: 12345

**CRITICAL:** DO NOT use a real card! Only use 4242 4242 4242 4242

### 4. Complete Payment
- Click "Subscribe"
- Wait for redirect back to site
- Screenshot the success page
- Save as: docs/screenshots/test-payment/03-success-page.png

### 5. Verify Stripe Dashboard
Open: https://dashboard.stripe.com/payments

- Verify payment appears with status "Succeeded"
- Amount should be $79.00
- Screenshot the payment
- Save as: docs/screenshots/test-payment/04-stripe-payment.png

### 6. Verify Webhook Events
Open: https://dashboard.stripe.com/webhooks

- Click on your webhook endpoint
- Check "Recent events" tab
- Verify 3+ events with "200 OK" status:
  - checkout.session.completed
  - customer.subscription.created
  - invoice.payment_succeeded
- Screenshot the webhook events
- Save as: docs/screenshots/test-payment/05-webhook-events.png

### 7. Check Database (Optional)
```bash
# If you have database access
npm run db:check-subscription -- --email=test@example.com
```

- Verify user's subscription_tier is "pro"
- Verify subscription_status is "active"

### 8. REFUND THE TEST PAYMENT
**CRITICAL:** Refund within 5 minutes to avoid any charges!

Open: https://dashboard.stripe.com/payments

1. Click the test payment ($79.00)
2. Click "Refund" button (top right)
3. Select "Full refund"
4. Click "Refund $79.00"
5. Verify status changes to "Refunded"
6. Screenshot the refund confirmation
7. Save as: docs/screenshots/test-payment/06-refund-confirmation.png

### 9. Verify Refund Webhook
Open: https://dashboard.stripe.com/webhooks

- Click on your webhook endpoint
- Verify new event: charge.refunded → 200 OK
- Screenshot the refund webhook event
- Save as: docs/screenshots/test-payment/07-refund-webhook.png

## Success Criteria Checklist

- [ ] Pricing page loaded successfully
- [ ] Stripe Checkout redirected correctly
- [ ] Test card payment succeeded
- [ ] Stripe Dashboard shows payment ($79.00 Succeeded)
- [ ] Webhook events show 3+ events with 200 OK
- [ ] Database updated (subscription_tier=pro)
- [ ] Refund processed successfully
- [ ] Refund webhook received (charge.refunded → 200 OK)
- [ ] All 7 screenshots captured

## If Test Fails

### Payment doesn't complete
- Check: Are you in Production mode (not Test mode)?
- Check: Did you use test card 4242 4242 4242 4242?
- Check: Are environment variables set in Vercel?

### Webhook events show errors (4xx/5xx)
- Check: Is webhook secret set in Vercel?
- Check: Is production deployed with latest env vars?
- Check: Check Vercel logs for webhook errors

### Refund fails
- Check: Is payment status "Succeeded" (not "Pending")?
- Wait 30 seconds and try again
- Contact Stripe support if issue persists

## Post-Test Actions

1. **Delete test customer** (optional):
   - Open: https://dashboard.stripe.com/customers
   - Find test@example.com
   - Click "..." → Delete customer

2. **Document results**:
   - Create verification report: docs/STRIPE_TEST_PAYMENT_RESULTS.md
   - Include all 7 screenshots
   - Note any issues encountered
   - Confirm all success criteria met

3. **Update task tracker**:
   - Mark task as complete
   - Link to verification report
   - Include screenshot evidence

## Timeline
- Test payment: 5 minutes
- Verification: 3 minutes
- Refund: 2 minutes
- Documentation: 5 minutes
**Total: 15 minutes**

## Support
- Stripe test cards: https://stripe.com/docs/testing
- Webhook troubleshooting: docs/STRIPE_WEBHOOK_VERIFICATION.md
- General setup: docs/STRIPE_PRODUCTION_EXECUTIVE_SUMMARY.md