'use client';

import { useState } from 'react';

interface CampaignStats {
  phRank: number;
  phUpvotes: number;
  phUrl: string;
  emailsSent: number;
  emailsDelivered: number;
  emailsOpened: number;
  emailsClicked: number;
  conversions: number;
}

export default function PostLaunchCampaignPage() {
  const [stats, setStats] = useState<CampaignStats>({
    phRank: 0,
    phUpvotes: 0,
    phUrl: '',
    emailsSent: 0,
    emailsDelivered: 0,
    emailsOpened: 0,
    emailsClicked: 0,
    conversions: 0,
  });

  const [emailListFile, setEmailListFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string>('');

  // Social media posts
  const twitterPost = stats.phRank > 0
    ? `🚀 We just hit #${stats.phRank} on Product Hunt!

TaxBridge helps H-1B and TN visa holders navigate cross-border tax complexity between the US and Canada.

Thanks to everyone who supported us! 🙏

Special offer for PH voters: 20% off with code HUNT20 (7 days only)

${stats.phUrl}`
    : 'Update Product Hunt stats first';

  const linkedinPost = stats.phRank > 0
    ? `I'm excited to share that TaxBridge just hit #${stats.phRank} on Product Hunt! 🎉

With ${stats.phUpvotes}+ upvotes from the community, we're humbled by the support.

TaxBridge solves a painful problem for cross-border workers: filing taxes in both the US and Canada while optimizing for Foreign Tax Credits on RSUs.

For H-1B and TN visa holders who live in Canada and work for US companies, tax season is a nightmare. Our calculator makes it simple.

Special thanks to everyone who voted and shared feedback. Your support means the world to us.

🎁 For Product Hunt supporters: 20% off with code HUNT20 (expires in 7 days)

Check it out: ${stats.phUrl}

#ProductHunt #TaxTech #CrossBorderTax #H1B #TNVisa`
    : 'Update Product Hunt stats first';

  const hackerNewsPost = stats.phRank > 0
    ? `Show HN: TaxBridge – Cross-border tax calculator for H-1B/TN visa holders

Hi HN! I'm Michael, and I built TaxBridge after struggling with my own cross-border taxes as a TN visa holder living in Canada and working for a US company.

PROBLEM:
If you're on an H-1B or TN visa, living in Canada, with RSUs from a US company, you're stuck filing taxes in BOTH countries. The Foreign Tax Credit (Form 1116) can save you from double taxation, but calculating it is a nightmare.

SOLUTION:
TaxBridge is a dual calculator that shows your US and Canada tax side-by-side, automatically calculates your Foreign Tax Credit, and tells you exactly how much you'll save.

KEY FEATURES:
- Dual country tax calculation (US + Canada)
- Foreign Tax Credit (FTC) optimization
- RSU vesting schedule tracking
- Multi-year tax projections
- Form 1116 & T1135 assistance

TECH STACK:
- Next.js 15 (React 18)
- TypeScript
- SQLite (migrating to Postgres)
- Stripe for payments
- PostHog for analytics

We just launched on Product Hunt (hit #${stats.phRank}!) and wanted to share with the HN community.

Try it: https://taxbridge.app
Demo calculator: https://taxbridge.app/calculator

Happy to answer questions about cross-border tax, the tech stack, or anything else!`
    : 'Update Product Hunt stats first';

  const handleSendEmails = async () => {
    if (!emailListFile) {
      setResult('Please upload an email list CSV first');
      return;
    }

    setSending(true);
    setResult('Sending emails...');

    try {
      const formData = new FormData();
      formData.append('emailList', emailListFile);
      formData.append('phRank', stats.phRank.toString());
      formData.append('phUpvotes', stats.phUpvotes.toString());
      formData.append('phUrl', stats.phUrl);

      const response = await fetch('/api/admin/send-ph-campaign', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(`✅ Success! Sent ${data.sent} of ${data.total} emails (${data.failed} failed)`);
        setStats(prev => ({
          ...prev,
          emailsSent: prev.emailsSent + data.sent,
        }));
      } else {
        setResult(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSending(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setResult(`✅ Copied ${label} to clipboard!`);

    // Clear message after 3 seconds
    setTimeout(() => setResult(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Post-Product Hunt Launch Campaign
          </h1>
          <p className="text-gray-600">
            Execute the 48-hour momentum campaign: Email PH voters, share on social media, cross-post to HN
          </p>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>⏰ CRITICAL TIMELINE:</strong> This campaign must be executed within 48 hours of Product Hunt launch for maximum impact.
            </p>
          </div>
        </div>

        {/* Step 1: Update Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Step 1: Update Product Hunt Stats
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Hunt Rank
              </label>
              <input
                type="number"
                value={stats.phRank}
                onChange={(e) => setStats(prev => ({ ...prev, phRank: parseInt(e.target.value) || 0 }))}
                placeholder="e.g., 3"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Upvotes
              </label>
              <input
                type="number"
                value={stats.phUpvotes}
                onChange={(e) => setStats(prev => ({ ...prev, phUpvotes: parseInt(e.target.value) || 0 }))}
                placeholder="e.g., 247"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Hunt URL
              </label>
              <input
                type="url"
                value={stats.phUrl}
                onChange={(e) => setStats(prev => ({ ...prev, phUrl: e.target.value }))}
                placeholder="https://www.producthunt.com/posts/taxbridge"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Email Campaign */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Step 2: Email All Product Hunt Voters
          </h2>
          <p className="text-gray-600 mb-4">
            Upload a CSV file with columns: <code className="bg-gray-100 px-2 py-1 rounded">firstName, email</code>
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email List CSV
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setEmailListFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleSendEmails}
              disabled={sending || !emailListFile || !stats.phRank}
              className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending...' : 'Send Emails to All Voters'}
            </button>

            {result && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">{result}</p>
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold text-gray-900 mb-2">Email Preview:</h3>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Subject:</strong> Thanks for your Product Hunt vote! Here's 20% off 🎁
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <strong>From:</strong> Michael from TaxBridge
            </p>
            <p className="text-sm text-gray-600">
              <strong>Promo Code:</strong> HUNT20 (20% off, expires in 7 days)
            </p>
          </div>
        </div>

        {/* Step 3: Social Media Posts */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Step 3: Share on Twitter & LinkedIn
          </h2>

          {/* Twitter */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span className="text-blue-400">𝕏</span> Twitter/X Post
            </h3>
            <textarea
              value={twitterPost}
              readOnly
              rows={10}
              className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-50 font-mono text-sm"
            />
            <button
              onClick={() => copyToClipboard(twitterPost, 'Twitter post')}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Copy Twitter Post
            </button>
          </div>

          {/* LinkedIn */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span className="text-blue-600">in</span> LinkedIn Post
            </h3>
            <textarea
              value={linkedinPost}
              readOnly
              rows={20}
              className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-50 font-mono text-sm"
            />
            <button
              onClick={() => copyToClipboard(linkedinPost, 'LinkedIn post')}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Copy LinkedIn Post
            </button>
          </div>
        </div>

        {/* Step 4: Hacker News */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Step 4: Cross-Post to Hacker News (Show HN)
          </h2>
          <p className="text-gray-600 mb-4">
            Post this within 48 hours of PH launch for maximum momentum.
          </p>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Show HN Post</h3>
            <textarea
              value={hackerNewsPost}
              readOnly
              rows={25}
              className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-50 font-mono text-sm"
            />
            <button
              onClick={() => copyToClipboard(hackerNewsPost, 'Hacker News post')}
              className="mt-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              Copy Hacker News Post
            </button>
          </div>

          <div className="p-4 bg-orange-50 border border-orange-200 rounded">
            <h4 className="font-semibold text-orange-900 mb-2">How to Post on Hacker News:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-orange-800">
              <li>Go to <a href="https://news.ycombinator.com/submit" target="_blank" rel="noopener" className="underline">news.ycombinator.com/submit</a></li>
              <li>Title: Copy the first line above (starts with "Show HN:")</li>
              <li>Text: Paste the full post above</li>
              <li>Submit and engage with comments for 2-4 hours</li>
            </ol>
          </div>
        </div>

        {/* Campaign Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Campaign Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-gray-600">Emails Sent</p>
              <p className="text-2xl font-bold text-blue-600">{stats.emailsSent}</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <p className="text-sm text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-green-600">{stats.emailsDelivered}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <p className="text-sm text-gray-600">Opened</p>
              <p className="text-2xl font-bold text-purple-600">{stats.emailsOpened}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded">
              <p className="text-sm text-gray-600">Conversions</p>
              <p className="text-2xl font-bold text-orange-600">{stats.conversions}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
