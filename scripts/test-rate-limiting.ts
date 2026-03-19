/**
 * Rate Limiting Test Script
 *
 * Tests rate limiting implementation by sending concurrent requests
 * to various API endpoints.
 *
 * Usage: tsx scripts/test-rate-limiting.ts
 */

import fetch from 'node-fetch';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface TestResult {
  endpoint: string;
  totalRequests: number;
  successCount: number;
  rateLimitedCount: number;
  errorCount: number;
  expectedLimit: number;
  passed: boolean;
}

async function testEndpoint(
  endpoint: string,
  method: string,
  body: any,
  requestCount: number,
  expectedLimit: number
): Promise<TestResult> {
  console.log(`\nTesting ${endpoint}...`);
  console.log(`Sending ${requestCount} requests (expecting ${expectedLimit} to succeed)`);

  const promises = Array.from({ length: requestCount }, () =>
    fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  );

  const responses = await Promise.all(promises);

  let successCount = 0;
  let rateLimitedCount = 0;
  let errorCount = 0;

  for (const response of responses) {
    if (response.status === 200 || response.status === 201) {
      successCount++;
    } else if (response.status === 429) {
      rateLimitedCount++;
      const data: any = await response.json();
      console.log(`  ✓ Rate limited (retry after ${data.retryAfter}s)`);
    } else {
      errorCount++;
      console.log(`  ✗ Error ${response.status}`);
    }
  }

  const passed = successCount <= expectedLimit && rateLimitedCount > 0;

  console.log(`Results: ${successCount} success, ${rateLimitedCount} rate-limited, ${errorCount} errors`);
  console.log(passed ? '✅ PASSED' : '❌ FAILED');

  return {
    endpoint,
    totalRequests: requestCount,
    successCount,
    rateLimitedCount,
    errorCount,
    expectedLimit,
    passed,
  };
}

async function main() {
  console.log('='.repeat(60));
  console.log('Rate Limiting Test Suite');
  console.log('='.repeat(60));

  const results: TestResult[] = [];

  // Test 1: Public form endpoint (STRICT - 10 req/min)
  results.push(
    await testEndpoint(
      '/api/marketing/capture-lead',
      'POST',
      {
        email: `test-${Date.now()}@example.com`,
        sourcePage: 'test',
      },
      15, // Send 15 requests
      10 // Expect 10 to succeed
    )
  );

  // Wait a bit between tests
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Test 2: Newsletter subscription (STRICT - 10 req/min)
  results.push(
    await testEndpoint(
      '/api/newsletter/subscribe',
      'POST',
      {
        email: `test-${Date.now()}@example.com`,
        source: 'test',
      },
      15,
      10
    )
  );

  // Wait before next test
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Test 3: Health endpoint (GENEROUS - 120 req/min)
  results.push(
    await testEndpoint(
      '/api/health',
      'GET',
      undefined,
      130, // Send 130 requests
      120 // Expect 120 to succeed
    )
  );

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Test Summary');
  console.log('='.repeat(60));

  const allPassed = results.every((r) => r.passed);

  results.forEach((result) => {
    const status = result.passed ? '✅' : '❌';
    console.log(
      `${status} ${result.endpoint}: ${result.successCount}/${result.totalRequests} succeeded (expected ≤${result.expectedLimit})`
    );
  });

  console.log('\n' + '='.repeat(60));
  if (allPassed) {
    console.log('✅ All tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Test suite error:', error);
  process.exit(1);
});
