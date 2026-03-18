# CPA Partner Outreach Campaign - Execution Guide

**Status:** Infrastructure 100% complete. Ready for execution.

**Timeline:** 4 weeks from setup to first partner approvals

**Budget:** $480 Year 1 ($40/month ongoing)

---

## Quick Start (TL;DR)

```bash
# 1. Set up API keys
cp .env.example .env.local
# Add APOLLO_API_KEY and HUNTER_API_KEY

# 2. Generate target list (200 firms)
npm run scrape:aila-firms

# 3. Prepare for Instantly.ai
npm run prepare:instantly-upload

# 4. Set up domains (one-time)
# Purchase: taxbridge-partners.com, taxbridge.co, taxbridge.io
# Configure DNS (see EMAIL_DOMAIN_SETUP.md)

# 5. Upload to Instantly.ai and launch

# 6. Monitor campaign
npm run outreach:check-followups  # Daily
npm run outreach:update-stats      # Weekly
```

**Dashboard:** http://localhost:3000/admin/outreach

---

## Phase 1: Data Generation (Week 1)

### Step 1.1: Set Up Apollo.io

**Sign up:** https://app.apollo.io/api

**Pricing:** $79/month for 10,000 credits

**Configuration:**
```bash
# .env.local
APOLLO_API_KEY=your_apollo_api_key_here
HUNTER_API_KEY=your_hunter_api_key_here  # Optional
```

### Step 1.2: Generate Target List

```bash
npm run scrape:aila-firms
```

**What it does:**
- Searches Apollo.io for immigration attorneys in tech hubs
- Filters by: Job title (Partner, Managing Attorney), Location (SF, Seattle, NYC, Boston, Austin), Firm size (11-200 employees)
- Deduplicates by firm name
- Selects best contact (prioritizes Partners)
- Exports to CSV: `data/outreach/immigration-firms-apollo.csv`
- Imports to database: `enterprise_prospects` table

**Output:**
```
✅ Fetched 450 total contacts
✅ Unique firms: 280
✅ Selected 200 firms with valid emails
✅ Exported to data/outreach/immigration-firms-apollo.csv
✅ Imported 200 firms to database
```

### Step 1.3: Verify Emails (Optional but Recommended)

If you have `HUNTER_API_KEY` set, the scraper automatically verifies emails.

**Manual verification with NeverBounce:**
```bash
# Install NeverBounce CLI
npm install -g neverbounce

# Verify CSV ($0.008 per email = $1.60 for 200)
neverbounce verify data/outreach/immigration-firms-apollo.csv

# Outputs: immigration-firms-apollo-verified.csv
```

**Keep only:**
- `valid` emails (deliverable)
- `accept_all` emails (server accepts all, worth trying)

**Remove:**
- `invalid` emails (bounce risk)
- `disposable` emails (temporary)
- `unknown` emails (verification failed)

### Step 1.4: Prepare Instantly.ai Upload

```bash
npm run prepare:instantly-upload
```

**What it does:**
- Reads CSV from Step 1.2
- Generates personalized 3-email sequence for each firm
- Formats for Instantly.ai CSV upload (email, firstName, firmName, city, state, email1Subject, email1Body, email2Subject, email2Body, email3Subject, email3Body)
- Exports to: `data/outreach/instantly-upload.csv`
- Previews email sequence in terminal

**Output:**
```
📧 Preview of Email Sequence:

📨 EMAIL 1 (Day 0) - Partnership opportunity: Help your H-1B clients with RSU taxes
Hi John,

I noticed Berry Appleman & Leiden LLP specializes in employment-based immigration in San Francisco...

✅ Exported 200 rows to data/outreach/instantly-upload.csv
```

---

## Phase 2: Domain Setup & Email Warmup (Weeks 1-2)

### Step 2.1: Purchase Domains

**Registrar:** Namecheap or Google Domains

**Domains to purchase:**
1. `taxbridge-partners.com` ($12/year)
2. `taxbridge.co` ($12/year)
3. `taxbridge.io` ($12/year)

**Total:** $36/year

### Step 2.2: Configure DNS

For each domain, add these records (see `EMAIL_DOMAIN_SETUP.md` for full details):

```
# SPF Record
Name: @
Type: TXT
Value: v=spf1 include:_spf.instantly.ai ~all

# DMARC Record
Name: _dmarc
Type: TXT
Value: v=DMARC1; p=none; rua=mailto:michael@taxbridge.app

# MX Records (for receiving replies)
Name: @
Type: MX
Priority: 10
Value: mx1.instantly.ai
```

**Verify DNS propagation:**
```bash
dig txt taxbridge-partners.com | grep spf1
dig mx taxbridge-partners.com
```

### Step 2.3: Connect Domains to Instantly.ai

1. Log in to https://app.instantly.ai
2. Settings → Sending Accounts → Add Sending Account
3. Select "Custom Domain"
4. Enter domain: `taxbridge-partners.com`
5. Follow DKIM verification steps
6. Repeat for `taxbridge.co` and `taxbridge.io`

**Create email addresses:**
```
michael@taxbridge-partners.com
partners@taxbridge-partners.com
hello@taxbridge-partners.com
```

Repeat for all 3 domains = **9 total sending accounts**

### Step 2.4: Enable Email Warmup (14 Days)

**Warmup settings:**
- Start: 5 emails/day
- Increase: +3 emails/day
- Max: 50 emails/day
- Duration: 14 days

**Timeline:**
| Day | Emails/Day | Status |
|-----|------------|--------|
| 1-3 | 5-11 | Building reputation |
| 4-7 | 14-23 | Warming up |
| 8-14 | 26-47 | Almost ready |
| 15+ | 50-100 | ✅ Production ready |

**Important:** DO NOT skip warmup. Sending cold emails from new domains = instant spam folder.

---

## Phase 3: Campaign Launch (Week 3)

### Step 3.1: Upload to Instantly.ai

1. Campaigns → Create Campaign
2. Campaign name: "Immigration Law Firm Outreach - March 2026"
3. Import Leads → Upload CSV
4. Select file: `data/outreach/instantly-upload.csv`
5. Map columns:
   - Email → email
   - First Name → firstName
   - Company → firmName
   - City → city
   - State → state
6. Click "Import"

### Step 3.2: Configure Email Sequence

**Email 1 (Day 0):**
- Subject: {{email1Subject}}
- Body: {{email1Body}}
- Delay: Send immediately

**Email 2 (Day 3):**
- Subject: {{email2Subject}}
- Body: {{email2Body}}
- Delay: 3 days after Email 1

**Email 3 (Day 7):**
- Subject: {{email3Subject}}
- Body: {{email3Body}}
- Delay: 7 days after Email 1

**Unsubscribe:** Automatically added by Instantly.ai

### Step 3.3: Configure Sending Settings

**Sending domains:** Rotate between all 9 email addresses

**Daily limit:**
- Week 1: 50 emails/day (all domains combined)
- Week 2: 75 emails/day
- Week 3+: 100 emails/day

**Sending schedule:**
- Monday-Friday: 9 AM - 5 PM (recipient timezone)
- Saturday-Sunday: Paused

**Randomization:**
- Delay between emails: 2-5 minutes (random)
- Slight variation in send time: ±30 minutes

### Step 3.4: Launch Campaign

1. Review all settings
2. Send test email to yourself
3. Check spam folder, content, links
4. Click "Launch Campaign"
5. Monitor first 24 hours closely

**Expected schedule:**
- Day 0: First 50 emails sent
- Day 3: Email 2 sent to openers + 50 new emails
- Day 7: Email 3 sent to non-repliers + 50 new emails
- Day 10: Final 50 emails sent
- Day 14: All 200 firms contacted

---

## Phase 4: Response Management (Weeks 3-6)

### Step 4.1: Daily Monitoring

```bash
# Check for follow-ups needed
npm run outreach:check-followups
```

**Output:**
```
⚠️ 3 prospects replied but no demo scheduled (> 48 hours):
  Berry Appleman & Leiden LLP (San Francisco, CA)
    Reply date: 2024-03-18
    Days since reply: 3
    Action: Schedule demo call ASAP
```

**Actions:**
- Replied but no demo → Schedule demo within 48 hours
- Trials ending soon → Check in 3 days before trial ends

### Step 4.2: Reply Handling

**Positive reply:** ("Interested in learning more")
1. Reply within 4 hours
2. Offer Calendly link for 15-min demo
3. Update database: `status = 'demo_scheduled'`

**Neutral reply:** ("Tell me more")
1. Reply with 2-min Loom video demo
2. Attach 1-pager PDF (TaxBridge for CPAs)
3. Offer to schedule call if interested

**Objection:** ("Not right now")
1. Ask: "Mind if I check back in 3 months?"
2. Add to follow-up list
3. Update database: `status = 'nurture'`

**Negative reply:** ("Not interested")
1. Reply: "No problem! Unsubscribing you now."
2. Update database: `status = 'closed_lost'`
3. Remove from campaign

### Step 4.3: Demo Calls (15 minutes each)

**Agenda:**
1. (2 min) Ask about their H-1B client base
2. (5 min) Show live demo of TaxBridge
   - Upload sample RSU schedule
   - Calculate dual-country tax
   - Show FTC optimization
   - Export PDF report
3. (3 min) Explain partner program (20% commission, co-branded page)
4. (3 min) Offer 14-day trial for their firm
5. (2 min) Next steps: Trial activation

**Tools:**
- Calendly: https://calendly.com/michael-taxbridge/15min
- Demo environment: https://taxbridge.app/demo
- Screen sharing: Zoom or Google Meet

**After demo:**
1. Send trial activation link
2. Send partner application form
3. Update database: `status = 'trial_started'`, `trial_start_date = NOW()`, `trial_end_date = NOW() + 14 days`

### Step 4.4: Trial Management

**Day 1 (Trial starts):**
- Email: Welcome to TaxBridge + onboarding guide
- Assign dedicated support contact

**Day 3:**
- Check usage (did they upload any RSUs?)
- Email: "How's the trial going? Need any help?"

**Day 7:**
- Call or email check-in
- Offer to walk through any questions

**Day 11 (3 days before trial ends):**
- Email: "Your trial ends in 3 days. Ready to become a partner?"
- Offer to extend trial if needed

**Day 14 (Trial ends):**
- Email: Partner application link
- Pricing reminder (20% commission, $0 upfront)

### Step 4.5: Partner Approval

When partner applies via `/partners` form:

1. Admin reviews application at `/admin/partners`
2. Click "Approve"
3. System generates unique referral code (e.g., `ABC123XYZ0`)
4. Partner receives approval email with:
   - Co-branded landing page: `https://taxbridge.app/p/ABC123XYZ0`
   - Partner portal: `https://taxbridge.app/partners/portal/ABC123XYZ0`
   - Marketing kit download link

**Approval email:**
```typescript
// Auto-sent via webhook or manual trigger
import { generateApprovalEmail } from '@/lib/email/cpa-outreach-sequence';

const email = generateApprovalEmail(
  partnerName,
  firmName,
  referralCode,
  landingPageUrl,
  portalUrl
);

sendEmail(partnerEmail, email.subject, email.body);
```

---

## Phase 5: Performance Tracking

### Dashboard Metrics

**Visit:** http://localhost:3000/admin/outreach

**Key metrics:**
- Total Prospects: 200
- Contacted: X
- Reply Rate: X% (target: 8%)
- Demo Rate: X% (target: 3%)
- Partners Signed: X (goal: 10)

### Weekly Stats Update

```bash
npm run outreach:update-stats
```

**Output:**
```
📊 Current Metrics:
  Total Prospects: 200
  Contacted: 150 (75%)
  Opened: 68 (45%)
  Replied: 12 (8%)
  Demos: 5
  Trials: 2
  Closed Won: 0

🎯 Goal Progress:
  Reply Rate: 8.0% / 8% ✅
  Demos: 5 / 6 ⏳
  Trials: 2 / 3 ⏳
  Customers: 0 / 10 ⏳
```

### Expected Results (End of Month 1)

**Conservative:**
- 200 firms contacted
- 90 opens (45% open rate)
- 16 replies (8% reply rate)
- 6 demos (3% demo rate)
- 3 trials
- 1 partner signed up

**Optimistic:**
- 200 firms contacted
- 100 opens (50% open rate)
- 20 replies (10% reply rate)
- 10 demos (5% demo rate)
- 5 trials
- 3 partners signed up

**Revenue (Month 3, assuming 5 referrals per partner):**
- 3 partners × 5 referrals = 15 new customers
- 15 customers × $299 (Pro) = $4,485 ARR
- Commission paid: $897 (20%)
- **Net revenue: $3,588**

**Payback period:** 1-2 months

---

## Troubleshooting

### Low Open Rate (<30%)

**Causes:**
1. Subject lines too salesy
2. Sender reputation issues
3. Emails going to spam

**Solutions:**
- Test different subject lines
- Check sender reputation (Google Postmaster Tools)
- Use mail-tester.com to test deliverability
- Add personalization tokens ({{firstName}}, {{firmName}})

### Low Reply Rate (<5%)

**Causes:**
1. Email content not compelling
2. CTA unclear
3. Target audience mismatch

**Solutions:**
- A/B test email copy
- Shorten emails (aim for <150 words)
- Add social proof ("Used by 50+ immigration law firms")
- Strengthen CTA ("Reply with your availability for a 10-min call")

### High Bounce Rate (>5%)

**Causes:**
1. Invalid email addresses
2. Typos in email list
3. Outdated contact data

**Solutions:**
- Pause campaign immediately
- Verify all emails with NeverBounce
- Remove bounced addresses
- Resume at lower volume

### Emails Going to Spam

**Causes:**
1. Domain reputation low
2. SPF/DKIM not configured
3. Content triggers spam filters

**Solutions:**
- Check DNS records (SPF, DKIM, DMARC)
- Remove spam trigger words ("Free", "Guarantee", "Limited time")
- Add plain text version
- Reduce link count (max 2-3 links per email)
- Continue warmup for 30 days

---

## Automation & Optimization

### Automated Follow-Ups

**Set up cron job:**
```bash
# Add to crontab
0 9 * * 1-5 cd /path/to/taxbridge && npm run outreach:check-followups
```

**Alerts via Slack/Email:**
```typescript
// In outreach:check-followups script
if (needDemo.length > 0) {
  sendSlackAlert(`⚠️ ${needDemo.length} prospects need demo scheduled`);
}
```

### Email Sequence A/B Testing

**Test variations:**
- Subject line A: "Partnership opportunity: Help your H-1B clients with RSU taxes"
- Subject line B: "20% recurring commission on every client you refer"

**Track results:**
- Open rate by variation
- Reply rate by variation
- Winner after 50 emails

### Lead Scoring

**Assign scores based on:**
- Firm size (50+ attorneys = +10 points)
- Location (SF/Seattle = +5 points)
- Opened email (+3 points)
- Clicked link (+5 points)
- Replied (+10 points)

**Prioritize high-score leads for manual follow-up**

---

## Success Checklist

**Week 1:**
- [ ] Apollo.io account set up
- [ ] 200 firms scraped and exported
- [ ] Emails verified (optional)
- [ ] Domains purchased and DNS configured

**Week 2:**
- [ ] Domains connected to Instantly.ai
- [ ] Email warmup started (14 days)
- [ ] CSV uploaded to Instantly.ai
- [ ] Email sequence configured

**Week 3:**
- [ ] Campaign launched
- [ ] First 50 emails sent
- [ ] Replies monitored daily
- [ ] Demo calls scheduled

**Week 4:**
- [ ] All 200 firms contacted
- [ ] 10+ demos completed
- [ ] 3+ trials started
- [ ] First partner approved

**Month 3:**
- [ ] 10 partners approved and active
- [ ] 50+ enterprise referrals tracked
- [ ] $5K+ MRR from partner referrals

---

## Support

**Questions?**
- Email: michael@taxbridge.app
- Dashboard: http://localhost:3000/admin/outreach
- Scripts: `npm run outreach:*`

**Resources:**
- EMAIL_DOMAIN_SETUP.md - Full DNS configuration guide
- CPA_PARTNER_PROGRAM_IMPLEMENTATION.md - Partner infrastructure overview
- Apollo.io docs: https://apolloio.github.io/apollo-api-docs/
- Instantly.ai help: https://help.instantly.ai/

---

**Status:** Ready to execute. All infrastructure built. Go time! 🚀
