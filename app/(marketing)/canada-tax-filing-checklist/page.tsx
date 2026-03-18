'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, Calendar, ExternalLink, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { generateFAQSchema } from '@/lib/seo/structured-data';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  link?: string;
  linkText?: string;
  deadline?: string;
}

const checklistSections = [
  {
    title: 'Before You Start',
    items: [
      {
        id: 'gather-w2',
        title: 'Gather your W-2 from US employer',
        description: 'This shows your RSU income and taxes withheld. Your employer should mail this by January 31.',
        deadline: 'Receive by Jan 31',
      },
      {
        id: 'gather-t4',
        title: 'Gather T4 slip (if you worked for a Canadian employer)',
        description: 'For any Canadian employment income. Issued by February 28.',
        deadline: 'Receive by Feb 28',
      },
      {
        id: 'exchange-rate',
        title: 'Get Bank of Canada exchange rate',
        description: 'You need the USD to CAD annual average rate for the tax year.',
        link: 'https://www.bankofcanada.ca/rates/exchange/annual-average-exchange-rates/',
        linkText: 'Bank of Canada Rates',
      },
      {
        id: 'calculate-prorate',
        title: 'Calculate income proration (if applicable)',
        description: 'If RSUs vested while you lived in both countries, allocate income based on days worked in each location.',
      },
    ],
  },
  {
    title: 'US Tax Filing',
    items: [
      {
        id: 'us-1040',
        title: 'File Form 1040 or 1040-NR',
        description: 'US Individual Income Tax Return. Use 1040-NR if you were a nonresident for part of the year.',
        deadline: 'Due April 15',
        link: 'https://www.irs.gov/forms-pubs/about-form-1040',
        linkText: 'IRS Form 1040',
      },
      {
        id: 'us-state',
        title: 'File State Tax Return (if applicable)',
        description: 'California, New York, and other states require separate returns. Washington and Texas have no state income tax.',
        deadline: 'Due April 15',
      },
      {
        id: 'fbar',
        title: 'File FBAR (FinCEN Form 114)',
        description: 'Required if your foreign (non-US) financial accounts exceeded $10,000 USD at any time during the year.',
        deadline: 'Due April 15 (auto-extension to Oct 15)',
        link: 'https://bsaefiling.fincen.treas.gov/main.html',
        linkText: 'FBAR Filing System',
      },
      {
        id: 'form-8938',
        title: 'File Form 8938 (if thresholds met)',
        description: 'Statement of Specified Foreign Financial Assets. Threshold: $200k+ on last day or $300k+ any time (for US persons abroad).',
        link: 'https://www.irs.gov/forms-pubs/about-form-8938',
        linkText: 'IRS Form 8938',
      },
    ],
  },
  {
    title: 'Canada Tax Filing',
    items: [
      {
        id: 'canada-t1',
        title: 'File T1 General Income Tax Return',
        description: 'Canadian tax return reporting worldwide income. Include your US RSU income converted to CAD.',
        deadline: 'Due April 30 (June 15 if self-employed)',
        link: 'https://www.canada.ca/en/revenue-agency/services/forms-publications/tax-packages-years/general-income-tax-benefit-package.html',
        linkText: 'CRA T1 Package',
      },
      {
        id: 'canada-t2209',
        title: 'Complete Form T2209 (Federal Foreign Tax Credit)',
        description: 'Claim credit for US taxes paid. Attach copy of US return showing taxes paid.',
        link: 'https://www.canada.ca/en/revenue-agency/services/forms-publications/forms/t2209.html',
        linkText: 'CRA Form T2209',
      },
      {
        id: 'provincial-ftc',
        title: 'Complete Provincial Foreign Tax Credit form',
        description: 'BC428, ON428, AB428, etc. Each province has its own FTC calculation.',
      },
      {
        id: 't1135',
        title: 'File Form T1135 (if over $100k CAD foreign property)',
        description: 'Foreign Income Verification Statement. Required if you owned foreign property worth over $100k CAD at any time.',
        deadline: 'Due April 30',
        link: 'https://www.canada.ca/en/revenue-agency/services/forms-publications/forms/t1135.html',
        linkText: 'CRA Form T1135',
      },
      {
        id: 'form-8833',
        title: 'File Form 8833 (if claiming treaty benefits)',
        description: 'Treaty-Based Return Position Disclosure. Required if you claim treaty benefits that reduce US tax.',
        link: 'https://www.irs.gov/forms-pubs/about-form-8833',
        linkText: 'IRS Form 8833',
      },
    ],
  },
  {
    title: 'After Filing',
    items: [
      {
        id: 'keep-records',
        title: 'Keep copies of all returns and supporting documents',
        description: 'CRA requires 6 years, IRS requires 3-7 years. Store securely.',
      },
      {
        id: 'payment-plan',
        title: 'Set up payment plan if you owe',
        description: 'Both CRA and IRS offer payment plans. Apply early to minimize interest and penalties.',
        link: 'https://www.canada.ca/en/revenue-agency/services/about-canada-revenue-agency-cra/when-you-money-collections-cra/personal-debt.html',
        linkText: 'CRA Payment Arrangements',
      },
      {
        id: 'calendar-next',
        title: 'Mark next year deadlines on your calendar',
        description: 'Set reminders for W-2/T4 collection, filing deadlines, and quarterly estimated tax payments.',
      },
    ],
  },
];

const deadlines = [
  { date: 'January 31', event: 'W-2 issued by US employer', type: 'receive' },
  { date: 'February 28', event: 'T4 issued by Canadian employer', type: 'receive' },
  { date: 'April 15', event: 'US Tax Return (1040/1040-NR) due', type: 'file' },
  { date: 'April 15', event: 'FBAR due (auto-extension to Oct 15)', type: 'file' },
  { date: 'April 30', event: 'Canada T1 Return due', type: 'file' },
  { date: 'April 30', event: 'T1135 (foreign property) due', type: 'file' },
  { date: 'June 15', event: 'Canada T1 due (if self-employed)', type: 'file' },
  { date: 'October 15', event: 'US Tax Return with extension', type: 'file' },
  { date: 'October 15', event: 'FBAR final deadline', type: 'file' },
];

const faqs = [
  {
    question: 'What happens if I miss a deadline?',
    answer:
      'Both countries charge late filing penalties and interest. US: 5% per month (up to 25%) of unpaid tax. Canada: 5% of balance owing plus 1% per month (up to 12 months). File as soon as possible to minimize penalties.',
  },
  {
    question: 'Do I need to file both federal and provincial in Canada?',
    answer:
      'Your T1 General return covers both federal and provincial taxes. You complete the federal schedule and your province-specific forms (e.g., BC428 for British Columbia) together in one submission.',
  },
  {
    question: 'Can I e-file my returns?',
    answer:
      'US: Yes, e-filing is available through IRS Free File or tax software. Canada: Yes, use NETFILE through CRA-certified software. FBAR must be filed electronically through the BSA E-Filing System.',
  },
  {
    question: 'What if I made a mistake on a filed return?',
    answer:
      'US: File an amended return (Form 1040-X) within 3 years. Canada: File a T1 Adjustment Request online through My Account or mail Form T1-ADJ. Both countries allow corrections.',
  },
];

export default function TaxFilingChecklist() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  const totalItems = checklistSections.reduce((acc, section) => acc + section.items.length, 0);
  const completedItems = checkedItems.size;
  const progress = (completedItems / totalItems) * 100;

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateFAQSchema(faqs)) }}
      />

      <div className="container mx-auto px-6 py-16">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-2 mb-6">
              <Calendar className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-400">Filing Checklist</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">
              Canada Tax Filing Checklist for US RSU Income
            </h1>
            <p className="text-lg text-slate-400 mb-6">
              Complete step-by-step checklist for filing US and Canada taxes on RSU income. Track your progress,
              see deadlines, and access official forms. Updated for 2025 tax year.
            </p>

            {/* Progress Bar */}
            <Card className="border-emerald-500/30 bg-slate-900/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-300">Overall Progress</span>
                  <span className="text-sm font-medium text-emerald-400">
                    {completedItems} / {totalItems} completed
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Deadline Calendar */}
          <Card className="border-slate-800 bg-slate-900/50 mb-12">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-100 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-amber-400" />
                Key Deadlines 2025
              </CardTitle>
              <CardDescription>Important dates for cross-border tax filing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {deadlines.map((deadline, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex-shrink-0 w-24 text-right">
                      <span className="text-sm font-semibold text-emerald-400">{deadline.date}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-200">{deadline.event}</p>
                      <span
                        className={`text-xs ${
                          deadline.type === 'file' ? 'text-amber-400' : 'text-blue-400'
                        }`}
                      >
                        {deadline.type === 'file' ? '📤 File by this date' : '📬 Receive by this date'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Checklist Sections */}
          <div className="space-y-8">
            {checklistSections.map((section, sectionIndex) => (
              <Card key={sectionIndex} className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-100">{section.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {section.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer"
                      onClick={() => toggleItem(item.id)}
                    >
                      <button
                        className="flex-shrink-0 mt-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleItem(item.id);
                        }}
                      >
                        {checkedItems.has(item.id) ? (
                          <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                        ) : (
                          <Circle className="h-6 w-6 text-slate-600" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-semibold mb-1 ${
                            checkedItems.has(item.id) ? 'text-slate-500 line-through' : 'text-slate-100'
                          }`}
                        >
                          {item.title}
                        </h3>
                        <p className="text-sm text-slate-400 mb-2">{item.description}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          {item.deadline && (
                            <span className="inline-flex items-center gap-1 text-amber-400">
                              <Calendar className="h-3 w-3" />
                              {item.deadline}
                            </span>
                          )}
                          {item.link && (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="h-3 w-3" />
                              {item.linkText}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Warning Banner */}
          <Card className="border-amber-500/30 bg-amber-950/20 mt-12">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-amber-300 mb-2">Important Disclaimer</h3>
                  <p className="text-slate-300 text-sm">
                    This checklist is for informational purposes only and does not constitute tax advice.
                    Cross-border tax situations are complex and individual circumstances vary. We strongly recommend
                    consulting with a qualified cross-border tax professional (CPA or CA with US/Canada expertise)
                    for your specific situation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <div className="mt-12">
            <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-slate-900/50">
              <CardContent className="pt-8 pb-8 text-center">
                <h2 className="text-2xl font-bold text-slate-100 mb-4">Calculate Your Taxes Now</h2>
                <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                  Use TaxBridge's free calculator to estimate your US and Canada tax with Foreign Tax Credit optimization.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/us-canada-tax-calculator"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-6 py-3 transition-colors"
                  >
                    Try the Calculator
                  </Link>
                  <Link
                    href="/h1b-rsu-tax-guide"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 hover:border-emerald-500 hover:bg-slate-800 text-slate-100 font-semibold px-6 py-3 transition-colors"
                  >
                    Read the Guide
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
