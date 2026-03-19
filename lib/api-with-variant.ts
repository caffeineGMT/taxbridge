/**
 * API Client Utility with Experiment Variant Headers
 *
 * Automatically attaches A/B test variant to API requests
 * for dynamic limit enforcement
 */

import { getUserExperimentVariants } from '@/hooks/use-conversion-experiments';

/**
 * Fetch wrapper that automatically includes experiment variant headers
 */
export async function fetchWithVariant(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Get user's current A/B test variants
  const variants = getUserExperimentVariants();

  // Add variant headers
  const headers = new Headers(options.headers);
  headers.set('x-free-tier-variant', variants.freeTier);
  headers.set('x-headline-variant', variants.headline);
  headers.set('x-social-proof-variant', variants.socialProof);

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Simplified POST request with variant headers
 */
export async function postWithVariant(
  url: string,
  data: any
): Promise<Response> {
  return fetchWithVariant(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

/**
 * Simplified GET request with variant headers
 */
export async function getWithVariant(url: string): Promise<Response> {
  return fetchWithVariant(url, {
    method: 'GET',
  });
}

/**
 * React hook for making API calls with variant headers
 */
export function useApiWithVariant() {
  const createRSUEntry = async (data: any) => {
    const response = await postWithVariant('/api/rsu', data);
    return response.json();
  };

  const getRSUEntries = async () => {
    const response = await getWithVariant('/api/rsu');
    return response.json();
  };

  return {
    createRSUEntry,
    getRSUEntries,
    fetchWithVariant,
    postWithVariant,
    getWithVariant,
  };
}
