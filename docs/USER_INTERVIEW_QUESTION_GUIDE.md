# User Interview Question Guide

**Duration**: 15 minutes
**Incentive**: $20 Amazon gift card (delivered within 1 hour after call)
**Goal**: Understand why calculator users don't convert to paid customers

---

## Pre-Interview Checklist

- [ ] Review user's calculator usage history (# of calculations, dates, subscription tier)
- [ ] Have gift card delivery system ready
- [ ] Zoom recording enabled (with permission)
- [ ] Notepad open for real-time notes
- [ ] Calendly link for booking sent
- [ ] Interviewee confirmed attendance (sent confirmation email)

---

## Interview Script (15 Minutes)

### Introduction (2 minutes)

**Opening:**
> "Hi [First Name]! Thanks so much for taking the time to chat with me today. I'm Michael, founder of TaxBridge. This will be quick - just 15 minutes, and I'll send you the $20 Amazon gift card right after we're done."

**Set Expectations:**
> "I'm going to ask you 3 main questions about your experience using our tax calculator. There are no wrong answers - I genuinely want to understand your situation and what you're dealing with. Be as brutally honest as you want. Ready?"

**Permission:**
> "Is it okay if I record this call? It's just for my notes - I won't share it with anyone."

---

### Question 1: What Problem Were You Solving? (5 minutes)

**Primary Question:**
> "When you first found TaxBridge and used the calculator, what problem were you trying to solve?"

**Follow-Up Probes** (use as needed):
- "Walk me through what was happening before you found us. What triggered the search?"
- "What other solutions did you try before TaxBridge?"
- "How urgent was this problem? Was it a 'nice to have' or 'I need this now'?"
- "What would have happened if you didn't solve this problem?"

**What to Listen For:**
- ✅ Specific pain points (e.g., "My CPA charges $800 and I can't afford it")
- ✅ Emotional language (e.g., "I was panicking", "I felt lost", "I was overwhelmed")
- ✅ Concrete consequences (e.g., "I would have overpaid $5,000 in taxes")
- ✅ Competing alternatives (CPAs, other tools, doing it manually)
- ✅ Urgency triggers (tax deadline, job change, visa status)

**Notes Section:**
```
PROBLEM:
- Pain point:
- Severity (1-10):
- Urgency (1-10):
- Competing alternatives:
- Emotional state:
```

---

### Question 2: What Almost Stopped You? (5 minutes)

**Primary Question:**
> "Before you hit 'submit' or 'calculate', was there anything that almost made you close the tab and leave? What made you hesitate?"

**Follow-Up Probes** (use as needed):
- "Did you compare prices with other tools or CPAs?"
- "Was there a moment where you thought 'I don't know if I trust this'?"
- "Did you feel like something was missing or confusing?"
- "What would have made you leave without using the calculator?"
- "Did you read reviews or look for social proof? What were you looking for?"

**What to Listen For:**
- ✅ Trust barriers (e.g., "I wasn't sure if the calculations were accurate")
- ✅ Pricing objections (e.g., "I thought it would be free", "$79/year felt expensive")
- ✅ Missing features (e.g., "I wanted to import my RSUs from Carta")
- ✅ UX friction (e.g., "The form was too long", "I didn't understand the terms")
- ✅ Competition (e.g., "I was comparing to Sprintax", "My CPA quoted me $400")

**Notes Section:**
```
BARRIERS:
- Primary barrier:
- Category (trust / price / features / UX / competition):
- Severity (deal-breaker? minor annoyance?):
- What convinced them to stay:
```

---

### Question 3: What Would Make You Pay? (3 minutes)

**Primary Question:**
> "Right now, you're using the free version. What would make you say 'okay, this is worth paying for'? What would need to happen?"

**Follow-Up Probes** (use as needed):
- "If I told you the Pro plan costs $79/year, what's your gut reaction? Too high? Fair? Too low?"
- "What feature or outcome would make $79/year feel like a no-brainer?"
- "Is there a different price point where you'd say 'yes' immediately?"
- "Would you pay if it saved you $X on your taxes? How much would X need to be?"
- "Is it about features, or is it about trust, or something else?"

**What to Listen For:**
- ✅ Pricing feedback (exact number, comparison to alternatives)
- ✅ Value proposition (what outcome justifies the cost)
- ✅ Missing features (what would make them upgrade)
- ✅ Trust building (certifications, reviews, guarantees)
- ✅ Alternative payment models (one-time fee, pay-per-use, money-back guarantee)

**Notes Section:**
```
WILLINGNESS TO PAY:
- Price sensitivity:
- Fair price point: $
- Value driver (what justifies the cost):
- Missing feature that would unlock payment:
- Alternative pricing model:
```

---

## Closing (1 minute)

**Gratitude:**
> "This was incredibly helpful - thank you so much for being honest with me. Your answers are going to directly influence what I build next."

**Gift Card Delivery:**
> "I'm going to email you the $20 Amazon gift card within the next hour. It'll come from michael@taxbridge.app with the subject 'Thank you! Here's your $20 Amazon gift card'."

**Soft Ask (Optional):**
> "If you know anyone else who's dealing with H-1B or TN visa tax headaches, feel free to send them our way. No pressure at all - but we're here to help."

**End:**
> "Thanks again, [First Name]. Have a great rest of your day!"

---

## Post-Interview Actions (Within 1 Hour)

1. ✅ **Generate Amazon gift card code**
   - Use Tremendous API or Amazon Incentives API
   - Amount: $20
   - Delivery: Email immediately

2. ✅ **Send thank you email with gift card**
   - Subject: "Thank you! Here's your $20 Amazon gift card 🎁"
   - Include gift card code
   - Include redemption instructions
   - Include 1-2 key insights from their feedback

3. ✅ **Record interview data in database**
   ```sql
   INSERT INTO user_interview_completed (
     booking_id, user_id, email, interview_date, interview_duration_minutes,
     question_1_answer, question_2_answer, question_3_answer,
     interviewer_notes, key_insights, pain_point_category,
     gift_card_code, gift_card_sent_at
   ) VALUES (...)
   ```

4. ✅ **Update campaign tracking**
   - Mark booking as 'completed'
   - Mark invitation as 'completed'
   - Increment completed interview count

5. ✅ **Extract actionable insights**
   - Categorize pain point (pricing / trust / features / UX / competition)
   - Assess severity (critical / high / medium / low)
   - Estimate conversion impact (if fixable)
   - Add to `user_interview_insights` table

---

## Interview Analysis Framework

After completing 5-10 interviews, aggregate insights:

### Pain Point Categories
- **Pricing**: Too expensive, unclear value, better alternatives
- **Trust**: Accuracy concerns, no social proof, unfamiliar brand
- **Features**: Missing functionality, limited use cases, poor UX
- **Competition**: CPAs cheaper, other tools better, DIY viable
- **Complexity**: Too hard to use, too much time required, confusing terms

### Priority Matrix

| Category | Frequency | Severity | Conversion Impact | Priority |
|----------|-----------|----------|-------------------|----------|
| Pricing too high | 7/10 | Critical | +15-25% | **P0** |
| No multi-year planner | 6/10 | High | +10-15% | **P1** |
| Trust / accuracy concerns | 5/10 | High | +5-10% | **P1** |
| Missing CSV import | 4/10 | Medium | +5-8% | **P2** |
| UX friction (form too long) | 3/10 | Low | +2-5% | **P3** |

### Recommended Actions

**P0 - Fix Immediately**:
- If 50%+ mention pricing is too high → Run pricing experiment ($49, $79, $99)
- If 50%+ mention missing critical feature → Build it ASAP

**P1 - Fix This Quarter**:
- If 30-50% mention → Add to roadmap with deadline
- Build MVP version, test with interviewees

**P2-P3 - Backlog**:
- If <30% mention → Add to backlog, revisit after 20+ interviews

---

## Red Flags to Watch For

🚨 **If 3+ people say the same thing, it's a pattern**
🚨 **If someone says "I'd pay if X existed", build X**
🚨 **If someone compares you unfavorably to a competitor, research that competitor immediately**
🚨 **If someone says "I don't trust the calculations", that's a CRITICAL trust issue**
🚨 **If someone says "I just hired a CPA instead", find out why**

---

## Success Metrics

**Campaign-Level**:
- Invitation-to-booking conversion rate: Target 15-25%
- Booking-to-completion rate: Target 80-90%
- Average interview duration: Target 12-18 minutes
- Gift card delivery time: Target <1 hour
- Total interviews completed: Target 10 minimum

**Insight-Level**:
- Number of actionable insights extracted: Target 3-5 per interview
- Number of P0/P1 issues identified: Track weekly
- Conversion impact estimate: Calculate ROI of fixing each issue
- Feature requests: Prioritize by frequency + severity

---

## Email Response Templates

### If someone asks to reschedule:
> "No problem at all! Here's my Calendly link to pick a new time that works better: [calendly_link]. Looking forward to chatting!"

### If someone cancels:
> "No worries! If you change your mind later, my calendar is always open. Feel free to book anytime: [calendly_link]. Thanks for considering it!"

### If someone doesn't show up (no-show):
> "Hi [Name], I had our interview scheduled for [time] today but didn't see you on the Zoom call. No problem at all - things come up! If you'd still like to chat and get the $20 gift card, here's my calendar: [calendly_link]. Otherwise, no worries!"

---

## Notes Template (Copy-Paste for Each Interview)

```
INTERVIEW #___
Date: ___________
User: ___________ (ID: ___, Email: ___________)
Duration: ___ minutes
Recording: [Yes / No]

Q1: WHAT PROBLEM WERE YOU SOLVING?
-----------------------------------
Raw Answer:


Pain Point:
Severity (1-10):
Urgency (1-10):
Competing Alternatives:
Emotional State:

Q2: WHAT ALMOST STOPPED YOU?
-----------------------------
Raw Answer:


Primary Barrier:
Category: [trust / price / features / UX / competition]
Severity: [deal-breaker / significant / minor]
What Convinced Them to Stay:

Q3: WHAT WOULD MAKE YOU PAY?
-----------------------------
Raw Answer:


Price Sensitivity:
Fair Price Point: $___
Value Driver:
Missing Feature:
Alternative Pricing Model:

KEY INSIGHTS:
-------------
1.
2.
3.

ACTIONABLE ITEMS:
-----------------
1. [P0/P1/P2/P3]
2. [P0/P1/P2/P3]
3. [P0/P1/P2/P3]

GIFT CARD:
----------
Code: AMZN-____-____-____
Sent At: [timestamp]
Email Delivered: [Yes / No]
```

---

## Campaign Reporting (Weekly)

**Week 1 Summary** (Example):
- Invitations sent: 50
- Bookings: 8 (16% conversion)
- Completed: 6 (75% completion rate)
- Gift cards sent: 6 ($120 total)
- Top pain point: Pricing too high (5/6 mentioned)
- Top feature request: Multi-year tax planning (4/6 requested)
- Recommended action: Lower price from $79 to $49 and test conversion lift

**Next Steps**:
1. Complete 4 more interviews (target: 10 total)
2. Run pricing experiment if pricing is #1 pain point
3. Build MVP of most-requested feature
4. Re-interview users after changes to measure impact

---

**END OF GUIDE**

Remember: The goal is to **listen**, not to sell. Be genuinely curious. Ask follow-up questions. Let them talk. The more they share, the better you'll understand what to fix.
