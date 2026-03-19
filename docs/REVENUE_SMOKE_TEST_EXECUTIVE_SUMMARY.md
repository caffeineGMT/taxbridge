# Revenue Smoke Test - Executive Summary

**Status**: ❌ **BLOCKED**
**Blocker**: Stripe production keys are placeholders, not real API keys
**Impact**: Cannot execute real payment test | $0 MRR capability | 8+ sprints blocked
**Time to Unblock**: 30-60 minutes (manual Stripe configuration)
**Time to Complete After Unblock**: 30 minutes (automated script execution)

---

## TL;DR

**YOU CANNOT RUN THE REVENUE SMOKE TEST** until you replace placeholder Stripe keys with real production keys.

Current state:
```bash
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY_HERE  # ❌ PLACEHOLDER
```

Required state:
```bash
STRIPE_SECRET_KEY=sk_live_51AbCdEf...actual_key  # ✅ REAL KEY
```

---

## QUICK UNBLOCK (30-60 min)

### Step 1: Get Stripe Keys (5 min)
- Go to https://dashboard.stripe.com/apikeys
- Toggle to **"Production"** mode
- Copy `sk_live_...` and `pk_live_...`

### Step 2: Create Price IDs (10 min)
```bash
export STRIPE_SECRET_KEY=sk_live_your_real_key
npx tsx scripts/activate-stripe-production-annual.ts
```
Copy price IDs from output

### Step 3: Create Webhook (5 min)
- Go to https://dashboard.stripe.com/webhooks
- URL: `https://taxbridge.vercel.app/api/stripe/webhook`
- Events: `checkout.session.completed`, `customer.subscription.*`
- Copy `whsec_...` secret

### Step 4: Update Vercel (10 min)
- Go to https://vercel.com/taxbridge/settings/environment-variables
- Update ALL 5 keys with REAL values (not placeholders)

### Step 5: Verify (5 min)
```bash
npx tsx scripts/verify-stripe-mode.ts
# Should show: ✅ PRODUCTION MODE ACTIVE
```

---

## EXECUTE TEST (30 min - AFTER unblock)

```bash
# Screen record this:
npx tsx scripts/end-to-end-revenue-smoke-test.ts
```

The script will:
1. ✅ Auto-verify real keys (blocks if placeholders)
2. 📊 Guide you through calculator
3. 💳 Execute REAL payment ($49 or $79)
4. 🔍 Verify Stripe dashboard
5. ✅ Verify paid features
6. 💰 Auto-refund
7. 📄 Generate report

---

## SCREEN RECORDING

**macOS**: `Command + Shift + 5` → Record Entire Screen
**Windows**: `Windows + G` → Record
**Linux**: Use SimpleScreenRecorder

Record entire flow from calculator → refund.

---

## WHY THIS HAPPENED (8+ Sprints of "Fixed")

**Root Cause**: Keys have correct PREFIX (`sk_live_`) but VALUES are placeholders.

Previous sprints checked PREFIX ✅ but NOT actual VALUE ❌

**Pattern**:
- Sprint 04-13: All claimed "Stripe production activated"
- Reality: All had `sk_live_YOUR_LIVE_SECRET_KEY_HERE`
- Build passed, code compiled, but payment gateway 100% broken

---

## DECISION REQUIRED

Choose ONE:

1. **RECOMMENDED**: Configure existing Stripe (70 min total)
   - Execute smoke test TODAY
   - Product Hunt launch with working payments

2. Create new Stripe account (1-3 days + 70 min)
   - Requires business verification
   - Delays smoke test by 1-3 days

3. Defer (NOT recommended)
   - Continues $0 MRR
   - Product Hunt launch WITHOUT working payments

---

## EVIDENCE

**Verification Report**: `docs/STRIPE_MODE_VERIFICATION_REPORT.md`
**Full Blocker Report**: `docs/REVENUE_SMOKE_TEST_BLOCKER_REPORT.md`
**Verification Command**: `npx tsx scripts/verify-stripe-mode.ts`

**Result**: ❌ 21/21 Stripe variables are PLACEHOLDERS or MISSING (99% confidence)

---

## DELIVERABLES (When Unblocked)

1. Screen recording (calculator → checkout → refund)
2. Test report: `docs/END_TO_END_REVENUE_SMOKE_TEST_REPORT.md`
3. Stripe dashboard screenshots
4. Database upgrade evidence
5. Paid feature access screenshots

---

**Next Action**: Michael to configure Stripe production keys (30-60 min)
**Then**: Run `npx tsx scripts/end-to-end-revenue-smoke-test.ts` (30 min)
**Total Time**: 60-90 minutes from now to complete task
