# Task Completion Quick Reference

**🔖 Print this and keep at your desk**

---

## ⚡ The 7-Step Workflow

```
1. Write code
2. npm run build          # Must pass with ZERO errors
3. git push origin main   # Deploy to production
4. npm run verify:task -- --task-id=P0-XXX --feature-url=/path --title="Task"
5. Review verification report
6. Commit evidence files
7. Mark task "done"
```

**If verification fails → Fix issues → Repeat from step 2**

---

## 🎯 Evidence Requirements

### P0 (Critical) - ALL Required
- ✅ Screenshots (desktop + mobile)
- ✅ Production URL (HTTP 200)
- ✅ Build logs (0 errors)
- ✅ Test results (100% passing)
- ✅ Lighthouse audit
- ✅ Analytics/metrics

### P1 (High) - At Least 3
- ✅ Screenshots OR video
- ✅ Production URL
- ✅ Build OR test logs
- ✅ Analytics (if applicable)

### P2/P3 (Medium/Low) - At Least 2
- ✅ Screenshot OR logs
- ✅ Production URL OR build logs

---

## 📋 Quick Commands

### Automated Verification
```bash
npm run verify:task -- \
  --task-id=P0-001 \
  --feature-url=/calculator \
  --title="Fix calculator bug"
```

### Manual Verification
```bash
# 1. Deploy
git push origin main

# 2. Verify URL
curl -I https://taxbridge.vercel.app/feature
# Must return: HTTP/2 200

# 3. Build check
npm run build
# Must pass with 0 errors

# 4. Test check
npm test
# Must pass 100%

# 5. Screenshot
# Chrome → Open production URL → DevTools → Cmd+Shift+P → "Capture screenshot"
```

---

## 📁 File Structure

```
docs/
├── screenshots/
│   └── 2026-03-19-task-P0-001/
│       ├── 01-desktop-view.png
│       ├── 02-mobile-view.png
│       └── 03-lighthouse-report.json
├── verification-reports/
│   └── 2026-03-19-task-P0-001-VERIFICATION.md
└── logs/
    └── 2026-03-19-task-P0-001/
        ├── build.log
        └── test-results.txt
```

---

## ✅ Commit Template

```bash
git add docs/screenshots/ docs/verification-reports/
git commit -m "[P0-001] Fix calculator bug + VERIFICATION"
git push origin main
```

---

## 🚫 Common Mistakes

| ❌ WRONG | ✅ RIGHT |
|---------|---------|
| "It works on localhost" | Test in production: taxbridge.vercel.app |
| "Tests pass on my machine" | npm test → 100% + commit logs |
| "I checked it visually" | Screenshot + commit to Git |
| "Build is fine" | npm run build → 0 errors → logs |
| git commit -m "Fix bug" | git commit -m "[P0-001] Fix bug + VERIFICATION" |

---

## 🔍 Verification Checklist (30 seconds)

Before marking task "done", verify:
- [ ] Code pushed to GitHub
- [ ] Production URL returns HTTP 200
- [ ] Screenshots exist in `docs/screenshots/`
- [ ] Build passes (0 errors)
- [ ] Tests pass (100%)
- [ ] Verification report exists
- [ ] Commit includes "+ VERIFICATION"

---

## 📞 Need Help?

| Question | Answer |
|----------|--------|
| Automation fails? | Use manual checklist |
| Backend task? | Screenshot API response/logs |
| Config change? | Screenshot showing config loaded |
| "Quick fix"? | Still needs evidence |
| Blocked on deploy? | Fix blocker first, verify after |

---

## 📚 Full Documentation

- **Policy**: `docs/TASK_COMPLETION_POLICY.md` (2 pages)
- **Process**: `docs/TASK_VERIFICATION_PROCESS.md` (detailed)
- **Template**: `docs/EVIDENCE_TEMPLATE.md` (copy & fill)
- **Script**: `scripts/verify-task-completion.ts`

---

## 🎓 Example: Good Verification

```bash
# 1. Write code
# (edit files)

# 2. Build
npm run build
# ✅ Compiled successfully in 45s

# 3. Push
git add -A
git commit -m "[P0-123] Enable Stripe production"
git push origin main
# ✅ Deployed to https://taxbridge.vercel.app

# 4. Verify
npm run verify:task -- \
  --task-id=P0-123 \
  --feature-url=/checkout \
  --title="Enable Stripe production"

# Output:
# ✅ Screenshots captured
# ✅ Production URL: HTTP 200 (312ms)
# ✅ Build: PASSED (0 errors)
# ✅ Tests: 191/191 passing
# ✅ Lighthouse: Performance 92/100

# 5. Commit evidence
git add docs/screenshots/ docs/verification-reports/
git commit -m "[P0-123] Enable Stripe production + VERIFICATION"
git push origin main

# 6. Mark "done"
# → Include link to verification report in task comments
```

---

## 🚨 Remember

**No evidence = Not done**
**No production deployment = Not done**
**No verification report = Not done**

**If it's not verified in production with evidence, it's NOT DONE.**

---

**v1.0 | 2026-03-19 | Print & Post This**
