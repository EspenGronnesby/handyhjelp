import { useState, CSSProperties } from 'react';
import { Pencil } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';

interface EditableWrapperProps {
  section: string;
  contentKey: string;
  type?: 'text' | 'image' | 'color';
  children: React.ReactNode;
  className?: string;
}

export const EditableWrapper = ({
  section,
  contentKey,
  type = 'text',
  children,
  className = ''
}: EditableWrapperProps) => {
  const { editMode, isAdmin } = useEditMode();
  const [isHovered, setIsHovered] = useState(false);

  const handleEdit = () => {
    // TODO: Åpne redigeringsmodal (implementeres i neste sprint)
    console.log('Edit:', section, contentKey, type);
  };

  // Hvis ikke admin eller edit mode av: Vis bare children
  if (!isAdmin || !editMode) {
    return <>{children}</>;
  }

  const wrapperStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-block'
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
    <div
      className={`editable-wrapper ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={wrapperStyle}
    >
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
  );
};
