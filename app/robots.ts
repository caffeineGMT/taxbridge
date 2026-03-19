import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://taxbridgecpa.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/settings/',
          '/sign-in',
          '/sign-up',
          '/dashboard',
          '/rsu-entry',
          '/rsu/',
          '/forms-checklist',
          '/onboarding',
          '/referrals',
          '/survey/',
          '/unsubscribe',
          '/demo/checkout',
          '/launch-dashboard',
          '/status',
          '/_next/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
