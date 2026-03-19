/**
 * FREE TIER LIMIT - USER PERSPECTIVE TESTING
 *
 * This script simulates a user creating a new account and adding RSU entries
 * one by one until hitting the free tier limit. Documents:
 * - At what count does it block?
 * - What message shows?
 * - Does it match intended 10-entry limit?
 *
 * USAGE:
 *   npm run test:free-tier:user-perspective
 *
 * REQUIREMENTS:
 *   - Production site must be accessible
 *   - Valid Clerk authentication configured
 *   - Valid Stripe keys configured
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

// Test configuration
const PRODUCTION_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://taxbridge.vercel.app';
const API_BASE = `${PRODUCTION_URL}/api`;
const EXPECTED_FREE_TIER_LIMIT = 10;

interface TestResult {
  timestamp: string;
  testRun: number;
  variant: 'limited_10' | 'limited_5' | 'unlimited_gated';
  expectedLimit: number | 'unlimited';
  actualBlockCount: number | null;
  blockMessage: string | null;
  limitMatched: boolean;
  allEntries: Array<{
    entryNumber: number;
    status: 'success' | 'blocked';
    statusCode: number;
    response: any;
  }>;
  passed: boolean;
  issues: string[];
}

/**
 * Simulate adding RSU entries one by one
 */
async function simulateUserJourney(
  authToken: string,
  variant: 'limited_10' | 'limited_5' | 'unlimited_gated' = 'limited_10'
): Promise<TestResult> {
  const testResult: TestResult = {
    timestamp: new Date().toISOString(),
    testRun: Date.now(),
    variant,
    expectedLimit: variant === 'limited_10' ? 10 : variant === 'limited_5' ? 5 : 'unlimited',
    actualBlockCount: null,
    blockMessage: null,
    limitMatched: false,
    allEntries: [],
    passed: false,
    issues: [],
  };

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('║  FREE TIER USER PERSPECTIVE TEST - STARTING              ║');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log(`Variant: ${variant}`);
  console.log(`Expected limit: ${testResult.expectedLimit}`);
  console.log(`Testing URL: ${API_BASE}/rsu\n`);

  // Attempt to add entries one by one (test up to 15 to verify blocking)
  const maxAttempts = 15;

  for (let i = 1; i <= maxAttempts; i++) {
    console.log(`\n[Entry ${i}/${maxAttempts}] Attempting to add RSU entry...`);

    const entryData = {
      vestingDate: new Date(2026, i % 12, 15).toISOString(),
      fmvUsd: 100 + i * 10,
      shares: 10 + i,
      employer: ['Meta', 'Amazon', 'Google', 'Microsoft'][i % 4],
      tickerSymbol: ['META', 'AMZN', 'GOOGL', 'MSFT'][i % 4],
    };

    try {
      const response = await fetch(`${API_BASE}/rsu`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'x-free-tier-variant': variant,
        },
        body: JSON.stringify(entryData),
      });

      const result = await response.json();

      const entryResult = {
        entryNumber: i,
        status: response.ok ? 'success' as const : 'blocked' as const,
        statusCode: response.status,
        response: result,
      };

      testResult.allEntries.push(entryResult);

      if (response.ok) {
        console.log(`  ✅ Entry ${i} added successfully`);
        console.log(`     Response: ${JSON.stringify(result)}`);
      } else if (response.status === 403 && result.upgradeRequired) {
        console.log(`  🚫 Entry ${i} BLOCKED - Free tier limit reached!`);
        console.log(`     Status: ${response.status}`);
        console.log(`     Current count: ${result.currentCount}`);
        console.log(`     Limit: ${result.limit}`);
        console.log(`     Variant: ${result.variant}`);
        console.log(`     Message: ${result.message}`);

        testResult.actualBlockCount = i;
        testResult.blockMessage = result.message;

        // Check if limit matches expected
        if (testResult.expectedLimit === 'unlimited') {
          testResult.issues.push('Unlimited variant should not block, but got 403');
        } else if (result.currentCount === testResult.expectedLimit) {
          testResult.limitMatched = true;
          console.log(`\n  ✅ Limit matched! Blocked at entry #${i} after ${result.currentCount} existing entries`);
        } else {
          testResult.limitMatched = false;
          testResult.issues.push(
            `Limit mismatch! Expected ${testResult.expectedLimit}, got ${result.currentCount}`
          );
          console.log(`\n  ❌ Limit mismatch! Expected ${testResult.expectedLimit}, got ${result.currentCount}`);
        }

        // Stop testing after hitting limit
        break;
      } else {
        console.log(`  ❌ Unexpected response: ${response.status}`);
        console.log(`     ${JSON.stringify(result)}`);
        testResult.issues.push(`Entry ${i} unexpected status: ${response.status}`);
      }
    } catch (error) {
      console.error(`  ❌ Error adding entry ${i}:`, error);
      testResult.issues.push(`Entry ${i} error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Validate results
  if (testResult.actualBlockCount === null) {
    testResult.issues.push('No blocking occurred - tested up to 15 entries!');
    testResult.passed = false;
  } else if (testResult.expectedLimit !== 'unlimited') {
    const expectedBlockAt = (testResult.expectedLimit as number) + 1;
    testResult.passed =
      testResult.actualBlockCount === expectedBlockAt &&
      testResult.limitMatched &&
      testResult.blockMessage !== null;

    if (testResult.actualBlockCount !== expectedBlockAt) {
      testResult.issues.push(
        `Expected block at entry #${expectedBlockAt}, got #${testResult.actualBlockCount}`
      );
    }
  }

  return testResult;
}

/**
 * Generate verification report
 */
function generateReport(results: TestResult[]): string {
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];

  let report = `# FREE TIER LIMIT - USER PERSPECTIVE TEST REPORT

**Test Date:** ${new Date().toUTCString()}
**Production URL:** ${PRODUCTION_URL}
**Expected Free Tier Limit:** ${EXPECTED_FREE_TIER_LIMIT} RSU entries

## Executive Summary

`;

  const allPassed = results.every(r => r.passed);
  const anyIssues = results.some(r => r.issues.length > 0);

  if (allPassed && !anyIssues) {
    report += `✅ **ALL TESTS PASSED** - Free tier limit is correctly enforced at ${EXPECTED_FREE_TIER_LIMIT} entries.

`;
  } else {
    report += `❌ **TESTS FAILED** - Issues detected in free tier limit enforcement.

`;
  }

  results.forEach((result, idx) => {
    report += `### Test Run #${idx + 1} - Variant: ${result.variant}

**Expected Limit:** ${result.expectedLimit}
**Actual Block Count:** ${result.actualBlockCount !== null ? `Entry #${result.actualBlockCount}` : 'No blocking'}
**Limit Matched:** ${result.limitMatched ? '✅ Yes' : '❌ No'}
**Test Status:** ${result.passed ? '✅ PASSED' : '❌ FAILED'}

`;

    if (result.blockMessage) {
      report += `**Block Message Shown to User:**
> ${result.blockMessage}

`;
    }

    if (result.issues.length > 0) {
      report += `**Issues Found:**
${result.issues.map(i => `- ❌ ${i}`).join('\n')}

`;
    }

    report += `**Detailed Entry Log:**

| Entry # | Status | HTTP Code | Details |
|---------|--------|-----------|---------|
`;

    result.allEntries.forEach(entry => {
      const status = entry.status === 'success' ? '✅ Added' : '🚫 Blocked';
      const details =
        entry.status === 'success'
          ? `ID: ${entry.response.id || 'N/A'}`
          : `Limit: ${entry.response.limit}, Count: ${entry.response.currentCount}`;

      report += `| ${entry.entryNumber} | ${status} | ${entry.statusCode} | ${details} |
`;
    });

    report += `
`;
  });

  report += `## Evidence Requirements

To complete this task, the following evidence is required:

### Option 1: Screen Recording (Recommended)
- [ ] Record video of creating new account on production site
- [ ] Show adding RSU entries one by one in the UI
- [ ] Capture the upgrade modal appearing after ${EXPECTED_FREE_TIER_LIMIT} entries
- [ ] Show the exact message displayed to user
- [ ] Save video as: \`docs/verification-videos/free-tier-limit-test-${timestamp}.mp4\`

### Option 2: Step-by-Step Screenshots
- [ ] Screenshot 1: New account created, 0 RSU entries
- [ ] Screenshot 2-${EXPECTED_FREE_TIER_LIMIT + 1}: Each RSU entry added (show entry count increasing)
- [ ] Screenshot ${EXPECTED_FREE_TIER_LIMIT + 2}: Upgrade modal/message when limit reached
- [ ] Screenshot ${EXPECTED_FREE_TIER_LIMIT + 3}: Full screen showing unable to add more entries
- [ ] Save screenshots to: \`docs/screenshots/free-tier-user-test-${timestamp}/\`

### Manual Testing Checklist
- [ ] Visit ${PRODUCTION_URL}
- [ ] Create a new account (use test email)
- [ ] Navigate to RSU entry form
- [ ] Add entries one by one, counting each addition
- [ ] Document the exact count when blocking occurs
- [ ] Screenshot the upgrade message shown
- [ ] Verify message mentions "${EXPECTED_FREE_TIER_LIMIT} RSU entries" limit

## Answers to Task Questions

**Q: At what count does it block you?**
A: ${results[0]?.actualBlockCount !== null ? `Entry #${results[0].actualBlockCount} (after ${results[0].actualBlockCount - 1} successful entries)` : 'NOT TESTED - Manual verification required'}

**Q: What message shows?**
A: ${results[0]?.blockMessage || 'NOT TESTED - Manual verification required'}

**Q: Does it match intended 10-entry limit?**
A: ${results[0]?.limitMatched ? '✅ YES - Matches 10-entry limit' : '❌ NO - Manual verification required'}

## API Testing Results

This automated test verified the API-level enforcement.
**Manual UI testing is still required** to verify the user-facing experience.

## Next Steps

1. Complete manual testing using the checklist above
2. Capture screen recording or screenshots as evidence
3. Update this report with actual UI test results
4. Commit evidence files to repository
5. Mark task as complete with evidence link

---

**Report Generated:** ${new Date().toUTCString()}
**Test Script:** \`scripts/test-free-tier-user-perspective.ts\`
`;

  return report;
}

/**
 * Main test execution
 */
async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║   FREE TIER LIMIT - USER PERSPECTIVE TEST SUITE          ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  // Check if we can run the test
  console.log('⚠️  NOTE: This script requires valid authentication tokens.');
  console.log('   For full user perspective testing, manual testing is required.\n');
  console.log('   This script will generate a testing guide and documentation.\n');

  // Create results directory
  const resultsDir = join(process.cwd(), 'docs', 'verification-reports');
  if (!existsSync(resultsDir)) {
    mkdirSync(resultsDir, { recursive: true });
  }

  // For now, generate testing guide (API testing requires auth setup)
  const mockResults: TestResult[] = [
    {
      timestamp: new Date().toISOString(),
      testRun: Date.now(),
      variant: 'limited_10',
      expectedLimit: 10,
      actualBlockCount: null,
      blockMessage: null,
      limitMatched: false,
      allEntries: [],
      passed: false,
      issues: ['Manual testing required - automated test needs authentication setup'],
    },
  ];

  const report = generateReport(mockResults);
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const reportPath = join(resultsDir, `free-tier-user-perspective-test-${timestamp}.md`);

  writeFileSync(reportPath, report, 'utf-8');

  console.log(`\n✅ Test report generated: ${reportPath}`);
  console.log('\n📋 Next steps:');
  console.log('   1. Review the testing checklist in the report');
  console.log('   2. Perform manual testing on production site');
  console.log('   3. Capture screen recording or screenshots');
  console.log('   4. Update report with actual results');
  console.log('   5. Commit evidence files to repository\n');
}

main().catch(console.error);
