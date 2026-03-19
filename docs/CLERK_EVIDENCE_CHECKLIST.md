# Clerk Production Keys - Evidence Checklist

**Task:** [P0-CRITICAL] Replace Clerk Production Keys - Site Returns 500 Errors
**Date:** 2026-03-19
**Status:** 🔧 PENDING MANUAL EXECUTION

---

## 📸 Required Evidence (5 Screenshots)

**Save all screenshots to:** `docs/screenshots/clerk-fix-2026-03-19/`

### 1. Clerk Dashboard - Production Keys ✅ or ❌

**URL:** https://dashboard.clerk.com → Developers → API Keys

**Requirements:**
- [ ] "Production" tab is selected (visible in screenshot)
- [ ] Publishable key visible and starts with `pk_live_`
- [ ] Secret key partially visible (redacted after first 20 chars)
- [ ] Screenshot shows application name: "TaxBridge"

**Filename:** `clerk-dashboard-production-keys.png`

**Status:** ⬜ NOT CAPTURED

---

### 2. Vercel Environment Variables ✅ or ❌

**URL:** https://vercel.com/caffeineGMT/taxbridge/settings/environment-variables

**Requirements:**
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` visible
- [ ] `CLERK_SECRET_KEY` visible
- [ ] `CLERK_WEBHOOK_SECRET` visible
- [ ] All 3 variables show "Production" environment (not Preview/Development)
- [ ] Values show as "••••••••" (redacted)

**Filename:** `vercel-env-vars-clerk.png`

**Status:** ⬜ NOT CAPTURED

---

### 3. Signup Page - Clerk Widget Loaded ✅ or ❌

**URL:** https://taxbridge.vercel.app/sign-up

**Requirements:**
- [ ] Page loads successfully (HTTP 200)
- [ ] Clerk signup widget is visible
- [ ] Email input field present
- [ ] Password input field present
- [ ] "Sign up" button visible
- [ ] No error messages visible

**Filename:** `signup-clerk-widget-working.png`

**Status:** ⬜ NOT CAPTURED

**How to Capture:**
```bash
# Option 1: Manual screenshot (recommended)
1. Open https://taxbridge.vercel.app/sign-up in browser
2. Take full-page screenshot (Cmd+Shift+4 on Mac)
3. Save to docs/screenshots/clerk-fix-2026-03-19/

# Option 2: Automated (after keys are set)
npm run test:clerk-signup
# Screenshots saved automatically to docs/screenshots/clerk-verification/
```

---

### 4. New User in Clerk Dashboard ✅ or ❌

**URL:** https://dashboard.clerk.com → Users

**Requirements:**
- [ ] User list shows at least 1 user
- [ ] Test user created within last 5 minutes (timestamp visible)
- [ ] User email visible (e.g., test+clerk@example.com)
- [ ] User status shows "Active"

**Filename:** `clerk-new-user-created.png`

**Status:** ⬜ NOT CAPTURED

**Test User Details:**
```
Email: test+clerk-$(date +%s)@taxbridge.app
Password: TestPassword123!
```

---

### 5. Smoke Test - Clerk Authentication Passing ✅ or ❌

**Command:** `npm run smoke-test`

**Requirements:**
- [ ] Terminal output shows "Signup & Clerk Authentication" test
- [ ] Status: ✅ PASS (not ❌ FAIL)
- [ ] "Clerk widget found" message visible
- [ ] Overall success rate increased (was 16.7%, should be 33.3%+)

**Filename:** `smoke-test-clerk-passing.png`

**Status:** ⬜ NOT CAPTURED

**How to Capture:**
```bash
npm run smoke-test 2>&1 | tee smoke-test-output.log

# Take screenshot of terminal showing:
# - Test 3: ✅ Signup & Clerk Authentication PASS
# - Success Rate: 33.3% (2/6) or higher
```

---

## ✅ Verification Checklist

### Pre-Execution
- [x] Created screenshot directory
- [ ] Have Clerk dashboard access
- [ ] Have Vercel dashboard access
- [ ] Have browser open for manual testing

### Execution
- [ ] **Step 1:** Get production keys from Clerk dashboard
- [ ] **Step 2:** Update Vercel environment variables
- [ ] **Step 3:** Update local .env.production
- [ ] **Step 4:** Commit and push to GitHub
- [ ] **Step 5:** Wait for Vercel deployment (2-5 min)

### Evidence Collection
- [ ] **Evidence 1:** Clerk dashboard screenshot
- [ ] **Evidence 2:** Vercel env vars screenshot
- [ ] **Evidence 3:** Signup page with widget screenshot
- [ ] **Evidence 4:** New user in Clerk dashboard screenshot
- [ ] **Evidence 5:** Smoke test passing screenshot

### Verification
- [ ] `npm run verify:clerk` → 4/4 checks pass
- [ ] `npm run test:clerk-signup` → All tests pass
- [ ] Manual signup test → Successful
- [ ] `npm run smoke-test` → "Signup & Clerk Authentication" PASS

---

## 📊 Current Status

### Verification Script Output (Last Run)
```bash
$ npm run verify:clerk

🔍 Clerk Production Keys Verification
============================================================

❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is a placeholder
   Current value: pk_live_YOUR_CLERK_PUBLISHABLE...

❌ CLERK_SECRET_KEY is a placeholder
   Current value: sk_live_YOUR_CLERK_SECRET_KEY...

⚠️ CLERK_WEBHOOK_SECRET is a placeholder
   Current value: whsec_YOUR_CLERK_WEBHOOK_SECRE...

✅ Clerk route configuration is complete
   signIn: /sign-in, signUp: /sign-up

============================================================

📊 Summary: 1/4 checks passed

❌ 2 critical issue(s) found
```

**Status:** ❌ Placeholder keys detected
**Action:** Replace with production keys from Clerk dashboard

---

### Smoke Test Output (Last Run: 2026-03-19)
```
Test 3: Signup & Clerk Authentication
Status: ❌ FAIL
Details: Clerk widget not found on signup page

Screenshots:
- signup-page-1773946763040.png
- signup-clerk-widget-1773946773119.png
```

**Status:** ❌ Widget not loading
**Action:** Fix will resolve after Clerk keys are replaced

---

## 🎯 Success Criteria

**Task is COMPLETE when ALL of the following are true:**

1. ✅ All 5 screenshots captured and saved
2. ✅ `npm run verify:clerk` shows 4/4 checks passed
3. ✅ Manual signup test completes successfully
4. ✅ New user appears in Clerk dashboard
5. ✅ Smoke test shows "Signup & Clerk Authentication" PASSED
6. ✅ Evidence uploaded to Git repository

---

## 📝 Evidence Summary

**When task is complete, update this section:**

### Screenshot Inventory
```bash
ls -lh docs/screenshots/clerk-fix-2026-03-19/

# Expected files:
# clerk-dashboard-production-keys.png
# vercel-env-vars-clerk.png
# signup-clerk-widget-working.png
# clerk-new-user-created.png
# smoke-test-clerk-passing.png
```

### Verification Results
```bash
# Run all verifications
npm run verify:clerk          # Expected: 4/4 PASS
npm run test:clerk-signup     # Expected: 4/4 PASS
npm run smoke-test           # Expected: 2/6 PASS (33.3%)
```

---

## 📚 Related Documentation

- **Guide:** `docs/CLERK_KEY_REPLACEMENT_GUIDE.md` (step-by-step)
- **Summary:** `docs/CLERK_TASK_SUMMARY.md` (quick reference)
- **Executive:** `docs/CLERK_EXECUTIVE_SUMMARY.md` (for leadership)

---

**Last Updated:** 2026-03-19
**Status:** 🔧 Ready for execution
**Deadline:** 2 hours from task start
