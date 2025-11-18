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
              <h2 className="heading-section font-heading">Våre hovedtjenester</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Profesjonell eiendomspleie skreddersydd for dine behov
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                {
                  title: "Vaktmestertjenester",
                  icon: "🔧",
                  description: "Profesjonell eiendomspleie og vedlikehold",
                  details: [
                    "Daglig/ukentlig/månedlig tilsyn av bygg",
                    "Renhold av fellesarealer og uteområder",
                    "Mindre reparasjoner og vedlikehold",
                    "Vintervedlikehold (strøing, snørydding)",
                    "Inspeksjonsrapporter og dokumentasjon"
                  ],
                  target: "Borettslag, sameier, næringseiendom",
                  price: "Fra 650 kr/time"
                },
                {
                  title: "Tømrertjenester",
                  icon: "🔨",
                  description: "Kvalitetssnekring og konstruksjonsarbeid",
                  details: [
                    "Bygging og reparasjon av terrasser",
                    "Montering av dører, vinduer og innredning",
                    "Takarbeid og taktekking",
                    "Renovering av bad og kjøkken (trearbeid)",
                    "Laftekonstruksjoner og vedskjul"
                  ],
                  target: "Privatpersoner, bedrifter, boligselskaper",
                  price: "Fra 750 kr/time"
                },
                {
                  title: "Blikkenslagertjenester",
                  icon: "💧",
                  description: "Sikker taktekkningsløsninger og vannsystemer",
                  details: [
                    "Montering og vedlikehold av takrenner",
                    "Beslag og blikk på tak og vegger",
                    "Tetting og vannsikring",
                    "Ventilasjonsarbeider",
                    "Inspeksjon av tak og blikkarbeider"
                  ],
                  target: "Eiendomsselskaper, borettslag, privatpersoner",
                  price: "Fra 800 kr/time"
                }
              ].map((service, index) => (
                <div key={index} className="card-professional p-8 hover:shadow-xl transition-all duration-300">
                  <div className="text-5xl mb-4">{service.icon}</div>
                  <h3 className="text-2xl font-bold text-foreground mb-2 font-heading">{service.title}</h3>
                  <p className="text-primary font-medium mb-4">{service.description}</p>
                  
                  <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                    {service.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-success mr-2">✓</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="border-t border-border pt-4 space-y-2">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">Målgruppe:</span> {service.target}
                    </p>
                    <p className="text-lg font-bold text-primary">{service.price}</p>
                  </div>
                  
                  <Button 
                    className="w-full mt-4 bg-primary hover:bg-primary-hover"
                    onClick={() => document.getElementById('quote-standalone')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Bestill tjeneste
                  </Button>
                </div>
              ))}
            </div>

            <div className="text-center">
              <div className="bg-accent/50 p-8 rounded-xl max-w-3xl mx-auto border-2 border-primary/20">
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
                    size="lg"
                    className="bg-success hover:bg-success-hover"
                    onClick={() => document.getElementById('quote-standalone')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Forespør fast avtale
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
