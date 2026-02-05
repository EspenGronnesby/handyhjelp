import { useState, useRef } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare, Loader2 } from "lucide-react";
import { EditableHero } from "@/components/EditableHero";
import { EditableContactInfo } from "@/components/EditableContactInfo";
import { EditableHowWeWork } from "@/components/EditableHowWeWork";
import { EditableFAQItem } from "@/components/EditableFAQItem";
import { Accordion } from "@/components/ui/accordion";
import { useFormSubmit } from "@/hooks/useFormSubmit";
import { useWeb3Forms } from "@/hooks/useWeb3Forms";
import { PageSEO } from "@/components/SEO/PageSEO";
const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha>(null);
  const {
    submitToWeb3Forms,
    sendConfirmationEmail
  } = useWeb3Forms();
  const {
    submit,
    isSubmitting
  } = useFormSubmit({
    successMessage: "Melding sendt!",
    successDescription: "Vi svarer deg innen 1-3 virkedager.",
    errorMessage: "Feil ved sending",
    errorDescription: "Prøv igjen eller ring oss direkte."
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      return;
    }
    await submit(async () => {
      // Send to Web3Forms with hCaptcha token
      const success = await submitToWeb3Forms({
        subject: `Kontaktskjema fra ${formData.name}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
      });
      if (!success) {
        throw new Error("Kan ikke sende melding. Ring oss på +47 41250553");
      }

      // Send confirmation email (non-blocking)
      sendConfirmationEmail({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        customerType: "private"
      });

      // Reset form and captcha
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: ""
      });
      setCaptchaToken(null);
      captchaRef.current?.resetCaptcha();
    });
  };
  return <div className="min-h-screen">
      <PageSEO path="/kontakt" />
      <GoogleAnalytics />
      <Header />
      <BreadcrumbNavigation />
      
      <main id="main-content" className="pt-32 pb-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 mb-16">
          <EditableHero section="hero-kontakt" defaultHeading="Ta kontakt i dag" defaultSubtext="Vi er her for å hjelpe deg med alle dine eiendomsbehov. Kontakt oss for en uforpliktende samtale." className="max-w-3xl mx-auto" />
          <p className="text-lg font-semibold text-primary text-center mt-4">
            ⏱️ Vi svarer innen 1-3 virkedager
          </p>
        </section>

        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 mb-20">
            {/* Contact Form */}
            <div>
              <Card className="subtle-hover">
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-6">Send oss en melding</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name" required>Navn</Label>
                      <Input id="name" value={formData.name} onChange={e => setFormData({
                      ...formData,
                      name: e.target.value
                    })} required disabled={isSubmitting} />
                    </div>
                    <div>
                      <Label htmlFor="email" required>E-post</Label>
                      <Input id="email" type="email" value={formData.email} onChange={e => setFormData({
                      ...formData,
                      email: e.target.value
                    })} required disabled={isSubmitting} />
                    </div>
                    <div>
                      <Label htmlFor="phone" required>Telefon</Label>
                      <Input id="phone" type="tel" placeholder="8 siffer" value={formData.phone} onChange={e => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setFormData({
                        ...formData,
                        phone: value
                      });
                    }} maxLength={8} inputMode="numeric" pattern="[0-9]*" required disabled={isSubmitting} />
                    </div>
                    <div>
                      <Label htmlFor="message" required>Melding</Label>
                      <Textarea id="message" value={formData.message} onChange={e => setFormData({
                      ...formData,
                      message: e.target.value
                    })} required disabled={isSubmitting} rows={5} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <span className="text-destructive">*</span> Obligatoriske felt
                    </p>
                    {import.meta.env.VITE_HCAPTCHA_SITE_KEY && (
                      <HCaptcha
                        ref={captchaRef}
                        sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY}
                        onVerify={(token) => setCaptchaToken(token)}
                        onExpire={() => setCaptchaToken(null)}
                      />
                    )}
                    <Button type="submit" className="w-full" disabled={isSubmitting || (!captchaToken && !!import.meta.env.VITE_HCAPTCHA_SITE_KEY)}>
                      {isSubmitting ? <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sender...
                        </> : 'Send melding'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="subtle-hover">
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-6">Kontaktinformasjon</h2>
                  <EditableContactInfo />
                </CardContent>
              </Card>

            {/* Map Section with Google Maps Embed */}
            <Card>
              <CardContent className="pt-4 md:pt-6 p-0">
                <iframe width="100%" height="300" className="md:h-[450px]" style={{
                  border: 0,
                  borderRadius: '0.5rem'
                }} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=Ægirsvei+3,+Kristiansand&zoom=15" title="HandyHjelp lokasjon - Ægirsvei 3, Kristiansand"></iframe>
              </CardContent>
            </Card>

              {/* Alternative Contact */}
              <Card className="bg-accent/10 border-accent">
                
              </Card>

              {/* How We Work */}
              <Card className="subtle-hover">
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
              <EditableFAQItem section="faq-contact" defaultQuestion="Hvor raskt kan dere komme?" defaultAnswer="For akutte henvendelser kan vi ofte være på stedet samme dag. Planlagte oppdrag avtales etter dine ønsker." index={1} />
              <EditableFAQItem section="faq-contact" defaultQuestion="Tar dere oppdrag på kveldstid?" defaultAnswer="Ja, vi tilbyr både kveldstjenester og helgetjenester mot et lite tillegg." index={2} />
              <EditableFAQItem section="faq-contact" defaultQuestion="Må jeg være hjemme under arbeidet?" defaultAnswer="Det er ikke nødvendig. Mange av våre kunder gir oss nøkkel eller kode til jobben." index={3} />
              <EditableFAQItem section="faq-contact" defaultQuestion="Hvor lang er responstiden?" defaultAnswer="Vi svarer på alle henvendelser innen 1-3 virkedager i åpningstiden." index={4} />
            </Accordion>
          </section>
        </div>
      </main>

      <Footer />
    </div>;
};
export default Contact;