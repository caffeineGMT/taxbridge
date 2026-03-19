"use client"

import { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Mail,
  MoreVertical,
  SortAsc,
  SortDesc,
  Filter,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { logger } from '@/lib/logger';

interface Client {
  user_id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  us_state: string | null;
  canada_province: string | null;
  filing_status: string | null;
  total_rsu_ytd: number;
  total_tax_owed: number;
  last_activity: string | null;
  employer: string | null;
}

interface ClientDashboardProps {
  initialClients: Client[];
}

type SortField = 'name' | 'total_rsu_ytd' | 'total_tax_owed' | 'last_activity';
type SortDirection = 'asc' | 'desc';

const STATUS_COLORS = {
  'Not Started': 'bg-slate-700 text-slate-300',
  'In Progress': 'bg-amber-700 text-amber-100',
  'Ready': 'bg-emerald-700 text-emerald-100',
};

export default function ClientDashboard({ initialClients }: ClientDashboardProps) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [selectedClients, setSelectedClients] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [provinceFilter, setProvinceFilter] = useState<string>('');
  const [stateFilter, setStateFilter] = useState<string>('');
  const [employerFilter, setEmployerFilter] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'client'>('client');
  const [loading, setLoading] = useState(false);

  // Get unique filter values
  const provinces = useMemo<string[]>(
    () => Array.from(new Set(clients.map(c => c.canada_province).filter((p): p is string => p !== null))),
    [clients]
  );
  const states = useMemo<string[]>(
    () => Array.from(new Set(clients.map(c => c.us_state).filter((s): s is string => s !== null))),
    [clients]
  );
  const employers = useMemo<string[]>(
    () => Array.from(new Set(clients.map(c => c.employer).filter((e): e is string => e !== null))),
    [clients]
  );

  // Filter and sort clients
  const filteredClients = useMemo(() => {
    let filtered = clients;

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        c =>
          c.email?.toLowerCase().includes(search) ||
          c.first_name?.toLowerCase().includes(search) ||
          c.last_name?.toLowerCase().includes(search)
      );
    }

    // Province filter
    if (provinceFilter) {
      filtered = filtered.filter(c => c.canada_province === provinceFilter);
    }

    // State filter
    if (stateFilter) {
      filtered = filtered.filter(c => c.us_state === stateFilter);
    }

    // Employer filter
    if (employerFilter) {
      filtered = filtered.filter(c => c.employer === employerFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortField) {
        case 'name':
          aVal = `${a.last_name || ''} ${a.first_name || ''}`.toLowerCase();
          bVal = `${b.last_name || ''} ${b.first_name || ''}`.toLowerCase();
          break;
        case 'total_rsu_ytd':
          aVal = a.total_rsu_ytd;
          bVal = b.total_rsu_ytd;
          break;
        case 'total_tax_owed':
          aVal = a.total_tax_owed;
          bVal = b.total_tax_owed;
          break;
        case 'last_activity':
          aVal = a.last_activity ? new Date(a.last_activity).getTime() : 0;
          bVal = b.last_activity ? new Date(b.last_activity).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [clients, searchTerm, provinceFilter, stateFilter, employerFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedClients(new Set(filteredClients.map(c => c.user_id)));
    } else {
      setSelectedClients(new Set());
    }
  };

  const handleSelectClient = (userId: number, checked: boolean) => {
    const newSelected = new Set(selectedClients);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedClients(newSelected);
  };

  const handleExport = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (provinceFilter) params.append('province', provinceFilter);
      if (stateFilter) params.append('state', stateFilter);
      if (employerFilter) params.append('employer', employerFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/enterprise/export?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clients-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export clients');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteClient = async () => {
    if (!inviteEmail) {
      alert('Please enter an email address');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/enterprise/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to send invitation');
      }

      const data = await response.json();

      alert(`Invitation sent to ${inviteEmail}`);
      setInviteModalOpen(false);
      setInviteEmail('');
      setInviteRole('client');

      // In production, this would be sent via email
      logger.info('Invite URL:', data.inviteUrl);
    } catch (error) {
      console.error('Invite error:', error);
      alert('Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const getFilingStatus = (client: Client): string => {
    if (!client.filing_status) return 'Not Started';
    if (client.total_rsu_ytd > 0 && client.total_tax_owed > 0) return 'In Progress';
    return 'Not Started';
  };

  const formatCurrency = (amount: number, currency: 'USD' | 'CAD' = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <SortAsc className="h-4 w-4 inline ml-1" />
    ) : (
      <SortDesc className="h-4 w-4 inline ml-1" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with search and filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex-1 flex gap-2 flex-wrap">
          {/* Search */}
          <div className="relative w-[320px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-slate-200"
            />
          </div>

          {/* Province Filter */}
          <select
            value={provinceFilter}
            onChange={(e) => setProvinceFilter(e.target.value)}
            className="w-[160px] px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-sm text-slate-200"
          >
            <option value="">All Provinces</option>
            {provinces.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {/* State Filter */}
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="w-[160px] px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-sm text-slate-200"
          >
            <option value="">All States</option>
            {states.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Employer Filter */}
          <select
            value={employerFilter}
            onChange={(e) => setEmployerFilter(e.target.value)}
            className="w-[160px] px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-sm text-slate-200"
          >
            <option value="">All Employers</option>
            {employers.map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setInviteModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950"
          >
            <Mail className="h-4 w-4 mr-2" />
            Invite Client
          </Button>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedClients.size > 0 && (
        <div className="sticky top-0 z-10 bg-emerald-700 text-emerald-100 px-4 py-3 rounded-md flex items-center justify-between">
          <span className="text-sm font-medium">
            {selectedClients.size} client{selectedClients.size !== 1 ? 's' : ''} selected
          </span>
          <Button
            onClick={handleExport}
            disabled={loading}
            variant="outline"
            size="sm"
            className="border-emerald-300 hover:bg-emerald-600"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="border border-slate-800 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedClients.size === filteredClients.length && filteredClients.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-emerald-400"
                onClick={() => handleSort('name')}
              >
                Name <SortIcon field="name" />
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead
                className="text-right cursor-pointer hover:text-emerald-400"
                onClick={() => handleSort('total_rsu_ytd')}
              >
                Total RSU YTD <SortIcon field="total_rsu_ytd" />
              </TableHead>
              <TableHead
                className="text-right cursor-pointer hover:text-emerald-400"
                onClick={() => handleSort('total_tax_owed')}
              >
                Total Tax Owed <SortIcon field="total_tax_owed" />
              </TableHead>
              <TableHead>Filing Status</TableHead>
              <TableHead
                className="cursor-pointer hover:text-emerald-400"
                onClick={() => handleSort('last_activity')}
              >
                Last Activity <SortIcon field="last_activity" />
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-slate-400">
                  No clients found
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => {
                const name = [client.first_name, client.last_name].filter(Boolean).join(' ') || 'Unnamed';
                const status = getFilingStatus(client);
                const statusColor = STATUS_COLORS[status as keyof typeof STATUS_COLORS];

                return (
                  <TableRow key={client.user_id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedClients.has(client.user_id)}
                        onCheckedChange={(checked) =>
                          handleSelectClient(client.user_id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">{name}</TableCell>
                    <TableCell className="text-slate-400">{client.email}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(client.total_rsu_ytd, 'USD')}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(client.total_tax_owed, 'CAD')}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                        {status}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {formatDate(client.last_activity)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Client</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-400">
                            Remove Client
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Invite Client Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Invite Client</DialogTitle>
            <DialogDescription>
              Send an invitation email to add a new client to your organization.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="client@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="bg-slate-800 border-slate-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-sm text-slate-200"
              >
                <option value="client">Client</option>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInviteModalOpen(false)}
              className="border-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleInviteClient}
              disabled={loading || !inviteEmail}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950"
            >
              {loading ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
