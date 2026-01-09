import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FAQSection } from "@/components/FAQ/FAQSection";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";
import { EditableHero } from "@/components/EditableHero";
import { Helmet } from "react-helmet";

const FAQ = () => {
  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Ofte stilte spørsmål | HandyHjelp</title>
        <meta name="description" content="Finn svar på vanlige spørsmål om våre håndverkstjenester, priser, responstid og serviceavtaler." />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Ofte stilte spørsmål | HandyHjelp" />
        <meta property="og:description" content="Finn svar på vanlige spørsmål om våre håndverkstjenester, priser, responstid og serviceavtaler." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://handyhjelp.no/faq" />
        <meta property="og:image" content="https://handyhjelp.no/og-image.jpg" />
        <meta property="og:locale" content="nb_NO" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ofte stilte spørsmål | HandyHjelp" />
        <meta name="twitter:description" content="Finn svar på vanlige spørsmål om våre håndverkstjenester, priser, responstid og serviceavtaler." />
      </Helmet>
      <GoogleAnalytics />
      <Header />
      <BreadcrumbNavigation />
      
      <main id="main-content" className="pt-32 pb-16">
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
