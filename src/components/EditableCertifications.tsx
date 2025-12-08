import { useState } from 'react';
import { Pencil, Award, Shield } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useEditableContent } from '@/hooks/useEditableContent';
import { CertificationsEditModal } from './CertificationsEditModal';
import { Card, CardContent } from '@/components/ui/card';

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

  const defaultData = {
    heading: heading || 'Sertifiseringer & Kvalifikasjoner',
    card1: {
      title: card1Title || 'Offisielle godkjenninger',
      items: [
        card1Item1 || 'Godkjent av Direktoratet for byggkvalitet (DiBK)',
        card1Item2 || 'Sertifisert elektriker med autorisasjon',
        card1Item3 || 'VVS-autorisasjon for sanitær og varme',
        card1Item4 || 'Miljøsertifisert for håndtering av avfall'
      ]
    },
    card2: {
      title: card2Title || 'Forsikring & Garantier',
      items: [
        card2Item1 || 'Fullverdig yrkesskadeforsikring',
        card2Item2 || 'Ansvarsforsikring opp til 10 mill. kr',
        card2Item3 || '5 års garanti på håndverksarbeid',
        card2Item4 || '2 års garanti på materialer og utstyr'
      ]
    }
  };

  return (
    <>
      <div className="mb-20 relative">
        {isAdmin && editMode && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute top-0 right-4 z-10 bg-background rounded-full p-2 shadow-lg border-2 border-primary hover:scale-110 transition-transform"
          >
            <Pencil className="h-5 w-5 text-primary" />
          </button>
        )}

        <h2 className="text-3xl font-bold text-center mb-12">{defaultData.heading}</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <Award className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">{defaultData.card1.title}</h3>
              <ul className="space-y-2 text-muted-foreground">
                {defaultData.card1.items.map((item, index) => (
                  <li key={index}>✓ {item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Shield className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">{defaultData.card2.title}</h3>
              <ul className="space-y-2 text-muted-foreground">
                {defaultData.card2.items.map((item, index) => (
                  <li key={index}>✓ {item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
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
