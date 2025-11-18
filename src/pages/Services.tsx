import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, Hammer, Droplet, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Services = () => {
  const services = [
    {
      id: "vaktmester",
      title: "Vaktmestertjenester",
      icon: Wrench,
      color: "text-accent",
      price: "Fra 650 kr/time",
      description: "Våre erfarne vaktmestere holder eiendommen din i perfekt stand hele året. Vi tilbyr alt fra løpende vedlikehold til akutte reparasjoner. Med over 20 års erfaring vet vi hva som kreves for å holde bygninger i toppform. Vi er fleksible, pålitelige og leverer alltid kvalitetsarbeid til riktig pris. Enten det gjelder enkle oppgaver eller omfattende vedlikeholdsprosjekter, er vi din faste partner for alt av vaktmestertjenester.",
      services: [
        "Maling og flekksparkler",
        "Dekk skifte på privatbiler",
        "Kjøring og transport",
        "Plenklipp, kanter og opprydding",
        "Butikk-tjenester (apotek, levering)",
        "Snømåking og strøing",
        "Blikk-tjenester",
        "Vask (utvendig og innvendig)",
        "Installasjon av hvitevarer",
        "Flytte tunge møbler"
      ],
      typicalProjects: [
        "Sesongbasert vedlikehold (vår/vinter)",
        "Løpende vaktmestertjenester for borettslag",
        "Akutt-oppdrag (snømåking, lekkasjer)",
        "Forberedelse før/etter utleie"
      ],
      priceDetails: {
        hourly: "650 kr/time",
        materials: "Materialer faktureres separat",
        travel: "Første 5 km gratis, deretter 10 kr/km",
        extras: "Ekstra tid uten avtalt pris: +50 kr/time"
      }
    },
    {
      id: "tomrer",
      title: "Tømrertjenester",
      icon: Hammer,
      color: "text-primary",
      price: "Fra 750 kr/time",
      description: "Våre dyktige tømrere håndterer alt fra små reparasjoner til omfattende byggeprosjekter. Med solid fagkompetanse og moderne verktøy leverer vi presist håndverk som varer. Vi er spesialister på både innvendig og utvendig tømrerarbeid, og vi tar ansvar for hele prosessen fra planlegging til ferdigstillelse. Enten du trenger en ny terrasse, kjøkkeninnredning eller totalrenovering, kan du stole på vår erfaring og kvalitet.",
      services: [
        "Terrasser og utvendig treverk",
        "Kjøkkenmontering og innredning",
        "Vindusskift og dørmontasje",
        "Gulvlegging (parkett, laminat, vinyl)",
        "Listverk og panel",
        "Bygge garasjer og uthus",
        "Takarbeid og takreparasjoner",
        "Trapper og rekkverk",
        "Skjæring og tilpasning",
        "Bad- og våtromsrenovering"
      ],
      typicalProjects: [
        "Bygging av terrasse (20-40 kvm)",
        "Kjøkkenrenovering med montering",
        "Totalrenovering av bad",
        "Skifte av vinduer (hele boligen)"
      ],
      priceDetails: {
        hourly: "750 kr/time",
        materials: "Materialer faktureres separat (estimat oppgis på forhånd)",
        travel: "Første 5 km gratis, deretter 10 kr/km",
        extras: "Ekstra tid uten avtalt pris: +50 kr/time"
      }
    },
    {
      id: "blikk",
      title: "Blikkenslagertjenester",
      icon: Droplet,
      color: "text-blue-600",
      price: "Fra 800 kr/time",
      description: "Vi tilbyr profesjonelle blikkenslagertjenester med fokus på kvalitet og langsiktighet. Våre fagfolk har bred erfaring med alt fra takreparasjoner til omfattende blikkarbeider på større bygg. Vi bruker kun materialer av høy kvalitet og følger alle relevante standarder. Enten det gjelder akutte lekkasjer eller planlagte prosjekter, leverer vi trygt og solid håndverk som beskytter eiendommen din mot vær og vind i mange år fremover.",
      services: [
        "Takrenner og nedløp",
        "Takreparasjoner og taktekking",
        "Gesimser og listverk i metall",
        "Beslag og fasadekledning",
        "Pipe-inndekning og pipehatter",
        "Takvinduer og lyskupler",
        "Ventilasjon og luftespalter",
        "Akutte lekkasjeutbedringer",
        "Takopplett og skiferheter",
        "Komplett blikkpakke ved nybygg"
      ],
      typicalProjects: [
        "Skifte av takrenner (hele huset)",
        "Reparere lekkasjer i tak",
        "Montere nye takvinduer",
        "Komplett blikkarbeid på nybygg"
      ],
      priceDetails: {
        hourly: "800 kr/time",
        materials: "Materialer faktureres separat (estimat oppgis på forhånd)",
        travel: "Første 5 km gratis, deretter 10 kr/km",
        extras: "Ekstra tid uten avtalt pris: +50 kr/time"
      }
    }
  ];

  return (
    <div className="min-h-screen">
      <GoogleAnalytics />
      <Header />
      <BreadcrumbNavigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-background to-muted">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="heading-section font-heading mb-6">
              Alt du trenger av eiendomstjenester
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Fra enkle vaktmesteroppgaver til omfattende tømrer- og blikkprosjekter. 
              Vi leverer kvalitet, trygghet og pålitelighet i alt vi gjør.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/tilbud">
                <Button variant="cta" size="lg">
                  Få gratis tilbud
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/kontakt">
                <Button variant="cta-outline" size="lg">
                  Kontakt oss
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Service Sections */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="space-y-24">
            {services.map((service, index) => (
              <div 
                key={service.id}
                id={service.id}
                className={`${index % 2 === 1 ? 'bg-muted/30 -mx-4 px-4 py-12 rounded-lg' : ''}`}
              >
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                  {/* Left Column: Info */}
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`p-4 rounded-full bg-background shadow-lg ${service.color}`}>
                        <service.icon className="h-8 w-8" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-heading font-bold">{service.title}</h2>
                        <Badge variant="secondary" className="mt-2">{service.price}</Badge>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {service.description}
                    </p>

                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-4">Vi tilbyr:</h3>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {service.services.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Link to="/tilbud">
                      <Button variant="cta" className="w-full sm:w-auto">
                        Bestill denne tjenesten
                      </Button>
                    </Link>
                  </div>

                  {/* Right Column: Pricing & Projects */}
                  <div className="space-y-6">
                    {/* Price Details Card */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Priser og betingelser</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="text-sm text-muted-foreground">Timepris:</span>
                          <span className="font-semibold">{service.priceDetails.hourly}</span>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-sm text-muted-foreground">Materialer:</span>
                          <span className="text-sm text-right">{service.priceDetails.materials}</span>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-sm text-muted-foreground">Kjøring:</span>
                          <span className="text-sm text-right">{service.priceDetails.travel}</span>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-sm text-muted-foreground">Tillegg:</span>
                          <span className="text-sm text-right">{service.priceDetails.extras}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Typical Projects Card */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Typiske prosjekter</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {service.typicalProjects.map((project, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-1" />
                              <span className="text-sm">{project}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Before/After Placeholder */}
                    <Card>
                      <CardContent className="p-0">
                        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                          <div className="text-center text-muted-foreground">
                            <p className="text-sm mb-1">Før/Etter bilder</p>
                            <p className="text-xs">Kommer snart</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table: One-time vs Fixed Agreement */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold mb-4">
              Engangsjobb eller fast avtale?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Velg det som passer deg best. Faste avtaler gir deg 10% rabatt og prioritert service.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Engangsjobb</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <span className="text-sm">Fleksibel bestilling når du trenger det</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <span className="text-sm">Ingen binding</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <span className="text-sm">Betaler kun for utført arbeid</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <span className="text-sm">Perfekt for enkeltstående prosjekter</span>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Standard timepriser gjelder</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary border-2">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>Fast avtale</CardTitle>
                  <Badge variant="default" className="bg-accent text-white">Anbefalt</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <span className="text-sm font-semibold">10% rabatt på alle tjenester</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <span className="text-sm">Prioritert service og responstid</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <span className="text-sm">Fast kontaktperson</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <span className="text-sm">Planlagt vedlikehold hele året</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <span className="text-sm">Forutsigbare kostnader</span>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Valgfri frekvens: ukentlig, månedlig eller årlig</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Link to="/tilbud">
              <Button variant="cta" size="lg">
                Bestill fast avtale og få 10% rabatt
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold mb-4">
              Tilleggstjenester
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Vi tilbyr også andre tjenester for å gjøre hverdagen enklere
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { title: "Akuttservice", desc: "24/7 beredskap ved akutte hendelser", price: "Tillegg +200 kr" },
              { title: "Materialinnkjøp", desc: "Vi handler inn det du trenger", price: "Estimat på forhånd" },
              { title: "Avfallshåndtering", desc: "Vi rydder og kvitter oss med avfall", price: "Etter volum" },
              { title: "Prosjektledelse", desc: "Vi koordinerer flere fagfolk", price: "Avtales separat" }
            ].map((item, idx) => (
              <Card key={idx} className="text-center">
                <CardHeader>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{item.desc}</p>
                  <Badge variant="secondary">{item.price}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
