import { EditableWrapper } from './EditableWrapper';
import { useEditableContent } from '@/hooks/useEditableContent';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

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
  const { content: title } = useEditableContent(section, 'title');
  const { content: subtitle } = useEditableContent(section, 'subtitle');
  const { content: bullet1 } = useEditableContent(section, 'bullet_1');
  const { content: bullet2 } = useEditableContent(section, 'bullet_2');
  const { content: bullet3 } = useEditableContent(section, 'bullet_3');

  return (
    <div 
      className={`relative bg-card rounded-lg p-6 shadow-md hover:shadow-xl transition-all duration-300 border ${
        popular ? 'border-success border-2' : 'border-border'
      }`}
    >
      {popular && (
        <div className="absolute top-4 right-4 bg-success text-success-foreground text-xs font-semibold px-3 py-1 rounded-full">
          Populær
        </div>
      )}
      
      <div className="text-4xl mb-3">{icon}</div>
      
      <EditableWrapper
        section={section}
        contentKey="title"
        label={`${defaultTitle} - Tittel`}
        maxLength={50}
      >
        <h3 className="text-xl font-bold text-foreground mb-1 font-heading">
          {title || defaultTitle}
        </h3>
      </EditableWrapper>

      <EditableWrapper
        section={section}
        contentKey="subtitle"
        label={`${defaultTitle} - Undertittel`}
        maxLength={100}
      >
        <p className="text-sm text-muted-foreground mb-4">
          {subtitle || defaultSubtitle}
        </p>
      </EditableWrapper>
      
      <ul className="space-y-2 mb-6">
        <EditableWrapper
          section={section}
          contentKey="bullet_1"
          label={`${defaultTitle} - Kulepunkt 1`}
          maxLength={80}
        >
          <li className="flex items-start text-sm">
            <span className="text-success mr-2 mt-0.5">✓</span>
            <span className="text-muted-foreground">{bullet1 || defaultBullets[0]}</span>
          </li>
        </EditableWrapper>

        <EditableWrapper
          section={section}
          contentKey="bullet_2"
          label={`${defaultTitle} - Kulepunkt 2`}
          maxLength={80}
        >
          <li className="flex items-start text-sm">
            <span className="text-success mr-2 mt-0.5">✓</span>
            <span className="text-muted-foreground">{bullet2 || defaultBullets[1]}</span>
          </li>
        </EditableWrapper>

        <EditableWrapper
          section={section}
          contentKey="bullet_3"
          label={`${defaultTitle} - Kulepunkt 3`}
          maxLength={80}
        >
          <li className="flex items-start text-sm">
            <span className="text-success mr-2 mt-0.5">✓</span>
            <span className="text-muted-foreground">{bullet3 || defaultBullets[2]}</span>
          </li>
        </EditableWrapper>
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
  );
};
