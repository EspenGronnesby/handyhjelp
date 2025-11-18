import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Melding sendt!",
      description: "Vi tar kontakt med deg innen 2 timer."
    });
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  const faqItems = [
    {
      question: "Hvor raskt kan dere komme?",
      answer: "For akutte henvendelser kan vi ofte være på stedet samme dag. Planlagte oppdrag avtales etter dine ønsker."
    },
    {
      question: "Tar dere oppdrag på kveldstid?",
      answer: "Ja, vi tilbyr både kveldstjenester og helgetjenester mot et lite tillegg."
    },
    {
      question: "Må jeg være hjemme under arbeidet?",
      answer: "Det er ikke nødvendig. Mange av våre kunder gir oss nøkkel eller kode til jobben."
    },
    {
      question: "Hvor lang er responstiden?",
      answer: "Vi svarer på alle henvendelser innen 2 timer i åpningstiden, ofte raskere."
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-32 pb-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 mb-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold mb-6 text-foreground">
              Ta kontakt i dag
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              Vi er her for å hjelpe deg med alle dine eiendomsbehov. 
              Kontakt oss for en uforpliktende samtale.
            </p>
            <p className="text-lg font-semibold text-primary">
              ⏱️ Vi svarer innen 2 timer
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 mb-20">
            {/* Contact Form */}
            <div>
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-6">Send oss en melding</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Navn *</label>
                      <Input 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Ditt fulle navn"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">E-post *</label>
                      <Input 
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="din@epost.no"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Telefon *</label>
                      <Input 
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="+47 ..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Melding *</label>
                      <Textarea 
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        placeholder="Beskriv hvordan vi kan hjelpe deg..."
                        rows={5}
                      />
                    </div>
                    <Button type="submit" variant="cta" className="w-full gap-2">
                      <Send className="h-4 w-4" />
                      Send melding
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info & Map */}
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-6">Kontaktinformasjon</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Adresse</p>
                        <p className="text-muted-foreground">Kristiansand, Norge</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Telefon</p>
                        <a href="tel:+4741250553" className="text-primary hover:underline">
                          +47 41250553
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">E-post</p>
                        <a href="mailto:handyhjelp@gmail.com" className="text-primary hover:underline">
                          handyhjelp@gmail.com
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Åpningstider</p>
                        <p className="text-muted-foreground">Mandag - Fredag: 07:00 - 17:00</p>
                        <p className="text-muted-foreground text-sm">Kveld/helg etter avtale</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Map Placeholder */}
              <Card>
                <CardContent className="pt-6">
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Kart over Kristiansand</p>
                      <p className="text-sm text-muted-foreground">Google Maps integrering</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Alternative Contact */}
              <Card className="bg-accent/10 border-accent">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">Andre kontaktmetoder</h3>
                  <div className="space-y-2">
                    <a href="sms:+4741250553" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                      <MessageSquare className="h-4 w-4" />
                      Send SMS til +47 41250553
                    </a>
                    <a href="https://wa.me/4741250553" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                      <MessageSquare className="h-4 w-4" />
                      Kontakt oss på WhatsApp
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* FAQ Section */}
          <section className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">
              Ofte stilte spørsmål før du kontakter oss
            </h2>
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-2 text-lg">{item.question}</h3>
                    <p className="text-muted-foreground">{item.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
