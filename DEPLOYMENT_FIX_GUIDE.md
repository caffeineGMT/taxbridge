# 🚨 DEPLOYMENT FIX GUIDE
## P0-CRITICAL: Wrong Application Deployed to Production

**Issue:** taxbridge.vercel.app is serving Nigeria e-invoicing admin dashboard instead of US-Canada cross-border tax calculator.

**Impact:** ZERO revenue, 100% user confusion, SEO disaster.

**Priority:** P0-CRITICAL - Must fix before ANY marketing/launch activities.

---

## Quick Diagnosis

### Current State:
- **Production URL:** https://taxbridge.vercel.app
- **Deployed App:** "TaxBridge Admin Dashboard" (Nigeria e-invoicing platform)
- **Expected App:** "TaxBridge - US-Canada Cross-Border Tax Calculator for H-1B/TN Workers"
- **Status:** ❌ WRONG PROJECT DEPLOYED

### Symptoms:
- Homepage shows "TaxBridge Admin Dashboard" instead of calculator landing page
- Meta tags reference Nigeria (en_NG locale), SMEs, NRS compliance
- All calculator routes return 404: /calculator, /pricing, /sign-in, /sign-up
- Dashboard shows Nigeria tax compliance metrics, not user RSU data

---

## Root Cause Hypotheses

### Most Likely Cause: Multiple Vercel Projects
You may have two separate Vercel projects:
1. **Project A:** US-Canada tax calculator (this codebase)
2. **Project B:** Nigeria e-invoicing admin dashboard (different repo)

The domain `taxbridge.vercel.app` is currently pointing to **Project B** instead of **Project A**.

### Other Possibilities:
- Vercel project linked to wrong GitHub repository
- Build output directory pointing to wrong folder
- Monorepo with multiple Next.js apps, wrong one being deployed
- Git branch mismatch (deploying from old/archived branch)

---

## Step-by-Step Fix Guide

### Option 1: Vercel Dashboard (Recommended - 10 minutes)

1. **Login to Vercel Dashboard**
   - Go to: https://vercel.com/dashboard
   - Login with your account

2. **Identify All TaxBridge Projects**
   - Look for all projects named "taxbridge" or similar
   - Check project descriptions/settings to identify which is which
   - **Target:** Find the US-Canada tax calculator project

3. **Check Current Domain Assignment**
   - In Nigeria admin dashboard project (currently live):
     - Go to Settings → Domains
     - Check if `taxbridge.vercel.app` is listed
     - **ACTION:** Remove this domain

4. **Assign Domain to Correct Project**
   - In US-Canada tax calculator project:
     - Go to Settings → Domains
     - Add domain: `taxbridge.vercel.app`
     - Vercel will automatically redeploy

5. **Verify Deployment**
   - Wait 2-5 minutes for DNS propagation
   - Run verification script (see below)
   - Check homepage shows correct title

---

### Option 2: Vercel CLI (Advanced - 15 minutes)

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Login to Vercel
vercel login

# Navigate to the correct project directory
cd /Users/michaelguo/hivemind-projects/cross-border-tax

# Check current Vercel project link
vercel inspect

# Unlink if linked to wrong project
vercel unlink

# Link to correct project (or create new)
vercel link

# Deploy to production
vercel --prod

# Assign domain (if not already assigned)
vercel domains add taxbridge.vercel.app
```

---

### Option 3: GitHub Integration Fix (5 minutes)

If using GitHub integration:

1. **Check Vercel Project Settings**
   - Dashboard → Your Project → Settings → Git
   - Verify connected repository
   - **Expected:** Repository containing THIS codebase (US-Canada calculator)
   - **If wrong:** Disconnect and reconnect correct repo

2. **Trigger Redeploy**
   - Go to Deployments tab
   - Click "Redeploy" on main branch
   - Or push new commit to trigger auto-deploy

---

## Verification Steps (Run After Fix)

### Automated Verification Script:

```bash
#!/bin/bash
PROD_URL="https://taxbridge.vercel.app"

echo "=== Verifying Production Deployment Fix ==="
echo ""

# Test 1: Correct Title
echo "Test 1: Homepage Title"
title=$(curl -s "$PROD_URL/" | grep -o "<title>[^<]*</title>")
echo "Got: $title"
if echo "$title" | grep -q "US-Canada Cross-Border Tax Calculator"; then
  echo "✅ PASS: Correct title"
else
  echo "❌ FAIL: Wrong title - Nigeria admin dashboard still deployed"
fi
echo ""

# Test 2: Correct Locale
echo "Test 2: Metadata Locale"
locale=$(curl -s "$PROD_URL/" | grep -o 'og:locale" content="[^"]*"' | cut -d'"' -f3)
echo "Got: $locale"
if [ "$locale" != "en_NG" ]; then
  echo "✅ PASS: Not Nigeria locale"
else
  echo "❌ FAIL: Still showing en_NG (Nigeria)"
fi
echo ""

# Test 3: Critical Routes Exist
echo "Test 3: Critical Routes"
test_routes=("/" "/dashboard")
for route in "${test_routes[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL$route")
  if [ "$status" = "200" ]; then
    echo "✅ $route → $status"
  else
    echo "❌ $route → $status (expected 200)"
  fi
done
echo ""

# Test 4: H1 Tag Content
echo "Test 4: Homepage H1"
h1=$(curl -s "$PROD_URL/" | grep -oP '<h1[^>]*>.*?</h1>' | head -1 | sed 's/<[^>]*>//g')
echo "Got: $h1"
if echo "$h1" | grep -q "Admin Dashboard"; then
  echo "❌ FAIL: Still showing Admin Dashboard"
else
  echo "✅ PASS: No longer showing Admin Dashboard"
fi
echo ""

echo "=== Verification Complete ==="
```

### Manual Verification Checklist:

- [ ] Visit https://taxbridge.vercel.app in browser
- [ ] Homepage title shows "US-Canada Cross-Border Tax Calculator"
- [ ] H1 heading mentions "Cross-Border Tax Filing" and H-1B/TN visas
- [ ] Hero section has "Get Started" button linking to /dashboard
- [ ] Features section shows: RSU Calculator, Tax Optimizer, Forms Checklist
- [ ] No mention of Nigeria, SMEs, NRS compliance, e-invoicing
- [ ] Footer has TaxBridge branding with correct product description
- [ ] /dashboard route loads (requires auth or shows calculator)
- [ ] Browser console shows no 404 errors for chunks/assets

---

## Post-Fix Actions

### 1. Update Environment Variables
Ensure production environment variables are set in Vercel:
```
DATABASE_URL=<production_postgres_url>
STRIPE_SECRET_KEY=sk_live_...  (NOT sk_test_)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_APP_URL=https://taxbridge.vercel.app
NEXT_PUBLIC_POSTHOG_KEY=phc_...
SENTRY_DSN=https://...
```

### 2. Run Full Smoke Test
After verifying correct app is deployed:
```bash
cd /Users/michaelguo/hivemind-projects/cross-border-tax
# Run comprehensive smoke test
npm run test:smoke  # (if available)
# OR use Playwright E2E tests
npx playwright test --grep @smoke
```

### 3. Monitor Deployment
- Check Vercel deployment logs for errors
- Monitor Sentry for runtime errors
- Check PostHog for user activity
- Verify Google Search Console is indexing correct pages

---

## Troubleshooting

### Issue: Domain won't update
**Solution:**
- Check DNS settings - may take up to 48h for propagation
- Use `nslookup taxbridge.vercel.app` to verify DNS
- Clear browser cache (Cmd+Shift+R on Mac)

### Issue: Both projects use same domain
**Solution:**
- Remove domain from old project first
- Wait 5 minutes
- Add to new project
- Vercel only allows one project per custom domain

### Issue: Build fails on new project
**Solution:**
- Check build logs in Vercel dashboard
- Verify package.json has correct Next.js version
- Ensure all environment variables are set
- Check for TypeScript errors (npm run build locally first)

---

## Contact/Escalation

If issues persist after trying all solutions:

1. **Check Vercel Status:** https://vercel-status.com
2. **Vercel Support:** support@vercel.com or in-app chat
3. **Community:** https://github.com/vercel/vercel/discussions

---

## Prevent Future Issues

### Recommended Project Naming:
- Production: `taxbridge-prod` (US-Canada calculator)
- Staging: `taxbridge-staging` (US-Canada calculator)
- Other: `taxbridge-nigeria-admin` (different product - different name)

### Domain Management:
- Use custom domain for production: `taxbridge.app` or `cross-border.tax`
- Reserve `.vercel.app` subdomains for staging/preview
- Document domain → project mappings in README.md

### Deployment Checklist:
Add to CLAUDE.md:
```markdown
## Vercel Deployment Verification
Before marking deployment complete:
1. Check homepage title matches expected product
2. Verify meta description mentions H-1B/TN workers (not Nigeria/SMEs)
3. Test critical routes: /, /dashboard, /sign-in
4. Confirm og:locale is NOT "en_NG"
5. Run smoke test script
```

---

**Status:** ⏳ AWAITING FIX
**Next Step:** Follow Option 1 (Vercel Dashboard) to reassign domain
**Verification:** Run verification script after fix
**Timeline:** 10-15 minutes to fix, 5 minutes to verify
