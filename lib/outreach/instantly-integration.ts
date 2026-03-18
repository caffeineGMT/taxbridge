/**
 * Instantly.ai Integration
 *
 * Manages email campaigns, tracks opens/clicks/replies,
 * and syncs with local prospect database
 *
 * Pricing: $37/mo (Growth plan - 1,000 contacts, unlimited emails)
 * API Docs: https://developer.instantly.ai/
 */

export interface InstantlyConfig {
  apiKey: string;
  baseUrl: string;
}

export interface InstantlyCampaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  created_at: string;
}

export interface InstantlyLead {
  email: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  custom_variables?: Record<string, string>;
  campaign_id?: string;
}

export interface InstantlyAnalytics {
  campaign_id: string;
  total_leads: number;
  contacted: number;
  emails_sent: number;
  emails_opened: number;
  links_clicked: number;
  leads_replied: number;
  bounced: number;
  unsubscribed: number;
  open_rate: number;
  click_rate: number;
  reply_rate: number;
}

export interface InstantlyWebhookEvent {
  event_type: 'email_sent' | 'email_opened' | 'link_clicked' | 'reply_received' | 'lead_unsubscribed' | 'email_bounced';
  timestamp: string;
  campaign_id: string;
  campaign_name: string;
  lead: {
    email: string;
    first_name?: string;
    last_name?: string;
    company_name?: string;
  };
  email?: {
    subject: string;
    step: number;
  };
  reply?: {
    subject: string;
    body: string;
    from: string;
  };
  link?: {
    url: string;
  };
}

const DEFAULT_CONFIG: InstantlyConfig = {
  apiKey: process.env.INSTANTLY_API_KEY || '',
  baseUrl: 'https://api.instantly.ai/api/v1',
};

/**
 * List all campaigns
 */
export async function listCampaigns(
  config: InstantlyConfig = DEFAULT_CONFIG
): Promise<InstantlyCampaign[]> {
  const response = await fetch(
    `${config.baseUrl}/campaign/list?api_key=${config.apiKey}`,
    { method: 'GET' }
  );

  if (!response.ok) {
    throw new Error(`Instantly API error: ${response.status}`);
  }

  return await response.json();
}

/**
 * Create a new campaign
 */
export async function createCampaign(
  name: string,
  config: InstantlyConfig = DEFAULT_CONFIG
): Promise<{ campaign_id: string }> {
  const response = await fetch(`${config.baseUrl}/campaign/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: config.apiKey,
      campaign_name: name,
    }),
  });

  if (!response.ok) {
    throw new Error(`Instantly create campaign error: ${response.status}`);
  }

  return await response.json();
}

/**
 * Add leads to a campaign
 */
export async function addLeadsToCampaign(
  campaignId: string,
  leads: InstantlyLead[],
  config: InstantlyConfig = DEFAULT_CONFIG
): Promise<{ leads_added: number; leads_skipped: number }> {
  const formattedLeads = leads.map(lead => ({
    email: lead.email,
    first_name: lead.first_name || '',
    last_name: lead.last_name || '',
    company_name: lead.company_name || '',
    custom_variables: lead.custom_variables || {},
  }));

  const response = await fetch(`${config.baseUrl}/lead/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: config.apiKey,
      campaign_id: campaignId,
      skip_if_in_workspace: true,
      leads: formattedLeads,
    }),
  });

  if (!response.ok) {
    throw new Error(`Instantly add leads error: ${response.status}`);
  }

  return await response.json();
}

/**
 * Get campaign analytics
 */
export async function getCampaignAnalytics(
  campaignId: string,
  config: InstantlyConfig = DEFAULT_CONFIG
): Promise<InstantlyAnalytics> {
  const response = await fetch(
    `${config.baseUrl}/analytics/campaign/summary?api_key=${config.apiKey}&campaign_id=${campaignId}`,
    { method: 'GET' }
  );

  if (!response.ok) {
    throw new Error(`Instantly analytics error: ${response.status}`);
  }

  const data = await response.json();

  return {
    campaign_id: campaignId,
    total_leads: data.total_leads || 0,
    contacted: data.contacted || 0,
    emails_sent: data.emails_sent || 0,
    emails_opened: data.emails_opened || 0,
    links_clicked: data.links_clicked || 0,
    leads_replied: data.leads_replied || 0,
    bounced: data.bounced || 0,
    unsubscribed: data.unsubscribed || 0,
    open_rate: data.emails_sent > 0 ? (data.emails_opened / data.emails_sent) * 100 : 0,
    click_rate: data.emails_sent > 0 ? (data.links_clicked / data.emails_sent) * 100 : 0,
    reply_rate: data.contacted > 0 ? (data.leads_replied / data.contacted) * 100 : 0,
  };
}

/**
 * Get lead status in campaign
 */
export async function getLeadStatus(
  email: string,
  campaignId: string,
  config: InstantlyConfig = DEFAULT_CONFIG
): Promise<{
  email: string;
  status: string;
  emails_sent: number;
  last_email_sent_at: string | null;
  opened: boolean;
  clicked: boolean;
  replied: boolean;
}> {
  const response = await fetch(
    `${config.baseUrl}/lead/get?api_key=${config.apiKey}&campaign_id=${campaignId}&email=${encodeURIComponent(email)}`,
    { method: 'GET' }
  );

  if (!response.ok) {
    throw new Error(`Instantly get lead error: ${response.status}`);
  }

  return await response.json();
}

/**
 * Pause campaign
 */
export async function pauseCampaign(
  campaignId: string,
  config: InstantlyConfig = DEFAULT_CONFIG
): Promise<void> {
  const response = await fetch(`${config.baseUrl}/campaign/update/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: config.apiKey,
      campaign_id: campaignId,
      status: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Instantly pause campaign error: ${response.status}`);
  }
}

/**
 * Resume campaign
 */
export async function resumeCampaign(
  campaignId: string,
  config: InstantlyConfig = DEFAULT_CONFIG
): Promise<void> {
  const response = await fetch(`${config.baseUrl}/campaign/update/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: config.apiKey,
      campaign_id: campaignId,
      status: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Instantly resume campaign error: ${response.status}`);
  }
}

/**
 * Set up email sequence steps
 */
export async function setupEmailSequence(
  campaignId: string,
  sequences: Array<{
    subject: string;
    body: string;
    delay_days: number;
  }>,
  config: InstantlyConfig = DEFAULT_CONFIG
): Promise<void> {
  const response = await fetch(`${config.baseUrl}/campaign/set/sequences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: config.apiKey,
      campaign_id: campaignId,
      sequences: sequences.map((seq, idx) => ({
        step: idx + 1,
        subject: seq.subject,
        body: seq.body,
        delay: seq.delay_days,
        variant: 'a',
      })),
    }),
  });

  if (!response.ok) {
    throw new Error(`Instantly set sequences error: ${response.status}`);
  }
}

/**
 * Validate webhook signature from Instantly
 */
export function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Process webhook event and map to prospect status
 */
export function mapWebhookEventToProspectStatus(
  eventType: InstantlyWebhookEvent['event_type']
): string | null {
  switch (eventType) {
    case 'email_sent':
      return 'contacted';
    case 'email_opened':
      return 'opened';
    case 'link_clicked':
      return 'clicked';
    case 'reply_received':
      return 'replied';
    case 'email_bounced':
      return 'closed_lost';
    default:
      return null;
  }
}

/**
 * Generate Instantly.ai campaign setup configuration
 */
export function generateCampaignConfig(firmCount: number) {
  return {
    campaign_name: `Immigration Law Firm Outreach - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
    sending_schedule: {
      timezone: 'America/Los_Angeles',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      start_hour: 8,
      end_hour: 17,
    },
    sending_limits: {
      daily_limit: Math.min(50, firmCount),
      ramp_up: true,
      ramp_up_days: 7,
      ramp_up_increment: 10,
    },
    warmup: {
      enabled: true,
      warmup_days: 14,
      daily_warmup_limit: 20,
    },
    tracking: {
      open_tracking: true,
      click_tracking: true,
      reply_tracking: true,
    },
    sending_domains: [
      'taxbridge-partners.com',
      'taxbridge.co',
      'taxbridge.io',
    ],
    expected_results: {
      total_firms: firmCount,
      expected_open_rate: 0.45,
      expected_reply_rate: 0.08,
      expected_demo_rate: 0.03,
      expected_opens: Math.round(firmCount * 0.45),
      expected_replies: Math.round(firmCount * 0.08),
      expected_demos: Math.round(firmCount * 0.03),
      target_partners: 10,
    },
  };
}
