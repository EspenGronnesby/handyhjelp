import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";
import { PageSEO } from "@/components/SEO/PageSEO";
import { HeroImageEditor } from "@/components/admin/HeroImageEditor";
import { useHeroImage } from "@/hooks/useHeroImage";
import servicesBackground from "@/assets/hero-vaktmester.png";
import { EditableServiceHero } from "@/components/service-edit/EditableServiceHero";
import { EditableServiceAbout } from "@/components/service-edit/EditableServiceAbout";
import { EditableServiceCallout } from "@/components/service-edit/EditableServiceCallout";
import { EditableServiceIncluded } from "@/components/service-edit/EditableServiceIncluded";
import { EditableServiceTarget } from "@/components/service-edit/EditableServiceTarget";
import { EditableServicePricing } from "@/components/service-edit/EditableServicePricing";
import { EditableServiceBenefits } from "@/components/service-edit/EditableServiceBenefits";
import { EditableBottomCTA } from "@/components/EditableBottomCTA";

const ServiceVaktmester = () => {
  const { heroImage, loading, refetch } = useHeroImage('services-vaktmester', servicesBackground);

  return (
    <div className="min-h-screen pt-20 lg:pt-40">
      <PageSEO path="/tjenester/vaktmester" />
      <GoogleAnalytics />
      <Header />
      <BreadcrumbNavigation />

      {/* Hero — bilde + tittel */}
      <div
        className={`relative h-[280px] md:h-[500px] bg-cover bg-center bg-no-repeat overflow-hidden transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`}
        style={{ backgroundImage: `url(${heroImage})`, boxShadow: 'inset 0 0 70px 30px rgba(0,0,0,0.8)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <HeroImageEditor page="services-vaktmester" currentImageUrl={heroImage} onImageUpdate={refetch} />
        <div className="relative z-10">
          <EditableServiceHero
            section="service-vaktmester-hero"
            iconName="wrench"
            defaultTitle="Vaktmestertjenester"
            defaultSubtitle="Profesjonell eiendomspleie og vedlikehold"
            defaultButtonText="Bestill vaktmester"
          />
        </div>
      </div>

      {/* Om tjenesten */}
      <section className="py-10 md:py-14 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <EditableServiceAbout
            section="service-vaktmester"
            defaultParagraph1="Profesjonell eiendomspleie for borettslag, sameier og næringseiendom. Vi sørger for at ditt bygg holder seg i topp stand gjennom året med jevnlig tilsyn, vedlikehold og rask respons på akutte behov."
            defaultParagraph2="Våre erfarne vaktmestere har lang erfaring med alle typer eiendommer og sørger for at bygget ditt får den oppmerksomheten det fortjener. Vi tilbyr skreddersydde løsninger tilpasset dine behov, enten det er daglig, ukentlig eller månedlig service."
            defaultParagraph3="Med oss får du trygghet og forutsigbarhet. Vi følger opp, dokumenterer og sørger for at alle oppgaver blir utført til avtalt tid. Din eiendom er i trygge hender."
          />
        </div>
      </section>

      {/* Sitat */}
      <section className="py-8 md:py-10 bg-primary/5 border-y border-primary/10">
        <div className="container mx-auto px-4 max-w-4xl">
          <EditableServiceCallout
            section="service-vaktmester"
            defaultCallout="Din eiendom er i trygge hender — vi følger opp og sørger for at alt vedlikehold blir utført til avtalt tid."
          />
        </div>
      </section>

      {/* Hva er inkludert */}
      <section className="py-10 md:py-14 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
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
        </div>
      </section>

      {/* Hvem er dette for */}
      <section className="py-10 md:py-14 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <EditableServiceTarget
            section="service-vaktmester"
            defaultTarget="Borettslag, sameier, næringseiendom, arrangører"
            defaultDescription="Vi avlaster deg før store anledninger — enten det er 17. mai, sommerfest, generalforsamling eller andre arrangementer der det skal se pent ut. Vi tar oss av uteområder, fellesarealer og inngangspartier slik at du kan fokusere på det som skjer. Perfekt for borettslag og sameier som vil gjøre et godt inntrykk på beboere og gjester."
          />
        </div>
      </section>

      {/* Priser */}
      <section className="py-10 md:py-14 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <EditableServicePricing
            section="service-vaktmester"
            hasFixedPrice={false}
            defaultPrice="Kontakt oss for et skreddersydd tilbud"
            defaultPriceIncludes={[]}
            defaultDescription="Priser varierer basert på størrelse, frekvens og omfang av tjenestene. Vi lager alltid et tilbud som er tilpasset dine behov og budsjett."
          />
        </div>
      </section>

      {/* Hvorfor velge oss */}
      <section className="py-10 md:py-14 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
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
