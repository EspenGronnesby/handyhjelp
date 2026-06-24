import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EmailLog {
  id: string;
  recipient_email: string;
  recipient_name: string | null;
  recipient_user_id: string | null;
  recipient_type: 'customer' | 'external';
  subject: string;
  content: string;
  template_id: string | null;
  template_name: string | null;
  included_feedback_button: boolean;
  sender_user_id: string | null;
  sender_name: string | null;
  sender_role: string | null;
  sent_at: string;
  status: 'sent' | 'failed';
  error_message: string | null;
  batch_id: string | null;
}

export interface EmailLogsFilter {
  startDate?: Date;
  endDate?: Date;
  recipientType?: 'customer' | 'external' | 'all';
  status?: 'sent' | 'failed' | 'all';
}

export function useEmailLogs(filter?: EmailLogsFilter) {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [registeredEmails, setRegisteredEmails] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLogs = useCallback(async () => {
    try {
      let query = supabase
        .from('email_logs')
        .select('*')
        .order('sent_at', { ascending: false });

      if (filter?.startDate) {
        query = query.gte('sent_at', filter.startDate.toISOString());
      }

      if (filter?.endDate) {
        query = query.lte('sent_at', filter.endDate.toISOString());
      }

      if (filter?.recipientType && filter.recipientType !== 'all') {
        query = query.eq('recipient_type', filter.recipientType);
      }

      if (filter?.status && filter.status !== 'all') {
        query = query.eq('status', filter.status);
      }

      const { data, error } = await query.limit(500);

      if (error) throw error;
      setLogs((data || []) as EmailLog[]);

      // Fetch registered customer emails to distinguish "Kunde" (has account) from "Gjest" (no account)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('email');
      setRegisteredEmails(
        new Set((profileData || []).map(p => (p.email || '').toLowerCase()).filter(Boolean))
      );
    } catch (error) {
      console.error('Error fetching email logs:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke hente e-posthistorikk',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [filter, toast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Group logs by batch_id
  const groupedLogs = logs.reduce((acc, log) => {
    if (log.batch_id) {
      if (!acc[log.batch_id]) {
        acc[log.batch_id] = [];
      }
      acc[log.batch_id].push(log);
    } else {
      acc[log.id] = [log];
    }
    return acc;
  }, {} as Record<string, EmailLog[]>);

  return {
    logs,
    groupedLogs,
    registeredEmails,
    loading,
    refreshLogs: fetchLogs,
  };
}
