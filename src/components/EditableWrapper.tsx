import { useState, CSSProperties } from 'react';
import { Pencil, Eye, EyeOff } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useEditableContent } from '@/hooks/useEditableContent';
import { EditTextModal } from './EditTextModal';
import { EditImageModal } from './EditImageModal';

interface EditableWrapperProps {
  section: string;
  contentKey: string;
  type?: 'text' | 'image' | 'color';
  children: React.ReactNode;
  className?: string;
  label?: string;
  maxLength?: number;
  multiline?: boolean;
  hideWhenEmpty?: boolean;
}

export const EditableWrapper = ({
  section,
  contentKey,
  type = 'text',
  children,
  className = '',
  label,
  maxLength,
  multiline = false,
  hideWhenEmpty = false
}: EditableWrapperProps) => {
  const { editMode, isAdmin } = useEditMode();
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { content, updateContent } = useEditableContent(section, contentKey);

  const handleEdit = () => {
    setIsModalOpen(true);
  };

  const handleSave = async (newValue: string) => {
    return await updateContent(newValue);
  };

  // Sjekk om innholdet er tomt (trimmet)
  const isEmpty = !content || content.trim() === '';

  // Hvis ikke admin eller edit mode av: Sjekk om skal skjules
  if (!isAdmin || !editMode) {
    if (hideWhenEmpty && isEmpty) {
      return null;
    }
    return <>{children}</>;
  }

  // I edit mode: Vis alltid, men marker om den er skjult

  const wrapperStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    opacity: hideWhenEmpty && isEmpty ? 0.5 : 1,
  };

  const buttonStyle: CSSProperties = {
    position: 'absolute',
    top: '4px',
    right: '4px',
    background: 'white',
    borderRadius: '50%',
    padding: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    border: 'none',
    cursor: 'pointer',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 200ms'
  };

  return (
    <>
      <div
        className={`editable-wrapper ${className} ${hideWhenEmpty && isEmpty ? 'border-2 border-dashed border-muted-foreground/50 rounded-lg' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={wrapperStyle}
      >
        {hideWhenEmpty && isEmpty && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 text-xs text-muted-foreground pointer-events-none">
            <EyeOff className="h-4 w-4" />
            <span>Skjult</span>
          </div>
        )}
        {children}
        
        {isHovered && (
          <button
            onClick={handleEdit}
            className="edit-icon-btn"
            style={buttonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
            }}
          >
            <Pencil className="h-4 w-4 text-primary" />
          </button>
        )}
      </div>

      {type === 'text' && (
        <EditTextModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          section={section}
          contentKey={contentKey}
          currentValue={content}
          onSave={handleSave}
          label={label}
          maxLength={maxLength}
          multiline={multiline}
        />
      )}

      {type === 'image' && (
        <EditImageModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          imageKey={`${section}-${contentKey}`}
          currentImageUrl={content}
          onSave={handleSave}
          label={label}
        />
      )}
    </>
  );
};
