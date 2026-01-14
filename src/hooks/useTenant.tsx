import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  logo_url: string | null;
  primary_color: string | null;
  is_active: boolean;
  created_at: string;
}

interface TenantState {
  tenant: Tenant | null;
  tenantId: string | null;
  loading: boolean;
}

export const useTenant = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUserId(session?.user?.id ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile-tenant', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile tenant:', error);
        return null;
      }

      return data;
    },
    enabled: !!userId,
  });

  const tenantId = profile?.tenant_id ?? null;

  const { data: tenant, isLoading: tenantLoading } = useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: async () => {
      if (!tenantId) return null;

      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();

      if (error) {
        console.error('Error fetching tenant:', error);
        return null;
      }

      return data as Tenant;
    },
    enabled: !!tenantId,
  });

  return {
    tenant,
    tenantId,
    loading: profileLoading || tenantLoading,
  };
};

// Hook to get all tenants (for platform owner)
export const useAllTenants = () => {
  return useQuery({
    queryKey: ['all-tenants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all tenants:', error);
        throw error;
      }

      return data as Tenant[];
    },
  });
};
