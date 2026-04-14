import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useContactInfo } from "@/hooks/useContactInfo";

const ThankYouAgreement = () => {
  const { phone, email, phoneHref, emailHref } = useContactInfo();
  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Takk for din avtaleforespørsel | HandyHjelp</title>
        <meta name="description" content="Takk for din bestilling av fast avtale. Vi kontakter deg innen 1-2 virkedager." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <GoogleAnalytics />
      <Header />
      <BreadcrumbNavigation />
      
      <main id="main-content" className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8 flex justify-center">
              <div className="rounded-full bg-success/10 p-6">
                <CheckCircle2 className="h-16 w-16 text-success" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Takk for din avtaleforespørsel!
            </h1>
            
            <div className="bg-card rounded-lg shadow-lg p-8 mb-8 text-left">
              <p className="text-lg mb-4">
                Vi har mottatt forespørselen din og vil gjennomgå den grundig.
              </p>
              
              <p className="text-lg mb-6">
                Dere kan forvente å bli kontaktet <strong>innen 1-2 virkedager</strong> for en uforpliktende samtale om deres behov.
              </p>
              
              <div className="bg-muted rounded-lg p-6 space-y-3">
                <p className="font-semibold text-lg mb-4">Har dere spørsmål i mellomtiden?</p>
                <p className="flex items-center gap-2">
                  <span className="text-2xl">📞</span>
                  <span>Ring oss: <a href={phoneHref} className="text-primary hover:underline font-medium">{phone}</a></span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-2xl">📧</span>
                  <span>E-post: <a href={emailHref} className="text-primary hover:underline font-medium">{email}</a></span>
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="default" size="lg">
                <Link to="/">Tilbake til forsiden</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/tjenester">Se våre tjenester</Link>
              </Button>
            </div>
            
            <p className="mt-8 text-sm text-muted-foreground">
              En bekreftelse er også sendt til din e-post.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ThankYouAgreement;
