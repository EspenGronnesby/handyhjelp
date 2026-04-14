import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { MotionButton } from '@/components/motion';
import { useEditMode } from '@/contexts/EditModeContext';
import { useEditableContent } from '@/hooks/useEditableContent';
import { EditButton } from '@/components/ui/EditButton';
import { SectionEditModal } from '@/components/SectionEditModal';

export const StickyMobileCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { editMode, isAdmin } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { content: buttonTextRaw } = useEditableContent('sticky-mobile-cta', 'button_text');
  const buttonText = buttonTextRaw || 'Få gratis tilbud';

  useEffect(() => {
    const handleScroll = () => {
      const shouldShow = window.scrollY > 400;
      setIsVisible(shouldShow);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40 px-4 py-3 bg-background/80 backdrop-blur-sm border-t border-border/50 md:hidden transition-all duration-500 overflow-hidden",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
        style={{ width: '100%', maxWidth: '100vw' }}
      >
        <div className="relative">
          {isAdmin && editMode && isVisible && (
            <EditButton
              onClick={() => setIsModalOpen(true)}
              ariaLabel="Rediger sticky mobil-CTA"
              className="-top-14 right-0"
            />
          )}
          <Link to="/tilbud" className="block w-full">
            <MotionButton
              size="lg"
              className="w-full bg-success hover:bg-success-hover text-success-foreground font-semibold text-lg py-6"
            >
              {buttonText}
            </MotionButton>
          </Link>
        </div>
      </div>

      <SectionEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Rediger sticky mobil-CTA"
        fields={[
          { section: 'sticky-mobile-cta', contentKey: 'button_text', label: 'Knapp-tekst', value: buttonText, maxLength: 40, placeholder: 'Få gratis tilbud' },
        ]}
      />
    </>
  );
};
