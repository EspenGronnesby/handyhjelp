import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";
import { PageSEO } from "@/components/SEO/PageSEO";
import { HeroImageEditor } from "@/components/admin/HeroImageEditor";
import { useHeroImage } from "@/hooks/useHeroImage";
import servicesBackground from "@/assets/hero-blikkenslager.png";
import { EditableServiceHero } from "@/components/service-edit/EditableServiceHero";
import { EditableServiceAbout } from "@/components/service-edit/EditableServiceAbout";
import { EditableServiceCallout } from "@/components/service-edit/EditableServiceCallout";
import { EditableServiceIncluded } from "@/components/service-edit/EditableServiceIncluded";
import { EditableServiceTarget } from "@/components/service-edit/EditableServiceTarget";
import { EditableServicePricing } from "@/components/service-edit/EditableServicePricing";
import { EditableServiceBenefits } from "@/components/service-edit/EditableServiceBenefits";
import { EditableBottomCTA } from "@/components/EditableBottomCTA";

const ServiceBlikk = () => {
  const { heroImage, loading, refetch } = useHeroImage('services-blikk', servicesBackground);

  return (
    <div className="min-h-screen pt-20 lg:pt-40">
      <PageSEO path="/tjenester/blikk" />
      <GoogleAnalytics />
      <Header />
      <BreadcrumbNavigation />

      {/* Hero */}
      <div
        className={`relative h-[340px] md:h-[650px] bg-cover bg-center bg-no-repeat transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`}
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <HeroImageEditor page="services-blikk" currentImageUrl={heroImage} onImageUpdate={refetch} />

        <div className="relative z-10">
          <EditableServiceHero
            section="service-blikk-hero"
            iconName="droplets"
            defaultTitle="Blikkenslagertjenester"
            defaultSubtitle="Sikker taktekningsløsninger og vannsystemer"
            defaultButtonText="Bestill blikkenslager"
          />
        </div>
      </div>

      <section className="py-10 md:py-14 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <EditableServiceAbout
            section="service-blikk"
            defaultParagraph1="Profesjonelle takteknings- og vannsikringsløsninger. Vi sikrer at taket ditt holder tett og at vannet ledes bort på riktig måte."
            defaultParagraph2="Våre erfarne blikkenslagere har lang erfaring med alle typer tak og vannsystemer. Vi jobber med presisjon og kvalitet for å sikre at eiendommen din er beskyttet mot vær og vind."
            defaultParagraph3="Fra takrenner og nedløp til tetting og vannsikring – vi tar oss av alt som har med blikk og taktekking å gjøre. Du kan stole på at jobben blir gjort riktig første gang."
          />
        </div>
      </section>

      <section className="py-8 md:py-10 bg-primary/5 border-y border-primary/10">
        <div className="container mx-auto px-4 max-w-4xl">
          <EditableServiceCallout
            section="service-blikk"
            defaultCallout="Taket ditt skal holde tett — vi jobber med presisjon for å beskytte eiendommen din mot vær og vind."
          />
        </div>
      </section>

      <section className="py-10 md:py-14 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
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
        </div>
      </section>

      <section className="py-10 md:py-14 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <EditableServiceTarget
            section="service-blikk"
            defaultTarget="Eiendomsselskaper, borettslag, privatpersoner"
            defaultDescription="Våre blikkenslagertjenester passer for alle som ønsker profesjonell vannsikring og taktekking, enten det er for bolig, næringseiendom eller offentlige bygg. Vi har erfaring med både store og små prosjekter."
          />
        </div>
      </section>

      <section className="py-10 md:py-14 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <EditableServicePricing
            section="service-blikk"
            hasFixedPrice={false}
            defaultPrice="Kontakt oss for et skreddersydd tilbud"
            defaultPriceIncludes={[]}
            defaultDescription="Priser varierer basert på størrelse, kompleksitet og materialvalg. Vi lager alltid et tilbud som er tilpasset dine behov og budsjett."
          />
        </div>
      </section>

      <section className="py-10 md:py-14 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
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
