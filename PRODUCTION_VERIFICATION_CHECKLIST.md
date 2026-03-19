# ✅ PRODUCTION VERIFICATION CHECKLIST
## Prevent "Done" Tasks from Recurring

**Purpose**: Ensure tasks are ACTUALLY complete in production, not just in code.
**Created**: March 19, 2026
**Owner**: All Engineers

---

## 🎯 WHEN TO USE THIS CHECKLIST

**Use this checklist for ANY task involving**:
- ✅ Environment variables (Stripe keys, API keys, etc.)
- ✅ External service configuration (PostHog, Sentry, Clerk, SendGrid)
- ✅ Domain/DNS changes
- ✅ Payment flows
- ✅ Analytics tracking
- ✅ Email sending
- ✅ Third-party integrations

**You CAN skip this checklist for**:
- Pure code changes (UI updates, bug fixes with no config)
- Documentation updates
- Test file changes

**When in doubt**: Use the checklist. 5 extra minutes now saves 6 sprints of recurrence.

---

## 📋 UNIVERSAL VERIFICATION STEPS

### Phase 1: Code Verification (Standard)

#### 1.1 Local Build ✅
```bash
npm run build
```
- [ ] Build completes with **ZERO errors**
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] All routes generated successfully

#### 1.2 Unit Tests ✅
```bash
npm test
```
- [ ] All tests pass (191/191 expected)
- [ ] No new test failures introduced
- [ ] Coverage maintained

#### 1.3 Git Commit ✅
```bash
git add -A
git commit -m "[TASK-ID] Descriptive commit message"
git status
```
- [ ] All changes committed
- [ ] Commit message descriptive
- [ ] No untracked files (check `git status`)

#### 1.4 Push to GitHub ✅
```bash
git push origin main
```
- [ ] Push successful
- [ ] No merge conflicts
- [ ] GitHub shows latest commit

---

### Phase 2: Vercel Deployment Verification (CRITICAL)

#### 2.1 Wait for Auto-Deploy ⏱️
```bash
# Wait 90-120 seconds for Vercel to build and deploy
sleep 120
```
- [ ] Waited at least 2 minutes after push
- [ ] Vercel webhook received (check Vercel Dashboard)

#### 2.2 Check Vercel Dashboard 🎛️
**URL**: https://vercel.com/caffeineGMT/taxbridge/deployments

- [ ] Latest deployment shows "Ready" (green checkmark)
- [ ] Deployment source: `main` branch
- [ ] Commit SHA matches your latest commit
- [ ] Build logs show no errors
- [ ] Deployment time < 3 minutes (if longer, investigate)

**Screenshot Required**: Save Vercel deployment success screen to `docs/screenshots/YYYY-MM-DD/vercel-deploy-{task-id}.png`

#### 2.3 Verify Environment Variables 🔐

**If your task added/modified environment variables**:

1. **Go to Vercel Dashboard**:
   - Project: taxbridge
   - Settings → Environment Variables

2. **For EACH new variable in `.env.production.TEMPLATE`**:
   - [ ] Variable exists in Vercel Dashboard
   - [ ] Value matches `.env.production.TEMPLATE` (NOT a placeholder)
   - [ ] Applied to "Production" environment
   - [ ] Applied to "Preview" environment (optional)

3. **Check for Placeholders** (CRITICAL):
   ```
   ❌ INVALID: sk_live_YOUR_LIVE_SECRET_KEY_HERE
   ❌ INVALID: price_YOUR_LIVE_PRICE_ID
   ❌ INVALID: AW-XXXXXXXXXX
   ❌ INVALID: YOUR_API_KEY_HERE

   ✅ VALID: sk_live_51ABcDEfGH1234567890...
   ✅ VALID: price_1ABcDEfGHiJkLmNoPqRsTu
   ✅ VALID: AW-1234567890
   ✅ VALID: phc_1234567890abcdef...
   ```

4. **If you found placeholders**:
   - [ ] Get real values from service dashboard (Stripe, Clerk, etc.)
   - [ ] Update Vercel environment variables
   - [ ] Trigger redeploy: Vercel Dashboard → Deployments → "Redeploy"
   - [ ] Wait 2 minutes, repeat Phase 2

**Screenshot Required**: Save environment variables list (redact middle of values) to `docs/screenshots/YYYY-MM-DD/vercel-env-vars-{task-id}.png`

---

### Phase 3: Production Health Check (MANDATORY)

#### 3.1 Basic Site Accessibility ✅

**Open browser to production URL**:
```
https://taxbridge.vercel.app
```

- [ ] Homepage loads (HTTP 200)
- [ ] No browser console errors (open DevTools → Console)
- [ ] No layout breaks
- [ ] Images load
- [ ] Navigation works

**Test these core pages**:
- [ ] `/` - Homepage
- [ ] `/pricing` - Pricing page
- [ ] `/calculator` - Tax calculator
- [ ] `/sign-up` - Signup page
- [ ] `/dashboard` - Dashboard (requires login)

**Screenshot Required**: Save homepage screenshot to `docs/screenshots/YYYY-MM-DD/production-homepage-{task-id}.png`

#### 3.2 Browser Console Check 🔍

**Open DevTools → Console**:

- [ ] Zero console errors (red messages)
- [ ] Zero console warnings about API keys (pk_test, etc.)
- [ ] Network tab shows no 4xx/5xx errors

**If you see errors**:
1. Screenshot the error
2. Investigate root cause (usually env vars)
3. Fix before marking task done
4. Re-verify

#### 3.3 Network Tab Check 🌐

**Open DevTools → Network**:

- [ ] All requests return 200-399 (no 4xx/5xx)
- [ ] API calls succeed
- [ ] Third-party scripts load (PostHog, Stripe)
- [ ] No CORS errors
- [ ] No timeout errors

---

### Phase 4: Feature-Specific Verification (Task Dependent)

**Choose the relevant verification based on your task**:

---

#### 4A: STRIPE PAYMENT VERIFICATION 💳

**Use when**: Task involves Stripe keys, checkout, pricing, payments

**Verification Steps**:

1. **Check Stripe Mode in Page Source**:
   ```bash
   curl https://taxbridge.vercel.app/pricing | grep -o 'pk_[^"]*' | head -1
   ```
   - [ ] Output shows `pk_live_...` (NOT `pk_test_...`)

2. **Manual Checkout Flow**:
   - [ ] Go to https://taxbridge.vercel.app/pricing
   - [ ] Click "Upgrade to Pro" button
   - [ ] Stripe Checkout page opens
   - [ ] URL contains `checkout.stripe.com`
   - [ ] Stripe logo shows "Live mode" (top-right corner)
   - [ ] Enter test card: `4242 4242 4242 4242`, exp `12/34`, CVV `123`
   - [ ] Click "Pay"
   - [ ] Payment succeeds (redirects to success page)

3. **Verify in Stripe Dashboard**:
   - [ ] Log in to https://dashboard.stripe.com
   - [ ] Toggle to "Live mode" (top-right)
   - [ ] Navigate to Payments
   - [ ] See your test payment (within last 5 minutes)
   - [ ] Payment status: "Succeeded"
   - [ ] Amount matches (e.g., $79.00 for Pro annual)

4. **REFUND TEST PAYMENT IMMEDIATELY** ⚠️:
   - [ ] Click payment in Stripe Dashboard
   - [ ] Click "Refund" button
   - [ ] Refund full amount
   - [ ] Confirm refund succeeded
   - **DO NOT** leave test payments in production

**Screenshot Required**:
- Stripe Checkout page (showing Live mode)
- Stripe Dashboard payment (before refund)
- Refund confirmation

---

#### 4B: POSTHOG ANALYTICS VERIFICATION 📊

**Use when**: Task involves PostHog tracking, events, funnels

**Verification Steps**:

1. **Check PostHog Script in Page**:
   ```bash
   curl https://taxbridge.vercel.app | grep -o 'phc_[a-zA-Z0-9]*'
   ```
   - [ ] Output shows `phc_...` (your project key)
   - [ ] NOT a placeholder like `phc_YOUR_PROJECT_API_KEY`

2. **Open PostHog Dashboard**:
   - [ ] Log in to https://app.posthog.com
   - [ ] Navigate to Events → Live Events
   - [ ] See "Listening for events..." message

3. **Trigger Event on Production**:
   - [ ] Open new browser tab: https://taxbridge.vercel.app
   - [ ] Open DevTools → Console
   - [ ] Type: `posthog.capture('test_event', { source: 'verification' })`
   - [ ] Press Enter

4. **Verify Event in PostHog**:
   - [ ] Switch to PostHog Dashboard tab
   - [ ] Within 10 seconds, see `test_event` appear
   - [ ] Event properties show `source: 'verification'`
   - [ ] User identified correctly

5. **Test Real User Flow**:
   - [ ] Go to https://taxbridge.vercel.app/calculator
   - [ ] Fill in calculator form
   - [ ] Click "Calculate"
   - [ ] In PostHog: See `calculator_submitted` event
   - [ ] Event properties include form values

**Screenshot Required**:
- PostHog Live Events showing your test event
- Event details panel

---

#### 4C: CLERK AUTHENTICATION VERIFICATION 🔐

**Use when**: Task involves Clerk keys, auth, signup, login

**Verification Steps**:

1. **Check Clerk Mode in Page Source**:
   ```bash
   curl https://taxbridge.vercel.app | grep -o 'pk_[^"]*' | grep clerk
   ```
   - [ ] Output shows `pk_live_...` (NOT `pk_test_...`)

2. **Test Signup Flow**:
   - [ ] Go to https://taxbridge.vercel.app/sign-up
   - [ ] Page loads (no 500 error)
   - [ ] Clerk sign-up form appears
   - [ ] Enter test email: `test+{timestamp}@example.com`
   - [ ] Complete signup flow
   - [ ] Email verification works (check inbox)
   - [ ] Redirected to `/onboarding`

3. **Check Clerk Dashboard**:
   - [ ] Log in to https://dashboard.clerk.com
   - [ ] Switch to "Production" environment
   - [ ] Navigate to Users
   - [ ] See your test user created
   - [ ] User status: "Active"

4. **Clean Up Test User**:
   - [ ] Delete test user from Clerk Dashboard
   - [ ] Or mark with tag "test-user-{date}"

**Screenshot Required**:
- Clerk sign-up form on production
- Clerk Dashboard showing test user

---

#### 4D: DNS/DOMAIN VERIFICATION 🌍

**Use when**: Task involves domain changes, URLs, DNS

**Verification Steps**:

1. **DNS Resolution Test**:
   ```bash
   dig taxbridge.vercel.app +short
   dig taxbridgecpa.com +short  # If using custom domain
   ```
   - [ ] Returns IP addresses (NOT empty, NOT NXDOMAIN)
   - [ ] Multiple IPs returned (Vercel edge network)

2. **HTTP Test**:
   ```bash
   curl -I https://taxbridge.vercel.app
   ```
   - [ ] Returns `HTTP/2 200` (or 301/302 for redirects)
   - [ ] NOT `000 Connection refused`
   - [ ] NOT `Could not resolve host`

3. **SSL Certificate Check**:
   ```bash
   curl -vI https://taxbridge.vercel.app 2>&1 | grep -A 2 'SSL certificate'
   ```
   - [ ] Certificate valid
   - [ ] NOT expired
   - [ ] Issued by Let's Encrypt or similar

4. **Browser Test (Multiple Browsers)**:
   - [ ] Chrome: https://taxbridge.vercel.app loads
   - [ ] Safari: https://taxbridge.vercel.app loads
   - [ ] Firefox: https://taxbridge.vercel.app loads
   - [ ] Mobile Safari (iPhone): Loads
   - [ ] Mobile Chrome (Android): Loads

**Screenshot Required**:
- Terminal showing successful curl response
- Browser showing site loaded

---

#### 4E: EMAIL SENDING VERIFICATION 📧

**Use when**: Task involves SendGrid, email templates, transactional emails

**Verification Steps**:

1. **Check SendGrid API Key**:
   - [ ] Vercel env var `SENDGRID_API_KEY` starts with `SG.` (NOT placeholder)

2. **Trigger Test Email**:
   - [ ] Go to https://taxbridge.vercel.app/sign-up
   - [ ] Sign up with your real email
   - [ ] Wait 60 seconds
   - [ ] Check inbox for welcome email

3. **Verify in SendGrid Dashboard**:
   - [ ] Log in to https://app.sendgrid.com
   - [ ] Navigate to Activity
   - [ ] See email sent within last 5 minutes
   - [ ] Status: "Delivered"
   - [ ] To: Your test email
   - [ ] From: noreply@taxbridge.app

4. **Check Email Content**:
   - [ ] Subject line correct
   - [ ] HTML renders properly (no broken images)
   - [ ] Links work
   - [ ] Unsubscribe link present
   - [ ] No typos

**Screenshot Required**:
- SendGrid Activity log showing delivery
- Received email in inbox

---

#### 4F: API ENDPOINT VERIFICATION 🔌

**Use when**: Task adds/modifies API routes

**Verification Steps**:

1. **Test API Endpoint**:
   ```bash
   curl -X POST https://taxbridge.vercel.app/api/your-endpoint \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
   ```
   - [ ] Returns expected response
   - [ ] Status code correct (200, 201, etc.)
   - [ ] Response JSON valid

2. **Error Handling Test**:
   ```bash
   # Invalid input
   curl -X POST https://taxbridge.vercel.app/api/your-endpoint \
     -H "Content-Type: application/json" \
     -d '{"invalid": "input"}'
   ```
   - [ ] Returns 4xx error (400, 422, etc.)
   - [ ] Error message clear and helpful
   - [ ] No stack traces exposed

3. **Check Sentry for Errors**:
   - [ ] Log in to https://sentry.io
   - [ ] Navigate to project: cross-border-tax
   - [ ] Filter: Last 15 minutes
   - [ ] NO new errors from your endpoint
   - [ ] If errors: Fix before marking done

**Screenshot Required**:
- Terminal showing successful API response
- Sentry dashboard showing no errors

---

### Phase 5: Evidence Collection (REQUIRED)

**Every task MUST include evidence of production verification**.

#### 5.1 Screenshots 📸

**Required Screenshots** (save to `docs/screenshots/YYYY-MM-DD/`):

1. `vercel-deployment-{task-id}.png` - Vercel deployment success
2. `production-site-{task-id}.png` - Production site working
3. `feature-working-{task-id}.png` - Specific feature verified
4. `dashboard-verified-{task-id}.png` - External service dashboard (Stripe, PostHog, etc.)

**How to Screenshot**:
- Mac: Cmd+Shift+4 → Select area
- Windows: Windows+Shift+S
- Save to: `docs/screenshots/2026-03-19/`

#### 5.2 Create Verification Report 📝

**File**: `docs/{TASK_NAME}_VERIFICATION_REPORT.md`

**Template**:
```markdown
# {Task Name} - Production Verification Report

**Task ID**: {ID}
**Completed**: {Date}
**Engineer**: {Name}
**Status**: ✅ PRODUCTION VERIFIED

---

## Summary
{1-2 sentences describing what was verified}

---

## Verification Results

### Code Verification ✅
- Build passed: ✅
- Tests passed: ✅
- Commit: {commit SHA}
- Pushed to GitHub: ✅

### Vercel Deployment ✅
- Deployment successful: ✅
- Environment variables updated: ✅
- Screenshots: See docs/screenshots/YYYY-MM-DD/

### Production Health Check ✅
- Homepage loads: ✅
- No console errors: ✅
- Feature tested on production: ✅

### Feature-Specific Verification ✅
{Stripe/PostHog/Clerk/etc. verification results}

---

## Evidence

### Screenshots
1. ![Vercel Deployment](../screenshots/YYYY-MM-DD/vercel-deployment-{task-id}.png)
2. ![Production Site](../screenshots/YYYY-MM-DD/production-site-{task-id}.png)
3. ![Feature Working](../screenshots/YYYY-MM-DD/feature-working-{task-id}.png)

### Verification Commands
```bash
# DNS test
dig taxbridge.vercel.app +short
# Output: 76.76.21.21, 76.76.21.142

# HTTP test
curl -I https://taxbridge.vercel.app
# Output: HTTP/2 200
```

---

## Next Steps
{What to monitor, follow-up tasks, etc.}

---

**PRODUCTION VERIFIED**: ✅
**Verification Date**: {Timestamp}
**Production URL**: https://taxbridge.vercel.app
```

#### 5.3 Update Task Status 🏁

**In your task completion message**, include:

```markdown
## ✅ PRODUCTION VERIFICATION COMPLETE

**Evidence**:
- Vercel Deployment: ✅ {deployment URL}
- Production Health: ✅ {screenshot link}
- Feature Verified: ✅ {specific test completed}
- Screenshots: docs/screenshots/YYYY-MM-DD/
- Report: docs/{TASK_NAME}_VERIFICATION_REPORT.md

**Manual Test Completed**:
{Describe exactly what you tested on production URL}

**Production URL**: https://taxbridge.vercel.app
**Verification Timestamp**: {ISO timestamp}
```

---

## 🚨 BLOCKING CONDITIONS

**DO NOT mark task "done" if ANY of these are true**:

❌ Vercel deployment failed
❌ Vercel environment variables contain placeholders (`YOUR_`, `XXXXX`, etc.)
❌ Production site returns 4xx/5xx errors
❌ Browser console shows errors
❌ Feature does not work on production URL
❌ External service (Stripe, PostHog, etc.) not receiving data
❌ No screenshots collected
❌ No verification report created

**If blocked**: Fix the issue, re-deploy, re-verify, then mark done.

---

## ⚡ QUICK REFERENCE

### Minimum Viable Verification (5 minutes)

If you're in a hurry, these are the BARE MINIMUM steps:

1. ✅ Build passes locally
2. ✅ Push to GitHub
3. ✅ Wait 2 minutes
4. ✅ Open https://taxbridge.vercel.app in browser
5. ✅ Test your feature on production
6. ✅ Screenshot it working
7. ✅ Add screenshot to task report

**Time**: 5 minutes
**Prevents**: 6+ sprints of recurrence

---

## 📊 VERIFICATION TIMING

| Phase | Time | Cumulative |
|-------|------|------------|
| Code Verification | 2 min | 2 min |
| Vercel Deployment | 2 min | 4 min |
| Production Health Check | 3 min | 7 min |
| Feature-Specific Test | 5-10 min | 12-17 min |
| Evidence Collection | 3 min | 15-20 min |
| **TOTAL** | **15-20 min** | - |

**ROI**: 20 minutes now vs 6+ hours of recurring sprints

---

## ✅ SUCCESS CRITERIA

**A task is truly "done" when**:

1. ✅ Code passes all checks
2. ✅ Vercel deployment successful
3. ✅ Environment variables configured (no placeholders)
4. ✅ Production site loads
5. ✅ Feature works on https://taxbridge.vercel.app
6. ✅ External services verified (Stripe, PostHog, etc.)
7. ✅ Screenshots collected
8. ✅ Verification report created
9. ✅ Evidence linked in task completion

**Only then**: Mark task complete and move to next task.

---

## 🆘 TROUBLESHOOTING

### "Vercel deployment failed"

**Check**:
- Build logs in Vercel Dashboard
- Environment variables set correctly
- No missing dependencies

**Fix**:
- Fix build error
- Push fix to GitHub
- Wait for redeploy
- Re-verify

### "Production site shows old version"

**Check**:
- Hard refresh browser (Cmd+Shift+R)
- Check Vercel deployment timestamp
- Verify commit SHA matches

**Fix**:
- Clear browser cache
- Try incognito mode
- Check Vercel deployment succeeded

### "Feature works locally but not production"

**Check**:
- Environment variables in Vercel
- Console errors in browser DevTools
- Network tab for failed requests

**Fix**:
- Update Vercel env vars
- Trigger redeploy
- Re-verify

### "Stripe still in test mode"

**Check**:
- Vercel env vars: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Look for `sk_test_` vs `sk_live_`

**Fix**:
- Get real keys from Stripe Dashboard
- Update Vercel env vars
- Redeploy
- Re-verify with test payment

---

## 📚 ADDITIONAL RESOURCES

- **Vercel Dashboard**: https://vercel.com/caffeineGMT/taxbridge
- **Deployment Audit**: docs/DEPLOYMENT_PIPELINE_AUDIT.md
- **Production URL**: https://taxbridge.vercel.app
- **Environment Variables Guide**: .env.production.TEMPLATE

---

**Created**: March 19, 2026
**Maintained by**: Engineering Team
**Questions?**: Contact Michael Guo (Product Owner)

---

**Remember**: 20 minutes of verification now saves weeks of recurring work. 🚀
