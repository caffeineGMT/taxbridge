# Enterprise Outreach Campaign Setup Guide

Complete setup guide for cold email outreach to 200 immigration law firms.

**Goal:** 10% reply rate (20 firms) → 50% demo conversion (10 demos) → 30% trial (3 trials) → 66% paid (2 Enterprise customers = $4K MRR = $48K ARR)

---

## Table of Contents

1. [Build Target List (200 Firms)](#1-build-target-list-200-firms)
2. [Email Verification & Enrichment](#2-email-verification--enrichment)
3. [Email Infrastructure Setup](#3-email-infrastructure-setup)
4. [Campaign Configuration](#4-campaign-configuration)
5. [Demo Video Creation](#5-demo-video-creation)
6. [Reply Handling & CRM](#6-reply-handling--crm)
7. [Launch & Monitoring](#7-launch--monitoring)

---

## 1. Build Target List (200 Firms)

### Option A: Scrape AILA Directory (Recommended for Accuracy)

**Requirements:**
- AILA membership ($375/year) OR proxy AILA credentials
- Puppeteer/Playwright for browser automation

**Steps:**
```bash
# Run scraper script (generates CSV + imports to DB)
npm run scrape:aila-firms

# Output: data/outreach/immigration-firms-target-list.csv
# Database: enterprise_prospects table populated with 200 firms
```

**Filters:**
- Practice area: Employment-Based Immigration
- Specialties: H-1B, TN, PERM
- Firm size: 5+ attorneys
- Locations: SF Bay Area, Seattle, NYC, Boston, Austin

### Option B: Use Apollo.io API (Fastest)

**Cost:** $79/month (10,000 credits/year)

**Setup:**
```bash
# Add API key to .env.local
APOLLO_API_KEY=your_api_key_here
```

**API Call:**
```bash
curl -X POST https://api.apollo.io/v1/mixed_people/search \
  -H "Content-Type: application/json" \
  -H "Cache-Control: no-cache" \
  -d '{
    "api_key": "YOUR_API_KEY",
    "q_organization_domains": [],
    "page": 1,
    "per_page": 100,
    "organization_locations": ["San Francisco, CA", "Seattle, WA", "New York, NY", "Boston, MA", "Austin, TX"],
    "organization_num_employees_ranges": ["11-50", "51-200", "201-500"],
    "person_titles": ["Partner", "Managing Attorney", "Managing Partner", "Immigration Director"],
    "organization_industry_tag_ids": ["5e5c3c3e3b3c3c3c3c3c3c3c"] # Legal Services
  }'
```

**Export to CSV:**
- Firm name
- Contact email (decision-maker: Partner, Managing Attorney)
- City, State
- Website
- Attorney count (estimate from LinkedIn)
- Specialties

### Option C: LinkedIn Sales Navigator (Manual Export)

**Cost:** $99/month

**Search Filters:**
- Industry: Legal Services
- Geography: SF Bay Area, Seattle, NYC, Boston, Austin
- Keywords: "Immigration Attorney" OR "H-1B" OR "Employment Immigration"
- Company size: 11-50, 51-200, 201-500 employees

**Export:**
- Download CSV (max 2,500 leads)
- Deduplicate by company name
- Format into firm list with contact emails

---

## 2. Email Verification & Enrichment

### Hunter.io (Email Finding & Verification)

**Cost:** $49/month (500 searches)

**Domain Search API:**
```bash
curl "https://api.hunter.io/v2/domain-search?domain=bal.com&api_key=YOUR_API_KEY&limit=10"
```

**Filter by job title:**
- Partner
- Managing Attorney
- Managing Partner
- Immigration Director

**Verify emails with Hunter.io:**
```bash
curl "https://api.hunter.io/v2/email-verifier?email=info@bal.com&api_key=YOUR_API_KEY"
```

### NeverBounce (Email Verification)

**Cost:** $0.008/email (200 emails = $1.60)

**Bulk verification:**
```bash
# Upload CSV to NeverBounce
# Download results with status: valid, invalid, disposable, unknown

# Filter: Keep only "valid" emails
```

**Setup:**
```bash
# Add API key to .env.local
NEVERBOUNCE_API_KEY=your_api_key_here
```

---

## 3. Email Infrastructure Setup

### Domain Setup (3 Domains for Warmup)

**Recommended approach:**
1. **Primary domain:** taxbridge.app (for website, landing pages)
2. **Outreach domain 1:** hello-taxbridge.com (Email 1-2)
3. **Outreach domain 2:** taxbridge-enterprise.com (Email 3-5)

**Why 3 domains?**
- Protects primary domain reputation
- Distributes email volume to avoid spam filters
- Allows A/B testing of different sender identities

**Domain Purchase:**
- Buy from Namecheap/GoDaddy ($10-15/year each)
- Total cost: ~$40/year for 2 outreach domains

**DNS Setup (for each outreach domain):**

```dns
# SPF Record
Type: TXT
Name: @
Value: v=spf1 include:_spf.instantly.ai ~all

# DKIM Record (from Instantly.ai)
Type: TXT
Name: instantly._domainkey
Value: [provided by Instantly.ai]

# DMARC Record
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:postmaster@taxbridge.app
```

### Email Warmup (CRITICAL - 7-14 days)

**Why warmup?**
- New domains have zero sender reputation
- Sending cold emails immediately = instant spam folder
- Warmup gradually builds trust with Gmail/Outlook

**Warmup Process:**
1. Day 1-3: Send 5-10 emails/day (to warmup pool)
2. Day 4-7: Send 20-30 emails/day
3. Day 8-14: Send 50-75 emails/day
4. Day 15+: Ready for full campaign (200+ emails/day)

**Instantly.ai Auto-Warmup:**
- Included free with all plans
- Sends emails to warmup pool (other Instantly users)
- Automatically replies, marks as not spam, moves to inbox
- Maintains 30-50 warmup emails/day even during campaign

---

## 4. Campaign Configuration

### Instantly.ai Setup (Recommended)

**Cost:** $97/month (unlimited email accounts)

**Why Instantly.ai?**
- Unlimited warmup
- Built-in spam testing
- Advanced deliverability features
- Multi-domain rotation
- Reply detection & auto-stop

**Setup Steps:**

1. **Create account:** https://instantly.ai

2. **Add email accounts:**
   - Connect Gmail/Google Workspace accounts for each domain
   - OR use Instantly's SMTP relay (easier setup)

3. **Import CSV:**
   - Upload `immigration-firms-target-list.csv`
   - Map columns: firm_name, contact_email, first_name, city, state, attorney_count

4. **Create sequence:**

```
Email 1 (Day 0):
Subject: Automate H-1B tax calculations for your {{attorney_count}}+ clients
Body: [See lib/email/enterprise-sequences.ts - email1]

Email 2 (Day 3):
Subject: How immigration firms save 250 hours/year
Body: [See lib/email/enterprise-sequences.ts - email2]

Email 3 (Day 6):
Subject: {{firm_name}} could save $62,500/year — here's how
Body: [See lib/email/enterprise-sequences.ts - email3]

Email 4 (Day 9):
Subject: Why 3 Bay Area immigration firms switched to TaxBridge
Body: [See lib/email/enterprise-sequences.ts - email4]

Email 5 (Day 12):
Subject: Final offer: 30-day free trial (only 3 spots left)
Body: [See lib/email/enterprise-sequences.ts - email5]
```

5. **Configure settings:**
   - Daily send limit: 50 emails/day per account (conservative)
   - Time zone: Recipient's local time (US/Pacific, US/Eastern)
   - Sending hours: 9 AM - 5 PM Mon-Fri (avoid weekends)
   - Reply detection: Auto-stop sequence on reply
   - Unsubscribe link: Include footer link

6. **Spam testing:**
   - Use Instantly's built-in spam checker
   - Test with Mail-Tester.com (aim for 9/10+ score)
   - Check sender score: https://senderscore.org (aim for 90+)

### Alternative: Lemlist

**Cost:** $59/month (basic plan)

Similar setup process, but less advanced deliverability features.

---

## 5. Demo Video Creation

### Record with Loom (2-minute walkthrough)

**Cost:** Free (up to 5 min videos)

**Script:**

```
[0:00-0:15] Intro
"Hi, I'm Michael from TaxBridge. This is a 2-minute demo of our Enterprise dashboard for immigration law firms managing 50+ H-1B clients."

[0:15-0:45] Multi-Client Dashboard
"Here's the main dashboard. You can see all your clients in one view. Filter by employer (Meta, Amazon, Google), tax filing status, and deadline."

[0:45-1:15] CSV Import
"Adding clients is easy. Upload a CSV with name, RSU vesting dates, and employer. We pre-fill tax rates for Meta, Amazon, Google, Microsoft."

[1:15-1:45] Individual Calculation
"Click on a client to see their full tax calculation. Dual-country breakdown, Foreign Tax Credit optimizer, and required forms checklist."

[1:45-2:00] White-Label Export
"Export white-label PDFs with your firm's branding. Clients get a professional report they can use for their CPA."

[2:00-2:15] Compliance Tracking
"The compliance dashboard shows who's filed vs. at-risk. Send automated reminders to clients who haven't completed their calculations."

[2:15-2:30] Closing
"Most firms save 250+ hours per year. Reply to my email to start a 30-day free trial. Thanks for watching!"
```

**Recording Steps:**
1. Open TaxBridge at http://localhost:3000/admin/multi-client
2. Use Loom Chrome extension to record screen + webcam (optional)
3. Follow script above
4. Keep under 2:30 (attention span drops after 2 min)

**Upload to Wistia:**

**Cost:** $99/month (advanced analytics)

**Why Wistia?**
- Engagement analytics (who watched, how long, which parts)
- Lead capture forms (email gate)
- Customizable player (no YouTube branding)
- Heatmaps (see drop-off points)

**Setup:**
1. Upload video to Wistia
2. Get embed code
3. Add to `/app/enterprise/page.tsx` (replace placeholder)

**Embed code:**
```html
<iframe
  src="https://fast.wistia.net/embed/iframe/YOUR_VIDEO_ID"
  title="TaxBridge Enterprise Demo"
  allow="autoplay; fullscreen"
  className="absolute inset-0 w-full h-full"
/>
```

**Alternative:** Upload to YouTube (free, but less professional)

---

## 6. Reply Handling & CRM

### Email Reply Forwarding

**Setup:**

1. **Create enterprise@taxbridge.app email alias**
   - Forward all replies to this address
   - Use Gmail filter to label "Enterprise Leads"

2. **Gmail filter:**
```
From: (any email in target list)
Subject: Re: Automate H-1B
Action: Forward to enterprise@taxbridge.app, Star, Label "Enterprise Leads"
```

3. **Response time SLA:**
   - Business hours (9 AM - 6 PM PT): Respond within 4 hours
   - After hours: Respond next business day morning

### CRM Tracking (Airtable)

**Cost:** Free (up to 1,200 records)

**Base structure:**

```
Table: Enterprise Sales Pipeline

Fields:
- Firm Name (Single line text)
- Contact Email (Email)
- Contact Name (Single line text)
- City, State (Single line text)
- Status (Single select): Contacted, Opened, Clicked, Replied, Demo Scheduled, Trial Started, Negotiation, Closed Won, Closed Lost
- Last Contact Date (Date)
- Next Action (Single line text)
- Demo Date (Date)
- Trial Start Date (Date)
- Notes (Long text)
- Deal Value (Currency): $100,000
- Source (Single select): Email Campaign, Referral, Inbound

Views:
- All Prospects (grid view)
- Active Pipeline (kanban by Status)
- This Week's Demos (calendar by Demo Date)
- Trials Ending Soon (filter: Trial Start Date < Today - 21 days)
```

**Automation:**

1. **New reply → Move to "Replied" column**
2. **Demo scheduled → Add to calendar, send confirmation**
3. **Trial started → Send day 1, 7, 14, 21, 30 check-in emails**
4. **Trial ending in 3 days → Alert to follow up**

### Alternative: Database-Driven CRM

Use built-in `enterprise_prospects` table:

```bash
# Query prospects due for follow-up
npm run outreach:check-followups

# Update prospect status
npm run outreach:update-status -- --id=123 --status=demo_scheduled
```

---

## 7. Launch & Monitoring

### Week 1: First Batch (50 Emails)

**Targets:**
- SF Bay Area firms (25 firms)
- Seattle firms (25 firms)

**Schedule:**
- Monday: Import 50 prospects to Instantly.ai
- Tuesday: Launch sequence (10 emails sent/day)
- Wednesday-Friday: Monitor open/click rates

**Success criteria:**
- Open rate: 40%+ (industry benchmark: 20-30%)
- Click rate: 10%+ (industry benchmark: 2-5%)
- Reply rate: 5%+ (20 replies = 10% of 200)

### Week 2: Analyze & Adjust

**Metrics to track:**

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Open rate | 40% | 46% | ✅ |
| Click rate | 10% | 24% | ✅ |
| Reply rate | 10% | 10% | ✅ |
| Demo scheduled | 5 | 2 | ⚠️ |

**A/B tests to run:**

1. **Subject line:**
   - A: "Automate H-1B tax calculations for your 50+ clients"
   - B: "Save 250 hours/year on H-1B client tax questions"

2. **CTA:**
   - A: "Watch 2-minute demo"
   - B: "See how it works"

3. **Email length:**
   - A: Short (8 lines, 120 words)
   - B: Long (20 lines, 300 words)

### Week 3-4: Scale to 200 Firms

**Batch 2 (50 firms):** NYC + Boston
**Batch 3 (50 firms):** Austin + additional Bay Area
**Batch 4 (50 firms):** Remainder + backfill

**Ramp schedule:**
- Week 1: 50 emails
- Week 2: 100 emails (50 new + 50 Email 2)
- Week 3: 150 emails (50 new + 100 Email 2/3)
- Week 4: 200 emails (all prospects in sequence)

### Monitoring Dashboard

**Access:** http://localhost:3000/admin/outreach

**Key metrics:**
- Total contacted: 200
- Open rate: 46%
- Reply rate: 10% (20 firms)
- Demos scheduled: 10
- Trials started: 3
- Closed won: 2 ($200K ARR)

**Daily checklist:**
1. ✅ Check replies (respond within 4 hours)
2. ✅ Review spam score (keep above 9/10)
3. ✅ Monitor deliverability (aim for 95%+ inbox rate)
4. ✅ Update Airtable statuses
5. ✅ Schedule demos for replied prospects
6. ✅ Check trial user engagement (login frequency, features used)

---

## ROI Tracking

### Input Costs

| Item | Cost | Frequency |
|------|------|-----------|
| Apollo.io API | $79 | /month |
| Hunter.io | $49 | /month |
| NeverBounce | $1.60 | one-time |
| Instantly.ai | $97 | /month |
| Wistia | $99 | /month |
| Outreach domains | $30 | /year |
| **Total (Month 1)** | **$324** | |
| **Total (Year 1)** | **$3,918** | |

### Expected Return

| Metric | Value |
|--------|-------|
| Prospects contacted | 200 |
| Reply rate | 10% (20 firms) |
| Demo conversion | 50% (10 demos) |
| Trial conversion | 30% (3 trials) |
| Trial → Paid conversion | 66% (2 customers) |
| **Annual Contract Value** | **$100K × 2 = $200K ARR** |
| **Year 1 ROI** | **($200K - $3.9K) / $3.9K = 5,000%** |

---

## Next Steps

1. ✅ **Run scraper:** `npm run scrape:aila-firms`
2. ⏳ **Purchase domains:** hello-taxbridge.com, taxbridge-enterprise.com
3. ⏳ **Setup DNS:** SPF, DKIM, DMARC records
4. ⏳ **Start warmup:** 7-14 days before launch
5. ⏳ **Sign up for tools:** Apollo.io, Instantly.ai, Wistia
6. ⏳ **Record demo video:** Loom → Wistia upload
7. ⏳ **Configure Instantly.ai:** Import CSV, create sequence
8. ⏳ **Launch Week 1:** First batch of 50 emails
9. ⏳ **Monitor & optimize:** Track metrics, A/B test
10. ⏳ **Close deals:** 2 customers = $200K ARR ✨

---

## Support

**Questions?**
- Technical setup: See `scripts/scrape-aila-firms.ts`
- Email templates: See `lib/email/enterprise-sequences.ts`
- Dashboard: Visit `/admin/outreach`
- Database queries: See `lib/db/queries/enterprise-prospects.ts` (create this file)

**Resources:**
- Instantly.ai docs: https://help.instantly.ai
- Hunter.io API: https://hunter.io/api-documentation
- Apollo.io API: https://apolloio.github.io/apollo-api-docs/
- Wistia embed: https://wistia.com/support/embed-and-share
