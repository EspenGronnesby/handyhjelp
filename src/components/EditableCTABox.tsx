import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useEditableContent } from '@/hooks/useEditableContent';
import { CTABoxEditModal } from './CTABoxEditModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const EditableCTABox = () => {
  const { editMode, isAdmin } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { content: heading } = useEditableContent('cta-box-services', 'heading');
  const { content: description } = useEditableContent('cta-box-services', 'description');
  const { content: button1 } = useEditableContent('cta-box-services', 'button_1');
  const { content: button2 } = useEditableContent('cta-box-services', 'button_2');

  const defaultData = {
    heading: heading || 'Trenger du et pristilbud?',
    description: description || 'Kontakt oss for et skreddersydd pristilbud basert på dine behov.',
    button1: button1 || 'Få gratis tilbud',
    button2: button2 || 'Ring oss: +47 41250553'
  };

  return (
    <>
      <Card className="max-w-2xl mx-auto text-center shadow-xl border-primary/20 animate-fade-in relative">
        {/* Edit icon - always visible in edit mode */}
        {isAdmin && editMode && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg border-2 border-primary hover:scale-110 transition-transform"
          >
            <Pencil className="h-5 w-5 text-primary" />
          </button>
        )}

        <CardHeader>
          <CardTitle className="text-2xl">{defaultData.heading}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6 text-lg">
            {defaultData.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="cta" size="lg" onClick={() => window.location.href = '/tilbud'} className="text-lg px-8">
              {defaultData.button1}
            </Button>
            <Button variant="outline" size="lg" onClick={() => window.location.href = 'tel:+4741250553'} className="text-lg px-8">
              {defaultData.button2}
            </Button>
          </div>
        </CardContent>
      </Card>

      <CTABoxEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        section="cta-box-services"
        currentData={defaultData}
      />
    </>
  );
};
