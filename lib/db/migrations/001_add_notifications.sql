-- Add notifications table for in-app notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('deadline', 'ftc_opportunity', 'new_feature', 'renewal')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- Add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

-- Add notification preferences to user_profiles
ALTER TABLE user_profiles ADD COLUMN email_notifications_enabled BOOLEAN DEFAULT 1;
ALTER TABLE user_profiles ADD COLUMN in_app_notifications_enabled BOOLEAN DEFAULT 1;
ALTER TABLE user_profiles ADD COLUMN sms_notifications_enabled BOOLEAN DEFAULT 0;
