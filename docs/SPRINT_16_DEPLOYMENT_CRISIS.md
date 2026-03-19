# Sprint 16 - Emergency Deployment Crisis Runbook

**EMERGENCY**: Production site shows wrong application
**Severity**: P0-CRITICAL - PRODUCTION DOWN
**Created**: March 19, 2026, 9:00 PM PST

---

## SITUATION REPORT

**WHAT'S WRONG**: https://taxbridge.vercel.app is serving a Nigeria e-invoicing admin dashboard instead of the US-Canada RSU tax calculator.

**EVIDENCE**:
```bash
curl -s https://taxbridge.vercel.app/ | grep -o "<title>.*</title>"
# Output: <title>TaxBridge Admin Dashboard</title>
# Expected: <title>TaxBridge - US-Canada Cross-Border Tax Calculator for H-1B/TN Workers</title>
```

**IMPACT**:
- 0% user acquisition (wrong product shown)
- 0% revenue (no calculator or payment flow)
- SEO disaster (Google indexing Nigeria tax content)
- Unknown duration (could be days/weeks)

---

## EMERGENCY PROCEDURES

### STEP 1: VERIFY THE ISSUE (5 minutes)

```bash
# 1. Check production site content
curl -s https://taxbridge.vercel.app/ | grep -i "nigeria\|admin\|h1b\|canada" | head -5

# 2. Check local codebase content
grep -r "Nigeria" app/ --include="*.tsx" --include="*.ts"
# Expected: No results (Nigeria content not in codebase)

# 3. Check what's in main branch
git log --oneline -5 -- app/page.tsx app/layout.tsx
```

**Expected Results**:
- Production: Shows Nigeria/admin content ❌
- Codebase: No Nigeria references ✓
- Main branch: Recent commits about H1B/TN visa content ✓

**Conclusion**: Production deployment is wrong, codebase is correct.

---

### STEP 2: IDENTIFY ROOT CAUSE (15 minutes)

**Hypothesis 1: Wrong Branch Deployed**

1. Login to Vercel dashboard: https://vercel.com
2. Navigate to project: taxbridge or cross-border-tax
3. Check Settings → Git:
   - Production Branch: Should be `main`
   - If it's pointing to `nigeria-branch` or similar → That's the problem

**Hypothesis 2: Multiple Vercel Projects**

1. Check Vercel project list
2. Look for projects named:
   - `taxbridge`
   - `taxbridge-prod`
   - `cross-border-tax`
   - `nigeria-tax` or similar
3. Verify which project domain taxbridge.vercel.app points to
4. If pointing to wrong project → Reassign domain

**Hypothesis 3: Stale Deployment**

1. Check Vercel → Deployments tab
2. Find most recent production deployment
3. Click deployment → View Source
4. Check commit hash: `git log | grep <commit_hash>`
5. If old commit (weeks/months ago) → Trigger new deployment

---

### STEP 3: FIX PRODUCTION DEPLOYMENT (15-30 minutes)

#### Option A: Trigger Manual Redeploy from Correct Branch

```bash
# 1. Ensure you're on main branch with latest code
git checkout main
git pull origin main

# 2. Verify code is correct
head -20 app/page.tsx | grep -i "h1b\|tn visa\|rsu"
# Should see references to H1B/TN visa

# 3. Trigger deployment (if using Vercel CLI)
vercel --prod

# OR: Use Vercel dashboard
# Go to Deployments → Deploy → Choose main branch
```

#### Option B: Fix Vercel Project Settings

1. Vercel Dashboard → Project Settings → Git
2. Change Production Branch to `main`
3. Click "Save"
4. Go to Deployments → Redeploy latest from main

#### Option C: Reassign Domain to Correct Project

1. Vercel Dashboard → Check all projects
2. Find project with US-Canada content
3. Go to that project → Settings → Domains
4. Add domain: `taxbridge.vercel.app`
5. Remove domain from wrong project

---

### STEP 4: VERIFY FIX (5 minutes)

```bash
# Wait 2-3 minutes for deployment to complete

# 1. Check homepage title
curl -s https://taxbridge.vercel.app/ | grep -o "<title>.*</title>"
# Expected: US-Canada Cross-Border Tax Calculator

# 2. Check metadata
curl -s https://taxbridge.vercel.app/ | grep -i "h1b\|tn visa\|rsu" | head -3
# Should see multiple H1B/TN references

# 3. Check for Nigeria content
curl -s https://taxbridge.vercel.app/ | grep -i "nigeria"
# Expected: No results

# 4. Visual verification
open https://taxbridge.vercel.app/
# Should see: RSU calculator homepage, not admin dashboard
```

**Success Criteria**:
- ✅ Homepage title references H1B or TN visa
- ✅ Metadata describes US-Canada cross-border tax
- ✅ No references to Nigeria, NRS, e-invoicing
- ✅ Page shows calculator value prop, not admin dashboard

---

### STEP 5: FIX ROUTING ISSUES (30-60 minutes)

After production shows correct content, fix 404 routes:

#### Fix Calculator 404

```bash
# 1. Check if calculator exists
find app -name "*calculator*" -type f | grep -v node_modules

# 2. Check dashboard for calculator route
ls -la app/dashboard/

# If calculator is at app/dashboard/page.tsx or app/dashboard/calculator/page.tsx:
# - Update nav links to point to correct route
# - OR: Create app/calculator/page.tsx that redirects to dashboard calculator
```

#### Fix Pricing 404

```bash
# 1. Verify pricing page exists
test -f app/pricing/page.tsx && echo "EXISTS" || echo "MISSING"

# 2. If exists, check for routing issues:
# - Check for typos in folder name
# - Check for client component issues
# - Check build output: npm run build | grep pricing

# 3. Test locally
npm run dev
# Visit http://localhost:3000/pricing
# If works locally but not production → Deployment cache issue
# Fix: Clear .next and redeploy
```

---

### STEP 6: EMERGENCY SMOKE TEST (15 minutes)

```bash
# 1. Critical routes
curl -s -o /dev/null -w "%{http_code}" https://taxbridge.vercel.app/
# Expected: 200

curl -s -o /dev/null -w "%{http_code}" https://taxbridge.vercel.app/dashboard
# Expected: 200 (or 302 if auth required)

curl -s -o /dev/null -w "%{http_code}" https://taxbridge.vercel.app/pricing
# Expected: 200

# 2. Visual verification
open https://taxbridge.vercel.app/
# - Homepage shows US-Canada tax calculator
# - "Get Started" or "Try Calculator" button visible
# - No Nigeria references anywhere

# 3. Calculator test (if accessible)
# - Click calculator link/button
# - Should load form, not 404
# - Enter sample RSU data
# - Should return tax calculation
```

---

## FALLBACK PROCEDURES

### If Emergency Redeploy Fails

1. **Create New Vercel Project**:
   - Import from GitHub: caffeineGMT/taxbridge
   - Branch: main
   - Root directory: ./
   - Framework: Next.js
   - Deploy
   - Point taxbridge.vercel.app to new project

2. **Rollback to Last Known Good Deployment**:
   - Vercel Dashboard → Deployments
   - Find deployment from before crisis (check commit history)
   - Click "..." → Promote to Production

3. **Use Vercel CLI Force Deploy**:
   ```bash
   vercel --prod --force
   ```

---

## POST-INCIDENT PROCEDURES

### After Production is Fixed

1. **Document What Happened**:
   - When did wrong content go live?
   - How long was it live?
   - What caused the issue?
   - How was it discovered?

2. **Prevent Recurrence**:
   - Add CI/CD step to screenshot production after deploy
   - Create smoke test script that verifies homepage content
   - Set up uptime monitoring with content verification (not just 200 status)

3. **Verify All Environment Variables**:
   - This task has been "done" 7 times but still broken
   - Actually verify ALL 28 env vars in Vercel dashboard
   - Screenshot each service (Stripe, Clerk, PostHog, Sentry)
   - Update .env.production.example to match

4. **Full Production Audit**:
   - Test all critical user flows
   - Verify SEO metadata on all pages
   - Check Google Search Console for Nigeria content indexed
   - Request re-crawl of all pages

---

## CONTACT INFO

**Escalation Path**:
1. CTO (immediate)
2. Michael Guo (CEO) - michael@taxbridge.app
3. Vercel Support (if platform issue)

**Resources**:
- Vercel Dashboard: https://vercel.com/dashboard
- GitHub Repo: https://github.com/caffeineGMT/taxbridge
- Google Search Console: https://search.google.com/search-console

---

## TIMELINE REQUIREMENTS

| Action | Deadline | Duration |
|--------|----------|----------|
| Verify issue | Immediate | 5 min |
| Identify root cause | ASAP | 15 min |
| Deploy fix | Within 1 hour | 30 min |
| Verify routes work | Within 2 hours | 30 min |
| Smoke test pass | Within 4 hours | 30 min |

**TOTAL DOWNTIME BUDGET**: 4 hours maximum from discovery to full resolution

---

**End of Runbook**
**Status**: Created March 19, 2026, 9:00 PM PST
**Last Updated**: March 19, 2026, 9:00 PM PST
