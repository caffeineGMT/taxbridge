# Task Verification System

This directory contains the **Task Verification System** - a mandatory evidence-based completion process for all engineering tasks at TaxBridge.

---

## 🎯 Purpose

**Problem:** Tasks were being marked "done" without proof, leading to:
- 6+ sprints claiming "Stripe production activated" → still in test mode
- Multiple sprints claiming "production site fixed" → still returning errors
- Zero accountability for completion claims

**Solution:** Evidence-based verification requiring screenshots, metrics, and deployment proof before any task can be marked "done".

---

## 📚 Documentation Index

### Start Here
1. **TASK_VERIFICATION_EXECUTIVE_SUMMARY.md** - 5-minute overview for executives/managers
2. **TASK_VERIFICATION_QUICK_REFERENCE.md** - Print-friendly quick reference card for engineers

### Complete Guide
3. **TASK_VERIFICATION_PROCESS.md** - Complete 35-page manual with examples and workflows

### Templates
4. **TASK_VERIFICATION_TEMPLATE.md** - Blank checklist for manual verification

---

## 🚀 Quick Start for Engineers

### Run Automated Verification

```bash
npm run verify:task -- \
  --task-id=P0-001 \
  --feature-url=/calculator \
  --title="Fix calculator bug"
```

This automatically:
- ✅ Captures screenshots (desktop + mobile)
- ✅ Verifies deployment (HTTP 200)
- ✅ Runs build (zero errors required)
- ✅ Runs tests (100% pass required)
- ✅ Runs Lighthouse audit
- ✅ Generates verification report

### Review Results

Check: `verification-reports/YYYY-MM-DD-task-P0-001-VERIFICATION.md`

- **✅ PASSED** → Mark task "done", commit evidence
- **❌ FAILED** → Fix issues, re-run verification

### Commit Evidence

```bash
git add docs/screenshots/ docs/verification-reports/
git commit -m "[P0-001] Fix calculator + VERIFICATION"
git push origin main
```

---

## 📂 Directory Structure

```
docs/
  ├── TASK_VERIFICATION_EXECUTIVE_SUMMARY.md  ← Start here (5-min read)
  ├── TASK_VERIFICATION_QUICK_REFERENCE.md    ← Print this
  ├── TASK_VERIFICATION_PROCESS.md            ← Complete guide
  ├── TASK_VERIFICATION_TEMPLATE.md           ← Manual checklist
  │
  ├── screenshots/                             ← Evidence storage
  │   └── YYYY-MM-DD-task-[id]/
  │       ├── 01-desktop-view.png
  │       ├── 02-mobile-view.png
  │       └── 03-lighthouse-report.json
  │
  ├── verification-reports/                    ← Automated reports
  │   └── YYYY-MM-DD-task-[id]-VERIFICATION.md
  │
  └── build-logs/                              ← Build verification logs
      └── YYYY-MM-DD-task-[id].txt
```

---

## ✅ What Gets Verified

### Automated Checks
- Screenshot capture (1920x1080 desktop, 375x667 mobile)
- Production deployment status (HTTP 200 required)
- Build verification (npm run build - zero errors)
- Test suite (npm test - 100% passing)
- Lighthouse audit (performance >85, accessibility >90)
- Response time (<3000ms)
- Build size (<150MB)

### Manual Checks (As Needed)
- Payment flows (Stripe test transactions)
- Analytics (PostHog event verification)
- SEO (Google Search Console indexing)
- Edge cases (zero values, errors, validation)

---

## 🔥 Real Example

### Task: "Activate Stripe Production Mode"

#### ❌ WRONG (How we did it for 6 sprints)
```bash
# Updated .env.production
git commit -m "Enable Stripe production"
# Marked task "done" ← NO PROOF
```
**Result:** Claimed "done" but Stripe stayed in test mode.

#### ✅ RIGHT (Evidence-based)
```bash
# 1. Update keys, deploy
npm run build
git push origin main

# 2. Run verification
npm run verify:task -- \
  --task-id=P0-STRIPE \
  --feature-url=/checkout \
  --title="Activate Stripe production"

# 3. Manual payment test
# - Visit https://taxbridge.vercel.app/checkout
# - Test card: 4242 4242 4242 4242
# - Screenshot Stripe dashboard (LIVE transaction)
# - Document transaction ID: pi_abc123

# 4. Commit evidence
git add docs/screenshots/ docs/verification-reports/
git commit -m "[P0-STRIPE] Stripe Live + VERIFICATION (tx: pi_abc123)"
git push origin main
```

**Result:** Verified working with proof. Cannot dispute.

---

## 📊 Compliance Requirements

### All Tasks (P0, P1, P2, P3)
- ✅ Feature deployed to production
- ✅ Production URL verified (HTTP 200)
- ✅ Screenshots captured
- ✅ Build passes (zero errors)
- ✅ Tests pass (100%)
- ✅ Verification report generated
- ✅ Evidence committed to Git

### Pull Request Requirements
- ✅ Link to verification report in PR description
- ✅ Screenshots committed
- ✅ Commit message format: `"[TASK-ID] Description + VERIFICATION"`

### Task Tracker Requirements
- ✅ Paste verification report link in task comments
- ✅ Attach screenshots
- ✅ Reference commit SHA

---

## 🚨 Enforcement

**Policy:** MANDATORY for all engineering tasks
**Owner:** Michael Guo (CEO)
**Effective:** March 19, 2026
**Exceptions:** None

**Standard:** If it's not verified, it's not done.

---

## 🛠️ Tools

### Verification Script
- **Location:** `scripts/verify-task-completion.ts`
- **Command:** `npm run verify:task`
- **Dependencies:** @playwright/test, lighthouse (already installed)

### NPM Scripts
```json
{
  "verify:task": "tsx scripts/verify-task-completion.ts"
}
```

---

## 📈 Metrics Dashboard

Track verification compliance:

```bash
# Count verified tasks
ls -1 docs/verification-reports/ | wc -l

# Recent verifications
ls -lt docs/verification-reports/ | head -10

# Screenshot evidence
ls -1 docs/screenshots/ | wc -l
```

**Goal:** 100% of P0/P1 tasks have verification reports.

---

## ❓ FAQ

**Q: What if automated verification fails?**
A: Investigate why. Use manual checklist if automation broken. Don't mark "done" until verification passes.

**Q: Can I skip verification for small tasks?**
A: No. Every task requires verification.

**Q: What if deployment is blocked?**
A: Fix deployment blocker first. Don't mark "done" until deployed + verified.

**Q: Do backend tasks need screenshots?**
A: Yes. Screenshot API responses, database states, or logs.

---

## 🎓 Training Resources

1. **New Engineers:** Read TASK_VERIFICATION_EXECUTIVE_SUMMARY.md
2. **Quick Reference:** Print TASK_VERIFICATION_QUICK_REFERENCE.md
3. **Complete Guide:** Read TASK_VERIFICATION_PROCESS.md for detailed workflows
4. **Practice:** Run verification on a test task to learn the workflow

---

## 📞 Support

**Questions?** Contact Michael Guo (CEO)
**Issues with automation?** File GitHub issue with "verification" label
**Documentation updates?** Submit PR to docs/TASK_VERIFICATION_*

---

## 🔄 Version History

- **v1.0** (2026-03-19): Initial release
  - Automated verification script
  - Complete documentation suite
  - Evidence storage structure
  - Mandatory enforcement policy

---

**Bottom Line:** No task is "done" until you can prove it works in production.
