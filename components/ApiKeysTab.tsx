'use client';

/**
 * API Keys Management Component
 * Generate, view, and revoke API keys for enterprise organizations
 */

import { useState } from 'react';
import { Key, Copy, Trash2, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

interface ApiKeysTabProps {
  orgId: number;
  orgName: string;
  existingApiKey: string | null;
}

export default function ApiKeysTab({ orgId, orgName, existingApiKey }: ApiKeysTabProps) {
  const [apiKey, setApiKey] = useState<string | null>(existingApiKey);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newlyGenerated, setNewlyGenerated] = useState(false);

  const handleGenerateApiKey = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/enterprise/api-keys/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orgId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate API key');
      }

      const data = await response.json();
      setApiKey(data.api_key);
      setShowApiKey(true);
      setNewlyGenerated(true);
    } catch (err: any) {
      setError(err.message || 'Failed to generate API key');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevokeApiKey = async () => {
    if (!confirm('Are you sure you want to revoke this API key? All integrations using this key will stop working.')) {
      return;
    }

    setIsRevoking(true);
    setError(null);

    try {
      const response = await fetch('/api/enterprise/api-keys/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orgId }),
      });

      if (!response.ok) {
        throw new Error('Failed to revoke API key');
      }

      setApiKey(null);
      setShowApiKey(false);
      setNewlyGenerated(false);
    } catch (err: any) {
      setError(err.message || 'Failed to revoke API key');
    } finally {
      setIsRevoking(false);
    }
  };

  const handleCopyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const maskedApiKey = apiKey ? `${apiKey.substring(0, 15)}${'*'.repeat(apiKey.length - 15)}` : '';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-100 mb-2">API Keys</h2>
            <p className="text-slate-400">
              Manage API keys for programmatic access to TaxBridge calculation endpoints
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-500">
            <Key className="h-4 w-4" />
            <span>{orgName}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* New Key Warning */}
        {newlyGenerated && (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/50 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-amber-400 font-medium mb-1">
                Important: Copy your API key now
              </p>
              <p className="text-sm text-amber-400/80">
                For security reasons, we can only show you this key once. If you lose it, you'll need to generate a new one.
              </p>
            </div>
          </div>
        )}

        {/* API Key Display */}
        {apiKey ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Your API Key
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 font-mono text-sm text-slate-100">
                  {showApiKey ? apiKey : maskedApiKey}
                </div>
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
                  title={showApiKey ? 'Hide API key' : 'Show API key'}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4 text-slate-300" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-300" />
                  )}
                </button>
                <button
                  onClick={handleCopyApiKey}
                  className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
                  title="Copy to clipboard"
                >
                  {copySuccess ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-slate-300" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleRevokeApiKey}
                disabled={isRevoking}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600/10 hover:bg-red-600/20 border border-red-600/50 text-red-400 rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                <span>{isRevoking ? 'Revoking...' : 'Revoke API Key'}</span>
              </button>
            </div>

            {/* Usage Instructions */}
            <div className="border-t border-slate-800 pt-6">
              <h3 className="text-lg font-semibold text-slate-100 mb-4">Usage Example</h3>
              <div className="bg-slate-950 border border-slate-700 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-slate-300 font-mono whitespace-pre">
{`curl -X POST https://taxbridge.app/api/v1/calculate \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "employer": "Meta",
    "vest_date": "2025-03-15",
    "shares_vested": 100,
    "fmv_per_share_usd": 580.50,
    "us_state": "CA",
    "canada_province": "BC",
    "filing_status": "single"
  }'`}
                </pre>
              </div>
              <div className="mt-4">
                <a
                  href="/api-docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300"
                >
                  View full API documentation →
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800/50 rounded-full mb-4">
              <Key className="h-8 w-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">No API Key Generated</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Generate an API key to enable programmatic access to TaxBridge calculation endpoints.
            </p>
            <button
              onClick={handleGenerateApiKey}
              disabled={isGenerating}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Key className="h-4 w-4" />
              <span>{isGenerating ? 'Generating...' : 'Generate API Key'}</span>
            </button>
          </div>
        )}

        {/* API Features */}
        <div className="border-t border-slate-800 mt-8 pt-8">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">API Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-emerald-500 font-semibold mb-1">Tax Calculations</div>
              <div className="text-sm text-slate-400">
                Calculate cross-border RSU taxes with FTC optimization
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-blue-500 font-semibold mb-1">Required Forms</div>
              <div className="text-sm text-slate-400">
                Get list of required tax forms based on user situation
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-purple-500 font-semibold mb-1">Bulk CSV Import</div>
              <div className="text-sm text-slate-400">
                Process 100+ employees in a single API call
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
