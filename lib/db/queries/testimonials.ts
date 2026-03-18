import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'taxbridge.db');
const db = new Database(dbPath);

export interface Testimonial {
  id: number;
  user_id?: number;
  name: string;
  email: string;
  role?: string;
  company?: string;
  location?: string;
  photo_url?: string;
  testimonial_text: string;
  savings_amount?: number;
  rating: number;
  video_url?: string;
  approved: boolean;
  featured: boolean;
  created_at: number;
  updated_at: number;
}

export interface TestimonialRequest {
  id: number;
  user_id: number;
  email: string;
  status: 'pending' | 'sent' | 'responded' | 'declined';
  sent_at?: number;
  responded_at?: number;
  reminder_sent_at?: number;
  created_at: number;
}

/**
 * Get all approved testimonials
 */
export function getApprovedTestimonials(): Testimonial[] {
  const stmt = db.prepare(`
    SELECT * FROM testimonials
    WHERE approved = 1
    ORDER BY featured DESC, created_at DESC
  `);
  return stmt.all() as Testimonial[];
}

/**
 * Get featured testimonials for homepage
 */
export function getFeaturedTestimonials(limit: number = 3): Testimonial[] {
  const stmt = db.prepare(`
    SELECT * FROM testimonials
    WHERE approved = 1 AND featured = 1
    ORDER BY created_at DESC
    LIMIT ?
  `);
  return stmt.all(limit) as Testimonial[];
}

/**
 * Get all testimonials (admin view)
 */
export function getAllTestimonials(): Testimonial[] {
  const stmt = db.prepare(`
    SELECT * FROM testimonials
    ORDER BY created_at DESC
  `);
  return stmt.all() as Testimonial[];
}

/**
 * Create a new testimonial
 */
export function createTestimonial(data: {
  user_id?: number;
  name: string;
  email: string;
  role?: string;
  company?: string;
  location?: string;
  photo_url?: string;
  testimonial_text: string;
  savings_amount?: number;
  rating?: number;
  video_url?: string;
}): number {
  const stmt = db.prepare(`
    INSERT INTO testimonials (
      user_id, name, email, role, company, location, photo_url,
      testimonial_text, savings_amount, rating, video_url, approved
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `);

  const result = stmt.run(
    data.user_id || null,
    data.name,
    data.email,
    data.role || null,
    data.company || null,
    data.location || null,
    data.photo_url || null,
    data.testimonial_text,
    data.savings_amount || null,
    data.rating || 5,
    data.video_url || null
  );

  return result.lastInsertRowid as number;
}

/**
 * Update testimonial approval status
 */
export function approveTestimonial(id: number, approved: boolean = true): void {
  const stmt = db.prepare(`
    UPDATE testimonials
    SET approved = ?, updated_at = unixepoch()
    WHERE id = ?
  `);
  stmt.run(approved ? 1 : 0, id);
}

/**
 * Set testimonial as featured
 */
export function setFeaturedTestimonial(id: number, featured: boolean = true): void {
  const stmt = db.prepare(`
    UPDATE testimonials
    SET featured = ?, updated_at = unixepoch()
    WHERE id = ?
  `);
  stmt.run(featured ? 1 : 0, id);
}

/**
 * Get paid customers who haven't been asked for testimonial
 */
export function getPaidCustomersForTestimonialRequest(limit: number = 10): any[] {
  const stmt = db.prepare(`
    SELECT
      up.id,
      up.clerk_user_id,
      up.email,
      up.first_name,
      up.subscription_tier,
      up.created_at as signup_date
    FROM user_profiles up
    LEFT JOIN testimonial_requests tr ON up.id = tr.user_id
    WHERE
      up.subscription_tier IN ('pro', 'enterprise')
      AND up.subscription_status = 'active'
      AND up.email IS NOT NULL
      AND tr.id IS NULL
    ORDER BY up.created_at ASC
    LIMIT ?
  `);
  return stmt.all(limit);
}

/**
 * Create testimonial request
 */
export function createTestimonialRequest(userId: number, email: string): number {
  const stmt = db.prepare(`
    INSERT INTO testimonial_requests (user_id, email, status)
    VALUES (?, ?, 'pending')
  `);
  const result = stmt.run(userId, email);
  return result.lastInsertRowid as number;
}

/**
 * Mark testimonial request as sent
 */
export function markTestimonialRequestSent(requestId: number): void {
  const stmt = db.prepare(`
    UPDATE testimonial_requests
    SET status = 'sent', sent_at = unixepoch()
    WHERE id = ?
  `);
  stmt.run(requestId);
}

/**
 * Mark testimonial request as responded
 */
export function markTestimonialRequestResponded(requestId: number): void {
  const stmt = db.prepare(`
    UPDATE testimonial_requests
    SET status = 'responded', responded_at = unixepoch()
    WHERE id = ?
  `);
  stmt.run(requestId);
}

/**
 * Get pending testimonial requests for reminders
 */
export function getPendingTestimonialRequests(daysOld: number = 7): TestimonialRequest[] {
  const cutoffTime = Math.floor(Date.now() / 1000) - (daysOld * 24 * 60 * 60);

  const stmt = db.prepare(`
    SELECT * FROM testimonial_requests
    WHERE
      status = 'sent'
      AND sent_at < ?
      AND (reminder_sent_at IS NULL OR reminder_sent_at < ?)
    ORDER BY sent_at ASC
  `);

  return stmt.all(cutoffTime, cutoffTime) as TestimonialRequest[];
}

/**
 * Mark reminder sent
 */
export function markReminderSent(requestId: number): void {
  const stmt = db.prepare(`
    UPDATE testimonial_requests
    SET reminder_sent_at = unixepoch()
    WHERE id = ?
  `);
  stmt.run(requestId);
}

/**
 * Calculate average savings from testimonials
 */
export function getAverageSavings(): number {
  const stmt = db.prepare(`
    SELECT AVG(savings_amount) as avg_savings
    FROM testimonials
    WHERE approved = 1 AND savings_amount IS NOT NULL
  `);
  const result = stmt.get() as { avg_savings: number | null };
  return Math.round(result.avg_savings || 6200);
}

/**
 * Get testimonial stats for trust badges
 */
export function getTestimonialStats(): {
  totalCount: number;
  averageSavings: number;
  averageRating: number;
  fiveStarCount: number;
} {
  const statsStmt = db.prepare(`
    SELECT
      COUNT(*) as total,
      AVG(savings_amount) as avg_savings,
      AVG(rating) as avg_rating,
      SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star
    FROM testimonials
    WHERE approved = 1
  `);

  const stats = statsStmt.get() as {
    total: number;
    avg_savings: number | null;
    avg_rating: number | null;
    five_star: number;
  };

  return {
    totalCount: stats.total,
    averageSavings: Math.round(stats.avg_savings || 6200),
    averageRating: Number((stats.avg_rating || 5).toFixed(1)),
    fiveStarCount: stats.five_star,
  };
}
