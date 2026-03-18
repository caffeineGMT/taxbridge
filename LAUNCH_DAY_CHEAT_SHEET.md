# 🚀 Product Hunt Launch Day - Cheat Sheet

**Print this or keep open on second monitor**

---

## ⏰ Quick Timeline

| Time | Action | Link/Command |
|------|--------|--------------|
| 12:01 AM | Verify PH live | https://www.producthunt.com/posts/taxbridge |
| 12:03 AM | Post first comment | Copy from clipboard |
| 12:05 AM | Tweet launch | Twitter.com |
| 12:10 AM | Email beta users | SendGrid |
| 6:00 AM | Start community posts | See schedule below |
| Every hour | Check dashboard | `npm run launch:dashboard` |
| Every 10 min | Respond to comments | PH + Reddit + HN |

---

## 📝 Essential Commands

```bash
# Monitor everything (leave running)
npm run launch:dashboard

# Mark post as published
npm run launch:mark-posted [community-id] [URL]

# Check pending responses
npm run launch:check-responses

# Update metrics
npm run launch:update-metrics [community-id]

# Test HUNT20 code
npm run test:hunt20
```

---

## 📅 Community Posting Schedule

| Time | Community | File |
|------|-----------|------|
| 6:00 AM | Reddit r/PersonalFinanceCanada | `reddit-pfc.md` |
| 7:30 AM | Hacker News | `hackernews.md` |
| 8:00 AM | Reddit r/h1b | `reddit-h1b.md` |
| 9:00 AM | Reddit r/CanadianInvestor | `reddit-canadianinvestor.md` |
| 10:30 AM | Reddit r/ImmigrationCanada | `reddit-immigration-canada.md` |
| 12:00 PM | LinkedIn Personal | `linkedin-personal.md` |
| 1:30 PM | Twitter Thread | `twitter-thread.md` |
| 3:00 PM | Reddit r/SideProject | `reddit-sideproject.md` |
| 4:30 PM | Reddit r/cscareerquestions | `reddit-cscareerquestions.md` |
| 6:00 PM | Indie Hackers + Discord | `indiehackers.md`, `levels-fyi-discord.md` |
| 7:30 PM | Facebook Groups | `facebook-h1b-groups.md` |
| 8:00 PM | Reddit r/tax + TechCrunch | `reddit-tax.md`, `techcrunch-comments.md` |
| 9:00 PM | LinkedIn Groups | `linkedin-tech-groups.md` |

**All files in:** `data/launch-posts/`

---

## 💬 Quick Response Templates

### "How is this different from TurboTax?"
```
TurboTax is for single-country filers. TaxBridge handles cross-border (US + Canada) where you file in BOTH countries. We do Foreign Tax Credit optimization and Treaty Article XV compliance - which TurboTax doesn't address.
```

### "Why not hire a CPA?"
```
CPAs charge $500-$1,200/year. TaxBridge is $299/year (or $239 with HUNT20). You can still share our PDF with your CPA for final review. Best of both worlds at 1/4 the cost!
```

### "Does it work for [other country]?"
```
Currently US-Canada only. Expanding to US-UK (April), US-India (June), US-Australia (Q3). Drop your email at taxbridge.app and we'll notify you!
```

### "Can I trust the calculations?"
```
Based on official IRS & CRA brackets, uses US-Canada Tax Treaty Article XV, validated by CPAs. TaxBridge provides calculations, not tax advice. For 100% certainty, consult a licensed CPA.
```

---

## 📊 Success Targets

- [ ] 500+ Product Hunt upvotes
- [ ] #1 Product of the Day ranking
- [ ] 100+ comments on PH
- [ ] 1,000+ website visitors
- [ ] 20+ HUNT20 redemptions ($4,780+ revenue)
- [ ] 200+ total community upvotes
- [ ] Sub-15-minute response time

---

## 🔗 Essential Links

**Product Hunt:**
- Your product: https://www.producthunt.com/posts/taxbridge
- Comments: (scroll down on product page)

**Dashboards:**
- Stripe: https://dashboard.stripe.com/payments
- PostHog: https://app.posthog.com
- HUNT20: https://dashboard.stripe.com/promotion_codes

**Social Media:**
- Twitter: https://twitter.com/compose/tweet
- LinkedIn: https://linkedin.com/feed

**Community Posts:**
- Reddit: https://reddit.com/submit
- HN: https://news.ycombinator.com/submit
- IH: https://www.indiehackers.com/post/new

---

## ⚠️ Emergency Contacts

**If HUNT20 not working:**
1. Check Stripe: https://dashboard.stripe.com/promotion_codes
2. Run: `npm run test:hunt20`
3. Recreate: `npm run create:hunt20`

**If PH not live at 12:01 AM:**
1. Wait 5-10 min (manual review)
2. Check email for approval
3. Contact support: https://www.producthunt.com/support

**If post marked as spam:**
1. Contact community mods
2. Explain launching on PH
3. Offer value/answer questions
4. Move to next community

---

## 📱 Phone Alarms

- [ ] 11:50 PM - 10 min warning
- [ ] 12:01 AM - LAUNCH TIME
- [ ] 12:03 AM - Post first comment
- [ ] 12:10 AM - Send beta email
- [ ] 6:00 AM - Start community posts
- [ ] Every 3 hours - Tweet update
- [ ] Every hour - Check dashboard

---

## 🎯 Hourly Tasks

**Every hour, do this:**

1. **Check PH ranking**
   - Current: #__
   - Upvotes: __
   - New comments: __

2. **Respond to ALL new comments** (< 15 min)

3. **Update metrics**
   ```bash
   npm run launch:update-metrics [community-id]
   ```

4. **Check Stripe**
   - HUNT20 redemptions: __
   - Revenue: $__

5. **Tweet update** (every 3 hours)
   - See `TWITTER_LAUNCH_CONTENT.md`

---

## 🚨 Remember

- **Respond < 15 minutes** (critical for algorithm)
- **Be helpful, not sales-y**
- **Share specific examples/numbers**
- **Thank everyone**
- **Stay hydrated!**

---

## 📸 Screenshots to Take

- [ ] PH listing at 12:01 AM (launch moment)
- [ ] First 100 upvotes
- [ ] #3 ranking (if achieved)
- [ ] #2 ranking (if achieved)
- [ ] #1 ranking (if achieved!!!)
- [ ] Final ranking at 11:59 PM
- [ ] Stripe dashboard (HUNT20 redemptions)
- [ ] PostHog traffic spike

---

## 💰 HUNT20 Quick Reference

- **Code:** HUNT20
- **Discount:** 20% off
- **Original:** $299/year
- **Discounted:** $239/year
- **Valid:** 48 hours (Tue 12:01 AM - Thu 11:59 PM PST)
- **Max Uses:** 200
- **Applies To:** Pro plan only

**Test:** https://taxbridge.app/pricing

---

## 🎉 If You Hit Top 3

**Immediately:**
- [ ] Screenshot ranking
- [ ] Tweet celebration
- [ ] Post on LinkedIn
- [ ] Email beta users
- [ ] Update first comment
- [ ] Thank supporters

**Within 1 hour:**
- [ ] Create "Top 3" badge graphic
- [ ] Share on all social media
- [ ] Post in Slack/Discord
- [ ] Add to website homepage
- [ ] Update email signature

---

**Status:** READY TO LAUNCH 🚀

**Goal:** #1 Product of the Day

**You've got this!**
