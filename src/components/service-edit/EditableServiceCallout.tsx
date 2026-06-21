import { useState } from 'react';
import { Quote } from 'lucide-react';
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

interface EditableServiceCalloutProps {
  section: string;
  defaultCallout: string;
}

export const EditableServiceCallout = ({
  section,
  defaultCallout,
}: EditableServiceCalloutProps) => {
  const { editMode, isAdmin } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const { content: callout } = useEditableContent(section, 'callout');
  const displayCallout = callout || defaultCallout;

  const [formValue, setFormValue] = useState(displayCallout);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('site_content')
        .upsert({
          section,
          content_key: 'callout',
          content_value: formValue,
          content_type: 'text',
          updated_by: user.id
        }, { onConflict: 'section,content_key' });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['site-content', section] });
      toast.success('Lagret!');
      setIsModalOpen(false);
    } catch {
      toast.error('Kunne ikke lagre endringene');
    } finally {
      setIsSaving(false);
    }
  };

  if (!displayCallout) return null;

  return (
    <>
      <div className="relative">
        {isAdmin && editMode && (
          <EditButton onClick={() => setIsModalOpen(true)} ariaLabel="Rediger sitat" />
        )}

        <blockquote className="flex gap-4 items-start pl-5 border-l-4 border-primary/40 bg-gradient-to-r from-primary/8 to-transparent rounded-r-xl py-5 pr-6">
          <Quote className="w-6 h-6 text-primary/40 shrink-0 mt-0.5" />
          <p className="text-lg md:text-xl text-foreground/80 italic leading-relaxed font-medium">
            {displayCallout}
          </p>
        </blockquote>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rediger fremhevet sitat</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Sitattext</Label>
            <Textarea
              value={formValue}
              onChange={(e) => setFormValue(e.target.value)}
              rows={3}
              maxLength={200}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">{formValue.length}/200 tegn</p>
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
