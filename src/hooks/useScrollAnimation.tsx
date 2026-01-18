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
