"use client"

import { useState, useEffect } from 'react';
import { Check, ChevronDown, Building2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface Organization {
  id: number;
  name: string;
  created_at: string;
}

interface OrgSwitcherProps {
  currentOrgId?: number;
  onOrgChange?: () => void;
}

export default function OrgSwitcher({ currentOrgId, onOrgChange }: OrgSwitcherProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/enterprise/orgs');

      if (!response.ok) {
        throw new Error('Failed to fetch organizations');
      }

      const data = await response.json();
      setOrganizations(data.organizations || []);

      // Set current org
      if (currentOrgId) {
        const current = data.organizations.find((org: Organization) => org.id === currentOrgId);
        setCurrentOrg(current || null);
      } else if (data.organizations.length > 0) {
        setCurrentOrg(data.organizations[0]);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrgSwitch = async (orgId: number) => {
    if (orgId === currentOrg?.id) return;

    setSwitching(true);

    try {
      const response = await fetch('/api/enterprise/orgs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId }),
      });

      if (!response.ok) {
        throw new Error('Failed to switch organization');
      }

      const data = await response.json();
      setCurrentOrg(data.organization);

      // Trigger parent refresh
      if (onOrgChange) {
        onOrgChange();
      }

      // Refresh page to update all data
      window.location.reload();
    } catch (error) {
      console.error('Error switching organization:', error);
    } finally {
      setSwitching(false);
    }
  };

  if (loading) {
    return (
      <div className="w-[280px] h-10 bg-slate-800 animate-pulse rounded-md" />
    );
  }

  if (organizations.length === 0) {
    return null;
  }

  // Don't show switcher if user only has one org
  if (organizations.length === 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-md">
        <Building2 className="h-4 w-4 text-emerald-500" />
        <span className="text-sm text-slate-200">{currentOrg?.name}</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-[280px] justify-between border-slate-700 hover:border-emerald-500 hover:bg-slate-800"
          disabled={switching}
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-emerald-500" />
            <span className="text-sm text-slate-200">
              {switching ? 'Switching...' : currentOrg?.name || 'Select Organization'}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[280px]">
        <DropdownMenuLabel>Switch Organization</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => handleOrgSwitch(org.id)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span>{org.name}</span>
            {currentOrg?.id === org.id && (
              <Check className="h-4 w-4 text-emerald-500" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
