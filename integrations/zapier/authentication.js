/**
 * TaxBridge API Key Authentication
 */

const testAuth = async (z, bundle) => {
  // Test API key by calling /api/v1/forms endpoint
  const response = await z.request({
    url: 'https://taxbridge.app/api/v1/forms',
    params: {
      has_rsu: 'true',
    },
    headers: {
      Authorization: `Bearer ${bundle.authData.api_key}`,
    },
  });

  if (response.status !== 200) {
    throw new Error('Invalid API key');
  }

  return response.data;
};

module.exports = {
  type: 'custom',
  fields: [
    {
      key: 'api_key',
      label: 'API Key',
      required: true,
      type: 'string',
      helpText: 'Your TaxBridge API key (get it from https://taxbridge.app/enterprise)',
    },
  ],
  test: testAuth,
  connectionLabel: 'TaxBridge ({{bundle.authData.api_key}})',
};
