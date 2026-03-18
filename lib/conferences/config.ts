export interface ConferenceConfig {
  id: string;
  name: string;
  shortName: string;
  location: string;
  date: string;
  dateRange: string;
  boothCost: number;
  discountCode: string;
  discountPercent: number;
  discountExpiryDays: number;
  refParam: string;
  signupUrl: string;
  description: string;
  audience: string[];
  expectedContacts: number;
  conversionTarget: number;
  revenuePerConversion: number;
}

export const CONFERENCES: ConferenceConfig[] = [
  {
    id: 'aila-wc-2026',
    name: 'AILA West Coast Chapter Conference 2026',
    shortName: 'AILA West Coast',
    location: 'San Francisco, CA',
    date: '2026-04-15',
    dateRange: 'April 15-17, 2026',
    boothCost: 2000,
    discountCode: 'AILA-WC2026',
    discountPercent: 25,
    discountExpiryDays: 14,
    refParam: 'aila-wc2026',
    signupUrl: '/signup?ref=aila-wc2026',
    description: 'West Coast immigration law conference bringing together attorneys specializing in business immigration, H-1B visas, and cross-border tax issues.',
    audience: ['Immigration Lawyers', 'Cross-Border CPAs', 'HR/Benefits Teams'],
    expectedContacts: 200,
    conversionTarget: 20,
    revenuePerConversion: 2000,
  },
  {
    id: 'cba-2026',
    name: 'CBA Immigration Law Conference 2026',
    shortName: 'CBA Immigration',
    location: 'Toronto, ON',
    date: '2026-05-20',
    dateRange: 'May 20-22, 2026',
    boothCost: 3000,
    discountCode: 'CBA2026',
    discountPercent: 25,
    discountExpiryDays: 14,
    refParam: 'cba2026',
    signupUrl: '/signup?ref=cba2026',
    description: 'Canadian Bar Association immigration conference - premier event for Canadian immigration practitioners and cross-border specialists.',
    audience: ['Canadian Immigration Lawyers', 'Cross-Border CPAs', 'TN Visa Specialists'],
    expectedContacts: 200,
    conversionTarget: 20,
    revenuePerConversion: 2000,
  },
  {
    id: 'aila-2026',
    name: 'AILA Annual Conference on Immigration Law 2026',
    shortName: 'AILA Annual',
    location: 'Washington, DC',
    date: '2026-06-10',
    dateRange: 'June 10-13, 2026',
    boothCost: 5000,
    discountCode: 'AILA2026',
    discountPercent: 25,
    discountExpiryDays: 14,
    refParam: 'aila2026',
    signupUrl: '/signup?ref=aila2026',
    description: 'The largest immigration law conference in the US. 5,000+ attendees including immigration attorneys, government officials, and industry partners.',
    audience: ['Immigration Lawyers', 'Cross-Border CPAs', 'Government Officials', 'HR/Benefits Teams'],
    expectedContacts: 200,
    conversionTarget: 20,
    revenuePerConversion: 2000,
  },
];

export function getConferenceById(id: string): ConferenceConfig | undefined {
  return CONFERENCES.find(c => c.id === id);
}

export function getConferenceByRef(ref: string): ConferenceConfig | undefined {
  return CONFERENCES.find(c => c.refParam === ref);
}

export function getConferenceByDiscountCode(code: string): ConferenceConfig | undefined {
  return CONFERENCES.find(c => c.discountCode.toUpperCase() === code.toUpperCase());
}

export function getUpcomingConferences(): ConferenceConfig[] {
  const now = new Date();
  return CONFERENCES.filter(c => new Date(c.date) > now).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

export function isDiscountCodeValid(code: string): { valid: boolean; conference?: ConferenceConfig; reason?: string } {
  const conference = getConferenceByDiscountCode(code);
  if (!conference) {
    return { valid: false, reason: 'Invalid discount code' };
  }

  const conferenceDate = new Date(conference.date);
  const expiryDate = new Date(conferenceDate);
  expiryDate.setDate(expiryDate.getDate() + conference.discountExpiryDays);

  const now = new Date();
  if (now > expiryDate) {
    return { valid: false, conference, reason: 'Discount code has expired' };
  }

  return { valid: true, conference };
}
