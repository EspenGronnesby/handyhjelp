import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  const [showButton, setShowButton] = useState(false);

  // Scroll to top on route change
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pathname, hash]);

  // Show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "fixed bottom-6 right-6 z-50 rounded-full shadow-lg transition-all duration-300 min-h-[48px] min-w-[48px] touch-manipulation",
        "bg-background/80 backdrop-blur-sm hover:bg-background",
        showButton 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-4 pointer-events-none"
      )}
      onClick={scrollToTop}
      aria-label="Scroll til toppen"
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
};
