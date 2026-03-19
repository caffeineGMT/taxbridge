/**
 * Database Layer - Unified SQLite/PostgreSQL Support
 * Automatically uses PostgreSQL if DATABASE_URL is set, otherwise SQLite
 */

import {
  getDatabase as getUnifiedDb,
  query,
  queryOne,
  insert,
  initializeDatabase as initUnifiedDb,
  runMigrations as runUnifiedMigrations,
  closeDatabase as closeUnifiedDb,
  isPostgres,
  isSQLite
} from './unified';

/**
 * Get or create the database instance
 * Returns Pool (PostgreSQL) or SQLite Database based on environment
 */
export function getDatabase() {
  return getUnifiedDb();
}

/**
 * Initialize database schema from schema.sql file
 */
export async function initializeDatabase(): Promise<void> {
  await initUnifiedDb();
}

/**
 * Run database migrations
 */
export async function runMigrations(): Promise<void> {
  await runUnifiedMigrations();
}

/**
 * Close the database connection
 */
export async function closeDatabase(): Promise<void> {
  await closeUnifiedDb();
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
export async function insertRSUEntry(entry: RSUEntryInput): Promise<number> {
  return insert(`
    INSERT INTO rsu_entries (user_id, vest_date, fmv_usd, shares, employer, ticker_symbol)
    VALUES ($1, $2, $3, $4, $5, $6)
  `, [
    entry.user_id,
    entry.vest_date,
    entry.fmv_usd,
    entry.shares,
    entry.employer,
    entry.ticker_symbol || null
  ]);
}

/**
 * Get all RSU entries for a user
 */
export async function getRSUEntries(userId: number): Promise<RSUEntryRow[]> {
  return query<RSUEntryRow>(`
    SELECT * FROM rsu_entries
    WHERE user_id = $1
    ORDER BY vest_date DESC
  `, [userId]);
}

/**
 * Get a single RSU entry by ID
 */
export async function getRSUEntry(id: number): Promise<RSUEntryRow | null> {
  return queryOne<RSUEntryRow>(`
    SELECT * FROM rsu_entries WHERE id = $1
  `, [id]);
}

/**
 * Insert a tax calculation
 */
export async function insertTaxCalculation(calc: TaxCalculationInput): Promise<number> {
  return insert(`
    INSERT INTO tax_calculations (
      rsu_entry_id, user_id, rsu_income_usd, rsu_income_cad, exchange_rate,
      us_federal_tax, us_state_tax, us_total_tax,
      canada_federal_tax, canada_provincial_tax, canada_total_tax,
      ftc_eligible_usd, ftc_claimed_cad, net_tax_payable, effective_tax_rate,
      tax_year, notes
    ) VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8,
      $9, $10, $11,
      $12, $13, $14, $15,
      $16, $17
    )
  `, [
    calc.rsu_entry_id,
    calc.user_id,
    calc.rsu_income_usd,
    calc.rsu_income_cad,
    calc.exchange_rate,
    calc.us_federal_tax,
    calc.us_state_tax,
    calc.us_total_tax,
    calc.canada_federal_tax,
    calc.canada_provincial_tax,
    calc.canada_total_tax,
    calc.ftc_eligible_usd,
    calc.ftc_claimed_cad,
    calc.net_tax_payable,
    calc.effective_tax_rate,
    calc.tax_year,
    calc.notes || null
  ]);
}

/**
 * Get tax calculations for a user
 */
export async function getTaxCalculations(userId: number): Promise<TaxCalculationRow[]> {
  return query<TaxCalculationRow>(`
    SELECT * FROM tax_calculations
    WHERE user_id = $1
    ORDER BY calculation_date DESC
  `, [userId]);
}

/**
 * Get tax calculations for a specific RSU entry
 */
export async function getTaxCalculationsByRSUEntry(rsuEntryId: number): Promise<TaxCalculationRow[]> {
  return query<TaxCalculationRow>(`
    SELECT * FROM tax_calculations
    WHERE rsu_entry_id = $1
    ORDER BY calculation_date DESC
  `, [rsuEntryId]);
}

/**
 * Create or update a user profile
 */
export async function upsertUserProfile(profile: UserProfileInput & { id?: number }): Promise<number> {
  if (profile.id) {
    // Update existing profile
    await query(`
      UPDATE user_profiles
      SET email = COALESCE($1, email),
          first_name = COALESCE($2, first_name),
          last_name = COALESCE($3, last_name),
          us_state = COALESCE($4, us_state),
          canada_province = COALESCE($5, canada_province),
          filing_status = COALESCE($6, filing_status),
          updated_at = ${isPostgres ? 'EXTRACT(EPOCH FROM NOW())::BIGINT' : 'unixepoch()'}
      WHERE id = $7
    `, [
      profile.email,
      profile.first_name,
      profile.last_name,
      profile.us_state,
      profile.canada_province,
      profile.filing_status,
      profile.id
    ]);

    return profile.id;
  } else {
    // Insert new profile
    return insert(`
      INSERT INTO user_profiles (email, first_name, last_name, us_state, canada_province, filing_status)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      profile.email,
      profile.first_name,
      profile.last_name,
      profile.us_state,
      profile.canada_province,
      profile.filing_status
    ]);
  }
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(id: number): Promise<UserProfileRow | null> {
  return queryOne<UserProfileRow>(`
    SELECT * FROM user_profiles WHERE id = $1
  `, [id]);
}

/**
 * Get user profile by Clerk user ID
 */
export async function getUserProfileByClerkId(clerkUserId: string): Promise<UserProfileRow | null> {
  return queryOne<UserProfileRow>(`
    SELECT * FROM user_profiles WHERE clerk_user_id = $1
  `, [clerkUserId]);
}

/**
 * Create a new user profile from Clerk webhook
 */
export async function createUserProfile(clerkUserId: string, email?: string): Promise<number> {
  return insert(`
    INSERT INTO user_profiles (clerk_user_id, email, subscription_tier)
    VALUES ($1, $2, 'free')
  `, [clerkUserId, email || null]);
}

/**
 * Update user profile (for onboarding or profile updates)
 */
export async function updateUserProfile(clerkUserId: string, data: Partial<UserProfileInput>): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (data.first_name !== undefined) {
    fields.push(`first_name = $${paramIndex++}`);
    values.push(data.first_name);
  }
  if (data.last_name !== undefined) {
    fields.push(`last_name = $${paramIndex++}`);
    values.push(data.last_name);
  }
  if (data.us_state !== undefined) {
    fields.push(`us_state = $${paramIndex++}`);
    values.push(data.us_state);
  }
  if (data.canada_province !== undefined) {
    fields.push(`canada_province = $${paramIndex++}`);
    values.push(data.canada_province);
  }
  if (data.filing_status !== undefined) {
    fields.push(`filing_status = $${paramIndex++}`);
    values.push(data.filing_status);
  }
  if (data.subscription_tier !== undefined) {
    fields.push(`subscription_tier = $${paramIndex++}`);
    values.push(data.subscription_tier);
  }
  if (data.stripe_customer_id !== undefined) {
    fields.push(`stripe_customer_id = $${paramIndex++}`);
    values.push(data.stripe_customer_id);
  }

  if (fields.length === 0) {
    return;
  }

  fields.push(`updated_at = ${isPostgres ? 'EXTRACT(EPOCH FROM NOW())::BIGINT' : 'unixepoch()'}`);
  values.push(clerkUserId);

  await query(`
    UPDATE user_profiles
    SET ${fields.join(', ')}
    WHERE clerk_user_id = $${paramIndex}
  `, values);
}

/**
 * Get or create a default user (for MVP single-user mode)
 */
export async function getOrCreateDefaultUser(): Promise<UserProfileRow> {
  const rows = await query<UserProfileRow>('SELECT * FROM user_profiles LIMIT 1');

  if (rows.length > 0) {
    return rows[0];
  }

  // Insert new profile directly to avoid upsert logic
  const id = await insert(`
    INSERT INTO user_profiles (email, first_name, last_name, us_state, canada_province, filing_status)
    VALUES ($1, $2, $3, $4, $5, $6)
  `, ['user@example.com', 'Demo', 'User', 'WA', 'BC', 'single']);

  const user = await getUserProfile(id);
  return user!;
}

/**
 * Cache exchange rate
 */
export async function cacheExchangeRate(date: string, rate: number): Promise<void> {
  if (isPostgres) {
    await query(`
      INSERT INTO exchange_rates (rate_date, usd_to_cad)
      VALUES ($1, $2)
      ON CONFLICT (rate_date) DO UPDATE SET usd_to_cad = $2
    `, [date, rate]);
  } else {
    await query(`
      INSERT OR REPLACE INTO exchange_rates (rate_date, usd_to_cad)
      VALUES ($1, $2)
    `, [date, rate]);
  }
}

/**
 * Get cached exchange rate
 */
export async function getCachedExchangeRate(date: string): Promise<number | undefined> {
  const result = await queryOne<{ usd_to_cad: number }>(`
    SELECT usd_to_cad FROM exchange_rates WHERE rate_date = $1
  `, [date]);

  return result?.usd_to_cad;
}

// Export the database instance getter as default
export default getDatabase;

// Alias for compatibility
export const getDb = getDatabase;
