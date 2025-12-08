import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';
import { ServiceAgreement, SERVICE_LABELS, AGREEMENT_STATUS_LABELS, AGREEMENT_STATUS_COLORS } from '@/types/admin';

interface ServiceAgreementCardProps {
  agreement: ServiceAgreement;
  onUpdateStatus: (id: string, status: string) => void;
}

export const ServiceAgreementCard = ({ agreement, onUpdateStatus }: ServiceAgreementCardProps) => {
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

        <div className="flex gap-2 pt-4 flex-wrap">
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
            onClick={() => onUpdateStatus(agreement.id, 'offer_sent')}
            disabled={agreement.status === 'new'}
          >
            Tilbud sendt
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={() => onUpdateStatus(agreement.id, 'contract_signed')}
            disabled={agreement.status === 'new'}
          >
            Avtale inngått
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onUpdateStatus(agreement.id, 'rejected')}
          >
            Avslå
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
