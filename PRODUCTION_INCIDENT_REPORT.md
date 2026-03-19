# 🚨 PRODUCTION INCIDENT REPORT
**Date:** March 19, 2026
**Severity:** P0-CRITICAL
**Status:** IDENTIFIED - AWAITING MANUAL DEPLOYMENT

---

## EXECUTIVE SUMMARY

**CRITICAL ISSUE:** The production domain https://www.taxbridge.app is serving the WRONG APPLICATION.

- **Currently Live:** Uganda EFRIS Fiscal Infrastructure App (Astro framework)
- **Should Be Live:** TaxBridge US-Canada Cross-Border Tax Calculator (Next.js 15)
- **Impact:** 100% of production traffic is seeing the wrong application
- **Revenue Impact:** BLOCKING - customers cannot access the product
- **Duration:** Unknown (needs investigation of when this started)

---

## INVESTIGATION FINDINGS

### 1. Current Production State

**URL:** https://www.taxbridge.app

```
Title: "TaxBridge — The Fiscal Infrastructure for Uganda | TaxBridge"
Description: "The Compliance Firewall for EFRIS"
Framework: Astro v5.16.6
Server: Cloudflare
```

**Verification:**
```bash
curl -sL https://www.taxbridge.app | grep -o '<title>[^<]*</title>'
# Output: <title>TaxBridge — The Fiscal Infrastructure for Uganda | TaxBridge</title>
```

### 2. Expected Production State

**Expected App:** TaxBridge Cross-Border Tax Calculator

```
Purpose: H-1B/TN visa workers with RSUs - US-Canada tax calculations
Framework: Next.js 15.5.13
Tech Stack: Next.js + Clerk + Stripe + PostgreSQL
GitHub Repo: https://github.com/caffeineGMT/taxbridge.git
Local Project: /Users/michaelguo/hivemind-projects/cross-border-tax
```

### 3. Local Build Status

✅ **Build PASSES** (as of 2026-03-19 02:40 PST)

- Fixed by: `rm -rf .next && npm run build`
- Build Type: Production-optimized
- Bundle Size: 220 kB shared JS
- Total Routes: 100+ (including /tax-calculator, /dashboard, /enterprise, etc.)

### 4. Root Cause Analysis

**Primary Issue:** Domain www.taxbridge.app is pointing to the WRONG Vercel project

**Possible Scenarios:**

1. **Domain Misconfiguration:** The domain was reassigned to a different Vercel project (the Uganda EFRIS app)
2. **Project Swap:** The Vercel project ID changed but the domain wasn't updated
3. **Deployment Failure:** A previous deployment failed silently and rolled back to an old/wrong project
4. **Vercel Account Issue:** Multiple "TaxBridge" projects exist and the domain is on the wrong one

**Evidence:**
- Local `.vercel/project.json` shows: `projectId: "prj_9fGSkRcveBr1MYXsG9RqgAFIg672"`
- Vercel CLI cannot retrieve project settings (link broken)
- Requires `vercel login` to re-authenticate

---

## IMMEDIATE ACTION REQUIRED

### Option A: Manual Vercel Dashboard Deployment (RECOMMENDED)

1. **Log into Vercel Dashboard:** https://vercel.com/dashboard
   - Account: `caffeinegmt`
   - Team: `team_vmXCjaALzzZziaxVGvfnYdBr`

2. **Find the Correct Project:**
   - Search for: "cross-border-tax" OR project ID "prj_9fGSkRcveBr1MYXsG9RqgAFIg672"

3. **Verify Domain Configuration:**
   - Go to Project Settings → Domains
   - Check if `www.taxbridge.app` and `taxbridge.app` are assigned to THIS project
   - If not → **ADD DOMAINS** to this project and remove from the Uganda EFRIS project

4. **Trigger Deployment:**
   - Go to Deployments tab
   - Click "Deploy" → select `main` branch
   - OR use the latest successful deployment and "Promote to Production"

5. **Verify Deployment:**
   ```bash
   curl -sL https://www.taxbridge.app | grep -o '<title>[^<]*</title>'
   # Expected: <title>TaxBridge - Cross-Border Tax Calculator</title>
   ```

### Option B: CLI Deployment (If Manual Dashboard Fails)

```bash
cd /Users/michaelguo/hivemind-projects/cross-border-tax

# 1. Clean and verify build
rm -rf .next
npm run build
# → Must pass with exit code 0

# 2. Re-authenticate Vercel CLI
vercel login

# 3. Relink project
rm -rf .vercel
vercel link
# → Select team: team_vmXCjaALzzZziaxVGvfnYdBr
# → Select project: cross-border-tax

# 4. Deploy to production
vercel --prod

# 5. Verify
curl -sL https://www.taxbridge.app | head -100 | grep title
```

---

## VERIFICATION CHECKLIST

After deployment, verify the following:

- [ ] **Homepage loads:** https://www.taxbridge.app
- [ ] **Correct title:** Contains "US-Canada" or "Cross-Border" or "H-1B/TN"
- [ ] **Framework:** Next.js (not Astro)
- [ ] **Calculator works:** https://www.taxbridge.app/us-canada-tax-calculator
- [ ] **Dashboard accessible:** https://www.taxbridge.app/dashboard
- [ ] **Clerk auth works:** Sign in/up flows
- [ ] **Stripe checkout:** Payment flow functional
- [ ] **API routes respond:** https://www.taxbridge.app/api/health (if exists)
- [ ] **Monitoring active:** Sentry receiving events
- [ ] **Analytics tracking:** PostHog events firing

---

## PREVENTIVE MEASURES

To prevent this from happening again:

1. **Set up deployment health checks:**
   - Add `/api/health` endpoint that returns app version/name
   - Monitor in production to alert if wrong app is deployed

2. **Add Vercel deployment protection:**
   - Enable "Deployment Protection" in Vercel project settings
   - Require manual approval for production deployments

3. **Document domain ownership:**
   - Create `DOMAIN_OWNERSHIP.md` listing all domains and their Vercel project IDs
   - Keep this updated whenever domains are added/changed

4. **Set up monitoring alerts:**
   - Sentry: Alert if deployment ID changes unexpectedly
   - PostHog: Alert if event volume drops to zero (wrong app = no events)
   - UptimeRobot: Monitor homepage title/content for unexpected changes

5. **GitHub Actions for deployment:**
   - Create `.github/workflows/deploy-production.yml`
   - Require manual approval before production deploy
   - Include smoke tests that verify correct app is deployed

---

## CONTACT INFORMATION

**Incident Owner:** Michael Guo
**Workspace:** `/Users/michaelguo/hivemind-projects/cross-border-tax`
**GitHub Repo:** https://github.com/caffeineGMT/taxbridge
**Vercel Team:** team_vmXCjaALzzZziaxVGvfnYdBr
**Created:** 2026-03-19 02:45 PST

---

## NEXT STEPS

1. **[IMMEDIATE]** Execute deployment via Option A or B above
2. **[URGENT]** Verify deployment with checklist
3. **[HIGH]** Investigate when/why the wrong app was deployed (check Vercel deployment logs)
4. **[MEDIUM]** Implement preventive measures
5. **[LOW]** Document lessons learned

**Estimated Time to Resolution:** 15-30 minutes (manual deployment + verification)

---

**STATUS:** Ready for manual deployment. Build verified locally. Awaiting Michael's action.
