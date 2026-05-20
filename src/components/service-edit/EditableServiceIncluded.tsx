import { useState } from 'react';
import { CheckCircle2, EyeOff, ClipboardCheck } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useEditableContent } from '@/hooks/useEditableContent';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { isStringEmpty, getDisplayValue } from '@/lib/gridUtils';
import { EditButton } from '@/components/ui/EditButton';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useFadeInUp } from '@/hooks/useScrollAnimation';

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

  const { content: item1, hasBeenEdited: item1Edited } = useEditableContent(section, 'included_1');
  const { content: item2, hasBeenEdited: item2Edited } = useEditableContent(section, 'included_2');
  const { content: item3, hasBeenEdited: item3Edited } = useEditableContent(section, 'included_3');
  const { content: item4, hasBeenEdited: item4Edited } = useEditableContent(section, 'included_4');
  const { content: item5, hasBeenEdited: item5Edited } = useEditableContent(section, 'included_5');
  const { content: item6, hasBeenEdited: item6Edited } = useEditableContent(section, 'included_6');
  const { content: item7, hasBeenEdited: item7Edited } = useEditableContent(section, 'included_7');
  const { content: item8, hasBeenEdited: item8Edited } = useEditableContent(section, 'included_8');

  const allItems = [
    getDisplayValue(item1, item1Edited, defaultItems[0] || ''),
    getDisplayValue(item2, item2Edited, defaultItems[1] || ''),
    getDisplayValue(item3, item3Edited, defaultItems[2] || ''),
    getDisplayValue(item4, item4Edited, defaultItems[3] || ''),
    getDisplayValue(item5, item5Edited, defaultItems[4] || ''),
    getDisplayValue(item6, item6Edited, defaultItems[5] || ''),
    getDisplayValue(item7, item7Edited, defaultItems[6] || ''),
    getDisplayValue(item8, item8Edited, defaultItems[7] || ''),
  ];

  const displayItems = isAdmin && editMode
    ? allItems
    : allItems.filter(item => !isStringEmpty(item));

  const [formData, setFormData] = useState({
    items: allItems.some(i => i.trim() !== '') ? allItems : defaultItems
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

  const { ref, style } = useFadeInUp({ threshold: 0.15 });

  const visibleCount = displayItems.filter(i => !isStringEmpty(i)).length;
  if (visibleCount === 0 && !(isAdmin && editMode)) {
    return null;
  }

  return (
    <>
      <div ref={ref} style={style} className="relative">
        {isAdmin && editMode && (
          <EditButton onClick={() => setIsModalOpen(true)} ariaLabel="Rediger" />
        )}

        <SectionHeading
          icon={ClipboardCheck}
          gradient="from-emerald-500 via-teal-500 to-cyan-600"
          title="Hva er inkludert?"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          {displayItems.map((item, idx) => {
            const isHidden = isStringEmpty(item);
            if (isHidden && !(isAdmin && editMode)) {
              return null;
            }
            return (
              <div
                key={idx}
                className={`flex items-start gap-2 ${isHidden && isAdmin && editMode ? 'opacity-50' : ''}`}
              >
                {isHidden && isAdmin && editMode ? (
                  <>
                    <EyeOff className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-muted-foreground italic text-sm">Tom (skjult)</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base text-foreground">{item}</span>
                  </>
                )}
              </div>
            );
          })}
        </div>
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
                  placeholder="La stå tom for å skjule"
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
