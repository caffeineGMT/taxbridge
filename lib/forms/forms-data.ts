/**
 * Tax Forms Data
 * Centralized definitions for all US and Canadian tax forms
 */

export interface TaxForm {
  code: string;
  name: string;
  country: 'US' | 'CA';
  purpose: string;
  deadline: string;
  pdfUrl: string;
}

export const TAX_FORMS: TaxForm[] = [
  // US Forms
  {
    code: 'W2',
    name: 'Form W-2',
    country: 'US',
    purpose: 'Wage and Tax Statement from US employer',
    deadline: 'January 31',
    pdfUrl: 'https://www.irs.gov/pub/irs-pdf/fw2.pdf',
  },
  {
    code: '1040',
    name: 'Form 1040/1040-NR',
    country: 'US',
    purpose: 'US Individual Income Tax Return (residents/non-residents)',
    deadline: 'April 15',
    pdfUrl: 'https://www.irs.gov/pub/irs-pdf/f1040.pdf',
  },
  {
    code: 'FBAR',
    name: 'FinCEN Form 114',
    country: 'US',
    purpose: 'Report of Foreign Bank and Financial Accounts ($10K+ in foreign accounts)',
    deadline: 'April 15 (auto-extension to October 15)',
    pdfUrl: 'https://www.fincen.gov/sites/default/files/shared/FBAR%20Line%20Item%20Filing%20Instructions.pdf',
  },
  {
    code: '8938',
    name: 'Form 8938',
    country: 'US',
    purpose: 'Statement of Specified Foreign Financial Assets',
    deadline: 'April 15',
    pdfUrl: 'https://www.irs.gov/pub/irs-pdf/f8938.pdf',
  },
  {
    code: '8833',
    name: 'Form 8833',
    country: 'US',
    purpose: 'Treaty-Based Return Position Disclosure (claim Article XV benefits)',
    deadline: 'April 15',
    pdfUrl: 'https://www.irs.gov/pub/irs-pdf/f8833.pdf',
  },
  // Canadian Forms
  {
    code: 'T1',
    name: 'T1 General',
    country: 'CA',
    purpose: 'Canadian Income Tax and Benefit Return',
    deadline: 'April 30',
    pdfUrl: 'https://www.canada.ca/en/revenue-agency/services/forms-publications/tax-packages-years/general-income-tax-benefit-package.html',
  },
  {
    code: 'T4',
    name: 'T4 Slip',
    country: 'CA',
    purpose: 'Statement of Remuneration Paid from Canadian source',
    deadline: 'February 28 (issued by employer)',
    pdfUrl: 'https://www.canada.ca/en/revenue-agency/services/forms-publications/forms/t4.html',
  },
];

/**
 * Get forms grouped by country
 */
export function getFormsGroupedByCountry() {
  const usForms = TAX_FORMS.filter(form => form.country === 'US');
  const canadianForms = TAX_FORMS.filter(form => form.country === 'CA');

  return {
    us: usForms,
    canada: canadianForms,
  };
}

/**
 * Get form by code
 */
export function getFormByCode(code: string): TaxForm | undefined {
  return TAX_FORMS.find(form => form.code === code);
}

/**
 * Get deadline urgency status
 * Returns: 'past' | 'urgent' | 'normal'
 */
export function getDeadlineUrgency(deadline: string): 'past' | 'urgent' | 'normal' {
  // For demo purposes, we'll parse common deadline formats
  // In production, you'd want more sophisticated date parsing
  const months: Record<string, number> = {
    'January': 0,
    'February': 1,
    'March': 2,
    'April': 3,
    'May': 4,
    'June': 5,
    'July': 6,
    'August': 7,
    'September': 8,
    'October': 9,
    'November': 10,
    'December': 11,
  };

  // Extract month and day from deadline string (e.g., "April 15")
  const match = deadline.match(/^(\w+)\s+(\d+)/);
  if (!match) return 'normal';

  const [, monthName, dayStr] = match;
  const month = months[monthName];
  const day = parseInt(dayStr, 10);

  if (month === undefined) return 'normal';

  const currentYear = new Date().getFullYear();
  const deadlineDate = new Date(currentYear, month, day);
  const today = new Date();
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'past';
  if (diffDays <= 30) return 'urgent';
  return 'normal';
}
