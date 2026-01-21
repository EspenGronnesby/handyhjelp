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

// Hook for scroll-progress based reveal (not time-based)
// Items reveal sequentially as user scrolls through the section
export const useScrollProgressReveal = (itemCount: number) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isInView, setIsInView] = useState(false);

  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (prefersReducedMotion) {
      setIsInView(true);
      setScrollProgress(1);
      return;
    }

    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Check if container is in view
      if (rect.top < windowHeight * 0.8 && rect.bottom > 0) {
        setIsInView(true);
        
        // Calculate how far user has scrolled through the container
        const startPoint = windowHeight * 0.8;
        const endPoint = -rect.height * 0.5;
        const totalRange = startPoint - endPoint;
        const currentPosition = startPoint - rect.top;
        
        const progress = Math.max(0, Math.min(1, currentPosition / totalRange));
        setScrollProgress(progress);
      } else if (rect.top >= windowHeight) {
        setIsInView(false);
        setScrollProgress(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [prefersReducedMotion]);

  const getItemStyle = useCallback((index: number): React.CSSProperties => {
    if (prefersReducedMotion) {
      return { opacity: 1, transform: 'translateY(0)' };
    }

    // Each item has its own reveal threshold
    const itemThreshold = index / (itemCount + 1);
    const itemProgress = Math.max(0, Math.min(1, (scrollProgress - itemThreshold) * (itemCount + 1)));

    return {
      opacity: itemProgress,
      transform: `translateY(${(1 - itemProgress) * 20}px)`,
      transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
    };
  }, [scrollProgress, itemCount, prefersReducedMotion]);

  return { ref: containerRef, isInView, scrollProgress, getItemStyle };
};

// Hook for scroll-based grid reveal with directional movement
// Top row fades from top, bottom row fades from bottom
export const useScrollGridReveal = (
  itemCount: number, 
  columns: number = 2
) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isInView, setIsInView] = useState(false);

  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (prefersReducedMotion) {
      setIsInView(true);
      setScrollProgress(1);
      return;
    }

    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      if (rect.top < windowHeight * 0.75 && rect.bottom > 0) {
        setIsInView(true);
        
        const startPoint = windowHeight * 0.75;
        const endPoint = -rect.height * 0.3;
        const totalRange = startPoint - endPoint;
        const currentPosition = startPoint - rect.top;
        
        const progress = Math.max(0, Math.min(1, currentPosition / totalRange));
        setScrollProgress(progress);
      } else if (rect.top >= windowHeight) {
        setIsInView(false);
        setScrollProgress(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [prefersReducedMotion]);

  const getItemStyle = useCallback((index: number): React.CSSProperties => {
    if (prefersReducedMotion) {
      return { opacity: 1, transform: 'translateY(0)' };
    }

    // Calculate row for directional animation
    const row = Math.floor(index / columns);
    const isTopRow = row === 0;
    
    // Items reveal in reading order: top-left, top-right, bottom-left, bottom-right
    const itemThreshold = index / (itemCount + 1);
    const itemProgress = Math.max(0, Math.min(1, (scrollProgress - itemThreshold) * (itemCount + 1) * 0.8));

    // Top row: fade from top, Bottom row: fade from bottom
    const translateY = isTopRow 
      ? (1 - itemProgress) * -20  // From top
      : (1 - itemProgress) * 20;  // From bottom

    return {
      opacity: itemProgress,
      transform: `translateY(${translateY}px)`,
      transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
    };
  }, [scrollProgress, itemCount, columns, prefersReducedMotion]);

  return { ref: containerRef, isInView, scrollProgress, getItemStyle };
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
      if (rect.top < windowHeight * 0.6 && rect.bottom > windowHeight * 0.2) {
        setIsInView(true);
        
        // Improved calculation: spread items across full scroll range
        const containerScrollRange = rect.height + windowHeight * 0.4;
        const scrolled = windowHeight * 0.6 - rect.top;
        const progress = Math.max(0, Math.min(1, scrolled / containerScrollRange));
        setScrollProgress(progress);
      } else if (rect.top >= windowHeight * 0.6) {
        setIsInView(false);
        setScrollProgress(0);
      } else if (rect.bottom <= windowHeight * 0.2) {
        // Keep fully revealed after scrolling past
        setScrollProgress(1);
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
    // +1 to ensure last item isn't at 100%
    const itemThreshold = index / (itemCount + 1);
    const itemProgress = Math.max(0, Math.min(1, (scrollProgress - itemThreshold) * (itemCount + 1)));
    
    return {
      opacity: itemProgress,
      transform: `translateY(${(1 - itemProgress) * 24}px)`,
      transition: 'opacity 0.35s ease-out, transform 0.35s ease-out',
    };
  }, [scrollProgress, itemCount, prefersReducedMotion]);

  return { ref: containerRef, isInView, scrollProgress, getItemStyle };
};
