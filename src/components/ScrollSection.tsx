import React from 'react';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { cn } from '@/lib/utils';

interface ScrollSectionProps {
  children: React.ReactNode;
  className?: string;
  fullHeight?: boolean;
  id?: string;
  'aria-labelledby'?: string;
}

export const ScrollSection: React.FC<ScrollSectionProps> = ({
  children,
  className,
  fullHeight = true,
  id,
  'aria-labelledby': ariaLabelledBy,
}) => {
  const { ref, isVisible, style } = useScrollProgress({ threshold: 0.15 });

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={cn(
        'relative',
        fullHeight && 'min-h-[100svh] md:min-h-0',
        'flex flex-col justify-center',
        'contain-layout',
        className
      )}
      style={prefersReducedMotion ? {} : style}
    >
      <div 
        className={cn(
          'transition-all duration-700 ease-out',
          isVisible ? 'opacity-100' : 'opacity-0'
        )}
      >
        {children}
      </div>
    </section>
  );
};

// Minimal section for non-fullscreen content
export const ScrollReveal: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className, delay = 0 }) => {
  const { ref, isVisible } = useScrollProgress({ threshold: 0.2 });

  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out',
        prefersReducedMotion 
          ? 'opacity-100' 
          : isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8',
        className
      )}
      style={{ transitionDelay: prefersReducedMotion ? '0ms' : `${delay}ms` }}
    >
      {children}
    </div>
  );
};
