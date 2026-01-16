import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type ActionType = 
  | 'role_assigned' 
  | 'role_removed'
  | 'job_created'
  | 'job_started'
  | 'job_completed'
  | 'job_deleted'
  | 'agreement_approved'
  | 'agreement_rejected'
  | 'agreement_updated'
  | 'content_approved'
  | 'content_rejected'
  | 'customer_created';

export type ActionCategory = 
  | 'role_management'
  | 'job_management'
  | 'agreement_management'
  | 'content_management'
  | 'customer_management';

export type UserRole = 'platform_owner' | 'admin' | 'worker' | 'user';

export interface ActivityLog {
  id: string;
  user_id: string | null;
  user_role: string;
  user_name: string | null;
  action_type: string;
  action_category: string;
  description: string;
  target_user_id: string | null;
  target_user_name: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface ActivityLogFilters {
  role?: UserRole | 'all';
  category?: ActionCategory | 'all';
  dateRange?: 'day' | 'week' | 'month' | 'all';
  searchTerm?: string;
}

// Action type labels in Norwegian
export const actionTypeLabels: Record<ActionType, string> = {
  role_assigned: 'Tildelte rolle',
  role_removed: 'Fjernet rolle',
  job_created: 'Opprettet oppdrag',
  job_started: 'Startet oppdrag',
  job_completed: 'Fullførte oppdrag',
  job_deleted: 'Slettet oppdrag',
  agreement_approved: 'Godkjente avtale',
  agreement_rejected: 'Avslått avtale',
  agreement_updated: 'Oppdaterte avtale',
  content_approved: 'Godkjente innhold',
  content_rejected: 'Avslått innhold',
  customer_created: 'Opprettet kunde',
};

// Category labels in Norwegian
export const categoryLabels: Record<ActionCategory, string> = {
  role_management: 'Rolleadministrasjon',
  job_management: 'Oppdragshåndtering',
  agreement_management: 'Avtalehåndtering',
  content_management: 'Innholdsgodkjenning',
  customer_management: 'Kundehåndtering',
};

// Role labels in Norwegian
export const roleLabels: Record<UserRole | string, string> = {
  platform_owner: 'Eier',
  admin: 'Administrator',
  worker: 'Medarbeider',
  user: 'Bruker',
};

// Role colors for badges
export const roleColors: Record<UserRole | string, string> = {
  platform_owner: 'bg-purple-500',
  admin: 'bg-blue-500',
  worker: 'bg-green-500',
  user: 'bg-gray-500',
};

// Action type colors
export const actionTypeColors: Record<ActionType, string> = {
  role_assigned: 'bg-purple-500',
  role_removed: 'bg-orange-500',
  job_created: 'bg-blue-500',
  job_started: 'bg-cyan-500',
  job_completed: 'bg-green-500',
  job_deleted: 'bg-red-500',
  agreement_approved: 'bg-emerald-500',
  agreement_rejected: 'bg-red-500',
  agreement_updated: 'bg-blue-500',
  content_approved: 'bg-green-500',
  content_rejected: 'bg-orange-500',
  customer_created: 'bg-indigo-500',
};

// Function to log activity
export const logActivity = async (
  actionType: ActionType,
  actionCategory: ActionCategory,
  description: string,
  metadata?: Record<string, any>,
  targetUserId?: string,
  targetUserName?: string
) => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user for activity logging');
      return;
    }

    // Get user's role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    const userRole = roleData?.[0]?.role || 'user';

    // Get user's name from profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    const userName = profileData?.full_name || user.email || 'Ukjent';

    // Insert activity log
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: user.id,
        user_role: userRole,
        user_name: userName,
        action_type: actionType,
        action_category: actionCategory,
        description,
        target_user_id: targetUserId || null,
        target_user_name: targetUserName || null,
        metadata: metadata || {},
      });

    if (error) {
      console.error('Error logging activity:', error);
    }
  } catch (error) {
    console.error('Error in logActivity:', error);
  }
};

// Hook to fetch activity logs with filtering
export const useActivityLogs = (filters: ActivityLogFilters = {}, limit = 100) => {
  return useQuery({
    queryKey: ['activity-logs', filters, limit],
    queryFn: async () => {
      let query = supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      // Filter by role
      if (filters.role && filters.role !== 'all') {
        query = query.eq('user_role', filters.role);
      }

      // Filter by category
      if (filters.category && filters.category !== 'all') {
        query = query.eq('action_category', filters.category);
      }

      // Filter by date range
      if (filters.dateRange && filters.dateRange !== 'all') {
        const now = new Date();
        let startDate: Date;

        switch (filters.dateRange) {
          case 'day':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(0);
        }

        query = query.gte('created_at', startDate.toISOString());
      }

      // Search term
      if (filters.searchTerm) {
        query = query.or(`description.ilike.%${filters.searchTerm}%,user_name.ilike.%${filters.searchTerm}%,target_user_name.ilike.%${filters.searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching activity logs:', error);
        throw error;
      }

      return data as ActivityLog[];
    },
  });
};
