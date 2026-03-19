/**
 * Blog Article Types and Data Structure
 */

export interface BlogArticle {
  slug: string;
  title: string;
  description: string;
  content: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  keywords: string[];
  category: string;
  readingTime: number;
  featured: boolean;
  image?: string;
}

export interface ArticleMetadata {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  category: string;
  targetKeyword: string;
}

/**
 * Article topics targeting long-tail keywords
 */
export const ARTICLE_TOPICS: ArticleMetadata[] = [
  {
    slug: 'h1b-rsu-taxation-complete-guide',
    title: 'H-1B RSU Taxation: Complete Guide for Tech Workers in 2026',
    description: 'Comprehensive guide to H-1B RSU taxation, covering vesting schedules, withholding rates, and cross-border tax obligations when moving to Canada.',
    keywords: ['H-1B RSU taxation', 'stock compensation tax', 'tech worker taxes', 'RSU withholding'],
    category: 'RSU Taxation',
    targetKeyword: 'H-1B RSU taxation guide'
  },
  {
    slug: 'form-8938-vs-fbar-complete-comparison',
    title: 'Form 8938 vs FBAR: Complete Comparison for Cross-Border Taxpayers',
    description: 'Detailed breakdown of Form 8938 and FBAR requirements, filing thresholds, penalties, and when you need to file both forms.',
    keywords: ['Form 8938', 'FBAR', 'foreign asset reporting', 'cross-border tax compliance'],
    category: 'Tax Compliance',
    targetKeyword: 'Form 8938 vs FBAR explained'
  },
  {
    slug: 'tn-visa-tax-mistakes-avoid',
    title: '7 Critical TN Visa Tax Mistakes That Cost Thousands',
    description: 'Common tax mistakes TN visa holders make when working in the US, including residency status errors, treaty claims, and state tax issues.',
    keywords: ['TN visa taxes', 'Canadian working in US', 'tax treaty mistakes', 'cross-border tax errors'],
    category: 'TN Visa',
    targetKeyword: 'TN visa tax mistakes'
  },
  {
    slug: 'foreign-tax-credit-calculator-optimization',
    title: 'Foreign Tax Credit Calculator: Maximize Your Tax Savings in 2026',
    description: 'How to calculate and optimize foreign tax credits when filing US and Canadian taxes, with real examples and strategic planning tips.',
    keywords: ['foreign tax credit', 'FTC calculator', 'dual taxation', 'tax treaty benefits'],
    category: 'Tax Planning',
    targetKeyword: 'foreign tax credit calculator'
  },
  {
    slug: 'cross-border-cpa-alternatives',
    title: 'Cross-Border CPA Alternatives: DIY Tax Software Saves $3,000+',
    description: 'Why cross-border CPAs charge $3,000-5,000 and how modern tax software can automate the same calculations for a fraction of the cost.',
    keywords: ['cross-border CPA', 'tax software alternatives', 'DIY tax filing', 'H-1B tax preparation'],
    category: 'Tax Planning',
    targetKeyword: 'cross-border CPA alternatives'
  },
  {
    slug: 'canada-us-tax-treaty-article-xv',
    title: 'Canada-US Tax Treaty Article XV: Employment Income Explained',
    description: 'Complete guide to Article XV of the Canada-US tax treaty, covering employment income, remote work, and cross-border taxation rules.',
    keywords: ['Canada US tax treaty', 'Article XV', 'employment income', 'treaty benefits'],
    category: 'Tax Treaty',
    targetKeyword: 'Canada US tax treaty Article XV'
  },
  {
    slug: 'rsu-vesting-tax-planning-strategies',
    title: 'RSU Vesting Tax Planning: Strategies to Minimize Your Tax Bill',
    description: 'Advanced tax planning strategies for RSU vesting, including timing optimization, cross-border considerations, and withholding management.',
    keywords: ['RSU vesting', 'tax planning strategies', 'stock compensation', 'withholding optimization'],
    category: 'RSU Taxation',
    targetKeyword: 'RSU vesting tax planning'
  },
  {
    slug: 'state-tax-obligations-h1b-workers',
    title: 'State Tax Obligations for H-1B Workers: Complete 50-State Guide',
    description: 'State-by-state guide to income tax obligations for H-1B workers, covering residency rules, reciprocal agreements, and remote work complications.',
    keywords: ['state taxes H-1B', 'non-resident state tax', 'multi-state taxation', 'remote work taxes'],
    category: 'State Taxes',
    targetKeyword: 'H-1B state tax obligations'
  },
  {
    slug: 'canadian-rrsp-us-tax-treatment',
    title: 'Canadian RRSP US Tax Treatment: What H-1B Workers Must Know',
    description: 'How RRSPs are taxed in the US, treaty elections, Form 8891 requirements, and strategic planning for cross-border retirement accounts.',
    keywords: ['RRSP US taxes', 'Canadian retirement account', 'Form 8891', 'cross-border retirement'],
    category: 'Retirement Planning',
    targetKeyword: 'RRSP US tax treatment'
  },
  {
    slug: 'exit-tax-leaving-usa-guide',
    title: 'Exit Tax When Leaving USA: Do H-1B Workers Need to Worry?',
    description: 'Comprehensive guide to US exit tax rules, covered expatriates, substantial presence test, and tax implications of returning to Canada.',
    keywords: ['US exit tax', 'expatriation tax', 'leaving USA taxes', 'covered expatriate'],
    category: 'Expatriation',
    targetKeyword: 'exit tax leaving USA'
  },
  {
    slug: 'dual-status-tax-return-filing',
    title: 'Dual Status Tax Return: The Complete Filing Guide for 2026',
    description: 'How to file a dual status tax return when transitioning between US resident and non-resident status, with step-by-step instructions.',
    keywords: ['dual status tax return', 'part-year resident', 'Form 1040NR', 'first year choice'],
    category: 'Tax Filing',
    targetKeyword: 'dual status tax return'
  },
  {
    slug: 'substantial-presence-test-calculator',
    title: 'Substantial Presence Test Calculator: Determine Your US Tax Status',
    description: 'Complete guide to the substantial presence test with calculator, day counting rules, treaty tie-breaker provisions, and strategic planning.',
    keywords: ['substantial presence test', 'tax residency', 'US tax status', 'day counting'],
    category: 'Tax Residency',
    targetKeyword: 'substantial presence test calculator'
  },
  {
    slug: 'amt-alternative-minimum-tax-isos',
    title: 'AMT and ISOs: Why Incentive Stock Options Trigger Huge Tax Bills',
    description: 'How Alternative Minimum Tax (AMT) affects ISO exercises, calculating AMT liability, and strategies to minimize cross-border complications.',
    keywords: ['AMT ISO', 'alternative minimum tax', 'incentive stock options', 'ISO tax planning'],
    category: 'Stock Options',
    targetKeyword: 'AMT ISO tax'
  },
  {
    slug: 'tfsa-us-tax-treatment-trap',
    title: 'TFSA US Tax Treatment: The Costly Trap for Canadian Immigrants',
    description: 'Why Tax-Free Savings Accounts (TFSA) are NOT tax-free in the US, PFIC reporting requirements, and better alternatives for H-1B workers.',
    keywords: ['TFSA US taxes', 'PFIC reporting', 'Canadian TFSA', 'Form 8621'],
    category: 'Investment Accounts',
    targetKeyword: 'TFSA US tax treatment'
  },
  {
    slug: 'h1b-to-green-card-tax-implications',
    title: 'H-1B to Green Card: Hidden Tax Implications You Need to Know',
    description: 'Tax changes when transitioning from H-1B to green card holder, worldwide income reporting, and strategic planning timeline.',
    keywords: ['H-1B to green card taxes', 'permanent resident tax', 'worldwide income', 'tax planning'],
    category: 'Immigration Tax',
    targetKeyword: 'H-1B green card tax implications'
  },
  {
    slug: 'estimated-tax-payments-cross-border',
    title: 'Estimated Tax Payments for Cross-Border Workers: Avoid Penalties',
    description: 'When cross-border workers must make estimated tax payments, calculation methods, safe harbor rules, and penalty avoidance strategies.',
    keywords: ['estimated taxes', 'quarterly payments', 'Form 1040-ES', 'underpayment penalty'],
    category: 'Tax Payments',
    targetKeyword: 'estimated tax payments cross-border'
  },
  {
    slug: 'remote-work-canada-us-tax',
    title: 'Remote Work Canada to US: Complete Tax Guide for 2026',
    description: 'Tax implications of working remotely from Canada for a US employer, permanent establishment rules, and treaty protection.',
    keywords: ['remote work Canada US', 'cross-border remote work', 'work from home taxes', 'employer tax obligations'],
    category: 'Remote Work',
    targetKeyword: 'remote work Canada US tax'
  },
  {
    slug: 'crypto-cross-border-tax-reporting',
    title: 'Crypto Cross-Border Tax Reporting: US and Canada Requirements',
    description: 'How to report cryptocurrency on US and Canadian tax returns, FBAR requirements, capital gains treatment, and foreign exchange calculations.',
    keywords: ['crypto taxes', 'cryptocurrency reporting', 'Bitcoin taxes', 'cross-border crypto'],
    category: 'Cryptocurrency',
    targetKeyword: 'crypto cross-border tax'
  },
  {
    slug: 'marriage-cross-border-tax-planning',
    title: 'Marriage and Cross-Border Taxes: Joint vs Separate Filing Guide',
    description: 'Tax planning for cross-border couples, filing status choices, spouse visa implications, and optimizing for dual-country obligations.',
    keywords: ['married cross-border taxes', 'joint filing', 'spouse tax planning', 'international couples'],
    category: 'Family Tax',
    targetKeyword: 'cross-border marriage tax'
  },
  {
    slug: 'first-time-tax-filer-h1b-checklist',
    title: 'First-Time H-1B Tax Filer: Complete Checklist and Timeline',
    description: 'Step-by-step checklist for first-time H-1B tax filers, document gathering, software selection, and avoiding common mistakes.',
    keywords: ['first-time H-1B taxes', 'new immigrant taxes', 'tax filing checklist', 'H-1B tax guide'],
    category: 'Tax Filing',
    targetKeyword: 'first-time H-1B tax filing'
  },
  {
    slug: 'tn-visa-tax-filing-checklist',
    title: 'TN Visa Tax Filing Checklist: Complete 2026 Guide for Canadians Working in the US',
    description: 'Step-by-step TN visa tax filing checklist for Canadians working in the US. Covers residency status, treaty benefits, required forms, state taxes, and common mistakes that cost thousands.',
    keywords: ['TN visa taxes', 'TN visa tax filing', 'Canadian working in US taxes', 'tax treaty benefits', 'cross-border tax checklist', 'TN visa tax guide', 'substantial presence test', 'Form 8833'],
    category: 'TN Visa',
    targetKeyword: 'TN visa tax filing checklist'
  },
  {
    slug: 'cross-border-tax-mistakes-avoid',
    title: '10 Cross-Border Tax Mistakes That Cost H-1B and TN Workers Thousands',
    description: 'Avoid these costly cross-border tax mistakes made by H-1B and TN visa holders moving between the US and Canada. Real examples show how errors cost $5,000-$20,000 in penalties and overpaid taxes.',
    keywords: ['cross-border tax mistakes', 'H-1B tax errors', 'TN visa tax mistakes', 'FBAR penalties', 'TFSA US tax', 'foreign tax credit mistakes', 'tax filing errors', 'avoid tax penalties'],
    category: 'Tax Planning',
    targetKeyword: 'cross-border tax mistakes to avoid'
  },
  {
    slug: 'rsu-vs-espp-tax-comparison',
    title: 'RSU vs ESPP Tax Comparison: Which Stock Compensation Saves You More?',
    description: 'Complete tax comparison of RSUs vs ESPP for tech workers. Covers withholding rates, capital gains treatment, cross-border implications, and strategies to minimize taxes on each.',
    keywords: ['RSU vs ESPP', 'RSU tax comparison', 'ESPP tax treatment', 'stock compensation tax', 'qualifying disposition', 'employee stock purchase plan', 'restricted stock units', 'tech worker compensation'],
    category: 'Stock Compensation',
    targetKeyword: 'RSU vs ESPP tax comparison'
  },
  {
    slug: 'rrsp-vs-401k-comparison',
    title: 'Canadian RRSP vs US 401(k): Complete Tax Comparison for Cross-Border Workers',
    description: 'Comprehensive comparison of RRSP vs 401(k) for H-1B and TN visa holders. Covers contribution limits, tax treatment, withdrawal rules, cross-border implications, and optimization strategies.',
    keywords: ['RRSP vs 401k', 'Canadian RRSP US tax', '401k in Canada', 'cross-border retirement', 'RRSP treaty protection', 'retirement account comparison', 'H-1B 401k', 'TN visa RRSP'],
    category: 'Retirement Planning',
    targetKeyword: 'RRSP vs 401k comparison'
  }
];

/**
 * Get article by slug
 */
export function getArticleMetadata(slug: string): ArticleMetadata | undefined {
  return ARTICLE_TOPICS.find(article => article.slug === slug);
}

/**
 * Get all article slugs
 */
export function getAllArticleSlugs(): string[] {
  return ARTICLE_TOPICS.map(article => article.slug);
}

/**
 * Get articles by category
 */
export function getArticlesByCategory(category: string): ArticleMetadata[] {
  return ARTICLE_TOPICS.filter(article => article.category === category);
}

/**
 * Get all categories
 */
export function getAllCategories(): string[] {
  return Array.from(new Set(ARTICLE_TOPICS.map(article => article.category)));
}
