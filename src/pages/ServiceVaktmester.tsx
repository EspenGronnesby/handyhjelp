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

const ServiceVaktmester = () => {
  const { heroImage, opacity, refetch } = useHeroImage('services-vaktmester', servicesBackground);

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Vaktmestertjenester - HandyHjelp</title>
        <meta name="description" content="Profesjonell eiendomspleie for borettslag, sameier og næringseiendom. Vi sørger for at ditt bygg holder seg i topp stand gjennom året." />
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
        <HeroImageEditor page="services-vaktmester" currentImageUrl={heroImage} onImageUpdate={refetch} />
        
        <div className="relative z-10">
          <section className="pt-32 pb-16">
            <div className="container mx-auto px-4">
              <EditableServiceHero 
                section="service-vaktmester-hero"
                defaultIcon="🔧"
                defaultTitle="Vaktmestertjenester"
                defaultSubtitle="Profesjonell eiendomspleie og vedlikehold"
                defaultButtonText="Bestill vaktmester"
              />
            </div>
          </section>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <EditableServiceAbout 
            section="service-vaktmester"
            defaultParagraph1="Profesjonell eiendomspleie for borettslag, sameier og næringseiendom. Vi sørger for at ditt bygg holder seg i topp stand gjennom året med jevnlig tilsyn, vedlikehold og rask respons på akutte behov."
            defaultParagraph2="Våre erfarne vaktmestere har lang erfaring med alle typer eiendommer og sørger for at bygget ditt får den oppmerksomheten det fortjener. Vi tilbyr skreddersydde løsninger tilpasset dine behov, enten det er daglig, ukentlig eller månedlig service."
            defaultParagraph3="Med oss får du trygghet og forutsigbarhet. Vi følger opp, dokumenterer og sørger for at alle oppgaver blir utført til avtalt tid. Din eiendom er i trygge hender."
          />

          <EditableServiceIncluded 
            section="service-vaktmester"
            defaultItems={[
              "Daglig, ukentlig eller månedlig tilsyn av bygg",
              "Renhold av fellesarealer og uteområder",
              "Mindre reparasjoner og vedlikehold",
              "Vintervedlikehold (strøing, snørydding)",
              "Inspeksjonsrapporter og dokumentasjon",
              "Fast kontaktperson",
              "Akutt utrykning ved behov"
            ]}
          />

          <EditableServiceTarget 
            section="service-vaktmester"
            defaultTarget="Borettslag, sameier, næringseiendom"
            defaultDescription="Våre vaktmestertjenester er spesielt tilpasset for større eiendommer med behov for jevnlig tilsyn og vedlikehold. Vi jobber tett med styrer, eiendomsforvaltere og ansvarlige for å sikre best mulig eiendomspleie."
          />

          <EditableServicePricing 
            section="service-vaktmester"
            hasFixedPrice={false}
            defaultPrice="Kontakt oss for et skreddersydd tilbud"
            defaultPriceIncludes={[]}
            defaultDescription="Priser varierer basert på størrelse, frekvens og omfang av tjenestene. Vi lager alltid et tilbud som er tilpasset dine behov og budsjett."
          />

          <EditableServiceBenefits 
            section="service-vaktmester"
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

export default ServiceVaktmester;
