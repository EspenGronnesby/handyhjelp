import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Award, Shield, Clock, Users, CheckCircle2, Star } from "lucide-react";

const About = () => {
  const timeline = [
    { year: "2004", event: "HandyHjelp ble grunnlagt i Kristiansand" },
    { year: "2008", event: "Utvidet til å tilby blikkenslagertjenester" },
    { year: "2012", event: "Nådde milepælen med 100 fornøyde bedriftskunder" },
    { year: "2016", event: "Fikk sertifisering som godkjent entreprenør" },
    { year: "2020", event: "Lanserte faste vedlikeholdsavtaler for bedrifter" },
    { year: "2025", event: "Over 200 faste kunder og 20+ års erfaring" },
  ];

  const whyChooseUs = [
    {
      icon: Clock,
      title: "20+ års erfaring",
      description: "To tiår med profesjonell eiendomspleie i Kristiansand-regionen"
    },
    {
      icon: Shield,
      title: "Fullt forsikret",
      description: "Omfattende forsikringsdekning for alle typer oppdrag"
    },
    {
      icon: Award,
      title: "Sertifisert kvalitet",
      description: "Godkjent av Direktoratet for byggkvalitet (DiBK)"
    },
    {
      icon: Users,
      title: "Erfarne fagfolk",
      description: "Alle våre ansatte har fagbrev og dokumentert erfaring"
    },
    {
      icon: CheckCircle2,
      title: "100% tilfredsgaranti",
      description: "Vi står for arbeidet vårt og fikser eventuelle mangler kostnadsfritt"
    },
    {
      icon: Star,
      title: "Høy kundetilfredshet",
      description: "4.8/5 stjerner basert på 200+ kundeanmeldelser"
    },
  ];

  const team = [
    { name: "Ole Hansen", role: "Daglig leder & Vaktmester", experience: "20 år" },
    { name: "Kari Johansen", role: "Fagansvarlig Tømrer", experience: "15 år" },
    { name: "Erik Nilsen", role: "Fagansvarlig Blikk", experience: "18 år" },
    { name: "Maria Andersen", role: "Prosjektleder", experience: "10 år" },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-32 pb-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 mb-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold mb-6 text-foreground">
              Din pålitelige partner i 20+ år
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Fra små reparasjoner til store vedlikeholdsprosjekter - HandyHjelp har vært 
              Kristiansands foretrukne valg for eiendomspleie siden 2004.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/kontakt">
                <Button variant="cta" size="lg">Møt teamet</Button>
              </Link>
              <Link to="/#quote-form">
                <Button variant="cta-outline" size="lg">Få tilbud</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="bg-muted py-16 mb-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Vår reise</h2>
            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                {timeline.map((item, index) => (
                  <div key={index} className="flex gap-6 items-start">
                    <div className="flex-shrink-0 w-20 text-right">
                      <span className="text-2xl font-bold text-primary">{item.year}</span>
                    </div>
                    <div className="flex-shrink-0 mt-2">
                      <div className="w-4 h-4 rounded-full bg-primary"></div>
                    </div>
                    <div className="flex-1 pb-8 border-l-2 border-border pl-6 -ml-2">
                      <p className="text-lg">{item.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="container mx-auto px-4 mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Hvorfor velge oss?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyChooseUs.map((item, index) => (
              <Card key={index} className="border-2 hover:border-primary transition-colors">
                <CardContent className="pt-6">
                  <item.icon className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="bg-muted py-16 mb-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">Møt teamet</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Våre erfarne fagfolk er klar til å hjelpe deg med alle dine eiendomsbehov
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {team.map((member, index) => (
                <Card key={index}>
                  <CardContent className="pt-6 text-center">
                    <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                      <Users className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
                    <p className="text-sm text-muted-foreground mb-1">{member.role}</p>
                    <p className="text-xs text-primary font-medium">{member.experience} erfaring</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Certifications Section */}
        <section className="container mx-auto px-4 mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Sertifiseringer & Kvalifikasjoner</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <Award className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3">Offisielle godkjenninger</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>✓ Godkjent av Direktoratet for byggkvalitet (DiBK)</li>
                  <li>✓ Sertifisert elektriker med autorisasjon</li>
                  <li>✓ VVS-autorisasjon for sanitær og varme</li>
                  <li>✓ Miljøsertifisert for håndtering av avfall</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Shield className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3">Forsikring & Garantier</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>✓ Fullverdig yrkesskadeforsikring</li>
                  <li>✓ Ansvarsforsikring opp til 10 mill. kr</li>
                  <li>✓ 5 års garanti på håndverksarbeid</li>
                  <li>✓ 2 års garanti på materialer og utstyr</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Klar til å komme i gang?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
              Kontakt oss i dag for en uforpliktende samtale om dine eiendomsbehov
            </p>
            <Link to="/kontakt">
              <Button variant="secondary" size="lg">
                Ta kontakt med oss
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
