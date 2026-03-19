# Task Completion Policy - MANDATORY

**Effective Date**: 2026-03-19
**Status**: MANDATORY - All engineers must comply
**Owner**: Michael Guo (CEO)

---

## 🎯 The Rule

**NO TASK CAN BE MARKED "DONE" WITHOUT EVIDENCE.**

Period. No exceptions. No "I tested it locally." No "It works on my machine." No "Trust me."

---

## 📋 What Counts as Evidence

You MUST provide **AT LEAST ONE** of the following for every task:

### 1. Screenshots
- ✅ Desktop view (1920x1080)
- ✅ Mobile view (375x667)
- ✅ Feature working in PRODUCTION (not localhost)
- Save to: `docs/screenshots/YYYY-MM-DD-task-[ID]/`

### 2. Video Recording
- ✅ Screen recording showing feature working end-to-end
- ✅ Max 2 minutes
- ✅ Production URL visible in address bar
- Save to: `docs/videos/YYYY-MM-DD-task-[ID]/`

### 3. Logs/Terminal Output
- ✅ Build output (must show ZERO errors)
- ✅ Test results (must show 100% passing)
- ✅ Deployment logs (must show successful deploy)
- Save to: `docs/logs/YYYY-MM-DD-task-[ID]/`

### 4. Deployed Feature URL
- ✅ Production URL must return HTTP 200
- ✅ Must be accessible publicly
- ✅ Must show feature working as intended
- Document in verification report

### 5. Analytics Data
- ✅ PostHog event firing
- ✅ Google Analytics tracking
- ✅ Stripe transaction ID
- ✅ Error rate metrics (Sentry)
- Screenshot dashboard showing data

---

## ⚡ Quick Start (5 Minutes)

### Automated Verification (Recommended)
```bash
npm run verify:task -- \
  --task-id=P0-001 \
  --feature-url=/calculator \
  --title="Fix calculator bug"
```

This automatically captures:
- ✅ Desktop + mobile screenshots
- ✅ Deployment verification (HTTP 200 check)
- ✅ Build verification (zero errors)
- ✅ Test results (100% passing)
- ✅ Lighthouse audit
- ✅ Verification report with all evidence

### Manual Verification (If automation fails)
1. Deploy to production: `git push origin main`
2. Take screenshots: Desktop + mobile views
3. Verify URL: `curl -I https://taxbridge.vercel.app/[feature]` → must be 200
4. Run build: `npm run build` → must pass with ZERO errors
5. Run tests: `npm test` → must be 100% passing
6. Fill evidence template: Copy `docs/EVIDENCE_TEMPLATE.md`
7. Commit evidence: `git add docs/screenshots/ docs/verification-reports/`

---

## 🚫 What Happens If You Don't Provide Evidence

Your task will be **REJECTED** and marked as **INCOMPLETE**.

Why? Because 6+ sprints claimed "Stripe production activated" without evidence, and Stripe was still in test mode. That ends now.

---

## ✅ What "Done" Actually Means

A task is **NOT DONE** until:

1. ✅ Code committed to Git
2. ✅ Pushed to GitHub (`git push origin main`)
3. ✅ Deployed to production (Vercel auto-deploys)
4. ✅ Evidence collected (screenshots, logs, or analytics)
5. ✅ Verification report generated
6. ✅ Evidence committed to Git
7. ✅ Production URL verified (HTTP 200)

**7 steps. No shortcuts.**

---

## 📊 Success Criteria by Task Type

### P0 (Critical) Tasks
**Required Evidence**: ALL of the following
- ✅ Screenshots (desktop + mobile)
- ✅ Production URL verification (HTTP 200)
- ✅ Build logs (zero errors)
- ✅ Test results (100% passing)
- ✅ Lighthouse audit (if user-facing)
- ✅ Analytics/metrics (if applicable)

### P1 (High) Tasks
**Required Evidence**: AT LEAST 3 of the following
- ✅ Screenshots OR video
- ✅ Production URL verification
- ✅ Build logs OR test results
- ✅ Analytics data (if applicable)

### P2/P3 (Medium/Low) Tasks
**Required Evidence**: AT LEAST 2 of the following
- ✅ Screenshot OR logs
- ✅ Production URL verification OR build logs
- ✅ Manual test confirmation

---

## 🔒 Enforcement

### Code Review
Pull requests **WILL BE REJECTED** if they don't include:
1. Link to verification report in PR description
2. Screenshots committed to `docs/screenshots/`
3. Evidence files committed to repo
4. Commit message includes `+ VERIFICATION`

### Task Tracking
Tasks **CANNOT** be marked "done" without:
1. Link to verification report in task comments
2. Evidence files attached or linked
3. Production URL confirmed working

### Automation
Pre-commit hooks will **WARN** if:
- No new files in `docs/screenshots/` or `docs/verification-reports/`
- Commit message doesn't include verification keywords

---

## 📚 Resources

- **Process Guide**: `docs/TASK_VERIFICATION_PROCESS.md` (detailed how-to)
- **Evidence Template**: `docs/EVIDENCE_TEMPLATE.md` (copy this)
- **Quick Reference**: `docs/TASK_COMPLETION_QUICK_REFERENCE.md` (1-page cheat sheet)
- **Verification Script**: `scripts/verify-task-completion.ts` (automation)

---

## 💡 Examples

### ✅ GOOD: Task with Evidence
```
Commit: [P0-123] Enable Stripe Production Mode + VERIFICATION

Files changed:
  - .env.production (Stripe keys updated)
  - docs/screenshots/2026-03-19-task-P0-123/
      01-desktop-view.png (checkout page with "live mode" badge)
      02-mobile-view.png (payment working on mobile)
  - docs/verification-reports/2026-03-19-task-P0-123-VERIFICATION.md

Verification Report:
  ✅ Production URL: HTTP 200
  ✅ Stripe test payment: tx_abc123 ($1.00 charged successfully)
  ✅ Build: PASSED (0 errors)
  ✅ Tests: 191/191 passing

Result: APPROVED ✅
```

### ❌ BAD: Task without Evidence
```
Commit: "Enable Stripe production mode"

Files changed:
  - .env.production (1 line changed)

Evidence: NONE

Result: REJECTED ❌ - Provide screenshots and verification report
```

---

## 🎓 Training

All new engineers must:
1. Read this policy (5 minutes)
2. Read `TASK_VERIFICATION_PROCESS.md` (15 minutes)
3. Complete practice task with verification (30 minutes)
4. Get approval from senior engineer

---

## 📝 Policy Updates

This policy may be updated. Check for changes:
```bash
git log docs/TASK_COMPLETION_POLICY.md
```

---

## ❓ FAQ

**Q: What if automated verification fails?**
A: Use manual verification checklist. Document why automation failed.

**Q: Do I need screenshots for backend tasks?**
A: Yes. Screenshot API response, database state, or logs showing execution.

**Q: Can I skip verification for "quick fixes"?**
A: NO. Every task requires evidence, no matter how small.

**Q: What if I'm blocked on deployment?**
A: Fix deployment blocker first. Don't mark task "done" until deployed + verified.

---

## 🚀 TL;DR

1. **NO evidence = NOT done**
2. **Run**: `npm run verify:task -- --task-id=XXX --feature-url=/path --title="Task name"`
3. **Commit**: Evidence files + verification report
4. **Link**: Verification report in PR/task comments
5. **Deploy**: Production URL must return HTTP 200

**If it's not verified in production with evidence, it's not done.**

---

**Version**: 1.0
**Last Updated**: 2026-03-19
**Mandatory Compliance**: All engineers, all tasks, all priorities
