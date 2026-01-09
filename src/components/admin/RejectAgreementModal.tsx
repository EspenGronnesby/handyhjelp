import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ServiceAgreement } from "@/types/admin";
import { Loader2 } from "lucide-react";

interface RejectAgreementModalProps {
  agreement: ServiceAgreement | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (agreementId: string, reason: string) => Promise<void>;
}

const REJECTION_REASONS = [
  "Vi har dessverre ikke kapasitet til å ta på oss dette oppdraget for øyeblikket.",
  "Oppdraget faller dessverre utenfor vårt dekningsområde.",
  "Denne typen oppdrag inngår dessverre ikke i tjenestene vi tilbyr.",
  "other"
] as const;

const REASON_LABELS: Record<string, string> = {
  [REJECTION_REASONS[0]]: "Ikke kapasitet",
  [REJECTION_REASONS[1]]: "Utenfor dekningsområde",
  [REJECTION_REASONS[2]]: "Ikke i våre tjenester",
  "other": "Annet (skriv egen årsak)"
};

export const RejectAgreementModal = ({ agreement, open, onClose, onConfirm }: RejectAgreementModalProps) => {
  const [selectedReason, setSelectedReason] = useState<string>(REJECTION_REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!agreement) return;
    
    const finalReason = selectedReason === "other" ? customReason : selectedReason;
    
    if (!finalReason.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onConfirm(agreement.id, finalReason);
      resetForm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedReason(REJECTION_REASONS[0]);
    setCustomReason("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isValid = selectedReason !== "other" || customReason.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Avslå forespørsel</DialogTitle>
          <DialogDescription>
            Velg en årsak for avslaget. Denne vil bli inkludert i e-posten som sendes til kunden.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup value={selectedReason} onValueChange={setSelectedReason} className="space-y-3">
            {REJECTION_REASONS.map((reason) => (
              <div key={reason} className="flex items-start space-x-3">
                <RadioGroupItem value={reason} id={reason} className="mt-1" />
                <Label htmlFor={reason} className="font-normal cursor-pointer leading-relaxed">
                  {REASON_LABELS[reason]}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {selectedReason === "other" && (
            <div className="mt-4">
              <Textarea
                placeholder="Skriv inn årsaken for avslaget..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Avbryt
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleSubmit} 
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Avslår...
              </>
            ) : (
              "Bekreft avslag"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
