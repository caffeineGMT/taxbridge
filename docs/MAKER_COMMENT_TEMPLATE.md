# Product Hunt Maker Comment Template

**Post this as your FIRST COMMENT immediately after product goes live (within 2 minutes).**

Copy/paste this template and customize the bracketed sections.

---

## Maker Comment (Final Version)

```
Hey Product Hunt! 👋

I'm Michael, and I built TaxBridge after I moved from the US to Canada on a work visa and got hit with a $12,000 tax overpayment on my Meta RSUs because I didn't understand the US-Canada tax treaty.

## The Problem

If you're a tech worker who:
- Worked in the US on H-1B/TN/L-1 visa
- Received RSUs from Meta, Amazon, Google, Microsoft, etc.
- Moved back to Canada (or worked remotely)

You're dealing with BOTH countries taxing the same income. Most people either:
1. Pay an accountant $2,000+ per year
2. Overpay taxes by $5,000-$15,000 because they don't know about Foreign Tax Credits
3. File incorrectly and face penalties

## What TaxBridge Does

✅ **Dual-Country Tax Calculator** - See your exact US federal + state AND Canada federal + provincial tax liability side-by-side

✅ **Foreign Tax Credit Optimizer** - Automatically calculates FTC to eliminate double taxation under Article XV of the US-Canada tax treaty

✅ **RSU Vesting Tracker** - Enter vesting date, FMV, shares, employer (we auto-populate grant details for FAANG companies)

✅ **Required Forms Checklist** - Know exactly which forms to file: W-2, 1040/1040-NR, T1, T4, FBAR, Form 8938, Form 8833

✅ **Multi-Year Dashboard** - Track tax liability across multiple years, see trends, export PDFs

✅ **Real-Time USD/CAD Conversion** - Uses official Bank of Canada rates for accurate reporting

## Who It's For

**Primary**: Tech workers with US RSUs who moved to Canada (~50,000 people annually based on TN/H-1B visa data)

**Secondary**: Tax professionals serving cross-border clients (CPAs, EAs, immigration lawyers partnering with tax advisors)

## Pricing

- **Free**: Basic calculator, single RSU entry, see how it works
- **Pro ($299/year)**: Unlimited RSUs, FTC optimizer, multi-year tracking, PDF exports, priority support
- **Enterprise ($2,000/year)**: API access, client management, white-label reports, dedicated account manager

## Tech Stack

Built with Next.js 15, TypeScript, TailwindCSS, SQLite (better-sqlite3), Stripe, Clerk Auth. Fully deployed on Vercel with Sentry monitoring.

## Example: How Much You Can Save

**Scenario**: 100 Meta shares vest at $450 FMV = $45,000 income

**Without TaxBridge** (or without understanding FTC):
- US Federal: $15,400
- CA State: $5,200
- Canada Federal: $11,300
- BC Provincial: $3,800
- **Total Paid: $35,700** 😱

**With TaxBridge** (proper FTC application):
- US Total: $20,600
- Canada Total: $15,100
- FTC Applied: -$15,100
- **Total Paid: $20,600** ✅

**Savings: $15,100 per year** 💰

## What's Next

I'm working on:
- AI tax advisor (powered by Claude 3.5 Sonnet) for personalized filing strategy
- Integrations with Schwab/E*TRADE for automatic RSU import
- Support for stock options (ISO/NSO), ESPP, and cryptocurrency gains
- Additional corridors: US-UK, US-India, US-Australia

## What I'd Love to Hear From You

- Have you dealt with cross-border taxes? What was your experience?
- What features would make this a must-have tool for you?
- Would you use this vs. paying an accountant? Why or why not?
- Tax professionals: What would you need to recommend this to clients?

I'm here all day to answer questions, get feedback, and help anyone dealing with cross-border tax issues!

Thanks for checking it out! 🙏

---

Michael
https://taxbridge.app
```

---

## Alternative Versions (Choose One)

### Version A: Tech-Focused (For Developer Audience)

```
Hey Product Hunt! 👋

Built TaxBridge to solve a $12K problem I had: overpaying taxes on Meta RSUs after moving to Canada.

**The Stack**:
- Next.js 15 (App Router)
- TypeScript, better-sqlite3
- Stripe, Clerk Auth, Sentry
- TailwindCSS, deployed on Vercel

**What It Does**:
Calculates dual-country taxes (US + Canada), optimizes Foreign Tax Credits under Article XV of the tax treaty, and tells you exactly which forms to file.

**Target Users**: 50K+ tech workers who moved from US to Canada with unvested RSUs (H-1B/TN visa holders).

**Pricing**: Free tier, $299/year Pro (vs $2K for accountant).

**The Problem**:
Both countries tax RSU income. Without FTC, you pay full tax twice. Example:
- 100 shares @ $450 = $45K income
- Without FTC: $35,700 in taxes
- With FTC: $20,600 in taxes
- Savings: $15,100

Most people don't know Article XV exists, so they overpay thousands or hire expensive accountants.

**Roadmap**:
- AI tax advisor (Claude API)
- Schwab/E*TRADE integration
- ISO/NSO support
- More corridors (US-UK, US-India)

Open to feedback on features, tech stack, or positioning. Happy to answer questions!

https://taxbridge.app
```

---

### Version B: Founder Story-Focused (For General Audience)

```
Hey Product Hunt! 👋

I'm Michael, and I just launched TaxBridge after a painful lesson in international taxes.

**My Story**:

2021: Moved from US to Canada with unvested Meta RSUs
2022: Filed my taxes, felt good about it
2023: Accountant tells me I overpaid $12,000
2024: Learned the US-Canada tax treaty inside-out
2025: Built a calculator so you don't make the same mistake
2026: Launching on Product Hunt today!

**The Problem**:

When you move from the US to Canada with stock grants, BOTH countries tax the income when your RSUs vest. Without understanding the tax treaty, you either:
- Overpay $5K-$15K per year (like I did)
- Hire a $2K/year accountant
- File incorrectly and face penalties

**The Solution**:

TaxBridge automates the entire calculation:
- Shows taxes in BOTH countries side-by-side
- Calculates Foreign Tax Credits (Article XV treaty)
- Tells you which forms to file (W-2, 1040, T1, FBAR, etc.)
- Tracks multiple years of vesting events

**Example**:
100 Meta shares @ $450 = $45K income
- Tax without FTC: $35,700
- Tax with FTC: $20,600
- You save: $15,100

**Who This Helps**:
~50,000 tech workers move from US to Canada each year (H-1B/TN visas). Most have RSUs from Meta, Amazon, Google, Microsoft.

**Pricing**:
- Free: Basic calculator
- $299/year: Unlimited RSUs, multi-year tracking, PDF exports
- $2,000/year: Enterprise (for tax professionals with multiple clients)

I'm here all day to answer questions! If you've dealt with cross-border taxes, I'd love to hear your story.

Thanks for the support! 🙏

https://taxbridge.app
```

---

### Version C: Problem-First (For Product Hunt Browsers)

```
Hey Product Hunt! 👋

Quick question: Have you ever moved countries with unvested stock grants?

If so, you probably know the pain of dual taxation.

**Here's what happens**:

When your RSUs vest, TWO countries want to tax that income:
1. The country where you earned them (US)
2. The country where you live (Canada)

Without the tax treaty, you pay FULL tax to both. On a $45K grant, that's $35,700 in taxes.

**The fix: Foreign Tax Credits (FTC)**

Article XV of the US-Canada tax treaty prevents double taxation. But calculating it is complex:
- Different tax brackets in each country
- State vs provincial differences
- Currency conversion
- 7+ different tax forms

Most people either:
- Overpay thousands (don't know FTC exists)
- Hire $2K/year accountants
- File incorrectly

**TaxBridge automates this**:

1. Enter RSU details (date, shares, FMV, employer)
2. See dual-country taxes side-by-side
3. Get exact FTC amount
4. Know which forms to file
5. Export PDF for accountant (or DIY)

**Example savings**:
100 shares @ $450 = $45K income
- Tax without FTC: $35,700
- Tax with FTC: $20,600
- Savings: $15,100 per year

**Who needs this**:
50K+ tech workers move from US to Canada yearly (H-1B/TN visas) with RSUs from Meta, Amazon, Google, Microsoft.

**Pricing**:
Free tier (basic calculator)
$299/year Pro (vs $2K accountant)
$2K/year Enterprise (for tax pros)

I built this after overpaying $12K on my Meta RSUs. Now live at https://taxbridge.app

Questions? I'm here all day! Would love feedback on features, pricing, or positioning.

Thanks! 🙏
```

---

## Posting Tips

### Timing
- Post **within 2 minutes** of product going live
- Product launches at 12:01 AM PST
- Set alarm/reminder

### Formatting
- Use line breaks (double enter between sections)
- Use **bold** for headings
- Use ✅ checkmarks for features
- Use emojis sparingly (👋 at start, 🙏 at end)
- Keep paragraphs short (2-3 sentences max)

### Tone
- **Conversational**, not corporate
- **Authentic**, share real story
- **Helpful**, not sales-y
- **Humble**, ask for feedback
- **Grateful**, thank supporters

### What NOT to Do
- ❌ All caps (LOOKS LIKE SPAM)
- ❌ Too many emojis (🚀🎉💰🔥⭐ = childish)
- ❌ Too long (under 500 words ideal)
- ❌ Too short (under 100 words = low effort)
- ❌ Sales-heavy ("Buy now!", "Limited time!")
- ❌ Defensive about criticism
- ❌ Ignore the "Ask" (ask for specific feedback)

### What TO Do
- ✅ Tell your story (why you built it)
- ✅ Show the problem (relatable pain point)
- ✅ Demonstrate value (concrete example)
- ✅ Ask for feedback (specific questions)
- ✅ Respond to comments (stay engaged)
- ✅ Thank supporters (gratitude matters)

---

## After Posting

### Immediate (First 5 Minutes)
- [ ] Re-read your comment (check for typos)
- [ ] Click "Edit" if you find errors
- [ ] Upvote your own comment (makes it visible)
- [ ] Share product link on Twitter
- [ ] Email close friends to comment/upvote

### First Hour
- [ ] Respond to EVERY comment on your maker comment
- [ ] Answer questions thoroughly
- [ ] Thank people for feedback
- [ ] Engage genuinely (not copy/paste)

### Throughout Day
- [ ] Keep maker comment near top (Product Hunt algorithm promotes engaged comments)
- [ ] Update comment if you make product changes based on feedback
- [ ] Pin important updates as replies to your maker comment

---

## Common First Comments (Be Ready to Respond)

### "Congrats on the launch!"
**Response**:
```
Thank you so much! 🙏 Really appreciate the support.

Have you ever dealt with cross-border taxes yourself? Would love to hear if this would be useful for your situation (or someone you know).
```

### "How is this different from [competitor]?"
**Response**:
```
Great question! [Competitor] is great for [their use case], but TaxBridge is specifically built for US-Canada cross-border RSU taxation.

Key differences:
1. We show BOTH countries' taxes side-by-side
2. We calculate Foreign Tax Credits (Article XV treaty)
3. We're focused on RSU income (not general tax filing)

[Competitor] is more general-purpose, TaxBridge is laser-focused on this specific scenario. Different tools for different needs!

Does that help clarify?
```

### "This seems too expensive"
**Response**:
```
Fair feedback! Here's my thinking:

- Cross-border accountants charge $2K-$5K/year
- Without FTC knowledge, people overpay $5K-$15K
- TaxBridge Pro is $299/year (saves $1,700+ vs accountant)

We also have a Free tier for basic calculations - no credit card required. Great for testing or one-time use.

What would be a fair price point in your mind? Genuinely curious for the feedback!
```

### "Does this work for [other country]?"
**Response**:
```
Currently US-Canada only. I focused on this corridor because:
1. I experienced the problem firsthand
2. Large market (~50K workers/year)
3. Strong tax treaty (Article XV)

[Other country] is on the roadmap! The treaty logic is similar, but each country has unique rules. If you'd use a US-[country] version, let me know - helps me prioritize development.

Thanks for the interest!
```

---

## Good Luck! 🚀

**Remember**:
- Post within 2 minutes of launch
- Be authentic and helpful
- Respond to EVERY comment
- Ask for feedback (people love giving it)
- Stay engaged throughout the day

You've got this! The community will respond to genuine passion and a real problem solved.
