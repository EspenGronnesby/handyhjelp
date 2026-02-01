import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, User, Globe, MessageSquare, Check, X } from 'lucide-react';
import { EmailRecipient } from '@/hooks/useSendEmail';

interface EmailConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipients: EmailRecipient[];
  subject: string;
  templateName?: string;
  includeFeedbackButton: boolean;
  onConfirm: () => void;
  loading: boolean;
  cooldownSeconds?: number;
}

export function EmailConfirmModal({
  open,
  onOpenChange,
  recipients,
  subject,
  templateName,
  includeFeedbackButton,
  onConfirm,
  loading,
  cooldownSeconds = 0,
}: EmailConfirmModalProps) {
  const customerCount = recipients.filter(r => r.type === 'customer').length;
  const externalCount = recipients.filter(r => r.type === 'external').length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bekreft utsending</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Recipients summary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Mottakere</span>
              <div className="flex gap-2">
                {customerCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    <User className="h-3 w-3 mr-1" />
                    {customerCount} kunde{customerCount > 1 ? 'r' : ''}
                  </Badge>
                )}
                {externalCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    <Globe className="h-3 w-3 mr-1" />
                    {externalCount} ekstern{externalCount > 1 ? 'e' : ''}
                  </Badge>
                )}
              </div>
            </div>
            
            <ScrollArea className="h-[150px] rounded-md border p-3">
              <div className="space-y-2">
                {recipients.map((recipient, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    {recipient.type === 'customer' ? (
                      <User className="h-4 w-4 text-primary" />
                    ) : (
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="flex-1">
                      {recipient.name ? (
                        <>
                          <span className="font-medium">{recipient.name}</span>
                          <span className="text-muted-foreground ml-1">({recipient.email})</span>
                        </>
                      ) : (
                        <span>{recipient.email}</span>
                      )}
                    </span>
                    <Badge 
                      variant={recipient.type === 'customer' ? 'secondary' : 'outline'}
                      className="text-[10px] px-1.5"
                    >
                      {recipient.type === 'customer' ? 'Kunde' : 'Ekstern'}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Email details */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-start gap-2">
              <span className="text-sm text-muted-foreground w-24 flex-shrink-0">Emne:</span>
              <span className="text-sm font-medium">{subject}</span>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-sm text-muted-foreground w-24 flex-shrink-0">Mal:</span>
              <span className="text-sm">
                {templateName || <span className="text-muted-foreground italic">Egendefinert tekst</span>}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground w-24 flex-shrink-0">Tilbakemelding:</span>
              <div className="flex items-center gap-1">
                {includeFeedbackButton ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Ja, inkludert</span>
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Nei</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Warning for multiple recipients */}
          {recipients.length > 1 && (
            <div className="bg-muted/50 rounded-md p-3 text-sm">
              <MessageSquare className="h-4 w-4 inline-block mr-2 text-muted-foreground" />
              E-posten sendes individuelt til hver mottaker (ikke CC/BCC)
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Avbryt
          </Button>
          <Button onClick={onConfirm} disabled={loading || cooldownSeconds > 0}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {cooldownSeconds > 0
              ? `Vent ${cooldownSeconds}s`
              : `Bekreft og send (${recipients.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
