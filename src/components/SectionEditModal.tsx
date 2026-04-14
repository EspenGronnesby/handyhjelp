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

export interface EditField {
  section: string;
  contentKey: string;
  label: string;
  value: string;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  rows?: number;
}

interface SectionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: EditField[];
}

/**
 * Gjenbrukbar modal for redigering av flere felt som alle lagres til site_content.
 * Hvert felt spesifiserer sin egen section + content_key.
 * Invaliderer cache for alle berørte seksjoner etter lagring.
 */
export const SectionEditModal = ({
  isOpen,
  onClose,
  title,
  fields,
}: SectionEditModalProps) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Re-seed verdier kun når modalen åpnes. `fields` er ofte et inline array
  // fra parent, så vi depender ikke på det her — ville ellers clobbert
  // bruker-input mid-edit ved parent re-render.
  useEffect(() => {
    if (!isOpen) return;
    const initial: Record<string, string> = {};
    fields.forEach((f) => {
      initial[`${f.section}::${f.contentKey}`] = f.value;
    });
    setValues(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updates = fields.map((f) => ({
        section: f.section,
        content_key: f.contentKey,
        content_value: values[`${f.section}::${f.contentKey}`] ?? '',
        content_type: 'text',
        updated_by: user.id,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('site_content')
          .upsert(update, { onConflict: 'section,content_key' });
        if (error) throw error;
      }

      const uniqueSections = Array.from(new Set(fields.map((f) => f.section)));
      uniqueSections.forEach((section) => {
        queryClient.invalidateQueries({ queryKey: ['site-content', section] });
      });

      toast({ title: '✅ Lagret', description: 'Endringen er lagret' });
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      toast({ title: '❌ Feil ved lagring', description: 'Prøv igjen', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {fields.map((field) => {
            const key = `${field.section}::${field.contentKey}`;
            const id = `field-${key}`;
            const val = values[key] ?? '';
            return (
              <div key={key} className="space-y-2">
                <Label htmlFor={id}>{field.label}</Label>
                {field.multiline ? (
                  <Textarea
                    id={id}
                    value={val}
                    onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                    maxLength={field.maxLength ?? 500}
                    rows={field.rows ?? 3}
                    placeholder={field.placeholder}
                  />
                ) : (
                  <Input
                    id={id}
                    value={val}
                    onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                    maxLength={field.maxLength ?? 100}
                    placeholder={field.placeholder}
                  />
                )}
                {field.maxLength && (
                  <div className="text-sm text-muted-foreground text-right">
                    {val.length} / {field.maxLength} tegn
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Avbryt
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
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
