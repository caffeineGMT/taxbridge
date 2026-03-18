export interface USState {
  code: string;
  name: string;
  taxRate: number; // Top marginal rate
  details: string;
}

export interface Province {
  code: string;
  name: string;
  taxRate: number; // Top marginal rate
  details: string;
}

export interface Employer {
  name: string;
  slug: string;
  primaryState: string;
  headquarters: string;
}

export const US_STATES: Record<string, USState> = {
  WA: {
    code: 'WA',
    name: 'Washington',
    taxRate: 0,
    details: 'No state income tax',
  },
  CA: {
    code: 'CA',
    name: 'California',
    taxRate: 13.3,
    details: 'Top rate of 13.3% for high earners',
  },
  NY: {
    code: 'NY',
    name: 'New York',
    taxRate: 10.9,
    details: 'Top rate of 10.9% for high earners',
  },
  TX: {
    code: 'TX',
    name: 'Texas',
    taxRate: 0,
    details: 'No state income tax',
  },
  MA: {
    code: 'MA',
    name: 'Massachusetts',
    taxRate: 5.0,
    details: 'Flat 5% state income tax rate',
  },
};

export const PROVINCES: Record<string, Province> = {
  BC: {
    code: 'BC',
    name: 'British Columbia',
    taxRate: 20.5,
    details: 'Top provincial rate of 20.5% on income over $240,716',
  },
  ON: {
    code: 'ON',
    name: 'Ontario',
    taxRate: 13.16,
    details: 'Top provincial rate of 13.16% on income over $220,000',
  },
  AB: {
    code: 'AB',
    name: 'Alberta',
    taxRate: 15.0,
    details: 'Top provincial rate of 15% on income over $355,845',
  },
  QC: {
    code: 'QC',
    name: 'Quebec',
    taxRate: 25.75,
    details: 'Top provincial rate of 25.75% on income over $119,910',
  },
  MB: {
    code: 'MB',
    name: 'Manitoba',
    taxRate: 17.4,
    details: 'Top provincial rate of 17.4% on income over $79,625',
  },
};

export const EMPLOYERS: Employer[] = [
  {
    name: 'Meta',
    slug: 'meta',
    primaryState: 'CA',
    headquarters: 'Menlo Park, California',
  },
  {
    name: 'Amazon',
    slug: 'amazon',
    primaryState: 'WA',
    headquarters: 'Seattle, Washington',
  },
  {
    name: 'Google',
    slug: 'google',
    primaryState: 'CA',
    headquarters: 'Mountain View, California',
  },
  {
    name: 'Microsoft',
    slug: 'microsoft',
    primaryState: 'WA',
    headquarters: 'Redmond, Washington',
  },
  {
    name: 'Apple',
    slug: 'apple',
    primaryState: 'CA',
    headquarters: 'Cupertino, California',
  },
];

// Generate all page combinations
export function generateAllPageParams() {
  const params: Array<{ state: string; province: string; employer?: string }> = [];

  // Core geo pages: 5 states × 5 provinces = 25 pages
  Object.keys(US_STATES).forEach(state => {
    Object.keys(PROVINCES).forEach(province => {
      params.push({ state, province });
    });
  });

  // Employer-specific pages: 5 employers × 5 provinces = 25 pages
  EMPLOYERS.forEach(employer => {
    Object.keys(PROVINCES).forEach(province => {
      params.push({
        state: employer.primaryState,
        province,
        employer: employer.slug,
      });
    });
  });

  return params;
}

// Get metadata for a specific page
export function getPageMetadata(state: string, province: string, employer?: string) {
  const stateData = US_STATES[state];
  const provinceData = PROVINCES[province];
  const employerData = employer ? EMPLOYERS.find(e => e.slug === employer) : null;

  if (!stateData || !provinceData) {
    return null;
  }

  const baseTitle = employerData
    ? `${employerData.name} RSU Tax Calculator: ${stateData.name} to ${provinceData.name}`
    : `H-1B RSU Tax Calculator: ${stateData.name} to ${provinceData.name}`;

  const description = employerData
    ? `Calculate ${employerData.name} RSU taxes when moving from ${stateData.name} to ${provinceData.name}. ${stateData.name} tax: ${stateData.taxRate}%, ${provinceData.name} tax: ${provinceData.taxRate}%. Free Foreign Tax Credit optimizer.`
    : `Calculate H-1B/TN RSU taxes when moving from ${stateData.name} to ${provinceData.name}. ${stateData.name} tax: ${stateData.taxRate}%, ${provinceData.name} tax: ${provinceData.taxRate}%. Includes Foreign Tax Credit optimizer and dual-country filing guidance.`;

  return {
    title: baseTitle,
    description,
    stateData,
    provinceData,
    employerData,
  };
}
