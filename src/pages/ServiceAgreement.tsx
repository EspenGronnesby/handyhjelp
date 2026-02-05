import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";
import { ServiceAgreementForm } from "@/components/ServiceAgreementForm";
import { PageSEO } from "@/components/SEO/PageSEO";

const ServiceAgreement = () => {
  return (
    <div className="min-h-screen">
      <PageSEO path="/fast-avtale" />
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
