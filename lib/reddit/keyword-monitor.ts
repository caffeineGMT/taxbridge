import Database from 'better-sqlite3';
import { getRedditClient } from './config';
import Snoowrap, { Submission } from 'snoowrap';

export interface MonitoredPost {
  redditId: string;
  subreddit: string;
  title: string;
  author: string;
  url: string;
  permalink: string;
  matchedKeywords: string[];
  createdUtc: number;
}

export class RedditKeywordMonitor {
  private db: Database.Database;
  private reddit: Snoowrap;

  constructor() {
    this.db = new Database('data/taxbridge.db');
    this.reddit = getRedditClient();
  }

  async monitorKeywords(): Promise<MonitoredPost[]> {
    console.log('🔍 Starting Reddit keyword monitoring...');

    // Get active keywords from database
    const keywords = this.db
      .prepare('SELECT keyword, subreddit FROM reddit_keywords WHERE active = 1')
      .all() as Array<{ keyword: string; subreddit: string }>;

    const groupedBySubreddit = keywords.reduce((acc, { keyword, subreddit }) => {
      if (!acc[subreddit]) acc[subreddit] = [];
      acc[subreddit].push(keyword.toLowerCase());
      return acc;
    }, {} as Record<string, string[]>);

    const discoveredPosts: MonitoredPost[] = [];

    for (const [subreddit, keywordList] of Object.entries(groupedBySubreddit)) {
      console.log(`\n📍 Checking r/${subreddit} for keywords: ${keywordList.join(', ')}`);

      try {
        // Fetch new posts (last 100)
        const submissions: any = await (this.reddit.getSubreddit(subreddit).getNew({ limit: 100 }) as any);

        for (const post of submissions) {
          const titleLower = post.title.toLowerCase();
          const selfTextLower = (post.selftext || '').toLowerCase();
          const combinedText = `${titleLower} ${selfTextLower}`;

          // Check for keyword matches
          const matchedKeywords = keywordList.filter(
            keyword => combinedText.includes(keyword)
          );

          if (matchedKeywords.length > 0) {
            const postData: MonitoredPost = {
              redditId: post.id,
              subreddit: post.subreddit.display_name,
              title: post.title,
              author: post.author.name,
              url: post.url,
              permalink: `https://reddit.com${post.permalink}`,
              matchedKeywords,
              createdUtc: post.created_utc,
            };

            // Check if we've already seen this post
            const existing = this.db
              .prepare('SELECT id FROM reddit_posts WHERE reddit_id = ?')
              .get(post.id);

            if (!existing) {
              // Save to database
              this.db.prepare(`
                INSERT INTO reddit_posts (
                  reddit_id, subreddit, title, author, url, permalink,
                  matched_keywords, created_utc
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
              `).run(
                postData.redditId,
                postData.subreddit,
                postData.title,
                postData.author,
                postData.url,
                postData.permalink,
                JSON.stringify(postData.matchedKeywords),
                postData.createdUtc
              );

              discoveredPosts.push(postData);
              console.log(`  ✅ NEW: "${post.title}" (matched: ${matchedKeywords.join(', ')})`);
            }
          }
        }
      } catch (error) {
        console.error(`❌ Error monitoring r/${subreddit}:`, error);
      }
    }

    console.log(`\n✅ Monitoring complete. Discovered ${discoveredPosts.length} new relevant posts.`);
    return discoveredPosts;
  }

  getRecentPosts(hours: number = 24): MonitoredPost[] {
    const cutoff = Date.now() / 1000 - (hours * 3600);

    const posts = this.db.prepare(`
      SELECT
        reddit_id as redditId,
        subreddit,
        title,
        author,
        url,
        permalink,
        matched_keywords as matchedKeywordsJson,
        created_utc as createdUtc
      FROM reddit_posts
      WHERE created_utc > ?
      ORDER BY created_utc DESC
    `).all(cutoff) as Array<Omit<MonitoredPost, 'matchedKeywords'> & { matchedKeywordsJson: string }>;

    return posts.map(post => ({
      ...post,
      matchedKeywords: JSON.parse(post.matchedKeywordsJson),
    }));
  }

  close() {
    this.db.close();
  }
}
