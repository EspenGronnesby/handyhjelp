import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { ProcessSection } from "@/components/ProcessSection";
import { QuoteForm } from "@/components/QuoteForm";
import { ProjectsSection } from "@/components/ProjectsSection";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        
        {/* Pricing Information - Quick Contact */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <Card className="max-w-2xl mx-auto text-center">
              <CardHeader>
                <CardTitle>Trenger du et pristilbud?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Kontakt oss for et skreddersydd pristilbud basert på dine behov.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="cta" size="lg" onClick={() => window.location.href = '/tilbud'}>
                    Få gratis tilbud
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => window.location.href = 'tel:+4741250553'}>
                    Ring oss: +47 41250553
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
        
        {/* How It Works Process Section */}
        <section id="process-section" aria-labelledby="process-heading">
          <ProcessSection />
        </section>

        {/* Projects Section */}
        <ProjectsSection />

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
                  cta: "Kontakt for pristilbud"
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
                  cta: "Kontakt for pristilbud"
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
                  cta: "Kontakt for pristilbud"
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
                    <p className="text-base font-semibold text-primary">{service.cta}</p>
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
