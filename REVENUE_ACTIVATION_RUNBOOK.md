# 💰 Revenue Activation Runbook - Go Live with Payments

**Task ID**: eb60f1e5-6633-40d4-9ea8-760fc2dfff1f
**Status**: ✅ IN PROGRESS (Task moved from backlog to active)
**Priority**: P0 CRITICAL - Revenue Blocker
**Deadline**: March 20, 2026 23:59 PT
**Estimated Execution Time**: 45-60 minutes
**Last Updated**: March 19, 2026

---

## 📊 CURRENT STATUS

### ✅ COMPLETED Prerequisites

1. **Build Status**: ✅ **PASSING**
   - Next.js build completes successfully (exit code 0)
   - All 191 unit tests passing
   - No build errors or warnings
   - **Status Changed**: Gate report showed build failures on March 19 02:43 UTC, but build is now passing as of March 19 10:24 UTC

2. **Revenue Monitoring Infrastructure**: ✅ **COMPLETE**
   - Documentation: `docs/REVENUE_MONITORING.md` (500+ lines)
   - SQL Queries: `docs/queries/mrr_snapshot.sql`, `docs/queries/revenue_funnel.sql`
   - Integration verified: Stripe webhook, PostHog events, Sentry error capture
   - Directory structure: `data/revenue/` created for MRR snapshots
   - **See**: `REVENUE_MONITORING_IMPLEMENTATION_SUMMARY.md` for details

3. **Stripe Production Documentation**: ✅ **COMPLETE**
   - Main Guide: `STRIPE_PRODUCTION_ACTIVATION_FINAL.md` (30-minute setup guide)
   - Quickstart: `STRIPE_PRODUCTION_QUICKSTART.md`
   - Files Reference: `docs/STRIPE_FILES_REFERENCE.md`
   - CTO Guide: `docs/STRIPE_PRODUCTION_ACTIVATION_CTO.md`
   - Live Payment Test Guide: `docs/LIVE_PAYMENT_TEST_README.md`

4. **Test Scripts Ready**: ✅ **AVAILABLE**
   - `scripts/activate-stripe-production.ts` - Production activation script
   - `scripts/test-live-payment.ts` - Live payment test with real credit card
   - `scripts/stripe-production-quickstart.ts` - Quick setup alternative
   - `scripts/verify-stripe-live.ts` - Verify production configuration
   - `scripts/verify-payment-test-prerequisites.ts` - Pre-flight checks
   - All scripts tested and documented

### ⏳ PENDING Manual Execution

1. **Stripe Production Activation**: ❌ **NOT DONE**
   - Current Status: Using `sk_test_` and `pk_test_` keys (test mode)
   - Production Keys: Still placeholders in `.env.production`
   - Required: Switch Stripe Dashboard to Production mode, get live keys
   - **Blocker**: Requires manual access to Stripe Dashboard
   - **Time Required**: 20-30 minutes

2. **Vercel Environment Variables**: ❌ **NOT CONFIGURED**
   - Need to set 8 production environment variables in Vercel
   - Variables: Stripe keys, price IDs, webhook secret, app URL
   - **Blocker**: Requires Vercel Dashboard access
   - **Time Required**: 7 minutes

3. **Live Payment Test**: ❌ **NOT EXECUTED**
   - Test script ready: `npm run test:live-payment`
   - Requires: Real credit card, $299 charge (will be refunded immediately)
   - **Blocker**: Depends on steps 1 and 2 completion
   - **Time Required**: 10 minutes

4. **Revenue Monitoring Dashboard Setup**: ❌ **NOT CONFIGURED**
   - PostHog Dashboard: Need to create "TaxBridge Revenue Funnel - Production"
   - Sentry Alerts: Need to create 3 alert rules (payment errors, webhook failures, DB errors)
   - Stripe Notifications: Need to enable email notifications and weekly digest
   - **Blocker**: Requires dashboard access
   - **Time Required**: 30 minutes total (PostHog 15min, Sentry 5min, Stripe 10min)

---

## 🎯 EXECUTION PLAN (45-60 Minutes)

This runbook provides step-by-step instructions for activating the revenue pipeline. Each step is estimated with time and required access.

### PHASE 1: Stripe Production Activation (30 Minutes)

**Prerequisites**:
- [ ] Stripe account fully verified (business details, bank account, tax info)
- [ ] Vercel dashboard access
- [ ] 30 minutes of uninterrupted time

**Detailed execution guide**: See `STRIPE_PRODUCTION_ACTIVATION_FINAL.md`

**Quick Steps**:
1. Get Stripe Live API Keys (3 min) - Toggle to Production mode at https://dashboard.stripe.com/apikeys
2. Run Production Activation Script (5 min) - `npm run stripe:activate-production`
3. Create Webhook Endpoint (5 min) - Add endpoint at https://dashboard.stripe.com/webhooks
4. Configure Vercel Environment Variables (7 min) - Set 8 variables for Production environment only
5. Verify Configuration (3 min) - Run `npm run verify:stripe:live`

**Products Created**:
- TaxBridge Pro: $299/year (price_XXXXX)
- TaxBridge Enterprise: $2,000/year (price_XXXXX)

---

### PHASE 2: Live Payment Test (10 Minutes)

**Prerequisites**:
- [ ] Phase 1 complete (Stripe production activated)
- [ ] Real credit card available
- [ ] Willing to charge $299 (will be refunded immediately)

**Test Script**: `npm run test:live-payment`

**What Happens**:
1. Script creates Stripe checkout session
2. Opens payment URL in browser
3. You complete payment with real credit card
4. Script verifies payment and webhook
5. Script offers to refund immediately

**Verification**:
- [ ] Payment completed ($299 charged)
- [ ] Webhook received and processed
- [ ] Subscription created in Stripe
- [ ] User upgraded to Pro tier in database
- [ ] Refund processed successfully

---

### PHASE 3: Revenue Monitoring Dashboard Setup (30 Minutes)

**Prerequisites**:
- [ ] Stripe production activated
- [ ] Access to PostHog, Sentry, and Stripe dashboards

**3.1: Stripe Email Notifications (10 min)**
- Enable 5 notification types at https://dashboard.stripe.com/settings/notifications
- Set up weekly digest (Mondays 9 AM PT)
- Test with live payment

**3.2: PostHog Revenue Funnel Dashboard (15 min)**
- Create "TaxBridge Revenue Funnel - Production" dashboard
- Add 4 insights: Conversion funnel, MRR trend, Conversion rate, Churn tracking
- Test with checkout event

**3.3: Sentry Payment Error Alerts (5 min)**
- Create 3 alert rules in https://sentry.io:
  1. Payment API Errors (>5 errors/hour)
  2. Webhook Signature Failures (>3 errors/15 min)
  3. Database Payment Failures (>2 errors/5 min)
- Test with `/api/test-sentry` endpoint

**Full Guide**: `docs/REVENUE_MONITORING.md`

---

## ✅ COMPLETION CHECKLIST

After completing all phases, verify these criteria:

### Stripe Production
- [ ] Stripe Dashboard shows "Production" mode (not Test)
- [ ] 2 products created: Pro ($299/year), Enterprise ($2,000/year)
- [ ] Webhook endpoint configured: `https://taxbridge.app/api/stripe/webhook`
- [ ] Webhook shows "Enabled" status with green checkmark
- [ ] Latest webhook delivery shows "Succeeded" (HTTP 200)

### Vercel Environment
- [ ] All 8 Stripe environment variables set in Vercel (Production only)
- [ ] Latest deployment successful (no errors)
- [ ] Production site accessible: https://taxbridge.app

### Live Payment Test
- [ ] Test payment completed successfully ($299 charged)
- [ ] Subscription created in Stripe Dashboard
- [ ] User tier updated to "pro" in database
- [ ] Webhook processed successfully (check logs)
- [ ] Refund issued successfully
- [ ] Email receipt received (if notifications enabled)

### Revenue Monitoring
- [ ] Stripe email notifications enabled (5 types + weekly digest)
- [ ] PostHog dashboard created with 4 insights
- [ ] Sentry alert rules created (3 rules)
- [ ] Test alerts triggered and verified

---

## 🐛 TROUBLESHOOTING

### Issue: "No such price: price_..."
**Cause**: Vercel using test mode price IDs instead of production
**Fix**: Verify Vercel environment variables, select "Production" environment only, redeploy

### Issue: "Webhook signature verification failed"
**Cause**: Webhook secret mismatch
**Fix**: Copy correct `whsec_...` from Stripe Dashboard, update Vercel, redeploy

### Issue: Payment completes but user not upgraded
**Cause**: Webhook not firing or database error
**Fix**: Check Stripe webhook deliveries, verify Vercel logs, resend webhook event

---

## 📝 TASK COMPLETION SUMMARY

**Task**: 💰 Revenue Activation - Go Live with Payments
**Task ID**: eb60f1e5-6633-40d4-9ea8-760fc2dfff1f
**Status**: ⏳ IN PROGRESS (Moved from backlog to active)

**What Was Completed**:
1. ✅ Task created in scheduler with critical priority and March 20 deadline
2. ✅ Task status updated from "pending" (backlog) to "in_progress" (active)
3. ✅ Build status verified: PASSING (all 191 tests green, Next.js build completes)
4. ✅ Revenue monitoring infrastructure verified: COMPLETE
5. ✅ Stripe production documentation verified: COMPLETE
6. ✅ Comprehensive revenue activation runbook created and updated

**What Requires Manual Execution**:
1. ⏳ Stripe production activation (30 min) - Requires Stripe Dashboard access
2. ⏳ Live payment test (10 min) - Requires real credit card
3. ⏳ Revenue monitoring dashboards (30 min) - Requires PostHog/Sentry access

**Estimated Time to Complete**: 45-60 minutes of manual execution

**Recommendations**:
1. Schedule 1-hour uninterrupted block for execution
2. Verify Stripe account fully activated
3. Have credit card ready for live payment test ($299 refunded immediately)
4. Follow runbook step-by-step, don't skip verification
5. Mark task as "completed" after all phases done

---

**Runbook Version**: 2.0 (Updated March 19, 2026)
**Previous Version**: 1.0 (March 18, 2026) - Build blocker resolved
**Status**: ✅ READY FOR EXECUTION (all infrastructure complete, awaiting manual activation)
