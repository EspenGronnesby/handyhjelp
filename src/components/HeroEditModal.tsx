import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface HeroEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: string;
  currentData: {
    heading: string;
    subtext: string;
  };
}

export const HeroEditModal = ({
  isOpen,
  onClose,
  section,
  currentData
}: HeroEditModalProps) => {
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
        { section, content_key: 'heading', content_value: formData.heading, content_type: 'text', updated_by: user.id },
        { section, content_key: 'subtext', content_value: formData.subtext, content_type: 'text', updated_by: user.id }
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
        description: "Hero-seksjon oppdatert",
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
          <DialogTitle>Rediger hero-seksjon</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="heading">Overskrift</Label>
            <Input
              id="heading"
              value={formData.heading}
              onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
              maxLength={100}
              placeholder="F.eks. Våre tjenester"
            />
            <div className="text-sm text-muted-foreground text-right">
              {formData.heading.length} / 100 tegn
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtext">Undertekst</Label>
            <Textarea
              id="subtext"
              value={formData.subtext}
              onChange={(e) => setFormData({ ...formData, subtext: e.target.value })}
              maxLength={200}
              rows={3}
              placeholder="F.eks. Profesjonelle håndverkstjenester til konkurransedyktige priser"
            />
            <div className="text-sm text-muted-foreground text-right">
              {formData.subtext.length} / 200 tegn
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
