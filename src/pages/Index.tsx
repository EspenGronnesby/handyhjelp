import { lazy, useState } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { EditableServiceCard } from "@/components/EditableServiceCard";
import { useEditableContent } from "@/hooks/useEditableContent";
import { useEditMode } from "@/contexts/EditModeContext";
import { EditButton } from "@/components/ui/EditButton";
import { SectionHeadingEditModal } from "@/components/SectionHeadingEditModal";
import { TrustStripe } from "@/components/TrustStripe";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Wrench } from "lucide-react";
import { PageSEO } from "@/components/SEO/PageSEO";
import { useSequentialReveal } from "@/hooks/useScrollAnimation";
import { LazySection } from "@/components/LazySection";

// Below-the-fold sections — split into separate chunks so they don't block
// the initial paint of the hero.
const ProcessSection = lazy(() => import("@/components/ProcessSection").then(m => ({ default: m.ProcessSection })));
const ProjectsSection = lazy(() => import("@/components/ProjectsSection").then(m => ({ default: m.ProjectsSection })));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection"));
const ClientLogosSection = lazy(() => import("@/components/ClientLogosSection"));
const GuaranteeSection = lazy(() => import("@/components/GuaranteeSection").then(m => ({ default: m.GuaranteeSection })));
const EditableBottomCTA = lazy(() => import("@/components/EditableBottomCTA").then(m => ({ default: m.EditableBottomCTA })));
const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));
const StickyMobileCTA = lazy(() => import("@/components/StickyMobileCTA").then(m => ({ default: m.StickyMobileCTA })));

// Component for Services Section Heading
const ServicesHeading = () => {
  const { editMode, isAdmin } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { content: heading } = useEditableContent('home-sections', 'services-heading');
  const { content: subheading } = useEditableContent('home-sections', 'services-subheading');

  const displayHeading = heading || 'Våre tjenester';
  const displaySubheading = subheading || 'Profesjonell håndverksarbeid for alle behov';

  return (
    <>
      <div className="relative mb-12">
        {isAdmin && editMode && (
          <EditButton
            onClick={() => setIsModalOpen(true)}
            ariaLabel="Rediger Våre tjenester overskrift"
          />
        )}

        <SectionHeading
          icon={Wrench}
          gradient="from-cyan-500 via-blue-500 to-indigo-600"
          title={displayHeading}
          subtitle={displaySubheading}
          align="center"
        />
      </div>

      {isAdmin && editMode && (
        <SectionHeadingEditModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          section="home-sections"
          currentData={{
            heading: displayHeading,
            subheading: displaySubheading,
          }}
          sectionLabel="Våre tjenester"
        />
      )}
    </>
  );
};

const Index = () => {
  const { user } = useAuth();
  const { ref: servicesRef, isVisible: servicesVisible, getItemStyle } = useSequentialReveal(4);

  return (
    <div className="min-h-screen">
      <PageSEO path="/" />
      <GoogleAnalytics />

      <Header />

      <BreadcrumbNavigation />

      <main id="main-content">
        {/* Above the fold — eager */}
        <HeroSection />
        <TrustStripe />

        {/* Below the fold — mounted only when scrolled near */}
        <LazySection minHeight="240px">
          <ClientLogosSection />
        </LazySection>

        <LazySection minHeight="600px">
          <section id="process-section" aria-labelledby="process-heading" className="bg-muted/40">
            <ProcessSection />
          </section>
        </LazySection>

        <LazySection minHeight="500px">
          <GuaranteeSection />
        </LazySection>

        <LazySection minHeight="700px">
          <ProjectsSection />
        </LazySection>

        <LazySection minHeight="500px">
          <TestimonialsSection />
        </LazySection>

        {/* Services overview — kept inline (light JSX) but reveal-animated */}
        <section className="py-10 md:py-24 bg-background" id="services" ref={servicesRef}>
          <div className="container mx-auto px-4">
            <div className={`transition-all duration-700 ${servicesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <ServicesHeading />

              <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6 max-w-5xl mx-auto mb-8 md:mb-12">
                <div style={getItemStyle(0)}>
                  <EditableServiceCard
                    section="service-vaktmester"
                    id="vaktmester"
                    icon="🔧"
                    defaultTitle="Vaktmestertjenester"
                    defaultSubtitle="Profesjonell eiendomspleie og vedlikehold"
                    defaultBullets={[
                      "Daglig/ukentlig/månedlig tilsyn av bygg",
                      "Renhold av fellesarealer og uteområder",
                      "Vintervedlikehold (strøing, snørydding)",
                    ]}
                  />
                </div>

                <div style={getItemStyle(1)}>
                  <EditableServiceCard
                    section="service-takrennerens"
                    id="takrennerens"
                    icon="🌧️"
                    popular={true}
                    defaultTitle="Takrennerens"
                    defaultSubtitle="Profesjonell rensing og vedlikehold av takrenner"
                    defaultBullets={[
                      "Grundig rensing av alle takrenner",
                      "Fjerning av løv, mose og rusk",
                      "Fast pris: 3 390 kr for enebolig",
                    ]}
                  />
                </div>

                <div style={getItemStyle(2)}>
                  <EditableServiceCard
                    section="service-tomrer"
                    id="tomrer"
                    icon="🔨"
                    defaultTitle="Tømrertjenester"
                    defaultSubtitle="Kvalitetssnekring og konstruksjonsarbeid"
                    defaultBullets={[
                      "Bygging og reparasjon av terrasser",
                      "Montering av dører, vinduer og innredning",
                      "Takarbeid og taktekking",
                    ]}
                  />
                </div>

                <div style={getItemStyle(3)}>
                  <EditableServiceCard
                    section="service-blikk"
                    id="blikk"
                    icon="💧"
                    defaultTitle="Blikkenslagertjenester"
                    defaultSubtitle="Sikker taktekningsløsninger og vannsystemer"
                    defaultBullets={[
                      "Montering og vedlikehold av takrenner",
                      "Beslag og blikk på tak og vegger",
                      "Tetting og vannsikring",
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <LazySection minHeight="400px">
          <div id="quote-standalone">
            <EditableBottomCTA />
          </div>
        </LazySection>
      </main>

      <div className="py-8 bg-muted border-t">
        <div className="container mx-auto px-4 text-center">
          {user ? (
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium">
              Gå til din profil →
            </Link>
          ) : (
            <Link to="/auth" className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium">
              Er du eksisterende kunde? Logg inn her →
            </Link>
          )}
        </div>
      </div>

      <LazySection minHeight="300px">
        <Footer />
      </LazySection>

      <LazySection minHeight="0px">
        <StickyMobileCTA />
      </LazySection>
    </div>
  );
};

export default Index;
