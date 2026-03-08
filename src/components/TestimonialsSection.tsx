import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Star, Quote, ChevronLeft, ChevronRight, Building2, User, BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  feedback_type: string | null;
  customer_name: string | null;
  source?: string;
  company_name?: string;
  is_verified_customer?: boolean;
  jobs?: {
    quotes?: {
      type: string;
      name: string;
      company_name: string | null;
    };
  };
}

const TestimonialsSection = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Use the secure public_reviews view that excludes customer_email for privacy
        // The view only returns approved reviews with non-sensitive fields
        const { data, error } = await supabase
          .from('public_reviews' as any)
          .select('id, rating, comment, created_at, feedback_type, customer_name, job_id, source, company_name, is_verified_customer')
          .gte('rating', 4)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        
        // Fetch related data separately
        // Note: public_reviews view doesn't include user_id for privacy
        // We can still fetch job data for service type display
        const reviewsWithRelations = await Promise.all(
          (data || []).map(async (review: any) => {
            let jobs = undefined;
            
            if (review.job_id) {
              const { data: jobData } = await supabase
                .from('jobs')
                .select('quotes(type, name, company_name)')
                .eq('id', review.job_id)
                .single();
              jobs = jobData || undefined;
            }
            
            return { ...review, jobs };
          })
        );
        
        setReviews(reviewsWithRelations);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const scrollToIndex = useCallback((index: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cardWidth = container.scrollWidth / reviews.length;
    container.scrollTo({
      left: cardWidth * index,
      behavior: 'smooth'
    });
    setCurrentIndex(index);
  }, [reviews.length]);

  const nextSlide = useCallback(() => {
    const nextIndex = (currentIndex + 1) % reviews.length;
    scrollToIndex(nextIndex);
  }, [currentIndex, reviews.length, scrollToIndex]);

  const prevSlide = useCallback(() => {
    const prevIndex = (currentIndex - 1 + reviews.length) % reviews.length;
    scrollToIndex(prevIndex);
  }, [currentIndex, reviews.length, scrollToIndex]);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && reviews.length > 1) {
      autoPlayRef.current = setInterval(() => {
        nextSlide();
      }, 5000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, nextSlide, reviews.length]);

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  // Handle scroll to update current index
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cardWidth = container.scrollWidth / reviews.length;
    const newIndex = Math.round(container.scrollLeft / cardWidth);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  const getServiceTypeName = (type: string) => {
    switch (type) {
      case 'vaktmester': return 'Vaktmestertjenester';
      case 'tomrer': return 'Tømrertjenester';
      case 'blikk': return 'Blikkenslagertjenester';
      case 'takrennerens': return 'Takrennerens';
      default: return 'Tjenester';
    }
  };

  const getCustomerDisplay = (review: Review) => {
    const quote = review.jobs?.quotes;
    
    // Check if it has a company name from the review itself (from admin input)
    if (review.company_name) {
      return {
        name: review.company_name,
        isBusiness: true,
        isGoogle: review.source === 'google',
        isVerified: review.is_verified_customer
      };
    }
    
    // Check if business customer based on quote data
    const isBusiness = !!quote?.company_name;
    
    if (isBusiness) {
      return {
        name: quote.company_name || quote?.name?.split(' ')[0] || 'Bedrift',
        isBusiness: true,
        isGoogle: review.source === 'google',
        isVerified: review.is_verified_customer
      };
    }
    
    // For all other cases, use customer_name from the secure view
    // Only show first name for privacy
    const displayName = review.customer_name || quote?.name || 'Kunde';
    return {
      name: displayName.split(' ')[0],
      isBusiness: false,
      isGoogle: review.source === 'google',
      isVerified: review.is_verified_customer
    };
  };

  if (loading || reviews.length === 0) {
    return null;
  }

  return (
    <section id="testimonials" className="py-16 md:py-24 bg-muted/20">
      <div className="container mx-auto px-4">
        {/* Section Header - Compact on mobile */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium mb-3 md:mb-4 reveal-up">
            <Star className="h-3 w-3 md:h-4 md:w-4 fill-primary" />
            <span>Kundeanmeldelser</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-3 md:mb-4 reveal-up reveal-stagger-2">
            Hva kundene sier
          </h2>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto reveal-up reveal-stagger-3">
            Les hva våre fornøyde kunder mener
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div 
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Navigation Buttons - Desktop */}
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 hidden md:flex bg-background shadow-lg border-border hover:bg-muted"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 hidden md:flex bg-background shadow-lg border-border hover:bg-muted"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Scrollable Container with fade edges - fixed overflow */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto overflow-y-visible snap-x snap-mandatory scrollbar-hide pb-8 pt-6 px-4 md:px-12 carousel-fade-edges"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {reviews.map((review, index) => {
              const customerDisplay = getCustomerDisplay(review);
              const serviceType = review.jobs?.quotes?.type;
              
              return (
                <div
                  key={review.id}
                  className={cn(
                    "flex-shrink-0 w-[88vw] md:w-[450px] snap-center",
                    "group reveal-scale perf-contain"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={cn(
                    "relative h-full bg-card rounded-xl p-6 md:p-8 shadow-md border border-border/50",
                    "hover:shadow-lg hover:border-border transition-shadow duration-300",
                    index === currentIndex && "border-primary/20"
                  )}>
                      {/* Quote Icon - with Google badge if from Google */}
                      <div className="absolute -top-4 left-8">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center shadow-lg",
                          customerDisplay.isGoogle ? "bg-white" : "bg-primary"
                        )}>
                          {customerDisplay.isGoogle ? (
                            <svg className="h-6 w-6" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                          ) : (
                            <Quote className="h-5 w-5 text-primary-foreground" />
                          )}
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex gap-1 mb-4 pt-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "h-5 w-5 transition-all duration-300",
                              star <= review.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-muted-foreground/30"
                            )}
                          />
                        ))}
                      </div>

                    {/* Comment */}
                    <blockquote className="text-foreground text-lg leading-relaxed mb-6 min-h-[80px]">
                      "{review.comment || 'Veldig fornøyd med arbeidet!'}"
                    </blockquote>

                      {/* Customer Info */}
                      <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center",
                          customerDisplay.isBusiness 
                            ? "bg-blue-100 dark:bg-blue-900/30" 
                            : "bg-primary/10"
                        )}>
                          {customerDisplay.isBusiness ? (
                            <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <User className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-foreground">
                              {customerDisplay.name}
                            </p>
                            {customerDisplay.isVerified && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 gap-1">
                                <BadgeCheck className="h-3 w-3" />
                                Verifisert
                              </Badge>
                            )}
                          </div>
                          {serviceType && (
                            <p className="text-sm text-muted-foreground">
                              {getServiceTypeName(serviceType)}
                            </p>
                          )}
                        </div>
                      </div>

                    {/* Subtle bottom accent */}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all duration-300",
                  index === currentIndex
                    ? "bg-primary w-8"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Gå til anmeldelse ${index + 1}`}
              />
            ))}
          </div>

          {/* Mobile Navigation Hint */}
          <p className="text-center text-sm text-muted-foreground mt-4 md:hidden">
            Sveip for å se flere anmeldelser
          </p>
        </div>

        {/* Trust Badge with Google branding */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-6 py-4 rounded-full shadow-sm">
            {/* Google logo */}
            <svg className="h-6 w-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-bold text-lg">Google</span>
            <span className="font-medium">
              {reviews.length}+ fornøyde kunder
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
