import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';
import { Loader2, CheckCircle, Trash2 } from 'lucide-react';
import { Job, STATUS_COLORS, STATUS_LABELS } from '@/types/admin';

interface JobCardProps {
  job: Job;
  actionLoading: string | null;
  variant: 'active' | 'completed';
  onComplete?: (job: Job) => void;
  onDelete?: (job: Job) => void;
}

export const JobCard = ({ job, actionLoading, variant, onComplete, onDelete }: JobCardProps) => {
  const dateLabel = variant === 'active' 
    ? `Startet ${job.started_at && formatDistanceToNow(new Date(job.started_at), { addSuffix: true, locale: nb })}`
    : `Fullført ${job.completed_date && formatDistanceToNow(new Date(job.completed_date), { addSuffix: true, locale: nb })}`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {job.quotes.type === 'business' ? job.quotes.company_name : job.quotes.name}
              <Badge className="ml-2" variant="outline">
                {job.quotes.type === 'business' ? 'Bedrift' : 'Privat'}
              </Badge>
            </CardTitle>
            <CardDescription>{dateLabel}</CardDescription>
          </div>
          <Badge className={STATUS_COLORS[job.status]}>
            {STATUS_LABELS[job.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">Beskrivelse:</p>
          <p className="text-sm text-muted-foreground">{job.quotes.description}</p>
        </div>
        {job.notes && (
          <div>
            <p className="text-sm font-medium">Notater:</p>
            <p className="text-sm text-muted-foreground">{job.notes}</p>
          </div>
        )}
        <div className="flex gap-4 text-sm flex-wrap">
          <div>
            <span className="font-medium">E-post:</span> {job.quotes.email}
          </div>
          <div>
            <span className="font-medium">Telefon:</span> {job.quotes.phone}
          </div>
          {job.quotes.org_number && (
            <div>
              <span className="font-medium">Org.nr:</span> {job.quotes.org_number}
            </div>
          )}
        </div>
        
        {variant === 'active' && onComplete && (
          <Button 
            onClick={() => onComplete(job)}
            disabled={actionLoading === job.id}
            className="w-full sm:w-auto"
          >
            {actionLoading === job.id ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fullfører...</>
            ) : (
              <><CheckCircle className="mr-2 h-4 w-4" /> Fullfør jobb</>
            )}
          </Button>
        )}
        
        {variant === 'completed' && onDelete && (
          <Button 
            variant="destructive"
            onClick={() => onDelete(job)}
            disabled={actionLoading === job.id}
            className="w-full sm:w-auto"
          >
            {actionLoading === job.id ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sletter...</>
            ) : (
              <><Trash2 className="mr-2 h-4 w-4" /> Slett jobb</>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
