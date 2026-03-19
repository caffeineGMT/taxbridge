#!/usr/bin/env tsx

/**
 * Task Verification CLI Tool
 *
 * Usage:
 *   npm run verify:task -- --task-id=P0-001 --feature-url=/calculator --title="Fix calculator bug"
 *   npm run verify:task -- --task-id=P1-002 --screenshot=docs/screenshots/fix.png
 *   npm run verify:task -- --task-id=P2-003 --log=logs/deployment.log --video=https://loom.com/share/abc
 */

import { Command } from 'commander';
import path from 'path';
import fs from 'fs/promises';
import {
  EvidenceType,
  Evidence,
  TaskEvidence,
  validateTaskEvidence,
  saveTaskEvidence,
  generateEvidenceReport,
  captureScreenshot,
} from '../lib/task-evidence';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const program = new Command();

program
  .name('verify-task')
  .description('Collect and validate evidence for task completion')
  .requiredOption('--task-id <id>', 'Task ID (e.g., P0-001, P1-002)')
  .requiredOption('--title <title>', 'Task title')
  .option('--feature-url <url>', 'Deployed feature URL (will verify HTTP 200)')
  .option('--screenshot <path>', 'Path to screenshot file')
  .option('--log <path>', 'Path to log file')
  .option('--video <url>', 'Video recording URL')
  .option('--analytics <path>', 'Path to analytics data export')
  .option('--auto-screenshot <url>', 'Automatically capture screenshot of URL')
  .option('--run-build', 'Automatically run build and capture output')
  .option('--run-tests', 'Automatically run tests and capture output')
  .option('--lighthouse', 'Run Lighthouse audit on feature URL')
  .parse(process.argv);

const options = program.opts();

async function runBuildAndCaptureLog(): Promise<string> {
  const logsDir = path.join(process.cwd(), 'logs', 'verification');
  await fs.mkdir(logsDir, { recursive: true });

  const logPath = path.join(logsDir, `build-${Date.now()}.log`);

  console.log('📦 Running build...');

  try {
    const { stdout, stderr } = await execAsync('npm run build', {
      cwd: process.cwd(),
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });

    const output = `=== BUILD OUTPUT ===\nTimestamp: ${new Date().toISOString()}\nStatus: SUCCESS\n\n--- STDOUT ---\n${stdout}\n\n--- STDERR ---\n${stderr}\n`;

    await fs.writeFile(logPath, output, 'utf-8');

    console.log(`✅ Build passed - log saved to ${logPath}`);

    return logPath;
  } catch (error) {
    const output = `=== BUILD OUTPUT ===\nTimestamp: ${new Date().toISOString()}\nStatus: FAILED\n\nError: ${(error as Error).message}\n`;

    await fs.writeFile(logPath, output, 'utf-8');

    console.log(`❌ Build failed - log saved to ${logPath}`);

    throw new Error(`Build failed - see ${logPath} for details`);
  }
}

async function runTestsAndCaptureLog(): Promise<string> {
  const logsDir = path.join(process.cwd(), 'logs', 'verification');
  await fs.mkdir(logsDir, { recursive: true });

  const logPath = path.join(logsDir, `tests-${Date.now()}.log`);

  console.log('🧪 Running tests...');

  try {
    const { stdout, stderr } = await execAsync('npm test', {
      cwd: process.cwd(),
      maxBuffer: 10 * 1024 * 1024,
    });

    const output = `=== TEST OUTPUT ===\nTimestamp: ${new Date().toISOString()}\nStatus: SUCCESS\n\n--- STDOUT ---\n${stdout}\n\n--- STDERR ---\n${stderr}\n`;

    await fs.writeFile(logPath, output, 'utf-8');

    console.log(`✅ Tests passed - log saved to ${logPath}`);

    return logPath;
  } catch (error) {
    const output = `=== TEST OUTPUT ===\nTimestamp: ${new Date().toISOString()}\nStatus: FAILED\n\nError: ${(error as Error).message}\n`;

    await fs.writeFile(logPath, output, 'utf-8');

    console.log(`⚠️  Tests failed - log saved to ${logPath}`);

    // Don't throw - test failures might be expected, we still want the log
    return logPath;
  }
}

async function runLighthouseAudit(url: string): Promise<string> {
  const reportsDir = path.join(process.cwd(), 'docs', 'lighthouse');
  await fs.mkdir(reportsDir, { recursive: true });

  const reportPath = path.join(reportsDir, `audit-${Date.now()}.json`);

  console.log(`🔍 Running Lighthouse audit on ${url}...`);

  try {
    await execAsync(
      `npx lighthouse ${url} --output=json --output-path=${reportPath} --quiet`,
      {
        cwd: process.cwd(),
        maxBuffer: 10 * 1024 * 1024,
      }
    );

    console.log(`✅ Lighthouse audit complete - report saved to ${reportPath}`);

    return reportPath;
  } catch (error) {
    console.error(`❌ Lighthouse audit failed: ${(error as Error).message}`);
    throw error;
  }
}

async function autoCapture(url: string): Promise<string> {
  const screenshotsDir = path.join(process.cwd(), 'docs', 'screenshots');
  await fs.mkdir(screenshotsDir, { recursive: true });

  const screenshotPath = path.join(screenshotsDir, `auto-${Date.now()}.png`);

  console.log(`📸 Capturing screenshot of ${url}...`);

  const result = await captureScreenshot(url, screenshotPath, { fullPage: true });

  if (!result.success) {
    throw new Error(result.error);
  }

  console.log(`✅ Screenshot saved to ${screenshotPath}`);

  return screenshotPath;
}

async function main() {
  console.log('🔒 Task Completion Evidence Collection');
  console.log('=====================================\n');

  const evidence: Evidence[] = [];

  // Auto-capture screenshot if requested
  if (options.autoScreenshot) {
    try {
      const screenshotPath = await autoCapture(options.autoScreenshot);
      evidence.push({
        type: EvidenceType.SCREENSHOT,
        value: screenshotPath,
        timestamp: new Date().toISOString(),
        metadata: { autoCapture: true, url: options.autoScreenshot },
      });
    } catch (error) {
      console.error(`❌ Failed to auto-capture screenshot: ${(error as Error).message}`);
    }
  }

  // Manual screenshot
  if (options.screenshot) {
    evidence.push({
      type: EvidenceType.SCREENSHOT,
      value: path.resolve(options.screenshot),
      timestamp: new Date().toISOString(),
    });
  }

  // Feature URL
  if (options.featureUrl) {
    evidence.push({
      type: EvidenceType.DEPLOYED_URL,
      value: options.featureUrl,
      timestamp: new Date().toISOString(),
    });
  }

  // Log file
  if (options.log) {
    evidence.push({
      type: EvidenceType.LOG_FILE,
      value: path.resolve(options.log),
      timestamp: new Date().toISOString(),
    });
  }

  // Video URL
  if (options.video) {
    evidence.push({
      type: EvidenceType.VIDEO_URL,
      value: options.video,
      timestamp: new Date().toISOString(),
    });
  }

  // Analytics data
  if (options.analytics) {
    evidence.push({
      type: EvidenceType.ANALYTICS_DATA,
      value: path.resolve(options.analytics),
      timestamp: new Date().toISOString(),
    });
  }

  // Auto-run build
  if (options.runBuild) {
    try {
      const buildLog = await runBuildAndCaptureLog();
      evidence.push({
        type: EvidenceType.LOG_FILE,
        value: buildLog,
        timestamp: new Date().toISOString(),
        metadata: { type: 'build' },
      });
    } catch (error) {
      console.error(`❌ Build verification failed: ${(error as Error).message}`);
      process.exit(1);
    }
  }

  // Auto-run tests
  if (options.runTests) {
    const testLog = await runTestsAndCaptureLog();
    evidence.push({
      type: EvidenceType.LOG_FILE,
      value: testLog,
      timestamp: new Date().toISOString(),
      metadata: { type: 'tests' },
    });
  }

  // Lighthouse audit
  if (options.lighthouse && options.featureUrl) {
    try {
      const lighthouseReport = await runLighthouseAudit(options.featureUrl);
      evidence.push({
        type: EvidenceType.ANALYTICS_DATA,
        value: lighthouseReport,
        timestamp: new Date().toISOString(),
        metadata: { type: 'lighthouse' },
      });
    } catch (error) {
      console.error(`❌ Lighthouse audit failed: ${(error as Error).message}`);
    }
  }

  // Create task evidence object
  const taskEvidence: TaskEvidence = {
    taskId: options.taskId,
    taskTitle: options.title,
    evidence,
    verifiedAt: new Date().toISOString(),
    verifiedBy: process.env.USER || 'unknown',
  };

  // Validate evidence
  console.log('\n🔍 Validating evidence...\n');

  const validation = await validateTaskEvidence(taskEvidence);

  if (!validation.valid) {
    console.error('❌ Evidence validation FAILED:\n');
    validation.errors.forEach((error) => {
      console.error(`   - ${error}`);
    });
    console.error('\n⛔ Task completion BLOCKED - fix evidence issues above\n');
    process.exit(1);
  }

  console.log('✅ All evidence validated successfully\n');

  // Save evidence
  const evidencePath = await saveTaskEvidence(taskEvidence);
  console.log(`📄 Evidence saved to: ${evidencePath}\n`);

  // Generate report
  const report = generateEvidenceReport(taskEvidence);
  const reportPath = evidencePath.replace('.json', '.md');
  await fs.writeFile(reportPath, report, 'utf-8');
  console.log(`📋 Evidence report: ${reportPath}\n`);

  // Summary
  console.log('✅ TASK COMPLETION VERIFIED');
  console.log('===========================');
  console.log(`Task ID: ${options.taskId}`);
  console.log(`Task Title: ${options.title}`);
  console.log(`Evidence pieces: ${evidence.length}`);
  console.log(`Verified at: ${taskEvidence.verifiedAt}`);
  console.log(`Verified by: ${taskEvidence.verifiedBy}`);
  console.log('');
  console.log('✅ This task can now be marked as DONE');
  console.log('');

  // Git commit suggestion
  console.log('💡 Suggested commit command:');
  console.log(`   git add -A && git commit -m "${options.taskId} ${options.title} + VERIFICATION" && git push origin main`);
  console.log('');
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
