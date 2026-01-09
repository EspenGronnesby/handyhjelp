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
import { Helmet } from "react-helmet";

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
  
  return (
    <div className="min-h-screen">
      <Helmet>
        <title>HandyHjelp | Profesjonelle håndverkstjenester i Kristiansand</title>
        <meta name="description" content="HandyHjelp tilbyr profesjonelle vaktmester-, tømrer- og blikkenslagertjenester i Kristiansand. Få gratis tilbud i dag!" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="HandyHjelp | Profesjonelle håndverkstjenester i Kristiansand" />
        <meta property="og:description" content="HandyHjelp tilbyr profesjonelle vaktmester-, tømrer- og blikkenslagertjenester i Kristiansand. Få gratis tilbud i dag!" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://handyhjelp.no" />
        <meta property="og:image" content="https://handyhjelp.no/og-image.jpg" />
        <meta property="og:locale" content="nb_NO" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="HandyHjelp | Profesjonelle håndverkstjenester i Kristiansand" />
        <meta name="twitter:description" content="HandyHjelp tilbyr profesjonelle vaktmester-, tømrer- og blikkenslagertjenester i Kristiansand. Få gratis tilbud i dag!" />
      </Helmet>
      {/* Google Analytics */}
      <GoogleAnalytics />
      
      <Header />
      
      {/* Breadcrumb Navigation */}
      <BreadcrumbNavigation />
      
      {/* Hero Section with Integrated Quote Form */}
      <main id="main-content">
        <HeroSection />
        
        {/* How It Works Process Section */}
        <section id="process-section" aria-labelledby="process-heading">
          <ProcessSection />
        </section>

        {/* Projects Section */}
        <ProjectsSection />

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* Services Section - Compact Overview */}
        <section className="py-16 bg-background" id="services">
          <div className="container mx-auto px-4">
            <div className="bg-card rounded-2xl shadow-lg border border-border/50 p-8 md:p-12">
            <ServicesHeading />

            
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
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
    </div>
  );
};

export default Index;
