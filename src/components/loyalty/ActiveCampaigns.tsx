import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Gift, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';

interface Campaign {
  id: string;
  name: string;
  description: string;
  multiplier: number;
  start_date: string;
  end_date: string;
  active: boolean;
}

export const ActiveCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-active-campaigns');

      if (error) throw error;

      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (campaigns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Kampanjer
          </CardTitle>
          <CardDescription>Aktive poeng-kampanjer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Ingen aktive kampanjer for øyeblikket</p>
            <p className="text-sm text-muted-foreground mt-2">
              Hold øynene åpne for spennende tilbud!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Aktive kampanjer
        </CardTitle>
        <CardDescription>
          {campaigns.length} aktiv{campaigns.length !== 1 ? 'e' : ''} kampanje{campaigns.length !== 1 ? 'r' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="p-4 rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  {campaign.name}
                  <Badge variant="default" className="ml-2">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {campaign.multiplier}x poeng
                  </Badge>
                </h3>
                {campaign.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {campaign.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(campaign.start_date), 'dd MMM', { locale: nb })} - {format(new Date(campaign.end_date), 'dd MMM yyyy', { locale: nb })}
                </span>
              </div>
            </div>

            <div className="mt-3 p-3 bg-background rounded-md">
              <p className="text-sm">
                💡 <strong>Tips:</strong> Bestill tjenester nå og få {campaign.multiplier === 2 ? 'dobbel' : campaign.multiplier === 3 ? 'trippel' : `${campaign.multiplier}x`} poeng!
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
