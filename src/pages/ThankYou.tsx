import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Clock, Mail, Phone, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const ThankYou = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const type = searchParams.get("type");

  useEffect(() => {
    // If accessed directly without email param, redirect to home
    if (!email) {
      navigate("/");
    }
  }, [email, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gradient-to-b from-gray-50 to-white py-16 px-4">
        <div className="container max-w-3xl mx-auto">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Takk for din forespørsel!
            </h1>
            <p className="text-xl text-gray-600">
              Vi har mottatt din {type === "business" ? "bedrifts" : "private"} forespørsel
            </p>
          </div>

          {/* Confirmation Card */}
          <Card className="p-8 mb-8 shadow-lg">
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Bekreftelse sendt</h3>
                  <p className="text-gray-700">
                    En bekreftelse er sendt til <strong>{email}</strong>
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Sjekk også spam-mappen hvis du ikke finner e-posten i innboksen.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                <Clock className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Forventet responstid</h3>
                  <p className="text-gray-700">
                    Vi kontakter deg <strong>innen 1-3 virkedager</strong> i våre åpningstider (man-fre 09:00-17:00)
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Du vil motta et uforpliktende tilbud tilpasset dine behov.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Next Steps */}
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Hva skjer nå?</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Vi gjennomgår din forespørsel</h3>
                  <p className="text-gray-600">
                    Vårt team vurderer dine behov og forbereder et skreddersydd tilbud.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Du mottar tilbud</h3>
                  <p className="text-gray-600">
                    Vi kontakter deg per e-post eller telefon med et detaljert prisforslag.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Avtale tidspunkt</h3>
                  <p className="text-gray-600">
                    Godkjenner du tilbudet, avtaler vi et passende tidspunkt for jobben.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Profesjonell utførelse</h3>
                  <p className="text-gray-600">
                    Våre erfarne fagfolk utfører jobben med høy kvalitet og rydder opp etterpå.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Contact Info */}
          <Card className="p-8 mb-8 bg-gradient-to-br from-gray-50 to-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Har du spørsmål i mellomtiden?</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-gray-600">Ring oss på</p>
                  <a href="tel:+4741250553" className="text-lg font-semibold text-gray-900 hover:text-primary">
                    +47 412 50 553
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-gray-600">Send e-post til</p>
                  <a href="mailto:team@handyhjelp.no" className="text-lg font-semibold text-gray-900 hover:text-primary">
                    team@handyhjelp.no
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
