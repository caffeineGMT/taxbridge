# Beta User Testimonial Outreach Campaign

## Campaign Overview
**Goal**: Collect 10 video testimonials from beta users
**Incentive**: $20 Amazon gift card per testimonial
**Target**: H-1B/TN visa tech workers who have used TaxBridge
**Format**: Written testimonials (60-90 second video optional, higher incentive)

## Email Template

**Subject**: Share your TaxBridge experience - $20 Amazon gift card

---

Hi [FIRST_NAME],

I hope this email finds you well! I'm reaching out because you've been using TaxBridge for your cross-border tax calculations, and I'd love to hear about your experience.

**Would you be willing to share a short testimonial?**

We're looking for authentic feedback from beta users like you to help other H-1B and TN visa holders navigate cross-border taxation. In exchange for a 2-minute written testimonial (or 60-90 second video), we'll send you a **$20 Amazon gift card** as a thank you.

### What we're looking for:
- **Your role and company** (e.g., "Senior SWE at Meta, Vancouver")
- **How TaxBridge helped you** (saved time, caught errors, simplified filing, etc.)
- **Specific results** (optional: "saved $2,300 in FTC errors", "reduced prep time by 5 hours")
- **Your rating** (1-5 stars)

### How to participate:
1. Reply to this email with your written testimonial (2-3 sentences)
2. OR record a 60-90 second video on your phone and send the link (**$30 Amazon gift card for video**)
3. We'll send your gift card within 24 hours of receiving your testimonial

### Example testimonial:
> "I was paying my CPA $800/year just for RSU tax calculations. TaxBridge gave me the same accuracy for a fraction of the cost, and I caught a $2,300 FTC error from last year. Already recommended it to my entire H-1B team."
> — Priya Sharma, Senior SWE, Meta (Vancouver, BC)

**Ready to share your experience?** Just hit reply and let me know!

Best regards,
Michael
Founder, TaxBridge
support@taxbridge.app

P.S. Your testimonial will be featured on our website and may help hundreds of other tech workers simplify their cross-border taxes. Thanks for being a beta user!

---

## Beta User List (Target: 10)

| # | Name | Email | Company | Role | Outreach Date | Status |
|---|------|-------|---------|------|---------------|--------|
| 1 | Priya Sharma | priya.sharma@example.com | Meta | Senior SWE | [PENDING] | Not sent |
| 2 | David Kim | david.kim@example.com | Amazon | Staff Engineer | [PENDING] | Not sent |
| 3 | Maria Gonzalez | maria.gonzalez@example.com | Google | TN Visa Holder | [PENDING] | Not sent |
| 4 | James Chen | james.chen@example.com | Microsoft | Engineering Manager | [PENDING] | Not sent |
| 5 | Sophie Tremblay | sophie.tremblay@example.com | Salesforce | Principal SWE | [PENDING] | Not sent |
| 6 | Raj Patel | raj.patel@example.com | Meta | L5 SWE | [PENDING] | Not sent |
| 7 | Emily Zhang | emily.zhang@example.com | Amazon | Senior PM | [PENDING] | Not sent |
| 8 | Carlos Rodriguez | carlos.rodriguez@example.com | Google | Staff SWE | [PENDING] | Not sent |
| 9 | Aisha Mohammed | aisha.mohammed@example.com | Microsoft | Senior SWE | [PENDING] | Not sent |
| 10 | Liam O'Brien | liam.obrien@example.com | Salesforce | Tech Lead | [PENDING] | Not sent |

## Outreach Script (via CLI)

```bash
# 1. Create outreach tracking entries
npm run testimonials:seed-outreach

# 2. Send outreach emails (manual review recommended)
# Use your email client to send personalized emails from the template above
# Mark each send in the database with the CLI

# 3. Track responses
npm run testimonials:track-response --email priya.sharma@example.com --status responded
npm run testimonials:track-response --email david.kim@example.com --status completed --testimonial-id 1

# 4. Send gift cards (manual)
# Use Amazon gift card codes via email once testimonial is received
```

## Follow-up Cadence

- **Day 0**: Send initial outreach email
- **Day 3**: Send gentle reminder if no response
- **Day 7**: Final follow-up
- **Day 10**: Mark as "declined" and move to next candidate

## Testimonial Review Checklist

Before publishing:
- [ ] Testimonial is authentic and specific
- [ ] No typos or grammatical errors
- [ ] Customer confirmed name, role, company, location
- [ ] Customer approved quote for public use
- [ ] Gift card sent and confirmed received
- [ ] Added to database with `status: 'active'`
- [ ] Featured on homepage, pricing page, calculator results

## Video Testimonial Guidelines (Optional - $30 incentive)

**What to say in 60-90 seconds:**
1. Introduce yourself: "I'm [NAME], [ROLE] at [COMPANY] in [CITY]"
2. State the problem: "Cross-border tax filing was complex/expensive/time-consuming..."
3. How TaxBridge helped: "TaxBridge simplified [SPECIFIC FEATURE], saved me [TIME/MONEY]..."
4. Result/recommendation: "I recommend TaxBridge to any H-1B/TN worker dealing with RSUs"

**Technical requirements:**
- Horizontal orientation (landscape, not portrait)
- Good lighting (face clearly visible)
- Quiet environment (no background noise)
- Length: 60-90 seconds maximum
- Format: MP4, MOV, or upload to YouTube/Google Drive and share link

**Upload options:**
- Google Drive link (set to "anyone with link can view")
- Dropbox link
- WeTransfer
- YouTube (unlisted)

---

## Success Metrics

- **Response rate target**: 70% (7 out of 10)
- **Completion rate target**: 50% (5 out of 10)
- **Video testimonial rate**: 20% (2 out of 10)
- **Average time to completion**: 3-5 days
- **Cost**: $100-$150 (5 written + 2 video)

## Next Steps

1. ✅ Create database schema for `testimonial_outreach` table
2. ✅ Create email template (see above)
3. ⏳ Seed outreach tracking database with beta user list
4. ⏳ Send personalized emails to 10 beta users
5. ⏳ Track responses and manage gift cards
6. ⏳ Publish testimonials on website (homepage, pricing, calculator results)
7. ⏳ Monitor conversion impact (pricing page CTR, trial signups)

---

## Legal & Privacy

- All testimonials require explicit written consent for public use
- Users can request removal at any time
- No personally identifiable information (email, phone) published without consent
- Gift cards are taxable income (users responsible for reporting)
