'use client';

import { Suspense, useState, useEffect } from 'react';
import { Calculator, TrendingUp, DollarSign, Clock, Users, CheckCircle2, Share2, Copy, Building2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

function ROICalculatorContent() {
  const searchParams = useSearchParams();

  const [clientCount, setClientCount] = useState<number>(50);
  const [hoursPerClient, setHoursPerClient] = useState<number>(5);
  const [hourlyRate, setHourlyRate] = useState<number>(100);
  const [firmName, setFirmName] = useState<string>('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Load values from URL params on mount
  useEffect(() => {
    const urlClients = searchParams.get('clients');
    const urlHours = searchParams.get('hours');
    const urlRate = searchParams.get('rate');
    const urlFirm = searchParams.get('firm');

    if (urlClients) setClientCount(Math.max(1, parseInt(urlClients) || 50));
    if (urlHours) setHoursPerClient(Math.max(0.5, parseFloat(urlHours) || 5));
    if (urlRate) setHourlyRate(Math.max(50, parseInt(urlRate) || 100));
    if (urlFirm) setFirmName(decodeURIComponent(urlFirm));
  }, [searchParams]);

  // Calculations
  const totalHoursSaved = clientCount * hoursPerClient;
  const costSavings = totalHoursSaved * hourlyRate;
  const taxBridgeCost = clientCount * 2000; // $2K per seat per year
  const netROI = costSavings - taxBridgeCost;
  const roiPercentage = taxBridgeCost > 0 ? Math.round((netROI / taxBridgeCost) * 100) : 0;
  const paybackMonths = taxBridgeCost > 0 ? Math.max(1, Math.round((taxBridgeCost / costSavings) * 12)) : 0;

  // Generate shareable URL
  const generateShareURL = () => {
    const baseURL = typeof window !== 'undefined' ? window.location.origin : '';
    const params = new URLSearchParams({
      clients: clientCount.toString(),
      hours: hoursPerClient.toString(),
      rate: hourlyRate.toString(),
    });
    if (firmName) params.set('firm', encodeURIComponent(firmName));
    return `${baseURL}/enterprise/calculator?${params.toString()}`;
  };

  const copyToClipboard = () => {
    const url = generateShareURL();
    navigator.clipboard.writeText(url);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background Grid */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(255,255,255,0.05) 80px, rgba(255,255,255,0.05) 81px),
            repeating-linear-gradient(90deg, transparent, transparent 80px, rgba(255,255,255,0.05) 80px, rgba(255,255,255,0.05) 81px)
          `,
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-emerald-500">TaxBridge</div>
          </Link>
          <Link
            href="/enterprise/request-demo"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Request Demo
          </Link>
        </div>
      </header>

      <main className="relative container mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-900/20 border border-emerald-700/30 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Calculator className="h-4 w-4" />
            Enterprise ROI Calculator
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">
            Calculate Your Firm's ROI
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            See how much time and money your immigration law firm or corporate tax department can save with TaxBridge Enterprise.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-6">Your Firm's Details</h2>

            <div className="space-y-6">
              {/* Firm Name */}
              <div>
                <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-2">
                  <Building2 className="h-4 w-4 text-purple-500" />
                  Firm Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Berry Appleman & Leiden LLP"
                  value={firmName}
                  onChange={(e) => setFirmName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Client Count */}
              <div>
                <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-2">
                  <Users className="h-4 w-4 text-emerald-500" />
                  Number of H-1B/TN Clients
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={clientCount}
                  onChange={(e) => setClientCount(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="range"
                  min="1"
                  max="200"
                  value={clientCount}
                  onChange={(e) => setClientCount(parseInt(e.target.value))}
                  className="w-full mt-2 accent-emerald-500"
                />
              </div>

              {/* Hours per Client */}
              <div>
                <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  Hours Spent per Client (Manual Tax Calculation)
                </label>
                <input
                  type="number"
                  min="0.5"
                  max="20"
                  step="0.5"
                  value={hoursPerClient}
                  onChange={(e) => setHoursPerClient(Math.max(0.5, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={hoursPerClient}
                  onChange={(e) => setHoursPerClient(parseFloat(e.target.value))}
                  className="w-full mt-2 accent-blue-500"
                />
              </div>

              {/* CPA Hourly Rate */}
              <div>
                <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-2">
                  <DollarSign className="h-4 w-4 text-amber-500" />
                  CPA Hourly Rate (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input
                    type="number"
                    min="50"
                    max="500"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Math.max(50, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <input
                  type="range"
                  min="50"
                  max="300"
                  step="10"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(parseInt(e.target.value))}
                  className="w-full mt-2 accent-amber-500"
                />
              </div>
            </div>

            {/* Assumptions */}
            <div className="mt-8 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
              <h3 className="text-slate-300 text-sm font-medium mb-2">Assumptions:</h3>
              <ul className="text-slate-400 text-sm space-y-1">
                <li>• Manual dual-country tax calculations take {hoursPerClient} hours per client</li>
                <li>• TaxBridge reduces this to ~30 minutes per client</li>
                <li>• Enterprise pricing: $2,000 per seat per year</li>
              </ul>
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-gradient-to-br from-emerald-900/30 to-blue-900/30 backdrop-blur-sm border border-emerald-700/30 rounded-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-600 rounded-full p-2">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-100">Annual ROI</h2>
                  <p className="text-slate-400 text-sm">First year return on investment</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-baseline justify-between border-b border-slate-700 pb-3">
                  <span className="text-slate-300">Total Time Saved</span>
                  <span className="text-2xl font-bold text-emerald-400">{totalHoursSaved.toLocaleString()} hrs</span>
                </div>

                <div className="flex items-baseline justify-between border-b border-slate-700 pb-3">
                  <span className="text-slate-300">Cost Savings</span>
                  <span className="text-2xl font-bold text-blue-400">${costSavings.toLocaleString()}</span>
                </div>

                <div className="flex items-baseline justify-between border-b border-slate-700 pb-3">
                  <span className="text-slate-300">TaxBridge Cost</span>
                  <span className="text-2xl font-bold text-amber-400">-${taxBridgeCost.toLocaleString()}</span>
                </div>

                <div className="flex items-baseline justify-between pt-3">
                  <span className="text-slate-100 font-medium">Net Savings</span>
                  <span className="text-3xl font-bold text-emerald-400">${netROI.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* ROI Percentage */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300">ROI Percentage</span>
                <span className={`text-4xl font-bold ${roiPercentage > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {roiPercentage > 0 ? '+' : ''}{roiPercentage}%
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-blue-500 h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, roiPercentage))}%` }}
                />
              </div>
            </div>

            {/* Payback Period */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-300 text-sm mb-1">Payback Period</div>
                  <div className="text-3xl font-bold text-slate-100">{paybackMonths} {paybackMonths === 1 ? 'month' : 'months'}</div>
                </div>
                <div className="bg-blue-900/30 rounded-full p-3">
                  <Clock className="h-8 w-8 text-blue-400" />
                </div>
              </div>
            </div>

            {/* Benefits List */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-6">
              <h3 className="text-slate-100 font-medium mb-4">Additional Benefits:</h3>
              <ul className="space-y-3">
                {[
                  'Automated dual-country tax calculations',
                  'Foreign Tax Credit optimization',
                  'White-label PDF reports',
                  'CSV bulk import for 50+ employees',
                  'API integration with accounting software',
                  'Priority support & dedicated account manager',
                ].map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <Link
              href="/enterprise/request-demo"
              className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white text-center font-bold py-4 px-6 rounded-lg transition-colors"
            >
              Request Demo — Save ${netROI.toLocaleString()} This Year
            </Link>

            {/* Share Button */}
            <button
              onClick={() => setShowShareModal(true)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share This Calculation
            </button>
          </div>
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-lg w-full p-6">
              <h3 className="text-xl font-bold text-slate-100 mb-4">Share ROI Calculation</h3>
              <p className="text-slate-400 text-sm mb-6">
                Share this custom ROI calculation with your team or prospects. The URL will pre-fill all values.
              </p>

              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between gap-3">
                  <input
                    type="text"
                    readOnly
                    value={generateShareURL()}
                    className="flex-1 bg-transparent text-slate-300 text-sm focus:outline-none"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    {copySuccess ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
                <a
                  href={`mailto:?subject=${encodeURIComponent(`TaxBridge ROI Calculator${firmName ? ` - ${firmName}` : ''}`)}&body=${encodeURIComponent(`Check out this ROI calculation for TaxBridge Enterprise:\n\n${generateShareURL()}`)}`}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center"
                >
                  Email Link
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Case Study */}
        <div className="max-w-5xl mx-auto mt-16 bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-8">
          <div className="flex items-start gap-6">
            <div className="bg-emerald-600 rounded-lg p-4 flex-shrink-0">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-100 mb-2">Case Study: Smith Immigration LLP</h3>
              <p className="text-slate-400 mb-4">
                Vancouver-based immigration law firm managing 80 H-1B/TN visa holders working at Meta, Amazon, and Microsoft.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-slate-400 text-sm mb-1">Before TaxBridge</div>
                  <div className="text-2xl font-bold text-red-400">400 hrs/year</div>
                  <div className="text-slate-500 text-sm">Manual tax calculations</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-slate-400 text-sm mb-1">After TaxBridge</div>
                  <div className="text-2xl font-bold text-emerald-400">40 hrs/year</div>
                  <div className="text-slate-500 text-sm">Automated workflows</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-slate-400 text-sm mb-1">Annual Savings</div>
                  <div className="text-2xl font-bold text-blue-400">$36K</div>
                  <div className="text-slate-500 text-sm">90% time reduction</div>
                </div>
              </div>
              <blockquote className="border-l-4 border-emerald-600 pl-4 text-slate-300 italic">
                "TaxBridge transformed our practice. We now handle 80 cross-border clients with the same effort we used to spend on 10. Our clients love the detailed FTC reports."
                <div className="mt-2 text-slate-400 not-italic text-sm">
                  — Jennifer Smith, Managing Partner
                </div>
              </blockquote>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ROICalculatorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <ROICalculatorContent />
    </Suspense>
  );
}
