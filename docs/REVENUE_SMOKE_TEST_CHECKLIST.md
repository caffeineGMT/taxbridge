# Revenue Smoke Test - Quick Checklist

**Task**: [P1-HIGH] Revenue Smoke Test
**Status**: ❌ BLOCKED (Cannot execute until prerequisites met)
**Last Updated**: 2026-03-19

---

## CURRENT STATUS: ❌ BLOCKED

### Blocker 1: Stripe Not Activated ❌
```bash
$ npx tsx scripts/verify-stripe-production.ts
❌ STRIPE PRODUCTION MODE: INACTIVE
Summary: 2 passed, 7 failed, 2 warnings
```

### Blocker 2: Pricing Page 404 ❌
```bash
$ curl -s -o /dev/null -w "%{http_code}" https://taxbridge.vercel.app/pricing
404
```

### Blocker 3: Checkout Page 404 ❌
```bash
$ curl -s -o /dev/null -w "%{http_code}" https://taxbridge.vercel.app/checkout
404
```

---

## PREREQUISITES (Must be ✅ before test)

- [ ] Stripe verification passes
  ```bash
  npx tsx scripts/verify-stripe-production.ts
  # Should show: ✅ STRIPE PRODUCTION MODE IS ACTIVE
  ```

- [ ] Pricing page accessible
  ```bash
  curl -s -o /dev/null -w "%{http_code}" https://taxbridge.vercel.app/pricing
  # Should show: 200
  ```

- [ ] Checkout page accessible
  ```bash
  curl -s -o /dev/null -w "%{http_code}" https://taxbridge.vercel.app/checkout
  # Should show: 200
  ```

---

## EXECUTION STEPS (After prerequisites met)

### 1. Start Screen Recording 🎥
- **macOS**: `Command + Shift + 5` → Record Entire Screen
- **Windows**: `Windows + G` → Record
- **Linux**: SimpleScreenRecorder

### 2. Navigate to Pricing
```bash
open https://taxbridge.vercel.app/pricing
```
- [ ] Pricing page loads successfully
- [ ] All plan cards visible (Free, Pro, Enterprise)
- [ ] Prices display correctly ($49/year, $79/year)

### 3. Select Plan
- [ ] Click "Subscribe" on **Pro plan** ($79/year)
- [ ] Redirects to checkout page
- [ ] Screenshot: Plan selection

### 4. Complete Checkout
- [ ] Checkout page loads with Stripe form
- [ ] Enter **REAL credit card** (or test card: 4242 4242 4242 4242)
  - Card: `4242 4242 4242 4242`
  - Expiry: `12/26` (any future date)
  - CVC: `123` (any 3 digits)
  - ZIP: `90210` (any 5 digits)
- [ ] Click "Pay $79"
- [ ] Payment processes successfully
- [ ] Redirects to success/dashboard page
- [ ] Screenshot: Checkout form
- [ ] Screenshot: Success page

### 5. Verify Charge in Stripe Dashboard 💳
```bash
open https://dashboard.stripe.com/payments
```
- [ ] Latest payment appears in list
- [ ] Amount: **$79.00**
- [ ] Status: **Succeeded**
- [ ] Customer email matches
- [ ] Screenshot: Stripe payment details
- [ ] Note charge ID: `ch_...`

### 6. Verify Paid Features 🎯
```bash
open https://taxbridge.vercel.app/dashboard
```
- [ ] User profile shows "Pro" plan
- [ ] Unlimited RSU entries enabled
- [ ] PDF export button visible
- [ ] Multi-year dashboard accessible
- [ ] Screenshot: Dashboard showing Pro features

### 7. Refund Payment IMMEDIATELY 💰
In Stripe Dashboard:
- [ ] Click on the $79 payment
- [ ] Click "Refund payment"
- [ ] Select "Full refund" ($79.00)
- [ ] Enter reason: "Revenue smoke test - refunding immediately"
- [ ] Click "Refund $79.00"
- [ ] Screenshot: Refund confirmation

### 8. Verify Refund
- [ ] Refund status: **Succeeded**
- [ ] Amount refunded: **$79.00**
- [ ] User account downgraded to Free tier
- [ ] Screenshot: Refund details

### 9. Stop Recording 🎬
- [ ] Save screen recording to `docs/screenshots/revenue-smoke-test-{date}/recording.mp4`

### 10. Generate Report 📄
- [ ] Save all screenshots to `docs/screenshots/revenue-smoke-test-{date}/`
- [ ] Create report: `docs/REVENUE_SMOKE_TEST_REPORT_{date}.md`
- [ ] Include:
  - Timestamp
  - Payment charge ID
  - Refund confirmation
  - All screenshots
  - Screen recording link

---

## VERIFICATION REPORT

After completion, report should include:

```markdown
# Revenue Smoke Test Report - {DATE}

## Test Results: ✅ PASSED

### Payment Flow
- Timestamp: {timestamp}
- Plan: Pro ($79/year)
- Payment Method: {card last 4 digits}
- Charge ID: ch_...
- Status: Succeeded → Refunded

### Evidence
- 📸 Screenshots: docs/screenshots/revenue-smoke-test-{date}/ (8 files)
- 🎥 Screen Recording: docs/screenshots/revenue-smoke-test-{date}/recording.mp4 (X min)
- 💳 Stripe Dashboard: Payment visible + refunded
- 🎯 Paid Features: Verified accessible before refund

### Conclusion
✅ Revenue capability VERIFIED
✅ Payment flow works end-to-end
✅ Stripe integration functional
✅ Paid features activate correctly
✅ Refund process works

**Ready for production revenue.**
```

---

## TIMELINE

| Phase | Task | Duration | Status |
|-------|------|----------|--------|
| Pre | Fix Stripe placeholders | 60 min | ❌ Not started |
| Pre | Fix 404 pages | 30 min | ❌ Not started |
| Test | Execute payment flow | 20 min | ⏸️ Blocked |
| Test | Verify and refund | 5 min | ⏸️ Blocked |
| Test | Document evidence | 5 min | ⏸️ Blocked |

**Total**: 2 hours (if no issues)

---

## RISK / ISSUES

- ❌ **CANNOT START** until Stripe activated and pages fixed
- ❌ If pages still 404 after redeployment → investigate build logs
- ❌ If Stripe payment fails → check Stripe dashboard for error details
- ⚠️ Use **TEST card** if testing before launch (4242 4242 4242 4242)
- ⚠️ Use **REAL card** for final production verification (then refund)

---

## FILES

- **Full Verification Report**: `docs/REVENUE_SMOKE_TEST_VERIFICATION_2026-03-19.md`
- **Executive Summary**: `docs/REVENUE_SMOKE_TEST_EXECUTIVE_SUMMARY.md`
- **Stripe Activation Guide**: `docs/STRIPE_PRODUCTION_ACTIVATION_CHECKLIST.md`
- **This Checklist**: `docs/REVENUE_SMOKE_TEST_CHECKLIST.md`

---

## DECISION

**Cannot proceed with revenue smoke test until blockers are resolved.**

**Next Action**: Fix Stripe placeholders + 404 pages (2 hours)
**Then**: Execute this checklist (30 minutes)

**Owner**: CTO/Engineering Lead with Vercel + Stripe access
