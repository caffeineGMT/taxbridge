# Deployment Verification Checklist

**Use this checklist after fixing Vercel deployment configuration.**

---

## Pre-Deployment Verification

- [x] Latest commit pushed to GitHub
  ```bash
  git log origin/main --oneline -1
  # 5039416 [P0-CRITICAL] Fix Calculator Route - Remove force-dynamic Export
  ```

- [x] Local build succeeds
  ```bash
  npm run build
  # ✓ Compiled successfully
  # Route List: ├ ○ /us-canada-tax-calculator
  ```

- [x] Calculator file exists
  ```bash
  ls app/(marketing)/us-canada-tax-calculator/page.tsx
  # -rw-r--r-- ... page.tsx
  ```

---

## Vercel Configuration Check

**URL:** https://vercel.com/caffeineGMT/taxbridge/settings/git

- [ ] **Connected Repository**
  - Expected: `caffeineGMT/taxbridge`
  - Actual: _______________

- [ ] **Production Branch**
  - Expected: `main`
  - Actual: _______________

- [ ] **Latest Deployment Commit**
  - Expected: `5039416` or later
  - Actual: _______________
  - Timestamp: _______________

- [ ] **Build Command**
  - Expected: `npm run build` or `next build`
  - Actual: _______________

- [ ] **Output Directory**
  - Expected: `.next`
  - Actual: _______________

---

## Force Redeploy

**Method Used:**
- [ ] Empty commit + push
  ```bash
  git commit --allow-empty -m "[DEPLOYMENT] Verify correct app deployed"
  git push origin main
  ```

- [ ] Vercel dashboard redeploy
  - Went to: https://vercel.com/caffeineGMT/taxbridge/deployments
  - Clicked: "Redeploy" on latest deployment

- [ ] Vercel CLI
  ```bash
  vercel --prod
  ```

**Deployment Status:**
- [ ] Build started: _______________
- [ ] Build completed: _______________
- [ ] Deployment URL: https://taxbridge.vercel.app

---

## Post-Deployment Verification

### 1. Homepage Check

```bash
curl -s https://taxbridge.vercel.app/ | grep -o '<title>.*</title>'
```

- [ ] **Expected Result:**
  ```html
  <title>TaxBridge - US-Canada Cross-Border Tax Calculator for H-1B/TN Workers</title>
  ```

- [ ] **Actual Result:** _______________

- [ ] **Status:** ✅ PASS / ❌ FAIL

### 2. Calculator Route Check

```bash
curl -s -o /dev/null -w "HTTP %{http_code}\n" \
  https://taxbridge.vercel.app/us-canada-tax-calculator
```

- [ ] **Expected Result:** `HTTP 200`
- [ ] **Actual Result:** _______________
- [ ] **Status:** ✅ PASS / ❌ FAIL

### 3. Homepage Description Check

```bash
curl -s https://taxbridge.vercel.app/ | grep -i "nigeria"
```

- [ ] **Expected Result:** (empty - should NOT mention Nigeria)
- [ ] **Actual Result:** _______________
- [ ] **Status:** ✅ PASS / ❌ FAIL

### 4. Functional Test - Calculator

**Manual Test Steps:**
1. [ ] Navigate to: https://taxbridge.vercel.app/us-canada-tax-calculator
2. [ ] Page loads (no 404, no 500)
3. [ ] Form fields visible:
   - [ ] RSU Income input
   - [ ] US State dropdown
   - [ ] Canadian Province dropdown
4. [ ] Enter test data:
   - RSU Income: $100,000
   - US State: Washington
   - Province: British Columbia
5. [ ] Results appear:
   - [ ] US Tax calculated
   - [ ] Canada Tax calculated
   - [ ] FTC Savings shown
   - [ ] Total Tax shown
6. [ ] No console errors
7. [ ] Mobile responsive (test on phone or DevTools)

**Screenshot Captured:**
- [ ] `docs/screenshots/calculator-fix-verification-2026-03-19/homepage.png`
- [ ] `docs/screenshots/calculator-fix-verification-2026-03-19/calculator-working.png`
- [ ] `docs/screenshots/calculator-fix-verification-2026-03-19/calculator-results.png`

---

## Additional Verification

### 5. Other Critical Routes

- [ ] **Homepage:** https://taxbridge.vercel.app/
  - HTTP Status: _______________
  - Loads correctly: ✅ / ❌

- [ ] **Pricing:** https://taxbridge.vercel.app/pricing
  - HTTP Status: _______________
  - Loads correctly: ✅ / ❌

- [ ] **Dashboard:** https://taxbridge.vercel.app/dashboard
  - HTTP Status: _______________
  - Requires auth: ✅ / ❌

### 6. Build Output Size

```bash
# Check .next folder size on Vercel deployment
du -sh .next
```

- [ ] **Expected:** < 200MB
- [ ] **Actual:** _______________
- [ ] **Status:** ✅ PASS / ❌ FAIL

### 7. Performance Check

```bash
# Use Lighthouse or WebPageTest
curl -s -o /dev/null -w "Time: %{time_total}s\n" \
  https://taxbridge.vercel.app/us-canada-tax-calculator
```

- [ ] **Load Time:** _______________
- [ ] **Expected:** < 3 seconds
- [ ] **Status:** ✅ PASS / ❌ FAIL

---

## Final Checklist

- [ ] Correct app deployed (US-Canada tax calculator, NOT Nigeria)
- [ ] Homepage shows correct title and description
- [ ] /us-canada-tax-calculator returns HTTP 200
- [ ] Calculator is functional (calculates taxes correctly)
- [ ] Screenshots captured and saved
- [ ] Verification report updated with evidence
- [ ] Task marked COMPLETE in project tracker

---

## Sign-Off

**Verified By:** _______________
**Date:** _______________
**Time:** _______________

**Deployment Status:** ✅ SUCCESS / ❌ FAILED

**If Failed:**
- [ ] Documented failure reason
- [ ] Created new task to investigate
- [ ] Escalated to senior engineer

**If Successful:**
- [x] Evidence saved to `docs/screenshots/`
- [ ] Verification report committed to git
- [ ] Task marked COMPLETE
- [ ] Production monitoring enabled

---

## Rollback Plan (If Needed)

**If deployment breaks production:**

```bash
# Option 1: Revert to previous deployment in Vercel dashboard
https://vercel.com/caffeineGMT/taxbridge/deployments
# Click "Promote to Production" on last known good deployment

# Option 2: Git revert
git revert HEAD
git push origin main

# Option 3: Redeploy specific commit
git checkout 5039416
git push origin main --force
```

**Rollback Decision Criteria:**
- 500 errors on homepage: **ROLLBACK IMMEDIATELY**
- Calculator 404 persists: Continue investigation (not worse than before)
- Build fails: Check logs, fix issues, redeploy

---

**Save this checklist for future deployments!**
