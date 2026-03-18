/**
 * Employer Helpers Index
 * Central export for all employer-specific utilities
 */

import * as meta from './meta';
import * as amazon from './amazon';
import * as google from './google';
import * as microsoft from './microsoft';

export interface EmployerInfo {
  getTickerSymbol: () => string;
  getTypicalVestingSchedule: () => string;
  formatVestSchedule: (vestingDate: Date) => string;
  getEmployerName: () => string;
  getVestingFrequency: () => string;
  getVestingNotes: () => string;
}

export const employers: Record<string, EmployerInfo> = {
  meta,
  amazon,
  google,
  microsoft,
};

export const SUPPORTED_EMPLOYERS = [
  { value: 'meta', label: 'Meta (Facebook)', ticker: 'META' },
  { value: 'amazon', label: 'Amazon', ticker: 'AMZN' },
  { value: 'google', label: 'Google (Alphabet)', ticker: 'GOOGL' },
  { value: 'microsoft', label: 'Microsoft', ticker: 'MSFT' },
];

export { meta, amazon, google, microsoft };
