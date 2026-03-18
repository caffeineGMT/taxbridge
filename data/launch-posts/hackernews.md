# Hacker News - Show HN

**Scheduled Time:** 7:30 AM PST
**Post ID:** hackernews

---

## Title

Show HN: TaxBridge – Cross-border tax calculator for H-1B → Canada relocations

---

## Post Body

Hey HN,

I'm Michael, a Meta SWE who moved from California to Vancouver in 2024. I had RSUs that vested after moving to Canada and ended up overpaying $12K because I misunderstood the US-Canada tax treaty (Article XV).

CPAs wanted $3K+ to handle this, but the calculation is actually pretty straightforward - just involves several moving parts:

1. Calculate US federal + California state tax on RSU income
2. Calculate Canada federal + BC provincial tax on the same income
3. Apply Foreign Tax Credit (FTC) on US return to avoid double taxation
4. File treaty disclosure (Form 8833) to claim treaty benefits

**Tech stack:**
- Next.js 15 (App Router)
- TypeScript + TailwindCSS
- SQLite via better-sqlite3 (local-first data)
- Stripe for Pro subscriptions
- Deployed on Vercel

**What I learned:**
- US-Canada tax treaty Article XV is poorly documented (most resources are for corporations, not individuals)
- IRS Form 8833 is required but rarely mentioned by CPAs
- Foreign Tax Credit calculation order matters (US first, then Canada credit)
- State-level taxation varies wildly (CA keeps taxing you for 1+ years after you leave)

Calculator is free for basic use. Pro plan ($299/yr) adds multi-year tracking, form pre-fill, and export.

Also launching on Product Hunt today: https://www.producthunt.com/posts/taxbridge?utm_source=hackernews&utm_medium=show_hn&utm_campaign=ph_launch&utm_content=show_hn&ref=hackernews

Happy to answer questions about the tech stack or cross-border tax complexity!

---

## UTM Parameters

- **Source:** hackernews
- **Medium:** show_hn
- **Campaign:** ph_launch
- **Content:** show_hn

---

## Target Metrics

- **Upvotes:** 50+
- **Comments:** 30+


---

## Instructions

1. **Copy the title and body** above
2. **Post to Show HN** on Hacker News
3. **Copy the post URL**
4. **Update tracking:** Run `npm run launch:mark-posted hackernews <POST_URL>`
5. **Monitor engagement:** Check comments every 10-15 minutes
6. **Respond to ALL comments** within 10 minutes
7. **Update metrics:** Run `npm run launch:update-metrics hackernews` hourly

---

## Engagement Strategy

- Respond to every comment within 10 minutes
- Ask follow-up questions to keep conversations going
- Share specific examples and numbers
- Be helpful, not sales-y
- Thank everyone who engages
- Cross-promote: mention Product Hunt link naturally

---

## Status

- [ ] Posted
- [ ] Post URL recorded
- [ ] First response made
- [ ] Hourly engagement check

---

*Generated on 2026-03-18T22:40:14.982Z*
