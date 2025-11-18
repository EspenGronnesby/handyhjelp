import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, Hammer, Droplet, CheckCircle2, ArrowRight, Calculator } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Services = () => {
  const [selectedService, setSelectedService] = useState<string>("vaktmester");
  const [hours, setHours] = useState<number>(1);
  const [distance, setDistance] = useState<number>(0);

  const serviceRates = {
    vaktmester: { rate: 650, name: "Vaktmester" },
    tomrer: { rate: 750, name: "Tømrer" },
    blikk: { rate: 800, name: "Blikk" }
  };

  const calculatePrice = () => {
    const service = serviceRates[selectedService as keyof typeof serviceRates];
    const laborCost = service.rate * hours;
    const travelCost = distance > 5 ? (distance - 5) * 10 : 0;
    return laborCost + travelCost;
  };

  const services = [
    {
      id: "vaktmester",
      title: "Vaktmestertjenester",
      icon: Wrench,
      price: "Fra 650 kr/time",
      services: [
        "Maling og flekksparkler",
        "Dekk skifte",
        "Kjøring og transport",
        "Plenklipp og opprydding",
        "Snømåking og strøing",
        "Vask (utvendig/innvendig)",
        "Installasjon hvitevarer",
        "Flytte møbler"
      ]
    },
    {
      id: "tomrer",
      title: "Tømrertjenester",
      icon: Hammer,
      price: "Fra 750 kr/time",
      services: [
        "Terrasser og utvendig treverk",
        "Kjøkkenmontering",
        "Vindusskift og dørmontasje",
        "Gulvlegging",
        "Listverk og panel",
        "Garasjer og uthus",
        "Takarbeid",
        "Trapper og rekkverk"
      ]
    },
    {
      id: "blikk",
      title: "Blikkenslagertjenester",
      icon: Droplet,
      price: "Fra 800 kr/time",
      services: [
        "Takrenner og nedløp",
        "Takreparasjoner",
        "Gesimser i metall",
        "Beslag og fasadekledning",
        "Pipe-inndekning",
        "Takvinduer",
        "Ventilasjon",
        "Akutte lekkasjeutbedringer"
      ]
    }
  ];

  return (
    <div className="min-h-screen">
      <GoogleAnalytics />
      <Header />
      <BreadcrumbNavigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Våre tjenester
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Profesjonelle håndverkstjenester til konkurransedyktige priser
            </p>
          </div>
        </div>
      </section>

      {/* Price Calculator */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                <CardTitle>Priskalkulator</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <div>
                  <Label htmlFor="service">Tjeneste</Label>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger id="service">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vaktmester">Vaktmester</SelectItem>
                      <SelectItem value="tomrer">Tømrer</SelectItem>
                      <SelectItem value="blikk">Blikk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="hours">Timer</Label>
                  <Input
                    id="hours"
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={hours}
                    onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="distance">Km (fra senter)</Label>
                  <Input
                    id="distance"
                    type="number"
                    min="0"
                    value={distance}
                    onChange={(e) => setDistance(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Arbeid ({hours}t × {serviceRates[selectedService as keyof typeof serviceRates].rate} kr):</span>
                  <span className="font-semibold">{(serviceRates[selectedService as keyof typeof serviceRates].rate * hours).toLocaleString('nb-NO')} kr</span>
                </div>
                {distance > 5 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Kjøring ({distance - 5} km × 10 kr):</span>
                    <span className="font-semibold">{((distance - 5) * 10).toLocaleString('nb-NO')} kr</span>
                  </div>
                )}
                <div className="pt-2 border-t border-primary/20 flex justify-between items-center">
                  <span className="font-bold">Estimert totalt:</span>
                  <span className="text-2xl font-bold text-primary">{calculatePrice().toLocaleString('nb-NO')} kr</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                * Materialer faktureres separat. Første 5 km gratis.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service) => (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col items-center text-center">
                    <div className="p-4 rounded-full bg-primary/10 mb-4">
                      <service.icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl mb-2">{service.title}</CardTitle>
                    <Badge variant="secondary">{service.price}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-6">
                    {service.services.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                  <Link to="/tilbud">
                    <Button variant="cta" className="w-full">
                      Bestill tjeneste
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Details */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-heading font-bold text-center mb-12">
              Hva inkluderer prisen?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Inkludert i timeprisen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    "Fagkyndig arbeidskraft",
                    "Standard verktøy og utstyr",
                    "Opprydding etter arbeid",
                    "Kvalitetskontroll",
                    "Forsikring og garantier"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Faktureres separat</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    "Materialer (estimat oppgis)",
                    "Kjøring over 5 km (10 kr/km)",
                    "Avfallshåndtering (etter volum)",
                    "Ekstra tid uten avtalt pris (+50 kr/t)",
                    "Akuttservice kveld/helg (+200 kr)"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison: One-time vs Fixed */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold mb-4">
              Fast avtale = 10% rabatt
            </h2>
            <p className="text-muted-foreground">
              Få forutsigbare kostnader og prioritert service
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Engangsjobb</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Fleksibel bestilling",
                  "Ingen binding",
                  "Standard timepriser",
                  "Betaler kun for utført arbeid"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-success border-2">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>Fast avtale</CardTitle>
                  <Badge className="bg-success text-success-foreground">Spar 10%</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "10% rabatt på alle tjenester",
                  "Prioritert service",
                  "Fast kontaktperson",
                  "Planlagt vedlikehold",
                  "Forutsigbare kostnader"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Link to="/tilbud">
              <Button variant="cta" size="lg">
                Få tilbud på fast avtale
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
