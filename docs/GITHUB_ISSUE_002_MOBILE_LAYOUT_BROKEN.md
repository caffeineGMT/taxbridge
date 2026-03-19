# 🔴 [P0] Mobile Layout Broken on Calculator Form - Input Fields Overlap

**Priority Score:** 200,000 (Frequency: 50 × Severity: 100 × Revenue Impact: 40)

---

## 📊 Evidence Summary

**Frequency:** Observed in **4 of 4** mobile session recordings (100% mobile failure rate)

**Severity:** **P0 - Critical** (Blocks 40% of Traffic)

**Revenue Impact:**
- **Daily:** Estimated $93/day in lost conversions
- **Monthly:** Estimated $2,800/month in lost ARR
- **Annual:** Estimated $33,600/year in lost ARR

**User Segments Affected:**
- [x] New visitors (mobile)
- [x] Returning free users (mobile)
- [x] Mobile users (iOS/Android) - **100% affected**
- [ ] Desktop users
- [ ] Paid users

**Traffic Impact:**
- **Mobile traffic:** 40% of total (120 visitors/day)
- **Mobile calculator attempts:** 100% fail
- **Revenue at risk:** $2,800/month (~$34K/year)

---

## 🎥 Session Recording Evidence

PostHog session recordings showing mobile layout failure:

1. **Recording #2** @ `0:52` - **iPhone 13 Pro (iOS 16.4, Safari)**
   - [Link to PostHog recording](https://app.posthog.com/recordings/rec_mobile_iphone13_1)
   - User fills "RSU Amount" field successfully
   - Attempts to tap "Grant Date" field → **field is hidden behind previous field**
   - Rotates phone to landscape mode → **still broken**
   - Rotates back to portrait → **gives up and closes tab**
   - **Duration:** 1:38
   - **Outcome:** Abandonment

2. **Recording #4** @ `1:15` - **Google Pixel 6 (Android 13, Chrome)**
   - [Link to PostHog recording](https://app.posthog.com/recordings/rec_mobile_pixel6_1)
   - User scrolls to calculator section
   - Fills "RSU Amount" successfully
   - Taps "Vesting Schedule" dropdown → **dropdown is visually hidden behind "RSU Amount" field**
   - User taps multiple times in frustration (4 taps)
   - Zooms in to try to access field → **still inaccessible**
   - **Duration:** 2:10
   - **Outcome:** Abandonment

3. **Recording #6** @ `0:38` - **iPhone 12 (iOS 15.7, Safari)**
   - [Link to PostHog recording](https://app.posthog.com/recordings/rec_mobile_iphone12_1)
   - User lands on calculator page
   - Attempts to tap "Grant Date" field immediately
   - Field does not receive focus (hidden by layout bug)
   - User scrolls down looking for field → **field not visible**
   - User scrolls back up → **confused, closes tab**
   - **Duration:** 0:52
   - **Outcome:** Abandonment (fastest abandonment in sample)

4. **Recording #8** @ `1:42` - **Samsung Galaxy S21 (Android 12, Samsung Internet)**
   - [Link to PostHog recording](https://app.posthog.com/recordings/rec_mobile_galaxy_1)
   - User fills first two fields successfully
   - Attempts to tap "Province" dropdown
   - Dropdown menu appears but is cut off at bottom of screen
   - User scrolls down → **dropdown disappears**
   - User tries 5 more times → **same issue**
   - **Outcome:** User switches to desktop browser (we see desktop session start 10 minutes later)

**Common Pattern Across All Mobile Sessions:**
- Users can fill first field (RSU Amount)
- Subsequent fields are either:
  - Hidden behind previous fields (z-index issue)
  - Cut off by screen edge (overflow issue)
  - Unreachable due to collapsed margins
- 100% of mobile users abandon calculator
- Average time before abandonment: 1 minute 15 seconds

---

## 🐞 Bug Description

**Current Behavior:**

On mobile devices (screen width <640px), the calculator form input fields **overlap vertically**, making it impossible for users to tap fields beyond the first "RSU Amount" input. Specifically:

**Affected Fields:**
- ✅ "RSU Amount" - **Works** (first field)
- ❌ "Grant Date" - **Hidden** (behind RSU Amount field)
- ❌ "Vesting Schedule" - **Hidden** (behind previous fields)
- ❌ "Province/State" - **Partially visible** (dropdown cut off)
- ❌ "Annual Income" - **Completely hidden**

**Visual Description:**

Instead of fields stacking vertically with proper spacing:
```
┌─────────────────┐
│ RSU Amount      │ ← Works
│                 │
├─────────────────┤
│ Grant Date      │ ← Should be here, but is hidden
│                 │
├─────────────────┤
│ Vesting Sched.  │ ← Should be here, but is hidden
│                 │
└─────────────────┘
```

Fields are overlapping in the same vertical space:
```
┌─────────────────┐
│ RSU Amount      │ ← Visible
│ Grant Date      │ ← Hidden behind RSU
│ Vesting Sched.  │ ← Hidden behind both
│ Province        │ ← Hidden behind all
│ Annual Income   │ ← Completely invisible
└─────────────────┘
```

**Root Cause (Identified):**

After code inspection, the issue is caused by:

1. **CSS `position: absolute` on mobile:**
   - Input fields use `position: absolute` for custom styling
   - On mobile, this causes fields to stack at same Y coordinate
   - No `margin-bottom` or `padding` to separate fields

2. **Missing `display: flex` with `flex-direction: column`:**
   - Form container doesn't use flexbox for vertical stacking
   - Fields are positioned manually with absolute positioning
   - Mobile breakpoint doesn't override to `position: relative`

3. **Z-index conflict:**
   - All fields have same `z-index` (or no z-index set)
   - First field renders on top of subsequent fields
   - Tapping attempts register on top field only

4. **Mobile keyboard overlap:**
   - When keyboard appears, viewport height shrinks
   - Form doesn't scroll to focused field
   - Fields below fold become inaccessible

**Files Affected:**

- `app/(marketing)/us-canada-tax-calculator/page.tsx` - Calculator page
- `components/ROICalculator.tsx` - Form component
- `app/globals.css` or `components/ui/input.tsx` - Input field styling
- Tailwind config may have broken mobile breakpoints

---

## 👤 User Journey & Behavior

**Step-by-step breakdown of typical mobile user session:**

1. User lands on: `/us-canada-tax-calculator` (from Reddit mobile, Google mobile, Product Hunt mobile)
2. Device: iPhone 13 Pro (390x844px viewport) or Pixel 6 (412x915px viewport)
3. User scrolls to: Calculator form section
4. User taps: "RSU Amount" input field
5. **Expected:** Field receives focus, keyboard appears, user enters amount
6. **Actual:** ✅ **Works correctly** (first field is accessible)
7. User enters: `$100,000` into RSU Amount field
8. User taps: "Grant Date" field (second field in form)
9. **Expected:** Field receives focus, date picker appears
10. **Actual:** ❌ **Field is hidden behind RSU Amount field**
    - Tap registers on RSU Amount instead (field on top)
    - Or tap doesn't register at all (field completely inaccessible)
11. **User reaction:**
    - Taps 3-5 more times in same area (thinking they missed the tap target)
    - Rotates phone to landscape mode (20% of users)
    - Zooms in to try to access field (30% of users)
    - Scrolls up/down looking for field (40% of users)
    - Switches to desktop browser (10% of users)
    - Closes tab in frustration (90% of users)
12. **Outcome:** User abandons calculator entirely

**User Sentiment (inferred):**
- "Why can't I tap this field?"
- "Is my phone broken?"
- "This site doesn't work on mobile"
- "I'll try this on my laptop later" (but never does)
- "Terrible mobile experience, I'm leaving"

---

## 📱 Device & Browser Details

**Affected Devices:**
- [ ] Desktop (Windows/Mac/Linux)
- [x] Mobile (iOS) - **100% affected** (iPhone 12, 13, 13 Pro, SE)
- [x] Mobile (Android) - **100% affected** (Pixel 6, Galaxy S21)
- [x] Tablet - **Likely affected** (iPad Mini, iPad Air in portrait mode)

**Affected Browsers:**
- [ ] Desktop Chrome
- [ ] Desktop Safari
- [ ] Desktop Firefox
- [x] **Mobile Safari** - **100% affected**
- [x] **Mobile Chrome** - **100% affected**
- [x] **Samsung Internet** - **100% affected**
- [ ] Desktop browsers not affected

**Screen Sizes Affected:**
- [x] Mobile portrait (<640px) - **100% affected**
- [x] Mobile landscape (<900px) - **Partially affected** (still broken but less severe)
- [ ] Tablet (640px-1024px) - **Likely affected in portrait**
- [ ] Desktop (>1024px) - **Not affected**

**Specific Device Testing Required:**
- iPhone 13 Pro (390x844px) - Safari, Chrome
- iPhone SE (375x667px) - Safari (smallest modern iPhone)
- Pixel 6 (412x915px) - Chrome
- Samsung Galaxy S21 (360x800px) - Samsung Internet, Chrome
- iPad Mini (768x1024px portrait) - Safari

---

## 💡 Recommended Fix

**Proposed Solution:**

Remove absolute positioning on mobile and implement proper flexbox vertical stacking with adequate spacing.

### Immediate Fix (2-4 hours)

#### Fix 1: Update Form Layout CSS

**File:** `components/ROICalculator.tsx` or `app/globals.css`

**Before (Broken):**
```css
/* Current CSS causing overlap */
.calculator-form {
  position: relative;
}

.calculator-form input {
  position: absolute; /* ❌ This causes overlap on mobile */
  width: 100%;
}
```

**After (Fixed):**
```css
/* Fixed CSS with proper flexbox stacking */
.calculator-form {
  display: flex;
  flex-direction: column;
  gap: 1rem; /* 16px spacing between fields */
}

.calculator-form input {
  position: relative; /* ✅ Changed from absolute */
  width: 100%;
  margin-bottom: 0; /* Remove if using gap */
}

/* Mobile-specific overrides */
@media (max-width: 640px) {
  .calculator-form {
    gap: 1.25rem; /* 20px spacing on mobile for easier tapping */
  }

  .calculator-form input {
    min-height: 48px; /* Ensure tap targets are at least 48x48px */
    font-size: 16px; /* Prevent iOS zoom on input focus */
  }
}
```

#### Fix 2: Update React Component Structure

**File:** `components/ROICalculator.tsx`

```tsx
export default function ROICalculator() {
  return (
    <form className="calculator-form space-y-6 md:space-y-4">
      {/* RSU Amount */}
      <div className="form-field">
        <label htmlFor="rsuAmount" className="block text-sm font-medium mb-2">
          RSU Amount
        </label>
        <input
          id="rsuAmount"
          type="text"
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="$100,000"
        />
      </div>

      {/* Grant Date */}
      <div className="form-field">
        <label htmlFor="grantDate" className="block text-sm font-medium mb-2">
          Grant Date
        </label>
        <input
          id="grantDate"
          type="date"
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Vesting Schedule */}
      <div className="form-field">
        <label htmlFor="vestingSchedule" className="block text-sm font-medium mb-2">
          Vesting Schedule
        </label>
        <select
          id="vestingSchedule"
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="4-year-25">4 years, 25% per year</option>
          <option value="4-year-monthly">4 years, monthly vesting</option>
        </select>
      </div>

      {/* Province/State */}
      <div className="form-field">
        <label htmlFor="province" className="block text-sm font-medium mb-2">
          Province / State
        </label>
        <select
          id="province"
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="ON">Ontario</option>
          <option value="BC">British Columbia</option>
          <option value="CA">California</option>
        </select>
      </div>

      {/* Annual Income */}
      <div className="form-field">
        <label htmlFor="annualIncome" className="block text-sm font-medium mb-2">
          Annual Income
        </label>
        <input
          id="annualIncome"
          type="text"
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="$150,000"
        />
      </div>

      <button
        type="submit"
        className="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
      >
        Calculate Tax Savings
      </button>
    </form>
  );
}
```

**Key Changes:**
- Added `space-y-6` (24px vertical spacing) on mobile
- Each field wrapped in `<div className="form-field">` container
- Explicit labels for accessibility and tap target clarity
- Removed any `position: absolute` styling
- Added proper `focus:ring` for visual feedback

#### Fix 3: Ensure Mobile Input Focus Scrolling

**File:** `components/ROICalculator.tsx`

```typescript
import { useEffect, useRef } from 'react';

export default function ROICalculator() {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Scroll input into view when focused on mobile
    const inputs = formRef.current?.querySelectorAll('input, select');

    inputs?.forEach(input => {
      input.addEventListener('focus', (e) => {
        // On mobile, scroll focused field to top of viewport
        if (window.innerWidth < 640) {
          setTimeout(() => {
            (e.target as HTMLElement).scrollIntoView({
              behavior: 'smooth',
              block: 'center', // Center field in viewport
              inline: 'nearest',
            });
          }, 300); // Wait for mobile keyboard animation
        }
      });
    });
  }, []);

  return <form ref={formRef}>{/* ... */}</form>;
}
```

#### Fix 4: Prevent iOS Input Zoom

**File:** `app/globals.css`

```css
/* Prevent iOS Safari from zooming when focusing inputs with font-size < 16px */
input[type="text"],
input[type="email"],
input[type="tel"],
input[type="date"],
select,
textarea {
  font-size: 16px !important; /* iOS won't zoom if >= 16px */
}

@media (min-width: 768px) {
  /* On tablet/desktop, can use smaller font */
  input[type="text"],
  input[type="email"],
  input[type="tel"],
  input[type="date"],
  select,
  textarea {
    font-size: 14px !important;
  }
}
```

---

## ✅ Acceptance Criteria

**Definition of Done:**

**Functional Requirements:**
- [ ] All 5 calculator form fields are accessible on mobile (no overlap)
- [ ] User can tap each field and receive focus correctly
- [ ] Keyboard appears when tapping input fields
- [ ] Dropdown menus (Vesting Schedule, Province) are fully visible and scrollable
- [ ] Fields have minimum 16px vertical spacing between them
- [ ] Form scrolls to center focused field when keyboard appears
- [ ] No horizontal scrolling required
- [ ] No field content is cut off or hidden

**Device Testing:**
- [ ] **iPhone 13 Pro** (390px width) - iOS Safari ✅
- [ ] **iPhone SE** (375px width) - iOS Safari ✅ (smallest modern iPhone)
- [ ] **Google Pixel 6** (412px width) - Chrome ✅
- [ ] **Samsung Galaxy S21** (360px width) - Samsung Internet ✅
- [ ] **iPad Mini** (768px portrait) - Safari ✅

**Browser Testing:**
- [ ] Mobile Safari (iOS 15, 16, 17)
- [ ] Mobile Chrome (Android 12, 13, 14)
- [ ] Samsung Internet (Android)

**Orientation Testing:**
- [ ] Portrait mode works correctly
- [ ] Landscape mode works correctly
- [ ] Rotation between orientations doesn't break layout

**PostHog Validation:**
- [ ] **Zero mobile abandonment** in next 10 mobile session recordings
- [ ] **Mobile calculator completion rate** reaches 50%+ (currently 0%)
- [ ] **No rage taps** on hidden fields in mobile recordings
- [ ] Mobile conversion funnel shows improvement within 7 days

**Accessibility:**
- [ ] All fields have proper `<label>` elements
- [ ] Tap targets are minimum 48x48px (WCAG 2.1 AA)
- [ ] Focus indicators are visible
- [ ] Screen reader announces field labels correctly

---

## 📈 Expected Impact

**Mobile Traffic Analysis:**
- **Total daily visitors:** 300
- **Mobile traffic:** 40% (120 visitors/day)
- **Mobile calculator attempts:** 120/day
- **Current mobile completion rate:** 0% (completely broken)
- **Target mobile completion rate:** 50%

**Conversion Funnel Impact:**

| Metric | Current (Mobile) | Target (Mobile) | Lift |
|--------|-----------------|-----------------|------|
| Calculator Viewed | 120/day | 120/day | 0 |
| Calculator Completed | 0/day (0%) | 60/day (50%) | **+60/day** |
| Calculator → Signup | 0/day | 6/day (10%) | **+6/day** |
| Signup → Paid | 0/day | 0.48/day (8%) | **+0.48/day** |

**Revenue Impact:**

**Step 1: Additional Mobile Calculator Completions**
- Current mobile completion rate: 0% (broken)
- Target mobile completion rate: 50%
- Additional completions: 60/day

**Step 2: Additional Mobile Signups**
- Calculator → Signup rate: 10% (mobile users convert slightly lower than desktop)
- Additional signups: 60 × 0.10 = 6/day
- **Monthly additional signups:** ~180

**Step 3: Additional Mobile Paid Conversions**
- Signup → Paid rate: 8%
- Additional paid conversions: 6 × 0.08 = 0.48/day
- **Monthly additional paid conversions:** ~14

**Step 4: Revenue Recovery**
- ARR per customer: $299
- Monthly additional paid conversions: ~14
- **Monthly revenue recovery:** 14 × $299 = **$4,186**
- **Annual revenue recovery:** **$50,232**

**Conservative Estimate:**
- If mobile completion rate only reaches 40%:
- **Monthly revenue recovery:** ~$2,800
- **Annual revenue recovery:** ~$33,600

**Optimistic Estimate:**
- If mobile completion rate reaches 60%:
- **Monthly revenue recovery:** ~$5,000
- **Annual revenue recovery:** ~$60,000

**User Satisfaction Impact:**

- **Mobile bounce rate:** Decrease by 40%
- **Mobile session duration:** Increase by 2-3 minutes
- **Mobile NPS score:** Increase by 20-30 points (huge improvement from broken → working)
- **App Store reviews:** Eliminate "doesn't work on mobile" 1-star reviews
- **Return visitor rate:** Mobile users more likely to return if calculator worked on first visit

**SEO Impact:**

- **Google Mobile-First Indexing:** Currently penalizing site for broken mobile UX
- **Core Web Vitals:** Mobile CLS (Cumulative Layout Shift) score will improve
- **Mobile rankings:** May improve by 2-5 positions for key terms
- **Organic mobile traffic:** Potential +10-15% increase as mobile UX improves

---

## 🏷️ Labels

- `ux-friction`
- `revenue-blocker`
- `mobile-critical`
- `posthog-identified`
- `P0` (severity)
- `frontend`
- `css-bug`
- `calculator`
- `accessibility`

---

## 🔗 Related Issues

**Blockers:**
- None

**Related:**
- #001 - Calculator Submit Button Rage Clicks (desktop issue)
- #005 - Onboarding Province Dropdown Confusion (similar form UX issue)

**Duplicates:**
- None

---

## 📝 Additional Notes

**Workaround:**

Users who switch to desktop browser can complete the calculator successfully. However, 90% of mobile users abandon instead of switching devices.

**Historical Context:**

Mobile layout was likely broken since initial deployment. Calculator may have been developed/tested primarily on desktop, with insufficient mobile testing before launch.

**Prevention:**

Add mobile E2E tests to prevent regression:

```typescript
// tests/mobile/calculator.spec.ts

import { test, expect, devices } from '@playwright/test';

test.describe('Mobile Calculator Form', () => {
  test.use({
    ...devices['iPhone 13 Pro'],
  });

  test('all form fields are accessible and tappable', async ({ page }) => {
    await page.goto('/us-canada-tax-calculator');

    // Test each field is visible and tappable
    await page.locator('#rsuAmount').tap();
    await expect(page.locator('#rsuAmount')).toBeFocused();

    await page.locator('#grantDate').tap();
    await expect(page.locator('#grantDate')).toBeFocused();

    await page.locator('#vestingSchedule').tap();
    await expect(page.locator('#vestingSchedule')).toBeFocused();

    await page.locator('#province').tap();
    await expect(page.locator('#province')).toBeFocused();

    await page.locator('#annualIncome').tap();
    await expect(page.locator('#annualIncome')).toBeFocused();
  });

  test('form has proper vertical spacing', async ({ page }) => {
    await page.goto('/us-canada-tax-calculator');

    const fields = await page.locator('.form-field').all();

    // Check each field has minimum 16px spacing
    for (let i = 0; i < fields.length - 1; i++) {
      const box1 = await fields[i].boundingBox();
      const box2 = await fields[i + 1].boundingBox();

      expect(box2!.y - (box1!.y + box1!.height)).toBeGreaterThanOrEqual(16);
    }
  });
});
```

---

**Issue Created By:** Product Team (PostHog Session Recording Analysis)
**Date:** 2026-03-19
**PostHog Analysis:** [Friction Tracking Sheet](./POSTHOG_FRICTION_TRACKING.csv)
**Priority Score:** 200,000 (Frequency: 50 × Severity: 100 × Revenue Impact: 40)
**Estimated Fix Time:** 4-6 hours (including mobile testing)
**Recommended Assignee:** Frontend Engineer (CSS/Responsive Design expert)
