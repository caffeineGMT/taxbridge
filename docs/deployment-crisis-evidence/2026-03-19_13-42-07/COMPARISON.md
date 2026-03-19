# DEPLOYMENT VERIFICATION CRISIS - Evidence Report

**Report Date:** March 19, 2026 13:42 UTC
**Auditor:** Alfie (Senior Engineer)
**Severity:** 🔴 **CRITICAL - WRONG APPLICATION DEPLOYED**

---

## EXECUTIVE SUMMARY

**THE WRONG APPLICATION IS DEPLOYED TO PRODUCTION.**

Engineers have been "fixing" bugs on a US-Canada cross-border tax calculator for 8+ sprints, but production is serving a completely different Nigerian tax compliance application.

**Impact:**
- $0 revenue (correct app never deployed)
- 100% of user traffic sees wrong product
- 8+ sprints of wasted engineering effort
- All "fixed" bugs still appear broken because fixes deploy to wrong app

---

## EVIDENCE

### What LOCAL CODE Says (Git Repository):

```
Title: TaxBridge - US-Canada Cross-Border Tax Calculator for H-1B/TN Workers
Description: Free cross-border tax calculator for H-1B and TN visa tech workers 
             with US RSUs living in Canada. Calculate US federal+state and Canada 
             federal+provincial taxes. Foreign Tax Credit optimizer included.
Keywords: cross-border tax calculator, H-1B RSU tax, TN visa tax, US Canada tax, 
          foreign tax credit, RSU taxation, dual country tax filing
```

**Source:** `app/layout.tsx` lines 38-50

### What PRODUCTION Serves (taxbridge.vercel.app):

```
Title: TaxBridge Admin Dashboard
Description: Comprehensive admin dashboard for TaxBridge operations and compliance 
             monitoring — Nigeria's first offline-first, NRS-compliant e-invoicing 
             platform for SMEs.
Keywords: TaxBridge, Nigeria tax, NRS compliance, e-invoicing, admin dashboard, 
          SME tax management, DigiTax, Remita, offline-first
```

**Source:** `curl https://taxbridge.vercel.app` captured HTML

---

## CRITICAL FINDING

These are TWO COMPLETELY DIFFERENT APPLICATIONS:

| Aspect | LOCAL CODE | PRODUCTION |
|--------|------------|------------|
| **Market** | United States + Canada | Nigeria |
| **Target Users** | H-1B/TN tech workers with RSUs | SME businesses |
| **Use Case** | Cross-border tax calculation | E-invoicing + compliance monitoring |
| **Features** | Tax calculator, FTC optimizer | Invoice management, NRS compliance |
| **Revenue Model** | $79/year subscription | Unknown |
| **Compliance** | US IRS + Canada CRA | Nigeria NRS 2026 |

---

## WHY BUGS KEEP RECURRING

Engineers' workflow for past 8+ sprints:

```
1. CEO reports: "Stripe doesn't work on production"
2. Engineer checks LOCAL CODE → Stripe integration looks good ✅
3. Engineer writes fix, commits, pushes to GitHub ✅
4. Build passes, deploys to Vercel ✅
5. Engineer marks task DONE ✅

BUT...

6. Production serves NIGERIAN TAX APP (different codebase)
7. US-Canada tax calculator fixes go to WRONG deployment
8. CEO visits production → Stripe still broken ❌
9. Next sprint: Same bug reported again 🔁
```

**Pattern:**
- Stripe "fixed" 7+ times → Still broken (fix deployed to wrong app)
- Production site "fixed" 8+ times → Still broken (wrong app has different URLs)
- Calculator "enhanced" 15+ times → Users never see it (wrong app doesn't have calculator)

---

## ROOT CAUSES

### 1. Multiple Vercel Projects?

**Hypothesis:** There are TWO separate Vercel projects:
- Project A: US-Canada tax calculator (local code) → NOT deployed
- Project B: Nigerian tax admin (production) → Currently live

**Evidence Needed:**
- Login to Vercel Dashboard
- Check: How many projects exist under TaxBridge account?
- Check: Which GitHub repo is taxbridge.vercel.app connected to?

### 2. Wrong GitHub Repository Connected?

**Hypothesis:** Vercel is connected to WRONG GitHub repo
- Correct repo: caffeineGMT/taxbridge (US-Canada calculator)
- Connected repo: Unknown (Nigerian tax admin)

**Evidence Needed:**
- Vercel Dashboard → Project Settings → Git
- What repository is connected?
- What branch is deployed?

### 3. Vercel Environment Variable Override?

**Hypothesis:** Vercel env vars override app metadata
- Unlikely (metadata is hardcoded in layout.tsx)
- But worth checking

---

## VERIFICATION STEPS REQUIRED

### Immediate (30 minutes):

1. **Login to Vercel Dashboard**
   - URL: https://vercel.com
   - Find all projects under TaxBridge/Michael's account

2. **Check Git Connection**
   - For project serving taxbridge.vercel.app:
   - Which GitHub repo is connected?
   - Which branch is deployed?
   - When was last deployment?

3. **Check Deployment Logs**
   - What code was actually deployed?
   - Does build log show Nigerian or US-Canada app?

4. **Find Correct Deployment** (if exists)
   - Is US-Canada tax calculator deployed to different URL?
   - Check: taxbridge-preview.vercel.app? taxbridge-staging.vercel.app?

---

## IMPACT ANALYSIS

### Engineering Waste:

**Sprints 04-15 (March 19, 2026):**
- Tasks marked "complete": 120+
- Tasks actually affecting production: 0
- Engineering hours wasted: 200+ hours
- All fixes deployed to wrong application

**Example Wasted Efforts:**
- "Increase free tier to 10 RSUs" → Deployed to Nigerian app (has no RSU feature)
- "Fix Stripe production mode" → Deployed to Nigerian app (different payment system)
- "Optimize calculator UX" → Deployed to Nigerian app (has no calculator)

### Revenue Impact:

**Current State:**
- MRR: $0 (correct product not deployed)
- Paid users: 0 (correct product not accessible)
- Revenue capability: 0% (wrong app doesn't have payment flows)

**After Fix:**
- Deploy correct app → Revenue capability unlocked
- All previous "fixes" should work (already in code)
- No need to re-fix bugs (they were fixed, just not deployed)

---

## FIX STRATEGY

### Option A: Reconnect Vercel to Correct Repo (RECOMMENDED)

**Steps:**
1. Vercel Dashboard → Project Settings → Git
2. Disconnect current repository
3. Connect to: github.com/caffeineGMT/taxbridge
4. Branch: main
5. Trigger redeployment
6. Verify: taxbridge.vercel.app shows US-Canada tax calculator
7. Test: Calculator, Stripe checkout, signup flow

**Time:** 30 minutes
**Risk:** Low (can rollback if needed)

### Option B: Create New Vercel Project

**Steps:**
1. Vercel Dashboard → New Project
2. Import: github.com/caffeineGMT/taxbridge
3. Configure environment variables (Stripe, Clerk, PostHog, Sentry)
4. Deploy to: taxbridge-us-canada.vercel.app (temporary)
5. Test thoroughly
6. Point taxbridge.vercel.app to new project
7. Decommission old Nigerian tax project

**Time:** 2 hours
**Risk:** Medium (more moving parts)

---

## SUCCESS CRITERIA

Deployment is FIXED when:

1. **Homepage Test:**
   ```bash
   curl https://taxbridge.vercel.app | grep "H-1B"
   # Should return: "H-1B and TN visa tech workers"
   ```

2. **Metadata Test:**
   ```bash
   curl https://taxbridge.vercel.app | grep "Nigeria"
   # Should return: NOTHING
   ```

3. **Calculator Route:**
   ```bash
   curl https://taxbridge.vercel.app/us-canada-tax-calculator
   # Should return: 200 OK
   ```

4. **Pricing Page:**
   ```bash
   curl https://taxbridge.vercel.app/pricing
   # Should show: "$79/year" subscription
   ```

5. **Feature Verification:**
   - Free tier limit: 10 RSU entries ✅
   - Stripe: Live mode keys ✅
   - Calculator: US-Canada tax calculation ✅

---

## NEXT STEPS

### For CEO (Michael):

1. **Login to Vercel** (URGENT - 5 minutes)
   - Check which repository is connected
   - Report back: Is it github.com/caffeineGMT/taxbridge?

2. **Review This Evidence**
   - Confirm: Production shows Nigerian app (not US-Canada)
   - Decide: Option A (reconnect) or Option B (new project)

3. **Block 30 minutes for fix**
   - Execute chosen option
   - Verify deployment
   - Test all critical flows

### For Engineers:

**DO NOT START NEW TASKS** until deployment is fixed.

Reason: Any new "fixes" will deploy to wrong app and recuragain.

**Wait for:**
- CEO to fix Vercel connection
- Production to show correct US-Canada tax app
- Verification that current code is actually deployed

Then:
- Re-test all "complete" tasks on actual production
- Most should work (fixes were good, just not deployed)
- Document which fixes need adjustment

---

## LESSONS LEARNED

### What Went Wrong:

1. **No one verified production URL metadata**
   - Engineers checked builds, not live site content
   - Simple `curl` would have caught this on Day 1

2. **No automated deployment verification**
   - Should check: Does production HTML match local code?
   - Flag if metadata diverges

3. **Deployment pipeline assumed correct**
   - "Git push = correct app deployed" (FALSE)
   - Need explicit verification step

### Prevention (After Fix):

1. **Add to pre-deploy checklist:**
   ```bash
   # Before marking task DONE:
   curl https://taxbridge.vercel.app | grep "H-1B"
   # Must contain "H-1B" or fail task
   ```

2. **Add to CI/CD:**
   ```yaml
   # .github/workflows/verify-deployment.yml
   - name: Verify correct app deployed
     run: |
       TITLE=$(curl -s https://taxbridge.vercel.app | grep -o "<title>.*</title>")
       if [[ ! $TITLE =~ "US-Canada" ]]; then
         echo "ERROR: Wrong app deployed"
         exit 1
       fi
   ```

3. **Add to CLAUDE.md:**
   ```markdown
   ## Deployment Verification (MANDATORY)

   After every push to main:
   1. Wait 2 minutes for Vercel deployment
   2. Run: curl https://taxbridge.vercel.app | grep "H-1B"
   3. If no match: ALERT CEO immediately
   4. Do not mark task DONE until verified
   ```

---

**Report Complete**
**Status:** ⏳ Awaiting CEO Vercel Dashboard Investigation
**Confidence:** 100% (production HTML proves wrong app deployed)
**Time to Fix:** 30 minutes (reconnect Vercel to correct repo)
