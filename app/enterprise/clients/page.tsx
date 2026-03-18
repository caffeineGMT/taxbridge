import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { getUserProfileByClerkId } from '@/lib/db';
import { getOrgClients, getMemberRole } from '@/lib/db/queries/enterprise';
import OrgSwitcher from '@/components/OrgSwitcher';
import ClientDashboard from './ClientDashboard';
import { Building2, Users } from 'lucide-react';

export default async function EnterpriseClientsPage() {
  const { userId: clerkUserId } = auth();

  if (!clerkUserId) {
    redirect('/sign-in');
  }

  const userProfile = getUserProfileByClerkId(clerkUserId);

  if (!userProfile) {
    redirect('/onboarding');
  }

  // Check if user has org access
  if (!userProfile.org_id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
            <Building2 className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-100 mb-2">
              No Organization Access
            </h2>
            <p className="text-slate-400">
              You don't have access to any organization. Contact your administrator to get invited.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is admin
  const role = getMemberRole(userProfile.org_id, userProfile.id);

  if (role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
            <Users className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-100 mb-2">
              Admin Access Required
            </h2>
            <p className="text-slate-400">
              Only organization administrators can access the client management dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fetch clients for the organization
  const clients = getOrgClients(userProfile.org_id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background Grid Pattern */}
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
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-emerald-500">TaxBridge</div>
            <span className="text-slate-600 mx-2">|</span>
            <span className="text-slate-400 text-sm">Enterprise</span>
          </div>
          <OrgSwitcher currentOrgId={userProfile.org_id} />
        </div>
      </header>

      <main className="relative container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Client Management</h1>
          <p className="text-slate-400">
            Manage your organization's clients and track their tax filing progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-1">Total Clients</div>
            <div className="text-3xl font-bold text-slate-100">{clients.length}</div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-1">Active This Month</div>
            <div className="text-3xl font-bold text-emerald-500">
              {clients.filter(c => c.last_activity).length}
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-1">Total RSU YTD</div>
            <div className="text-3xl font-bold text-blue-500">
              ${Math.round(clients.reduce((sum, c) => sum + c.total_rsu_ytd, 0) / 1000)}K
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-1">Total Tax Owed</div>
            <div className="text-3xl font-bold text-amber-500">
              ${Math.round(clients.reduce((sum, c) => sum + c.total_tax_owed, 0) / 1000)}K CAD
            </div>
          </div>
        </div>

        {/* Client Dashboard */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-6">
          <ClientDashboard initialClients={clients} />
        </div>
      </main>
    </div>
  );
}
