# UX Friction Issue Template

Use this template when creating GitHub issues for UX problems identified in PostHog session recordings.

---

## 🔴 [P0/P1/P2] [Short Issue Title]

**Example:** 🔴 [P0] Calculator Submit Button Rage Clicks - No Response on Click

---

### 📊 Evidence Summary

**Frequency:** Observed in **[N] of 10** session recordings (XX% of analyzed sessions)

**Severity:** [P0 - Critical / P1 - High / P2 - Medium / P3 - Low]

**Revenue Impact:**
- **Daily:** Estimated $[X]/day in lost conversions
- **Monthly:** Estimated $[X]/month in lost ARR
- **Annual:** Estimated $[X]/year in lost ARR

**User Segments Affected:**
- [ ] New visitors
- [ ] Returning free users
- [ ] Mobile users (iOS/Android)
- [ ] Desktop users (Chrome/Safari/Firefox)
- [ ] Paid users

---

### 🎥 Session Recording Evidence

Provide links to specific PostHog recordings showing the issue:

1. **Recording #3** @ `0:45` - [Link to PostHog recording](https://app.posthog.com/recordings/RECORDING_ID_1)
   - User clicks Calculator button 7 times, no response
   - User abandons session after 15 seconds

2. **Recording #7** @ `1:12` - [Link to PostHog recording](https://app.posthog.com/recordings/RECORDING_ID_2)
   - User clicks Calculator button 4 times
   - Eventually refreshes page and tries again

3. **Recording #9** @ `2:08` - [Link to PostHog recording](https://app.posthog.com/recordings/RECORDING_ID_3)
   - User clicks Calculator button, waits 10 seconds, then closes tab

---

### 🐞 Bug Description

**Current Behavior:**
[Detailed description of what's currently happening]

**Example:**
When users click the "Calculate Tax Savings" button on the calculator page, there is no visual response or feedback. The button does not show a loading state, disabled state, or trigger the calculation. This results in users clicking repeatedly (rage clicking) before abandoning the session.

**Root Cause (if known):**
[Technical details about why this is happening, if identified]

**Example:**
- Event handler may not be properly attached to button
- JavaScript error preventing form submission
- API endpoint timeout with no error handling
- Missing loading state UI component

---

### 👤 User Journey & Behavior

**Step-by-step breakdown:**

1. User lands on: [Page URL]
2. User scrolls to: [Section/Component]
3. User fills out: [Form fields]
4. User clicks: [Button/Element]
5. **Expected:** [What should happen]
6. **Actual:** [What actually happens]
7. **User reaction:** [Rage clicks / Abandons / Tries alternative / Confused behavior]

**Example:**
1. User lands on: `/calculator`
2. User fills out: All 5 calculator form fields (RSU amount, grant date, vesting schedule, province, income)
3. User clicks: "Calculate Tax Savings" button
4. **Expected:** Loading spinner appears, results display within 2-3 seconds
5. **Actual:** Button shows no visual feedback, no loading state, no results
6. **User reaction:** Clicks button 7 more times rapidly (rage click), waits 15 seconds, then closes browser tab

---

### 📱 Device & Browser Details

**Affected Devices:**
- [ ] Desktop (Windows/Mac/Linux)
- [ ] Mobile (iOS)
- [ ] Mobile (Android)
- [ ] Tablet

**Affected Browsers:**
- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] Edge
- [ ] Mobile Safari
- [ ] Mobile Chrome

**Screen Sizes Affected:**
- [ ] Mobile (<640px)
- [ ] Tablet (640px-1024px)
- [ ] Desktop (>1024px)

---

### 💡 Recommended Fix

**Proposed Solution:**
[Specific technical implementation details]

**Example:**

**Immediate Fix (within 24 hours):**
1. Add `disabled` state to button during calculation
2. Show loading spinner while API request is in flight
3. Add error handling with user-friendly message if calculation fails
4. Add success state with green checkmark when results load

**Technical Implementation:**
```typescript
// components/Calculator.tsx

const handleCalculate = async () => {
  setIsCalculating(true); // Show loading state
  setError(null); // Clear previous errors

  try {
    const results = await calculateTax(formData);
    setResults(results);
    trackEvent('tax_calculation_completed');
  } catch (error) {
    setError('Unable to calculate. Please try again.');
    trackEvent('tax_calculation_failed', { error: error.message });
  } finally {
    setIsCalculating(false); // Remove loading state
  }
};

return (
  <button
    onClick={handleCalculate}
    disabled={isCalculating || !isFormValid}
    className={isCalculating ? 'opacity-50 cursor-not-allowed' : ''}
  >
    {isCalculating ? (
      <><Spinner /> Calculating...</>
    ) : (
      'Calculate Tax Savings'
    )}
  </button>
);
```

**Files to Modify:**
- `components/Calculator.tsx` - Add loading state and error handling
- `lib/calculations/tax.ts` - Add timeout handling for slow API calls
- `components/ui/Button.tsx` - Add disabled state styling
- `tests/calculator.spec.ts` - Add test for loading states

---

### ✅ Acceptance Criteria

**Definition of Done:**

- [ ] Button shows visual feedback on click (loading spinner)
- [ ] Button is disabled during calculation (prevents multiple submissions)
- [ ] Results display within 2-3 seconds for valid inputs
- [ ] Error message displays if calculation fails
- [ ] Success animation plays when results load
- [ ] PostHog event `tax_calculation_started` fires on click
- [ ] PostHog event `tax_calculation_completed` fires on success
- [ ] PostHog event `tax_calculation_failed` fires on error
- [ ] Mobile testing passes on iOS Safari and Android Chrome
- [ ] No rage click events in next 10 session recordings
- [ ] Calculator completion rate increases by >10%

**Testing Checklist:**

- [ ] **Happy Path:** User completes calculator successfully
- [ ] **Error Path:** User enters invalid data, sees helpful error
- [ ] **Slow Network:** User on 3G connection sees loading state
- [ ] **Edge Case:** User clicks button multiple times rapidly
- [ ] **Mobile:** Calculator works on iPhone 13 Mini and Pixel 6

---

### 📈 Expected Impact

**Conversion Funnel Impact:**

| Metric | Current | Target | Lift |
|--------|---------|--------|------|
| Calculator Completion Rate | 45% | 60% | +15% |
| Calculator → Signup | 12% | 18% | +6% |
| Overall Signup Rate | 5.4% | 10.8% | +5.4% |

**Revenue Impact:**

- **Visitors/day:** 300
- **Current calculator completion:** 135/day (45%)
- **Target calculator completion:** 180/day (60%)
- **Additional completions:** +45/day
- **Calculator → Signup rate:** 12%
- **Additional signups:** +5.4/day (~38/week)
- **Signup → Paid rate:** 8%
- **Additional paid conversions:** ~3/week
- **ARR per customer:** $299
- **Additional ARR/month:** ~$4,000
- **Additional ARR/year:** ~$46,000

**User Satisfaction Impact:**

- Reduced frustration (no more rage clicks)
- Increased trust in product (it actually works!)
- Lower bounce rate (users don't abandon mid-flow)
- Better mobile experience

---

### 🏷️ Labels

Add these GitHub labels:

- `ux-friction`
- `revenue-blocker` (if P0)
- `conversion-optimization`
- `posthog-identified`
- `P0` / `P1` / `P2` (severity)
- `frontend`
- `calculator` (component affected)

---

### 🔗 Related Issues

**Blockers:**
- None

**Related:**
- #123 - Calculator performance optimization
- #456 - Form validation improvements

**Duplicates:**
- None

---

### 📝 Additional Notes

**Workaround (if available):**
[Temporary solution users can use while fix is in progress]

**Example:**
Users can refresh the page and try again. Success rate on second attempt is 80%.

**Historical Context:**
[When did this issue start? Was there a recent deployment?]

**Example:**
Issue appeared after deployment on 2026-03-15. Likely introduced in commit `abc123` which refactored calculator form state management.

**Team Discussion:**
[Link to Slack thread, meeting notes, or design discussion]

---

**Issue Created By:** [Your Name]
**Date:** 2026-03-19
**PostHog Analysis:** [Link to friction tracking sheet](./POSTHOG_FRICTION_TRACKING.csv)
**Priority Score:** [Calculated score from tracking sheet]
