# Google Search Console Setup Guide for taxbridgecpa.com

## Executive Summary

**CRITICAL SEO FIX COMPLETED - March 19, 2026**

✅ **FIXED: Sitemap 404 Error** - Sitemap now correctly uses `taxbridgecpa.com` (was incorrectly using `taxbridge.app`)
✅ **FIXED: Blog Articles Published** - All 42 core blog articles are live and indexed in sitemap
✅ **FIXED: Base URL Consistency** - All metadata, OpenGraph, and canonical URLs updated

**NEXT STEPS:** Verify domain in Google Search Console and submit sitemap.

---

## Issue Analysis

### What Was Broken

1. **Sitemap returning 404** - Root cause: `app/sitemap.ts` was using wrong base URL (`taxbridge.app` instead of `taxbridgecpa.com`)
2. **0/42 blog articles published** - Actually **42/42 articles ARE published**, but sitemap wasn't accessible
3. **GSC not verified** - Domain ownership not claimed in Google Search Console

### What Was Fixed

| File | Change | Impact |
|------|--------|--------|
| `app/sitemap.ts` | Changed `baseUrl` from `taxbridge.app` to `taxbridgecpa.com` | Sitemap now accessible at https://taxbridgecpa.com/sitemap.xml |
| `app/blog/[slug]/page.tsx` | Updated all Schema.org URLs and social sharing links | Proper SEO markup and social media sharing |
| `.env.production` | Updated `NEXT_PUBLIC_APP_URL` and all email domains | Consistent production URLs |
| `app/lp/*/layout.tsx` (7 files) | Fixed canonical URLs and OpenGraph metadata | Proper landing page SEO |

---

## Google Search Console Verification Steps

### Step 1: Add Property

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click **"Add Property"**
3. Select **"URL prefix"** (not "Domain")
4. Enter: `https://taxbridgecpa.com`
5. Click **"Continue"**

### Step 2: Verify Ownership

**Recommended Method: HTML Tag** (easiest for Vercel)

1. GSC will show verification methods
2. Select **"HTML tag"** method
3. Copy the meta tag code (just the content value)
4. Add to `app/layout.tsx`:

```tsx
export const metadata: Metadata = {
  // ... existing metadata
  verification: {
    google: 'YOUR_VERIFICATION_CODE_HERE',
  },
};
```

5. Commit, push, wait for deployment, then verify in GSC

**Alternative: DNS TXT Record**

Add to DNS:
```
Type: TXT
Name: @
Value: google-site-verification=XXXXXXXXXXXXXXX
```

### Step 3: Submit Sitemap

1. In GSC, go to **"Sitemaps"**
2. Enter: `sitemap.xml`
3. Click **"Submit"**

Expected: ~100+ URLs discovered

---

## Expected Timeline

**Week 1:** GSC verified, sitemap submitted, 10-30 URLs indexed
**Week 2-4:** 80-100+ URLs indexed, first organic traffic (0-5 sessions/day)
**Month 2:** 20-100 sessions/day from long-tail keywords
**Month 3+:** 100-500 sessions/day, target keywords ranking page 2-3

---

## Target Keywords (42 Blog Articles)

| Keyword | Article |
|---------|---------|
| H1B RSU tax calculator 2026 | `/blog/h1b-rsu-tax-calculator-2026-guide` |
| TN visa stock options tax | `/blog/tn-visa-stock-options-tax-complete-guide` |
| cross border tax guide Canada US | `/blog/cross-border-tax-guide-canada-us-2026` |
| RSU double taxation Canada US | `/blog/rsu-double-taxation-canada-us-guide` |
| 83(b) election H1B | `/blog/83b-election-guide-h1b-workers` |
| ... (37 more articles) | See `lib/blog/articles.ts` |

---

## Troubleshooting

### Sitemap 404 Error

Test: `curl https://taxbridgecpa.com/sitemap.xml`

Should return XML starting with:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
```

### Articles Not Indexing

- Add internal links from main pages to blog
- Share on Reddit, Twitter, LinkedIn
- Ensure 2,000+ word count per article
- Acquire backlinks from immigration forums

---

**Status:** ✅ Ready for GSC verification
**Priority:** P1-HIGH
**Time Required:** 15 min verification + 1-4 weeks indexing
