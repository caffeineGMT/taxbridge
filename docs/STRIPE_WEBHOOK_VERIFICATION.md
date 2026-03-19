# STRIPE WEBHOOK VERIFICATION GUIDE

## Overview

**PURPOSE:** Verify Stripe webhooks work correctly in production to ensure payments, subscriptions, and refunds are processed.

**CRITICAL:** Without working webhooks, payments succeed in Stripe but user accounts don't activate → revenue lost!

**TIMELINE:** 15 minutes
**OUTCOME:** All webhook events return 200 OK and update database correctly

---

## WEBHOOK SETUP CHECKLIST

### Step 1: Create Webhook Endpoint in Stripe

1. Go to: **https://dashboard.stripe.com/webhooks**
2. Click: **"Add endpoint"** button (top right)
3. Fill in webhook details:

   | Field | Value |
   |-------|-------|
   | Endpoint URL | `https://taxbridgecpa.com/api/stripe/webhook` |
   | Description | `TaxBridge Production Webhook` |
   | Version | `Latest API version` (auto-selected) |

4. Click: **"Select events"**

### Step 2: Select Required Events

Enable these 8 events (CRITICAL - don't skip any):

#### Checkout Events
- [ ] `checkout.session.completed` - When user completes payment
- [ ] `checkout.session.expired` - When checkout session expires (24hr timeout)

#### Subscription Events
- [ ] `customer.subscription.created` - New subscription activated
- [ ] `customer.subscription.updated` - Subscription changed (upgrade/downgrade)
- [ ] `customer.subscription.deleted` - Subscription cancelled

#### Invoice Events
- [ ] `invoice.payment_succeeded` - Recurring payment succeeded
- [ ] `invoice.payment_failed` - Recurring payment failed (card declined)

#### Charge Events
- [ ] `charge.refunded` - Payment refunded

5. Click: **"Add events"** → **"Add endpoint"**

### Step 3: Get Webhook Signing Secret

6. After creating endpoint, you'll see the endpoint details page
7. Click: **"Signing secret"** section → **"Reveal"**
8. Copy the secret: `whsec_...` (64+ characters)
9. **SAVE THIS SECRET** - you'll need it for environment variables

---

## ENVIRONMENT VARIABLE SETUP

### Update Vercel Production Environment

1. Go to: **https://vercel.com/your-project/settings/environment-variables**
2. Add or update:

   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_SECRET_FROM_STEP_3
   ```

3. Environment: **Production** ✅
4. Click: **"Save"**
5. Redeploy: **Settings → Deployments → Redeploy** (or push to GitHub)

### Update Local .env.production (optional, for reference)

6. Edit: `.env.production`
7. Update line:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_SECRET
   ```
8. **DO NOT COMMIT** this file with real secrets!

---

## WEBHOOK VERIFICATION

### Test Webhook Endpoint Manually

#### Option 1: Use Stripe CLI (Recommended)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Trigger test events:
   ```bash
   # Test checkout.session.completed
   stripe trigger checkout.session.completed --api-key sk_live_YOUR_KEY

   # Test subscription.created
   stripe trigger customer.subscription.created --api-key sk_live_YOUR_KEY

   # Test invoice.payment_succeeded
   stripe trigger invoice.payment_succeeded --api-key sk_live_YOUR_KEY
   ```

4. **Verify response:**
   - Expected: `webhook received: 200 OK`
   - If error: Check webhook URL, secret, and code

#### Option 2: Use Stripe Dashboard

1. Go to: **Stripe Dashboard → Webhooks**
2. Click on your webhook endpoint
3. Click: **"Send test webhook"** button
4. Select event: `checkout.session.completed`
5. Click: **"Send test webhook"**
6. **Check response:**
   - Status: **200 OK** ✅
   - Response time: <2 seconds
   - Response body: `{"received": true}` or similar

7. Repeat for all 8 events

---

## VERIFY WEBHOOK CODE

### Check Webhook Handler Exists

1. Verify file exists: `/app/api/stripe/webhook/route.ts`
2. Check it exports a POST handler:
   ```typescript
   export async function POST(req: Request) {
     // Webhook handling logic
   }
   ```

### Verify Webhook Signature Validation

3. Check code validates Stripe signature:
   ```typescript
   const signature = headers().get('stripe-signature');
   const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

   const event = stripe.webhooks.constructEvent(
     body,
     signature,
     webhookSecret
   );
   ```

4. **CRITICAL:** If signature validation is missing or commented out, webhooks are NOT secure!

### Verify Event Handling

5. Check code handles all 8 required events:
   ```typescript
   switch (event.type) {
     case 'checkout.session.completed':
       // Handle checkout completion
       break;
     case 'customer.subscription.created':
       // Handle subscription creation
       break;
     case 'customer.subscription.updated':
       // Handle subscription update
       break;
     case 'customer.subscription.deleted':
       // Handle subscription cancellation
       break;
     case 'invoice.payment_succeeded':
       // Handle recurring payment success
       break;
     case 'invoice.payment_failed':
       // Handle payment failure
       break;
     case 'charge.refunded':
       // Handle refund
       break;
     default:
       console.log(`Unhandled event: ${event.type}`);
   }
   ```

6. **CRITICAL:** Missing event handlers = lost revenue!

---

## PRODUCTION WEBHOOK MONITORING

### Real-Time Monitoring (First 24 hours)

1. **Open Stripe Dashboard → Webhooks → Your endpoint**
2. Monitor **"Recent events"** section
3. Watch for:
   - All events showing **200 OK** ✅
   - Response time <3 seconds
   - No 4xx or 5xx errors

### Set Up Alerts

4. **Enable Stripe email notifications:**
   - Go to: **Settings → Notifications → Developers**
   - Enable: **"Webhook failures"** ✅
   - Your email will get alerts for 4xx/5xx webhook errors

5. **Set up Sentry alerts (optional):**
   - Webhooks endpoint should log errors to Sentry
   - Create alert: "Webhook error rate >1% in 5min window"

### Weekly Health Check

6. **Every Monday, check webhook health:**
   - Stripe Dashboard → Webhooks → Your endpoint
   - Click: **"Logs"** tab
   - Filter: Last 7 days
   - Verify:
     - Success rate: >99.5% ✅
     - Average response time: <2 seconds ✅
     - No recurring errors ✅

---

## TROUBLESHOOTING WEBHOOK ISSUES

### Issue: Webhook returns 401 Unauthorized

**Cause:** Webhook secret mismatch

**Fix:**
1. Get current secret: Stripe Dashboard → Webhooks → Click endpoint → Signing secret → Reveal
2. Compare with Vercel env var: `STRIPE_WEBHOOK_SECRET`
3. If different, update Vercel env var
4. Redeploy production
5. Retry webhook: Stripe Dashboard → Webhooks → Recent events → Click failed event → "Resend"

### Issue: Webhook returns 500 Internal Server Error

**Cause:** Code error in webhook handler

**Debug steps:**
1. Click failed webhook event → View request/response
2. Check response body for error message
3. Check Sentry or server logs for stack trace
4. Common causes:
   - Database connection failed
   - Missing environment variable
   - Prisma schema mismatch
   - JSON parse error

**Fix:**
1. Fix code error
2. Redeploy
3. Resend webhook event to verify fix

### Issue: Webhook succeeds (200 OK) but database not updated

**Cause:** Silent error in event handler

**Debug steps:**
1. Check webhook handler code for event type
2. Verify database update logic runs
3. Add logging: `console.log('Updating user:', userId)`
4. Check database directly:
   ```sql
   SELECT * FROM user_profiles WHERE stripe_customer_id = 'cus_XXX';
   ```

**Fix:**
1. Add error handling around database operations
2. Add logging for debugging
3. Test with Stripe CLI: `stripe trigger checkout.session.completed`

### Issue: Webhook timeout (>30 seconds)

**Cause:** Webhook handler doing too much work

**Fix:**
1. Move heavy operations (email sending, AI calls) to background queue
2. Webhook should only:
   - Validate signature
   - Parse event
   - Update database
   - Return 200 OK immediately
3. Use Vercel queue or background jobs for slow operations

### Issue: Duplicate webhook events

**Cause:** Stripe retries failed webhooks

**Expected behavior:**
- Stripe retries failed webhooks (4xx, 5xx) up to 3 days
- Your code should be idempotent (safe to run multiple times)

**Fix:**
1. Check for duplicate events using `event.id`:
   ```typescript
   const existingEvent = await db.webhookEvent.findUnique({
     where: { stripe_event_id: event.id }
   });
   if (existingEvent) {
     return new Response('Event already processed', { status: 200 });
   }
   ```

2. Use database transactions for atomic updates
3. Log event processing: `console.log('Processing event:', event.id)`

---

## WEBHOOK SECURITY BEST PRACTICES

### 1. Always Validate Signature

✅ **REQUIRED:** Verify `stripe-signature` header
```typescript
const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
```

❌ **NEVER** skip signature validation in production!

### 2. Use HTTPS Only

✅ Webhook URL: `https://taxbridgecpa.com/api/stripe/webhook`
❌ Never: `http://...` (not secure)

### 3. Rotate Webhook Secret Quarterly

1. Create new webhook endpoint with new secret
2. Update production env vars
3. Delete old endpoint after 24 hours

### 4. Log Webhook Events

```typescript
console.log('Webhook received:', {
  type: event.type,
  id: event.id,
  timestamp: new Date().toISOString()
});
```

### 5. Monitor Webhook Failures

- Set up alerts for >5 failures in 1 hour
- Investigate immediately
- Webhooks are CRITICAL for revenue!

---

## WEBHOOK EVENT FLOW DIAGRAM

```
User clicks "Subscribe" ($79/year)
  ↓
Stripe Checkout Page
  ↓
Payment Succeeds
  ↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WEBHOOK EVENT 1: checkout.session.completed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Stripe → POST https://taxbridgecpa.com/api/stripe/webhook
  ↓
Your Code:
  1. Validate signature ✅
  2. Parse event
  3. Get customer ID from event.data
  4. Update database: subscription_status = 'active'
  5. Return 200 OK
  ↓
User sees success page ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

30 days later...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WEBHOOK EVENT 2: invoice.payment_succeeded
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Stripe → POST https://taxbridgecpa.com/api/stripe/webhook
  ↓
Your Code:
  1. Validate signature ✅
  2. Send email: "Payment succeeded - thanks!"
  3. Log revenue in analytics
  4. Return 200 OK
  ↓
User gets email ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

User clicks "Cancel Subscription"
  ↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WEBHOOK EVENT 3: customer.subscription.deleted
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Stripe → POST https://taxbridgecpa.com/api/stripe/webhook
  ↓
Your Code:
  1. Validate signature ✅
  2. Update database: subscription_status = 'canceled'
  3. Send exit survey email
  4. Return 200 OK
  ↓
User subscription cancelled ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## SUCCESS CRITERIA

Before marking webhooks LIVE, verify:

- [ ] Webhook endpoint created at `https://taxbridgecpa.com/api/stripe/webhook`
- [ ] All 8 required events enabled
- [ ] Signing secret saved in Vercel env vars
- [ ] Test webhook returns 200 OK for all event types
- [ ] Signature validation code is active (not commented out)
- [ ] All event types handled in switch statement
- [ ] Database updates successfully on test webhook
- [ ] Webhook logs show <2 second response time
- [ ] Email notifications enabled for webhook failures
- [ ] No 4xx or 5xx errors in last 24 hours

**ALL ✅ → Webhooks are LIVE and production-ready! 🎉**

---

## MONITORING DASHBOARD

Track these metrics weekly:

| Metric | Target | Current |
|--------|--------|---------|
| Webhook success rate | >99.5% | ___% |
| Average response time | <2 seconds | ___s |
| Failed webhooks (7 days) | 0 | ___ |
| Duplicate events prevented | N/A | ___ |
| Database update success | 100% | ___% |

**Review every Monday at 9am PT**

---

## WEBHOOK CHECKLIST FOR CTO

**Estimated Time:** 15 minutes

- [ ] **Step 1:** Create webhook endpoint in Stripe Dashboard (3 min)
- [ ] **Step 2:** Select 8 required events (2 min)
- [ ] **Step 3:** Copy webhook signing secret (1 min)
- [ ] **Step 4:** Update Vercel env var `STRIPE_WEBHOOK_SECRET` (2 min)
- [ ] **Step 5:** Redeploy production (2 min)
- [ ] **Step 6:** Send test webhook from Stripe Dashboard (3 min)
- [ ] **Step 7:** Verify 200 OK response (1 min)
- [ ] **Step 8:** Enable email notifications for failures (1 min)

**DONE? → Webhooks are production-ready! ✅**
