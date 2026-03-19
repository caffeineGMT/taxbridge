#!/usr/bin/env tsx

/**
 * Task Evidence Enforcement CLI
 *
 * Checks if a task has proper evidence before allowing it to be marked "done".
 * Can be used in CI/CD, pre-commit hooks, or manually.
 *
 * Usage:
 *   # Check specific task
 *   npm run check:evidence -- --task-id=P0-123
 *
 *   # Check all recent tasks (last 7 days)
 *   npm run check:evidence -- --recent
 *
 *   # Strict mode (exit 1 if evidence missing)
 *   npm run check:evidence -- --task-id=P0-123 --strict
 */

import fs from 'fs';
import path from 'path';

interface TaskEvidence {
  taskId: string;
  hasScreenshots: boolean;
  screenshotCount: number;
  screenshotPaths: string[];
  hasVerificationReport: boolean;
  verificationReportPath: string | null;
  hasLogs: boolean;
  logPaths: string[];
  passesMinimumRequirements: boolean;
  missingEvidence: string[];
}

interface EnforcementOptions {
  taskId?: string;
  recent?: boolean;
  strict?: boolean;
  priority?: string; // P0, P1, P2, P3
}

class EvidenceEnforcer {
  private options: EnforcementOptions;
  private docsDir: string;

  constructor(options: EnforcementOptions) {
    this.options = options;
    this.docsDir = path.join(process.cwd(), 'docs');
  }

  checkTask(taskId: string): TaskEvidence {
    const evidence: TaskEvidence = {
      taskId,
      hasScreenshots: false,
      screenshotCount: 0,
      screenshotPaths: [],
      hasVerificationReport: false,
      verificationReportPath: null,
      hasLogs: false,
      logPaths: [],
      passesMinimumRequirements: false,
      missingEvidence: [],
    };

    // Check screenshots
    const screenshotsDir = path.join(this.docsDir, 'screenshots');
    if (fs.existsSync(screenshotsDir)) {
      const dirs = fs.readdirSync(screenshotsDir);
      const taskDirs = dirs.filter((dir) =>
        dir.toLowerCase().includes(taskId.toLowerCase())
      );

      if (taskDirs.length > 0) {
        evidence.hasScreenshots = true;
        taskDirs.forEach((dir) => {
          const fullPath = path.join(screenshotsDir, dir);
          const files = fs.readdirSync(fullPath);
          evidence.screenshotCount += files.length;
          evidence.screenshotPaths.push(
            ...files.map((f) => path.join('docs/screenshots', dir, f))
          );
        });
      }
    }

    // Check verification reports
    const reportsDir = path.join(this.docsDir, 'verification-reports');
    if (fs.existsSync(reportsDir)) {
      const files = fs.readdirSync(reportsDir);
      const reportFile = files.find((file) =>
        file.toLowerCase().includes(taskId.toLowerCase())
      );

      if (reportFile) {
        evidence.hasVerificationReport = true;
        evidence.verificationReportPath = path.join(
          'docs/verification-reports',
          reportFile
        );
      }
    }

    // Check logs
    const logsDir = path.join(this.docsDir, 'logs');
    if (fs.existsSync(logsDir)) {
      const dirs = fs.readdirSync(logsDir);
      const taskLogDirs = dirs.filter((dir) =>
        dir.toLowerCase().includes(taskId.toLowerCase())
      );

      if (taskLogDirs.length > 0) {
        evidence.hasLogs = true;
        taskLogDirs.forEach((dir) => {
          const fullPath = path.join(logsDir, dir);
          const files = fs.readdirSync(fullPath);
          evidence.logPaths.push(
            ...files.map((f) => path.join('docs/logs', dir, f))
          );
        });
      }
    }

    // Determine if minimum requirements are met
    const priority = this.options.priority || this.guessPriority(taskId);
    evidence.passesMinimumRequirements = this.checkMinimumRequirements(
      evidence,
      priority
    );

    // List missing evidence
    if (!evidence.passesMinimumRequirements) {
      evidence.missingEvidence = this.getMissingEvidence(evidence, priority);
    }

    return evidence;
  }

  private guessPriority(taskId: string): string {
    const match = taskId.match(/P([0-3])/i);
    return match ? `P${match[1]}` : 'P2';
  }

  private checkMinimumRequirements(
    evidence: TaskEvidence,
    priority: string
  ): boolean {
    switch (priority) {
      case 'P0':
        // P0 requires ALL evidence types
        return (
          evidence.hasScreenshots &&
          evidence.screenshotCount >= 2 &&
          evidence.hasVerificationReport
        );

      case 'P1':
        // P1 requires at least screenshots OR verification report + logs
        return (
          (evidence.hasScreenshots && evidence.screenshotCount >= 1) ||
          (evidence.hasVerificationReport && evidence.hasLogs)
        );

      case 'P2':
      case 'P3':
        // P2/P3 requires at least one type of evidence
        return (
          evidence.hasScreenshots ||
          evidence.hasVerificationReport ||
          evidence.hasLogs
        );

      default:
        return false;
    }
  }

  private getMissingEvidence(
    evidence: TaskEvidence,
    priority: string
  ): string[] {
    const missing: string[] = [];

    switch (priority) {
      case 'P0':
        if (!evidence.hasScreenshots || evidence.screenshotCount < 2) {
          missing.push(
            'Screenshots (need at least 2: desktop + mobile) in docs/screenshots/'
          );
        }
        if (!evidence.hasVerificationReport) {
          missing.push('Verification report in docs/verification-reports/');
        }
        break;

      case 'P1':
        if (!evidence.hasScreenshots && !evidence.hasVerificationReport) {
          missing.push(
            'Either screenshots in docs/screenshots/ OR verification report in docs/verification-reports/'
          );
        }
        if (evidence.hasVerificationReport && !evidence.hasLogs) {
          missing.push('Logs in docs/logs/ (recommended with verification report)');
        }
        break;

      case 'P2':
      case 'P3':
        if (
          !evidence.hasScreenshots &&
          !evidence.hasVerificationReport &&
          !evidence.hasLogs
        ) {
          missing.push(
            'At least one type: screenshots, verification report, or logs'
          );
        }
        break;
    }

    return missing;
  }

  printReport(evidence: TaskEvidence): void {
    const priority = this.options.priority || this.guessPriority(evidence.taskId);

    console.log('\n' + '='.repeat(60));
    console.log(`📋 Evidence Check: ${evidence.taskId} (${priority})`);
    console.log('='.repeat(60) + '\n');

    // Screenshots
    console.log(
      `📸 Screenshots: ${evidence.hasScreenshots ? '✅' : '❌'} (${evidence.screenshotCount} files)`
    );
    if (evidence.screenshotPaths.length > 0) {
      evidence.screenshotPaths.slice(0, 3).forEach((p) => {
        console.log(`   - ${p}`);
      });
      if (evidence.screenshotPaths.length > 3) {
        console.log(
          `   ... and ${evidence.screenshotPaths.length - 3} more`
        );
      }
    }

    // Verification Report
    console.log(
      `\n📝 Verification Report: ${evidence.hasVerificationReport ? '✅' : '❌'}`
    );
    if (evidence.verificationReportPath) {
      console.log(`   - ${evidence.verificationReportPath}`);
    }

    // Logs
    console.log(`\n📋 Logs: ${evidence.hasLogs ? '✅' : '❌'} (${evidence.logPaths.length} files)`);
    if (evidence.logPaths.length > 0) {
      evidence.logPaths.slice(0, 2).forEach((p) => {
        console.log(`   - ${p}`);
      });
      if (evidence.logPaths.length > 2) {
        console.log(`   ... and ${evidence.logPaths.length - 2} more`);
      }
    }

    // Overall Result
    console.log('\n' + '-'.repeat(60));
    if (evidence.passesMinimumRequirements) {
      console.log('✅ PASSES MINIMUM REQUIREMENTS');
      console.log('\nThis task has sufficient evidence to be marked "done".');
    } else {
      console.log('❌ FAILS MINIMUM REQUIREMENTS');
      console.log('\nMissing evidence:');
      evidence.missingEvidence.forEach((item) => {
        console.log(`  - ${item}`);
      });
      console.log('\n💡 Quick fix:');
      console.log(
        `  npm run verify:task -- --task-id=${evidence.taskId} --feature-url=/path --title="Task name"`
      );
    }
    console.log('='.repeat(60) + '\n');
  }

  run(): number {
    if (this.options.recent) {
      console.log('🔍 Checking recent tasks (last 7 days)...\n');
      // TODO: Implement recent tasks check
      console.log('⚠️  --recent flag not yet implemented');
      return 0;
    }

    if (!this.options.taskId) {
      console.error('❌ Error: --task-id required\n');
      console.log('Usage:');
      console.log(
        '  npm run check:evidence -- --task-id=P0-123 [--strict] [--priority=P0]\n'
      );
      return 1;
    }

    const evidence = this.checkTask(this.options.taskId);
    this.printReport(evidence);

    // In strict mode, exit with error if evidence missing
    if (this.options.strict && !evidence.passesMinimumRequirements) {
      console.error(
        '❌ Strict mode: Evidence requirements not met. Exiting with error.\n'
      );
      return 1;
    }

    return evidence.passesMinimumRequirements ? 0 : 0; // Always 0 unless strict
  }
}

// CLI Entry Point
function main() {
  const args = process.argv.slice(2);
  const options: EnforcementOptions = {};

  for (const arg of args) {
    if (arg.startsWith('--task-id=')) {
      options.taskId = arg.split('=')[1];
    } else if (arg === '--recent') {
      options.recent = true;
    } else if (arg === '--strict') {
      options.strict = true;
    } else if (arg.startsWith('--priority=')) {
      options.priority = arg.split('=')[1];
    }
  }

  const enforcer = new EvidenceEnforcer(options);
  const exitCode = enforcer.run();
  process.exit(exitCode);
}

if (require.main === module) {
  main();
}

export { EvidenceEnforcer, TaskEvidence };
