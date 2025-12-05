import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';
import { Loader2, Play } from 'lucide-react';
import { Quote, STATUS_COLORS, STATUS_LABELS } from '@/types/admin';

interface QuoteCardProps {
  quote: Quote;
  actionLoading: string | null;
  onStartJob: (quote: Quote) => void;
}

export const QuoteCard = ({ quote, actionLoading, onStartJob }: QuoteCardProps) => {
  return (
    <Card>
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
          <Badge className={STATUS_COLORS[quote.status]}>
            {STATUS_LABELS[quote.status]}
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
          onClick={() => onStartJob(quote)}
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
  );
};
