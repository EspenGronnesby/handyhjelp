import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface ProcessStepEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: string;
  currentData: {
    title: string;
    description: string;
  };
  stepNumber: number;
}

export const ProcessStepEditModal = ({
  isOpen,
  onClose,
  section,
  currentData,
  stepNumber
}: ProcessStepEditModalProps) => {
  const [formData, setFormData] = useState(currentData);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen) {
      setFormData(currentData);
    }
  }, [isOpen, currentData]);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      const updates = [
        { section, content_key: 'title', content_value: formData.title, content_type: 'text', updated_by: user.id },
        { section, content_key: 'description', content_value: formData.description, content_type: 'text', updated_by: user.id }
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('site_content')
          .upsert(update, { onConflict: 'section,content_key' });

        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['site-content', section] });

      toast({
        title: "✅ Lagret",
        description: `Steg ${stepNumber} oppdatert`,
      });

      onClose();
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "❌ Feil ved lagring",
        description: "Prøv igjen",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Rediger Steg {stepNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tittel</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              maxLength={80}
              placeholder="F.eks. Kontakt oss"
            />
            <div className="text-sm text-muted-foreground text-right">
              {formData.title.length} / 80 tegn
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beskrivelse</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              maxLength={200}
              placeholder="F.eks. Ring oss eller fyll ut skjemaet for et uforpliktende tilbud"
              rows={4}
              className="resize-none"
            />
            <div className="text-sm text-muted-foreground text-right">
              {formData.description.length} / 200 tegn
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Avbryt
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
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
