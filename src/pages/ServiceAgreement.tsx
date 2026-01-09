import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";
import { ServiceAgreementForm } from "@/components/ServiceAgreementForm";
import { Helmet } from "react-helmet";

const ServiceAgreement = () => {
  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Forespør fast avtale | HandyHjelp</title>
        <meta name="description" content="Bestill fast serviceavtale for regelmessig vedlikehold av din eiendom. Vi kontakter deg innen 1-2 virkedager." />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Forespør fast avtale | HandyHjelp" />
        <meta property="og:description" content="Bestill fast serviceavtale for regelmessig vedlikehold av din eiendom. Vi kontakter deg innen 1-2 virkedager." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://handyhjelp.no/fast-avtale" />
        <meta property="og:image" content="https://handyhjelp.no/og-image.jpg" />
        <meta property="og:locale" content="nb_NO" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Forespør fast avtale | HandyHjelp" />
        <meta name="twitter:description" content="Bestill fast serviceavtale for regelmessig vedlikehold av din eiendom. Vi kontakter deg innen 1-2 virkedager." />
      </Helmet>
      <GoogleAnalytics />
      <Header />
      <BreadcrumbNavigation />
      
      <main id="main-content" className="pt-32 pb-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
                Forespør fast avtale
              </h1>
              <p className="text-lg text-muted-foreground">
                Få en skreddersydd serviceavtale tilpasset deres behov. Vi kontakter dere innen 1-2 virkedager.
              </p>
            </div>
            <ServiceAgreementForm />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ServiceAgreement;
