import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Job } from '@/types/admin';

interface InvoiceUploadModalProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const InvoiceUploadModal = ({ job, open, onOpenChange, onSuccess }: InvoiceUploadModalProps) => {
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `HH-${year}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !amount || !dueDate) return;

    setLoading(true);
    try {
      const invoiceNumber = generateInvoiceNumber();
      let fileUrl = null;

      // Upload file if provided
      if (file) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${job.user_id}/${job.id}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('invoices')
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('invoices')
          .getPublicUrl(filePath);
        
        fileUrl = urlData.publicUrl;
      }

      // Create invoice record
      const { error: invoiceError } = await supabase.from('invoices').insert({
        job_id: job.id,
        user_id: job.user_id,
        amount: parseFloat(amount),
        due_date: dueDate,
        file_url: fileUrl,
        invoice_number: invoiceNumber,
        status: 'pending',
      });

      if (invoiceError) throw invoiceError;

      // Update invoice request if exists
      await supabase
        .from('invoice_requests')
        .update({ status: 'fulfilled' })
        .eq('job_id', job.id);

      // In-app notifikasjon til kunde
      await supabase.from('notifications').insert({
        user_id: job.user_id,
        type: 'invoice_sent',
        title: 'Faktura klar',
        message: `Faktura ${invoiceNumber} på ${parseFloat(amount).toLocaleString('nb-NO')} kr er klar. Forfallsdato: ${new Date(dueDate).toLocaleDateString('nb-NO')}.`,
        read: false,
      });

      // Send email notification to customer
      await supabase.functions.invoke('send-invoice-ready-email', {
        body: {
          userId: job.user_id,
          customerName: job.quotes.name,
          customerEmail: job.quotes.email,
          amount: parseFloat(amount),
          dueDate: dueDate,
          invoiceNumber: invoiceNumber,
        },
      });

      toast({
        title: 'Faktura opprettet',
        description: `Faktura ${invoiceNumber} er sendt til ${job.quotes.email}`,
      });

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      toast({
        title: 'Feil',
        description: error.message || 'Kunne ikke opprette faktura',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setDueDate('');
    setFile(null);
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Legg til faktura</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm font-medium">{job.quotes.name}</p>
            <p className="text-xs text-muted-foreground">{job.quotes.description}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Beløp (NOK)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Forfallsdato</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Faktura-fil (PDF, valgfritt)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('file')?.click()}
                className="w-full"
              >
                {file ? (
                  <><FileText className="mr-2 h-4 w-4" /> {file.name}</>
                ) : (
                  <><Upload className="mr-2 h-4 w-4" /> Last opp PDF</>
                )}
              </Button>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Avbryt
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Oppretter...</>
              ) : (
                'Opprett faktura'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
