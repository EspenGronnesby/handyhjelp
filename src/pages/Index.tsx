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
            <div className="text-center mb-12">
              <h2 className="heading-section font-heading">Våre tjenester</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Profesjonell håndverksarbeid for alle behov
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
              {[
                {
                  id: "vaktmester",
                  title: "Vaktmestertjenester",
                  subtitle: "Profesjonell eiendomspleie og vedlikehold",
                  icon: "🔧",
                  highlights: [
                    "Daglig/ukentlig/månedlig tilsyn av bygg",
                    "Renhold av fellesarealer og uteområder",
                    "Vintervedlikehold (strøing, snørydding)"
                  ]
                },
                {
                  id: "takrennerens",
                  title: "Takrennerens",
                  subtitle: "Profesjonell rensing og vedlikehold av takrenner",
                  icon: "🌧️",
                  popular: true,
                  highlights: [
                    "Grundig rensing av alle takrenner",
                    "Fjerning av løv, mose og rusk",
                    "Fast pris: 3 390 kr for enebolig"
                  ]
                },
                {
                  id: "tomrer",
                  title: "Tømrertjenester",
                  subtitle: "Kvalitetssnekring og konstruksjonsarbeid",
                  icon: "🔨",
                  highlights: [
                    "Bygging og reparasjon av terrasser",
                    "Montering av dører, vinduer og innredning",
                    "Takarbeid og taktekking"
                  ]
                },
                {
                  id: "blikk",
                  title: "Blikkenslagertjenester",
                  subtitle: "Sikker taktekningsløsninger og vannsystemer",
                  icon: "💧",
                  highlights: [
                    "Montering og vedlikehold av takrenner",
                    "Beslag og blikk på tak og vegger",
                    "Tetting og vannsikring"
                  ]
                }
              ].map((service) => (
                <div 
                  key={service.id} 
                  className={`relative bg-card rounded-lg p-6 shadow-md hover:shadow-xl transition-all duration-300 border ${
                    service.popular ? 'border-success border-2' : 'border-border'
                  }`}
                >
                  {service.popular && (
                    <div className="absolute top-4 right-4 bg-success text-success-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      Populær
                    </div>
                  )}
                  
                  <div className="text-4xl mb-3">{service.icon}</div>
                  
                  <h3 className="text-xl font-bold text-foreground mb-1 font-heading">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {service.subtitle}
                  </p>
                  
                  <ul className="space-y-2 mb-6">
                    {service.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start text-sm">
                        <span className="text-success mr-2 mt-0.5">✓</span>
                        <span className="text-muted-foreground">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link to={`/tjenester#${service.id}`}>
                    <Button 
                      variant="outline" 
                      className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      Les mer
                    </Button>
                  </Link>
                </div>
              ))}
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
