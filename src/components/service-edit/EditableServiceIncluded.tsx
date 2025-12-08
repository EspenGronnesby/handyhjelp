import { useState } from 'react';
import { Pencil, CheckCircle2 } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useEditableContent } from '@/hooks/useEditableContent';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface EditableServiceIncludedProps {
  section: string;
  defaultItems: string[];
}

export const EditableServiceIncluded = ({
  section,
  defaultItems,
}: EditableServiceIncludedProps) => {
  const { editMode, isAdmin } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const { content: item1 } = useEditableContent(section, 'included_1');
  const { content: item2 } = useEditableContent(section, 'included_2');
  const { content: item3 } = useEditableContent(section, 'included_3');
  const { content: item4 } = useEditableContent(section, 'included_4');
  const { content: item5 } = useEditableContent(section, 'included_5');
  const { content: item6 } = useEditableContent(section, 'included_6');
  const { content: item7 } = useEditableContent(section, 'included_7');
  const { content: item8 } = useEditableContent(section, 'included_8');

  const displayItems = [
    item1 || defaultItems[0] || '',
    item2 || defaultItems[1] || '',
    item3 || defaultItems[2] || '',
    item4 || defaultItems[3] || '',
    item5 || defaultItems[4] || '',
    item6 || defaultItems[5] || '',
    item7 || defaultItems[6] || '',
    item8 || defaultItems[7] || '',
  ].filter(item => item.trim() !== '');

  const [formData, setFormData] = useState({
    items: displayItems.length > 0 ? displayItems : defaultItems
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updates = formData.items.map((item, index) => ({
        content_key: `included_${index + 1}`,
        content_value: item
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('site_content')
          .upsert({
            section,
            content_key: update.content_key,
            content_value: update.content_value,
            content_type: 'text',
            updated_by: user.id
          }, {
            onConflict: 'section,content_key'
          });
        
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['site-content', section] });
      toast.success('Lagret!');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Kunne ikke lagre endringene');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="mb-12 relative">
        {isAdmin && editMode && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute top-4 right-4 z-10 bg-background rounded-full p-2 shadow-lg border-2 border-primary hover:scale-110 transition-transform"
          >
            <Pencil className="h-5 w-5 text-primary" />
          </button>
        )}
        
        <h2 className="text-3xl font-heading font-bold mb-6">Hva er inkludert?</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-4">
              {displayItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rediger "Hva er inkludert?"</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index}>
                <Label>Punkt {index + 1}</Label>
                <Input
                  value={item}
                  onChange={(e) => {
                    const newItems = [...formData.items];
                    newItems[index] = e.target.value;
                    setFormData({ items: newItems });
                  }}
                  maxLength={200}
                />
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
              Avbryt
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Lagrer...' : 'Lagre'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
