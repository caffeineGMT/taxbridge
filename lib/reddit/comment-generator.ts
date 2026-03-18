import Anthropic from '@anthropic-ai/sdk';
import Database from 'better-sqlite3';
import { buildUTMLink, PRODUCT_URL } from './config';

export interface CommentDraft {
  postId: string;
  subreddit: string;
  content: string;
  includeLink: boolean;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
}

export class RedditCommentGenerator {
  private anthropic: Anthropic;
  private db: Database.Database;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.db = new Database('data/taxbridge.db');
  }

  async generateComment(
    postTitle: string,
    postContent: string,
    subreddit: string,
    includeProductMention: boolean = false
  ): Promise<string> {
    const systemPrompt = `You are a cross-border tax expert helping people on Reddit with genuine, helpful advice.

Your expertise:
- H-1B and TN visa tax implications
- RSU taxation in US and Canada
- Cross-border tax filing requirements
- Foreign Tax Credit optimization
- Dual residency scenarios

Guidelines:
1. Be genuinely helpful - focus on education, not selling
2. Use simple, clear language (not legalese)
3. If including a product mention, make it natural and subtle
4. Never be promotional or spammy
5. Show expertise through specific, actionable advice
6. Keep responses under 200 words for readability
7. Use Reddit-appropriate tone (friendly, direct, helpful)
8. Always recommend consulting a CPA for complex situations

${includeProductMention ? `
When mentioning the TaxBridge calculator, be subtle:
- "I built a calculator for this exact situation: [link]"
- "There's a free calculator that handles this scenario: [link]"
- "I've used this tool for similar situations: [link]"
- "Check out TaxBridge - it automates this calculation: [link]"
` : ''}`;

    const userPrompt = `Post: "${postTitle}"
${postContent ? `\nDetails: ${postContent}` : ''}

Subreddit: r/${subreddit}

Generate a helpful comment that:
1. Addresses their specific situation
2. Provides actionable tax guidance
3. ${includeProductMention ? 'Includes ONE subtle product mention at the end' : 'Does NOT mention any products'}

Your response should be ONLY the comment text, ready to post.`;

    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
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

    return content.text;
  }

  async createCommentDrafts(redditPostIds: string[]): Promise<CommentDraft[]> {
    const drafts: CommentDraft[] = [];

    for (const redditId of redditPostIds) {
      const post = this.db.prepare(`
        SELECT reddit_id, subreddit, title, url, permalink
        FROM reddit_posts
        WHERE reddit_id = ?
      `).get(redditId) as {
        reddit_id: string;
        subreddit: string;
        title: string;
        url: string;
        permalink: string;
      } | undefined;

      if (!post) {
        console.log(`⚠️  Post ${redditId} not found in database`);
        continue;
      }

      // Fetch full post content from Reddit to get selftext
      // For now, generate based on title only
      const postContent = ''; // TODO: Fetch from Reddit API if needed

      // Decide whether to include link (50% chance for natural distribution)
      const includeLink = Math.random() > 0.5;

      console.log(`\n🤖 Generating comment for: "${post.title}"`);
      console.log(`   Include link: ${includeLink ? 'YES' : 'NO'}`);

      const commentText = await this.generateComment(
        post.title,
        postContent,
        post.subreddit,
        includeLink
      );

      // Add UTM tracking to any links in the comment
      let finalComment = commentText;
      if (includeLink) {
        const utmLink = buildUTMLink(
          PRODUCT_URL,
          'reddit',
          'organic_comment',
          post.subreddit,
          post.reddit_id
        );
        finalComment = commentText.replace('[link]', utmLink);
      }

      const draft: CommentDraft = {
        postId: post.reddit_id,
        subreddit: post.subreddit,
        content: finalComment,
        includeLink,
        utmSource: 'reddit',
        utmMedium: 'organic_comment',
        utmCampaign: post.subreddit,
      };

      // Save draft to database for human review
      this.db.prepare(`
        INSERT INTO reddit_comments (
          post_id, parent_reddit_id, subreddit, content,
          include_link, utm_source, utm_medium, utm_campaign, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `).run(
        null, // comment_id (null until posted)
        post.reddit_id,
        post.subreddit,
        finalComment,
        includeLink ? 1 : 0,
        'reddit',
        'organic_comment',
        post.subreddit
      );

      drafts.push(draft);
      console.log(`   ✅ Draft saved for review`);
    }

    return drafts;
  }

  getPendingDrafts(): Array<{
    id: number;
    postId: string;
    subreddit: string;
    content: string;
    includeLink: boolean;
  }> {
    return this.db.prepare(`
      SELECT
        id,
        parent_reddit_id as postId,
        subreddit,
        content,
        include_link as includeLink
      FROM reddit_comments
      WHERE status = 'pending'
      ORDER BY created_at DESC
    `).all() as any[];
  }

  approveComment(commentId: number): void {
    this.db.prepare(`
      UPDATE reddit_comments
      SET status = 'approved'
      WHERE id = ?
    `).run(commentId);
  }

  rejectComment(commentId: number): void {
    this.db.prepare(`
      UPDATE reddit_comments
      SET status = 'rejected'
      WHERE id = ?
    `).run(commentId);
  }

  close() {
    this.db.close();
  }
}
