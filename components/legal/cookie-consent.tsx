'use client';

import { useState, useEffect } from 'react';
import { X, Cookie, Settings } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    } else {
      const savedPreferences = JSON.parse(consent);
      setPreferences(savedPreferences);
      applyCookiePreferences(savedPreferences);
    }
  }, []);

  const applyCookiePreferences = (prefs: CookiePreferences) => {
    // Analytics cookies (PostHog, Google Analytics, Vercel Analytics)
    if (!prefs.analytics) {
      // Disable analytics tracking
      if (typeof window !== 'undefined') {
        // @ts-ignore
        window['ga-disable-UA-XXXXX-Y'] = true;
        // @ts-ignore
        if (window.posthog) window.posthog.opt_out_capturing();
      }
    }

    // Marketing cookies (Google Ads, Meta Pixel)
    if (!prefs.marketing) {
      // Disable marketing tracking
      if (typeof window !== 'undefined') {
        // @ts-ignore
        if (window.fbq) window.fbq('consent', 'revoke');
        // @ts-ignore
        if (window.gtag) window.gtag('consent', 'update', {
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
        });
      }
    } else {
      // Enable marketing tracking
      if (typeof window !== 'undefined') {
        // @ts-ignore
        if (window.fbq) window.fbq('consent', 'grant');
        // @ts-ignore
        if (window.gtag) window.gtag('consent', 'update', {
          ad_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted',
        });
      }
    }
  };

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookieConsent', JSON.stringify(prefs));
    applyCookiePreferences(prefs);
    setShowBanner(false);
    setShowSettings(false);
  };

  const acceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    savePreferences(allAccepted);
  };

  const acceptEssentialOnly = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
    };
    setPreferences(essentialOnly);
    savePreferences(essentialOnly);
  };

  const saveCustomPreferences = () => {
    savePreferences(preferences);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-slate-900/95 backdrop-blur-sm border-t border-slate-800 shadow-2xl">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Cookie className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-100 mb-1">Cookie Preferences</h3>
                <p className="text-sm text-slate-300">
                  We use cookies to enhance your experience, analyze site usage, and assist in our marketing
                  efforts. Essential cookies are required for the site to function.{' '}
                  <Link href="/privacy" className="text-emerald-400 hover:text-emerald-300 underline">
                    Learn more in our Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Button
                onClick={() => setShowSettings(!showSettings)}
                variant="outline"
                size="sm"
                className="border-slate-700 hover:border-emerald-500 hover:bg-slate-800 text-slate-100 w-full sm:w-auto"
              >
                <Settings className="h-4 w-4 mr-2" />
                Customize
              </Button>
              <Button
                onClick={acceptEssentialOnly}
                variant="outline"
                size="sm"
                className="border-slate-700 hover:border-emerald-500 hover:bg-slate-800 text-slate-100 w-full sm:w-auto"
              >
                Essential Only
              </Button>
              <Button
                onClick={acceptAll}
                size="sm"
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 w-full sm:w-auto"
              >
                Accept All
              </Button>
            </div>
          </div>

          {/* Cookie Settings Panel */}
          {showSettings && (
            <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-semibold text-slate-100">Manage Cookie Preferences</h4>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-slate-400 hover:text-slate-200"
                  aria-label="Close settings"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Essential Cookies */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-medium text-slate-100">Essential Cookies</div>
                    <div className="text-sm text-slate-400">
                      Required for authentication, security, and basic site functionality. Cannot be disabled.
                    </div>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-emerald-500 opacity-50 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-medium text-slate-100">Analytics Cookies</div>
                    <div className="text-sm text-slate-400">
                      Help us understand how visitors use our site through PostHog, Google Analytics, and
                      Vercel Analytics. Used to improve performance and user experience.
                    </div>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
                    />
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-medium text-slate-100">Marketing Cookies</div>
                    <div className="text-sm text-slate-400">
                      Used to track visitors across websites (Google Ads, Meta Pixel) to display relevant
                      advertisements and measure campaign effectiveness.
                    </div>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-700">
                <Button
                  onClick={() => setShowSettings(false)}
                  variant="outline"
                  size="sm"
                  className="border-slate-700 hover:border-slate-600 hover:bg-slate-700 text-slate-100"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveCustomPreferences}
                  size="sm"
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950"
                >
                  Save Preferences
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay when settings are open */}
      {showSettings && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowSettings(false)}
        />
      )}
    </>
  );
}
