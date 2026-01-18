import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ScrollProgressProps {
  sections?: string[];
  className?: string;
}

export const ScrollProgress: React.FC<ScrollProgressProps> = ({ 
  sections = ['hero', 'process-section', 'projects', 'testimonials', 'services', 'quote-standalone'],
  className 
}) => {
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const calculateProgress = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = docHeight > 0 ? scrollTop / docHeight : 0;
    setProgress(scrollProgress);

    // Determine active section
    const viewportCenter = window.innerHeight / 2;
    let currentSection = 0;

    sections.forEach((sectionId, index) => {
      const element = document.getElementById(sectionId);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top <= viewportCenter && rect.bottom >= viewportCenter) {
          currentSection = index;
        }
      }
    });

    setActiveSection(currentSection);
  }, [sections]);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let scrollTimeout: NodeJS.Timeout;
    
    const handleScroll = () => {
      setIsVisible(true);
      calculateProgress();
      
      // Hide after 2 seconds of no scrolling
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsVisible(false);
      }, 2000);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    calculateProgress(); // Initial calculation

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [calculateProgress]);

  // Only show on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  if (!isMobile) return null;

  return (
    <div 
      className={cn(
        'fixed right-3 top-1/2 -translate-y-1/2 z-50 transition-opacity duration-500',
        isVisible ? 'opacity-100' : 'opacity-0',
        className
      )}
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Side scroll fremdrift"
    >
      {/* Section dots only - no vertical line */}
      <div className="flex flex-col gap-3">
        {sections.map((_, index) => (
          <div
            key={index}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-300',
              index === activeSection 
                ? 'bg-primary scale-125' 
                : 'bg-muted-foreground/20'
            )}
          />
        ))}
      </div>
    </div>
  );
};
