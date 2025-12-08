import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';
import { FileText, Briefcase, ClipboardList, CalendarCheck } from 'lucide-react';
import { CardGridSkeleton, PageHeaderSkeleton } from '@/components/ui/skeleton-loaders';

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

const jobStatusColors: Record<string, string> = {
  confirmed: 'bg-blue-500',
  started: 'bg-yellow-500',
  in_progress: 'bg-orange-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500'
};

const jobStatusLabels: Record<string, string> = {
  confirmed: 'Bekreftet',
  started: 'Startet',
  in_progress: 'Under arbeid',
  completed: 'Fullført',
  cancelled: 'Kansellert'
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
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    setUserId(user.id);

    // Fetch quotes - filtrer bort completed (vises kun i jobber)
    const { data: quotesData } = await supabase
      .from('quotes')
      .select('*')
      .or(`user_id.eq.${user.id},email.eq.${user.email}`)
      .neq('status', 'completed')
      .order('created_at', { ascending: false });

    // Fetch jobs
    const { data: jobsData } = await supabase
      .from('jobs')
      .select(`
        *,
        quotes (
          description,
          type,
          name,
          company_name
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Fetch service agreements
    const { data: agreementsData } = await supabase
      .from('service_agreements')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (quotesData) setQuotes(quotesData);
    if (jobsData) setJobs(jobsData);
    if (agreementsData) setAgreements(agreementsData as ServiceAgreement[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Realtime subscription for quotes, jobs and agreements
  useEffect(() => {
    if (!userId) return;

    const quotesChannel = supabase
      .channel('quotes-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quotes' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    const jobsChannel = supabase
      .channel('jobs-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'jobs' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    const agreementsChannel = supabase
      .channel('agreements-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'service_agreements' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(quotesChannel);
      supabase.removeChannel(jobsChannel);
      supabase.removeChannel(agreementsChannel);
    };
  }, [userId, fetchData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
        <CardGridSkeleton count={3} />
      </div>
    );
  }

  // Filtrer jobber: kun vis fullførte i Jobber-fanen
  const completedJobs = jobs.filter(job => job.status === 'completed');
  // Filtrer aktive avtaler (ikke avslått)
  const activeAgreements = agreements.filter(a => a.status !== 'rejected');
  
  const isEmpty = quotes.length === 0 && completedJobs.length === 0 && agreements.length === 0;

  if (isEmpty) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mine forespørsler</h1>
          <p className="text-muted-foreground">
            Oversikt over dine forespørsler, avtaler og fullførte oppdrag
          </p>
        </div>
        <Card className="p-8 text-center">
          <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <CardTitle className="mb-2">Ingen forespørsler ennå</CardTitle>
          <CardDescription>
            Du har ikke sendt inn noen forespørsler ennå.
            <a href="/tilbud" className="text-primary hover:underline ml-1">Send din første forespørsel</a>
          </CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Mine forespørsler</h1>
        <p className="text-muted-foreground">
          Oversikt over dine forespørsler, avtaler og fullførte oppdrag
        </p>
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
          {quotes.length === 0 ? (
            <Card className="p-6 text-center">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Ingen forespørsler ennå</p>
            </Card>
          ) : (
            quotes.map((quote) => (
              <Card key={quote.id} className="border-l-4 border-l-amber-500">
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
                  {quote.address && (
                    <div>
                      <p className="text-sm font-medium">Adresse:</p>
                      <p className="text-sm text-muted-foreground">{quote.address}</p>
                    </div>
                  )}
                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="font-medium">E-post:</span> {quote.email}
                    </div>
                    <div>
                      <span className="font-medium">Telefon:</span> {quote.phone}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="agreements" className="space-y-4">
          {activeAgreements.length === 0 ? (
            <Card className="p-6 text-center">
              <CalendarCheck className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                Ingen aktive avtaler ennå.
                <a href="/fast-avtale" className="text-primary hover:underline ml-1">Forespør en fast avtale</a>
              </p>
            </Card>
          ) : (
            activeAgreements.map((agreement) => (
              <Card key={agreement.id} className="border-l-4 border-l-primary">
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
                      {agreement.services.map((service: string) => (
                        <Badge key={service} variant="secondary" className="text-xs">
                          {serviceLabels[service] || service}
                        </Badge>
                      ))}
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
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          {completedJobs.length === 0 ? (
            <Card className="p-6 text-center">
              <Briefcase className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                Ingen fullførte oppdrag ennå. Når jobbene dine er ferdige, vises de her.
              </p>
            </Card>
          ) : (
            completedJobs.map((job) => (
              <Card key={job.id} className="border-l-4 border-l-green-500">
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
                  {job.scheduled_date && (
                    <div>
                      <p className="text-sm font-medium">Planlagt dato:</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(job.scheduled_date).toLocaleDateString('nb-NO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                  {job.estimated_completion && (
                    <div>
                      <p className="text-sm font-medium">Estimert ferdigstillelse:</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(job.estimated_completion).toLocaleDateString('nb-NO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                  {job.notes && (
                    <div>
                      <p className="text-sm font-medium">Notater:</p>
                      <p className="text-sm text-muted-foreground">{job.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardActivity;
