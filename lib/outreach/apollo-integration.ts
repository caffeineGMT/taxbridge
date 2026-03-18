/**
 * Apollo.io API Integration
 *
 * Searches for immigration law firms with H-1B/TN specialization
 * using Apollo.io's People Search API
 *
 * API Docs: https://apolloio.github.io/apollo-api-docs/
 * Pricing: $79/mo for 10,000 credits
 */

export interface ApolloConfig {
  apiKey: string;
  baseUrl: string;
}

export interface ApolloSearchParams {
  job_titles?: string[];
  person_locations?: string[];
  organization_num_employees_ranges?: string[];
  organization_industry_tag_ids?: string[];
  page?: number;
  per_page?: number;
}

export interface ApolloContact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  title: string;
  organization: {
    name: string;
    website_url: string;
    num_employees: number;
    city: string;
    state: string;
  };
}

export interface ApolloSearchResponse {
  contacts: ApolloContact[];
  pagination: {
    page: number;
    per_page: number;
    total_entries: number;
    total_pages: number;
  };
}

/**
 * Search for immigration attorneys using Apollo.io API
 */
export async function searchImmigrationAttorneys(
  config: ApolloConfig,
  params: ApolloSearchParams = {}
): Promise<ApolloSearchResponse> {
  const defaultParams: ApolloSearchParams = {
    job_titles: [
      'Immigration Attorney',
      'Immigration Lawyer',
      'Partner',
      'Managing Attorney',
      'Immigration Counsel'
    ],
    person_locations: [
      'San Francisco, CA',
      'San Jose, CA',
      'Seattle, WA',
      'New York, NY',
      'Boston, MA',
      'Austin, TX'
    ],
    organization_num_employees_ranges: [
      '11-50',
      '51-200',
      '201-500'
    ],
    page: 1,
    per_page: 100,
    ...params
  };

  const response = await fetch(`${config.baseUrl}/v1/mixed_people/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'X-Api-Key': config.apiKey
    },
    body: JSON.stringify(defaultParams)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Apollo API error: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Enrich email addresses with Hunter.io verification
 */
export async function verifyEmail(email: string, hunterApiKey: string): Promise<{
  email: string;
  status: 'valid' | 'invalid' | 'accept_all' | 'unknown';
  score: number;
  regexp: boolean;
  gibberish: boolean;
  disposable: boolean;
  webmail: boolean;
  mx_records: boolean;
  smtp_server: boolean;
  smtp_check: boolean;
  accept_all: boolean;
}> {
  const response = await fetch(
    `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(email)}&api_key=${hunterApiKey}`,
    { method: 'GET' }
  );

  if (!response.ok) {
    throw new Error(`Hunter.io API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data;
}

/**
 * Deduplicate firms by organization name
 */
export function deduplicateFirms(contacts: ApolloContact[]): Map<string, ApolloContact[]> {
  const firmMap = new Map<string, ApolloContact[]>();

  for (const contact of contacts) {
    const firmName = contact.organization.name;
    if (!firmMap.has(firmName)) {
      firmMap.set(firmName, []);
    }
    firmMap.get(firmName)!.push(contact);
  }

  return firmMap;
}

/**
 * Select best contact from firm (prioritize partners, managing attorneys)
 */
export function selectBestContact(contacts: ApolloContact[]): ApolloContact {
  const priorityTitles = ['Partner', 'Managing Attorney', 'Managing Partner', 'Principal'];

  // First pass: look for priority titles
  for (const priorityTitle of priorityTitles) {
    const match = contacts.find(c =>
      c.title.toLowerCase().includes(priorityTitle.toLowerCase())
    );
    if (match) return match;
  }

  // Second pass: return first contact with email
  const withEmail = contacts.find(c => c.email);
  if (withEmail) return withEmail;

  // Fallback: return first contact
  return contacts[0];
}

/**
 * Format for CSV export
 */
export function formatForCSV(contact: ApolloContact): {
  firm_name: string;
  contact_name: string;
  contact_email: string;
  title: string;
  city: string;
  state: string;
  website: string;
  attorney_count: number;
  source: string;
} {
  return {
    firm_name: contact.organization.name,
    contact_name: `${contact.first_name} ${contact.last_name}`,
    contact_email: contact.email,
    title: contact.title,
    city: contact.organization.city || '',
    state: contact.organization.state || '',
    website: contact.organization.website_url || '',
    attorney_count: contact.organization.num_employees || 0,
    source: 'apollo_io'
  };
}
