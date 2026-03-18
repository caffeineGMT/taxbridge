/**
 * Blog Content Verification Script
 * Verifies all blog articles are generated and properly formatted
 */

import fs from 'fs';
import path from 'path';
import { ARTICLE_TOPICS } from '../lib/blog/articles';

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

async function verifyBlogContent() {
  console.log('🔍 Verifying blog content...\n');

  const dataDir = path.join(process.cwd(), 'data', 'blog');
  let allValid = true;
  const issues: string[] = [];

  // Check if data directory exists
  if (!fs.existsSync(dataDir)) {
    console.error('❌ Blog data directory does not exist:', dataDir);
    return false;
  }

  // Check index file
  const indexPath = path.join(dataDir, 'articles-index.json');
  if (!fs.existsSync(indexPath)) {
    issues.push('Index file missing: articles-index.json');
    allValid = false;
  }

  // Verify each article
  for (const topic of ARTICLE_TOPICS) {
    const articlePath = path.join(dataDir, `${topic.slug}.json`);

    if (!fs.existsSync(articlePath)) {
      issues.push(`Missing article: ${topic.slug}.json`);
      allValid = false;
      continue;
    }

    try {
      const data = fs.readFileSync(articlePath, 'utf-8');
      const article: BlogArticle = JSON.parse(data);

      // Validate required fields
      const requiredFields = [
        'slug',
        'title',
        'description',
        'content',
        'author',
        'publishedAt',
        'keywords',
        'category',
        'readingTime',
      ];

      for (const field of requiredFields) {
        if (!article[field as keyof BlogArticle]) {
          issues.push(`${topic.slug}: Missing field '${field}'`);
          allValid = false;
        }
      }

      // Check word count
      const wordCount = article.content.split(/\s+/).length;
      if (wordCount < 1200) {
        issues.push(`${topic.slug}: Content too short (${wordCount} words, minimum 1200)`);
        allValid = false;
      } else if (wordCount > 2500) {
        issues.push(`${topic.slug}: Content too long (${wordCount} words, maximum 2500)`);
      }

      // Check for internal links
      const hasCalculatorLink = article.content.includes('/us-canada-tax-calculator');
      if (!hasCalculatorLink) {
        issues.push(`${topic.slug}: Missing internal link to calculator`);
        allValid = false;
      }

      // Check for target keyword
      const hasKeyword = article.content
        .toLowerCase()
        .includes(topic.targetKeyword.toLowerCase());
      if (!hasKeyword) {
        issues.push(`${topic.slug}: Missing target keyword '${topic.targetKeyword}'`);
      }

      console.log(`✅ ${topic.slug} (${wordCount} words, ${article.readingTime} min read)`);
    } catch (error) {
      issues.push(`${topic.slug}: Parse error - ${error}`);
      allValid = false;
      console.log(`❌ ${topic.slug} - Parse error`);
    }
  }

  // Print summary
  console.log('\n📊 VERIFICATION SUMMARY:');
  console.log(`   Total articles: ${ARTICLE_TOPICS.length}`);
  console.log(`   Status: ${allValid ? '✅ All valid' : '❌ Issues found'}`);

  if (issues.length > 0) {
    console.log('\n⚠️  ISSUES:');
    issues.forEach(issue => console.log(`   - ${issue}`));
  }

  // Check publishing schedule
  console.log('\n📅 PUBLISHING SCHEDULE:');
  const indexData = fs.readFileSync(indexPath, 'utf-8');
  const articles: BlogArticle[] = JSON.parse(indexData);

  const publishSchedule = articles
    .sort(
      (a, b) =>
        new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
    )
    .slice(0, 10); // Show first 10

  publishSchedule.forEach((article, index) => {
    const date = new Date(article.publishedAt).toLocaleDateString();
    console.log(`   ${index + 1}. ${date} - ${article.title}`);
  });

  return allValid;
}

async function main() {
  const isValid = await verifyBlogContent();
  process.exit(isValid ? 0 : 1);
}

main();
