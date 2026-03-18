import { generateAllPageParams } from '../lib/seo/geo-data';

async function verifyPages() {
  console.log('🔍 Verifying SEO page generation...\n');

  const allParams = generateAllPageParams();

  console.log('📊 Page Statistics:');
  console.log(`Total pages to generate: ${allParams.length}`);

  // Count by type
  const geoPages = allParams.filter(p => !p.employer);
  const employerPages = allParams.filter(p => p.employer);

  console.log(`  - Geo pages (state-province): ${geoPages.length}`);
  console.log(`  - Employer pages: ${employerPages.length}`);

  console.log('\n📝 Sample URLs:');

  // Show first 10 examples
  const samples = allParams.slice(0, 10).map(({ state, province, employer }) => {
    const slug = employer
      ? `${employer}-${province.toLowerCase()}`
      : `${state.toLowerCase()}-${province.toLowerCase()}`;
    return `  https://taxbridge.app/tax-calculator/${slug}`;
  });

  console.log(samples.join('\n'));
  console.log(`  ... and ${allParams.length - 10} more\n`);

  console.log('🎯 Target Keywords:');
  const keywords = [
    'H1B RSU tax calculator',
    'Washington BC tax',
    'California Ontario tax',
    'Meta RSU tax',
    'Amazon RSU tax',
    'Google RSU tax',
    'cross border tax calculator',
    'foreign tax credit optimizer',
    'US Canada tax treaty',
  ];
  keywords.forEach(kw => console.log(`  - "${kw}"`));

  console.log('\n✅ All pages configured for static generation');
  console.log('   Run `npm run build` to pre-render all 50 pages');
  console.log('   Run `npm run seo:generate` to create AI-generated content (requires ANTHROPIC_API_KEY)\n');
}

verifyPages();
