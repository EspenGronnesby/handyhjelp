import { useState } from 'react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useEditableContent } from '@/hooks/useEditableContent';
import { HeroEditModal } from './HeroEditModal';
import { EditButton } from './ui/EditButton';

interface EditableHeroProps {
  section: string;
  defaultHeading: string;
  defaultSubtext: string;
  backgroundImage?: string;
  className?: string;
  children?: React.ReactNode;
  contentPosition?: 'center' | 'lower';
}

export const EditableHero = ({
  section,
  defaultHeading,
  defaultSubtext,
  backgroundImage,
  className = '',
  children,
  contentPosition = 'center'
}: EditableHeroProps) => {
  const { editMode, isAdmin } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { content: heading } = useEditableContent(section, 'heading');
  const { content: subtext } = useEditableContent(section, 'subtext');

  const displayHeading = heading || defaultHeading;
  const displaySubtext = subtext || defaultSubtext;

  return (
    <>
      <section className={`relative flex justify-center text-center ${contentPosition === 'lower' ? 'items-end pb-16' : 'items-center'} ${className}`}>
        {/* Edit icon - plassert nederst til høyre ved siden av bilde-knappen */}
        {isAdmin && editMode && (
          <EditButton
            onClick={() => setIsModalOpen(true)}
            ariaLabel="Rediger hero-tekst"
            className="bottom-4 right-20 top-auto z-30"
          />
        )}

        {backgroundImage && (
          <div 
            className="absolute inset-0 bg-cover bg-center -z-10"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          >
            <div className="absolute inset-0 bg-black/50"></div>
          </div>
        )}

        <div className="relative z-10">
          <h1 className={`text-4xl md:text-5xl font-heading font-bold mb-4 ${backgroundImage ? 'text-white drop-shadow-lg' : 'text-foreground'}`}>
            {displayHeading}
          </h1>
          <p className={`text-lg max-w-2xl mx-auto ${backgroundImage ? 'text-white/90 drop-shadow' : 'text-muted-foreground'}`}>
            {displaySubtext}
          </p>
          {children && <div className="mt-8 md:mt-14">{children}</div>}
        </div>
      </section>

      <HeroEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        section={section}
        currentData={{
          heading: displayHeading,
          subtext: displaySubtext
        }}
      />
    </>
  );
};
