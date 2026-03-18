import { MetadataRoute } from 'next';
import { generateAllPageParams } from '@/lib/seo/geo-data';
import { getAllArticleSlugs } from '@/lib/blog/articles';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://taxbridge.app';

  // Static pages
  const staticPages = [
    '',
    '/us-canada-tax-calculator',
    '/h1b-rsu-tax-guide',
    '/canada-tax-filing-checklist',
    '/pricing',
    '/dashboard',
    '/blog',
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Generate all geo-targeted landing pages
  const geoPages = generateAllPageParams().map(({ state, province, employer }) => {
    const slug = employer
      ? `${employer}-${province.toLowerCase()}`
      : `${state.toLowerCase()}-${province.toLowerCase()}`;

    return {
      url: `${baseUrl}/tax-calculator/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: employer ? 0.9 : 0.85, // Employer pages slightly higher priority
    };
  });

  // Blog articles
  const blogPages = getAllArticleSlugs().map(slug => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...geoPages, ...blogPages];
}
