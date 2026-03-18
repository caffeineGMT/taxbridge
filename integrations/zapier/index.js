/**
 * TaxBridge Zapier Integration
 * Enable no-code automation for cross-border RSU tax calculations
 */

const authentication = require('./authentication');
const triggers = require('./triggers');
const creates = require('./creates');

module.exports = {
  version: require('./package').version,
  platformVersion: require('zapier-platform-core').version,

  authentication: authentication,

  // Triggers (when something happens in TaxBridge)
  triggers: {
    [triggers.new_rsu_entry.key]: triggers.new_rsu_entry,
    [triggers.test_auth.key]: triggers.test_auth,
  },

  // Creates (do something in TaxBridge)
  creates: {
    [creates.calculate_taxes.key]: creates.calculate_taxes,
  },

  // Resources (data models)
  resources: {},
};
