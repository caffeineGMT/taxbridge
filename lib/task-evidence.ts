/**
 * Task Evidence Validation Library
 *
 * Enforces evidence-based task completion policy.
 * NO task can be marked 'done' without one of:
 * 1. Screenshot file path
 * 2. Log file path
 * 3. Video recording URL
 * 4. Deployed feature URL (with HTTP 200 verification)
 * 5. Analytics data export
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export enum EvidenceType {
  SCREENSHOT = 'screenshot',
  LOG_FILE = 'log_file',
  VIDEO_URL = 'video_url',
  DEPLOYED_URL = 'deployed_url',
  ANALYTICS_DATA = 'analytics_data',
}

export interface Evidence {
  type: EvidenceType;
  value: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface TaskEvidence {
  taskId: string;
  taskTitle: string;
  evidence: Evidence[];
  verifiedAt: string;
  verifiedBy: string;
}

export class EvidenceValidationError extends Error {
  constructor(message: string, public readonly errors: string[]) {
    super(message);
    this.name = 'EvidenceValidationError';
  }
}

/**
 * Validates that a file exists and is accessible
 */
export async function validateFileEvidence(filePath: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const stats = await fs.promises.stat(filePath);

    if (!stats.isFile()) {
      return { valid: false, error: `Path exists but is not a file: ${filePath}` };
    }

    if (stats.size === 0) {
      return { valid: false, error: `File is empty: ${filePath}` };
    }

    // Check file is readable
    await fs.promises.access(filePath, fs.constants.R_OK);

    return { valid: true };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return { valid: false, error: `File not found: ${filePath}` };
    }
    return { valid: false, error: `Cannot access file: ${filePath} - ${(error as Error).message}` };
  }
}

/**
 * Validates that a URL returns HTTP 200
 */
export async function validateDeployedUrl(url: string): Promise<{ valid: boolean; error?: string; statusCode?: number }> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (response.status === 200) {
      return { valid: true, statusCode: 200 };
    }

    return {
      valid: false,
      error: `URL returned status ${response.status}, expected 200`,
      statusCode: response.status
    };
  } catch (error) {
    return {
      valid: false,
      error: `Failed to fetch URL: ${url} - ${(error as Error).message}`
    };
  }
}

/**
 * Validates video URL is accessible
 */
export async function validateVideoUrl(url: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return {
        valid: false,
        error: `Video URL returned status ${response.status}`
      };
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.startsWith('video/')) {
      return {
        valid: false,
        error: `URL does not return video content (content-type: ${contentType})`
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: `Failed to validate video URL: ${(error as Error).message}`
    };
  }
}

/**
 * Validates evidence based on type
 */
export async function validateEvidence(evidence: Evidence): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  switch (evidence.type) {
    case EvidenceType.SCREENSHOT:
    case EvidenceType.LOG_FILE:
    case EvidenceType.ANALYTICS_DATA: {
      const result = await validateFileEvidence(evidence.value);
      if (!result.valid) {
        errors.push(result.error!);
      }
      break;
    }

    case EvidenceType.DEPLOYED_URL: {
      const result = await validateDeployedUrl(evidence.value);
      if (!result.valid) {
        errors.push(result.error!);
      }
      break;
    }

    case EvidenceType.VIDEO_URL: {
      const result = await validateVideoUrl(evidence.value);
      if (!result.valid) {
        errors.push(result.error!);
      }
      break;
    }

    default:
      errors.push(`Unknown evidence type: ${evidence.type}`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates all evidence for a task
 */
export async function validateTaskEvidence(taskEvidence: TaskEvidence): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  if (!taskEvidence.evidence || taskEvidence.evidence.length === 0) {
    errors.push('No evidence provided. At least one piece of evidence is required.');
    return { valid: false, errors };
  }

  // Validate each piece of evidence
  const validationResults = await Promise.all(
    taskEvidence.evidence.map(async (evidence) => {
      const result = await validateEvidence(evidence);
      return { evidence, result };
    })
  );

  // Collect errors
  validationResults.forEach(({ evidence, result }) => {
    if (!result.valid) {
      errors.push(`Evidence validation failed (${evidence.type}): ${result.errors.join(', ')}`);
    }
  });

  // At least one piece of evidence must be valid
  const hasValidEvidence = validationResults.some(({ result }) => result.valid);

  if (!hasValidEvidence) {
    errors.push('No valid evidence found. At least one piece of evidence must pass validation.');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Captures a screenshot of a URL using Playwright
 */
export async function captureScreenshot(
  url: string,
  outputPath: string,
  options?: { fullPage?: boolean; timeout?: number }
): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    const { chromium } = await import('@playwright/test');

    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: options?.timeout || 30000
    });

    // Ensure output directory exists
    await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });

    await page.screenshot({
      path: outputPath,
      fullPage: options?.fullPage ?? true
    });

    await browser.close();

    return { success: true, path: outputPath };
  } catch (error) {
    return {
      success: false,
      error: `Failed to capture screenshot: ${(error as Error).message}`
    };
  }
}

/**
 * Saves task evidence to JSON file
 */
export async function saveTaskEvidence(taskEvidence: TaskEvidence, outputPath?: string): Promise<string> {
  const evidenceDir = path.join(process.cwd(), 'docs', 'evidence');
  await fs.promises.mkdir(evidenceDir, { recursive: true });

  const filePath = outputPath || path.join(
    evidenceDir,
    `${taskEvidence.taskId.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.json`
  );

  await fs.promises.writeFile(
    filePath,
    JSON.stringify(taskEvidence, null, 2),
    'utf-8'
  );

  return filePath;
}

/**
 * Loads task evidence from JSON file
 */
export async function loadTaskEvidence(filePath: string): Promise<TaskEvidence> {
  const content = await fs.promises.readFile(filePath, 'utf-8');
  return JSON.parse(content) as TaskEvidence;
}

/**
 * Generates evidence report in markdown format
 */
export function generateEvidenceReport(taskEvidence: TaskEvidence): string {
  const lines = [
    `# Task Completion Evidence Report`,
    ``,
    `**Task ID:** ${taskEvidence.taskId}`,
    `**Task Title:** ${taskEvidence.taskTitle}`,
    `**Verified At:** ${taskEvidence.verifiedAt}`,
    `**Verified By:** ${taskEvidence.verifiedBy}`,
    ``,
    `## Evidence Provided`,
    ``
  ];

  taskEvidence.evidence.forEach((evidence, index) => {
    lines.push(`### Evidence ${index + 1}: ${evidence.type}`);
    lines.push(``);
    lines.push(`- **Type:** ${evidence.type}`);
    lines.push(`- **Value:** ${evidence.value}`);
    lines.push(`- **Timestamp:** ${evidence.timestamp}`);

    if (evidence.metadata && Object.keys(evidence.metadata).length > 0) {
      lines.push(`- **Metadata:**`);
      Object.entries(evidence.metadata).forEach(([key, value]) => {
        lines.push(`  - ${key}: ${value}`);
      });
    }

    lines.push(``);
  });

  return lines.join('\n');
}

/**
 * Quick verification script helper
 */
export async function quickVerify(
  taskId: string,
  taskTitle: string,
  featureUrl?: string,
  screenshotPath?: string
): Promise<{ success: boolean; evidencePath?: string; errors?: string[] }> {
  const evidence: Evidence[] = [];
  const errors: string[] = [];

  // Add screenshot if provided
  if (screenshotPath) {
    const validation = await validateFileEvidence(screenshotPath);
    if (validation.valid) {
      evidence.push({
        type: EvidenceType.SCREENSHOT,
        value: screenshotPath,
        timestamp: new Date().toISOString(),
      });
    } else {
      errors.push(`Screenshot validation failed: ${validation.error}`);
    }
  }

  // Add deployed URL if provided
  if (featureUrl) {
    const validation = await validateDeployedUrl(featureUrl);
    if (validation.valid) {
      evidence.push({
        type: EvidenceType.DEPLOYED_URL,
        value: featureUrl,
        timestamp: new Date().toISOString(),
        metadata: { statusCode: validation.statusCode },
      });
    } else {
      errors.push(`URL validation failed: ${validation.error}`);
    }
  }

  if (evidence.length === 0) {
    return { success: false, errors: ['No valid evidence provided'] };
  }

  const taskEvidence: TaskEvidence = {
    taskId,
    taskTitle,
    evidence,
    verifiedAt: new Date().toISOString(),
    verifiedBy: process.env.USER || 'unknown',
  };

  const evidencePath = await saveTaskEvidence(taskEvidence);

  return { success: true, evidencePath };
}
