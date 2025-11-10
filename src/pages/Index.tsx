import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { ProcessSection } from "@/components/ProcessSection";
import { QuoteForm } from "@/components/QuoteForm";
import { FAQSection } from "@/components/FAQ/FAQSection";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
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

        {/* FAQ Section with Structured Data */}
        <FAQSection />

        {/* Services Section */}
        <section className="py-16 bg-background" id="services">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="heading-section">Våre tjenester</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Fra flyttehjelp til småjobber – vi løser praktiske oppgaver raskt og trygt.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {[
                {
                  title: "Flyttehjelp",
                  description: "Bæring, transport og trygg flytting",
                  details: "Bæring mellom bolig/etasje, laste/lossing av varebil, sikring av møbler"
                },
                {
                  title: "Montering", 
                  description: "Møbler, hvitevarer og utstyr",
                  details: "IKEA-møbler, TV-veggfeste, hvitevare-innsetting (uten rør/strøm-omlegging)"
                },
                {
                  title: "Rydding & bortkjøring",
                  description: "Vi sorterer og kjører bort avfall",
                  details: "Henting av gamle møbler, hageavfall, smådeponi-turer"
                },
                {
                  title: "Tømrer jobber",
                  description: "Profesjonelle tømrer- og snekkerarbeider",
                  details: "Bygge/reparere terrasser, sette opp hyller, enkle snekkerarbeider, vedlikehold av trekonstruksjoner"
                },
                {
                  title: "Småjobber",
                  description: "Enkle reparasjoner og vedlikehold",
                  details: "Små sparkling/maling, skifte håndtak/grep, enkle utendørs småjobber"
                }
              ].map((service, index) => (
                <div key={index} className="card-professional p-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">{service.title}</h3>
                  <p className="text-muted-foreground font-medium mb-3">{service.description}</p>
                  <p className="text-sm text-muted-foreground">{service.details}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <div className="bg-muted/30 p-8 rounded-xl max-w-2xl mx-auto">
                <h3 className="text-xl font-bold text-foreground mb-4">Priser og vilkår</h3>
                <div className="space-y-2 text-muted-foreground mb-6">
                  <p><span className="font-semibold">Fra 600 kr/time inkl. mva</span></p>
                  <p>Minstetid: 1 time, deretter per påbegynt 30. min</p>
                  <p>Førstegangs-kunde: -10% på første oppdrag</p>
                  <p>Materialer/forbruk faktureres etter kvittering</p>
                </div>
                <Button 
                  size="lg"
                  className="bg-success hover:bg-success-hover text-success-foreground"
                  onClick={() => document.getElementById('quote-standalone')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Få uforpliktende tilbud
                </Button>
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
      <footer className="py-8 bg-card border-t">
        <div className="container mx-auto px-4 text-center">
          <Link 
            to="/kunde-innlogging" 
            className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
          >
            Er du eksisterende kunde? Se dine prosjekter →
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Index;
