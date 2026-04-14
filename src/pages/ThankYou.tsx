import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Clock, Mail, Phone, ArrowRight, Home, UserPlus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";
import { Helmet } from "react-helmet";
import { useContactInfo } from "@/hooks/useContactInfo";

const ThankYou = () => {
  const { phone: contactPhone, email: contactEmail, phoneHref, emailHref } = useContactInfo();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const type = searchParams.get("type");
  const accountCreated = searchParams.get("accountCreated") === "true";

  useEffect(() => {
    // If accessed directly without email param, redirect to home
    if (!email) {
      navigate("/");
    }
  }, [email, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Takk for din forespørsel | HandyHjelp</title>
        <meta name="description" content="Takk for din forespørsel. Vi kontakter deg innen 1-3 virkedager." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <GoogleAnalytics />
      <Header />
      <BreadcrumbNavigation />
      
      <main id="main-content" className="flex-1 bg-gradient-to-b from-muted/30 to-background py-16 px-4">
        <div className="container max-w-3xl mx-auto">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-6">
              <CheckCircle className="w-12 h-12 text-success" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Takk for din forespørsel!
            </h1>
            <p className="text-xl text-muted-foreground">
              Vi har mottatt din {type === "business" ? "bedrifts" : "private"} forespørsel
            </p>
          </div>

          {/* Account Created Card */}
          {accountCreated && (
            <Card className="p-6 mb-8 bg-success/10 border-success/20 shadow-lg">
              <div className="flex items-start gap-4">
                <UserPlus className="w-6 h-6 text-success flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Konto opprettet!</h3>
                  <p className="text-foreground mb-3">
                    Din konto er nå opprettet med e-postadressen <strong>{email}</strong>. 
                    Logg inn for å følge med på din forespørsel og få oppdateringer.
                  </p>
                  <Button 
                    onClick={() => navigate('/auth')} 
                    variant="default" 
                    className="gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Logg inn på min konto
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Confirmation Card */}
          <Card className="p-8 mb-8 shadow-lg">
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 bg-primary/10 rounded-lg">
                <Mail className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Bekreftelse sendt</h3>
                  <p className="text-foreground">
                    En bekreftelse er sendt til <strong>{email}</strong>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Sjekk også spam-mappen hvis du ikke finner e-posten i innboksen.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-success/10 rounded-lg">
                <Clock className="w-6 h-6 text-success flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Forventet responstid</h3>
                  <p className="text-foreground">
                    Vi kontakter deg <strong>innen 1-3 virkedager</strong> i våre åpningstider (man-fre 09:00-17:00)
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Du vil motta et uforpliktende tilbud tilpasset dine behov.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Next Steps */}
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Hva skjer nå?</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Vi gjennomgår din forespørsel</h3>
                  <p className="text-muted-foreground">
                    Vårt team vurderer dine behov og forbereder et skreddersydd tilbud.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Du mottar tilbud</h3>
                  <p className="text-muted-foreground">
                    Vi kontakter deg per e-post eller telefon med et detaljert prisforslag.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Avtale tidspunkt</h3>
                  <p className="text-muted-foreground">
                    Godkjenner du tilbudet, avtaler vi et passende tidspunkt for jobben.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Profesjonell utførelse</h3>
                  <p className="text-muted-foreground">
                    Våre erfarne fagfolk utfører jobben med høy kvalitet og rydder opp etterpå.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Contact Info */}
          <Card className="p-8 mb-8 bg-gradient-to-br from-muted/50 to-muted/30">
            <h2 className="text-xl font-bold text-foreground mb-4">Har du spørsmål i mellomtiden?</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Ring oss på</p>
                  <a href={phoneHref} className="text-lg font-semibold text-foreground hover:text-primary">
                    {contactPhone}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Send e-post til</p>
                  <a href={emailHref} className="text-lg font-semibold text-foreground hover:text-primary">
                    {contactEmail}
                  </a>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/")}
              variant="default"
              size="lg"
              className="gap-2"
            >
              <Home className="w-5 h-5" />
              Tilbake til forsiden
            </Button>
            <Button
              onClick={() => navigate("/tjenester")}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              Se våre tjenester
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ThankYou;
