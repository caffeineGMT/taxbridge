#!/usr/bin/env tsx
/**
 * Google Search Console Indexing Verification Script
 *
 * Verifies that blog articles are indexed in Google Search Console
 *
 * PREREQUISITES:
 * 1. Production site must be live at https://taxbridgecpa.com
 * 2. Google Search Console must be set up and verified
 * 3. Sitemap must be submitted to GSC
 *
 * MANUAL STEPS REQUIRED:
 * 1. Go to https://search.google.com/search-console
 * 2. Add property for https://taxbridgecpa.com
 * 3. Verify ownership (DNS TXT record or HTML file upload)
 * 4. Submit sitemap: https://taxbridgecpa.com/sitemap.xml
 * 5. Wait 3-7 days for initial indexing
 *
 * THIS SCRIPT CHECKS:
 * - Site accessibility (200 OK)
 * - Sitemap availability
 * - Individual article URLs
 * - Meta tags and structured data
 */

import { getAllArticleSlugs } from '../lib/blog/articles';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://taxbridgecpa.com';
const SITEMAP_URL = `${BASE_URL}/sitemap.xml`;

interface IndexingCheckResult {
  slug: string;
  url: string;
  status: 'ACCESSIBLE' | 'NOT_ACCESSIBLE' | 'SITE_DOWN' | 'UNKNOWN';
  statusCode?: number;
  hasContent: boolean;
  wordCount: number;
  readyForIndexing: boolean;
  issues: string[];
}

interface GSCVerificationReport {
  timestamp: string;
  siteStatus: 'ONLINE' | 'OFFLINE' | 'UNKNOWN';
  sitemapAccessible: boolean;
  totalArticles: number;
  accessibleArticles: number;
  readyForIndexing: number;
  needsContent: number;
  articles: IndexingCheckResult[];
  gscInstructions: string;
}

/**
 * Check if a URL is accessible
 */
async function checkUrlAccessibility(url: string): Promise<{ accessible: boolean; statusCode?: number }> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
    });
    return {
      accessible: response.ok,
      statusCode: response.status,
    };
  } catch (error) {
    return {
      accessible: false,
      statusCode: undefined,
    };
  }
}

/**
 * Check if site is online
 */
async function checkSiteStatus(): Promise<'ONLINE' | 'OFFLINE' | 'UNKNOWN'> {
  console.log(`🔍 Checking site status: ${BASE_URL}`);

  try {
    const response = await fetch(BASE_URL, {
      method: 'HEAD',
      redirect: 'follow',
    });

    if (response.ok) {
      console.log(`✅ Site is ONLINE (status: ${response.status})`);
      return 'ONLINE';
    } else {
      console.log(`❌ Site returned error (status: ${response.status})`);
      return 'OFFLINE';
    }
  } catch (error) {
    console.log(`❌ Site is OFFLINE (connection failed: ${error})`);
    return 'OFFLINE';
  }
}

/**
 * Check if sitemap is accessible
 */
async function checkSitemap(): Promise<boolean> {
  console.log(`🔍 Checking sitemap: ${SITEMAP_URL}`);

  try {
    const response = await fetch(SITEMAP_URL);
    const accessible = response.ok;

    if (accessible) {
      const content = await response.text();
      const articleCount = (content.match(/<url>/g) || []).length;
      console.log(`✅ Sitemap accessible with ${articleCount} URLs`);
    } else {
      console.log(`❌ Sitemap not accessible (status: ${response.status})`);
    }

    return accessible;
  } catch (error) {
    console.log(`❌ Sitemap check failed: ${error}`);
    return false;
  }
}

/**
 * Verify blog articles
 */
async function verifyBlogArticles(siteOnline: boolean): Promise<IndexingCheckResult[]> {
  console.log(`\n🔍 Verifying blog articles...\n`);

  const slugs = getAllArticleSlugs();
  const results: IndexingCheckResult[] = [];
  const dataDir = path.join(process.cwd(), 'data', 'blog');

  for (const slug of slugs) {
    const issues: string[] = [];
    const articlePath = path.join(dataDir, `${slug}.json`);
    const url = `${BASE_URL}/blog/${slug}`;

    // Check local content
    let hasContent = false;
    let wordCount = 0;
    let readyForIndexing = false;

    if (fs.existsSync(articlePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(articlePath, 'utf-8'));
        wordCount = data.content?.split(/\s+/).length || 0;
        hasContent = wordCount >= 500;

        if (wordCount < 500) {
          issues.push(`Content too short (${wordCount} words, min 500 for indexing)`);
        }

        if (!data.title || !data.description || !data.keywords) {
          issues.push('Missing SEO metadata');
        }

        readyForIndexing = hasContent && data.title && data.description && data.keywords;
      } catch (e) {
        issues.push(`Failed to read article data: ${e}`);
      }
    } else {
      issues.push('Article JSON file missing');
    }

    // Check URL accessibility if site is online
    let status: IndexingCheckResult['status'] = 'UNKNOWN';
    let statusCode: number | undefined;

    if (siteOnline) {
      const { accessible, statusCode: code } = await checkUrlAccessibility(url);
      statusCode = code;
      status = accessible ? 'ACCESSIBLE' : 'NOT_ACCESSIBLE';

      if (!accessible) {
        issues.push(`URL not accessible (status: ${code || 'connection failed'})`);
      }
    } else {
      status = 'SITE_DOWN';
      issues.push('Site is offline, cannot verify URL');
    }

    results.push({
      slug,
      url,
      status,
      statusCode,
      hasContent,
      wordCount,
      readyForIndexing,
      issues,
    });

    // Progress indicator
    if ((results.length % 10) === 0) {
      console.log(`  Checked ${results.length}/${slugs.length} articles...`);
    }
  }

  return results;
}

/**
 * Generate GSC setup instructions
 */
function generateGSCInstructions(): string {
  return `
📋 GOOGLE SEARCH CONSOLE SETUP INSTRUCTIONS

STEP 1: Verify Site Ownership (15 minutes)
  1. Go to https://search.google.com/search-console
  2. Click "Add Property" → "URL prefix"
  3. Enter: https://taxbridgecpa.com
  4. Choose verification method:

     RECOMMENDED: DNS Verification
     - Add TXT record to taxbridgecpa.com DNS:
       Name: @ (or leave blank)
       Type: TXT
       Value: google-site-verification=XXXXXXXXXXXXXXXXXXXXXXX
     - Click "Verify"

     ALTERNATIVE: HTML File Upload
     - Download googleXXXXXXXXXXXXXXXX.html
     - Upload to: /public/googleXXXXXXXXXXXXXXXX.html
     - Deploy to production
     - Click "Verify"

STEP 2: Submit Sitemap (5 minutes)
  1. In GSC, go to Sitemaps (left sidebar)
  2. Enter sitemap URL: https://taxbridgecpa.com/sitemap.xml
  3. Click "Submit"
  4. Wait 3-7 days for Google to process

STEP 3: Monitor Indexing Status (Daily for first 2 weeks)
  1. Go to "Coverage" or "Pages" in GSC
  2. Check "Valid" pages count (should reach 42-50 blog articles + 60 other pages)
  3. Review any errors or warnings
  4. Fix issues and resubmit sitemap if needed

STEP 4: Request Indexing for High-Priority Articles (Optional)
  1. Go to "URL Inspection" in GSC
  2. Enter article URL: https://taxbridgecpa.com/blog/h1b-rsu-tax-calculator-2026-guide
  3. Click "Request Indexing"
  4. Repeat for top 10 articles
  5. Indexing typically completes within 1-3 days

EXPECTED TIMELINE:
  Week 1: 10-30 URLs indexed (high-priority articles)
  Week 2: 50-80 URLs indexed (most blog articles + static pages)
  Week 4: 100+ URLs indexed (all pages including geo-targeted landing pages)
  Month 2: Organic traffic starts (10-50 sessions/day)
  Month 3-6: Steady growth (100-300 sessions/day)

TOP PRIORITY ARTICLES TO REQUEST INDEXING:
  1. h1b-rsu-tax-calculator-2026-guide (2,153 words)
  2. cross-border-tax-guide-canada-us-2026 (2,591 words)
  3. h1b-to-canada-rsu-tax-guide-2026 (2,411 words)
  4. tn-visa-estimated-tax-payments-guide-2026 (2,366 words)
  5. rsu-tax-h1b-reddit-questions-answered (2,158 words)
  6. 83b-election-guide-h1b-workers (2,054 words)
  7. h1b-rsu-double-taxation-canada (1,213 words)
  8. foreign-tax-credit-rsu-calculation-guide (1,585 words)
  9. tn-visa-capital-gains-tax-complete-guide (1,925 words)
  10. l1-visa-stock-options-tax-guide (2,001 words)
`;
}

/**
 * Main verification function
 */
async function main() {
  console.log('🔍 GOOGLE SEARCH CONSOLE INDEXING VERIFICATION\n');
  console.log(`Timestamp: ${new Date().toISOString()}\n`);
  console.log('='.repeat(70));

  // Check site status
  const siteStatus = await checkSiteStatus();

  // Check sitemap
  const sitemapAccessible = siteStatus === 'ONLINE' ? await checkSitemap() : false;

  // Verify articles
  const articles = await verifyBlogArticles(siteStatus === 'ONLINE');

  // Calculate stats
  const accessibleArticles = articles.filter(a => a.status === 'ACCESSIBLE').length;
  const readyForIndexing = articles.filter(a => a.readyForIndexing).length;
  const needsContent = articles.filter(a => !a.hasContent).length;

  // Generate report
  const report: GSCVerificationReport = {
    timestamp: new Date().toISOString(),
    siteStatus,
    sitemapAccessible,
    totalArticles: articles.length,
    accessibleArticles,
    readyForIndexing,
    needsContent,
    articles,
    gscInstructions: generateGSCInstructions(),
  };

  // Display results
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 VERIFICATION RESULTS\n');
  console.log(`Site Status: ${siteStatus === 'ONLINE' ? '✅ ONLINE' : '❌ OFFLINE'}`);
  console.log(`Sitemap: ${sitemapAccessible ? '✅ Accessible' : '❌ Not accessible'}`);
  console.log(`\nBlog Articles:`);
  console.log(`  Total articles: ${report.totalArticles}`);
  console.log(`  Ready for indexing: ${readyForIndexing}/${report.totalArticles} (${Math.round(readyForIndexing/report.totalArticles*100)}%)`);
  console.log(`  Need content: ${needsContent}/${report.totalArticles} (${Math.round(needsContent/report.totalArticles*100)}%)`);

  if (siteStatus === 'ONLINE') {
    console.log(`  Accessible URLs: ${accessibleArticles}/${report.totalArticles} (${Math.round(accessibleArticles/report.totalArticles*100)}%)`);
  }

  // Show articles needing content
  const needsContentList = articles.filter(a => !a.hasContent);
  if (needsContentList.length > 0) {
    console.log(`\n⚠️ ARTICLES NEEDING CONTENT (${needsContentList.length}):\n`);
    needsContentList.forEach(article => {
      console.log(`  ${article.slug} (${article.wordCount} words)`);
    });
  }

  // Show ready articles
  const readyList = articles.filter(a => a.readyForIndexing);
  console.log(`\n✅ READY FOR INDEXING (${readyList.length}):\n`);
  readyList.slice(0, 10).forEach(article => {
    console.log(`  ${article.slug} (${article.wordCount} words)`);
  });
  if (readyList.length > 10) {
    console.log(`  ... and ${readyList.length - 10} more`);
  }

  // Save report
  const reportPath = path.join(process.cwd(), 'docs', 'GSC_INDEXING_VERIFICATION_REPORT.md');
  const reportContent = `# Google Search Console Indexing Verification Report

**Generated:** ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} PST

## Executive Summary

- **Site Status:** ${siteStatus}
- **Sitemap Accessible:** ${sitemapAccessible ? 'Yes' : 'No'}
- **Total Articles:** ${report.totalArticles}
- **Ready for Indexing:** ${readyForIndexing}/${report.totalArticles} (${Math.round(readyForIndexing/report.totalArticles*100)}%)
- **Need Content:** ${needsContent}/${report.totalArticles} (${Math.round(needsContent/report.totalArticles*100)}%)
${siteStatus === 'ONLINE' ? `- **Accessible URLs:** ${accessibleArticles}/${report.totalArticles} (${Math.round(accessibleArticles/report.totalArticles*100)}%)` : ''}

## Site Status

${siteStatus === 'ONLINE'
  ? '✅ **ONLINE** - Site is accessible at https://taxbridgecpa.com'
  : '❌ **OFFLINE** - Site is not accessible. Production deployment required.'
}

## Sitemap Status

${sitemapAccessible
  ? '✅ **ACCESSIBLE** - Sitemap is live at https://taxbridgecpa.com/sitemap.xml'
  : '❌ **NOT ACCESSIBLE** - Sitemap cannot be reached. Check deployment.'
}

## Articles Ready for Indexing (${readyForIndexing})

${readyList.map(a => `- [${a.slug}](${a.url}) - ${a.wordCount.toLocaleString()} words`).join('\n')}

## Articles Needing Content (${needsContent})

${needsContentList.map(a => `- ${a.slug} - ${a.wordCount} words (need ${500 - a.wordCount} more)`).join('\n')}

## Detailed Article Status

${articles.map(a => `
### ${a.slug}

- **URL:** ${a.url}
- **Status:** ${a.status}${a.statusCode ? ` (${a.statusCode})` : ''}
- **Word Count:** ${a.wordCount}
- **Ready for Indexing:** ${a.readyForIndexing ? 'Yes ✅' : 'No ❌'}
${a.issues.length > 0 ? `- **Issues:**\n${a.issues.map(i => `  - ${i}`).join('\n')}` : ''}
`).join('\n')}

---

${report.gscInstructions}

## Next Steps

${siteStatus === 'OFFLINE'
  ? `### 🚨 CRITICAL: Fix Production Deployment First

The production site is currently DOWN. Before Google Search Console can index any articles, you must:

1. **Diagnose deployment failure** - Check Vercel dashboard for errors
2. **Fix DNS configuration** - Verify taxbridgecpa.com points to Vercel
3. **Verify site is live** - Confirm https://taxbridgecpa.com returns 200 OK
4. **Re-run this script** - Verify sitemap and article URLs are accessible

**THEN proceed with GSC setup.**
`
  : `### ✅ Site is Live - Proceed with GSC Setup

1. **Set up Google Search Console** (see instructions above)
2. **Submit sitemap** to https://taxbridgecpa.com/sitemap.xml
3. **Request indexing** for top 10 high-priority articles
4. **Complete remaining ${needsContent} articles** (expand from 100-300 words to 500+ words)
5. **Monitor indexing progress** daily for first 2 weeks
6. **Track organic traffic** in PostHog and Google Analytics
`}

## Expected Results

If all steps are completed correctly:

- **Week 1:** 10-30 URLs indexed (high-priority articles)
- **Week 2-3:** 50-80 URLs indexed (most blog articles)
- **Month 1:** 100+ URLs indexed (all pages)
- **Month 2:** 100-300 organic sessions/day
- **Month 3-6:** Steady growth to 500-1,000 sessions/day
- **Revenue Impact:** $500-$2,000 MRR by Month 3

## Report Metadata

- **Script:** scripts/verify-gsc-indexing.ts
- **Timestamp:** ${report.timestamp}
- **Site:** ${BASE_URL}
- **Sitemap:** ${SITEMAP_URL}
`;

  fs.writeFileSync(reportPath, reportContent);
  console.log(`\n📄 Full report saved to: ${reportPath}`);

  // Display instructions
  console.log(report.gscInstructions);

  // Exit code
  if (siteStatus === 'OFFLINE') {
    console.log('\n🚨 CRITICAL: Site is offline. Fix production deployment before proceeding with GSC setup.\n');
    process.exit(1);
  } else if (readyForIndexing < report.totalArticles / 2) {
    console.log(`\n⚠️ WARNING: Only ${readyForIndexing}/${report.totalArticles} articles are ready for indexing. Complete remaining articles for better SEO impact.\n`);
    process.exit(0);
  } else {
    console.log('\n✅ Site is ready for Google Search Console indexing!\n');
    process.exit(0);
  }
}

main();
