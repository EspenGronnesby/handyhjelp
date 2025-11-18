import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, Calculator, CheckCircle, Calendar, Award } from "lucide-react";

export const ProcessSection = () => {
  const steps = [
    {
      number: 1,
      title: "Kontakt & Behovskartlegging",
      description: "Ta kontakt via telefon eller skjema",
      icon: Phone,
      details: "Vi svarer innen 2 timer og kartlegger dine behov grundig."
    },
    {
      number: 2,
      title: "Befaring og tilbud",
      description: "Forhåndsvurdering og prisestimat",
      icon: Calculator,
      details: "Vi gjør en befaring og gir deg et transparent tilbud uten forpliktelser."
    },
    {
      number: 3,
      title: "Avtale tidspunkt",
      description: "Vi tilpasser oss din timeplan",
      icon: Calendar,
      details: "Vi finner et tidspunkt som passer deg best, enten det er i dag eller neste uke."
    },
    {
      number: 4,
      title: "Profesjonell utførelse",
      description: "Erfarne fagfolk på jobb",
      icon: CheckCircle,
      details: "Vi utfører arbeidet med høy kvalitet og rydder perfekt opp etter oss."
    },
    {
      number: 5,
      title: "Kvalitetskontroll & oppfølging",
      description: "Vi sikrer at du er fornøyd",
      icon: Award,
      details: "Gjennomgang av arbeidet sammen med deg og oppfølging ved behov. 100% tilfredsgaranti."
    }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 id="process-heading" className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Hvordan vi jobber
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            En sømløs prosess fra start til slutt
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-6 mb-12">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            
            return (
              <Card 
                key={step.number} 
                className="card-professional p-6 text-center hover:scale-105 transition-transform duration-300"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                    <IconComponent className="h-8 w-8 text-primary-foreground" />
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm font-medium text-primary mb-2">
                    Steg {step.number}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground font-medium">
                    {step.description}
                  </p>
                </div>
                
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.details}
                </p>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            variant="cta"
            onClick={() => document.getElementById('quote-standalone')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Kom i gang nå
          </Button>
        </div>
      </div>
    </section>
  );
};