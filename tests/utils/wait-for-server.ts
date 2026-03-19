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

  while (Date.now() - startTime < timeout) {
    try {
      // Try to fetch the server URL
      const response = await fetch(url, {
        method: 'HEAD',
        // Use a shorter timeout per request
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok || response.status === 404) {
        // Server is responding (404 is fine, means server is up)
        console.log(`✅ Server ready at ${url}`);
        return;
      }

      lastError = new Error(`Server responded with status ${response.status}`);
    } catch (error) {
      // Connection refused or timeout - server not ready yet
      lastError = error as Error;
    }

    // Wait before retrying
    await new Promise((resolve) => setTimeout(resolve, retryInterval));
  }

  // Timeout exceeded
  const elapsed = Date.now() - startTime;
  throw new Error(
    `Server at ${url} did not become ready within ${timeout}ms (waited ${elapsed}ms). Last error: ${lastError?.message}`
  );
}
