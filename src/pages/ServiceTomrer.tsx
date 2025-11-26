import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { HeroImageEditor } from "@/components/admin/HeroImageEditor";
import { useHeroImage } from "@/hooks/useHeroImage";
import servicesBackground from "@/assets/hero-services-background.png";

const ServiceTomrer = () => {
  const { heroImage, opacity, refetch } = useHeroImage('services-tomrer', servicesBackground);
  const benefits = [
    "Erfarne fagfolk med mange års erfaring",
    "Fast kontaktperson for din eiendom",
    "Konkurransedyktige priser",
    "Rask respons på henvendelser"
  ];

  const included = [
    "Bygging og reparasjon av terrasser",
    "Montering av dører, vinduer og innredning",
    "Takarbeid og taktekking",
    "Renovering av bad og kjøkken (trearbeid)",
    "Laftekonstruksjoner og vedskjul",
    "Tilpasninger og spesialarbeider",
    "Kvalitetskontroll og garantier"
  ];

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Tømrertjenester - HandyHjelp</title>
        <meta name="description" content="Kvalitetssnekring og konstruksjonsarbeid fra erfarne tømrere. Vi leverer solid håndverk som varer for privatpersoner, bedrifter og boligselskaper." />
      </Helmet>
      <GoogleAnalytics />
      <Header />
      <BreadcrumbNavigation />
      
      {/* Hero Section with Background */}
      <div 
        className="relative bg-cover bg-center bg-fixed bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div 
          className="absolute inset-0 bg-background backdrop-blur-[2px]"
          style={{ opacity }}
        ></div>
        <HeroImageEditor page="services-tomrer" currentImageUrl={heroImage} currentOpacity={opacity} onImageUpdate={refetch} />
        
        <div className="relative z-10">
          <section className="pt-32 pb-16">
            <div className="container mx-auto px-4">
              <div className="text-center max-w-3xl mx-auto">
                <div className="text-5xl mb-4">🔨</div>
                <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
                  Tømrertjenester
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Kvalitetssnekring og konstruksjonsarbeid
                </p>
                <Link to="/tilbud">
                  <Button variant="cta" size="lg">
                    Bestill tjeneste
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* About Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-heading font-bold mb-6">Om tømrertjenester</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Kvalitetssnekring og konstruksjonsarbeid fra erfarne tømrere. Enten du skal bygge nytt, renovere eller reparere, leverer vi solid håndverk som varer.
              </p>
              <p>
                Våre dyktige tømrere har lang erfaring med alle typer trearbeider, fra mindre reparasjoner til store byggeprosjekter. Vi jobber alltid med fokus på kvalitet, presisjon og godt håndverk.
              </p>
              <p>
                Fra terrasser og vinduer til større renoveringsprosjekter – vi tar oppdraget fra start til slutt. Du kan stole på at vi leverer til avtalt tid og pris, med resultater du blir fornøyd med.
              </p>
            </div>
          </div>

          {/* What's Included */}
          <div className="mb-12">
            <h2 className="text-3xl font-heading font-bold mb-6">Hva er inkludert?</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {included.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Target Audience */}
          <div className="mb-12">
            <h2 className="text-3xl font-heading font-bold mb-6">Hvem er dette for?</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="text-lg">
                  <strong>Passer for:</strong> Privatpersoner, bedrifter, boligselskaper
                </p>
                <p className="text-muted-foreground mt-4">
                  Våre tømrertjenester passer for alle som ønsker profesjonelt trearbeid, enten det er for bolig, hytte, næringseiendom eller offentlige bygg. Vi har erfaring med både store og små prosjekter.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Pricing */}
          <div className="mb-12">
            <h2 className="text-3xl font-heading font-bold mb-6">Priser</h2>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-lg mb-4">
                  Kontakt oss for et skreddersydd tilbud
                </p>
                <p className="text-muted-foreground">
                  Priser varierer basert på størrelse, kompleksitet og materialvalg. Vi lager alltid et tilbud som er tilpasset dine behov og budsjett.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Why Choose Us */}
          <div className="mb-12">
            <h2 className="text-3xl font-heading font-bold mb-6">Hvorfor velge oss?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-success shrink-0 mt-0.5" />
                      <span className="text-lg">{benefit}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-heading font-bold mb-4">
              Klar til å komme i gang?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Få et uforpliktende tilbud i dag
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/tilbud">
                <Button variant="cta" size="lg">
                  Bestill tjeneste
                </Button>
              </Link>
              <Button variant="outline" size="lg" onClick={() => window.location.href = 'tel:+4741250553'}>
                <Phone className="mr-2 h-5 w-5" />
                Ring oss: +47 412 50 553
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ServiceTomrer;
