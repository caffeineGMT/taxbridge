/**
 * Meta Pixel Tracking for Retargeting
 *
 * Creates custom audiences:
 * - Calculator users who didn't sign up
 * - Signups who didn't subscribe
 * - All website visitors (warm audience)
 */

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || 'XXXXXXXXXXXXXXXXX';

/**
 * Track signup event
 */
export function trackMetaSignup() {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'CompleteRegistration', {
      content_name: 'Free Signup',
      status: 'completed',
    });
    console.log('[Meta Pixel] Tracked signup');
  }
}

/**
 * Track Pro subscription purchase
 */
export function trackMetaPurchase(value = 299) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      value,
      currency: 'USD',
      content_name: 'Pro Subscription',
      content_type: 'product',
    });
    console.log('[Meta Pixel] Tracked purchase:', value);
  }
}

/**
 * Track calculator usage (for remarketing)
 */
export function trackMetaCalculatorUse() {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', 'CalculatorUse', {
      content_name: 'RSU Tax Calculator',
      action: 'used',
    });
    console.log('[Meta Pixel] Tracked calculator use');
  }
}

/**
 * Track lead generation (email capture, guide download)
 */
export function trackMetaLead(contentName?: string) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Lead', {
      content_name: contentName || 'Generic Lead',
    });
    console.log('[Meta Pixel] Tracked lead:', contentName);
  }
}

/**
 * Track enterprise demo request
 */
export function trackMetaEnterpriseDemo() {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', 'EnterpriseDemoRequest', {
      content_name: 'Enterprise Demo',
      value: 0,
    });
    console.log('[Meta Pixel] Tracked enterprise demo request');
  }
}

/**
 * Track content view for remarketing
 */
export function trackMetaViewContent(contentName: string) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: contentName,
    });
    console.log('[Meta Pixel] Tracked view content:', contentName);
  }
}
