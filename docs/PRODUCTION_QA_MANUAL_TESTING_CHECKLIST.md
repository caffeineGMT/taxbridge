# 🎯 TaxBridge Production QA Manual Testing Checklist

**Production Site:** https://taxbridge.app
**Test Date:** _________________
**Tester Name:** _________________
**Build Version:** _________________

---

## 📋 PRE-TEST SETUP

### Required Test Accounts
- [ ] Test email for new user signup: _________________
- [ ] Test Stripe card: `4242 4242 4242 4242` (exp: any future date, CVC: any 3 digits)
- [ ] Test Stripe card (decline): `4000 0000 0000 0002`
- [ ] Test Stripe card (requires 3DS): `4000 0025 0000 3155`

### Required Test Devices
- [ ] iPhone (iOS 15+) - Safari
- [ ] Android phone (Android 10+) - Chrome
- [ ] Desktop - Chrome (latest)
- [ ] Desktop - Safari (latest)
- [ ] Desktop - Firefox (latest)
- [ ] Desktop - Edge (latest)

---

## 🧮 SECTION 1: CALCULATOR FUNCTIONALITY

### 1.1 Calculator - Basic Math Accuracy
Test URL: `https://taxbridge.app`

**Test Case 1: Standard H1B Scenario**
- [ ] Enter: Salary $120,000, RSU Value $80,000, Year 2026
- [ ] Click "Calculate My Tax Savings"
- [ ] **VERIFY:** Results appear within 3 seconds
- [ ] **VERIFY:** US Tax shows value (should be ~$36,000-$42,000)
- [ ] **VERIFY:** Canada Tax shows value (should be ~$30,000-$36,000)
- [ ] **VERIFY:** FTC Savings shows positive value (should be ~$3,000-$8,000)
- [ ] **VERIFY:** No error messages or console errors
- [ ] **NOTES:** _________________

**Test Case 2: Zero RSU Edge Case**
- [ ] Enter: Salary $100,000, RSU Value $0, Year 2026
- [ ] Click "Calculate My Tax Savings"
- [ ] **VERIFY:** Results show valid numbers (no NaN, no undefined)
- [ ] **VERIFY:** FTC Savings is $0 or very small
- [ ] **NOTES:** _________________

**Test Case 3: Extreme High Income**
- [ ] Enter: Salary $500,000, RSU Value $2,000,000, Year 2026
- [ ] Click "Calculate My Tax Savings"
- [ ] **VERIFY:** Calculator handles large numbers correctly
- [ ] **VERIFY:** All values formatted with commas (e.g., $2,000,000)
- [ ] **VERIFY:** No overflow errors
- [ ] **NOTES:** _________________

**Test Case 4: Invalid Inputs**
- [ ] Try entering negative numbers: Salary -$50,000
- [ ] **VERIFY:** Error message appears OR input is blocked
- [ ] Try entering letters: Salary "abc"
- [ ] **VERIFY:** Input sanitizes to numbers only
- [ ] Try entering $0 salary
- [ ] **VERIFY:** Calculator handles gracefully (shows message or allows calculation)
- [ ] **NOTES:** _________________

### 1.2 Calculator - Mobile Responsiveness
**Device:** iPhone / Android

- [ ] Visit `https://taxbridge.app` on mobile
- [ ] **VERIFY:** Calculator form fits screen (no horizontal scroll)
- [ ] **VERIFY:** All input fields are tappable (not too small)
- [ ] **VERIFY:** Virtual keyboard doesn't cover input fields
- [ ] **VERIFY:** "Calculate" button is visible and tappable
- [ ] **VERIFY:** Results are readable (text not too small)
- [ ] **VERIFY:** Charts/graphs are responsive (if any)
- [ ] **NOTES:** _________________

### 1.3 Calculator - Cross-Browser Testing
Test same scenario (Salary $120k, RSU $80k) on each browser:

- [ ] **Chrome Desktop:** Calculator works, results correct
- [ ] **Safari Desktop:** Calculator works, results correct
- [ ] **Firefox Desktop:** Calculator works, results correct
- [ ] **Edge Desktop:** Calculator works, results correct
- [ ] **iOS Safari:** Calculator works, results correct
- [ ] **Android Chrome:** Calculator works, results correct
- [ ] **NOTES:** _________________

---

## 🔐 SECTION 2: SIGNUP FLOW

### 2.1 New User Signup
Test URL: `https://taxbridge.app` → Click "Get Started" or "Sign Up"

**Test Case 1: Email Signup**
- [ ] Click "Sign Up" button
- [ ] **VERIFY:** Clerk signup modal appears
- [ ] Enter email: test-[timestamp]@example.com
- [ ] Enter password: TestPass123!
- [ ] Click "Continue" or "Sign Up"
- [ ] **VERIFY:** Email verification sent (check inbox or skip if dev mode)
- [ ] Complete verification (click link in email OR use dev bypass)
- [ ] **VERIFY:** Redirected to `/onboarding` page
- [ ] **VERIFY:** No 404 errors or broken pages
- [ ] **NOTES:** _________________

**Test Case 2: Google OAuth Signup**
- [ ] Click "Sign Up with Google"
- [ ] **VERIFY:** Google OAuth popup appears
- [ ] Complete Google sign-in (use test Google account)
- [ ] **VERIFY:** Redirected back to TaxBridge
- [ ] **VERIFY:** User is signed in (shows dashboard or onboarding)
- [ ] **NOTES:** _________________

**Test Case 3: Duplicate Email**
- [ ] Try signing up with same email as Test Case 1
- [ ] **VERIFY:** Error message "Email already exists" or similar
- [ ] **VERIFY:** User is NOT created twice
- [ ] **NOTES:** _________________

### 2.2 Onboarding Flow (Post-Signup)
After signup, user should land on `/onboarding`

- [ ] **VERIFY:** Onboarding page loads (no 500 errors)
- [ ] Complete onboarding questions (if any)
- [ ] **VERIFY:** Data is saved (check dashboard after)
- [ ] **VERIFY:** Redirected to `/dashboard` after completion
- [ ] **NOTES:** _________________

---

## 💳 SECTION 3: PAYMENT FLOW

### 3.1 Stripe Checkout - Pro Plan
Test URL: `https://taxbridge.app/pricing` or click "Upgrade to Pro"

**⚠️ CRITICAL: Verify Stripe is in LIVE MODE (not test mode)**
- [ ] Check page source or network tab for Stripe keys
- [ ] **VERIFY:** Stripe publishable key starts with `pk_live_` (NOT `pk_test_`)
- [ ] **IF TEST MODE DETECTED:** 🚨 **STOP TEST - REVENUE BLOCKER** 🚨

**Test Case 1: Successful Payment**
- [ ] Navigate to Pricing page: `https://taxbridge.app/pricing`
- [ ] Click "Upgrade to Pro" or "Buy Now" for Pro plan ($49 or $79 annual)
- [ ] **VERIFY:** Stripe Checkout popup appears
- [ ] Enter test card: `4242 4242 4242 4242`
- [ ] Enter expiry: `12/34`, CVC: `123`, ZIP: `12345`
- [ ] Click "Pay"
- [ ] **VERIFY:** Payment processes (loading state shows)
- [ ] **VERIFY:** Redirected to success page or dashboard
- [ ] **VERIFY:** "Pro" badge appears on dashboard
- [ ] **VERIFY:** User has access to Pro features
- [ ] Check Stripe Dashboard → Verify payment appears (if you have access)
- [ ] **NOTES:** _________________

**Test Case 2: Declined Card**
- [ ] Start checkout flow again (use different test email)
- [ ] Enter declined card: `4000 0000 0000 0002`
- [ ] Click "Pay"
- [ ] **VERIFY:** Error message appears: "Your card was declined"
- [ ] **VERIFY:** User is NOT charged
- [ ] **VERIFY:** User does NOT get Pro access
- [ ] **NOTES:** _________________

**Test Case 3: 3D Secure Card**
- [ ] Start checkout flow again
- [ ] Enter 3DS card: `4000 0025 0000 3155`
- [ ] Click "Pay"
- [ ] **VERIFY:** 3D Secure popup appears (Stripe test mode shows "Complete" button)
- [ ] Complete 3DS authentication
- [ ] **VERIFY:** Payment succeeds
- [ ] **VERIFY:** User gets Pro access
- [ ] **NOTES:** _________________

**Test Case 4: Abandoned Checkout**
- [ ] Start checkout flow
- [ ] Close Stripe popup WITHOUT paying
- [ ] **VERIFY:** User is NOT charged
- [ ] **VERIFY:** User does NOT get Pro access
- [ ] **VERIFY:** No errors on page
- [ ] **NOTES:** _________________

### 3.2 Payment Flow - Mobile
**Device:** iPhone / Android

- [ ] Navigate to Pricing page on mobile
- [ ] Start checkout flow
- [ ] **VERIFY:** Stripe Checkout is mobile-responsive
- [ ] **VERIFY:** Card input fields are tappable
- [ ] **VERIFY:** "Pay" button is visible and tappable
- [ ] Complete payment with test card
- [ ] **VERIFY:** Payment succeeds on mobile
- [ ] **NOTES:** _________________

---

## 📊 SECTION 4: DASHBOARD ACCESS

### 4.1 Dashboard - Free User
After signing up (before payment):

- [ ] Navigate to `https://taxbridge.app/dashboard`
- [ ] **VERIFY:** Dashboard loads (no 500 errors)
- [ ] **VERIFY:** "Free" or "Basic" plan badge shows
- [ ] **VERIFY:** Limited features (e.g., cannot access multi-year, import, etc.)
- [ ] **VERIFY:** "Upgrade to Pro" CTA is visible
- [ ] **NOTES:** _________________

### 4.2 Dashboard - Pro User
After successful payment:

- [ ] Navigate to `https://taxbridge.app/dashboard`
- [ ] **VERIFY:** "Pro" badge shows
- [ ] **VERIFY:** All Pro features are accessible:
  - [ ] Multi-Year Tax Projection (`/dashboard/multi-year`)
  - [ ] Import RSU Data (`/dashboard/import`)
  - [ ] AI Tax Advisor (if feature exists)
- [ ] **VERIFY:** No "Upgrade" paywall blocks Pro features
- [ ] **NOTES:** _________________

### 4.3 Dashboard - Navigation
Test all dashboard navigation links:

- [ ] Click "Overview" → **VERIFY:** Loads dashboard home
- [ ] Click "Multi-Year" → **VERIFY:** Loads multi-year page
- [ ] Click "Import" → **VERIFY:** Loads import page
- [ ] Click "Settings" or "Account" → **VERIFY:** Loads settings
- [ ] Click "Sign Out" → **VERIFY:** User is logged out, redirected to home
- [ ] **NOTES:** _________________

### 4.4 Dashboard - Mobile
**Device:** iPhone / Android

- [ ] Visit dashboard on mobile
- [ ] **VERIFY:** Navigation menu is accessible (hamburger menu works)
- [ ] **VERIFY:** Dashboard cards are stacked vertically (no horizontal scroll)
- [ ] **VERIFY:** All buttons/links are tappable
- [ ] **VERIFY:** Charts are responsive (if any)
- [ ] **NOTES:** _________________

---

## 🐛 SECTION 5: BUG HUNTING

### 5.1 Console Errors
**For EVERY page tested:**

- [ ] Open browser DevTools (F12) → Console tab
- [ ] Refresh page
- [ ] **VERIFY:** No red errors in console
- [ ] **VERIFY:** No warnings about missing images/resources
- [ ] **VERIFY:** No PII (emails, names, tax data) logged to console
- [ ] **NOTES:** _________________

### 5.2 Network Errors
**For EVERY page tested:**

- [ ] Open DevTools → Network tab
- [ ] Refresh page
- [ ] **VERIFY:** All requests return 200 (green) or 304 (cached)
- [ ] **VERIFY:** No 404 (missing resources) or 500 (server errors)
- [ ] **VERIFY:** API calls to `/api/*` complete successfully
- [ ] **NOTES:** _________________

### 5.3 Broken Links
Test all major navigation links:

- [ ] Homepage: `https://taxbridge.app`
- [ ] Pricing: `https://taxbridge.app/pricing`
- [ ] About: `https://taxbridge.app/about` (if exists)
- [ ] Blog: `https://taxbridge.app/blog` (if exists)
- [ ] Privacy Policy: `https://taxbridge.app/privacy` (if exists)
- [ ] Terms of Service: `https://taxbridge.app/terms` (if exists)
- [ ] **VERIFY:** No 404 errors
- [ ] **NOTES:** _________________

### 5.4 Mobile Layout Breaks
**Device:** iPhone / Android

Test these pages for mobile layout issues:
- [ ] Homepage
- [ ] Calculator (already tested above)
- [ ] Pricing page
- [ ] Dashboard
- [ ] **VERIFY:** No horizontal scrolling
- [ ] **VERIFY:** No text overlapping
- [ ] **VERIFY:** No buttons/links too small to tap
- [ ] **VERIFY:** No images overflowing screen
- [ ] **NOTES:** _________________

### 5.5 Cross-Browser Rendering Issues
Test these pages on Safari, Firefox, Edge:
- [ ] Homepage
- [ ] Calculator
- [ ] Pricing
- [ ] Dashboard
- [ ] **VERIFY:** All pages render correctly (no layout breaks)
- [ ] **VERIFY:** All CSS/styles load
- [ ] **VERIFY:** All fonts load
- [ ] **NOTES:** _________________

---

## 🔒 SECTION 6: SECURITY & PRIVACY

### 6.1 HTTPS Verification
- [ ] Visit `http://taxbridge.app` (without 's')
- [ ] **VERIFY:** Redirects to `https://taxbridge.app`
- [ ] **VERIFY:** Browser shows padlock icon (secure connection)
- [ ] **NOTES:** _________________

### 6.2 Auth Protection
- [ ] Log out (if signed in)
- [ ] Try accessing `https://taxbridge.app/dashboard` while logged out
- [ ] **VERIFY:** Redirected to sign-in page OR blocked
- [ ] Try accessing `https://taxbridge.app/dashboard/multi-year` while logged out
- [ ] **VERIFY:** Redirected to sign-in page OR blocked
- [ ] **NOTES:** _________________

### 6.3 Rate Limiting (Optional - requires multiple requests)
- [ ] Submit calculator form 10 times rapidly
- [ ] **VERIFY:** Either works fine OR rate limit message appears after ~5-10 requests
- [ ] **NOTES:** _________________

---

## 🚀 SECTION 7: PERFORMANCE

### 7.1 Page Load Speed
Test on 3G throttled network (Chrome DevTools → Network → Slow 3G):
- [ ] Homepage loads in < 5 seconds
- [ ] Calculator page loads in < 5 seconds
- [ ] Dashboard loads in < 5 seconds
- [ ] **NOTES:** _________________

### 7.2 Lighthouse Audit (Desktop)
- [ ] Open Chrome DevTools → Lighthouse tab
- [ ] Run audit on `https://taxbridge.app`
- [ ] **VERIFY:** Performance score > 80
- [ ] **VERIFY:** Accessibility score > 90
- [ ] **VERIFY:** SEO score > 85
- [ ] **NOTES:** _________________

### 7.3 Lighthouse Audit (Mobile)
- [ ] Run Lighthouse audit with "Mobile" device selected
- [ ] **VERIFY:** Performance score > 70
- [ ] **VERIFY:** Accessibility score > 90
- [ ] **NOTES:** _________________

---

## 📝 SECTION 8: ACCESSIBILITY

### 8.1 Keyboard Navigation
- [ ] Navigate homepage using only Tab key
- [ ] **VERIFY:** Focus indicator is visible on all interactive elements
- [ ] **VERIFY:** Can reach all buttons/links with Tab
- [ ] **VERIFY:** Can activate buttons with Enter key
- [ ] **NOTES:** _________________

### 8.2 Screen Reader (Optional - if you have VoiceOver/NVDA)
- [ ] Enable VoiceOver (Mac) or NVDA (Windows)
- [ ] Navigate calculator form
- [ ] **VERIFY:** All input labels are read aloud
- [ ] **VERIFY:** Button purposes are clear
- [ ] **VERIFY:** Results are announced
- [ ] **NOTES:** _________________

### 8.3 Color Contrast
- [ ] Use browser extension (e.g., Axe DevTools) OR manual check
- [ ] **VERIFY:** All text has sufficient contrast against background
- [ ] **VERIFY:** Links are distinguishable from regular text
- [ ] **NOTES:** _________________

---

## 🎯 CRITICAL BUGS FOUND

**P0 Blockers (Site Broken / Revenue Blocker):**
1. _________________
2. _________________

**P1 High Priority (Major UX Issues):**
1. _________________
2. _________________

**P2 Medium Priority (Minor Bugs):**
1. _________________
2. _________________

**P3 Low Priority (Polish / Nice-to-Have):**
1. _________________
2. _________________

---

## ✅ FINAL SIGN-OFF

**Overall Production Readiness:** [ ] PASS   [ ] FAIL
**Recommended Actions Before Launch:**
1. _________________
2. _________________
3. _________________

**Tester Signature:** _________________
**Date:** _________________
