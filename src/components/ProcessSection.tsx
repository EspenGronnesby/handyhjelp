import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, Calculator, CheckCircle } from "lucide-react";

export const ProcessSection = () => {
  const steps = [
    {
      number: 1,
      title: "Ta kontakt",
      description: "Ring oss eller send inn skjema",
      icon: Phone
    },
    {
      number: 2,
      title: "Få tilbud",
      description: "Tilbud tilpasset ditt behov",
      icon: Calculator
    },
    {
      number: 3,
      title: "Vi løser det",
      description: "Profesjonell utførelse",
      icon: CheckCircle
    }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 id="process-heading" className="heading-section">
            Slik fungerer det
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Enkelt, trygt og forutsigbart. Fra første kontakt til ferdig jobb.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
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
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            className="bg-success hover:bg-success-hover text-success-foreground px-8 py-4"
            onClick={() => document.getElementById('quote-standalone')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Kom i gang nå
          </Button>
        </div>
      </div>
    </section>
  );
};