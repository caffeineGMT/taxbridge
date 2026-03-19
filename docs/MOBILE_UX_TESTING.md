# Mobile UX Testing Guide

## Overview
This guide provides comprehensive instructions for testing the TaxBridge calculator on mobile devices to ensure optimal user experience across iOS and Android platforms.

## Test Devices & Viewports

### Priority Devices (Must Test)
1. **iPhone SE (3rd gen)** - 375×667px (Smallest modern iPhone)
2. **iPhone 14 Pro** - 393×852px (Current flagship)
3. **Samsung Galaxy S21** - 360×800px (Common Android)
4. **iPad Mini** - 744×1133px (Tablet baseline)

### Browser Testing Matrix
| Device | iOS Safari | Chrome Android | Chrome iOS | Firefox Android |
|--------|-----------|----------------|------------|----------------|
| iPhone SE | ✅ Required | N/A | ✅ Required | N/A |
| iPhone 14 | ✅ Required | N/A | Optional | N/A |
| Galaxy S21 | N/A | ✅ Required | N/A | ✅ Required |
| iPad Mini | ✅ Required | N/A | Optional | N/A |

## Critical Test Scenarios

### 1. Keyboard Overlay (iOS Safari) ⚠️ CRITICAL

**Issue**: iOS Safari keyboard can cover inputs, making it impossible to see what you're typing.

**Test Steps**:
1. Open calculator on iPhone SE in Safari
2. Tap on the first input field (RSU Income)
3. **Expected**: Page scrolls automatically to keep input visible above keyboard
4. Type a value (e.g., "100000")
5. **Expected**: Input field remains visible, not hidden by keyboard
6. Tap "Calculate" button
7. **Expected**: Button is visible and tappable even with keyboard visible
8. Repeat for all input fields

**Pass Criteria**:
- ✅ All input fields auto-scroll into view when focused
- ✅ "Calculate" button is always visible when keyboard is open
- ✅ No need to manually scroll to see input content
- ✅ No accidental taps on wrong elements due to hidden content

**Failure Examples**:
- ❌ Input field hidden behind keyboard
- ❌ Calculate button completely covered
- ❌ User must manually scroll to see input

### 2. Touch Target Size (WCAG 2.1 AA Compliance)

**Issue**: Buttons/inputs too small for thumb tapping.

**Test Steps**:
1. Open calculator on iPhone SE
2. Try to tap each button using thumb (not pointer finger)
3. **Expected**: All buttons are easy to tap without missing
4. Try tapping "Demo" and "Reset" buttons in header
5. **Expected**: Buttons respond on first tap, no accidental adjacent taps

**Pass Criteria**:
- ✅ All buttons are minimum 44×44px
- ✅ Input fields are minimum 44px tall
- ✅ No "fat finger" errors when tapping
- ✅ Adequate spacing between adjacent buttons

**Measurement**: Use browser DevTools → Elements → Computed to verify actual rendered size.

### 3. Layout Breaks on Small Screens

**Issue**: Content overflows, horizontal scroll appears, or text is cut off.

**Test Steps**:
1. Open calculator on 360px viewport (Galaxy S21 size)
2. Scroll through entire page
3. **Expected**: No horizontal scrollbar appears
4. Check progress indicator at top
5. **Expected**: All 3 steps are visible without overflow
6. Check results grid after calculation
7. **Expected**: Grid items stack vertically on mobile

**Pass Criteria**:
- ✅ No horizontal scroll at any viewport width
- ✅ All text is readable without zoom
- ✅ No content is cut off or hidden
- ✅ Images and cards scale responsively

**Tools**: Use Chrome DevTools → Toggle Device Toolbar → Responsive mode, set to 360px width.

### 4. Slow Load Times on Mobile Network

**Issue**: 3G/4G users experience long load times.

**Test Steps**:
1. Open Chrome DevTools → Network tab
2. Set throttling to "Slow 3G"
3. Hard refresh calculator page (Cmd+Shift+R)
4. **Expected**: Page is interactive within 5 seconds
5. Measure Core Web Vitals:
   - **LCP (Largest Contentful Paint)**: < 2.5s
   - **FID (First Input Delay)**: < 100ms
   - **CLS (Cumulative Layout Shift)**: < 0.1

**Pass Criteria**:
- ✅ LCP < 2.5s on Slow 3G
- ✅ Calculator is usable (can start typing) within 3s
- ✅ No layout shift when fonts/images load
- ✅ Progress bar / skeleton loader shows immediately

**Tools**: Chrome DevTools → Lighthouse (Mobile) → Performance audit

### 5. Form Validation & Error Messages

**Test Steps**:
1. Open calculator on iPhone SE
2. Enter "0" in RSU Income field
3. **Expected**: Inline error appears immediately: "RSU income is required"
4. Error is red and positioned directly below input
5. **Expected**: Error text is at least 14px (readable without zoom)
6. Fix the error (enter "100000")
7. **Expected**: Error disappears immediately

**Pass Criteria**:
- ✅ Errors show inline, not in alert/modal
- ✅ Error text is 14px minimum
- ✅ Errors are red (#ef4444 or similar high contrast)
- ✅ Errors clear immediately when fixed

### 6. Save Notification Positioning

**Issue**: Fixed notifications can be hidden by browser chrome (address bar).

**Test Steps**:
1. Open calculator on iPhone 14 in Safari
2. Fill out one field
3. Wait 2 seconds
4. **Expected**: Green "Progress saved" notification appears
5. **Expected**: Notification is NOT hidden by top browser bar
6. Scroll down quickly
7. **Expected**: Notification stays visible at top (doesn't scroll away)

**Pass Criteria**:
- ✅ Notification is visible on all devices
- ✅ Uses safe area insets (not hidden by notch on iPhone X+)
- ✅ Auto-dismisses after 2 seconds
- ✅ Doesn't block important content

### 7. Progress Indicator Overflow

**Issue**: 3-step progress bar might overflow on 360px screens.

**Test Steps**:
1. Set viewport to 360px width (smallest Android)
2. Check progress indicator at top of calculator
3. **Expected**: All 3 steps are visible
4. **Expected**: Step labels are truncated with ellipsis if too long
5. On very small screens (320px), descriptions may hide

**Pass Criteria**:
- ✅ No horizontal overflow
- ✅ Step numbers (1, 2, 3) always visible
- ✅ Labels visible on 360px+
- ✅ Graceful degradation on <360px

### 8. Landscape Mode Usability

**Test Steps**:
1. Rotate iPhone SE to landscape (667×375px)
2. Try to use calculator
3. **Expected**: All inputs and buttons are still visible
4. **Expected**: Keyboard doesn't completely cover form
5. **Expected**: Can tap "Calculate" button without closing keyboard

**Pass Criteria**:
- ✅ Form is usable in landscape
- ✅ No excessive vertical scrolling needed
- ✅ Headings may be smaller in landscape (acceptable)

## Browser-Specific Quirks

### iOS Safari Issues
1. **100vh bug**: `height: 100vh` includes browser chrome, causing overflow
   - **Fix**: Use `min-height: -webkit-fill-available`
2. **Zoom on input focus**: Inputs <16px trigger auto-zoom
   - **Fix**: All inputs are 16px minimum
3. **Tap delay**: 300ms delay on double-tap zoom
   - **Fix**: `touch-action: manipulation`
4. **Position fixed jumps**: Fixed elements jump when keyboard appears
   - **Fix**: Use `position: sticky` or absolute positioning

### Android Chrome Issues
1. **Address bar shrinks viewport**: Viewport height changes as user scrolls
   - **Fix**: Use `100dvh` (dynamic viewport height) in modern browsers
2. **Autofill background**: Chrome autofill has yellow background
   - **Fix**: Custom `-webkit-autofill` styles applied
3. **Select dropdown styling**: Default dropdown is ugly
   - **Fix**: Custom SVG arrow with `appearance: none`

## Automated Testing

### Lighthouse CI (Mobile)
```bash
# Run Lighthouse in mobile mode
npx lighthouse https://taxbridge.app --preset=perf --view --throttling-method=devtools --form-factor=mobile

# Target scores:
# Performance: >85
# Accessibility: >95
# Best Practices: >90
```

### Visual Regression Testing (Playwright)
```bash
# Run mobile viewport tests
npx playwright test --project=mobile-chrome
npx playwright test --project=mobile-safari

# Generate screenshots
npx playwright test --update-snapshots --project=mobile-chrome
```

### Manual Testing Checklist
```
[ ] Calculator loads without errors on iPhone SE
[ ] All inputs have 44px minimum touch targets
[ ] Keyboard overlay doesn't hide inputs (iOS Safari)
[ ] No horizontal scroll on 360px viewport
[ ] Save notification visible (not hidden by notch/chrome)
[ ] Progress indicator doesn't overflow
[ ] Error messages are inline and readable (14px+)
[ ] Calculate button is always tappable (keyboard open/closed)
[ ] Form validation works correctly
[ ] Results grid stacks vertically on mobile
[ ] Landscape mode is usable
[ ] 3G network: LCP < 2.5s
```

## Performance Benchmarks

### Target Metrics (Mobile 4G)
| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint (FCP) | < 1.5s | When first text/image appears |
| Largest Contentful Paint (LCP) | < 2.5s | When calculator form is visible |
| First Input Delay (FID) | < 100ms | Time to respond to first tap |
| Cumulative Layout Shift (CLS) | < 0.1 | No content jumping during load |
| Time to Interactive (TTI) | < 3.5s | Calculator is fully usable |
| Total Blocking Time (TBT) | < 200ms | Main thread idle time |
| Speed Index | < 3.0s | Visual completion speed |

### Bundle Size Targets
- Initial JavaScript: < 150KB gzipped
- Total CSS: < 20KB gzipped
- Fonts: < 50KB (Inter variable font)
- Images: Lazy loaded, WebP format

## Common Failures & Fixes

### Issue: "Calculate button hidden by keyboard on iPhone"
**Diagnosis**: Form doesn't have `keyboard-aware-form` class
**Fix**: Add `className="keyboard-aware-form"` to form container
**Verification**: Tap input → keyboard appears → button still visible

### Issue: "Horizontal scroll on Galaxy S21"
**Diagnosis**: Fixed width element wider than 360px
**Fix**: Use `max-width: 100%` and `overflow-x: hidden`
**Verification**: Set viewport to 360px → no horizontal scrollbar

### Issue: "Inputs zoom on focus (iOS)"
**Diagnosis**: Font size < 16px
**Fix**: All inputs must be `font-size: 16px` minimum
**Verification**: Tap input → no zoom animation

### Issue: "Save notification hidden by notch"
**Diagnosis**: Not using safe area insets
**Fix**: Use `top: env(safe-area-inset-top, 1rem)`
**Verification**: Test on iPhone X/11/12+ → notification visible

### Issue: "Progress indicator overflows"
**Diagnosis**: Step labels too wide for 360px
**Fix**: Use `truncate` class and `min-w-[70px] sm:min-w-[90px]`
**Verification**: Set viewport to 360px → all 3 steps visible

## Accessibility Testing

### VoiceOver (iOS)
1. Enable VoiceOver: Settings → Accessibility → VoiceOver
2. Navigate calculator using swipe gestures
3. **Expected**: All inputs have descriptive labels
4. **Expected**: Error messages are announced
5. **Expected**: Progress indicator announces current step

### TalkBack (Android)
1. Enable TalkBack: Settings → Accessibility → TalkBack
2. Navigate calculator using swipe gestures
3. **Expected**: Same behavior as VoiceOver

### Keyboard Navigation (Bluetooth keyboard)
1. Connect Bluetooth keyboard to iPad
2. Use Tab key to navigate form
3. **Expected**: Focus order is logical (top to bottom)
4. **Expected**: Focus ring is visible (2px green outline)
5. Use Enter key to submit form

## Real Device Testing vs. Simulators

### When to Use Real Devices
- ✅ Final pre-launch QA
- ✅ Performance testing (simulators are faster than real devices)
- ✅ Network throttling (real 4G vs. simulated)
- ✅ Touch interaction feel (tap delay, scroll momentum)

### When Simulators Are Acceptable
- ✅ Layout responsiveness (viewport size testing)
- ✅ Keyboard overlay (iOS Simulator is accurate)
- ✅ Browser DevTools inspection
- ✅ Automated Playwright tests

## Reporting Issues

### Issue Template
```markdown
**Device**: iPhone SE (3rd gen)
**OS**: iOS 17.2
**Browser**: Safari 17.2
**Viewport**: 375×667px

**Issue**: Calculate button hidden by keyboard

**Steps to Reproduce**:
1. Open https://taxbridge.app/tax-calculator/WA-BC
2. Tap on "RSU Income" input field
3. Keyboard appears
4. Observe: Calculate button is completely covered

**Expected**: Button should remain visible above keyboard

**Screenshot**: [Attach image showing button hidden]

**Priority**: P0 - Blocks form submission on iPhone SE
```

## Continuous Monitoring

### Real User Monitoring (RUM)
- PostHog tracks mobile vs. desktop usage
- Core Web Vitals tracked automatically
- Drop-off points in calculator funnel

### Alerts
- LCP > 3s on mobile → Slack alert
- Mobile bounce rate > 60% → Investigate
- iOS Safari error rate > 5% → P0 bug

## Sign-Off Checklist

Before marking mobile UX as "complete", verify:

- [ ] Tested on real iPhone SE (not just simulator)
- [ ] Tested on real Android device (Galaxy S21 or similar)
- [ ] All 8 critical test scenarios pass
- [ ] Lighthouse mobile score >85 (performance)
- [ ] No horizontal scroll on 360px viewport
- [ ] Keyboard overlay doesn't hide inputs on iOS
- [ ] All touch targets are 44×44px minimum
- [ ] VoiceOver/TalkBack navigation works
- [ ] Core Web Vitals meet targets (LCP <2.5s, FID <100ms, CLS <0.1)
- [ ] Product manager / designer sign-off received

## Resources

- [WCAG 2.1 Touch Target Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [iOS Safari Keyboard Bugs](https://bugs.webkit.org/show_bug.cgi?id=141832)
- [Chrome DevTools Mobile Simulation](https://developer.chrome.com/docs/devtools/device-mode/)
- [Web.dev Mobile Performance](https://web.dev/mobile/)
- [Visual Viewport API](https://developer.mozilla.org/en-US/docs/Web/API/Visual_Viewport_API)
