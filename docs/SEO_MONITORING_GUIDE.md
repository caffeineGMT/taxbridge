# SEO Monitoring Guide

## 🎯 Purpose

This guide provides ongoing SEO monitoring protocols to ensure TaxBridge maintains healthy organic traffic and catches issues before they impact revenue.

---

## 📅 Weekly Monitoring Checklist (Every Monday, 15 minutes)

### 1. Google Search Console Health Check

#### Coverage Report
**URL**: https://search.google.com/search-console → Coverage

**Metrics to Check**:
- ✅ **Valid URLs**: Should increase week-over-week
  - Week 1: 10-30 URLs
  - Week 4: 40-70 URLs
  - Week 8: 90-100+ URLs

- ⚠️ **Errors**: Should be ZERO or decreasing
  - **Server error (5xx)**: Production site down or API errors
  - **Not found (404)**: Broken internal links or deleted pages
  - **Redirect error**: Redirect chains or loops

- ℹ️ **Excluded**: Verify intentional exclusions only
  - `/dashboard`, `/api/*`, `/admin/*` → Expected (robots.txt disallow)
  - Blog articles or landing pages → ❌ INVESTIGATE

**Action Items**:
- If errors > 0: Click into error type → View sample URLs → Fix root cause
- If valid URLs plateau: Check for new crawl errors or sitemap issues
- If critical pages excluded: Use URL Inspection tool to diagnose

#### Performance Report
**URL**: https://search.google.com/search-console → Performance

**Metrics to Check**:
- 📊 **Total Impressions**: Week-over-week growth
  - Week 4: 500-2,000/week
  - Week 8: 2,000-10,000/week
  - Week 12: 10,000-50,000/week

- 🖱️ **Total Clicks**: Week-over-week growth
  - Week 4: 10-50/week
  - Week 8: 50-200/week
  - Week 12: 300-1,500/week

- 📈 **Average CTR**: Should be 2-5%
  - If < 2%: Optimize title tags and meta descriptions
  - If > 5%: Great! Identify what's working and replicate

- 📍 **Average Position**: Should decrease (improve) over time
  - Goal: Top 10 (position ≤ 10) for target keywords

**Action Items**:
- Identify **high impression, low CTR** queries → Optimize title/meta
- Identify **low position** queries → Add internal links, optimize content
- Export top 100 queries to CSV for trend analysis

#### Crawl Stats
**URL**: https://search.google.com/search-console → Settings → Crawl stats

**Metrics to Check**:
- 🕷️ **Crawl requests/day**: Should stabilize at 50-200 requests/day
- ⏱️ **Average response time**: Should be < 500ms
  - If > 1000ms: Performance optimization needed
- 📊 **HTTP status codes**: 200 OK should be 95%+
  - If 404 > 5%: Broken links issue
  - If 500 > 1%: Server stability issue

---

## 🔔 Alert Triggers (React Within 24 Hours)

### Critical Alerts (Revenue Impact)

#### 1. Indexed URLs Drop by 20%+
**Symptom**: Coverage report shows sudden drop in valid URLs
**Causes**:
- Production site down (503 errors)
- Robots.txt accidentally blocking critical pages
- Mass deletion of pages without redirects
- Sitemap corruption

**Action**:
1. Check production site status: `curl -I https://taxbridgecpa.com`
2. Verify robots.txt: `curl https://taxbridgecpa.com/robots.txt`
3. Verify sitemap: `curl https://taxbridgecpa.com/sitemap.xml`
4. Check GSC Coverage → Errors tab for specific issues
5. Fix root cause immediately
6. Use "Validate Fix" in GSC after fix

#### 2. Crawl Errors Spike Above 50
**Symptom**: Coverage report shows 50+ new errors
**Causes**:
- Broken internal links after content update
- API endpoints returning 500 errors
- Missing images or assets (404)

**Action**:
1. GSC → Coverage → Errors → Export error URLs
2. Group errors by type (404, 500, redirect)
3. Fix broken links or restore deleted pages
4. Add 301 redirects for permanently deleted pages
5. Use "Validate Fix" in GSC

#### 3. Manual Action Received
**Symptom**: Email from Google about manual action (penalty)
**Causes**:
- Spam content detected
- Thin/duplicate content
- Unnatural links
- Hacked site

**Action**:
1. GSC → Security & Manual Actions → Review issue
2. Follow Google's recommended fixes
3. Submit reconsideration request after fix
4. Monitor email for Google's response (2-4 weeks)

#### 4. Security Issue Detected
**Symptom**: Email from Google about hacking or malware
**Causes**:
- Site hacked (malware, spam injection)
- Vulnerability exploited

**Action**:
1. **Immediately** take site offline if malware confirmed
2. Clean infected files
3. Update all credentials (Vercel, database, API keys)
4. Fix security vulnerability
5. Request security review in GSC
6. Monitor for re-infection

---

## 📈 Monthly Deep Dive (1st of Month, 30 minutes)

### 1. Keyword Performance Analysis

**Export Data**:
- GSC → Performance → Queries → Download CSV (last 28 days)

**Analysis**:
```
Top 20 Queries by Impressions:
- Which queries have position 11-20? (page 2) → Optimize these first
- Which queries have CTR < 2%? → Rewrite title/meta
- Which queries have position 1-3 but CTR < 10%? → Investigate competitor snippets
```

**Action Items**:
- Create prioritized list of 10 queries to optimize
- Update title tags and meta descriptions
- Add schema markup for featured snippets
- Measure impact in next month's report

### 2. Content Gap Analysis

**Questions**:
- Which blog articles have ZERO impressions after 30 days?
  - Causes: Not indexed, no search demand, poor targeting
  - Fix: Request indexing, update title/keywords, add internal links

- Which geo pages have low traffic despite high search volume?
  - Example: "california ontario tax calculator" has 100 searches/month but 0 clicks
  - Fix: Optimize title, add more content, build backlinks

### 3. Technical SEO Audit

**Checklist**:
- ✅ All blog articles indexed? (42/42 expected)
- ✅ All geo pages indexed? (50/50 expected)
- ✅ No broken links? (Use Screaming Frog or GSC)
- ✅ Site speed < 2 seconds? (Use Lighthouse or PageSpeed Insights)
- ✅ Mobile usability issues? (Check GSC → Mobile Usability)
- ✅ Core Web Vitals green? (Check GSC → Core Web Vitals)

**Tools**:
- Lighthouse CI: `npm run lighthouse:production`
- Sitemap validator: https://www.xml-sitemaps.com/validate-xml-sitemap.html
- Broken link checker: https://www.brokenlinkcheck.com

---

## 🛠️ Troubleshooting Common Issues

### Issue: Sitemap Not Found (404)

**Symptoms**:
- GSC shows "Couldn't fetch" error
- Sitemap URL returns 404

**Diagnosis**:
```bash
curl -I https://taxbridgecpa.com/sitemap.xml
# Should return: HTTP/1.1 200 OK
```

**Causes**:
1. Production deployment failed
2. Sitemap generation error during build
3. Vercel routing issue

**Fixes**:
1. Check production deployment status on Vercel
2. Run `npm run build` locally to verify sitemap generates
3. Redeploy if needed
4. Resubmit sitemap in GSC after fix

### Issue: Organic Traffic Drop 50%+

**Symptoms**:
- GSC Performance report shows sudden traffic drop
- Sessions in Google Analytics drop significantly

**Diagnosis**:
1. **Check GSC Coverage**: Did indexed URLs drop?
2. **Check GSC Performance**: Did impressions or CTR drop?
3. **Check rankings**: Use SEMrush or Ahrefs to check keyword positions
4. **Check algorithm updates**: Google Search Status Dashboard

**Causes & Fixes**:

| Cause | Diagnosis | Fix |
|-------|-----------|-----|
| **Google algorithm update** | Rankings dropped across many keywords | Analyze affected pages, improve content quality, add E-A-T signals |
| **Manual action** | GSC shows manual action notice | Follow Google's guidelines, fix issue, submit reconsideration request |
| **Technical issue** | Site speed slow, many 404/500 errors | Fix performance issues, broken links, server errors |
| **Competitor optimized better** | Lost rankings to specific competitors | Analyze competitor content, improve your content quality/depth |
| **Seasonal drop** | Traffic always drops this time of year | Normal, no action needed unless drop exceeds historical pattern |

### Issue: High Impressions, Low Clicks (CTR < 2%)

**Symptoms**:
- Query has 1,000+ impressions but only 10 clicks (1% CTR)
- Average position is 5-10 but CTR is still low

**Diagnosis**:
1. Google the query yourself and see what results appear
2. Compare your title/meta to competitors
3. Check if featured snippet or "People also ask" is stealing clicks

**Fixes**:
1. **Rewrite title tag**:
   - Add numbers: "7 Ways to..." vs "How to..."
   - Add year: "H1B RSU Tax Guide 2026" vs "H1B RSU Tax Guide"
   - Add benefit: "Save $5K+ on Taxes" vs "Tax Guide"

2. **Optimize meta description**:
   - Include keyword naturally
   - Add call-to-action: "Calculate your tax savings in 60 seconds →"
   - Highlight unique value: "Free tool, no signup required"

3. **Add structured data**:
   - FAQ schema for blog articles
   - HowTo schema for guides
   - SoftwareApplication schema for calculator

---

## 📊 Metrics Dashboard

### KPIs to Track Weekly

| Metric | Week 1 | Week 4 | Week 8 | Week 12 | Tool |
|--------|--------|--------|--------|---------|------|
| **Indexed URLs** | 10-30 | 40-70 | 90-100 | 100+ | GSC Coverage |
| **Search Impressions** | 100-500 | 2K-10K | 10K-50K | 50K-200K | GSC Performance |
| **Organic Clicks** | 5-20 | 50-200 | 300-1K | 1.5K-6K | GSC Performance |
| **Average CTR** | 2-5% | 2-5% | 3-6% | 3-6% | GSC Performance |
| **Avg Position** | 20-50 | 15-30 | 10-20 | 5-15 | GSC Performance |
| **Organic Sessions** | 10-50 | 100-500 | 500-2K | 2K-10K | Google Analytics |
| **Organic Revenue** | $0 | $50-200 | $500-2K | $2K-10K | Stripe |

### Revenue Attribution

**Method**: Use PostHog or Google Analytics to track:
1. **Session source**: Organic search
2. **Landing page**: Which page did they enter?
3. **Conversion event**: Free signup → Pro subscription
4. **Revenue**: Stripe subscription amount

**Example Query (PostHog)**:
```sql
SELECT
  landing_page,
  COUNT(*) as sessions,
  COUNT(DISTINCT user_id) as users,
  SUM(CASE WHEN event = 'subscription_created' THEN 1 ELSE 0 END) as conversions,
  SUM(revenue) as total_revenue
FROM events
WHERE source = 'organic'
  AND timestamp >= '2026-03-01'
GROUP BY landing_page
ORDER BY total_revenue DESC
```

---

## 🚀 Optimization Playbook

### Low-Hanging Fruit (Do First)

#### 1. Optimize Title Tags for Top 20 Queries
**Time**: 2 hours/month
**Impact**: +10-20% CTR
**Method**:
1. Export top 20 queries by impressions from GSC
2. For each query with CTR < 3%, rewrite title tag
3. Deploy changes
4. Measure CTR change after 2 weeks

#### 2. Request Indexing for 0-Impression Pages
**Time**: 30 minutes/month
**Impact**: +10-20% indexed URLs
**Method**:
1. Identify pages with 0 impressions after 30 days
2. Use GSC URL Inspection tool
3. Click "Request Indexing" for each page
4. Follow up after 7 days

#### 3. Fix High-Priority Crawl Errors
**Time**: 1-3 hours/month
**Impact**: +5-10% indexed URLs
**Method**:
1. GSC → Coverage → Errors → Sort by "Number of affected URLs"
2. Fix top 3 error types
3. Use "Validate Fix" button
4. Monitor for re-occurrence

### Advanced Optimizations (Do After Basics)

#### 4. Optimize for Featured Snippets
**Time**: 4 hours/month
**Impact**: +20-50% CTR for top queries
**Method**:
1. Identify queries with position 1-5 but no featured snippet
2. Add FAQ schema or structured content (numbered lists, tables)
3. Answer the query directly in first paragraph
4. Monitor for featured snippet appearance

#### 5. Build Internal Link Network
**Time**: 3 hours/month
**Impact**: +10-20% crawl efficiency
**Method**:
1. Identify high-authority pages (many backlinks, high traffic)
2. Add internal links from these pages to new/low-traffic pages
3. Use descriptive anchor text with target keywords
4. Monitor for ranking improvements

#### 6. Create Content Clusters
**Time**: 8 hours/month
**Impact**: +30-50% topical authority
**Method**:
1. Identify pillar topics (e.g., "H1B RSU Tax")
2. Create 5-10 supporting articles around this topic
3. Interlink all articles to pillar page
4. Update pillar page with links to all supporting articles

---

## 🎯 Success Criteria

### Month 1
✅ 40+ URLs indexed
✅ 500+ organic sessions
✅ $50-200 organic revenue
✅ Zero critical errors

### Month 3
✅ 90+ URLs indexed
✅ 3,000+ organic sessions
✅ $1,000-5,000 organic revenue
✅ Top 10 for 10+ keywords

### Month 6
✅ 100+ URLs indexed
✅ 10,000+ organic sessions
✅ $5,000-20,000 organic revenue
✅ Top 3 for 20+ keywords

---

## 📁 Related Documentation

- `GOOGLE_SEARCH_CONSOLE_SETUP.md` - Initial GSC setup guide
- `SEO_INFRASTRUCTURE_FIX.md` - Technical SEO fix summary
- `app/sitemap.ts` - Sitemap generation logic
- `app/robots.ts` - Robots.txt generation logic

---

**Last Updated**: 2026-03-19
**Next Review**: Weekly (every Monday)
**Owner**: Michael Guo
