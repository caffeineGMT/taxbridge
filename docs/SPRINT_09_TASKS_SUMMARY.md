# Sprint 09 Tasks - Quick Reference

**Sprint Goal:** Fix 6 P0 blockers to achieve production-ready state
**Timeline:** March 19-26, 2026 (7 days)
**Target Grade:** B+ (85/100) - Production-ready

---

## 📋 Task Summary

**Total Tasks Created:** 10
- 🔴 **P0 Critical:** 6 tasks (Must complete before launch)
- 🟠 **P1 High:** 3 tasks (Fix before marketing)
- 🔵 **P2 Medium:** 1 task (Post-launch polish)

**Estimated Effort:** 32-40 hours total (can be parallelized with 6 engineers)

---

## 🚨 P0 CRITICAL (Launch Blockers)

### 1. Fix Production Site 503 Error ⛔
**Task ID:** `79d06a79`
**Deadline:** March 20, 12:00 PM (24 hours)
**Time:** 2-4 hours
**Issue:** Production site completely DOWN - DNS resolution failure
**Impact:** ZERO revenue capability
**Engineer:** Infrastructure lead

### 2. Fix Build Failures ⛔
**Task ID:** `d557177b`
**Deadline:** March 20, 6:00 PM (30 hours)
**Time:** 4-6 hours
**Issue:** ESLint circular dependency + TypeScript errors + prerender failures
**Impact:** Cannot deploy code changes
**Engineer:** Frontend lead

### 3. Move Stripe to LIVE Mode ⛔
**Task ID:** `d265376f`
**Deadline:** March 20, 8:00 PM (32 hours)
**Time:** 2-3 hours
**Issue:** Stripe in TEST mode with pk_test/sk_test keys
**Impact:** Cannot accept real payments
**Engineer:** Backend/Payments lead

### 4. Fix E2E Test Infrastructure ⛔
**Task ID:** `0b5bba9b`
**Deadline:** March 21, 4:00 PM (52 hours)
**Time:** 4-6 hours
**Issue:** All 206 Playwright tests failing (100% failure rate)
**Impact:** Unknown production bugs, no automated QA
**Engineer:** QA/Testing engineer

### 5. Remove 2,552 console.log Statements ⛔
**Task ID:** `169c29df`
**Deadline:** March 22, 11:59 PM (88 hours)
**Time:** 8-12 hours (parallelizable)
**Issue:** PII exposure in browser console (emails, tax data, Stripe keys)
**Impact:** GDPR/CCPA compliance risk, security violation
**Engineers:** 2-3 engineers (split by directory)

### 6. Fix 19 NPM Security Vulnerabilities ⛔
**Task ID:** `825a094d`
**Deadline:** March 21, 6:00 PM (54 hours)
**Time:** 2-4 hours
**Issue:** 2 critical (SSRF, unsafe boundary), 2 high, 11 moderate
**Impact:** Exploitable security vulnerabilities
**Engineer:** Infrastructure lead

---

## 🟠 P1 HIGH PRIORITY (Marketing Ready)

### 7. Lighthouse Audit & Performance Fixes
**Task ID:** `c92b86f3`
**Deadline:** March 23, 11:59 PM
**Time:** 6-8 hours
**Issue:** No performance baseline - unknown Core Web Vitals
**Impact:** May have poor SEO and conversion rates

### 8. Upgrade Next.js to 16.2.0
**Task ID:** `012a3d1e`
**Deadline:** March 24, 6:00 PM
**Time:** 3-4 hours
**Issue:** 7+ minor versions behind (15.5.13 → 16.2.0)
**Impact:** Missing security patches and performance optimizations

### 9. WCAG 2.1 AA Accessibility Audit
**Task ID:** `381529d8`
**Deadline:** March 24, 11:59 PM
**Time:** 6-8 hours
**Issue:** Accessibility compliance unknown
**Impact:** May violate ADA, exclude screen reader users

---

## 🔵 P2 MEDIUM (Post-Launch)

### 10. Audit 38 TODO/FIXME Comments
**Task ID:** `739d1efe`
**Deadline:** March 26, 6:00 PM
**Time:** 2-3 hours
**Issue:** Technical debt markers across codebase
**Impact:** May indicate incomplete features

---

## 🎯 Launch Gates

### ✅ WEEK 1 GATE (March 21) - Production Ready
**Must complete P0 tasks #1-6**
- [ ] Production site returns HTTP 200
- [ ] Build passes (exit code 0)
- [ ] Stripe in LIVE mode, test payment succeeds
- [ ] E2E tests ≥80% passing (165/206)
- [ ] Zero critical/high npm vulnerabilities
- [ ] Zero console.logs in API routes

**If ALL GREEN:** Proceed to Week 2 (P1 quality fixes)
**If ANY RED:** DO NOT LAUNCH - block marketing campaigns

---

### ✅ WEEK 2 GATE (March 24) - Marketing Ready
**Must complete P1 tasks #7-9**
- [ ] Lighthouse Performance >85
- [ ] Lighthouse Accessibility >90
- [ ] Next.js 16.2.0 installed
- [ ] Zero critical accessibility violations

**If ALL GREEN:** Approve Product Hunt launch (March 25)
**If ANY YELLOW:** Launch with known issues, track for hotfix

---

## 🗓️ Day-by-Day Plan

### Day 1 - March 19 (Today)
- [x] Sprint 09 audit complete
- [x] 10 tasks created
- [ ] Assign engineers to tasks
- [ ] Kick off P0-1, P0-2, P0-3 (parallel)

### Day 2 - March 20
- [ ] Complete P0-1 (Production site fix)
- [ ] Complete P0-2 (Build fix)
- [ ] Complete P0-3 (Stripe LIVE)

### Day 3 - March 21
- [ ] Complete P0-4 (E2E tests)
- [ ] Complete P0-6 (npm vulnerabilities)
- [ ] Production smoke test
- [ ] **LAUNCH GATE 1 DECISION**

### Day 4 - March 22
- [ ] Complete P0-5 (console.logs)
- [ ] Start P1-7 (Lighthouse audit)

### Day 5 - March 23
- [ ] Complete P1-7 (Lighthouse fixes)
- [ ] Start P1-8 (Next.js upgrade)
- [ ] Start P1-9 (Accessibility audit)

### Day 6 - March 24
- [ ] Complete P1-8 (Next.js upgrade)
- [ ] Complete P1-9 (Accessibility fixes)
- [ ] **LAUNCH GATE 2 DECISION**

### Day 7 - March 25
- [ ] **PRODUCT HUNT LAUNCH** (if gates passed)
- [ ] Monitor production metrics
- [ ] Start P2-10 (TODO audit)

---

## 📊 Expected Outcomes

### Pre-Sprint (Current)
- **Overall Grade:** D (67/100) - NOT PRODUCTION-READY
- Production site: DOWN (503)
- Build: FAILING
- Stripe: TEST mode
- E2E tests: 0% pass rate
- Security: 19 vulnerabilities

### Post-Sprint (Target)
- **Overall Grade:** A- (90/100) - PRODUCTION-READY
- Production site: 99.9% uptime
- Build: 100% success rate
- Stripe: LIVE mode, payments working
- E2E tests: 80%+ pass rate
- Security: 0 critical/high vulnerabilities
- Performance: Lighthouse >85
- Accessibility: WCAG 2.1 AA compliant

---

## 🚀 How to Use This Guide

1. **View task details:** `/tasks` or check task manager
2. **Check your assignment:** See "Engineer Task Assignments" in full audit report
3. **Start work:** `task_id` to see full description and acceptance criteria
4. **Report blockers:** Immediately escalate if deadline at risk
5. **Update status:** Mark tasks in_progress when starting, completed when done

---

**Full Audit Report:** `docs/SPRINT_09_CEO_AUDIT.md`
**Task IDs:** Use these to look up tasks in task manager (e.g., `79d06a79`)
**Questions?** See full audit report for detailed context and acceptance criteria
