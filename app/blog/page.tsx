/**
 * Blog Index Page
 * Lists all published articles with category filtering
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { ARTICLE_TOPICS, getAllCategories } from '@/lib/blog/articles';
import fs from 'fs';
import path from 'path';

export const metadata: Metadata = {
  title: 'Cross-Border Tax Blog | H-1B & TN Visa Tax Guides',
  description: 'Expert guides on H-1B RSU taxation, Form 8938, FBAR, TN visa taxes, and US-Canada cross-border tax planning. Free resources for tech workers.',
  keywords: 'H-1B tax blog, RSU taxation guides, cross-border tax articles, TN visa taxes, Canada US tax planning',
  openGraph: {
    title: 'Cross-Border Tax Blog | Expert Guides for H-1B & TN Workers',
    description: 'Free tax guides covering H-1B RSU taxation, cross-border compliance, and Canada-US tax planning.',
    type: 'website',
  },
};

interface BlogArticle {
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedAt: string;
  readingTime: number;
  featured: boolean;
}

async function getPublishedArticles(): Promise<BlogArticle[]> {
  const dataDir = path.join(process.cwd(), 'data', 'blog');

  // Check if index exists
  const indexPath = path.join(dataDir, 'articles-index.json');
  if (fs.existsSync(indexPath)) {
    const data = fs.readFileSync(indexPath, 'utf-8');
    const articles = JSON.parse(data);

    // Filter to only show published articles (publishedAt <= now)
    const now = new Date();
    return articles
      .filter((a: BlogArticle) => new Date(a.publishedAt) <= now)
      .sort((a: BlogArticle, b: BlogArticle) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
  }

  // Fallback: return metadata only
  return ARTICLE_TOPICS.map((topic, index) => ({
    slug: topic.slug,
    title: topic.title,
    description: topic.description,
    category: topic.category,
    publishedAt: new Date().toISOString(),
    readingTime: 7,
    featured: index < 3,
  }));
}

export default async function BlogPage() {
  const articles = await getPublishedArticles();
  const categories = getAllCategories();
  const featuredArticles = articles.filter(a => a.featured).slice(0, 3);
  const regularArticles = articles.filter(a => !a.featured);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Cross-Border Tax Blog
          </h1>
          <p className="text-xl text-blue-100 mb-6">
            Expert guides on H-1B RSU taxation, TN visa taxes, and US-Canada cross-border tax planning.
            Free resources to save thousands on CPA fees.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-blue-100">📚 {articles.length} articles</span>
            <span className="text-blue-100">•</span>
            <span className="text-blue-100">💰 Save $3,000+ in CPA fees</span>
            <span className="text-blue-100">•</span>
            <span className="text-blue-100">⏱️ 10-minute reads</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b bg-white">
        <div className="container mx-auto px-4 max-w-6xl py-4">
          <div className="flex gap-2 overflow-x-auto">
            <Link
              href="/blog"
              className="px-4 py-2 rounded-full bg-primary text-white text-sm font-medium whitespace-nowrap"
            >
              All Articles
            </Link>
            {categories.map(category => (
              <Link
                key={category}
                href={`/blog?category=${encodeURIComponent(category)}`}
                className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium whitespace-nowrap transition"
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-6xl py-12">
        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Featured Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredArticles.map(article => (
                <Link
                  key={article.slug}
                  href={`/blog/${article.slug}`}
                  className="group block bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden"
                >
                  <div className="h-48 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <span className="text-6xl">📊</span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-primary bg-blue-50 px-2 py-1 rounded">
                        {article.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {article.readingTime} min read
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {article.description}
                    </p>
                    <div className="mt-4 flex items-center text-primary font-medium text-sm">
                      Read more →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* All Articles */}
        <section>
          <h2 className="text-2xl font-bold mb-6">All Articles</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {regularArticles.map(article => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="group block bg-white rounded-lg shadow hover:shadow-lg transition p-6"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-primary bg-blue-50 px-2 py-1 rounded">
                    {article.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {article.readingTime} min read
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition">
                  {article.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {article.description}
                </p>
                <div className="mt-4 flex items-center text-primary font-medium text-sm">
                  Read more →
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-16 bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Calculate Your Cross-Border Taxes?
          </h2>
          <p className="text-xl text-blue-100 mb-6 max-w-2xl mx-auto">
            Stop reading, start calculating. Our free calculator handles dual-country RSU taxation in 10 minutes.
          </p>
          <Link
            href="/us-canada-tax-calculator"
            className="inline-block bg-white text-primary px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
          >
            Try Free Calculator →
          </Link>
          <p className="text-sm text-blue-100 mt-4">
            No signup required • Instant results • Save $3,000 in CPA fees
          </p>
        </section>
      </div>
    </div>
  );
}
