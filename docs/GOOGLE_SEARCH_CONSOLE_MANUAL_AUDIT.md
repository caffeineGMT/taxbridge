# Google Search Console Manual Audit Guide

**Purpose:** Measure blog ROI by checking indexing status, traffic, and ranking keywords.

**When to run:** Every 7 days during first 90 days, then monthly.

---

## Step 1: Access Google Search Console

1. Visit: https://search.google.com/search-console
2. Login with Google account that owns the property
3. Select property: **taxbridge.vercel.app**

   **⚠️ If property doesn't exist:**
   - Click "Add Property"
   - Choose "URL prefix"
   - Enter: `https://taxbridge.vercel.app`
   - Verify ownership using:
     - **DNS TXT record** (recommended for Vercel)
     - **HTML file upload** (if you have FTP access)
     - **HTML meta tag** (add to `<head>` in app/layout.tsx)

---

## Step 2: Check Indexing Status

### Coverage Report (Legacy)
1. Go to: **Coverage** → **Valid**
2. Record:
   - ✅ **Valid pages indexed:** `_____`
   - ⚠️ **Valid with warnings:** `_____`
   - 🔴 **Excluded:** `_____`
   - 🔴 **Errors:** `_____`

### Pages Report (New GSC)
1. Go to: **Pages** (left sidebar)
2. Scroll to "Why pages aren't indexed"
3. Record:
   - ✅ **Not indexed - Crawled but not indexed:** `_____`
   - 🔴 **Not indexed - Discovered but not crawled:** `_____`
   - 🔴 **Not indexed - Page with redirect:** `_____`
   - 🔴 **Not indexed - Blocked by robots.txt:** `_____`

### Blog-Specific Check
1. Click "Inspect any URL" (top search bar)
2. Test blog URLs:
   - `https://taxbridge.vercel.app/blog/h1b-rsu-tax-calculator-2026-guide`
   - `https://taxbridge.vercel.app/blog/tn-visa-stock-options-tax-complete-guide`
   - `https://taxbridge.vercel.app/blog/cross-border-tax-guide-canada-us-2026`
3. For each URL, check:
   - ✅ **URL is on Google:** Yes / No
   - ⏱️ **Last crawl date:** `_____`
   - 📱 **Mobile-friendly:** Yes / No
   - 🔍 **Canonical URL:** Correct / Incorrect

**Target:** 42/42 blog articles indexed within 30 days

---

## Step 3: Measure Traffic (Last 30 Days)

1. Go to: **Performance** → **Search results**
2. Set date range: **Last 30 days**
3. Record **OVERALL metrics:**
   - **Total Clicks:** `_____`
   - **Total Impressions:** `_____`
   - **Average CTR:** `_____%`
   - **Average Position:** `_____`

4. Filter by **Page** → Filter: `/blog/`
5. Record **BLOG-ONLY metrics:**
   - **Total Clicks:** `_____`
   - **Total Impressions:** `_____`
   - **Average CTR:** `_____%`
   - **Average Position:** `_____`

**Target Benchmarks (30 days post-publish):**
- **Minimum viable:** 10+ clicks, 500+ impressions
- **Good performance:** 50+ clicks, 2,000+ impressions
- **Excellent:** 200+ clicks, 10,000+ impressions

---

## Step 4: Identify Ranking Keywords

1. Go to: **Performance** → **Queries** tab
2. Sort by: **Clicks** (descending)
3. Record **Top 10 keywords:**

| Rank | Keyword | Clicks | Impressions | CTR | Avg Position |
|------|---------|--------|-------------|-----|--------------|
| 1    |         |        |             |     |              |
| 2    |         |        |             |     |              |
| 3    |         |        |             |     |              |
| 4    |         |        |             |     |              |
| 5    |         |        |             |     |              |
| 6    |         |        |             |     |              |
| 7    |         |        |             |     |              |
| 8    |         |        |             |     |              |
| 9    |         |        |             |     |              |
| 10   |         |        |             |     |              |

4. Filter for **blog keywords only:**
   - Add filter: Page → Contains `/blog/`
   - Export top 50 blog keywords to CSV

**Target:** At least 5 keywords ranking in top 20 positions (avg position < 20)

---

## Step 5: Check Sitemap Submission

1. Go to: **Sitemaps** (left sidebar)
2. Check if `https://taxbridge.vercel.app/sitemap.xml` is submitted

   **If NOT submitted:**
   - Click "Add new sitemap"
   - Enter: `sitemap.xml`
   - Click "Submit"
   - Wait 24-48 hours for Google to process

3. Record sitemap status:
   - ✅ **Submitted:** Yes / No
   - ✅ **Successfully indexed:** `_____` URLs
   - 🔴 **Errors:** `_____` URLs
   - ⏱️ **Last read:** `_____`

**Target:** 0 errors, all blog URLs discovered

---

## Step 6: Analyze Top Performing Content

1. Go to: **Performance** → **Pages** tab
2. Filter date range: **Last 30 days**
3. Sort by: **Clicks** (descending)
4. Identify **Top 5 blog articles:**

| Rank | Blog Article URL | Clicks | Impressions | CTR | Position |
|------|------------------|--------|-------------|-----|----------|
| 1    |                  |        |             |     |          |
| 2    |                  |        |             |     |          |
| 3    |                  |        |             |     |          |
| 4    |                  |        |             |     |          |
| 5    |                  |        |             |     |          |

5. For each top article, click URL and check:
   - **Which keywords drive traffic?** (Queries tab)
   - **What's the click-through rate?** (CTR)
   - **Is it ranking on page 1?** (Position < 10)

**Insight:** Double down on topics similar to top performers

---

## Step 7: Identify Underperformers

1. Go to: **Performance** → **Pages** tab
2. Sort by: **Impressions** (descending)
3. Find pages with **high impressions but low clicks** (CTR < 2%)

| Blog Article | Impressions | Clicks | CTR | Position | Issue |
|--------------|-------------|--------|-----|----------|-------|
|              |             |        |     |          | Bad title/meta |
|              |             |        |     |          | Bad title/meta |
|              |             |        |     |          | Bad title/meta |

**Action:** Rewrite meta titles and descriptions to improve CTR

---

## Step 8: 30-Day Decision Framework

**IF after 30 days from blog publish date:**

### ✅ CONTINUE CURRENT STRATEGY
- **Criteria:**
  - 10+ organic clicks/day
  - At least 5 keywords ranking in top 20
  - 3+ blog articles driving traffic
- **Action:**
  - Publish 10 more articles on similar topics
  - Build backlinks to top performers
  - Optimize CTR on high-impression, low-click pages

### ⚠️ OPTIMIZE & MONITOR
- **Criteria:**
  - 1-10 clicks/day
  - 1-5 keywords ranking in top 50
  - Only 1-2 articles indexed
- **Action:**
  - Improve on-page SEO (titles, meta descriptions)
  - Add internal links between blog articles
  - Build 5-10 high-quality backlinks
  - Wait another 30 days before pivoting

### 🚨 PIVOT CONTENT STRATEGY IMMEDIATELY
- **Criteria:**
  - Zero organic clicks after 30 days
  - Zero keywords ranking in top 50
  - <10% of blog articles indexed
- **Action:**
  - **Stop creating more blog content**
  - **Pivot to Reddit organic marketing** (r/cscareerquestions, r/h1b, r/tax)
  - **Invest in Product Hunt launch** instead
  - **Run small Google Ads test** ($500 budget)
  - **Focus on conversion optimization** (landing page A/B tests)
  - **Build referral program** for viral growth

---

## Step 9: Save Audit Results

1. Copy all metrics above into:
   - `docs/seo-traffic-audit-YYYY-MM-DD.md`
2. Run automated audit:
   ```bash
   npm run audit:seo
   ```
3. Compare automated report with GSC manual data
4. Make strategic decision based on 30-day threshold

---

## Quick Reference: GSC URLs

- **Main dashboard:** https://search.google.com/search-console
- **Performance report:** https://search.google.com/search-console/performance/search-analytics
- **Coverage report:** https://search.google.com/search-console/coverage
- **Sitemaps:** https://search.google.com/search-console/sitemaps
- **URL inspection:** https://search.google.com/search-console/inspect

---

## Troubleshooting

### Blog articles not indexed after 7 days
1. Check robots.txt doesn't block /blog/
2. Verify sitemap includes all blog URLs
3. Use "Request Indexing" in URL Inspection tool
4. Check for duplicate content issues
5. Verify blog pages return HTTP 200 (not 404/500)

### Zero impressions after 14 days
1. Keywords too competitive (try longer-tail)
2. Content too thin (<800 words)
3. Missing target keywords in title/H1/first paragraph
4. No backlinks from authoritative sites
5. Site too new (domain age <3 months)

### High impressions but zero clicks
1. Meta title not compelling
2. Meta description doesn't match search intent
3. Competing with featured snippets
4. Ranking position too low (>20)
5. Missing schema markup

---

**Next Audit:** _____ (7 days from today)

**Assigned to:** CEO / Marketing Lead

**Estimated time:** 20 minutes
