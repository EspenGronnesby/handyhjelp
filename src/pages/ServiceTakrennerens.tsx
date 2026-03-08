import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { PageSEO } from "@/components/SEO/PageSEO";
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

const ServiceTakrennerens = () => {
  const { heroImage, loading, refetch } = useHeroImage('services-takrennerens', servicesBackground);

  return (
    <div className="min-h-screen">
      <PageSEO path="/tjenester/takrennerens" />
      <GoogleAnalytics />
      <Header />
      <BreadcrumbNavigation />
      
      {/* Hero Section with Background - fade in when loaded */}
      <div 
        className={`relative h-[400px] md:h-[500px] bg-cover bg-center bg-no-repeat transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`}
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div 
          className="absolute inset-0 bg-black/60"
        ></div>
        <HeroImageEditor page="services-takrennerens" currentImageUrl={heroImage} onImageUpdate={refetch} />
        
        <div className="relative z-10">
          <EditableServiceHero 
            section="service-takrennerens-hero"
            iconName="cloudrain"
            defaultTitle="Takrennerens"
            defaultSubtitle="Profesjonell rensing og vedlikehold av takrenner"
            defaultButtonText="Bestill takrennerens"
            showBadge={true}
            badgeText="Populær"
          />
        </div>
      </div>

      {/* Main Content */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <EditableServiceAbout 
            section="service-takrennerens"
            defaultParagraph1="Hold takrennene i topp stand! Tilstoppede takrenner kan føre til vannskader, fuktproblemer og dyre reparasjoner. Vi sørger for grundig rensing og vedlikehold slik at vannet dreneres riktig."
            defaultParagraph2="Våre erfarne fagfolk fjerner alle typer avfall fra takrennene dine – løv, mose, rusk og annet som kan blokkere for god drenering. Vi inspiserer samtidig beslag, feste og nedløpsrør for å sikre at alt fungerer som det skal."
            defaultParagraph3="Med vår tjeneste får du trygghet mot vannskader og lange levetid på takrennene. Vi leverer rask og profesjonell service til en fast, konkurransedyktig pris."
          />

          <EditableServiceIncluded 
            section="service-takrennerens"
            defaultItems={[
              "Grundig rensing av alle takrenner",
              "Inspeksjon av beslag og feste",
              "Fjerning av løv, mose og rusk",
              "Sjekk av nedløpsrør",
              "Rapport om eventuelle skader",
              "Oppmøte og arbeid",
              "Bortføring av avfall",
              "Ferdig på under 2 timer"
            ]}
          />

          <EditableServiceTarget 
            section="service-takrennerens"
            defaultTarget="Eneboligeiere, rekkehus, mindre bygg"
            defaultDescription="Vår takrennerens-tjeneste er perfekt for deg som ønsker å unngå kostbare vannskader og holde eiendommen i god stand. Vi anbefaler rensing minst 1-2 ganger i året, spesielt på høsten etter løvfall."
          />

          <EditableServicePricing 
            section="service-takrennerens"
            hasFixedPrice={true}
            defaultPrice="3 390 kr"
            defaultPriceIncludes={["Fast pris for enebolig"]}
            defaultDescription="Fast pris for enebolig – ingen skjulte kostnader"
          />

          <EditableServiceBenefits 
            section="service-takrennerens"
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

export default ServiceTakrennerens;
