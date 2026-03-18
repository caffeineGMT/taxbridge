/**
 * TaxBridge PDF Tax Summary Generator
 * Generates professional tax summary PDFs with RSU details, dual-country tax breakdowns,
 * FTC calculations, and required forms checklist
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TAX_FORMS } from '@/lib/forms/forms-data';

interface RSUData {
  id: number;
  employer: string;
  tickerSymbol: string;
  vestingDate: string;
  shares: number;
  fmvUsd: number;
  totalValueUsd: number;
  totalValueCad: number;
  usState: string;
  canadaProvince: string;
}

interface TaxBreakdown {
  federal: {
    tax: number;
    effectiveRate: number;
    marginalRate: number;
    breakdown: Array<{ bracket: string; rate: number; tax: number }>;
  };
  state?: {
    tax: number;
    effectiveRate: number;
    breakdown: string;
  };
  provincial?: {
    tax: number;
    effectiveRate: number;
    breakdown: string;
  };
  total?: number;
  totalBeforeFTC?: number;
  netTotal?: number;
  ftc?: {
    amount: number;
    explanation: string;
  };
}

interface TaxSummaryData {
  rsu: RSUData;
  usTax: TaxBreakdown;
  canadaTax: TaxBreakdown;
  exchangeRate: number;
}

/**
 * Format currency with appropriate symbol
 */
function formatCurrency(amount: number, currency: 'USD' | 'CAD'): string {
  const symbol = currency === 'USD' ? '$' : 'C$';
  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format percentage
 */
function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
}

/**
 * Generate Tax Summary PDF
 * @param data Tax summary data from API
 * @returns PDF as Uint8Array buffer
 */
export function generateTaxSummaryPDF(data: TaxSummaryData): Uint8Array {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = margin;

  // Brand colors
  const primaryBlue: [number, number, number] = [30, 64, 175]; // #1e40af
  const lightGray: [number, number, number] = [241, 245, 249]; // #f1f5f9
  const textColor: [number, number, number] = [15, 23, 42]; // #0f172a
  const mutedColor: [number, number, number] = [100, 116, 139]; // #64748b

  // ============================================================================
  // HEADER: TaxBridge Logo and Title
  // ============================================================================
  doc.setFillColor(...primaryBlue);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('TaxBridge', margin, 20);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Cross-Border Tax Summary', margin, 30);

  yPos = 50;

  // ============================================================================
  // SECTION 1: RSU Details
  // ============================================================================
  doc.setTextColor(...textColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RSU Vesting Details', margin, yPos);
  yPos += 10;

  // RSU Info Table
  const rsuTableData = [
    ['Employer', `${data.rsu.employer} (${data.rsu.tickerSymbol})`],
    [
      'Vesting Date',
      new Date(data.rsu.vestingDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    ],
    ['Shares Vested', data.rsu.shares.toLocaleString()],
    [
      'Fair Market Value',
      `${formatCurrency(data.rsu.fmvUsd, 'USD')} per share`,
    ],
    [
      'Total Value (USD)',
      formatCurrency(data.rsu.totalValueUsd, 'USD'),
    ],
    [
      'Total Value (CAD)',
      formatCurrency(data.rsu.totalValueCad, 'CAD'),
    ],
    [
      'Exchange Rate',
      `${data.exchangeRate.toFixed(4)} USD/CAD`,
    ],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: rsuTableData,
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: contentWidth - 50 },
    },
    margin: { left: margin, right: margin },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // ============================================================================
  // SECTION 2: Dual-Country Tax Breakdown
  // ============================================================================
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Dual-Country Tax Breakdown', margin, yPos);
  yPos += 10;

  // Tax Comparison Table
  const taxComparisonData = [
    [
      'US Federal Tax',
      formatCurrency(data.usTax.federal.tax, 'USD'),
      formatPercent(data.usTax.federal.effectiveRate),
    ],
    [
      `US State Tax (${data.rsu.usState})`,
      formatCurrency(data.usTax.state?.tax || 0, 'USD'),
      formatPercent(data.usTax.state?.effectiveRate || 0),
    ],
    [
      'Total US Tax',
      formatCurrency(data.usTax.total || 0, 'USD'),
      formatPercent((data.usTax.total || 0) / data.rsu.totalValueUsd),
    ],
    ['', '', ''], // Spacer
    [
      'Canada Federal Tax',
      formatCurrency(data.canadaTax.federal.tax, 'CAD'),
      formatPercent(data.canadaTax.federal.effectiveRate),
    ],
    [
      `Canada Provincial Tax (${data.rsu.canadaProvince})`,
      formatCurrency(data.canadaTax.provincial?.tax || 0, 'CAD'),
      formatPercent(data.canadaTax.provincial?.effectiveRate || 0),
    ],
    [
      'Canada Tax Before FTC',
      formatCurrency(data.canadaTax.totalBeforeFTC || 0, 'CAD'),
      formatPercent(
        (data.canadaTax.totalBeforeFTC || 0) / data.rsu.totalValueCad
      ),
    ],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Tax Type', 'Amount', 'Effective Rate']],
    body: taxComparisonData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryBlue,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: contentWidth * 0.5 },
      1: { cellWidth: contentWidth * 0.3, halign: 'right' },
      2: { cellWidth: contentWidth * 0.2, halign: 'right' },
    },
    margin: { left: margin, right: margin },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Check if we need a new page
  if (yPos > pageHeight - 80) {
    doc.addPage();
    yPos = margin;
  }

  // ============================================================================
  // SECTION 3: Foreign Tax Credit (FTC) Calculation
  // ============================================================================
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Foreign Tax Credit (FTC) Optimization', margin, yPos);
  yPos += 10;

  // FTC Visual Breakdown
  const ftcData = [
    [
      'US Tax Paid',
      formatCurrency(data.usTax.total || 0, 'USD'),
    ],
    [
      'Foreign Tax Credit',
      formatCurrency(data.canadaTax.ftc?.amount || 0, 'CAD'),
    ],
    [
      'Net Canada Tax',
      formatCurrency(data.canadaTax.netTotal || 0, 'CAD'),
    ],
    [
      'Total Tax Savings from FTC',
      formatCurrency(data.canadaTax.ftc?.amount || 0, 'CAD'),
    ],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: ftcData,
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: contentWidth * 0.5 },
      1: {
        cellWidth: contentWidth * 0.5,
        halign: 'right',
        fontStyle: 'bold',
      },
    },
    margin: { left: margin, right: margin },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // FTC Explanation (wrapped text)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedColor);
  const ftcExplanation = data.canadaTax.ftc?.explanation || '';
  const splitExplanation = doc.splitTextToSize(
    ftcExplanation,
    contentWidth
  );
  doc.text(splitExplanation, margin, yPos);
  yPos += splitExplanation.length * 5 + 15;

  // Check if we need a new page
  if (yPos > pageHeight - 100) {
    doc.addPage();
    yPos = margin;
  }

  // ============================================================================
  // SECTION 4: Net Tax Liability Summary
  // ============================================================================
  doc.setTextColor(...textColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Net Tax Liability', margin, yPos);
  yPos += 10;

  // Summary Box with Background
  doc.setFillColor(...lightGray);
  doc.roundedRect(margin, yPos, contentWidth, 35, 3, 3, 'F');

  yPos += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Total US Tax:', margin + 5, yPos);
  doc.setFont('helvetica', 'bold');
  doc.text(
    formatCurrency(data.usTax.total || 0, 'USD'),
    pageWidth - margin - 5,
    yPos,
    { align: 'right' }
  );

  yPos += 8;
  doc.setFont('helvetica', 'normal');
  doc.text('Total Canada Tax (After FTC):', margin + 5, yPos);
  doc.setFont('helvetica', 'bold');
  doc.text(
    formatCurrency(data.canadaTax.netTotal || 0, 'CAD'),
    pageWidth - margin - 5,
    yPos,
    { align: 'right' }
  );

  yPos += 8;
  doc.setFont('helvetica', 'normal');
  doc.text('Combined Effective Tax Rate:', margin + 5, yPos);
  doc.setFont('helvetica', 'bold');
  const totalTaxUSD =
    (data.usTax.total || 0) + (data.canadaTax.netTotal || 0) / data.exchangeRate;
  const combinedRate = totalTaxUSD / data.rsu.totalValueUsd;
  doc.text(formatPercent(combinedRate), pageWidth - margin - 5, yPos, {
    align: 'right',
  });

  yPos += 20;

  // ============================================================================
  // SECTION 5: Required Forms Checklist
  // ============================================================================
  doc.setTextColor(...textColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Required Tax Forms', margin, yPos);
  yPos += 10;

  // Forms Checklist Table
  const formsData = TAX_FORMS.map((form) => [
    '☐', // Checkbox
    `${form.code}`,
    form.name,
    form.deadline,
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['', 'Code', 'Form Name', 'Deadline']],
    body: formsData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryBlue,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 30 },
      2: { cellWidth: contentWidth * 0.5 },
      3: { cellWidth: contentWidth * 0.3 },
    },
    margin: { left: margin, right: margin },
  });

  yPos = (doc as any).lastAutoTable.finalY + 20;

  // ============================================================================
  // FOOTER: Disclaimer and Generation Date
  // ============================================================================
  const footerY = pageHeight - 25;

  // Add footer to all pages
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Footer line
    doc.setDrawColor(...mutedColor);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

    // Disclaimer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...mutedColor);
    doc.text(
      '⚠ This document is for informational purposes only and does not constitute tax advice.',
      margin,
      footerY
    );
    doc.text(
      'Please consult with a qualified tax professional for your specific situation.',
      margin,
      footerY + 5
    );

    // Generated date
    doc.setFont('helvetica', 'normal');
    const generatedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    doc.text(
      `Generated on ${generatedDate}`,
      pageWidth - margin,
      footerY + 10,
      { align: 'right' }
    );

    // Page number
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      footerY + 10,
      { align: 'center' }
    );
  }

  // Return PDF as buffer
  return doc.output('arraybuffer') as unknown as Uint8Array;
}
