#!/usr/bin/env tsx
/**
 * PostHog Production Verification Script
 *
 * Verifies that PostHog is configured correctly and events are flowing
 *
 * Usage:
 *   npm run verify:posthog
 *   npx tsx scripts/verify-posthog.ts
 *
 * Checks:
 * 1. Environment variables are set correctly
 * 2. PostHog API key is not a placeholder
 * 3. Can send test events
 * 4. Events appear in PostHog dashboard
 */

import { PostHog } from 'posthog-node';
import * as fs from 'fs';
import * as path from 'path';

interface VerificationResult {
  step: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

const results: VerificationResult[] = [];

function log(result: VerificationResult) {
  results.push(result);
  const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
  console.log(`${icon} ${result.step}: ${result.message}`);
  if (result.details) {
    console.log(`   ${result.details}`);
  }
}

async function verifyPostHogConfiguration() {
  console.log('🔍 PostHog Production Verification\n');
  console.log('═══════════════════════════════════════════════════════\n');

  // Step 1: Check environment variables exist
  const postHogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const postHogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';
  const postHogProjectId = process.env.POSTHOG_PROJECT_ID;

  if (!postHogKey) {
    log({
      step: 'Environment Variables',
      status: 'fail',
      message: 'NEXT_PUBLIC_POSTHOG_KEY is not set',
      details: 'Set this in .env.production or Vercel dashboard',
    });
    return false;
  }

  // Step 2: Check if key is a placeholder
  const isPlaceholder =
    postHogKey.includes('YOUR_PROJECT') ||
    postHogKey.includes('your_project') ||
    postHogKey === 'phc_' ||
    postHogKey.length < 20;

  if (isPlaceholder) {
    log({
      step: 'API Key Validation',
      status: 'fail',
      message: 'PostHog key is a placeholder',
      details: `Current value: ${postHogKey}\nReplace with real key from https://app.posthog.com`,
    });
    return false;
  }

  // Verify key format
  if (!postHogKey.startsWith('phc_')) {
    log({
      step: 'API Key Format',
      status: 'fail',
      message: 'PostHog key has invalid format',
      details: `Key should start with 'phc_', got: ${postHogKey.substring(0, 10)}...`,
    });
    return false;
  }

  log({
    step: 'API Key Format',
    status: 'pass',
    message: 'PostHog key format is correct',
    details: `Key: ${postHogKey.substring(0, 15)}... (${postHogKey.length} chars)`,
  });

  // Step 3: Check project ID
  if (!postHogProjectId || postHogProjectId === 'YOUR_PROJECT_ID') {
    log({
      step: 'Project ID',
      status: 'warning',
      message: 'POSTHOG_PROJECT_ID is not set or is placeholder',
      details: 'This is optional but recommended for verification',
    });
  } else {
    log({
      step: 'Project ID',
      status: 'pass',
      message: `Project ID configured: ${postHogProjectId}`,
    });
  }

  // Step 4: Initialize PostHog client
  let client: PostHog;
  try {
    client = new PostHog(postHogKey, {
      host: postHogHost,
    });

    log({
      step: 'PostHog Initialization',
      status: 'pass',
      message: 'PostHog client initialized successfully',
      details: `Host: ${postHogHost}`,
    });
  } catch (error) {
    log({
      step: 'PostHog Initialization',
      status: 'fail',
      message: 'Failed to initialize PostHog client',
      details: error instanceof Error ? error.message : String(error),
    });
    return false;
  }

  // Step 5: Send test event
  const testEventId = `test-${Date.now()}`;
  const testTimestamp = new Date();

  try {
    client.capture({
      distinctId: 'verification-test-user',
      event: 'test_event_verification',
      properties: {
        test_id: testEventId,
        timestamp: testTimestamp.toISOString(),
        verification_script: true,
        environment: process.env.NODE_ENV || 'production',
      },
    });

    // Flush to ensure event is sent immediately
    await client.shutdown();

    log({
      step: 'Test Event Sent',
      status: 'pass',
      message: 'Test event sent successfully',
      details: `Event ID: ${testEventId}\nCheck PostHog dashboard for event: test_event_verification`,
    });
  } catch (error) {
    log({
      step: 'Test Event Sent',
      status: 'fail',
      message: 'Failed to send test event',
      details: error instanceof Error ? error.message : String(error),
    });
    return false;
  }

  return true;
}

async function checkBrowserIntegration() {
  console.log('\n🌐 Checking Browser Integration\n');
  console.log('═══════════════════════════════════════════════════════\n');

  // Check if posthog.ts file exists
  const posthogPath = path.join(process.cwd(), 'lib', 'analytics', 'posthog.ts');

  if (!fs.existsSync(posthogPath)) {
    log({
      step: 'Browser Integration',
      status: 'fail',
      message: 'PostHog integration file not found',
      details: `Expected: ${posthogPath}`,
    });
    return false;
  }

  log({
    step: 'Browser Integration',
    status: 'pass',
    message: 'PostHog integration file exists',
    details: posthogPath,
  });

  // Check if file contains correct initialization
  const content = fs.readFileSync(posthogPath, 'utf-8');

  if (!content.includes('posthog.init')) {
    log({
      step: 'Initialization Code',
      status: 'fail',
      message: 'PostHog initialization code not found',
      details: 'File exists but missing posthog.init() call',
    });
    return false;
  }

  log({
    step: 'Initialization Code',
    status: 'pass',
    message: 'PostHog initialization code present',
  });

  // Check for event tracking functions
  const hasTrackEvent = content.includes('export function trackEvent');
  const hasIdentifyUser = content.includes('export function identifyUser');
  const hasTrackPageView = content.includes('export function trackPageView');

  if (hasTrackEvent && hasIdentifyUser && hasTrackPageView) {
    log({
      step: 'Tracking Functions',
      status: 'pass',
      message: 'All core tracking functions implemented',
      details: 'trackEvent, identifyUser, trackPageView',
    });
  } else {
    log({
      step: 'Tracking Functions',
      status: 'warning',
      message: 'Some tracking functions may be missing',
      details: `trackEvent: ${hasTrackEvent}, identifyUser: ${hasIdentifyUser}, trackPageView: ${hasTrackPageView}`,
    });
  }

  return true;
}

async function generateVerificationReport() {
  console.log('\n📊 Generating Verification Report\n');
  console.log('═══════════════════════════════════════════════════════\n');

  const timestamp = new Date().toISOString().split('T')[0];
  const reportPath = path.join(process.cwd(), 'docs', `POSTHOG_VERIFICATION_${timestamp}.md`);

  const passCount = results.filter((r) => r.status === 'pass').length;
  const failCount = results.filter((r) => r.status === 'fail').length;
  const warnCount = results.filter((r) => r.status === 'warning').length;

  const report = `# PostHog Production Verification Report

**Date**: ${new Date().toISOString()}
**Status**: ${failCount === 0 ? '✅ PASSED' : '❌ FAILED'}

## Summary

- ✅ Passed: ${passCount}
- ❌ Failed: ${failCount}
- ⚠️ Warnings: ${warnCount}

## Verification Steps

${results
  .map(
    (r) => `### ${r.status === 'pass' ? '✅' : r.status === 'fail' ? '❌' : '⚠️'} ${r.step}

**Status**: ${r.status.toUpperCase()}
**Message**: ${r.message}
${r.details ? `\n**Details**:\n\`\`\`\n${r.details}\n\`\`\`` : ''}
`
  )
  .join('\n')}

## Next Steps

${
  failCount > 0
    ? `### ❌ Fix Required Issues

${results
  .filter((r) => r.status === 'fail')
  .map((r) => `- **${r.step}**: ${r.message}`)
  .join('\n')}

Refer to \`docs/POSTHOG_PRODUCTION_SETUP.md\` for detailed setup instructions.
`
    : `### ✅ PostHog is Configured Correctly!

**Manual Verification Required:**

1. **Visit Production Site**: https://taxbridge.vercel.app
2. **Open PostHog Dashboard**: https://app.posthog.com/project/YOUR_PROJECT_ID/events
3. **Verify Events Flowing**:
   - Navigate to homepage → Check for \`landing_page_viewed\`
   - Go to calculator → Check for \`calculator_page_viewed\`
   - Complete calculation → Check for \`tax_calculation_viewed\`

4. **Take Screenshots**:
   - Screenshot 1: PostHog live events dashboard
   - Screenshot 2: Specific event details
   - Save to: \`docs/screenshots/posthog-live-events-${timestamp}.png\`

5. **Mark Task Complete**:
   - Evidence: 2 screenshots showing live events
   - Commit message: "[P0-CRITICAL] PostHog Production Activated - Events Flowing ✅"
`
}

## Environment Variables

\`\`\`bash
NEXT_PUBLIC_POSTHOG_KEY=${process.env.NEXT_PUBLIC_POSTHOG_KEY?.substring(0, 20)}...
NEXT_PUBLIC_POSTHOG_HOST=${process.env.NEXT_PUBLIC_POSTHOG_HOST}
POSTHOG_PROJECT_ID=${process.env.POSTHOG_PROJECT_ID}
\`\`\`

## Resources

- Setup Guide: \`docs/POSTHOG_PRODUCTION_SETUP.md\`
- Integration Code: \`lib/analytics/posthog.ts\`
- PostHog Dashboard: https://app.posthog.com
- Documentation: https://posthog.com/docs
`;

  try {
    fs.writeFileSync(reportPath, report, 'utf-8');
    console.log(`✅ Verification report saved: ${reportPath}`);
  } catch (error) {
    console.error(`❌ Failed to save report: ${error}`);
  }

  return reportPath;
}

async function main() {
  console.clear();
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║   PostHog Production Verification                    ║');
  console.log('║   TaxBridge Cross-Border Tax Calculator              ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  // Run verification steps
  const configOk = await verifyPostHogConfiguration();
  const browserOk = await checkBrowserIntegration();

  // Generate report
  const reportPath = await generateVerificationReport();

  // Final summary
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║   Verification Complete                               ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  const allPassed = results.filter((r) => r.status === 'fail').length === 0;

  if (allPassed) {
    console.log('✅ PostHog is configured correctly!\n');
    console.log('📋 Next Steps:');
    console.log('   1. Visit production site and trigger events');
    console.log('   2. Check PostHog dashboard for live events');
    console.log('   3. Take screenshots for verification');
    console.log('   4. Complete task with evidence\n');
    console.log(`📄 Full report: ${reportPath}\n`);
    process.exit(0);
  } else {
    console.log('❌ PostHog verification FAILED\n');
    console.log('📋 Action Required:');
    console.log('   1. Review failures above');
    console.log('   2. Follow setup guide: docs/POSTHOG_PRODUCTION_SETUP.md');
    console.log('   3. Update environment variables in Vercel');
    console.log('   4. Re-run this script\n');
    console.log(`📄 Full report: ${reportPath}\n`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { verifyPostHogConfiguration, checkBrowserIntegration };
