# Cross-Browser Manual Testing Checklist

**Application:** TaxBridge CPA
**Purpose:** Manual QA verification across browsers and devices
**Time Required:** ~45 minutes per browser/device

---

## Testing Matrix

| Browser | Desktop | Mobile | Priority | Time |
|---------|---------|--------|----------|------|
| Chrome | ✅ Required | ✅ Required (Android) | P0 | 30 min |
| Safari | ✅ Required | ✅ Required (iOS) | P0 | 30 min |
| Firefox | ✅ Required | ⚪ Optional | P1 | 20 min |
| Edge | ✅ Required | ⚪ Optional | P1 | 20 min |

---

## Pre-Testing Setup

### Desktop Testing
- [ ] Open browser in **standard (non-private) window**
- [ ] Clear cache and cookies: `Cmd/Ctrl + Shift + Delete`
- [ ] Disable browser extensions (use Incognito/Private mode)
- [ ] Set window size to **1920×1080** for desktop tests
- [ ] Open DevTools Console (F12) to monitor errors

### Mobile Testing
- [ ] **iOS:** Use Safari on physical iPhone or Simulator
- [ ] **Android:** Use Chrome on physical device or Android Emulator
- [ ] Connect to same WiFi as dev machine (for localhost testing)
- [ ] Enable "Show touch feedback" in device settings
- [ ] Clear browser data before testing

---

## Section 1: Homepage (Desktop)

**URL:** `https://taxbridgecpa.com/`

### Visual Rendering
- [ ] Hero section gradient text renders correctly (no invisible text)
- [ ] Background gradient visible and smooth
- [ ] All images load without broken links
- [ ] Navigation menu aligned properly
- [ ] Footer displays all links

### Interactive Elements
- [ ] CTA button "Get Started" is visible and clickable
- [ ] Hover states work on buttons and links
- [ ] Navigation menu items highlight on hover
- [ ] Logo links back to homepage
- [ ] All external links open in new tabs

### Responsive Behavior
- [ ] Resize to 1024px width - layout adapts correctly
- [ ] Resize to 768px width - mobile menu appears
- [ ] No horizontal scrollbars at any width
- [ ] Text remains readable at all sizes

---

## Section 2: Homepage (Mobile)

**URL:** `https://taxbridgecpa.com/`
**Test on:** iOS Safari (iPhone 13) + Android Chrome (Pixel 5)

### Layout
- [ ] No horizontal scroll (viewport width constrained)
- [ ] Hero section fits in first screen (no excessive empty space)
- [ ] All text readable without zoom (16px minimum)
- [ ] Touch targets ≥ 44×44px (buttons, links)
- [ ] Images resize to fit screen

### iOS Safari Specific
- [ ] No content hidden under notch/status bar
- [ ] Safe area insets applied (padding on sides)
- [ ] Viewport height accounts for address bar (no jumping)
- [ ] Gradient text not clipped or invisible

### Android Chrome Specific
- [ ] Address bar hide/show doesn't break layout
- [ ] Tap highlight color removed (no blue flash)
- [ ] Font smoothing looks good (not pixelated)

---

## Section 3: Tax Calculator (Desktop)

**URL:** `https://taxbridgecpa.com/tax-calculator/washington-bc`

### Form Inputs
- [ ] All input fields visible and labeled
- [ ] Click in "Income" field - cursor appears
- [ ] Type `100000` - displays as `100,000` (currency formatting)
- [ ] Type `abc123` - filters to `123` (non-numeric rejected)
- [ ] Tab through fields - focus order logical
- [ ] Focus ring visible on focused inputs (2px outline)

### Input Validation
- [ ] Required fields show error if empty on submit
- [ ] Negative numbers rejected or sanitized
- [ ] Very large numbers (999999999) accepted
- [ ] Decimal numbers formatted correctly ($1,234.56)
- [ ] Empty field doesn't crash app

### Number Input Behavior
- [ ] Number input spinners hidden (no up/down arrows)
- [ ] Mouse wheel scroll doesn't change input value
- [ ] Paste "  $1,234.56  " formats to `1,234.56`

### Calculation
- [ ] Fill all fields with valid data
- [ ] Click "Calculate" button
- [ ] Results page loads within 2 seconds
- [ ] Results show correct calculations
- [ ] Charts render without errors

---

## Section 4: Tax Calculator (Mobile)

**URL:** `https://taxbridgecpa.com/tax-calculator/washington-bc`

### iOS Safari Input Focus
- [ ] Tap income field - **NO ZOOM** (font-size ≥ 16px)
- [ ] Keyboard appears and doesn't overlay submit button
- [ ] Scroll to see submit button if needed
- [ ] Focused input scrolls into view automatically
- [ ] Keyboard "Done" button closes keyboard

### Keyboard Type
- [ ] Number inputs show **numeric keyboard** (iOS)
- [ ] Email input shows **email keyboard** (@, .com keys)
- [ ] Phone input shows **phone keyboard** (dial pad)

### Form Submission
- [ ] Fill out form on mobile
- [ ] Tap "Calculate" button (button ≥ 44px height)
- [ ] Loading state visible (spinner or disabled button)
- [ ] Results page loads and displays correctly
- [ ] Can scroll through results

### Android Chrome Specific
- [ ] Autofill suggestions styled correctly (not yellow)
- [ ] Select dropdowns use custom arrow (not default)
- [ ] Input focus doesn't have blue border

---

## Section 5: Payment Flow (Desktop + Mobile)

**URL:** `https://taxbridgecpa.com/pricing` → Checkout

### Stripe Checkout
- [ ] Click "Subscribe" on pricing page
- [ ] Redirects to Stripe Checkout hosted page
- [ ] Stripe form renders correctly (card fields visible)
- [ ] Enter test card: `4242 4242 4242 4242`
- [ ] Enter future expiry date and any CVV
- [ ] Submit payment - redirects back to app
- [ ] Success page displays

### Error Handling
- [ ] Enter declined card: `4000 0000 0000 0002`
- [ ] Error message displays clearly
- [ ] Can retry payment without refreshing

---

## Section 6: Dashboard (Desktop)

**URL:** `https://taxbridgecpa.com/dashboard`

### Authentication
- [ ] Not logged in - redirects to login page
- [ ] Clerk login form renders correctly
- [ ] Login with test account succeeds
- [ ] Redirects back to dashboard after login

### Data Display
- [ ] Dashboard loads user data
- [ ] Charts render (Recharts library)
- [ ] Tables display data rows
- [ ] Pagination works if applicable
- [ ] No console errors (check DevTools)

### Responsive
- [ ] Sidebar collapses on mobile (< 768px)
- [ ] Charts resize to fit mobile screen
- [ ] Tables scroll horizontally if needed

---

## Section 7: Accessibility (Desktop)

### Keyboard Navigation
- [ ] Press `Tab` repeatedly - focus moves through page
- [ ] Focus visible on all interactive elements
- [ ] Press `Enter` on focused button - activates
- [ ] Press `Escape` on modal - closes modal
- [ ] No keyboard traps (can tab out of all sections)

### Screen Reader (Optional)
- [ ] Enable VoiceOver (Mac: Cmd+F5) or NVDA (Windows)
- [ ] Navigate through homepage - all content announced
- [ ] Form labels read correctly
- [ ] Button purpose clear from label

### Color Contrast
- [ ] All text readable without straining
- [ ] Muted text (gray) still legible on dark background
- [ ] Links distinguishable from normal text
- [ ] Button text contrasts with button background

---

## Section 8: Cross-Browser Specific Tests

### Safari Desktop
- [ ] Gradient text rendering (bg-clip-text)
  - Go to homepage, inspect `<h1>` with gradient
  - Text should be gradient colored, not invisible
  - No webkit prefix errors in console

- [ ] Backdrop blur (header)
  - Scroll down homepage
  - Sticky header should have blur effect
  - Not just transparent background

- [ ] Autofill styling
  - Go to calculator, autofill a field
  - Background should match theme (not yellow)

### Firefox Desktop
- [ ] Number input styling
  - Open calculator
  - Number inputs should NOT have spinners
  - `-moz-appearance: textfield` applied

- [ ] Placeholder opacity
  - Check input placeholders are fully visible
  - Not faded to 54% opacity (Firefox default)

- [ ] Focus outlines
  - Tab through form
  - No dotted outline on buttons (removed via ::-moz-focus-inner)

### Edge Desktop
- [ ] All Chrome tests pass (Edge is Chromium-based)
- [ ] Collections icon doesn't interfere with UI

### Chrome Desktop
- [ ] Search input styling
  - Any search fields should not have Chrome's default "x" clear button
  - `-webkit-search-decoration: none` applied

- [ ] Autofill background
  - Autofill a field
  - Background color matches theme (not Chrome's blue)

---

## Section 9: Mobile-Specific Tests

### iOS Safari (iPhone 13)
- [ ] **Viewport height**
  - Scroll down/up to hide/show address bar
  - Content doesn't jump or reflow
  - Full-height sections remain full-height

- [ ] **Input zoom prevention**
  - Tap any input field
  - Page does NOT zoom in
  - Font-size ≥ 16px on all inputs

- [ ] **Keyboard overlay**
  - Tap bottom-most input on calculator
  - Keyboard appears
  - Submit button still visible (or scrollable)
  - Focused input not hidden behind keyboard

- [ ] **Safe area (notch)**
  - View page in landscape
  - No content hidden under notch
  - Padding on left/right edges (env(safe-area-inset))

- [ ] **Touch targets**
  - All buttons and links ≥ 44×44px
  - Easy to tap without precision

- [ ] **Momentum scrolling**
  - Scroll long pages (Terms of Service, blog posts)
  - Smooth inertia scrolling (not choppy)

- [ ] **Fixed positioning**
  - Sticky header should not jank during scroll
  - position: sticky preferred over position: fixed

### Android Chrome (Pixel 5)
- [ ] **Address bar behavior**
  - Scroll down - address bar hides
  - Scroll up - address bar shows
  - Layout doesn't shift (100vh uses -webkit-fill-available)

- [ ] **Autofill background**
  - Autofill username/email
  - Background color matches theme (not yellow)
  - `-webkit-box-shadow` hack applied

- [ ] **Select dropdown**
  - Tap any select dropdown
  - Custom styled arrow visible (green, not default gray)
  - Dropdown menu styled correctly

- [ ] **Tap highlight**
  - Tap any button
  - No blue highlight flash on tap
  - `-webkit-tap-highlight-color: transparent`

---

## Section 10: Performance

### Desktop
- [ ] Homepage loads in < 3 seconds (first contentful paint)
- [ ] Calculator results render in < 2 seconds
- [ ] No layout shift when images load (CLS < 0.1)
- [ ] Animations smooth (60fps, no jank)
- [ ] No console errors or warnings

### Mobile
- [ ] Homepage loads in < 5 seconds on 4G
- [ ] Touch interactions respond instantly (< 100ms)
- [ ] Scrolling smooth (no lag or stutter)
- [ ] No memory leaks (use DevTools Performance)

---

## Section 11: Edge Cases

### Small Screens (iPhone SE - 375px width)
- [ ] Text doesn't overflow horizontally
- [ ] All buttons fit on screen
- [ ] Calculator input fields stack vertically
- [ ] Results cards single column

### Large Screens (1920px+ width)
- [ ] Content centered (not stretched edge-to-edge)
- [ ] Max container width enforced
- [ ] Images don't pixelate
- [ ] Whitespace balanced

### Landscape Mode (Mobile)
- [ ] Layout adapts to landscape (shorter height)
- [ ] Headings reduce size if needed
- [ ] Keyboard doesn't cover entire screen

### Dark Mode
- [ ] Check if OS/browser has dark mode enabled
- [ ] App theme should be dark by default
- [ ] All text readable (sufficient contrast)
- [ ] Charts colors visible on dark background

---

## Section 12: Regression Checks (After Code Changes)

### CSS Changes
- [ ] Vendor prefixes still present (-webkit, -moz)
- [ ] No new layout breaks introduced
- [ ] Animations still work
- [ ] Responsive breakpoints unchanged

### JavaScript Changes
- [ ] No new console errors
- [ ] Fetch API calls still work
- [ ] Form validation still fires
- [ ] LocalStorage still accessible

### Third-Party Updates (Stripe, Clerk, PostHog)
- [ ] Stripe Checkout still loads
- [ ] Clerk authentication still works
- [ ] PostHog events still fire (check network tab)

---

## Section 13: Browser-Specific Console Checks

Open DevTools Console (F12) and check for:

### Safari Console
- [ ] No `-webkit-` prefix warnings
- [ ] No `ResizeObserver loop limit exceeded` errors
- [ ] No CORS errors

### Firefox Console
- [ ] No `-moz-` prefix warnings
- [ ] No `unreachable code` warnings
- [ ] No security warnings

### Chrome Console
- [ ] No `Uncaught TypeError` errors
- [ ] No `404` network errors
- [ ] No `CORS` policy errors
- [ ] No `Deprecation` warnings

---

## Reporting Issues

### Issue Template

**Browser:** [Chrome/Firefox/Safari/Edge]
**Version:** [Browser version number]
**OS:** [macOS/Windows/iOS/Android]
**Device:** [Desktop/iPhone 13/Pixel 5]
**URL:** [Page where issue occurred]

**Issue Description:**
[Clear description of what's broken]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happened]

**Steps to Reproduce:**
1. Go to [URL]
2. Click [element]
3. Observe [issue]

**Screenshots:**
[Attach screenshots or screen recordings]

**Console Errors:**
```
[Paste any errors from DevTools Console]
```

---

## Test Sign-Off

**Tester Name:** ____________________
**Date:** ____________________

| Browser | Desktop Status | Mobile Status | Notes |
|---------|----------------|---------------|-------|
| Chrome | ☐ Pass ☐ Fail | ☐ Pass ☐ Fail | |
| Safari | ☐ Pass ☐ Fail | ☐ Pass ☐ Fail | |
| Firefox | ☐ Pass ☐ Fail | ☐ N/A | |
| Edge | ☐ Pass ☐ Fail | ☐ N/A | |

**Overall Status:** ☐ **PASS** (ready for production) | ☐ **FAIL** (blockers found)

**Blockers (if any):**
- [ ] [Describe blocking issues]

**Signature:** ____________________
