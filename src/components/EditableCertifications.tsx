import { useState } from 'react';
import { Award, Shield, AlertCircle, ShieldCheck } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useEditableContent } from '@/hooks/useEditableContent';
import { CertificationsEditModal } from './CertificationsEditModal';
import { Card, CardContent } from '@/components/ui/card';
import { EditButton } from './ui/EditButton';
import { SectionHeading } from './ui/SectionHeading';

export const EditableCertifications = () => {
  const { editMode, isAdmin } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { content: heading } = useEditableContent('about-certifications', 'heading');
  const { content: card1Title } = useEditableContent('about-certifications', 'card1_title');
  const { content: card1Item1 } = useEditableContent('about-certifications', 'card1_item1');
  const { content: card1Item2 } = useEditableContent('about-certifications', 'card1_item2');
  const { content: card1Item3 } = useEditableContent('about-certifications', 'card1_item3');
  const { content: card1Item4 } = useEditableContent('about-certifications', 'card1_item4');
  const { content: card2Title } = useEditableContent('about-certifications', 'card2_title');
  const { content: card2Item1 } = useEditableContent('about-certifications', 'card2_item1');
  const { content: card2Item2 } = useEditableContent('about-certifications', 'card2_item2');
  const { content: card2Item3 } = useEditableContent('about-certifications', 'card2_item3');
  const { content: card2Item4 } = useEditableContent('about-certifications', 'card2_item4');

  // Filter out empty items
  const card1Items = [card1Item1, card1Item2, card1Item3, card1Item4]
    .filter(item => item && item.trim() !== '');
  const card2Items = [card2Item1, card2Item2, card2Item3, card2Item4]
    .filter(item => item && item.trim() !== '');

  // Check if cards have content
  const card1HasContent = (card1Title && card1Title.trim() !== '') || card1Items.length > 0;
  const card2HasContent = (card2Title && card2Title.trim() !== '') || card2Items.length > 0;

  // Check if entire section should be hidden
  const sectionHasContent = card1HasContent || card2HasContent;
  const isEditModeActive = isAdmin && editMode;

  // Count visible cards for dynamic grid
  const visibleCardCount = [
    card1HasContent || isEditModeActive,
    card2HasContent || isEditModeActive
  ].filter(Boolean).length;

  // Dynamic grid class based on visible cards
  const gridClass = visibleCardCount === 1 
    ? 'flex justify-center' 
    : 'grid md:grid-cols-2 gap-8';

  // Hide entire section if no content and not in edit mode
  if (!sectionHasContent && !isEditModeActive) {
    return null;
  }

  const displayHeading = heading || 'Sertifiseringer & Kvalifikasjoner';

  // For the modal, we need to pass the current data structure
  const defaultData = {
    heading: displayHeading,
    card1: {
      title: card1Title || '',
      items: [
        card1Item1 || '',
        card1Item2 || '',
        card1Item3 || '',
        card1Item4 || ''
      ]
    },
    card2: {
      title: card2Title || '',
      items: [
        card2Item1 || '',
        card2Item2 || '',
        card2Item3 || '',
        card2Item4 || ''
      ]
    }
  };

  return (
    <>
      <div className="mb-20 relative">
        {isEditModeActive && (
          <EditButton onClick={() => setIsModalOpen(true)} ariaLabel="Rediger" />
        )}

        <div className="max-w-4xl mx-auto mb-10 md:mb-12">
          <SectionHeading
            icon={ShieldCheck}
            gradient="from-emerald-500 via-teal-500 to-cyan-600"
            title={displayHeading}
          />
        </div>
        
        <div className={`${gridClass} max-w-4xl mx-auto`}>
          {/* Card 1 - Show if has content OR in edit mode */}
          {(card1HasContent || isEditModeActive) && (
            <div className={`glass-card p-6 ${!card1HasContent ? 'opacity-50 !border-dashed' : ''} ${visibleCardCount === 1 ? 'max-w-md w-full' : ''}`}>
              {!card1HasContent && isEditModeActive && (
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Tom - skjult for besøkende</span>
                </div>
              )}
              <Award className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">
                {card1Title || (isEditModeActive ? 'Legg til tittel...' : '')}
              </h3>
              {card1Items.length > 0 ? (
                <ul className="space-y-2 text-muted-foreground">
                  {card1Items.map((item, index) => (
                    <li key={index}>✓ {item}</li>
                  ))}
                </ul>
              ) : isEditModeActive ? (
                <p className="text-muted-foreground text-sm italic">Ingen punkter lagt til</p>
              ) : null}
            </div>
          )}

          {/* Card 2 - Show if has content OR in edit mode */}
          {(card2HasContent || isEditModeActive) && (
            <div className={`glass-card p-6 ${!card2HasContent ? 'opacity-50 !border-dashed' : ''} ${visibleCardCount === 1 ? 'max-w-md w-full' : ''}`}>
              {!card2HasContent && isEditModeActive && (
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Tom - skjult for besøkende</span>
                </div>
              )}
              <Shield className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">
                {card2Title || (isEditModeActive ? 'Legg til tittel...' : '')}
              </h3>
              {card2Items.length > 0 ? (
                <ul className="space-y-2 text-muted-foreground">
                  {card2Items.map((item, index) => (
                    <li key={index}>✓ {item}</li>
                  ))}
                </ul>
              ) : isEditModeActive ? (
                <p className="text-muted-foreground text-sm italic">Ingen punkter lagt til</p>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <CertificationsEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        section="about-certifications"
        currentData={defaultData}
      />
    </>
  );
};
