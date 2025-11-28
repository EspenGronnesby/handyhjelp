import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useEditableContent } from '@/hooks/useEditableContent';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ServiceCardEditModal } from './ServiceCardEditModal';

interface EditableServiceCardProps {
  section: string;
  id: string;
  icon: string;
  popular?: boolean;
  defaultTitle: string;
  defaultSubtitle: string;
  defaultBullets: string[];
}

export const EditableServiceCard = ({
  section,
  id,
  icon,
  popular = false,
  defaultTitle,
  defaultSubtitle,
  defaultBullets
}: EditableServiceCardProps) => {
  const { editMode, isAdmin } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { content: title } = useEditableContent(section, 'title');
  const { content: subtitle } = useEditableContent(section, 'subtitle');
  const { content: bullet1 } = useEditableContent(section, 'bullet_1');
  const { content: bullet2 } = useEditableContent(section, 'bullet_2');
  const { content: bullet3 } = useEditableContent(section, 'bullet_3');

  const displayTitle = title || defaultTitle;
  const displaySubtitle = subtitle || defaultSubtitle;
  const displayBullet1 = bullet1 || defaultBullets[0];
  const displayBullet2 = bullet2 || defaultBullets[1];
  const displayBullet3 = bullet3 || defaultBullets[2];

  return (
    <>
      <div 
        className={`relative bg-card rounded-lg p-6 shadow-md hover:shadow-xl transition-all duration-300 border ${
          popular ? 'border-success border-2' : 'border-border'
        }`}
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

        {popular && !editMode && (
          <div className="absolute top-4 right-4 bg-success text-success-foreground text-xs font-semibold px-3 py-1 rounded-full">
            Populær
          </div>
        )}
        
        <div className="text-4xl mb-3">{icon}</div>
        
        <h3 className="text-xl font-bold text-foreground mb-1 font-heading">
          {displayTitle}
        </h3>

        <p className="text-sm text-muted-foreground mb-4">
          {displaySubtitle}
        </p>
        
        <ul className="space-y-2 mb-6">
          <li className="flex items-start text-sm">
            <span className="text-success mr-2 mt-0.5">✓</span>
            <span className="text-muted-foreground">{displayBullet1}</span>
          </li>
          <li className="flex items-start text-sm">
            <span className="text-success mr-2 mt-0.5">✓</span>
            <span className="text-muted-foreground">{displayBullet2}</span>
          </li>
          <li className="flex items-start text-sm">
            <span className="text-success mr-2 mt-0.5">✓</span>
            <span className="text-muted-foreground">{displayBullet3}</span>
          </li>
        </ul>
        
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
