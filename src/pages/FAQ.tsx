import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FAQSection } from "@/components/FAQ/FAQSection";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";
import { EditableHero } from "@/components/EditableHero";

const FAQ = () => {
  return (
    <div className="min-h-screen">
      <GoogleAnalytics />
      <Header />
      <BreadcrumbNavigation />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <EditableHero
              section="hero-faq"
              defaultHeading="Ofte stilte spørsmål"
              defaultSubtext="Finn svar på de vanligste spørsmålene om våre tjenester"
              className="mb-12 text-center"
            />
            <FAQSection />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
