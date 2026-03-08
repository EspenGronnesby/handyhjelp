import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

const ServiceTomrer = () => {
  const { heroImage, loading, refetch } = useHeroImage('services-tomrer', servicesBackground);

  return (
    <div className="min-h-screen">
      <PageSEO path="/tjenester/tomrer" />
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
        <HeroImageEditor page="services-tomrer" currentImageUrl={heroImage} onImageUpdate={refetch} />
        
        <div className="relative z-10">
          <EditableServiceHero 
            section="service-tomrer-hero"
            iconName="hammer"
            defaultTitle="Tømrertjenester"
            defaultSubtitle="Kvalitetssnekring og konstruksjonsarbeid"
            defaultButtonText="Bestill tømrer"
          />
        </div>
      </div>

      {/* Main Content */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <EditableServiceAbout 
            section="service-tomrer"
            defaultParagraph1="Kvalitetssnekring og konstruksjonsarbeid fra erfarne tømrere. Enten du skal bygge nytt, renovere eller reparere, leverer vi solid håndverk som varer."
            defaultParagraph2="Våre dyktige tømrere har lang erfaring med alle typer trearbeider, fra mindre reparasjoner til store byggeprosjekter. Vi jobber alltid med fokus på kvalitet, presisjon og godt håndverk."
            defaultParagraph3="Fra terrasser og vinduer til større renoveringsprosjekter – vi tar oppdraget fra start til slutt. Du kan stole på at vi leverer til avtalt tid og pris, med resultater du blir fornøyd med."
          />

          <EditableServiceIncluded 
            section="service-tomrer"
            defaultItems={[
              "Bygging og reparasjon av terrasser",
              "Montering av dører, vinduer og innredning",
              "Takarbeid og taktekking",
              "Renovering av bad og kjøkken (trearbeid)",
              "Laftekonstruksjoner og vedskjul",
              "Tilpasninger og spesialarbeider",
              "Kvalitetskontroll og garantier"
            ]}
          />

          <EditableServiceTarget 
            section="service-tomrer"
            defaultTarget="Privatpersoner, bedrifter, boligselskaper"
            defaultDescription="Våre tømrertjenester passer for alle som ønsker profesjonelt trearbeid, enten det er for bolig, hytte, næringseiendom eller offentlige bygg. Vi har erfaring med både store og små prosjekter."
          />

          <EditableServicePricing 
            section="service-tomrer"
            hasFixedPrice={false}
            defaultPrice="Kontakt oss for et skreddersydd tilbud"
            defaultPriceIncludes={[]}
            defaultDescription="Priser varierer basert på størrelse, kompleksitet og materialvalg. Vi lager alltid et tilbud som er tilpasset dine behov og budsjett."
          />

          <EditableServiceBenefits 
            section="service-tomrer"
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

export default ServiceTomrer;
