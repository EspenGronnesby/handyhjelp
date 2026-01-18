import { useState } from 'react';
import { Pencil, EyeOff, Check } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useEditableContent } from '@/hooks/useEditableContent';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ServiceCardEditModal } from './ServiceCardEditModal';
import { getDisplayValue } from '@/lib/gridUtils';
import { ServiceIcon, getServiceColors, popularColors, getServiceConfig } from '@/lib/serviceIcons';

interface EditableServiceCardProps {
  section: string;
  id: string;
  icon?: string; // Keep for backwards compatibility but will be ignored
  popular?: boolean;
  defaultTitle: string;
  defaultSubtitle: string;
  defaultBullets: string[];
}

export const EditableServiceCard = ({
  section,
  id,
  popular = false,
  defaultTitle,
  defaultSubtitle,
  defaultBullets
}: EditableServiceCardProps) => {
  const { editMode, isAdmin } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { content: title, hasBeenEdited: titleEdited } = useEditableContent(section, 'title');
  const { content: subtitle, hasBeenEdited: subtitleEdited } = useEditableContent(section, 'subtitle');
  const { content: bullet1, hasBeenEdited: bullet1Edited } = useEditableContent(section, 'bullet_1');
  const { content: bullet2, hasBeenEdited: bullet2Edited } = useEditableContent(section, 'bullet_2');
  const { content: bullet3, hasBeenEdited: bullet3Edited } = useEditableContent(section, 'bullet_3');

  // Use DB value if edited (even if empty), otherwise use default
  const displayTitle = getDisplayValue(title, titleEdited, defaultTitle);
  const displaySubtitle = getDisplayValue(subtitle, subtitleEdited, defaultSubtitle);
  const displayBullet1 = getDisplayValue(bullet1, bullet1Edited, defaultBullets[0] || '');
  const displayBullet2 = getDisplayValue(bullet2, bullet2Edited, defaultBullets[1] || '');
  const displayBullet3 = getDisplayValue(bullet3, bullet3Edited, defaultBullets[2] || '');

  // Sjekk om kortet er skjult (tittel er tom streng og har blitt redigert)
  const isHidden = titleEdited && title.trim() === '';

  // Skjul kortet når tittelen er tom og ikke i edit mode
  if (isHidden && (!isAdmin || !editMode)) {
    return null;
  }

  // Get service config for short label on mobile
  const config = getServiceConfig(id);
  
  // Get service-specific colors for the card background tint
  // Use emerald colors for popular cards, otherwise use standard service colors
  const colors = popular ? popularColors : getServiceColors(id);

  return (
    <>
      <div 
        className={`relative rounded-lg p-4 md:p-6 transition-all duration-300 border card-hover-lift icon-hover-bounce reveal-scale perf-contain ${colors.bg} ${
          popular ? 'border-success border-2 shadow-lg' : `border ${colors.border}`
        } ${isHidden && isAdmin && editMode ? 'opacity-50 border-dashed border-muted-foreground' : ''} 
        dark:ring-1 dark:ring-white/5`}
      >
        {isAdmin && editMode && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute top-4 right-4 z-10 bg-background rounded-full p-2 shadow-lg border-2 border-primary hover:scale-110 transition-transform"
            aria-label="Rediger tjenestekort"
          >
            <Pencil className="h-5 w-5 text-primary" />
          </button>
        )}

        {isHidden && isAdmin && editMode && (
          <div className="absolute top-4 left-4 flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded z-10">
            <EyeOff className="h-3 w-3" />
            <span>Skjult</span>
          </div>
        )}

        {popular && !editMode && !isHidden && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-success text-success-foreground text-xs font-semibold px-3 py-1 rounded-full animate-subtle-pulse z-10">
            Populær
          </div>
        )}
        
        {/* Professional Lucide icon in circular container */}
        <div className="mb-3 md:mb-4">
          <ServiceIcon serviceId={id} size="sm" useServiceColor={true} className="md:!w-14 md:!h-14" />
        </div>
        
        <h3 className="text-base md:text-xl font-bold text-foreground mb-1 font-heading">
          <span className="md:hidden">{config.labelShort}</span>
          <span className="hidden md:inline">{displayTitle}</span>
        </h3>

        <p className="hidden md:block text-sm text-muted-foreground mb-4">
          {displaySubtitle}
        </p>
        
        {/* Hide bullets on mobile for cleaner look */}
        <ul className="hidden md:block space-y-2 mb-6">
          {displayBullet1 && (
            <li className="flex items-start text-sm">
              <Check className="h-4 w-4 text-success mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{displayBullet1}</span>
            </li>
          )}
          {displayBullet2 && (
            <li className="flex items-start text-sm">
              <Check className="h-4 w-4 text-success mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{displayBullet2}</span>
            </li>
          )}
          {displayBullet3 && (
            <li className="flex items-start text-sm">
              <Check className="h-4 w-4 text-success mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{displayBullet3}</span>
            </li>
          )}
        </ul>
        
        {/* Mobile spacer */}
        <div className="md:hidden mb-3" />
        
        <Link to={`/tjenester/${id}`}>
          <Button 
            variant="outline" 
            className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            Les mer
          </Button>
        </Link>
      </div>

      <ServiceCardEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        section={section}
        currentData={{
          title: displayTitle,
          subtitle: displaySubtitle,
          bullet1: displayBullet1,
          bullet2: displayBullet2,
          bullet3: displayBullet3
        }}
      />
    </>
  );
};
