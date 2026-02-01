import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EmailRecipient {
  email: string;
  name?: string;
  userId?: string;
  type: 'customer' | 'external';
}

export interface SendEmailData {
  recipients: EmailRecipient[];
  subject: string;
  content: string;
  templateId?: string;
  templateName?: string;
  includeFeedbackButton: boolean;
}

interface SendResult {
  email: string;
  success: boolean;
  error?: string;
}

interface SendEmailResponse {
  success: boolean;
  batchId: string;
  results: SendResult[];
  summary: {
    total: number;
    sent: number;
    failed: number;
  };
}

export function useSendEmail() {
  const [loading, setLoading] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();

  const startCooldown = useCallback((seconds: number) => {
    setCooldownSeconds(seconds);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldownSeconds(prev => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const sendEmail = async (data: SendEmailData): Promise<SendEmailResponse | null> => {
    setLoading(true);
    try {
      // Get current user info for sender details
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user profile for sender name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      // Get user role
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'platform_owner'])
        .limit(1);

      const senderRole = roles?.[0]?.role || 'admin';

      const { data: response, error } = await supabase.functions.invoke('send-manual-email', {
        body: {
          recipients: data.recipients,
          subject: data.subject,
          content: data.content,
          templateId: data.templateId,
          templateName: data.templateName,
          includeFeedbackButton: data.includeFeedbackButton,
          senderName: profile?.full_name || user.email,
          senderRole: senderRole,
        },
      });

      if (error) {
        // Check for rate limit response
        if (response?.retryAfterMs) {
          const seconds = Math.ceil(response.retryAfterMs / 1000);
          startCooldown(seconds);
          toast({
            title: 'Vent litt',
            description: `Du kan sende igjen om ${seconds} sekunder.`,
          });
          return null;
        }
        throw error;
      }

      const result = response as SendEmailResponse;
      // Start 10s cooldown after successful send
      startCooldown(10);

      if (result.summary.failed > 0) {
        toast({
          title: 'Delvis sendt',
          description: `${result.summary.sent} av ${result.summary.total} e-poster ble sendt. ${result.summary.failed} feilet.`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'E-post sendt!',
          description: `${result.summary.sent} e-post${result.summary.sent > 1 ? 'er' : ''} ble sendt`,
        });
      }

      return result;
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: 'Feil',
        description: error instanceof Error ? error.message : 'Kunne ikke sende e-post',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendEmail,
    loading,
    cooldownSeconds,
  };
}
