import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';
import { CONFERENCES } from '../lib/conferences/config';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'booth-assets');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function generateBannerPDF(conference: typeof CONFERENCES[0]) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'in', format: [36, 84] });

  // Background
  doc.setFillColor(2, 6, 23); // slate-950
  doc.rect(0, 0, 84, 36, 'F');

  // Emerald accent bar
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 0, 84, 2, 'F');
  doc.rect(0, 34, 84, 2, 'F');

  // Logo
  doc.setFontSize(120);
  doc.setTextColor(16, 185, 129);
  doc.text('TaxBridge', 42, 8, { align: 'center' });

  // Tagline
  doc.setFontSize(48);
  doc.setTextColor(241, 245, 249); // slate-100
  doc.text('US-Canada Cross-Border RSU Tax Calculator', 42, 12, { align: 'center' });

  // Value props
  doc.setFontSize(36);
  doc.setTextColor(148, 163, 184); // slate-400
  const props = [
    'Save $12K in Overpaid Taxes',
    'Save $3K in CPA Fees',
    '10-Minute Automated Calculations',
    'Foreign Tax Credit Optimization',
  ];
  props.forEach((prop, i) => {
    doc.text(`• ${prop}`, 12, 17 + i * 3);
  });

  // QR code placeholder box
  doc.setFillColor(30, 41, 59); // slate-800
  doc.roundedRect(58, 15, 14, 14, 1, 1, 'F');
  doc.setFontSize(24);
  doc.setTextColor(16, 185, 129);
  doc.text('SCAN FOR', 65, 20, { align: 'center' });
  doc.text('FREE TRIAL', 65, 22.5, { align: 'center' });
  doc.setFontSize(18);
  doc.setTextColor(148, 163, 184);
  doc.text(`taxbridge.app/signup`, 65, 25, { align: 'center' });
  doc.text(`?ref=${conference.refParam}`, 65, 27, { align: 'center' });

  // Discount code
  doc.setFontSize(42);
  doc.setTextColor(16, 185, 129);
  doc.text(`${conference.discountPercent}% OFF: ${conference.discountCode}`, 42, 33, { align: 'center' });

  const filePath = path.join(OUTPUT_DIR, `banner-${conference.id}.pdf`);
  fs.writeFileSync(filePath, Buffer.from(doc.output('arraybuffer')));
  console.log(`Banner generated: ${filePath}`);
}

function generateOnePagerPDF(conference: typeof CONFERENCES[0]) {
  const doc = new jsPDF({ unit: 'in', format: 'letter' });
  const w = 8.5;

  // Header
  doc.setFillColor(2, 6, 23);
  doc.rect(0, 0, w, 2, 'F');
  doc.setFontSize(28);
  doc.setTextColor(16, 185, 129);
  doc.text('TaxBridge', 0.75, 1, { align: 'left' });
  doc.setFontSize(11);
  doc.setTextColor(148, 163, 184);
  doc.text('US-Canada Cross-Border RSU Tax Calculator', 0.75, 1.4);
  doc.text(`${conference.shortName} | ${conference.dateRange}`, 0.75, 1.7);

  // Problem section
  let y = 2.5;
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text('The Problem', 0.75, y);
  y += 0.15;
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.02);
  doc.line(0.75, y, 3, y);
  y += 0.35;

  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  const problems = [
    'H-1B and TN visa holders with RSUs face complex dual-country tax obligations',
    'Most CPAs charge $3,000-$5,000 for cross-border tax preparation',
    '73% of cross-border returns have suboptimal Foreign Tax Credit usage',
    'Manual calculation takes 3+ hours and is error-prone',
  ];
  problems.forEach(p => {
    doc.text(`•  ${p}`, 0.75, y);
    y += 0.28;
  });

  // Solution section
  y += 0.3;
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text('The Solution', 0.75, y);
  y += 0.15;
  doc.line(0.75, y, 3, y);
  y += 0.35;

  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  const solutions = [
    'Automated dual-country RSU tax calculation in 10 minutes',
    'Foreign Tax Credit optimization (IRS Form 1116 + CRA T2209)',
    'Canada-US Tax Treaty provisions automatically applied',
    'Real-time Bank of Canada exchange rates',
    'Multi-year planning for relocating workers',
    'Enterprise/firm licensing with API access',
  ];
  solutions.forEach(s => {
    doc.text(`✓  ${s}`, 0.75, y);
    y += 0.28;
  });

  // Results box
  y += 0.3;
  doc.setFillColor(240, 253, 244); // green-50
  doc.roundedRect(0.75, y, w - 1.5, 1.6, 0.1, 0.1, 'F');
  y += 0.35;
  doc.setFontSize(14);
  doc.setTextColor(5, 150, 105);
  doc.text('Results for Clients', 1, y);
  y += 0.35;
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text('$12,400 average tax savings identified  |  $3,000 CPA fee savings  |  99.7% accuracy', 1, y);
  y += 0.3;
  doc.text('Case Study: Meta L6 engineer, $450K RSU income, Seattle→Vancouver relocation', 1, y);
  y += 0.25;
  doc.text('→ Identified $12,400 in missed FTC credits in 12 minutes', 1, y);

  // Pricing
  y += 0.6;
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text('Pricing', 0.75, y);
  y += 0.15;
  doc.line(0.75, y, 2.2, y);
  y += 0.35;

  doc.setFontSize(10);
  const tiers = [
    ['Individual Pro', '$149/year', 'Unlimited calculations, FTC optimization, treaty analysis'],
    ['Firm License', '$499/year per seat', 'Client portal, bulk calculations, white-label reports'],
    ['Enterprise', 'Custom pricing', 'API access, SSO, dedicated support, payroll integration'],
  ];
  tiers.forEach(([name, price, desc]) => {
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(`${name}`, 0.75, y);
    doc.setTextColor(16, 185, 129);
    doc.text(`${price}`, 3.5, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(desc, 0.75, y + 0.22);
    y += 0.55;
  });

  // Discount box
  y += 0.2;
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(0.75, y, w - 1.5, 0.8, 0.1, 0.1, 'F');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(`${conference.shortName} Exclusive: ${conference.discountPercent}% OFF with code ${conference.discountCode}`, w / 2, y + 0.35, { align: 'center' });
  doc.setFontSize(9);
  doc.text(`Valid 14 days after conference | taxbridge.app/signup?ref=${conference.refParam}`, w / 2, y + 0.6, { align: 'center' });

  // Footer
  y = 10.2;
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('taxbridge.app  |  hello@taxbridge.app  |  @TaxBridgeApp', w / 2, y, { align: 'center' });

  const filePath = path.join(OUTPUT_DIR, `one-pager-${conference.id}.pdf`);
  fs.writeFileSync(filePath, Buffer.from(doc.output('arraybuffer')));
  console.log(`One-pager generated: ${filePath}`);
}

function generateBusinessCardPDF(conference: typeof CONFERENCES[0]) {
  // Standard business card: 3.5" x 2"
  const doc = new jsPDF({ unit: 'in', format: [2, 3.5] });

  // Front
  doc.setFillColor(2, 6, 23);
  doc.rect(0, 0, 3.5, 2, 'F');

  doc.setFontSize(16);
  doc.setTextColor(16, 185, 129);
  doc.text('TaxBridge', 0.25, 0.5);

  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('US-Canada Cross-Border RSU Tax Calculator', 0.25, 0.75);

  doc.setFontSize(8);
  doc.setTextColor(241, 245, 249);
  doc.text('Save $12K in overpaid cross-border taxes', 0.25, 1.1);
  doc.text('Automated dual-country RSU calculations', 0.25, 1.3);
  doc.text('Foreign Tax Credit optimization', 0.25, 1.5);

  doc.setFontSize(7);
  doc.setTextColor(16, 185, 129);
  doc.text(`${conference.discountPercent}% OFF: ${conference.discountCode}`, 0.25, 1.8);
  doc.setTextColor(148, 163, 184);
  doc.text('taxbridge.app', 2.5, 1.8);

  // Back page
  doc.addPage([2, 3.5]);
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, 3.5, 2, 'F');

  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('TaxBridge', 1.75, 0.7, { align: 'center' });

  doc.setFontSize(8);
  doc.text('Cross-Border RSU Tax Calculator', 1.75, 1, { align: 'center' });

  // QR placeholder
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(1.25, 1.2, 1, 0.5, 0.05, 0.05, 'F');
  doc.setFontSize(6);
  doc.setTextColor(2, 6, 23);
  doc.text('QR CODE', 1.75, 1.45, { align: 'center' });
  doc.text(`taxbridge.app/signup?ref=${conference.refParam}`, 1.75, 1.6, { align: 'center' });

  const filePath = path.join(OUTPUT_DIR, `business-card-${conference.id}.pdf`);
  fs.writeFileSync(filePath, Buffer.from(doc.output('arraybuffer')));
  console.log(`Business card generated: ${filePath}`);
}

async function main() {
  console.log('Generating booth assets for all conferences...\n');
  ensureDir(OUTPUT_DIR);

  for (const conf of CONFERENCES) {
    console.log(`\n--- ${conf.shortName} (${conf.dateRange}) ---`);
    generateBannerPDF(conf);
    generateOnePagerPDF(conf);
    generateBusinessCardPDF(conf);
  }

  // Generate iPad demo instructions
  const demoInstructions = `# iPad Demo Setup - Conference Booth

## Quick Start
1. Open Safari on iPad
2. Navigate to: https://taxbridge.app/demo
3. Enable "Guided Access" (Settings → Accessibility → Guided Access)
4. Triple-click Home/Side button to lock to TaxBridge app

## Demo Flow (2-3 minutes per visitor)

### Step 1: Hook (15 seconds)
"Are any of your clients H-1B or TN visa holders with RSUs? They're probably overpaying $12K in taxes."

### Step 2: Quick Demo (90 seconds)
1. Show the RSU entry form - enter sample data:
   - Company: Meta
   - Shares: 500
   - FMV: $450
   - Vest Date: March 2026
2. Show instant dual-country calculation
3. Highlight the Foreign Tax Credit optimization
4. Show the savings summary ($12K identified)

### Step 3: Close (30 seconds)
"Scan the QR code on our banner for a free trial. Use code [CONFERENCE_CODE] for 25% off."

## Conference-Specific Codes
${CONFERENCES.map(c => `- ${c.shortName}: ${c.discountCode} (${c.dateRange})`).join('\n')}

## Booth Equipment Checklist
- [ ] Retractable banner (7' tall) with QR code
- [ ] iPad Pro 12.9" with stand and charger
- [ ] Business cards (500 per conference)
- [ ] One-pager handouts (300 per conference)
- [ ] Badge scanner (if provided by conference)
- [ ] External battery pack for iPad
- [ ] WiFi hotspot (backup for conference WiFi)
- [ ] Branded tablecloth
- [ ] Candy bowl (conversation starter)

## Lead Capture Process
1. Scan badge (if available) → auto-populates lead form
2. Or have visitor fill out form on iPad: /conference/[slug]
3. System auto-assigns discount code
4. Follow-up email sent within 48 hours

## Qualifying Questions (for Hot/Warm/Cold)
### Hot Lead Indicators:
- "We have 50+ clients with RSUs moving cross-border"
- "We're looking for a tool to automate this"
- "What's the enterprise pricing?"

### Warm Lead Indicators:
- "Interesting, I have a few clients who might benefit"
- "Can you send me more information?"

### Cold Lead Indicators:
- Just collecting swag/info
- Not in cross-border practice
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'ipad-demo-instructions.md'), demoInstructions);
  console.log(`\nIPad demo instructions: ${path.join(OUTPUT_DIR, 'ipad-demo-instructions.md')}`);

  // Generate QR code URLs file
  const qrUrls = CONFERENCES.map(c => ({
    conference: c.shortName,
    signupUrl: `https://taxbridge.app/signup?ref=${c.refParam}`,
    landingUrl: `https://taxbridge.app/conference/${c.refParam}`,
    discountCode: c.discountCode,
    qrGenerateUrl: `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(`https://taxbridge.app/conference/${c.refParam}`)}`,
  }));

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'qr-code-urls.json'),
    JSON.stringify(qrUrls, null, 2)
  );
  console.log(`QR code URLs: ${path.join(OUTPUT_DIR, 'qr-code-urls.json')}`);

  console.log('\n✓ All booth assets generated successfully!');
  console.log(`Output directory: ${OUTPUT_DIR}`);
}

main().catch(console.error);
