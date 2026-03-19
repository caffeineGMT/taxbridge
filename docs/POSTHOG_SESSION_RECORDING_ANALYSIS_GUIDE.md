# PostHog Session Recording Analysis Guide
## User Friction Audit - March 2026

**Purpose:** Watch 10 PostHog session recordings to identify drop-off points, UX confusion, and broken flows that prevent conversions.

**Timeline:** 2-3 hours analysis + 1 hour documentation

**Deliverables:**
1. ✅ Friction points spreadsheet (with timestamps and severity)
2. ✅ Top 3 issues with GitHub tickets
3. ✅ Executive summary with fix recommendations

---

## Quick Start Checklist

### Pre-Analysis Setup (5 minutes)

- [ ] Open PostHog dashboard: [https://app.posthog.com](https://app.posthog.com)
- [ ] Navigate to: **Replay** → **Session Recordings**
- [ ] Filter recordings:
  - Date range: Last 7 days
  - User status: All users (free + paid)
  - Session duration: >30 seconds (filter out bounces)
  - Include: Failed signups, abandoned checkouts, calculator drop-offs
- [ ] Open `docs/POSTHOG_FRICTION_TRACKING.csv` for notes
- [ ] Start screen recording (for reference): Use QuickTime or Loom

### Analysis Protocol (10-15 min per recording)

Watch **10 recordings** covering these user segments:

#### Required Segments (10 recordings minimum):

1. **New Visitor → Calculator Drop-off** (3 recordings)
   - User lands on homepage
   - Starts calculator
   - Abandons before completion
   - **Look for:** Confusing fields, error messages, lack of clarity

2. **Calculator Complete → Signup Abandonment** (2 recordings)
   - User completes calculator
   - Views results
   - Doesn't sign up
   - **Look for:** Weak CTA, unclear value proposition, paywall friction

3. **Signup → Onboarding Drop-off** (2 recordings)
   - User creates account
   - Starts onboarding
   - Abandons mid-flow
   - **Look for:** Too many steps, confusing questions, technical errors

4. **Free User → Pricing Page Abandonment** (2 recordings)
   - User explores free features
   - Views pricing
   - Doesn't start checkout
   - **Look for:** Pricing confusion, lack of trust, unclear tier differences

5. **Checkout Started → Payment Abandonment** (1 recording)
   - User clicks upgrade
   - Reaches Stripe checkout
   - Closes without completing
   - **Look for:** Stripe errors, unexpected pricing, lack of security signals

---

## What to Track During Each Recording

### 1. **Rage Clicks** 🔴 CRITICAL
**Definition:** User clicks same element 3+ times rapidly (indicates broken functionality)

**Examples:**
- Clicking "Calculate" button but nothing happens
- Clicking "Sign Up" link that doesn't redirect
- Clicking input field that won't focus

**How to Record:**
```
Recording #3 @ 0:45 - Rage Click
Element: "View Full Results" button
Clicks: 7 rapid clicks
Result: Button appears disabled, no response
User Action: Abandons session
SEVERITY: P0 (Revenue Blocker)
```

### 2. **Dead Clicks** 🟠 HIGH
**Definition:** User clicks non-interactive element thinking it's clickable

**Examples:**
- Clicking calculator result text (expecting details)
- Clicking greyed-out feature (confused about paywall)
- Clicking testimonial quote (expecting to read more)

**How to Record:**
```
Recording #5 @ 1:12 - Dead Click
Element: "FTC Savings: $5,421" text
Clicks: 2 clicks
Expected: Tooltip or modal explaining FTC
Actual: Nothing happens
User Action: Moves mouse around confused, then leaves
SEVERITY: P1 (UX Friction)
```

### 3. **Error Rage** 🔴 CRITICAL
**Definition:** User encounters error message and repeatedly tries same action

**Examples:**
- Email validation error ("Invalid email") but email is valid
- "Please fill required fields" but all fields are filled
- Stripe checkout error with no clear resolution

**How to Record:**
```
Recording #8 @ 2:34 - Error Rage
Error Message: "Invalid RSU grant date"
User Input: "03/15/2024" (valid format)
Attempts: 5 different date formats tried
Result: Never succeeds, user gives up
SEVERITY: P0 (Broken Flow)
```

### 4. **Abandonment Points** 🟡 MEDIUM
**Definition:** User spends significant time, then suddenly leaves

**Examples:**
- User fills 80% of calculator, then closes tab
- User reads entire pricing page, scrolls to bottom, then backs out
- User hovers over "Upgrade" button for 15 seconds, then leaves

**How to Record:**
```
Recording #2 @ 3:45 - Abandonment
Location: Pricing page
Time Spent: 2 minutes 34 seconds
User Behavior:
  - Scrolled pricing comparison 3 times
  - Hovered over Pro tier CTA for 14 seconds
  - Scrolled to FAQ section
  - Closed tab without clicking
Possible Reason: Price too high? Unclear value?
SEVERITY: P2 (Conversion Blocker)
```

### 5. **Confusion Patterns** 🟡 MEDIUM
**Definition:** User behavior indicates lack of understanding

**Examples:**
- Hovering over multiple elements searching for help
- Re-reading same section 3+ times
- Opening and closing same modal repeatedly
- Scrolling up and down rapidly (searching for something)

**How to Record:**
```
Recording #6 @ 1:05 - Confusion Pattern
Location: Onboarding Step 2 (Province/State selection)
Behavior:
  - Hovered over "Province" dropdown for 23 seconds
  - Clicked dropdown, scrolled list, closed without selecting
  - Scrolled page up/down looking for help text
  - Repeated dropdown interaction 4 times
  - Eventually guessed "Ontario"
Possible Issue: Unclear which field to select? Missing help text?
SEVERITY: P1 (Onboarding Friction)
```

### 6. **Mobile-Specific Issues** 📱 HIGH (if 40%+ traffic is mobile)

**Examples:**
- Buttons too small to tap accurately
- Input fields hidden by mobile keyboard
- Horizontal scrolling required (broken responsive design)
- Modal dialogs cut off on small screens

**How to Record:**
```
Recording #9 @ 0:52 - Mobile Issue
Device: iPhone 13 Pro (iOS Safari)
Issue: Calculator input fields overlap on mobile
Result: User cannot tap "Grant Date" field (hidden behind "RSU Amount")
User Action: Rotates phone to landscape, still broken, abandons
SEVERITY: P0 (Mobile Blocker)
```

### 7. **Performance Issues** ⚡ MEDIUM

**Examples:**
- Page takes >5 seconds to load
- Button click has 2+ second delay
- Form submission shows loading spinner for >10 seconds
- Calculator results take >3 seconds to display

**How to Record:**
```
Recording #4 @ 1:18 - Performance Issue
Action: User clicks "Calculate Tax Savings"
Loading Time: 8.2 seconds (visible spinner)
User Behavior: User clicks button 2 more times during wait
Result: Results eventually load, user continues
SEVERITY: P1 (UX Degradation)
```

---

## Recording Analysis Template

Copy this for each recording:

```markdown
## Recording #[1-10]

**Session ID:** [PostHog ID]
**Date:** [YYYY-MM-DD HH:MM]
**Duration:** [MM:SS]
**Device:** [Desktop/Mobile] - [Browser]
**User Type:** [New Visitor / Returning Free / Paid User]
**UTM Source:** [producthunt / reddit / google / direct]

### User Journey
1. Landed on: [page]
2. Clicked: [element]
3. Navigated to: [page]
4. Action: [description]
5. Drop-off: [where/when]

### Friction Points Observed

#### 🔴 P0 - Critical (Broken functionality)
- [ ] Rage clicks on [element] - [description]
- [ ] Error message: "[error text]" - [user unable to proceed]
- [ ] Mobile layout broken on [page]

#### 🟠 P1 - High (Conversion blocker)
- [ ] Dead click on [element] - user expected [X] but got nothing
- [ ] Confusion at [step] - user repeated action [N] times
- [ ] Performance: [action] took [N] seconds

#### 🟡 P2 - Medium (UX degradation)
- [ ] Abandonment at [point] - unclear why
- [ ] Missing help text on [field]
- [ ] Design inconsistency: [description]

### Timestamps & Screenshots
- `0:45` - [Event description]
- `1:23` - [Event description]
- `2:10` - [Event description]

### Recommendations
1. [Specific fix for issue #1]
2. [Specific fix for issue #2]
3. [Specific fix for issue #3]

### Revenue Impact
**Estimated:** If this user had converted, ARR = $299
**Priority:** [P0 / P1 / P2]
```

---

## Prioritization Framework

After watching all 10 recordings, categorize issues by:

### Severity Tiers

#### P0 - Critical (Fix within 24 hours)
**Criteria:**
- Blocks ANY user from completing action
- Causes 100% drop-off at specific step
- Affects >10% of users
- Revenue blocker (prevents checkout)

**Examples:**
- Signup button returns 500 error
- Calculator "Submit" does nothing (rage clicks)
- Mobile layout completely broken
- Stripe checkout fails 100% of the time

#### P1 - High (Fix within 3-5 days)
**Criteria:**
- Blocks MOST users from completing action
- Causes 50%+ drop-off at specific step
- Affects 5-10% of users
- Major UX friction

**Examples:**
- Confusing form field (users abandon 60% of the time)
- Performance issue (8+ second load time)
- Dead clicks on important CTAs
- Mobile input fields difficult to interact with

#### P2 - Medium (Fix within 2 weeks)
**Criteria:**
- Blocks SOME users from completing action
- Causes 20-50% drop-off at specific step
- Affects 1-5% of users
- Minor UX degradation

**Examples:**
- Missing help text causes brief confusion
- Inconsistent button styling
- Tooltip doesn't appear on hover
- Abandonment with unclear cause

#### P3 - Low (Backlog)
**Criteria:**
- Polish and nice-to-haves
- Affects <1% of users
- No measurable conversion impact

**Examples:**
- Typos in microcopy
- Icon alignment slightly off
- Animation timing feels slow

---

## Top 3 Issues Selection Criteria

After categorizing all issues, select **Top 3** based on:

### Formula: (Frequency × Severity × Revenue Impact)

1. **Frequency:** How many recordings showed this issue?
   - 1 recording = 10 points
   - 3 recordings = 30 points
   - 5+ recordings = 50 points

2. **Severity:** How bad is the impact?
   - P0 (Critical) = 100 points
   - P1 (High) = 50 points
   - P2 (Medium) = 20 points
   - P3 (Low) = 5 points

3. **Revenue Impact:** Does this block paid conversions?
   - Blocks checkout = 100 points
   - Blocks signup = 50 points
   - Blocks onboarding = 30 points
   - Blocks feature usage = 10 points

### Example Calculation:

**Issue:** Calculator "Submit" button rage clicks (5 recordings, P0, blocks signup)

```
Score = Frequency × Severity × Revenue Impact
      = 50 × 100 × 50
      = 250,000 points
```

**Issue:** Pricing page FAQ accordion doesn't expand (1 recording, P2, no direct revenue block)

```
Score = 10 × 20 × 10
      = 2,000 points
```

**Winner:** Fix calculator button first.

---

## Deliverable Templates

### 1. Friction Tracking Spreadsheet

See `docs/POSTHOG_FRICTION_TRACKING.csv` for template.

**Columns:**
- Recording ID
- Timestamp
- Issue Type (Rage Click / Dead Click / Error / Abandonment / Confusion / Mobile / Performance)
- Severity (P0 / P1 / P2 / P3)
- Page/Component
- Description
- User Action
- Expected Behavior
- Actual Behavior
- Frequency (how many recordings)
- Revenue Impact ($)
- Priority Score (calculated)

### 2. GitHub Issue Template

See `docs/UX_FRICTION_ISSUE_TEMPLATE.md` for full template.

**Format:**
```markdown
## 🔴 [P0] [Issue Title]

### 📊 Evidence
- **Frequency:** Observed in [N] of 10 session recordings
- **Severity:** P0 (Critical revenue blocker)
- **Revenue Impact:** $[X] estimated ARR loss per day

### 🎥 Session Recording Evidence
- Recording #3 @ 0:45 - [link to PostHog recording]
- Recording #7 @ 1:12 - [link to PostHog recording]
- Recording #9 @ 2:08 - [link to PostHog recording]

### 🐞 Bug Description
[Detailed description]

### 👤 User Behavior
1. User lands on [page]
2. User clicks [element]
3. Expected: [what should happen]
4. Actual: [what actually happens]
5. User reaction: [rage clicks / abandons / confused]

### 💡 Recommended Fix
[Specific technical solution]

### ✅ Acceptance Criteria
- [ ] [Fix criterion 1]
- [ ] [Fix criterion 2]
- [ ] [Fix criterion 3]

### 📈 Expected Impact
- Conversion lift: +[X]%
- ARR impact: +$[X]/month
- User satisfaction: +[X] NPS points
```

### 3. Executive Summary Template

See `docs/UX_FRICTION_AUDIT_EXECUTIVE_SUMMARY.md` for full template.

---

## Post-Analysis Action Items

After completing analysis:

- [ ] **Immediate (Day 1):**
  - Export all 10 recordings as videos (for future reference)
  - Share friction tracking spreadsheet with team
  - Create 3 GitHub issues for top problems
  - Schedule 30-min team review meeting

- [ ] **Week 1:**
  - Assign P0 issues to engineers
  - Re-test fixed issues with new session recordings
  - Update PostHog alerts for recurring patterns

- [ ] **Ongoing:**
  - Review 5 new recordings weekly
  - Track fix impact: did conversion rate improve?
  - Document patterns in UX playbook

---

## Common Pitfalls to Avoid

### ❌ DON'T:
- Watch only successful sessions (no issues to find)
- Skip mobile recordings (40% of traffic)
- Analyze recordings without sound (miss click sounds, errors)
- Create generic issues ("Fix UX") - be specific!
- Forget to link PostHog recording URLs in tickets

### ✅ DO:
- Filter for **failed conversion** sessions specifically
- Watch at 2x speed (use `.` and `,` keys in PostHog)
- Take timestamped notes as you watch
- Screenshot specific issues for GitHub tickets
- Calculate estimated revenue impact for each fix

---

## Tools & Resources

**PostHog:**
- Session Recordings: `https://app.posthog.com/recordings`
- Event Explorer: `https://app.posthog.com/events`
- Funnel Analysis: `https://app.posthog.com/insights`

**Internal Docs:**
- Friction Tracking CSV: `docs/POSTHOG_FRICTION_TRACKING.csv`
- Issue Template: `docs/UX_FRICTION_ISSUE_TEMPLATE.md`
- Fix Monitoring Script: `scripts/monitor-ux-fixes.ts`

**Keyboard Shortcuts (PostHog):**
- `Space` - Play/pause
- `.` / `,` - Skip forward/back 10 seconds
- `→` / `←` - Skip forward/back 1 second
- `↑` / `↓` - Speed up/slow down
- `F` - Fullscreen
- `C` - Toggle console logs
- `N` - Toggle network requests

---

## Success Metrics

**Analysis Quality:**
- ✅ 10 recordings watched and documented
- ✅ 5+ friction points identified per recording
- ✅ Top 3 issues have >80% priority score agreement

**Fix Impact (measure 2 weeks post-fix):**
- 🎯 Calculator completion rate: +15%
- 🎯 Signup conversion rate: +10%
- 🎯 Checkout abandonment rate: -20%
- 🎯 Session duration: +25%

---

**Last Updated:** 2026-03-19
**Owner:** Product / Growth Team
**Next Review:** Weekly during high-traffic periods
