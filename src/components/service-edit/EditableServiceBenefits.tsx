import { useState } from 'react';
import { CheckCircle2, EyeOff } from 'lucide-react';
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
import { isStringEmpty, getDisplayValue } from '@/lib/gridUtils';
import { EditButton } from '@/components/ui/EditButton';

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

  const { content: benefit1, hasBeenEdited: benefit1Edited } = useEditableContent(section, 'benefit_1');
  const { content: benefit2, hasBeenEdited: benefit2Edited } = useEditableContent(section, 'benefit_2');
  const { content: benefit3, hasBeenEdited: benefit3Edited } = useEditableContent(section, 'benefit_3');
  const { content: benefit4, hasBeenEdited: benefit4Edited } = useEditableContent(section, 'benefit_4');

  // Use DB value if edited (even if empty), otherwise use default
  const allBenefits = [
    getDisplayValue(benefit1, benefit1Edited, defaultBenefits[0] || ''),
    getDisplayValue(benefit2, benefit2Edited, defaultBenefits[1] || ''),
    getDisplayValue(benefit3, benefit3Edited, defaultBenefits[2] || ''),
    getDisplayValue(benefit4, benefit4Edited, defaultBenefits[3] || ''),
  ];

  // Filter visible benefits (non-empty)
  const visibleBenefits = allBenefits.filter((benefit, index) => 
    isAdmin && editMode ? true : !isStringEmpty(benefit)
  );

  // For display - filter truly visible (non-empty) benefits for non-admin
  const displayBenefits = isAdmin && editMode 
    ? allBenefits 
    : allBenefits.filter(benefit => !isStringEmpty(benefit));

  const [formData, setFormData] = useState({
    benefits: allBenefits.some(b => b.trim() !== '') ? allBenefits : defaultBenefits
  });

  // Dynamic grid class based on visible count
  const getGridClass = () => {
    const count = displayBenefits.filter(b => !isStringEmpty(b)).length;
    if (count === 1) return 'flex justify-center';
    if (count === 2) return 'flex flex-wrap justify-center gap-6';
    if (count === 3) return 'flex flex-wrap justify-center gap-6';
    return 'flex flex-wrap justify-center gap-6';
  };

  // Dynamic card width class
  const getCardWidthClass = () => {
    const count = displayBenefits.filter(b => !isStringEmpty(b)).length;
    if (count === 1) return 'w-full max-w-md';
    if (count === 2) return 'w-full md:w-[calc(50%-0.75rem)] max-w-md';
    return 'w-full md:w-[calc(50%-0.75rem)] max-w-md';
  };

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

  // Don't render section if no visible benefits
  const visibleCount = displayBenefits.filter(b => !isStringEmpty(b)).length;
  if (visibleCount === 0 && !(isAdmin && editMode)) {
    return null;
  }

  return (
    <>
      <div className="mb-12 relative">
        {isAdmin && editMode && (
          <EditButton onClick={() => setIsModalOpen(true)} ariaLabel="Rediger" />
        )}
        
        <h2 className="text-3xl font-heading font-bold mb-6">Hvorfor velge oss?</h2>
        <div className={getGridClass()}>
          {displayBenefits.map((benefit, idx) => {
            const isHidden = isStringEmpty(benefit);
            
            // Skip rendering empty benefits for non-admin
            if (isHidden && !(isAdmin && editMode)) {
              return null;
            }
            
            return (
              <Card 
                key={idx} 
                className={`subtle-hover ${getCardWidthClass()} ${
                  isHidden && isAdmin && editMode ? 'opacity-50 border-dashed border-muted-foreground' : ''
                }`}
              >
                <CardContent className="pt-6 relative">
                  {/* Hidden indicator for admin */}
                  {isHidden && isAdmin && editMode && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <EyeOff className="h-3 w-3" />
                      <span>Skjult</span>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-success shrink-0 mt-0.5" />
                    <span className="text-lg">{benefit || 'Tom fordel'}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
