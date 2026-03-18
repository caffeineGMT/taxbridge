# Email Domain Setup for Outreach Campaign

Complete guide to setting up 3 warmed domains for email outreach to immigration law firms.

---

## Required Domains

Purchase these 3 domains for email rotation:

1. **taxbridge-partners.com** (primary partner domain)
2. **taxbridge.co** (secondary)
3. **taxbridge.io** (tertiary)

**Registrar:** Namecheap or Google Domains ($12/year each)
**Total cost:** $36/year

---

## DNS Configuration

For each domain, add these DNS records:

### 1. SPF Record (TXT)

```
Name: @
Type: TXT
Value: v=spf1 include:_spf.instantly.ai ~all
TTL: 3600
```

**Purpose:** Authorizes Instantly.ai to send emails on your behalf

### 2. DKIM Record (CNAME)

After connecting domain to Instantly.ai, they'll provide a DKIM key. Add:

```
Name: instantly._domainkey
Type: CNAME
Value: [provided by Instantly.ai]
TTL: 3600
```

**Purpose:** Email signature verification

### 3. DMARC Record (TXT)

```
Name: _dmarc
Type: TXT
Value: v=DMARC1; p=none; rua=mailto:michael@taxbridge.app
TTL: 3600
```

**Purpose:** Email authentication policy (start with `p=none` during warmup)

### 4. MX Records (optional but recommended)

```
Name: @
Type: MX
Priority: 10
Value: mx1.instantly.ai
TTL: 3600

Name: @
Type: MX
Priority: 20
Value: mx2.instantly.ai
TTL: 3600
```

**Purpose:** Allows receiving replies

### 5. Custom Tracking Domain (optional)

```
Name: track
Type: CNAME
Value: track.instantly.ai
TTL: 3600
```

**Purpose:** Branded link tracking (track.taxbridge-partners.com)

---

## Instantly.ai Setup

### Step 1: Connect Domains

1. Log in to Instantly.ai → Settings → Sending Accounts
2. Click "Add Sending Account"
3. Select "Custom Domain"
4. Enter domain: `taxbridge-partners.com`
5. Follow verification steps
6. Repeat for `taxbridge.co` and `taxbridge.io`

### Step 2: Create Email Addresses

For each domain, create:

```
michael@taxbridge-partners.com
partners@taxbridge-partners.com
hello@taxbridge-partners.com
```

**Why 3 emails per domain?**
- Spreads sending load
- Improves deliverability
- Reduces spam risk

**Total sending accounts:** 3 domains × 3 emails = 9 email addresses

### Step 3: Enable Warmup

1. For each sending account, enable "Warmup Mode"
2. Settings:
   - **Start:** 5 emails/day
   - **Increase:** +3 emails/day
   - **Max:** 50 emails/day
   - **Duration:** 14 days
3. Warmup provider: Instantly.ai built-in (included)

**Alternative:** Mailreach.co ($25/domain/mo for advanced warmup)

---

## Warmup Timeline

| Day | Emails/Day | Cumulative | Status |
|-----|------------|------------|--------|
| 1   | 5          | 5          | Warmup starting |
| 3   | 11         | 27         | Building reputation |
| 7   | 23         | 119        | Half warmed |
| 10  | 32         | 215        | Nearly ready |
| 14  | 47         | 371        | ✅ Fully warmed |
| 15+ | 50-100     | N/A        | Production sending |

**Don't rush warmup!** Sending cold emails from new domains = instant spam folder.

---

## Email Authentication Checklist

Before sending, verify all records are set:

```bash
# Check SPF
dig txt taxbridge-partners.com | grep spf1

# Check DMARC
dig txt _dmarc.taxbridge-partners.com

# Check MX
dig mx taxbridge-partners.com
```

**Online tools:**
- https://mxtoolbox.com/SuperTool.aspx
- https://www.mail-tester.com/
- https://www.learndmarc.com/

**Target scores:**
- Mail-tester.com: 10/10
- DMARC alignment: PASS
- SPF alignment: PASS
- DKIM alignment: PASS

---

## Best Practices

### 1. Sending Volume

**Week 1-2 (Warmup):**
- 5-50 emails/day increasing gradually
- Only to highly engaged prospects
- High reply rate expected (warmup partners with Instantly.ai)

**Week 3+ (Production):**
- 50 emails/day per domain (150 total)
- Can increase to 100/day per domain after 30 days
- Monitor bounce rate (<2%) and spam complaints (<0.1%)

### 2. Email Content

**Avoid spam triggers:**
- ❌ ALL CAPS SUBJECT LINES
- ❌ Excessive exclamation marks!!!
- ❌ "Free", "Guarantee", "Act now"
- ❌ Image-only emails
- ❌ Suspicious links (bit.ly, tinyurl)

**Best practices:**
✅ Personalized subject lines
✅ Plain text or simple HTML
✅ Clear unsubscribe link
✅ Real physical address in footer
✅ Links to main domain (taxbridge.app)

### 3. List Hygiene

**Before uploading to Instantly.ai:**
- Verify all emails with NeverBounce or Hunter.io
- Remove catch-all addresses (high bounce risk)
- Remove role-based emails (info@, support@)
- Deduplicate by email address

**During campaign:**
- Remove hard bounces immediately
- Unsubscribe complainers instantly
- Track replies and pause sequence

### 4. Monitoring

**Daily checks:**
- Bounce rate (<2% is healthy)
- Spam complaint rate (<0.1%)
- Reply rate (target 5-10%)
- Unsubscribe rate (<1%)

**Weekly checks:**
- Domain reputation (https://postmaster.google.com)
- Blacklist status (https://mxtoolbox.com/blacklists.aspx)
- Email deliverability (seed list test)

---

## Troubleshooting

### Emails Going to Spam

**Possible causes:**
1. **Domain too new** → Continue warmup for 30 days
2. **SPF/DKIM not configured** → Check DNS records
3. **Content flagged** → Remove spam trigger words
4. **High bounce rate** → Verify emails before sending
5. **Too many emails too fast** → Reduce daily volume

**Solutions:**
- Use https://glockapps.com/spam-testing/ ($49) to test
- Check Google Postmaster Tools for reputation
- Send test emails to Gmail/Outlook/Yahoo

### High Bounce Rate (>5%)

**Actions:**
1. Pause campaign immediately
2. Export bounced emails
3. Remove from list permanently
4. Verify remaining emails with NeverBounce
5. Resume at lower volume

### Domain Blacklisted

**Check:**
```bash
# Major blacklists
https://mxtoolbox.com/domain/taxbridge-partners.com

# Spamhaus
https://www.spamhaus.org/lookup/

# Barracuda
https://barracudacentral.org/lookups
```

**Removal:**
- Contact blacklist provider
- Prove legitimate business use
- Fix underlying issue
- Wait 2-4 weeks for removal

---

## Cost Summary

| Item | Provider | Cost | Frequency |
|------|----------|------|-----------|
| Domain (×3) | Namecheap | $12 | /year |
| Instantly.ai | Instantly | $37 | /month |
| Email warmup | Built-in | $0 | included |
| Email verification | NeverBounce | $1.60 | one-time (200 emails) |
| **Total Year 1** | | **$480** | |
| **Monthly (Year 2+)** | | **$40** | |

**ROI:**
- 200 firms contacted
- 10 partners signed up
- 50+ enterprise referrals (5 per partner × 10)
- $50K+ ARR from referrals
- **Cost per partner:** $48
- **Payback period:** <2 months

---

## Quick Start Checklist

- [ ] Purchase 3 domains (taxbridge-partners.com, taxbridge.co, taxbridge.io)
- [ ] Configure SPF, DKIM, DMARC for all domains
- [ ] Connect domains to Instantly.ai
- [ ] Create 3 email addresses per domain (9 total)
- [ ] Enable warmup mode (14 days)
- [ ] Verify DNS with mail-tester.com (target 10/10)
- [ ] Test send to personal email (check spam folder)
- [ ] Wait 14 days for warmup to complete
- [ ] Upload prospect list to Instantly.ai
- [ ] Launch campaign at 50 emails/day
- [ ] Monitor bounce rate, spam complaints, replies daily

---

**Documentation:** https://help.instantly.ai/en/articles/5775474-how-to-connect-your-custom-domain
**Support:** support@instantly.ai
**Emergency:** Pause campaign in Instantly.ai → Campaigns → Pause All
