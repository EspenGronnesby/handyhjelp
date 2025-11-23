import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';
import { Loader2, Play, CheckCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ProjectManagement } from '@/components/admin/ProjectManagement';
import { BlogManagement } from '@/components/admin/BlogManagement';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Quote {
  id: string;
  type: string;
  name: string;
  email: string;
  phone: string;
  description: string;
  status: string;
  created_at: string;
  address?: string;
  company_name?: string;
  org_number?: string;
  customer_type?: string;
  user_id?: string;
}

interface Job {
  id: string;
  status: string;
  scheduled_date: string | null;
  completed_date: string | null;
  started_at: string | null;
  created_at: string;
  amount: number;
  notes: string | null;
  quote_id: string;
  user_id: string;
  quotes: {
    name: string;
    email: string;
    phone: string;
    description: string;
    type: string;
    company_name?: string;
    org_number?: string;
  };
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  customer_type: string | null;
  company_name: string | null;
  org_number: string | null;
  created_at: string;
}

interface ServiceAgreement {
  id: string;
  customer_type: string;
  units_count: number | null;
  total_area: number | null;
  address: string;
  services: string[];
  other_services: string | null;
  frequency: string;
  fixed_contact_person: boolean;
  contract_duration: string;
  start_date: string | null;
  current_situation: string;
  contact_person: string;
  contact_role: string;
  email: string;
  phone: string;
  additional_info: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
};

const statusLabels: Record<string, string> = {
  pending: 'Venter',
  in_progress: 'Pågår',
  completed: 'Fullført',
};

const AdminDashboard = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [agreements, setAgreements] = useState<ServiceAgreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'start' | 'complete' | 'delete' | null;
    item: Quote | Job | null;
  }>({ open: false, type: null, item: null });

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
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
      if (agreementsResponse.data) setAgreements(agreementsResponse.data as any);
      setLoading(false);
    };

    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const handleStartJob = async (quote: Quote) => {
    setActionLoading(quote.id);
    
    try {
      console.log('Starting job for quote:', quote.id, 'Is admin:', isAdmin);
      
      // Update quote status first
      const { error: quoteError } = await supabase
        .from('quotes')
        .update({ status: 'in_progress' })
        .eq('id', quote.id);

      if (quoteError) {
        console.error('Error updating quote status:', quoteError);
        throw quoteError;
      }

      // Create job with in_progress status
      const { data: job, error: jobError } = await supabase
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

      // Refresh both quotes and jobs lists for accurate UI state
      const [quotesResponse, jobsResponse] = await Promise.all([
        supabase.from('quotes').select('*').order('created_at', { ascending: false }),
        supabase.from('jobs').select('*, quotes(name, email, phone, description, type, company_name, org_number)').order('created_at', { ascending: false })
      ]);
      
      if (quotesResponse.data) setQuotes(quotesResponse.data);
      if (jobsResponse.data) setJobs(jobsResponse.data);

      // Send email (non-blocking)
      supabase.functions.invoke('send-job-status-email', {
        body: {
          customerName: quote.type === 'business' ? quote.company_name : quote.name,
          customerEmail: quote.email,
          jobDescription: quote.description,
          status: 'started',
        },
      }).then(({ error: emailError }) => {
        if (emailError) {
          console.error('Email error:', emailError);
        }
      });

      toast({
        title: "Suksess!",
        description: "Jobben er startet og kunde vil motta e-post.",
      });

    } catch (error: any) {
      console.error('Error starting job:', error);
      const errorMessage = error?.message || 'Ukjent feil';
      const errorCode = error?.code || '';
      toast({
        title: "Feil",
        description: `Kunne ikke starte jobben: ${errorMessage}${errorCode ? ` (Kode: ${errorCode})` : ''}`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
      setConfirmDialog({ open: false, type: null, item: null });
    }
  };

  const handleCompleteJob = async (job: Job) => {
    setActionLoading(job.id);
    
    try {
      console.log('Completing job:', job.id, 'Is admin:', isAdmin);
      
      // Update job status
      const { error: jobError } = await supabase
        .from('jobs')
        .update({ 
          status: 'completed',
          completed_date: new Date().toISOString(),
        })
        .eq('id', job.id);

      if (jobError) {
        console.error('Error updating job status:', jobError);
        throw jobError;
      }

      // Update quote status
      const { error: quoteError } = await supabase
        .from('quotes')
        .update({ status: 'completed' })
        .eq('id', job.quote_id);

      if (quoteError) throw quoteError;

      // Refresh both quotes and jobs lists for accurate UI state
      const [quotesResponse, jobsResponse] = await Promise.all([
        supabase.from('quotes').select('*').order('created_at', { ascending: false }),
        supabase.from('jobs').select('*, quotes(name, email, phone, description, type, company_name, org_number)').order('created_at', { ascending: false })
      ]);
      
      if (quotesResponse.data) setQuotes(quotesResponse.data);
      if (jobsResponse.data) setJobs(jobsResponse.data);

      // Send email (non-blocking)
      const customerName = job.quotes.type === 'business' ? job.quotes.company_name : job.quotes.name;
      supabase.functions.invoke('send-job-status-email', {
        body: {
          customerName,
          customerEmail: job.quotes.email,
          jobDescription: job.quotes.description,
          status: 'completed',
        },
      }).then(({ error: emailError }) => {
        if (emailError) {
          console.error('Email error:', emailError);
        }
      });

      toast({
        title: "Suksess!",
        description: "Jobben er fullført og kunde vil motta e-post.",
      });

    } catch (error: any) {
      console.error('Error completing job:', error);
      const errorMessage = error?.message || 'Ukjent feil';
      const errorCode = error?.code || '';
      toast({
        title: "Feil",
        description: `Kunne ikke fullføre jobben: ${errorMessage}${errorCode ? ` (Kode: ${errorCode})` : ''}`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
      setConfirmDialog({ open: false, type: null, item: null });
    }
  };

  const handleDeleteJob = async (job: Job) => {
    setActionLoading(job.id);
    
    try {
      console.log('Deleting job:', job.id, 'Is admin:', isAdmin);
      
      const { error } = await supabase.from('jobs').delete().eq('id', job.id);
      
      if (error) {
        console.error('Error deleting job:', error);
        throw error;
      }

      // Update local state immediately
      setJobs(prevJobs => prevJobs.filter(j => j.id !== job.id));
      
      toast({
        title: "Slettet",
        description: "Jobben er slettet.",
      });

    } catch (error: any) {
      console.error('Error deleting job:', error);
      const errorMessage = error?.message || 'Ukjent feil';
      const errorCode = error?.code || '';
      toast({
        title: "Feil",
        description: `Kunne ikke slette jobben: ${errorMessage}${errorCode ? ` (Kode: ${errorCode})` : ''}`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
      setConfirmDialog({ open: false, type: null, item: null });
    }
  };

  if (adminLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const pendingQuotes = quotes.filter(q => q.status === 'pending');
  const activeJobs = jobs.filter(j => j.status === 'in_progress');
  const completedJobs = jobs.filter(j => j.status === 'completed');
  const newAgreements = agreements.filter(a => a.status === 'new');

  const handleUpdateAgreementStatus = async (agreementId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('service_agreements')
        .update({ status: newStatus })
        .eq('id', agreementId);

      if (error) throw error;

      // Update local state
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

  const serviceLabels: Record<string, string> = {
    maintenance: 'Generelt vedlikehold',
    cleaning: 'Utvendig renhold',
    winter: 'Snømåking og strøing',
    summer: 'Gressklipping og hagearbeid',
    inspection: 'Tilsyn og inspeksjoner',
    other: 'Annet'
  };

  const agreementStatusLabels: Record<string, string> = {
    new: 'Ny',
    under_review: 'Under vurdering',
    offer_sent: 'Tilbud sendt',
    contract_signed: 'Avtale inngått',
    rejected: 'Avslått'
  };

  const agreementStatusColors: Record<string, string> = {
    new: 'bg-yellow-500',
    under_review: 'bg-blue-500',
    offer_sent: 'bg-purple-500',
    contract_signed: 'bg-green-500',
    rejected: 'bg-red-500'
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Oversikt over alle forespørsler og jobber</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totalt kunder</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profiles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nye forespørsler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingQuotes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive jobber</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeJobs.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">
            Nye forespørsler ({pendingQuotes.length})
          </TabsTrigger>
          <TabsTrigger value="agreements">
            Avtaleforespørsler ({newAgreements.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Aktive jobber ({activeJobs.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Ferdig ({completedJobs.length})
          </TabsTrigger>
          <TabsTrigger value="customers">Kunder ({profiles.length})</TabsTrigger>
          <TabsTrigger value="projects">Prosjekter</TabsTrigger>
          <TabsTrigger value="blog">Blogg / Råd</TabsTrigger>
        </TabsList>

        {/* Nye forespørsler */}
        <TabsContent value="requests" className="space-y-4">
          {pendingQuotes.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Ingen nye forespørsler
              </CardContent>
            </Card>
          ) : (
            pendingQuotes.map((quote) => (
              <Card key={quote.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {quote.type === 'business' ? quote.company_name : quote.name}
                        <Badge className="ml-2" variant="outline">
                          {quote.type === 'business' ? 'Bedrift' : 'Privat'}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Mottatt {formatDistanceToNow(new Date(quote.created_at), { 
                          addSuffix: true,
                          locale: nb 
                        })}
                      </CardDescription>
                    </div>
                    <Badge className={statusColors[quote.status]}>
                      {statusLabels[quote.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Beskrivelse:</p>
                    <p className="text-sm text-muted-foreground">{quote.description}</p>
                  </div>
                  {quote.address && (
                    <div>
                      <p className="text-sm font-medium">Adresse:</p>
                      <p className="text-sm text-muted-foreground">{quote.address}</p>
                    </div>
                  )}
                  <div className="flex gap-4 text-sm flex-wrap">
                    <div>
                      <span className="font-medium">E-post:</span> {quote.email}
                    </div>
                    <div>
                      <span className="font-medium">Telefon:</span> {quote.phone}
                    </div>
                    {quote.org_number && (
                      <div>
                        <span className="font-medium">Org.nr:</span> {quote.org_number}
                      </div>
                    )}
                  </div>
                  <Button 
                    onClick={() => setConfirmDialog({ open: true, type: 'start', item: quote })}
                    disabled={actionLoading === quote.id}
                    className="w-full sm:w-auto"
                  >
                    {actionLoading === quote.id ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starter...</>
                    ) : (
                      <><Play className="mr-2 h-4 w-4" /> Start jobb</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Aktive jobber */}
        <TabsContent value="active" className="space-y-4">
          {activeJobs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Ingen aktive jobber
              </CardContent>
            </Card>
          ) : (
            activeJobs.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {job.quotes.type === 'business' ? job.quotes.company_name : job.quotes.name}
                        <Badge className="ml-2" variant="outline">
                          {job.quotes.type === 'business' ? 'Bedrift' : 'Privat'}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Startet {job.started_at && formatDistanceToNow(new Date(job.started_at), { 
                          addSuffix: true,
                          locale: nb 
                        })}
                      </CardDescription>
                    </div>
                    <Badge className={statusColors[job.status]}>
                      {statusLabels[job.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Beskrivelse:</p>
                    <p className="text-sm text-muted-foreground">{job.quotes.description}</p>
                  </div>
                  {job.notes && (
                    <div>
                      <p className="text-sm font-medium">Notater:</p>
                      <p className="text-sm text-muted-foreground">{job.notes}</p>
                    </div>
                  )}
                  <div className="flex gap-4 text-sm flex-wrap">
                    <div>
                      <span className="font-medium">E-post:</span> {job.quotes.email}
                    </div>
                    <div>
                      <span className="font-medium">Telefon:</span> {job.quotes.phone}
                    </div>
                    {job.quotes.org_number && (
                      <div>
                        <span className="font-medium">Org.nr:</span> {job.quotes.org_number}
                      </div>
                    )}
                  </div>
                  <Button 
                    onClick={() => setConfirmDialog({ open: true, type: 'complete', item: job })}
                    disabled={actionLoading === job.id}
                    className="w-full sm:w-auto"
                  >
                    {actionLoading === job.id ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fullfører...</>
                    ) : (
                      <><CheckCircle className="mr-2 h-4 w-4" /> Fullfør jobb</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Ferdig */}
        <TabsContent value="completed" className="space-y-4">
          {completedJobs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Ingen fullførte jobber
              </CardContent>
            </Card>
          ) : (
            completedJobs.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {job.quotes.type === 'business' ? job.quotes.company_name : job.quotes.name}
                        <Badge className="ml-2" variant="outline">
                          {job.quotes.type === 'business' ? 'Bedrift' : 'Privat'}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Fullført {job.completed_date && formatDistanceToNow(new Date(job.completed_date), { 
                          addSuffix: true,
                          locale: nb 
                        })}
                      </CardDescription>
                    </div>
                    <Badge className={statusColors[job.status]}>
                      {statusLabels[job.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Beskrivelse:</p>
                    <p className="text-sm text-muted-foreground">{job.quotes.description}</p>
                  </div>
                  {job.notes && (
                    <div>
                      <p className="text-sm font-medium">Notater:</p>
                      <p className="text-sm text-muted-foreground">{job.notes}</p>
                    </div>
                  )}
                  <div className="flex gap-4 text-sm flex-wrap">
                    <div>
                      <span className="font-medium">E-post:</span> {job.quotes.email}
                    </div>
                    <div>
                      <span className="font-medium">Telefon:</span> {job.quotes.phone}
                    </div>
                    {job.quotes.org_number && (
                      <div>
                        <span className="font-medium">Org.nr:</span> {job.quotes.org_number}
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="destructive"
                    onClick={() => setConfirmDialog({ open: true, type: 'delete', item: job })}
                    disabled={actionLoading === job.id}
                    className="w-full sm:w-auto"
                  >
                    {actionLoading === job.id ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sletter...</>
                    ) : (
                      <><Trash2 className="mr-2 h-4 w-4" /> Slett jobb</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Avtaleforespørsler */}
        <TabsContent value="agreements" className="space-y-4">
          {agreements.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Ingen avtaleforespørsler
              </CardContent>
            </Card>
          ) : (
            agreements.map((agreement) => (
              <Card key={agreement.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {agreement.contact_person}
                        <Badge className="ml-2" variant="outline">
                          {agreement.customer_type === 'borettslag' ? 'Borettslag/Sameie' : 
                           agreement.customer_type === 'bedrift' ? 'Bedrift' : 'Annet'}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Mottatt {formatDistanceToNow(new Date(agreement.created_at), { 
                          addSuffix: true,
                          locale: nb 
                        })}
                      </CardDescription>
                    </div>
                    <Badge className={agreementStatusColors[agreement.status]}>
                      {agreementStatusLabels[agreement.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Adresse:</p>
                    <p className="text-sm text-muted-foreground">{agreement.address}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {agreement.units_count && (
                      <div>
                        <span className="font-medium">Enheter:</span> {agreement.units_count}
                      </div>
                    )}
                    {agreement.total_area && (
                      <div>
                        <span className="font-medium">Areal:</span> {agreement.total_area} m²
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Tjenester:</p>
                    <div className="flex flex-wrap gap-2">
                      {agreement.services.map((service) => (
                        <Badge key={service} variant="secondary">
                          {serviceLabels[service] || service}
                        </Badge>
                      ))}
                    </div>
                    {agreement.other_services && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Andre tjenester: {agreement.other_services}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Frekvens:</span> {agreement.frequency}
                    </div>
                    <div>
                      <span className="font-medium">Avtalevarighet:</span> {agreement.contract_duration}
                    </div>
                    <div>
                      <span className="font-medium">Fast kontaktperson:</span> {agreement.fixed_contact_person ? 'Ja' : 'Nei'}
                    </div>
                    {agreement.start_date && (
                      <div>
                        <span className="font-medium">Oppstartsdato:</span> {agreement.start_date}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 text-sm flex-wrap">
                    <div>
                      <span className="font-medium">Kontakt:</span> {agreement.contact_person} ({agreement.contact_role})
                    </div>
                    <div>
                      <span className="font-medium">E-post:</span> {agreement.email}
                    </div>
                    <div>
                      <span className="font-medium">Telefon:</span> {agreement.phone}
                    </div>
                  </div>

                  {agreement.additional_info && (
                    <div>
                      <p className="text-sm font-medium">Tilleggsinformasjon:</p>
                      <p className="text-sm text-muted-foreground">{agreement.additional_info}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateAgreementStatus(agreement.id, 'under_review')}
                      disabled={agreement.status !== 'new'}
                    >
                      Under vurdering
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateAgreementStatus(agreement.id, 'offer_sent')}
                      disabled={agreement.status === 'new'}
                    >
                      Tilbud sendt
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleUpdateAgreementStatus(agreement.id, 'contract_signed')}
                      disabled={agreement.status === 'new'}
                    >
                      Avtale inngått
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleUpdateAgreementStatus(agreement.id, 'rejected')}
                    >
                      Avslå
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Kunder */}
        <TabsContent value="customers" className="space-y-4">
          {profiles.map((profile) => (
            <Card key={profile.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {profile.full_name}
                      <Badge className="ml-2" variant="outline">
                        {profile.customer_type === 'business' ? 'Bedrift' : 'Privat'}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Registrert {formatDistanceToNow(new Date(profile.created_at), { 
                        addSuffix: true,
                        locale: nb 
                      })}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm flex-wrap">
                  <div>
                    <span className="font-medium">E-post:</span> {profile.email}
                  </div>
                  {profile.phone && (
                    <div>
                      <span className="font-medium">Telefon:</span> {profile.phone}
                    </div>
                  )}
                  {profile.company_name && (
                    <div>
                      <span className="font-medium">Firma:</span> {profile.company_name}
                    </div>
                  )}
                  {profile.org_number && (
                    <div>
                      <span className="font-medium">Org.nr:</span> {profile.org_number}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects">
          <ProjectManagement />
        </TabsContent>

        {/* Blog Tab */}
        <TabsContent value="blog">
          <BlogManagement />
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ open: false, type: null, item: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.type === 'start' && 'Start jobb?'}
              {confirmDialog.type === 'complete' && 'Fullfør jobb?'}
              {confirmDialog.type === 'delete' && 'Slett jobb?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.type === 'start' && 'Dette vil starte jobben og sende en e-post til kunden om at arbeidet har begynt.'}
              {confirmDialog.type === 'complete' && 'Dette vil markere jobben som fullført og sende en takkemelding til kunden.'}
              {confirmDialog.type === 'delete' && 'Dette vil permanent slette jobben. Denne handlingen kan ikke angres.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDialog.type === 'start' && confirmDialog.item) {
                  handleStartJob(confirmDialog.item as Quote);
                } else if (confirmDialog.type === 'complete' && confirmDialog.item) {
                  handleCompleteJob(confirmDialog.item as Job);
                } else if (confirmDialog.type === 'delete' && confirmDialog.item) {
                  handleDeleteJob(confirmDialog.item as Job);
                }
              }}
            >
              Bekreft
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
