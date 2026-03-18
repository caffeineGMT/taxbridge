-- Reddit Organic Growth Tracking Schema

-- Track monitored keywords and target subreddits
CREATE TABLE IF NOT EXISTS reddit_keywords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  keyword TEXT NOT NULL,
  subreddit TEXT NOT NULL,
  active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(keyword, subreddit)
);

-- Track Reddit posts we've monitored
CREATE TABLE IF NOT EXISTS reddit_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reddit_id TEXT NOT NULL UNIQUE,
  subreddit TEXT NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  url TEXT,
  permalink TEXT,
  matched_keywords TEXT, -- JSON array of matched keywords
  created_utc INTEGER,
  discovered_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Track our comments/replies
CREATE TABLE IF NOT EXISTS reddit_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  comment_id TEXT UNIQUE,
  post_id TEXT NOT NULL,
  parent_reddit_id TEXT NOT NULL,
  subreddit TEXT NOT NULL,
  content TEXT NOT NULL,
  include_link BOOLEAN DEFAULT 0,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, posted, rejected
  posted_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_reddit_id) REFERENCES reddit_posts(reddit_id)
);

-- Track engagement metrics
CREATE TABLE IF NOT EXISTS reddit_comment_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  comment_id TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  signups INTEGER DEFAULT 0,
  last_checked DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (comment_id) REFERENCES reddit_comments(comment_id)
);

-- Track karma and account health
CREATE TABLE IF NOT EXISTS reddit_account_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_name TEXT NOT NULL,
  karma INTEGER DEFAULT 0,
  comment_karma INTEGER DEFAULT 0,
  link_karma INTEGER DEFAULT 0,
  account_age_days INTEGER,
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Track quarterly "Ultimate Guide" posts
CREATE TABLE IF NOT EXISTS reddit_ultimate_guides (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subreddit TEXT NOT NULL,
  post_id TEXT UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  infographic_url TEXT,
  target_upvotes INTEGER DEFAULT 50,
  target_clicks INTEGER DEFAULT 500,
  target_signups INTEGER DEFAULT 25,
  actual_upvotes INTEGER DEFAULT 0,
  actual_clicks INTEGER DEFAULT 0,
  actual_signups INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft', -- draft, scheduled, posted
  scheduled_for DATETIME,
  posted_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reddit_posts_discovered ON reddit_posts(discovered_at);
CREATE INDEX IF NOT EXISTS idx_reddit_posts_subreddit ON reddit_posts(subreddit);
CREATE INDEX IF NOT EXISTS idx_reddit_comments_status ON reddit_comments(status);
CREATE INDEX IF NOT EXISTS idx_reddit_comments_posted ON reddit_comments(posted_at);
CREATE INDEX IF NOT EXISTS idx_keywords_active ON reddit_keywords(active);
