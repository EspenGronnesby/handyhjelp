import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';

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

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500',
  under_review: 'bg-blue-500',
  quoted: 'bg-purple-500',
  accepted: 'bg-green-500',
  rejected: 'bg-red-500',
  completed: 'bg-gray-500'
};

const statusLabels: Record<string, string> = {
  pending: 'Venter',
  under_review: 'Under vurdering',
  quoted: 'Tilbud mottatt',
  accepted: 'Akseptert',
  rejected: 'Avvist',
  completed: 'Fullført'
};

const DashboardQuotes = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotes = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setQuotes(data);
      }
      setLoading(false);
    };

    fetchQuotes();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mine tilbud</CardTitle>
          <CardDescription>
            Du har ikke sendt inn noen tilbudsforespørsler ennå
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Mine tilbud</h1>
        <p className="text-muted-foreground">
          Oversikt over alle dine tilbudsforespørsler
        </p>
      </div>

      <div className="space-y-4">
        {quotes.map((quote) => (
          <Card key={quote.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {quote.type === 'business' ? quote.company_name : quote.name}
                  </CardTitle>
                  <CardDescription>
                    Sendt inn {formatDistanceToNow(new Date(quote.created_at), { 
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
        ))}
      </div>
    </div>
  );
};

export default DashboardQuotes;
