/**
 * TaxBridge Domain Models
 * Core TypeScript interfaces and enums for US-Canada cross-border tax calculations
 */

import { z } from 'zod';

/**
 * Employer options for RSU grants
 */
export enum Employer {
  Meta = 'Meta',
  Amazon = 'Amazon',
  Google = 'Google',
  Microsoft = 'Microsoft'
}

/**
 * Canadian provinces
 */
export enum Province {
  BC = 'BC',
  ON = 'ON',
  AB = 'AB',
  QC = 'QC'
}

/**
 * US states (including NONE for workers who never worked in the US)
 */
export enum State {
  WA = 'WA',
  CA = 'CA',
  NY = 'NY',
  TX = 'TX',
  NONE = 'NONE'
}

/**
 * US tax filing status
 */
export enum FilingStatus {
  Single = 'Single',
  MarriedFilingJointly = 'MarriedFilingJointly',
  MarriedFilingSeparately = 'MarriedFilingSeparately',
  HeadOfHousehold = 'HeadOfHousehold'
}

/**
 * RSU vesting entry
 * Represents a single RSU vesting event with date, FMV, and employer info
 */
export interface RSUEntry {
  id?: number;
  userId: number;
  vestDate: string; // ISO 8601 date string (YYYY-MM-DD)
  fmvUsd: number; // Fair market value per share in USD
  shares: number; // Number of shares vested
  employer: Employer;
  createdAt?: string; // ISO 8601 timestamp
}

/**
 * Tax calculation result
 * Dual-country tax calculation with Foreign Tax Credit optimization
 */
export interface TaxCalculation {
  id?: number;
  rsuEntryId: number;
  usFederalTax: number; // US federal income tax on RSU income
  usStateTax: number; // US state income tax (0 for WA/TX)
  caFederalTax: number; // Canada federal income tax
  caProvincialTax: number; // Canada provincial income tax
  ftcAmount: number; // Foreign Tax Credit amount to avoid double taxation
  createdAt?: string; // ISO 8601 timestamp
}

/**
 * User profile
 * Stores user's tax residency and filing information
 */
export interface UserProfile {
  id?: number;
  name: string;
  province: Province; // Canadian province of residence
  state: State | null; // US state where RSUs were earned (null if NONE)
  filingStatus: FilingStatus; // US tax filing status
}

// Zod schema for RSU events (for form validation)
export const RSUEventSchema = z.object({
  id: z.string().optional(),
  employer: z.string().min(1, 'Employer required'),
  tickerSymbol: z.string().min(1, 'Ticker symbol required').max(10),
  vestingDate: z.string(),
  shares: z.number().positive('Shares must be positive').max(1000000),
  fmvUsd: z.number().positive('FMV must be positive').max(100000),
  totalValueUsd: z.number(),
  usState: z.string().min(2).max(2),
  canadaProvince: z.enum(['BC', 'ON', 'AB', 'QC', 'MB', 'SK', 'NS', 'NB', 'PE', 'NL', 'YT', 'NT', 'NU']),
  createdAt: z.string().optional(),
});

export type RSUEventZod = z.infer<typeof RSUEventSchema>;

export interface RSUEventRow {
  id: string;
  employer: string;
  ticker_symbol: string;
  vesting_date: string;
  shares: number;
  fmv_usd: number;
  total_value_usd: number;
  us_state: string;
  canada_province: string;
  created_at: string;
}
