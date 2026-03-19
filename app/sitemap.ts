import { MetadataRoute } from 'next';
import { generateAllPageParams } from '@/lib/seo/geo-data';
import { getAllArticleSlugs } from '@/lib/blog/articles';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://taxbridge.vercel.app';
  const now = new Date();

  // Static public pages with individual priorities
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/us-canada-tax-calculator`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/h1b-rsu-tax-guide`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/canada-tax-filing-checklist`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/enterprise`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/partners`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/api-docs`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Generate all geo-targeted landing pages
  const geoPages: MetadataRoute.Sitemap = generateAllPageParams().map(({ state, province, employer }) => {
    const slug = employer
      ? `${employer}-${province.toLowerCase()}`
      : `${state.toLowerCase()}-${province.toLowerCase()}`;

    return {
      url: `${baseUrl}/tax-calculator/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: employer ? 0.9 : 0.85,
    };
  });

  // Blog articles
  const blogPages: MetadataRoute.Sitemap = getAllArticleSlugs().map(slug => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticPages, ...geoPages, ...blogPages];
}
