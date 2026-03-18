/**
 * AI Blog Content Generation Script
 * Generates 20 SEO-optimized articles using Claude API
 */

import Anthropic from '@anthropic-ai/sdk';
import { ARTICLE_TOPICS, type ArticleMetadata } from '../lib/blog/articles';
import fs from 'fs';
import path from 'path';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GeneratedArticle {
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
  featured: boolean;
}

/**
 * Generate article content using Claude API
 */
async function generateArticleContent(metadata: ArticleMetadata): Promise<string> {
  console.log(`\n🤖 Generating content for: ${metadata.title}`);

  const prompt = `You are a senior cross-border tax expert writing for TaxBridge, a US-Canada tax calculator for H-1B/TN workers with RSUs.

Write a comprehensive, SEO-optimized blog article with the following specifications:

TITLE: ${metadata.title}
TARGET KEYWORD: ${metadata.targetKeyword}
DESCRIPTION: ${metadata.description}
CATEGORY: ${metadata.category}

REQUIREMENTS:
- Length: 1,500-1,800 words
- Tone: Professional but approachable, like a knowledgeable CPA explaining to a tech worker
- Structure: Use H2 and H3 headings for SEO (## and ###)
- Include 2-3 internal links to /us-canada-tax-calculator naturally within the content
- Include practical examples with dollar amounts
- Add actionable takeaways
- Use short paragraphs (2-3 sentences max)
- Include a "Key Takeaways" section at the start
- End with a strong CTA directing to the calculator

SEO OPTIMIZATION:
- Use the target keyword "${metadata.targetKeyword}" naturally 3-5 times
- Include semantic variations and related keywords: ${metadata.keywords.join(', ')}
- Front-load important keywords in the first 100 words
- Use the target keyword in at least one H2 heading

INTERNAL LINKING (must include 2-3 of these):
- "Try our [free US-Canada tax calculator](/us-canada-tax-calculator) to see your exact tax liability"
- "Calculate your cross-border tax obligation with our [RSU tax calculator](/us-canada-tax-calculator)"
- "Use our [free calculator](/us-canada-tax-calculator) to estimate your dual-country tax bill"

CONTENT STYLE:
- Start with a relatable problem/scenario
- Use bullet points for complex information
- Include "Pro Tip" callouts
- Add real-world examples from Meta, Google, Amazon, Microsoft employees
- Mention specific dollar amounts ($3K CPA fees, $12K tax savings, etc.)
- Address pain points: complexity, cost, time spent

FORMAT:
Return ONLY the article content in Markdown format. Do NOT include the title (it will be added separately).
Start directly with the Key Takeaways section.

Begin the article now:`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    temperature: 0.7,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  const content = message.content[0].type === 'text' ? message.content[0].text : '';
  console.log(`✅ Generated ${content.length} characters`);

  return content;
}

/**
 * Calculate reading time (words per minute)
 */
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Generate all articles
 */
async function generateAllArticles() {
  console.log('🚀 Starting blog content generation...');
  console.log(`📝 Generating ${ARTICLE_TOPICS.length} articles\n`);

  const articles: GeneratedArticle[] = [];
  const dataDir = path.join(process.cwd(), 'data', 'blog');

  // Create data directory if it doesn't exist
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Generate articles with rate limiting (avoid API throttling)
  for (let i = 0; i < ARTICLE_TOPICS.length; i++) {
    const metadata = ARTICLE_TOPICS[i];

    try {
      const content = await generateArticleContent(metadata);

      const article: GeneratedArticle = {
        slug: metadata.slug,
        title: metadata.title,
        description: metadata.description,
        content: content,
        author: 'TaxBridge Editorial Team',
        publishedAt: getPublishDate(i), // Stagger publish dates
        updatedAt: new Date().toISOString(),
        keywords: metadata.keywords,
        category: metadata.category,
        readingTime: calculateReadingTime(content),
        featured: i < 3, // First 3 articles are featured
      };

      articles.push(article);

      // Save individual article
      const articlePath = path.join(dataDir, `${article.slug}.json`);
      fs.writeFileSync(articlePath, JSON.stringify(article, null, 2));

      console.log(`💾 Saved: ${articlePath}`);

      // Rate limiting: wait 2 seconds between requests
      if (i < ARTICLE_TOPICS.length - 1) {
        console.log('⏳ Waiting 2s before next request...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (error) {
      console.error(`❌ Error generating article ${metadata.slug}:`, error);
      // Continue with next article
    }
  }

  // Save all articles index
  const indexPath = path.join(dataDir, 'articles-index.json');
  fs.writeFileSync(indexPath, JSON.stringify(articles, null, 2));
  console.log(`\n✅ Generated ${articles.length} articles`);
  console.log(`📦 Saved to: ${dataDir}`);
  console.log(`📋 Index: ${indexPath}`);

  // Generate statistics
  const totalWords = articles.reduce((sum, a) => sum + a.content.split(/\s+/).length, 0);
  const avgWords = Math.round(totalWords / articles.length);
  const totalReadingTime = articles.reduce((sum, a) => sum + a.readingTime, 0);

  console.log('\n📊 STATISTICS:');
  console.log(`   Total articles: ${articles.length}`);
  console.log(`   Total words: ${totalWords.toLocaleString()}`);
  console.log(`   Average words/article: ${avgWords.toLocaleString()}`);
  console.log(`   Total reading time: ${totalReadingTime} minutes`);
  console.log(`   Featured articles: ${articles.filter(a => a.featured).length}`);

  return articles;
}

/**
 * Get staggered publish dates (2 articles per week over 10 weeks)
 */
function getPublishDate(index: number): string {
  const startDate = new Date('2026-03-18'); // Today
  const weeksOffset = Math.floor(index / 2); // 2 articles per week
  const daysOffset = (index % 2) * 3; // Tuesday and Friday

  const publishDate = new Date(startDate);
  publishDate.setDate(publishDate.getDate() + (weeksOffset * 7) + daysOffset);

  return publishDate.toISOString();
}

/**
 * Main execution
 */
async function main() {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }

    await generateAllArticles();

    console.log('\n🎉 Blog content generation complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Review generated articles in data/blog/');
    console.log('   2. Deploy to production');
    console.log('   3. Submit sitemap to Google Search Console');
    console.log('   4. Start 2 articles/week publishing schedule');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
