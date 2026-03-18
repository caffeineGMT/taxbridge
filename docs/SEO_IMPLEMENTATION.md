# Programmatic SEO Implementation

## Overview

TaxBridge's programmatic SEO system generates **50+ geo-targeted landing pages** to capture long-tail search traffic for cross-border tax queries. Each page is optimized for specific location combinations (US state → Canadian province) and employer-specific RSU tax calculations.

## Page Structure

### Total Pages: 50

#### 1. Geo Pages (25 pages)
5 US states × 5 Canadian provinces = 25 pages

**US States:**
- Washington (WA) - 0% state tax
- California (CA) - 13.3% top rate
- New York (NY) - 10.9% top rate
- Texas (TX) - 0% state tax
- Massachusetts (MA) - 5% flat rate

**Canadian Provinces:**
- British Columbia (BC) - 20.5% top rate
- Ontario (ON) - 13.16% top rate
- Alberta (AB) - 15% top rate
- Quebec (QC) - 25.75% top rate
- Manitoba (MB) - 17.4% top rate

**URL Format:** `/tax-calculator/{state}-{province}`
- Example: `/tax-calculator/wa-bc`
- Example: `/tax-calculator/ca-on`

#### 2. Employer-Specific Pages (25 pages)
5 employers × 5 provinces = 25 pages

**Employers:**
- Meta (HQ: Menlo Park, CA)
- Amazon (HQ: Seattle, WA)
- Google (HQ: Mountain View, CA)
- Microsoft (HQ: Redmond, WA)
- Apple (HQ: Cupertino, CA)

**URL Format:** `/tax-calculator/{employer}-{province}`
- Example: `/tax-calculator/meta-bc`
- Example: `/tax-calculator/amazon-on`

## Technical Implementation

### 1. Dynamic Route with Static Generation
- **Route:** `app/tax-calculator/[slug]/page.tsx`
- **Method:** Next.js `generateStaticParams()` pre-renders all 50 pages at build time
- **Benefits:** Ultra-fast page loads, perfect SEO indexing, zero client-side routing delay

### 2. Data Layer
- **File:** `lib/seo/geo-data.ts`
- **Exports:**
  - `US_STATES` - Tax rates and details for each state
  - `PROVINCES` - Tax rates and details for each province
  - `EMPLOYERS` - Company info and headquarters
  - `generateAllPageParams()` - Generates all 50 combinations
  - `getPageMetadata()` - Returns page-specific title, description, data

### 3. Component Architecture
- **Main Page:** `app/tax-calculator/[slug]/page.tsx`
  - Parses slug (e.g., "wa-bc" or "meta-bc")
  - Generates dynamic H1, meta tags, structured data
  - Renders location-specific content
- **Calculator Widget:** `app/tax-calculator/[slug]/TaxCalculatorWidget.tsx`
  - Pre-filled with location defaults
  - Real-time tax calculations
  - Email capture with location tracking

### 4. SEO Features

#### Meta Tags
- Unique title: "H-1B RSU Tax Calculator: {State} to {Province}"
- Custom description with tax rates
- Keywords targeting location + "H1B RSU tax", "cross border tax"

#### Structured Data (JSON-LD)
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Do I need to pay {State} tax if I live in {Province}?",
      "acceptedAnswer": { ... }
    }
  ]
}
```

#### Location-Specific Content
Each page includes:
- State tax facts (rate, filing requirements, sourcing rules)
- Provincial tax facts (residency rules, FTC forms)
- US-Canada Treaty Article XV explanation
- Required forms checklist (12+ forms)
- 5 geo-specific FAQs
- 6 internal links to related pages

#### Internal Linking
- Each page links to 6 related geo pages
- Cross-links to `/h1b-rsu-tax-guide` and `/canada-tax-filing-checklist`
- Sidebar to main `/dashboard`

### 5. Sitemap Generation
- **File:** `app/sitemap.ts`
- Dynamically generates sitemap with all 50 pages
- Accessible at: `https://taxbridge.app/sitemap.xml`
- Priority: 0.85-0.9 for SEO pages (employer pages slightly higher)
- Change frequency: Weekly

### 6. Robots.txt
- **File:** `public/robots.txt`
- Explicitly allows `/tax-calculator/` routes
- Blocks admin routes, API routes
- Links to sitemap

## Content Generation (Optional)

### AI-Generated Articles
Script: `scripts/generate-seo-content.ts`

Generates 800-1000 word articles for each geo combination using Claude AI:
- State-specific sourcing rules
- Province-specific residency rules
- Treaty Article XV implications
- Common mistakes
- Filing deadlines
- Examples with dollar amounts

**Usage:**
```bash
# Requires ANTHROPIC_API_KEY in .env
npm run seo:generate
```

**Output:** `content/geo-articles/{slug}.md`

**Cost Estimate:** 50 pages × ~2000 tokens = ~$1.50 using Claude 3.5 Sonnet

Articles are saved with frontmatter metadata for future use (blog posts, email drip campaigns).

## Verification & Testing

### Verify Page Count
```bash
npm run seo:verify
```
Output:
- Total pages: 50
- Geo pages: 25
- Employer pages: 25
- Sample URLs
- Target keywords

### Build Test
```bash
npm run build
```
Next.js will pre-render all 50 pages. Check output:
```
Route (app)                                Size     First Load JS
┌ ○ /tax-calculator/[slug]                 ...      ...
├   ├ /tax-calculator/wa-bc
├   ├ /tax-calculator/ca-on
├   ├ /tax-calculator/meta-bc
...
```

### Lighthouse Audit
Each page should score 95+ on:
- Performance (static pages = fast)
- SEO (meta tags, structured data)
- Best Practices

## Target Keywords & Rankings

### Primary Keywords (Top 5 Goal)
1. `{state} {province} H1B tax calculator`
2. `{employer} RSU tax {province}`
3. `cross border tax calculator`
4. `US Canada tax treaty calculator`
5. `foreign tax credit optimizer`

### Long-Tail Keywords (Top 10 Goal)
- "Meta RSU tax Washington to BC"
- "California Ontario H1B tax filing"
- "Amazon RSU tax Seattle Canada"
- "Do I pay California tax if I live in Ontario"
- "Foreign tax credit {state} {province}"

### Monthly Search Volume Estimates
- "H1B RSU tax calculator": 500-1000
- State-specific (e.g., "WA BC tax"): 100-200 each
- Employer-specific (e.g., "Meta RSU tax"): 200-500 each
- **Total addressable:** ~15K monthly searches

### Traffic Projections
- **30 days:** 5-10 keywords rank #8-15 → ~50 visits/day
- **90 days:** 30 keywords rank top 5 → ~200 visits/day
- **6 months:** 50 keywords rank top 3 → ~500 visits/day
- **Conversion (5%):** 10-25 signups/day from SEO alone at 6 months

## Backlink Strategy

### High-Value Link Targets
1. **Immigration Forums:**
   - MyVisaJobs.com (guest post: "Tax Guide for H-1B Workers Moving to Canada")
   - Immihelp.com (resource listing)
   - CanadaVisa.com forums (signature link)

2. **Finance Blogs:**
   - Bogleheads forum (cross-border tax thread)
   - Reddit r/PersonalFinanceCanada (helpful resource)
   - Reddit r/FinancialIndependence (FIRE + cross-border)

3. **Tech Communities:**
   - Blind (verified post from tech worker account)
   - Hacker News (Show HN: Free Cross-Border Tax Calculator)
   - Levels.fyi comments

4. **Local Business:**
   - Vancouver Tech Slack groups
   - Toronto Tech Meetups
   - BC Tech Association resource page

### Link Building Tactics
- Write 5 guest posts on immigration/tax blogs → link to geo pages
- Create embeddable calculator widget → backlinks from tax forums
- Offer free tax audit to influencers → testimonial + link
- Partner with cross-border CPAs → mutual referrals + links

## Monitoring & Optimization

### Track Rankings
**Tool:** Ahrefs or SEMrush
**Cadence:** Weekly

Track positions for:
- All 50 page titles
- Top 20 keywords
- Competitor rankings (Sprintax, TurboTax, H&R Block)

### Google Search Console
- Submit sitemap
- Monitor impressions, clicks, CTR per page
- Fix crawl errors within 24 hours
- Optimize meta descriptions for low-CTR pages

### A/B Testing Opportunities
1. **Title Format:**
   - Option A: "H-1B RSU Tax Calculator: {State} to {Province}"
   - Option B: "{State} to {Province} Tax Calculator for H-1B Workers"

2. **CTA Placement:**
   - Test email capture above vs. below calculator
   - Test "Save Calculation" vs. "Get Full Report"

3. **Content Length:**
   - Short pages (500 words) vs. long (1500+ words)
   - Measure time-on-page, bounce rate, conversion rate

## Success Metrics

### 30-Day Goals
- [ ] All 50 pages indexed by Google (`site:taxbridge.app/tax-calculator`)
- [ ] 5 keywords rank #8-20
- [ ] 50 organic visits/day to SEO pages
- [ ] 2-3 email signups from SEO traffic

### 90-Day Goals
- [ ] 30 keywords rank top 5
- [ ] 200 organic visits/day
- [ ] 10 signups/day from SEO (5% conversion)
- [ ] 5 high-quality backlinks from DA 40+ domains

### 6-Month Goals
- [ ] 50 keywords rank top 3
- [ ] 500 organic visits/day
- [ ] 25 signups/day from SEO
- [ ] Featured snippet for "H1B RSU tax calculator"
- [ ] 20+ backlinks from immigration/finance/tech sites

## Maintenance

### Monthly
- Update tax rates (if changed)
- Add new employer pages (e.g., Netflix, Salesforce)
- Add new province pages (e.g., Nova Scotia, Saskatchewan)
- Refresh content with current filing deadlines

### Quarterly
- Audit page performance (GA4 analytics)
- Remove underperforming pages (< 10 visits/month)
- Expand high-performing pages (add content, examples)
- Test new keyword opportunities

### Annually
- Major tax law changes (update all pages)
- Treaty changes (Article XV updates)
- CRA/IRS form changes
- Refresh AI-generated content

## File Structure
```
cross-border-tax/
├── app/
│   ├── tax-calculator/
│   │   └── [slug]/
│   │       ├── page.tsx              # Main dynamic page
│   │       └── TaxCalculatorWidget.tsx
│   └── sitemap.ts                    # Dynamic sitemap
├── lib/
│   └── seo/
│       └── geo-data.ts               # Data layer
├── content/
│   └── geo-articles/                 # AI-generated content
│       ├── wa-bc.md
│       ├── meta-bc.md
│       └── ...
├── scripts/
│   ├── generate-seo-content.ts       # Claude AI generator
│   └── verify-seo-pages.ts           # Verification script
├── public/
│   └── robots.txt                    # SEO crawling rules
└── docs/
    └── SEO_IMPLEMENTATION.md         # This file
```

## Next Steps

1. **Deploy to Production**
   ```bash
   npm run build
   npm run start
   ```

2. **Submit to Search Engines**
   - Google Search Console: Submit sitemap
   - Bing Webmaster Tools: Submit sitemap
   - Verify ownership via DNS/HTML

3. **Generate Content (Optional)**
   ```bash
   export ANTHROPIC_API_KEY=sk-...
   npm run seo:generate
   ```

4. **Monitor Initial Indexing**
   - Day 1-7: Pages discovered
   - Day 7-14: Pages indexed
   - Day 14-30: First rankings appear

5. **Start Link Building**
   - Write 3 guest posts in first 30 days
   - Reach out to 10 immigration/finance blogs
   - Post calculator on Reddit (r/PersonalFinanceCanada)

## ROI Calculation

### Investment
- Development: 8 hours × $150/hr = **$1,200** (one-time)
- Content generation: $1.50 (optional)
- Link building: 4 hours/month × $100/hr = **$400/month**

### Return (6-month projection)
- 25 signups/day × 30 days × 5% paid conversion = **37 paid customers/month**
- $29/month × 37 customers = **$1,073 MRR**
- 12-month LTV: $1,073 × 12 × 80% retention = **$10,300 annual value**

**Payback Period:** < 2 months
**12-month ROI:** 757% ($10,300 / $1,200 + $2,400)

---

Built for revenue. Built to rank. Built to scale. 🚀
