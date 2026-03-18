# CTO Task Assignments

## Critical Priority

### Implement Revenue Monitoring with Stripe Dashboard + PostHog + Sentry Alerts
**Assigned**: 2026-03-18
**Deadline**: 2026-03-25
**Priority**: CRITICAL
**Status**: Pending

**Context**: Critical to track live payments once testing completes. This is a production revenue monitoring system for real paying customers.

**Deliverables**:

1. **Stripe Revenue Dashboard**
   - Real-time MRR (Monthly Recurring Revenue) tracking
   - Daily revenue trends with line charts
   - Active subscription count
   - Churn rate calculation
   - Conversion rate (free → paid)
   - ARPU (Average Revenue Per User)
   - Revenue breakdown by plan (monthly/annual if applicable)

2. **PostHog Integration**
   - Track critical payment events:
     * checkout_started
     * checkout_completed
     * checkout_failed
     * subscription_created
     * subscription_cancelled
   - User journey funnels from landing → trial → payment
   - Cohort analysis for retention tracking
   - Attribution tracking (UTM params → conversion)

3. **Sentry Alerts**
   - Critical payment failure alerts
   - Webhook processing errors
   - Stripe API timeout/error monitoring
   - Daily revenue anomaly detection (>20% drop triggers alert)
   - Failed charge notifications

4. **Admin Dashboard** (/admin/revenue)
   - Protected route with authentication
   - Auto-refresh every 60 seconds
   - Export data to CSV
   - Date range filtering

5. **Alerting Rules**
   - Slack/Email notification on payment failures
   - Daily revenue summary to CTO
   - Alert if MRR drops >10% week-over-week
   - Notify on first successful payment milestone

**Technical Requirements**:
- Stripe webhooks properly configured and tested
- PostHog SDK integrated in frontend + backend
- Sentry configured with payment transaction tracking
- All API keys stored in environment variables
- Dashboard secured with admin auth
- Performance: dashboard loads <2s

**Acceptance Criteria**:
- ✅ Dashboard shows live Stripe data
- ✅ PostHog tracks all payment events
- ✅ Sentry alerts fire on payment failures
- ✅ Revenue metrics accurate vs Stripe dashboard
- ✅ Alerts delivered within 5 minutes of event
- ✅ End-to-end tested with real payment flow

**Target**: Production-ready monitoring before first paid customer.

**Tags**: revenue, monitoring, stripe, posthog, sentry, dashboard, cto, production, critical-path

---

*This task is tracked in MetaClaw scheduler (ID: f84cb621)*
