/**
 * TaxBridge Zapier Creates (Actions)
 * Perform actions in TaxBridge (e.g., calculate taxes)
 */

const calculateTaxes = {
  key: 'calculate_taxes',
  noun: 'Tax Calculation',
  display: {
    label: 'Calculate RSU Taxes',
    description: 'Calculate cross-border RSU taxes using TaxBridge API',
  },
  operation: {
    inputFields: [
      {
        key: 'employer',
        label: 'Employer',
        type: 'string',
        choices: ['Meta', 'Amazon', 'Google', 'Microsoft'],
        required: true,
        helpText: 'Employer name (determines stock ticker)',
      },
      {
        key: 'vest_date',
        label: 'Vest Date',
        type: 'datetime',
        required: true,
        helpText: 'RSU vest date (YYYY-MM-DD)',
      },
      {
        key: 'shares_vested',
        label: 'Shares Vested',
        type: 'integer',
        required: true,
        helpText: 'Number of shares vested',
      },
      {
        key: 'fmv_per_share_usd',
        label: 'FMV per Share (USD)',
        type: 'number',
        required: true,
        helpText: 'Fair market value per share in USD',
      },
      {
        key: 'us_state',
        label: 'US State',
        type: 'string',
        choices: ['WA', 'CA', 'NY', 'TX'],
        required: true,
        helpText: 'US state of employment',
      },
      {
        key: 'canada_province',
        label: 'Canada Province',
        type: 'string',
        choices: ['BC', 'ON', 'AB'],
        required: true,
        helpText: 'Canadian province of residence',
      },
      {
        key: 'filing_status',
        label: 'Filing Status',
        type: 'string',
        choices: ['single', 'married'],
        required: true,
        helpText: 'Tax filing status',
      },
    ],
    perform: async (z, bundle) => {
      const response = await z.request({
        url: 'https://taxbridge.app/api/v1/calculate',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bundle.authData.api_key}`,
        },
        body: {
          employer: bundle.inputData.employer,
          vest_date: bundle.inputData.vest_date,
          shares_vested: parseInt(bundle.inputData.shares_vested),
          fmv_per_share_usd: parseFloat(bundle.inputData.fmv_per_share_usd),
          us_state: bundle.inputData.us_state,
          canada_province: bundle.inputData.canada_province,
          filing_status: bundle.inputData.filing_status,
        },
      });

      if (response.status !== 200) {
        throw new Error(`API error: ${response.status} ${response.content}`);
      }

      return response.data;
    },
    sample: {
      total_value_usd: 58050.0,
      us_tax: {
        federal: 12045.0,
        state: 5398.65,
        total: 17443.65,
      },
      canada_tax: {
        federal: 10566.75,
        provincial: 4356.38,
        total: 14923.13,
      },
      foreign_tax_credit: 14923.13,
      net_tax_payable: 17443.65,
      effective_rate: 0.3004,
      optimal_filing_strategy: 'file-us-first',
    },
  },
};

module.exports = {
  calculate_taxes: calculateTaxes,
};
