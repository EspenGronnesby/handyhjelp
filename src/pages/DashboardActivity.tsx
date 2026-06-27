import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDistanceToNow, format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { FileText, Briefcase, ClipboardList, CalendarCheck, Receipt, Download, Loader2, CheckCircle, ChevronLeft, ChevronRight, Camera, Upload, MapPin, Clock, User, Users, AlertTriangle, ArrowRight, Star, Eye, MousePointerClick, BarChart3 } from 'lucide-react';
import { CardGridSkeleton, PageHeaderSkeleton, StatsSkeleton } from '@/components/ui/skeleton-loaders';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useRole } from '@/hooks/useRole';
import { useNavigationBadges } from '@/hooks/useNavigationBadges';
import { AdminStatDetailModal, type StatCardType } from '@/components/admin/AdminStatDetailModal';
import { AnalyticsStatDetailModal, type AnalyticsStatType } from '@/components/admin/AnalyticsStatDetailModal';
import { useAnalyticsOverview } from '@/hooks/useAnalyticsOverview';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const JOBS_PER_PAGE = 10;
interface Quote {
  id: string;
  type: string;
  name: string;
  email: string;
  phone: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  address?: string;
  company_name?: string;
}
interface Job {
  id: string;
  user_id: string;
  quote_id: string;
  status: string;
  scheduled_date?: string;
  completed_date?: string;
  estimated_completion?: string;
  started_at?: string;
  notes?: string;
  created_at: string;
  quotes: {
    description: string;
    type: string;
    name: string;
    company_name?: string;
    created_at?: string;
  };
}
interface ServiceAgreement {
  id: string;
  customer_type: string;
  address: string;
  services: string[];
  frequency: string;
  contract_duration: string;
  status: string;
  created_at: string;
  contact_person: string;
  offer_sent_at?: string;
  contract_signed_at?: string;
}
interface Invoice {
  id: string;
  job_id: string;
  amount: number;
  due_date: string;
  file_url: string | null;
  status: string;
  invoice_number: string;
  created_at: string;
}
interface ActivityLogEntry {
  id: string;
  action_type: string;
  user_name: string | null;
  metadata: Record<string, any> | null;
  created_at: string | null;
  description: string;
}
interface EmailLogEntry {
  id: string;
  subject: string;
  sent_at: string | null;
  sender_name: string | null;
  recipient_name: string | null;
  template_name: string | null;
}
interface ActivityEvent {
  date: string;
  label: string;
  gradient: string;
  id: string;
  entityType: 'quote' | 'job' | 'agreement' | 'invoice' | 'email';
  entity: Quote | Job | ServiceAgreement | Invoice | EmailLogEntry;
  customerName?: string;
  actorName?: string;
}
interface InvoiceRequest {
  id: string;
  job_id: string;
  status: string;
}
const quoteStatusColors: Record<string, string> = {
  pending: 'bg-yellow-500',
  under_review: 'bg-blue-500',
  quoted: 'bg-purple-500',
  accepted: 'bg-green-500',
  rejected: 'bg-red-500',
  in_progress: 'bg-orange-500'
};
const quoteStatusLabels: Record<string, string> = {
  pending: 'Venter',
  under_review: 'Under vurdering',
  quoted: 'Tilbud mottatt',
  accepted: 'Akseptert',
  rejected: 'Avvist',
  in_progress: 'Under arbeid'
};
const agreementStatusColors: Record<string, string> = {
  new: 'bg-yellow-500',
  under_review: 'bg-blue-500',
  offer_sent: 'bg-purple-500',
  contract_signed: 'bg-green-500',
  rejected: 'bg-red-500'
};
const agreementStatusLabels: Record<string, string> = {
  new: 'Ny',
  under_review: 'Under vurdering',
  offer_sent: 'Tilbud sendt',
  contract_signed: 'Avtale inngått',
  rejected: 'Avslått'
};
const serviceLabels: Record<string, string> = {
  maintenance: 'Vedlikehold',
  cleaning: 'Renhold',
  winter: 'Vintervedlikehold',
  summer: 'Sommervedlikehold',
  inspection: 'Tilsyn',
  other: 'Annet'
};
const frequencyLabels: Record<string, string> = {
  daily: 'Daglig',
  weekly: 'Ukentlig',
  monthly: 'Månedlig',
  on_demand: 'Ved behov'
};
const QUOTE_STEPS = ['pending', 'under_review', 'quoted', 'accepted', 'in_progress'];
const AGREEMENT_STEPS = ['new', 'under_review', 'offer_sent', 'contract_signed'];

const navButtonLabel: Record<string, string> = {
  email:     'Se e-post i historikk',
  quote:     'Se forespørsel i Administrasjon',
  job:       'Se jobb i Administrasjon',
  agreement: 'Se avtale i Administrasjon',
  invoice:   'Se faktura i Administrasjon',
};

const getEntityNavLink = (event: ActivityEvent): string => {
  const id = (event.entity as { id: string }).id;
  switch (event.entityType) {
    case 'email':
      return `/dashboard/admin?category=mail&tab=history&highlight=${id}`;
    case 'quote':
      return `/dashboard/admin?category=oppdrag&tab=single-jobs&filter=pending&highlight=${id}`;
    case 'job': {
      const status = (event.entity as { status: string }).status;
      const filter = status === 'completed' ? 'completed' : 'in_progress';
      return `/dashboard/admin?category=oppdrag&tab=single-jobs&filter=${filter}&highlight=${id}`;
    }
    case 'agreement':
      return `/dashboard/admin?category=oppdrag&tab=agreements&highlight=${id}`;
    case 'invoice':
      return `/dashboard/admin?category=okonomi&tab=invoices&highlight=${id}`;
  }
};

const StatusProgressBar = ({ status, steps }: { status: string; steps: string[] }) => {
  const activeIndex = steps.indexOf(status);
  return (
    <div className="flex items-center gap-1 mt-3">
      {steps.map((step, i) => (
        <div
          key={step}
          className={`h-1.5 flex-1 rounded-full transition-all ${
            i <= activeIndex ? 'bg-primary' : 'bg-muted-foreground/20'
          }`}
        />
      ))}
    </div>
  );
};

const DashboardActivity = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [agreements, setAgreements] = useState<ServiceAgreement[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceRequests, setInvoiceRequests] = useState<InvoiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestingInvoice, setRequestingInvoice] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [completedJobsPage, setCompletedJobsPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<ActivityEvent | null>(null);
  const [jobActivityLogs, setJobActivityLogs] = useState<ActivityLogEntry[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLogEntry[]>([]);
  const [adminEmailLogs, setAdminEmailLogs] = useState<EmailLogEntry[]>([]);
  const [adminQuotes, setAdminQuotes] = useState<Quote[]>([]);
  const [adminJobs, setAdminJobs] = useState<Job[]>([]);
  const [adminAgreements, setAdminAgreements] = useState<ServiceAgreement[]>([]);
  const [adminOverviewStats, setAdminOverviewStats] = useState({ totalCustomers: 0, totalCompleted: 0 });
  const [selectedCard, setSelectedCard] = useState<StatCardType | null>(null);
  const [selectedAnalytics, setSelectedAnalytics] = useState<AnalyticsStatType>(null);
  const { isWorker, isAdmin, isOwner } = useRole();
  const { badges } = useNavigationBadges();
  const { data: analyticsOverview } = useAnalyticsOverview(isAdmin || isOwner);
  const fetchData = useCallback(async () => {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    // Alle bruker-queries parallelt
    const [
      { data: quotesData },
      { data: jobsData },
      { data: agreementsData },
      { data: invoicesData },
      { data: requestsData },
      { data: activityLogsData },
      { data: emailLogsData },
      { data: rolesData },
    ] = await Promise.all([
      supabase.from('quotes').select('*')
        .or(`user_id.eq.${user.id},email.eq.${user.email}`)
        .neq('status', 'completed')
        .order('created_at', { ascending: false }),
      supabase.from('jobs').select('*, quotes(description, type, name, company_name, created_at)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase.from('service_agreements').select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase.from('invoices').select('*').eq('user_id', user.id),
      supabase.from('invoice_requests').select('*').eq('user_id', user.id),
      supabase.from('activity_logs')
        .select('id, action_type, user_name, metadata, created_at, description')
        .in('action_type', ['job_started', 'job_completed'])
        .order('created_at', { ascending: false })
        .limit(30),
      supabase.from('email_logs')
        .select('id, subject, sent_at, sender_name, recipient_name, template_name')
        .eq('recipient_user_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(10),
      supabase.from('user_roles').select('role').eq('user_id', user.id),
    ]);

    if (quotesData) setQuotes(quotesData);
    if (jobsData) setJobs(jobsData);
    if (agreementsData) setAgreements(agreementsData as ServiceAgreement[]);
    if (invoicesData) setInvoices(invoicesData as Invoice[]);
    if (requestsData) setInvoiceRequests(requestsData as InvoiceRequest[]);
    if (activityLogsData) setJobActivityLogs(activityLogsData as ActivityLogEntry[]);
    if (emailLogsData) setEmailLogs(emailLogsData as EmailLogEntry[]);

    const userRoles = rolesData?.map(r => r.role) ?? [];
    const hasAdminAccess = userRoles.includes('admin') || userRoles.includes('platform_owner');

    if (hasAdminAccess) {
      const [adminQRes, adminJRes, adminARes, adminEmailRes] = await Promise.all([
        supabase.from('quotes').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('jobs').select('*, quotes(description, type, name, company_name, created_at)').order('created_at', { ascending: false }).limit(10),
        supabase.from('service_agreements').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('email_logs')
          .select('id, subject, sent_at, sender_name, recipient_name, template_name')
          .order('sent_at', { ascending: false })
          .limit(10),
      ]);
      if (adminQRes.data) setAdminQuotes(adminQRes.data);
      if (adminJRes.data) setAdminJobs(adminJRes.data);
      if (adminARes.data) setAdminAgreements(adminARes.data as ServiceAgreement[]);
      if (adminEmailRes.data) setAdminEmailLogs(adminEmailRes.data as EmailLogEntry[]);

      const [nonCustomerRoles, completedRes] = await Promise.all([
        supabase.from('user_roles').select('user_id').in('role', ['admin', 'platform_owner', 'worker', 'moderator']),
        supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
      ]);
      const excludeIds = (nonCustomerRoles.data ?? []).map(r => r.user_id);
      const customersRes = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .not('id', 'in', excludeIds.length > 0 ? `(${excludeIds.join(',')})` : '(00000000-0000-0000-0000-000000000000)');
      setAdminOverviewStats({
        totalCustomers: customersRes.count ?? 0,
        totalCompleted: completedRes.count ?? 0,
      });
    }

    setLoading(false);
  }, []);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Realtime subscription for quotes, jobs, agreements, and invoice_requests
  useEffect(() => {
    if (!userId) return;
    const quotesChannel = supabase.channel('quotes-realtime').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'quotes'
    }, () => fetchData()).subscribe();
    const jobsChannel = supabase.channel('jobs-realtime').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'jobs'
    }, () => fetchData()).subscribe();
    const agreementsChannel = supabase.channel('agreements-realtime').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'service_agreements'
    }, () => fetchData()).subscribe();
    const invoicesChannel = supabase.channel('invoices-realtime').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'invoices'
    }, () => fetchData()).subscribe();
    const requestsChannel = supabase.channel('invoice-requests-realtime').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'invoice_requests'
    }, () => fetchData()).subscribe();
    return () => {
      supabase.removeChannel(quotesChannel);
      supabase.removeChannel(jobsChannel);
      supabase.removeChannel(agreementsChannel);
      supabase.removeChannel(invoicesChannel);
      supabase.removeChannel(requestsChannel);
    };
  }, [userId, fetchData]);
  const handleRequestInvoice = async (job: Job) => {
    if (!userId) return;
    setRequestingInvoice(job.id);
    try {
      // Create invoice request
      const {
        error: requestError
      } = await supabase.from('invoice_requests').insert({
        job_id: job.id,
        user_id: userId,
        status: 'pending'
      });
      if (requestError) throw requestError;

      // Send notification to admin
      await supabase.functions.invoke('send-invoice-request-notification', {
        body: {
          jobId: job.id,
          userId: userId,
          customerName: job.quotes.name,
          customerEmail: '',
          // Will be fetched from profile
          jobDescription: job.quotes.description
        }
      });
      toast({
        title: 'Forespørsel sendt',
        description: 'Vi sender deg fakturaen så snart den er klar.'
      });
      fetchData();
    } catch (error: any) {
      console.error('Error requesting invoice:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke sende forespørsel. Prøv igjen.',
        variant: 'destructive'
      });
    } finally {
      setRequestingInvoice(null);
    }
  };
  const getInvoiceForJob = (jobId: string) => {
    return invoices.find(inv => inv.job_id === jobId);
  };
  const getInvoiceRequestForJob = (jobId: string) => {
    return invoiceRequests.find(req => req.job_id === jobId);
  };
  const handleDownloadInvoice = async (invoice: Invoice) => {
    if (!invoice.file_url) {
      toast({
        title: 'Ingen fil',
        description: 'Det er ingen PDF-fil tilgjengelig for denne fakturaen.',
        variant: 'destructive'
      });
      return;
    }
    try {
      // Extract path from URL
      const filePath = invoice.file_url.split('/invoices/')[1];
      if (!filePath) throw new Error('Invalid file path');

      // Download the file directly
      const {
        data,
        error
      } = await supabase.storage.from('invoices').download(filePath);
      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Faktura-${invoice.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error downloading invoice:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke laste ned faktura. Prøv igjen.',
        variant: 'destructive'
      });
    }
  };
  const {
    stats,
    isLoading: statsLoading
  } = useDashboardStats();

  // Flytt alle useMemo hooks FØR loading-return for å unngå React hooks-feil
  const completedJobs = useMemo(() => 
    jobs.filter(job => job.status === 'completed'), 
    [jobs]
  );
  
  // Pagination for completed jobs
  const totalCompletedPages = Math.ceil(completedJobs.length / JOBS_PER_PAGE);
  const paginatedCompletedJobs = useMemo(() => 
    completedJobs.slice(
      (completedJobsPage - 1) * JOBS_PER_PAGE,
      completedJobsPage * JOBS_PER_PAGE
    ),
    [completedJobs, completedJobsPage]
  );
  
  // Filtrer aktive avtaler (ikke avslått)
  const activeAgreements = useMemo(() => 
    agreements.filter(a => a.status !== 'rejected'),
    [agreements]
  );

  const isOnlyWorker = isWorker && !isAdmin && !isOwner;

  const allActivityEvents = useMemo((): ActivityEvent[] => {
    // Bygg lookup-map: jobId/quoteId → aktørnavn fra activity_logs
    const jobActorMap: Record<string, string> = {};
    jobActivityLogs.forEach(log => {
      const id = log.metadata?.job_id ?? log.metadata?.quote_id ?? log.metadata?.profile_id;
      if (id && log.user_name) jobActorMap[id] = log.user_name;
    });

    if (isAdmin || isOwner) {
      // Plattformomfattende visning for admin/owner
      const events: ActivityEvent[] = [
        ...adminQuotes.map(q => ({
          date: q.created_at,
          label: 'Forespørsel sendt',
          gradient: 'from-amber-500 to-orange-500',
          id: q.id,
          entityType: 'quote' as const,
          entity: q,
          customerName: q.type === 'business' ? (q.company_name ?? q.name) : q.name,
        })),
        ...adminJobs.filter(j => j.started_at).map(j => ({
          date: j.started_at!,
          label: 'Jobb påbegynt',
          gradient: 'from-cyan-500 to-blue-500',
          id: j.id,
          entityType: 'job' as const,
          entity: j,
          customerName: j.quotes?.type === 'business' ? (j.quotes?.company_name ?? j.quotes?.name) : j.quotes?.name,
          actorName: jobActorMap[j.id] ?? jobActorMap[j.quote_id],
        })),
        ...adminJobs.filter(j => j.status === 'completed' && j.completed_date).map(j => ({
          date: j.completed_date!,
          label: 'Jobb fullført',
          gradient: 'from-emerald-500 to-teal-500',
          id: `${j.id}-completed`,
          entityType: 'job' as const,
          entity: j,
          customerName: j.quotes?.type === 'business' ? (j.quotes?.company_name ?? j.quotes?.name) : j.quotes?.name,
          actorName: jobActorMap[j.id] ?? jobActorMap[j.quote_id],
        })),
        ...adminAgreements.map(a => ({
          date: a.created_at,
          label: 'Avtaleforespørsel sendt',
          gradient: 'from-fuchsia-500 to-purple-500',
          id: a.id,
          entityType: 'agreement' as const,
          entity: a,
          customerName: a.contact_person,
        })),
        ...adminEmailLogs.filter(e => e.sent_at).map(e => ({
          date: e.sent_at!,
          label: 'E-post sendt',
          gradient: 'from-sky-500 to-blue-500',
          id: e.id,
          entityType: 'email' as const,
          entity: e,
          customerName: e.recipient_name ?? undefined,
          actorName: e.sender_name ?? 'HandyHjelp',
        })),
      ];
      return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    // Vanlig bruker: egne data
    const quoteStatusEvents: ActivityEvent[] = quotes.flatMap(q => {
      const base: ActivityEvent = {
        date: q.created_at,
        label: 'Forespørsel sendt',
        gradient: 'from-amber-500 to-orange-500',
        id: q.id,
        entityType: 'quote',
        entity: q,
      };
      if (q.status === 'pending') return [base];
      const statusEvent: ActivityEvent = {
        date: q.updated_at,
        label: q.status === 'under_review' ? 'Forespørsel under vurdering'
             : q.status === 'quoted' ? 'Tilbud mottatt'
             : q.status === 'accepted' ? 'Tilbud akseptert'
             : 'Forespørsel oppdatert',
        gradient: q.status === 'quoted' || q.status === 'accepted'
          ? 'from-purple-500 to-violet-500'
          : 'from-amber-500 to-orange-500',
        id: `${q.id}-status`,
        entityType: 'quote',
        entity: q,
      };
      return [base, statusEvent];
    });

    const agreementMilestones: ActivityEvent[] = agreements.flatMap(a => {
      const milestones: ActivityEvent[] = [{
        date: a.created_at,
        label: 'Avtaleforespørsel sendt',
        gradient: 'from-fuchsia-500 to-purple-500',
        id: a.id,
        entityType: 'agreement',
        entity: a,
      }];
      if (a.offer_sent_at) milestones.push({
        date: a.offer_sent_at,
        label: 'Tilbud sendt på avtale',
        gradient: 'from-purple-500 to-violet-500',
        id: `${a.id}-offer`,
        entityType: 'agreement',
        entity: a,
      });
      if (a.contract_signed_at) milestones.push({
        date: a.contract_signed_at,
        label: 'Avtale signert!',
        gradient: 'from-emerald-500 to-teal-500',
        id: `${a.id}-signed`,
        entityType: 'agreement',
        entity: a,
      });
      return milestones;
    });

    const events: ActivityEvent[] = [
      ...quoteStatusEvents,
      ...jobs.filter(j => j.started_at).map(j => ({
        date: j.started_at!,
        label: 'Jobb påbegynt',
        gradient: 'from-cyan-500 to-blue-500',
        id: `${j.id}-started`,
        entityType: 'job' as const,
        entity: j,
        actorName: jobActorMap[j.id] ?? jobActorMap[j.quote_id],
      })),
      ...jobs.filter(j => j.status === 'completed' && j.completed_date).map(j => ({
        date: j.completed_date!,
        label: 'Jobb fullført',
        gradient: 'from-emerald-500 to-teal-500',
        id: `${j.id}-completed`,
        entityType: 'job' as const,
        entity: j,
        actorName: jobActorMap[j.id] ?? jobActorMap[j.quote_id],
      })),
      ...agreementMilestones,
      ...invoices.filter(i => i.status === 'paid').map(i => ({
        date: i.created_at,
        label: `Faktura betalt — ${(i.amount || 0).toLocaleString('nb-NO')} kr`,
        gradient: 'from-emerald-500 to-cyan-500',
        id: i.id,
        entityType: 'invoice' as const,
        entity: i,
      })),
      ...emailLogs.filter(e => e.sent_at).map(e => ({
        date: e.sent_at!,
        label: 'E-post sendt',
        gradient: 'from-sky-500 to-blue-500',
        id: e.id,
        entityType: 'email' as const,
        entity: e,
        actorName: e.sender_name ?? 'HandyHjelp',
      })),
    ];
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [quotes, jobs, invoices, agreements, adminQuotes, adminJobs, adminAgreements,
      jobActivityLogs, emailLogs, adminEmailLogs, isAdmin, isOwner]);

  const recentActivity = allActivityEvents.slice(0, 5);

  if (loading || statsLoading) {
    return <div className="space-y-6">
        <PageHeaderSkeleton />
        <StatsSkeleton />
        <CardGridSkeleton count={3} />
      </div>;
  }

  const isEmpty = quotes.length === 0 && completedJobs.length === 0 && agreements.length === 0;

  return <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Oversikt</h1>
        <p className="text-muted-foreground">
          {isOnlyWorker
            ? 'Dine innleveringer og status'
            : (isAdmin || isOwner)
            ? 'Plattformstatus og nøkkeltall'
            : 'Hold oversikt over dine tilbud og jobber'}
        </p>
      </div>

      {/* Siste aktivitet */}
      {!isOnlyWorker && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Siste aktivitet{(isAdmin || isOwner) ? ' — alle kunder' : ''}
          </p>
          {recentActivity.length === 0 ? (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border/50 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-muted-foreground/30 shrink-0" />
              <span>Ingen aktivitet ennå —</span>
              <Link to="/tilbud" className="text-primary hover:underline">
                send din første forespørsel
              </Link>
            </div>
          ) : (
            <>
              <div className="flex flex-row gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {recentActivity.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-card border border-border/50 shrink-0 cursor-pointer hover:border-primary/40 hover:bg-card/80 transition-colors text-left"
                  >
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${event.gradient} shrink-0`} />
                    <div className="flex flex-col">
                      <span className="text-sm text-foreground/80 whitespace-nowrap">{event.label}</span>
                      {(isAdmin || isOwner) ? (
                        <>
                          {event.customerName && <span className="text-xs text-muted-foreground whitespace-nowrap">{event.customerName}</span>}
                          {event.actorName && <span className="text-xs text-muted-foreground/60 whitespace-nowrap">Av: {event.actorName}</span>}
                        </>
                      ) : (
                        event.actorName && <span className="text-xs text-muted-foreground whitespace-nowrap">{event.actorName}</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-1">
                      {new Date(event.date).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' })}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Detaljdialog for aktivitetshendelse */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedEvent && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${selectedEvent.gradient} shrink-0`} />
                  <DialogTitle>{selectedEvent.label}</DialogTitle>
                </div>
                <p className="text-xs text-muted-foreground pt-1">
                  {format(new Date(selectedEvent.date), 'd. MMMM yyyy', { locale: nb })}
                </p>
              </DialogHeader>

              <div className="space-y-3 pt-1">
                {selectedEvent.entityType === 'quote' && (() => {
                  const q = selectedEvent.entity as Quote;
                  return (
                    <>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium">{q.type === 'business' ? (q.company_name ?? q.name) : q.name}</span>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Beskrivelse</p>
                        <p className="text-sm">{q.description}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Status</span>
                        <Badge className={quoteStatusColors[q.status] ?? 'bg-muted'}>
                          {quoteStatusLabels[q.status] ?? q.status}
                        </Badge>
                      </div>
                      {q.address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          <span className="text-sm">{q.address}</span>
                        </div>
                      )}
                    </>
                  );
                })()}

                {selectedEvent.entityType === 'job' && (() => {
                  const j = selectedEvent.entity as Job;
                  return (
                    <>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium">
                          {j.quotes?.type === 'business' ? (j.quotes?.company_name ?? j.quotes?.name) : j.quotes?.name}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Beskrivelse</p>
                        <p className="text-sm">{j.quotes?.description}</p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {j.started_at && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-xs text-muted-foreground">Påbegynt:</span>
                            <span className="text-sm">{format(new Date(j.started_at), 'd. MMM yyyy', { locale: nb })}</span>
                          </div>
                        )}
                        {j.completed_date && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span className="text-xs text-muted-foreground">Fullført:</span>
                            <span className="text-sm">{format(new Date(j.completed_date), 'd. MMM yyyy', { locale: nb })}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Status</span>
                        <Badge className={j.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}>
                          {j.status === 'completed' ? 'Fullført' : 'Pågår'}
                        </Badge>
                      </div>
                      {selectedEvent.actorName && (
                        <div className="flex items-center justify-between pt-1 border-t border-border/40">
                          <span className="text-xs text-muted-foreground">Utført av</span>
                          <span className="text-sm font-medium">{selectedEvent.actorName}</span>
                        </div>
                      )}
                    </>
                  );
                })()}

                {selectedEvent.entityType === 'agreement' && (() => {
                  const a = selectedEvent.entity as ServiceAgreement;
                  return (
                    <>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium">{a.contact_person}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="text-sm">{a.address}</span>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Tjenester</p>
                        <div className="flex flex-wrap gap-1">
                          {a.services.map((s: string) => (
                            <Badge key={s} variant="secondary" className="text-xs">
                              {serviceLabels[s] ?? s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Frekvens</span>
                        <span className="text-sm">{frequencyLabels[a.frequency] ?? a.frequency}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Status</span>
                        <Badge className={agreementStatusColors[a.status] ?? 'bg-muted'}>
                          {agreementStatusLabels[a.status] ?? a.status}
                        </Badge>
                      </div>
                    </>
                  );
                })()}

                {selectedEvent.entityType === 'invoice' && (() => {
                  const i = selectedEvent.entity as Invoice;
                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Fakturanummer</span>
                        <span className="text-sm font-medium">{i.invoice_number}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Beløp</span>
                        <span className="text-sm font-bold text-emerald-600">
                          {new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK' }).format(i.amount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Forfallsdato</span>
                        <span className="text-sm">{format(new Date(i.due_date), 'd. MMM yyyy', { locale: nb })}</span>
                      </div>
                      <Badge className="bg-green-500 w-fit flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Betalt
                      </Badge>
                    </>
                  );
                })()}

                {selectedEvent.entityType === 'email' && (() => {
                  const e = selectedEvent.entity as EmailLogEntry;
                  return (
                    <>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Emne</p>
                        <p className="text-sm font-medium">{e.subject}</p>
                      </div>
                      {e.recipient_name && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Mottaker</span>
                          <span className="text-sm">{e.recipient_name}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Sendt av</span>
                        <span className="text-sm font-medium">{e.sender_name ?? 'HandyHjelp'}</span>
                      </div>
                      {e.sent_at && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Tidspunkt</span>
                          <span className="text-sm">{format(new Date(e.sent_at), 'd. MMM yyyy HH:mm', { locale: nb })}</span>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {(isAdmin || isOwner) && (
                <div className="pt-3 border-t border-border/40">
                  <Link
                    to={getEntityNavLink(selectedEvent)}
                    onClick={() => setSelectedEvent(null)}
                  >
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <ArrowRight className="h-4 w-4" />
                      {navButtonLabel[selectedEvent.entityType]}
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Stats — arbeider-spesifikke */}
      {isOnlyWorker && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Link to="/dashboard/worker">
            <div className="card-hover-lift p-5 rounded-xl cursor-pointer bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white">
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm font-medium text-white/80">Venter godkjenning</p>
                <ClipboardList className="h-8 w-8 text-white/30" strokeWidth={1.5} />
              </div>
              <div className="text-3xl font-bold">{badges.workerDetails.pendingProjects + badges.workerDetails.pendingBlogs}</div>
              <p className="text-xs mt-1 text-white/60">Prosjekter og innlegg til vurdering</p>
            </div>
          </Link>
          <Link to="/dashboard/worker">
            <div className="card-hover-lift p-5 rounded-xl cursor-pointer bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 text-white">
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm font-medium text-white/80">Publiserte prosjekter</p>
                <Camera className="h-8 w-8 text-white/30" strokeWidth={1.5} />
              </div>
              <div className="text-3xl font-bold">—</div>
              <p className="text-xs mt-1 text-white/60">Se Mine innleveringer for detaljer</p>
            </div>
          </Link>
          <Link to="/dashboard/worker">
            <div className="card-hover-lift p-5 rounded-xl cursor-pointer bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600 text-white">
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm font-medium text-white/80">Avviste innleveringer</p>
                <Upload className="h-8 w-8 text-white/30" strokeWidth={1.5} />
              </div>
              <div className="text-3xl font-bold">{badges.workerDetails.rejectedProjects + badges.workerDetails.rejectedBlogs}</div>
              <p className="text-xs mt-1 text-white/60">Må rettes og sendes inn på nytt</p>
            </div>
          </Link>
        </div>
      )}

      {/* Stats — admin/owner business dashboard */}
      {(isAdmin || isOwner) && (
        <div className="space-y-4">
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <button onClick={() => setSelectedCard('customers')} disabled={adminOverviewStats.totalCustomers === 0} className="text-left w-full disabled:opacity-60 disabled:cursor-default">
              <div className="card-hover-lift p-5 rounded-xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-600 text-white cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-medium text-white/80">Totale kunder</p>
                  <Users className="h-8 w-8 text-white/30" strokeWidth={1.5} />
                </div>
                <div className="text-3xl font-bold">{adminOverviewStats.totalCustomers}</div>
                <p className="text-xs mt-1 text-white/60">registrerte kunder</p>
              </div>
            </button>
            <button onClick={() => setSelectedCard('quotes')} disabled={badges.adminDetails.pendingQuotes === 0} className="text-left w-full disabled:opacity-60 disabled:cursor-default">
              <div className="card-hover-lift p-5 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white cursor-pointer relative">
                {badges.adminDetails.pendingQuotes > 0 && (
                  <span className="absolute top-3 right-3 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF0000] opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF0000]" />
                  </span>
                )}
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-medium text-white/80">Åpne forespørsler</p>
                  <FileText className="h-8 w-8 text-white/30" strokeWidth={1.5} />
                </div>
                <div className="text-3xl font-bold">{badges.adminDetails.pendingQuotes}</div>
                <p className="text-xs mt-1 text-white/60">venter på svar</p>
              </div>
            </button>
            <button onClick={() => setSelectedCard('activeJobs')} disabled={badges.adminDetails.activeJobs === 0} className="text-left w-full disabled:opacity-60 disabled:cursor-default">
              <div className="card-hover-lift p-5 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 text-white cursor-pointer relative">
                {badges.adminDetails.activeJobs > 0 && (
                  <span className="absolute top-3 right-3 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400" />
                  </span>
                )}
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-medium text-white/80">Aktive jobber</p>
                  <Briefcase className="h-8 w-8 text-white/30" strokeWidth={1.5} />
                </div>
                <div className="text-3xl font-bold">{badges.adminDetails.activeJobs}</div>
                <p className="text-xs mt-1 text-white/60">pågår akkurat nå</p>
              </div>
            </button>
            <button onClick={() => setSelectedCard('completedJobs')} disabled={adminOverviewStats.totalCompleted === 0} className="text-left w-full disabled:opacity-60 disabled:cursor-default">
              <div className="card-hover-lift p-5 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 text-white cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-medium text-white/80">Fullførte jobber</p>
                  <CheckCircle className="h-8 w-8 text-white/30" strokeWidth={1.5} />
                </div>
                <div className="text-3xl font-bold">{adminOverviewStats.totalCompleted}</div>
                <p className="text-xs mt-1 text-white/60">ferdigstilte oppdrag</p>
              </div>
            </button>
          </div>

          {/* Analytics KPI row */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <button
              onClick={() => setSelectedAnalytics('visits')}
              className="text-left w-full sm:col-span-1"
            >
              <div className="card-hover-lift p-5 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 text-white cursor-pointer h-full">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-medium text-white/80">Besøk (siste 7 dager)</p>
                  <Eye className="h-8 w-8 text-white/30" strokeWidth={1.5} />
                </div>
                <div className="text-3xl font-bold">
                  {analyticsOverview ? new Intl.NumberFormat('nb-NO').format(analyticsOverview.kpi.pageviews) : '—'}
                </div>
                <p className="text-xs mt-1 text-white/60">
                  {analyticsOverview
                    ? `${new Intl.NumberFormat('nb-NO').format(analyticsOverview.kpi.visitors)} unike besøkende`
                    : 'laster…'}
                </p>
              </div>
            </button>
            <button
              onClick={() => setSelectedAnalytics('conversionRate')}
              className="text-left w-full sm:col-span-1"
            >
              <div className="card-hover-lift p-5 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 text-white cursor-pointer h-full">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-medium text-white/80">Konverteringsrate</p>
                  <MousePointerClick className="h-8 w-8 text-white/30" strokeWidth={1.5} />
                </div>
                <div className="text-3xl font-bold">
                  {analyticsOverview
                    ? new Intl.NumberFormat('nb-NO', { style: 'percent', maximumFractionDigits: 1 }).format(analyticsOverview.kpi.conversionRate)
                    : '—'}
                </div>
                <p className="text-xs mt-1 text-white/60">
                  {analyticsOverview
                    ? `${new Intl.NumberFormat('nb-NO').format(analyticsOverview.kpi.conversions)} konverteringer`
                    : 'laster…'}
                </p>
              </div>
            </button>
            <Link to="/dashboard/analytics" className="w-full sm:col-span-1">
              <div className="card-hover-lift p-5 rounded-xl bg-card border border-border/60 cursor-pointer h-full flex flex-col justify-between">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-medium text-muted-foreground">Full analyse</p>
                  <BarChart3 className="h-8 w-8 text-primary/40" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-base font-semibold text-foreground">Se mer data</div>
                  <p className="text-xs mt-1 text-muted-foreground inline-flex items-center gap-1">
                    Kilder, land, trakt og live feed <ArrowRight className="h-3 w-3" />
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Trenger oppmerksomhet */}
          {(badges.adminDetails.pendingQuotes > 0 ||
            (badges.adminDetails.pendingProjects + badges.adminDetails.pendingBlogs) > 0 ||
            badges.adminDetails.newAgreements > 0 ||
            badges.adminDetails.pendingReviews > 0) && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Trenger oppmerksomhet
              </p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {badges.adminDetails.pendingQuotes > 0 && (
                  <Link to="/dashboard/admin">
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card hover:border-amber-300/60 transition-colors cursor-pointer group">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
                        <AlertTriangle className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm text-foreground/80 flex-1">
                        {badges.adminDetails.pendingQuotes} forespørsel{badges.adminDetails.pendingQuotes !== 1 ? 'er' : ''} venter
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                    </div>
                  </Link>
                )}
                {(badges.adminDetails.pendingProjects + badges.adminDetails.pendingBlogs) > 0 && (
                  <Link to="/dashboard/admin">
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card hover:border-fuchsia-300/60 transition-colors cursor-pointer group">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-500 to-purple-500 flex items-center justify-center shrink-0">
                        <ClipboardList className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm text-foreground/80 flex-1">
                        {badges.adminDetails.pendingProjects + badges.adminDetails.pendingBlogs} innlevering{(badges.adminDetails.pendingProjects + badges.adminDetails.pendingBlogs) !== 1 ? 'er' : ''} til godkjenning
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                    </div>
                  </Link>
                )}
                {badges.adminDetails.newAgreements > 0 && (
                  <Link to="/dashboard/admin">
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card hover:border-cyan-300/60 transition-colors cursor-pointer group">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shrink-0">
                        <CalendarCheck className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm text-foreground/80 flex-1">
                        {badges.adminDetails.newAgreements} ny{badges.adminDetails.newAgreements !== 1 ? 'e' : ''} avtaleforespørsel{badges.adminDetails.newAgreements !== 1 ? 'er' : ''}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                    </div>
                  </Link>
                )}
                {badges.adminDetails.pendingReviews > 0 && (
                  <Link to="/dashboard/admin">
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card hover:border-rose-300/60 transition-colors cursor-pointer group">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shrink-0">
                        <Star className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm text-foreground/80 flex-1">
                        {badges.adminDetails.pendingReviews} anmeldelse{badges.adminDetails.pendingReviews !== 1 ? 'r' : ''} til moderering
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                    </div>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats — kunde-spesifikke */}
      {!isOnlyWorker && !isAdmin && !isOwner && (
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Mine oppdrag — kompakt samle-kort */}
          <div className="bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 text-white card-hover-lift p-6 rounded-xl flex flex-col justify-between min-h-[140px]">
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-white/80">Mine oppdrag</p>
              <Briefcase className="h-8 w-8 text-white/25" strokeWidth={1.5} />
            </div>
            <div className="flex items-end justify-around mt-4">
              <div className="text-center">
                <div className="text-5xl font-bold">{stats.totalQuotes}</div>
                <div className="text-white/60 text-sm mt-1">Forespørsler</div>
              </div>
              <div className="h-12 w-px bg-white/20 mb-5" />
              <div className="text-center">
                <div className="text-5xl font-bold">{stats.activeJobs}</div>
                <div className="text-white/60 text-sm mt-1">Aktive</div>
              </div>
              <div className="h-12 w-px bg-white/20 mb-5" />
              <div className="text-center">
                <div className="text-5xl font-bold">{stats.completedJobs}</div>
                <div className="text-white/60 text-sm mt-1">Fullførte</div>
              </div>
            </div>
          </div>

          {/* Fullførte jobber */}
          <div className="card-hover-lift p-6 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 text-white flex flex-col justify-between min-h-[140px]">
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-white/80">Fullførte jobber</p>
              <CheckCircle className="h-8 w-8 text-white/25" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-6xl font-bold">{stats.completedJobs}</div>
              <p className="text-sm mt-1 text-white/60">Ferdigstilte prosjekter</p>
            </div>
          </div>
        </div>
      )}

      {/* Kom i gang — vises bare når vanlig bruker ikke har noen data ennå */}
      {isEmpty && !isOnlyWorker && !isAdmin && !isOwner && (
        <div className="card-professional p-6">
          <h2 className="text-base font-semibold mb-1">Kom i gang</h2>
          <p className="text-sm text-muted-foreground mb-4">Her er noen ting du kan gjøre</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/tilbud">
              <Button variant="outline" className="w-full sm:w-auto justify-start">
                Send inn en ny tilbudsforespørsel
              </Button>
            </Link>
            <Link to="/dashboard/profile">
              <Button variant="outline" className="w-full sm:w-auto justify-start">
                Oppdater din profil
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Mine forespørsler — kun for vanlige brukere */}
      {!isEmpty && !isAdmin && !isOwner && <>
          <div>
            <h2 className="text-xl font-semibold mb-4">Mine Jobber</h2>
          </div>

      <Tabs defaultValue="quotes" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/60 rounded-xl p-1 h-auto">
          <TabsTrigger value="quotes" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-transparent data-[state=inactive]:bg-card data-[state=inactive]:border-border/50 data-[state=inactive]:text-foreground/70 data-[state=inactive]:hover:border-border data-[state=inactive]:hover:text-foreground">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Forespørsler</span> ({quotes.length})
          </TabsTrigger>
          <TabsTrigger value="agreements" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-transparent data-[state=inactive]:bg-card data-[state=inactive]:border-border/50 data-[state=inactive]:text-foreground/70 data-[state=inactive]:hover:border-border data-[state=inactive]:hover:text-foreground">
            <CalendarCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Avtaler</span> ({activeAgreements.length})
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-transparent data-[state=inactive]:bg-card data-[state=inactive]:border-border/50 data-[state=inactive]:text-foreground/70 data-[state=inactive]:hover:border-border data-[state=inactive]:hover:text-foreground">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Fullført</span> ({completedJobs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quotes" className="space-y-4">
          {quotes.length === 0 ? <div className="card-professional p-10 text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 shadow-md">
                <FileText className="h-7 w-7 text-white drop-shadow" />
              </div>
              <p className="font-semibold mb-1">Ingen forespørsler ennå</p>
              <p className="text-sm text-muted-foreground">Send inn din første forespørsel for å komme i gang</p>
            </div> : quotes.map(quote => <Card key={quote.id} className="border-t-2 border-t-amber-500 card-hover-lift">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 shadow-sm shrink-0">
                        <FileText className="h-4 w-4 text-white drop-shadow" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                            Forespørsel
                          </Badge>
                        </div>
                        <CardTitle className="text-lg mt-1">
                          {quote.type === 'business' ? quote.company_name : quote.name}
                        </CardTitle>
                        <CardDescription>
                          Sendt inn {formatDistanceToNow(new Date(quote.created_at), {
                        addSuffix: true,
                        locale: nb
                      })}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={quoteStatusColors[quote.status]}>
                      {quoteStatusLabels[quote.status] || quote.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-sm font-medium">Beskrivelse:</p>
                    <p className="text-sm text-muted-foreground">{quote.description}</p>
                  </div>
                  {quote.address && <div>
                      <p className="text-sm font-medium">Adresse:</p>
                      <p className="text-sm text-muted-foreground">{quote.address}</p>
                    </div>}
                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="font-medium">E-post:</span> {quote.email}
                    </div>
                    <div>
                      <span className="font-medium">Telefon:</span> {quote.phone}
                    </div>
                  </div>
                  <StatusProgressBar status={quote.status} steps={QUOTE_STEPS} />
                </CardContent>
              </Card>)}
        </TabsContent>

        <TabsContent value="agreements" className="space-y-4">
          {activeAgreements.length === 0 ? <div className="card-professional p-10 text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 shadow-md">
                <CalendarCheck className="h-7 w-7 text-white drop-shadow" />
              </div>
              <p className="font-semibold mb-1">Ingen aktive avtaler ennå</p>
              <p className="text-sm text-muted-foreground">
                <a href="/fast-avtale" className="text-primary hover:underline">Forespør en fast avtale</a>
              </p>
            </div> : activeAgreements.map(agreement => <Card key={agreement.id} className="border-t-2 border-t-primary card-hover-lift">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 shadow-sm shrink-0">
                        <CalendarCheck className="h-4 w-4 text-white drop-shadow" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">
                            Fast avtale
                          </Badge>
                        </div>
                        <CardTitle className="text-lg mt-1">
                          {agreement.contact_person}
                        </CardTitle>
                        <CardDescription>
                          Sendt inn {formatDistanceToNow(new Date(agreement.created_at), {
                        addSuffix: true,
                        locale: nb
                      })}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={agreementStatusColors[agreement.status]}>
                      {agreementStatusLabels[agreement.status] || agreement.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Adresse:</p>
                    <p className="text-sm text-muted-foreground">{agreement.address}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Tjenester:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {agreement.services.map((service: string) => <Badge key={service} variant="secondary" className="text-xs">
                          {serviceLabels[service] || service}
                        </Badge>)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Frekvens:</span> {frequencyLabels[agreement.frequency] || agreement.frequency}
                    </div>
                    <div>
                      <span className="font-medium">Varighet:</span> {agreement.contract_duration}
                    </div>
                  </div>
                  <StatusProgressBar status={agreement.status} steps={AGREEMENT_STEPS} />
                </CardContent>
              </Card>)}
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          {completedJobs.length === 0 ? <div className="card-professional p-10 text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 shadow-md">
                <Briefcase className="h-7 w-7 text-white drop-shadow" />
              </div>
              <p className="font-semibold mb-1">Ingen fullførte oppdrag ennå</p>
              <p className="text-sm text-muted-foreground">Når jobbene dine er ferdige, vises de her</p>
            </div> : <>
              {paginatedCompletedJobs.map(job => {
                const invoice = getInvoiceForJob(job.id);
                const invoiceRequest = getInvoiceRequestForJob(job.id);
                const hasRequestedInvoice = invoiceRequest && invoiceRequest.status === 'pending';
                return <Card key={job.id} className="border-t-2 border-t-green-500 card-hover-lift">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 shadow-sm shrink-0">
                          <Briefcase className="h-4 w-4 text-white drop-shadow" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
                              Fullført
                            </Badge>
                          </div>
                          <CardTitle className="text-lg mt-1">
                            {job.quotes.type === 'business' ? job.quotes.company_name : job.quotes.name}
                          </CardTitle>
                          <CardDescription>
                            Fullført {job.completed_date ? formatDistanceToNow(new Date(job.completed_date), {
                              addSuffix: true,
                              locale: nb
                            }) : formatDistanceToNow(new Date(job.created_at), {
                              addSuffix: true,
                              locale: nb
                            })}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className="bg-green-500">
                        Fullført
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Beskrivelse:</p>
                      <p className="text-sm text-muted-foreground">{job.quotes.description}</p>
                    </div>

                    {/* Invoice section */}
                    {invoice ? <div className={`p-4 rounded-lg space-y-3 ${invoice.status === 'paid' ? 'bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-800' : 'bg-primary/5 border border-primary/20'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Receipt className={`h-5 w-5 ${invoice.status === 'paid' ? 'text-green-600' : 'text-primary'}`} />
                            <span className="font-medium">Faktura {invoice.invoice_number}</span>
                          </div>
                          {invoice.status === 'paid' ? <Badge className="bg-green-500 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Betalt
                            </Badge> : invoice.status === 'overdue' ? <Badge className="bg-red-500">Forfalt</Badge> : <Badge className="bg-yellow-500">Ubetalt</Badge>}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Beløp:</span>{' '}
                            <span className="font-medium">
                              {new Intl.NumberFormat('nb-NO', {
                                style: 'currency',
                                currency: 'NOK'
                              }).format(invoice.amount)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Forfallsdato:</span>{' '}
                            <span className="font-medium">
                              {new Date(invoice.due_date).toLocaleDateString('nb-NO')}
                            </span>
                          </div>
                        </div>
                        {invoice.status === 'paid' && <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            Takk for betalingen!
                          </p>}
                        {invoice.file_url && <Button variant="outline" size="sm" onClick={() => handleDownloadInvoice(invoice)} className="w-full sm:w-auto">
                            <Download className="mr-2 h-4 w-4" />
                            Last ned faktura
                          </Button>}
                      </div> : hasRequestedInvoice ? <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                        <div className="flex items-center gap-2 text-amber-700">
                          <Receipt className="h-5 w-5" />
                          <span className="font-medium">Fakturaforespørsel sendt</span>
                        </div>
                        <p className="text-sm text-amber-600 mt-1">
                          Vi sender deg fakturaen så snart den er klar.
                        </p>
                      </div> : <Button variant="outline" onClick={() => handleRequestInvoice(job)} disabled={requestingInvoice === job.id} className="w-full sm:w-auto">
                        {requestingInvoice === job.id ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sender...</> : <><Receipt className="mr-2 h-4 w-4" /> Be om faktura</>}
                      </Button>}

                    {job.notes && <div>
                        <p className="text-sm font-medium">Notater:</p>
                        <p className="text-sm text-muted-foreground">{job.notes}</p>
                      </div>}
                  </CardContent>
                </Card>;
              })}
              
              {/* Pagination */}
              {totalCompletedPages > 1 && (
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCompletedJobsPage(p => Math.max(1, p - 1))}
                        className={completedJobsPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalCompletedPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCompletedJobsPage(page)}
                          isActive={completedJobsPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCompletedJobsPage(p => Math.min(totalCompletedPages, p + 1))}
                        className={completedJobsPage === totalCompletedPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>}
        </TabsContent>
      </Tabs>
        </>}

      <AdminStatDetailModal
        type={selectedCard}
        isOpen={selectedCard !== null}
        onClose={() => setSelectedCard(null)}
      />
      <AnalyticsStatDetailModal
        type={selectedAnalytics}
        isOpen={selectedAnalytics !== null}
        onClose={() => setSelectedAnalytics(null)}
      />
    </div>;
};
export default DashboardActivity;