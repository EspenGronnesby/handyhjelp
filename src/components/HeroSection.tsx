import { lazy, Suspense, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QuickCallbackForm } from "@/components/QuickCallbackForm";
import { QuickCallbackDialog } from "@/components/QuickCallbackDialog";
import { Phone } from "lucide-react";
import { useHeroImage } from "@/hooks/useHeroImage";
import { useEditableContent } from "@/hooks/useEditableContent";
import { useContactInfo } from "@/hooks/useContactInfo";
import { useEditMode } from "@/contexts/EditModeContext";
import { EditButton } from "@/components/ui/EditButton";
import heroDefaultImage from "@/assets/hero-building-maintenance.webp";
import { MotionButton } from "@/components/motion";


// Admin-only chunks — never shipped to anonymous visitors
const HeroImageEditor = lazy(() => import("@/components/admin/HeroImageEditor").then(m => ({ default: m.HeroImageEditor })));
const HeroSectionEditModal = lazy(() => import("./HeroSectionEditModal").then(m => ({ default: m.HeroSectionEditModal })));

export const HeroSection = () => {
  const {
    heroImage,
    opacity,
    refetch
  } = useHeroImage('home', heroDefaultImage);
  const {
    editMode,
    isAdmin
  } = useEditMode();
  const navigate = useNavigate();
  const { phone, phoneHref } = useContactInfo();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    content: title
  } = useEditableContent('hero-home', 'title');
  const {
    content: subtitle
  } = useEditableContent('hero-home', 'subtitle');
  const {
    content: servicesButtonText
  } = useEditableContent('hero-home', 'services-button');
  const displayTitle = title || 'Vi tar vare på dine bygg';
  const displaySubtitle = subtitle || 'Vaktmester • Tømrer • Blikk';
  const displayCtaText = 'Vi ringer deg →';
  const displayServicesButtonText = servicesButtonText || 'Se tjenester';

  return <>
      <section
        id="hero"
        className="min-h-[75svh] md:min-h-screen relative flex items-center pt-20 md:pt-20 section-mobile overflow-hidden"
      >
        {/* LCP-element: ekte <img> med fetchpriority="high" gir raskere LCP enn CSS background-image */}
        <img
          src={heroImage}
          alt=""
          aria-hidden="true"
          width={1920}
          height={1080}
          decoding="async"
          // @ts-expect-error fetchpriority er gyldig HTML-attributt, ennå ikke i React-typene
          fetchpriority="high"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 30%' }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-secondary/90 to-secondary/85 dark:from-secondary/80 dark:to-secondary/75"
          style={{ opacity }}
        />


        {isAdmin && (
          <Suspense fallback={null}>
            <HeroImageEditor page="home" currentImageUrl={heroImage} onImageUpdate={refetch} />
          </Suspense>
        )}

        {/* Edit hero content (title/subtitle/CTA) — placed next to image-edit camera button */}
        {isAdmin && editMode && (
          <EditButton
            onClick={() => setIsModalOpen(true)}
            ariaLabel="Rediger hero-tekst (overskrift, undertekst, knapp)"
            className="bottom-4 right-20 top-auto z-30"
          />
        )}

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-6 md:gap-12 items-center min-h-[calc(75svh-5rem)] md:min-h-[calc(100vh-8rem)] py-4 md:py-20">
            {/* Left Content - Mobile optimized */}
            <div className="text-left flex flex-col justify-center">
              {/* Main Heading - plain white text */}
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-8 font-heading text-white leading-[1.1]">
                {displayTitle}
              </h1>

              {/* Short Tagline */}
              <p className="text-white/90 text-xl sm:text-2xl md:text-2xl mb-8 md:mb-12">
                {displaySubtitle}
              </p>

              {/* CTA Buttons - With motion */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-8 md:mb-12">
                <QuickCallbackDialog>
                  <MotionButton
                    size="lg"
                    variant="cta"
                    className="text-lg md:text-lg px-8 md:px-8 py-5 md:py-6 font-semibold"
                  >
                    {displayCtaText}
                  </MotionButton>
                </QuickCallbackDialog>
                <MotionButton
                  variant="cta-outline"
                  size="lg"
                  className="text-base md:text-lg px-6 md:px-6 py-4 md:py-6 bg-white/10 text-white border-white/30 hover:bg-white/20"
                  onClick={() => navigate('/tjenester')}
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

            {/* Right Content — kort lead-capture (kun synlig på desktop, mobil/iPad bruker dialog-knappen) */}
            <div className="hidden lg:block">
              <QuickCallbackForm />
            </div>
          </div>
        </div>
      </section>

      {isAdmin && isModalOpen && (
        <Suspense fallback={null}>
          <HeroSectionEditModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} currentData={{
            title: displayTitle,
            subtitle: displaySubtitle,
            servicesButton: displayServicesButtonText,
            phone: phone,
          }} />
        </Suspense>
      )}
    </>;
};
