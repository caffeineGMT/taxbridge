# Google Search Console Setup Guide for TaxBridge

## Overview
This guide provides step-by-step instructions for setting up and monitoring TaxBridge in Google Search Console (GSC) to track organic search performance, identify crawl errors, and optimize SEO.

---

## 1. Property Setup

### 1.1 Add Property to GSC
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click **"Add Property"**
3. Choose **"URL prefix"** property type
4. Enter: `https://taxbridge.app`
5. Click **"Continue"**

### 1.2 Verify Ownership
**Method 1: HTML Meta Tag (Recommended)**
- GSC will provide a meta tag like: `<meta name="google-site-verification" content="ABC123..." />`
- This is already configured in `app/layout.tsx` line 91:
  ```typescript
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  }
  ```
- Add the verification code to your `.env.production` file:
  ```bash
  NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=ABC123...
  ```
- Rebuild and deploy the site
- Return to GSC and click **"Verify"**

**Method 2: DNS Verification (Alternative)**
- If you control the domain DNS (taxbridge.app), add a TXT record provided by GSC
- Format: `google-site-verification=ABC123...`
- Wait 24-48 hours for DNS propagation
- Click **"Verify"** in GSC

---

## 2. Submit Sitemap

### 2.1 Sitemap Location
- TaxBridge has a dynamically generated sitemap at: `https://taxbridge.app/sitemap.xml`
- This is configured in `app/sitemap.ts` and includes:
  - Static pages (homepage, pricing, calculator, blog, enterprise, etc.)
  - Geo-targeted landing pages (state-province combinations)
  - Blog articles

### 2.2 Submit to GSC
1. In GSC, go to **Sitemaps** (left sidebar)
2. Enter: `sitemap.xml`
3. Click **"Submit"**
4. GSC will process the sitemap within 24-48 hours
5. Monitor the **"Sitemaps"** section for:
   - **Discovered URLs**: Number of pages found in sitemap
   - **Indexed URLs**: Number of pages actually indexed by Google
   - **Errors**: Any issues preventing indexing

### 2.3 Verify Sitemap Accessibility
Run this command to test sitemap locally:
```bash
curl https://taxbridge.app/sitemap.xml
```

Expected output: XML file with all page URLs and metadata (lastModified, changeFrequency, priority).

---

## 3. Configure robots.txt in GSC

### 3.1 Verify robots.txt
- TaxBridge has a `robots.txt` file at: `https://taxbridge.app/robots.txt`
- Located in: `public/robots.txt`
- Test it:
  ```bash
  curl https://taxbridge.app/robots.txt
  ```

### 3.2 Test robots.txt in GSC
1. In GSC, go to **Settings** → **robots.txt Tester** (in legacy tools)
2. Verify the file is accessible
3. Test specific URLs to ensure they're allowed:
   - Test: `https://taxbridge.app/` → Should be **Allowed**
   - Test: `https://taxbridge.app/api/health` → Should be **Disallowed**
   - Test: `https://taxbridge.app/dashboard` → Should be **Disallowed**

---

## 4. Monitor Core Metrics

### 4.1 Coverage Report
- Go to **Coverage** (or **Index → Coverage** in new GSC)
- Monitor:
  - **Valid pages**: Indexed successfully
  - **Errors**: Pages with indexing issues (404s, server errors, blocked by robots.txt)
  - **Warnings**: Soft blocks (noindex tags, redirect chains)
  - **Excluded**: Intentionally excluded (API routes, dashboard pages)

**Action Items:**
- Fix any errors causing indexing failures
- Review "Excluded" pages to ensure they're intentionally blocked
- Check for duplicate content or canonical issues

### 4.2 Performance Report
- Go to **Performance**
- Key metrics:
  - **Total Clicks**: Organic traffic from Google
  - **Total Impressions**: How often TaxBridge appears in search results
  - **Average CTR**: Click-through rate (target: >3% for SERP position 1-3)
  - **Average Position**: Average ranking position (target: <10 for primary keywords)

**Primary Keywords to Monitor:**
- `h1b rsu tax calculator`
- `cross-border tax calculator`
- `tn visa tax calculator`
- `us canada tax calculator`
- `foreign tax credit calculator`

**How to Track:**
1. In Performance, click **+ New** → **Query**
2. Enter keyword (e.g., "h1b rsu tax calculator")
3. Monitor impressions, clicks, CTR, and position over time

### 4.3 URL Inspection Tool
- Use **URL Inspection** (top search bar in GSC)
- Enter any TaxBridge URL to check:
  - **Indexing status**: Is it indexed?
  - **Coverage**: Any errors?
  - **Enhancements**: Mobile usability, Core Web Vitals
  - **Live Test**: Request fresh crawl
  - **Request Indexing**: Force Google to re-crawl

**When to Use:**
- After deploying new pages (e.g., new blog post, landing page)
- After fixing SEO issues (e.g., meta description updates, canonical fixes)
- After major site changes (e.g., sitemap updates)

---

## 5. Mobile Usability & Core Web Vitals

### 5.1 Mobile Usability Report
- Go to **Enhancements** → **Mobile Usability**
- Fix any errors:
  - Text too small to read
  - Clickable elements too close together
  - Viewport not set
  - Content wider than screen

### 5.2 Core Web Vitals Report
- Go to **Enhancements** → **Core Web Vitals**
- Monitor:
  - **LCP (Largest Contentful Paint)**: Target <2.5s
  - **FID (First Input Delay)**: Target <100ms
  - **CLS (Cumulative Layout Shift)**: Target <0.1

**TaxBridge Specific Checks:**
- Landing pages should have **Good** ratings
- Calculator page should have **Good** LCP (critical for conversion)
- Blog pages should have **Good** CLS (no layout shifts during load)

---

## 6. Structured Data Monitoring

### 6.1 Verify Rich Results
- Go to **Enhancements** → **Unparsed Structured Data** (if available)
- Or use: [Google Rich Results Test](https://search.google.com/test/rich-results)
- Test these URLs:
  - `https://taxbridge.app` (FAQ schema, SoftwareApplication schema)
  - `https://taxbridge.app/blog/[article-slug]` (Article schema)
  - `https://taxbridge.app/h1b-rsu-tax-guide` (HowTo schema)

**Expected Rich Results:**
- **FAQ**: Questions appear in SERPs
- **SoftwareApplication**: App details, ratings, pricing
- **Article**: Publish date, author, image in SERPs
- **HowTo**: Step-by-step guide in SERPs

### 6.2 Validate Structured Data
TaxBridge uses JSON-LD structured data (configured in `lib/seo/structured-data.ts`). Check:
- Homepage: Organization, FAQ, SoftwareApplication, HowTo schemas
- Blog: Article schema
- Calculator: SoftwareApplication schema with AggregateRating

---

## 7. Weekly Monitoring Checklist

### Every Monday (5 minutes)
- [ ] **Coverage Report**: Check for new errors or warnings
- [ ] **Performance Report**: Review clicks, impressions, CTR for top 10 keywords
- [ ] **Core Web Vitals**: Ensure all pages have "Good" ratings
- [ ] **Manual Penalties**: Check **Security & Manual Actions** for penalties

### After Every Deploy (2 minutes)
- [ ] **URL Inspection**: Test newly deployed pages
- [ ] **Request Indexing**: Force re-crawl of updated pages
- [ ] **Sitemap Status**: Verify sitemap re-crawled

### Monthly Deep Dive (30 minutes)
- [ ] **Top Queries**: Identify new keyword opportunities
- [ ] **Top Pages**: Analyze best-performing content
- [ ] **Impressions without Clicks**: Find pages with high impressions but low CTR → improve meta descriptions
- [ ] **Crawl Stats**: Check crawl frequency and bandwidth (under **Settings** → **Crawl Stats**)

---

## 8. Common Issues & Fixes

### Issue 1: "Discovered - Currently not indexed"
**Cause:** Page found in sitemap but not yet crawled/indexed.
**Fix:**
1. Use URL Inspection → "Request Indexing"
2. Check page quality (thin content, duplicate content)
3. Add internal links from high-authority pages
4. Improve page value (add unique content, target specific keywords)

### Issue 2: "Crawled - Currently not indexed"
**Cause:** Page crawled but deemed low-quality or duplicate.
**Fix:**
1. Add unique, valuable content (800+ words for blog posts)
2. Check for duplicate content (use `site:taxbridge.app "exact duplicate phrase"` in Google)
3. Improve E-A-T signals (author bio, credentials, citations)

### Issue 3: Low CTR (<2%)
**Cause:** Meta description not compelling or title not clear.
**Fix:**
1. Improve title: Include primary keyword, benefit, and year (e.g., "H1B RSU Tax Calculator 2025 - Free Cross-Border Tool")
2. Improve description: Add CTA, specific numbers, urgency (e.g., "Save $2K-$12K annually. Calculate in 2 minutes. CPA-verified.")
3. Add structured data for rich snippets (FAQ, ratings)

### Issue 4: Mobile Usability Errors
**Cause:** Responsive design issues.
**Fix:**
1. Test on real devices (iOS Safari, Android Chrome)
2. Fix touch target sizes (minimum 44x44px)
3. Fix viewport issues (ensure `<meta name="viewport">` is set)
4. Test with Chrome DevTools mobile emulation

---

## 9. Advanced: Search Analytics Export

### Export Data for Analysis
1. Go to **Performance**
2. Set date range (e.g., last 28 days)
3. Apply filters (e.g., country: Canada, United States)
4. Click **Export** → Download CSV
5. Analyze in Excel/Google Sheets:
   - Sort by impressions (find high-volume, low-CTR keywords)
   - Sort by clicks (find top-performing pages)
   - Sort by position (find pages on page 2 → optimize to reach page 1)

### Integrate with Google Analytics
- Link GSC with Google Analytics 4 (GA4)
- In GA4: **Admin** → **Search Console Links** → Link GSC property
- View GSC data in GA4 under **Acquisition** → **Search Console**

---

## 10. SEO Health Scorecard

| Metric | Target | Current Status | Action |
|--------|--------|----------------|--------|
| **GSC Verified** | ✅ Yes | ⏳ Pending | Add `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` env var |
| **Sitemap Submitted** | ✅ Yes | ⏳ Pending | Submit `sitemap.xml` in GSC |
| **Index Coverage** | 95%+ pages indexed | ⏳ Pending | Monitor after sitemap submission |
| **Core Web Vitals** | All "Good" | ⏳ Pending | Run Lighthouse CI (see Sprint 06 tasks) |
| **Mobile Usability** | 0 errors | ⏳ Pending | Test after GSC setup |
| **Structured Data** | 0 errors | ✅ Good | JSON-LD implemented for FAQ, Article, HowTo |
| **Crawl Errors** | <5 errors | ⏳ Pending | Monitor after GSC setup |

---

## Next Steps

1. **Verify ownership** in GSC (add `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` to `.env.production`)
2. **Submit sitemap** (`sitemap.xml`)
3. **Request indexing** for top priority pages:
   - `/` (homepage)
   - `/us-canada-tax-calculator`
   - `/pricing`
   - `/h1b-rsu-tax-guide`
   - `/lp/h1b-rsu-calculator`
4. **Monitor for 7 days** and fix any errors
5. **Weekly check** on Performance report to track keyword rankings

---

## Support
If you encounter issues with GSC setup, refer to:
- [Google Search Console Help Center](https://support.google.com/webmasters/)
- [Next.js SEO Best Practices](https://nextjs.org/learn/seo/introduction-to-seo)
- TaxBridge SEO library: `lib/seo/metadata.ts` and `lib/seo/structured-data.ts`
