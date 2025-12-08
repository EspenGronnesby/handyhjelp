import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';
import { FileText, Briefcase, ClipboardList } from 'lucide-react';
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

// Forespørsel skal ikke vise "Fullført" - det er kun for jobber
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

const DashboardActivity = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
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

    if (quotesData) setQuotes(quotesData);
    if (jobsData) setJobs(jobsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Realtime subscription for quotes and jobs
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

    return () => {
      supabase.removeChannel(quotesChannel);
      supabase.removeChannel(jobsChannel);
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

  const isEmpty = quotes.length === 0 && jobs.length === 0;

  if (isEmpty) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mine forespørsler</h1>
          <p className="text-muted-foreground">
            Oversikt over dine tilbud og aktive jobber
          </p>
        </div>
        <Card className="p-8 text-center">
          <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <CardTitle className="mb-2">Ingen forespørsler ennå</CardTitle>
          <CardDescription>
            Du har ikke sendt inn noen tilbudsforespørsler ennå.
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
          Oversikt over dine tilbud og aktive jobber
        </p>
      </div>

      <Tabs defaultValue="quotes" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="quotes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Forespørsel ({quotes.length})
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Jobber ({jobs.length})
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

        <TabsContent value="jobs" className="space-y-4">
          {jobs.length === 0 ? (
            <Card className="p-6 text-center">
              <Briefcase className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                Ingen aktive jobber ennå. Når dine tilbud blir akseptert, vises jobbene her.
              </p>
            </Card>
          ) : (
            jobs.map((job) => (
              <Card key={job.id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">
                            Jobb
                          </Badge>
                        </div>
                        <CardTitle className="text-lg mt-1">
                          {job.quotes.type === 'business' ? job.quotes.company_name : job.quotes.name}
                        </CardTitle>
                        <CardDescription>
                          Opprettet {formatDistanceToNow(new Date(job.created_at), { 
                            addSuffix: true,
                            locale: nb 
                          })}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={jobStatusColors[job.status]}>
                      {jobStatusLabels[job.status]}
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
