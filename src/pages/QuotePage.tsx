import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { QuoteForm } from "@/components/QuoteForm";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

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

            {/* Fast avtale promo section */}
            <Card className="mt-12 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
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
