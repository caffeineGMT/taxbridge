import Anthropic from '@anthropic-ai/sdk';
import Database from 'better-sqlite3';
import { buildUTMLink, PRODUCT_URL } from './config';

export interface UltimateGuide {
  id?: number;
  subreddit: string;
  title: string;
  content: string;
  infographicUrl?: string;
  targetUpvotes: number;
  targetClicks: number;
  targetSignups: number;
}

export class UltimateGuideGenerator {
  private anthropic: Anthropic;
  private db: Database.Database;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.db = new Database('data/taxbridge.db');
  }

  async generateGuide(subreddit: string, topic: string): Promise<UltimateGuide> {
    console.log(`📝 Generating Ultimate Guide for r/${subreddit}: "${topic}"`);

    const systemPrompt = `You are a cross-border tax expert creating comprehensive Reddit guides.

Your expertise:
- H-1B and TN visa taxation
- RSU taxation across US-Canada border
- Foreign Tax Credit optimization
- Dual residency scenarios
- Cross-border tax filing requirements

Create a detailed, genuinely helpful guide that:
1. Provides comprehensive, actionable information
2. Uses clear formatting (headers, bullet points, numbered steps)
3. Includes real examples and scenarios
4. Addresses common misconceptions
5. Is 800-1200 words (substantial but readable)
6. Ends with a subtle product mention (ONE sentence at the end)
7. Uses Reddit markdown formatting

The guide should establish you as a trusted expert in the community.`;

    const userPrompt = `Subreddit: r/${subreddit}
Topic: ${topic}

Generate a comprehensive Reddit post with:
- Engaging title (under 100 characters)
- Well-structured content with clear sections
- Practical examples
- Common mistakes to avoid
- Subtle product mention at the very end

Format as:
TITLE: [your title]

CONTENT:
[your markdown-formatted post]

The product mention should be natural, like:
"I built a free calculator that automates this entire process: [link]"`;

    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 3000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    const response = content.text;

    // Parse title and content
    const titleMatch = response.match(/TITLE:\s*(.+)/);
    const contentMatch = response.match(/CONTENT:\s*([\s\S]+)/);

    if (!titleMatch || !contentMatch) {
      throw new Error('Failed to parse generated guide');
    }

    const title = titleMatch[1].trim();
    let guideContent = contentMatch[1].trim();

    // Add UTM tracking to product link
    const utmLink = buildUTMLink(
      PRODUCT_URL,
      'reddit',
      'ultimate_guide',
      subreddit,
      `guide_${Date.now()}`
    );
    guideContent = guideContent.replace('[link]', utmLink);

    const guide: UltimateGuide = {
      subreddit,
      title,
      content: guideContent,
      targetUpvotes: 50,
      targetClicks: 500,
      targetSignups: 25,
    };

    // Save to database
    const result = this.db.prepare(`
      INSERT INTO reddit_ultimate_guides (
        subreddit, title, content, target_upvotes, target_clicks, target_signups, status
      ) VALUES (?, ?, ?, ?, ?, ?, 'draft')
    `).run(
      guide.subreddit,
      guide.title,
      guide.content,
      guide.targetUpvotes,
      guide.targetClicks,
      guide.targetSignups
    );

    guide.id = result.lastInsertRowid as number;

    console.log(`✅ Guide generated and saved (ID: ${guide.id})`);
    console.log(`   Title: "${title}"`);
    console.log(`   Length: ${guideContent.length} characters`);

    return guide;
  }

  getDraftGuides(): UltimateGuide[] {
    return this.db.prepare(`
      SELECT
        id,
        subreddit,
        title,
        content,
        infographic_url as infographicUrl,
        target_upvotes as targetUpvotes,
        target_clicks as targetClicks,
        target_signups as targetSignups
      FROM reddit_ultimate_guides
      WHERE status = 'draft'
      ORDER BY created_at DESC
    `).all() as UltimateGuide[];
  }

  scheduleGuide(guideId: number, scheduledFor: Date): void {
    this.db.prepare(`
      UPDATE reddit_ultimate_guides
      SET
        status = 'scheduled',
        scheduled_for = ?
      WHERE id = ?
    `).run(scheduledFor.toISOString(), guideId);

    console.log(`✅ Guide ${guideId} scheduled for ${scheduledFor.toISOString()}`);
  }

  close() {
    this.db.close();
  }
}
