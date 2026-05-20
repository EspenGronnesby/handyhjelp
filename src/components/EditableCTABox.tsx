import { useState } from 'react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useEditableContent } from '@/hooks/useEditableContent';
import { useContactInfo } from '@/hooks/useContactInfo';
import { CTABoxEditModal } from './CTABoxEditModal';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { EditButton } from './ui/EditButton';
import { ArrowRight, Phone } from 'lucide-react';

// Kompakt CTA-boks plassert i Services-hero. Beholder visuell signatur fra
// EditableBottomCTA (mørk gradient + gradient-stripe på topp) men er strippet
// til kun overskrift + to knapper — ikke en full bunn-CTA-presentasjon.
export const EditableCTABox = () => {
  const { editMode, isAdmin } = useEditMode();
  const { phone, phoneHref } = useContactInfo();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { content: heading } = useEditableContent('cta-box-services', 'heading');
  const { content: description } = useEditableContent('cta-box-services', 'description');
  const { content: button1 } = useEditableContent('cta-box-services', 'button_1');
  const { content: button2 } = useEditableContent('cta-box-services', 'button_2');

  // description beholdes i useEditableContent for backwards compat med modal,
  // men vises ikke i UI lenger — strippet ned til overskrift + knapper.
  const defaultData = {
    heading: heading || 'Trenger du et pristilbud?',
    description: description || 'Kontakt oss for et skreddersydd pristilbud basert på dine behov.',
    button1: button1 || 'Få gratis tilbud',
    button2: button2 || `Ring oss: ${phone}`,
  };

  return (
    <>
      <div className="relative max-w-2xl mx-auto overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg">
        {/* Tynn gradient-stripe på toppen — visuell signatur som matcher BottomCTA */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 pointer-events-none"
          aria-hidden="true"
        />

        {isAdmin && editMode && (
          <EditButton onClick={() => setIsModalOpen(true)} ariaLabel="Rediger" />
        )}

        <div className="relative p-4 md:p-6 text-center">
          <h3 className="text-xl md:text-2xl font-heading font-bold text-white mb-4">
            {defaultData.heading}
          </h3>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link to="/tilbud" className="w-full sm:w-auto">
              <Button
                variant="cta"
                size="lg"
                className="w-full sm:w-auto text-base px-6 font-semibold group/btn"
              >
                {defaultData.button1}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </Button>
            </Link>
            <a href={phoneHref} className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-base px-6 bg-white/10 text-white border-white/30 hover:bg-white/20 hover:border-white/50 backdrop-blur-sm"
              >
                <Phone className="mr-2 h-4 w-4" />
                {defaultData.button2}
              </Button>
            </a>
          </div>
        </div>
      </div>

      <CTABoxEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        section="cta-box-services"
        currentData={defaultData}
      />
    </>
  );
};
