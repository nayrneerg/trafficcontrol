'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface OrgContext {
  orgId: string | null;
  orgName: string | null;
  orgSlug: string | null;
  role: 'agency_admin' | 'client_viewer' | null;
  loading: boolean;
}

export function useOrg(): OrgContext {
  const [context, setContext] = useState<OrgContext>({
    orgId: null,
    orgName: null,
    orgSlug: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    // For now, return a mock org context
    // In production this reads from Supabase session + users table
    setTimeout(() => {
      setContext({
        orgId: 'demo-org-001',
        orgName: 'Acme Corp',
        orgSlug: 'acme-corp',
        role: 'agency_admin',
        loading: false,
      });
    }, 300);
  }, []);

  return context;
}
