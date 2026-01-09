import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";
import { QuoteForm } from "@/components/QuoteForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";

const QuotePage = () => {
  const scrollToAgreement = () => {
    document.getElementById('fast-avtale-section')?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Få gratis tilbud | HandyHjelp</title>
        <meta name="description" content="Få gratis og uforpliktende tilbud på håndverkstjenester. Vi svarer innen 1-3 virkedager." />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Få gratis tilbud | HandyHjelp" />
        <meta property="og:description" content="Få gratis og uforpliktende tilbud på håndverkstjenester. Vi svarer innen 1-3 virkedager." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://handyhjelp.no/tilbud" />
        <meta property="og:image" content="https://handyhjelp.no/og-image.jpg" />
        <meta property="og:locale" content="nb_NO" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Få gratis tilbud | HandyHjelp" />
        <meta name="twitter:description" content="Få gratis og uforpliktende tilbud på håndverkstjenester. Vi svarer innen 1-3 virkedager." />
      </Helmet>
      <GoogleAnalytics />
      <Header />
      <BreadcrumbNavigation />
      
      <main id="main-content" className="pt-32 pb-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
                Få gratis tilbud
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                Send inn din forespørsel og få kontakt med lokale fagfolk. Vi svarer innen 1-3 virkedager.
              </p>
              <button 
                onClick={scrollToAgreement}
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                aria-label="Hopp til fast avtale-seksjonen"
              >
                <span>Trenger du regelmessig hjelp?</span>
                <ChevronDown className="h-4 w-4 animate-bounce" />
              </button>
            </div>
            <QuoteForm />

            {/* Fast avtale promo section */}
            <Card id="fast-avtale-section" className="mt-12 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent scroll-mt-32">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <CalendarCheck className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-heading font-semibold mb-2">
                  Trenger du regelmessig hjelp?
                </h3>
                <p className="text-muted-foreground mb-4">
                  Spar tid og penger med en fast serviceavtale tilpasset dine behov.
                </p>
                <Button asChild variant="outline" className="group">
                  <Link to="/fast-avtale">
                    Forespør fast avtale
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default QuotePage;
