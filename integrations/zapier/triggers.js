/**
 * TaxBridge Zapier Triggers
 * Fire when events happen in TaxBridge (e.g., new RSU entry added)
 */

const testAuth = {
  key: 'test_auth',
  noun: 'Authentication',
  display: {
    label: 'Test Authentication',
    description: 'Test your TaxBridge API key',
    hidden: true,
  },
  operation: {
    perform: async (z, bundle) => {
      const response = await z.request({
        url: 'https://taxbridge.app/api/v1/forms',
        params: {
          has_rsu: 'true',
        },
        headers: {
          Authorization: `Bearer ${bundle.authData.api_key}`,
        },
      });

      return response.data;
    },
  },
};

const newRsuEntry = {
  key: 'new_rsu_entry',
  noun: 'RSU Entry',
  display: {
    label: 'New RSU Entry',
    description: 'Triggers when a new RSU entry is added to TaxBridge',
  },
  operation: {
    perform: async (z, bundle) => {
      // In production, this would poll /api/v1/rsu-entries endpoint
      // For now, return sample data for Zapier testing

      return [
        {
          id: 1,
          employee_email: 'john.doe@company.com',
          vest_date: '2025-03-15',
          shares_vested: 100,
          fmv_per_share_usd: 580.50,
          employer: 'Meta',
          us_state: 'CA',
          canada_province: 'BC',
          filing_status: 'single',
          created_at: new Date().toISOString(),
        },
      ];
    },
    sample: {
      id: 1,
      employee_email: 'john.doe@company.com',
      vest_date: '2025-03-15',
      shares_vested: 100,
      fmv_per_share_usd: 580.50,
      employer: 'Meta',
      us_state: 'CA',
      canada_province: 'BC',
      filing_status: 'single',
      created_at: '2025-03-18T00:00:00Z',
    },
  },
};

module.exports = {
  test_auth: testAuth,
  new_rsu_entry: newRsuEntry,
};
