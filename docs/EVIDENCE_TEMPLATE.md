# Task Verification Evidence - Template

**Copy this template and fill in ALL sections. Save to `docs/verification-reports/YYYY-MM-DD-task-[ID]-VERIFICATION.md`**

---

## 📋 Task Information

**Task ID**: [e.g., P0-123]
**Task Title**: [Brief description]
**Engineer**: [Your name]
**Date**: [YYYY-MM-DD]
**Priority**: [P0/P1/P2/P3]

---

## ✅ Verification Status

**Overall Status**: [✅ PASSED / ❌ FAILED / ⚠️ PARTIAL]

---

## 📸 Evidence Collected

### Screenshots
- [ ] Desktop view (1920x1080): `docs/screenshots/YYYY-MM-DD-task-[ID]/01-desktop-view.png`
- [ ] Mobile view (375x667): `docs/screenshots/YYYY-MM-DD-task-[ID]/02-mobile-view.png`
- [ ] Additional screenshots (if needed): `docs/screenshots/YYYY-MM-DD-task-[ID]/03-*.png`

### Video Recording (Optional)
- [ ] Screen recording: `docs/videos/YYYY-MM-DD-task-[ID]/recording.mp4`
- Duration: [X minutes]

### Logs/Terminal Output
- [ ] Build logs: `docs/logs/YYYY-MM-DD-task-[ID]/build.log`
- [ ] Test results: `docs/logs/YYYY-MM-DD-task-[ID]/test-results.txt`
- [ ] Deployment logs: [Link or paste here]

### Production Deployment
- **Production URL**: [Full URL, e.g., https://taxbridge.vercel.app/calculator]
- **HTTP Status**: [e.g., 200 OK]
- **Response Time**: [e.g., 245ms]
- **Verification Command**:
  ```bash
  curl -I [production URL]
  ```
- **Result**: [Paste response headers]

### Analytics/Metrics (If Applicable)
- [ ] PostHog event: [Event name] - [Screenshot or event ID]
- [ ] Google Analytics: [Page views, events tracked]
- [ ] Stripe transaction: [Transaction ID, e.g., pi_abc123]
- [ ] Sentry: [Error rate before/after, screenshot]

---

## 🏗️ Build Verification

### Build Status
```bash
npm run build
```

- **Status**: [✅ PASSED / ❌ FAILED]
- **Errors**: [Count, e.g., 0]
- **Warnings**: [Count, e.g., 3]
- **Build Size**: [e.g., 142MB]
- **Build Time**: [e.g., 45 seconds]

### Build Output (Last 20 lines)
```
[Paste last 20 lines of build output here]
```

---

## 🧪 Test Verification

### Unit Tests
```bash
npm test
```

- **Status**: [✅ PASSED / ❌ FAILED]
- **Total Tests**: [Count]
- **Passing**: [Count]
- **Failing**: [Count]
- **Skipped**: [Count]

### Test Output (Summary)
```
[Paste test summary here]
```

### E2E Tests (If Applicable)
```bash
npm run test:e2e
```

- **Status**: [✅ PASSED / ❌ FAILED]
- **Total Tests**: [Count]
- **Passing**: [Count]
- **Failing**: [Count]

---

## 💡 Performance Verification

### Lighthouse Audit (If User-Facing Feature)
```bash
npm run lighthouse:production
```

- **Performance**: [Score/100] [✅ ≥85 / ⚠️ <85]
- **Accessibility**: [Score/100] [✅ ≥90 / ⚠️ <90]
- **SEO**: [Score/100] [✅ ≥90 / ⚠️ <90]
- **Best Practices**: [Score/100]

### Lighthouse Report
- Report saved to: `docs/screenshots/YYYY-MM-DD-task-[ID]/03-lighthouse-report.json`

---

## 🔍 Manual Testing Checklist

### Functional Testing
- [ ] Feature works on desktop Chrome
- [ ] Feature works on mobile Safari
- [ ] Feature works on Firefox
- [ ] Edge cases handled (zero values, large numbers, empty inputs)
- [ ] Error messages display correctly
- [ ] Loading states work

### Visual Testing
- [ ] UI matches design (if applicable)
- [ ] Responsive on mobile (320px - 768px)
- [ ] Responsive on tablet (768px - 1024px)
- [ ] Responsive on desktop (1024px+)
- [ ] No visual bugs (overlapping text, broken layouts)

### Cross-Browser Testing (If Critical Feature)
- [ ] Chrome: [✅ / ❌]
- [ ] Safari: [✅ / ❌]
- [ ] Firefox: [✅ / ❌]
- [ ] Edge: [✅ / ❌]

---

## 🚀 Deployment Verification

### Git Commit
- **Commit SHA**: [e.g., 9f8e7d6]
- **Commit Message**: [Full message]
- **Branch**: [e.g., main]
- **Files Changed**: [Count]

### GitHub Push
```bash
git push origin main
```

- **Status**: [✅ PUSHED / ❌ FAILED]
- **Push Time**: [YYYY-MM-DD HH:MM:SS]

### Vercel Deployment (Auto-triggered)
- **Deployment URL**: [e.g., https://taxbridge-abc123.vercel.app]
- **Deployment Status**: [✅ SUCCESS / ❌ FAILED]
- **Deployment Time**: [e.g., 45 seconds]
- **Deployment Logs**: [Link or summary]

### Production Verification
- **Production URL**: [https://taxbridge.vercel.app/feature]
- **HTTP Status**: [200]
- **Verified At**: [YYYY-MM-DD HH:MM:SS]

---

## 🐛 Known Issues (If Any)

List any issues discovered during verification:

1. [Issue description] - [Severity: P0/P1/P2/P3] - [Status: Fixed / Tracked / Won't Fix]
2. [Issue description] - [Severity: P0/P1/P2/P3] - [Status: Fixed / Tracked / Won't Fix]

---

## 📝 Additional Notes

[Any additional context, workarounds, or notes about this task]

---

## 🎯 Verification Result

### Pass/Fail Criteria

| Criteria | Required | Status | Notes |
|----------|----------|--------|-------|
| Screenshots captured | ✅ | [✅/❌] | [Notes] |
| Production URL returns 200 | ✅ | [✅/❌] | [Notes] |
| Build passes (0 errors) | ✅ | [✅/❌] | [Notes] |
| Tests pass (100%) | ✅ | [✅/❌] | [Notes] |
| Lighthouse scores meet targets | ⚠️ | [✅/❌] | [Notes] |
| Analytics tracking working | ⚠️ | [✅/❌/N/A] | [Notes] |

**Legend**: ✅ Required | ⚠️ Recommended | N/A Not Applicable

### Overall Verdict

**[✅ VERIFICATION PASSED / ❌ VERIFICATION FAILED / ⚠️ PARTIAL SUCCESS]**

**Reason**:
[Explain why verification passed or failed]

### Next Steps

**If PASSED**:
- [x] Mark task as "done" in task tracker
- [x] Update CHANGELOG.md (if applicable)
- [x] Notify stakeholders
- [x] Close related issues

**If FAILED**:
- [ ] Fix issues listed in "Known Issues" section
- [ ] Re-run verification: `npm run verify:task -- --task-id=[ID] --feature-url=[URL]`
- [ ] Update this report with new results
- [ ] DO NOT mark task as "done"

---

## 📎 Attachments

- Screenshot 1: [Relative path]
- Screenshot 2: [Relative path]
- Build log: [Relative path]
- Test results: [Relative path]
- Lighthouse report: [Relative path]

---

**Verification Completed By**: [Your name]
**Verification Date**: [YYYY-MM-DD]
**Verification Tool Version**: [Script version or "Manual"]

---

## ✅ Sign-Off

**Engineer**: [Name] - [Date]
**Reviewer** (if applicable): [Name] - [Date]

---

**Template Version**: 1.0
**Last Updated**: 2026-03-19
