import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database configuration
const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'taxbridge.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// Singleton database instance
let db: Database.Database | null = null;

/**
 * Get or create the database singleton instance
 */
export function getDatabase(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    // Create database connection
    db = new Database(DB_PATH);

    // Enable foreign keys and WAL mode for better concurrency
    db.pragma('foreign_keys = ON');
    db.pragma('journal_mode = WAL');

    // Graceful shutdown handlers
    const cleanup = () => {
      if (db) {
        db.close();
        db = null;
      }
    };

    process.on('exit', cleanup);
    process.on('SIGINT', () => {
      cleanup();
      process.exit(0);
    });
    process.on('SIGTERM', () => {
      cleanup();
      process.exit(0);
    });
  }

  return db;
}

/**
 * Initialize database schema from schema.sql file
 */
export function initializeDatabase(): void {
  const db = getDatabase();

  // Read and execute schema file
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  db.exec(schema);

  console.log('✓ Database schema initialized successfully');
}

/**
 * Run database migrations (placeholder for future schema versions)
 */
export function runMigrations(): void {
  const db = getDatabase();

  // Create migrations table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Future migrations will be added here
  // Example:
  // const currentVersion = db.prepare('SELECT MAX(version) as version FROM schema_migrations').get() as { version: number | null };
  // if (!currentVersion.version || currentVersion.version < 1) {
  //   db.exec('ALTER TABLE ...');
  //   db.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run(1);
  // }

  console.log('✓ Migrations completed');
}

/**
 * Close the database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

// ============================================================================
// PREPARED STATEMENT HELPERS
// ============================================================================

export interface RSUEntryInput {
  user_id: number;
  vest_date: string;
  fmv_usd: number;
  shares: number;
  employer: 'Meta' | 'Amazon' | 'Google' | 'Microsoft';
  ticker_symbol?: string;
}

export interface RSUEntryRow extends RSUEntryInput {
  id: number;
  total_value_usd: number;
  created_at: string;
  updated_at: string;
}

export interface TaxCalculationInput {
  rsu_entry_id: number;
  user_id: number;
  rsu_income_usd: number;
  rsu_income_cad: number;
  exchange_rate: number;
  us_federal_tax: number;
  us_state_tax: number;
  us_total_tax: number;
  canada_federal_tax: number;
  canada_provincial_tax: number;
  canada_total_tax: number;
  ftc_eligible_usd: number;
  ftc_claimed_cad: number;
  net_tax_payable: number;
  effective_tax_rate: number;
  tax_year: number;
  notes?: string;
}

export interface TaxCalculationRow extends TaxCalculationInput {
  id: number;
  calculation_date: string;
}

export interface UserProfileInput {
  clerk_user_id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  us_state?: string;
  canada_province?: string;
  filing_status?: 'single' | 'married_joint' | 'married_separate' | 'head_of_household';
  subscription_tier?: 'free' | 'pro' | 'enterprise';
  stripe_customer_id?: string;
  trial_ends_at?: number;
}

export interface UserProfileRow {
  id: number;
  clerk_user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  us_state: string | null;
  canada_province: string | null;
  filing_status: string | null;
  subscription_tier: string;
  stripe_customer_id: string | null;
  trial_ends_at: number | null;
  created_at: number;
  updated_at: number;
}

/**
 * Insert a new RSU entry
 */
export function insertRSUEntry(entry: RSUEntryInput): number {
  const db = getDatabase();

  const stmt = db.prepare(`
    INSERT INTO rsu_entries (user_id, vest_date, fmv_usd, shares, employer, ticker_symbol)
    VALUES (@user_id, @vest_date, @fmv_usd, @shares, @employer, @ticker_symbol)
  `);

  const result = stmt.run({
    ...entry,
    ticker_symbol: entry.ticker_symbol || null,
  });

  return result.lastInsertRowid as number;
}

/**
 * Get all RSU entries for a user
 */
export function getRSUEntries(userId: number): RSUEntryRow[] {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT * FROM rsu_entries
    WHERE user_id = ?
    ORDER BY vest_date DESC
  `);

  return stmt.all(userId) as RSUEntryRow[];
}

/**
 * Get a single RSU entry by ID
 */
export function getRSUEntry(id: number): RSUEntryRow | undefined {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT * FROM rsu_entries WHERE id = ?
  `);

  return stmt.get(id) as RSUEntryRow | undefined;
}

/**
 * Insert a tax calculation
 */
export function insertTaxCalculation(calc: TaxCalculationInput): number {
  const db = getDatabase();

  const stmt = db.prepare(`
    INSERT INTO tax_calculations (
      rsu_entry_id, user_id, rsu_income_usd, rsu_income_cad, exchange_rate,
      us_federal_tax, us_state_tax, us_total_tax,
      canada_federal_tax, canada_provincial_tax, canada_total_tax,
      ftc_eligible_usd, ftc_claimed_cad, net_tax_payable, effective_tax_rate,
      tax_year, notes
    ) VALUES (
      @rsu_entry_id, @user_id, @rsu_income_usd, @rsu_income_cad, @exchange_rate,
      @us_federal_tax, @us_state_tax, @us_total_tax,
      @canada_federal_tax, @canada_provincial_tax, @canada_total_tax,
      @ftc_eligible_usd, @ftc_claimed_cad, @net_tax_payable, @effective_tax_rate,
      @tax_year, @notes
    )
  `);

  const result = stmt.run({
    ...calc,
    notes: calc.notes || null,
  });

  return result.lastInsertRowid as number;
}

/**
 * Get tax calculations for a user
 */
export function getTaxCalculations(userId: number): TaxCalculationRow[] {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT * FROM tax_calculations
    WHERE user_id = ?
    ORDER BY calculation_date DESC
  `);

  return stmt.all(userId) as TaxCalculationRow[];
}

/**
 * Get tax calculations for a specific RSU entry
 */
export function getTaxCalculationsByRSUEntry(rsuEntryId: number): TaxCalculationRow[] {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT * FROM tax_calculations
    WHERE rsu_entry_id = ?
    ORDER BY calculation_date DESC
  `);

  return stmt.all(rsuEntryId) as TaxCalculationRow[];
}

/**
 * Create or update a user profile
 */
export function upsertUserProfile(profile: UserProfileInput & { id?: number }): number {
  const db = getDatabase();

  if (profile.id) {
    // Update existing profile
    const stmt = db.prepare(`
      UPDATE user_profiles
      SET email = COALESCE(@email, email),
          first_name = COALESCE(@first_name, first_name),
          last_name = COALESCE(@last_name, last_name),
          us_state = COALESCE(@us_state, us_state),
          canada_province = COALESCE(@canada_province, canada_province),
          filing_status = COALESCE(@filing_status, filing_status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `);

    stmt.run(profile);
    return profile.id;
  } else {
    // Insert new profile
    const stmt = db.prepare(`
      INSERT INTO user_profiles (email, first_name, last_name, us_state, canada_province, filing_status)
      VALUES (@email, @first_name, @last_name, @us_state, @canada_province, @filing_status)
    `);

    const result = stmt.run(profile);
    return result.lastInsertRowid as number;
  }
}

/**
 * Get user profile by ID
 */
export function getUserProfile(id: number): UserProfileRow | undefined {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT * FROM user_profiles WHERE id = ?
  `);

  return stmt.get(id) as UserProfileRow | undefined;
}

/**
 * Get user profile by Clerk user ID
 */
export function getUserProfileByClerkId(clerkUserId: string): UserProfileRow | undefined {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT * FROM user_profiles WHERE clerk_user_id = ?
  `);

  return stmt.get(clerkUserId) as UserProfileRow | undefined;
}

/**
 * Create a new user profile from Clerk webhook
 */
export function createUserProfile(clerkUserId: string, email?: string): number {
  const db = getDatabase();

  const stmt = db.prepare(`
    INSERT INTO user_profiles (clerk_user_id, email, subscription_tier)
    VALUES (?, ?, 'free')
  `);

  const result = stmt.run(clerkUserId, email || null);
  return result.lastInsertRowid as number;
}

/**
 * Update user profile (for onboarding or profile updates)
 */
export function updateUserProfile(clerkUserId: string, data: Partial<UserProfileInput>): void {
  const db = getDatabase();

  const fields: string[] = [];
  const values: any[] = [];

  if (data.first_name !== undefined) {
    fields.push('first_name = ?');
    values.push(data.first_name);
  }
  if (data.last_name !== undefined) {
    fields.push('last_name = ?');
    values.push(data.last_name);
  }
  if (data.us_state !== undefined) {
    fields.push('us_state = ?');
    values.push(data.us_state);
  }
  if (data.canada_province !== undefined) {
    fields.push('canada_province = ?');
    values.push(data.canada_province);
  }
  if (data.filing_status !== undefined) {
    fields.push('filing_status = ?');
    values.push(data.filing_status);
  }
  if (data.subscription_tier !== undefined) {
    fields.push('subscription_tier = ?');
    values.push(data.subscription_tier);
  }
  if (data.stripe_customer_id !== undefined) {
    fields.push('stripe_customer_id = ?');
    values.push(data.stripe_customer_id);
  }

  if (fields.length === 0) {
    return;
  }

  fields.push('updated_at = unixepoch()');
  values.push(clerkUserId);

  const stmt = db.prepare(`
    UPDATE user_profiles
    SET ${fields.join(', ')}
    WHERE clerk_user_id = ?
  `);

  stmt.run(...values);
}

/**
 * Get or create a default user (for MVP single-user mode)
 */
export function getOrCreateDefaultUser(): UserProfileRow {
  const db = getDatabase();

  let user = db.prepare('SELECT * FROM user_profiles LIMIT 1').get() as UserProfileRow | undefined;

  if (!user) {
    // Insert new profile directly to avoid upsert logic
    const stmt = db.prepare(`
      INSERT INTO user_profiles (email, first_name, last_name, us_state, canada_province, filing_status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run('user@example.com', 'Demo', 'User', 'WA', 'BC', 'single');
    user = getUserProfile(result.lastInsertRowid as number);
  }

  return user!;
}

/**
 * Cache exchange rate
 */
export function cacheExchangeRate(date: string, rate: number): void {
  const db = getDatabase();

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO exchange_rates (rate_date, usd_to_cad)
    VALUES (?, ?)
  `);

  stmt.run(date, rate);
}

/**
 * Get cached exchange rate
 */
export function getCachedExchangeRate(date: string): number | undefined {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT usd_to_cad FROM exchange_rates WHERE rate_date = ?
  `);

  const result = stmt.get(date) as { usd_to_cad: number } | undefined;
  return result?.usd_to_cad;
}

// Export the database instance getter as default
export default getDatabase;
