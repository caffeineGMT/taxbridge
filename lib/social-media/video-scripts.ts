// Instagram Reels / TikTok Video Script Library for TaxBridge
// 60-second face-to-camera tax explainer format

export interface VideoScript {
  id: string;
  title: string;
  category: 'tax-basics' | 'rsu-deep-dive' | 'common-mistakes' | 'immigration-tax' | 'canada-specific' | 'quick-tips' | 'myth-busters' | 'seasonal';
  hook: string; // First 3 seconds - must stop the scroll
  body: string; // Main content (45 seconds)
  cta: string; // Call to action (last 10 seconds)
  captions: string[];
  hashtags: string[];
  targetAudience: string[];
  estimatedDuration: number; // seconds
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  props?: string[]; // Visual props or on-screen text suggestions
  bRollSuggestions?: string[];
  weekBestPosted?: number; // 1-52, best week to post (seasonal relevance)
}

export const VIDEO_SCRIPTS: VideoScript[] = [
  // === TAX BASICS ===
  {
    id: 'ftc-explained',
    title: 'What is Foreign Tax Credit?',
    category: 'tax-basics',
    hook: "You're paying taxes in TWO countries but you don't have to pay double. Here's the secret.",
    body: `The Foreign Tax Credit is your best friend if you work cross-border.

Here's how it works in plain English:

Say you earned $200K working in the US on an H-1B visa, and you paid $50K in US federal taxes.

Now Canada says "hey, you owe us taxes too" because you're still a Canadian resident.

Without the FTC, you'd pay taxes TWICE on the same income. That could cost you $30-40K extra.

But with Form 1116 in the US or Form T2209 in Canada, you get a CREDIT for taxes already paid to the other country.

So if Canada says you owe $60K but you already paid $50K to the US, you only pay $10K more to Canada.

The key is filing correctly in BOTH countries and claiming the credit properly. Most people mess this up and either overpay or miss the credit entirely.`,
    cta: "I built a free calculator that figures out your exact FTC amount in 10 minutes. Link in bio. It's saved people an average of $12K.",
    captions: [
      "Foreign Tax Credit explained in 60 seconds",
      "Stop paying taxes twice on the same income",
      "The #1 tax credit cross-border workers miss"
    ],
    hashtags: ['#H1Bvisa', '#TaxSavings', '#ForeignTaxCredit', '#Canada', '#Immigration', '#TechWorkers', '#CrossBorderTax', '#TaxTips', '#RSU', '#ExpatTax'],
    targetAudience: ['H-1B workers', 'TN visa holders', 'Canadian expats in US'],
    estimatedDuration: 60,
    difficulty: 'beginner',
    props: ['Whiteboard showing dual-country tax calculation', 'On-screen: "$50K paid to US → credit in Canada"'],
    bRollSuggestions: ['US and Canadian flags', 'Calculator app screenshot', 'IRS Form 1116 close-up'],
  },
  {
    id: 'h1b-rsu-taxation',
    title: 'H-1B RSU Taxation Explained',
    category: 'rsu-deep-dive',
    hook: "Your company gave you $100K in RSUs. Here's how much you ACTUALLY keep after taxes — and it's less than you think.",
    body: `RSUs on an H-1B visa are a tax nightmare if you don't understand the rules.

When your RSUs vest, that's INCOME. Not when you sell — when they VEST. Your company withholds about 22% for federal tax, but your actual bracket might be 32% or even 37%.

That means you could owe $10-15K MORE at tax time that you weren't expecting.

But here's where it gets really complicated: if you move to Canada, the RSUs that vested while you were in the US are taxed by the US. RSUs that vest after you move are taxed by Canada. And RSUs that were GRANTED in the US but VEST in Canada? Both countries want a piece.

The US-Canada tax treaty helps, but you need to allocate correctly based on days worked in each country during the vesting period.

Get this wrong and you're either double-taxed or you're accidentally committing tax fraud by not reporting in one country.`,
    cta: "Our RSU tax calculator handles all of this automatically. It splits your RSUs by country, calculates withholding gaps, and shows exactly what you owe. Free tool, link in bio.",
    captions: [
      "H-1B + RSUs = tax complexity you need to understand",
      "Your RSU tax bill is higher than you think",
      "How RSUs get taxed when you move from US to Canada"
    ],
    hashtags: ['#H1Bvisa', '#RSU', '#StockCompensation', '#TaxSavings', '#TechWorkers', '#BigTech', '#FAANG', '#Canada', '#Immigration', '#RestrictedStockUnits'],
    targetAudience: ['H-1B workers with RSUs', 'Tech workers at FAANG'],
    estimatedDuration: 60,
    difficulty: 'intermediate',
    props: ['On-screen vesting schedule graphic', 'Split-screen US vs Canada tax rates'],
    bRollSuggestions: ['Stock ticker', 'Vesting schedule screenshot', 'Pay stub close-up'],
  },
  {
    id: 'common-mistakes-dual-filing',
    title: 'Common Mistakes Filing Dual Taxes',
    category: 'common-mistakes',
    hook: "I've seen people lose $15,000 because of these 3 mistakes when filing US-Canada taxes. Don't be one of them.",
    body: `Mistake number 1: Not filing in both countries.

If you're a Canadian citizen working in the US, Canada still wants to know about your worldwide income. Even if you don't owe anything, you MUST file. Skip it and you lose RRSP room, child benefits, and get penalties.

Mistake number 2: Using the wrong exchange rate.

The CRA wants you to use the Bank of Canada annual average rate, NOT the spot rate on the day you earned the money. Using the wrong rate can swing your income by thousands of dollars.

Mistake number 3: Double-counting income.

Your US W-2 income goes on your Canadian T1 return, but you need to convert it correctly and claim the Foreign Tax Credit. Many people either skip reporting it (illegal) or report it without the credit (expensive).

Each of these mistakes costs thousands. Combined, I've seen people overpay by $12,000 or more.`,
    cta: "Our calculator handles the exchange rates, dual filing, and credits automatically. Stop overpaying — link in bio for the free RSU tax calculator.",
    captions: [
      "3 tax mistakes that cost cross-border workers $15K",
      "Are you making these dual-filing errors?",
      "Stop losing money on US-Canada tax mistakes"
    ],
    hashtags: ['#TaxMistakes', '#H1Bvisa', '#TaxSavings', '#Canada', '#Immigration', '#TechWorkers', '#CrossBorderTax', '#TaxTips', '#CRA', '#IRS'],
    targetAudience: ['H-1B workers', 'TN visa holders', 'Recent US to Canada movers'],
    estimatedDuration: 60,
    difficulty: 'beginner',
    props: ['Red X marks for each mistake', 'On-screen dollar amounts lost'],
    bRollSuggestions: ['Tax forms close-up', 'Calculator showing wrong vs right amounts', 'Bank of Canada rate screenshot'],
  },
  {
    id: 'tn-visa-tax-traps',
    title: 'TN Visa Tax Traps Nobody Warns You About',
    category: 'immigration-tax',
    hook: "On a TN visa? You might be a tax resident of BOTH countries right now and not even know it.",
    body: `TN visa holders have a unique problem: you're Canadian working in the US, and both countries might consider you a tax resident.

The US uses the Substantial Presence Test. If you've been in the US for 183 days or more, you're a US tax resident. Period.

But Canada uses a different test — ties to Canada. If you kept your apartment, bank accounts, or your spouse is still in Canada, the CRA says you're STILL a Canadian resident.

So now you're a dual resident. Both countries want full taxes on your worldwide income.

The treaty tie-breaker rules can help — they look at where your "center of vital interests" is. But you have to actively claim treaty benefits. It's not automatic.

And here's the kicker: if you don't file the right forms — Form 8833 in the US to claim treaty benefits — the IRS treats you as a full US tax resident and ignores the treaty entirely.`,
    cta: "Confused about your tax residency status? Our free calculator determines your residency and calculates taxes for both countries. Link in bio.",
    captions: [
      "TN visa holders: are you a dual tax resident?",
      "The tax trap that catches Canadian TN workers",
      "Why both countries think you owe them taxes"
    ],
    hashtags: ['#TNvisa', '#TaxSavings', '#Canada', '#Immigration', '#TechWorkers', '#CrossBorderTax', '#DualResident', '#NAFTA', '#CUSMA', '#TaxTips'],
    targetAudience: ['TN visa holders', 'Canadians working in US tech'],
    estimatedDuration: 60,
    difficulty: 'intermediate',
    props: ['Split screen: US flag vs Canada flag with "RESIDENT" stamped on both', 'Form 8833 close-up'],
    bRollSuggestions: ['Border crossing', 'Canadian passport', 'IRS and CRA logos side by side'],
  },
  {
    id: 'rsu-vesting-move',
    title: 'RSUs Vesting After You Move to Canada',
    category: 'rsu-deep-dive',
    hook: "You moved from the US to Canada and your RSUs are still vesting. Here's the tax bomb nobody told you about.",
    body: `When you leave the US for Canada, your RSUs don't stop vesting. But the tax treatment changes completely.

Let's say you got a 4-year RSU grant while working in the US. After 2 years, you move to Canada. The remaining RSUs vest in Canada.

Here's what happens: Canada taxes the FULL value when they vest as employment income. But the US also wants to tax the portion earned while you were working there.

So if an RSU vests at $10,000 and you worked 2 years in the US and 2 years in Canada, the US says "$5,000 of that is ours" based on the allocation of days worked.

You file a 1040-NR in the US for that $5,000 and claim a Foreign Tax Credit in Canada for the US tax paid.

But most people either let their US employer withhold the full 22% on everything (overpaying the US), or they don't file in the US at all (underpaying).

Both cost you real money.`,
    cta: "Our RSU calculator does the US-Canada allocation automatically using the days-worked method. See exactly what each country gets. Link in bio.",
    captions: [
      "Moving to Canada with unvested RSUs? Watch this first",
      "The RSU tax bomb when you cross the border",
      "How to split RSU taxes between US and Canada"
    ],
    hashtags: ['#RSU', '#H1Bvisa', '#TaxSavings', '#Canada', '#TechWorkers', '#StockCompensation', '#CrossBorderTax', '#FAANG', '#Immigration', '#TaxPlanning'],
    targetAudience: ['Tech workers moving to Canada', 'H-1B workers planning Canada move'],
    estimatedDuration: 60,
    difficulty: 'advanced',
    props: ['Timeline graphic showing grant → US work → move → vest', 'Pie chart: US vs Canada tax allocation'],
    bRollSuggestions: ['Moving boxes', 'Airport departure board', 'Vesting schedule'],
  },
  {
    id: 'rrsp-401k-trap',
    title: 'RRSP vs 401K: The Cross-Border Trap',
    category: 'canada-specific',
    hook: "You moved to Canada with a 401K and someone told you to roll it into an RRSP. That could be a $20,000 mistake.",
    body: `The 401K to RRSP question is one of the most expensive decisions cross-border workers make.

Here's the deal: the US-Canada tax treaty lets you keep your 401K growing tax-free even after you move to Canada. Canada recognizes it.

But if you WITHDRAW from your 401K while living in Canada, the US withhololds 30% right off the top. Then Canada also wants to tax it as income.

You get a Foreign Tax Credit, but the timing and rates rarely match up perfectly. You almost always lose money in the conversion.

Rolling into an RRSP sounds logical, but it's actually a TAXABLE EVENT in the US. The IRS treats it as a distribution. So you pay US tax on the withdrawal, THEN put it in your RRSP.

The best move for most people? Leave the 401K in the US. Let it grow. Don't touch it until you really need it or until you can strategically withdraw in a low-income year.

There are exceptions — like if you have a small balance or specific circumstances. But the default advice of "just roll it over" is usually wrong.`,
    cta: "Not sure what to do with your 401K after moving? Our calculator models both scenarios so you can see the actual dollar difference. Link in bio.",
    captions: [
      "Don't roll your 401K into an RRSP without watching this",
      "The $20K mistake cross-border workers make with retirement accounts",
      "401K in Canada: keep it or move it?"
    ],
    hashtags: ['#401K', '#RRSP', '#TaxSavings', '#Canada', '#Immigration', '#TechWorkers', '#RetirementPlanning', '#CrossBorderTax', '#FinancialPlanning', '#ExpatFinance'],
    targetAudience: ['US to Canada movers', 'Tech workers with 401K'],
    estimatedDuration: 60,
    difficulty: 'intermediate',
    props: ['Side by side: 401K vs RRSP comparison chart', 'On-screen: "30% US withholding" in red'],
    bRollSuggestions: ['Retirement account statements', 'US/Canada bank logos', 'Calculator comparison'],
  },
  {
    id: 'departure-tax-canada',
    title: 'Canada Departure Tax: The Exit Fee Nobody Expects',
    category: 'canada-specific',
    hook: "Leaving Canada? The government has a going-away gift for you: a tax bill on assets you haven't even sold yet.",
    body: `Canada has what's called a "deemed disposition" rule. When you leave Canada and become a non-resident, the CRA pretends you sold ALL your assets on the day you left.

Your stocks, crypto, investment properties — everything gets a deemed sale at fair market value.

So if you bought $50K in stocks that are now worth $150K, Canada says you just realized a $100K capital gain. At a 50% inclusion rate and a marginal rate of 45%, that's roughly $22,500 in tax — on stocks you STILL OWN.

This catches people completely off guard, especially tech workers with large stock portfolios who move to the US for work.

There are some exceptions: RRSPs and TFSAs are excluded, and your principal residence is usually exempt. But RSUs, stock options, and investment accounts are all fair game.

You can also post security instead of paying immediately, which defers the tax until you actually sell. But you need to file Form T1161 and potentially T1243.

The key is planning BEFORE you leave, not after.`,
    cta: "Planning to leave Canada? Our calculator estimates your departure tax and helps you plan the move. Free tool — link in bio.",
    captions: [
      "Canada's exit tax will shock you",
      "The hidden cost of leaving Canada as a tech worker",
      "Deemed disposition: paying tax on stocks you haven't sold"
    ],
    hashtags: ['#Canada', '#DepartureTax', '#TaxSavings', '#Immigration', '#TechWorkers', '#CapitalGains', '#ExpatTax', '#CrossBorderTax', '#CRA', '#TaxPlanning'],
    targetAudience: ['Canadians moving to US', 'Tech workers relocating'],
    estimatedDuration: 60,
    difficulty: 'advanced',
    props: ['On-screen: deemed disposition calculation breakdown', 'Calendar with "departure date" circled'],
    bRollSuggestions: ['Packing/moving scenes', 'Stock portfolio screenshot', 'Airport scenes'],
  },
  {
    id: 'tfsa-us-tax',
    title: 'Your TFSA is NOT Tax-Free in the US',
    category: 'common-mistakes',
    hook: "Your TFSA is tax-free in Canada. But if you move to the US, the IRS is going to tax every single dollar of gains.",
    body: `The Tax-Free Savings Account is amazing in Canada. Contributions grow tax-free, withdrawals are tax-free, it's perfect.

But the US doesn't recognize the TFSA as a tax-sheltered account. To the IRS, your TFSA is just a regular foreign trust.

That means ALL gains, dividends, and interest in your TFSA are taxable income in the US. Every year. Even if you don't withdraw.

And it gets worse: because it's classified as a foreign trust, you need to file Form 3520-A every year. Miss this form and the penalty is $10,000 PER YEAR or 35% of the account value.

So what should you do? Most cross-border tax experts say: empty your TFSA before you move to the US. Take the money out (tax-free in Canada), and invest it in a US-friendly account.

If you've already moved with a funded TFSA, don't panic, but get it sorted ASAP. The penalties add up fast.`,
    cta: "Moving to the US with a TFSA? Our calculator shows you the tax impact and helps you plan. Link in bio — it's free.",
    captions: [
      "Your TFSA is taxable in the US. Surprise!",
      "The TFSA trap that costs Canadians thousands in the US",
      "$10K penalty for not reporting your TFSA to the IRS"
    ],
    hashtags: ['#TFSA', '#H1Bvisa', '#TaxSavings', '#Canada', '#Immigration', '#TechWorkers', '#CrossBorderTax', '#IRS', '#TaxMistakes', '#ExpatTax'],
    targetAudience: ['Canadians moving to US', 'TN visa holders', 'H-1B workers'],
    estimatedDuration: 60,
    difficulty: 'beginner',
    props: ['On-screen: "TFSA = Tax Free? NOT in the US" with red X', 'Form 3520-A screenshot'],
    bRollSuggestions: ['TFSA account screenshot', 'IRS penalty notice', 'US/Canada flags'],
  },
  {
    id: 'exchange-rate-trick',
    title: 'The Exchange Rate Trick That Saves You $2K',
    category: 'quick-tips',
    hook: "Using the wrong exchange rate on your tax return could cost you $2,000. Here's the trick the pros use.",
    body: `When you convert US income to Canadian dollars for your tax return, the exchange rate you use MATTERS.

The CRA says to use the Bank of Canada annual average rate. For 2024, that's about 1.3698. But your actual income came in throughout the year when rates were different.

Here's where it gets interesting: for LUMP SUM payments — like RSU vestings, bonuses, or severance — the CRA lets you use the spot rate on the day you received the payment.

If your RSUs vested on a day when the Canadian dollar was stronger (lower exchange rate), your income converts to FEWER Canadian dollars, which means LESS Canadian tax.

So if you had $100K in RSUs vest when the rate was 1.32 instead of using the annual average of 1.37, that's a $5,000 difference in reported income. At a 45% marginal rate, you save $2,250.

This is 100% legal. The CRA specifically allows spot rates for lump sum payments. You just need to document it properly.`,
    cta: "Our calculator automatically uses the optimal exchange rate for each income type. It finds money you didn't know you were leaving on the table. Link in bio.",
    captions: [
      "This exchange rate trick saves cross-border workers $2K",
      "Are you using the wrong exchange rate on your taxes?",
      "Legal tax hack for US-Canada filers"
    ],
    hashtags: ['#TaxTips', '#TaxSavings', '#Canada', '#Immigration', '#TechWorkers', '#CrossBorderTax', '#ExchangeRate', '#CRA', '#TaxHack', '#MoneyTips'],
    targetAudience: ['All cross-border workers'],
    estimatedDuration: 60,
    difficulty: 'intermediate',
    props: ['On-screen: exchange rate comparison chart', 'Calculator showing $2,250 savings'],
    bRollSuggestions: ['Bank of Canada website', 'Currency conversion app', 'RSU vesting notification'],
  },
  {
    id: 'fbar-reporting',
    title: 'FBAR: The $10K Form You Can NOT Forget',
    category: 'common-mistakes',
    hook: "Have more than $10,000 in Canadian bank accounts? There's a US form you MUST file or face a $12,500 penalty. Per account.",
    body: `The FBAR — Foreign Bank Account Report — is the form that catches more cross-border workers than any other.

If at ANY point during the year, the TOTAL of all your foreign financial accounts exceeded $10,000 USD, you must file FinCEN Form 114.

This includes your Canadian checking account, savings, RRSP, TFSA, RESP, investment accounts — everything. And it's the AGGREGATE total, not per account.

So if you have $6,000 in checking and $5,000 in savings, you're over the threshold and must file.

The form is filed separately from your tax return — it goes directly to FinCEN, not the IRS. Deadline is April 15 with automatic extension to October 15.

Non-willful penalty: $12,500 per violation. Willful penalty: $100,000 or 50% of the account balance, whichever is GREATER.

The good news? Filing is free and takes about 15 minutes if you have your account balances. There's no tax owed — it's just a reporting requirement.`,
    cta: "Our calculator reminds you about FBAR and other required forms so nothing falls through the cracks. Get your cross-border checklist — link in bio.",
    captions: [
      "The US form that catches every Canadian expat",
      "FBAR penalties start at $12,500. Don't skip this form",
      "Do you have $10K in Canadian accounts? File this NOW"
    ],
    hashtags: ['#FBAR', '#H1Bvisa', '#TaxSavings', '#Canada', '#Immigration', '#TechWorkers', '#CrossBorderTax', '#IRS', '#TaxCompliance', '#ExpatTax'],
    targetAudience: ['H-1B workers', 'TN visa holders', 'US residents with Canadian accounts'],
    estimatedDuration: 60,
    difficulty: 'beginner',
    props: ['On-screen: "$10,000 threshold" with account icons', 'Penalty amount in red'],
    bRollSuggestions: ['Bank statement', 'FinCEN website', 'Calendar with deadline'],
  },
  {
    id: 'rsu-sell-to-cover',
    title: 'Sell-to-Cover RSUs: The Hidden Tax Gap',
    category: 'rsu-deep-dive',
    hook: "Your company sold RSUs to cover taxes but they only withheld 22%. Your actual rate is 37%. You owe $15K more than you think.",
    body: `When your RSUs vest, most companies use "sell to cover" — they sell enough shares to cover the tax withholding.

But here's the problem: the default federal withholding rate for supplemental income is only 22%.

If you're making $200K+ as a tech worker, your actual marginal federal rate is 32% or 37%. Add state tax — California is 13.3%, Washington is 0% — and the gap gets even bigger.

On a $100K RSU vesting:
- Company withholds 22% federal = $22,000
- Your actual rate at 35% federal = $35,000
- Gap = $13,000 you owe at tax time

Multiply that by 4 quarterly vestings and you could owe $50K+ at tax time that you weren't expecting.

The fix? Either adjust your W-4 to increase withholding, or set aside the difference yourself each vesting. Some companies let you elect a higher withholding rate — ask your HR team.

And if you're cross-border, add Canadian tax obligations on top. The gap gets even larger.`,
    cta: "Our RSU calculator shows your REAL tax bill, not just what your company withholds. See your actual gap — link in bio.",
    captions: [
      "Your RSU tax withholding is too low. Here's why",
      "Why you owe $15K at tax time even with sell-to-cover",
      "The RSU withholding gap nobody talks about"
    ],
    hashtags: ['#RSU', '#TaxSavings', '#TechWorkers', '#StockCompensation', '#FAANG', '#H1Bvisa', '#TaxTips', '#SellToCover', '#TaxBill', '#SoftwareEngineer'],
    targetAudience: ['Tech workers with RSUs', 'FAANG employees'],
    estimatedDuration: 60,
    difficulty: 'beginner',
    props: ['On-screen: withholding gap calculation', 'Red arrow showing $13K gap'],
    bRollSuggestions: ['E*Trade/Fidelity vesting notification', 'Pay stub', 'Tax bill'],
  },
  {
    id: 'state-tax-moving',
    title: 'State Tax When You Move Mid-Year',
    category: 'quick-tips',
    hook: "You moved from California to Washington mid-year to save on state tax. But California still wants their money. Here's why.",
    body: `California is notorious for this. If you worked there for any part of the year, they tax ALL income earned during that period — including RSUs that vested while you were a resident.

Even after you leave, if you have RSUs that were GRANTED while you were in California, the state claims a portion based on the California-sourced allocation.

So you moved to Seattle in July, but RSUs granted in San Francisco that vest in December? California allocates those based on the ratio of California work days to total work days since the grant date.

This is called "source income" and it applies even to non-residents.

Washington has no state income tax. But Texas, which also has no state tax, is another popular destination.

The key is tracking your exact move date, updating your W-4 with your new address, and understanding how each state handles RSU sourcing.

For cross-border workers also dealing with Canadian taxes, this adds yet another layer of complexity.`,
    cta: "Moving states AND countries? Our calculator handles multi-state AND cross-border allocations. See your real tax picture — link in bio.",
    captions: [
      "California wants taxes even after you leave",
      "State tax traps when relocating as a tech worker",
      "Why moving to Washington doesn't eliminate your CA taxes"
    ],
    hashtags: ['#StateTax', '#California', '#TechWorkers', '#RSU', '#TaxSavings', '#Washington', '#Texas', '#TaxPlanning', '#FAANG', '#Relocation'],
    targetAudience: ['Tech workers relocating', 'California residents moving'],
    estimatedDuration: 60,
    difficulty: 'intermediate',
    props: ['US map highlighting CA, WA, TX', 'RSU allocation timeline'],
    bRollSuggestions: ['Moving truck', 'State border sign', 'California tax form'],
  },
  {
    id: 'tax-treaty-benefits',
    title: '5 Tax Treaty Benefits You Are Missing',
    category: 'tax-basics',
    hook: "The US-Canada tax treaty has 5 benefits that save cross-border workers thousands. Most people only know about 1.",
    body: `Benefit 1: Foreign Tax Credit. This is the one everyone knows. You get credit for taxes paid to the other country.

Benefit 2: Pension recognition. The treaty lets you defer tax on your 401K/RRSP in both countries. Without it, Canada would tax your 401K annually.

Benefit 3: Reduced withholding on dividends. The treaty cuts the withholding rate on cross-border dividends from 30% to 15%. If you hold US stocks in a Canadian brokerage, this matters.

Benefit 4: Capital gains exemption. If you sell property, the treaty prevents double taxation by giving the primary taxing right to the country where the property is located.

Benefit 5: Tie-breaker rules for residency. If both countries claim you as a resident, the treaty has specific rules — permanent home, center of vital interests, habitual abode, citizenship — to determine which country gets to tax you as a resident.

But here's the catch: treaty benefits are NOT automatic. You must actively claim them on Form 8833 in the US.`,
    cta: "Our calculator automatically applies all applicable treaty benefits. See how much you could save — link in bio.",
    captions: [
      "5 tax treaty benefits most people don't claim",
      "The US-Canada tax treaty saves you thousands — if you know how",
      "Are you claiming all 5 treaty benefits?"
    ],
    hashtags: ['#TaxTreaty', '#TaxSavings', '#Canada', '#H1Bvisa', '#Immigration', '#TechWorkers', '#CrossBorderTax', '#USCanada', '#TaxBenefits', '#ExpatTax'],
    targetAudience: ['All cross-border workers'],
    estimatedDuration: 60,
    difficulty: 'intermediate',
    props: ['Numbered list 1-5 appearing on screen', 'Form 8833 close-up'],
    bRollSuggestions: ['US-Canada flags', 'Treaty document', 'Savings calculator'],
  },
  {
    id: 'first-year-us',
    title: 'First Year in the US: Resident or Non-Resident?',
    category: 'immigration-tax',
    hook: "Your first year in the US on an H-1B visa: should you file as a resident or non-resident? Choose wrong and you pay thousands extra.",
    body: `Your first year in the US is unique because you might qualify as a "dual-status" taxpayer.

If you arrived mid-year, you're a non-resident for the part of the year before you came, and a resident after. This changes everything about how you file.

As a non-resident, the US only taxes your US-source income. As a resident, the US taxes your WORLDWIDE income.

You have a choice: file as a dual-status taxpayer (complex but accurate), or make the "first-year choice" to be treated as a resident for the whole year.

Why would you choose resident status? Because you can claim the standard deduction ($14,600 for 2024) and other benefits that non-residents can't.

But if you had significant foreign income before arriving, being a resident means the US taxes ALL of it.

The right choice depends on your specific situation: when you arrived, how much you earned abroad, and whether the standard deduction outweighs the foreign income tax.

There's no one-size-fits-all answer, which is why so many people get this wrong.`,
    cta: "Our calculator models both scenarios — resident vs non-resident — and shows you which saves more. Free tool, link in bio.",
    captions: [
      "Your first year on H-1B: resident or non-resident filing?",
      "Dual-status vs resident: which saves you more?",
      "First year in the US? This tax choice matters"
    ],
    hashtags: ['#H1Bvisa', '#TaxSavings', '#Immigration', '#TechWorkers', '#CrossBorderTax', '#FirstYear', '#NonResident', '#IRS', '#TaxFiling', '#NewInUSA'],
    targetAudience: ['New H-1B workers', 'First-year immigrants'],
    estimatedDuration: 60,
    difficulty: 'intermediate',
    props: ['Calendar showing arrival date with "NR" and "R" labels', 'Comparison chart'],
    bRollSuggestions: ['Airport arrival', 'Tax form comparison', 'Passport stamp'],
  },
  {
    id: 'cpa-vs-calculator',
    title: 'Cross-Border CPA: $3,000+ or Free Calculator?',
    category: 'myth-busters',
    hook: "A cross-border CPA charges $3,000 to $5,000 per year. I built a tool that does 80% of what they do for free.",
    body: `Let me be real: cross-border CPAs are expensive because the work IS complex. Dual-country filing with RSUs, treaty benefits, and multiple forms is genuinely complicated.

But here's what most people don't realize: the CALCULATION part — figuring out what you owe in each country — is formulaic. It follows specific rules that a computer can apply.

What a CPA adds is judgment on edge cases, audit representation, and filing the actual returns.

Our calculator handles the calculation side: exchange rate optimization, RSU allocation between countries, Foreign Tax Credit calculation, FBAR threshold detection, and more.

You can use it to VERIFY what your CPA tells you. Or if your situation is straightforward — W-2 income, RSUs, standard treaty benefits — you might not need a CPA at all.

I'm not saying fire your CPA. I'm saying understand your own tax situation first so you can have an informed conversation with them. Knowledge is savings.

The calculator has saved users an average of $12K in overpaid taxes by catching errors they didn't know existed.`,
    cta: "Try the free calculator yourself. Takes 10 minutes, saves thousands. Link in bio.",
    captions: [
      "Do you really need a $3K cross-border CPA?",
      "Save $3K in CPA fees with this free tool",
      "Cross-border taxes: DIY or hire a pro?"
    ],
    hashtags: ['#TaxSavings', '#CPA', '#TechWorkers', '#CrossBorderTax', '#FreeTool', '#H1Bvisa', '#TaxCalculator', '#DIYTax', '#Canada', '#Immigration'],
    targetAudience: ['All cross-border workers', 'Budget-conscious filers'],
    estimatedDuration: 60,
    difficulty: 'beginner',
    props: ['On-screen: "$3,000 CPA vs $0 Calculator" comparison', 'Feature checklist'],
    bRollSuggestions: ['CPA office', 'Calculator app demo', 'Dollar signs'],
  },
  {
    id: 'myth-green-card-tax',
    title: 'Myth: Green Card = Better Tax Treatment',
    category: 'myth-busters',
    hook: "Think getting a green card improves your tax situation? It actually makes it MORE complicated. Here's why.",
    body: `A lot of H-1B workers think the green card is the finish line for tax complexity. It's actually the opposite.

With an H-1B, if you leave the US, you become a non-resident and the US stops taxing your worldwide income.

With a green card, the US taxes your worldwide income FOR LIFE — or until you formally abandon your green card. And abandoning it comes with its own tax: the exit tax under Section 877A.

If you're a "covered expatriate" — meaning you have net worth over $2 million or average annual tax over $190K — the US imposes a deemed sale on ALL your worldwide assets when you give up the green card.

So that $500K in RSUs? Deemed sold. Capital gains tax due immediately.

This is why tax planning BEFORE getting a green card is critical. Understanding the long-term implications changes how you think about the decision.

For cross-border workers who might want to return to Canada someday, the green card can actually create more tax problems than it solves.`,
    cta: "Thinking about a green card? See the full tax picture first with our cross-border calculator. Link in bio.",
    captions: [
      "Green card ≠ better taxes. Here's the truth",
      "The hidden tax cost of getting a green card",
      "Why your green card makes taxes harder, not easier"
    ],
    hashtags: ['#GreenCard', '#H1Bvisa', '#TaxSavings', '#Immigration', '#TechWorkers', '#CrossBorderTax', '#ExitTax', '#IRS', '#TaxPlanning', '#USImmigration'],
    targetAudience: ['H-1B workers considering green card', 'Green card holders'],
    estimatedDuration: 60,
    difficulty: 'advanced',
    props: ['Green card image with tax implications listed', 'Exit tax calculation'],
    bRollSuggestions: ['Green card close-up', 'Tax form', 'Global map with tax arrows'],
  },
  {
    id: 'tax-season-checklist',
    title: 'Your Cross-Border Tax Filing Checklist',
    category: 'seasonal',
    hook: "Tax season is here. If you worked in the US and have ties to Canada, here are the 8 things you need to file.",
    body: `Number 1: US Federal Return — Form 1040 or 1040-NR depending on your status.

Number 2: US State Return — if you worked in a state with income tax.

Number 3: Canadian T1 Return — reporting worldwide income including US income.

Number 4: Form T2209 — to claim Foreign Tax Credit in Canada.

Number 5: FBAR (FinCEN 114) — if your foreign accounts exceeded $10K at any point.

Number 6: Form 8938 (FATCA) — if foreign assets exceed $50K on Dec 31 or $75K at any point during the year.

Number 7: Form 8833 — to claim treaty benefits, especially for dual residency.

Number 8: Form T1135 — Canadian foreign income verification if foreign property exceeds $100K CAD.

Miss any of these and you face penalties from $100 to $25,000 PER FORM.

The US deadline is April 15 (June 15 for expats). Canada deadline is April 30. Plan accordingly.`,
    cta: "Download the complete checklist and let our calculator figure out which forms you actually need. Link in bio.",
    captions: [
      "The 8 forms cross-border workers must file",
      "Your cross-border tax filing checklist",
      "Don't miss these forms — penalties start at $10K"
    ],
    hashtags: ['#TaxSeason', '#TaxSavings', '#H1Bvisa', '#Canada', '#Immigration', '#TechWorkers', '#CrossBorderTax', '#TaxChecklist', '#TaxFiling', '#TaxDeadline'],
    targetAudience: ['All cross-border workers'],
    estimatedDuration: 60,
    difficulty: 'beginner',
    props: ['Numbered checklist appearing one by one', 'Calendar with deadlines'],
    bRollSuggestions: ['Stack of tax forms', 'Calendar', 'Checkmark animation'],
    weekBestPosted: 4, // Late January - early February
  },
  {
    id: 'espp-cross-border',
    title: 'ESPP and Cross-Border Taxes',
    category: 'rsu-deep-dive',
    hook: "Your company's ESPP gives you a 15% discount on stock. But cross-border, that discount gets taxed TWICE if you're not careful.",
    body: `Employee Stock Purchase Plans are a great deal: you buy company stock at a 15% discount. But cross-border taxation makes them tricky.

In the US, the discount is taxed as ordinary income when you sell — or as a disqualifying disposition if you sell within 2 years.

If you move to Canada, things get complicated. The discount is considered an employment benefit in Canada too. And Canada has different rules for when the benefit is recognized.

The US-Canada treaty helps, but the timing differences mean you could end up paying tax on the discount in BOTH countries without getting proper credit.

Here's the worst case: you buy ESPP shares in the US, move to Canada, then sell. The US taxes the discount as employment income. Canada taxes the entire gain from purchase to sale as employment income — including the part the US already taxed.

The fix is careful tracking of your cost basis, proper Form T2209 filing, and understanding which country has primary taxing rights on which portion of the gain.

Most cross-border CPAs charge extra for ESPP situations because they're that complex.`,
    cta: "Our calculator handles ESPP allocations for cross-border workers. See your real after-tax proceeds before you sell. Link in bio.",
    captions: [
      "ESPP + cross-border = tax chaos. Here's how to handle it",
      "Don't sell your ESPP shares without watching this",
      "The ESPP double-tax trap for cross-border workers"
    ],
    hashtags: ['#ESPP', '#TaxSavings', '#TechWorkers', '#StockCompensation', '#CrossBorderTax', '#H1Bvisa', '#Canada', '#TaxTips', '#FAANG', '#EmployeeStock'],
    targetAudience: ['Tech workers with ESPP', 'FAANG employees'],
    estimatedDuration: 60,
    difficulty: 'advanced',
    props: ['ESPP discount diagram', 'Timeline of purchase → move → sell'],
    bRollSuggestions: ['ESPP enrollment page', 'Stock purchase confirmation', 'Calculator'],
  },
  {
    id: 'crypto-cross-border',
    title: 'Crypto Taxes Across Borders',
    category: 'quick-tips',
    hook: "You traded crypto in the US, then moved to Canada. Both countries want to tax your gains. Here's how to handle it.",
    body: `Crypto is taxed as property in the US (capital gains) and as either business income or capital gains in Canada depending on your trading pattern.

When you move countries, you need to establish your cost basis in the NEW country. Canada's departure tax doesn't apply to crypto held in the US — but US-sourced crypto gains ARE reportable to Canada if you're a Canadian resident.

The biggest trap: if you were day-trading crypto in the US, the IRS wants every single transaction reported. Move to Canada and the CRA also wants every transaction — but converted to CAD using the exchange rate on EACH transaction date.

If you have hundreds of trades, that's hundreds of exchange rate conversions. Manual? Nightmare. Automated? Essential.

Also, crypto held on US exchanges is a "specified foreign property" for Canadian residents if over $100K CAD. That means Form T1135 reporting.

And don't forget: transferring crypto between your own wallets is NOT a taxable event, but the CRA still wants to know about foreign holdings.`,
    cta: "Our calculator handles crypto with multi-currency conversion. Cross-border crypto taxes, simplified. Link in bio.",
    captions: [
      "Crypto + cross-border = the ultimate tax headache",
      "How to handle crypto taxes when moving countries",
      "Both countries want to tax your Bitcoin gains"
    ],
    hashtags: ['#CryptoTax', '#Bitcoin', '#TaxSavings', '#Canada', '#CrossBorderTax', '#TechWorkers', '#CryptoTrading', '#IRS', '#CRA', '#TaxTips'],
    targetAudience: ['Crypto traders moving cross-border'],
    estimatedDuration: 60,
    difficulty: 'advanced',
    props: ['Crypto icons with tax arrows', 'Exchange rate conversion example'],
    bRollSuggestions: ['Crypto exchange interface', 'Bitcoin price chart', 'Tax form'],
  },
  {
    id: 'stock-options-vs-rsus',
    title: 'Stock Options vs RSUs: Tax Differences Cross-Border',
    category: 'rsu-deep-dive',
    hook: "Stock options and RSUs look similar but they're taxed COMPLETELY differently when you cross the border. This matters.",
    body: `RSUs are straightforward in one country: they're taxed as income when they vest. Period.

Stock options are different: you choose WHEN to exercise. This gives you tax planning flexibility — but also more complexity.

With ISOs (Incentive Stock Options), you can get capital gains treatment in the US if you hold long enough. But Canada doesn't have ISOs — they treat ALL option gains as employment income at exercise.

NSOs (Non-Qualified Stock Options) are taxed at exercise in both countries, but the allocation between countries is based on where you worked between grant and exercise dates.

Here's where it gets interesting: if you have ISOs granted in the US and exercise them after moving to Canada, the US ISO treatment is lost because you're no longer a US employee. Canada taxes the full spread as employment income.

But you might get a 50% deduction in Canada under the stock option deduction rules — IF the exercise price was at least fair market value at grant and other conditions are met.

The optimal strategy depends on your specific grant dates, move date, and current stock price.`,
    cta: "Options or RSUs cross-border? Our calculator models both scenarios. See your optimal exercise strategy — link in bio.",
    captions: [
      "Options vs RSUs: why it matters when you move countries",
      "The cross-border tax difference between options and RSUs",
      "ISO options lose their benefit when you leave the US"
    ],
    hashtags: ['#StockOptions', '#RSU', '#TaxSavings', '#TechWorkers', '#CrossBorderTax', '#H1Bvisa', '#Canada', '#ISO', '#NSO', '#FAANG'],
    targetAudience: ['Tech workers with options', 'Startup employees moving cross-border'],
    estimatedDuration: 60,
    difficulty: 'advanced',
    props: ['Side-by-side comparison chart', 'Timeline of grant → exercise → sell'],
    bRollSuggestions: ['Stock option agreement', 'Exercise notification', 'Comparison table'],
  },
  {
    id: 'social-security-cpp',
    title: 'Social Security vs CPP: Are You Paying Both?',
    category: 'tax-basics',
    hook: "You're paying into Social Security in the US AND CPP in Canada? You might be paying double for nothing. Here's the fix.",
    body: `If you work in the US, you pay Social Security tax — 6.2% up to $168,600 in 2024. If you also have Canadian ties, the CRA might want CPP contributions too.

The Totalization Agreement between the US and Canada prevents this double payment — but you have to know about it and claim it.

Under the agreement, you generally pay into the system of the country where you WORK. US workers pay Social Security, Canadian workers pay CPP. Simple.

But if you're self-employed or work for a Canadian company while living in the US, it gets murky. You might need a Certificate of Coverage to prove which system you belong to.

The good news: years of contributions in BOTH countries can be combined to meet eligibility requirements. So if you worked 5 years in the US and 15 in Canada, you can combine them to qualify for benefits in either country.

The bad news: benefits are calculated based on what you ACTUALLY contributed to each system, not the combined total. So your Social Security check will be based on just your US work years.

Planning for retirement across borders requires understanding both systems.`,
    cta: "Our calculator factors in Social Security and CPP implications. See your complete cross-border picture — link in bio.",
    captions: [
      "Are you paying into Social Security AND CPP? Stop the double payment",
      "Social Security meets CPP: what cross-border workers need to know",
      "The Totalization Agreement most people don't use"
    ],
    hashtags: ['#SocialSecurity', '#CPP', '#TaxSavings', '#Canada', '#Immigration', '#TechWorkers', '#CrossBorderTax', '#Retirement', '#TaxTips', '#ExpatFinance'],
    targetAudience: ['Cross-border workers', 'Self-employed cross-border'],
    estimatedDuration: 60,
    difficulty: 'intermediate',
    props: ['Social Security card next to CPP statement', 'Totalization Agreement highlight'],
    bRollSuggestions: ['Social Security statement', 'CPP statement', 'Retirement calculation'],
  },
  {
    id: 'year-end-tax-planning',
    title: 'Year-End Tax Planning for Cross-Border Workers',
    category: 'seasonal',
    hook: "It's December and you have 30 days to save thousands on your cross-border taxes. Here are 5 moves to make RIGHT NOW.",
    body: `Move 1: Max out your 401K. The 2024 limit is $23,000 ($30,500 if over 50). Every dollar you contribute reduces your US taxable income AND your Canadian income for FTC purposes.

Move 2: Harvest tax losses. If you have losing stocks, sell them before December 31 to offset gains. Works in both countries, but watch the wash sale rule in the US (30 days) vs superficial loss rule in Canada (30 days before AND after).

Move 3: Contribute to your RRSP by March 1 of NEXT year. RRSP contributions reduce Canadian taxable income. Under the treaty, the US also recognizes the deduction.

Move 4: Review your RSU vesting schedule. If you have RSUs vesting in January, check if your company allows you to defer to minimize the year's total income.

Move 5: Gather documents NOW. W-2s, T4s, 1099s, exchange rates, FBAR account balances. Having everything ready in January means you file early, get refunds faster, and avoid the last-minute panic.

These 5 moves together can save $5,000 to $15,000 depending on your situation.`,
    cta: "Run these scenarios through our free calculator to see your exact savings. Link in bio — takes 10 minutes.",
    captions: [
      "5 year-end moves that save cross-border workers thousands",
      "December tax planning for US-Canada workers",
      "Make these 5 moves before January 1"
    ],
    hashtags: ['#TaxPlanning', '#YearEnd', '#TaxSavings', '#H1Bvisa', '#Canada', '#TechWorkers', '#CrossBorderTax', '#401K', '#RRSP', '#TaxHack'],
    targetAudience: ['All cross-border workers'],
    estimatedDuration: 60,
    difficulty: 'intermediate',
    props: ['Numbered list 1-5 with dollar amounts', 'Calendar showing December 31 deadline'],
    bRollSuggestions: ['Calendar flipping', '401K portal', 'Stock portfolio'],
    weekBestPosted: 48, // Late November - early December
  },
];

// Content calendar categories for balanced posting
export const CONTENT_CATEGORIES = {
  'tax-basics': { color: '#4CAF50', label: 'Tax Basics', frequency: 'weekly' },
  'rsu-deep-dive': { color: '#2196F3', label: 'RSU Deep Dive', frequency: 'weekly' },
  'common-mistakes': { color: '#F44336', label: 'Common Mistakes', frequency: 'bi-weekly' },
  'immigration-tax': { color: '#9C27B0', label: 'Immigration & Tax', frequency: 'bi-weekly' },
  'canada-specific': { color: '#FF9800', label: 'Canada Specific', frequency: 'bi-weekly' },
  'quick-tips': { color: '#00BCD4', label: 'Quick Tips', frequency: 'weekly' },
  'myth-busters': { color: '#E91E63', label: 'Myth Busters', frequency: 'monthly' },
  'seasonal': { color: '#795548', label: 'Seasonal', frequency: 'as-needed' },
} as const;

// Hashtag sets for different platforms
export const HASHTAG_SETS = {
  instagram: {
    primary: ['#H1Bvisa', '#TaxSavings', '#Canada', '#Immigration', '#TechWorkers'],
    secondary: ['#CrossBorderTax', '#RSU', '#ExpatTax', '#TaxTips', '#FAANG'],
    trending: ['#FinTok', '#TaxTok', '#MoneyTips', '#FinancialLiteracy', '#TechLife'],
    niche: ['#TNvisa', '#GreenCard', '#RRSP', '#401K', '#StockCompensation'],
  },
  tiktok: {
    primary: ['#taxtok', '#h1bvisa', '#taxsavings', '#immigration', '#techworkers'],
    secondary: ['#crossbordertax', '#rsu', '#expattax', '#taxtips', '#faang'],
    trending: ['#fintok', '#moneytok', '#learnontiktok', '#adulting', '#lifehack'],
    niche: ['#tnvisa', '#greencard', '#rrsp', '#401k', '#stockcompensation'],
  },
};

// Influencer collaboration targets
export const INFLUENCER_TARGETS = [
  {
    handle: '@SelfSponsoredVisa',
    platform: 'instagram',
    followers: '50K+',
    niche: 'Immigration',
    collaborationType: 'Co-create content on H-1B tax implications',
    priority: 'high',
  },
  {
    handle: '@immigrationlawyer',
    platform: 'instagram',
    followers: '100K+',
    niche: 'Immigration Law',
    collaborationType: 'Guest appearance on tax + immigration crossover',
    priority: 'high',
  },
  {
    handle: '@techsalaries',
    platform: 'tiktok',
    followers: '200K+',
    niche: 'Tech Compensation',
    collaborationType: 'RSU taxation explainer collaboration',
    priority: 'medium',
  },
  {
    handle: '@personalfinanceclub',
    platform: 'instagram',
    followers: '500K+',
    niche: 'Personal Finance',
    collaborationType: 'Cross-border tax awareness post',
    priority: 'medium',
  },
  {
    handle: '@canadianexpat',
    platform: 'tiktok',
    followers: '30K+',
    niche: 'Canadian Expats',
    collaborationType: 'Departure tax and TFSA awareness',
    priority: 'high',
  },
  {
    handle: '@visajourney',
    platform: 'instagram',
    followers: '75K+',
    niche: 'Visa & Immigration',
    collaborationType: 'Sponsorship or co-hosted live on tax filing for H-1B',
    priority: 'medium',
  },
];

// Posting schedule: 3x per week
export const POSTING_SCHEDULE = {
  days: ['Tuesday', 'Thursday', 'Saturday'],
  bestTimes: {
    instagram: {
      Tuesday: '12:00 PM EST',
      Thursday: '7:00 PM EST',
      Saturday: '10:00 AM EST',
    },
    tiktok: {
      Tuesday: '11:00 AM EST',
      Thursday: '5:00 PM EST',
      Saturday: '9:00 AM EST',
    },
  },
  rationale: {
    Tuesday: 'Mid-week engagement peak for professional content',
    Thursday: 'Evening scroll time — higher save rates',
    Saturday: 'Weekend personal finance research time',
  },
};

export function getScriptsByCategory(category: VideoScript['category']): VideoScript[] {
  return VIDEO_SCRIPTS.filter(s => s.category === category);
}

export function getScriptsByDifficulty(difficulty: VideoScript['difficulty']): VideoScript[] {
  return VIDEO_SCRIPTS.filter(s => s.difficulty === difficulty);
}

export function getSeasonalScripts(weekOfYear: number): VideoScript[] {
  return VIDEO_SCRIPTS.filter(s => {
    if (!s.weekBestPosted) return false;
    return Math.abs(s.weekBestPosted - weekOfYear) <= 2;
  });
}

export function generateContentCalendar(startDate: Date, weeks: number = 12): ContentCalendarEntry[] {
  const calendar: ContentCalendarEntry[] = [];
  const scripts = [...VIDEO_SCRIPTS];
  let scriptIndex = 0;

  for (let week = 0; week < weeks; week++) {
    for (const day of POSTING_SCHEDULE.days) {
      const postDate = getNextDayOfWeek(startDate, day, week);
      const script = scripts[scriptIndex % scripts.length];

      calendar.push({
        date: postDate,
        day,
        script,
        platform: week % 2 === 0 ? 'both' : (scriptIndex % 2 === 0 ? 'instagram' : 'tiktok'),
        status: 'scheduled',
      });

      scriptIndex++;
    }
  }

  return calendar;
}

export interface ContentCalendarEntry {
  date: Date;
  day: string;
  script: VideoScript;
  platform: 'instagram' | 'tiktok' | 'both';
  status: 'scheduled' | 'filmed' | 'edited' | 'posted' | 'skipped';
}

function getNextDayOfWeek(startDate: Date, dayName: string, weekOffset: number): Date {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const targetDay = days.indexOf(dayName);
  const date = new Date(startDate);
  date.setDate(date.getDate() + (weekOffset * 7));
  const currentDay = date.getDay();
  const diff = targetDay - currentDay;
  date.setDate(date.getDate() + (diff >= 0 ? diff : diff + 7));
  return date;
}
