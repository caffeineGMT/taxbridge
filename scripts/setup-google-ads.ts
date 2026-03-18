#!/usr/bin/env tsx

/**
 * Google Ads Campaign Setup Script
 *
 * This script helps you:
 * 1. Configure Google Ads conversion tracking IDs
 * 2. Verify conversion tracking is working
 * 3. Test remarketing pixel
 * 4. Generate campaign setup checklist
 */

import fs from 'fs';
import path from 'path';

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const BLUE = '\x1b[36m';
const RESET = '\x1b[0m';

function log(message: string, color: string = RESET) {
  console.log(`${color}${message}${RESET}`);
}

function header(message: string) {
  console.log('\n' + '='.repeat(60));
  log(message, BLUE);
  console.log('='.repeat(60) + '\n');
}

async function main() {
  header('🚀 Google Ads Campaign Setup');

  // Step 1: Check if .env.local exists
  const envPath = path.join(process.cwd(), '.env.local');
  let envContent = '';

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
    log('✓ Found .env.local', GREEN);
  } else {
    log('✗ .env.local not found, creating...', YELLOW);
    envContent = '';
  }

  // Step 2: Check for Google Ads variables
  header('📋 Google Ads Configuration');

  const requiredVars = [
    'NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID',
    'NEXT_PUBLIC_GOOGLE_ADS_REMARKETING_TAG',
  ];

  const missingVars: string[] = [];

  for (const varName of requiredVars) {
    if (envContent.includes(varName)) {
      log(`✓ ${varName} configured`, GREEN);
    } else {
      log(`✗ ${varName} missing`, RED);
      missingVars.push(varName);
    }
  }

  // Step 3: Add missing variables
  if (missingVars.length > 0) {
    header('⚙️  Adding Missing Configuration');

    let newContent = envContent;

    if (!newContent.includes('# Google Ads Configuration')) {
      newContent += '\n# Google Ads Configuration\n';
    }

    if (missingVars.includes('NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID')) {
      newContent += 'NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID=AW-XXXXXXXXXX # Replace with your Google Ads ID\n';
      log('Added NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID placeholder', YELLOW);
    }

    if (missingVars.includes('NEXT_PUBLIC_GOOGLE_ADS_REMARKETING_TAG')) {
      newContent += 'NEXT_PUBLIC_GOOGLE_ADS_REMARKETING_TAG=AW-XXXXXXXXXX # Replace with your remarketing tag\n';
      log('Added NEXT_PUBLIC_GOOGLE_ADS_REMARKETING_TAG placeholder', YELLOW);
    }

    fs.writeFileSync(envPath, newContent);
    log('\n✓ Updated .env.local with placeholders', GREEN);
    log('⚠️  IMPORTANT: Replace AW-XXXXXXXXXX with your actual Google Ads IDs', YELLOW);
  }

  // Step 4: Conversion Actions Setup Guide
  header('🎯 Conversion Actions Setup');

  console.log(`
Create these 5 conversion actions in Google Ads:

1. Calculator Landing (Page View)
   - Category: Page view
   - Value: $0
   - Count: One per session
   - Conversion window: 7 days

2. Calculator Started (Engagement)
   - Category: Other
   - Value: $0
   - Count: One per session
   - Conversion window: 7 days

3. Calculator Completed (Micro-Conversion)
   - Category: Other
   - Value: $5
   - Count: One per session
   - Conversion window: 30 days

4. Lead Captured (Primary Conversion)
   - Category: Submit lead form
   - Value: $10
   - Count: One
   - Conversion window: 30 days
   - Include in "Conversions" column: YES

5. Subscription Purchase (Revenue)
   - Category: Purchase
   - Value: Use transaction-specific value
   - Count: One
   - Conversion window: 90 days
   - Include in "Conversions" column: YES

After creating each action, you'll get a conversion tag like:
  AW-XXXXXXXXXX/AbC-D_efG-h1234567

Update lib/google-ads/conversion-tracking.ts with these IDs.
  `);

  // Step 5: Installation Checklist
  header('✅ Installation Checklist');

  console.log(`
[ ] 1. Create Google Ads account (ads.google.com)
[ ] 2. Set up billing ($500/month budget)
[ ] 3. Create 5 conversion actions (see above)
[ ] 4. Copy conversion IDs to .env.local
[ ] 5. Update lib/google-ads/conversion-tracking.ts with conversion IDs
[ ] 6. Add gtag script to app/layout.tsx:

    {/* Google Ads Conversion Tracking */}
    <script async src="https://www.googletagmanager.com/gtag/js?id={process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID}"></script>
    <script dangerouslySetInnerHTML={{
      __html: \`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '\${process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID}');
      \`
    }} />

[ ] 7. Deploy to production (Vercel)
[ ] 8. Test conversion tracking with Google Tag Assistant
[ ] 9. Create Search campaign in Google Ads
[ ] 10. Add keywords from docs/GOOGLE_ADS_CAMPAIGN_SETUP.md
[ ] 11. Create responsive search ads (15 headlines, 4 descriptions)
[ ] 12. Set daily budget to $16.67
[ ] 13. Enable campaign and monitor first 24 hours
  `);

  // Step 6: Quick Test URLs
  header('🧪 Testing URLs');

  console.log(`
Once deployed, test these URLs:

1. Landing Page (with UTM params):
   https://taxbridge.com/us-canada-tax-calculator?utm_source=google&utm_medium=cpc&utm_campaign=test

2. Check conversion tracking:
   - Open browser DevTools → Network tab
   - Filter for "google-analytics" or "gtag"
   - Interact with calculator
   - Verify gtag events firing

3. PostHog funnel:
   https://app.posthog.com → Insights → Funnels
   - Filter by utm_source = google
   - See conversion rates at each step
  `);

  // Step 7: Campaign URLs
  header('🔗 Campaign URLs');

  const keywords = [
    'h1b rsu tax calculator',
    'canada us dual tax filing',
    'cross border tax software',
    'tn visa tax help',
    'foreign tax credit calculator',
  ];

  console.log('\nAdd these tracking URLs to your Google Ads campaigns:\n');

  keywords.forEach((keyword) => {
    const slug = keyword.replace(/\s+/g, '_');
    const url = `https://taxbridge.com/us-canada-tax-calculator?utm_source=google&utm_medium=cpc&utm_campaign=h1b_rsu_search&utm_term=${encodeURIComponent(keyword)}`;
    console.log(`${keyword}:`);
    console.log(`  ${url}\n`);
  });

  // Step 8: PostHog Dashboard Setup
  header('📊 PostHog Funnel Setup');

  console.log(`
Create this funnel in PostHog:

Name: "Google Ads Calculator Funnel"

Steps:
1. calculator_page_viewed
   - Filter: utm_source = google
2. first_rsu_entry_started
3. tax_calculation_viewed
4. email_verified
5. checkout_completed

Breakdown by:
- utm_campaign
- utm_term
- utm_content

Expected conversion rates:
- Step 1→2: 60% (user starts calculator)
- Step 2→3: 90% (user sees results)
- Step 3→4: 5% (user submits email)
- Step 4→5: 5% (user purchases)

Overall: 2.7% page view → email, 0.135% page view → paid
  `);

  // Step 9: Budget Monitoring
  header('💰 Budget Monitoring Setup');

  console.log(`
Set up these automated checks:

1. Daily Budget Alert (Google Ads):
   - Tools & Settings → Shared library → Automated rules
   - If daily spend > $20, send email alert

2. Low Conversion Alert:
   - If clicks > 50 with 0 conversions, pause campaign

3. High CPA Alert:
   - If cost per conversion > $150, send email alert

4. PostHog Dashboard:
   - Pin Google Ads funnel to dashboard
   - Set up weekly email report
   - Monitor cost per acquisition trend
  `);

  // Step 10: Next Steps
  header('🎯 Next Steps');

  console.log(`
After completing setup:

1. Run test transaction:
   - Visit landing page with ?utm_source=google&utm_medium=cpc
   - Complete calculator
   - Submit email
   - Verify conversion shows in Google Ads (within 24 hours)

2. Launch campaign:
   - Start with $10/day for first week
   - Monitor hourly for first 24 hours
   - Adjust bids based on performance

3. Week 1 optimization:
   - Add negative keywords from search terms report
   - Pause keywords with CTR < 2%
   - Increase bids on keywords with conversions

4. Scale:
   - If CPA < $100, increase budget to $20/day
   - If CPA > $150, pause and optimize landing page
   - Target 5-6 leads/month at $500 budget

Documentation:
- Full guide: docs/GOOGLE_ADS_CAMPAIGN_SETUP.md
- Conversion tracking: lib/google-ads/conversion-tracking.ts
- Landing page: app/(marketing)/us-canada-tax-calculator/page-enhanced.tsx
  `);

  // Final summary
  header('✨ Setup Complete!');

  log('\nYour Google Ads campaign infrastructure is ready.', GREEN);
  log('\nNext: Replace AW-XXXXXXXXXX placeholders in .env.local with your actual Google Ads IDs.', YELLOW);
  log('\nFor detailed campaign setup, see: docs/GOOGLE_ADS_CAMPAIGN_SETUP.md', BLUE);
}

main().catch((error) => {
  log(`\n❌ Error: ${error.message}`, RED);
  process.exit(1);
});
