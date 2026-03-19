# 🎬 REVENUE SMOKE TEST - SCREEN RECORDING CHECKLIST

**Print this or view on second screen during testing**

---

## PRE-TEST SETUP (5 min)

### ✅ Prerequisites Verified
- [ ] Stripe production keys configured in Vercel (not placeholders)
- [ ] Ran `npx tsx scripts/verify-stripe-mode.ts` → ✅ PRODUCTION MODE ACTIVE
- [ ] Credit card ready (will charge $49 or $79, refunded at end)
- [ ] Second browser tab open to https://dashboard.stripe.com/payments

### 🎥 Start Screen Recording

**macOS**:
```
Command + Shift + 5
→ Click "Record Entire Screen"
→ Click "Record"
```

**Windows**:
```
Windows + G
→ Click "Record" button
```

**Linux**:
```
Open SimpleScreenRecorder
→ Select full screen
→ Click "Start Recording"
```

---

## TEST EXECUTION (30 min)

### Terminal Command
```bash
npx tsx scripts/end-to-end-revenue-smoke-test.ts
```

### 📋 Recording Checklist

**STEP 1: Prerequisites (Auto)** - Script verifies environment
- [ ] **RECORD**: Terminal showing ✅ All prerequisites met

**STEP 2: Calculator Completion** (Manual)
- [ ] **RECORD**: Open https://taxbridge.vercel.app
- [ ] **RECORD**: Enter test data:
  - Visa Type: H-1B
  - Yearly Income: $150,000
  - RSU Value: $50,000
  - Canadian Province: Ontario
  - Working from Canada: Yes
- [ ] **RECORD**: Calculator results page
- [ ] **RETURN TO TERMINAL**: Type email and confirm

**STEP 3: User Signup** (Manual)
- [ ] **RECORD**: Click "Sign Up" or "Create Account"
- [ ] **RECORD**: Enter email (same as terminal)
- [ ] **RECORD**: Complete signup flow
- [ ] **RECORD**: Login confirmation / dashboard
- [ ] **RETURN TO TERMINAL**: Confirm logged in

**STEP 4: Checkout & Payment** (Manual + Auto)
- [ ] **RECORD**: Select plan (Basic $49 or Pro $79)
- [ ] **RECORD**: Stripe Checkout page loads
- [ ] **RECORD**: Enter REAL credit card details
  - Card: 4242 4242 4242 4242 (test card) OR real card
  - Expiry: Any future date
  - CVC: Any 3 digits
  - ZIP: Any 5 digits
- [ ] **RECORD**: Click "Subscribe" button
- [ ] **RECORD**: Payment confirmation page
- [ ] **RETURN TO TERMINAL**: Press Enter when done
- [ ] **WAIT**: Terminal polls Stripe (auto)

**STEP 5: Stripe Dashboard** (Manual Verification)
- [ ] **SWITCH TAB**: https://dashboard.stripe.com/payments
- [ ] **RECORD**: Search for payment (newest)
- [ ] **RECORD**: Payment status showing "Succeeded"
- [ ] **RECORD**: Subscription tab showing "Active"
- [ ] **RECORD**: Webhooks tab showing "checkout.session.completed" delivered
- [ ] **RETURN TO TERMINAL**: Confirm verified

**STEP 6: Access Verification** (Manual + Auto)
- [ ] **SWITCH TO APP**: Dashboard page
- [ ] **RECORD**: Upgraded tier badge (Basic or Pro)
- [ ] **RECORD**: Add multiple RSU entries (>10 for Basic, unlimited for Pro)
- [ ] **RECORD**: PDF export button enabled (click to test)
- [ ] **RECORD** (Pro only): Multi-year dashboard accessible
- [ ] **RETURN TO TERMINAL**: Confirm features work

**STEP 7: Refund** (Auto)
- [ ] **RECORD**: Terminal showing refund creation
- [ ] **RECORD**: Terminal showing refund ID and amount
- [ ] **RECORD**: Terminal showing subscription cancelled
- [ ] **SWITCH TO STRIPE**: Refresh payments page
- [ ] **RECORD**: Refund showing in Stripe dashboard

**STEP 8: Report** (Auto)
- [ ] **RECORD**: Terminal showing ✅ TEST COMPLETE
- [ ] **RECORD**: Terminal showing test summary (X/8 passed)
- [ ] **OPEN FILE**: `docs/END_TO_END_REVENUE_SMOKE_TEST_REPORT.md`
- [ ] **RECORD**: Scroll through entire report

---

## 🛑 STOP RECORDING

**macOS**: Click "Stop" in menu bar
**Windows**: `Windows + Alt + R`
**Linux**: Click "Stop" in SimpleScreenRecorder

---

## POST-TEST CHECKLIST

### ✅ Video File
- [ ] Recording saved successfully
- [ ] File size > 50 MB (30 min video)
- [ ] Video plays back correctly
- [ ] All steps are visible

### ✅ Test Report
- [ ] File exists: `docs/END_TO_END_REVENUE_SMOKE_TEST_REPORT.md`
- [ ] Overall Status: ✅ PASSED
- [ ] All 7/8 steps show PASS or MANUAL
- [ ] No steps show FAIL

### ✅ Stripe Dashboard
- [ ] Payment shows "Succeeded"
- [ ] Refund shows "Succeeded"
- [ ] Subscription shows "Canceled"
- [ ] No outstanding charges

### ✅ Database (Optional)
```bash
# Check user tier was upgraded
sqlite3 data/taxbridge.db "SELECT email, subscription_tier, subscription_status FROM user_profiles WHERE email = 'test@example.com';"
```

Should show: `test@example.com|pro|canceled` or `test@example.com|basic|canceled`

---

## 📤 DELIVERABLES

Upload to task tracker:

1. **Screen Recording** (`revenue-smoke-test-YYYY-MM-DD.mp4`)
2. **Test Report** (`docs/END_TO_END_REVENUE_SMOKE_TEST_REPORT.md`)
3. **Stripe Screenshots** (3 images):
   - Payment succeeded
   - Refund succeeded
   - Subscription canceled

---

## ⚠️ IF ANYTHING FAILS

### Test Fails Before Payment
- Check: `docs/END_TO_END_REVENUE_SMOKE_TEST_REPORT.md` for error details
- Fix issue and re-run test
- No refund needed (no payment made)

### Test Fails After Payment
- **IMPORTANT**: Manual refund required if script fails
- Go to https://dashboard.stripe.com/payments
- Find payment → Click "Refund"
- Cancel subscription manually

### Can't Find Payment in Stripe
- Wait 30 seconds and refresh
- Check email filter matches
- Check payment date (within last 10 minutes)
- Manually search by amount ($49 or $79)

---

## 📊 EXPECTED RESULTS

### ✅ Passing Test
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ END-TO-END REVENUE SMOKE TEST COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Overall Status: ✅ PASSED
Pass Rate: 7 / 8 (87.5%)

Results:
  ✅ Passed: 7
  ❌ Failed: 0
  ⏭️  Skipped: 0
  📝 Manual: 1
```

### ❌ Failing Test (Placeholder Keys)
```
❌ Cannot proceed - prerequisites not met
❌ Missing or placeholder environment variables:
   • STRIPE_SECRET_KEY
   • NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

Fix: Configure production keys in Vercel
Run: npx tsx scripts/verify-stripe-mode.ts
```

---

## 🚨 EMERGENCY CONTACTS

**Stripe Support**: https://support.stripe.com
**Vercel Support**: https://vercel.com/support
**Test Script Issues**: See `scripts/end-to-end-revenue-smoke-test.ts` line numbers in error

---

**Quick Start**: https://github.com/taxbridge/docs/REVENUE_SMOKE_TEST_EXECUTIVE_SUMMARY.md
**Full Report**: https://github.com/taxbridge/docs/REVENUE_SMOKE_TEST_BLOCKER_REPORT.md
