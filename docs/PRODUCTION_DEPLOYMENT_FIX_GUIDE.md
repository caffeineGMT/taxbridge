# Production Deployment Fix Guide

**Issue**: Wrong application deployed to production (Nigerian e-invoicing app instead of US-Canada tax calculator)
**Priority**: P0-CRITICAL
**Timeline**: 2 hours
**Owner**: CTO (Michael)

---

## Quick Diagnosis

### Symptoms
1. ❌ `taxbridgecpa.com` - Returns `000` (Connection Refused)
2. ❌ `taxbridge.vercel.app/sitemap.xml` - Returns `404`
3. ❌ `taxbridge.vercel.app` - Shows "TaxBridge Admin Dashboard - Nigeria e-invoicing" (WRONG APP)
4. ✅ Local codebase - Correct app (US-Canada tax calculator)
5. ✅ GitHub repo - Correct code pushed to `main` branch

### Root Cause
Vercel project is either:
1. Connected to wrong GitHub repository
2. Deploying wrong branch
3. Using cached/old deployment after build failure

---

## Fix Steps (15 minutes)

### Step 1: Verify Vercel Project Configuration (5 min)

1. **Login to Vercel Dashboard**
   ```
   URL: https://vercel.com/dashboard
   ```

2. **Find the Project**
   - Project name: `taxbridge` or `cross-border-tax`
   - Check URL: Should show `taxbridge.vercel.app`

3. **Check Git Integration**
   - Navigate to: Settings → Git
   - **Verify**:
     - ✅ Repository: `caffeineGMT/taxbridge`
     - ✅ Branch: `main`
     - ✅ Root Directory: `./` (NOT a subdirectory)

4. **If Repository is WRONG**:
   ```
   Settings → Git → Disconnect Git Repository
   → Connect Git Repository → GitHub → caffeineGMT/taxbridge
   ```

### Step 2: Check Environment Variables (5 min)

1. **Navigate to**: Settings → Environment Variables

2. **Verify Production Variables Match .env.production**:
   ```bash
   NEXT_PUBLIC_APP_URL=https://taxbridgecpa.com
   NEXT_PUBLIC_BASE_URL=https://taxbridgecpa.com

   # These should be PRODUCTION values (not test)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...

   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   CLERK_SECRET_KEY=sk_live_...
   ```

3. **If Missing or Wrong**: Update from `.env.production` file

### Step 3: Trigger Fresh Deployment (5 min)

#### Option A: Redeploy Latest (Fastest)
1. Go to: Deployments tab
2. Find latest deployment from `main` branch
3. Click: ︙ (three dots) → Redeploy
4. Select: "Redeploy with existing Build Cache" (first try)
5. Monitor: Build logs for errors

#### Option B: Force Fresh Build
If Option A fails:
1. Go to: Deployments tab
2. Click: "Redeploy" on latest
3. **Uncheck**: "Use existing Build Cache"
4. This forces clean build from scratch

#### Option C: Push Empty Commit
If Vercel isn't triggering automatically:
```bash
cd /Users/michaelguo/hivemind-projects/cross-border-tax
git commit --allow-empty -m "Trigger Vercel deployment"
git push origin main
```

### Step 4: Verify Deployment (5 min)

1. **Wait for Build** (2-3 minutes)
   - Watch build logs in Vercel dashboard
   - Look for: "Build Completed" status

2. **Test Vercel URL**:
   ```bash
   curl -s https://taxbridge.vercel.app/ | grep -o '<title>[^<]*</title>'
   # Expected: <title>TaxBridge - US-Canada Cross-Border Tax Calculator</title>
   # NOT: <title>TaxBridge Admin Dashboard</title>
   ```

3. **Test Sitemap**:
   ```bash
   curl -s -o /dev/null -w "%{http_code}\n" https://taxbridge.vercel.app/sitemap.xml
   # Expected: 200
   ```

4. **Verify Content**:
   ```bash
   curl -s https://taxbridge.vercel.app/sitemap.xml | head -20
   # Expected: <url><loc>https://taxbridgecpa.com/</loc>...
   ```

---

## Domain Configuration (30 minutes)

### Step 5: Fix DNS for taxbridgecpa.com

1. **Check Current DNS Provider**
   ```bash
   whois taxbridgecpa.com | grep -i "registrar:"
   nslookup taxbridgecpa.com
   ```

2. **Verify Vercel Domain Setup**
   - Vercel Dashboard → Settings → Domains
   - Check if `taxbridgecpa.com` is listed

3. **If Domain NOT Added**:
   ```
   Settings → Domains → Add Domain
   → Enter: taxbridgecpa.com
   → Follow Vercel's DNS instructions
   ```

4. **If Domain Already Added but Not Working**:
   - Check DNS records at your registrar:
     ```
     A Record: @ → 76.76.21.21 (Vercel IP)
     CNAME: www → cname.vercel-dns.com
     ```
   - DNS propagation: Wait 5-60 minutes

5. **Force HTTPS Redirect**:
   - Vercel → Settings → Domains → taxbridgecpa.com
   - Enable: "Redirect HTTP to HTTPS"
   - Enable: "Redirect www to non-www" (or vice versa)

---

## Verification Checklist

### Production URLs (All must return 200)
```bash
# Main site
curl -s -o /dev/null -w "%{http_code}\n" https://taxbridgecpa.com/

# Sitemap
curl -s -o /dev/null -w "%{http_code}\n" https://taxbridgecpa.com/sitemap.xml

# Sample blog page
curl -s -o /dev/null -w "%{http_code}\n" https://taxbridgecpa.com/blog/h1b-rsu-tax-calculator-complete-guide

# Calculator page
curl -s -o /dev/null -w "%{http_code}\n" https://taxbridgecpa.com/us-canada-tax-calculator
```

### Content Verification
```bash
# Verify correct app title
curl -s https://taxbridgecpa.com/ | grep -o '<title>[^<]*</title>'
# Expected: "TaxBridge - US-Canada Cross-Border Tax Calculator"
# NOT: "TaxBridge Admin Dashboard"

# Verify sitemap URLs use correct domain
curl -s https://taxbridgecpa.com/sitemap.xml | grep -o '<loc>[^<]*</loc>' | head -5
# Expected: All URLs should start with https://taxbridgecpa.com
```

### SEO Infrastructure
- [ ] Sitemap accessible at `/sitemap.xml`
- [ ] Sitemap contains 100+ URLs (42 blog + 50 geo + 9 static)
- [ ] All blog URLs return 200 (test 5 random samples)
- [ ] All geo landing pages return 200 (test 5 random samples)
- [ ] Robots.txt exists and allows crawling
- [ ] Meta tags show correct description (US-Canada tax calculator)

---

## Common Issues & Fixes

### Issue 1: Build Fails with "Module not found"
**Fix**:
```bash
# Locally, verify build works
cd /Users/michaelguo/hivemind-projects/cross-border-tax
rm -rf .next node_modules
npm install
npm run build

# If successful, push to trigger Vercel rebuild
git commit --allow-empty -m "Fix: Trigger clean build"
git push origin main
```

### Issue 2: Domain Shows "This domain is not configured"
**Fix**:
- Vercel Dashboard → Settings → Domains
- Remove domain → Re-add domain
- Follow new DNS instructions

### Issue 3: Vercel Deploys but Shows 404 for All Routes
**Fix**:
- Check `next.config.mjs` → `output` should NOT be `'export'`
- Check `package.json` → `"build": "next build"` (not `next export`)

### Issue 4: Environment Variables Not Applied
**Fix**:
- After updating env vars, trigger redeploy:
  - Deployments → Latest → Redeploy
- Env changes don't auto-deploy

---

## Post-Fix Actions

### Immediate (After site is live)
1. **Set Up Monitoring**
   ```
   Tool: UptimeRobot (free tier)
   URL to monitor: https://taxbridgecpa.com/sitemap.xml
   Frequency: Every 5 minutes
   Alert: Email + Slack
   ```

2. **Document This Incident**
   ```
   Create: docs/INCIDENT_2026_03_19_WRONG_APP_DEPLOYED.md
   Include: Timeline, root cause, prevention steps
   ```

3. **Add Deployment Verification to CI/CD**
   ```yaml
   # .github/workflows/verify-deployment.yml
   name: Verify Production Deployment
   on:
     push:
       branches: [main]

   jobs:
     verify:
       runs-on: ubuntu-latest
       steps:
         - name: Wait for Vercel deployment
           run: sleep 120

         - name: Check site title
           run: |
             TITLE=$(curl -s https://taxbridgecpa.com/ | grep -o '<title>[^<]*</title>')
             if [[ "$TITLE" != *"US-Canada"* ]]; then
               echo "ERROR: Wrong app deployed!"
               exit 1
             fi

         - name: Check sitemap
           run: |
             STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://taxbridgecpa.com/sitemap.xml)
             if [[ "$STATUS" != "200" ]]; then
               echo "ERROR: Sitemap not accessible!"
               exit 1
             fi
   ```

### Follow-up (This week)
4. **Complete SEO Infrastructure Setup** (CMO task)
   - Set up Google Search Console
   - Submit sitemap
   - Request indexing for top 20 pages

5. **Audit All Blog Articles**
   - Verify all 42 articles render correctly
   - Check images load
   - Validate internal links

---

## Success Criteria

### ✅ Deployment Fixed When:
1. `https://taxbridgecpa.com/` returns 200
2. Page title: "TaxBridge - US-Canada Cross-Border Tax Calculator"
3. `https://taxbridgecpa.com/sitemap.xml` returns 200
4. Sitemap contains 100+ URLs
5. All URLs use `https://taxbridgecpa.com` domain
6. Sample blog pages return 200
7. No Nigerian e-invoicing content visible

### ✅ SEO Ready When:
1. All 42 blog articles accessible at `/blog/*`
2. All 50 geo pages accessible at `/tax-calculator/*`
3. Google Search Console verified
4. Sitemap submitted to GSC
5. Zero crawl errors in GSC

---

## Timeline Estimate

| Task | Time | Status |
|------|------|--------|
| Diagnose Vercel config | 5 min | ⏳ Pending |
| Fix Git integration | 5 min | ⏳ Pending |
| Trigger redeploy | 5 min | ⏳ Pending |
| Verify deployment | 5 min | ⏳ Pending |
| Configure DNS | 15 min | ⏳ Pending |
| Wait for DNS propagation | 15 min | ⏳ Pending |
| Full verification | 10 min | ⏳ Pending |
| **TOTAL** | **60 min** | ⏳ Pending |

---

## Contact

**Issue Owner**: Michael Guo (CTO)
**Escalation**: If deployment fails after 2 attempts, contact Vercel support

**Support Resources**:
- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- DNS Checker: https://dnschecker.org/#A/taxbridgecpa.com

---

**Last Updated**: March 19, 2026
**Status**: 🔴 ACTIVE INCIDENT - Production site down
