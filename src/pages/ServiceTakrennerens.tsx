import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { HeroImageEditor } from "@/components/admin/HeroImageEditor";
import { useHeroImage } from "@/hooks/useHeroImage";
import servicesBackground from "@/assets/hero-services-background.png";

const ServiceTakrennerens = () => {
  const { heroImage, refetch } = useHeroImage('services-takrennerens', servicesBackground);
  const benefits = [
    "Erfarne fagfolk med mange års erfaring",
    "Fast kontaktperson for din eiendom",
    "Konkurransedyktige priser",
    "Rask respons på henvendelser"
  ];

  const included = [
    "Grundig rensing av alle takrenner",
    "Inspeksjon av beslag og feste",
    "Fjerning av løv, mose og rusk",
    "Sjekk av nedløpsrør",
    "Rapport om eventuelle skader",
    "Oppmøte og arbeid",
    "Bortføring av avfall",
    "Ferdig på under 2 timer"
  ];

  const priceIncludes = [
    "Oppmøte og arbeid",
    "Bortføring av avfall",
    "Fast pris – ingen skjulte kostnader",
    "Ferdig på under 2 timer"
  ];

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Takrennerens - HandyHjelp</title>
        <meta name="description" content="Profesjonell rensing og vedlikehold av takrenner. Fast pris for enebolig: 3 390 kr. Hold takrennene i topp stand og unngå vannskader." />
      </Helmet>
      <GoogleAnalytics />
      <Header />
      <BreadcrumbNavigation />
      
      {/* Hero Section with Background */}
      <div 
        className="relative bg-cover bg-center bg-fixed bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-background/85 backdrop-blur-[2px]"></div>
        <HeroImageEditor page="services-takrennerens" currentImageUrl={heroImage} onImageUpdate={refetch} />
        
        <div className="relative z-10">
          <section className="pt-32 pb-16">
            <div className="container mx-auto px-4">
              <div className="text-center max-w-3xl mx-auto">
                <Badge className="mb-4 bg-success text-success-foreground">
                  Populær
                </Badge>
                <div className="text-5xl mb-4">🌧️</div>
                <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
                  Takrennerens
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Profesjonell rensing og vedlikehold av takrenner
                </p>
                <Link to="/tilbud">
                  <Button variant="cta" size="lg">
                    Bestill takrennerens
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
            <h2 className="text-3xl font-heading font-bold mb-6">Om takrennerens</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Hold takrennene i topp stand! Tilstoppede takrenner kan føre til vannskader, fuktproblemer og dyre reparasjoner. Vi sørger for grundig rensing og vedlikehold slik at vannet dreneres riktig.
              </p>
              <p>
                Våre erfarne fagfolk fjerner alle typer avfall fra takrennene dine – løv, mose, rusk og annet som kan blokkere for god drenering. Vi inspiserer samtidig beslag, feste og nedløpsrør for å sikre at alt fungerer som det skal.
              </p>
              <p>
                Med vår tjeneste får du trygghet mot vannskader og lange levetid på takrennene. Vi leverer rask og profesjonell service til en fast, konkurransedyktig pris.
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
                  <strong>Passer for:</strong> Eneboligeiere, rekkehus, mindre bygg
                </p>
                <p className="text-muted-foreground mt-4">
                  Vår takrennerens-tjeneste er perfekt for deg som ønsker å unngå kostbare vannskader og holde eiendommen i god stand. Vi anbefaler rensing minst 1-2 ganger i året, spesielt på høsten etter løvfall.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Pricing - Featured */}
          <div className="mb-12">
            <h2 className="text-3xl font-heading font-bold mb-6">Priser</h2>
            <Card className="border-success border-2">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Fast pris for enebolig</p>
                  <p className="text-5xl font-bold text-success mb-4">3 390 kr</p>
                  <p className="text-muted-foreground">Ingen skjulte kostnader</p>
                </div>
                <div className="space-y-3">
                  <p className="font-semibold mb-3">Prisen inkluderer:</p>
                  {priceIncludes.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
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
                  Bestill takrennerens
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

export default ServiceTakrennerens;
