import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';
import { Loader2, CheckCircle, Trash2, Receipt, AlertCircle, CreditCard, Smile, Meh, Frown } from 'lucide-react';
import { Job, STATUS_COLORS, STATUS_LABELS, Invoice, InvoiceRequest, INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from '@/types/admin';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface QuickFeedback {
  id: string;
  job_id: string;
  rating: 'happy' | 'neutral' | 'sad' | null;
  token_used_at: string | null;
  created_at: string;
}

interface JobCardProps {
  job: Job;
  actionLoading: string | null;
  variant: 'active' | 'completed';
  onComplete?: (job: Job) => void;
  onDelete?: (job: Job) => void;
  onAddInvoice?: (job: Job) => void;
}

const RATING_CONFIG = {
  happy: { icon: Smile, label: 'Fornøyd', color: 'text-green-500', bg: 'bg-green-50' },
  neutral: { icon: Meh, label: 'Nøytral', color: 'text-yellow-500', bg: 'bg-yellow-50' },
  sad: { icon: Frown, label: 'Misfornøyd', color: 'text-red-500', bg: 'bg-red-50' }
};

export const JobCard = ({ job, actionLoading, variant, onComplete, onDelete, onAddInvoice }: JobCardProps) => {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [invoiceRequest, setInvoiceRequest] = useState<InvoiceRequest | null>(null);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [quickFeedback, setQuickFeedback] = useState<QuickFeedback | null>(null);

  useEffect(() => {
    if (variant === 'completed') {
      fetchInvoiceData();
      fetchQuickFeedback();
    }
  }, [job.id, variant]);

  const fetchInvoiceData = async () => {
    // Fetch invoice
    const { data: invoiceData } = await supabase
      .from('invoices')
      .select('*')
      .eq('job_id', job.id)
      .maybeSingle();
    
    if (invoiceData) setInvoice(invoiceData as Invoice);

    // Fetch invoice request
    const { data: requestData } = await supabase
      .from('invoice_requests')
      .select('*')
      .eq('job_id', job.id)
      .maybeSingle();
    
    if (requestData) setInvoiceRequest(requestData as InvoiceRequest);
  };

  const fetchQuickFeedback = async () => {
    const { data } = await supabase
      .from('quick_feedback')
      .select('*')
      .eq('job_id', job.id)
      .maybeSingle();
    
    if (data) setQuickFeedback(data as QuickFeedback);
  };

  const handleMarkAsPaid = async () => {
    if (!invoice) return;
    
    setMarkingPaid(true);
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', invoice.id);

      if (error) throw error;

      setInvoice({ ...invoice, status: 'paid' });
      toast({
        title: 'Faktura markert som betalt',
        description: `Faktura ${invoice.invoice_number} er nå registrert som betalt.`
      });
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke oppdatere fakturastatus.',
        variant: 'destructive'
      });
    } finally {
      setMarkingPaid(false);
    }
  };

  const dateLabel = variant === 'active' 
    ? `Startet ${job.started_at && formatDistanceToNow(new Date(job.started_at), { addSuffix: true, locale: nb })}`
    : `Fullført ${job.completed_date && formatDistanceToNow(new Date(job.completed_date), { addSuffix: true, locale: nb })}`;

  const hasInvoiceRequest = invoiceRequest && invoiceRequest.status === 'pending';

  const getInvoiceStatusBadge = () => {
    if (!invoice) return null;
    const statusClass = INVOICE_STATUS_COLORS[invoice.status] || 'bg-gray-500';
    const statusLabel = INVOICE_STATUS_LABELS[invoice.status] || invoice.status;
    return (
      <Badge className={`${statusClass} flex items-center gap-1`}>
        <Receipt className="h-3 w-3" />
        {statusLabel}
      </Badge>
    );
  };

  const getFeedbackBadge = () => {
    if (!quickFeedback) return null;
    
    if (!quickFeedback.rating || !quickFeedback.token_used_at) {
      return (
        <Badge variant="outline" className="flex items-center gap-1 text-muted-foreground">
          Venter på tilbakemelding
        </Badge>
      );
    }

    const config = RATING_CONFIG[quickFeedback.rating];
    const Icon = config.icon;
    return (
      <Badge className={`${config.bg} ${config.color} border-0 flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <Card className={hasInvoiceRequest ? 'ring-2 ring-orange-400' : ''}>
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
          <div className="flex flex-col items-end gap-2">
            <Badge className={STATUS_COLORS[job.status]}>
              {STATUS_LABELS[job.status]}
            </Badge>
            {hasInvoiceRequest && (
              <Badge className="bg-orange-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Faktura forespurt
              </Badge>
            )}
            {getInvoiceStatusBadge()}
            {variant === 'completed' && getFeedbackBadge()}
          </div>
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

        {/* Invoice details if exists */}
        {invoice && (
          <div className="bg-muted/50 p-3 rounded-lg space-y-3">
            <p className="text-sm font-medium flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Fakturadetaljer
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Nummer:</span> {invoice.invoice_number}
              </div>
              <div>
                <span className="text-muted-foreground">Beløp:</span> {new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK' }).format(invoice.amount)}
              </div>
              <div>
                <span className="text-muted-foreground">Forfallsdato:</span> {new Date(invoice.due_date).toLocaleDateString('nb-NO')}
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>{' '}
                <span className={invoice.status === 'paid' ? 'text-green-600 font-medium' : invoice.status === 'overdue' ? 'text-red-600 font-medium' : 'text-yellow-600'}>
                  {INVOICE_STATUS_LABELS[invoice.status]}
                </span>
              </div>
            </div>
            
            {/* Mark as paid button */}
            {invoice.status !== 'paid' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAsPaid}
                disabled={markingPaid}
                className="w-full mt-2 border-green-500 text-green-600 hover:bg-green-50"
              >
                {markingPaid ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Oppdaterer...</>
                ) : (
                  <><CreditCard className="mr-2 h-4 w-4" /> Marker som betalt</>
                )}
              </Button>
            )}
          </div>
        )}
        
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
        
        {variant === 'completed' && (
          <div className="flex flex-wrap gap-2">
            {!invoice && onAddInvoice && (
              <Button 
                variant="outline"
                onClick={() => onAddInvoice(job)}
                className="flex-1 sm:flex-none"
              >
                <Receipt className="mr-2 h-4 w-4" />
                Legg til faktura
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="destructive"
                onClick={() => onDelete(job)}
                disabled={actionLoading === job.id}
                className="flex-1 sm:flex-none"
              >
                {actionLoading === job.id ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sletter...</>
                ) : (
                  <><Trash2 className="mr-2 h-4 w-4" /> Slett jobb</>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};