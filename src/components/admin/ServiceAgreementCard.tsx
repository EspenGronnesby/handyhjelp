import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow, format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { ServiceAgreement, SERVICE_LABELS, AGREEMENT_STATUS_LABELS, AGREEMENT_STATUS_COLORS } from '@/types/admin';
import { AlertTriangle } from 'lucide-react';
import { FileText, Save, Loader2, ExternalLink, Send, FileCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ServiceAgreementCardProps {
  agreement: ServiceAgreement;
  onUpdateStatus: (id: string, status: string) => void;
  onSendOffer: (agreement: ServiceAgreement) => void;
  onUploadContract: (agreement: ServiceAgreement) => void;
  onReject: (agreement: ServiceAgreement) => void;
}

export const ServiceAgreementCard = ({ 
  agreement, 
  onUpdateStatus, 
  onSendOffer,
  onUploadContract,
  onReject
}: ServiceAgreementCardProps) => {
  const { toast } = useToast();
  const [notes, setNotes] = useState(agreement.admin_notes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesChanged, setNotesChanged] = useState(false);
  const [downloadingOffer, setDownloadingOffer] = useState(false);
  const [downloadingContract, setDownloadingContract] = useState(false);

  // Ekstraherer filsti fra URL eller returnerer stien direkte
  const extractFilePath = (urlOrPath: string): string => {
    // Hvis det er en full URL, ekstraher filstien
    if (urlOrPath.includes('supabase.co') || urlOrPath.includes('/storage/v1/object/public/')) {
      const match = urlOrPath.match(/agreement-documents\/(.+)$/);
      return match ? match[1] : urlOrPath;
    }
    return urlOrPath;
  };

  const handleDownloadDocument = async (urlOrPath: string, type: 'offer' | 'contract') => {
    const setLoading = type === 'offer' ? setDownloadingOffer : setDownloadingContract;
    setLoading(true);
    
    try {
      const filePath = extractFilePath(urlOrPath);
      
      const { data, error } = await supabase.storage
        .from('agreement-documents')
        .createSignedUrl(filePath, 3600); // 60 minutter gyldig

      if (error) throw error;

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error: any) {
      console.error('Error downloading document:', error);
      toast({
        title: "Feil ved nedlasting",
        description: error?.message || "Kunne ikke laste ned dokumentet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    setNotesChanged(value !== (agreement.admin_notes || ''));
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      const { error } = await supabase
        .from('service_agreements')
        .update({ admin_notes: notes })
        .eq('id', agreement.id);

      if (error) throw error;

      setNotesChanged(false);
      toast({
        title: "Lagret",
        description: "Notater er oppdatert.",
      });
    } catch (error: any) {
      toast({
        title: "Feil",
        description: `Kunne ikke lagre notater: ${error?.message || 'Ukjent feil'}`,
        variant: "destructive",
      });
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {agreement.contact_person}
              <Badge className="ml-2" variant="outline">
                {agreement.customer_type === 'borettslag' ? 'Borettslag/Sameie' : 
                 agreement.customer_type === 'bedrift' ? 'Bedrift' : 'Annet'}
              </Badge>
            </CardTitle>
            <CardDescription>
              Mottatt {formatDistanceToNow(new Date(agreement.created_at), { 
                addSuffix: true,
                locale: nb 
              })}
            </CardDescription>
          </div>
          <Badge className={AGREEMENT_STATUS_COLORS[agreement.status]}>
            {AGREEMENT_STATUS_LABELS[agreement.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">Adresse:</p>
          <p className="text-sm text-muted-foreground">{agreement.address}</p>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Tjenester:</p>
          <div className="flex flex-wrap gap-2">
            {agreement.services.map((service) => (
              <Badge key={service} variant="secondary">
                {SERVICE_LABELS[service] || service}
              </Badge>
            ))}
          </div>
          {agreement.other_services && (
            <p className="text-sm text-muted-foreground mt-2">
              Andre tjenester: {agreement.other_services}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Frekvens:</span> {agreement.frequency}
          </div>
          <div>
            <span className="font-medium">Avtalevarighet:</span> {agreement.contract_duration}
          </div>
          <div>
            <span className="font-medium">Fast kontaktperson:</span> {agreement.fixed_contact_person ? 'Ja' : 'Nei'}
          </div>
          {agreement.start_date && (
            <div>
              <span className="font-medium">Oppstartsdato:</span> {agreement.start_date}
            </div>
          )}
        </div>

        <div className="flex gap-4 text-sm flex-wrap">
          <div>
            <span className="font-medium">Kontakt:</span> {agreement.contact_person} ({agreement.contact_role})
          </div>
          <div>
            <span className="font-medium">E-post:</span> {agreement.email}
          </div>
          <div>
            <span className="font-medium">Telefon:</span> {agreement.phone}
          </div>
        </div>

        {agreement.additional_info && (
          <div>
            <p className="text-sm font-medium">Tilleggsinformasjon:</p>
            <p className="text-sm text-muted-foreground">{agreement.additional_info}</p>
          </div>
        )}

        {/* Avslåingsårsak */}
        {agreement.status === 'rejected' && agreement.rejection_reason && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Årsak til avslag:</p>
                <p className="text-sm text-destructive/80">{agreement.rejection_reason}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tilbud og kontrakt info */}
        {(agreement.offer_amount || agreement.offer_document_url || agreement.contract_document_url) && (
          <div className="border-t pt-4 space-y-2">
            {agreement.offer_amount && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Tilbudsbeløp:</span>
                <span className="text-primary font-semibold">
                  kr {agreement.offer_amount.toLocaleString('nb-NO')}/mnd
                </span>
                {agreement.offer_sent_at && (
                  <span className="text-muted-foreground">
                    (sendt {format(new Date(agreement.offer_sent_at), 'dd.MM.yyyy', { locale: nb })})
                  </span>
                )}
              </div>
            )}
            {agreement.customer_approved_at && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <FileCheck className="h-4 w-4" />
                <span>Kunde godkjente {format(new Date(agreement.customer_approved_at), 'dd.MM.yyyy', { locale: nb })}</span>
              </div>
            )}
            <div className="flex gap-2 flex-wrap">
              {agreement.offer_document_url && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleDownloadDocument(agreement.offer_document_url!, 'offer')}
                  disabled={downloadingOffer}
                >
                  {downloadingOffer ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 mr-1" />
                  )}
                  Tilbudsdokument
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              )}
              {agreement.contract_document_url && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleDownloadDocument(agreement.contract_document_url!, 'contract')}
                  disabled={downloadingContract}
                >
                  {downloadingContract ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 mr-1" />
                  )}
                  Kontrakt
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Admin notater */}
        <div className="border-t pt-4">
          <p className="text-sm font-medium mb-2">Interne notater:</p>
          <Textarea
            placeholder="Legg til interne notater her..."
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            rows={3}
            className="text-sm"
          />
          {notesChanged && (
            <Button 
              size="sm" 
              onClick={handleSaveNotes} 
              disabled={savingNotes}
              className="mt-2"
            >
              {savingNotes ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              Lagre notater
            </Button>
          )}
        </div>

        {/* Handlingsknapper */}
        <div className="flex gap-2 pt-4 flex-wrap border-t">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUpdateStatus(agreement.id, 'under_review')}
            disabled={agreement.status !== 'new'}
          >
            Under vurdering
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSendOffer(agreement)}
            disabled={agreement.status === 'new' || agreement.status === 'contract_signed' || agreement.status === 'rejected'}
          >
            <Send className="h-4 w-4 mr-1" />
            Send tilbud
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={() => onUploadContract(agreement)}
            disabled={agreement.status === 'new' || agreement.status === 'rejected'}
          >
            <FileCheck className="h-4 w-4 mr-1" />
            Last opp kontrakt
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onReject(agreement)}
            disabled={agreement.status === 'contract_signed' || agreement.status === 'rejected'}
          >
            Avslå
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
