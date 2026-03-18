'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BookOpen, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { presetSchemas } from '@/lib/seo/structured-data';
import { generateFAQSchema } from '@/lib/seo/structured-data';

const faqs = [
  {
    question: 'Do I need to file taxes in both the US and Canada?',
    answer:
      'Yes. As a Canadian resident, you must file a Canadian tax return (T1) reporting worldwide income. If you have US-sourced income (like RSUs from a US employer), you must also file a US return (1040 or 1040-NR) reporting that income. The US-Canada Tax Treaty Article XV prevents double taxation through the Foreign Tax Credit.',
  },
  {
    question: 'What is Tax Treaty Article XV and how does it protect me?',
    answer:
      'Article XV of the US-Canada Tax Treaty covers "Dependent Personal Services" (employment income). It states that employment income is primarily taxable where the services are performed. For RSUs, this means income is allocated based on where you physically worked during the vesting period. The treaty ensures you can claim a Foreign Tax Credit for taxes paid to the other country, preventing double taxation.',
  },
  {
    question: 'Should I file my US or Canada return first?',
    answer:
      'For Canadian residents, it is generally recommended to file your US return first. This way, you have the exact US tax amount to claim as a Foreign Tax Credit on your Canadian T2209 form. Filing US first also ensures you meet the US deadline (April 15) while Canada gives you until April 30.',
  },
  {
    question: 'What if I paid more US tax than Canada would have charged?',
    answer:
      'Unfortunately, the excess is lost. The Foreign Tax Credit is capped at the amount Canada would have charged on that foreign income. For example, if you paid $30,000 in US tax but Canada only charges $25,000 on that income, you can only claim $25,000 as FTC. The extra $5,000 cannot be refunded or carried forward in the current MVP.',
  },
  {
    question: 'Do I need to report my US bank accounts to Canada?',
    answer:
      'Yes. Canadian residents must report foreign property (including US bank accounts, investment accounts, and RSUs held with US brokers) on Form T1135 if the total cost exceeds CAD $100,000 at any time during the year. Additionally, US persons (including Green Card holders and certain visa holders) must file FBAR (FinCEN Form 114) for foreign accounts exceeding USD $10,000, and Form 8938 if thresholds are met.',
  },
  {
    question: 'What exchange rate should I use for USD to CAD conversion?',
    answer:
      'The Canada Revenue Agency (CRA) accepts the Bank of Canada average annual exchange rate for the year. For daily transactions, use the rate on the date of the transaction. TaxBridge automatically uses official Bank of Canada rates for all conversions.',
  },
  {
    question: 'Can I deduct US tax preparation fees on my Canadian return?',
    answer:
      'Generally, no. Canada does not allow a deduction for personal tax preparation fees. However, if you paid fees specifically related to objecting or appealing a tax assessment, those may be deductible. Always consult a tax professional for your specific situation.',
  },
  {
    question: 'What happens if I miss the filing deadline?',
    answer:
      'For the US: The deadline is April 15 (or October 15 with an extension). Late filing penalties can be severe (5% per month up to 25% of unpaid tax). For Canada: The deadline is April 30 (June 15 if self-employed). Late filing penalties are 5% of balance owing plus 1% per month up to 12 months. File as soon as possible even if late to minimize penalties.',
  },
];

export default function H1BRSUTaxGuide() {
  const [activeSection, setActiveSection] = useState('');

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(presetSchemas.guide) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateFAQSchema(faqs)) }}
      />

      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-2 mb-6">
              <BookOpen className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">Complete Guide</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">
              H1B RSU Tax Guide: US-Canada Cross-Border Filing
            </h1>
            <p className="text-lg text-slate-400 mb-6">
              Everything you need to know about filing US and Canada taxes on RSU income under the Tax Treaty Article XV.
              Updated for 2025 tax year.
            </p>

            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>Last updated: March 2025</span>
              <span>•</span>
              <span>15 min read</span>
            </div>
          </div>

          {/* Table of Contents */}
          <Card className="border-slate-800 bg-slate-900/50 mb-12">
            <CardHeader>
              <CardTitle className="text-lg text-slate-100">Table of Contents</CardTitle>
            </CardHeader>
            <CardContent>
              <nav className="space-y-2">
                {[
                  { id: 'overview', title: 'Overview: Cross-Border Tax Obligations' },
                  { id: 'article-xv', title: 'Understanding Tax Treaty Article XV' },
                  { id: 'ftc', title: 'Foreign Tax Credit Deep Dive' },
                  { id: 'filing-steps', title: 'Step-by-Step Filing Instructions' },
                  { id: 'required-forms', title: 'Required Forms Checklist' },
                  { id: 'common-mistakes', title: 'Common Mistakes to Avoid' },
                  { id: 'faq', title: 'Frequently Asked Questions' },
                ].map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className="flex items-center gap-2 text-slate-300 hover:text-emerald-400 transition-colors w-full text-left"
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span>{section.title}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>

          {/* Main Content */}
          <article className="prose prose-invert prose-slate max-w-none space-y-12">
            {/* Overview */}
            <section id="overview">
              <h2 className="text-3xl font-bold text-slate-100 mb-4">Overview: Cross-Border Tax Obligations</h2>
              <div className="text-slate-300 space-y-4">
                <p>
                  If you're an H-1B or TN visa holder who worked in the US and earned Restricted Stock Units (RSUs), then moved to Canada,
                  you face a unique tax situation: dual-country filing obligations. This guide walks you through exactly how to handle it.
                </p>
                <p>
                  <strong>The core challenge:</strong> Both the US and Canada want to tax your RSU income. The US taxes it because you
                  earned it while working there (or for a US employer). Canada taxes it because you're now a resident and must report
                  worldwide income. Without proper planning, you could pay tax twice on the same dollar.
                </p>
                <p>
                  <strong>The solution:</strong> The US-Canada Tax Treaty and the Foreign Tax Credit (FTC) mechanism. These ensure you
                  only pay the higher of the two countries' tax rates, not both.
                </p>
              </div>
            </section>

            {/* Article XV */}
            <section id="article-xv">
              <h2 className="text-3xl font-bold text-slate-100 mb-4">Understanding Tax Treaty Article XV</h2>
              <div className="text-slate-300 space-y-4">
                <p>
                  <strong>Article XV</strong> of the US-Canada Income Tax Treaty covers "Dependent Personal Services" (employment income).
                  Here's what it means for your RSU income:
                </p>

                <Card className="border-blue-500/30 bg-blue-950/20">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold text-blue-300 mb-3">Key Principles</h3>
                    <ul className="space-y-2 text-slate-300">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Primary Taxation:</strong> Employment income is taxable where the work was performed. If you vested
                          RSUs while working in the US, that portion is US-sourced income.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Residency Taxation:</strong> Your country of residence (Canada) can also tax worldwide income,
                          including US-sourced RSUs.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Double Taxation Relief:</strong> The treaty requires both countries to provide a Foreign Tax Credit
                          for taxes paid to the other, preventing you from paying twice.
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <p>
                  <strong>Income Allocation Example:</strong> Suppose you had RSUs that vested over 4 years. You worked in the US for
                  the first 2 years, then moved to Canada. Under Article XV, 50% of the RSU income is US-sourced (earned while working
                  there), and 50% is Canada-sourced (earned while living in Canada).
                </p>
              </div>
            </section>

            {/* FTC Deep Dive */}
            <section id="ftc">
              <h2 className="text-3xl font-bold text-slate-100 mb-4">Foreign Tax Credit Deep Dive</h2>
              <div className="text-slate-300 space-y-4">
                <p>
                  The Foreign Tax Credit (FTC) is the mechanism that prevents double taxation. Here's how it works in practice:
                </p>

                <h3 className="text-xl font-semibold text-slate-100 mt-6">For Canadian Residents (Most Common Scenario)</h3>
                <p>
                  As a Canadian resident, you file your Canadian T1 return reporting worldwide income. You then claim the US taxes you
                  paid as a credit on <strong>Form T2209 (Federal Foreign Tax Credit)</strong> and your provincial equivalent.
                </p>

                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <h4 className="font-semibold text-emerald-400 mb-3">FTC Calculation Formula</h4>
                  <code className="text-sm text-slate-300">
                    Canada FTC = MIN(US tax paid, Canada tax × US income / Total income)
                  </code>
                  <p className="mt-3 text-sm text-slate-400">
                    In plain English: Your credit is the lesser of (1) what you actually paid to the US, or (2) what Canada would have
                    charged on that same income.
                  </p>
                </div>

                <h3 className="text-xl font-semibold text-slate-100 mt-6">Important FTC Limitations</h3>
                <ul className="space-y-2 ml-6 list-disc">
                  <li>
                    <strong>No Excess Refund:</strong> If US tax exceeds Canada's tax rate on that income, the excess is lost. You
                    can't get a refund for it.
                  </li>
                  <li>
                    <strong>No Carryforward:</strong> Unlike the US, Canada does not allow you to carry forward unused FTC to future
                    years (in most cases).
                  </li>
                  <li>
                    <strong>Currency Conversion:</strong> Convert US taxes to CAD using the Bank of Canada average annual exchange rate.
                  </li>
                  <li>
                    <strong>Timing Matters:</strong> You can only claim FTC for taxes actually paid, not just accrued or estimated.
                  </li>
                </ul>
              </div>
            </section>

            {/* Filing Steps */}
            <section id="filing-steps">
              <h2 className="text-3xl font-bold text-slate-100 mb-4">Step-by-Step Filing Instructions</h2>
              <div className="text-slate-300 space-y-6">
                <Card className="border-emerald-500/30 bg-emerald-950/20">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold text-emerald-300 mb-4">Recommended Filing Order</h3>
                    <ol className="space-y-4">
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-bold">
                          1
                        </span>
                        <div>
                          <strong className="text-slate-100">File US Return First (Form 1040 or 1040-NR)</strong>
                          <p className="text-sm text-slate-400 mt-1">
                            Complete your US federal and state returns. You'll receive a W-2 from your employer showing your RSU income.
                            File by April 15 (or October 15 with extension).
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-bold">
                          2
                        </span>
                        <div>
                          <strong className="text-slate-100">File Canada Return (Form T1)</strong>
                          <p className="text-sm text-slate-400 mt-1">
                            Report your worldwide income including the RSUs. Use Form T2209 to claim FTC for the US taxes you paid.
                            File by April 30 (June 15 if self-employed).
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-bold">
                          3
                        </span>
                        <div>
                          <strong className="text-slate-100">File Additional Reporting Forms</strong>
                          <p className="text-sm text-slate-400 mt-1">
                            FBAR (FinCEN 114) for foreign accounts over $10k USD. Form 8938 for foreign assets if thresholds met.
                            T1135 for foreign property over $100k CAD. Form 8833 for treaty-based positions (if applicable).
                          </p>
                        </div>
                      </li>
                    </ol>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Required Forms */}
            <section id="required-forms">
              <h2 className="text-3xl font-bold text-slate-100 mb-4">Required Forms Checklist</h2>
              <div className="text-slate-300 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* US Forms */}
                  <Card className="border-slate-800 bg-slate-900/50">
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-300">US Forms</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <strong className="text-slate-100">Form 1040 / 1040-NR</strong>
                        <p className="text-sm text-slate-400">US Individual Income Tax Return</p>
                      </div>
                      <div>
                        <strong className="text-slate-100">W-2</strong>
                        <p className="text-sm text-slate-400">Wage and Tax Statement from employer</p>
                      </div>
                      <div>
                        <strong className="text-slate-100">State Return</strong>
                        <p className="text-sm text-slate-400">If applicable (CA, NY, etc.)</p>
                      </div>
                      <div>
                        <strong className="text-slate-100">FBAR (FinCEN 114)</strong>
                        <p className="text-sm text-slate-400">Foreign Bank Account Report (if over $10k USD)</p>
                      </div>
                      <div>
                        <strong className="text-slate-100">Form 8938</strong>
                        <p className="text-sm text-slate-400">Foreign Assets (if thresholds met)</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Canada Forms */}
                  <Card className="border-slate-800 bg-slate-900/50">
                    <CardHeader>
                      <CardTitle className="text-lg text-emerald-300">Canada Forms</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <strong className="text-slate-100">T1 General</strong>
                        <p className="text-sm text-slate-400">Canadian Income Tax Return</p>
                      </div>
                      <div>
                        <strong className="text-slate-100">T4 Slip</strong>
                        <p className="text-sm text-slate-400">Statement of Remuneration (if applicable)</p>
                      </div>
                      <div>
                        <strong className="text-slate-100">T2209</strong>
                        <p className="text-sm text-slate-400">Federal Foreign Tax Credit</p>
                      </div>
                      <div>
                        <strong className="text-slate-100">Provincial FTC Form</strong>
                        <p className="text-sm text-slate-400">BC428, ON428, etc.</p>
                      </div>
                      <div>
                        <strong className="text-slate-100">T1135</strong>
                        <p className="text-sm text-slate-400">Foreign Income Verification (if over $100k CAD)</p>
                      </div>
                      <div>
                        <strong className="text-slate-100">Form 8833</strong>
                        <p className="text-sm text-slate-400">Treaty-Based Return Position (if claiming treaty benefits)</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            {/* Common Mistakes */}
            <section id="common-mistakes">
              <h2 className="text-3xl font-bold text-slate-100 mb-4">Common Mistakes to Avoid</h2>
              <div className="space-y-4">
                {[
                  {
                    title: 'Not Filing in Both Countries',
                    description:
                      'Some people assume they only need to file where they currently live. Wrong! You must file in both countries if you have US-sourced income as a Canadian resident.',
                  },
                  {
                    title: 'Filing Canada Before US',
                    description:
                      'If you file Canada first, you will not know your exact US tax amount for the FTC calculation. Always file US first to get the precise number.',
                  },
                  {
                    title: 'Forgetting State Tax in FTC',
                    description:
                      'Both US federal AND state taxes are eligible for the Foreign Tax Credit in Canada. Don't leave state tax out of your T2209 calculation.',
                  },
                  {
                    title: 'Using Wrong Exchange Rate',
                    description:
                      'Always use the Bank of Canada official rate (annual average or specific date). Don't use a random online converter.',
                  },
                  {
                    title: 'Missing FBAR Deadline',
                    description:
                      'FBAR is due April 15 with an automatic extension to October 15. Missing it can result in severe penalties ($10,000+ per violation).',
                  },
                  {
                    title: 'Not Prorating RSU Income',
                    description:
                      'If RSUs vested over a period when you lived in both countries, you must prorate the income based on days worked in each location under Article XV.',
                  },
                ].map((mistake, index) => (
                  <Card key={index} className="border-red-500/30 bg-red-950/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="text-lg font-semibold text-red-300 mb-2">{mistake.title}</h3>
                          <p className="text-slate-300">{mistake.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section id="faq">
              <h2 className="text-3xl font-bold text-slate-100 mb-6">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`faq-${index}`}
                    className="border border-slate-800 rounded-lg px-4 bg-slate-900/50"
                  >
                    <AccordionTrigger className="text-left hover:no-underline">
                      <span className="text-slate-100 font-semibold">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-300 pt-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          </article>

          {/* CTA Section */}
          <div className="mt-16">
            <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-slate-900/50">
              <CardContent className="pt-8 pb-8 text-center">
                <h2 className="text-2xl font-bold text-slate-100 mb-4">Ready to Calculate Your Taxes?</h2>
                <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                  Use TaxBridge's free calculator to get instant tax estimates with Foreign Tax Credit optimization.
                  No signup required.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/us-canada-tax-calculator"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-6 py-3 transition-colors"
                  >
                    Try the Calculator
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                  <Link
                    href="/canada-tax-filing-checklist"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 hover:border-emerald-500 hover:bg-slate-800 text-slate-100 font-semibold px-6 py-3 transition-colors"
                  >
                    Get Filing Checklist
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
