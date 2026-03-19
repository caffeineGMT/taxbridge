'use client';

/**
 * API Documentation Page
 * Interactive Swagger UI for TaxBridge REST API
 */

import dynamic from 'next/dynamic';

// Dynamically import SwaggerUI with its CSS to avoid loading ~1MB of CSS on other pages
const SwaggerUI = dynamic(
  async () => {
    // Import CSS alongside component so it only loads when this page is visited
    // @ts-ignore - CSS imports don't have type declarations
    await import('swagger-ui-react/swagger-ui.css');
    return import('swagger-ui-react');
  },
  {
    ssr: false,
    loading: () => (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    ),
  }
);

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">TaxBridge API Documentation</h1>
              <p className="mt-2 text-sm text-gray-600">
                Cross-border RSU tax calculation API for payroll platforms and HR systems
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                ← Back to TaxBridge
              </a>
              <a
                href="/enterprise"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Get API Key
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Start Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Start</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">1. Get your API key</h3>
              <p className="text-sm text-gray-600">
                Contact <a href="mailto:sales@taxbridge.app" className="text-blue-600 hover:underline">sales@taxbridge.app</a> or generate one in the{' '}
                <a href="/enterprise" className="text-blue-600 hover:underline">Enterprise Dashboard</a>
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">2. Make your first API call</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`curl -X POST https://taxbridge.app/api/v1/calculate \\
  -H "Authorization: Bearer sk_live_your_api_key_here" \\
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

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">3. Download sample CSV for bulk import</h3>
              <a
                href="/api/v1/bulk-import/sample"
                download="taxbridge_bulk_import_sample.csv"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                Download sample CSV template →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Swagger UI */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <SwaggerUI url="/api/openapi.yaml" />
      </div>
    </div>
  );
}
