import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useEditableContent } from '@/hooks/useEditableContent';
import { AboutContentEditModal } from './AboutContentEditModal';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const EditableAboutContent = () => {
  const { editMode, isAdmin } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { content: heading } = useEditableContent('about-main', 'heading');
  const { content: description } = useEditableContent('about-main', 'description');
  const { content: button1 } = useEditableContent('about-main', 'button_1');
  const { content: button2 } = useEditableContent('about-main', 'button_2');

  const defaultData = {
    heading: heading || 'Din pålitelige partner i 20+ år',
    description: description || 'Fra små reparasjoner til store vedlikeholdsprosjekter - HandyHjelp har vært Kristiansands foretrukne valg for eiendomspleie siden 2004.',
    button1: button1 || 'Møt teamet',
    button2: button2 || 'Få tilbud'
  };

  const handleScrollToTeam = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById('team')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <div className="text-center max-w-3xl mx-auto mb-20 relative">
        {isAdmin && editMode && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute top-0 right-0 z-10 bg-background rounded-full p-2 shadow-lg border-2 border-primary hover:scale-110 transition-transform"
          >
            <Pencil className="h-5 w-5 text-primary" />
          </button>
        )}

        <h2 className="text-4xl font-bold mb-6 text-foreground">
          {defaultData.heading}
        </h2>
        <p className="text-xl text-muted-foreground mb-8">
          {defaultData.description}
        </p>
        <div className="flex gap-4 justify-center">
          <a href="#team" onClick={handleScrollToTeam}>
            <Button variant="cta" size="lg">{defaultData.button1}</Button>
          </a>
          <Link to="/#quote-form">
            <Button variant="cta-outline" size="lg">{defaultData.button2}</Button>
          </Link>
        </div>
      </div>

      <AboutContentEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        section="about-main"
        currentData={defaultData}
      />
    </>
  );
};
