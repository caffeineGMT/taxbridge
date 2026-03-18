/**
 * Dynamic Blog Article Page
 * Individual article view with Schema.org markup and email capture
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllArticleSlugs } from '@/lib/blog/articles';
import fs from 'fs';
import path from 'path';
import { Article, WithContext } from 'schema-dts';
import EmailCapturePopup from '@/components/blog/EmailCapturePopup';

interface BlogArticle {
  slug: string;
  title: string;
  description: string;
  content: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  keywords: string[];
  category: string;
  readingTime: number;
}

async function getArticle(slug: string): Promise<BlogArticle | null> {
  const articlePath = path.join(process.cwd(), 'data', 'blog', `${slug}.json`);

  if (!fs.existsSync(articlePath)) {
    return null;
  }

  const data = fs.readFileSync(articlePath, 'utf-8');
  return JSON.parse(data);
}

export async function generateStaticParams() {
  return getAllArticleSlugs().map(slug => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: `${article.title} | TaxBridge Blog`,
    description: article.description,
    keywords: article.keywords.join(', '),
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author],
      tags: article.keywords,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  // Schema.org Article markup
  const articleSchema: WithContext<Article> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: {
      '@type': 'Organization',
      name: article.author,
      url: 'https://taxbridge.app',
    },
    publisher: {
      '@type': 'Organization',
      name: 'TaxBridge',
      logo: {
        '@type': 'ImageObject',
        url: 'https://taxbridge.app/logo.png',
      },
    },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    keywords: article.keywords.join(', '),
    articleSection: article.category,
    wordCount: article.content.split(/\s+/).length,
    inLanguage: 'en-US',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://taxbridge.app/blog/${article.slug}`,
    },
  };

  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />

      <div className="min-h-screen bg-white">
        {/* Breadcrumbs */}
        <div className="border-b bg-gray-50">
          <div className="container mx-auto px-4 max-w-4xl py-4">
            <nav className="flex items-center gap-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-primary">
                Home
              </Link>
              <span>›</span>
              <Link href="/blog" className="hover:text-primary">
                Blog
              </Link>
              <span>›</span>
              <span className="text-gray-900 font-medium">{article.category}</span>
            </nav>
          </div>
        </div>

        {/* Article Header */}
        <header className="bg-gradient-to-b from-gray-50 to-white border-b">
          <div className="container mx-auto px-4 max-w-4xl py-12">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-semibold text-primary bg-blue-50 px-3 py-1 rounded">
                {article.category}
              </span>
              <span className="text-sm text-gray-500">
                {article.readingTime} min read
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              {article.title}
            </h1>

            <p className="text-xl text-gray-600 mb-6">{article.description}</p>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <span>{article.author}</span>
                <span>•</span>
                <time dateTime={article.publishedAt}>
                  {new Date(article.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>

              {/* Social Share */}
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Share:</span>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    article.title
                  )}&url=${encodeURIComponent(
                    `https://taxbridge.app/blog/${article.slug}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-primary"
                >
                  𝕏
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                    `https://taxbridge.app/blog/${article.slug}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-primary"
                >
                  in
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article className="container mx-auto px-4 max-w-4xl py-12">
          <div
            className="prose prose-lg max-w-none
              prose-headings:font-bold prose-headings:text-gray-900
              prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
              prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
              prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-900 prose-strong:font-semibold
              prose-ul:my-6 prose-li:my-2
              prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm"
            dangerouslySetInnerHTML={{
              __html: convertMarkdownToHTML(article.content),
            }}
          />
        </article>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-primary to-secondary py-16 mt-12">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Calculate Your Cross-Border Taxes?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Stop guessing. Get exact calculations for US and Canada taxes on your RSUs in under 10 minutes.
            </p>
            <Link
              href="/us-canada-tax-calculator"
              className="inline-block bg-white text-primary px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-lg"
            >
              Try Free Calculator →
            </Link>
            <p className="text-sm text-blue-100 mt-4">
              No signup • Instant results • Save $3,000 in CPA fees
            </p>
          </div>
        </section>

        {/* Related Articles */}
        <section className="container mx-auto px-4 max-w-4xl py-12">
          <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
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
      </div>

      {/* Email Capture Popup */}
      <EmailCapturePopup />
    </>
  );
}

/**
 * Convert Markdown to HTML (simple implementation)
 * For production, consider using a library like marked or remark
 */
function convertMarkdownToHTML(markdown: string): string {
  return markdown
    // H2 headings
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    // H3 headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    // Bullet lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    // Paragraphs
    .replace(/^(?!<[h|u|l])(.*\S.*)$/gm, '<p>$1</p>')
    // Clean up
    .replace(/<\/ul>\n<ul>/g, '')
    .replace(/<\/p>\n<p>/g, '</p><p>');
}
