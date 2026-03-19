import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Analytics } from '@vercel/analytics/react';
import { Toaster } from '@/components/ui/toaster';
import { SkipLink } from '@/components/ui/skip-link';
import { TooltipProvider } from '@/components/ui/tooltip';
import Script from 'next/script';
import './globals.css';

// Optimize font loading — display swap prevents FOIT, preload critical subset
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

// Lazy load non-critical client components to reduce initial JS bundle
const PostHogProvider = dynamic(() => import('@/components/PostHogProvider'), { ssr: false });
const ReferralTracker = dynamic(() => import('@/components/ReferralTracker'), { ssr: false });
const WebVitalsTracker = dynamic(() => import('@/components/WebVitalsTracker'), { ssr: false });

// Separate viewport export (Next.js 14+ best practice — avoids console warning)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#020617',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://taxbridge.app'),
  title: {
    default: 'TaxBridge - US-Canada Cross-Border Tax Calculator for H-1B/TN Workers',
    template: '%s | TaxBridge',
  },
  description:
    'Free cross-border tax calculator for H-1B and TN visa tech workers with US RSUs living in Canada. Calculate US federal+state and Canada federal+provincial taxes. Foreign Tax Credit optimizer included.',
  keywords: [
    'cross-border tax calculator',
    'H-1B RSU tax',
    'TN visa tax',
    'US Canada tax',
    'foreign tax credit',
    'RSU taxation',
    'dual country tax filing',
  ],
  authors: [{ name: 'TaxBridge' }],
  creator: 'TaxBridge',
  publisher: 'TaxBridge',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://taxbridge.app',
    siteName: 'TaxBridge',
    title: 'TaxBridge - US-Canada Cross-Border Tax Calculator',
    description:
      'Free cross-border tax calculator for H-1B and TN visa tech workers with US RSUs living in Canada. Foreign Tax Credit optimizer included.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TaxBridge - Cross-Border Tax Calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TaxBridge - US-Canada Cross-Border Tax Calculator',
    description:
      'Free cross-border tax calculator for H-1B/TN visa tech workers. Calculate dual-country taxes and optimize Foreign Tax Credits.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

// Google Ads Conversion ID
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-XXXXXXXXXX';
// Meta Pixel ID
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || 'XXXXXXXXXXXXXXXXX';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#10b981',
          colorBackground: '#020617',
          colorInputBackground: '#1e293b',
          colorInputText: '#f1f5f9',
        },
      }}
    >
      <html lang="en" className="dark">
        <head>
          {/* Preconnect to critical third-party origins for faster handshake */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

          {/* DNS prefetch for analytics domains — resolves DNS early without full connection */}
          <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
          <link rel="dns-prefetch" href="https://connect.facebook.net" />

          {/* Google Ads — lazyOnload: loads after everything else, doesn't block LCP */}
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
            strategy="lazyOnload"
          />
          <Script id="google-ads-init" strategy="lazyOnload">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GOOGLE_ADS_ID}');
            `}
          </Script>

          {/* Meta Pixel — lazyOnload: doesn't impact Core Web Vitals */}
          <Script id="meta-pixel" strategy="lazyOnload">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              alt=""
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            />
          </noscript>
        </head>
        <body className={inter.className}>
          <TooltipProvider delayDuration={300}>
          <SkipLink />
          <Suspense fallback={null}>
            <PostHogProvider />
            <ReferralTracker />
            <WebVitalsTracker />
          </Suspense>
          {children}
          <Toaster />
          <Analytics />
          </TooltipProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
