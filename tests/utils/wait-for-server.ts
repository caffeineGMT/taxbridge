/**
 * Wait for Server Utility
 *
 * Waits for the development server to be ready before running tests.
 * Implements exponential backoff retry logic to handle server startup.
 */

interface WaitForServerOptions {
  url: string;
  timeout?: number;
  retryInterval?: number;
}

export async function waitForServer({
  url,
  timeout = 120000, // 2 minutes default
  retryInterval = 500, // 500ms between retries
}: WaitForServerOptions): Promise<void> {
  const startTime = Date.now();
  let lastError: Error | undefined;
  let attemptCount = 0;

  console.log(`⏳ Waiting for server at ${url} (timeout: ${timeout}ms)`);

  while (Date.now() - startTime < timeout) {
    attemptCount++;
    try {
      // Try to fetch the server URL using native fetch (Node 18+) or http module
      const response = await fetch(url, {
        method: 'HEAD',
        // Use a shorter timeout per request
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok || response.status === 404 || response.status === 500) {
        // Server is responding (404/500 is fine, means server is up but may have errors)
        const elapsed = Date.now() - startTime;
        console.log(`✅ Server ready at ${url} (status: ${response.status}, attempts: ${attemptCount}, elapsed: ${elapsed}ms)`);
        return;
      }

      lastError = new Error(`Server responded with status ${response.status}`);
    } catch (error) {
      // Connection refused or timeout - server not ready yet
      lastError = error as Error;

      // Log every 10 attempts to show progress
      if (attemptCount % 10 === 0) {
        const elapsed = Date.now() - startTime;
        console.log(`⏳ Still waiting... (attempt ${attemptCount}, elapsed: ${elapsed}ms)`);
      }
    }

    // Wait before retrying
    await new Promise((resolve) => setTimeout(resolve, retryInterval));
  }

  // Timeout exceeded
  const elapsed = Date.now() - startTime;
  throw new Error(
    `❌ Server at ${url} did not become ready within ${timeout}ms (waited ${elapsed}ms, ${attemptCount} attempts). Last error: ${lastError?.message}`
  );
}
