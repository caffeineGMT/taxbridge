#!/usr/bin/env node

/**
 * Product Hunt Launch Readiness Verification Script
 *
 * Checks all critical requirements before launch on March 25, 2026
 * Run this script daily from March 19-24 to track progress
 *
 * Usage: node scripts/verify-launch-readiness.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

// Check results
const results = {
  passed: [],
  failed: [],
  warnings: []
};

console.log(`${colors.bright}${colors.blue}
╔═══════════════════════════════════════════════════════╗
║   PRODUCT HUNT LAUNCH READINESS VERIFICATION         ║
║   Target: March 25, 2026 at 12:01 AM PT              ║
╚═══════════════════════════════════════════════════════╝
${colors.reset}\n`);

/**
 * Check 1: Stripe Production Mode
 */
function checkStripeProduction() {
  console.log(`${colors.bright}[1/10] Checking Stripe production mode...${colors.reset}`);

  const envPath = path.join(__dirname, '../.env.production');

  if (!fs.existsSync(envPath)) {
    results.failed.push('✗ .env.production file not found');
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');

  // Check for live keys (not placeholders)
  const hasLivePublishable = envContent.includes('pk_live_') && !envContent.includes('YOUR_LIVE_PUBLISHABLE_KEY_HERE');
  const hasLiveSecret = envContent.includes('sk_live_') && !envContent.includes('YOUR_LIVE_SECRET_KEY_HERE');

  if (hasLivePublishable && hasLiveSecret) {
    results.passed.push('✓ Stripe production keys configured');
    return true;
  } else {
    results.failed.push('✗ Stripe still in TEST mode - keys are placeholders');
    results.failed.push('  Action: Run docs/STRIPE_PRODUCTION_SETUP.md (30-60 min)');
    return false;
  }
}

/**
 * Check 2: PRODUCTHUNT50 Promo Code
 */
function checkPromoCode() {
  console.log(`${colors.bright}[2/10] Checking PRODUCTHUNT50 promo code...${colors.reset}`);

  // This would require Stripe API call in production
  // For now, check if the env has Stripe keys (prerequisite)
  const envPath = path.join(__dirname, '../.env.production');
  const envContent = fs.readFileSync(envPath, 'utf8');

  if (envContent.includes('pk_live_') && !envContent.includes('YOUR_LIVE')) {
    results.warnings.push('⚠ Cannot verify PRODUCTHUNT50 code without Stripe API access');
    results.warnings.push('  Manual check: Stripe Dashboard → Coupons → Search for PRODUCTHUNT50');
    return null;
  } else {
    results.failed.push('✗ PRODUCTHUNT50 promo code cannot be verified (Stripe not in production mode)');
    return false;
  }
}

/**
 * Check 3: Product Hunt Assets
 */
function checkAssets() {
  console.log(`${colors.bright}[3/10] Checking Product Hunt assets...${colors.reset}`);

  const assetsDir = path.join(__dirname, '../launch/product-hunt/assets');
  const requiredAssets = {
    'logo.png': 'Logo (240x240px)',
    'gallery/1-landing-page.png': 'Landing page screenshot',
    'gallery/2-calculator.png': 'Calculator screenshot',
    'gallery/3-results.png': 'Results screenshot',
    'demo-video.mp4': 'Demo video (60-90 sec)'
  };

  let missingAssets = [];
  let foundAssets = [];

  for (const [file, description] of Object.entries(requiredAssets)) {
    const filePath = path.join(assetsDir, file);
    if (fs.existsSync(filePath)) {
      foundAssets.push(`✓ ${description} found`);
    } else {
      missingAssets.push(`✗ ${description} NOT FOUND (${file})`);
    }
  }

  if (missingAssets.length === 0) {
    results.passed.push('✓ All Product Hunt assets created');
    foundAssets.forEach(asset => results.passed.push(`  ${asset}`));
    return true;
  } else {
    results.failed.push(`✗ ${missingAssets.length} assets missing:`);
    missingAssets.forEach(asset => results.failed.push(`  ${asset}`));
    results.failed.push('  Action: See launch/product-hunt/assets/README.md (4-6 hours)');
    return false;
  }
}

/**
 * Check 4: Build Status
 */
function checkBuild() {
  console.log(`${colors.bright}[4/10] Checking build status...${colors.reset}`);

  const { execSync } = require('child_process');

  try {
    // Check if .next directory exists
    const nextDir = path.join(__dirname, '../.next');
    if (!fs.existsSync(nextDir)) {
      results.warnings.push('⚠ .next directory not found - run npm run build to verify');
      return null;
    }

    // Check for build errors in recent builds
    const buildId = path.join(nextDir, 'BUILD_ID');
    if (fs.existsSync(buildId)) {
      results.passed.push('✓ Build appears successful (.next/BUILD_ID exists)');
      return true;
    } else {
      results.warnings.push('⚠ Build status unclear - recommend running npm run build');
      return null;
    }
  } catch (error) {
    results.failed.push('✗ Build check failed: ' + error.message);
    return false;
  }
}

/**
 * Check 5: Production Site Status
 */
async function checkProductionSite() {
  console.log(`${colors.bright}[5/10] Checking production site status...${colors.reset}`);

  return new Promise((resolve) => {
    https.get('https://taxbridge.app/api/health', (res) => {
      if (res.statusCode === 200 || res.statusCode === 301) {
        results.passed.push('✓ Production site responding (taxbridge.app)');
        resolve(true);
      } else {
        results.failed.push(`✗ Production site returned status ${res.statusCode}`);
        resolve(false);
      }
    }).on('error', (error) => {
      results.failed.push('✗ Production site unreachable: ' + error.message);
      resolve(false);
    });
  });
}

/**
 * Check 6: Launch Materials
 */
function checkLaunchMaterials() {
  console.log(`${colors.bright}[6/10] Checking launch materials...${colors.reset}`);

  const launchDir = path.join(__dirname, '../launch/product-hunt');
  const requiredDocs = [
    'LAUNCH_CHECKLIST.md',
    'WAR_ROOM.md',
    'CMO_BRIEF.md',
    'HUNTER_OUTREACH.md',
    'FIRST_COMMENT.md',
    'RESPONSE_TEMPLATES.md',
    'SOCIAL_MEDIA_PLAYBOOK.md',
    'ASSET_PREP_GUIDE.md'
  ];

  const missingDocs = requiredDocs.filter(doc => !fs.existsSync(path.join(launchDir, doc)));

  if (missingDocs.length === 0) {
    results.passed.push('✓ All 8 launch documents prepared');
    return true;
  } else {
    results.failed.push(`✗ ${missingDocs.length} launch documents missing: ${missingDocs.join(', ')}`);
    return false;
  }
}

/**
 * Check 7: First Comment Ready
 */
function checkFirstComment() {
  console.log(`${colors.bright}[7/10] Checking first comment...${colors.reset}`);

  const firstCommentPath = path.join(__dirname, '../launch/product-hunt/FIRST_COMMENT.md');

  if (fs.existsSync(firstCommentPath)) {
    const content = fs.readFileSync(firstCommentPath, 'utf8');

    if (content.length > 200 && content.length < 2000) {
      results.passed.push('✓ First comment prepared (200-2000 characters)');
      return true;
    } else {
      results.warnings.push(`⚠ First comment length unusual: ${content.length} characters (target: 200-400)`);
      return null;
    }
  } else {
    results.failed.push('✗ FIRST_COMMENT.md not found');
    return false;
  }
}

/**
 * Check 8: Social Media Templates
 */
function checkSocialMediaTemplates() {
  console.log(`${colors.bright}[8/10] Checking social media templates...${colors.reset}`);

  const templatesPath = path.join(__dirname, '../launch/product-hunt/SOCIAL_MEDIA_TEMPLATES.md');

  if (fs.existsSync(templatesPath)) {
    const content = fs.readFileSync(templatesPath, 'utf8');

    // Check for key sections
    const hasTwitter = content.includes('TWITTER') || content.includes('Twitter');
    const hasLinkedIn = content.includes('LINKEDIN') || content.includes('LinkedIn');
    const hasReddit = content.includes('REDDIT') || content.includes('Reddit');
    const hasEmail = content.includes('EMAIL') || content.includes('Email');

    if (hasTwitter && hasLinkedIn && hasReddit && hasEmail) {
      results.passed.push('✓ Social media templates ready (Twitter, LinkedIn, Reddit, Email)');
      return true;
    } else {
      results.warnings.push('⚠ Social media templates incomplete - missing platforms');
      return null;
    }
  } else {
    results.failed.push('✗ SOCIAL_MEDIA_TEMPLATES.md not found');
    return false;
  }
}

/**
 * Check 9: Hunter Outreach Tracker
 */
function checkHunterTracker() {
  console.log(`${colors.bright}[9/10] Checking hunter outreach tracker...${colors.reset}`);

  const trackerPath = path.join(__dirname, '../launch/product-hunt/HUNTER_OUTREACH_TRACKER.md');

  if (fs.existsSync(trackerPath)) {
    results.passed.push('✓ Hunter outreach tracker created');
    results.warnings.push('  Manual action: Start hunter outreach on March 20');
    return true;
  } else {
    results.failed.push('✗ HUNTER_OUTREACH_TRACKER.md not found');
    return false;
  }
}

/**
 * Check 10: Execution Plan
 */
function checkExecutionPlan() {
  console.log(`${colors.bright}[10/10] Checking execution plan...${colors.reset}`);

  const planPath = path.join(__dirname, '../launch/PRODUCT_HUNT_EXECUTION_PLAN.md');

  if (fs.existsSync(planPath)) {
    const content = fs.readFileSync(planPath, 'utf8');

    if (content.includes('March 25, 2026')) {
      results.passed.push('✓ Execution plan created with timeline');
      return true;
    } else {
      results.warnings.push('⚠ Execution plan missing timeline');
      return null;
    }
  } else {
    results.failed.push('✗ PRODUCT_HUNT_EXECUTION_PLAN.md not found');
    return false;
  }
}

/**
 * Generate Report
 */
function generateReport() {
  console.log(`\n${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}VERIFICATION RESULTS${colors.reset}\n`);

  // Passed checks
  if (results.passed.length > 0) {
    console.log(`${colors.green}${colors.bright}PASSED (${results.passed.length}):${colors.reset}`);
    results.passed.forEach(item => console.log(`${colors.green}${item}${colors.reset}`));
    console.log('');
  }

  // Failed checks
  if (results.failed.length > 0) {
    console.log(`${colors.red}${colors.bright}FAILED (${results.failed.length}):${colors.reset}`);
    results.failed.forEach(item => console.log(`${colors.red}${item}${colors.reset}`));
    console.log('');
  }

  // Warnings
  if (results.warnings.length > 0) {
    console.log(`${colors.yellow}${colors.bright}WARNINGS (${results.warnings.length}):${colors.reset}`);
    results.warnings.forEach(item => console.log(`${colors.yellow}${item}${colors.reset}`));
    console.log('');
  }

  // Overall Status
  const totalChecks = 10;
  const passedChecks = results.passed.filter(p => p.startsWith('✓')).length;
  const failedChecks = results.failed.filter(f => f.startsWith('✗')).length;
  const warningChecks = results.warnings.filter(w => w.startsWith('⚠')).length;

  const readinessScore = Math.round((passedChecks / totalChecks) * 100);

  console.log(`${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}READINESS SCORE: ${readinessScore}% (${passedChecks}/${totalChecks} checks passed)${colors.reset}\n`);

  if (readinessScore === 100) {
    console.log(`${colors.green}${colors.bright}✓ READY TO LAUNCH${colors.reset}`);
    console.log(`${colors.green}All critical requirements met. You're good to go!${colors.reset}\n`);
  } else if (readinessScore >= 80) {
    console.log(`${colors.yellow}${colors.bright}⚠ MOSTLY READY${colors.reset}`);
    console.log(`${colors.yellow}Address remaining items before March 24 EOD${colors.reset}\n`);
  } else if (readinessScore >= 60) {
    console.log(`${colors.yellow}${colors.bright}⚠ NEEDS WORK${colors.reset}`);
    console.log(`${colors.yellow}Significant items remaining - begin immediately${colors.reset}\n`);
  } else {
    console.log(`${colors.red}${colors.bright}✗ NOT READY${colors.reset}`);
    console.log(`${colors.red}Critical blockers must be resolved before launch${colors.reset}\n`);
  }

  // Critical Blockers
  const criticalBlockers = results.failed.filter(f =>
    f.includes('Stripe') ||
    f.includes('PRODUCTHUNT50') ||
    f.includes('assets missing')
  );

  if (criticalBlockers.length > 0) {
    console.log(`${colors.red}${colors.bright}CRITICAL BLOCKERS (${criticalBlockers.length}):${colors.reset}`);
    criticalBlockers.forEach(blocker => console.log(`${colors.red}${blocker}${colors.reset}`));
    console.log('');
  }

  // Next Actions
  console.log(`${colors.bright}${colors.blue}NEXT ACTIONS:${colors.reset}`);

  if (results.failed.some(f => f.includes('Stripe'))) {
    console.log(`${colors.yellow}1. Activate Stripe production mode (30-60 min)${colors.reset}`);
    console.log(`   See: docs/STRIPE_PRODUCTION_SETUP.md`);
  }

  if (results.failed.some(f => f.includes('assets'))) {
    console.log(`${colors.yellow}2. Create Product Hunt assets (4-6 hours)${colors.reset}`);
    console.log(`   See: launch/product-hunt/assets/README.md`);
  }

  if (results.failed.some(f => f.includes('PRODUCTHUNT50'))) {
    console.log(`${colors.yellow}3. Create PRODUCTHUNT50 promo code in Stripe (20 min)${colors.reset}`);
    console.log(`   Requires Stripe production mode active first`);
  }

  if (passedChecks >= 8) {
    console.log(`${colors.yellow}4. Begin hunter outreach on March 20 (ongoing)${colors.reset}`);
    console.log(`   See: launch/product-hunt/HUNTER_OUTREACH_TRACKER.md`);
  }

  console.log(`\n${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}Run this script daily to track progress.${colors.reset}`);
  console.log(`${colors.bright}Target: 100% readiness by March 24 EOD${colors.reset}\n`);

  // Exit code
  process.exit(readinessScore === 100 ? 0 : 1);
}

/**
 * Run all checks
 */
async function runChecks() {
  checkStripeProduction();
  checkPromoCode();
  checkAssets();
  checkBuild();
  await checkProductionSite();
  checkLaunchMaterials();
  checkFirstComment();
  checkSocialMediaTemplates();
  checkHunterTracker();
  checkExecutionPlan();

  generateReport();
}

// Execute
runChecks().catch(error => {
  console.error(`${colors.red}Verification script error: ${error.message}${colors.reset}`);
  process.exit(1);
});
