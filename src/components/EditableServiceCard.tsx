import { useState } from 'react';
import { EyeOff, Check, ArrowRight } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useEditableContent } from '@/hooks/useEditableContent';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ServiceCardEditModal } from './ServiceCardEditModal';
import { getDisplayValue } from '@/lib/gridUtils';
import { getServiceConfig, getServiceGradient } from '@/lib/serviceIcons';
import { EditButton } from './ui/EditButton';
import { cn } from '@/lib/utils';

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

  const displayTitle = getDisplayValue(title, titleEdited, defaultTitle);
  const displaySubtitle = getDisplayValue(subtitle, subtitleEdited, defaultSubtitle);
  const displayBullet1 = getDisplayValue(bullet1, bullet1Edited, defaultBullets[0] || '');
  const displayBullet2 = getDisplayValue(bullet2, bullet2Edited, defaultBullets[1] || '');
  const displayBullet3 = getDisplayValue(bullet3, bullet3Edited, defaultBullets[2] || '');

  const isHidden = titleEdited && title.trim() === '';

  if (isHidden && (!isAdmin || !editMode)) {
    return null;
  }

  const config = getServiceConfig(id);
  const Icon = config.icon;
  const gradient = getServiceGradient(id);

  return (
    <>
      <div
        className={cn(
          "glass-card relative w-full h-full !overflow-visible group",
          popular ? "!border-success !border-2" : "",
          isHidden && isAdmin && editMode ? "opacity-50 !border-dashed !border-muted-foreground" : ""
        )}
      >
        {isAdmin && editMode && (
          <EditButton onClick={() => setIsModalOpen(true)} ariaLabel="Rediger tjenestekort" />
        )}

        {isHidden && isAdmin && editMode && (
          <div className="absolute top-4 left-4 flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded z-10">
            <EyeOff className="h-3 w-3" />
            <span>Skjult</span>
          </div>
        )}

        {popular && !editMode && !isHidden && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-success text-success-foreground text-xs font-semibold px-3 py-1 rounded-full z-10">
            Populær
          </div>
        )}

        {/* Visual header — gradient + large icon. Static (no tilt). */}
        <div
          className={cn(
            "relative w-full aspect-[5/3] rounded-xl overflow-hidden mb-4 bg-gradient-to-br",
            gradient
          )}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon
              className="text-white/95 drop-shadow-lg w-16 h-16 md:w-20 md:h-20 transition-transform duration-300 group-hover:scale-110"
              strokeWidth={1.5}
            />
          </div>
        </div>

        <div className="p-3 md:p-6 pt-0">
          <h3 className="text-base md:text-xl font-bold text-foreground mb-1 font-heading">
            <span className="md:hidden">{config.labelShort}</span>
            <span className="hidden md:inline">{displayTitle}</span>
          </h3>

          <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 line-clamp-2 md:line-clamp-none">
            {displaySubtitle}
          </p>

          {/* Bullets shown only on desktop, max 2 for cleaner look */}
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
          </ul>

          <Link to={`/tjenester/${id}`}>
            <Button
              variant="outline"
              className="w-full min-h-11 border-primary text-primary hover:bg-primary hover:text-primary-foreground group/btn"
            >
              Les mer
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </Link>
        </div>
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
