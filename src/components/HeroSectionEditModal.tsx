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

interface HeroSectionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: {
    title: string;
    subtitle: string;
    servicesButton: string;
    phone: string;
  };
}

export const HeroSectionEditModal = ({
  isOpen,
  onClose,
  currentData
}: HeroSectionEditModalProps) => {
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
        { section: 'hero-home', content_key: 'title', content_value: formData.title, content_type: 'text', updated_by: user.id },
        { section: 'hero-home', content_key: 'subtitle', content_value: formData.subtitle, content_type: 'text', updated_by: user.id },
        { section: 'hero-home', content_key: 'services-button', content_value: formData.servicesButton, content_type: 'text', updated_by: user.id },
        { section: 'kontakt-info', content_key: 'phone', content_value: formData.phone, content_type: 'text', updated_by: user.id },
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('site_content')
          .upsert(update, { onConflict: 'section,content_key' });

        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['site-content', 'hero-home'] });
      queryClient.invalidateQueries({ queryKey: ['site-content', 'kontakt-info'] });

      toast({
        title: "✅ Lagret",
        description: "Hero-seksjonen er oppdatert",
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
          <DialogTitle>Rediger Hero-seksjon</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Hovedoverskrift</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              maxLength={100}
              placeholder="F.eks. HandyHjelp – Din lokale altmuligmann"
            />
            <div className="text-sm text-muted-foreground text-right">
              {formData.title.length} / 100 tegn
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Undertekst</Label>
            <Textarea
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              maxLength={200}
              placeholder="F.eks. Profesjonell eiendomspleie i Kristiansand"
              rows={3}
              className="resize-none"
            />
            <div className="text-sm text-muted-foreground text-right">
              {formData.subtitle.length} / 200 tegn
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="servicesButton">Knapp-tekst (sekundær)</Label>
            <Input
              id="servicesButton"
              value={formData.servicesButton}
              onChange={(e) => setFormData({ ...formData, servicesButton: e.target.value })}
              maxLength={30}
              placeholder="F.eks. Se tjenester"
            />
            <div className="text-sm text-muted-foreground text-right">
              {formData.servicesButton.length} / 30 tegn
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefonnummer (vises også i footer, header, kontakt)</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              maxLength={20}
              placeholder="+47 48122206"
            />
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
