import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';
import { FileText, Briefcase, ClipboardList, CalendarCheck, Receipt, Download, Loader2, CheckCircle, Bell } from 'lucide-react';
import { CardGridSkeleton, PageHeaderSkeleton, StatsSkeleton } from '@/components/ui/skeleton-loaders';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { useDashboardStats } from '@/hooks/useDashboardStats';
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
}
interface Job {
  id: string;
  user_id: string;
  status: string;
  scheduled_date?: string;
  completed_date?: string;
  estimated_completion?: string;
  notes?: string;
  created_at: string;
  quotes: {
    description: string;
    type: string;
    name: string;
    company_name?: string;
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
}
interface Invoice {
  id: string;
  job_id: string;
  amount: number;
  due_date: string;
  file_url: string | null;
  status: string;
  invoice_number: string;
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
const DashboardActivity = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [agreements, setAgreements] = useState<ServiceAgreement[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceRequests, setInvoiceRequests] = useState<InvoiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestingInvoice, setRequestingInvoice] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const fetchData = useCallback(async () => {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    // Fetch quotes - filtrer bort completed (vises kun i jobber)
    const {
      data: quotesData
    } = await supabase.from('quotes').select('*').or(`user_id.eq.${user.id},email.eq.${user.email}`).neq('status', 'completed').order('created_at', {
      ascending: false
    });

    // Fetch jobs
    const {
      data: jobsData
    } = await supabase.from('jobs').select(`
        *,
        quotes (
          description,
          type,
          name,
          company_name
        )
      `).eq('user_id', user.id).order('created_at', {
      ascending: false
    });

    // Fetch service agreements
    const {
      data: agreementsData
    } = await supabase.from('service_agreements').select('*').eq('user_id', user.id).order('created_at', {
      ascending: false
    });

    // Fetch invoices
    const {
      data: invoicesData
    } = await supabase.from('invoices').select('*').eq('user_id', user.id);

    // Fetch invoice requests
    const {
      data: requestsData
    } = await supabase.from('invoice_requests').select('*').eq('user_id', user.id);
    if (quotesData) setQuotes(quotesData);
    if (jobsData) setJobs(jobsData);
    if (agreementsData) setAgreements(agreementsData as ServiceAgreement[]);
    if (invoicesData) setInvoices(invoicesData as Invoice[]);
    if (requestsData) setInvoiceRequests(requestsData as InvoiceRequest[]);
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
  const statCards = [{
    title: 'Totalt forespørsler',
    value: stats.totalQuotes,
    icon: FileText,
    description: 'Alle dine forespørsler'
  }, {
    title: 'Aktive jobber',
    value: stats.activeJobs,
    icon: Briefcase,
    description: 'Jobber under arbeid'
  }, {
    title: 'Fullførte jobber',
    value: stats.completedJobs,
    icon: CheckCircle,
    description: 'Ferdigstilte prosjekter'
  }, {
    title: 'Uleste varsler',
    value: stats.unreadNotifications,
    icon: Bell,
    description: 'Nye oppdateringer'
  }];
  if (loading || statsLoading) {
    return <div className="space-y-6">
        <PageHeaderSkeleton />
        <StatsSkeleton />
        <CardGridSkeleton count={3} />
      </div>;
  }

  // Filtrer jobber: kun vis fullførte i Jobber-fanen
  const completedJobs = jobs.filter(job => job.status === 'completed');
  // Filtrer aktive avtaler (ikke avslått)
  const activeAgreements = agreements.filter(a => a.status !== 'rejected');
  const isEmpty = quotes.length === 0 && completedJobs.length === 0 && agreements.length === 0;
  return <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Velkommen til din profil</h1>
        <p className="text-muted-foreground">
          Her kan du holde oversikt over alle dine tilbud, jobber og varslinger
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map(card => {
        const Icon = card.icon;
        return <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </CardContent>
            </Card>;
      })}
      </div>

      {/* Kom i gang */}
      <Card>
        <CardHeader>
          <CardTitle>Kom i gang</CardTitle>
          <CardDescription>
            Her er noen ting du kan gjøre
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Link to="/tilbud">
            <Button variant="outline" className="w-full justify-start">
              Send inn en ny tilbudsforespørsel
            </Button>
          </Link>
          <Link to="/dashboard/profile">
            <Button variant="outline" className="w-full justify-start">
              Oppdater din profil
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Mine forespørsler */}
      {!isEmpty && <>
          <div>
            <h2 className="text-xl font-semibold mb-4">Mine Jobber</h2>
          </div>

      <Tabs defaultValue="quotes" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="quotes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Forespørsel</span> ({quotes.length})
          </TabsTrigger>
          <TabsTrigger value="agreements" className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Avtaler</span> ({activeAgreements.length})
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Fullført</span> ({completedJobs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quotes" className="space-y-4">
          {quotes.length === 0 ? <Card className="p-6 text-center">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Ingen forespørsler ennå</p>
            </Card> : quotes.map(quote => <Card key={quote.id} className="border-l-4 border-l-amber-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/10">
                        <FileText className="h-5 w-5 text-amber-600" />
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
                </CardContent>
              </Card>)}
        </TabsContent>

        <TabsContent value="agreements" className="space-y-4">
          {activeAgreements.length === 0 ? <Card className="p-6 text-center">
              <CalendarCheck className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                Ingen aktive avtaler ennå.
                <a href="/fast-avtale" className="text-primary hover:underline ml-1">Forespør en fast avtale</a>
              </p>
            </Card> : activeAgreements.map(agreement => <Card key={agreement.id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <CalendarCheck className="h-5 w-5 text-primary" />
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
                </CardContent>
              </Card>)}
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          {completedJobs.length === 0 ? <Card className="p-6 text-center">
              <Briefcase className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                Ingen fullførte oppdrag ennå. Når jobbene dine er ferdige, vises de her.
              </p>
            </Card> : completedJobs.map(job => {
            const invoice = getInvoiceForJob(job.id);
            const invoiceRequest = getInvoiceRequestForJob(job.id);
            const hasRequestedInvoice = invoiceRequest && invoiceRequest.status === 'pending';
            return <Card key={job.id} className="border-l-4 border-l-green-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                          <Briefcase className="h-5 w-5 text-green-600" />
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
        </TabsContent>
      </Tabs>
        </>}
    </div>;
};
export default DashboardActivity;