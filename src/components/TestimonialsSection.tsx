import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Star, Quote, ChevronLeft, ChevronRight, Building2, User, BadgeCheck, MessageCircle } from 'lucide-react';
import { GoogleIcon, FacebookIcon } from '@/components/icons/brand-icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEditMode } from '@/contexts/EditModeContext';
import { useEditableContent } from '@/hooks/useEditableContent';
import { EditButton } from '@/components/ui/EditButton';
import { SectionEditModal } from '@/components/SectionEditModal';
import { SectionHeading } from '@/components/ui/SectionHeading';

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
  const { editMode, isAdmin } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { content: badgeRaw } = useEditableContent('testimonials', 'badge');
  const { content: headingRaw } = useEditableContent('testimonials', 'heading');
  const { content: subheadingRaw } = useEditableContent('testimonials', 'subheading');
  const badge = badgeRaw || 'Kundeanmeldelser';
  const heading = headingRaw || 'Hva kundene sier';
  const subheading = subheadingRaw || 'Les hva våre fornøyde kunder mener';

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
        isFacebook: review.source === 'facebook',
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
        isFacebook: review.source === 'facebook',
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
      isFacebook: review.source === 'facebook',
      isVerified: review.is_verified_customer
    };
  };

  if (loading || reviews.length === 0) {
    return null;
  }

  return (
    <section id="testimonials" className="py-10 md:py-24 bg-muted/20">
      <div className="container mx-auto px-4">
        {/* Section Header - Compact on mobile */}
        <div className="mb-8 md:mb-12 relative">
          {isAdmin && editMode && (
            <EditButton
              onClick={() => setIsModalOpen(true)}
              ariaLabel="Rediger kundeanmeldelser-overskrift"
            />
          )}
          <div className="text-center mb-3 md:mb-4 reveal-up">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium">
              <Star className="h-3 w-3 md:h-4 md:w-4 fill-primary" />
              <span>{badge}</span>
            </div>
          </div>
          <SectionHeading
            icon={MessageCircle}
            gradient="from-fuchsia-500 via-purple-500 to-indigo-600"
            title={heading}
            subtitle={subheading}
            align="center"
          />
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
          >
            {reviews.map((review, index) => {
              const customerDisplay = getCustomerDisplay(review);
              const serviceType = review.jobs?.quotes?.type;
              
              return (
                <div
                  key={review.id}
                  className={cn(
                    "flex-shrink-0 w-[82vw] md:w-[450px] snap-center",
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
                          customerDisplay.isGoogle || customerDisplay.isFacebook ? "bg-white" : "bg-primary"
                        )}>
                          {customerDisplay.isGoogle ? (
                            <GoogleIcon className="h-6 w-6" />
                          ) : customerDisplay.isFacebook ? (
                            <FacebookIcon className="h-6 w-6" />
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

        {/* Trust Badge - kildenøytral, siden anmeldelser kommer fra flere plattformer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-6 py-4 rounded-full shadow-sm">
            <BadgeCheck className="h-6 w-6" />
            <span className="font-medium">
              {reviews.length}+ fornøyde kunder
            </span>
          </div>
        </div>
      </div>

      <SectionEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Rediger kundeanmeldelser-seksjon"
        fields={[
          { section: 'testimonials', contentKey: 'badge', label: 'Badge-tekst', value: badge, maxLength: 40, placeholder: 'Kundeanmeldelser' },
          { section: 'testimonials', contentKey: 'heading', label: 'Overskrift', value: heading, maxLength: 60, placeholder: 'Hva kundene sier' },
          { section: 'testimonials', contentKey: 'subheading', label: 'Undertekst', value: subheading, multiline: true, maxLength: 200, placeholder: 'Les hva våre fornøyde...' },
        ]}
      />
    </section>
  );
};

export default TestimonialsSection;
