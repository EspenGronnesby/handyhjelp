import { useState } from 'react';
import { EyeOff, ShieldCheck, Zap, Heart, Sparkles, Star, type LucideIcon } from 'lucide-react';
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
import { useStaggeredGridReveal } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';

interface EditableServiceBenefitsProps {
  section: string;
  defaultBenefits: string[];
}

// Stable per-slot visual identity for the four benefit tiles.
const slotVisuals: { icon: LucideIcon; gradient: string }[] = [
  { icon: ShieldCheck, gradient: "from-cyan-500 via-blue-500 to-indigo-600" },
  { icon: Zap, gradient: "from-amber-500 via-orange-500 to-rose-600" },
  { icon: Heart, gradient: "from-emerald-500 via-teal-500 to-cyan-600" },
  { icon: Sparkles, gradient: "from-fuchsia-500 via-purple-500 to-indigo-600" },
];

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

  const allBenefits = [
    getDisplayValue(benefit1, benefit1Edited, defaultBenefits[0] || ''),
    getDisplayValue(benefit2, benefit2Edited, defaultBenefits[1] || ''),
    getDisplayValue(benefit3, benefit3Edited, defaultBenefits[2] || ''),
    getDisplayValue(benefit4, benefit4Edited, defaultBenefits[3] || ''),
  ];

  const displayBenefits = isAdmin && editMode
    ? allBenefits
    : allBenefits.filter(benefit => !isStringEmpty(benefit));

  const [formData, setFormData] = useState({
    benefits: allBenefits.some(b => b.trim() !== '') ? allBenefits : defaultBenefits
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

  const { ref, getItemStyle } = useStaggeredGridReveal(displayBenefits.length, 4, { threshold: 0.15 });

  const visibleCount = displayBenefits.filter(b => !isStringEmpty(b)).length;
  if (visibleCount === 0 && !(isAdmin && editMode)) {
    return null;
  }

  return (
    <>
      <div className="relative">
        {isAdmin && editMode && (
          <EditButton onClick={() => setIsModalOpen(true)} ariaLabel="Rediger" />
        )}

        <SectionHeading
          icon={Star}
          gradient="from-amber-500 via-orange-500 to-rose-600"
          title="Hvorfor velge oss?"
        />

        <div
          ref={ref}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5"
        >
          {displayBenefits.map((benefit, idx) => {
            const isHidden = isStringEmpty(benefit);
            if (isHidden && !(isAdmin && editMode)) {
              return null;
            }
            const visual = slotVisuals[idx % slotVisuals.length];
            const Icon = visual.icon;

            return (
              <div
                key={idx}
                style={getItemStyle(idx)}
                className={cn(
                  "flex flex-col items-center text-center gap-3 p-5 rounded-xl",
                  "glass-surface card-hover-lift",
                  isHidden && isAdmin && editMode ? "opacity-50" : ""
                )}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg",
                    visual.gradient
                  )}
                >
                  <Icon className="w-6 h-6 text-white drop-shadow" strokeWidth={2} />
                </div>
                {isHidden && isAdmin && editMode ? (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <EyeOff className="h-3 w-3" />
                    <span>Skjult</span>
                  </div>
                ) : (
                  <span className="text-sm md:text-base text-foreground font-medium leading-snug">
                    {benefit || 'Tom fordel'}
                  </span>
                )}
              </div>
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
