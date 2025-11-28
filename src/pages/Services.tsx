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
import { HeroImageEditor } from "@/components/admin/HeroImageEditor";
import { useHeroImage } from "@/hooks/useHeroImage";
import servicesBackground from "@/assets/hero-services-background.png";
import { EditableCTABox } from "@/components/EditableCTABox";
import { EditableBottomCTA } from "@/components/EditableBottomCTA";
import { EditableHero } from "@/components/EditableHero";

const Services = () => {
  const { heroImage, opacity, refetch: refetchHero } = useHeroImage('services', servicesBackground);

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
      
      {/* Hero Section - Enhanced with gradient overlay */}
      <div 
        className="relative min-h-[600px] flex items-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        {/* Enhanced gradient overlay for better readability */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-background via-background to-background backdrop-blur-[3px]"
          style={{ opacity }}
        ></div>
        
        <HeroImageEditor page="services" currentImageUrl={heroImage} onImageUpdate={refetchHero} />
        
        {/* Content over background */}
        <div className="relative z-10 w-full py-20">
          <div className="container mx-auto px-4">
            <EditableHero
              section="hero-tjenester"
              defaultHeading="Våre tjenester"
              defaultSubtext="Fra vaktmester til tømrer – vi har ekspertisen du trenger. Profesjonelle håndverkstjenester til konkurransedyktige priser"
              className="max-w-4xl mx-auto mb-12"
            />

            {/* Editable CTA Box */}
            <EditableCTABox />
          </div>
        </div>
      </div>

      {/* Services Grid - Redesigned with 2x2 layout */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {services.map((service, index) => (
              <Card 
                key={service.id}
                id={service.id}
                className={`group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative scroll-mt-24 p-8 h-[520px] flex flex-col animate-fade-in ${
                  service.popular ? 'border-primary border-2 shadow-lg' : 'border-border'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {service.popular && (
                  <Badge className="absolute top-6 right-6 bg-primary text-primary-foreground px-4 py-1 text-sm">
                    Populær
                  </Badge>
                )}
                
                {/* Icon section with circular background */}
                <div className="flex justify-start mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{service.icon}</span>
                  </div>
                </div>

                {/* Title and subtitle */}
                <div className="mb-4">
                  <CardTitle className="text-2xl font-bold mb-2">{service.title}</CardTitle>
                  {service.subtitle && (
                    <p className="text-base text-muted-foreground font-light italic">{service.subtitle}</p>
                  )}
                </div>

                {/* Price for Takrennerens */}
                {service.price && (
                  <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-xs text-muted-foreground mb-1">Fast pris for enebolig</p>
                    <p className="text-3xl font-bold text-primary">Fra {service.price}</p>
                  </div>
                )}

                {/* Services list - flex grow to push button down */}
                <div className="space-y-2 mb-6 flex-grow">
                  {service.services.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Target audience */}
                {service.targetAudience && (
                  <p className="text-xs text-muted-foreground mb-4 italic border-t border-border pt-4">
                    <span className="font-semibold">Målgruppe:</span> {service.targetAudience}
                  </p>
                )}

                {/* Button at bottom */}
                <Link to={`/tjenester/${service.id}`} className="mt-auto">
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    Les mer
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose HandyHjelp Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-16">
            Hvorfor velge HandyHjelp?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6 rounded-lg hover:bg-background transition-colors duration-300">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Erfarne fagfolk</h3>
              <p className="text-muted-foreground">
                Over 20 års erfaring i bransjen med sertifiserte håndverkere
              </p>
            </div>

            <div className="text-center p-6 rounded-lg hover:bg-background transition-colors duration-300">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Konkurransedyktige priser</h3>
              <p className="text-muted-foreground">
                Kvalitet til riktig pris – vi garanterer gode priser uten å gå på kompromiss med kvalitet
              </p>
            </div>

            <div className="text-center p-6 rounded-lg hover:bg-background transition-colors duration-300">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Rask respons</h3>
              <p className="text-muted-foreground">
                Vi er der når du trenger oss – svartid på 1-3 virkedager
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Details */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-16">
              Hva inkluderer prisen?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-xl">Inkludert i timeprisen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "Fagkyndig arbeidskraft",
                    "Standard verktøy og utstyr",
                    "Opprydding etter arbeid",
                    "Kvalitetskontroll",
                    "Forsikring og garantier"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                      <span className="text-base leading-relaxed">{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-xl">Faktureres separat</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "Materialer (estimat oppgis)",
                    "Kjøring over 5 km (10 kr/km)",
                    "Avfallshåndtering (etter volum)",
                    "Ekstra tid uten avtalt pris (+50 kr/t)",
                    "Akuttservice kveld/helg (+200 kr)"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <ArrowRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-base leading-relaxed">{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison: One-time vs Fixed */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Fast avtale = 10% rabatt
            </h2>
            <p className="text-muted-foreground text-lg">
              Få forutsigbare kostnader og prioritert service
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="text-2xl">Engangsjobb</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  "Fleksibel bestilling",
                  "Ingen binding",
                  "Standard timepriser",
                  "Betaler kun for utført arbeid"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                    <span className="text-base">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-primary border-2 shadow-lg p-6">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-2xl">Fast avtale</CardTitle>
                  <Badge className="bg-primary text-primary-foreground px-3 py-1">Spar 10%</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  "10% rabatt på alle tjenester",
                  "Prioritert service",
                  "Fast kontaktperson",
                  "Planlagt vedlikehold",
                  "Forutsigbare kostnader"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                    <span className="text-base">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Link to="/fast-avtale">
              <Button variant="cta" size="lg" className="text-lg px-10">
                Få tilbud på fast avtale
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Editable Bottom CTA Section */}
      <EditableBottomCTA />

      <Footer />
    </div>
  );
};

export default Services;
