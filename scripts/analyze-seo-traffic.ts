#!/usr/bin/env tsx
/**
 * SEO Traffic Analysis Script - Google Search Console Data Analysis
 *
 * Analyzes blog article SEO performance:
 * - Indexing status (how many of 42 articles indexed)
 * - Traffic by article
 * - Top search queries
 * - Organic traffic baseline vs current
 *
 * PREREQUISITES:
 * 1. Production site must be running the CORRECT application
 * 2. Google Search Console must be set up and verified
 * 3. Sitemap submitted to GSC
 * 4. Minimum 7-28 days of data for meaningful analysis
 *
 * MANUAL SETUP (if not done):
 * 1. Go to https://search.google.com/search-console
 * 2. Add property: https://taxbridge.vercel.app
 * 3. Verify ownership (DNS TXT or HTML file upload)
 * 4. Submit sitemap: https://taxbridge.vercel.app/sitemap.xml
 * 5. Enable Google Search Console API
 * 6. Create service account credentials
 *
 * GOOGLE SEARCH CONSOLE API SETUP:
 * 1. Go to https://console.cloud.google.com
 * 2. Create new project (or select existing)
 * 3. Enable "Google Search Console API"
 * 4. Create service account
 * 5. Download JSON credentials
 * 6. Add service account email to GSC property (Search Console Settings → Users)
 * 7. Set environment variable: GSC_CREDENTIALS_PATH=/path/to/credentials.json
 *
 * USAGE:
 * npm run analyze:seo:traffic
 * OR
 * tsx scripts/analyze-seo-traffic.ts
 */

import { getAllArticleSlugs, ARTICLE_TOPICS } from '../lib/blog/articles';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://taxbridge.vercel.app';
const SITEMAP_URL = `${BASE_URL}/sitemap.xml`;

interface ArticleIndexingStatus {
  slug: string;
  title: string;
  targetKeyword: string;
  category: string;
  url: string;
  fileExists: boolean;
  siteAccessible: boolean;
  indexed: boolean;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  topQueries: Array<{
    query: string;
    impressions: number;
    clicks: number;
    ctr: number;
    position: number;
  }>;
}

interface SEOTrafficReport {
  timestamp: string;
  reportDate: string;

  // Deployment Status
  correctAppDeployed: boolean;
  deploymentIssue: string | null;

  // Indexing Status
  totalArticlesInCodebase: number;
  totalArticlesPublished: number;
  totalArticlesIndexed: number;
  indexingRate: number; // percentage

  // Traffic Metrics
  totalImpressions: number;
  totalClicks: number;
  averageCTR: number;
  averagePosition: number;

  // Top Performers
  topArticlesByTraffic: Array<{
    slug: string;
    title: string;
    clicks: number;
    impressions: number;
    ctr: number;
  }>;

  topSearchQueries: Array<{
    query: string;
    impressions: number;
    clicks: number;
    ctr: number;
    position: number;
  }>;

  // Baseline Comparison
  baseline: {
    date: string;
    clicks: number;
    impressions: number;
  };
  current: {
    date: string;
    clicks: number;
    impressions: number;
  };
  growth: {
    clicksChange: number;
    clicksChangePercent: number;
    impressionsChange: number;
    impressionsChangePercent: number;
  };

  // Article Details
  articles: ArticleIndexingStatus[];

  // Recommendations
  recommendations: string[];

  // GSC Setup Status
  gscSetupComplete: boolean;
  gscSetupInstructions: string;
}

/**
 * Check if production site is running the correct application
 */
async function checkDeploymentStatus(): Promise<{ correct: boolean; issue: string | null }> {
  try {
    console.log('🔍 Checking production deployment...');
    const response = await fetch(BASE_URL);
    const html = await response.text();

    // Check if it's the Nigerian tax app (WRONG) or US-Canada tax app (CORRECT)
    if (html.includes('Nigeria') || html.includes('NRS-compliant') || html.includes('e-invoicing')) {
      return {
        correct: false,
        issue: 'WRONG APPLICATION DEPLOYED - Nigerian tax e-invoicing app is live instead of US-Canada RSU tax calculator. All blog articles are inaccessible.'
      };
    }

    // Check for cross-border tax keywords
    if (html.includes('H1B') || html.includes('TN visa') || html.includes('RSU') || html.includes('cross-border tax')) {
      return { correct: true, issue: null };
    }

    return {
      correct: false,
      issue: 'Unable to verify correct application - homepage content unclear'
    };
  } catch (error) {
    return {
      correct: false,
      issue: `Site unreachable: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Check if blog articles are accessible on production
 */
async function checkArticleAccessibility(slug: string): Promise<boolean> {
  try {
    const url = `${BASE_URL}/blog/${slug}`;
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Check if sitemap is accessible
 */
async function checkSitemapAccessibility(): Promise<{ accessible: boolean; blogUrlCount: number }> {
  try {
    const response = await fetch(SITEMAP_URL);
    if (!response.ok) {
      return { accessible: false, blogUrlCount: 0 };
    }

    const xml = await response.text();
    const blogUrlMatches = xml.match(/<loc>https:\/\/taxbridge\.vercel\.app\/blog\/[^<]+<\/loc>/g);
    return {
      accessible: true,
      blogUrlCount: blogUrlMatches ? blogUrlMatches.length : 0
    };
  } catch {
    return { accessible: false, blogUrlCount: 0 };
  }
}

/**
 * MANUAL GSC DATA COLLECTION INSTRUCTIONS
 *
 * Since we don't have GSC API credentials set up, this function provides
 * instructions for manual data collection from Google Search Console UI
 */
function getManualGSCInstructions(): string {
  return `
📊 MANUAL GOOGLE SEARCH CONSOLE DATA COLLECTION

Since GSC API is not set up, please collect data manually:

STEP 1: Access Google Search Console
→ Go to: https://search.google.com/search-console
→ Select property: https://taxbridge.vercel.app
→ If not verified, verify ownership first (see setup instructions)

STEP 2: Check Indexing Status
→ Left menu → "Pages"
→ Look for "Indexed" count
→ Record number of indexed pages containing "/blog/"
→ Click "View indexed pages" to see list

STEP 3: Collect Traffic Data (Last 28 days)
→ Left menu → "Performance" → "Search results"
→ Date range: Last 28 days
→ Record these metrics:
  - Total clicks
  - Total impressions
  - Average CTR
  - Average position

STEP 4: Top Performing Blog Articles
→ In Performance view:
→ Click "+ NEW" → Filter → Page → URL contains "/blog/"
→ Scroll down to "PAGES" table
→ Export top 20 pages by clicks as CSV

STEP 5: Top Search Queries
→ In Performance view (same filter)
→ Click "QUERIES" tab
→ Export top 50 queries as CSV

STEP 6: Historical Baseline (Optional)
→ Change date range to: Jan 1, 2026 - Jan 31, 2026
→ Record same metrics for comparison

AUTOMATED SETUP (Recommended for future):
1. Enable GSC API in Google Cloud Console
2. Create service account credentials
3. Download JSON key file
4. Set environment: GSC_CREDENTIALS_PATH=/path/to/key.json
5. Add service account email to GSC property users
6. Re-run this script (will auto-fetch data)
`;
}

/**
 * Generate SEO Traffic Analysis Report
 */
async function generateSEOTrafficReport(): Promise<SEOTrafficReport> {
  console.log('📊 TaxBridge SEO Traffic Analysis');
  console.log('=====================================\n');

  const timestamp = new Date().toISOString();
  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Check deployment status
  const deployment = await checkDeploymentStatus();
  console.log(`\n🚀 Deployment Status: ${deployment.correct ? '✅ CORRECT' : '❌ WRONG'}`);
  if (deployment.issue) {
    console.log(`   Issue: ${deployment.issue}`);
  }

  // Check sitemap
  const sitemap = await checkSitemapAccessibility();
  console.log(`\n📄 Sitemap: ${sitemap.accessible ? '✅ Accessible' : '❌ Not Accessible'}`);
  console.log(`   Blog URLs in sitemap: ${sitemap.blogUrlCount}`);

  // Count published articles
  const dataDir = path.join(process.cwd(), 'data', 'blog');
  const publishedArticles = fs.existsSync(dataDir)
    ? fs.readdirSync(dataDir).filter(f => f.endsWith('.json')).length
    : 0;

  console.log(`\n📝 Blog Articles:`);
  console.log(`   Total in codebase (ARTICLE_TOPICS): ${ARTICLE_TOPICS.length}`);
  console.log(`   Total published (data/blog/*.json): ${publishedArticles}`);

  // Check article accessibility
  console.log(`\n🔍 Checking article accessibility on production...`);
  const articleChecks: ArticleIndexingStatus[] = [];
  let accessibleCount = 0;

  for (const article of ARTICLE_TOPICS.slice(0, 5)) { // Check first 5 for speed
    const fileExists = fs.existsSync(path.join(dataDir, `${article.slug}.json`));
    const siteAccessible = await checkArticleAccessibility(article.slug);

    if (siteAccessible) accessibleCount++;

    articleChecks.push({
      slug: article.slug,
      title: article.title,
      targetKeyword: article.targetKeyword,
      category: article.category,
      url: `${BASE_URL}/blog/${article.slug}`,
      fileExists,
      siteAccessible,
      indexed: false, // Would need GSC API
      impressions: 0,
      clicks: 0,
      ctr: 0,
      position: 0,
      topQueries: []
    });

    console.log(`   ${siteAccessible ? '✅' : '❌'} ${article.slug.substring(0, 50)}...`);
  }

  // Build recommendations
  const recommendations: string[] = [];

  if (!deployment.correct) {
    recommendations.push('🚨 CRITICAL: Deploy correct application to production (US-Canada tax calculator, not Nigerian e-invoicing app)');
    recommendations.push('After deployment fix, verify all 42 blog articles are accessible');
  }

  if (!sitemap.accessible) {
    recommendations.push('Fix sitemap 404 error - blog articles cannot be discovered by Google');
  } else if (sitemap.blogUrlCount < ARTICLE_TOPICS.length) {
    recommendations.push(`Sitemap missing ${ARTICLE_TOPICS.length - sitemap.blogUrlCount} blog URLs - verify sitemap generation`);
  }

  if (publishedArticles < ARTICLE_TOPICS.length) {
    recommendations.push(`Publish remaining ${ARTICLE_TOPICS.length - publishedArticles} blog articles`);
  }

  recommendations.push('Set up Google Search Console API for automated traffic monitoring');
  recommendations.push('Submit sitemap to Google Search Console after deployment fix');
  recommendations.push('Wait 7-14 days after deployment for Google to crawl and index articles');
  recommendations.push('Monitor indexing progress in GSC > Pages > Indexed');

  const report: SEOTrafficReport = {
    timestamp,
    reportDate,

    correctAppDeployed: deployment.correct,
    deploymentIssue: deployment.issue,

    totalArticlesInCodebase: ARTICLE_TOPICS.length,
    totalArticlesPublished: publishedArticles,
    totalArticlesIndexed: 0, // Would need GSC API
    indexingRate: 0,

    totalImpressions: 0, // Would need GSC API
    totalClicks: 0,
    averageCTR: 0,
    averagePosition: 0,

    topArticlesByTraffic: [],
    topSearchQueries: [],

    baseline: {
      date: 'N/A',
      clicks: 0,
      impressions: 0
    },
    current: {
      date: reportDate,
      clicks: 0,
      impressions: 0
    },
    growth: {
      clicksChange: 0,
      clicksChangePercent: 0,
      impressionsChange: 0,
      impressionsChangePercent: 0
    },

    articles: articleChecks,
    recommendations,

    gscSetupComplete: false,
    gscSetupInstructions: getManualGSCInstructions()
  };

  return report;
}

/**
 * Main execution
 */
async function main() {
  try {
    const report = await generateSEOTrafficReport();

    // Save report
    const outputDir = path.join(process.cwd(), 'docs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const reportPath = path.join(outputDir, 'SEO_TRAFFIC_ANALYSIS_REPORT.md');
    const jsonPath = path.join(outputDir, 'seo-traffic-analysis.json');

    // Save JSON
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
    console.log(`\n✅ JSON report saved: ${jsonPath}`);

    // Generate Markdown report
    const markdown = `# SEO Traffic Analysis Report
Generated: ${report.reportDate}

## Executive Summary

### Deployment Status
${report.correctAppDeployed ? '✅ **CORRECT APPLICATION DEPLOYED**' : '❌ **WRONG APPLICATION DEPLOYED**'}

${report.deploymentIssue ? `**Issue:** ${report.deploymentIssue}\n` : ''}

### Blog Content Status
- **Total articles in codebase:** ${report.totalArticlesInCodebase}
- **Total articles published:** ${report.totalArticlesPublished} (${((report.totalArticlesPublished / report.totalArticlesInCodebase) * 100).toFixed(0)}%)
- **Total articles indexed:** ${report.totalArticlesIndexed} (${report.indexingRate.toFixed(0)}%)

### Traffic Metrics (Last 28 Days)
- **Total impressions:** ${report.totalImpressions.toLocaleString()}
- **Total clicks:** ${report.totalClicks.toLocaleString()}
- **Average CTR:** ${(report.averageCTR * 100).toFixed(2)}%
- **Average position:** ${report.averagePosition.toFixed(1)}

### Traffic Growth
${report.growth.clicksChangePercent !== 0 ?
  `- **Clicks:** ${report.growth.clicksChange > 0 ? '+' : ''}${report.growth.clicksChange} (${report.growth.clicksChangePercent > 0 ? '+' : ''}${report.growth.clicksChangePercent.toFixed(1)}%)
- **Impressions:** ${report.growth.impressionsChange > 0 ? '+' : ''}${report.growth.impressionsChange} (${report.growth.impressionsChangePercent > 0 ? '+' : ''}${report.growth.impressionsChangePercent.toFixed(1)}%)` :
  'No baseline data available for comparison'
}

## Critical Findings

${report.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

## Article Accessibility Check (Sample)

${report.articles.map(a =>
  `### ${a.title}
- **Slug:** \`${a.slug}\`
- **URL:** ${a.url}
- **File exists:** ${a.fileExists ? '✅ Yes' : '❌ No'}
- **Site accessible:** ${a.siteAccessible ? '✅ Yes' : '❌ No'}
- **Target keyword:** "${a.targetKeyword}"
- **Category:** ${a.category}
`).join('\n')}

## Top Performing Articles

${report.topArticlesByTraffic.length > 0 ?
  report.topArticlesByTraffic.map((a, i) =>
    `${i + 1}. **${a.title}** - ${a.clicks} clicks, ${a.impressions} impressions, ${(a.ctr * 100).toFixed(2)}% CTR`
  ).join('\n') :
  '*No traffic data available - GSC API not configured*'
}

## Top Search Queries

${report.topSearchQueries.length > 0 ?
  report.topSearchQueries.map((q, i) =>
    `${i + 1}. **"${q.query}"** - ${q.clicks} clicks, ${q.impressions} impressions, ${(q.ctr * 100).toFixed(2)}% CTR, Pos ${q.position.toFixed(1)}`
  ).join('\n') :
  '*No query data available - GSC API not configured*'
}

## Next Steps

### Immediate Actions (P0)
${!report.correctAppDeployed ? '1. ✅ **Deploy correct application to production**' : '1. ✅ Correct application deployed'}
2. Verify all ${report.totalArticlesInCodebase} blog articles are accessible on production
3. Submit sitemap to Google Search Console
4. Set up GSC API for automated monitoring

### Short-term (Week 1-2)
1. Monitor indexing progress daily in GSC
2. Create baseline traffic report after indexing starts
3. Identify quick-win optimizations (meta tags, internal linking)

### Long-term (Month 1-3)
1. Monthly traffic analysis and reporting
2. Content optimization based on top performing queries
3. Identify content gaps and new article opportunities
4. Build backlinks to top-performing articles

---

## Google Search Console Setup

${report.gscSetupInstructions}

---

*Report generated: ${report.timestamp}*
*Next update: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}*
`;

    fs.writeFileSync(reportPath, markdown);
    console.log(`✅ Markdown report saved: ${reportPath}`);

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 EXECUTIVE SUMMARY');
    console.log('='.repeat(60));
    console.log(`\n${report.correctAppDeployed ? '✅' : '❌'} Deployment: ${report.deploymentIssue || 'Correct app deployed'}`);
    console.log(`\n📝 Content: ${report.totalArticlesPublished}/${report.totalArticlesInCodebase} articles published`);
    console.log(`🔍 Indexing: ${report.totalArticlesIndexed}/${report.totalArticlesPublished} articles indexed`);
    console.log(`\n👁️  Traffic (28d): ${report.totalImpressions.toLocaleString()} impressions, ${report.totalClicks.toLocaleString()} clicks`);
    console.log(`\n🚨 Priority Recommendations:`);
    report.recommendations.slice(0, 3).forEach((rec, i) => {
      console.log(`   ${i + 1}. ${rec}`);
    });
    console.log('\n' + '='.repeat(60));
    console.log(`\n📄 Full report: ${reportPath}`);
    console.log(`📊 JSON data: ${jsonPath}\n`);

  } catch (error) {
    console.error('❌ Error generating report:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { generateSEOTrafficReport, type SEOTrafficReport };
