import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FAQSection } from "@/components/FAQ/FAQSection";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";

const FAQ = () => {
  return (
    <div className="min-h-screen">
      <GoogleAnalytics />
      <Header />
      <BreadcrumbNavigation />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="heading-section font-heading mb-4">
                Ofte stilte spørsmål
              </h1>
              <p className="text-muted-foreground text-lg">
                Finn svar på de vanligste spørsmålene om våre tjenester
              </p>
            </div>
            
            <FAQSection />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
