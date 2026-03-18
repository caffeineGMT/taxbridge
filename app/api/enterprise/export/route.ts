/**
 * Enterprise Client Export API
 * Exports client data to CSV format
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAdminAccess, type RLSContext } from '@/lib/db/middleware';
import { getOrgClients, type OrgClientFilters } from '@/lib/db/queries/enterprise';

/**
 * Convert client data to CSV format
 */
function convertToCSV(clients: any[]): string {
  const headers = [
    'Name',
    'Email',
    'Province',
    'State',
    'Employer',
    'Filing Status',
    'Total RSU YTD (USD)',
    'Total Tax Owed (CAD)',
    'Last Activity',
  ];

  const rows = clients.map(client => {
    const name = [client.first_name, client.last_name].filter(Boolean).join(' ') || 'N/A';
    const filingStatus = client.filing_status || 'N/A';
    const employer = client.employer || 'N/A';
    const lastActivity = client.last_activity
      ? new Date(client.last_activity).toLocaleDateString()
      : 'N/A';

    return [
      name,
      client.email || '',
      client.canada_province || '',
      client.us_state || '',
      employer,
      filingStatus,
      client.total_rsu_ytd.toFixed(2),
      client.total_tax_owed.toFixed(2),
      lastActivity,
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * GET /api/enterprise/export
 * Export clients to CSV
 */
async function getHandler(
  request: NextRequest,
  context: RLSContext
): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);

    const filters: OrgClientFilters = {
      province: searchParams.get('province') || undefined,
      state: searchParams.get('state') || undefined,
      employer: searchParams.get('employer') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const clients = getOrgClients(context.orgId!, filters);

    const csv = convertToCSV(clients);

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `clients-export-${timestamp}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting clients:', error);
    return NextResponse.json(
      { error: 'Failed to export clients' },
      { status: 500 }
    );
  }
}

export const GET = withAdminAccess(getHandler);
