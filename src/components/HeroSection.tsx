import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QuoteForm } from "@/components/QuoteForm";
import { Phone } from "lucide-react";
import { HeroImageEditor } from "@/components/admin/HeroImageEditor";
import { useHeroImage } from "@/hooks/useHeroImage";
import { useEditableContent } from "@/hooks/useEditableContent";
import { useEditMode } from "@/contexts/EditModeContext";
import { Pencil } from "lucide-react";
import { HeroSectionEditModal } from "./HeroSectionEditModal";
import heroDefaultImage from "@/assets/hero-building-maintenance.jpg";
export const HeroSection = () => {
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
  const displayTitle = title || 'Vi tar vare på dine bygg';
  const displaySubtitle = subtitle || 'Vaktmester • Tømrer • Blikk';
  const displayCtaText = ctaText || 'Få tilbud';
  return <>
      <section id="hero" className="min-h-[100svh] md:min-h-screen relative flex items-center pt-20 md:pt-20 section-mobile">
        {/* Background Image with subtle parallax on mobile */}
        <div 
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 parallax-slow ${loading ? 'opacity-0' : 'opacity-100'}`}
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundPosition: 'center 30%'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/95 to-secondary/90 md:from-secondary md:to-secondary" style={{
          opacity
        }}></div>
        </div>
        
        <HeroImageEditor page="home" currentImageUrl={heroImage} onImageUpdate={refetch} />
        
        {isAdmin && editMode && <button onClick={() => setIsModalOpen(true)} className="absolute top-28 md:top-32 right-4 md:right-8 z-20 bg-background rounded-full p-2 md:p-3 shadow-lg border-2 border-primary hover:scale-110 transition-transform" aria-label="Rediger hero-seksjon">
            <Pencil className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </button>}
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-6 md:gap-12 items-center min-h-[calc(100svh-5rem)] md:min-h-[calc(100vh-8rem)] py-4 md:py-20">
            {/* Left Content - Mobile optimized */}
            <div className="text-left flex flex-col justify-center">
              {/* Main Heading - Larger and more impactful on mobile */}
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-8 reveal-up font-heading text-white leading-[1.1]">
                {displayTitle}
              </h1>
              
              {/* Short Tagline */}
              <p className="text-white/90 text-xl sm:text-2xl md:text-2xl mb-8 md:mb-12 reveal-up reveal-stagger-2">
                {displaySubtitle}
              </p>

              {/* CTA Buttons - Prominent on mobile */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 reveal-up reveal-stagger-3 mb-8 md:mb-12">
                <Button size="lg" variant="cta" className="text-lg md:text-lg px-8 md:px-8 py-5 md:py-6 font-semibold" onClick={() => document.getElementById('quote-standalone')?.scrollIntoView({
                behavior: 'smooth'
              })}>
                  {displayCtaText}
                </Button>
                <Button variant="cta-outline" size="lg" className="text-base md:text-lg px-6 md:px-6 py-4 md:py-6 bg-white/10 text-white border-white/30 hover:bg-white/20" onClick={() => document.getElementById('services')?.scrollIntoView({
                behavior: 'smooth'
              })}>
                  Se tjenester
                </Button>
              </div>

              {/* 24/7 Contact */}
              <div className="backdrop-blur-sm rounded-lg p-4 md:p-6 inline-block reveal-up reveal-stagger-4 bg-secondary dark:bg-card border border-border/30 hover:bg-warning hover:border-warning transition-colors group">
                <p className="text-white/80 dark:text-muted-foreground text-xs md:text-sm mb-1 md:mb-2 group-hover:text-warning-foreground">24/7 Service</p>
                <a href="tel:+4741250553" className="text-white dark:text-foreground text-2xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2 md:gap-3 group-hover:text-warning-foreground transition-colors">
                  <Phone className="h-6 w-6 md:h-7 md:w-7" />
                  <span>+47 41250553</span>
                </a>
              </div>
            </div>

            {/* Right Content - Quote Form (hidden on mobile) */}
            <div className="reveal-up reveal-stagger-3 hidden md:block lg:block">
              <QuoteForm />
            </div>
          </div>
          
          {/* Mobile Scroll indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 md:hidden scroll-indicator-pulse">
            <span className="text-white/50 text-xs uppercase tracking-wider">Scroll</span>
            <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
          
          {/* Desktop Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 animate-bounce-down">
            <span className="text-white/60 text-xs uppercase tracking-wider">Scroll ned</span>
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      <HeroSectionEditModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} currentData={{
      title: displayTitle,
      subtitle: displaySubtitle,
      ctaButton: displayCtaText
    }} />
    </>;
};