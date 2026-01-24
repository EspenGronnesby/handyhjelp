import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { MotionButton } from '@/components/motion';

export const StickyMobileCTA = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 400px
      const shouldShow = window.scrollY > 400;
      setIsVisible(shouldShow);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 p-4 bg-background/95 backdrop-blur-md border-t border-border shadow-lg md:hidden transition-transform duration-300 overflow-hidden",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
      style={{ width: '100%', maxWidth: '100vw' }}
    >
      <Link to="/tilbud" className="block w-full">
        <MotionButton 
          size="lg" 
          className="w-full bg-success hover:bg-success-hover text-success-foreground font-semibold text-lg py-6"
        >
          Få gratis tilbud
        </MotionButton>
      </Link>
    </div>
  );
};