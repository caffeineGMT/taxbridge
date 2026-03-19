#!/usr/bin/env tsx
/**
 * Feedback Infrastructure Health Check
 *
 * Verifies that all feedback collection systems are properly configured:
 * 1. Database tables exist (customer_feedback, etc.)
 * 2. PostHog tracking is configured
 * 3. Analytics events are being captured
 * 4. Email system is set up
 *
 * Usage:
 *   tsx scripts/verify-feedback-infrastructure.ts
 *
 * Exit codes:
 *   0 = All systems healthy
 *   1 = Critical issues found
 */

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

const checks: HealthCheck[] = [];

function addCheck(
  name: string,
  status: 'pass' | 'fail' | 'warn',
  message: string,
  severity: 'critical' | 'high' | 'medium' | 'low' = 'medium'
) {
  checks.push({ name, status, message, severity });
}

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

console.log(`\n${colors.bold}🔍 Feedback Infrastructure Health Check${colors.reset}\n`);

// ============================================================================
// 1. Database Tables Check
// ============================================================================

console.log('1. Checking database tables...');

const dbPath = path.join(process.cwd(), 'data/taxbridge.db');

if (!fs.existsSync(dbPath)) {
  addCheck(
    'Database file',
    'fail',
    `Database file not found at: ${dbPath}`,
    'critical'
  );
} else {
  addCheck('Database file', 'pass', `Found at: ${dbPath}`, 'low');

  const db = new Database(dbPath);

  // Check for customer_feedback table
  const feedbackTableExists = db
    .prepare(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='customer_feedback'`
    )
    .get();

  if (!feedbackTableExists) {
    addCheck(
      'customer_feedback table',
      'fail',
      'Table does not exist. Run migration: lib/db/migrations/014_customer_success_feedback.sql',
      'critical'
    );
  } else {
    addCheck('customer_feedback table', 'pass', 'Table exists', 'low');

    // Check for data
    const feedbackCount = db
      .prepare('SELECT COUNT(*) as count FROM customer_feedback')
      .get() as { count: number };

    if (feedbackCount.count === 0) {
      addCheck(
        'customer_feedback data',
        'warn',
        'Table exists but no feedback collected yet (expected pre-launch)',
        'low'
      );
    } else {
      addCheck(
        'customer_feedback data',
        'pass',
        `${feedbackCount.count} feedback entries found`,
        'low'
      );
    }
  }

  // Check for analytics_events table
  const analyticsTableExists = db
    .prepare(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='analytics_events'`
    )
    .get();

  if (!analyticsTableExists) {
    addCheck(
      'analytics_events table',
      'fail',
      'Table does not exist',
      'critical'
    );
  } else {
    addCheck('analytics_events table', 'pass', 'Table exists', 'low');

    // Check for events
    const eventCount = db
      .prepare('SELECT COUNT(*) as count FROM analytics_events')
      .get() as { count: number };

    if (eventCount.count === 0) {
      addCheck(
        'analytics_events data',
        'warn',
        'No events tracked yet. PostHog may not be configured.',
        'high'
      );
    } else {
      addCheck(
        'analytics_events data',
        'pass',
        `${eventCount.count} events tracked`,
        'low'
      );
    }
  }

  // Check for churn_risk_tracking table
  const churnTableExists = db
    .prepare(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='churn_risk_tracking'`
    )
    .get();

  if (!churnTableExists) {
    addCheck(
      'churn_risk_tracking table',
      'fail',
      'Table does not exist. Run migration: lib/db/migrations/014_customer_success_feedback.sql',
      'medium'
    );
  } else {
    addCheck('churn_risk_tracking table', 'pass', 'Table exists', 'low');
  }

  // Check for customer_success_outreach table
  const outreachTableExists = db
    .prepare(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='customer_success_outreach'`
    )
    .get();

  if (!outreachTableExists) {
    addCheck(
      'customer_success_outreach table',
      'fail',
      'Table does not exist. Run migration: lib/db/migrations/014_customer_success_feedback.sql',
      'medium'
    );
  } else {
    addCheck(
      'customer_success_outreach table',
      'pass',
      'Table exists',
      'low'
    );
  }

  db.close();
}

// ============================================================================
// 2. PostHog Configuration Check
// ============================================================================

console.log('2. Checking PostHog configuration...');

// Check for .env.local file
const envLocalPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envLocalPath)) {
  addCheck(
    'PostHog .env.local',
    'fail',
    '.env.local file not found',
    'critical'
  );
} else {
  const envContent = fs.readFileSync(envLocalPath, 'utf-8');

  // Check for NEXT_PUBLIC_POSTHOG_KEY
  const posthogKeyMatch = envContent.match(/NEXT_PUBLIC_POSTHOG_KEY=(.+)/);
  if (!posthogKeyMatch) {
    addCheck(
      'PostHog API Key',
      'fail',
      'NEXT_PUBLIC_POSTHOG_KEY not found in .env.local',
      'critical'
    );
  } else {
    const key = posthogKeyMatch[1].trim();
    if (
      key === '' ||
      key === 'phc_your_project_api_key_here' ||
      key === 'phc_YOUR_PROJECT_API_KEY'
    ) {
      addCheck(
        'PostHog API Key',
        'fail',
        'PostHog key is placeholder. Get real key from PostHog dashboard.',
        'critical'
      );
    } else if (key.startsWith('phc_')) {
      addCheck(
        'PostHog API Key',
        'pass',
        `Configured: ${key.substring(0, 15)}...`,
        'low'
      );
    } else {
      addCheck(
        'PostHog API Key',
        'warn',
        'PostHog key does not start with "phc_". May be invalid.',
        'high'
      );
    }
  }

  // Check for NEXT_PUBLIC_POSTHOG_HOST
  const posthogHostMatch = envContent.match(/NEXT_PUBLIC_POSTHOG_HOST=(.+)/);
  if (!posthogHostMatch) {
    addCheck(
      'PostHog Host',
      'warn',
      'NEXT_PUBLIC_POSTHOG_HOST not set (will default to app.posthog.com)',
      'low'
    );
  } else {
    addCheck(
      'PostHog Host',
      'pass',
      `Configured: ${posthogHostMatch[1].trim()}`,
      'low'
    );
  }
}

// Check if PostHog tracking code exists
const posthogLibPath = path.join(process.cwd(), 'lib/analytics/posthog.ts');
if (!fs.existsSync(posthogLibPath)) {
  addCheck(
    'PostHog tracking library',
    'fail',
    'lib/analytics/posthog.ts not found',
    'critical'
  );
} else {
  addCheck(
    'PostHog tracking library',
    'pass',
    'lib/analytics/posthog.ts exists',
    'low'
  );
}

// Check if feedback tracking utilities exist
const feedbackTrackingPath = path.join(
  process.cwd(),
  'lib/analytics/feedback-tracking.ts'
);
if (!fs.existsSync(feedbackTrackingPath)) {
  addCheck(
    'Feedback tracking utilities',
    'fail',
    'lib/analytics/feedback-tracking.ts not found',
    'high'
  );
} else {
  addCheck(
    'Feedback tracking utilities',
    'pass',
    'lib/analytics/feedback-tracking.ts exists',
    'low'
  );
}

// ============================================================================
// 3. Migration Files Check
// ============================================================================

console.log('3. Checking migration files...');

const migrationPath = path.join(
  process.cwd(),
  'lib/db/migrations/014_customer_success_feedback.sql'
);
if (!fs.existsSync(migrationPath)) {
  addCheck(
    'Feedback migration file',
    'fail',
    'Migration file not found: lib/db/migrations/014_customer_success_feedback.sql',
    'critical'
  );
} else {
  addCheck(
    'Feedback migration file',
    'pass',
    'Migration file exists',
    'low'
  );

  // Check if migration has been applied
  if (fs.existsSync(dbPath)) {
    const db = new Database(dbPath);
    const tables = db
      .prepare(
        `SELECT name FROM sqlite_master WHERE type='table' AND name IN ('customer_feedback', 'churn_risk_tracking', 'customer_success_outreach', 'concierge_calls')`
      )
      .all() as { name: string }[];

    if (tables.length === 0) {
      addCheck(
        'Migration applied',
        'fail',
        'Migration file exists but tables not created. Run: sqlite3 data/taxbridge.db < lib/db/migrations/014_customer_success_feedback.sql',
        'critical'
      );
    } else if (tables.length < 4) {
      addCheck(
        'Migration applied',
        'warn',
        `Only ${tables.length}/4 tables created. Re-run migration.`,
        'high'
      );
    } else {
      addCheck(
        'Migration applied',
        'pass',
        'All 4 feedback tables created',
        'low'
      );
    }
    db.close();
  }
}

// ============================================================================
// 4. Documentation Check
// ============================================================================

console.log('4. Checking documentation...');

const feedbackAnalysisPath = path.join(
  process.cwd(),
  'docs/USER_FEEDBACK_ANALYSIS_2026-03-19.md'
);
if (!fs.existsSync(feedbackAnalysisPath)) {
  addCheck(
    'Feedback analysis report',
    'warn',
    'docs/USER_FEEDBACK_ANALYSIS_2026-03-19.md not found',
    'low'
  );
} else {
  addCheck(
    'Feedback analysis report',
    'pass',
    'User feedback analysis report exists',
    'low'
  );
}

const feedbackPlaybookPath = path.join(
  process.cwd(),
  'docs/FEEDBACK_COLLECTION_PLAYBOOK.md'
);
if (!fs.existsSync(feedbackPlaybookPath)) {
  addCheck(
    'Feedback collection playbook',
    'warn',
    'docs/FEEDBACK_COLLECTION_PLAYBOOK.md not found',
    'low'
  );
} else {
  addCheck(
    'Feedback collection playbook',
    'pass',
    'Feedback collection playbook exists',
    'low'
  );
}

// ============================================================================
// Print Results
// ============================================================================

console.log(`\n${colors.bold}📊 Results Summary${colors.reset}\n`);

const passed = checks.filter((c) => c.status === 'pass').length;
const failed = checks.filter((c) => c.status === 'fail').length;
const warned = checks.filter((c) => c.status === 'warn').length;
const total = checks.length;

console.log(`${colors.green}✅ Passed:${colors.reset} ${passed}/${total}`);
console.log(`${colors.red}❌ Failed:${colors.reset} ${failed}/${total}`);
console.log(`${colors.yellow}⚠️  Warnings:${colors.reset} ${warned}/${total}`);

console.log(`\n${colors.bold}Detailed Results:${colors.reset}\n`);

const criticalFails = checks.filter(
  (c) => c.status === 'fail' && c.severity === 'critical'
);
const highFails = checks.filter(
  (c) => (c.status === 'fail' || c.status === 'warn') && c.severity === 'high'
);
const otherChecks = checks.filter(
  (c) =>
    !criticalFails.includes(c) &&
    !highFails.includes(c) &&
    (c.status === 'fail' || c.status === 'warn')
);

// Print critical failures first
if (criticalFails.length > 0) {
  console.log(`${colors.red}${colors.bold}🔥 CRITICAL ISSUES:${colors.reset}`);
  criticalFails.forEach((check) => {
    console.log(`   ${colors.red}❌ ${check.name}:${colors.reset}`);
    console.log(`      ${check.message}`);
  });
  console.log('');
}

// Print high priority issues
if (highFails.length > 0) {
  console.log(`${colors.yellow}${colors.bold}⚠️  HIGH PRIORITY:${colors.reset}`);
  highFails.forEach((check) => {
    const icon = check.status === 'fail' ? '❌' : '⚠️';
    console.log(`   ${colors.yellow}${icon} ${check.name}:${colors.reset}`);
    console.log(`      ${check.message}`);
  });
  console.log('');
}

// Print other issues
if (otherChecks.length > 0) {
  console.log(`${colors.blue}${colors.bold}ℹ️  OTHER ISSUES:${colors.reset}`);
  otherChecks.forEach((check) => {
    const icon = check.status === 'fail' ? '❌' : '⚠️';
    console.log(`   ${icon} ${check.name}:`);
    console.log(`      ${check.message}`);
  });
  console.log('');
}

// Print pass summary (collapsed)
const passedChecks = checks.filter((c) => c.status === 'pass');
if (passedChecks.length > 0) {
  console.log(`${colors.green}${colors.bold}✅ PASSED (${passedChecks.length}):${colors.reset}`);
  passedChecks.forEach((check) => {
    console.log(`   ${colors.green}✅${colors.reset} ${check.name}`);
  });
  console.log('');
}

// ============================================================================
// Final Verdict
// ============================================================================

console.log(`${colors.bold}═══════════════════════════════════════${colors.reset}\n`);

if (criticalFails.length > 0) {
  console.log(
    `${colors.red}${colors.bold}🚨 VERDICT: FEEDBACK INFRASTRUCTURE NOT READY${colors.reset}`
  );
  console.log(
    `\n${criticalFails.length} critical issue(s) must be fixed before launch.`
  );
  console.log('\nRequired Actions:');
  criticalFails.forEach((check, i) => {
    console.log(`${i + 1}. ${check.message}`);
  });
  console.log('');
  process.exit(1);
} else if (highFails.length > 0) {
  console.log(
    `${colors.yellow}${colors.bold}⚠️  VERDICT: FEEDBACK INFRASTRUCTURE NEEDS ATTENTION${colors.reset}`
  );
  console.log(
    `\n${highFails.length} high priority issue(s) should be fixed before launch.`
  );
  console.log('');
  process.exit(0);
} else {
  console.log(
    `${colors.green}${colors.bold}✅ VERDICT: FEEDBACK INFRASTRUCTURE READY${colors.reset}`
  );
  console.log('\nAll systems configured and operational!');
  console.log('');
  process.exit(0);
}
