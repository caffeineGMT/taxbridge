# ⚡ Task Verification Quick Reference Card

**Print this and keep it at your desk**

---

## 🎯 ONE RULE

**If it's not verified, it's not done.**

---

## ✅ Checklist (Before Marking "Done")

```
[ ] 1. Feature deployed to production (not localhost)
[ ] 2. Production URL returns HTTP 200
[ ] 3. Screenshots captured (desktop + mobile)
[ ] 4. npm run build passes (ZERO errors)
[ ] 5. npm test passes (100%)
[ ] 6. Verification report generated
[ ] 7. Evidence committed to Git
```

---

## 🚀 Quick Command

```bash
# Run this for EVERY task
npm run verify:task -- \
  --task-id=P0-XXX \
  --feature-url=/your-feature \
  --title="Your task description"

# ✅ PASSED → Mark "done"
# ❌ FAILED → Fix issues, re-run
```

---

## 📸 What Evidence Looks Like

```
docs/
  screenshots/
    2026-03-19-task-P0-XXX/
      01-desktop-view.png       ← REQUIRED
      02-mobile-view.png        ← REQUIRED
      03-lighthouse-report.json ← REQUIRED
  verification-reports/
    2026-03-19-task-P0-XXX-VERIFICATION.md ← REQUIRED
```

---

## 🔥 Common Mistakes to Avoid

### ❌ WRONG
```bash
git commit -m "Fix bug"
# Mark task as "done" ← NO PROOF
```

### ✅ RIGHT
```bash
npm run build
git push origin main
npm run verify:task -- --task-id=P0-XXX --feature-url=/feature
git add docs/screenshots/ docs/verification-reports/
git commit -m "[P0-XXX] Fix bug + VERIFICATION"
git push origin main
# NOW mark task as "done" ← WITH PROOF
```

---

## 📊 Task-Specific Requirements

### Revenue (Stripe, Payments)
- [ ] Screenshot of Stripe dashboard (LIVE mode)
- [ ] Transaction ID (e.g., pi_abc123)
- [ ] Webhook event log
- [ ] Keys start with sk_live_ (NOT sk_test_)

### Calculator/Logic
- [ ] Unit tests 100% passing
- [ ] Test coverage >80%
- [ ] Edge cases tested (zero, negative, max)

### SEO
- [ ] Google Search Console screenshot
- [ ] Sitemap HTTP 200
- [ ] Lighthouse SEO >90

### Analytics
- [ ] PostHog event screenshot
- [ ] Test event verified
- [ ] Funnel tracking confirmed

---

## 🚨 Blockers

**If verification fails:**
1. DO NOT mark task as "done"
2. Fix the issues
3. Re-run verification
4. Repeat until verification passes

**If deployment is blocked:**
1. Fix deployment blocker first
2. Then verify your task
3. Don't mark "done" until deployed + verified

---

## 🎯 Success Thresholds

```
HTTP Status: 200 (REQUIRED)
Response Time: <3000ms
Build Errors: 0 (REQUIRED)
Build Warnings: <10
Build Size: <150MB
Test Pass Rate: 100% (REQUIRED)
Lighthouse Performance: >85
Lighthouse Accessibility: >90
Lighthouse SEO: >90
```

---

## 📋 Commit Message Format

```bash
git commit -m "[P0-XXX] Task Description + VERIFICATION"
                 ↑       ↑                    ↑
              Task ID  What you did    Proof included
```

---

## 🔗 Full Documentation

- **Process Guide:** `docs/TASK_VERIFICATION_PROCESS.md`
- **Template:** `docs/TASK_VERIFICATION_TEMPLATE.md`
- **Summary:** `docs/TASK_VERIFICATION_EXECUTIVE_SUMMARY.md`

---

## ⚡ TL;DR

```bash
# Before marking ANY task "done":
npm run verify:task -- --task-id=XXX --feature-url=/feature --title="Task"

# If ✅ PASSED → Mark "done"
# If ❌ FAILED → Fix, re-run, repeat
```

**NO PROOF = NOT DONE**

---

**Policy Owner:** Michael Guo (CEO)
**Effective:** March 19, 2026
**Compliance:** MANDATORY
