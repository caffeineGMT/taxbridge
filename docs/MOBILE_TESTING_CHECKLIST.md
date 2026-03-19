# Mobile UX Testing Checklist
**Project:** TaxBridge Cross-Border Tax Calculator
**Date:** March 19, 2026
**Testing Type:** Manual device testing for mobile responsiveness
**Priority:** P3-LOW (critical issues only)

---

## Quick Start

**Devices Needed:**
- ✅ iPhone (any model, iOS Safari)
- ✅ Android phone (any model, Chrome)

**Time Required:** 30 minutes per device (60 minutes total)

**Goal:** Verify critical mobile UX issues have been fixed and app is production-ready on mobile devices.

---

## Test Flow 1: Calculator Experience

### iPhone Safari Test
1. **Load Calculator**
   - [ ] Open https://taxbridgecpa.com/ on iPhone Safari
   - [ ] Tap "Calculate Your Savings" button
   - [ ] Verify button is easy to tap (no mis-taps)

2. **Fill Form**
   - [ ] Tap "Firm Name" input field
   - [ ] Verify keyboard appears and doesn't hide input
   - [ ] Verify field scrolls into view above keyboard
   - [ ] Type "Test Firm" and verify text appears

3. **Test Numeric Inputs**
   - [ ] Tap "Number of Attorneys" field
   - [ ] Verify numeric keyboard appears (not full keyboard)
   - [ ] Enter "50"
   - [ ] Tap next field, verify smooth transition

4. **Test Validation Errors**
   - [ ] Clear "Number of Attorneys" field
   - [ ] Enter "0" (invalid value)
   - [ ] Verify inline error appears: "Must have at least 1 attorney"
   - [ ] Error should be red text below the input
   - [ ] Error should be readable without zooming

5. **Test Calculate Button**
   - [ ] Scroll to bottom of form
   - [ ] Verify "Calculate Your ROI" button is visible
   - [ ] Verify button is at least 48px tall (visually large enough)
   - [ ] Tap button, verify loading spinner appears
   - [ ] Verify results appear after 600ms

6. **Test Results**
   - [ ] Verify results are readable (no need to zoom)
   - [ ] Verify "Start 30-Day Free Trial" button is tappable
   - [ ] Button should be green/emerald color
   - [ ] Tap button, verify navigation to correct page

### Android Chrome Test
**Repeat all iPhone tests above**, plus:

7. **Autofill Test**
   - [ ] If you have autofill enabled, tap name field
   - [ ] Select autofill suggestion
   - [ ] Verify background color doesn't change (should stay dark)
   - [ ] Verify text is visible (not hidden by autofill styling)

8. **Tap Highlight Test**
   - [ ] Tap any button quickly
   - [ ] Verify NO blue highlight appears (should be transparent)
   - [ ] Tap delay should be instant (no 300ms wait)

---

## Test Flow 2: Payment/Checkout Flow

### iPhone Safari Test
1. **Load Pricing Page**
   - [ ] Navigate to /pricing on iPhone Safari
   - [ ] Scroll to pricing tiers
   - [ ] Verify "Start 14-Day Free Trial" button is visible

2. **Test CTA Button**
   - [ ] Tap "Start 14-Day Free Trial" button
   - [ ] Verify button is at least 48px tall (easy to tap)
   - [ ] Verify no accidental mis-taps on nearby elements
   - [ ] Verify smooth navigation to checkout

3. **Test Checkout Success**
   - [ ] Navigate to /demo/checkout
   - [ ] Tap "Show Success" button
   - [ ] Verify green checkmark appears
   - [ ] Verify "Subscription activated!" text is readable
   - [ ] Verify countdown timer is visible: "Redirecting in 3s..."
   - [ ] Tap "Go to Dashboard" button
   - [ ] Verify button is at least 48px tall
   - [ ] Verify smooth navigation

4. **Test Checkout Error**
   - [ ] Navigate to /demo/checkout
   - [ ] Tap "Show Error" button
   - [ ] Verify red X icon appears
   - [ ] Verify error message is readable (14px minimum)
   - [ ] Error text: "Your payment could not be processed"
   - [ ] Verify "Try Again" button is at least 44px tall
   - [ ] Verify "Back to Pricing" button is at least 44px tall
   - [ ] Buttons should have 8px gap between them (no overlap)
   - [ ] Tap "Try Again" button, verify interaction works

### Android Chrome Test
**Repeat all iPhone tests above**, plus:

5. **Test Loading State**
   - [ ] Navigate to /demo/checkout
   - [ ] Tap "Show Loading" button
   - [ ] Verify spinner is visible and animated
   - [ ] Verify "Processing payment..." text is readable
   - [ ] Verify no layout shift during loading

---

## Test Flow 3: Small Screen Edge Cases

### iPhone SE (375px width) or older small Android
1. **Test Progress Indicator**
   - [ ] Load calculator page
   - [ ] Verify progress indicator at top is visible
   - [ ] Steps should show: "Firm Details" → "ROI Results"
   - [ ] Description text may be hidden on very small screens (OK)

2. **Test Card Padding**
   - [ ] Verify calculator card has adequate padding
   - [ ] Content should not touch edges of screen
   - [ ] Minimum 16px padding on left/right

3. **Test Heading Sizes**
   - [ ] Verify "ROI Calculator" heading is readable
   - [ ] Should be 24px (1.5rem) on small screens
   - [ ] Should not wrap awkwardly (max 2 lines OK)

4. **Test Button Layout**
   - [ ] Demo and Reset buttons in header should be visible
   - [ ] May only show icons on very small screens (OK)
   - [ ] Buttons should not overlap

---

## Test Flow 4: Landscape Mode (iOS/Android)

### Rotate device to landscape
1. **Test Calculator Form**
   - [ ] Rotate iPhone to landscape
   - [ ] Tap any input field
   - [ ] Verify keyboard doesn't hide entire form
   - [ ] Verify "Calculate" button remains visible
   - [ ] Content should compress vertically (OK if tighter)

2. **Test Results View**
   - [ ] View results page in landscape
   - [ ] Verify content is readable
   - [ ] Results grid may switch to 2-column (OK)

---

## Test Flow 5: Accessibility (Quick Check)

### VoiceOver (iOS) or TalkBack (Android)
**Note:** This is a quick check only, full a11y audit is separate.

1. **Enable Screen Reader**
   - iOS: Settings → Accessibility → VoiceOver
   - Android: Settings → Accessibility → TalkBack

2. **Navigate Calculator**
   - [ ] Swipe through form fields
   - [ ] Verify each field announces label (e.g., "Firm Name, text field")
   - [ ] Verify error messages are announced
   - [ ] Verify buttons announce action (e.g., "Calculate Your ROI, button")

3. **Disable Screen Reader**
   - iOS: Triple-click home/power button
   - Android: Volume up + down keys

---

## Test Flow 6: Performance (Quick Check)

### iOS Safari
1. **Page Load Speed**
   - [ ] Clear browser cache
   - [ ] Load homepage
   - [ ] Time to interactive should be <3 seconds on WiFi
   - [ ] No visible layout shifts during load

2. **Calculator Performance**
   - [ ] Fill out form completely
   - [ ] Tap "Calculate Your ROI"
   - [ ] Results should appear in <1 second
   - [ ] Animation should be smooth (no jank)

### Android Chrome
**Repeat iOS tests above**

---

## Critical Issues Checklist

If ANY of these fail, **DO NOT LAUNCH**:

- [ ] ❌ Calculator button is <44px tall (accessibility violation)
- [ ] ❌ iOS keyboard hides submit button (form unusable)
- [ ] ❌ Checkout error button is too small to tap
- [ ] ❌ Pricing CTA button is <44px tall
- [ ] ❌ Form validation errors are not visible on mobile
- [ ] ❌ Text requires pinch-zoom to read (WCAG violation)
- [ ] ❌ Buttons have accidental mis-taps (insufficient spacing)
- [ ] ❌ Payment flow states don't display correctly

**If all critical items pass:** ✅ APPROVED FOR LAUNCH

---

## Non-Critical Issues (Log for Future)

If these fail, **launch anyway** but create tasks:

- [ ] ⚠️ Calculate button could be taller on very small screens
- [ ] ⚠️ Progress indicator description hidden on <375px (minor UX hit)
- [ ] ⚠️ Landscape mode is cramped (functional but not optimal)
- [ ] ⚠️ Card padding could be more generous on large screens
- [ ] ⚠️ Headings could scale better on very small screens

---

## Test Results Template

### Tester Information
- **Name:** _________________
- **Date:** _________________
- **Device:** _________________ (e.g., iPhone 14 Pro, Samsung Galaxy S23)
- **OS Version:** _____________ (e.g., iOS 17.3, Android 14)
- **Screen Size:** ____________ (e.g., 393x852)

### Overall Assessment
- [ ] ✅ PASS - Ready for production
- [ ] ⚠️ PASS WITH NOTES - Launch OK, minor issues logged
- [ ] ❌ FAIL - Critical issues, do not launch

### Critical Issues Found
_List any blocking issues here:_

1. _____________________________________
2. _____________________________________
3. _____________________________________

### Non-Critical Issues Found
_List minor issues for future sprints:_

1. _____________________________________
2. _____________________________________
3. _____________________________________

### Additional Notes
_Any other observations:_

---

## Quick Reference: Test URLs

```
Production:
- Homepage: https://taxbridgecpa.com/
- Calculator: https://taxbridgecpa.com/#calculator
- Pricing: https://taxbridgecpa.com/pricing
- Checkout Demo: https://taxbridgecpa.com/demo/checkout

Staging (if available):
- [Add staging URLs here]
```

---

## Next Steps After Testing

1. **All Tests Pass:** Mark task as complete, push to production
2. **Critical Issues Found:** Create bug tickets, assign to developer, re-test after fixes
3. **Non-Critical Issues:** Log in backlog for next polish sprint

---

## Contact

**Questions during testing?**
- Developer: Michael Guo
- Project: TaxBridge Cross-Border Tax Calculator
- Docs: See `/docs/MOBILE_UX_AUDIT_2026-03-19.md` for detailed audit report

---

**Testing completed:** [ ] YES [ ] NO
**Production approval:** [ ] APPROVED [ ] NEEDS FIXES [ ] BLOCKED
