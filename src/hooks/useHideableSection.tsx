import { useEditMode } from '@/contexts/EditModeContext';
import { useEditableContent } from '@/hooks/useEditableContent';

/**
 * Hook for seksjoner som kan skjules når innholdet er tomt.
 * Returnerer visibility-status og om seksjonen er tom.
 */
export const useHideableSection = (section: string, contentKey: string) => {
  const { editMode, isAdmin } = useEditMode();
  const { content } = useEditableContent(section, contentKey);

  const isEmpty = !content || content.trim() === '';
  
  // I edit mode: vis alltid (slik at admin kan redigere)
  // Utenfor edit mode: skjul hvis tom
  const shouldHide = isEmpty && (!isAdmin || !editMode);
  const showEmptyIndicator = isEmpty && isAdmin && editMode;

  return {
    isEmpty,
    shouldHide,
    showEmptyIndicator,
    content,
    isEditMode: isAdmin && editMode
  };
};

/**
 * Hook for seksjoner med flere felt som kan skjules når alle er tomme.
 */
export const useHideableSectionMultiple = (section: string, contentKeys: string[]) => {
  const { editMode, isAdmin } = useEditMode();
  
  // Dette er en forenklet versjon - for mer kompleks logikk 
  // bør komponentene håndtere dette selv
  const isEditMode = isAdmin && editMode;
  
  return {
    isEditMode,
    shouldShowInEditMode: isEditMode
  };
};
