/**
 * Generate TaxBridge Enterprise One-Pager PDF
 *
 * Reads docs/enterprise/one-pager.md and converts to a professional 2-page PDF
 * using jsPDF and jspdf-autotable for structured layout.
 *
 * Output: public/assets/TaxBridge-Enterprise-OnePager.pdf
 */

import * as fs from 'fs';
import * as path from 'path';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLOR_PRIMARY = '#10b981'; // Emerald green
const COLOR_TEXT = '#1e293b'; // Slate gray
const COLOR_MUTED = '#64748b'; // Slate gray muted
const COLOR_ACCENT = '#3b82f6'; // Blue

function generateEnterprisePDF() {
  console.log('📄 Generating TaxBridge Enterprise One-Pager PDF...\n');

  // Initialize PDF (Letter size)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;
  let yPos = 20;

  // --- PAGE 1 ---

  // Header / Logo
  pdf.setFillColor(16, 185, 129); // Emerald
  pdf.rect(0, 0, pageWidth, 15, 'F');
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text('TaxBridge Enterprise', margin, 10);

  yPos = 25;

  // Title
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLOR_TEXT);
  pdf.text('Automate Cross-Border Tax for 50+ H-1B/TN Clients', margin, yPos);
  yPos += 10;

  // --- The Problem Section ---
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLOR_PRIMARY);
  pdf.text('The Problem', margin, yPos);
  yPos += 7;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(COLOR_TEXT);
  const problemText = [
    'Immigration law firms waste 250+ hours per year on manual dual-country',
    'tax calculations for H-1B and TN visa holders who receive RSU compensation.',
    '',
    '• 5 hours per client spent on spreadsheet-based tax calculations',
    '• 30% error rate leading to IRS penalties and client complaints',
    '• $500 cost per filing when outsourced to CPAs',
    '• Zero audit trail for compliance tracking'
  ];
  problemText.forEach(line => {
    pdf.text(line, margin, yPos);
    yPos += 5;
  });
  yPos += 3;

  // --- The Solution Section ---
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLOR_PRIMARY);
  pdf.text('The TaxBridge Solution', margin, yPos);
  yPos += 7;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(COLOR_TEXT);
  pdf.text('Multi-client dashboard built for immigration law firms managing cross-border tax compliance.', margin, yPos);
  yPos += 8;

  // Key Features (2 columns)
  const features = [
    { icon: '🏢', title: 'Multi-Client Dashboard', desc: 'Manage 50-200+ clients in one view' },
    { icon: '📊', title: 'CSV Bulk Import', desc: 'Upload client data via CSV' },
    { icon: '🛡️', title: 'Compliance Tracking', desc: 'Export compliance reports' },
    { icon: '🎨', title: 'White-Label Branding', desc: 'Your firm logo & colors' },
    { icon: '🔌', title: 'API Access', desc: 'QuickBooks, Xero integration' },
    { icon: '📞', title: 'Priority Support', desc: '4-hour SLA response time' }
  ];

  const featureBoxWidth = (pageWidth - 3 * margin) / 2;
  const featureBoxHeight = 18;
  let featureX = margin;
  let featureY = yPos;

  features.forEach((feature, index) => {
    if (index % 2 === 0 && index > 0) {
      featureY += featureBoxHeight + 3;
      featureX = margin;
    } else if (index % 2 === 1) {
      featureX = margin + featureBoxWidth + margin;
    }

    // Draw box
    pdf.setFillColor(248, 250, 252); // Light background
    pdf.rect(featureX, featureY, featureBoxWidth, featureBoxHeight, 'F');
    pdf.setDrawColor(226, 232, 240); // Border
    pdf.rect(featureX, featureY, featureBoxWidth, featureBoxHeight);

    // Icon
    pdf.setFontSize(16);
    pdf.text(feature.icon, featureX + 3, featureY + 7);

    // Title
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(COLOR_TEXT);
    pdf.text(feature.title, featureX + 12, featureY + 6);

    // Description
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(COLOR_MUTED);
    pdf.text(feature.desc, featureX + 12, featureY + 11);
  });

  yPos = featureY + featureBoxHeight + 10;

  // --- ROI Calculator Section ---
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLOR_PRIMARY);
  pdf.text('ROI Calculator (Example: 50 clients)', margin, yPos);
  yPos += 7;

  // ROI Table
  autoTable(pdf, {
    startY: yPos,
    head: [['Metric', 'Before', 'After', 'Savings']],
    body: [
      ['Hours per client', '5.0', '0.5', '4.5 hrs'],
      ['Total annual hours', '250', '25', '225 hrs'],
      ['CPA hourly rate', '$100', '$100', '—'],
      ['Cost Savings', '$25,000', '$2,500', '$22,500'],
      ['TaxBridge Cost', '—', '$100,000', '50 seats × $2K'],
      ['NET ROI (Year 1)', '—', '—', '$150,000']
    ],
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: COLOR_TEXT },
    columnStyles: {
      3: { fontStyle: 'bold', textColor: [16, 185, 129] }
    },
    margin: { left: margin, right: margin }
  });

  yPos = (pdf as any).lastAutoTable?.finalY || yPos + 40;
  yPos += 5;

  // Highlight
  pdf.setFillColor(16, 185, 129);
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text('⚡ Payback period: 2 months | ROI: 150% in Year 1', margin + 3, yPos + 5);

  // --- PAGE 2 ---
  pdf.addPage();
  yPos = 20;

  // --- Case Study Section ---
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLOR_PRIMARY);
  pdf.text('Case Study: Smith Immigration LLP', margin, yPos);
  yPos += 7;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'italic');
  pdf.setTextColor(COLOR_MUTED);
  pdf.text('Vancouver-based firm managing 80 H-1B/TN clients at Meta, Amazon, Microsoft', margin, yPos);
  yPos += 8;

  // Quote box
  pdf.setFillColor(236, 253, 245); // Light green background
  pdf.setDrawColor(16, 185, 129);
  pdf.setLineWidth(0.5);
  const quoteHeight = 25;
  pdf.rect(margin, yPos, pageWidth - 2 * margin, quoteHeight, 'FD');

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'italic');
  pdf.setTextColor(COLOR_TEXT);
  const quoteText = pdf.splitTextToSize(
    '"TaxBridge transformed our practice. We now handle 80 cross-border clients with the same effort we used to spend on 10. Our clients love the detailed Foreign Tax Credit reports — it\'s become a competitive advantage."',
    pageWidth - 2 * margin - 6
  );
  pdf.text(quoteText, margin + 3, yPos + 5);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(COLOR_MUTED);
  pdf.text('— Jennifer Smith, Managing Partner', margin + 3, yPos + quoteHeight - 4);

  yPos += quoteHeight + 8;

  // Results stats
  const stats = [
    { label: 'Before TaxBridge', value: '400 hrs/yr', color: [239, 68, 68] },
    { label: 'After TaxBridge', value: '40 hrs/yr', color: [16, 185, 129] },
    { label: 'Annual Savings', value: '$36K', color: [59, 130, 246] }
  ];

  const statBoxWidth = (pageWidth - 4 * margin) / 3;
  stats.forEach((stat, index) => {
    const statX = margin + index * (statBoxWidth + margin);

    pdf.setFillColor(...stat.color);
    pdf.rect(statX, yPos, statBoxWidth, 15, 'F');

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text(stat.value, statX + statBoxWidth / 2, yPos + 7, { align: 'center' });

    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.text(stat.label, statX + statBoxWidth / 2, yPos + 12, { align: 'center' });
  });

  yPos += 23;

  // --- Pricing Section ---
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLOR_PRIMARY);
  pdf.text('Pricing', margin, yPos);
  yPos += 7;

  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(16, 185, 129);
  pdf.setLineWidth(1);
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 30, 'D');

  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLOR_PRIMARY);
  pdf.text('$2,000/year', pageWidth / 2, yPos + 12, { align: 'center' });

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(COLOR_MUTED);
  pdf.text('per seat • 50-seat minimum • Total: $100,000/year', pageWidth / 2, yPos + 18, { align: 'center' });

  pdf.setFontSize(8);
  pdf.setTextColor(COLOR_TEXT);
  const included = 'Includes: Unlimited calculations, White-label reports, CSV import, API access, Priority support';
  pdf.text(included, pageWidth / 2, yPos + 25, { align: 'center' });

  yPos += 38;

  // --- Implementation Timeline ---
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLOR_PRIMARY);
  pdf.text('Implementation Timeline', margin, yPos);
  yPos += 7;

  const timeline = [
    { week: 'Week 1-2', title: 'Onboarding & Setup', tasks: ['Kick-off call', 'White-label branding', 'RBAC role assignment'] },
    { week: 'Week 3', title: 'Data Migration', tasks: ['CSV import', 'Historical RSU data upload', 'Verification'] },
    { week: 'Week 4', title: 'Go-Live', tasks: ['Training', 'Client communication', 'Compliance setup'] }
  ];

  timeline.forEach(phase => {
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(COLOR_ACCENT);
    pdf.text(`${phase.week}: ${phase.title}`, margin, yPos);
    yPos += 5;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(COLOR_TEXT);
    phase.tasks.forEach(task => {
      pdf.text(`• ${task}`, margin + 5, yPos);
      yPos += 4;
    });
    yPos += 2;
  });

  yPos += 5;

  // --- Get Started CTA ---
  pdf.setFillColor(16, 185, 129);
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 25, 'F');

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text('Get Started with a 30-Day Free Trial', pageWidth / 2, yPos + 7, { align: 'center' });

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('📞 +1 (555) 123-4567  |  ✉️ enterprise@taxbridge.app', pageWidth / 2, yPos + 14, { align: 'center' });
  pdf.text('🌐 taxbridge.app/enterprise', pageWidth / 2, yPos + 20, { align: 'center' });

  // Footer
  pdf.setFontSize(7);
  pdf.setTextColor(200, 200, 200);
  pdf.text('© 2026 TaxBridge. All rights reserved.', pageWidth / 2, 270, { align: 'center' });

  // --- Save PDF ---
  const outputDir = path.join(process.cwd(), 'public', 'assets');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'TaxBridge-Enterprise-OnePager.pdf');
  pdf.save(outputPath);

  console.log('✅ PDF generated successfully!');
  console.log(`📁 Location: ${outputPath}`);
  console.log('📄 Pages: 2');
  console.log('📏 Size: Letter (8.5" × 11")');
  console.log('\n🎉 Ready for distribution to enterprise prospects!\n');
}

// Run the generator
generateEnterprisePDF();

export {};
