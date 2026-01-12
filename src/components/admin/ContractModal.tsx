import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ServiceAgreement } from '@/types/admin';

interface ContractModalProps {
  agreement: ServiceAgreement | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ContractModal = ({ agreement, open, onClose, onSuccess }: ContractModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
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
    if (!agreement || !file) {
      toast({
        title: "Mangler fil",
        description: "Vennligst velg en kontraktfil",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Last opp kontrakt - lagre kun filstien, ikke full URL
      const filePath = `${agreement.user_id || 'anonymous'}/${agreement.id}/contract-${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('agreement-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Lagre kun filstien i databasen, ikke full URL
      const contractDocumentUrl = filePath;

      // Oppdater avtalen
      const { error: updateError } = await supabase
        .from('service_agreements')
        .update({
          status: 'contract_signed',
          contract_document_url: contractDocumentUrl,
          contract_signed_at: new Date().toISOString(),
        })
        .eq('id', agreement.id);

      if (updateError) throw updateError;

      // Logg aktivitet
      await supabase.from('agreement_activities').insert({
        agreement_id: agreement.id,
        action: 'contract_signed',
        description: 'Kontrakt signert og lastet opp.',
      });

      // Send notifikasjon til bruker
      if (agreement.user_id) {
        await supabase.from('notifications').insert({
          user_id: agreement.user_id,
          type: 'agreement_update',
          title: 'Avtale inngått! 🎉',
          message: 'Velkommen som avtalekunde hos HandyHjelp! Din kontrakt er nå klar.',
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
          status: 'contract_signed',
          contractDocumentUrl: contractDocumentUrl,
        },
      });

      toast({
        title: "Kontrakt lagret!",
        description: "Kunden har mottatt kontrakten på e-post.",
      });

      onSuccess();
      onClose();
      setFile(null);
    } catch (error: any) {
      console.error('Error uploading contract:', error);
      toast({
        title: "Feil",
        description: `Kunne ikke laste opp kontrakt: ${error?.message || 'Ukjent feil'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Last opp signert kontrakt</DialogTitle>
          <DialogDescription>
            Last opp den signerte kontrakten for {agreement?.contact_person}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contractFile">Kontraktdokument (PDF)</Label>
            <Input
              id="contractFile"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              required
            />
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
            <Button type="submit" disabled={loading || !file}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Laster opp...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Last opp kontrakt
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
