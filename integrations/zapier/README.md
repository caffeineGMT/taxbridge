# TaxBridge Zapier Integration

Enable no-code automation for cross-border RSU tax calculations using Zapier.

## Features

- **Trigger**: New RSU Entry - Fire when a new RSU entry is added to TaxBridge
- **Action**: Calculate Taxes - Calculate cross-border RSU taxes via TaxBridge API

## Setup Instructions

### 1. Install Zapier CLI

```bash
npm install -g zapier-platform-cli
```

### 2. Login to Zapier

```bash
zapier login
```

### 3. Initialize Integration

```bash
cd integrations/zapier
npm install
```

### 4. Test Integration Locally

```bash
zapier test
```

### 5. Push to Zapier

```bash
zapier push
```

This creates a private integration in your Zapier account for testing.

### 6. Invite Beta Testers

```bash
zapier users:add user@example.com
```

### 7. Submit for Public Review

Once tested, submit to Zapier for public app directory listing:

1. Go to https://zapier.com/app/developer
2. Select your TaxBridge integration
3. Click "Submit for Review"
4. Provide screenshots, description, and use cases

**Review Timeline**: 2-4 weeks for Zapier approval

## Usage Examples

### Example Zap 1: Rippling → TaxBridge → Slack

1. **Trigger**: Rippling - New RSU Vest Event
2. **Action**: TaxBridge - Calculate Taxes
3. **Action**: Slack - Send Channel Message

Automatically notify employees when RSUs vest with their tax liability.

### Example Zap 2: Google Sheets → TaxBridge → Email

1. **Trigger**: Google Sheets - New Row
2. **Action**: TaxBridge - Calculate Taxes
3. **Action**: Gmail - Send Email

Process bulk RSU calculations from a spreadsheet.

### Example Zap 3: Gusto → TaxBridge → Airtable

1. **Trigger**: Gusto - New Equity Grant
2. **Action**: TaxBridge - Calculate Taxes
3. **Action**: Airtable - Create Record

Track all employee equity grants with tax calculations.

## API Authentication

Users need a TaxBridge API key to use this integration:

1. Sign up at https://taxbridge.app/enterprise
2. Generate API key from Enterprise Dashboard
3. Enter API key in Zapier connection settings

## Testing

Test authentication:
```bash
zapier test --auth
```

Test triggers:
```bash
zapier test --trigger new_rsu_entry
```

Test creates:
```bash
zapier test --create calculate_taxes
```

## Support

For integration issues, contact:
- Email: api@taxbridge.app
- Docs: https://taxbridge.app/api-docs
