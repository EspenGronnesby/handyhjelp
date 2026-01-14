import { useState, useEffect, useCallback, useRef } from 'react';

interface UseFormDraftOptions<T> {
  key: string;
  initialData: T;
  userId?: string;
  enabled?: boolean;
}

interface UseFormDraftResult<T> {
  data: T;
  setData: React.Dispatch<React.SetStateAction<T>>;
  hasDraft: boolean;
  clearDraft: () => void;
  saveDraft: () => void;
}

function hasContent<T>(data: T, initialData: T): boolean {
  if (typeof data !== 'object' || data === null) {
    return data !== initialData;
  }
  
  for (const key in data) {
    const value = data[key];
    const initialValue = initialData[key];
    
    if (typeof value === 'string' && value !== '' && value !== initialValue) {
      return true;
    }
    if (typeof value === 'object' && value !== null && value !== initialValue) {
      return true;
    }
  }
  
  return false;
}

export function useFormDraft<T>({ 
  key, 
  initialData, 
  userId,
  enabled = true 
}: UseFormDraftOptions<T>): UseFormDraftResult<T> {
  const storageKey = userId ? `draft_${key}_${userId}` : `draft_${key}`;
  const isInitialized = useRef(false);
  
  // Initialize state with saved draft or initial data
  const [data, setData] = useState<T>(() => {
    if (!enabled) return initialData;
    
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...initialData, ...parsed };
      }
    } catch (e) {
      console.error('Error loading draft:', e);
    }
    return initialData;
  });
  
  const [hasDraft, setHasDraft] = useState(false);
  
  // Check if there's a draft on mount
  useEffect(() => {
    if (!enabled) return;
    
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Check if the saved data has any meaningful content
        if (hasContent(parsed, initialData)) {
          setHasDraft(true);
          // Update data with saved draft
          setData(prev => ({ ...prev, ...parsed }));
        }
      }
      isInitialized.current = true;
    } catch (e) {
      console.error('Error checking draft:', e);
      isInitialized.current = true;
    }
  }, [storageKey, enabled]);
  
  // Auto-save to localStorage when data changes (debounced)
  useEffect(() => {
    if (!enabled || !isInitialized.current) return;
    
    const timeoutId = setTimeout(() => {
      try {
        if (hasContent(data, initialData)) {
          localStorage.setItem(storageKey, JSON.stringify(data));
          setHasDraft(true);
        }
      } catch (e) {
        console.error('Error saving draft:', e);
      }
    }, 500); // Debounce 500ms
    
    return () => clearTimeout(timeoutId);
  }, [data, storageKey, initialData, enabled]);
  
  // Clear draft from localStorage
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setData(initialData);
      setHasDraft(false);
    } catch (e) {
      console.error('Error clearing draft:', e);
    }
  }, [storageKey, initialData]);
  
  // Manually save draft
  const saveDraft = useCallback(() => {
    if (!enabled) return;
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
      setHasDraft(true);
    } catch (e) {
      console.error('Error saving draft:', e);
    }
  }, [data, storageKey, enabled]);
  
  return { data, setData, hasDraft, clearDraft, saveDraft };
}

// Separate hook for image previews
interface UseImageDraftOptions {
  key: string;
  userId?: string;
  enabled?: boolean;
}

interface UseImageDraftResult {
  previews: Record<string, string>;
  setPreview: (imageKey: string, base64: string) => void;
  clearPreview: (imageKey: string) => void;
  clearAllPreviews: () => void;
  hasDraft: boolean;
}

export function useImageDraft({ 
  key, 
  userId,
  enabled = true 
}: UseImageDraftOptions): UseImageDraftResult {
  const storageKey = userId ? `draft_images_${key}_${userId}` : `draft_images_${key}`;
  
  const [previews, setPreviews] = useState<Record<string, string>>(() => {
    if (!enabled) return {};
    
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading image draft:', e);
    }
    return {};
  });
  
  const [hasDraft, setHasDraft] = useState(false);
  
  // Check if there's a draft on mount
  useEffect(() => {
    if (!enabled) return;
    
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Object.keys(parsed).length > 0) {
          setHasDraft(true);
          setPreviews(parsed);
        }
      }
    } catch (e) {
      console.error('Error checking image draft:', e);
    }
  }, [storageKey, enabled]);
  
  // Save to localStorage when previews change
  useEffect(() => {
    if (!enabled) return;
    
    try {
      if (Object.keys(previews).some(k => previews[k])) {
        localStorage.setItem(storageKey, JSON.stringify(previews));
        setHasDraft(true);
      }
    } catch (e) {
      console.error('Error saving image draft:', e);
    }
  }, [previews, storageKey, enabled]);
  
  const setPreview = useCallback((imageKey: string, base64: string) => {
    setPreviews(prev => ({ ...prev, [imageKey]: base64 }));
  }, []);
  
  const clearPreview = useCallback((imageKey: string) => {
    setPreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[imageKey];
      return newPreviews;
    });
  }, []);
  
  const clearAllPreviews = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setPreviews({});
      setHasDraft(false);
    } catch (e) {
      console.error('Error clearing image draft:', e);
    }
  }, [storageKey]);
  
  return { previews, setPreview, clearPreview, clearAllPreviews, hasDraft };
}
