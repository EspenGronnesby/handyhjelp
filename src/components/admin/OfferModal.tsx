import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ServiceAgreement } from '@/types/admin';

interface OfferModalProps {
  agreement: ServiceAgreement | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const OfferModal = ({ agreement, open, onClose, onSuccess }: OfferModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerDescription, setOfferDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      toast({
        title: "Ugyldig fil",
        description: "Vennligst velg en PDF-fil",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreement) return;

    const amount = parseFloat(offerAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Ugyldig beløp",
        description: "Vennligst angi et gyldig beløp",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let offerDocumentUrl: string | null = null;

      // Last opp dokument hvis valgt - lagre kun filstien, ikke full URL
      if (file) {
        const filePath = `${agreement.user_id || 'anonymous'}/${agreement.id}/offer-${Date.now()}.pdf`;
        const { error: uploadError } = await supabase.storage
          .from('agreement-documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Lagre kun filstien i databasen, ikke full URL
        offerDocumentUrl = filePath;
      }

      // Oppdater avtalen
      const { error: updateError } = await supabase
        .from('service_agreements')
        .update({
          status: 'offer_sent',
          offer_amount: amount,
          offer_document_url: offerDocumentUrl,
          offer_sent_at: new Date().toISOString(),
        })
        .eq('id', agreement.id);

      if (updateError) throw updateError;

      // Logg aktivitet
      await supabase.from('agreement_activities').insert({
        agreement_id: agreement.id,
        action: 'offer_sent',
        description: `Tilbud på kr ${amount.toLocaleString('nb-NO')} sendt til kunde.${offerDescription ? ` Beskrivelse: ${offerDescription}` : ''}`,
      });

      // Send notifikasjon til bruker
      if (agreement.user_id) {
        await supabase.from('notifications').insert({
          user_id: agreement.user_id,
          type: 'agreement_update',
          title: 'Du har mottatt et tilbud!',
          message: `Vi har sendt deg et tilbud på kr ${amount.toLocaleString('nb-NO')} for serviceavtale. Sjekk e-posten din for detaljer.`,
          read: false
        });
      }

      // Send e-post
      await supabase.functions.invoke('send-agreement-status-email', {
        body: {
          contactPerson: agreement.contact_person,
          email: agreement.email,
          address: agreement.address,
          services: agreement.services,
          status: 'offer_sent',
          offerAmount: amount,
          offerDocumentUrl: offerDocumentUrl,
        },
      });

      toast({
        title: "Tilbud sendt!",
        description: "Kunden har mottatt tilbudet på e-post.",
      });

      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Error sending offer:', error);
      toast({
        title: "Feil",
        description: `Kunne ikke sende tilbud: ${error?.message || 'Ukjent feil'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setOfferAmount('');
    setOfferDescription('');
    setFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send tilbud</DialogTitle>
          <DialogDescription>
            Send tilbud til {agreement?.contact_person} for serviceavtale.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="offerAmount">Tilbudsbeløp (kr/mnd)</Label>
            <Input
              id="offerAmount"
              type="number"
              placeholder="F.eks. 5000"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="offerDescription">Beskrivelse (valgfritt)</Label>
            <Textarea
              id="offerDescription"
              placeholder="Kort beskrivelse av tilbudet..."
              value={offerDescription}
              onChange={(e) => setOfferDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="offerFile">Tilbudsdokument (PDF, valgfritt)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="offerFile"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="flex-1"
              />
            </div>
            {file && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                {file.name}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Avbryt
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sender...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Send tilbud
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
