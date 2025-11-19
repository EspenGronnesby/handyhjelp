import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, FileText, Briefcase } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';

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
  created_at: string;
}

const AdminDashboard = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchData = async () => {
      const [quotesResult, jobsResult, profilesResult] = await Promise.all([
        supabase.from('quotes').select('*').order('created_at', { ascending: false }),
        supabase.from('jobs').select('*, quotes(name, company_name, description)').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at', { ascending: false })
      ]);

      if (quotesResult.data) setQuotes(quotesResult.data);
      if (jobsResult.data) setJobs(jobsResult.data);
      if (profilesResult.data) setProfiles(profilesResult.data);
      setLoading(false);
    };

    fetchData();
  }, [isAdmin]);

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
    completed: 'Fullført',
    rejected: 'Avvist',
    confirmed: 'Bekreftet',
    started: 'Startet',
    in_progress: 'Pågår'
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
            <CardTitle className="text-sm font-medium">Tilbud</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jobber</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="quotes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="quotes">Tilbud</TabsTrigger>
          <TabsTrigger value="jobs">Jobber</TabsTrigger>
          <TabsTrigger value="customers">Kunder</TabsTrigger>
        </TabsList>

        <TabsContent value="quotes" className="space-y-4">
          {quotes.map((quote) => (
            <Card key={quote.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {quote.company_name || quote.name}
                  </CardTitle>
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
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          {jobs.map((job) => (
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
          ))}
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          {profiles.map((profile) => (
            <Card key={profile.id}>
              <CardHeader>
                <CardTitle className="text-lg">{profile.full_name}</CardTitle>
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
    </div>
  );
};

export default AdminDashboard;
