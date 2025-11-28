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
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface ServiceCardEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: string;
  currentData: {
    title: string;
    subtitle: string;
    bullet1: string;
    bullet2: string;
    bullet3: string;
  };
}

export const ServiceCardEditModal = ({
  isOpen,
  onClose,
  section,
  currentData
}: ServiceCardEditModalProps) => {
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
        { section, content_key: 'subtitle', content_value: formData.subtitle, content_type: 'text', updated_by: user.id },
        { section, content_key: 'bullet_1', content_value: formData.bullet1, content_type: 'text', updated_by: user.id },
        { section, content_key: 'bullet_2', content_value: formData.bullet2, content_type: 'text', updated_by: user.id },
        { section, content_key: 'bullet_3', content_value: formData.bullet3, content_type: 'text', updated_by: user.id }
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('site_content')
          .upsert(update, { onConflict: 'section,content_key' });

        if (error) throw error;
      }

      // Invalider cache for å trigge re-fetch
      queryClient.invalidateQueries({ queryKey: ['site-content', section] });

      toast({
        title: "✅ Lagret",
        description: "Tjenestekort oppdatert",
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
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rediger tjenestekort</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tittel</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              maxLength={50}
              placeholder="F.eks. Vaktmestertjenester"
            />
            <div className="text-sm text-muted-foreground text-right">
              {formData.title.length} / 50 tegn
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Undertittel</Label>
            <Input
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              maxLength={100}
              placeholder="F.eks. Profesjonell eiendomspleie og vedlikehold"
            />
            <div className="text-sm text-muted-foreground text-right">
              {formData.subtitle.length} / 100 tegn
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bullet1">Kulepunkt 1</Label>
            <Input
              id="bullet1"
              value={formData.bullet1}
              onChange={(e) => setFormData({ ...formData, bullet1: e.target.value })}
              maxLength={80}
            />
            <div className="text-sm text-muted-foreground text-right">
              {formData.bullet1.length} / 80 tegn
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bullet2">Kulepunkt 2</Label>
            <Input
              id="bullet2"
              value={formData.bullet2}
              onChange={(e) => setFormData({ ...formData, bullet2: e.target.value })}
              maxLength={80}
            />
            <div className="text-sm text-muted-foreground text-right">
              {formData.bullet2.length} / 80 tegn
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bullet3">Kulepunkt 3</Label>
            <Input
              id="bullet3"
              value={formData.bullet3}
              onChange={(e) => setFormData({ ...formData, bullet3: e.target.value })}
              maxLength={80}
            />
            <div className="text-sm text-muted-foreground text-right">
              {formData.bullet3.length} / 80 tegn
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
