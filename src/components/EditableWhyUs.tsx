import { useState } from 'react';
import { Pencil, Clock, Shield, Award, Users, CheckCircle2, Star } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useEditableContent } from '@/hooks/useEditableContent';
import { WhyUsEditModal } from './WhyUsEditModal';
import { Card, CardContent } from '@/components/ui/card';

const iconMap = {
  Clock, Shield, Award, Users, CheckCircle2, Star
};

export const EditableWhyUs = () => {
  const { editMode, isAdmin } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { content: heading } = useEditableContent('about-why-us', 'heading');
  const { content: title1 } = useEditableContent('about-why-us', 'title_1');
  const { content: desc1 } = useEditableContent('about-why-us', 'desc_1');
  const { content: title2 } = useEditableContent('about-why-us', 'title_2');
  const { content: desc2 } = useEditableContent('about-why-us', 'desc_2');
  const { content: title3 } = useEditableContent('about-why-us', 'title_3');
  const { content: desc3 } = useEditableContent('about-why-us', 'desc_3');
  const { content: title4 } = useEditableContent('about-why-us', 'title_4');
  const { content: desc4 } = useEditableContent('about-why-us', 'desc_4');
  const { content: title5 } = useEditableContent('about-why-us', 'title_5');
  const { content: desc5 } = useEditableContent('about-why-us', 'desc_5');
  const { content: title6 } = useEditableContent('about-why-us', 'title_6');
  const { content: desc6 } = useEditableContent('about-why-us', 'desc_6');

  const items = [
    { icon: 'Clock', title: title1 || '20+ års erfaring', description: desc1 || 'To tiår med profesjonell eiendomspleie i Kristiansand-regionen' },
    { icon: 'Shield', title: title2 || 'Fullt forsikret', description: desc2 || 'Omfattende forsikringsdekning for alle typer oppdrag' },
    { icon: 'Award', title: title3 || 'Sertifisert kvalitet', description: desc3 || 'Godkjent av Direktoratet for byggkvalitet (DiBK)' },
    { icon: 'Users', title: title4 || 'Erfarne fagfolk', description: desc4 || 'Alle våre ansatte har fagbrev og dokumentert erfaring' },
    { icon: 'CheckCircle2', title: title5 || '100% tilfredsgaranti', description: desc5 || 'Vi står for arbeidet vårt og fikser eventuelle mangler kostnadsfritt' },
    { icon: 'Star', title: title6 || 'Høy kundetilfredshet', description: desc6 || '4.8/5 stjerner basert på 200+ kundeanmeldelser' },
  ];

  return (
    <>
      <div className="mb-20 relative">
        {isAdmin && editMode && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute top-0 right-4 z-10 bg-white rounded-full p-2 shadow-lg border-2 border-primary hover:scale-110 transition-transform"
          >
            <Pencil className="h-5 w-5 text-primary" />
          </button>
        )}

        <h2 className="text-3xl font-bold text-center mb-12">{heading || 'Hvorfor velge oss?'}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, index) => {
            const IconComponent = iconMap[item.icon as keyof typeof iconMap];
            return (
              <Card key={index} className="border-2 hover:border-primary transition-colors">
                <CardContent className="pt-6">
                  <IconComponent className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <WhyUsEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        section="about-why-us"
        currentData={{ heading: heading || 'Hvorfor velge oss?', items }}
      />
    </>
  );
};
