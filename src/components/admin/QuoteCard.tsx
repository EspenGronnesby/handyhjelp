import { useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';
import { Loader2, Play, CheckCircle, Trash2, History } from 'lucide-react';
import { Quote, STATUS_COLORS, STATUS_LABELS } from '@/types/admin';
import { cn } from '@/lib/utils';

interface QuoteCardProps {
  quote: Quote;
  actionLoading: string | null;
  isHighlighted?: boolean;
  onStartJob: (quote: Quote) => void;
  onCompleteDirectly?: (quote: Quote) => void;
  onDelete?: (quote: Quote) => void;
  onViewHistory?: (email: string, name: string) => void;
}

export const QuoteCard = ({ quote, actionLoading, isHighlighted, onStartJob, onCompleteDirectly, onDelete, onViewHistory }: QuoteCardProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isHighlighted && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isHighlighted]);

  return (
    <div ref={ref}>
    <Card className={cn('interactive-card', isHighlighted && 'ring-2 ring-primary bg-primary/5 shadow-lg shadow-primary/10')}>
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
        <div className="flex flex-wrap gap-2">
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
          {onCompleteDirectly && (
            <Button
              variant="outline"
              onClick={() => onCompleteDirectly(quote)}
              disabled={actionLoading === quote.id}
              className="w-full sm:w-auto"
            >
              {actionLoading === quote.id ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fullfører...</>
              ) : (
                <><CheckCircle className="mr-2 h-4 w-4" /> Avslutt direkte</>
              )}
            </Button>
          )}
          {onViewHistory && !quote.user_id && (
            <Button
              variant="outline"
              onClick={() => onViewHistory(quote.email, quote.type === 'business' ? (quote.company_name || quote.name) : quote.name)}
              className="w-full sm:w-auto"
            >
              <History className="mr-2 h-4 w-4" /> Se historikk
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              onClick={() => onDelete(quote)}
              disabled={actionLoading === quote.id}
              className="w-full sm:w-auto sm:ml-auto"
            >
              {actionLoading === quote.id ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sletter...</>
              ) : (
                <><Trash2 className="mr-2 h-4 w-4" /> Slett</>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
    </div>
  );
};
