import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, Calculator, CheckCircle } from "lucide-react";
import { EditableWrapper } from "@/components/EditableWrapper";
import { useEditableContent } from "@/hooks/useEditableContent";

// Component for each process step
const ProcessStep = ({ number, section, defaultTitle, defaultDescription, icon }: {
  number: number;
  section: string;
  defaultTitle: string;
  defaultDescription: string;
  icon: any;
}) => {
  const { content: title } = useEditableContent(section, 'title');
  const { content: description } = useEditableContent(section, 'description');
  const IconComponent = icon;
  
  return (
    <Card className="card-professional p-6 text-center hover:scale-105 transition-transform duration-300">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
          <IconComponent className="h-8 w-8 text-primary-foreground" />
        </div>
      </div>
      
      <div className="mb-4">
        <div className="text-sm font-medium text-primary mb-2">
          Steg {number}
        </div>
        <EditableWrapper
          section={section}
          contentKey="title"
          label={`Steg ${number} - Tittel`}
          maxLength={50}
        >
          <h3 className="text-xl font-bold text-foreground mb-2">
            {title || defaultTitle}
          </h3>
        </EditableWrapper>
        
        <EditableWrapper
          section={section}
          contentKey="description"
          label={`Steg ${number} - Beskrivelse`}
          maxLength={200}
          multiline
        >
          <p className="text-muted-foreground font-medium">
            {description || defaultDescription}
          </p>
        </EditableWrapper>
      </div>
    </Card>
  );
};

export const ProcessSection = () => {
  const { content: heading } = useEditableContent('home-sections', 'how-it-works-heading');
  
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <EditableWrapper
            section="home-sections"
            contentKey="how-it-works-heading"
            label="Overskrift: Slik fungerer det"
            maxLength={50}
          >
            <h2 id="process-heading" className="heading-section">
              {heading || 'Slik fungerer det'}
            </h2>
          </EditableWrapper>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Enkelt, trygt og forutsigbart. Fra første kontakt til ferdig jobb.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <ProcessStep
            number={1}
            section="how-it-works-step-1"
            defaultTitle="Ta kontakt"
            defaultDescription="Ring oss eller send inn skjema"
            icon={Phone}
          />
          
          <ProcessStep
            number={2}
            section="how-it-works-step-2"
            defaultTitle="Få tilbud"
            defaultDescription="Tilbud tilpasset ditt behov"
            icon={Calculator}
          />
          
          <ProcessStep
            number={3}
            section="how-it-works-step-3"
            defaultTitle="Vi løser det"
            defaultDescription="Profesjonell utførelse"
            icon={CheckCircle}
          />
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