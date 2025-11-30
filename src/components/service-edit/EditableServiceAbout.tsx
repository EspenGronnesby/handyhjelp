import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useEditableContent } from '@/hooks/useEditableContent';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface EditableServiceAboutProps {
  section: string;
  defaultParagraph1: string;
  defaultParagraph2: string;
  defaultParagraph3: string;
}

export const EditableServiceAbout = ({
  section,
  defaultParagraph1,
  defaultParagraph2,
  defaultParagraph3,
}: EditableServiceAboutProps) => {
  const { editMode, isAdmin } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const { content: p1 } = useEditableContent(section, 'paragraph_1');
  const { content: p2 } = useEditableContent(section, 'paragraph_2');
  const { content: p3 } = useEditableContent(section, 'paragraph_3');

  const displayData = {
    paragraph1: p1 || defaultParagraph1,
    paragraph2: p2 || defaultParagraph2,
    paragraph3: p3 || defaultParagraph3,
  };

  const [formData, setFormData] = useState(displayData);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updates = [
        { content_key: 'paragraph_1', content_value: formData.paragraph1 },
        { content_key: 'paragraph_2', content_value: formData.paragraph2 },
        { content_key: 'paragraph_3', content_value: formData.paragraph3 },
      ];

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
            className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg border-2 border-primary hover:scale-110 transition-transform"
          >
            <Pencil className="h-5 w-5 text-primary" />
          </button>
        )}
        
        <h2 className="text-3xl font-heading font-bold mb-6">Om tjenesten</h2>
        <div className="space-y-4 text-muted-foreground">
          <p>{displayData.paragraph1}</p>
          <p>{displayData.paragraph2}</p>
          <p>{displayData.paragraph3}</p>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rediger "Om tjenesten"</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Avsnitt 1</Label>
              <Textarea
                value={formData.paragraph1}
                onChange={(e) => setFormData({ ...formData, paragraph1: e.target.value })}
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.paragraph1.length}/500 tegn
              </p>
            </div>
            <div>
              <Label>Avsnitt 2</Label>
              <Textarea
                value={formData.paragraph2}
                onChange={(e) => setFormData({ ...formData, paragraph2: e.target.value })}
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.paragraph2.length}/500 tegn
              </p>
            </div>
            <div>
              <Label>Avsnitt 3</Label>
              <Textarea
                value={formData.paragraph3}
                onChange={(e) => setFormData({ ...formData, paragraph3: e.target.value })}
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.paragraph3.length}/500 tegn
              </p>
            </div>
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
