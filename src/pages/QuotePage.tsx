import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { QuoteForm } from "@/components/QuoteForm";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";

const QuotePage = () => {
  return (
    <div className="min-h-screen">
      <GoogleAnalytics />
      <Header />
      
      <main className="pt-32 pb-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
                Få gratis tilbud
              </h1>
              <p className="text-lg text-muted-foreground">
                Send inn din forespørsel og få kontakt med lokale fagfolk. Vi svarer innen 1-3 virkedager.
              </p>
            </div>
            <QuoteForm />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default QuotePage;
