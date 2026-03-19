#!/usr/bin/env tsx

/**
 * Pre-commit Evidence Checker
 *
 * Warns (but does not block) if committing task-related code without evidence.
 * Checks for:
 * - Task ID in commit message (e.g., P0-123, P1-456)
 * - Corresponding evidence files in docs/screenshots/ or docs/verification-reports/
 * - VERIFICATION keyword in commit message
 *
 * Usage:
 *   Add to .git/hooks/pre-commit or run manually:
 *   tsx scripts/check-evidence-precommit.ts
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface EvidenceCheckResult {
  hasTaskId: boolean;
  taskId: string | null;
  hasVerificationKeyword: boolean;
  hasScreenshots: boolean;
  hasVerificationReport: boolean;
  shouldWarn: boolean;
  warnings: string[];
}

class EvidenceChecker {
  private commitMessage: string;
  private stagedFiles: string[];

  constructor() {
    // Get commit message (from git commit -m or COMMIT_EDITMSG)
    try {
      this.commitMessage = execSync('git log -1 --pretty=%B', {
        encoding: 'utf-8',
      }).trim();
    } catch {
      // If no commits yet, try to read from .git/COMMIT_EDITMSG
      try {
        const commitMsgPath = path.join(process.cwd(), '.git', 'COMMIT_EDITMSG');
        this.commitMessage = fs.readFileSync(commitMsgPath, 'utf-8').trim();
      } catch {
        this.commitMessage = '';
      }
    }

    // Get staged files
    try {
      const output = execSync('git diff --cached --name-only', {
        encoding: 'utf-8',
      });
      this.stagedFiles = output.split('\n').filter((f) => f.trim() !== '');
    } catch {
      this.stagedFiles = [];
    }
  }

  check(): EvidenceCheckResult {
    const result: EvidenceCheckResult = {
      hasTaskId: false,
      taskId: null,
      hasVerificationKeyword: false,
      hasScreenshots: false,
      hasVerificationReport: false,
      shouldWarn: false,
      warnings: [],
    };

    // Check for task ID (P0-XXX, P1-XXX, P2-XXX, P3-XXX pattern)
    const taskIdMatch = this.commitMessage.match(/\b(P[0-3]-\d+)\b/i);
    if (taskIdMatch) {
      result.hasTaskId = true;
      result.taskId = taskIdMatch[1];
    }

    // Check for VERIFICATION keyword
    result.hasVerificationKeyword =
      /\bVERIFICATION\b/i.test(this.commitMessage);

    // Check for screenshots in staged files
    result.hasScreenshots = this.stagedFiles.some((file) =>
      file.includes('docs/screenshots/')
    );

    // Check for verification reports in staged files
    result.hasVerificationReport = this.stagedFiles.some((file) =>
      file.includes('docs/verification-reports/')
    );

    // Determine if we should warn
    if (result.hasTaskId) {
      // If commit mentions a task ID, we expect evidence
      if (!result.hasVerificationKeyword) {
        result.warnings.push(
          `⚠️  Task ID found (${result.taskId}) but commit message doesn't include "VERIFICATION"`
        );
      }

      if (!result.hasScreenshots && !result.hasVerificationReport) {
        result.warnings.push(
          '⚠️  No evidence files found in docs/screenshots/ or docs/verification-reports/'
        );
      }

      if (result.warnings.length > 0) {
        result.shouldWarn = true;
      }
    }

    return result;
  }

  printWarnings(result: EvidenceCheckResult): void {
    if (!result.shouldWarn) {
      console.log('✅ Evidence check passed');
      return;
    }

    console.log('\n' + '='.repeat(60));
    console.log('⚠️  EVIDENCE WARNING');
    console.log('='.repeat(60));
    console.log('\nYour commit includes a task ID but may be missing evidence.\n');

    result.warnings.forEach((warning) => console.log(warning));

    console.log('\n📋 Task Completion Policy Reminder:\n');
    console.log('  Tasks must include evidence:');
    console.log('  1. Screenshots: docs/screenshots/YYYY-MM-DD-task-[ID]/');
    console.log('  2. Verification report: docs/verification-reports/');
    console.log('  3. "VERIFICATION" keyword in commit message\n');

    console.log('💡 Quick fix:\n');
    if (result.taskId) {
      console.log(`  # Run automated verification:`);
      console.log(
        `  npm run verify:task -- --task-id=${result.taskId} --feature-url=/path --title="Task name"\n`
      );
      console.log(`  # Then commit evidence:`);
      console.log(`  git add docs/screenshots/ docs/verification-reports/`);
      console.log(
        `  git commit --amend -m "${this.commitMessage} + VERIFICATION"`
      );
    } else {
      console.log(`  # Add verification files and update commit message`);
      console.log(`  git add docs/screenshots/ docs/verification-reports/`);
      console.log(`  git commit --amend`);
    }

    console.log('\n📚 Documentation:\n');
    console.log('  Policy: docs/TASK_COMPLETION_POLICY.md');
    console.log('  Quick Reference: docs/TASK_COMPLETION_QUICK_REFERENCE.md');
    console.log('  Full Process: docs/TASK_VERIFICATION_PROCESS.md\n');

    console.log('='.repeat(60));
    console.log('⚠️  This is a WARNING, not a blocker.');
    console.log('💡  Consider adding evidence before pushing to GitHub.');
    console.log('='.repeat(60) + '\n');
  }
}

// Main execution
function main() {
  const checker = new EvidenceChecker();
  const result = checker.check();

  checker.printWarnings(result);

  // Exit with 0 (success) even if warnings - we don't want to block commits
  // This is just a reminder/warning system
  process.exit(0);
}

if (require.main === module) {
  main();
}

export { EvidenceChecker };
