import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'platform_owner' | 'tenant_admin' | 'worker' | 'admin' | 'moderator' | 'user';

interface RoleState {
  isPlatformOwner: boolean;
  isTenantAdmin: boolean;
  isWorker: boolean;
  isAdmin: boolean; // Legacy admin role
  roles: AppRole[];
  loading: boolean;
}

export const useRole = () => {
  const [state, setState] = useState<RoleState>({
    isPlatformOwner: false,
    isTenantAdmin: false,
    isWorker: false,
    isAdmin: false,
    roles: [],
    loading: true,
  });

  useEffect(() => {
    const checkRoles = async (userId: string | undefined) => {
      if (!userId) {
        setState({
          isPlatformOwner: false,
          isTenantAdmin: false,
          isWorker: false,
          isAdmin: false,
          roles: [],
          loading: false,
        });
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId);

        if (error) {
          console.error('Error fetching roles:', error);
          setState(prev => ({ ...prev, loading: false }));
          return;
        }

        const roles = (data || []).map(r => r.role as AppRole);
        
        setState({
          isPlatformOwner: roles.includes('platform_owner'),
          isTenantAdmin: roles.includes('tenant_admin'),
          isWorker: roles.includes('worker'),
          isAdmin: roles.includes('admin') || roles.includes('platform_owner'),
          roles,
          loading: false,
        });
      } catch (error) {
        console.error('Error in checkRoles:', error);
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      checkRoles(session?.user?.id);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setState(prev => ({ ...prev, loading: true }));
        checkRoles(session?.user?.id);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return state;
};
