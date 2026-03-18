import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { Suspense } from 'react';
import { Analytics } from '@vercel/analytics/react';
import ReferralTracker from '@/components/ReferralTracker';
import PostHogProvider from '@/components/PostHogProvider';
import { Toaster } from '@/components/ui/toaster';
import WebVitalsTracker from '@/components/WebVitalsTracker';
import Script from 'next/script';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TaxBridge - US-Canada Cross-Border Tax Calculator',
  description: 'Simplify cross-border tax filing for H-1B/TN visa tech workers with US RSUs living in Canada',
  viewport: 'width=device-width, initial-scale=1',
};

// Google Ads Conversion ID - Replace with actual ID after account setup
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-XXXXXXXXXX';
// Meta Pixel ID - Replace with actual ID after Pixel setup
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
          colorPrimary: '#10b981', // Emerald-500
          colorBackground: '#020617', // Slate-950
          colorInputBackground: '#1e293b', // Slate-800
          colorInputText: '#f1f5f9', // Slate-100
        },
      }}
    >
      <html lang="en" className="dark">
        <head>
          {/* Google Ads Global Site Tag (gtag.js) */}
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-ads-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GOOGLE_ADS_ID}');
            `}
          </Script>

          {/* Meta Pixel */}
          <Script id="meta-pixel" strategy="afterInteractive">
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
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            />
          </noscript>
        </head>
        <body className={inter.className}>
          <Suspense fallback={null}>
            <PostHogProvider />
            <ReferralTracker />
            <WebVitalsTracker />
          </Suspense>
          {children}
          <Toaster />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
