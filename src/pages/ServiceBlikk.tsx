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
import { EditableServiceHero } from "@/components/service-edit/EditableServiceHero";
import { EditableServiceAbout } from "@/components/service-edit/EditableServiceAbout";
import { EditableServiceIncluded } from "@/components/service-edit/EditableServiceIncluded";
import { EditableServiceTarget } from "@/components/service-edit/EditableServiceTarget";
import { EditableServicePricing } from "@/components/service-edit/EditableServicePricing";
import { EditableServiceBenefits } from "@/components/service-edit/EditableServiceBenefits";
import { EditableBottomCTA } from "@/components/EditableBottomCTA";

const ServiceBlikk = () => {
  const { heroImage, opacity, refetch } = useHeroImage('services-blikk', servicesBackground);

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
              <EditableServiceHero 
                section="service-blikk"
                defaultIcon="💧"
                defaultTitle="Blikkenslagertjenester"
                defaultSubtitle="Sikker taktekningsløsninger og vannsystemer"
              />
            </div>
          </section>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <EditableServiceAbout 
            section="service-blikk"
            defaultParagraph1="Profesjonelle takteknings- og vannsikringsløsninger. Vi sikrer at taket ditt holder tett og at vannet ledes bort på riktig måte."
            defaultParagraph2="Våre erfarne blikkenslagere har lang erfaring med alle typer tak og vannsystemer. Vi jobber med presisjon og kvalitet for å sikre at eiendommen din er beskyttet mot vær og vind."
            defaultParagraph3="Fra takrenner og nedløp til tetting og vannsikring – vi tar oss av alt som har med blikk og taktekking å gjøre. Du kan stole på at jobben blir gjort riktig første gang."
          />

          <EditableServiceIncluded 
            section="service-blikk"
            defaultItems={[
              "Montering og vedlikehold av takrenner",
              "Beslag og blikk på tak og vegger",
              "Tetting og vannsikring",
              "Ventilasjonsarbeider",
              "Inspeksjon av tak og blikkarbeider",
              "Reparasjon av skader",
              "Kvalitetskontroll og garantier"
            ]}
          />

          <EditableServiceTarget 
            section="service-blikk"
            defaultTargetLabel="Eiendomsselskaper, borettslag, privatpersoner"
            defaultDescription="Våre blikkenslagertjenester passer for alle som ønsker profesjonell vannsikring og taktekking, enten det er for bolig, næringseiendom eller offentlige bygg. Vi har erfaring med både store og små prosjekter."
          />

          <EditableServicePricing 
            section="service-blikk"
            defaultPriceText="Kontakt oss for et skreddersydd tilbud"
            defaultDescription="Priser varierer basert på størrelse, kompleksitet og materialvalg. Vi lager alltid et tilbud som er tilpasset dine behov og budsjett."
          />

          <EditableServiceBenefits 
            section="service-blikk"
            defaultBenefits={[
              "Erfarne fagfolk med mange års erfaring",
              "Fast kontaktperson for din eiendom",
              "Konkurransedyktige priser",
              "Rask respons på henvendelser"
            ]}
          />
        </div>
      </section>

      <EditableBottomCTA />

      <Footer />
    </div>
  );
};

export default ServiceBlikk;
