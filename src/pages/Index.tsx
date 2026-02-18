import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { ProcessSection } from "@/components/ProcessSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { EditableServiceCard } from "@/components/EditableServiceCard";
import { useEditableContent } from "@/hooks/useEditableContent";
import { useEditMode } from "@/contexts/EditModeContext";
import { Pencil } from "lucide-react";
import { SectionHeadingEditModal } from "@/components/SectionHeadingEditModal";
import { EditableCTABox } from "@/components/EditableCTABox";
import { EditableBottomCTA } from "@/components/EditableBottomCTA";
import TestimonialsSection from "@/components/TestimonialsSection";
import ClientLogosSection from "@/components/ClientLogosSection";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { ScrollProgress } from "@/components/ScrollProgress";
import { PageSEO } from "@/components/SEO/PageSEO";
import { useScrollGridReveal } from "@/hooks/useScrollAnimation";

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
      <div className="relative text-center mb-12">
        {isAdmin && editMode && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute top-0 right-4 z-10 bg-background rounded-full p-2 shadow-lg border-2 border-primary hover:scale-110 transition-transform"
            aria-label="Rediger Våre tjenester overskrift"
          >
            <Pencil className="h-5 w-5 text-primary" />
          </button>
        )}
        
        <h2 className="heading-section font-heading">
          {displayHeading}
        </h2>
        
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {displaySubheading}
        </p>
      </div>

      <SectionHeadingEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        section="home-sections"
        currentData={{
          heading: displayHeading,
          subheading: displaySubheading
        }}
        sectionLabel="Våre tjenester"
      />
    </>
  );
};

const Index = () => {
  const { user } = useAuth();
  const { ref: servicesRef, isInView: servicesVisible, getItemStyle } = useScrollGridReveal(4, 2);
  
  return (
    <div className="min-h-screen">
      <PageSEO path="/" />
      {/* Google Analytics */}
      <GoogleAnalytics />
      
      <Header />
      
      {/* Breadcrumb Navigation */}
      <BreadcrumbNavigation />
      
      {/* Hero Section with Integrated Quote Form */}
      <main id="main-content">
        <HeroSection />

        {/* Client Logos Section */}
        <ClientLogosSection />
        
        {/* How It Works Process Section */}
        <section id="process-section" aria-labelledby="process-heading">
          <ProcessSection />
        </section>

        {/* Projects Section */}
        <ProjectsSection />

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* Services Section - Compact Overview */}
        <section className="py-12 md:py-16 bg-background section-mobile" id="services" ref={servicesRef}>
          <div className="container mx-auto px-4">
            <div className={`bg-card rounded-2xl shadow-lg border border-border/50 p-6 md:p-12 transition-all duration-700 ${servicesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
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
                    "Vintervedlikehold (strøing, snørydding)"
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
                    "Fast pris: 3 390 kr for enebolig"
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
                    "Takarbeid og taktekking"
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
                    "Tetting og vannsikring"
                  ]}
                />
              </div>
            </div>

            <div className="text-center">
              <EditableCTABox />
            </div>
            </div>
          </div>
        </section>

        {/* Standalone Quote Form Section */}
        <div id="quote-standalone">
          <EditableBottomCTA />
        </div>
      </main>

      {/* Customer Portal Link */}
      <div className="py-8 bg-muted border-t">
        <div className="container mx-auto px-4 text-center">
          {user ? (
            <Link 
              to="/dashboard" 
              className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
            >
              Gå til din profil →
            </Link>
          ) : (
            <Link 
              to="/auth" 
              className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
            >
              Er du eksisterende kunde? Logg inn her →
            </Link>
          )}
        </div>
      </div>

      <Footer />
      
      {/* Scroll Progress Indicator - Mobile only */}
      <ScrollProgress />
      
      {/* Sticky Mobile CTA */}
      <StickyMobileCTA />
    </div>
  );
};

export default Index;
