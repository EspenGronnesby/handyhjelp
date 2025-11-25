import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import servicesBackground from "@/assets/hero-services-background.png";

const Services = () => {
  // Handle smooth scroll to anchor on load
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const id = hash.replace('#', '');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, []);

  const services = [
    {
      id: "vaktmester",
      title: "Vaktmestertjenester",
      subtitle: "Profesjonell eiendomspleie og vedlikehold",
      icon: "🔧",
      services: [
        "Daglig/ukentlig/månedlig tilsyn av bygg",
        "Renhold av fellesarealer og uteområder",
        "Mindre reparasjoner og vedlikehold",
        "Vintervedlikehold (strøing, snørydding)",
        "Inspeksjonsrapporter og dokumentasjon"
      ],
      targetAudience: "Borettslag, sameier, næringseiendom"
    },
    {
      id: "tomrer",
      title: "Tømrertjenester",
      subtitle: "Kvalitetssnekring og konstruksjonsarbeid",
      icon: "🔨",
      services: [
        "Bygging og reparasjon av terrasser",
        "Montering av dører, vinduer og innredning",
        "Takarbeid og taktekking",
        "Renovering av bad og kjøkken (trearbeid)",
        "Laftekonstruksjoner og vedskjul"
      ],
      targetAudience: "Privatpersoner, bedrifter, boligselskaper"
    },
    {
      id: "blikk",
      title: "Blikkenslagertjenester",
      subtitle: "Sikker taktekningsløsninger og vannsystemer",
      icon: "💧",
      services: [
        "Montering og vedlikehold av takrenner",
        "Beslag og blikk på tak og vegger",
        "Tetting og vannsikring",
        "Ventilasjonsarbeider",
        "Inspeksjon av tak og blikkarbeider"
      ],
      targetAudience: "Eiendomsselskaper, borettslag, privatpersoner"
    },
    {
      id: "takrennerens",
      title: "Takrennerens",
      subtitle: "Profesjonell rensing og vedlikehold av takrenner",
      icon: "🌧️",
      description: "Hold takrennene dine i topp stand! Vi fjerner løv, skitt og blokkering for å sikre god drenering og unngå vannskader.",
      services: [
        "Grundig rensing av alle takrenner",
        "Inspeksjon av beslag og feste",
        "Fjerning av løv, mose og rusk",
        "Sjekk av nedløpsrør",
        "Rapport om eventuelle skader"
      ],
      price: "3 390 kr",
      priceIncludes: [
        "Oppmøte og arbeid",
        "Bortføring av avfall",
        "Fast pris – ingen skjulte kostnader",
        "Ferdig på under 2 timer"
      ],
      targetAudience: "Eneboligeiere, rekkehus, mindre bygg",
      popular: true
    }
  ];

  return (
    <div className="min-h-screen">
      <GoogleAnalytics />
      <Header />
      <BreadcrumbNavigation />
      
      {/* Background wrapper with image and overlay - Hero only */}
      <div 
        className="relative bg-cover bg-center bg-fixed bg-no-repeat"
        style={{ backgroundImage: `url(${servicesBackground})` }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-background/85 backdrop-blur-[2px]"></div>
        
        {/* Content over background */}
        <div className="relative z-10">
          {/* Hero Section */}
          <section className="pt-32 pb-12">
            <div className="container mx-auto px-4">
              <div className="text-center max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
                  Våre tjenester
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Profesjonelle håndverkstjenester til konkurransedyktige priser
                </p>
              </div>
            </div>
          </section>

          {/* Pricing Information - Removed calculator, contact for quote */}
          <section className="py-12">
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
        </div>
      </div>

      {/* Services Grid - White background */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
              <Card 
                key={service.id}
                id={service.id}
                className={`hover:shadow-lg transition-shadow relative scroll-mt-24 ${
                  service.popular ? 'border-success border-2' : ''
                }`}
              >
                {service.popular && (
                  <Badge className="absolute top-4 right-4 bg-success text-success-foreground">
                    Populær
                  </Badge>
                )}
                <CardHeader>
                  <div className="flex flex-col items-center text-center">
                    <div className="text-5xl mb-4">{service.icon}</div>
                    <CardTitle className="text-xl mb-2">{service.title}</CardTitle>
                    {service.subtitle && (
                      <p className="text-sm text-muted-foreground">{service.subtitle}</p>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {service.description && (
                    <p className="text-sm mb-4 text-center">{service.description}</p>
                  )}
                  
                  {service.price && (
                    <div className="mb-4 p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground mb-1">Fast pris for enebolig</p>
                      <p className="text-2xl font-bold text-success">{service.price}</p>
                    </div>
                  )}
                  
                  <div className="space-y-2 mb-6">
                    {service.services.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                  
                  {service.priceIncludes && (
                    <div className="mb-4 space-y-1">
                      {service.priceIncludes.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-success shrink-0" />
                          <span className="text-xs text-muted-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {service.targetAudience && (
                    <p className="text-xs text-muted-foreground mb-4 text-center italic">
                      Målgruppe: {service.targetAudience}
                    </p>
                  )}
                  
                  <Link to="/tilbud">
                    <Button variant="cta" className="w-full">
                      {service.id === 'takrennerens' ? 'Bestill takrennerens' : 'Bestill tjeneste'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Details */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-heading font-bold text-center mb-12">
              Hva inkluderer prisen?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Inkludert i timeprisen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    "Fagkyndig arbeidskraft",
                    "Standard verktøy og utstyr",
                    "Opprydding etter arbeid",
                    "Kvalitetskontroll",
                    "Forsikring og garantier"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Faktureres separat</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    "Materialer (estimat oppgis)",
                    "Kjøring over 5 km (10 kr/km)",
                    "Avfallshåndtering (etter volum)",
                    "Ekstra tid uten avtalt pris (+50 kr/t)",
                    "Akuttservice kveld/helg (+200 kr)"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison: One-time vs Fixed */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold mb-4">
              Fast avtale = 10% rabatt
            </h2>
            <p className="text-muted-foreground">
              Få forutsigbare kostnader og prioritert service
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Engangsjobb</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Fleksibel bestilling",
                  "Ingen binding",
                  "Standard timepriser",
                  "Betaler kun for utført arbeid"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-success border-2">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>Fast avtale</CardTitle>
                  <Badge className="bg-success text-success-foreground">Spar 10%</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "10% rabatt på alle tjenester",
                  "Prioritert service",
                  "Fast kontaktperson",
                  "Planlagt vedlikehold",
                  "Forutsigbare kostnader"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Link to="/fast-avtale">
              <Button variant="cta" size="lg">
                Få tilbud på fast avtale
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
