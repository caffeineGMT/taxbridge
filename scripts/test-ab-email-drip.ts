/**
 * Test Script for Enhanced Email Drip Campaign with A/B Testing
 *
 * Tests:
 * - A/B variant selection
 * - UTM URL generation
 * - Enhanced personalization
 * - Conversion tracking
 */

import { getDatabase } from '@/lib/db';
import {
  selectABVariant,
  getABVariants,
  getABTestAnalytics,
  getWinningVariant,
} from '@/lib/email/ab-testing';
import { generateEmailUrls } from '@/lib/email/utm-tracking';
import {
  getEnhancedWelcomeEmailData,
  getEnhancedDay3EmailData,
  getEnhancedDay7EmailData,
  getEnhancedDay14EmailData,
} from '@/lib/email/enhanced-templates';
import { trackEmailConversion, getConversionStats } from '@/lib/email/conversion-tracking';
import { recordEmailSent } from '@/lib/db/queries/drip-campaign';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

const results: TestResult[] = [];

function test(name: string, fn: () => boolean | Promise<boolean>, expected = true): void {
  try {
    const result = fn();
    const passed = result === expected;
    results.push({
      name,
      passed,
      message: passed ? '✅ PASS' : '❌ FAIL',
    });
  } catch (error) {
    results.push({
      name,
      passed: false,
      message: `❌ ERROR: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
}

async function runTests() {
  console.log('🧪 Testing Enhanced Email Drip Campaign with A/B Testing\n');

  // Test 1: A/B variant configuration exists
  test('A/B variants exist for welcome email', () => {
    const variants = getABVariants('drip_welcome');
    return variants.length === 2;
  });

  test('A/B variants exist for day3 email', () => {
    const variants = getABVariants('drip_day3');
    return variants.length === 2;
  });

  test('A/B variants exist for day7 email', () => {
    const variants = getABVariants('drip_day7');
    return variants.length === 2;
  });

  test('A/B variants exist for day14 email', () => {
    const variants = getABVariants('drip_day14');
    return variants.length === 2;
  });

  // Test 2: Variant selection works
  test('Can select random A/B variant', () => {
    const variant = selectABVariant('drip_welcome');
    return variant !== null && (variant.variant === 'A' || variant.variant === 'B');
  });

  // Test 3: UTM URL generation
  test('UTM URLs are generated correctly', () => {
    const urls = generateEmailUrls('drip_welcome', 'A', 'test@example.com');
    const url = new URL(urls.dashboard_url);
    return (
      url.searchParams.get('utm_source') === 'email' &&
      url.searchParams.get('utm_medium') === 'drip-campaign' &&
      url.searchParams.get('utm_campaign') === 'welcome-email' &&
      url.searchParams.get('utm_content') === 'variant-a'
    );
  });

  // Test 4: Enhanced email data generation
  test('Welcome email data includes personalization', () => {
    const variant = selectABVariant('drip_welcome');
    if (!variant) return false;

    const emailData = getEnhancedWelcomeEmailData({
      userId: 1,
      firstName: 'John',
      email: 'john@example.com',
      variant: variant.variant,
      subjectLine: variant.subject_line,
      ctaText: variant.cta_text,
    });

    return (
      emailData.first_name === 'John' &&
      emailData.subject_line !== '' &&
      emailData.cta_text !== '' &&
      emailData.estimated_tax_savings !== undefined &&
      emailData.dashboard_url.includes('utm_')
    );
  });

  // Test 5: Day 3 email data
  test('Day 3 email includes FTC education data', () => {
    const variant = selectABVariant('drip_day3');
    if (!variant) return false;

    const emailData = getEnhancedDay3EmailData({
      userId: 1,
      firstName: 'Jane',
      email: 'jane@example.com',
      variant: variant.variant,
      subjectLine: variant.subject_line,
      ctaText: variant.cta_text,
    });

    return (
      emailData.ftc_savings_range !== undefined &&
      emailData.ftc_calculator_url.includes('utm_') &&
      emailData.estimated_tax_savings !== undefined
    );
  });

  // Test 6: Day 7 email data
  test('Day 7 email includes feature URLs', () => {
    const variant = selectABVariant('drip_day7');
    if (!variant) return false;

    const emailData = getEnhancedDay7EmailData({
      userId: 1,
      firstName: 'Bob',
      email: 'bob@example.com',
      variant: variant.variant,
      subjectLine: variant.subject_line,
      ctaText: variant.cta_text,
    });

    return (
      emailData.dual_calculator_url !== undefined &&
      emailData.form_checklist_url !== undefined &&
      emailData.forms_url.includes('utm_')
    );
  });

  // Test 7: Day 14 email with discount code
  test('Day 14 email includes discount code and pricing', () => {
    const variant = selectABVariant('drip_day14');
    if (!variant) return false;

    const emailData = getEnhancedDay14EmailData({
      userId: 1,
      firstName: 'Alice',
      email: 'alice@example.com',
      variant: variant.variant,
      subjectLine: variant.subject_line,
      ctaText: variant.cta_text,
      discountCode: 'SAVE20',
    });

    return (
      emailData.discount_code === 'SAVE20' &&
      emailData.discount_amount === '20%' &&
      emailData.upgrade_url.includes('code=SAVE20') &&
      emailData.premium_features.length > 0
    );
  });

  // Test 8: Email event recording with A/B variant
  test('Email events are recorded with A/B variant', () => {
    const variant = selectABVariant('drip_welcome');
    if (!variant) return false;

    const eventId = recordEmailSent(
      999,
      'drip_welcome',
      { test: true },
      variant.variant,
      'welcome-email'
    );

    return eventId > 0;
  });

  // Test 9: Conversion tracking
  test('Email conversion tracking works', () => {
    const success = trackEmailConversion({
      userId: 999,
      conversionType: 'free_to_pro',
      revenueAmount: 20,
      discountCode: 'SAVE20',
      metadata: { test: true },
    });

    return success;
  });

  // Test 10: Conversion stats calculation
  test('Conversion stats are calculated', () => {
    const stats = getConversionStats();
    return (
      stats.total_conversions >= 0 &&
      stats.conversion_rate >= 0 &&
      stats.total_revenue >= 0
    );
  });

  // Test 11: Winning variant detection
  test('Can determine winning variant', () => {
    const result = getWinningVariant('drip_welcome');
    return result !== null;
  });

  // Test 12: A/B test analytics
  test('A/B test analytics are available', () => {
    const analytics = getABTestAnalytics('drip_welcome');
    return Array.isArray(analytics);
  });

  // Print results
  console.log('\n📊 Test Results:\n');

  let passed = 0;
  let failed = 0;

  results.forEach((result) => {
    console.log(`${result.message} ${result.name}`);
    if (result.passed) {
      passed++;
    } else {
      failed++;
    }
  });

  console.log(`\n📈 Summary: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    console.log('✨ All tests passed! Email A/B testing is working correctly.');
  } else {
    console.error('❌ Some tests failed. Please review the errors above.');
    process.exit(1);
  }

  // Clean up test data
  const db = getDatabase();
  db.prepare('DELETE FROM email_events WHERE user_id = 999').run();
  db.prepare('DELETE FROM email_conversions WHERE user_id = 999').run();
  console.log('\n🧹 Test data cleaned up.');
}

// Run tests
runTests().catch((error) => {
  console.error('❌ Test runner error:', error);
  process.exit(1);
});
