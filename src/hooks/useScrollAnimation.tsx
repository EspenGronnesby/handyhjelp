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
      transition: 'opacity var(--duration-reveal) var(--ease-out), transform var(--duration-reveal) var(--ease-out)',
      transitionDelay: isVisible ? `${index * 60}ms` : '0ms',
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
    const delay = (row * columns + col) * 60; // 60ms mellom hvert kort — se .claude/rules/bevegelse.md
    
    return {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'opacity var(--duration-reveal) var(--ease-out), transform var(--duration-reveal) var(--ease-out)',
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
    transition: 'opacity var(--duration-reveal) var(--ease-out), transform var(--duration-reveal) var(--ease-out)',
  };

  return { ref, isVisible, style };
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

    // Scroll-eventer kan fyre flere ganger per frame. Uten demping ga det
    // én React-omtegning av hele seksjonen per event. Nå: maks én maling per
    // frame (rAF), og vi hopper over oppdateringen når endringen er umerkelig.
    let ticking = false;
    let sisteProgress = -1;
    let rafId = 0;

    const maal = () => {
      ticking = false;
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (rect.top < windowHeight * 0.75 && rect.bottom > 0) {
        setIsInView(true);

        const startPoint = windowHeight * 0.75;
        const endPoint = -rect.height * 0.3;
        const totalRange = startPoint - endPoint;
        const currentPosition = startPoint - rect.top;

        const progress = Math.max(0, Math.min(1, currentPosition / totalRange));
        // Under 0,5 % endring er usynlig — ikke tegn om for det.
        if (Math.abs(progress - sisteProgress) >= 0.005 || progress === 0 || progress === 1) {
          sisteProgress = progress;
          setScrollProgress(progress);
        }
      } else if (rect.top >= windowHeight) {
        setIsInView(false);
        if (sisteProgress !== 0) {
          sisteProgress = 0;
          setScrollProgress(0);
        }
      } else if (rect.bottom <= 0) {
        // Seksjonen er rullet helt forbi. Ved JEVN scrolling når progresjonen
        // 1 allerede i grenen over. Denne grenen gjelder HOPP — End-tasten,
        // ankerlenker, eller mount lenger nede på siden — der man passerer
        // konvergenspunktet uten at grenen over noensinne kjører. Uten den
        // fryser progresjonen på verdien fra før hoppet (ofte 0).
        // (80 %-feilen på fjerde kort var noe annet: itemCount i
        //  ProjectsSection, se kommentaren der.)
        if (sisteProgress !== 1) {
          sisteProgress = 1;
          setScrollProgress(1);
        }
      }
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      rafId = requestAnimationFrame(maal);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    maal();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      // Uten dette kan en planlagt maling fyre etter at komponenten er avmontert.
      if (rafId) cancelAnimationFrame(rafId);
    };
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
      transition: 'opacity var(--duration-reveal) var(--ease-out), transform var(--duration-reveal) var(--ease-out)',
    };
  }, [scrollProgress, itemCount, columns, prefersReducedMotion]);

  return { ref: containerRef, isInView, scrollProgress, getItemStyle };
};
