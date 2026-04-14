import { useState, useRef } from "react";
import { QuoteForm } from "@/components/QuoteForm";
import { Phone } from "lucide-react";
import { HeroImageEditor } from "@/components/admin/HeroImageEditor";
import { useHeroImage } from "@/hooks/useHeroImage";
import { useEditableContent } from "@/hooks/useEditableContent";
import { useContactInfo } from "@/hooks/useContactInfo";
import { useEditMode } from "@/contexts/EditModeContext";
import { EditButton } from "@/components/ui/EditButton";
import { HeroSectionEditModal } from "./HeroSectionEditModal";
import heroDefaultImage from "@/assets/hero-building-maintenance.jpg";
import { MotionButton } from "@/components/motion";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

export const HeroSection = () => {
  const containerRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  
  const {
    heroImage,
    opacity,
    loading,
    refetch
  } = useHeroImage('home', heroDefaultImage);
  const {
    editMode,
    isAdmin
  } = useEditMode();
  const { phone, phoneHref } = useContactInfo();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    content: title
  } = useEditableContent('hero-home', 'title');
  const {
    content: subtitle
  } = useEditableContent('hero-home', 'subtitle');
  const {
    content: ctaText
  } = useEditableContent('hero-home', 'cta-button');
  const {
    content: servicesButtonText
  } = useEditableContent('hero-home', 'services-button');
  const displayTitle = title || 'Vi tar vare på dine bygg';
  const displaySubtitle = subtitle || 'Vaktmester • Tømrer • Blikk';
  const displayCtaText = ctaText || 'Få tilbud';
  const displayServicesButtonText = servicesButtonText || 'Se tjenester';

  // Parallax effect for background
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 50]);

  return <>
      <section 
        ref={containerRef}
        id="hero" 
        className="min-h-[100svh] md:min-h-screen relative flex items-center pt-20 md:pt-20 section-mobile overflow-hidden"
      >
        {/* Background Image - with subtle parallax */}
        {shouldReduceMotion ? (
          <div 
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 ${loading ? 'opacity-0' : 'opacity-100'}`}
            style={{
              backgroundImage: `url(${heroImage})`,
              backgroundPosition: 'center 30%'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/90 to-secondary/85 dark:from-secondary/80 dark:to-secondary/75" style={{
              opacity
            }}></div>
          </div>
        ) : (
          <motion.div 
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 will-change-transform ${loading ? 'opacity-0' : 'opacity-100'}`}
            style={{
              backgroundImage: `url(${heroImage})`,
              backgroundPosition: 'center 30%',
              y: backgroundY,
              // Extend the background slightly to prevent gaps during parallax
              top: -20,
              bottom: -20,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/90 to-secondary/85 dark:from-secondary/80 dark:to-secondary/75" style={{
              opacity
            }}></div>
          </motion.div>
        )}
        
        <HeroImageEditor page="home" currentImageUrl={heroImage} onImageUpdate={refetch} />

        {/* Edit hero content (title/subtitle/CTA) — placed next to image-edit camera button */}
        {isAdmin && editMode && (
          <EditButton
            onClick={() => setIsModalOpen(true)}
            ariaLabel="Rediger hero-tekst (overskrift, undertekst, knapp)"
            className="bottom-4 right-20 top-auto z-30"
          />
        )}

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-6 md:gap-12 items-center min-h-[calc(100svh-5rem)] md:min-h-[calc(100vh-8rem)] py-4 md:py-20">
            {/* Left Content - Mobile optimized */}
            <div className="text-left flex flex-col justify-center">
              {/* Main Heading - Larger and more impactful on mobile */}
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-8 font-heading text-white leading-[1.1]">
                {displayTitle}
              </h1>

              {/* Short Tagline */}
              <p className="text-white/90 text-xl sm:text-2xl md:text-2xl mb-8 md:mb-12">
                {displaySubtitle}
              </p>

              {/* CTA Buttons - With motion */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-8 md:mb-12">
                <MotionButton
                  size="lg"
                  variant="cta"
                  className="text-lg md:text-lg px-8 md:px-8 py-5 md:py-6 font-semibold"
                  onClick={() => document.getElementById('quote-standalone')?.scrollIntoView({
                    behavior: 'smooth'
                  })}
                >
                  {displayCtaText}
                </MotionButton>
                <MotionButton 
                  variant="cta-outline" 
                  size="lg" 
                  className="text-base md:text-lg px-6 md:px-6 py-4 md:py-6 bg-white/10 text-white border-white/30 hover:bg-white/20" 
                  onClick={() => document.getElementById('services')?.scrollIntoView({
                    behavior: 'smooth'
                  })}
                >
                  {displayServicesButtonText}
                </MotionButton>
              </div>

              {/* 24/7 Contact */}
              <div className="backdrop-blur-md rounded-xl p-4 md:p-6 inline-block bg-white/10 border border-white/30 shadow-lg hover:bg-white/20 hover:border-white/50 hover:backdrop-blur-xl hover:shadow-[0_8px_32px_hsl(0_0%_100%/0.1),inset_0_1px_0_hsl(0_0%_100%/0.15)] transition-all duration-300 group">
                <p className="text-white/80 dark:text-muted-foreground text-xs md:text-sm mb-1 md:mb-2">24/7 Service</p>
                <a href={phoneHref} className="text-white dark:text-foreground text-2xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2 md:gap-3 transition-colors">
                  <Phone className="h-6 w-6 md:h-7 md:w-7" />
                  <span>{phone}</span>
                </a>
              </div>
            </div>

            {/* Right Content - Quote Form (hidden on mobile) */}
            <div className="hidden md:block lg:block">
              <QuoteForm />
            </div>
          </div>
        </div>
      </section>

      <HeroSectionEditModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} currentData={{
      title: displayTitle,
      subtitle: displaySubtitle,
      ctaButton: displayCtaText,
      servicesButton: displayServicesButtonText,
      phone: phone
    }} />
    </>;
};
