import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Calculator, MapPin, FileText, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { generateAllPageParams, getPageMetadata, US_STATES, PROVINCES, EMPLOYERS } from '@/lib/seo/geo-data';
import TaxCalculatorWidget from './TaxCalculatorWidget';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Parse slug format: "wa-bc" or "meta-bc"
function parseSlug(slug: string): { state: string; province: string; employer?: string } | null {
  const parts = slug.split('-');
  if (parts.length !== 2) return null;

  const [first, province] = parts;
  const provinceUpper = province.toUpperCase();

  // Check if it's an employer slug
  const employer = EMPLOYERS.find(e => e.slug === first.toLowerCase());
  if (employer && PROVINCES[provinceUpper]) {
    return {
      state: employer.primaryState,
      province: provinceUpper,
      employer: employer.slug,
    };
  }

  // Otherwise it's a state-province combination
  const stateUpper = first.toUpperCase();
  if (US_STATES[stateUpper] && PROVINCES[provinceUpper]) {
    return {
      state: stateUpper,
      province: provinceUpper,
    };
  }

  return null;
}

// Generate all static paths at build time
export async function generateStaticParams() {
  const allParams = generateAllPageParams();
  return allParams.map(({ state, province, employer }) => {
    const slug = employer
      ? `${employer}-${province.toLowerCase()}`
      : `${state.toLowerCase()}-${province.toLowerCase()}`;
    return { slug };
  });
}

// Generate metadata for each page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseSlug(slug);

  if (!parsed) {
    return {
      title: 'Page Not Found',
    };
  }

  const metadata = getPageMetadata(parsed.state, parsed.province, parsed.employer);

  if (!metadata) {
    return {
      title: 'Page Not Found',
    };
  }

  const keywords = [
    `${metadata.stateData.name} ${metadata.provinceData.name} tax`,
    'H1B RSU tax calculator',
    'cross border tax',
    'foreign tax credit',
    'Canada US tax treaty',
    ...(metadata.employerData ? [`${metadata.employerData.name} RSU tax`] : []),
  ];

  return {
    title: metadata.title,
    description: metadata.description,
    keywords: keywords.join(', '),
    alternates: {
      canonical: `https://taxbridge.app/tax-calculator/${slug}`,
    },
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      url: `https://taxbridge.app/tax-calculator/${slug}`,
      siteName: 'TaxBridge',
      type: 'website',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: metadata.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.title,
      description: metadata.description,
      images: ['/og-image.png'],
    },
  };
}

export default async function GeoTaxCalculatorPage({ params }: PageProps) {
  const { slug } = await params;
  const parsed = parseSlug(slug);

  if (!parsed) {
    notFound();
  }

  const metadata = getPageMetadata(parsed.state, parsed.province, parsed.employer);

  if (!metadata) {
    notFound();
  }

  const { stateData, provinceData, employerData } = metadata;

  // Generate FAQs specific to this location
  const faqs = [
    {
      question: `Do I need to pay ${stateData.name} state tax if I live in ${provinceData.name}?`,
      answer: `Yes, if your RSUs vested while you were physically working in ${stateData.name}, you owe ${stateData.name} tax on that income regardless of where you live now. ${stateData.taxRate === 0 ? `Fortunately, ${stateData.name} has no state income tax.` : `${stateData.name} has a top rate of ${stateData.taxRate}% for high earners.`} As a ${provinceData.name} resident, you'll also owe ${provinceData.name} provincial tax (top rate: ${provinceData.taxRate}%), but the Foreign Tax Credit prevents double taxation.`,
    },
    {
      question: `How does the US-Canada tax treaty help with ${employerData?.name || 'H-1B'} RSU taxation?`,
      answer: `Article XV of the US-Canada Tax Treaty allows you to claim Foreign Tax Credits (FTC) to offset taxes paid to one country against taxes owed to the other. This prevents being taxed twice on the same RSU income. The optimal filing strategy depends on which country has the higher tax rate - typically you file with the higher-tax country first and claim a credit on the other return.`,
    },
    {
      question: `What forms do I need to file for ${stateData.name} and ${provinceData.name}?`,
      answer: `For US taxes: Form 1040 (or 1040-NR if you left the US), ${stateData.code !== 'WA' && stateData.code !== 'TX' ? `${stateData.name} state return, ` : ''}Form 8938 (if foreign assets exceed $200K), and FBAR (FinCEN Form 114) if foreign bank accounts exceed $10K. For Canada: Form T1 (personal income tax), ${provinceData.code} provincial return, Form T2209 (federal foreign tax credits), and Form 5013 (provincial FTC). You may also need Form 8833 to claim treaty benefits.`,
    },
    {
      question: `When are ${employerData?.name || 'H-1B'} RSUs taxed - at vest or at sale?`,
      answer: `RSUs are taxed as ordinary income at vesting, not at sale. The fair market value on the vest date is reported as W-2 income (if vested while on US payroll) or must be self-reported if vested after moving to Canada. Capital gains tax applies later when you sell the shares, based on the difference between sale price and vest-date FMV. This creates a dual-taxation scenario requiring coordination between US and Canadian returns.`,
    },
    {
      question: `Can I use TaxBridge to file my ${stateData.name}-${provinceData.name} cross-border return?`,
      answer: `TaxBridge is a tax calculation and filing preparation tool, not a direct e-file service. We help you calculate exact tax amounts, optimize Foreign Tax Credits, and generate a detailed filing checklist with all required forms. You can then use this information to file yourself via IRS Free File and CRA NETFILE, or hand it to a cross-border CPA for final review. Our calculator saves you hours of research and ensures you don't miss critical treaty benefits.`,
    },
  ];

  // Related geo pages for internal linking
  const relatedPages = generateAllPageParams()
    .filter(p => p.state !== parsed.state || p.province !== parsed.province)
    .slice(0, 6)
    .map(p => {
      const relatedMeta = getPageMetadata(p.state, p.province, p.employer);
      const relatedSlug = p.employer
        ? `${p.employer}-${p.province.toLowerCase()}`
        : `${p.state.toLowerCase()}-${p.province.toLowerCase()}`;
      return {
        title: relatedMeta?.title || '',
        slug: relatedSlug,
      };
    });

  // JSON-LD structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="container mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 mb-6">
            <MapPin className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">
              {stateData.name} → {provinceData.name}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">
            {metadata.title}
          </h1>

          <p className="text-lg text-slate-400 mb-6">
            {employerData
              ? `Moving from ${employerData.headquarters} to ${provinceData.name}? Calculate your ${employerData.name} RSU taxes in both countries and maximize Foreign Tax Credit savings.`
              : `If you moved from ${stateData.name} to ${provinceData.name} on an H-1B/TN visa, you may owe taxes in both countries. ${stateData.name} income tax: ${stateData.taxRate}%, ${provinceData.name} tax: ${provinceData.taxRate}%. Use our calculator below to see your Foreign Tax Credit savings.`
            }
          </p>

          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8">
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="text-2xl font-bold text-emerald-400">{stateData.taxRate}%</div>
              <div className="text-xs text-slate-400 mt-1">{stateData.name} Tax</div>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="text-2xl font-bold text-emerald-400">{provinceData.taxRate}%</div>
              <div className="text-xs text-slate-400 mt-1">{provinceData.name} Tax</div>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="text-2xl font-bold text-emerald-400">$15K+</div>
              <div className="text-xs text-slate-400 mt-1">Avg FTC Savings</div>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="text-2xl font-bold text-emerald-400">12</div>
              <div className="text-xs text-slate-400 mt-1">Required Forms</div>
            </div>
          </div>
        </div>

        {/* Embedded Calculator */}
        <div className="max-w-6xl mx-auto mb-16">
          <TaxCalculatorWidget
            defaultState={stateData.code as any}
            defaultProvince={provinceData.code as any}
          />
        </div>

        {/* Local Tax Facts */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-100 mb-8 text-center">
            {stateData.name} to {provinceData.name}: Tax Facts You Need to Know
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* US State Facts */}
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-xl text-slate-100 flex items-center gap-2">
                  <span className="text-2xl">🇺🇸</span>
                  {stateData.name} Tax Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-slate-300">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>State Income Tax:</strong> {stateData.details}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Source State Rule:</strong> You owe {stateData.name} tax on RSUs that vested while physically working in {stateData.name}, even if you live in Canada now
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Filing Requirement:</strong> {stateData.taxRate === 0 ? 'No state return required' : `Must file ${stateData.name} state return if income was sourced there`}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Treaty Impact:</strong> US-Canada treaty Article XV determines RSU sourcing rules
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Canadian Province Facts */}
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-xl text-slate-100 flex items-center gap-2">
                  <span className="text-2xl">🇨🇦</span>
                  {provinceData.name} Tax Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-slate-300">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Provincial Income Tax:</strong> {provinceData.details}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Residency Rule:</strong> As a {provinceData.name} resident, you pay {provinceData.name} provincial tax on worldwide income including US RSUs
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Foreign Tax Credit:</strong> Form T2209 (federal) and Form 5013 (provincial) to claim credit for US taxes paid
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Currency Conversion:</strong> Must convert USD RSU income to CAD using Bank of Canada rates on vest date
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* US-Canada Treaty Article XV */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 to-slate-900/50">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-100 flex items-center gap-2">
                <FileText className="h-6 w-6 text-emerald-400" />
                US-Canada Tax Treaty Article XV: How It Protects You
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-300">
              <p>
                Article XV of the US-Canada Income Tax Treaty determines where employment income (including RSU vesting)
                should be taxed. The key principle: income is taxed based on where the work was performed, not where you live.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-800/50">
                  <h3 className="font-semibold text-emerald-400 mb-2">Sourcing Rule</h3>
                  <p className="text-sm">
                    RSUs are allocated between countries based on the number of days worked in each location between
                    grant date and vest date. If you worked 200 days in {stateData.name} and 100 days in {provinceData.name}
                    during the vesting period, 2/3 of the RSU value is US-sourced.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50">
                  <h3 className="font-semibold text-emerald-400 mb-2">Double Tax Prevention</h3>
                  <p className="text-sm">
                    The Foreign Tax Credit mechanism ensures you don't pay full tax to both countries. You pay tax to
                    both jurisdictions, but get a dollar-for-dollar credit on one return for taxes paid to the other
                    (up to the amount owed in the crediting country).
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-400 border-l-2 border-emerald-500 pl-4">
                <strong>Pro Tip:</strong> Always file Form 8833 (Treaty-Based Return Position Disclosure) when claiming
                treaty benefits. Failure to file this form can result in a $1,000 penalty per year, even if your tax
                position is correct.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Required Forms Checklist */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-100 mb-8 text-center">
            Required Forms: {stateData.name} to {provinceData.name} Tax Filing
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-xl text-slate-100">🇺🇸 US Federal & State</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div><strong>Form 1040 / 1040-NR</strong> - US personal income tax return</div>
                  </li>
                  {stateData.taxRate > 0 && (
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div><strong>{stateData.name} State Return</strong> - For income sourced in {stateData.name}</div>
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div><strong>Form 1116</strong> - Foreign Tax Credit for taxes paid to Canada</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div><strong>Form 8833</strong> - Treaty-based return position disclosure</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div><strong>Form 8938</strong> - Foreign assets if over $200K (FATCA)</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div><strong>FinCEN Form 114 (FBAR)</strong> - Foreign bank accounts over $10K</div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-xl text-slate-100">🇨🇦 Canada Federal & Provincial</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div><strong>Form T1</strong> - Personal income tax and benefit return</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div><strong>{provinceData.code} Provincial Return</strong> - {provinceData.name} provincial tax</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div><strong>Form T2209</strong> - Federal foreign tax credits</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div><strong>Form 5013</strong> - Provincial/territorial foreign tax credit</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div><strong>Form T1135</strong> - Foreign income verification statement (if assets &gt; $100K CAD)</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div><strong>Schedule 3</strong> - Capital gains/losses (for RSU sales)</div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-100 mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-slate-800 rounded-lg bg-slate-900/50 px-6"
              >
                <AccordionTrigger className="text-left text-slate-100 hover:text-emerald-400">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-300">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* CTA Section */}
        <div className="max-w-2xl mx-auto mb-16">
          <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-slate-900/50">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-slate-100">
                Ready to File Your {stateData.name}-{provinceData.name} Taxes?
              </CardTitle>
              <CardDescription className="text-base">
                Sign up for TaxBridge to save your calculations, track RSU vestings across years,
                and get step-by-step filing instructions optimized for your situation.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold"
                asChild
              >
                <a href="/dashboard">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Related Pages - Internal Linking */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-100 mb-6 text-center">
            Explore Other Tax Calculators
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {relatedPages.map((page, index) => (
              <a
                key={index}
                href={`/tax-calculator/${page.slug}`}
                className="p-4 rounded-lg border border-slate-700 bg-slate-800/50 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-colors"
              >
                <div className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">{page.title}</span>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-8 text-center">
            <a
              href="/h1b-rsu-tax-guide"
              className="text-emerald-400 hover:text-emerald-300 underline"
            >
              Read the Complete H-1B RSU Tax Guide
            </a>
            <span className="text-slate-600 mx-3">•</span>
            <a
              href="/canada-tax-filing-checklist"
              className="text-emerald-400 hover:text-emerald-300 underline"
            >
              Get the Full Filing Checklist
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
