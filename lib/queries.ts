import { z } from 'zod';
import { getDb } from './db';

// ============================================================================
// Zod Schemas for Type Safety
// ============================================================================

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  created_at: z.number(),
});

export const CreateUserSchema = z.object({
  email: z.string().email(),
});

export const RsuEventSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  employer: z.string(),
  ticker: z.string(),
  vesting_date: z.string(), // ISO 8601 date string
  shares: z.number().positive(),
  fmv_usd: z.number().positive(),
  total_value_usd: z.number().positive(),
  us_state: z.string().nullable(),
  canada_province: z.string().nullable(),
  created_at: z.number(),
});

export const CreateRsuEventSchema = z.object({
  user_id: z.number(),
  employer: z.string().min(1),
  ticker: z.string().min(1),
  vesting_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  shares: z.number().positive(),
  fmv_usd: z.number().positive(),
  total_value_usd: z.number().positive(),
  us_state: z.string().nullable().optional(),
  canada_province: z.string().nullable().optional(),
});

export const TaxCalculationSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  tax_year: z.number(),
  us_federal_tax: z.number().nullable(),
  us_state_tax: z.number().nullable(),
  canada_federal_tax: z.number().nullable(),
  canada_provincial_tax: z.number().nullable(),
  ftc_amount: z.number().nullable(),
  recommended_filing_order: z.enum(['us_first', 'canada_first']).nullable(),
  created_at: z.number(),
});

export const CreateTaxCalculationSchema = z.object({
  user_id: z.number(),
  tax_year: z.number().min(2000).max(2100),
  us_federal_tax: z.number().nullable().optional(),
  us_state_tax: z.number().nullable().optional(),
  canada_federal_tax: z.number().nullable().optional(),
  canada_provincial_tax: z.number().nullable().optional(),
  ftc_amount: z.number().nullable().optional(),
  recommended_filing_order: z.enum(['us_first', 'canada_first']).nullable().optional(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type RsuEvent = z.infer<typeof RsuEventSchema>;
export type CreateRsuEvent = z.infer<typeof CreateRsuEventSchema>;
export type TaxCalculation = z.infer<typeof TaxCalculationSchema>;
export type CreateTaxCalculation = z.infer<typeof CreateTaxCalculationSchema>;

// ============================================================================
// User Queries
// ============================================================================

export const userQueries = {
  /**
   * Create a new user
   */
  create(data: CreateUser): User {
    const validated = CreateUserSchema.parse(data);
    const db = getDb();

    const stmt = db.prepare(
      `INSERT INTO users (email, created_at) VALUES (?, ?) RETURNING *`
    );

    const result = stmt.get(validated.email, Math.floor(Date.now() / 1000));
    return UserSchema.parse(result);
  },

  /**
   * Find user by ID
   */
  findById(id: number): User | null {
    const db = getDb();
    const stmt = db.prepare(`SELECT * FROM users WHERE id = ?`);
    const result = stmt.get(id);

    if (!result) return null;
    return UserSchema.parse(result);
  },

  /**
   * Find user by email
   */
  findByEmail(email: string): User | null {
    const db = getDb();
    const stmt = db.prepare(`SELECT * FROM users WHERE email = ?`);
    const result = stmt.get(email);

    if (!result) return null;
    return UserSchema.parse(result);
  },

  /**
   * Get all users
   */
  findAll(): User[] {
    const db = getDb();
    const stmt = db.prepare(`SELECT * FROM users ORDER BY created_at DESC`);
    const results = stmt.all();

    return z.array(UserSchema).parse(results);
  },
};

// ============================================================================
// RSU Event Queries
// ============================================================================

export const rsuEventQueries = {
  /**
   * Create a new RSU vesting event
   */
  create(data: CreateRsuEvent): RsuEvent {
    const validated = CreateRsuEventSchema.parse(data);
    const db = getDb();

    const stmt = db.prepare(
      `INSERT INTO rsu_events (
        user_id, employer, ticker, vesting_date, shares, fmv_usd, total_value_usd,
        us_state, canada_province, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
    );

    const result = stmt.get(
      validated.user_id,
      validated.employer,
      validated.ticker,
      validated.vesting_date,
      validated.shares,
      validated.fmv_usd,
      validated.total_value_usd,
      validated.us_state || null,
      validated.canada_province || null,
      Math.floor(Date.now() / 1000)
    );

    return RsuEventSchema.parse(result);
  },

  /**
   * Find RSU events by user ID
   */
  findByUserId(userId: number): RsuEvent[] {
    const db = getDb();
    const stmt = db.prepare(
      `SELECT * FROM rsu_events WHERE user_id = ? ORDER BY vesting_date DESC`
    );
    const results = stmt.all(userId);

    return z.array(RsuEventSchema).parse(results);
  },

  /**
   * Find RSU events by user and year
   */
  findByUserAndYear(userId: number, year: number): RsuEvent[] {
    const db = getDb();
    const stmt = db.prepare(
      `SELECT * FROM rsu_events
       WHERE user_id = ?
       AND vesting_date LIKE ?
       ORDER BY vesting_date ASC`
    );
    const results = stmt.all(userId, `${year}-%`);

    return z.array(RsuEventSchema).parse(results);
  },

  /**
   * Get total RSU value for a user in a given year
   */
  getTotalValueByYear(userId: number, year: number): number {
    const db = getDb();
    const stmt = db.prepare(
      `SELECT COALESCE(SUM(total_value_usd), 0) as total
       FROM rsu_events
       WHERE user_id = ? AND vesting_date LIKE ?`
    );
    const result = stmt.get(userId, `${year}-%`) as { total: number };

    return result.total;
  },

  /**
   * Delete RSU event by ID
   */
  deleteById(id: number): boolean {
    const db = getDb();
    const stmt = db.prepare(`DELETE FROM rsu_events WHERE id = ?`);
    const result = stmt.run(id);

    return result.changes > 0;
  },
};

// ============================================================================
// Tax Calculation Queries
// ============================================================================

export const taxCalculationQueries = {
  /**
   * Create or update tax calculation
   */
  upsert(data: CreateTaxCalculation): TaxCalculation {
    const validated = CreateTaxCalculationSchema.parse(data);
    const db = getDb();

    const stmt = db.prepare(
      `INSERT INTO tax_calculations (
        user_id, tax_year, us_federal_tax, us_state_tax,
        canada_federal_tax, canada_provincial_tax, ftc_amount,
        recommended_filing_order, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, tax_year) DO UPDATE SET
        us_federal_tax = excluded.us_federal_tax,
        us_state_tax = excluded.us_state_tax,
        canada_federal_tax = excluded.canada_federal_tax,
        canada_provincial_tax = excluded.canada_provincial_tax,
        ftc_amount = excluded.ftc_amount,
        recommended_filing_order = excluded.recommended_filing_order
      RETURNING *`
    );

    const result = stmt.get(
      validated.user_id,
      validated.tax_year,
      validated.us_federal_tax || null,
      validated.us_state_tax || null,
      validated.canada_federal_tax || null,
      validated.canada_provincial_tax || null,
      validated.ftc_amount || null,
      validated.recommended_filing_order || null,
      Math.floor(Date.now() / 1000)
    );

    return TaxCalculationSchema.parse(result);
  },

  /**
   * Find tax calculation by user and year
   */
  findByUserAndYear(userId: number, year: number): TaxCalculation | null {
    const db = getDb();
    const stmt = db.prepare(
      `SELECT * FROM tax_calculations WHERE user_id = ? AND tax_year = ?`
    );
    const result = stmt.get(userId, year);

    if (!result) return null;
    return TaxCalculationSchema.parse(result);
  },

  /**
   * Find all tax calculations for a user
   */
  findByUserId(userId: number): TaxCalculation[] {
    const db = getDb();
    const stmt = db.prepare(
      `SELECT * FROM tax_calculations WHERE user_id = ? ORDER BY tax_year DESC`
    );
    const results = stmt.all(userId);

    return z.array(TaxCalculationSchema).parse(results);
  },

  /**
   * Delete tax calculation
   */
  deleteByUserAndYear(userId: number, year: number): boolean {
    const db = getDb();
    const stmt = db.prepare(
      `DELETE FROM tax_calculations WHERE user_id = ? AND tax_year = ?`
    );
    const result = stmt.run(userId, year);

    return result.changes > 0;
  },
};
