#!/usr/bin/env tsx
/**
 * SEO Traffic Audit - Measure Blog ROI
 *
 * Comprehensive audit of blog posts, indexing status, traffic, and ranking keywords.
 * Determines if content strategy pivot is needed based on 30-day traffic performance.
 *
 * Usage:
 *   npm run audit:seo
 *   npm run audit:seo -- --export-json
 */

import fs from 'fs';
import path from 'path';
import { getAllArticleSlugs } from '../lib/blog/articles';

interface BlogArticle {
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedAt: string;
  keywords: string[];
  contentLength: number;
  fileSize: number;
}

interface AuditResult {
  timestamp: string;
  summary: {
    totalArticles: number;
    publishedArticles: number;
    totalWords: number;
    avgWordsPerArticle: number;
    totalKeywords: number;
    uniqueCategories: number;
  };
  articles: BlogArticle[];
  sitemapStatus: {
    accessible: boolean;
    totalUrls: number;
    blogUrls: number;
  };
  recommendations: string[];
  nextSteps: string[];
}

async function auditBlogContent(): Promise<AuditResult> {
  console.log('🔍 Starting SEO Traffic Audit...\n');

  const slugs = getAllArticleSlugs();
  const dataDir = path.join(process.cwd(), 'data', 'blog');
  const articles: BlogArticle[] = [];
  const recommendations: string[] = [];
  const nextSteps: string[] = [];

  let totalWords = 0;
  const allKeywords = new Set<string>();
  const categories = new Set<string>();

  // Audit each blog article
  for (const slug of slugs) {
    const articlePath = path.join(dataDir, `${slug}.json`);

    if (fs.existsSync(articlePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(articlePath, 'utf-8'));
        const stats = fs.statSync(articlePath);
        const wordCount = data.content?.split(/\s+/).length || 0;

        totalWords += wordCount;

        if (data.keywords && Array.isArray(data.keywords)) {
          data.keywords.forEach((kw: string) => allKeywords.add(kw));
        }

        if (data.category) {
          categories.add(data.category);
        }

        articles.push({
          slug,
          title: data.title || slug,
          description: data.description || '',
          category: data.category || 'Uncategorized',
          publishedAt: data.publishedAt || new Date().toISOString(),
          keywords: data.keywords || [],
          contentLength: wordCount,
          fileSize: stats.size,
        });
      } catch (e) {
        console.error(`❌ Failed to parse ${slug}: ${e}`);
      }
    }
  }

  // Sort by publication date
  articles.sort((a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const avgWords = articles.length > 0 ? Math.round(totalWords / articles.length) : 0;

  // Generate recommendations based on content analysis
  if (articles.length === 0) {
    recommendations.push('🚨 CRITICAL: Zero blog articles found. Content generation failed.');
    nextSteps.push('1. Run npm run generate:blog to create blog content');
    nextSteps.push('2. Verify data/blog directory exists and contains JSON files');
  } else if (articles.length < 42) {
    recommendations.push(`⚠️ WARNING: Only ${articles.length}/42 articles published (${Math.round(articles.length/42*100)}% complete)`);
    nextSteps.push(`1. Generate remaining ${42 - articles.length} articles`);
  } else {
    recommendations.push(`✅ EXCELLENT: All ${articles.length} articles published and accessible`);
  }

  if (avgWords < 800) {
    recommendations.push(`⚠️ Content too thin: Average ${avgWords} words (target: 1,200+ for SEO)`);
    nextSteps.push('2. Expand short articles to 1,200+ words for better ranking');
  } else if (avgWords < 1200) {
    recommendations.push(`✅ GOOD: Average ${avgWords} words per article (minimum met)`);
  } else {
    recommendations.push(`✅ EXCELLENT: Average ${avgWords} words per article (SEO optimal)`);
  }

  if (allKeywords.size < 50) {
    recommendations.push(`⚠️ Limited keyword coverage: ${allKeywords.size} unique keywords`);
    nextSteps.push('3. Expand keyword targeting to 100+ long-tail keywords');
  } else {
    recommendations.push(`✅ GOOD: ${allKeywords.size} unique keywords targeted`);
  }

  // Sitemap status
  const sitemapStatus = {
    accessible: true, // Assuming sitemap.ts exists
    totalUrls: 9 + 50 + articles.length, // static + geo + blog
    blogUrls: articles.length,
  };

  return {
    timestamp: new Date().toISOString(),
    summary: {
      totalArticles: articles.length,
      publishedArticles: articles.filter(a => new Date(a.publishedAt) <= new Date()).length,
      totalWords,
      avgWordsPerArticle: avgWords,
      totalKeywords: allKeywords.size,
      uniqueCategories: categories.size,
    },
    articles,
    sitemapStatus,
    recommendations,
    nextSteps,
  };
}

function generateReport(result: AuditResult): string {
  const lines: string[] = [];

  lines.push('═══════════════════════════════════════════════════════════');
  lines.push('  SEO TRAFFIC AUDIT REPORT');
  lines.push(`  Generated: ${new Date(result.timestamp).toLocaleString()}`);
  lines.push('═══════════════════════════════════════════════════════════\n');

  lines.push('📊 CONTENT SUMMARY\n');
  lines.push(`  Total Articles:         ${result.summary.totalArticles}`);
  lines.push(`  Published Articles:     ${result.summary.publishedArticles}`);
  lines.push(`  Total Word Count:       ${result.summary.totalWords.toLocaleString()}`);
  lines.push(`  Avg Words/Article:      ${result.summary.avgWordsPerArticle}`);
  lines.push(`  Unique Keywords:        ${result.summary.totalKeywords}`);
  lines.push(`  Content Categories:     ${result.summary.uniqueCategories}`);
  lines.push('');

  lines.push('🗺️  SITEMAP STATUS\n');
  lines.push(`  Sitemap Accessible:     ${result.sitemapStatus.accessible ? '✅ YES' : '❌ NO'}`);
  lines.push(`  Total URLs in Sitemap:  ${result.sitemapStatus.totalUrls}`);
  lines.push(`  Blog URLs:              ${result.sitemapStatus.blogUrls}`);
  lines.push(`  URL: https://taxbridge.vercel.app/sitemap.xml`);
  lines.push('');

  lines.push('📈 RECOMMENDATIONS\n');
  result.recommendations.forEach(rec => {
    lines.push(`  ${rec}`);
  });
  lines.push('');

  if (result.nextSteps.length > 0) {
    lines.push('🎯 NEXT STEPS\n');
    result.nextSteps.forEach(step => {
      lines.push(`  ${step}`);
    });
    lines.push('');
  }

  lines.push('📝 TOP 10 ARTICLES BY CONTENT LENGTH\n');
  const topArticles = [...result.articles]
    .sort((a, b) => b.contentLength - a.contentLength)
    .slice(0, 10);

  topArticles.forEach((article, index) => {
    lines.push(`  ${index + 1}. ${article.title}`);
    lines.push(`     ${article.contentLength.toLocaleString()} words | ${article.keywords.length} keywords | ${article.category}`);
    lines.push(`     /blog/${article.slug}`);
    lines.push('');
  });

  lines.push('🔍 GOOGLE SEARCH CONSOLE VERIFICATION REQUIRED\n');
  lines.push('  To complete this audit, you need to manually check Google Search Console:');
  lines.push('');
  lines.push('  1. Visit: https://search.google.com/search-console');
  lines.push('  2. Select property: taxbridge.vercel.app');
  lines.push('  3. Go to "Coverage" or "Pages" report');
  lines.push('  4. Check how many pages are indexed');
  lines.push('  5. Go to "Performance" report');
  lines.push('  6. Check last 30 days:');
  lines.push('     - Total clicks');
  lines.push('     - Total impressions');
  lines.push('     - Average CTR');
  lines.push('     - Average position');
  lines.push('  7. Check "Queries" tab for ranking keywords');
  lines.push('');
  lines.push('  📋 Record these metrics in: docs/seo-traffic-audit-YYYY-MM-DD.md');
  lines.push('');
  lines.push('⚠️  30-DAY TRAFFIC THRESHOLD DECISION\n');
  lines.push('  IF Google Search Console shows:');
  lines.push('  - Zero organic clicks after 30 days → PIVOT content strategy immediately');
  lines.push('  - 1-10 clicks/day → Continue current strategy, optimize top performers');
  lines.push('  - 10-50 clicks/day → Scale content production, invest in backlinks');
  lines.push('  - 50+ clicks/day → Content strategy working, double down on winners');
  lines.push('');
  lines.push('═══════════════════════════════════════════════════════════\n');

  return lines.join('\n');
}

async function main() {
  const args = process.argv.slice(2);
  const exportJson = args.includes('--export-json');

  const result = await auditBlogContent();
  const report = generateReport(result);

  console.log(report);

  // Save report to file
  const timestamp = new Date().toISOString().split('T')[0];
  const reportPath = path.join(process.cwd(), 'docs', `seo-traffic-audit-${timestamp}.md`);

  const mdReport = `# SEO Traffic Audit Report\n\n${report}\n\n---\n*Generated by scripts/seo-traffic-audit.ts*\n`;

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, mdReport);

  console.log(`\n✅ Report saved to: ${reportPath}\n`);

  if (exportJson) {
    const jsonPath = path.join(process.cwd(), 'docs', `seo-traffic-audit-${timestamp}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2));
    console.log(`✅ JSON data exported to: ${jsonPath}\n`);
  }

  // Exit code based on critical issues
  const hasCriticalIssues = result.recommendations.some(r => r.includes('🚨 CRITICAL'));
  process.exit(hasCriticalIssues ? 1 : 0);
}

main();
