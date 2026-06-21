import { useState } from 'react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useEditableContent } from '@/hooks/useEditableContent';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { EditButton } from '@/components/ui/EditButton';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { BookOpen, Quote } from 'lucide-react';
import { useFadeInUp } from '@/hooks/useScrollAnimation';

interface EditableServiceAboutProps {
  section: string;
  defaultParagraph1: string;
  defaultParagraph2: string;
  defaultParagraph3: string;
  defaultCallout?: string;
}

export const EditableServiceAbout = ({
  section,
  defaultParagraph1,
  defaultParagraph2,
  defaultParagraph3,
  defaultCallout,
}: EditableServiceAboutProps) => {
  const { editMode, isAdmin } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const { content: p1 } = useEditableContent(section, 'paragraph_1');
  const { content: p2 } = useEditableContent(section, 'paragraph_2');
  const { content: p3 } = useEditableContent(section, 'paragraph_3');
  const { content: callout } = useEditableContent(section, 'callout');

  const displayData = {
    paragraph1: p1 || defaultParagraph1,
    paragraph2: p2 || defaultParagraph2,
    paragraph3: p3 || defaultParagraph3,
    callout: callout || defaultCallout || '',
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
        { content_key: 'callout', content_value: formData.callout },
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

  const { ref, style } = useFadeInUp({ threshold: 0.15 });

  return (
    <>
      <div ref={ref} style={style} className="relative">
        {isAdmin && editMode && (
          <EditButton onClick={() => setIsModalOpen(true)} ariaLabel="Rediger" />
        )}

        <SectionHeading
          icon={BookOpen}
          gradient="from-slate-500 via-zinc-600 to-gray-700"
          title="Om tjenesten"
        />

        {displayData.callout && (
          <blockquote className="flex gap-3 items-start mb-6 pl-4 border-l-4 border-primary/40 bg-gradient-to-r from-primary/8 to-transparent rounded-r-lg py-4 pr-5">
            <Quote className="w-5 h-5 text-primary/50 shrink-0 mt-0.5" />
            <p className="text-base md:text-lg text-foreground/80 italic leading-relaxed">
              {displayData.callout}
            </p>
          </blockquote>
        )}

        <div className="space-y-4 text-sm md:text-base text-muted-foreground max-w-3xl">
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
              <Label>Fremhevet sitat / callout</Label>
              <Textarea
                value={formData.callout}
                onChange={(e) => setFormData({ ...formData, callout: e.target.value })}
                rows={2}
                maxLength={200}
                placeholder="Kort, sterk setning som fremheves visuelt (valgfri)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.callout.length}/200 tegn
              </p>
            </div>
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
