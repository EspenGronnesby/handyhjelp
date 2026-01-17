import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  include_feedback_button: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateData {
  name: string;
  subject: string;
  content: string;
  include_feedback_button: boolean;
}

export interface UpdateTemplateData extends CreateTemplateData {
  id: string;
}

export function useEmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  const fetchTemplates = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching email templates:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke hente e-postmaler',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const createTemplate = async (data: CreateTemplateData): Promise<boolean> => {
    setActionLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('email_templates')
        .insert({
          name: data.name,
          subject: data.subject,
          content: data.content,
          include_feedback_button: data.include_feedback_button,
          created_by: user?.id,
        });

      if (error) throw error;

      toast({
        title: 'Mal opprettet',
        description: `"${data.name}" ble opprettet`,
      });

      await fetchTemplates();
      return true;
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke opprette mal',
        variant: 'destructive',
      });
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const updateTemplate = async (data: UpdateTemplateData): Promise<boolean> => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('email_templates')
        .update({
          name: data.name,
          subject: data.subject,
          content: data.content,
          include_feedback_button: data.include_feedback_button,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id);

      if (error) throw error;

      toast({
        title: 'Mal oppdatert',
        description: `"${data.name}" ble oppdatert`,
      });

      await fetchTemplates();
      return true;
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke oppdatere mal',
        variant: 'destructive',
      });
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const deleteTemplate = async (id: string, name: string): Promise<boolean> => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Mal slettet',
        description: `"${name}" ble slettet`,
      });

      await fetchTemplates();
      return true;
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke slette mal',
        variant: 'destructive',
      });
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    templates,
    loading,
    actionLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refreshTemplates: fetchTemplates,
  };
}
