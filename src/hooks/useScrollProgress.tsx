import { useEffect, useRef, useState, useCallback } from 'react';

interface ScrollProgressOptions {
  threshold?: number;
  rootMargin?: string;
  parallaxSpeed?: number;
}

interface ScrollProgressResult {
  ref: React.RefObject<HTMLDivElement>;
  progress: number;
  isActive: boolean;
  isVisible: boolean;
  style: React.CSSProperties;
}

export const useScrollProgress = (options: ScrollProgressOptions = {}): ScrollProgressResult => {
  const { threshold = 0.1, rootMargin = '-10% 0px -10% 0px', parallaxSpeed = 0.3 } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      setIsActive(true);
      setProgress(1);
      return;
    }

    const calculateProgress = () => {
      if (!element) return;
      
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how far the element has scrolled through the viewport
      // 0 = just entering from bottom, 0.5 = centered, 1 = leaving from top
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = windowHeight / 2;
      
      // Normalize to 0-1 range where 0.5 is center
      const distanceFromCenter = (viewportCenter - elementCenter) / windowHeight;
      const normalizedProgress = Math.max(0, Math.min(1, distanceFromCenter + 0.5));
      
      setProgress(normalizedProgress);
      
      // Element is "active" when it's the primary focus (centered in viewport)
      const isInCenter = rect.top < windowHeight * 0.6 && rect.bottom > windowHeight * 0.4;
      setIsActive(isInCenter);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting) {
          calculateProgress();
        }
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1], rootMargin }
    );

    observer.observe(element);

    const handleScroll = () => {
      if (isVisible) {
        requestAnimationFrame(calculateProgress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold, rootMargin, isVisible]);

  // Calculate styles based on progress
  const opacity = Math.min(1, progress * 2); // Fade in during first half of scroll
  const translateY = (1 - progress) * 40 * parallaxSpeed; // Subtle parallax

  const style: React.CSSProperties = {
    opacity,
    transform: `translateY(${translateY}px)`,
    transition: 'opacity 0.6s cubic-bezier(0.25, 0.1, 0.25, 1), transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)',
    willChange: 'opacity, transform',
  };

  return { ref, progress, isActive, isVisible, style };
};

// Hook for staggered children animations
export const useStaggeredReveal = (itemCount: number, options: ScrollProgressOptions = {}) => {
  const { ref, isVisible, progress } = useScrollProgress(options);
  
  const getItemStyle = useCallback((index: number): React.CSSProperties => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      return { opacity: 1, transform: 'none' };
    }
    
    const delay = index * 0.1; // 100ms between each item
    const itemProgress = Math.max(0, Math.min(1, (progress - delay) * 2));
    
    return {
      opacity: isVisible ? itemProgress : 0,
      transform: `translateY(${(1 - itemProgress) * 30}px)`,
      transition: `opacity 0.6s cubic-bezier(0.25, 0.1, 0.25, 1) ${delay}s, transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1) ${delay}s`,
      willChange: 'opacity, transform',
    };
  }, [isVisible, progress]);

  return { ref, isVisible, getItemStyle };
};
