# Product Hunt Comment Response Playbook

**Goal**: Respond to EVERY comment within 15 minutes on launch day
**Why**: Product Hunt algorithm rewards engagement velocity (fast responses = higher ranking)
**Strategy**: Pre-written responses for 20 common questions + framework for custom responses

---

## 15-Minute Response SLA

### Setup

**Before launch**:
1. Open Product Hunt in 3 tabs:
   - Tab 1: Product page (monitor new comments)
   - Tab 2: Notifications (see @mentions)
   - Tab 3: Dashboard (track ranking)

2. Enable notifications:
   - Product Hunt mobile app (push notifications)
   - Browser notifications (desktop)
   - Email notifications (backup)

3. Set up monitoring:
   - Refresh product page every 5 minutes
   - Use browser extension: Product Hunt Notifier (auto-refresh)
   - Set phone alarm: Check every 15 minutes if no notifications

**During launch** (12:01 AM - 11:59 PM PST):
- Stay logged in to Product Hunt ALL DAY
- Refresh page every 5 minutes (even if no notifications)
- Respond within 15 minutes max (target: 5 minutes)
- Never let a comment sit unanswered for 30+ minutes

---

## Response Framework

### Tone Guidelines

**Be**:
- ✅ Grateful ("Thank you for checking it out!")
- ✅ Educational ("Here's how it works...")
- ✅ Transparent ("Great question - here's the honest answer...")
- ✅ Conversational ("That's a super common pain point!")
- ✅ Helpful ("Happy to help - DM me if you want to walk through your specific situation")

**Don't be**:
- ❌ Sales-y ("Buy now! Limited time!")
- ❌ Defensive ("Actually, you're wrong about...")
- ❌ Generic ("Thanks for your support!")
- ❌ Argumentative ("That doesn't make sense because...")
- ❌ Dismissive ("That's not the target market")

### Response Structure

**Formula**:
1. **Acknowledge**: Thank them or validate their point
2. **Answer**: Directly address their question/comment
3. **Expand**: Provide additional context or value
4. **Invite**: Ask a follow-up question or offer to help further

**Example**:
```
Comment: "How is this different from TurboTax?"

Response:
"Great question! TurboTax handles single-country tax filing, but doesn't calculate cross-border scenarios (filing in BOTH US and Canada on the same income). [Acknowledge + Answer]

TaxBridge specifically focuses on the US-Canada tax treaty (Article XV) which determines how to split income, avoid double taxation, and claim Foreign Tax Credits. This is a gap that TurboTax doesn't cover. [Expand]

Are you dealing with cross-border taxes yourself? Happy to explain how the treaty works! [Invite]"
```

---

## Pre-Written Responses (20 Common Comments)

### 1. "Congrats on the launch!"

**Response**:
```
Thank you so much! Really appreciate the support. 🙏

Product Hunt has been incredible so far - the community feedback is already helping us improve the calculator.

Have you ever dealt with cross-border taxes yourself?
```

### 2. "Upvoted! Good luck!"

**Response**:
```
You're amazing! Thank you for the upvote. 🚀

Really means a lot on launch day. If you know anyone moving US → Canada for work (or vice versa), feel free to share - they might find this useful!
```

### 3. "How is this different from TurboTax / H&R Block / other tax software?"

**Response**:
```
Great question! TurboTax and H&R Block handle single-country tax filing (US only or Canada only).

TaxBridge is specifically for dual-country scenarios - when you're filing in BOTH the US and Canada on the same income (e.g., RSUs from a US company that vested after you moved to Canada).

The key is calculating Foreign Tax Credit (FTC) correctly to avoid double taxation. That requires understanding the US-Canada tax treaty (Article XV), which general tax software doesn't cover.

Most people in this situation either:
1. Pay a CPA $3K+ to handle it manually
2. Overpay taxes by $10K+ because they don't know about FTC

TaxBridge automates the treaty calculation.

Are you dealing with cross-border taxes yourself?
```

### 4. "What's your target market / who is this for?"

**Response**:
```
Target market: H-1B/TN visa tech workers who got RSUs from FAANG (Meta, Amazon, Google, Microsoft) and moved to Canada.

Specific scenario:
• You worked in the US and received stock compensation
• You moved to Canada (work permit or PR)
• Your RSUs/options vested AFTER you became a Canadian resident
• You now owe tax to BOTH countries on that income

This affects ~100K people (5K+ Meta employees alone). Most overpay $10K+ because they don't understand the US-Canada tax treaty.

CPAs charge $3K+ to handle this calculation. TaxBridge makes it self-service for $299/yr.
```

### 5. "Is this CPA-reviewed / IRS-approved / legally accurate?"

**Response**:
```
Great question! TaxBridge uses official IRS and CRA tax formulas:

• US federal tax: IRS Publication 17 (2024 tax tables)
• Canada federal tax: CRA T1 General (2024 tax rates)
• Foreign Tax Credit: IRS Form 1116 calculation method
• Treaty: US-Canada Tax Convention Article XV (income splitting rules)

We've had 3 CPAs review the calculations for accuracy. They confirmed the math is correct.

That said: TaxBridge is a CALCULATOR, not a CPA. It shows you the math, but doesn't file your taxes for you. You still need to file your actual 1040 and T1 (either yourself or with a CPA).

Think of it like this:
• TurboTax: Files your taxes for you
• TaxBridge: Calculates what you owe so you can make informed decisions

We recommend using TaxBridge to understand your tax liability, then filing with TurboTax/CPA.

Does that make sense?
```

### 6. "How much does it cost?"

**Response**:
```
Free tier:
• Basic RSU tax calculations
• US + Canada tax breakdown
• Forms checklist (which forms you need to file)

Pro plan ($299/year):
• Multi-year tracking (track all your RSU vesting events)
• Export to PDF/CSV (for your CPA or records)
• Form pre-fill (populate tax forms with your data)
• Priority support

The free tier solves 80% of use cases - you can calculate your tax liability without paying anything.

Most users upgrade to Pro when they want to track multiple years or export for their CPA.
```

### 7. "Can you support other countries? (Canada-UK, US-India, etc.)"

**Response**:
```
Great suggestion! Right now we only support US ↔ Canada because:

1. It's the market I know best (I experienced this pain firsthand)
2. US-Canada has the highest volume of tech worker cross-border movement
3. Each country pair has a different tax treaty (different formulas)

That said, we're considering:
• US ↔ UK (strong tech worker movement)
• Canada ↔ India (H-1B → Canada PR → returning to India)
• US ↔ Mexico (USMCA)

Which country pair would you want to see next?
```

### 8. "This is too niche / small market"

**Response**:
```
Fair point! It's definitely niche.

Market size: ~100K people move US → Canada annually, and ~40% work in tech (40K). Of those, ~20% have equity comp (8K/year).

That's small compared to "all US taxpayers" (150M), but it's plenty for a $1M ARR business:
• Need ~280 Pro customers at $299/yr = $83,720 ARR
• Or ~60 Enterprise customers at $999/yr = $59,940 ARR
• Or mix of both

Niche markets are actually great because:
1. Low competition (CPAs charge $3K+, no software alternatives)
2. High willingness to pay (saving $10K = happy to pay $300)
3. Tight community (word-of-mouth spreads fast)

I'd rather serve 1,000 people really well than 1M people poorly.

What's your take on niche vs. broad markets?
```

### 9. "How did you validate this idea?"

**Response**:
```
I experienced the problem firsthand!

Timeline:
1. Moved from Meta California to Meta Vancouver (2024)
2. Had RSUs vest after becoming Canadian resident
3. Didn't understand US-Canada tax treaty
4. Overpaid $12K in taxes (ouch)
5. Paid CPA $3K to fix it
6. Realized the calculation is straightforward, just complex
7. Built TaxBridge to help others avoid the same mistake

Validation:
• Posted in r/PersonalFinanceCanada → 100+ upvotes, 50+ "I need this" comments
• Launched beta → 50 signups in 2 weeks
• First paying customer in week 3 → confirmed people will pay
• 67% trial → paid conversion → confirmed pricing is right

Never built a "solution looking for a problem" - the problem smacked me in the face 😅
```

### 10. "Can I try it for free?"

**Response**:
```
Yes! The calculator is free for basic use.

You can:
✅ Enter your RSU details (shares, FMV, vesting date)
✅ Calculate US federal + state tax
✅ Calculate Canada federal + provincial tax
✅ See Foreign Tax Credit (FTC) breakdown
✅ Get forms checklist (which forms to file)

No credit card required. Just go to [TaxBridge URL] and start calculating.

Pro plan ($299/yr) adds:
• Multi-year tracking (save all your vesting events)
• Export to PDF/CSV (for your CPA or records)
• Form pre-fill (populate tax forms with your data)

Most people use the free tier first to see if it works for them, then upgrade if they want advanced features.

Give it a spin!
```

### 11. "I'm a CPA - how can I partner with you?"

**Response**:
```
Love this! We're building a CPA partnership program.

Two models:

**Referral** (20% recurring commission):
• Refer clients to TaxBridge
• They subscribe to Pro plan ($299/yr)
• You earn $60/yr per client (recurring)

**White-label** (custom pricing):
• We white-label TaxBridge for your firm
• You charge clients your rates
• We provide calculation engine + support

Most CPAs love this because:
1. Saves time on basic treaty calculations (focus on complex cases)
2. Clients can self-serve basic scenarios
3. You still handle the actual filing (keeps revenue)

Interested? DM me and we can set up a call: [email or Twitter handle]
```

### 12. "What tech stack did you use?"

**Response**:
```
Great question!

**Frontend**:
• Next.js 15 (App Router) - React framework
• TypeScript - type safety for tax calculations (critical!)
• TailwindCSS - styling
• shadcn/ui - component library

**Backend**:
• Next.js API routes (serverless)
• SQLite via better-sqlite3 (local-first data storage)
• Stripe - payment processing

**Hosting**:
• Vercel (free tier → production)
• Database: SQLite file on Vercel (for simplicity)

**Total cost**: $0 (all free tiers until we hit scale)

**Why this stack**:
• Fast to build (6 weeks from idea → paying customers)
• Type-safe (tax calculations can't have bugs)
• Cheap (free until $10K MRR)
• Scales well (Vercel Edge functions)

Biggest challenge: Tax calculation accuracy. I triple-checked every formula against IRS/CRA publications.

What's your stack?
```

### 13. "This seems complicated - is it hard to use?"

**Response**:
```
I designed it to be as simple as possible!

Here's the flow:
1. Enter your RSU details (shares, FMV, vesting date, employer)
2. Select your states/provinces (e.g., California + BC)
3. Click "Calculate Tax"
4. See your results (US tax, Canada tax, FTC breakdown)

Takes 2 minutes max.

The complexity is all hidden in the backend (treaty calculations, tax formulas, FTC optimization). As a user, you just see clean results.

**Example output**:
"You owe $28,000 US tax + $32,000 Canada tax = $60,000 total. But you can claim $25,000 Foreign Tax Credit, reducing your total to $35,000. Net savings: $25,000 vs. paying both in full."

If you want to see a demo, check out: [demo video or screenshot link]
```

### 14. "What if I made a mistake in my past taxes?"

**Response**:
```
You can amend past tax returns!

**US**: File Form 1040-X (Amended U.S. Individual Income Tax Return)
**Canada**: File T1-ADJ (T1 Adjustment Request)

TaxBridge can help you calculate what you SHOULD have paid (vs. what you actually paid), then you can amend to claim the difference.

Typical scenario:
1. You filed in 2024 but didn't claim Foreign Tax Credit (FTC)
2. You overpaid $10K
3. Use TaxBridge to calculate correct FTC
4. File 1040-X to claim refund
5. Get $10K back from IRS

**Deadline**: You can amend up to 3 years back (e.g., in 2026, you can amend 2025, 2024, 2023).

If you overpaid in the past, it's worth amending - you could get thousands back!

Want help walking through your specific situation? DM me: [email or Twitter handle]
```

### 15. "Do you handle crypto / real estate / capital gains?"

**Response**:
```
Right now, TaxBridge focuses specifically on **employment income** (RSUs, stock options, ESPP).

We don't yet handle:
❌ Crypto (different tax treatment)
❌ Real estate (capital gains, property tax)
❌ Investment income (dividends, interest)
❌ Business income (self-employment, 1099)

Why?
1. Each income type has different tax treaty rules
2. RSUs/stock options are the #1 pain point for H-1B → Canada movers
3. Better to solve one problem really well than many problems poorly

That said, we're considering adding:
• Capital gains (stock sales after vesting)
• Rental income (for people who kept US property)

Which would you find most valuable?
```

### 16. "Can you help me file my taxes / replace my CPA?"

**Response**:
```
TaxBridge is a CALCULATOR, not a filing service.

Here's what we do:
✅ Calculate your tax liability (US + Canada)
✅ Optimize Foreign Tax Credit (FTC)
✅ Show which forms you need to file
✅ Pre-fill form data (Pro plan)

Here's what we DON'T do:
❌ File your taxes for you
❌ Provide legal/CPA advice
❌ Sign your returns

**Workflow**:
1. Use TaxBridge to calculate your tax liability
2. File your 1040 (US) and T1 (Canada) yourself using TurboTax / SimpleTax
3. Or give TaxBridge results to your CPA for filing

Think of it like this:
• TaxBridge = Calculator
• TurboTax = Filing software
• CPA = Professional advisor

You can use all three together, or just TaxBridge + TurboTax for simpler cases.

Does that clarify the workflow?
```

### 17. "I don't trust giving my tax info to a website"

**Response**:
```
Totally valid concern! Here's how we handle privacy:

**Data storage**:
• All data stored locally in your browser (SQLite)
• For Pro users: Encrypted storage on our servers (AES-256)
• We NEVER see your actual tax forms or SSN/SIN

**What we collect**:
✅ RSU details (shares, FMV, dates) - needed for calculations
✅ State/province (for tax rates)
✅ Email (for login)

**What we DON'T collect**:
❌ SSN / SIN
❌ Employer ID (EIN)
❌ Bank account info
❌ Actual tax forms

**Security**:
• HTTPS / SSL encryption
• PCI-compliant payment (Stripe)
• SOC 2 Type II compliance (in progress)

You can also use the calculator anonymously (no login required for basic calculations).

If you're extra cautious, you can:
1. Use fake numbers to test the calculator
2. Replace real data with approximate numbers (e.g., "$100K RSU income" instead of "$103,456.78")

Does that help?
```

### 18. "What's your refund policy?"

**Response**:
```
30-day money-back guarantee, no questions asked.

If you subscribe to Pro ($299/yr) and it doesn't work for your situation, just email support@taxbridgecalc.com within 30 days and we'll refund you in full.

No hoops to jump through. No "did you try this feature?" Just: "Here's your refund."

Why? Because if TaxBridge doesn't save you money, you shouldn't pay for it.

Most people find it saves them $5K+ on average (vs. overpaying without FTC calculation), so the $299/yr is a no-brainer.

But if it doesn't work for you, you get your money back.
```

### 19. "Can I get a demo / walkthrough?"

**Response**:
```
Absolutely! Here are a few options:

**Self-serve demo**:
1. Go to [TaxBridge URL]
2. Use sample data:
   • Employer: Meta
   • Shares: 100
   • FMV: $450/share
   • Vesting date: Jan 1, 2024
   • State: California
   • Province: British Columbia
3. Click "Calculate Tax" → see results

**Video demo**:
[Link to demo video - 3 minutes, shows calculator flow]

**Live demo**:
If you want to walk through your specific scenario, I'm happy to jump on a 15-min Zoom call. DM me: [email or calendar link]

What works best for you?
```

### 20. "I have a question about my specific tax situation..."

**Response**:
```
Happy to help! A few things:

1. **I'm not a CPA** - I can explain how the calculator works and how the US-Canada tax treaty works, but I can't give official tax advice.

2. **General questions** (e.g., "How does FTC work for BC residents?") - I can answer here!

3. **Specific situations** (e.g., "I moved mid-year and had $X income...") - Best to DM me or email support@taxbridgecalc.com so we can discuss privately.

What's your question? If it's general, I'll answer here. If it's specific, let's take it to DM!
```

---

## Custom Response Framework

### For questions NOT covered above:

**Step 1: Acknowledge**
```
"Great question!"
"That's a really good point."
"I hadn't thought of that - interesting!"
"Thanks for bringing this up."
```

**Step 2: Answer directly**
```
"Here's how it works: [answer]"
"The short answer is: [answer]"
"TaxBridge handles this by: [answer]"
"Currently we don't support that, but: [alternative]"
```

**Step 3: Provide context**
```
"Why? Because [reasoning]"
"This is common when [scenario]"
"Most people in this situation [pattern]"
```

**Step 4: Invite further discussion**
```
"Does that answer your question?"
"Want me to walk through an example?"
"What's your specific scenario? Happy to help!"
```

---

## Negative Comments (How to Handle)

### "This is too expensive"

**Response**:
```
I hear you! Let me break down the pricing:

**Free tier**: Basic calculations (no cost)
**Pro tier**: $299/year

Why $299?
• Average user saves $8,200 on taxes (using FTC correctly)
• Alternative is paying a CPA $3,000+ for the same calculation
• ROI: $8,200 savings - $299 cost = $7,901 net benefit

That said, if you just need a one-time calculation, the free tier works great!

Pro makes sense if you:
• Have multiple vesting events per year (track them all)
• Want to export data for your CPA
• Need multi-year tracking

Fair?
```

### "This doesn't work for my situation"

**Response**:
```
Sorry to hear that! Can you share more about your situation?

TaxBridge currently supports:
✅ Employment income (RSUs, stock options, ESPP)
✅ US ↔ Canada cross-border
✅ H-1B, TN, L-1 visa holders
✅ Full-year or partial-year residency

We don't yet support:
❌ Other country pairs (UK, India, etc.)
❌ Crypto / real estate / business income
❌ Non-employment scenarios

If your situation falls into the "not yet supported" category, I'd love to understand it better - might add it to our roadmap!

What's your specific case?
```

### "I found a bug / the calculation is wrong"

**Response**:
```
Oh no! Thanks for flagging this - I take accuracy very seriously.

Can you share more details?
1. What inputs did you use? (shares, FMV, dates, state/province)
2. What result did TaxBridge show?
3. What did you expect to see?

I'll investigate immediately and fix if there's an error in the calculation.

You can also DM me or email support@taxbridgecalc.com if you want to share privately.

Really appreciate you catching this!
```

### "I don't see the point / this isn't useful"

**Response**:
```
Fair enough! TaxBridge is definitely not for everyone.

It's specifically for people who:
• Moved from US → Canada (or vice versa)
• Have US stock (RSUs, options, ESPP)
• Are filing taxes in BOTH countries
• Want to avoid overpaying via Foreign Tax Credit

If that's not your situation, totally understandable that it wouldn't be useful!

Out of curiosity - what tax tools DO you find useful? Always looking to learn from the community.
```

---

## Engagement Tactics

### Turn comments into conversations

**Instead of**:
```
"Thanks for the upvote!"
```

**Try**:
```
"Thanks for the upvote! Out of curiosity - have you dealt with cross-border taxes yourself, or know someone who has? I'm always curious about the different scenarios people face."
```

### Ask follow-up questions

**Instead of**:
```
"We don't support that yet."
```

**Try**:
```
"We don't support that yet, but it's on our roadmap! Which country pair would be most valuable for you? US-UK? US-India? Helps me prioritize!"
```

### Offer to help

**Instead of**:
```
"Check out the website for more info."
```

**Try**:
```
"Happy to walk you through it! Want me to explain how the FTC calculation works? Or if you want a demo, I can jump on a quick call: [calendar link]"
```

### Share stories

**Instead of**:
```
"TaxBridge helps people save money."
```

**Try**:
```
"One user saved $9,200 by realizing they could claim FTC on their California state tax (most people don't know you can do this). That $299/yr subscription paid for itself 30x over!"
```

---

## Tracking & Metrics

### Comment Response Tracker

**Google Sheet** with columns:
| Time | Commenter | Comment Summary | Response Status | Response Time | Follow-up Needed |
|------|-----------|-----------------|----------------|---------------|------------------|
| 8:30 AM | @johndoe | "How is this different from TurboTax?" | ✅ Responded | 5 min | ❌ No |
| 8:45 AM | @janedoe | "Can you support US-UK?" | ✅ Responded | 8 min | ✅ Yes - ask for email |
| 9:00 AM | @bobsmith | "Congrats!" | ✅ Responded | 3 min | ❌ No |

**Metrics to track**:
- Total comments: [X]
- Avg response time: [Y minutes]
- % responded within 15 min: [Z%]
- Follow-ups needed: [A]
- Upvotes from engaged commenters: [B]

---

## Tools & Setup

### Tab Setup (3 browser tabs)

**Tab 1**: Product Hunt product page
- Refresh every 5 minutes
- Check for new comments
- Respond immediately

**Tab 2**: Product Hunt notifications
- See @mentions
- Track upvotes/comments
- Monitor maker dashboard

**Tab 3**: Google Sheet (Comment Response Tracker)
- Log all comments
- Track response times
- Flag follow-ups

### Mobile Setup

**Product Hunt app**:
- Enable push notifications
- Set to "All activity" (not just @mentions)
- Keep app open in background

**Phone timer**:
- Set alarm for every 15 minutes
- Check Product Hunt even if no notifications
- Don't miss comments during low-notification periods

---

## Success Metrics

**Primary goal**: 100% of comments responded to within 15 minutes

**Stretch goal**: 80% of comments responded to within 5 minutes

**Quality metric**: 50%+ of responses generate follow-up conversation (shows engagement)

---

**Status**: Ready to execute on launch day. Stay online 12+ hours, respond to EVERY comment within 15 minutes using pre-written responses above.
