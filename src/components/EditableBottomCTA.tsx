import { useState } from 'react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useEditableContent } from '@/hooks/useEditableContent';
import { useContactInfo } from '@/hooks/useContactInfo';
import { BottomCTAEditModal } from './BottomCTAEditModal';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { EditButton } from './ui/EditButton';
export const EditableBottomCTA = () => {
  const {
    editMode,
    isAdmin
  } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { phone, phoneHref } = useContactInfo();
  const {
    content: heading
  } = useEditableContent('bottom-cta', 'heading');
  const {
    content: description
  } = useEditableContent('bottom-cta', 'description');
  const {
    content: button1
  } = useEditableContent('bottom-cta', 'button_1');
  const {
    content: button2
  } = useEditableContent('bottom-cta', 'button_2');
  const defaultData = {
    heading: heading || 'Klar til å komme i gang?',
    description: description || 'Få et uforpliktende tilbud på dine håndverksbehov i dag',
    button1: button1 || 'Få tilbud',
    button2: button2 || `Ring oss: ${phone}`
  };
  return <>
      <section className="relative py-20 bg-gradient-to-r from-primary/90 to-primary text-primary-foreground">
        {/* Edit icon - always visible in edit mode */}
        {isAdmin && editMode && <EditButton onClick={() => setIsModalOpen(true)} ariaLabel="Rediger" />}

        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
            {defaultData.heading}
          </h2>
          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto opacity-95">
            {defaultData.description}
          </p>
          <div className="flex flex-col items-center gap-6">
            {/* Top row: Get quote + Call us */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/tilbud">
                <Button variant="outline" size="lg" className="text-lg px-10 bg-success border-success text-success-foreground hover:bg-success/90">
                  {defaultData.button1}
                </Button>
              </Link>
              <Button variant="outline" size="lg" onClick={() => window.location.href = phoneHref} className="bg-background text-primary hover:bg-primary/10 hover:border-primary text-lg px-10 border-primary-foreground transition-colors">
                {defaultData.button2}
              </Button>
            </div>
            
            {/* Bottom: Fixed agreements as primary CTA */}
            <Link to="/fast-avtale">
              <Button variant="cta" size="lg" className="text-lg px-12 py-4 shadow-lg hover:shadow-xl transition-all font-semibold">
                Faste oppdrag – Bli prioritert kunde
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <BottomCTAEditModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} section="bottom-cta" currentData={defaultData} />
    </>;
};