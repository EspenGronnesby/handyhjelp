import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { ProcessSection } from "@/components/ProcessSection";
import { QuoteForm } from "@/components/QuoteForm";
import { ProjectsSection } from "@/components/ProjectsSection";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { EditableServiceCard } from "@/components/EditableServiceCard";
import { useEditableContent } from "@/hooks/useEditableContent";
import { useEditMode } from "@/contexts/EditModeContext";
import { Pencil } from "lucide-react";
import { SectionHeadingEditModal } from "@/components/SectionHeadingEditModal";

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
      {/* Google Analytics */}
      <GoogleAnalytics />
      
      <Header />
      
      {/* Breadcrumb Navigation */}
      <BreadcrumbNavigation />
      
      {/* Hero Section with Integrated Quote Form */}
      <main>
        <HeroSection />
        
        {/* How It Works Process Section */}
        <section id="process-section" aria-labelledby="process-heading">
          <ProcessSection />
        </section>

        {/* Projects Section */}
        <ProjectsSection />

        {/* Services Section - Compact Overview */}
        <section className="py-16 bg-background" id="services">
          <div className="container mx-auto px-4">
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
              <div className="bg-primary/5 p-8 rounded-xl max-w-3xl mx-auto border-2 border-primary shadow-lg">
                <h3 className="text-2xl font-bold text-foreground mb-4 font-heading">Faste avtaler for bedrifter</h3>
                <div className="space-y-3 text-muted-foreground mb-6">
                  <p className="text-lg">
                    <span className="font-semibold text-foreground">Spar tid og penger</span> med en fast serviceavtale
                  </p>
                  <p>Få fast kontaktperson, prioritert service og forutsigbare kostnader</p>
                  <p className="text-sm">Avtaler fra 1 dag til 5 år • Automatisk fakturering • Fleksible betingelser</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    asChild
                    size="lg"
                    className="bg-success hover:bg-success-hover"
                  >
                    <Link to="/fast-avtale">Forespør fast avtale</Link>
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    onClick={() => document.getElementById('quote-standalone')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Engangsjobb
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Standalone Quote Form Section */}
        <section className="py-16 bg-muted/30" id="quote-standalone" aria-labelledby="quote-heading">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 id="quote-heading" className="heading-section">Klar for å komme i gang?</h2>
                <p className="text-muted-foreground text-lg">
                  Send inn din forespørsel og få kontakt med lokale fagfolk.
                </p>
              </div>
              <QuoteForm />
            </div>
          </div>
        </section>
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
