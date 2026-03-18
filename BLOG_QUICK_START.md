# Blog SEO System - Quick Start Guide

## What Was Built

Production-ready SEO blog with AI content generation for TaxBridge.

**Live URLs (after deployment):**
- Blog index: `https://taxbridge.app/blog`
- Sample article: `https://taxbridge.app/blog/h1b-rsu-taxation-complete-guide`

## Generate All 20 Articles

```bash
# Set your Anthropic API key
export ANTHROPIC_API_KEY="sk-ant-..."

# Generate all articles (takes ~45 minutes, costs ~$15)
npm run blog:generate

# Verify content quality
npm run blog:verify
```

## What Gets Generated

20 SEO-optimized articles (1,500-1,800 words each):

1. H-1B RSU Taxation Guide
2. Form 8938 vs FBAR Comparison
3. TN Visa Tax Mistakes
4. Foreign Tax Credit Calculator
5. Cross-Border CPA Alternatives
6. Canada-US Tax Treaty Article XV
7. RSU Vesting Tax Planning
8. State Tax Obligations for H-1B
9. RRSP US Tax Treatment
10. Exit Tax Leaving USA
11. Dual Status Tax Return
12. Substantial Presence Test Calculator
13. AMT and ISOs
14. TFSA US Tax Treatment
15. H-1B to Green Card Tax Implications
16. Estimated Tax Payments
17. Remote Work Canada to US Tax
18. Crypto Cross-Border Tax Reporting
19. Marriage and Cross-Border Taxes
20. First-Time H-1B Tax Filer Checklist

## Features Included

### Email Capture Popup
- Shows after 30 seconds on blog articles
- Offers "Free H-1B Tax Checklist PDF"
- Target: 40% conversion rate
- Integrated with newsletter system

### SEO Optimization
- Schema.org Article markup on every page
- Meta tags (title, description, OG, Twitter)
- Sitemap includes all blog URLs
- Internal links to calculator (2-3 per article)
- Target keywords optimized

### Publishing Schedule
- 2 articles per week over 10 weeks
- Publish on Tuesday and Friday
- Articles with `publishedAt <= today` show on blog index

## Deployment

```bash
# Commit and push
git add -A
git commit -m "Add SEO blog with AI content generation system"
git push origin main
```

Vercel will automatically:
1. Build static pages for all articles
2. Generate sitemap with blog URLs
3. Deploy to production

## Post-Deployment Steps

### 1. Submit to Google Search Console
```
1. Go to search.google.com/search-console
2. Add property: taxbridge.app
3. Submit sitemap: https://taxbridge.app/sitemap.xml
4. Request indexing for top articles
```

### 2. Community Promotion (Week 1)

**Reddit:**
- Post to r/PersonalFinanceCanada
- Post to r/h1b
- Post to r/tax
- Engage in comments within 1 hour

**LinkedIn:**
- Share on personal profile
- Post to relevant groups:
  - Canadians in Tech (US)
  - H-1B Visa Holders Network
  - Tech Immigration Support

**Template:**
```
Just published a comprehensive guide on [topic] for H-1B/TN workers.

Key insights:
✓ [Takeaway 1]
✓ [Takeaway 2]
✓ [Takeaway 3]

Full guide: https://taxbridge.app/blog/[slug]

Also built a free calculator to see exact numbers: https://taxbridge.app/us-canada-tax-calculator

Questions? Ask away!
```

### 3. Monitor Performance

**PostHog Events:**
- `blog_article_view` - Track which articles get traffic
- `email_popup_shown` - Email popup displays
- `email_popup_subscribed` - Successful subscriptions
- `blog_to_calculator_click` - CTA clicks

**Google Search Console:**
- Impressions by keyword
- Click-through rate
- Average position
- Top-performing articles

## Revenue Projections

**Conservative (Month 3):**
- 5,000 blog visitors
- 40% email capture = 2,000 emails
- 5% conversion = 100 paid users
- $49/month average = **$4,900 MRR**

**Aggressive (Month 6):**
- 15,000 blog visitors
- 40% email capture = 6,000 emails
- 5% conversion = 300 paid users
- $49/month average = **$14,700 MRR**

## File Structure

```
app/
  blog/
    page.tsx                    # Blog index
    [slug]/
      page.tsx                  # Article template

components/
  blog/
    EmailCapturePopup.tsx       # Email capture popup

lib/
  blog/
    articles.ts                 # 20 article topics

data/
  blog/
    *.json                      # Generated articles
    articles-index.json         # Index file

scripts/
  generate-blog-content.ts      # AI generation
  verify-blog-content.ts        # Quality check
```

## Costs

- **One-time:** $15-20 (Claude API for 20 articles)
- **Ongoing:** $0 (hosting included in Vercel)

## ROI

- **Cost:** $15
- **Return:** $4,900 MRR (Month 3)
- **Annual:** $58,800 ARR
- **ROI:** 392,000% (first year)

## Next Steps

1. **Generate content:** `npm run blog:generate`
2. **Deploy:** Push to main branch
3. **Submit sitemap:** Google Search Console
4. **Promote:** Post to Reddit/LinkedIn (2 articles/week)
5. **Monitor:** Track metrics in PostHog
6. **Optimize:** Update top-performing articles monthly

## Support

- **Documentation:** See BLOG_SEO_IMPLEMENTATION.md for full details
- **Issues:** Check build logs, verify API keys
- **Questions:** Review article metadata in lib/blog/articles.ts
