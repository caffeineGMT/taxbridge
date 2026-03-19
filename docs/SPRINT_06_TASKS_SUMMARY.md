# Sprint 06 Tasks - Quick Reference

**Generated:** March 19, 2026 03:30 AM PST
**Total Tasks:** 10 (4 P0, 4 P1, 2 P2)
**Estimated Timeline:** 16-24 hours engineering work

---

## 🔴 P0 - CRITICAL (Due: March 20-21)

### 1. Eliminate 2619 console.log statements
- **Task ID:** 11817fd7
- **Deadline:** March 20, 2026
- **Impact:** Security - PII exposure in browser console
- **Actions:** Replace with Pino structured logging, add NODE_ENV guards
- **Time:** 6 hours

### 2. Activate Stripe Production Mode
- **Task ID:** dbe61482
- **Deadline:** March 20, 2026
- **Impact:** Revenue blocker - cannot accept payments
- **Actions:** Manual setup (pk_live/sk_live keys), test checkout flow
- **Time:** 30-45 minutes
- **Reference:** docs/STRIPE_PRODUCTION_SETUP.md

### 3. Fix 19 Security Vulnerabilities
- **Task ID:** 8ee05031
- **Deadline:** March 21, 2026
- **Impact:** Security - 2 critical CVEs (form-data, qs DoS)
- **Actions:** Remove snoowrap, npm audit fix, update Next.js
- **Time:** 2-3 hours

### 4. Optimize Build Size (801MB → <100MB)
- **Task ID:** 6c418857
- **Deadline:** March 21, 2026
- **Impact:** Deployment blocker - 5-10min deploys, OOM risk
- **Actions:** Replace Recharts, optimize images, tree-shaking
- **Time:** 6-8 hours

---

## 🟠 P1 - HIGH PRIORITY (Due: March 22-24)

### 5. Fix E2E Test Infrastructure
- **Task ID:** 81c46e3b
- **Deadline:** March 22, 2026
- **Impact:** 75% test failure rate, unknown prod bugs
- **Actions:** Add webServer to playwright.config.ts
- **Time:** 1-2 hours

### 6. Remove Placeholder Tracking IDs
- **Task ID:** c5437f76
- **Deadline:** March 22, 2026
- **Impact:** Analytics broken, wasted ad spend
- **Actions:** Remove AW-XXXXX fallbacks, fail loudly
- **Time:** 30 minutes

### 7. Lighthouse Performance Baseline
- **Task ID:** f4713c10
- **Deadline:** March 23, 2026
- **Impact:** Unknown Core Web Vitals, SEO risk
- **Actions:** Audit 10 key pages, set budgets
- **Time:** 2-3 hours

### 8. Production Smoke Test
- **Task ID:** 1a876da5
- **Deadline:** March 24, 2026
- **Impact:** Final QA before launch
- **Actions:** Test all flows after P0 fixes
- **Time:** 3-4 hours

---

## 🔵 P2 - MEDIUM PRIORITY (Due: March 26-27)

### 9. Accessibility Audit (WCAG 2.1 AA)
- **Task ID:** b3e3dab7
- **Deadline:** March 26, 2026
- **Impact:** Legal compliance, screen reader support
- **Actions:** Add ARIA labels, test VoiceOver/NVDA
- **Time:** 4-6 hours

### 10. Technical Debt Cleanup (40 TODOs)
- **Task ID:** ff70bd76
- **Deadline:** March 27, 2026
- **Impact:** Code quality, incomplete features
- **Actions:** Complete or delete each TODO
- **Time:** 3-4 hours

---

## Success Gates

**DO NOT LAUNCH until:**
- ✅ Zero console.log in production build
- ✅ Stripe live mode tested with real payment
- ✅ Zero critical/high security vulnerabilities
- ✅ Build size <150MB
- ✅ E2E tests 100% passing
- ✅ Lighthouse performance >85

**TARGET LAUNCH:** March 22-24, 2026

---

## Task Execution Order

**Week 1 (March 19-21):**
1. Start with console.log removal (parallel work possible)
2. Activate Stripe production (manual, 30 min)
3. Fix security vulnerabilities (3 hours)
4. Optimize build size (8 hours)

**Week 2 (March 22-24):**
5. Fix E2E tests (2 hours)
6. Remove tracking placeholders (30 min)
7. Lighthouse baseline (3 hours)
8. Production smoke test (4 hours)

**Week 3 (March 26-27):**
9. Accessibility audit (6 hours)
10. TODO cleanup (4 hours)

---

**View full audit:** docs/SPRINT_06_CEO_AUDIT.md
**Manage tasks:** `npm run projects` or scheduler dashboard
