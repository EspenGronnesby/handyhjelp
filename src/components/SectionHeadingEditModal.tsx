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

interface SectionHeadingEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: string;
  currentData: {
    heading: string;
    subheading?: string;
  };
  sectionLabel: string;
}

export const SectionHeadingEditModal = ({
  isOpen,
  onClose,
  section,
  currentData,
  sectionLabel
}: SectionHeadingEditModalProps) => {
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
        { section, content_key: 'heading', content_value: formData.heading, content_type: 'text', updated_by: user.id }
      ];

      if (currentData.subheading !== undefined) {
        updates.push({ 
          section, 
          content_key: 'subheading', 
          content_value: formData.subheading || '', 
          content_type: 'text', 
          updated_by: user.id 
        });
      }

      for (const update of updates) {
        const { error } = await supabase
          .from('site_content')
          .upsert(update, { onConflict: 'section,content_key' });

        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['site-content', section] });

      toast({
        title: "✅ Lagret",
        description: `${sectionLabel} oppdatert`,
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
          <DialogTitle>Rediger {sectionLabel}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="heading">Overskrift</Label>
            <Input
              id="heading"
              value={formData.heading}
              onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
              maxLength={80}
              placeholder="F.eks. Våre tjenester"
            />
            <div className="text-sm text-muted-foreground text-right">
              {formData.heading.length} / 80 tegn
            </div>
          </div>

          {currentData.subheading !== undefined && (
            <div className="space-y-2">
              <Label htmlFor="subheading">Underoverskrift</Label>
              <Textarea
                id="subheading"
                value={formData.subheading || ''}
                onChange={(e) => setFormData({ ...formData, subheading: e.target.value })}
                maxLength={200}
                placeholder="F.eks. Profesjonell håndverksarbeid for alle behov"
                rows={3}
                className="resize-none"
              />
              <div className="text-sm text-muted-foreground text-right">
                {(formData.subheading || '').length} / 200 tegn
              </div>
            </div>
          )}
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
