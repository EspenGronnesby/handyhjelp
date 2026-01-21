import { useEffect, useRef, useState, useCallback } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useScrollAnimation = (options: UseScrollAnimationOptions = {}) => {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
};

// Hook for staggered animations on children
export const useStaggeredAnimation = (itemCount: number, options: UseScrollAnimationOptions = {}) => {
  const { ref, isVisible } = useScrollAnimation(options);
  
  const getStaggerDelay = useCallback((index: number) => {
    return isVisible ? `${index * 100}ms` : '0ms';
  }, [isVisible]);

  const getStaggerClass = useCallback((index: number) => {
    return isVisible ? `animate-stagger-${Math.min(index + 1, 6)}` : '';
  }, [isVisible]);

  return { ref, isVisible, getStaggerDelay, getStaggerClass };
};

// Hook for sequential reveal (one item at a time with delay)
export const useSequentialReveal = (itemCount: number, options: UseScrollAnimationOptions = {}) => {
  const { ref, isVisible } = useScrollAnimation({ ...options, threshold: options.threshold ?? 0.2 });
  
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  const getItemStyle = useCallback((index: number): React.CSSProperties => {
    if (prefersReducedMotion) {
      return { opacity: 1, transform: 'translateY(0)' };
    }
    
    return {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
      transitionDelay: isVisible ? `${index * 200}ms` : '0ms',
    };
  }, [isVisible, prefersReducedMotion]);

  return { ref, isVisible, getItemStyle };
};

// Hook for grid-based staggered reveal (left-to-right, top-to-bottom)
// Synced with useSequentialReveal for consistent premium animation feel
export const useStaggeredGridReveal = (
  itemCount: number, 
  columns: number = 2, 
  options: UseScrollAnimationOptions = {}
) => {
  const { ref, isVisible } = useScrollAnimation({ ...options, threshold: options.threshold ?? 0.2 });
  
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  const getItemStyle = useCallback((index: number): React.CSSProperties => {
    if (prefersReducedMotion) {
      return { opacity: 1, transform: 'translateY(0)' };
    }
    
    // Calculate row and column for proper delay order
    const row = Math.floor(index / columns);
    const col = index % columns;
    const delay = (row * columns + col) * 200; // 200ms between each item (matches useSequentialReveal)
    
    return {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
      transitionDelay: isVisible ? `${delay}ms` : '0ms',
    };
  }, [isVisible, columns, prefersReducedMotion]);

  return { ref, isVisible, getItemStyle };
};

// Hook for fade-in from bottom (simple, single element)
export const useFadeInUp = (options: UseScrollAnimationOptions = {}) => {
  const { ref, isVisible } = useScrollAnimation({ ...options, threshold: options.threshold ?? 0.1 });
  
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  const style: React.CSSProperties = prefersReducedMotion ? {} : {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
    transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
  };

  return { ref, isVisible, style };
};

// Hook for sticky timeline with scroll-based reveal
export const useStickyTimelineReveal = (itemCount: number) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isInView, setIsInView] = useState(false);

  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || prefersReducedMotion) {
      setIsInView(true);
      setScrollProgress(1);
      return;
    }

    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Check if in view
      if (rect.top < windowHeight && rect.bottom > 0) {
        setIsInView(true);
        
        // Calculate scroll progress within the container
        const containerTop = rect.top;
        const containerHeight = rect.height;
        const scrollableRange = containerHeight - windowHeight * 0.5;
        
        if (scrollableRange > 0) {
          const progress = Math.max(0, Math.min(1, (windowHeight * 0.3 - containerTop) / scrollableRange));
          setScrollProgress(progress);
        }
      } else {
        setIsInView(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [prefersReducedMotion]);

  const getItemStyle = useCallback((index: number): React.CSSProperties => {
    if (prefersReducedMotion) {
      return { opacity: 1, transform: 'translateY(0)' };
    }

    // Each item reveals at a specific scroll progress point
    const itemThreshold = index / itemCount;
    const itemProgress = Math.max(0, Math.min(1, (scrollProgress - itemThreshold) * itemCount));
    
    return {
      opacity: itemProgress,
      transform: `translateY(${(1 - itemProgress) * 20}px)`,
      transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
    };
  }, [scrollProgress, itemCount, prefersReducedMotion]);

  return { ref: containerRef, isInView, scrollProgress, getItemStyle };
};
