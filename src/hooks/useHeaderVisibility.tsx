import { useState, useEffect, useRef } from 'react';

interface UseHeaderVisibilityOptions {
  threshold?: number;
  topOffset?: number;
}

export const useHeaderVisibility = ({ 
  threshold = 10, 
  topOffset = 50 
}: UseHeaderVisibilityOptions = {}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always visible at top of page
      if (currentScrollY < topOffset) {
        setIsVisible(true);
        setIsAtTop(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      setIsAtTop(false);

      // Calculate scroll difference
      const diff = currentScrollY - lastScrollY.current;

      // Check scroll direction with threshold to avoid jitter
      if (diff > threshold) {
        // Scrolling down - hide header
        setIsVisible(false);
      } else if (diff < -threshold) {
        // Scrolling up - show header
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold, topOffset]);

  return { isVisible, isAtTop };
};
