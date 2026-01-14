import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Simplified role types for single-site application
export type AppRole = 'platform_owner' | 'admin' | 'worker' | 'moderator' | 'user';

interface RoleState {
  isOwner: boolean;      // platform_owner role - full system access
  isAdmin: boolean;      // admin role OR owner (owner always has admin access)
  isWorker: boolean;     // worker role
  roles: AppRole[];
  loading: boolean;
}

export const useRole = () => {
  const [state, setState] = useState<RoleState>({
    isOwner: false,
    isAdmin: false,
    isWorker: false,
    roles: [],
    loading: true,
  });

  useEffect(() => {
    const checkRoles = async (userId: string | undefined) => {
      if (!userId) {
        setState({
          isOwner: false,
          isAdmin: false,
          isWorker: false,
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
        
        // Owner = platform_owner role
        const isOwner = roles.includes('platform_owner');
        
        // Admin = has admin role OR is owner (owner always has admin access)
        const isAdmin = roles.includes('admin') || isOwner;
        
        // Worker = has worker role
        const isWorker = roles.includes('worker');
        
        setState({
          isOwner,
          isAdmin,
          isWorker,
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
