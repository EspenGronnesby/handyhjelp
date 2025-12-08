import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Quote, Job, Profile, ServiceAgreement } from '@/types/admin';

export const useAdminData = (isAdmin: boolean) => {
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [agreements, setAgreements] = useState<ServiceAgreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async () => {
    const [quotesResponse, jobsResponse, profilesResponse, agreementsResponse] = await Promise.all([
      supabase.from('quotes').select('*').order('created_at', { ascending: false }),
      supabase.from('jobs').select('*, quotes(name, email, phone, description, type, company_name, org_number)').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('service_agreements').select('*').order('created_at', { ascending: false })
    ]);

    if (quotesResponse.data) setQuotes(quotesResponse.data);
    if (jobsResponse.data) setJobs(jobsResponse.data);
    if (profilesResponse.data) setProfiles(profilesResponse.data);
    if (agreementsResponse.data) setAgreements(agreementsResponse.data as ServiceAgreement[]);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const handleStartJob = async (quote: Quote) => {
    setActionLoading(quote.id);
    
    try {
      const { error: quoteError } = await supabase
        .from('quotes')
        .update({ status: 'in_progress' })
        .eq('id', quote.id);

      if (quoteError) throw quoteError;

      const { error: jobError } = await supabase
        .from('jobs')
        .insert({
          quote_id: quote.id,
          user_id: quote.user_id,
          status: 'in_progress',
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // Opprett notifikasjon for bruker
      if (quote.user_id) {
        await supabase.from('notifications').insert({
          user_id: quote.user_id,
          type: 'job_update',
          title: 'Jobben din er startet',
          message: `Vi har begynt arbeidet med: "${quote.description.substring(0, 100)}". Du vil få beskjed når jobben er fullført.`,
          read: false
        });
      }

      await fetchData();

      supabase.functions.invoke('send-job-status-email', {
        body: {
          customerName: quote.type === 'business' ? quote.company_name : quote.name,
          customerEmail: quote.email,
          jobDescription: quote.description,
          status: 'started',
        },
      }).catch(console.error);

      toast({
        title: "Suksess!",
        description: "Jobben er startet og kunde vil motta e-post.",
      });

    } catch (error: any) {
      console.error('Error starting job:', error);
      toast({
        title: "Feil",
        description: `Kunne ikke starte jobben: ${error?.message || 'Ukjent feil'}`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteJob = async (job: Job) => {
    setActionLoading(job.id);
    
    try {
      const { error: jobError } = await supabase
        .from('jobs')
        .update({ 
          status: 'completed',
          completed_date: new Date().toISOString(),
        })
        .eq('id', job.id);

      if (jobError) throw jobError;

      const { error: quoteError } = await supabase
        .from('quotes')
        .update({ status: 'completed' })
        .eq('id', job.quote_id);

      if (quoteError) throw quoteError;

      // Opprett notifikasjon for bruker
      if (job.user_id) {
        await supabase.from('notifications').insert({
          user_id: job.user_id,
          type: 'job_update',
          title: 'Jobben din er fullført',
          message: `Oppdraget "${job.quotes.description.substring(0, 100)}" er nå ferdig. Takk for at du valgte HandyHjelp!`,
          read: false
        });
      }

      await fetchData();

      const customerName = job.quotes.type === 'business' ? job.quotes.company_name : job.quotes.name;
      supabase.functions.invoke('send-job-status-email', {
        body: {
          customerName,
          customerEmail: job.quotes.email,
          jobDescription: job.quotes.description,
          status: 'completed',
        },
      }).catch(console.error);

      toast({
        title: "Suksess!",
        description: "Jobben er fullført og kunde vil motta e-post.",
      });

    } catch (error: any) {
      console.error('Error completing job:', error);
      toast({
        title: "Feil",
        description: `Kunne ikke fullføre jobben: ${error?.message || 'Ukjent feil'}`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteJob = async (job: Job) => {
    setActionLoading(job.id);
    
    try {
      const { error } = await supabase.from('jobs').delete().eq('id', job.id);
      
      if (error) throw error;

      setJobs(prevJobs => prevJobs.filter(j => j.id !== job.id));
      
      toast({
        title: "Slettet",
        description: "Jobben er slettet.",
      });

    } catch (error: any) {
      console.error('Error deleting job:', error);
      toast({
        title: "Feil",
        description: `Kunne ikke slette jobben: ${error?.message || 'Ukjent feil'}`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateAgreementStatus = async (agreementId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('service_agreements')
        .update({ status: newStatus })
        .eq('id', agreementId);

      if (error) throw error;

      setAgreements(prev => prev.map(a => 
        a.id === agreementId ? { ...a, status: newStatus } : a
      ));

      toast({
        title: "Oppdatert",
        description: "Status er oppdatert.",
      });
    } catch (error: any) {
      console.error('Error updating agreement:', error);
      toast({
        title: "Feil",
        description: "Kunne ikke oppdatere status.",
        variant: "destructive",
      });
    }
  };

  const pendingQuotes = quotes.filter(q => q.status === 'pending');
  const activeJobs = jobs.filter(j => j.status === 'in_progress');
  const completedJobs = jobs.filter(j => j.status === 'completed');
  const newAgreements = agreements.filter(a => a.status === 'new');

  return {
    quotes,
    jobs,
    profiles,
    agreements,
    loading,
    actionLoading,
    pendingQuotes,
    activeJobs,
    completedJobs,
    newAgreements,
    handleStartJob,
    handleCompleteJob,
    handleDeleteJob,
    handleUpdateAgreementStatus,
  };
};
