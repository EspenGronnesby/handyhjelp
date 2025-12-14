import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';
import { Loader2, CheckCircle, Trash2, Receipt, AlertCircle } from 'lucide-react';
import { Job, STATUS_COLORS, STATUS_LABELS, Invoice, InvoiceRequest } from '@/types/admin';
import { supabase } from '@/integrations/supabase/client';

interface JobCardProps {
  job: Job;
  actionLoading: string | null;
  variant: 'active' | 'completed';
  onComplete?: (job: Job) => void;
  onDelete?: (job: Job) => void;
  onAddInvoice?: (job: Job) => void;
}

export const JobCard = ({ job, actionLoading, variant, onComplete, onDelete, onAddInvoice }: JobCardProps) => {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [invoiceRequest, setInvoiceRequest] = useState<InvoiceRequest | null>(null);

  useEffect(() => {
    if (variant === 'completed') {
      fetchInvoiceData();
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

  const dateLabel = variant === 'active' 
    ? `Startet ${job.started_at && formatDistanceToNow(new Date(job.started_at), { addSuffix: true, locale: nb })}`
    : `Fullført ${job.completed_date && formatDistanceToNow(new Date(job.completed_date), { addSuffix: true, locale: nb })}`;

  const hasInvoiceRequest = invoiceRequest && invoiceRequest.status === 'pending';

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
            {invoice && (
              <Badge className="bg-green-500 flex items-center gap-1">
                <Receipt className="h-3 w-3" />
                Faktura sendt
              </Badge>
            )}
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
          <div className="bg-muted/50 p-3 rounded-lg space-y-1">
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
                <span className="text-muted-foreground">Status:</span> {invoice.status === 'pending' ? 'Ubetalt' : invoice.status === 'paid' ? 'Betalt' : 'Forfalt'}
              </div>
            </div>
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
