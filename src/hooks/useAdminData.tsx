import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Quote, Job, Profile, ServiceAgreement } from '@/types/admin';
import { logActivity } from '@/hooks/useActivityLog';
const JOBS_PER_PAGE = 10;

export const useAdminData = (isAdmin: boolean) => {
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [agreements, setAgreements] = useState<ServiceAgreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // State for completed jobs filtering and pagination
  const [showOldCompletedJobs, setShowOldCompletedJobs] = useState(false);
  const [completedJobsPage, setCompletedJobsPage] = useState(1);

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

  // Sends a job-status email and reports whether it actually succeeded.
  // supabase.functions.invoke does not always throw on non-2xx, so we also
  // inspect the returned { error } and the function's { success: false } body.
  const sendJobStatusEmail = async (body: {
    customerName: string | null | undefined;
    customerEmail: string;
    jobDescription: string;
    status: 'started' | 'completed';
    jobId?: string;
  }): Promise<{ ok: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('send-job-status-email', { body });
      if (error) return { ok: false, error: error.message };
      if (data && (data as { success?: boolean }).success === false) {
        return { ok: false, error: (data as { error?: string }).error || 'Ukjent feil' };
      }
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Ukjent feil' };
    }
  };

  const handleStartJob = async (quote: Quote) => {
    setActionLoading(quote.id);
    
    try {
      // 1. Opprett jobben først — feiler denne, forblir quoten 'pending' og synlig i admin
      const { error: jobError } = await supabase
        .from('jobs')
        .insert({
          quote_id: quote.id,
          user_id: quote.user_id,
          customer_email: quote.email,
          status: 'in_progress',
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // 2. Oppdater quote-status etter at jobben er trygt opprettet
      const { error: quoteError } = await supabase
        .from('quotes')
        .update({ status: 'in_progress' })
        .eq('id', quote.id);

      if (quoteError) throw quoteError;

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

      // Log activity
      await logActivity(
        'job_started',
        'job_management',
        `Startet oppdrag for ${quote.type === 'business' ? quote.company_name : quote.name}: "${quote.description.substring(0, 50)}..."`,
        { quote_id: quote.id, customer_name: quote.name }
      );

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
          message: `Oppdraget "${(job.quotes?.description ?? '').substring(0, 100)}" er nå ferdig. Takk for at du valgte HandyHjelp!`,
          read: false
        });
      }

      await fetchData();

      const customerName = job.quotes
        ? (job.quotes.type === 'business' ? job.quotes.company_name : job.quotes.name)
        : 'Ukjent kunde';
      const customerEmail = job.quotes?.email;
      const jobDescription = job.quotes?.description ?? '';
      const emailResult = customerEmail
        ? await sendJobStatusEmail({
            customerName,
            customerEmail,
            jobDescription,
            status: 'completed',
            jobId: job.id,
          })
        : { ok: false, error: 'Mangler e-postadresse for kunde' };

      // Log activity
      await logActivity(
        'job_completed',
        'job_management',
        `Fullførte oppdrag for ${customerName}: "${jobDescription.substring(0, 50)}..."`,
        { job_id: job.id, quote_id: job.quote_id }
      );

      if (emailResult.ok) {
        toast({
          title: "Suksess!",
          description: "Jobben er fullført og kunde varslet på e-post.",
        });
      } else {
        toast({
          title: "Jobben er fullført – men e-posten feilet",
          description: "Jobben er lagret som fullført, men bekreftelses-e-posten til kunden gikk ikke ut. Bruk «Send bekreftelse på nytt» på jobbkortet.",
        });
      }

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
      
      // Log activity
      await logActivity(
        'job_deleted',
        'job_management',
        `Slettet oppdrag: "${(job.quotes?.description ?? '').substring(0, 50)}..."`,
        { job_id: job.id, quote_id: job.quote_id }
      );
      
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

  const handleDeleteQuote = async (quote: Quote) => {
    setActionLoading(quote.id);

    try {
      const { error } = await supabase.from('quotes').delete().eq('id', quote.id);

      if (error) throw error;

      setQuotes(prev => prev.filter(q => q.id !== quote.id));

      await logActivity(
        'quote_deleted',
        'job_management',
        `Slettet forespørsel: "${quote.description.substring(0, 50)}..."`,
        { quote_id: quote.id }
      );

      toast({
        title: "Slettet",
        description: "Forespørselen er slettet.",
      });
    } catch (error: any) {
      console.error('Error deleting quote:', error);
      toast({
        title: "Feil",
        description: `Kunne ikke slette forespørselen: ${error?.message || 'Ukjent feil'}`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // New function: Create job manually for an existing customer
  const handleCreateJob = async (
    profile: Profile,
    description: string,
    address: string | null,
    action: 'register' | 'start' | 'complete'
  ) => {
    setActionLoading('create-job');
    
    let completionEmailFailed = false;

    try {
      // Determine initial status based on action
      let quoteStatus = 'pending';
      if (action === 'start') quoteStatus = 'in_progress';
      if (action === 'complete') quoteStatus = 'completed';

      // 1. Create quote with profile data
      const quoteData = {
        user_id: profile.id,
        type: profile.customer_type || 'private',
        name: profile.full_name,
        email: profile.email,
        phone: profile.phone || '',
        company_name: profile.company_name,
        org_number: profile.org_number,
        description: description,
        address: address,
        status: quoteStatus,
      };
      
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert(quoteData)
        .select()
        .single();

      if (quoteError) throw quoteError;

      // 2. Handle based on action
      if (action === 'start') {
        // Create job with in_progress status
        const { error: jobError } = await supabase
          .from('jobs')
          .insert({
            quote_id: quote.id,
            user_id: profile.id,
            status: 'in_progress',
            started_at: new Date().toISOString(),
          });

        if (jobError) throw jobError;

        // Send notification to user
        await supabase.from('notifications').insert({
          user_id: profile.id,
          type: 'job_update',
          title: 'Nytt oppdrag startet',
          message: `Vi har startet arbeidet med: "${description.substring(0, 100)}"`,
          read: false
        });

        // Send email via edge function
        supabase.functions.invoke('send-job-status-email', {
          body: {
            customerName: profile.customer_type === 'business' ? profile.company_name : profile.full_name,
            customerEmail: profile.email,
            jobDescription: description,
            status: 'started',
          },
        }).catch(console.error);
      } else if (action === 'complete') {
        // Create job with completed status directly
        const { data: job, error: jobError } = await supabase
          .from('jobs')
          .insert({
            quote_id: quote.id,
            user_id: profile.id,
            status: 'completed',
            completed_date: new Date().toISOString(),
          })
          .select()
          .single();

        if (jobError) throw jobError;

        // Send notification to user
        await supabase.from('notifications').insert({
          user_id: profile.id,
          type: 'job_update',
          title: 'Oppdraget ditt er fullført',
          message: `Oppdraget "${description.substring(0, 100)}" er nå ferdig. Takk for at du valgte HandyHjelp!`,
          read: false
        });

        // Send completion email via edge function
        const emailResult = await sendJobStatusEmail({
          customerName: profile.customer_type === 'business' ? profile.company_name : profile.full_name,
          customerEmail: profile.email,
          jobDescription: description,
          status: 'completed',
          jobId: job.id,
        });
        completionEmailFailed = !emailResult.ok;
      }
      // For action === 'register', we just create the quote without a job

      await fetchData();

      // Log activity
      const actionLabels = {
        register: 'job_created',
        start: 'job_started',
        complete: 'job_completed',
      };
      await logActivity(
        actionLabels[action] as 'job_created' | 'job_started' | 'job_completed',
        'job_management',
        `Opprettet oppdrag for ${profile.customer_type === 'business' ? profile.company_name : profile.full_name}: "${description.substring(0, 50)}..." (${action === 'register' ? 'registrert' : action === 'start' ? 'startet' : 'fullført'})`,
        { profile_id: profile.id, action }
      );

      const messages = {
        register: "Oppdraget er registrert og venter på å bli startet.",
        start: "Oppdraget er opprettet og startet. Kunden har mottatt e-post.",
        complete: completionEmailFailed
          ? "Oppdraget er opprettet og fullført, men bekreftelses-e-posten til kunden feilet. Bruk «Send bekreftelse på nytt» på jobbkortet."
          : "Oppdraget er opprettet og fullført. Kunden har mottatt bekreftelse på e-post.",
      };

      toast({
        title: "Oppdrag opprettet!",
        description: messages[action],
      });

    } catch (error: any) {
      console.error('Error creating job:', error);
      toast({
        title: "Feil",
        description: `Kunne ikke opprette oppdrag: ${error?.message || 'Ukjent feil'}`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // New function: Complete a job without starting it first
  const handleCompleteJobWithoutStart = async (quote: Quote) => {
    setActionLoading(quote.id);
    
    try {
      // 1. Create job with completed status directly
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .insert({
          quote_id: quote.id,
          user_id: quote.user_id,
          status: 'completed',
          completed_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // 2. Update quote to completed
      const { error: quoteError } = await supabase
        .from('quotes')
        .update({ status: 'completed' })
        .eq('id', quote.id);

      if (quoteError) throw quoteError;

      // 3. Create notification for user
      if (quote.user_id) {
        await supabase.from('notifications').insert({
          user_id: quote.user_id,
          type: 'job_update',
          title: 'Oppdraget ditt er fullført',
          message: `Oppdraget "${quote.description.substring(0, 100)}" er nå ferdig. Takk for at du valgte HandyHjelp!`,
          read: false
        });
      }

      // 4. Send only completion email (not started email)
      const emailResult = await sendJobStatusEmail({
        customerName: quote.type === 'business' ? quote.company_name : quote.name,
        customerEmail: quote.email,
        jobDescription: quote.description,
        status: 'completed',
        jobId: job.id,
      });

      await fetchData();

      // Log activity
      await logActivity(
        'job_completed',
        'job_management',
        `Fullførte oppdrag direkte for ${quote.type === 'business' ? quote.company_name : quote.name}: "${quote.description.substring(0, 50)}..."`,
        { quote_id: quote.id }
      );

      if (emailResult.ok) {
        toast({
          title: "Suksess!",
          description: "Oppdraget er fullført og kunden har mottatt bekreftelse på e-post.",
        });
      } else {
        toast({
          title: "Oppdraget er fullført – men e-posten feilet",
          description: "Oppdraget er lagret som fullført, men bekreftelses-e-posten til kunden gikk ikke ut. Bruk «Send bekreftelse på nytt» på jobbkortet.",
        });
      }

    } catch (error: any) {
      console.error('Error completing job without start:', error);
      toast({
        title: "Feil",
        description: `Kunne ikke fullføre oppdraget: ${error?.message || 'Ukjent feil'}`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateAgreementStatus = async (agreementId: string, newStatus: string) => {
    setActionLoading(agreementId);
    
    try {
      // Find the agreement to get email details
      const agreement = agreements.find(a => a.id === agreementId);
      if (!agreement) throw new Error('Avtale ikke funnet');

      const { error } = await supabase
        .from('service_agreements')
        .update({ status: newStatus })
        .eq('id', agreementId);

      if (error) throw error;

      setAgreements(prev => prev.map(a => 
        a.id === agreementId ? { ...a, status: newStatus } : a
      ));

      // Send notification to user if they have a user_id
      if (agreement.user_id) {
        const statusMessages: Record<string, { title: string; message: string }> = {
          under_review: { title: 'Avtaleforespørsel under vurdering', message: 'Vi ser på din forespørsel og kontakter deg snart.' },
          offer_sent: { title: 'Du har mottatt et tilbud!', message: 'Vi har sendt deg et tilbud på serviceavtale. Sjekk e-posten din.' },
          contract_signed: { title: 'Avtale inngått! 🎉', message: 'Velkommen som avtalekunde hos HandyHjelp!' },
          rejected: { title: 'Forespørsel behandlet', message: 'Vi har behandlet din forespørsel. Se e-post for detaljer.' }
        };

        const notif = statusMessages[newStatus];
        if (notif) {
          await supabase.from('notifications').insert({
            user_id: agreement.user_id,
            type: 'agreement_update',
            title: notif.title,
            message: notif.message,
            read: false
          });
        }
      }

      // Send email to customer
      supabase.functions.invoke('send-agreement-status-email', {
        body: {
          contactPerson: agreement.contact_person,
          email: agreement.email,
          address: agreement.address,
          services: agreement.services,
          status: newStatus,
        },
      }).catch(console.error);

      // Log activity
      const agreementAction = newStatus === 'contract_signed'
        ? 'agreement_approved'
        : newStatus === 'rejected'
          ? 'agreement_rejected'
          : 'agreement_updated';
      await logActivity(
        agreementAction,
        'agreement_management',
        `Endret avtalestatus til "${newStatus}" for ${agreement.contact_person} (${agreement.address})`,
        { agreement_id: agreementId, status: newStatus }
      );

      toast({
        title: "Oppdatert",
        description: "Status er oppdatert og e-post sendt til kunde.",
      });
    } catch (error: any) {
      console.error('Error updating agreement:', error);
      toast({
        title: "Feil",
        description: `Kunne ikke oppdatere status: ${error?.message || 'Ukjent feil'}`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectAgreement = async (agreementId: string, rejectionReason: string) => {
    setActionLoading(agreementId);
    
    try {
      const agreement = agreements.find(a => a.id === agreementId);
      if (!agreement) throw new Error('Avtale ikke funnet');

      const { error } = await supabase
        .from('service_agreements')
        .update({ 
          status: 'rejected',
          rejection_reason: rejectionReason,
          rejected_at: new Date().toISOString()
        })
        .eq('id', agreementId);

      if (error) throw error;

      setAgreements(prev => prev.map(a => 
        a.id === agreementId ? { ...a, status: 'rejected', rejection_reason: rejectionReason } : a
      ));

      // Log activity
      await supabase.from('agreement_activities').insert({
        agreement_id: agreementId,
        action: 'rejected',
        description: `Forespørsel avslått: ${rejectionReason}`
      });

      // Send notification to user if they have a user_id
      if (agreement.user_id) {
        await supabase.from('notifications').insert({
          user_id: agreement.user_id,
          type: 'agreement_update',
          title: 'Forespørsel behandlet',
          message: 'Vi har behandlet din forespørsel. Se e-post for detaljer.',
          read: false
        });
      }

      // Send email to customer with rejection reason
      supabase.functions.invoke('send-agreement-status-email', {
        body: {
          contactPerson: agreement.contact_person,
          email: agreement.email,
          address: agreement.address,
          services: agreement.services,
          status: 'rejected',
          rejectionReason: rejectionReason,
        },
      }).catch(console.error);

      // Log activity
      await logActivity(
        'agreement_rejected',
        'agreement_management',
        `Avslo avtaleforespørsel for ${agreement.contact_person} (${agreement.address}): ${rejectionReason}`,
        { agreement_id: agreementId, rejection_reason: rejectionReason }
      );

      toast({
        title: "Avslått",
        description: "Forespørselen er avslått og kunden er informert.",
      });
    } catch (error: any) {
      console.error('Error rejecting agreement:', error);
      toast({
        title: "Feil",
        description: `Kunne ikke avslå forespørselen: ${error?.message || 'Ukjent feil'}`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const pendingQuotes = quotes.filter(q => q.status === 'pending');
  const activeJobs = jobs.filter(j => j.status === 'in_progress');
  const allCompletedJobs = jobs.filter(j => j.status === 'completed');
  const newAgreements = agreements.filter(a => a.status === 'new');

  // Filter completed jobs: recent (last month) vs old
  const { recentCompletedJobs, oldCompletedJobs } = useMemo(() => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const recent = allCompletedJobs.filter(j => 
      new Date(j.completed_date || j.created_at) > oneMonthAgo
    );
    const old = allCompletedJobs.filter(j => 
      new Date(j.completed_date || j.created_at) <= oneMonthAgo
    );
    
    return { recentCompletedJobs: recent, oldCompletedJobs: old };
  }, [allCompletedJobs]);

  // Displayed completed jobs based on toggle
  const displayedCompletedJobs = showOldCompletedJobs 
    ? allCompletedJobs
    : recentCompletedJobs;

  // Pagination for completed jobs
  const totalCompletedPages = Math.ceil(displayedCompletedJobs.length / JOBS_PER_PAGE);
  const paginatedCompletedJobs = displayedCompletedJobs.slice(
    (completedJobsPage - 1) * JOBS_PER_PAGE,
    completedJobsPage * JOBS_PER_PAGE
  );

  // Reset page when toggling
  useEffect(() => {
    setCompletedJobsPage(1);
  }, [showOldCompletedJobs]);

  const refreshData = () => {
    fetchData();
  };

  return {
    quotes,
    jobs,
    profiles,
    agreements,
    loading,
    actionLoading,
    pendingQuotes,
    activeJobs,
    completedJobs: displayedCompletedJobs,
    paginatedCompletedJobs,
    recentCompletedJobsCount: recentCompletedJobs.length,
    oldCompletedJobsCount: oldCompletedJobs.length,
    showOldCompletedJobs,
    setShowOldCompletedJobs,
    completedJobsPage,
    setCompletedJobsPage,
    totalCompletedPages,
    newAgreements,
    handleStartJob,
    handleCompleteJob,
    handleDeleteJob,
    handleDeleteQuote,
    handleCreateJob,
    handleCompleteJobWithoutStart,
    handleUpdateAgreementStatus,
    handleRejectAgreement,
    refreshData,
  };
};
