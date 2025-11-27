import { useState, useEffect } from 'react';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EditTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: string;
  contentKey: string;
  currentValue: string;
  onSave: (newValue: string) => Promise<boolean>;
  label?: string;
  maxLength?: number;
  multiline?: boolean;
}

export const EditTextModal = ({
  isOpen,
  onClose,
  section,
  contentKey,
  currentValue,
  onSave,
  label,
  maxLength = 500,
  multiline = false
}: EditTextModalProps) => {
  const [value, setValue] = useState(currentValue);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setValue(currentValue);
  }, [currentValue, isOpen]);

  const handleSave = async () => {
    // Validate input
    const textSchema = z.string()
      .trim()
      .min(1, { message: "Tekst kan ikke være tom" })
      .max(maxLength, { message: `Maks ${maxLength} tegn` });

    try {
      textSchema.parse(value);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Ugyldig input",
          description: error.errors[0].message,
          variant: "destructive"
        });
      }
      return;
    }

    setIsSaving(true);
    const success = await onSave(value.trim());
    setIsSaving(false);

    if (success) {
      onClose();
    }
  };

  const handleCancel = () => {
    setValue(currentValue);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Rediger: {label || `${section} - ${contentKey}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nåværende tekst:</Label>
            <div className="p-3 bg-muted rounded-md text-sm">
              {currentValue || 'Ingen tekst'}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-value">Ny tekst:</Label>
            {multiline ? (
              <Textarea
                id="new-value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Skriv her..."
                maxLength={maxLength}
                rows={4}
                className="resize-none"
              />
            ) : (
              <Input
                id="new-value"
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Skriv her..."
                maxLength={maxLength}
              />
            )}
            <div className="text-sm text-muted-foreground text-right">
              {value.length} / {maxLength} tegn
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Avbryt
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !value.trim()}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Lagrer...
              </>
            ) : (
              <>💾 Lagre</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
