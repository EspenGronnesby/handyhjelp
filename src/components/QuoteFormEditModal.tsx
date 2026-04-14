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

interface QuoteFormEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: {
    heading: string;
    descriptionLabel: string;
    descriptionIntro: string;
  };
}

export const QuoteFormEditModal = ({
  isOpen,
  onClose,
  currentData,
}: QuoteFormEditModalProps) => {
  const [formData, setFormData] = useState(currentData);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen) setFormData(currentData);
  }, [isOpen, currentData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updates = [
        { section: 'quote-form', content_key: 'heading', content_value: formData.heading, content_type: 'text', updated_by: user.id },
        { section: 'quote-form', content_key: 'description_label', content_value: formData.descriptionLabel, content_type: 'text', updated_by: user.id },
        { section: 'quote-form', content_key: 'description_intro', content_value: formData.descriptionIntro, content_type: 'text', updated_by: user.id },
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('site_content')
          .upsert(update, { onConflict: 'section,content_key' });
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['site-content', 'quote-form'] });

      toast({ title: '✅ Lagret', description: 'Tilbudsskjemaet er oppdatert' });
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      toast({ title: '❌ Feil ved lagring', description: 'Prøv igjen', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rediger tilbudsskjema</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="qf-heading">Overskrift</Label>
            <Input
              id="qf-heading"
              value={formData.heading}
              onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
              maxLength={60}
              placeholder="F.eks. Få gratis tilbud"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="qf-desc-label">Etikett for beskrivelse-feltet</Label>
            <Input
              id="qf-desc-label"
              value={formData.descriptionLabel}
              onChange={(e) => setFormData({ ...formData, descriptionLabel: e.target.value })}
              maxLength={60}
              placeholder="F.eks. Beskriv oppdraget"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="qf-desc-intro">Intro-tekst for innloggede brukere</Label>
            <Textarea
              id="qf-desc-intro"
              value={formData.descriptionIntro}
              onChange={(e) => setFormData({ ...formData, descriptionIntro: e.target.value })}
              maxLength={200}
              rows={3}
              placeholder="F.eks. Vi har allerede dine kontaktopplysninger. Fortell oss hva du ønsker hjelp til."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Avbryt
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
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
