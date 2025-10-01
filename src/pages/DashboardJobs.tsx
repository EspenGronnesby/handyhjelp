import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';

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

const statusColors: Record<string, string> = {
  confirmed: 'bg-blue-500',
  started: 'bg-yellow-500',
  in_progress: 'bg-orange-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500'
};

const statusLabels: Record<string, string> = {
  confirmed: 'Bekreftet',
  started: 'Startet',
  in_progress: 'Under arbeid',
  completed: 'Fullført',
  cancelled: 'Kansellert'
};

const DashboardJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
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

      if (!error && data) {
        setJobs(data);
      }
      setLoading(false);
    };

    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mine jobber</CardTitle>
          <CardDescription>
            Du har ingen aktive eller fullførte jobber ennå
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Mine jobber</h1>
        <p className="text-muted-foreground">
          Oversikt over alle dine aktive og fullførte jobber
        </p>
      </div>

      <div className="space-y-4">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {job.quotes.type === 'business' ? job.quotes.company_name : job.quotes.name}
                  </CardTitle>
                  <CardDescription>
                    Opprettet {formatDistanceToNow(new Date(job.created_at), { 
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
        ))}
      </div>
    </div>
  );
};

export default DashboardJobs;
