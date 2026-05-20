import { useState } from 'react';
import { Clock, Shield, Award, Users, CheckCircle2, Star, EyeOff, type LucideIcon } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useEditableContent } from '@/hooks/useEditableContent';
import { WhyUsEditModal } from './WhyUsEditModal';
import { getDisplayValue } from '@/lib/gridUtils';
import { useStaggeredGridReveal } from '@/hooks/useScrollAnimation';
import { EditButton } from './ui/EditButton';
import { SectionHeading } from './ui/SectionHeading';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  Clock, Shield, Award, Users, CheckCircle2, Star
};

// Distinct gradient per slot so the 6 cards each have their own visual ID
// without depending on what icon-name the admin picked.
const slotGradients = [
  "from-cyan-500 via-blue-500 to-indigo-600",
  "from-emerald-500 via-teal-500 to-cyan-600",
  "from-amber-500 via-orange-500 to-rose-600",
  "from-fuchsia-500 via-purple-500 to-indigo-600",
  "from-rose-500 via-pink-500 to-fuchsia-600",
  "from-yellow-500 via-amber-500 to-orange-600",
];

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

  const items = [
    { icon: 'Clock', title: getDisplayValue(title1, title1Edited, defaultItems[0].defaultTitle), description: getDisplayValue(desc1, desc1Edited, defaultItems[0].defaultDesc) },
    { icon: 'Shield', title: getDisplayValue(title2, title2Edited, defaultItems[1].defaultTitle), description: getDisplayValue(desc2, desc2Edited, defaultItems[1].defaultDesc) },
    { icon: 'Award', title: getDisplayValue(title3, title3Edited, defaultItems[2].defaultTitle), description: getDisplayValue(desc3, desc3Edited, defaultItems[2].defaultDesc) },
    { icon: 'Users', title: getDisplayValue(title4, title4Edited, defaultItems[3].defaultTitle), description: getDisplayValue(desc4, desc4Edited, defaultItems[3].defaultDesc) },
    { icon: 'CheckCircle2', title: getDisplayValue(title5, title5Edited, defaultItems[4].defaultTitle), description: getDisplayValue(desc5, desc5Edited, defaultItems[4].defaultDesc) },
    { icon: 'Star', title: getDisplayValue(title6, title6Edited, defaultItems[5].defaultTitle), description: getDisplayValue(desc6, desc6Edited, defaultItems[5].defaultDesc) },
  ];

  const isItemHidden = (item: typeof items[0]) =>
    item.title.trim() === '' && item.description.trim() === '';

  const visibleItems = isAdmin && editMode
    ? items
    : items.filter(item => !isItemHidden(item));

  const { ref, getItemStyle } = useStaggeredGridReveal(visibleItems.length, 3, { threshold: 0.1 });

  if (visibleItems.length === 0 && (!isAdmin || !editMode)) {
    return null;
  }

  return (
    <>
      <div className="mb-20 relative">
        {isAdmin && editMode && (
          <EditButton onClick={() => setIsModalOpen(true)} ariaLabel="Rediger" />
        )}

        <div className="max-w-4xl mx-auto mb-10 md:mb-12">
          <SectionHeading
            icon={Award}
            gradient="from-cyan-500 via-blue-500 to-indigo-600"
            title={getDisplayValue(heading, headingEdited, 'Hvorfor velge oss?')}
          />
        </div>

        <div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto"
        >
          {items.map((item, index) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap] || Award;
            const isHidden = isItemHidden(item);
            const gradient = slotGradients[index % slotGradients.length];

            if (!isAdmin || !editMode) {
              if (isHidden) return null;
            }

            return (
              <div
                key={index}
                style={getItemStyle(index)}
                className={cn(
                  "relative flex flex-col gap-3 p-5 md:p-6 rounded-xl",
                  "bg-card/50 hover:bg-card transition-colors duration-200",
                  "border border-border/40",
                  isHidden && isAdmin && editMode ? "opacity-50 border-dashed" : ""
                )}
              >
                {isHidden && isAdmin && editMode && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    <EyeOff className="h-3 w-3" />
                    <span>Skjult</span>
                  </div>
                )}

                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-sm shrink-0",
                    gradient
                  )}
                >
                  <Icon className="w-6 h-6 text-white drop-shadow" strokeWidth={2} />
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-bold text-foreground mb-1 font-heading">
                    {item.title || 'Tom tittel'}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-snug">
                    {item.description || 'Tom beskrivelse'}
                  </p>
                </div>
              </div>
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
