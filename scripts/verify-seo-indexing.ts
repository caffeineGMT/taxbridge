#!/usr/bin/env tsx

/**
 * SEO Infrastructure & Google Indexing Validation Script
 *
 * Validates:
 * 1. Production site accessibility (taxbridge.app)
 * 2. Sitemap accessibility and content
 * 3. Blog article accessibility
 * 4. Google indexing status (site: operator)
 * 5. Meta tags and SEO configuration
 *
 * Usage: tsx scripts/verify-seo-indexing.ts
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface ValidationResult {
  category: string;
  check: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  details: string;
  impact?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  action?: string;
}

const results: ValidationResult[] = [];

function addResult(result: ValidationResult) {
  results.push(result);
  const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} ${result.category}: ${result.check}`);
  if (result.details) {
    console.log(`   ${result.details}`);
  }
  if (result.action) {
    console.log(`   → ${result.action}`);
  }
  console.log('');
}

async function checkProductionSite() {
  console.log('═══ PRODUCTION SITE ACCESSIBILITY ═══\n');

  // Check taxbridge.app
  try {
    const response = execSync('curl -I https://taxbridge.app 2>&1', {
      encoding: 'utf-8',
      timeout: 10000
    });

    if (response.includes('503') || response.includes('Connection Refused') || response.includes('failed to resolve')) {
      addResult({
        category: 'Production Site',
        check: 'Domain Accessibility',
        status: 'FAIL',
        details: 'taxbridge.app returns 503 or is unreachable',
        impact: 'CRITICAL',
        action: 'Fix DNS configuration or Vercel deployment settings'
      });
    } else if (response.includes('200 OK') || response.includes('200 ')) {
      addResult({
        category: 'Production Site',
        check: 'Domain Accessibility',
        status: 'PASS',
        details: 'taxbridge.app is accessible (200 OK)'
      });
    } else {
      addResult({
        category: 'Production Site',
        check: 'Domain Accessibility',
        status: 'WARNING',
        details: `Unexpected status: ${response.split('\n')[0]}`,
        impact: 'HIGH'
      });
    }
  } catch (error) {
    addResult({
      category: 'Production Site',
      check: 'Domain Accessibility',
      status: 'FAIL',
      details: `Error checking production site: ${error}`,
      impact: 'CRITICAL',
      action: 'Verify domain DNS settings and Vercel project configuration'
    });
  }

  // Check Vercel deployment
  try {
    const response = execSync('curl -s https://taxbridge.vercel.app/ 2>&1 | head -50', {
      encoding: 'utf-8',
      timeout: 10000
    });

    if (response.includes('Nigeria') || response.includes('NRS-compliant') || response.includes('e-invoicing')) {
      addResult({
        category: 'Production Site',
        check: 'Vercel Deployment Correctness',
        status: 'FAIL',
        details: 'WRONG APPLICATION deployed (Nigerian e-invoicing platform instead of US-Canada tax calculator)',
        impact: 'CRITICAL',
        action: 'Reconnect Vercel project to correct GitHub repo (caffeineGMT/taxbridge) or redeploy from main branch'
      });
    } else if (response.includes('H-1B') || response.includes('TN visa') || response.includes('cross-border tax')) {
      addResult({
        category: 'Production Site',
        check: 'Vercel Deployment Correctness',
        status: 'PASS',
        details: 'Correct application deployed (US-Canada tax calculator)'
      });
    } else {
      addResult({
        category: 'Production Site',
        check: 'Vercel Deployment Correctness',
        status: 'WARNING',
        details: 'Unable to determine deployed application',
        impact: 'HIGH'
      });
    }
  } catch (error) {
    addResult({
      category: 'Production Site',
      check: 'Vercel Deployment',
      status: 'FAIL',
      details: `Error checking Vercel deployment: ${error}`,
      impact: 'HIGH'
    });
  }
}

async function checkSitemap() {
  console.log('═══ SITEMAP VALIDATION ═══\n');

  // Check local sitemap configuration
  const sitemapPath = path.join(process.cwd(), 'app/sitemap.ts');
  try {
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');

    if (sitemapContent.includes('taxbridge.app')) {
      addResult({
        category: 'Sitemap',
        check: 'Local Configuration',
        status: 'PASS',
        details: 'app/sitemap.ts correctly uses taxbridge.app base URL'
      });
    } else if (sitemapContent.includes('taxbridge.app')) {
      addResult({
        category: 'Sitemap',
        check: 'Local Configuration',
        status: 'FAIL',
        details: 'app/sitemap.ts still uses wrong domain (taxbridge.app)',
        impact: 'CRITICAL',
        action: 'Change base URL to taxbridge.app'
      });
    } else {
      addResult({
        category: 'Sitemap',
        check: 'Local Configuration',
        status: 'WARNING',
        details: 'Unable to determine base URL in sitemap.ts'
      });
    }
  } catch (error) {
    addResult({
      category: 'Sitemap',
      check: 'Local Configuration',
      status: 'FAIL',
      details: `Error reading sitemap.ts: ${error}`,
      impact: 'HIGH'
    });
  }

  // Check production sitemap accessibility
  try {
    const response = execSync('curl -I https://taxbridge.app/sitemap.xml 2>&1', {
      encoding: 'utf-8',
      timeout: 10000
    });

    if (response.includes('200')) {
      addResult({
        category: 'Sitemap',
        check: 'Production Accessibility',
        status: 'PASS',
        details: 'https://taxbridge.app/sitemap.xml is accessible (200 OK)'
      });

      // Count URLs in sitemap
      try {
        const sitemapContent = execSync('curl -s https://taxbridge.app/sitemap.xml 2>&1', {
          encoding: 'utf-8',
          timeout: 10000
        });
        const urlCount = (sitemapContent.match(/<url>/g) || []).length;
        const blogCount = (sitemapContent.match(/\/blog\//g) || []).length;

        addResult({
          category: 'Sitemap',
          check: 'URL Count',
          status: urlCount >= 100 ? 'PASS' : 'WARNING',
          details: `${urlCount} total URLs (${blogCount} blog articles)`,
          impact: urlCount < 100 ? 'MEDIUM' : undefined
        });
      } catch (error) {
        // Sitemap exists but can't parse - non-critical
      }
    } else if (response.includes('404')) {
      addResult({
        category: 'Sitemap',
        check: 'Production Accessibility',
        status: 'FAIL',
        details: 'Sitemap returns 404 Not Found',
        impact: 'CRITICAL',
        action: 'Verify build generates sitemap and deploy to production'
      });
    } else {
      addResult({
        category: 'Sitemap',
        check: 'Production Accessibility',
        status: 'FAIL',
        details: 'Sitemap unreachable (domain down or misconfigured)',
        impact: 'CRITICAL',
        action: 'Fix production domain accessibility first'
      });
    }
  } catch (error) {
    addResult({
      category: 'Sitemap',
      check: 'Production Accessibility',
      status: 'FAIL',
      details: `Error checking sitemap: ${error}`,
      impact: 'CRITICAL'
    });
  }
}

async function checkBlogArticles() {
  console.log('═══ BLOG ARTICLES ═══\n');

  // Count blog articles in data/blog
  try {
    const blogDir = path.join(process.cwd(), 'data/blog');
    const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.json'));

    addResult({
      category: 'Blog Articles',
      check: 'Local Articles Count',
      status: files.length >= 40 ? 'PASS' : 'WARNING',
      details: `${files.length} blog article JSON files found`,
      impact: files.length < 40 ? 'MEDIUM' : undefined
    });

    // Test accessibility of 3 sample articles
    const sampleSlugs = [
      'h1b-rsu-tax-calculator-2026-guide',
      'tn-visa-stock-options-tax-complete-guide',
      'cross-border-tax-guide-canada-us-2026'
    ];

    for (const slug of sampleSlugs) {
      try {
        const response = execSync(`curl -I https://taxbridge.app/blog/${slug} 2>&1`, {
          encoding: 'utf-8',
          timeout: 10000
        });

        if (response.includes('200')) {
          addResult({
            category: 'Blog Articles',
            check: `Article: ${slug}`,
            status: 'PASS',
            details: 'Accessible (200 OK)'
          });
        } else if (response.includes('404')) {
          addResult({
            category: 'Blog Articles',
            check: `Article: ${slug}`,
            status: 'FAIL',
            details: 'Returns 404 Not Found',
            impact: 'HIGH',
            action: 'Verify article JSON exists and route works'
          });
        } else {
          addResult({
            category: 'Blog Articles',
            check: `Article: ${slug}`,
            status: 'FAIL',
            details: 'Unreachable (domain down)',
            impact: 'CRITICAL',
            action: 'Fix production domain first'
          });
        }
      } catch (error) {
        addResult({
          category: 'Blog Articles',
          check: `Article: ${slug}`,
          status: 'FAIL',
          details: 'Error checking article',
          impact: 'HIGH'
        });
      }
    }
  } catch (error) {
    addResult({
      category: 'Blog Articles',
      check: 'Local Articles',
      status: 'WARNING',
      details: `Unable to read data/blog directory: ${error}`
    });
  }
}

async function checkGoogleIndexing() {
  console.log('═══ GOOGLE INDEXING STATUS ═══\n');

  console.log('⚠️  Google indexing check requires manual verification');
  console.log('    Automated checks via Google API require authentication\n');

  addResult({
    category: 'Google Indexing',
    check: 'site:taxbridge.app',
    status: 'WARNING',
    details: 'Manual check required - search "site:taxbridge.app" on Google',
    action: 'Set up Google Search Console to track indexing progress'
  });

  addResult({
    category: 'Google Indexing',
    check: 'Google Search Console',
    status: 'WARNING',
    details: 'Domain ownership verification required',
    action: 'Follow guide in docs/GOOGLE_SEARCH_CONSOLE_SETUP.md (15 min setup)'
  });
}

async function checkEnvironmentConfig() {
  console.log('═══ ENVIRONMENT CONFIGURATION ═══\n');

  // Check .env.production
  try {
    const envPath = path.join(process.cwd(), '.env.production');
    const envContent = fs.readFileSync(envPath, 'utf-8');

    if (envContent.includes('NEXT_PUBLIC_APP_URL=https://taxbridge.app')) {
      addResult({
        category: 'Environment',
        check: '.env.production',
        status: 'PASS',
        details: 'NEXT_PUBLIC_APP_URL correctly set to taxbridge.app'
      });
    } else if (envContent.includes('taxbridge.app')) {
      addResult({
        category: 'Environment',
        check: '.env.production',
        status: 'FAIL',
        details: 'NEXT_PUBLIC_APP_URL uses wrong domain',
        impact: 'HIGH',
        action: 'Update to taxbridge.app'
      });
    } else {
      addResult({
        category: 'Environment',
        check: '.env.production',
        status: 'WARNING',
        details: 'NEXT_PUBLIC_APP_URL not found or misconfigured'
      });
    }
  } catch (error) {
    addResult({
      category: 'Environment',
      check: '.env.production',
      status: 'WARNING',
      details: 'File not found - using fallback domain'
    });
  }
}

function generateSummary() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('            VALIDATION SUMMARY');
  console.log('═══════════════════════════════════════════════════\n');

  const criticalIssues = results.filter(r => r.impact === 'CRITICAL');
  const highIssues = results.filter(r => r.impact === 'HIGH');
  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  const warnCount = results.filter(r => r.status === 'WARNING').length;

  console.log(`✅ PASS: ${passCount}`);
  console.log(`❌ FAIL: ${failCount}`);
  console.log(`⚠️  WARN: ${warnCount}\n`);

  if (criticalIssues.length > 0) {
    console.log('🔴 CRITICAL BLOCKERS:\n');
    criticalIssues.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue.category}: ${issue.check}`);
      console.log(`   ${issue.details}`);
      if (issue.action) {
        console.log(`   → ${issue.action}`);
      }
      console.log('');
    });
  }

  if (highIssues.length > 0 && criticalIssues.length === 0) {
    console.log('🟠 HIGH PRIORITY ISSUES:\n');
    highIssues.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue.category}: ${issue.check}`);
      console.log(`   ${issue.details}`);
      if (issue.action) {
        console.log(`   → ${issue.action}`);
      }
      console.log('');
    });
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log('                QUICK WINS');
  console.log('═══════════════════════════════════════════════════\n');

  if (criticalIssues.length > 0) {
    console.log('⚡ IMMEDIATE ACTION REQUIRED (P0):');
    console.log('   1. Fix production domain (taxbridge.app) - currently returning 503');
    console.log('   2. Verify Vercel deployment has correct application');
    console.log('   3. Once domain is live, verify sitemap.xml accessibility\n');
  } else {
    console.log('⚡ NEXT STEPS (P1):');
    console.log('   1. Set up Google Search Console (15 min)');
    console.log('   2. Submit sitemap to GSC');
    console.log('   3. Monitor indexing progress (daily for 7 days)\n');
  }

  console.log('📊 EXPECTED INDEXING TIMELINE:');
  console.log('   • Week 1: GSC setup → 10-30 URLs indexed');
  console.log('   • Week 2-4: 80-100 URLs indexed → 0-5 sessions/day');
  console.log('   • Month 2: 100+ sessions/day from organic');
  console.log('   • Month 6: $5K-$20K/month organic revenue\n');

  console.log('═══════════════════════════════════════════════════\n');
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════╗');
  console.log('║  SEO Infrastructure & Google Indexing Validator  ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');

  await checkProductionSite();
  await checkSitemap();
  await checkBlogArticles();
  await checkGoogleIndexing();
  await checkEnvironmentConfig();

  generateSummary();

  // Exit with error code if critical failures
  const hasCritical = results.some(r => r.impact === 'CRITICAL');
  process.exit(hasCritical ? 1 : 0);
}

main().catch(console.error);
