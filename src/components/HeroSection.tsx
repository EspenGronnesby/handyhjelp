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
      <section className="min-h-[100svh] md:min-h-screen relative flex items-center pt-24 md:pt-20">
        {/* Background Image - fade in when loaded */}
        <div 
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`}
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
          <div className="grid lg:grid-cols-2 gap-6 md:gap-12 items-center min-h-[calc(100svh-6rem)] md:min-h-[calc(100vh-8rem)] py-6 md:py-20">
            {/* Left Content */}
            <div className="text-left">
              {/* Main Heading - Smaller on mobile */}
              <h1 className="text-3xl sm:text-4xl md:text-7xl font-bold mb-4 md:mb-8 animate-fade-in-left font-heading text-white leading-tight">
                {displayTitle}
              </h1>
              
              {/* Short Tagline */}
              <p className="text-white/90 text-lg sm:text-xl md:text-2xl mb-6 md:mb-12 animate-fade-in-left">
                {displaySubtitle}
              </p>

              {/* CTA Buttons - Stack on mobile */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 animate-fade-in-left mb-6 md:mb-12">
                <Button size="lg" variant="cta" className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6" onClick={() => document.getElementById('quote-standalone')?.scrollIntoView({
                behavior: 'smooth'
              })}>
                  {displayCtaText}
                </Button>
                <Button variant="cta-outline" size="lg" className="text-base md:text-lg px-4 md:px-6 py-4 md:py-6 bg-white/10 text-white border-white/30 hover:bg-white/20" onClick={() => document.getElementById('services')?.scrollIntoView({
                behavior: 'smooth'
              })}>
                  Se tjenester
                </Button>
              </div>

              {/* 24/7 Contact - Smaller on mobile */}
              <div className="backdrop-blur-sm rounded-lg p-4 md:p-6 inline-block animate-fade-in-left bg-secondary dark:bg-card border border-border/30 hover:bg-warning hover:border-warning transition-colors group">
                <p className="text-white/80 dark:text-muted-foreground text-xs md:text-sm mb-1 md:mb-2 group-hover:text-warning-foreground">24/7 Service</p>
                <a href="tel:+4741250553" className="text-white dark:text-foreground text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2 md:gap-3 group-hover:text-warning-foreground transition-colors">
                  <Phone className="h-5 w-5 md:h-7 md:w-7" />
                  <span>+47 41250553</span>
                </a>
              </div>
            </div>

            {/* Right Content - Quote Form (hidden on small mobile, visible from sm) */}
            <div className="animate-fade-in-right hidden sm:block lg:block">
              <QuoteForm />
            </div>
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