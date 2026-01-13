import { useState } from 'react';
import { Pencil, Clock, Shield, Award, Users, CheckCircle2, Star, EyeOff } from 'lucide-react';
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
    { icon: 'Clock', title: title1, description: desc1, defaultTitle: '20+ års erfaring', defaultDesc: 'To tiår med profesjonell eiendomspleie i Kristiansand-regionen' },
    { icon: 'Shield', title: title2, description: desc2, defaultTitle: 'Fullt forsikret', defaultDesc: 'Omfattende forsikringsdekning for alle typer oppdrag' },
    { icon: 'Award', title: title3, description: desc3, defaultTitle: 'Sertifisert kvalitet', defaultDesc: 'Godkjent av Direktoratet for byggkvalitet (DiBK)' },
    { icon: 'Users', title: title4, description: desc4, defaultTitle: 'Erfarne fagfolk', defaultDesc: 'Alle våre ansatte har fagbrev og dokumentert erfaring' },
    { icon: 'CheckCircle2', title: title5, description: desc5, defaultTitle: '100% tilfredsgaranti', defaultDesc: 'Vi står for arbeidet vårt og fikser eventuelle mangler kostnadsfritt' },
    { icon: 'Star', title: title6, description: desc6, defaultTitle: 'Høy kundetilfredshet', defaultDesc: '4.8/5 stjerner basert på 200+ kundeanmeldelser' },
  ];

  // Sjekk om et item er tomt (både tittel og beskrivelse er tomme strenger)
  const isItemHidden = (item: typeof items[0]) => {
    return item.title?.trim() === '' && item.description?.trim() === '';
  };

  // Filtrer ut skjulte items når ikke i edit mode
  const visibleItems = isAdmin && editMode 
    ? items 
    : items.filter(item => !isItemHidden(item));

  // Hvis alle items er skjult og ikke i edit mode, skjul hele seksjonen
  if (visibleItems.length === 0 && (!isAdmin || !editMode)) {
    return null;
  }

  // Dynamic grid class based on number of visible cards
  const getCardWidthClass = () => {
    const count = visibleItems.filter(item => !isItemHidden(item) || (isAdmin && editMode)).length;
    if (count === 1) return 'w-full max-w-sm';
    if (count === 2) return 'w-full md:w-[calc(50%-1rem)] max-w-sm';
    return 'w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] max-w-sm';
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

        <h2 className="text-3xl font-bold text-center mb-12">{heading || 'Hvorfor velge oss?'}</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {items.map((item, index) => {
            const IconComponent = iconMap[item.icon as keyof typeof iconMap];
            const isHidden = isItemHidden(item);
            
            // I edit mode: vis alle, men marker skjulte
            if (!isAdmin || !editMode) {
              if (isHidden) return null;
            }

            const displayTitle = item.title?.trim() || item.defaultTitle;
            const displayDesc = item.description?.trim() || item.defaultDesc;

            return (
              <Card 
                key={index} 
                className={`border-2 hover:border-primary transition-colors relative ${getCardWidthClass()} ${
                  isHidden && isAdmin && editMode ? 'opacity-50 border-dashed border-muted-foreground' : ''
                }`}
              >
                {isHidden && isAdmin && editMode && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    <EyeOff className="h-3 w-3" />
                    <span>Skjult</span>
                  </div>
                )}
                <CardContent className="pt-6">
                  <IconComponent className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{displayTitle}</h3>
                  <p className="text-muted-foreground">{displayDesc}</p>
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
        currentData={{ heading: heading || 'Hvorfor velge oss?', items: items.map(i => ({
          icon: i.icon,
          title: i.title || i.defaultTitle,
          description: i.description || i.defaultDesc
        })) }}
      />
    </>
  );
};
