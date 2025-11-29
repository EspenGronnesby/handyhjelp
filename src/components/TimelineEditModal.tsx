import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface TimelineEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: string;
  currentData: {
    heading: string;
    timeline: Array<{ year: string; event: string }>;
  };
}

export const TimelineEditModal = ({ isOpen, onClose, section, currentData }: TimelineEditModalProps) => {
  const [formData, setFormData] = useState(currentData);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen) setFormData(currentData);
  }, [isOpen, currentData]);

  const updateTimelineItem = (index: number, field: 'year' | 'event', value: string) => {
    const newTimeline = [...formData.timeline];
    newTimeline[index] = { ...newTimeline[index], [field]: value };
    setFormData({ ...formData, timeline: newTimeline });
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updates = [
        { section, content_key: 'heading', content_value: formData.heading, content_type: 'text', updated_by: user.id }
      ];

      formData.timeline.forEach((item, index) => {
        updates.push(
          { section, content_key: `year_${index + 1}`, content_value: item.year, content_type: 'text', updated_by: user.id },
          { section, content_key: `event_${index + 1}`, content_value: item.event, content_type: 'text', updated_by: user.id }
        );
      });

      for (const update of updates) {
        const { error } = await supabase
          .from('site_content')
          .upsert(update, { onConflict: 'section,content_key' });
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['site-content', section] });
      toast({ title: "✅ Lagret", description: "Tidslinje oppdatert" });
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
          <DialogTitle>Rediger tidslinje</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Overskrift</Label>
            <Input
              value={formData.heading}
              onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
              maxLength={100}
            />
          </div>

          {formData.timeline.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <h4 className="font-semibold">Punkt {index + 1}</h4>
              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-2">
                  <Label>År</Label>
                  <Input
                    value={item.year}
                    onChange={(e) => updateTimelineItem(index, 'year', e.target.value)}
                    maxLength={4}
                    placeholder="2004"
                  />
                </div>
                <div className="col-span-3 space-y-2">
                  <Label>Hendelse</Label>
                  <Input
                    value={item.event}
                    onChange={(e) => updateTimelineItem(index, 'event', e.target.value)}
                    maxLength={150}
                    placeholder="Beskrivelse av hendelse"
                  />
                </div>
              </div>
            </div>
          ))}
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
