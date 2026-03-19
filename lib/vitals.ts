import { onCLS, onINP, onLCP, onFCP, onTTFB, Metric } from 'web-vitals';
import { getDeviceInfo } from './analytics/tracking-utils';

/**
 * Web Vitals tracking configuration
 * Captures Core Web Vitals (CLS, INP, LCP) and additional metrics (FCP, TTFB)
 * Note: INP (Interaction to Next Paint) replaced FID in March 2024
 */

export interface VitalsPayload {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
  deviceInfo?: ReturnType<typeof getDeviceInfo>;
}

/**
 * Send Web Vitals data to analytics endpoint
 */
async function sendToAnalytics(metric: Metric) {
  const body: VitalsPayload = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    deviceInfo: getDeviceInfo(), // Include device information
  };

  try {
    // Send to custom analytics endpoint
    await fetch('/api/analytics/vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      keepalive: true, // Ensure request completes even if page unloads
    });
  } catch (error) {
    // Silently fail - don't block user experience
    console.error('Failed to send vitals:', error);
  }
}

/**
 * Initialize Web Vitals reporting
 * Call this in a client component or useEffect
 */
export function reportWebVitals() {
  // Core Web Vitals
  onCLS(sendToAnalytics); // Cumulative Layout Shift
  onINP(sendToAnalytics); // Interaction to Next Paint (replaced FID)
  onLCP(sendToAnalytics); // Largest Contentful Paint

  // Additional metrics
  onFCP(sendToAnalytics); // First Contentful Paint
  onTTFB(sendToAnalytics); // Time to First Byte
}

/**
 * Get rating thresholds for Web Vitals
 */
export const VITALS_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint (ms)
  INP: { good: 200, poor: 500 }, // Interaction to Next Paint (ms)
  CLS: { good: 0.1, poor: 0.25 }, // Cumulative Layout Shift (score)
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint (ms)
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte (ms)
} as const;

/**
 * Client-side component to track Web Vitals
 * Add to app/layout.tsx or individual pages
 */
export function WebVitalsReporter() {
  if (typeof window !== 'undefined') {
    reportWebVitals();
  }
  return null;
}
