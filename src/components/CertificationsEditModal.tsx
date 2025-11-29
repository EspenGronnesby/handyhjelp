import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface CertificationsEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: string;
  currentData: {
    heading: string;
    card1: { title: string; items: string[] };
    card2: { title: string; items: string[] };
  };
}

export const CertificationsEditModal = ({ isOpen, onClose, section, currentData }: CertificationsEditModalProps) => {
  const [formData, setFormData] = useState(currentData);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen) setFormData(currentData);
  }, [isOpen, currentData]);

  const updateCard1Item = (index: number, value: string) => {
    const newItems = [...formData.card1.items];
    newItems[index] = value;
    setFormData({ ...formData, card1: { ...formData.card1, items: newItems } });
  };

  const updateCard2Item = (index: number, value: string) => {
    const newItems = [...formData.card2.items];
    newItems[index] = value;
    setFormData({ ...formData, card2: { ...formData.card2, items: newItems } });
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updates = [
        { section, content_key: 'heading', content_value: formData.heading, content_type: 'text', updated_by: user.id },
        { section, content_key: 'card1_title', content_value: formData.card1.title, content_type: 'text', updated_by: user.id },
        { section, content_key: 'card2_title', content_value: formData.card2.title, content_type: 'text', updated_by: user.id }
      ];

      formData.card1.items.forEach((item, index) => {
        updates.push({ section, content_key: `card1_item${index + 1}`, content_value: item, content_type: 'text', updated_by: user.id });
      });

      formData.card2.items.forEach((item, index) => {
        updates.push({ section, content_key: `card2_item${index + 1}`, content_value: item, content_type: 'text', updated_by: user.id });
      });

      for (const update of updates) {
        const { error } = await supabase
          .from('site_content')
          .upsert(update, { onConflict: 'section,content_key' });
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['site-content', section] });
      toast({ title: "✅ Lagret", description: "Sertifiseringer oppdatert" });
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
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rediger sertifiseringer</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Hovedoverskrift</Label>
            <Input
              value={formData.heading}
              onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
              maxLength={100}
            />
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-semibold">Kort 1 - Offisielle godkjenninger</h4>
            <div className="space-y-2">
              <Label>Tittel</Label>
              <Input
                value={formData.card1.title}
                onChange={(e) => setFormData({ ...formData, card1: { ...formData.card1, title: e.target.value } })}
                maxLength={100}
              />
            </div>
            {formData.card1.items.map((item, index) => (
              <div key={index} className="space-y-2">
                <Label>Punkt {index + 1}</Label>
                <Input
                  value={item}
                  onChange={(e) => updateCard1Item(index, e.target.value)}
                  maxLength={150}
                />
              </div>
            ))}
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-semibold">Kort 2 - Forsikring & Garantier</h4>
            <div className="space-y-2">
              <Label>Tittel</Label>
              <Input
                value={formData.card2.title}
                onChange={(e) => setFormData({ ...formData, card2: { ...formData.card2, title: e.target.value } })}
                maxLength={100}
              />
            </div>
            {formData.card2.items.map((item, index) => (
              <div key={index} className="space-y-2">
                <Label>Punkt {index + 1}</Label>
                <Input
                  value={item}
                  onChange={(e) => updateCard2Item(index, e.target.value)}
                  maxLength={150}
                />
              </div>
            ))}
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
