import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useEditableContent } from '@/hooks/useEditableContent';
import { HeroEditModal } from './HeroEditModal';

interface EditableHeroProps {
  section: string;
  defaultHeading: string;
  defaultSubtext: string;
  backgroundImage?: string;
  className?: string;
}

export const EditableHero = ({
  section,
  defaultHeading,
  defaultSubtext,
  backgroundImage,
  className = ''
}: EditableHeroProps) => {
  const { editMode, isAdmin } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { content: heading } = useEditableContent(section, 'heading');
  const { content: subtext } = useEditableContent(section, 'subtext');

  const displayHeading = heading || defaultHeading;
  const displaySubtext = subtext || defaultSubtext;

  return (
    <>
      <section className={`relative flex items-center justify-center text-center ${className}`}>
        {/* Edit icon - always visible in edit mode */}
        {isAdmin && editMode && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg border-2 border-primary hover:scale-110 transition-transform"
          >
            <Pencil className="h-5 w-5 text-primary" />
          </button>
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
          <h1 className={`text-4xl md:text-5xl font-heading font-bold mb-4 ${backgroundImage ? 'text-white' : ''}`}>
            {displayHeading}
          </h1>
          <p className={`text-lg max-w-2xl mx-auto ${backgroundImage ? 'text-white/90' : 'text-muted-foreground'}`}>
            {displaySubtext}
          </p>
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
