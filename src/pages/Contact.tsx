import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, MapPin, Clock, MessageSquare, Loader2 } from "lucide-react";
import { EditableHero } from "@/components/EditableHero";
import { EditableContactInfo } from "@/components/EditableContactInfo";
import { EditableHowWeWork } from "@/components/EditableHowWeWork";
import { EditableFAQItem } from "@/components/EditableFAQItem";
import { Accordion } from "@/components/ui/accordion";

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Hardcoded access key (temporary solution - will be replaced)
      const accessKey = 'e73de942-c444-45b1-ba7a-1556f5862bfd';
      
      if (!accessKey) {
        console.error('Web3Forms access key is missing!');
        toast({
          title: "Konfigurasjonsfeil",
          description: "Kan ikke sende melding. Ring oss på +47 41250553",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const web3FormData = {
        access_key: accessKey,
        subject: `Kontaktskjema fra ${formData.name}`,
        from_name: "HandyHjelp Nettside",
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
      };

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(web3FormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Web3Forms error:', errorData);
        throw new Error(errorData.message || 'Failed to send message');
      }

      // Send confirmation email to customer via Resend (non-blocking)
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data: confirmationData, error: confirmationError } = await supabase.functions.invoke('send-confirmation-email', {
          body: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            customerType: 'private' // Contact form defaults to private
          }
        });

        if (confirmationError) {
          console.error('Confirmation email error:', confirmationError);
          // Don't block user flow - error notification is sent to team
        } else {
          console.log('Confirmation email sent:', confirmationData);
        }
      } catch (confirmationError) {
        console.error('Failed to send confirmation email:', confirmationError);
        // Don't block user flow - error notification is sent to team
      }

      toast({
        title: "Melding sendt!",
        description: "Vi svarer deg innen 1-3 virkedager.",
      });

      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      console.error('Contact form error:', error);
      toast({
        title: "Feil ved sending",
        description: "Prøv igjen eller ring oss direkte.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
      answer: "Vi svarer på alle henvendelser innen 1-3 virkedager i åpningstiden."
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-32 pb-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 mb-16">
          <EditableHero
            section="hero-kontakt"
            defaultHeading="Ta kontakt i dag"
            defaultSubtext="Vi er her for å hjelpe deg med alle dine eiendomsbehov. Kontakt oss for en uforpliktende samtale."
            className="max-w-3xl mx-auto"
          />
          <p className="text-lg font-semibold text-primary text-center mt-4">
            ⏱️ Vi svarer innen 1-3 virkedager
          </p>
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
                      <Label htmlFor="name">Navn</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">E-post</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <Label htmlFor="message">Melding</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        disabled={isSubmitting}
                        rows={5}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sender...
                        </>
                      ) : (
                        'Send melding'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-6">Kontaktinformasjon</h2>
                  <EditableContactInfo />
                </CardContent>
              </Card>

            {/* Map Section with Google Maps Embed */}
            <Card>
              <CardContent className="pt-6 p-0">
                <iframe
                  width="100%"
                  height="450"
                  style={{ border: 0, borderRadius: '0.5rem' }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=Ægirsvei+3,+Kristiansand&zoom=15"
                  title="HandyHjelp lokasjon - Ægirsvei 3, Kristiansand"
                ></iframe>
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

              {/* How We Work */}
              <Card>
                <CardContent className="pt-6">
                  <EditableHowWeWork />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* FAQ Section */}
          <section className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">
              Ofte stilte spørsmål før du kontakter oss
            </h2>
            <Accordion type="single" collapsible className="space-y-4">
              <EditableFAQItem
                section="faq-contact"
                defaultQuestion="Hvor raskt kan dere komme?"
                defaultAnswer="For akutte henvendelser kan vi ofte være på stedet samme dag. Planlagte oppdrag avtales etter dine ønsker."
                index={1}
              />
              <EditableFAQItem
                section="faq-contact"
                defaultQuestion="Tar dere oppdrag på kveldstid?"
                defaultAnswer="Ja, vi tilbyr både kveldstjenester og helgetjenester mot et lite tillegg."
                index={2}
              />
              <EditableFAQItem
                section="faq-contact"
                defaultQuestion="Må jeg være hjemme under arbeidet?"
                defaultAnswer="Det er ikke nødvendig. Mange av våre kunder gir oss nøkkel eller kode til jobben."
                index={3}
              />
              <EditableFAQItem
                section="faq-contact"
                defaultQuestion="Hvor lang er responstiden?"
                defaultAnswer="Vi svarer på alle henvendelser innen 1-3 virkedager i åpningstiden."
                index={4}
              />
            </Accordion>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
