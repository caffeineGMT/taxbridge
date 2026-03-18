'use client';

import { useState } from 'react';
import { Building2, Users, DollarSign, TrendingUp, Upload, FileText, Download, Settings } from 'lucide-react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

// Mock client data representing diverse enterprise use case
const MOCK_CLIENTS = [
  {
    id: 1,
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    employer: 'Meta',
    province: 'BC',
    rsu_ytd: 285000,
    tax_owed: 142500,
    filings_complete: 8,
    filings_total: 8,
    last_activity: '2026-03-15',
    status: 'active'
  },
  {
    id: 2,
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    employer: 'Amazon',
    province: 'ON',
    rsu_ytd: 175000,
    tax_owed: 87500,
    filings_complete: 6,
    filings_total: 8,
    last_activity: '2026-03-14',
    status: 'active'
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    email: 'emily.r@example.com',
    employer: 'Google',
    province: 'BC',
    rsu_ytd: 310000,
    tax_owed: 155000,
    filings_complete: 8,
    filings_total: 8,
    last_activity: '2026-03-16',
    status: 'active'
  },
  {
    id: 4,
    name: 'Michael Zhang',
    email: 'michael.z@example.com',
    employer: 'Microsoft',
    province: 'AB',
    rsu_ytd: 125000,
    tax_owed: 62500,
    filings_complete: 4,
    filings_total: 8,
    last_activity: '2026-03-10',
    status: 'pending'
  },
  {
    id: 5,
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    employer: 'Apple',
    province: 'ON',
    rsu_ytd: 195000,
    tax_owed: 97500,
    filings_complete: 7,
    filings_total: 8,
    last_activity: '2026-03-13',
    status: 'active'
  }
];

export default function DemoPage() {
  const [selectedClients, setSelectedClients] = useState<number[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const totalRSU = MOCK_CLIENTS.reduce((sum, c) => sum + c.rsu_ytd, 0);
  const totalTax = MOCK_CLIENTS.reduce((sum, c) => sum + c.tax_owed, 0);
  const activeClients = MOCK_CLIENTS.filter(c => c.status === 'active').length;
  const avgFTCSavings = Math.round(totalRSU * 0.15); // Estimated 15% FTC savings

  const toggleClient = (id: number) => {
    setSelectedClients(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedClients(MOCK_CLIENTS.map(c => c.id));
  };

  const deselectAll = () => {
    setSelectedClients([]);
  };

  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      steps: [
        {
          element: '.multi-client-dashboard',
          popover: {
            title: 'Multi-Client Dashboard',
            description: 'Manage all your H-1B/TN visa clients in one centralized dashboard. View RSU income, tax calculations, and filing status at a glance.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '.bulk-actions',
          popover: {
            title: 'Bulk Actions',
            description: 'Perform bulk operations like exporting reports, sending reminders, or updating filing status for multiple clients simultaneously.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '.csv-import',
          popover: {
            title: 'CSV Import',
            description: 'Import 50+ employee RSU records via CSV upload. Automatically calculate dual-country taxes and generate Foreign Tax Credit recommendations.',
            side: 'left',
            align: 'start'
          }
        },
        {
          element: '.white-label-reports',
          popover: {
            title: 'White-Label Reports',
            description: 'Generate white-label PDF reports with your firm\'s logo. Professional tax summaries ready to deliver to clients.',
            side: 'left',
            align: 'start'
          }
        },
        {
          element: '.api-access',
          popover: {
            title: 'API Integration',
            description: 'Integrate TaxBridge with QuickBooks, Xero, or TaxAct via our REST API. Seamlessly sync client data and automate workflows.',
            side: 'bottom',
            align: 'end'
          }
        }
      ]
    });

    driverObj.drive();
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

      {/* Demo Banner */}
      <div className="relative bg-amber-600/20 border-b border-amber-600/30 py-3 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded">DEMO MODE</div>
            <span className="text-amber-100 text-sm">
              Explore TaxBridge Enterprise with pre-loaded sample data. All client information is fictional.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={startTour}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Start Interactive Tour
            </button>
            <a
              href="/enterprise/request-demo"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Request Live Demo
            </a>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-emerald-500">TaxBridge</div>
            <span className="text-slate-600 mx-2">|</span>
            <span className="text-slate-400 text-sm">Enterprise Demo</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="api-access text-slate-400 hover:text-emerald-500 transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Enterprise Client Dashboard</h1>
          <p className="text-slate-400">
            Demo account — Smith Immigration LLP managing 5 H-1B/TN visa clients
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 multi-client-dashboard">
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-slate-400 text-sm">Total Clients</div>
              <Users className="h-5 w-5 text-slate-600" />
            </div>
            <div className="text-3xl font-bold text-slate-100">{MOCK_CLIENTS.length}</div>
            <div className="text-emerald-500 text-xs mt-1">{activeClients} active this month</div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-slate-400 text-sm">Total RSU YTD</div>
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-500">
              ${Math.round(totalRSU / 1000)}K
            </div>
            <div className="text-slate-500 text-xs mt-1">USD income</div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-slate-400 text-sm">Total Tax Owed</div>
              <Building2 className="h-5 w-5 text-amber-600" />
            </div>
            <div className="text-3xl font-bold text-amber-500">
              ${Math.round(totalTax / 1000)}K
            </div>
            <div className="text-slate-500 text-xs mt-1">CAD combined</div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-slate-400 text-sm">FTC Savings</div>
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-emerald-500">
              ${Math.round(avgFTCSavings / 1000)}K
            </div>
            <div className="text-slate-500 text-xs mt-1">Estimated total</div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-4 mb-6 bulk-actions">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-slate-400 text-sm">
                {selectedClients.length > 0 ? `${selectedClients.length} selected` : 'No clients selected'}
              </span>
              {selectedClients.length === 0 ? (
                <button
                  onClick={selectAll}
                  className="text-emerald-500 hover:text-emerald-400 text-sm font-medium transition-colors"
                >
                  Select All
                </button>
              ) : (
                <button
                  onClick={deselectAll}
                  className="text-slate-500 hover:text-slate-400 text-sm font-medium transition-colors"
                >
                  Deselect All
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                className="csv-import flex items-center gap-2 bg-emerald-600/20 border border-emerald-600/30 text-emerald-400 hover:bg-emerald-600/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                onClick={() => setShowUploadModal(true)}
              >
                <Upload className="h-4 w-4" />
                CSV Import
              </button>
              <button
                className="white-label-reports flex items-center gap-2 bg-blue-600/20 border border-blue-600/30 text-blue-400 hover:bg-blue-600/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                disabled={selectedClients.length === 0}
              >
                <FileText className="h-4 w-4" />
                Generate Reports
              </button>
              <button
                className="flex items-center gap-2 bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                disabled={selectedClients.length === 0}
              >
                <Download className="h-4 w-4" />
                Export Data
              </button>
            </div>
          </div>
        </div>

        {/* Client Table */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50 border-b border-slate-700">
                <tr>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={selectedClients.length === MOCK_CLIENTS.length}
                      onChange={(e) => e.target.checked ? selectAll() : deselectAll()}
                      className="rounded border-slate-600"
                    />
                  </th>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">Client</th>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">Employer</th>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">Province</th>
                  <th className="text-right p-4 text-slate-400 text-sm font-medium">RSU YTD</th>
                  <th className="text-right p-4 text-slate-400 text-sm font-medium">Tax Owed</th>
                  <th className="text-center p-4 text-slate-400 text-sm font-medium">Filing Status</th>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {MOCK_CLIENTS.map((client) => (
                  <tr
                    key={client.id}
                    className={`hover:bg-slate-800/30 transition-colors ${
                      selectedClients.includes(client.id) ? 'bg-emerald-900/10' : ''
                    }`}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedClients.includes(client.id)}
                        onChange={() => toggleClient(client.id)}
                        className="rounded border-slate-600"
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-200">{client.name}</div>
                      <div className="text-slate-500 text-sm">{client.email}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/30 text-blue-300 border border-blue-700/30">
                        {client.employer}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">{client.province}</td>
                    <td className="p-4 text-right text-blue-400 font-medium">
                      ${(client.rsu_ytd / 1000).toFixed(0)}K
                    </td>
                    <td className="p-4 text-right text-amber-400 font-medium">
                      ${(client.tax_owed / 1000).toFixed(0)}K CAD
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="text-slate-300 text-sm">
                          {client.filings_complete}/{client.filings_total}
                        </div>
                        {client.filings_complete === client.filings_total ? (
                          <span className="text-emerald-500">✓</span>
                        ) : (
                          <span className="text-amber-500">⋯</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-slate-400 text-sm">{client.last_activity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CSV Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-lg w-full p-6">
              <h3 className="text-xl font-bold text-slate-100 mb-4">CSV Import Success</h3>
              <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-emerald-600 rounded-full p-1">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-emerald-400 font-medium">50 records imported successfully</span>
                </div>
                <p className="text-slate-400 text-sm">
                  All RSU entries processed. Tax calculations complete. Foreign Tax Credit recommendations generated.
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
