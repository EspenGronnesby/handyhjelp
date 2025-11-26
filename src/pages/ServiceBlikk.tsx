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

const ServiceBlikk = () => {
  const { heroImage, opacity, refetch } = useHeroImage('services-blikk', servicesBackground);
  const benefits = [
    "Erfarne fagfolk med mange års erfaring",
    "Fast kontaktperson for din eiendom",
    "Konkurransedyktige priser",
    "Rask respons på henvendelser"
  ];

  const included = [
    "Montering og vedlikehold av takrenner",
    "Beslag og blikk på tak og vegger",
    "Tetting og vannsikring",
    "Ventilasjonsarbeider",
    "Inspeksjon av tak og blikkarbeider",
    "Reparasjon av skader",
    "Kvalitetskontroll og garantier"
  ];

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Blikkenslagertjenester - HandyHjelp</title>
        <meta name="description" content="Profesjonelle takteknings- og vannsikringsløsninger. Vi sikrer at taket ditt holder tett og at vannet ledes bort på riktig måte." />
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
        <HeroImageEditor page="services-blikk" currentImageUrl={heroImage} onImageUpdate={refetch} />
        
        <div className="relative z-10">
          <section className="pt-32 pb-16">
            <div className="container mx-auto px-4">
              <div className="text-center max-w-3xl mx-auto">
                <div className="text-5xl mb-4">💧</div>
                <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
                  Blikkenslagertjenester
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Sikker taktekningsløsninger og vannsystemer
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
            <h2 className="text-3xl font-heading font-bold mb-6">Om blikkenslagertjenester</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Profesjonelle takteknings- og vannsikringsløsninger. Vi sikrer at taket ditt holder tett og at vannet ledes bort på riktig måte.
              </p>
              <p>
                Våre erfarne blikkenslagere har lang erfaring med alle typer tak og vannsystemer. Vi jobber med presisjon og kvalitet for å sikre at eiendommen din er beskyttet mot vær og vind.
              </p>
              <p>
                Fra takrenner og nedløp til tetting og vannsikring – vi tar oss av alt som har med blikk og taktekking å gjøre. Du kan stole på at jobben blir gjort riktig første gang.
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
                  <strong>Passer for:</strong> Eiendomsselskaper, borettslag, privatpersoner
                </p>
                <p className="text-muted-foreground mt-4">
                  Våre blikkenslagertjenester passer for alle som ønsker profesjonell vannsikring og taktekking, enten det er for bolig, næringseiendom eller offentlige bygg. Vi har erfaring med både store og små prosjekter.
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

export default ServiceBlikk;
