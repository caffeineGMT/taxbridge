# Task Verification Policy - Executive Summary

**Effective Date:** March 19, 2026
**Policy Owner:** Michael Guo (CEO)
**Applies To:** All engineering tasks (P0, P1, P2, P3)

---

## 🎯 The Problem

**6+ sprints** of tasks marked "done" that were not actually complete:
- Stripe "production mode activated" → still in test mode
- Production site "fixed" → still returning 503 errors
- Tests "passing" → still failing in CI
- Features "working" → only on localhost, not production

**Cost:** Weeks of wasted effort, zero revenue, blocked launches

---

## ✅ The Solution: Evidence-Based Completion

**New Standard:** A task is NOT "done" until you provide proof.

### Required Evidence (All Tasks)

1. **Screenshots** - Desktop + mobile views of working feature in production
2. **Deployment URL** - Production URL verified (HTTP 200)
3. **Metrics** - Performance scores, test results, analytics
4. **Build verification** - Zero errors, passing tests
5. **Verification report** - Generated and committed to Git

### No Proof = Not Done

If you can't provide evidence, the task isn't complete.

---

## 🚀 How It Works (5 Minutes)

### Step 1: Run Automated Verification

```bash
npm run verify:task -- \
  --task-id=P0-001 \
  --feature-url=/calculator \
  --title="Fix calculator bug"
```

### Step 2: Review Report

Check: `docs/verification-reports/YYYY-MM-DD-task-P0-001-VERIFICATION.md`

- **✅ PASSED** → Mark task "done", commit evidence
- **❌ FAILED** → Fix issues, re-run verification

### Step 3: Commit Evidence

```bash
git add docs/screenshots/ docs/verification-reports/
git commit -m "[P0-001] Fix calculator + VERIFICATION"
git push origin main
```

---

## 📋 What Gets Verified

### Automated Checks

- ✅ Screenshots (desktop 1920x1080, mobile 375x667)
- ✅ Production deployment (HTTP 200 status)
- ✅ Build status (npm run build - zero errors required)
- ✅ Test suite (npm test - 100% passing required)
- ✅ Lighthouse audit (performance >85, accessibility >90)
- ✅ Response time (<3000ms)
- ✅ Build size (<150MB)

### Manual Checks (As Needed)

- ✅ Payment flow (Stripe test payment with screenshot)
- ✅ Analytics (PostHog event firing with screenshot)
- ✅ SEO (Google Search Console indexing with screenshot)
- ✅ Edge cases (zero values, invalid input, error handling)

---

## 🔥 Real Example: Stripe Production Mode

### ❌ WRONG (How we did it for 6 sprints)

```bash
# Updated .env.production
git commit -m "Enable Stripe production"
# Marked task "done"
```

**Result:** Claimed "done" but Stripe stayed in test mode.

### ✅ RIGHT (Evidence-based)

```bash
# 1. Update keys
# 2. Deploy
npm run build
git push origin main

# 3. Verify
npm run verify:task -- --task-id=P0-STRIPE --feature-url=/checkout

# 4. Test payment manually
# - Use test card 4242 4242 4242 4242
# - Screenshot Stripe dashboard showing LIVE transaction
# - Include transaction ID: pi_abc123

# 5. Commit evidence
git add docs/screenshots/ docs/verification-reports/
git commit -m "[P0-STRIPE] Stripe Live + VERIFICATION (tx: pi_abc123)"
git push origin main
```

**Result:** Verified working with proof. Cannot dispute.

---

## 📊 Success Criteria by Task Type

### Revenue Features (P0 Critical)
- ✅ Stripe dashboard screenshot showing LIVE transaction
- ✅ Transaction ID documented
- ✅ Webhook event log
- ✅ Keys verified (sk_live_ not sk_test_)

### Calculator/Logic Features
- ✅ Unit tests 100% passing
- ✅ Known test case verification with screenshots
- ✅ Edge cases tested (zero, negative, max values)

### SEO Features
- ✅ Google Search Console screenshot showing indexing
- ✅ Sitemap validation (HTTP 200)
- ✅ Lighthouse SEO >90

### Analytics Features
- ✅ PostHog dashboard screenshot showing event
- ✅ Test event generated and verified
- ✅ Funnel step tracking confirmed

---

## 🚫 Enforcement

### Pull Request Requirements
- ✅ Link to verification report in PR description
- ✅ Screenshots committed to `docs/screenshots/`
- ✅ Verification report committed to `docs/verification-reports/`
- ✅ Commit message: `"[TASK-ID] Description + VERIFICATION"`

### Task Tracker Requirements
- ✅ Paste verification report link in task comments
- ✅ Attach screenshots
- ✅ Reference commit SHA

### No Exceptions
- P0 tasks: 100% verification required
- P1 tasks: 100% verification required
- P2 tasks: 100% verification required
- P3 tasks: Automated optional, manual checklist required

---

## 📚 Documentation

- **Quick Start:** `docs/TASK_VERIFICATION_PROCESS.md` (this document)
- **Detailed Guide:** `docs/TASK_VERIFICATION_PROCESS.md` (35-page manual)
- **Template:** `docs/TASK_VERIFICATION_TEMPLATE.md` (blank checklist)
- **Script:** `scripts/verify-task-completion.ts` (automation)

---

## 💡 Key Principles

1. **If it's not in production, it's not done**
2. **If it's not verified, it's not done**
3. **If there are no screenshots, it's not done**
4. **If the tests don't pass, it's not done**
5. **If you can't prove it works, it's not done**

---

## ❓ FAQ

**Q: What if automated verification fails?**
A: Fix the issue or use manual verification checklist. Don't mark "done" until verification passes.

**Q: Can I skip verification for small fixes?**
A: No. Every task requires verification, no matter how small.

**Q: What if I'm blocked waiting for deployment?**
A: Fix deployment blocker first. Don't mark "done" until deployed + verified.

**Q: Do I need screenshots for backend tasks?**
A: Yes. Screenshot API responses, database states, or logs.

---

## 🎯 Bottom Line

**Before marking any task "done":**

```bash
# 1. Deploy to production
npm run build
git push origin main

# 2. Run verification
npm run verify:task -- --task-id=XXX --feature-url=/feature --title="Task"

# 3. Commit evidence
git add docs/screenshots/ docs/verification-reports/
git commit -m "[XXX] Task + VERIFICATION"
git push origin main

# 4. Mark as "done" ONLY if verification passed
```

**Standard:** If it's not verified, it's not done.

---

**Questions?** Contact Michael Guo (CEO)
**Policy Status:** MANDATORY
**Compliance:** 100% required for all engineering tasks
