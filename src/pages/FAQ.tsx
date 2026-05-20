import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FAQSection } from "@/components/FAQ/FAQSection";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";
import { EditableHero } from "@/components/EditableHero";
import { PageSEO } from "@/components/SEO/PageSEO";
import { TrustStripe } from "@/components/TrustStripe";
import { EditableBottomCTA } from "@/components/EditableBottomCTA";

const FAQ = () => {
  return (
    <div className="min-h-screen">
      <PageSEO path="/faq" />
      <GoogleAnalytics />
      <Header />
      <BreadcrumbNavigation />

      <main id="main-content" className="pt-32 pb-16 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <EditableHero
              section="hero-faq"
              defaultHeading="Ofte stilte spørsmål"
              defaultSubtext="Finn svar på de vanligste spørsmålene om våre tjenester"
              className="mb-8 text-center"
            />
          </div>
        </div>
        <TrustStripe />
        <div className="container mx-auto px-4 mt-8">
          <div className="max-w-4xl mx-auto">
            <FAQSection />
          </div>
        </div>
      </main>

      {/* Siste seksjon — full-bredde mørk gradient CTA, samme som resten av sidene */}
      <EditableBottomCTA />

      <Footer />
    </div>
  );
};

export default FAQ;
