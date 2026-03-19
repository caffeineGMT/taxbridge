#!/usr/bin/env tsx

/**
 * Task Completion Verification Script
 *
 * Automates evidence collection for task verification:
 * - Captures screenshots of working feature
 * - Validates deployment status
 * - Runs Lighthouse performance audit
 * - Checks build/test status
 * - Generates verification report
 *
 * Usage:
 *   npm run verify:task -- --task-id=P0-001 --feature-url=/calculator --title="Fix calculator bug"
 *
 * Requirements:
 *   - @playwright/test (for screenshots)
 *   - lighthouse (for performance audit)
 */

import { chromium, Browser, Page } from '@playwright/test';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface VerificationOptions {
  taskId: string;
  featureUrl: string;
  title: string;
  baseUrl?: string;
}

interface VerificationResult {
  taskId: string;
  title: string;
  timestamp: string;
  screenshots: {
    desktop: string;
    mobile: string;
    lighthouse: string;
  };
  deployment: {
    url: string;
    status: number;
    responseTime: number;
  };
  build: {
    passed: boolean;
    errors: number;
    warnings: number;
    sizeBytes: number;
  };
  tests: {
    unit: {
      passed: boolean;
      total: number;
      passing: number;
      failing: number;
    };
  };
  lighthouse: {
    performance: number;
    accessibility: number;
    seo: number;
    bestPractices: number;
  };
  verificationPassed: boolean;
  issues: string[];
}

class TaskVerificationRunner {
  private options: VerificationOptions;
  private outputDir: string;
  private browser?: Browser;
  private result: Partial<VerificationResult>;

  constructor(options: VerificationOptions) {
    this.options = {
      baseUrl: 'https://taxbridge.vercel.app',
      ...options,
    };

    const dateStr = new Date().toISOString().split('T')[0];
    this.outputDir = path.join(
      process.cwd(),
      'docs',
      'screenshots',
      `${dateStr}-task-${this.options.taskId}`
    );

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    this.result = {
      taskId: this.options.taskId,
      title: this.options.title,
      timestamp: new Date().toISOString(),
      screenshots: {
        desktop: '',
        mobile: '',
        lighthouse: '',
      },
      issues: [],
    };
  }

  async run(): Promise<VerificationResult> {
    console.log('🔍 Starting task verification...\\n');
    console.log(`Task ID: ${this.options.taskId}`);
    console.log(`Title: ${this.options.title}`);
    console.log(`Feature URL: ${this.options.featureUrl}`);
    console.log(`Output: ${this.outputDir}\\n`);

    try {
      await this.captureScreenshots();
      await this.verifyDeployment();
      await this.verifyBuild();
      await this.verifyTests();
      await this.runLighthouseAudit();
      await this.generateReport();

      this.result.verificationPassed = this.result.issues!.length === 0;

      return this.result as VerificationResult;
    } finally {
      await this.cleanup();
    }
  }

  private async captureScreenshots(): Promise<void> {
    console.log('📸 Capturing screenshots...');

    this.browser = await chromium.launch({ headless: true });
    const fullUrl = `${this.options.baseUrl}${this.options.featureUrl}`;

    // Desktop screenshot
    const desktopPage = await this.browser.newPage({
      viewport: { width: 1920, height: 1080 },
    });
    await desktopPage.goto(fullUrl, { waitUntil: 'networkidle' });
    const desktopPath = path.join(this.outputDir, '01-desktop-view.png');
    await desktopPage.screenshot({ path: desktopPath, fullPage: true });
    this.result.screenshots!.desktop = desktopPath;
    console.log(`  ✅ Desktop screenshot: ${desktopPath}`);

    // Mobile screenshot
    const mobilePage = await this.browser.newPage({
      viewport: { width: 375, height: 667 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    });
    await mobilePage.goto(fullUrl, { waitUntil: 'networkidle' });
    const mobilePath = path.join(this.outputDir, '02-mobile-view.png');
    await mobilePage.screenshot({ path: mobilePath, fullPage: true });
    this.result.screenshots!.mobile = mobilePath;
    console.log(`  ✅ Mobile screenshot: ${mobilePath}`);

    await desktopPage.close();
    await mobilePage.close();
  }

  private async verifyDeployment(): Promise<void> {
    console.log('\\n🚀 Verifying deployment...');

    const fullUrl = `${this.options.baseUrl}${this.options.featureUrl}`;
    const startTime = Date.now();

    try {
      const response = await fetch(fullUrl);
      const responseTime = Date.now() - startTime;

      this.result.deployment = {
        url: fullUrl,
        status: response.status,
        responseTime,
      };

      if (response.status !== 200) {
        this.result.issues!.push(
          `❌ Deployment returned HTTP ${response.status} (expected 200)`
        );
        console.log(`  ❌ HTTP ${response.status}`);
      } else {
        console.log(`  ✅ HTTP 200 OK (${responseTime}ms)`);
      }

      if (responseTime > 3000) {
        this.result.issues!.push(
          `⚠️  Slow response time: ${responseTime}ms (target: <3000ms)`
        );
        console.log(`  ⚠️  Response time: ${responseTime}ms`);
      }
    } catch (error) {
      this.result.issues!.push(`❌ Deployment failed: ${error}`);
      console.log(`  ❌ Request failed: ${error}`);
      this.result.deployment = {
        url: fullUrl,
        status: 0,
        responseTime: 0,
      };
    }
  }

  private async verifyBuild(): Promise<void> {
    console.log('\\n🏗️  Verifying build...');

    try {
      const buildOutput = execSync('npm run build 2>&1', {
        cwd: process.cwd(),
        encoding: 'utf-8',
        timeout: 300000, // 5 minutes
      });

      const buildLogPath = path.join(
        process.cwd(),
        'docs',
        'build-logs',
        `${new Date().toISOString().split('T')[0]}-task-${this.options.taskId}.txt`
      );
      const buildLogDir = path.dirname(buildLogPath);
      if (!fs.existsSync(buildLogDir)) {
        fs.mkdirSync(buildLogDir, { recursive: true });
      }
      fs.writeFileSync(buildLogPath, buildOutput);

      // Check for errors
      const hasErrors = buildOutput.toLowerCase().includes('error');
      const errorMatches = buildOutput.match(/(\\d+)\\s+error/i);
      const warningMatches = buildOutput.match(/(\\d+)\\s+warning/i);

      const errors = errorMatches ? parseInt(errorMatches[1]) : 0;
      const warnings = warningMatches ? parseInt(warningMatches[1]) : 0;

      // Get build size
      let buildSize = 0;
      const nextDir = path.join(process.cwd(), '.next');
      if (fs.existsSync(nextDir)) {
        buildSize = this.getDirectorySize(nextDir);
      }

      this.result.build = {
        passed: !hasErrors && errors === 0,
        errors,
        warnings,
        sizeBytes: buildSize,
      };

      if (!this.result.build.passed) {
        this.result.issues!.push(`❌ Build failed with ${errors} errors`);
        console.log(`  ❌ Build failed with ${errors} errors`);
      } else {
        console.log('  ✅ Build passed');
      }

      const buildSizeMB = Math.round(buildSize / 1024 / 1024);
      if (buildSizeMB > 150) {
        this.result.issues!.push(
          `⚠️  Build size ${buildSizeMB}MB exceeds target (150MB)`
        );
        console.log(`  ⚠️  Build size: ${buildSizeMB}MB`);
      } else {
        console.log(`  ✅ Build size: ${buildSizeMB}MB`);
      }
    } catch (error) {
      this.result.issues!.push(`❌ Build failed: ${error}`);
      console.log(`  ❌ Build error: ${error}`);
      this.result.build = {
        passed: false,
        errors: 1,
        warnings: 0,
        sizeBytes: 0,
      };
    }
  }

  private async verifyTests(): Promise<void> {
    console.log('\\n🧪 Verifying tests...');

    try {
      const testOutput = execSync('npm test 2>&1', {
        cwd: process.cwd(),
        encoding: 'utf-8',
        timeout: 120000, // 2 minutes
      });

      // Parse test results (Vitest format)
      const totalMatch = testOutput.match(/Tests\\s+(\\d+)\\s+passed/i);
      const failMatch = testOutput.match(/(\\d+)\\s+failed/i);

      const passing = totalMatch ? parseInt(totalMatch[1]) : 0;
      const failing = failMatch ? parseInt(failMatch[1]) : 0;
      const total = passing + failing;

      this.result.tests = {
        unit: {
          passed: failing === 0,
          total,
          passing,
          failing,
        },
      };

      if (failing > 0) {
        this.result.issues!.push(`❌ ${failing} unit tests failing`);
        console.log(`  ❌ ${failing}/${total} tests failing`);
      } else {
        console.log(`  ✅ All ${total} tests passing`);
      }
    } catch (error) {
      // Tests might fail but we can still extract info
      const errorOutput = (error as any).stdout || (error as any).stderr || '';
      const totalMatch = errorOutput.match(/Tests\\s+(\\d+)\\s+passed/i);
      const failMatch = errorOutput.match(/(\\d+)\\s+failed/i);

      const passing = totalMatch ? parseInt(totalMatch[1]) : 0;
      const failing = failMatch ? parseInt(failMatch[1]) : 0;

      this.result.tests = {
        unit: {
          passed: false,
          total: passing + failing,
          passing,
          failing,
        },
      };

      this.result.issues!.push(`❌ Tests failed: ${failing} failing`);
      console.log(`  ❌ Tests failed: ${failing} failing`);
    }
  }

  private async runLighthouseAudit(): Promise<void> {
    console.log('\\n💡 Running Lighthouse audit...');

    try {
      const fullUrl = `${this.options.baseUrl}${this.options.featureUrl}`;

      // Run lighthouse CLI
      const lighthouseOutput = execSync(
        `npx lighthouse ${fullUrl} --output=json --output-path=./lighthouse-report.json --chrome-flags="--headless" --quiet`,
        {
          cwd: process.cwd(),
          encoding: 'utf-8',
          timeout: 120000,
        }
      );

      const reportPath = path.join(process.cwd(), 'lighthouse-report.json');
      if (fs.existsSync(reportPath)) {
        const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

        this.result.lighthouse = {
          performance: Math.round(report.categories.performance.score * 100),
          accessibility: Math.round(
            report.categories.accessibility.score * 100
          ),
          seo: Math.round(report.categories.seo.score * 100),
          bestPractices: Math.round(
            report.categories['best-practices'].score * 100
          ),
        };

        // Move report to output dir
        const newReportPath = path.join(
          this.outputDir,
          '03-lighthouse-report.json'
        );
        fs.renameSync(reportPath, newReportPath);
        this.result.screenshots!.lighthouse = newReportPath;

        console.log(`  ✅ Performance: ${this.result.lighthouse.performance}/100`);
        console.log(`  ✅ Accessibility: ${this.result.lighthouse.accessibility}/100`);
        console.log(`  ✅ SEO: ${this.result.lighthouse.seo}/100`);
        console.log(`  ✅ Best Practices: ${this.result.lighthouse.bestPractices}/100`);

        // Check thresholds
        if (this.result.lighthouse.performance < 85) {
          this.result.issues!.push(
            `⚠️  Performance score ${this.result.lighthouse.performance} below target (85)`
          );
        }
        if (this.result.lighthouse.accessibility < 90) {
          this.result.issues!.push(
            `⚠️  Accessibility score ${this.result.lighthouse.accessibility} below target (90)`
          );
        }
      }
    } catch (error) {
      this.result.issues!.push(`⚠️  Lighthouse audit failed: ${error}`);
      console.log(`  ⚠️  Lighthouse audit failed`);
      this.result.lighthouse = {
        performance: 0,
        accessibility: 0,
        seo: 0,
        bestPractices: 0,
      };
    }
  }

  private async generateReport(): Promise<void> {
    console.log('\\n📝 Generating verification report...');

    const reportPath = path.join(
      process.cwd(),
      'docs',
      'verification-reports',
      `${new Date().toISOString().split('T')[0]}-task-${this.options.taskId}-VERIFICATION.md`
    );

    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const report = this.generateMarkdownReport();
    fs.writeFileSync(reportPath, report);

    console.log(`  ✅ Report saved: ${reportPath}`);

    // Also save JSON version
    const jsonPath = reportPath.replace('.md', '.json');
    fs.writeFileSync(jsonPath, JSON.stringify(this.result, null, 2));
    console.log(`  ✅ JSON data saved: ${jsonPath}`);
  }

  private generateMarkdownReport(): string {
    const status = this.result.verificationPassed ? '✅ PASSED' : '❌ FAILED';
    const dateStr = new Date().toISOString();

    return `# Task Verification Report

**Status:** ${status}
**Task ID:** ${this.result.taskId}
**Title:** ${this.result.title}
**Verification Date:** ${dateStr}

---

## 📸 Screenshots

- **Desktop View:** \`${this.result.screenshots!.desktop}\`
- **Mobile View:** \`${this.result.screenshots!.mobile}\`
- **Lighthouse Report:** \`${this.result.screenshots!.lighthouse}\`

---

## 🚀 Deployment Verification

- **URL:** ${this.result.deployment?.url}
- **HTTP Status:** ${this.result.deployment?.status} ${this.result.deployment?.status === 200 ? '✅' : '❌'}
- **Response Time:** ${this.result.deployment?.responseTime}ms ${this.result.deployment?.responseTime! < 3000 ? '✅' : '⚠️'}

---

## 🏗️ Build Verification

- **Build Status:** ${this.result.build?.passed ? 'PASSED ✅' : 'FAILED ❌'}
- **Errors:** ${this.result.build?.errors}
- **Warnings:** ${this.result.build?.warnings}
- **Build Size:** ${Math.round(this.result.build?.sizeBytes! / 1024 / 1024)}MB ${Math.round(this.result.build?.sizeBytes! / 1024 / 1024) < 150 ? '✅' : '⚠️'}

---

## 🧪 Test Verification

### Unit Tests
- **Status:** ${this.result.tests?.unit.passed ? 'PASSED ✅' : 'FAILED ❌'}
- **Total Tests:** ${this.result.tests?.unit.total}
- **Passing:** ${this.result.tests?.unit.passing}
- **Failing:** ${this.result.tests?.unit.failing}

---

## 💡 Lighthouse Audit

- **Performance:** ${this.result.lighthouse?.performance}/100 ${this.result.lighthouse?.performance! >= 85 ? '✅' : '⚠️'}
- **Accessibility:** ${this.result.lighthouse?.accessibility}/100 ${this.result.lighthouse?.accessibility! >= 90 ? '✅' : '⚠️'}
- **SEO:** ${this.result.lighthouse?.seo}/100 ${this.result.lighthouse?.seo! >= 90 ? '✅' : '⚠️'}
- **Best Practices:** ${this.result.lighthouse?.bestPractices}/100

---

## ⚠️ Issues Found

${this.result.issues!.length === 0 ? 'No issues found! All checks passed. ✅' : this.result.issues!.map((issue) => `- ${issue}`).join('\\n')}

---

## 🎯 Verification Result

${this.result.verificationPassed ? '✅ **TASK VERIFICATION PASSED**\\n\\nAll checks passed. This task meets the requirements for "done" status.' : '❌ **TASK VERIFICATION FAILED**\\n\\n' + this.result.issues!.length + ' issues found. Fix these issues before marking task as "done".'}

---

## 📋 Next Steps

${this.result.verificationPassed ? '1. ✅ Mark task as "done" in task tracker\\n2. ✅ Update CHANGELOG.md\\n3. ✅ Notify stakeholders\\n4. ✅ Close related issues' : '1. ❌ Fix issues listed above\\n2. ❌ Re-run verification: \`npm run verify:task -- --task-id=' + this.result.taskId + ' --feature-url=' + this.options.featureUrl + '\`\\n3. ❌ Do NOT mark task as "done" until verification passes'}

---

**Automated by:** \`scripts/verify-task-completion.ts\`
**Generated:** ${dateStr}
`;
  }

  private getDirectorySize(dirPath: string): number {
    let size = 0;

    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        size += this.getDirectorySize(filePath);
      } else {
        size += stats.size;
      }
    }

    return size;
  }

  private async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// CLI Entry Point
async function main() {
  const args = process.argv.slice(2);
  const options: Partial<VerificationOptions> = {};

  for (const arg of args) {
    if (arg.startsWith('--task-id=')) {
      options.taskId = arg.split('=')[1];
    } else if (arg.startsWith('--feature-url=')) {
      options.featureUrl = arg.split('=')[1];
    } else if (arg.startsWith('--title=')) {
      options.title = arg.split('=')[1];
    } else if (arg.startsWith('--base-url=')) {
      options.baseUrl = arg.split('=')[1];
    }
  }

  if (!options.taskId || !options.featureUrl || !options.title) {
    console.error('❌ Missing required arguments\\n');
    console.log('Usage:');
    console.log(
      '  npm run verify:task -- --task-id=P0-001 --feature-url=/calculator --title="Fix calculator"\\n'
    );
    console.log('Required:');
    console.log('  --task-id      Task ID (e.g., P0-001)');
    console.log('  --feature-url  Feature path (e.g., /calculator)');
    console.log('  --title        Task title\\n');
    console.log('Optional:');
    console.log('  --base-url     Base URL (default: https://taxbridge.vercel.app)');
    process.exit(1);
  }

  const runner = new TaskVerificationRunner(options as VerificationOptions);
  const result = await runner.run();

  console.log('\\n' + '='.repeat(60));
  if (result.verificationPassed) {
    console.log('✅ VERIFICATION PASSED');
    console.log('This task meets all requirements for "done" status.');
    process.exit(0);
  } else {
    console.log('❌ VERIFICATION FAILED');
    console.log(`Found ${result.issues.length} issues:\\n`);
    result.issues.forEach((issue) => console.log(`  ${issue}`));
    console.log('\\nFix these issues before marking task as "done".');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });
}

export { TaskVerificationRunner, VerificationOptions, VerificationResult };
