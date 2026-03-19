/**
 * Related Articles Section Component
 * Shows 3 related articles based on category and keyword overlap
 */

import Link from 'next/link';
import { getRelatedArticles } from '@/lib/blog/related-articles';

interface RelatedArticlesSectionProps {
  currentSlug: string;
}

export default function RelatedArticlesSection({ currentSlug }: RelatedArticlesSectionProps) {
  const relatedArticles = getRelatedArticles(currentSlug, 3);

  if (relatedArticles.length === 0) {
    return (
      <section className="container mx-auto px-4 max-w-4xl py-12">
        <h2 className="text-2xl font-bold mb-6">More Tax Guides</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            href="/blog"
            className="block bg-gray-50 rounded-lg p-6 hover:shadow-lg transition"
          >
            <h3 className="font-bold mb-2 text-primary">View All Articles →</h3>
            <p className="text-sm text-gray-600">
              Browse our complete library of cross-border tax guides
            </p>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 max-w-4xl py-12">
      <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {relatedArticles.map(article => (
          <Link
            key={article.slug}
            href={`/blog/${article.slug}`}
            className="block bg-gray-50 rounded-lg p-6 hover:shadow-lg transition group"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-primary bg-blue-50 px-2 py-1 rounded">
                {article.category}
              </span>
              <span className="text-xs text-gray-500">
                {article.readingTime} min
              </span>
            </div>
            <h3 className="font-bold mb-2 group-hover:text-primary transition text-base">
              {article.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-3">
              {article.description}
            </p>
            <div className="mt-4 text-primary font-medium text-sm">
              Read more →
            </div>
          </Link>
        ))}
      </div>

      {/* Link to full blog */}
      <div className="mt-6 text-center">
        <Link
          href="/blog"
          className="text-primary hover:underline font-medium"
        >
          View all {relatedArticles.length + 39} tax guides →
        </Link>
      </div>
    </section>
  );
}
