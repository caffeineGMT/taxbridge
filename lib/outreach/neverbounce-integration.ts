/**
 * NeverBounce Email Verification Integration
 *
 * Verifies email addresses before outreach campaigns
 * Cost: $0.008/email ($1.60 for 200 emails)
 *
 * API Docs: https://developers.neverbounce.com/reference
 */

export interface NeverBounceConfig {
  apiKey: string;
  baseUrl: string;
}

export interface NeverBounceResult {
  status: 'success' | 'general_failure';
  result: 'valid' | 'invalid' | 'disposable' | 'catchall' | 'unknown';
  flags: string[];
  suggested_correction: string;
  execution_time: number;
}

export interface NeverBounceBulkJob {
  job_id: number;
  status: string;
}

export interface NeverBounceBulkResult {
  job_id: number;
  job_status: 'complete' | 'failed' | 'running' | 'queued' | 'uploading';
  total: {
    records: number;
    billable: number;
    processed: number;
    valid: number;
    invalid: number;
    disposable: number;
    catchall: number;
    unknown: number;
  };
}

export interface VerifiedEmail {
  email: string;
  result: NeverBounceResult['result'];
  flags: string[];
  is_deliverable: boolean;
}

const DEFAULT_CONFIG: NeverBounceConfig = {
  apiKey: process.env.NEVERBOUNCE_API_KEY || '',
  baseUrl: 'https://api.neverbounce.com/v4',
};

/**
 * Verify a single email address
 */
export async function verifySingleEmail(
  email: string,
  config: NeverBounceConfig = DEFAULT_CONFIG
): Promise<VerifiedEmail> {
  if (!config.apiKey) {
    throw new Error('NEVERBOUNCE_API_KEY not set in environment');
  }

  const response = await fetch(`${config.baseUrl}/single/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key: config.apiKey,
      email,
      address_info: 1,
      credits_info: 1,
      timeout: 30,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NeverBounce API error: ${response.status} - ${errorText}`);
  }

  const data: NeverBounceResult = await response.json();

  return {
    email,
    result: data.result,
    flags: data.flags || [],
    is_deliverable: data.result === 'valid' || data.result === 'catchall',
  };
}

/**
 * Verify multiple emails in bulk (more cost-effective for 200+ emails)
 */
export async function verifyBulkEmails(
  emails: string[],
  config: NeverBounceConfig = DEFAULT_CONFIG
): Promise<{ jobId: number }> {
  if (!config.apiKey) {
    throw new Error('NEVERBOUNCE_API_KEY not set in environment');
  }

  const response = await fetch(`${config.baseUrl}/bulk/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key: config.apiKey,
      input: emails.map(email => ({ email })),
      input_location: 'supplied',
      auto_parse: true,
      auto_start: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NeverBounce bulk submit error: ${response.status} - ${errorText}`);
  }

  const data: NeverBounceBulkJob = await response.json();
  return { jobId: data.job_id };
}

/**
 * Check status of bulk verification job
 */
export async function checkBulkJobStatus(
  jobId: number,
  config: NeverBounceConfig = DEFAULT_CONFIG
): Promise<NeverBounceBulkResult> {
  const response = await fetch(`${config.baseUrl}/bulk/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key: config.apiKey,
      job_id: jobId,
    }),
  });

  if (!response.ok) {
    throw new Error(`NeverBounce status check error: ${response.status}`);
  }

  return await response.json();
}

/**
 * Download bulk verification results
 */
export async function downloadBulkResults(
  jobId: number,
  config: NeverBounceConfig = DEFAULT_CONFIG
): Promise<VerifiedEmail[]> {
  const response = await fetch(`${config.baseUrl}/bulk/download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key: config.apiKey,
      job_id: jobId,
    }),
  });

  if (!response.ok) {
    throw new Error(`NeverBounce download error: ${response.status}`);
  }

  const csvText = await response.text();
  const lines = csvText.split('\n').filter(line => line.trim());

  return lines.slice(1).map(line => {
    const parts = line.split(',');
    const email = parts[0]?.replace(/"/g, '').trim() || '';
    const result = (parts[1]?.replace(/"/g, '').trim() || 'unknown') as NeverBounceResult['result'];

    return {
      email,
      result,
      flags: [],
      is_deliverable: result === 'valid' || result === 'catchall',
    };
  });
}

/**
 * Verify emails with polling for bulk job completion
 * Use this for verifying the full 200 firm list
 */
export async function verifyEmailsBatch(
  emails: string[],
  config: NeverBounceConfig = DEFAULT_CONFIG,
  onProgress?: (status: string, progress: number) => void
): Promise<VerifiedEmail[]> {
  // For small batches, use single verification
  if (emails.length <= 10) {
    const results: VerifiedEmail[] = [];
    for (let i = 0; i < emails.length; i++) {
      onProgress?.(`Verifying ${i + 1}/${emails.length}`, (i / emails.length) * 100);
      try {
        const result = await verifySingleEmail(emails[i], config);
        results.push(result);
      } catch {
        results.push({
          email: emails[i],
          result: 'unknown',
          flags: ['verification_error'],
          is_deliverable: false,
        });
      }
      // Rate limit: 1 request per 100ms
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return results;
  }

  // For larger batches, use bulk verification
  onProgress?.('Submitting bulk verification job...', 0);
  const { jobId } = await verifyBulkEmails(emails, config);
  onProgress?.(`Job submitted (ID: ${jobId}). Waiting for completion...`, 10);

  // Poll for completion
  let attempts = 0;
  const maxAttempts = 60; // 5 minutes max (5s intervals)

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    attempts++;

    const status = await checkBulkJobStatus(jobId, config);
    const progress = status.total.records > 0
      ? Math.round((status.total.processed / status.total.records) * 100)
      : 0;

    onProgress?.(`Processing: ${status.total.processed}/${status.total.records}`, progress);

    if (status.job_status === 'complete') {
      onProgress?.('Downloading results...', 95);
      return await downloadBulkResults(jobId, config);
    }

    if (status.job_status === 'failed') {
      throw new Error(`Bulk verification job failed (ID: ${jobId})`);
    }
  }

  throw new Error(`Bulk verification timed out after ${maxAttempts * 5} seconds`);
}

/**
 * Get account info and remaining credits
 */
export async function getAccountInfo(
  config: NeverBounceConfig = DEFAULT_CONFIG
): Promise<{ credits_remaining: number; free_credits_used: number }> {
  const response = await fetch(`${config.baseUrl}/account/info`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: config.apiKey }),
  });

  if (!response.ok) {
    throw new Error(`NeverBounce account info error: ${response.status}`);
  }

  const data = await response.json();
  return {
    credits_remaining: data.credits_info?.paid_credits_remaining || 0,
    free_credits_used: data.credits_info?.free_credits_used || 0,
  };
}
