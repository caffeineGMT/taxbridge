# Immigration Lawyer Partnership Closing Playbook

**Target:** Close first 3 immigration lawyer partnerships in Q1 2026
**Revenue Model:** 30% recurring commission on referred clients
**Goal:** $2,000-$5,000/year recurring revenue per partner

---

## 📊 Campaign Overview

### Current Status
- **Database:** 200 immigration law firms ready for outreach
- **Target Wave 1:** 10 prospects (highest priority based on attorney count + specialization)
- **Success Criteria:** 3 active partnerships generating referrals within 30 days

### Timeline
- **Week 1 (Mar 19-25):** Initial outreach to 10 prospects
- **Week 2 (Mar 26-Apr 1):** Follow-ups, demo calls, applications
- **Week 3 (Apr 2-8):** Approve partners, onboard, first referrals
- **Week 4 (Apr 9-15):** Monitor performance, iterate

---

## 🎯 Phase 1: Initial Outreach (Days 1-3)

### Step 1: Launch Campaign
```bash
# Run dry-run first to preview emails
npm run tsx scripts/immigration-lawyer-outreach.ts -- --dry-run --count=10

# Send live emails to first 10 prospects
npm run tsx scripts/immigration-lawyer-outreach.ts -- --count=10
```

**Expected Results:**
- 10 emails sent on Day 1
- 40-50% open rate by Day 3 (4-5 opens)
- 5-10% click rate (1-2 clicks on signup link or Calendly)
- 0-1 replies within first 3 days

### Step 2: Monitor Engagement
Visit dashboard: `/admin/immigration-lawyer-pipeline`

**What to look for:**
- **Opens:** Who's reading? (Engaged but silent)
- **Clicks:** Who's interested? (High intent)
- **Bounces:** Invalid emails need to be removed

**Action Items:**
- If email bounces: Mark as `closed_lost`, reason: "Invalid email"
- If opened within 24 hours: Add to "hot leads" list for priority follow-up
- If clicked on Calendly: Watch for demo bookings (Calendly webhook will auto-update status)

---

## 🔁 Phase 2: Follow-Ups (Days 3, 7, 12)

### Automated Follow-Up Sequence

**Day 3 Follow-Up (Email #2):**
```bash
# Check who needs follow-up
npm run tsx scripts/immigration-lawyer-followups.ts -- --dry-run

# Send live follow-ups
npm run tsx scripts/immigration-lawyer-followups.ts
```

**Criteria:** Contacted 3+ days ago, no reply, no demo booked

**Message Focus:**
- Opened but didn't reply: "I saw you opened my email..."
- Quick social proof: "Seattle firm got 5 referrals in first 3 days"
- Lower-friction CTA: Schedule 15-min call or apply directly

**Day 7 Follow-Up (Email #3):**
**Criteria:** Still no reply after Day 3 follow-up

**Message Focus:**
- Final follow-up (not being a pest)
- Real example: "$1,076/year from 5-minute email to 50 clients"
- Two clear paths: Quick call or self-serve signup

---

## 📞 Phase 3: Demo Calls (Days 4-14)

### Demo Preparation

**Before the call:**
1. Research the firm:
   - Visit their website
   - Check their LinkedIn
   - Note their specialties (H-1B, TN, EB-5, etc.)
   - Estimate client volume (attorney count × 50-100 clients/year)

2. Prepare personalized talking points:
   - "I saw you specialize in [H-1B/TN] — our tool is perfect for that"
   - "With [X] attorneys, you're probably helping 200-500 visa holders per year"

**Demo Script (15 minutes):**

**Minutes 0-3: Discovery**
- "Tell me about your practice. What % of your clients are H-1B or TN?"
- "Do your clients ever ask about RSU taxation or cross-border tax optimization?"
- "How do you currently handle those questions?" (usually: "We refer them to a CPA")

**Minutes 3-8: Product Demo**
- Show the calculator in action (use real example: $150K salary, $100K RSUs, BC resident)
- Highlight the savings: "$8,000 in taxes saved via optimized Foreign Tax Credit"
- Show partner dashboard: "Here's what you'll see — real-time referrals and commissions"
- Show co-branded landing page mockup: `taxbridgecpa.com/partner/[their-firm]`

**Minutes 8-12: Value Proposition**
- **For them:** Passive income ($89.70/year per client, recurring)
- **For their clients:** Saves $5K-$12K/year, strengthens client relationship
- **No conflict:** "We only do RSU tax calculations. They still need you for immigration and a full-service CPA for filing."

**Example Earnings:**
- "If you refer 20 clients this year, that's $1,794 in recurring revenue"
- "If you have 300 H-1B clients in your CRM, 10% conversion = $2,691/year"

**Minutes 12-15: Close**
- "Does this sound like a good fit for [Firm Name]?"
- "Next step is simple: I'll send you the partner application link. Takes 2 minutes to fill out."
- "We approve within 24-48 hours, then you get your referral code and marketing materials immediately."
- "Would you like to move forward?"

**Follow-Up After Demo:**
- Send Calendly auto-email with partner signup link
- Manually send follow-up email within 1 hour:
  ```
  Subject: Great speaking with you!

  Hi [Name],

  Thanks for the call! As discussed, here's the partner application:
  https://taxbridgecpa.com/partners/signup

  Once you apply, I'll approve you within 24 hours and send over:
  - Your unique referral code
  - Co-branded landing page
  - Email templates you can use immediately

  Let me know if you have any questions!

  - Michael
  ```

**Update prospect status:**
```sql
UPDATE enterprise_prospects
SET status = 'demo_scheduled',
    demo_completed_date = datetime('now'),
    notes = '[Note what you learned from the call]'
WHERE contact_email = '[email]';
```

---

## ✅ Phase 4: Application & Approval (Days 7-21)

### When They Apply

**Automatic:**
- Application stored in `affiliate_partners` table
- Status: `pending`
- Email confirmation sent to applicant: "We received your application"

**Manual Review (You):**
1. Go to `/admin/partners`
2. Review application:
   - Firm name, website, email
   - Attorney count, specialization
   - Does the firm work with H-1B/TN visa holders? (Yes → Approve)

3. **Approve:**
   - Click "Approve" button
   - System automatically:
     - Sets status to `approved`
     - Generates unique referral code
     - Sends approval email with:
       - Referral code
       - Partner dashboard link
       - Co-branded landing page URL
       - Marketing toolkit link

4. **Onboarding Email (Manual):**
   ```
   Subject: Welcome to TaxBridge Partnership Program! 🎉

   Hi [Name],

   Excited to have [Firm Name] as a TaxBridge partner!

   Here's everything you need to start referring:

   🔗 YOUR LINKS:
   - Referral code: [CODE]
   - Partner dashboard: https://taxbridgecpa.com/partners/dashboard/[CODE]
   - Co-branded page: https://taxbridgecpa.com/partner/[firm-slug]

   📧 MARKETING MATERIALS:
   - Email template for H-1B clients (copy-paste ready)
   - LinkedIn post templates
   - Blog content you can share

   💰 COMMISSION DETAILS:
   - 30% recurring revenue share
   - $89.70/year per Pro client
   - Monthly payouts on the 1st (minimum $100)

   🚀 QUICKSTART:
   1. Send your referral link to 10 H-1B clients today
   2. Add it to your H-1B approval email template
   3. Share on LinkedIn or your firm's social media

   Questions? Just reply to this email.

   Let's get you your first referrals!

   - Michael
   Founder, TaxBridge
   ```

**Update status:**
```sql
UPDATE enterprise_prospects
SET status = 'trial_started',
    trial_start_date = datetime('now'),
    notes = 'Approved and onboarded. Sent marketing materials.'
WHERE id = [prospect_id];
```

---

## 🎉 Phase 5: First Referral & Close (Days 21-30)

### Monitoring Partner Activity

**Check daily:**
```sql
SELECT
  ap.firm_name,
  COUNT(ar.id) as total_referrals,
  SUM(CASE WHEN ar.commission_status = 'pending' THEN ar.commission_amount ELSE 0 END) as pending_commissions
FROM affiliate_partners ap
LEFT JOIN affiliate_referrals ar ON ar.affiliate_id = ap.id
WHERE ap.status = 'approved'
GROUP BY ap.id
ORDER BY total_referrals DESC;
```

**When first referral comes in:**
1. Celebrate! Send congrats email:
   ```
   Subject: 🎉 Your first TaxBridge referral!

   Hi [Name],

   Great news — you just earned your first commission!

   🎯 Referral Details:
   - Client signed up: [Date]
   - Commission: $89.70/year
   - Status: Pending (will be paid on [Next month's 1st])

   You can track this in your dashboard: [link]

   Keep it up! Most partners see 10-20 referrals in their first month.

   - Michael
   ```

2. Ask for feedback:
   - "How did you refer them? (Email? In-person? Phone?)"
   - "What made it easy or hard to refer?"
   - Use this to improve onboarding for future partners

**Mark as Closed Won:**
```sql
UPDATE enterprise_prospects
SET status = 'closed_won',
    closed_won_date = datetime('now'),
    notes = 'First referral received on [date]. Active partnership.'
WHERE id = [prospect_id];
```

---

## 📈 Success Metrics & Targets

### Campaign Goals (30 Days)

| Metric | Target | Tracking |
|--------|--------|----------|
| **Emails sent** | 10 | Day 1 |
| **Open rate** | 40%+ (4+ opens) | Days 1-3 |
| **Reply rate** | 10%+ (1+ reply) | Days 1-7 |
| **Demos booked** | 3+ | Days 3-14 |
| **Applications received** | 3+ | Days 7-21 |
| **Partners approved** | 3 | Days 7-21 |
| **First referral** | 1+ | Days 21-30 |
| **Active partnerships** | 3 | Day 30 |

### Key Performance Indicators

**Email Engagement:**
- Open rate >40% = Good subject line, relevant audience
- Click rate >10% = Strong value prop, clear CTA
- Reply rate >8% = Compelling offer, good timing

**Demo Conversion:**
- Demo→Application rate >60% (If 3 demos, expect 2 applications)
- Application→Approval rate >90% (Quality leads)

**Partnership Quality:**
- Time to first referral <14 days after approval = Engaged partner
- Referrals in month 1 ≥10 = High-quality partnership
- Referrals in month 1 <3 = Needs activation support

---

## 🚨 Troubleshooting

### Low Open Rate (<30%)
**Likely Causes:**
- Subject line not compelling enough
- Emails going to spam
- Wrong contact (generic@ instead of partner@)

**Fixes:**
- A/B test new subject lines
- Use Resend deliverability dashboard to check spam scores
- Research better contacts (LinkedIn for specific partners)

### Opens But No Replies
**Likely Causes:**
- Value prop unclear
- CTA too high-friction (asking for too much commitment)
- Timing (they're interested but busy)

**Fixes:**
- Day 3 follow-up with lower-friction CTA ("5-minute call")
- Social proof in follow-up ("Seattle firm got 5 referrals in 3 days")
- Make apply link more prominent

### Demos But No Applications
**Likely Causes:**
- Demo didn't demonstrate value clearly
- Too much friction in application process
- Concerns about conflict of interest or client trust

**Fixes:**
- Simplify demo: Focus on "what's in it for them"
- Address objections head-on: "Zero conflict — we only do RSU calculations"
- Reduce application friction: 2-minute form, instant approval

### Partners Approved But No Referrals
**Likely Causes:**
- Don't know how to refer effectively
- Haven't integrated into their workflow
- Forgot about it

**Fixes:**
- **Day 3 check-in:** "How's it going? Need help with first referral?"
- **Share playbook:** "Here's the exact email we've seen work best"
- **Make it stupid simple:** "Add this one line to your H-1B approval emails"

---

## 📋 Daily Checklist

### Daily (10 minutes)
- [ ] Check dashboard for new activity
- [ ] Reply to any questions/responses within 2 hours
- [ ] Review Calendly for demo bookings
- [ ] Update prospect statuses based on activity

### 2x Per Week
- [ ] Run automated follow-up script
- [ ] Check for new partner applications
- [ ] Review partner performance (referrals, engagement)

### Weekly
- [ ] Analyze campaign metrics (open rate, reply rate, demo conversion)
- [ ] Plan next batch of outreach (if first batch performing well)
- [ ] Send partner check-in emails (partners with 0 referrals after 7 days)

---

## 🎯 Closing The First Deal: Critical Success Factors

### 1. **Speed Matters**
- Reply to interested prospects within 2 hours (not 2 days)
- Approve applications within 24 hours (not 48 hours)
- Get them first referral resources immediately upon approval

### 2. **Make It Stupid Simple**
- One-line email they can add to their H-1B templates
- Pre-written LinkedIn post
- "Forward this to 10 clients today" CTA

### 3. **Celebrate Small Wins**
- First email open → Acknowledge it
- First demo booked → Send excited email
- First application → Fast approval + congrats
- First referral → CELEBRATE with email + maybe gift card

### 4. **Overcommunicate Value**
- Real numbers: "$89.70/year per client, recurring"
- Real examples: "Partner earned $1,076 from 5-minute email"
- Proof: Show dashboard screenshots from existing partners

### 5. **Remove All Friction**
- 2-minute application form
- Instant approval (within 24 hours)
- Pre-written marketing materials (no creative work needed)
- Dashboard shows real-time referrals (transparency builds trust)

---

## 🚀 Next Wave Planning

**After first 3 partnerships closed:**
1. Document what worked:
   - Which email subject lines got best open rates?
   - What objections came up on demos?
   - Which onboarding tactics led to fastest first referral?

2. Refine messaging:
   - Update email templates based on what resonated
   - Add new social proof from closed deals

3. Scale outreach:
   - Wave 2: 25 prospects
   - Wave 3: 50 prospects
   - Goal: 10 active partnerships by Q2

---

**Campaign Owner:** Michael Guo, CEO
**Launch Date:** March 19, 2026
**Target Close:** March 30, 2026 (First partnership generating referrals)
**Goal:** 3 active partnerships, 30+ referrals total in Q1 2026
