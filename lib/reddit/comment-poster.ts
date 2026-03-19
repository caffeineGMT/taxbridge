import Database from 'better-sqlite3';
import { getRedditClient } from './config';
import Snoowrap from 'snoowrap';

export class RedditCommentPoster {
  private db: Database.Database;
  private reddit: Snoowrap;

  constructor() {
    this.db = new Database('data/taxbridge.db');
    this.reddit = getRedditClient();
  }

  async postApprovedComments(): Promise<number> {
    const approvedComments = this.db.prepare(`
      SELECT id, parent_reddit_id, content
      FROM reddit_comments
      WHERE status = 'approved'
      ORDER BY created_at ASC
    `).all() as Array<{
      id: number;
      parent_reddit_id: string;
      content: string;
    }>;

    console.log(`📤 Found ${approvedComments.length} approved comments to post`);

    let posted = 0;

    for (const comment of approvedComments) {
      try {
        console.log(`\n📝 Posting comment on post ${comment.parent_reddit_id}...`);

        // Get the submission to comment on
        const submission: any = await (this.reddit.getSubmission(comment.parent_reddit_id) as any);

        // Post the comment
        const reply: any = await (submission.reply(comment.content) as any);

        // Update database with posted comment ID
        this.db.prepare(`
          UPDATE reddit_comments
          SET
            comment_id = ?,
            status = 'posted',
            posted_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(reply.id, comment.id);

        // Initialize metrics tracking
        this.db.prepare(`
          INSERT INTO reddit_comment_metrics (comment_id, score)
          VALUES (?, 0)
        `).run(reply.id);

        console.log(`   ✅ Posted successfully (comment ID: ${reply.id})`);
        posted++;

        // Rate limiting: wait 10 minutes between comments to avoid spam detection
        if (posted < approvedComments.length) {
          console.log(`   ⏱️  Waiting 10 minutes before next comment (rate limiting)...`);
          await new Promise(resolve => setTimeout(resolve, 10 * 60 * 1000));
        }
      } catch (error) {
        console.error(`   ❌ Error posting comment:`, error);

        // Mark as rejected if posting fails
        this.db.prepare(`
          UPDATE reddit_comments
          SET status = 'rejected'
          WHERE id = ?
        `).run(comment.id);
      }
    }

    console.log(`\n✅ Posted ${posted} comments successfully`);
    return posted;
  }

  async updateMetrics(): Promise<void> {
    const postedComments = this.db.prepare(`
      SELECT comment_id
      FROM reddit_comments
      WHERE status = 'posted' AND comment_id IS NOT NULL
    `).all() as Array<{ comment_id: string }>;

    console.log(`📊 Updating metrics for ${postedComments.length} posted comments...`);

    for (const { comment_id } of postedComments) {
      try {
        const comment: any = await (this.reddit.getComment(comment_id) as any);

        this.db.prepare(`
          UPDATE reddit_comment_metrics
          SET
            upvotes = ?,
            score = ?,
            last_checked = CURRENT_TIMESTAMP
          WHERE comment_id = ?
        `).run(comment.ups, comment.score, comment_id);

        console.log(`  ✅ ${comment_id}: ${comment.score} points`);
      } catch (error) {
        console.error(`  ❌ Error fetching comment ${comment_id}:`, error);
      }
    }

    console.log(`✅ Metrics updated`);
  }

  close() {
    this.db.close();
  }
}
