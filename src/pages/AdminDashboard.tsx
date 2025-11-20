import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Users, FileText, Briefcase, Play, CheckCircle, Mail, CheckCircle2, Clock, AlertCircle, XCircle, Eye, Home, Building2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';
import { toast } from 'sonner';

interface Quote {
  id: string;
  type: string;
  name: string;
  email: string;
  phone: string;
  description: string;
  status: string;
  created_at: string;
  company_name?: string;
  address?: string;
  user_id?: string;
}

interface Job {
  id: string;
  status: string;
  created_at: string;
  scheduled_date?: string;
  estimated_completion?: string;
  completed_date?: string;
  notes?: string;
  amount?: number;
  user_id: string;
  quote_id: string;
  quotes?: {
    name: string;
    company_name?: string;
    description: string;
  };
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  customer_type?: 'private' | 'business' | null;
  created_at: string;
}

interface EmailLog {
  id: string;
  email_id: string;
  event_type: 'sent' | 'delivered' | 'bounced' | 'failed' | 'opened' | 'clicked' | 'delivery_delayed' | 'complained';
  recipient: string;
  subject: string | null;
  from_email: string;
  created_at: string;
  resend_created_at: string | null;
  metadata: any;
  related_quote_id: string | null;
  related_job_id: string | null;
  error_message: string | null;
}

const AdminDashboard = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<EmailLog[]>([]);
  const [emailFilter, setEmailFilter] = useState<string>('all');
  const [searchEmail, setSearchEmail] = useState<string>('');
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchData = async () => {
      const [quotesResult, jobsResult, profilesResult, emailLogsResult] = await Promise.all([
        supabase.from('quotes').select('*').order('created_at', { ascending: false }),
        supabase.from('jobs').select('*, quotes(name, company_name, description)').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, full_name, email, phone, address, customer_type, created_at').order('created_at', { ascending: false }),
        supabase.from('email_logs').select('*').order('created_at', { ascending: false })
      ]);

      if (quotesResult.data) setQuotes(quotesResult.data);
      if (jobsResult.data) setJobs(jobsResult.data);
      if (profilesResult.data) {
        // Type cast customer_type to match our Profile interface
        const typedProfiles = profilesResult.data.map(profile => ({
          ...profile,
          customer_type: profile.customer_type as 'private' | 'business' | null
        }));
        setProfiles(typedProfiles);
      }
      if (emailLogsResult.data) {
        setEmailLogs(emailLogsResult.data as EmailLog[]);
        setFilteredEmails(emailLogsResult.data as EmailLog[]);
      }
      setLoading(false);
    };

    fetchData();

    // Set up realtime subscription for email_logs
    const channel = supabase
      .channel('email-logs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'email_logs'
        },
        (payload) => {
          console.log('Email log change received:', payload);
          if (payload.eventType === 'INSERT') {
            setEmailLogs(prev => [payload.new as EmailLog, ...prev]);
            setFilteredEmails(prev => [payload.new as EmailLog, ...prev]);
            toast.success(`Ny e-post status: ${(payload.new as EmailLog).event_type}`);
          } else if (payload.eventType === 'UPDATE') {
            setEmailLogs(prev => prev.map(log => 
              log.id === payload.new.id ? payload.new as EmailLog : log
            ));
            setFilteredEmails(prev => prev.map(log => 
              log.id === payload.new.id ? payload.new as EmailLog : log
            ));
            toast.info(`E-post oppdatert: ${(payload.new as EmailLog).event_type}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  // Filter emails when filter or search changes
  useEffect(() => {
    let filtered = emailLogs;

    // Filter by event type
    if (emailFilter !== 'all') {
      filtered = filtered.filter(log => log.event_type === emailFilter);
    }

    // Search by recipient
    if (searchEmail) {
      filtered = filtered.filter(log => 
        log.recipient.toLowerCase().includes(searchEmail.toLowerCase())
      );
    }

    setFilteredEmails(filtered);
  }, [emailFilter, searchEmail, emailLogs]);

  if (adminLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    confirmed: 'bg-blue-100 text-blue-800',
    started: 'bg-purple-100 text-purple-800',
    in_progress: 'bg-orange-100 text-orange-800'
  };

  const statusLabels: Record<string, string> = {
    pending: 'Venter',
    accepted: 'Akseptert',
    completed: 'Prosjektet er ferdig',
    rejected: 'Avvist',
    confirmed: 'Bekreftet',
    started: 'Startet',
    in_progress: 'Jobber med saken'
  };

  const emailStatusIcons: Record<string, JSX.Element> = {
    sent: <Clock className="h-4 w-4 text-blue-500" />,
    delivered: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    bounced: <AlertCircle className="h-4 w-4 text-orange-500" />,
    failed: <XCircle className="h-4 w-4 text-red-500" />,
    opened: <Eye className="h-4 w-4 text-purple-500" />,
    clicked: <Mail className="h-4 w-4 text-indigo-500" />,
    delivery_delayed: <Clock className="h-4 w-4 text-yellow-500" />,
    complained: <AlertCircle className="h-4 w-4 text-red-600" />,
  };

  const emailStatusLabels: Record<string, string> = {
    sent: 'Sendt',
    delivered: 'Levert',
    bounced: 'Returnert',
    failed: 'Feilet',
    opened: 'Åpnet',
    clicked: 'Klikket',
    delivery_delayed: 'Forsinket',
    complained: 'Klage',
  };

  const emailStats = {
    total: emailLogs.length,
    delivered: emailLogs.filter(log => log.event_type === 'delivered').length,
    failed: emailLogs.filter(log => log.event_type === 'failed').length,
    bounced: emailLogs.filter(log => log.event_type === 'bounced').length,
  };

  const handleStartQuote = async (quoteId: string, userId: string) => {
    try {
      toast.loading('Starter jobb og sender e-post...');
      
      // First, check if job already exists for this quote
      const { data: existingJob } = await supabase
        .from('jobs')
        .select('id')
        .eq('quote_id', quoteId)
        .single();

      let jobId = existingJob?.id;

      // If no job exists, create one
      if (!jobId) {
        const { data: newJob, error: jobError } = await supabase
          .from('jobs')
          .insert({
            quote_id: quoteId,
            user_id: userId,
            status: 'confirmed'
          })
          .select('id')
          .single();

        if (jobError) throw jobError;
        jobId = newJob.id;
      }

      // Get current session for auth header
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        toast.error('Du må være logget inn for å utføre denne handlingen');
        return;
      }

      console.log('Calling send-job-started-email with jobId:', jobId);

      // Now call the edge function to start the job
      const { data: emailResult, error } = await supabase.functions.invoke('send-job-started-email', {
        body: { jobId },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (error) throw error;

      // Check if email actually sent successfully
      if (emailResult?.emailResponse?.error) {
        const emailError = emailResult.emailResponse.error;
        console.error('Email sending failed:', emailError);
        
        if (emailError.statusCode === 403) {
          toast.error('VIKTIG: E-post ikke sendt! Du må verifisere domenet ditt på resend.com for å sende e-post til kunder. Jobben er startet, men kunden fikk ingen varsling.', {
            duration: 10000
          });
        } else {
          toast.error('Jobb startet, men e-post feilet: ' + emailError.message);
        }
      } else {
        toast.success('Jobb startet og kunde er varslet via e-post!');
      }
      
      // Refresh data
      const [quotesResult, jobsResult] = await Promise.all([
        supabase.from('quotes').select('*').order('created_at', { ascending: false }),
        supabase.from('jobs').select('*, quotes(name, company_name, description)').order('created_at', { ascending: false })
      ]);
      
      if (quotesResult.data) setQuotes(quotesResult.data);
      if (jobsResult.data) setJobs(jobsResult.data);
    } catch (error: any) {
      console.error('Error starting quote:', error);
      toast.error('Kunne ikke starte jobb: ' + error.message);
    }
  };

  const handleCompleteQuote = async (quoteId: string) => {
    try {
      toast.loading('Avslutter jobb og sender e-post...');
      
      // Get current session for auth header
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        toast.error('Du må være logget inn for å utføre denne handlingen');
        return;
      }

      console.log('Session found, access_token exists:', !!session.access_token);

      // Find the job for this quote
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('id')
        .eq('quote_id', quoteId)
        .single();

      if (jobError || !job) {
        console.error('Job not found:', jobError);
        toast.error('Fant ikke jobb for denne forespørselen');
        return;
      }

      console.log('Calling send-job-completed-email with jobId:', job.id);

      const { data, error } = await supabase.functions.invoke('send-job-completed-email', {
        body: { jobId: job.id },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('Email sent successfully:', data);

      if (error) throw error;

      toast.success('Jobb fullført og kunde er varslet via e-post!');
      
      // Refresh data
      const [quotesResult, jobsResult] = await Promise.all([
        supabase.from('quotes').select('*').order('created_at', { ascending: false }),
        supabase.from('jobs').select('*, quotes(name, company_name, description)').order('created_at', { ascending: false })
      ]);
      
      if (quotesResult.data) setQuotes(quotesResult.data);
      if (jobsResult.data) setJobs(jobsResult.data);
    } catch (error: any) {
      console.error('Error completing quote:', error);
      toast.error('Kunne ikke fullføre jobb: ' + error.message);
    }
  };

  const getQuoteJobStatus = (quoteId: string) => {
    const job = jobs.find(j => j.quote_id === quoteId);
    return job?.status || null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Administrer kunders prosjekter, tilbud og profiler
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totalt kunder</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profiles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nye forespørsler</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotes.filter(q => q.status === 'pending').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive jobber</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.filter(j => j.status === 'in_progress').length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="quotes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="quotes">Nye forespørsler</TabsTrigger>
          <TabsTrigger value="jobs">Aktive jobber</TabsTrigger>
          <TabsTrigger value="completed">Ferdig</TabsTrigger>
          <TabsTrigger value="emails">E-poster</TabsTrigger>
          <TabsTrigger value="customers">Kunder</TabsTrigger>
        </TabsList>

        <TabsContent value="quotes" className="space-y-4">
          {quotes.map((quote) => (
            <Card key={quote.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">
                      {quote.company_name || quote.name}
                    </CardTitle>
                    <Badge variant="outline" className="flex items-center gap-1">
                      {quote.type === 'private' ? (
                        <>
                          <Home className="h-3 w-3" />
                          <span>Privat</span>
                        </>
                      ) : (
                        <>
                          <Building2 className="h-3 w-3" />
                          <span>Bedrift</span>
                        </>
                      )}
                    </Badge>
                  </div>
                  <Badge className={statusColors[quote.status]}>
                    {statusLabels[quote.status] || quote.status}
                  </Badge>
                </div>
                <CardDescription>
                  Sendt {formatDistanceToNow(new Date(quote.created_at), { addSuffix: true, locale: nb })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">{quote.description}</p>
                {quote.address && <p className="text-sm text-muted-foreground">Adresse: {quote.address}</p>}
                <p className="text-sm text-muted-foreground">E-post: {quote.email}</p>
                <p className="text-sm text-muted-foreground">Telefon: {quote.phone}</p>
                
                <div className="flex gap-2 pt-2">
                  {getQuoteJobStatus(quote.id) !== 'in_progress' && getQuoteJobStatus(quote.id) !== 'completed' && (
                    <Button
                      onClick={() => handleStartQuote(quote.id, quote.user_id!)}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Play className="h-4 w-4" />
                      Start
                    </Button>
                  )}
                  
                  {getQuoteJobStatus(quote.id) === 'in_progress' && (
                    <Button
                      onClick={() => handleCompleteQuote(quote.id)}
                      size="sm"
                      className="flex items-center gap-2"
                      variant="secondary"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Avslutt
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="emails" className="space-y-4">
          {/* Email Statistics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Totalt sendt</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{emailStats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Levert</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{emailStats.delivered}</div>
                <p className="text-xs text-muted-foreground">
                  {emailStats.total > 0 ? ((emailStats.delivered / emailStats.total) * 100).toFixed(1) : 0}% success rate
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Feilet</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{emailStats.failed}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Returnert</CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{emailStats.bounced}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Søk på mottaker e-post..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                  />
                </div>
                <Select value={emailFilter} onValueChange={setEmailFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Filtrer status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle statuser</SelectItem>
                    <SelectItem value="sent">Sendt</SelectItem>
                    <SelectItem value="delivered">Levert</SelectItem>
                    <SelectItem value="bounced">Returnert</SelectItem>
                    <SelectItem value="failed">Feilet</SelectItem>
                    <SelectItem value="opened">Åpnet</SelectItem>
                    <SelectItem value="clicked">Klikket</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Email List */}
          {filteredEmails.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Ingen e-poster funnet
              </CardContent>
            </Card>
          ) : (
            filteredEmails.map((email) => (
              <Card key={email.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {emailStatusIcons[email.event_type]}
                      <CardTitle className="text-lg">{email.recipient}</CardTitle>
                    </div>
                    <Badge variant="outline">
                      {emailStatusLabels[email.event_type]}
                    </Badge>
                  </div>
                  <CardDescription>
                    {formatDistanceToNow(new Date(email.created_at), { addSuffix: true, locale: nb })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm font-medium">{email.subject || 'Ingen emne'}</p>
                  <p className="text-sm text-muted-foreground">Fra: {email.from_email}</p>
                  {email.error_message && (
                    <p className="text-sm text-red-600">Feil: {email.error_message}</p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => setSelectedEmail(email)}
                      size="sm"
                      variant="outline"
                    >
                      Se detaljer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          {jobs.filter(job => job.status === 'in_progress').length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Ingen aktive jobber
              </CardContent>
            </Card>
          ) : (
            jobs.filter(job => job.status === 'in_progress').map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {job.quotes?.company_name || job.quotes?.name || 'Kunde'}
                    </CardTitle>
                    <Badge className={statusColors[job.status]}>
                      {statusLabels[job.status] || job.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    Opprettet {formatDistanceToNow(new Date(job.created_at), { addSuffix: true, locale: nb })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">{job.quotes?.description}</p>
                  {job.scheduled_date && (
                    <p className="text-sm text-muted-foreground">
                      Planlagt dato: {new Date(job.scheduled_date).toLocaleDateString('nb-NO')}
                    </p>
                  )}
                  {job.estimated_completion && (
                    <p className="text-sm text-muted-foreground">
                      Estimert ferdig: {new Date(job.estimated_completion).toLocaleDateString('nb-NO')}
                    </p>
                  )}
                  {job.amount && (
                    <p className="text-sm font-semibold">Beløp: {job.amount.toLocaleString('nb-NO')} kr</p>
                  )}
                  {job.notes && <p className="text-sm text-muted-foreground">Notater: {job.notes}</p>}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {jobs.filter(job => job.status === 'completed').length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Ingen ferdigstilte jobber
              </CardContent>
            </Card>
          ) : (
            jobs.filter(job => job.status === 'completed').map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {job.quotes?.company_name || job.quotes?.name || 'Kunde'}
                    </CardTitle>
                    <Badge className={statusColors[job.status]}>
                      {statusLabels[job.status] || job.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    Fullført {job.completed_date ? formatDistanceToNow(new Date(job.completed_date), { addSuffix: true, locale: nb }) : 'Ukjent dato'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">{job.quotes?.description}</p>
                  {job.completed_date && (
                    <p className="text-sm text-muted-foreground">
                      Fullført: {new Date(job.completed_date).toLocaleDateString('nb-NO')}
                    </p>
                  )}
                  {job.amount && (
                    <p className="text-sm font-semibold">Beløp: {job.amount.toLocaleString('nb-NO')} kr</p>
                  )}
                  {job.notes && <p className="text-sm text-muted-foreground">Notater: {job.notes}</p>}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          {profiles.map((profile) => (
            <Card key={profile.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{profile.full_name}</CardTitle>
                    {profile.customer_type && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        {profile.customer_type === 'private' ? (
                          <>
                            <Home className="h-3 w-3" />
                            <span>Privat</span>
                          </>
                        ) : (
                          <>
                            <Building2 className="h-3 w-3" />
                            <span>Bedrift</span>
                          </>
                        )}
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription>
                  Medlem siden {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true, locale: nb })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">E-post: {profile.email}</p>
                {profile.phone && <p className="text-sm text-muted-foreground">Telefon: {profile.phone}</p>}
                {profile.address && <p className="text-sm text-muted-foreground">Adresse: {profile.address}</p>}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Email Details Modal */}
      <Dialog open={!!selectedEmail} onOpenChange={() => setSelectedEmail(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>E-post detaljer</DialogTitle>
            <DialogDescription>
              Fullstendig informasjon om e-posten
            </DialogDescription>
          </DialogHeader>
          {selectedEmail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {emailStatusIcons[selectedEmail.event_type]}
                    <span>{emailStatusLabels[selectedEmail.event_type]}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">E-post ID</p>
                  <p className="text-sm mt-1 font-mono">{selectedEmail.email_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Mottaker</p>
                  <p className="text-sm mt-1">{selectedEmail.recipient}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avsender</p>
                  <p className="text-sm mt-1">{selectedEmail.from_email}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Emne</p>
                  <p className="text-sm mt-1">{selectedEmail.subject || 'Ingen emne'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sendt</p>
                  <p className="text-sm mt-1">
                    {new Date(selectedEmail.created_at).toLocaleString('nb-NO')}
                  </p>
                </div>
                {selectedEmail.resend_created_at && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Resend tidspunkt</p>
                    <p className="text-sm mt-1">
                      {new Date(selectedEmail.resend_created_at).toLocaleString('nb-NO')}
                    </p>
                  </div>
                )}
              </div>

              {selectedEmail.error_message && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-900">Feilmelding</p>
                  <p className="text-sm text-red-700 mt-1">{selectedEmail.error_message}</p>
                </div>
              )}

              {selectedEmail.related_quote_id && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Tilknyttet tilbudsforespørsel</p>
                  <p className="text-sm text-blue-700 mt-1 font-mono">{selectedEmail.related_quote_id}</p>
                </div>
              )}

              {selectedEmail.related_job_id && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-900">Tilknyttet jobb</p>
                  <p className="text-sm text-green-700 mt-1 font-mono">{selectedEmail.related_job_id}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Full metadata fra Resend</p>
                <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                  {JSON.stringify(selectedEmail.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
