import { useState } from 'react';
import { EyeOff, Workflow } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useEditMode } from '@/contexts/EditModeContext';
import { useEditableContent } from '@/hooks/useEditableContent';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { EditButton } from '@/components/ui/EditButton';

interface HowWeWorkStep {
  title: string;
  description: string;
  defaultTitle: string;
  defaultDesc: string;
}

export const EditableHowWeWork = () => {
  const { editMode, isAdmin } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const { content: heading } = useEditableContent('how-we-work-contact', 'heading');
  const { content: step1Title } = useEditableContent('how-we-work-contact', 'step_1_title');
  const { content: step1Desc } = useEditableContent('how-we-work-contact', 'step_1_desc');
  const { content: step2Title } = useEditableContent('how-we-work-contact', 'step_2_title');
  const { content: step2Desc } = useEditableContent('how-we-work-contact', 'step_2_desc');
  const { content: step3Title } = useEditableContent('how-we-work-contact', 'step_3_title');
  const { content: step3Desc } = useEditableContent('how-we-work-contact', 'step_3_desc');
  const { content: step4Title } = useEditableContent('how-we-work-contact', 'step_4_title');
  const { content: step4Desc } = useEditableContent('how-we-work-contact', 'step_4_desc');
  const { content: step5Title } = useEditableContent('how-we-work-contact', 'step_5_title');
  const { content: step5Desc } = useEditableContent('how-we-work-contact', 'step_5_desc');

  const steps: HowWeWorkStep[] = [
    { title: step1Title || '', description: step1Desc || '', defaultTitle: 'Ta kontakt', defaultDesc: 'Ring eller send e-post med din forespørsel' },
    { title: step2Title || '', description: step2Desc || '', defaultTitle: 'Vi svarer raskt', defaultDesc: 'Vi kommer tilbake til deg innen 1-3 virkedager' },
    { title: step3Title || '', description: step3Desc || '', defaultTitle: 'Befaring', defaultDesc: 'Vi avtaler befaring og lager tilbud' },
    { title: step4Title || '', description: step4Desc || '', defaultTitle: 'Utførelse', defaultDesc: 'Vi utfører jobben profesjonelt og effektivt' },
    { title: step5Title || '', description: step5Desc || '', defaultTitle: 'Kvalitetskontroll', defaultDesc: 'Vi sikrer at alt er gjort etter dine ønsker' },
  ];

  // Sjekk om et steg er skjult (både tittel og beskrivelse er tomme strenger)
  const isStepHidden = (step: HowWeWorkStep) => {
    return step.title?.trim() === '' && step.description?.trim() === '';
  };

  // Filtrer ut skjulte steps når ikke i edit mode
  const visibleSteps = isAdmin && editMode 
    ? steps 
    : steps.filter(step => !isStepHidden(step));

  const defaultData = {
    heading: heading || 'Hvordan vi jobber',
    steps: steps.map(s => ({
      title: s.title?.trim() || s.defaultTitle,
      description: s.description?.trim() || s.defaultDesc
    })),
  };

  const [formData, setFormData] = useState(defaultData);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updates = [
        { content_key: 'heading', content_value: formData.heading },
        { content_key: 'step_1_title', content_value: formData.steps[0].title },
        { content_key: 'step_1_desc', content_value: formData.steps[0].description },
        { content_key: 'step_2_title', content_value: formData.steps[1].title },
        { content_key: 'step_2_desc', content_value: formData.steps[1].description },
        { content_key: 'step_3_title', content_value: formData.steps[2].title },
        { content_key: 'step_3_desc', content_value: formData.steps[2].description },
        { content_key: 'step_4_title', content_value: formData.steps[3].title },
        { content_key: 'step_4_desc', content_value: formData.steps[3].description },
        { content_key: 'step_5_title', content_value: formData.steps[4].title },
        { content_key: 'step_5_desc', content_value: formData.steps[4].description },
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('site_content')
          .upsert({
            section: 'how-we-work-contact',
            content_key: update.content_key,
            content_value: update.content_value,
            content_type: 'text',
            updated_by: user.id
          }, {
            onConflict: 'section,content_key'
          });
        
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['site-content', 'how-we-work-contact'] });
      toast.success('Lagret!');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Kunne ikke lagre endringene');
    } finally {
      setIsSaving(false);
    }
  };

  // Hvis alle steps er skjult og ikke i edit mode, skjul hele seksjonen
  if (visibleSteps.length === 0 && (!isAdmin || !editMode)) {
    return null;
  }

  return (
    <>
      <div className="relative">
        {isAdmin && editMode && (
          <EditButton onClick={() => setIsModalOpen(true)} ariaLabel="Rediger" />
        )}

        <SectionHeading
          icon={Workflow}
          gradient="from-amber-500 via-orange-500 to-rose-600"
          title={defaultData.heading}
        />
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isHidden = isStepHidden(step);
            
            // I edit mode: vis alle, men marker skjulte
            if (!isAdmin || !editMode) {
              if (isHidden) return null;
            }

            const displayTitle = step.title?.trim() || step.defaultTitle;
            const displayDesc = step.description?.trim() || step.defaultDesc;

            // Beregn riktig nummer basert på synlige steg
            const visibleIndex = visibleSteps.findIndex(s => 
              (s.title?.trim() || s.defaultTitle) === displayTitle
            );
            const stepNumber = isAdmin && editMode ? index + 1 : visibleIndex + 1;

            return (
              <div 
                key={index} 
                className={`flex gap-3 relative ${
                  isHidden && isAdmin && editMode ? 'opacity-50' : ''
                }`}
              >
                {isHidden && isAdmin && editMode && (
                  <div className="absolute -top-2 right-0 flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded z-10">
                    <EyeOff className="h-3 w-3" />
                    <span>Skjult</span>
                  </div>
                )}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  {stepNumber}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{displayTitle}</h3>
                  <p className="text-sm text-muted-foreground">{displayDesc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rediger "Hvordan vi jobber"</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <Label htmlFor="heading">Overskrift</Label>
              <Input
                id="heading"
                value={formData.heading}
                onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                maxLength={100}
              />
            </div>

            {formData.steps.map((step, index) => (
              <div key={index} className="border-t pt-4">
                <h3 className="font-semibold mb-3">Steg {index + 1}</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor={`step-${index}-title`}>Tittel</Label>
                    <Input
                      id={`step-${index}-title`}
                      value={step.title}
                      onChange={(e) => {
                        const newSteps = [...formData.steps];
                        newSteps[index].title = e.target.value;
                        setFormData({ ...formData, steps: newSteps });
                      }}
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`step-${index}-desc`}>Beskrivelse</Label>
                    <Textarea
                      id={`step-${index}-desc`}
                      value={step.description}
                      onChange={(e) => {
                        const newSteps = [...formData.steps];
                        newSteps[index].description = e.target.value;
                        setFormData({ ...formData, steps: newSteps });
                      }}
                      rows={2}
                      maxLength={200}
                    />
                  </div>
                </div>
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
