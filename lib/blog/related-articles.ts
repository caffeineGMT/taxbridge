/**
 * Related Articles Logic
 * Finds related blog articles based on category and keywords
 */

import { ARTICLE_TOPICS, type ArticleMetadata } from './articles';
import fs from 'fs';
import path from 'path';

interface BlogArticle {
  slug: string;
  title: string;
  description: string;
  category: string;
  keywords: string[];
  readingTime: number;
}

/**
 * Get related articles for a given article slug
 * Returns up to 3 related articles based on:
 * 1. Same category
 * 2. Overlapping keywords
 * 3. Popularity/recency
 */
export function getRelatedArticles(currentSlug: string, limit: number = 3): BlogArticle[] {
  const currentArticle = ARTICLE_TOPICS.find(a => a.slug === currentSlug);
  if (!currentArticle) return [];

  // Score each article based on relevance
  const scoredArticles = ARTICLE_TOPICS
    .filter(article => article.slug !== currentSlug)
    .map(article => {
      let score = 0;

      // Same category = +10 points
      if (article.category === currentArticle.category) {
        score += 10;
      }

      // Overlapping keywords = +1 point per match
      const currentKeywords = currentArticle.keywords.map(k => k.toLowerCase());
      const articleKeywords = article.keywords.map(k => k.toLowerCase());
      const overlap = currentKeywords.filter(k => articleKeywords.includes(k)).length;
      score += overlap;

      // Related categories = +5 points
      const relatedCategories: Record<string, string[]> = {
        'RSU Taxation': ['Stock Options', 'Stock Compensation', 'Cross-Border RSU'],
        'Stock Options': ['RSU Taxation', 'Stock Compensation'],
        'Stock Compensation': ['RSU Taxation', 'Stock Options', 'Cross-Border RSU'],
        'TN Visa': ['Cross-Border Tax', 'Tax Planning'],
        'Cross-Border Tax': ['TN Visa', 'Tax Planning', 'Cross-Border RSU'],
        'Tax Filing': ['Tax Planning', 'Tax Compliance'],
        'Tax Planning': ['Cross-Border Tax', 'Tax Filing'],
      };

      if (relatedCategories[currentArticle.category]?.includes(article.category)) {
        score += 5;
      }

      return { article, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // Load full article data
  const dataDir = path.join(process.cwd(), 'data', 'blog');

  return scoredArticles.map(({ article }) => {
    const articlePath = path.join(dataDir, `${article.slug}.json`);

    if (fs.existsSync(articlePath)) {
      const data = JSON.parse(fs.readFileSync(articlePath, 'utf-8'));
      return {
        slug: data.slug,
        title: data.title,
        description: data.description,
        category: data.category,
        keywords: data.keywords,
        readingTime: data.readingTime,
      };
    }

    // Fallback to metadata
    return {
      slug: article.slug,
      title: article.title,
      description: article.description,
      category: article.category,
      keywords: article.keywords,
      readingTime: 7,
    };
  });
}

/**
 * Get popular articles (featured or high-value content)
 */
export function getPopularArticles(limit: number = 5): BlogArticle[] {
  // Priority list of high-value articles
  const prioritySlugs = [
    'h1b-rsu-tax-calculator-2026-guide',
    'tn-visa-stock-options-tax-complete-guide',
    'cross-border-tax-guide-canada-us-2026',
    'h1b-to-canada-rsu-tax-guide-2026',
    'form-8938-vs-fbar-complete-comparison',
    'cross-border-tax-mistakes-avoid',
    'rsu-tax-h1b-reddit-questions-answered',
  ];

  const dataDir = path.join(process.cwd(), 'data', 'blog');

  return prioritySlugs.slice(0, limit).map(slug => {
    const articlePath = path.join(dataDir, `${slug}.json`);
    const metadata = ARTICLE_TOPICS.find(a => a.slug === slug);

    if (fs.existsSync(articlePath)) {
      const data = JSON.parse(fs.readFileSync(articlePath, 'utf-8'));
      return {
        slug: data.slug,
        title: data.title,
        description: data.description,
        category: data.category,
        keywords: data.keywords,
        readingTime: data.readingTime,
      };
    }

    // Fallback to metadata
    return {
      slug: slug,
      title: metadata?.title || '',
      description: metadata?.description || '',
      category: metadata?.category || '',
      keywords: metadata?.keywords || [],
      readingTime: 7,
    };
  });
}

/**
 * Get articles by category
 */
export function getArticlesByCategory(category: string, limit?: number): BlogArticle[] {
  const articles = ARTICLE_TOPICS
    .filter(a => a.category === category)
    .slice(0, limit);

  const dataDir = path.join(process.cwd(), 'data', 'blog');

  return articles.map(article => {
    const articlePath = path.join(dataDir, `${article.slug}.json`);

    if (fs.existsSync(articlePath)) {
      const data = JSON.parse(fs.readFileSync(articlePath, 'utf-8'));
      return {
        slug: data.slug,
        title: data.title,
        description: data.description,
        category: data.category,
        keywords: data.keywords,
        readingTime: data.readingTime,
      };
    }

    return {
      slug: article.slug,
      title: article.title,
      description: article.description,
      category: article.category,
      keywords: article.keywords,
      readingTime: 7,
    };
  });
}
