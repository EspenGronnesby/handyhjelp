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

interface AboutContentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: string;
  currentData: {
    heading: string;
    description: string;
    button1: string;
    button2: string;
  };
}

export const AboutContentEditModal = ({ isOpen, onClose, section, currentData }: AboutContentEditModalProps) => {
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
        { section, content_key: 'heading', content_value: formData.heading, content_type: 'text', updated_by: user.id },
        { section, content_key: 'description', content_value: formData.description, content_type: 'text', updated_by: user.id },
        { section, content_key: 'button_1', content_value: formData.button1, content_type: 'text', updated_by: user.id },
        { section, content_key: 'button_2', content_value: formData.button2, content_type: 'text', updated_by: user.id }
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('site_content')
          .upsert(update, { onConflict: 'section,content_key' });
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['site-content', section] });
      toast({ title: "✅ Lagret", description: "Om oss-innhold oppdatert" });
      onClose();
    } catch (error) {
      console.error(error);
      toast({ title: "❌ Feil", description: "Prøv igjen", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rediger Om oss-innhold</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Overskrift</Label>
            <Input
              value={formData.heading}
              onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">{formData.heading.length}/100</p>
          </div>

          <div className="space-y-2">
            <Label>Beskrivelse</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              maxLength={500}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">{formData.description.length}/500</p>
          </div>

          <div className="space-y-2">
            <Label>Knapp 1 tekst</Label>
            <Input
              value={formData.button1}
              onChange={(e) => setFormData({ ...formData, button1: e.target.value })}
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label>Knapp 2 tekst</Label>
            <Input
              value={formData.button2}
              onChange={(e) => setFormData({ ...formData, button2: e.target.value })}
              maxLength={50}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Avbryt
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Lagrer...</> : 'Lagre'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
