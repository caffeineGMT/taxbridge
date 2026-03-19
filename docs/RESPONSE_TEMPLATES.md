# Product Hunt Response Templates

**20+ pre-written templates for responding to comments within 15 minutes**
**Instructions:** Customize with specifics, add personal touch, post within 10 min

---

## Category 1: Questions About Accuracy/Trust

### Q1: "How accurate are the calculations?"

**Template:**
Thanks for asking, [name]!

The tax calculations are based on official IRS and CRA tax brackets and rules. Specifically:
- US federal tax: IRS Publication 17 (2025)
- State tax: [State] Department of Revenue rates
- Canada federal/provincial: CRA guidelines
- FTC (Foreign Tax Credit): IRS Form 1116 methodology

We worked with 2 cross-border CPAs to validate the math. The calculator handles:
✅ Progressive tax brackets
✅ Standard deductions
✅ Foreign Tax Credit calculations
✅ Multi-year vesting schedules

**Important:** This is for estimation/planning only. Always consult a CPA for final tax filing. The tool helps you understand the numbers before paying $2K+ for a consultation.

For your specific situation, I'd recommend running the numbers and sharing the PDF with your accountant to verify. Let me know if you find any discrepancies!

---

### Q2: "Is my data private/secure?"

**Template:**
Great question, [name]! Privacy is critical for tax data.

**Here's how we protect your info:**
🔒 All data encrypted in transit (TLS 1.3) and at rest (AES-256)
🔒 No data sold to third parties (we're not TurboTax)
🔒 Minimal data collection (only what's needed for calculations)
🔒 You can delete your account + data anytime
🔒 Hosted on Vercel (SOC 2 Type II compliant)

**What we store:**
- Input values (income, RSUs, etc.) to save your calculations
- Email (only if you create an account)
- Payment info (handled by Stripe, we never see credit card numbers)

**What we DON'T store:**
- SSN or SIN
- Actual tax returns
- Bank account info

You can also use the calculator WITHOUT creating an account (results just won't be saved).

Full privacy policy: https://taxbridgecpa.com/privacy

---

### Q3: "Did you work with real CPAs/accountants?"

**Template:**
Yes! We worked with 2 cross-border tax specialists to validate the calculations:
1. CPA specializing in US-Canada cross-border taxation (15+ years)
2. EA (Enrolled Agent) with expertise in Form 1116 (FTC calculations)

They reviewed:
✅ Tax bracket calculations
✅ FTC (Foreign Tax Credit) methodology
✅ Edge cases (AMT, partial year residence, etc.)
✅ Multi-year vesting schedules

That said, every person's tax situation is unique (deductions, credits, dependents, etc.), so we always recommend having a CPA review your specific case.

Think of TaxBridge as a first-pass estimate to see if moving cross-border makes financial sense, THEN you pay a CPA to optimize the details.

---

## Category 2: Feature Requests

### FR1: "Can you add [country] support?"

**Template:**
Love this idea, [name]! 🌍

Cross-border taxation is a mess everywhere. We've had requests for:
- US ↔ UK
- US ↔ Germany
- US ↔ India
- Canada ↔ UK

Right now we're focused on US-Canada because:
1. It's what I personally needed (H1B → Canada move)
2. ~500K H1B workers + 50K Canadians in US = big audience
3. Tax treaty is well-documented

**Next on roadmap:**
Q2 2026: US-UK (lots of L1 visa holders)
Q3 2026: US-Germany (Blue Card workers)

If you're specifically interested in [country] support, drop your email here and I'll notify you when we launch it!

In the meantime, the principles (FTC, tax treaty rules) are similar across countries. The tool might still be useful for understanding the concepts even if the exact numbers differ.

---

### FR2: "Can you add an API for integration?"

**Template:**
Ooh, interesting idea [name]! 🤔

What's your use case? Are you thinking:
- API for accountants to integrate with their software?
- API for immigration lawyers to estimate tax impact?
- API for HR/recruiting teams (talent relocation planning)?

We don't have a public API yet, but I love the idea. A few folks have asked about:
1. Bulk calculations (run 100+ scenarios)
2. White-label embedding (put calculator on their site)
3. CPA portal (manage multiple clients)

If there's enough demand, we could build this. What would you pay for an API? (Trying to gauge if this is worth prioritizing)

For now, you can export PDFs and use those. But let's chat - email me at michael@taxbridgecpa.com if you want to discuss further!

---

### FR3: "Can you add [specific feature]?"

**Template:**
Great suggestion, [name]! Adding to the roadmap.

Quick question: How would you use this feature? I want to make sure we build it right.

**Current roadmap priorities:**
1. Multi-year optimization (find the best year to move)
2. RRSP vs 401(k) contribution optimizer
3. Dependent/child tax credit calculator
4. AMT (Alternative Minimum Tax) for ISO options
5. Partial-year residence scenarios

Where does your request fit in terms of priority? (P0 = blocker, P1 = high value, P2 = nice-to-have)

Also - if you upgrade to Pro ($49/year), I'll bump your request higher on the list. Not required, but helps us prioritize paying customers first. 😊

Thanks for the feedback!

---

## Category 3: Pricing/Value Questions

### P1: "Why should I pay $49 when it's free?"

**Template:**
Fair question, [name]!

**Free tier gives you:**
✅ Single tax year calculation
✅ Basic FTC estimate
✅ Side-by-side US/Canada comparison

**Pro ($49/year) gives you:**
✅ **Multi-year projections** (see 4 years of vesting schedules)
✅ **PDF export** (share with your accountant/lawyer)
✅ **Unlimited scenarios** (compare different states, provinces, income levels)
✅ **Advanced calculations** (AMT, partial year residence, investment income)
✅ **Priority support** (email response in <24 hours)
✅ **Future features** (RRSP optimizer, dependent calculator, etc.)

**Who should upgrade:**
- Anyone with multi-year RSU vesting (you NEED the 4-year projection)
- Anyone presenting numbers to an accountant (PDF export is clutch)
- Anyone considering multiple scenarios (BC vs Ontario, Seattle vs Toronto, etc.)

**Who can stay free:**
- Just curious about rough numbers
- Simple one-time calculation
- Deciding if cross-border move is worth exploring further

Think of it this way: One accountant consultation costs $1,500-$3,000. Pro is $49 and you can run unlimited scenarios. If it saves you even ONE wrong move, it's 30x ROI.

**Also:** Use code **HUNT20** today for 20% off ($39.20 for the year) 🎉

---

### P2: "Is there a free trial?"

**Template:**
Yes! The free tier is essentially an unlimited trial, [name].

You can use the calculator as many times as you want without paying. No credit card required.

**Free tier includes:**
- Full tax calculation for current year
- FTC estimate
- Side-by-side comparison

**When you hit a limitation** (e.g., trying to see multi-year projections), you'll see an upgrade prompt.

**Pro trial:**
We don't offer a Pro trial because the free tier is already generous. But if you upgrade and don't find it useful, email me within 30 days and I'll refund you 100%. No questions asked.

I stand behind the product - if it doesn't help you make better tax decisions, you shouldn't pay for it.

---

### P3: "Can I get a discount?"

**Template:**
Sure thing, [name]!

**Product Hunt special:** Use code **HUNT20** for 20% off (brings it to $39.20/year)

**Other discounts available:**
- **Student discount:** 50% off with .edu email ($24.50/year)
- **Nonprofit/community:** Free Pro tier for immigration nonprofits helping new immigrants
- **Bulk/team:** 30% off for 5+ licenses (for accounting firms, HR teams)

Which one applies to you?

Also - the way I think about it: If this tool helps you avoid ONE tax filing mistake, it pays for itself 10x over. A friend of mine overpaid $18K in taxes over 2 years because he didn't claim FTC correctly. $49/year is cheap insurance against that.

Let me know if you have any other questions!

---

## Category 4: Success Stories/Praise

### S1: Generic "Great product!"

**Template:**
Thanks so much, [name]! 🙌

Really appreciate the support. Out of curiosity - what's your cross-border tax situation?
- H1B considering moving to Canada?
- Canadian working in US?
- Just exploring options?

Always love hearing how people are using the tool. And if you have any feedback on what could be better, I'm all ears!

Also - if TaxBridge helped you, would love if you could share it with anyone else facing the same tax confusion. The more people who know this exists, the fewer $2K accountant consultations we all have to pay for. 😅

Cheers!

---

### S2: "This saved me $X,000!"

**Template:**
LOVE to hear this, [name]! 🎉

$X,000 in savings is huge. How did you figure that out?
- Was it the FTC calculation showing you're overpaying?
- Or the multi-year projection revealing a better move timeline?
- Or comparing different states/provinces?

I'd love to feature your story (anonymously if you prefer) on our website/blog. It helps other people realize this tool is legit.

Also - if you're willing to share more details, email me at michael@taxbridgecpa.com. Would love to understand your scenario better and make sure the calculator is serving you well.

Congrats on the tax savings! That's real money in your pocket. 💰

---

### S3: "I'm sharing this with my community"

**Template:**
Thank you SO much, [name]! 🙏

Word-of-mouth is how this spreads. Every person who knows about TaxBridge is one less person overpaying taxes due to confusion.

If you want to share, here's a quick summary you can copy/paste:

> "Just found TaxBridge - a free calculator that shows exactly how much tax you'll pay if you move between US and Canada with RSUs/stock options. Saved me from a $2K accountant consultation. Check it out: https://taxbridgecpa.com"

Also - if you're part of a larger community (WhatsApp group, Slack, Discord, etc.) and want to do a demo/Q&A, I'm happy to hop on a call. I've done this for a few H1B groups and people loved it.

Email me if interested: michael@taxbridgecpa.com

Thanks again for spreading the word! 🚀

---

## Category 5: Technical Questions

### T1: "What tech stack did you use?"

**Template:**
Great question, [name]! Happy to share. 🤓

**Frontend:**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn UI components

**Backend:**
- Next.js API routes
- PostgreSQL (production DB)
- Prisma ORM

**Infrastructure:**
- Vercel (hosting + deployment)
- Stripe (payments)
- PostHog (analytics)
- Sentry (error tracking)

**Why these choices:**
- Next.js: Fast, SEO-friendly, great DX
- Postgres: Production-grade, handles complex tax calculations
- Vercel: Zero-config deploys, edge network for speed

The calculator engine itself is pure TypeScript - no external tax API. We built it from scratch using IRS/CRA tax tables.

**Open to open-sourcing the tax calculation engine** if there's interest. The business value is in the UX/conversion funnel, not the math.

---

### T2: "How do you handle [edge case]?"

**Template:**
Good catch, [name]! That's a tricky scenario.

**Current support for [edge case]:**
[Yes, we handle this / Not yet, but on roadmap / Partially supported]

**Details:**
[Explain how it works or what the limitation is]

**Workaround** (if applicable):
[Provide a manual way to account for this]

We're constantly improving the calculator. If this is a blocker for you, email me your specific situation (michael@taxbridgecpa.com) and I'll:
1. Verify if current version handles it
2. If not, prioritize adding support
3. Comp you a Pro account for helping us improve

The goal is to cover 95% of common scenarios. The last 5% of edge cases usually require a CPA anyway (we're not trying to replace them, just give you the info before you pay $2K).

---

### T3: "I found a bug"

**Template:**
Oh no! Thanks for reporting this, [name]. 🐛

Can you share more details?
- What did you enter? (income, RSUs, state, province, etc.)
- What result did you get?
- What did you expect?
- What browser/device are you on?

I'll investigate ASAP and fix if it's a real bug.

If it's a calculation error, I'll:
1. Fix it immediately
2. Notify everyone who used the calculator recently
3. Comp you a year of Pro as a thank-you for catching it

If it's a UI/UX issue, I'll add it to the backlog.

Really appreciate you taking the time to report this. Quality matters and I want to make sure the numbers are right.

---

## Category 6: Criticism/Complaints

### C1: "This is too expensive"

**Template:**
I hear you, [name]. Let me explain the pricing.

**Context:**
- Average cross-border CPA consultation: $1,500-$3,000
- TaxBridge Pro: $49/year (that's $4/month)
- Free tier: $0 (no credit card, unlimited use)

**What you're paying for:**
- Unlimited scenarios (compare 10+ states/provinces)
- Multi-year projections (see 4 years of vesting)
- PDF exports (share with accountant/employer)
- Future features (RRSP optimizer, AMT, etc.)

**Who it's for:**
- Anyone with multi-year RSU vesting (saves 10+ hours of spreadsheet work)
- Anyone who's paid for a CPA consultation (recoup cost in one use)
- Anyone making a $100K+ life decision (cross-border move)

**Who should stay free:**
- Just curious about rough numbers
- One-time simple calculation

If $49/year is still too much, email me your situation. I've given free Pro accounts to students, nonprofit workers, and folks in tough financial spots.

But for most tech workers with stock comp, $49 is less than one Uber Eats order. 🤷

---

### C2: "Why not just use TurboTax/[competitor]?"

**Template:**
Great question, [name]! Here's why they don't work for this use case:

**TurboTax:**
- Only files taxes for ONE country (US or Canada, not both)
- Doesn't show cross-border comparison
- Doesn't handle FTC in planning stage (only during filing)
- Costs $120-$200/year

**Sprintax:**
- Only for students (F-1, J-1 visas)
- Doesn't handle RSUs (only W-2 income)
- No Canada support

**H&R Block:**
- Cross-border filing costs $2,500+
- They don't have a planning tool (only tax prep)
- Can't compare scenarios

**SimpleTax (Wealthsimple):**
- Canada only
- Doesn't show US side
- No FTC calculations

**TaxBridge is different:**
✅ Planning tool (before you move), not filing tool
✅ Shows BOTH countries side-by-side
✅ Handles RSUs/stock options specifically
✅ FTC calculations to see actual tax burden
✅ Multi-year projections for vesting schedules

Use TaxBridge to PLAN your move, then use TurboTax/CPA to FILE your taxes.

---

### C3: "This seems scammy"

**Template:**
I get it, [name]. Tax stuff + online tool = skepticism. Fair. 😅

**Why we're legit:**
1. **Free tier with no credit card** - Try it with zero risk
2. **Founder is public** - I'm Michael Guo, ex-Meta engineer on H1B (LinkedIn: linkedin.com/in/michaelguo)
3. **CPA-reviewed calculations** - Worked with 2 tax specialists to validate
4. **30-day money-back guarantee** - If Pro doesn't help, full refund
5. **Privacy-first** - We don't sell data (unlike TurboTax)

**What we're NOT:**
❌ Not a tax filing service (use a CPA for that)
❌ Not financial advice (we're a calculator, not advisors)
❌ Not a get-rich-quick scheme (we charge $49/year, not $2K)

**What we ARE:**
✅ A planning tool to understand your tax situation BEFORE paying a CPA
✅ Built by an immigrant who needed this and couldn't find it
✅ Transparent about limitations (see FAQ: "When should you hire a CPA?")

If you're skeptical, totally fair - use the free tier and verify the numbers with your own research. If they match, great. If not, let me know and I'll fix it.

I have nothing to hide. Just trying to help people avoid overpaying taxes due to confusion.

---

## Category 7: Integration/Partnership Questions

### I1: "Can we partner/integrate this?"

**Template:**
Absolutely interested, [name]! Tell me more about your use case.

**Who you are:**
- Immigration lawyer helping H1B → Canada moves?
- Accounting firm doing cross-border tax prep?
- HR/recruiting team relocating talent?
- Fintech company building tax tools?

**What you're looking for:**
- White-label calculator for your website?
- API access for bulk calculations?
- Referral partnership (you send clients, we pay commission)?
- Co-marketing opportunity?

**What we've done before:**
- Partnered with 2 immigration lawyers (they refer clients, we give them a dashboard)
- Working with a recruiting firm that relocates engineers to Canada

**Next steps:**
Email me at michael@taxbridgecpa.com with:
1. Your company/org
2. What you want to do
3. What you can offer (traffic, credibility, revenue share, etc.)

I'm open to creative partnerships that help more people understand cross-border tax!

---

## Response Time Priorities

**Answer in this order:**

1. **Bugs/technical issues** - Within 5 min (critical)
2. **Questions about accuracy** - Within 10 min (trust is key)
3. **Feature requests** - Within 15 min (show we listen)
4. **Praise/success stories** - Within 15 min (engagement)
5. **Generic thank yous** - Within 30 min (low priority)

**Always end with:**
- Thank them for engaging
- Ask a follow-up question (keep conversation going)
- Offer help (email, DM, etc.)

---

**Created:** March 19, 2026
**Launch Date:** March 25, 2026
**Status:** Ready for rapid response deployment
