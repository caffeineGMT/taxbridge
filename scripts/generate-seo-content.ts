import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { generateAllPageParams, getPageMetadata } from '../lib/seo/geo-data';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

interface ContentGenerationRequest {
  state: string;
  province: string;
  employer?: string;
}

async function generateArticleContent(request: ContentGenerationRequest): Promise<string> {
  const metadata = getPageMetadata(request.state, request.province, request.employer);

  if (!metadata) {
    throw new Error(`Invalid metadata for ${request.state}-${request.province}`);
  }

  const { stateData, provinceData, employerData } = metadata;

  const prompt = `You are a tax content writer specializing in US-Canada cross-border taxation. Generate a comprehensive, SEO-optimized article about filing taxes for someone who ${employerData ? `works at ${employerData.name} and` : 'has'} moved from ${stateData.name} to ${provinceData.name} with US RSU income.

Key Facts:
- ${stateData.name} state tax rate: ${stateData.taxRate}% (${stateData.details})
- ${provinceData.name} provincial tax rate: ${provinceData.taxRate}% (${provinceData.details})
${employerData ? `- Employer: ${employerData.name} (headquarters: ${employerData.headquarters})` : '- Target audience: H-1B/TN visa tech workers'}

Requirements:
1. Write 800-1000 words
2. Include these sections:
   - Introduction: The tax challenge of moving from ${stateData.name} to ${provinceData.name}
   - State tax obligations: ${stateData.name} sourcing rules
   - Provincial tax obligations: ${provinceData.name} residency rules
   - US-Canada Tax Treaty Article XV: How it prevents double taxation
   - Foreign Tax Credit mechanics: Detailed explanation
   - Common mistakes to avoid
   - Filing deadlines (April 15 for US, April 30 for Canada)
   - Conclusion with actionable next steps
3. Use natural language, avoid keyword stuffing
4. Include specific numbers and tax rates
5. Target keywords: "${stateData.name} ${provinceData.name} tax", "H1B RSU tax", "${employerData?.name || 'cross-border'} tax filing"
6. Write in second person ("you") to directly address the reader
7. Include 1-2 brief examples with dollar amounts
8. Mention that TaxBridge can help with calculations and filing prep

Output only the article body in Markdown format. Do not include a title (that's handled separately).`;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  return content.text;
}

async function generateAllContent() {
  console.log('🚀 Starting SEO content generation...\n');

  const allParams = generateAllPageParams();
  const contentDir = path.join(process.cwd(), 'content', 'geo-articles');

  // Create content directory if it doesn't exist
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
  }

  let successCount = 0;
  let errorCount = 0;

  for (const params of allParams) {
    const { state, province, employer } = params;
    const slug = employer
      ? `${employer}-${province.toLowerCase()}`
      : `${state.toLowerCase()}-${province.toLowerCase()}`;

    const filePath = path.join(contentDir, `${slug}.md`);

    // Skip if already exists (to save API costs)
    if (fs.existsSync(filePath)) {
      console.log(`⏭️  Skipping ${slug} (already exists)`);
      continue;
    }

    try {
      console.log(`📝 Generating content for ${slug}...`);
      const content = await generateArticleContent({ state, province, employer });

      // Add frontmatter
      const metadata = getPageMetadata(state, province, employer);
      const frontmatter = `---
title: "${metadata?.title}"
description: "${metadata?.description}"
state: "${state}"
province: "${province}"
${employer ? `employer: "${employer}"` : ''}
generated: "${new Date().toISOString()}"
---

`;

      fs.writeFileSync(filePath, frontmatter + content);
      console.log(`✅ Generated: ${slug}\n`);
      successCount++;

      // Rate limit: wait 2 seconds between requests to avoid hitting API limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`❌ Error generating ${slug}:`, error);
      errorCount++;
    }
  }

  console.log('\n📊 Generation Summary:');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📁 Content saved to: ${contentDir}`);
}

// Run the script
generateAllContent()
  .then(() => {
    console.log('\n✨ Content generation complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
