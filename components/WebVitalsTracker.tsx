'use client';

import { useEffect } from 'react';
import { reportWebVitals } from '@/lib/vitals';

/**
 * Client-side Web Vitals tracker component
 * Automatically tracks Core Web Vitals (CLS, FID, LCP) and sends to analytics
 */
export default function WebVitalsTracker() {
  useEffect(() => {
    // Initialize Web Vitals reporting on client side
    reportWebVitals();
  }, []);

  // This component doesn't render anything
  return null;
}
