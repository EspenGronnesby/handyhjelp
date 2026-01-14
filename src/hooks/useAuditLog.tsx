import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from './useTenant';
import type { Json } from '@/integrations/supabase/types';

interface AuditLog {
  id: string;
  tenant_id: string | null;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  old_values: Json | null;
  new_values: Json | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export const useAuditLogs = (limit = 50) => {
  const { tenantId } = useTenant();

  return useQuery({
    queryKey: ['audit-logs', tenantId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching audit logs:', error);
        throw error;
      }

      return data as AuditLog[];
    },
    enabled: !!tenantId,
  });
};

// Function to create an audit log entry
export const logAudit = async (
  action: string,
  tableName: string,
  recordId?: string,
  oldValues?: Json,
  newValues?: Json
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    const { error } = await supabase
      .from('audit_logs')
      .insert([{
        tenant_id: profile?.tenant_id ?? null,
        user_id: user.id,
        action,
        table_name: tableName,
        record_id: recordId ?? null,
        old_values: oldValues ?? null,
        new_values: newValues ?? null,
      }]);

    if (error) {
      console.error('Error creating audit log:', error);
    }
  } catch (error) {
    console.error('Error in logAudit:', error);
  }
};
