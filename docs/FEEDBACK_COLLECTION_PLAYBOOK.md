# Feedback Collection Playbook
**Purpose:** Comprehensive guide for collecting and analyzing user feedback post-launch
**Owner:** Product Operations
**Status:** Ready for execution after Product Hunt launch

---

## 📋 TABLE OF CONTENTS

1. [Product Hunt Launch Monitoring](#product-hunt-launch-monitoring)
2. [PostHog Session Recordings](#posthog-session-recordings)
3. [Support Email System](#support-email-system)
4. [In-App Feedback Collection](#in-app-feedback-collection)
5. [User Interview Outreach](#user-interview-outreach)
6. [Weekly Feedback Review Process](#weekly-feedback-review-process)

---

## 🚀 PRODUCT HUNT LAUNCH MONITORING

### Setup (Do This BEFORE Launch)

**Pre-Launch Checklist:**
- [ ] Set phone alerts for Product Hunt notifications
- [ ] Prepare response templates for common questions
- [ ] Assign team member for 24-hour monitoring shift
- [ ] Create spreadsheet: `Product Hunt Feedback Tracker`
- [ ] Test PostHog funnel for `?ref=producthunt` traffic

**Response Templates:**

```markdown
# Template 1: Thank You for Positive Comment
"Thanks [name]! We built TaxBridge specifically for H1B/TN workers who were overpaying on US-Canada taxes. Glad it's helpful! Let us know if you have any questions 🇺🇸🇨🇦"

# Template 2: Addressing Concerns
"Great question, [name]! [Answer]. If you'd like to chat more, feel free to email support@taxbridgecpa.com or book a quick call: [calendly link]"

# Template 3: Feature Request
"Love this idea! We're tracking all feature requests in our roadmap. Would you be open to a 15-min call to discuss this further? We're offering $20 Amazon gift cards for feedback calls this week."

# Template 4: Bug Report
"Thanks for flagging this! We're investigating now. Can you email support@taxbridgecpa.com with:
1. Browser & OS version
2. Screenshot if possible
3. Your email so we can follow up

We'll get this fixed ASAP!"
```

---

### Launch Day Monitoring Schedule

**First 48 Hours (CRITICAL):**
- **Hour 0-6:** Check every 30 minutes
- **Hour 6-24:** Check every 1 hour
- **Hour 24-48:** Check every 2 hours

**Days 3-7:** Check 3x per day (morning, noon, evening)

**Tracking Spreadsheet Columns:**
| Timestamp | User | Comment Type | Sentiment | Issue Category | Response Sent | Action Item | Priority |
|-----------|------|--------------|-----------|----------------|---------------|-------------|----------|
| 2026-03-25 12:34 | @johndoe | Question | Neutral | Pricing | Yes | None | - |
| 2026-03-25 13:15 | @janedoe | Bug Report | Negative | Calculator | Yes | Fix RSU calc | P0 |

**Sentiment Categories:**
- 🟢 Positive (praise, testimonial)
- 🟡 Neutral (question, clarification)
- 🔴 Negative (complaint, bug report, frustration)

**Issue Categories:**
- Calculator accuracy
- Pricing / affordability
- UX / ease of use
- Trust / credibility
- Feature requests
- Technical bugs
- Competitor comparison

---

## 📹 POSTHOG SESSION RECORDINGS

### Setup PostHog Filters

**1. Failed Checkout Filter**
```javascript
// PostHog Dashboard → Recordings → Filters
Event: checkout_started
Does NOT have subsequent event: payment_completed
In the last: 7 days
Min duration: 30 seconds
```

**2. High-Intent Drop-Off Filter**
```javascript
// PostHog Dashboard → Recordings → Filters
Event: tax_calculation_viewed
Does NOT have subsequent event: signup_completed
In the last: 7 days
Tax amount > $5000 (filter by properties)
```

**3. Bug Report / Support Contact Filter**
```javascript
// PostHog Dashboard → Recordings → Filters
Event: support_contacted OR bug_reported
In the last: 7 days
```

---

### Weekly Recording Review Process

**Goal:** Review 5-10 session recordings per week

**Review Checklist:**
1. **Watch full recording** (don't skip ahead)
2. **Note timestamps** where user shows friction (hesitation, back button, rage clicks)
3. **Categorize issue:**
   - UX confusion (unclear UI, missing affordances)
   - Technical bug (error message, broken feature)
   - Content issue (missing info, unclear copy)
   - Performance (slow loading, lag)
4. **Severity rating:**
   - 🔴 P0: Blocker (user cannot complete critical task)
   - 🟠 P1: Major friction (user struggles but can complete)
   - 🟡 P2: Minor annoyance (user notices but continues)
5. **Create task** if P0 or P1 issue
6. **Update tracking spreadsheet**

**Recording Review Template:**
```markdown
## Session Recording Review: [Recording ID]

**User:** [Anonymous ID or user_id if logged in]
**Date:** 2026-03-26
**Duration:** 3m 45s
**Outcome:** Abandoned checkout

### Timeline:
- 0:00 - Lands on homepage from Google Ads
- 0:15 - Clicks "Calculate Your Taxes"
- 0:45 - Completes calculator (shows $23K US tax, $18K Canada tax)
- 1:30 - Clicks "Save Calculation" button
- 1:45 - Hesitates on signup modal (scrolls up/down 3x)
- 2:10 - Closes modal (does NOT sign up)
- 2:15 - Tries to scroll back to results - RESULTS ARE GONE
- 2:30 - Rage clicks "Calculate" button again
- 2:45 - Leaves site (bounce)

### Issues Found:
1. 🔴 P0: Closing signup modal clears calculator results (user loses data)
2. 🟠 P1: Signup modal is not compelling (no urgency, weak copy)
3. 🟡 P2: No "Save calculation" state indicator (user unsure if data saved)

### Recommended Fixes:
1. PERSIST calculator results in localStorage (don't clear on modal close)
2. Add urgency timer: "Results expire in 23:45:12"
3. Add "Results saved" confirmation message

### Quotes (Inferred from behavior):
"I just calculated my taxes and now they're gone? WTF!"

### Action Items:
- [ ] Create task: "Fix calculator result persistence bug" (P0)
- [ ] Create task: "Add urgency timer to signup flow" (P1)
```

---

## 📧 SUPPORT EMAIL SYSTEM

### Email Setup

**1. Create Support Email**
- Email: support@taxbridgecpa.com
- Forward to: [your personal email]
- Auto-reply: Enabled (see template below)

**Auto-Reply Template:**
```
Subject: Re: [Original Subject]

Thanks for reaching out! We typically respond within 24 hours (often much faster).

In the meantime:
• Common questions: https://taxbridgecpa.com/faq
• Calculator help: https://taxbridgecpa.com/how-it-works
• Book a call: https://calendly.com/taxbridge/support

Best,
The TaxBridge Team

---
This is an automated reply. A human will respond soon!
```

---

### Support Email Tracking

**Create Google Sheet: "Support Email Tracker"**

| Date | From | Subject | Category | Sentiment | Priority | Response Sent | Resolved | Notes |
|------|------|---------|----------|-----------|----------|---------------|----------|-------|
| 2026-03-25 | john@example.com | Calculator showing wrong tax | Bug Report | 🔴 Negative | P0 | Yes | No | Reproduced bug with RSU vesting |
| 2026-03-26 | jane@example.com | How do I export PDF? | How-to Question | 🟡 Neutral | P2 | Yes | Yes | Sent help doc link |

**Email Categories:**
- Bug Report
- Feature Request
- How-to Question
- Billing / Payment Issue
- Feedback / Testimonial
- Complaint
- Refund Request

**Priority Levels:**
- 🔴 P0: Critical (user blocked, payment issue, data loss)
- 🟠 P1: High (frustration, missing feature, UX issue)
- 🟡 P2: Medium (question, minor bug, improvement)
- 🟢 P3: Low (nice-to-have, general feedback)

---

### Response SLAs

- **P0 (Critical):** Respond within 2 hours, resolve within 24 hours
- **P1 (High):** Respond within 6 hours, resolve within 3 days
- **P2 (Medium):** Respond within 24 hours, resolve within 1 week
- **P3 (Low):** Respond within 48 hours, resolve when possible

---

## 📊 IN-APP FEEDBACK COLLECTION

### 1. NPS Survey (Net Promoter Score)

**Trigger:** After user completes checkout (payment successful)

**Question 1:**
> "How likely are you to recommend TaxBridge to a friend or colleague?"
>
> [0] [1] [2] [3] [4] [5] [6] [7] [8] [9] [10]
> Not at all likely ← → Extremely likely

**Question 2 (if score ≥ 9 - Promoter):**
> "Thanks! What did you love most about TaxBridge?"
> [Open text field]

**Question 2 (if score ≤ 6 - Detractor):**
> "We're sorry to hear that. What can we improve?"
> [Open text field]

**Implementation:**
```typescript
// app/dashboard/page.tsx (after successful checkout redirect)
import { trackNPSResponse } from '@/lib/analytics/feedback-tracking';

// Show NPS survey modal 5 seconds after landing on dashboard
setTimeout(() => {
  showNPSModal({
    onSubmit: (score, comment) => {
      trackNPSResponse({
        score,
        comment,
        page: '/dashboard',
        timestamp: new Date(),
      });

      // Store in database
      await fetch('/api/feedback/nps', {
        method: 'POST',
        body: JSON.stringify({ score, comment }),
      });
    },
  });
}, 5000);
```

---

### 2. Helpfulness Rating (Calculator Results Page)

**Trigger:** After user views tax calculation results

**Question:**
> "Was this calculation helpful?"
>
> 👍 Yes | 👎 No

**Follow-up (if clicked 👎):**
> "What could we improve?"
> [Open text field - optional]

**Implementation:**
```typescript
// components/TaxResults.tsx
import { trackHelpfulnessRating } from '@/lib/analytics/feedback-tracking';

<div className="mt-4 text-center">
  <p>Was this calculation helpful?</p>
  <button onClick={() => handleHelpfulness(true)}>👍 Yes</button>
  <button onClick={() => handleHelpfulness(false)}>👎 No</button>
</div>

function handleHelpfulness(helpful: boolean) {
  trackHelpfulnessRating({
    helpful,
    page: '/calculator',
    calculationAmount: taxResult.totalTax,
    timestamp: new Date(),
  });

  if (!helpful) {
    // Show follow-up comment field
    setShowCommentField(true);
  }
}
```

---

### 3. Exit Intent Survey

**Trigger:** When user's mouse leaves viewport on critical pages (calculator, pricing, checkout)

**Question:**
> "Wait! Before you go... What stopped you from signing up?"
>
> [ ] Too expensive
> [ ] Don't trust it
> [ ] Missing features
> [ ] Just browsing
> [ ] Other: [text field]

**Incentive (optional):**
> "Leave your email and we'll send you a 20% discount code!"
> [Email field]

**Implementation:**
```typescript
// components/ExitIntentModal.tsx
import { trackExitIntentResponse } from '@/lib/analytics/feedback-tracking';

useEffect(() => {
  const handleMouseLeave = (e: MouseEvent) => {
    if (e.clientY < 0 && !exitIntentShown) {
      setShowExitModal(true);
      setExitIntentShown(true);
    }
  };

  document.addEventListener('mouseleave', handleMouseLeave);
  return () => document.removeEventListener('mouseleave', handleMouseLeave);
}, [exitIntentShown]);

function handleSubmit(reason: string, email?: string) {
  trackExitIntentResponse({
    reason,
    email,
    page: window.location.pathname,
    timeOnPage: Date.now() - pageLoadTime,
    timestamp: new Date(),
  });

  // Store in database
  await fetch('/api/feedback/exit-intent', {
    method: 'POST',
    body: JSON.stringify({ reason, email }),
  });
}
```

---

## 🎙️ USER INTERVIEW OUTREACH

### Goal: Conduct 10 user interviews in first 30 days

**Target Audience:**
1. **Paid users** (all Pro/Enterprise subscribers)
2. **High-intent free users** (completed calculator 3+ times)
3. **Churned users** (signed up but didn't convert)

---

### Email Outreach Template

**Subject:** Quick favor? 15-min feedback call + $20 Amazon gift card

**Body:**
```
Hi [First Name],

I'm [Your Name], founder of TaxBridge. I noticed you [completed our tax calculator / signed up for Pro / tried our calculator].

Would you be open to a quick 15-minute call to share your experience? I'd love to hear:
• What you liked
• What frustrated you
• What features you wish we had

As a thank you, I'll send you a $20 Amazon gift card.

Here's my calendar: [Calendly link]

Or reply with a time that works for you!

Thanks,
[Your Name]
Founder, TaxBridge
```

---

### Interview Script

**Introduction (2 min)**
- "Thanks for joining! This is informal - just want to learn from your experience."
- "No wrong answers. Be brutally honest!"
- "I'll record this for my notes if that's okay?"

**Question Set (10 min)**
1. "Tell me about your situation. When did you move to the US? Do you have RSUs?"
2. "How did you find TaxBridge?"
3. "Walk me through what you did on the site. What were you trying to accomplish?"
4. "What was confusing or frustrating?"
5. "What did you like?"
6. "Did you consider any alternatives? (TurboTax, hiring a CPA, etc.)"
7. "What would make this a no-brainer purchase for you?"
8. "If you could add one feature, what would it be?"
9. "Would you recommend this to a friend? Why or why not?"

**Wrap-Up (3 min)**
- "Anything else you'd like to share?"
- "Can I follow up if I have more questions?"
- "I'll send that $20 gift card today. Thanks so much!"

---

### Interview Notes Template

```markdown
## User Interview: [Name / Anonymous ID]

**Date:** 2026-03-26
**Duration:** 18 minutes
**User Type:** Free user (completed calculator 4x, never converted)

### Background:
- H1B visa, software engineer at Google
- Moved from Canada to US in 2023
- $150K salary + $80K RSUs/year vesting
- Filed taxes with TurboTax last year, paid $2K to CPA

### Key Quotes:
> "I didn't trust the calculator. There were no testimonials or proof that it works."

> "I wanted to see a detailed breakdown of every line item. The summary wasn't enough."

> "$99/year seems expensive when TurboTax is $60 and includes US + Canada returns."

### Pain Points:
1. 🔴 Lack of trust/social proof (no testimonials, no CPA credentials shown)
2. 🟠 Wanted more detailed tax breakdown (line-by-line itemization)
3. 🟡 Pricing concern (comparing to TurboTax)

### Feature Requests:
1. Export tax report as PDF with detailed breakdown
2. "Ask a CPA" live chat feature
3. Show comparison vs. TurboTax (why TaxBridge is better)

### Conversion Blockers:
- "If you had 5-10 testimonials from other H1B workers, I would've signed up."
- "I need to see who's behind this - CPA credentials, company info, etc."

### Action Items:
- [ ] Add testimonials section to landing page (P0)
- [ ] Add "Meet Our CPA" page with credentials (P1)
- [ ] Build detailed tax breakdown export (P1)
```

---

## 📅 WEEKLY FEEDBACK REVIEW PROCESS

### Every Monday at 10 AM

**Agenda (60 minutes total):**

1. **Product Hunt Feedback Review (10 min)**
   - Review all comments from past week
   - Identify top 3 themes
   - Update tracking spreadsheet

2. **Support Email Review (15 min)**
   - Review all support emails from past week
   - Identify top 3 most common issues
   - Check SLA compliance (any P0/P1 emails missed?)

3. **PostHog Session Recordings (20 min)**
   - Watch 5 failed checkout recordings
   - Note common drop-off patterns
   - Create tasks for P0/P1 issues

4. **In-App Feedback Review (10 min)**
   - Calculate NPS score from past week
   - Review all negative feedback (detractors)
   - Identify actionable improvements

5. **Prioritization & Task Creation (5 min)**
   - Create tasks for top 3 issues
   - Assign priority (P0, P1, P2)
   - Assign owner and deadline

---

### Weekly Report Template

```markdown
## Weekly Feedback Report: Week of [Date]

### Executive Summary
- Total feedback items: 47
- Top 3 complaints: [List]
- NPS score: +15 (down from +22 last week)
- Top feature request: Multi-year tax planning

---

### Feedback Breakdown

| Source | Count | Positive | Neutral | Negative |
|--------|-------|----------|---------|----------|
| Product Hunt | 23 | 18 | 3 | 2 |
| Support Email | 12 | 4 | 5 | 3 |
| In-App NPS | 8 | 6 | 1 | 1 |
| Session Recordings | 4 (reviewed) | - | - | 4 |

---

### Top 3 User Complaints This Week

1. **"Calculator is inaccurate for stock options"** (7 mentions)
   - Source: 4 support emails, 2 Product Hunt, 1 NPS
   - Severity: 🔴 P0 CRITICAL
   - Impact: Loss of trust, potential refunds
   - Action: Fix stock option calculation bug (assigned to Engineer A)

2. **"PDF export is missing tax forms"** (5 mentions)
   - Source: 3 support emails, 2 Product Hunt
   - Severity: 🟠 P1 HIGH
   - Impact: Users can't file taxes with our export
   - Action: Add Form 1116 and T1135 to PDF export (assigned to Engineer B)

3. **"No mobile app"** (4 mentions)
   - Source: 3 Product Hunt, 1 NPS
   - Severity: 🟡 P2 MEDIUM
   - Impact: Mobile users want native app
   - Action: Add to roadmap for Q2 (not building yet)

---

### NPS Score Breakdown

- **Promoters (9-10):** 6 users (75%)
  - "Love the FTC optimization feature!"
  - "Saved me $3K in taxes. Worth every penny."

- **Passives (7-8):** 1 user (12.5%)
  - "Good product, but needs more features."

- **Detractors (0-6):** 1 user (12.5%)
  - "Calculator was wrong. Got a different number from my CPA."

**NPS Score:** (75% - 12.5%) = **+62.5** 🎉 (Excellent!)

---

### Action Items Created

- [ ] Fix stock option calculation bug (P0, due: 2026-03-28)
- [ ] Add Form 1116 and T1135 to PDF export (P1, due: 2026-04-05)
- [ ] Add testimonials section to landing page (P1, due: 2026-04-10)
- [ ] Research mobile app feasibility (P3, due: 2026-05-01)

---

### Next Week Focus

1. Close all P0 issues from this week
2. Conduct 3 user interviews (paid users)
3. Publish 2 case studies from positive testimonials

```

---

## 🎯 SUCCESS METRICS

**Month 1 Goals:**
- [ ] Product Hunt comments: >50 total
- [ ] Support emails: >10 total
- [ ] NPS survey responses: >20 total
- [ ] User interviews: >10 completed
- [ ] NPS score: >30 (good)

**Quarter 1 Goals:**
- [ ] NPS score: >50 (excellent)
- [ ] Top 3 complaints identified and resolved
- [ ] 90%+ support email SLA compliance
- [ ] Weekly feedback review process established

---

**Playbook Owner:** Product Operations
**Last Updated:** March 19, 2026
**Next Review:** After Product Hunt launch
