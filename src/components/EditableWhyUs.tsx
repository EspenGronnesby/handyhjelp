import { useState } from 'react';
import { Pencil, Clock, Shield, Award, Users, CheckCircle2, Star, EyeOff } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useEditableContent } from '@/hooks/useEditableContent';
import { WhyUsEditModal } from './WhyUsEditModal';
import { Card, CardContent } from '@/components/ui/card';
import { getDisplayValue } from '@/lib/gridUtils';
import { useStaggeredGridReveal } from '@/hooks/useScrollAnimation';

const iconMap = {
  Clock, Shield, Award, Users, CheckCircle2, Star
};

export const EditableWhyUs = () => {
  const { editMode, isAdmin } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { content: heading, hasBeenEdited: headingEdited } = useEditableContent('about-why-us', 'heading');
  const { content: title1, hasBeenEdited: title1Edited } = useEditableContent('about-why-us', 'title_1');
  const { content: desc1, hasBeenEdited: desc1Edited } = useEditableContent('about-why-us', 'desc_1');
  const { content: title2, hasBeenEdited: title2Edited } = useEditableContent('about-why-us', 'title_2');
  const { content: desc2, hasBeenEdited: desc2Edited } = useEditableContent('about-why-us', 'desc_2');
  const { content: title3, hasBeenEdited: title3Edited } = useEditableContent('about-why-us', 'title_3');
  const { content: desc3, hasBeenEdited: desc3Edited } = useEditableContent('about-why-us', 'desc_3');
  const { content: title4, hasBeenEdited: title4Edited } = useEditableContent('about-why-us', 'title_4');
  const { content: desc4, hasBeenEdited: desc4Edited } = useEditableContent('about-why-us', 'desc_4');
  const { content: title5, hasBeenEdited: title5Edited } = useEditableContent('about-why-us', 'title_5');
  const { content: desc5, hasBeenEdited: desc5Edited } = useEditableContent('about-why-us', 'desc_5');
  const { content: title6, hasBeenEdited: title6Edited } = useEditableContent('about-why-us', 'title_6');
  const { content: desc6, hasBeenEdited: desc6Edited } = useEditableContent('about-why-us', 'desc_6');

  const defaultItems = [
    { icon: 'Clock', defaultTitle: '20+ års erfaring', defaultDesc: 'To tiår med profesjonell eiendomspleie i Kristiansand-regionen' },
    { icon: 'Shield', defaultTitle: 'Fullt forsikret', defaultDesc: 'Omfattende forsikringsdekning for alle typer oppdrag' },
    { icon: 'Award', defaultTitle: 'Sertifisert kvalitet', defaultDesc: 'Godkjent av Direktoratet for byggkvalitet (DiBK)' },
    { icon: 'Users', defaultTitle: 'Erfarne fagfolk', defaultDesc: 'Alle våre ansatte har fagbrev og dokumentert erfaring' },
    { icon: 'CheckCircle2', defaultTitle: '100% tilfredsgaranti', defaultDesc: 'Vi står for arbeidet vårt og fikser eventuelle mangler kostnadsfritt' },
    { icon: 'Star', defaultTitle: 'Høy kundetilfredshet', defaultDesc: '4.8/5 stjerner basert på 200+ kundeanmeldelser' },
  ];

  // Use DB value if edited (even if empty), otherwise use default
  const items = [
    { icon: 'Clock', title: getDisplayValue(title1, title1Edited, defaultItems[0].defaultTitle), description: getDisplayValue(desc1, desc1Edited, defaultItems[0].defaultDesc) },
    { icon: 'Shield', title: getDisplayValue(title2, title2Edited, defaultItems[1].defaultTitle), description: getDisplayValue(desc2, desc2Edited, defaultItems[1].defaultDesc) },
    { icon: 'Award', title: getDisplayValue(title3, title3Edited, defaultItems[2].defaultTitle), description: getDisplayValue(desc3, desc3Edited, defaultItems[2].defaultDesc) },
    { icon: 'Users', title: getDisplayValue(title4, title4Edited, defaultItems[3].defaultTitle), description: getDisplayValue(desc4, desc4Edited, defaultItems[3].defaultDesc) },
    { icon: 'CheckCircle2', title: getDisplayValue(title5, title5Edited, defaultItems[4].defaultTitle), description: getDisplayValue(desc5, desc5Edited, defaultItems[4].defaultDesc) },
    { icon: 'Star', title: getDisplayValue(title6, title6Edited, defaultItems[5].defaultTitle), description: getDisplayValue(desc6, desc6Edited, defaultItems[5].defaultDesc) },
  ];

  // Sjekk om et item er tomt (både tittel og beskrivelse er tomme strenger)
  const isItemHidden = (item: typeof items[0]) => {
    return item.title.trim() === '' && item.description.trim() === '';
  };

  // Filtrer ut skjulte items når ikke i edit mode
  const visibleItems = isAdmin && editMode 
    ? items 
    : items.filter(item => !isItemHidden(item));

  // Use staggered grid animation
  const { ref, getItemStyle } = useStaggeredGridReveal(visibleItems.length, 3, { threshold: 0.1 });

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
      <div className="mb-20 relative" ref={ref}>
        {isAdmin && editMode && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute top-0 right-4 z-10 bg-background rounded-full p-2 shadow-lg border-2 border-primary hover:scale-110 transition-transform"
          >
            <Pencil className="h-5 w-5 text-primary" />
          </button>
        )}

        <h2 className="text-3xl font-bold text-center mb-12">{getDisplayValue(heading, headingEdited, 'Hvorfor velge oss?')}</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {items.map((item, index) => {
            const IconComponent = iconMap[item.icon as keyof typeof iconMap];
            const isHidden = isItemHidden(item);
            
            // I edit mode: vis alle, men marker skjulte
            if (!isAdmin || !editMode) {
              if (isHidden) return null;
            }

            return (
              <Card 
                key={index} 
                className={`border-2 card-hover-lift relative ${getCardWidthClass()} ${
                  isHidden && isAdmin && editMode ? 'opacity-50 border-dashed border-muted-foreground' : ''
                }`}
                style={getItemStyle(index)}
              >
                {isHidden && isAdmin && editMode && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    <EyeOff className="h-3 w-3" />
                    <span>Skjult</span>
                  </div>
                )}
                <CardContent className="pt-6">
                  <IconComponent className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{item.title || 'Tom tittel'}</h3>
                  <p className="text-muted-foreground">{item.description || 'Tom beskrivelse'}</p>
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
        currentData={{ heading: getDisplayValue(heading, headingEdited, 'Hvorfor velge oss?'), items: items.map(i => ({
          icon: i.icon,
          title: i.title,
          description: i.description
        })) }}
      />
    </>
  );
};
