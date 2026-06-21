import { useState } from 'react';
import { Users } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useEditableContent } from '@/hooks/useEditableContent';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { EditButton } from '@/components/ui/EditButton';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useFadeInUp } from '@/hooks/useScrollAnimation';

interface EditableServiceTargetProps {
  section: string;
  defaultTarget: string;
  defaultDescription: string;
}

export const EditableServiceTarget = ({
  section,
  defaultTarget,
  defaultDescription,
}: EditableServiceTargetProps) => {
  const { editMode, isAdmin } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const { content: target } = useEditableContent(section, 'target_audience');
  const { content: description } = useEditableContent(section, 'target_description');

  const displayData = {
    target: target || defaultTarget,
    description: description || defaultDescription,
  };

  const [formData, setFormData] = useState(displayData);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updates = [
        { content_key: 'target_audience', content_value: formData.target },
        { content_key: 'target_description', content_value: formData.description },
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

  const audienceTags = displayData.target
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);

  const { ref, style } = useFadeInUp({ threshold: 0.15 });

  return (
    <>
      <div ref={ref} style={style} className="relative">
        {isAdmin && editMode && (
          <EditButton onClick={() => setIsModalOpen(true)} ariaLabel="Rediger" />
        )}

        <SectionHeading
          icon={Users}
          gradient="from-cyan-500 via-blue-500 to-indigo-600"
          title="Hvem er dette for?"
        />

        <div className="flex flex-wrap gap-2 mb-5">
          {audienceTags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20"
            >
              {tag}
            </span>
          ))}
        </div>

        <p className="text-sm md:text-base text-muted-foreground max-w-3xl">
          {displayData.description}
        </p>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rediger "Hvem er dette for?"</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Målgruppe</Label>
              <Input
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Kommaseparert — f.eks. «Privatpersoner, Bedrifter, Boligselskaper». Hvert punkt vises som en badge.
              </p>
            </div>
            <div>
              <Label>Beskrivelse</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.description.length}/500 tegn
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
