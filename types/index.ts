// Core type definitions for TaxBridge

// Supported employers for RSU tracking
export enum Employer {
  META = 'META',
  AMAZON = 'AMAZON',
  GOOGLE = 'GOOGLE',
  MICROSOFT = 'MICROSOFT',
}

// US states for state tax calculations
export enum USState {
  ALABAMA = 'AL',
  ALASKA = 'AK',
  ARIZONA = 'AZ',
  ARKANSAS = 'AR',
  CALIFORNIA = 'CA',
  COLORADO = 'CO',
  CONNECTICUT = 'CT',
  DELAWARE = 'DE',
  FLORIDA = 'FL',
  GEORGIA = 'GA',
  HAWAII = 'HI',
  IDAHO = 'ID',
  ILLINOIS = 'IL',
  INDIANA = 'IN',
  IOWA = 'IA',
  KANSAS = 'KS',
  KENTUCKY = 'KY',
  LOUISIANA = 'LA',
  MAINE = 'ME',
  MARYLAND = 'MD',
  MASSACHUSETTS = 'MA',
  MICHIGAN = 'MI',
  MINNESOTA = 'MN',
  MISSISSIPPI = 'MS',
  MISSOURI = 'MO',
  MONTANA = 'MT',
  NEBRASKA = 'NE',
  NEVADA = 'NV',
  NEW_HAMPSHIRE = 'NH',
  NEW_JERSEY = 'NJ',
  NEW_MEXICO = 'NM',
  NEW_YORK = 'NY',
  NORTH_CAROLINA = 'NC',
  NORTH_DAKOTA = 'ND',
  OHIO = 'OH',
  OKLAHOMA = 'OK',
  OREGON = 'OR',
  PENNSYLVANIA = 'PA',
  RHODE_ISLAND = 'RI',
  SOUTH_CAROLINA = 'SC',
  SOUTH_DAKOTA = 'SD',
  TENNESSEE = 'TN',
  TEXAS = 'TX',
  UTAH = 'UT',
  VERMONT = 'VT',
  VIRGINIA = 'VA',
  WASHINGTON = 'WA',
  WEST_VIRGINIA = 'WV',
  WISCONSIN = 'WI',
  WYOMING = 'WY',
}

// Canadian provinces for provincial tax calculations
export enum CanadaProvince {
  ALBERTA = 'AB',
  BRITISH_COLUMBIA = 'BC',
  MANITOBA = 'MB',
  NEW_BRUNSWICK = 'NB',
  NEWFOUNDLAND_AND_LABRADOR = 'NL',
  NORTHWEST_TERRITORIES = 'NT',
  NOVA_SCOTIA = 'NS',
  NUNAVUT = 'NU',
  ONTARIO = 'ON',
  PRINCE_EDWARD_ISLAND = 'PE',
  QUEBEC = 'QC',
  SASKATCHEWAN = 'SK',
  YUKON = 'YT',
}

// User profile information
export interface User {
  id: string;
  email: string;
  name: string;
  visaType: 'H1B' | 'TN' | 'L1' | 'OTHER';
  usState?: USState;
  canadaProvince?: CanadaProvince;
  moveToCanadaDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// RSU vesting event
export interface RSUEvent {
  id: string;
  userId: string;
  employer: Employer;
  vestingDate: Date;
  shares: number;
  fairMarketValue: number; // Per share FMV in USD
  totalValue: number; // shares * FMV
  taxWithheld?: number; // Optional: taxes withheld at vesting
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tax calculation result for both countries
export interface TaxCalculation {
  id: string;
  userId: string;
  taxYear: number;

  // US Tax Calculation
  usFederalTax: number;
  usStateTax: number;
  usTotalTax: number;
  usState?: USState;

  // Canada Tax Calculation
  canadaFederalTax: number;
  canadaProvincialTax: number;
  canadaTotalTax: number;
  canadaProvince?: CanadaProvince;

  // Foreign Tax Credit
  foreignTaxCredit: number;
  netTaxOwed: number;
  recommendedFilingOrder: 'US_FIRST' | 'CANADA_FIRST';

  // Income breakdown
  totalRSUIncome: number; // USD
  totalRSUIncomeCAD: number; // CAD
  exchangeRate: number; // USD to CAD rate used

  // Required forms
  requiredForms: string[];

  createdAt: Date;
  updatedAt: Date;
}

// Currency conversion rate (Bank of Canada annual average)
export interface ExchangeRate {
  year: number;
  usdToCad: number;
  source: string;
  lastUpdated: Date;
}

// Tax form requirement
export interface TaxForm {
  formName: string;
  country: 'US' | 'CANADA';
  description: string;
  required: boolean;
  dueDate?: Date;
  instructions?: string;
}
