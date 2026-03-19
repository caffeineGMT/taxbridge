# Production Bug Hunt - Manual QA Testing Checklist

**Task:** [P2-MEDIUM] Production Bug Hunt - CEO Manual QA Pass
**Production URL:** https://taxbridgecpa.com
**Date:** March 19, 2026
**Status:** ⚠️ AWAITING MANUAL TESTING

---

## ⚠️ IMPORTANT: Limitations of This Analysis

This document was created through **static code analysis** only. As an AI assistant, I cannot:
- ❌ Open real browsers (Safari, Chrome, Firefox, Edge)
- ❌ Visit the production website
- ❌ Test on physical devices (iPhone, Android)
- ❌ Perform manual clicks and interactions

**What I DID do:**
- ✅ Analyzed calculator logic for edge case handling
- ✅ Reviewed input validation code
- ✅ Examined responsive CSS and mobile optimizations
- ✅ Identified **5 potential bugs** through code review (see section below)
- ✅ Created comprehensive testing checklists for manual execution

**Michael, you will need to:**
- 🎯 Execute the browser/device testing checklists below
- 🎯 Verify the calculator edge cases
- 🎯 Confirm or refute the potential bugs I identified
- 🎯 Document any additional bugs you find

---

## 📱 Device & Browser Testing Matrix

### Test Devices Required:
1. **iPhone (iOS Safari)** - Primary mobile target
2. **Android Phone (Chrome)** - Secondary mobile target
3. **Desktop Safari** - macOS users
4. **Desktop Firefox** - Privacy-conscious users
5. **Desktop Edge** - Windows users
6. **Desktop Chrome** - Baseline (already well-tested in dev)

---

## 🧪 Test Suite 1: Mobile Responsiveness (iPhone Safari)

**Device:** iPhone (any model, iOS 15+)
**Browser:** Safari
**URL:** https://taxbridgecpa.com

### Landing Page Tests:
- [ ] Page loads without horizontal scroll
- [ ] Hero section text is readable without zoom
- [ ] CTA buttons are at least 44×44px (easy to tap)
- [ ] Navigation menu works (hamburger icon if present)
- [ ] Images load and scale properly
- [ ] Footer links are tappable
- [ ] No layout breaks or overlapping text

### Calculator Tests:
- [ ] All input fields are visible and tappable
- [ ] Keyboard appears when tapping input fields
- [ ] **CRITICAL:** iOS doesn't zoom in when focusing inputs (16px font minimum enforced)
- [ ] Number keyboard appears for numeric inputs (inputMode="numeric" or "decimal")
- [ ] Can scroll down to see "Calculate" button when keyboard is open
- [ ] Results display correctly after calculation
- [ ] Results are readable without horizontal scroll
- [ ] Can share results (if sharing feature exists)

