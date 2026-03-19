# SPRINT 19 - TASK SUMMARY
**Created:** March 19, 2026
**Total Tasks:** 8
**Estimated Timeline:** 6-12 hours (March 19-20)

---

## P0-CRITICAL (5 tasks, 7.25 hours)

### Task 1: Fix Vercel Deployment - Deploy Correct Application
**Priority:** P0-CRITICAL
**Assignee:** CTO
**Deadline:** March 19, 2026 18:00 PST (4 hours from now)
**Estimated Time:** 30 min - 2 hours
**Blocker:** All other tasks depend on this

**Description:**
Production serves Nigerian tax platform instead of US-Canada calculator. Fix Vercel deployment configuration to serve correct application.

**Actions:**
1. Login to Vercel dashboard: https://vercel.com/caffeineGMT/taxbridge
2. Check Production Branch setting (should be `main`)
3. If wrong branch: Change to `main` and trigger redeploy
4. If still wrong: Delete `.vercel/` directory and run `vercel link`
5. If still wrong: Create new Vercel project from scratch

**Evidence Required:**
- Screenshot of Vercel dashboard showing correct branch
- `curl https://taxbridge.vercel.app | grep "H-1B"` → Match found
- `curl https://taxbridge.vercel.app | grep "Nigeria"` → No match
- Screenshot of production homepage showing "Save $5K+ on H-1B RSU taxes"

**Success Criteria:**
Production homepage shows US-Canada cross-border tax calculator messaging

---

### Task 2: Verify End-to-End Functionality - Production Smoke Test
**Priority:** P0-CRITICAL
**Assignee:** QA Engineer
**Deadline:** March 19, 2026 19:00 PST
**Estimated Time:** 45 minutes
**Depends On:** Task 1 (deployment fix)

**Description:**
After deployment fix, verify all critical user flows work in production.

**Test Checklist:**
1. ✅ Homepage loads with US-Canada messaging
2. ✅ Calculator page loads: /us-canada-tax-calculator
3. ✅ Can enter RSU data and see tax calculation
4. ✅ Signup flow initiates (will fail until Clerk keys replaced)
5. ✅ Pricing page loads: /pricing
6. ✅ Checkout flow initiates (will fail until Stripe keys replaced)
7. ✅ Blog article loads: /blog/h1b-rsu-tax-calculator-2026-guide
8. ✅ Sitemap serves US-Canada URLs: /sitemap.xml

**Evidence Required:**
- Smoke test report: 8/8 checks documented
- Screenshot of each page
- Video walkthrough of calculator flow (2 min max)

**Success Criteria:**
All content-related checks pass (auth/payment may fail until keys replaced)

---

### Task 3: Replace Stripe Production Keys - Revenue Blocker
**Priority:** P0-CRITICAL
**Assignee:** CTO
**Deadline:** March 19, 2026 21:00 PST
**Estimated Time:** 2 hours
**Depends On:** Task 1 (deployment fix)

**Description:**
Replace placeholder Stripe keys with production LIVE mode keys. Enable revenue capability.

**Actions:**
1. Login to Stripe dashboard: https://dashboard.stripe.com
2. Toggle to "Live Mode" (NOT test mode)
3. Get API keys: sk_live_... and pk_live_...
4. Run: `npx tsx scripts/activate-stripe-production-annual.ts`
5. Copy price IDs from script output
6. Create webhook: https://taxbridge.vercel.app/api/stripe/webhook
7. Events: `checkout.session.completed`, `customer.subscription.*`
8. Update ALL Vercel environment variables (Production scope)
9. Test with real card: 4242 4242 4242 4242
10. Capture $1 payment, verify webhook fires, REFUND immediately

**Environment Variables to Update:**
```
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_BASIC_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=prod_...
```

**Evidence Required:**
- Stripe dashboard screenshot showing LIVE mode indicator
- Test transaction ID (e.g., `pi_3abc123def`)
- Webhook event log screenshot
- Video of checkout flow with real card
- Refund confirmation

**Success Criteria:**
$1 payment captured, webhook fired, payment refunded

---

### Task 4: Replace Clerk Production Keys - Auth Blocker
**Priority:** P0-CRITICAL
**Assignee:** Backend Engineer
**Deadline:** March 19, 2026 20:00 PST
**Estimated Time:** 30 minutes
**Depends On:** Task 1 (deployment fix)

**Description:**
Replace placeholder Clerk keys with production keys. Enable signup/login.

**Actions:**
1. Login to Clerk dashboard: https://dashboard.clerk.com
2. Select TaxBridge project
3. API Keys → Production tab
4. Copy publishable key: pk_live_...
5. Copy secret key: sk_live_...
6. Create webhook: https://taxbridge.vercel.app/api/webhooks/clerk
7. Events: `user.created`, `user.updated`, `session.created`
8. Update Vercel environment variables (Production scope)
9. Test signup: Create new account
10. Verify user appears in Clerk dashboard

**Environment Variables to Update:**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...
```

**Evidence Required:**
- Clerk dashboard screenshot showing production keys configured
- Video of signup flow (email signup + verification)
- Test user profile in Clerk dashboard

**Success Criteria:**
Can create account, verify email, and login on production

---

### Task 5: Replace PostHog Production Key - Analytics Blocker
**Priority:** P0-CRITICAL
**Assignee:** Data Engineer
**Deadline:** March 19, 2026 20:00 PST
**Estimated Time:** 15 minutes
**Depends On:** Task 1 (deployment fix)

**Description:**
Replace placeholder PostHog keys with production keys. Enable analytics tracking.

**Actions:**
1. Login to PostHog: https://app.posthog.com
2. Settings → Project API Key
3. Copy: phc_[40 characters]
4. Copy: Project ID (numeric)
5. Update Vercel environment variables (Production scope)
6. Visit production site, trigger events
7. Verify events appear in PostHog (within 30 seconds)

**Environment Variables to Update:**
```
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
POSTHOG_PROJECT_ID=12345
```

**Evidence Required:**
- PostHog dashboard screenshot showing live events (last 30 sec)
- Funnel configured: Landing → Calculator → Signup → Payment
- Session recordings enabled screenshot

**Success Criteria:**
Events flow to PostHog within 30 seconds of user actions

---

## P1-HIGH (3 tasks, 3.5 hours)

### Task 6: Fix Deployment Pipeline Documentation
**Priority:** P1-HIGH
**Assignee:** Tech Lead
**Deadline:** March 20, 2026 12:00 PST
**Estimated Time:** 2 hours
**Depends On:** Task 1-5 complete (understand deployment flow first)

**Description:**
Document how code reaches production so engineers understand the deployment workflow.

**Deliverables:**
1. Visual workflow diagram (Mermaid or Lucidchart)
2. Step-by-step deployment guide
3. Verification checklist (content checks, not just HTTP status)
4. Rollback commands (how to undo bad deployment)
5. Force redeploy commands (when auto-deploy fails)

**Content Required:**
```
Engineer commits → git push → GitHub → Vercel webhook → Build → Deploy → Production

Verification:
1. HTTP 200: curl -s -o /dev/null -w "%{http_code}" URL
2. Content check: curl -s URL | grep "expected_keyword"
3. Anti-pattern: curl -s URL | grep "wrong_keyword" (should fail)
4. Screenshot: Homepage shows correct content
5. Video: Critical flow walkthrough
```

**Evidence Required:**
- `docs/DEPLOYMENT_PIPELINE_FINAL.md` committed
- Workflow diagram (visual)
- All engineers review and acknowledge (Slack/email confirmation)

**Success Criteria:**
All engineers can explain deployment workflow in 1 minute

---

### Task 7: Update Task Verification Policy - Prevent Recurrence
**Priority:** P1-HIGH
**Assignee:** Engineering Manager
**Deadline:** March 20, 2026 12:00 PST
**Estimated Time:** 1 hour
**Depends On:** Task 6 (deployment docs must exist first)

**Description:**
Update task completion policy to require content verification, not just HTTP status codes.

**New Policy Requirements:**

For ALL production verification tasks:
```bash
# Step 1: HTTP Status (existing)
curl -s -o /dev/null -w "%{http_code}" https://taxbridge.vercel.app
# Expected: 200

# Step 2: Content Verification (NEW - MANDATORY)
curl -s https://taxbridge.vercel.app | grep "H-1B"
# Expected: Match found

# Step 3: Feature-Specific Check (NEW - MANDATORY)
curl -s https://taxbridge.vercel.app/us-canada-tax-calculator | grep "RSU"
# Expected: Match found

# Step 4: Anti-Pattern Check (NEW - MANDATORY)
curl -s https://taxbridge.vercel.app | grep "Nigeria"
# Expected: No match (exit code 1 = success)
```

**Evidence Required:**
- `docs/TASK_VERIFICATION_POLICY_V2.md` committed
- Policy announced to team (Slack message)
- Sample task using new policy (before/after comparison)

**Success Criteria:**
No tasks can be marked "done" without content verification evidence

---

### Task 8: Create Production Health Monitor - Early Warning System
**Priority:** P1-HIGH
**Assignee:** DevOps Engineer
**Deadline:** March 20, 2026 10:00 PST
**Estimated Time:** 30 minutes
**Depends On:** Task 1 (correct app must be deployed first)

**Description:**
Create automated production health checks to detect deployment issues within 5 minutes.

**Actions:**
1. Sign up for UptimeRobot: https://uptimerobot.com (free tier)
2. Create 6 monitors (5 min intervals):
   - HTTP Monitor: https://taxbridge.vercel.app → 200
   - Keyword Monitor: https://taxbridge.vercel.app → Contains "H-1B"
   - Keyword Monitor: https://taxbridge.vercel.app → NOT contains "Nigeria"
   - HTTP Monitor: https://taxbridge.vercel.app/us-canada-tax-calculator → 200
   - HTTP Monitor: https://taxbridge.vercel.app/sitemap.xml → 200
   - HTTP Monitor: https://taxbridge.vercel.app/pricing → 200
3. Configure alerts: Email + Slack
4. Create public status page
5. Test alerts: Trigger failure, verify alert received within 5 min

**Evidence Required:**
- UptimeRobot dashboard screenshot (all monitors green)
- Public status page URL
- Alert test: Screenshot of failure alert received
- Alert test: Screenshot of recovery alert received

**Success Criteria:**
Alerts trigger within 5 minutes of production content changing

---

## TIMELINE

### March 19, 2026 (Today)
- 14:00-16:00 PST: Task 1 (Deploy correct app)
- 16:00-17:00 PST: Task 2 (Smoke test)
- 17:00-19:00 PST: Task 3 (Stripe keys)
- 17:00-17:30 PST: Task 4 (Clerk keys) - parallel with Task 3
- 17:00-17:15 PST: Task 5 (PostHog key) - parallel with Task 3

### March 20, 2026 (Tomorrow)
- 09:00-10:00 PST: Task 8 (Health monitor)
- 10:00-12:00 PST: Task 6 (Deployment docs)
- 10:00-11:00 PST: Task 7 (Verification policy) - parallel with Task 6

**Total Time:** 7.25 hours (P0) + 3.5 hours (P1) = 10.75 hours

---

## SUCCESS CRITERIA

### P0 Complete (8 hours)
- ✅ Production serves US-Canada tax calculator
- ✅ $1 revenue captured and refunded
- ✅ Signup flow works
- ✅ PostHog events flowing
- ✅ All 5 P0 tasks have evidence committed to `docs/verification-reports/`

### P1 Complete (4 hours)
- ✅ UptimeRobot monitoring active
- ✅ Deployment documentation complete
- ✅ New verification policy enforced
- ✅ All engineers trained

### Week 1
- ✅ First organic customer from SEO
- ✅ Product Hunt launch scheduled (WAIT for P0 completion)
- ✅ No deployment issues recur

---

## DEPENDENCIES

```
Task 1 (Deploy Correct App)
    ├─> Task 2 (Smoke Test)
    ├─> Task 3 (Stripe Keys)
    ├─> Task 4 (Clerk Keys)
    ├─> Task 5 (PostHog Key)
    └─> Task 8 (Health Monitor)
         └─> Task 6 (Deployment Docs)
              └─> Task 7 (Verification Policy)
```

**Critical Path:** Task 1 → Task 3 → Revenue Unblocked (4 hours minimum)

---

**"Deploy correct app first. Everything else is secondary."**
