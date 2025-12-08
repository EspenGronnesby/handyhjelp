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

interface EditableServiceBenefitsProps {
  section: string;
  defaultBenefits: string[];
}

export const EditableServiceBenefits = ({
  section,
  defaultBenefits,
}: EditableServiceBenefitsProps) => {
  const { editMode, isAdmin } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const { content: benefit1 } = useEditableContent(section, 'benefit_1');
  const { content: benefit2 } = useEditableContent(section, 'benefit_2');
  const { content: benefit3 } = useEditableContent(section, 'benefit_3');
  const { content: benefit4 } = useEditableContent(section, 'benefit_4');

  const displayBenefits = [
    benefit1 || defaultBenefits[0] || '',
    benefit2 || defaultBenefits[1] || '',
    benefit3 || defaultBenefits[2] || '',
    benefit4 || defaultBenefits[3] || '',
  ].filter(benefit => benefit.trim() !== '');

  const [formData, setFormData] = useState({
    benefits: displayBenefits.length > 0 ? displayBenefits : defaultBenefits
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updates = formData.benefits.map((benefit, index) => ({
        content_key: `benefit_${index + 1}`,
        content_value: benefit
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
        
        <h2 className="text-3xl font-heading font-bold mb-6">Hvorfor velge oss?</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {displayBenefits.map((benefit, idx) => (
            <Card key={idx}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-success shrink-0 mt-0.5" />
                  <span className="text-lg">{benefit}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rediger "Hvorfor velge oss?"</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {formData.benefits.map((benefit, index) => (
              <div key={index}>
                <Label>Fordel {index + 1}</Label>
                <Input
                  value={benefit}
                  onChange={(e) => {
                    const newBenefits = [...formData.benefits];
                    newBenefits[index] = e.target.value;
                    setFormData({ benefits: newBenefits });
                  }}
                  maxLength={150}
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
