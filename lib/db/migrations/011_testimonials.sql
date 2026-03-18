-- Testimonials table for customer success stories
CREATE TABLE IF NOT EXISTS testimonials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT,
  company TEXT,
  location TEXT,
  photo_url TEXT,
  testimonial_text TEXT NOT NULL,
  savings_amount INTEGER,
  rating INTEGER DEFAULT 5 CHECK(rating >= 1 AND rating <= 5),
  video_url TEXT,
  approved BOOLEAN DEFAULT 0,
  featured BOOLEAN DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE SET NULL
);

-- Testimonial requests tracking
CREATE TABLE IF NOT EXISTS testimonial_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'sent', 'responded', 'declined')),
  sent_at INTEGER,
  responded_at INTEGER,
  reminder_sent_at INTEGER,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(approved);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(featured);
CREATE INDEX IF NOT EXISTS idx_testimonial_requests_status ON testimonial_requests(status);
CREATE INDEX IF NOT EXISTS idx_testimonial_requests_user_id ON testimonial_requests(user_id);
