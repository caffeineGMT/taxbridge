# 🎯 DEPLOYMENT PIPELINE FIX - QUICK START GUIDE

**For:** Michael (CEO)
**Time Required:** 4 hours
**Impact:** Unlocks $0 → $X MRR (revenue capability)
**Difficulty:** Easy (follow steps exactly)

---

## ❓ THE QUESTION

**Q: Why do "fixed" issues (Stripe, production site, etc.) keep recurring for 6-15+ sprints?**

**A: Engineers update `.env.production` in Git (documentation), but Vercel Dashboard environment variables (actual production) are never updated.**

---

## 🎯 THE ROOT CAUSE (ONE SENTENCE)

**Code auto-deploys perfectly, but runs with placeholder environment variables (sk_live_YOUR_KEY_HERE) → features break → task recurs next sprint.**

---

## 📊 CURRENT STATE

| Component | Status | Details |
|-----------|--------|---------|
| **GitHub → Vercel Auto-Deploy** | ✅ WORKING | Deploys in 2-5 min, no issues |
| **Code Quality** | ✅ EXCELLENT | Builds pass, tests pass |
| **Production Site** | ✅ ACCESSIBLE | HTTP 200 at taxbridge.vercel.app |
| **Vercel Env Vars** | ❌ BROKEN | 28 placeholders blocking features |
| **Revenue Capability** | ❌ BLOCKED | $0 MRR (Stripe in test mode) |

**Bottom Line:** Deployment pipeline works perfectly. Environment variables are the ONLY blocker.

---

## 🔧 THE FIX (4 Hours)

### Hour 1-2: Revenue Unblocking (Stripe + Clerk)

#### Step 1: Get Stripe LIVE Keys

```bash
# 1.1 Login to Stripe Dashboard
open https://dashboard.stripe.com/apikeys

# 1.2 Toggle to "Live mode" (top right)
# NOT "Test mode" - we need LIVE keys

# 1.3 Copy these keys:
# - Secret key: sk_live_ABC123XYZ...
# - Publishable key: pk_live_ABC123XYZ...

# 1.4 Create webhook for production:
# URL: https://taxbridge.vercel.app/api/stripe/webhook
# Events:
#   - checkout.session.completed
#   - customer.subscription.created
#   - customer.subscription.updated
#   - customer.subscription.deleted
#
# Copy webhook secret: whsec_ABC123XYZ...
```

#### Step 2: Create Stripe Products & Prices

```bash
# Run the activation script with LIVE keys:
export STRIPE_SECRET_KEY=sk_live_ABC123XYZ...
npx tsx scripts/activate-stripe-production-annual.ts

# This creates 3 products in Stripe:
# 1. Basic Plan - $49/year (5 RSU entries)
# 2. Pro Plan - $79/year (unlimited RSUs)
# 3. Enterprise Plan - $149/year (all features)

# Script will output price IDs:
# price_BASIC_ABC123
# price_PRO_XYZ456
# price_ENTERPRISE_DEF789

# Save these - you'll need them in Step 4
```

#### Step 3: Get Clerk Production Keys

```bash
# 3.1 Login to Clerk Dashboard
open https://dashboard.clerk.com

# 3.2 Select your production app
# (NOT development app)

# 3.3 Go to: API Keys

# 3.4 Copy:
# - Publishable Key: pk_live_ABC123...
# - Secret Key: sk_live_ABC123...

# 3.5 Go to: Webhooks

# 3.6 Create webhook:
# URL: https://taxbridge.vercel.app/api/clerk/webhook
# Events:
#   - user.created
#   - user.updated
#   - session.created
#
# Copy signing secret: whsec_ABC123...
```

#### Step 4: Update Vercel Dashboard

```bash
# 4.1 Login to Vercel
open https://vercel.com/taxbridge/settings/environment-variables

# 4.2 Click each variable and update:

# STRIPE (7 variables):
STRIPE_SECRET_KEY = sk_live_ABC123...          # From Step 1.3
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_ABC123...
STRIPE_WEBHOOK_SECRET = whsec_ABC123...        # From Step 1.4
STRIPE_BASIC_PRICE_ID = price_BASIC_ABC123     # From Step 2
STRIPE_PRO_PRICE_ID = price_PRO_XYZ456
STRIPE_ENTERPRISE_PRICE_ID = price_ENTERPRISE_DEF789
NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID = price_BASIC_ABC123

# CLERK (3 variables):
CLERK_SECRET_KEY = sk_live_ABC123...           # From Step 3.4
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_live_ABC123...
CLERK_WEBHOOK_SECRET = whsec_ABC123...         # From Step 3.6

# 4.3 For each variable:
# - Click variable name
# - Click "Edit"
# - Replace placeholder with real value
# - Click "Save"
# - Check "Production" environment
# - Click "Save"

# 4.4 After ALL 10 variables updated:
# - Go to: Deployments tab
# - Click "..." on latest deployment
# - Click "Redeploy"
# - Wait 2-5 minutes
```

---

### Hour 3: Monitoring (Sentry + PostHog)

#### Step 5: Setup Sentry

```bash
# 5.1 Login to Sentry
open https://sentry.io

# 5.2 Create new project:
# - Platform: Next.js
# - Name: taxbridge-production

# 5.3 Copy DSN:
# https://abc123@o123456.ingest.sentry.io/123456

# 5.4 Generate auth token:
# Settings → Account → Auth Tokens → Create New Token
# Scopes:
#   - project:read
#   - project:releases
#   - org:read

# 5.5 Update Vercel:
SENTRY_DSN = https://abc123@o123456.ingest.sentry.io/123456
SENTRY_AUTH_TOKEN = sntrys_ABC123XYZ...
NEXT_PUBLIC_SENTRY_DSN = (same as SENTRY_DSN)

# 5.6 Redeploy on Vercel
```

#### Step 6: Setup PostHog

```bash
# 6.1 Login to PostHog
open https://app.posthog.com

# 6.2 Go to: Project Settings → API Keys

# 6.3 Copy:
# - Project API Key: phc_ABC123XYZ...
# - Project ID: 12345

# 6.4 Update Vercel:
NEXT_PUBLIC_POSTHOG_KEY = phc_ABC123XYZ...
NEXT_PUBLIC_POSTHOG_HOST = https://app.posthog.com

# 6.5 Redeploy on Vercel
```

---

### Hour 4: Verification & Testing

#### Step 7: Automated Health Check

```bash
# Run production health check script:
npm run verify:production

# Expected output:
# ✅ DNS Resolution - taxbridge.vercel.app
# ✅ Stripe Keys - Production Mode
# ✅ Clerk Keys - Production Mode
# ✅ PostHog Tracking Active
# ✅ Sentry Initialized
# ✅ API Health Endpoint
#
# All checks passed! 🎉
```

#### Step 8: Manual Smoke Test

```bash
# 8.1 Test Homepage
open https://taxbridge.vercel.app
# Should load without errors ✅

# 8.2 Test Calculator
open https://taxbridge.vercel.app/us-canada-tax-calculator
# Should load and calculate ✅

# 8.3 Test Pricing Page
open https://taxbridge.vercel.app/pricing
# Should load without errors ✅

# 8.4 Test Stripe Checkout (CRITICAL!)
# 1. Click "Upgrade to Pro" button
# 2. Open DevTools → Network tab
# 3. Look for Stripe API calls
# 4. Verify uses pk_live_... (NOT pk_test_...)
# 5. Enter test card: 4242 4242 4242 4242
# 6. Expiry: Any future date (e.g., 12/30)
# 7. CVC: Any 3 digits (e.g., 123)
# 8. ZIP: Any 5 digits (e.g., 12345)
# 9. Click "Subscribe"
# 10. Should redirect to success page ✅

# 8.5 Verify Payment in Stripe Dashboard
open https://dashboard.stripe.com/payments
# Toggle to "Live mode"
# Should see test payment ✅

# 8.6 IMMEDIATELY REFUND TEST PAYMENT
# Click payment → Refund → Confirm
# (Avoid test charges on production)

# 8.7 Test Signup Flow
# 1. Logout (if logged in)
# 2. Click "Sign Up"
# 3. Create test account
# 4. Verify email sent
# 5. Login successful ✅

# 8.8 Check PostHog Live Events
open https://app.posthog.com
# Go to: Events → Live Events
# Trigger event (e.g., visit calculator)
# Should see event appear within 10 seconds ✅

# 8.9 Check Sentry
open https://sentry.io/organizations/your-org/projects/taxbridge-production/
# Should show "No errors" or minimal errors ✅
```

#### Step 9: Collect Evidence

```bash
# 9.1 Take screenshots:
# - Homepage (shows it loads)
# - Pricing page (shows Stripe checkout)
# - Stripe Dashboard showing test payment
# - PostHog showing live events
# - Sentry dashboard

# 9.2 Save to:
mkdir -p docs/screenshots/$(date +%Y-%m-%d)
# Add screenshots there

# 9.3 Create verification report:
cat << EOF > docs/PRODUCTION_VERIFICATION_$(date +%Y-%m-%d).md
# Production Verification - $(date +%Y-%m-%d)

## ✅ ALL SYSTEMS OPERATIONAL

### Revenue:
- Stripe: LIVE mode ✅
- Test payment successful ✅
- Payment refunded ✅

### Authentication:
- Clerk: Production mode ✅
- Signup flow working ✅

### Monitoring:
- PostHog: Tracking active ✅
- Sentry: Error monitoring active ✅

### Evidence:
- Screenshots: docs/screenshots/$(date +%Y-%m-%d)/
- Stripe payment: [Payment ID from dashboard]

**Status:** PRODUCTION READY FOR REVENUE 🎉
EOF
```

---

## ✅ DONE!

After completing all 9 steps, you should have:

- ✅ Stripe in LIVE mode (can accept real payments)
- ✅ Clerk in production mode (users can sign up)
- ✅ PostHog tracking (funnel analytics working)
- ✅ Sentry monitoring (error alerts active)
- ✅ Test payment completed & refunded
- ✅ Health check script passing
- ✅ Evidence collected (screenshots)

**Time Invested:** 4 hours
**Impact:** $0 MRR → Revenue capability unlocked 💰
**Next:** First real customer can now pay!

---

## 🎯 PREVENTION (Next Steps)

### This Week:

1. **Update CLAUDE.md:**
   - Remove "STOP - manual deployment"
   - Add "Verify production after deployment"
   - Add link to this guide

2. **Rename .env.production:**
   ```bash
   mv .env.production .env.production.TEMPLATE
   ```
   - Makes it clear it's documentation only
   - Prevents future confusion

3. **Add health check to workflow:**
   ```bash
   # In package.json:
   "scripts": {
     "verify:production": "tsx scripts/verify-production-health.ts"
   }
   ```

### This Month:

4. **Add GitHub Actions:**
   - Automated health checks on every deploy
   - Slack/Discord notifications
   - Prevent deployment if placeholders detected

5. **Add uptime monitoring:**
   - UptimeRobot: Ping every 5 minutes
   - Alert if down > 5 minutes
   - Track uptime % (target: 99.9%)

6. **Update task completion policy:**
   - Require: Production verification
   - Require: Screenshots as evidence
   - Require: Health check passing

---

## 🚨 TROUBLESHOOTING

### Issue: Vercel redeploy doesn't pick up new env vars

**Solution:**
```bash
# Force new deployment:
# 1. Make a trivial commit (add empty line to README)
# 2. Push to GitHub
# 3. Vercel will deploy with new env vars
```

### Issue: Stripe checkout still shows pk_test_

**Solution:**
```bash
# 1. Clear browser cache
# 2. Open incognito window
# 3. Visit pricing page again
# 4. If still shows pk_test_, check Vercel env vars:
#    - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY should be pk_live_
```

### Issue: Health check fails

**Solution:**
```bash
# Run individual checks:
curl -I https://taxbridge.vercel.app
# Should return HTTP 200

curl https://taxbridge.vercel.app/api/health
# Should return {"status":"ok"}

# If fails, check:
# 1. Vercel deployment status (might still be building)
# 2. Vercel logs for errors
# 3. Sentry for error details
```

### Issue: Can't find Stripe/Clerk/PostHog keys

**Solution:**
```bash
# Stripe: https://dashboard.stripe.com/apikeys
# Clerk: https://dashboard.clerk.com → API Keys
# PostHog: https://app.posthog.com → Project Settings → API Keys
# Sentry: https://sentry.io → Settings → Projects → [project] → Client Keys

# If account doesn't exist, create new account (free tier available)
```

---

## 📊 VERIFICATION CHECKLIST

Before marking "DONE", verify ALL checkboxes:

### Revenue (CRITICAL):
- [ ] Stripe Dashboard in LIVE mode (NOT test)
- [ ] All 7 Stripe env vars updated in Vercel
- [ ] Test payment completed successfully
- [ ] Test payment refunded immediately
- [ ] Screenshot of Stripe payment saved

### Authentication (CRITICAL):
- [ ] Clerk production keys in Vercel
- [ ] Signup flow tested on production
- [ ] Login works after signup
- [ ] Screenshot of successful signup saved

### Monitoring (HIGH):
- [ ] PostHog live events showing activity
- [ ] Sentry dashboard showing project active
- [ ] No critical errors in Sentry
- [ ] Screenshot of PostHog events saved

### Production Health (HIGH):
- [ ] Health check script passes (npm run verify:production)
- [ ] Production URL returns HTTP 200
- [ ] No console errors in browser
- [ ] Mobile responsive tested
- [ ] Screenshot of working site saved

### Documentation (MEDIUM):
- [ ] Evidence collected (screenshots)
- [ ] Verification report created
- [ ] Task marked DONE with evidence link
- [ ] Commit includes "+ VERIFICATION"

**Only mark task DONE after ALL 19 checkboxes are checked!**

---

## 📚 RELATED DOCS

- **Visual Workflow:** `docs/DEPLOYMENT_WORKFLOW_DIAGRAM.md` (this file)
- **Full Audit:** `docs/DEPLOYMENT_PIPELINE_AUDIT.md` (700+ lines)
- **Executive Summary:** `docs/DEPLOYMENT_PIPELINE_DIAGNOSIS_EXECUTIVE_SUMMARY.md`
- **Verification Checklist:** `docs/PRODUCTION_VERIFICATION_CHECKLIST.md`

---

**Created:** March 19, 2026
**Author:** Alfie (Senior Engineer)
**Status:** Ready to execute
**Time to Revenue:** 4 hours from now 🚀
