import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, Calculator, CheckCircle } from "lucide-react";
import { useEditableContent } from "@/hooks/useEditableContent";
import { useEditMode } from "@/contexts/EditModeContext";
import { Pencil } from "lucide-react";
import { ProcessStepEditModal } from "@/components/ProcessStepEditModal";
import { SectionHeadingEditModal } from "@/components/SectionHeadingEditModal";

// Component for each process step
const ProcessStep = ({ number, section, defaultTitle, defaultDescription, icon }: {
  number: number;
  section: string;
  defaultTitle: string;
  defaultDescription: string;
  icon: any;
}) => {
  const { editMode, isAdmin } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { content: title } = useEditableContent(section, 'title');
  const { content: description } = useEditableContent(section, 'description');
  const IconComponent = icon;
  
  const displayTitle = title || defaultTitle;
  const displayDescription = description || defaultDescription;
  
  return (
    <>
      <Card className="card-professional p-6 text-center card-hover-lift relative bg-primary/5 dark:bg-primary/10">
        {isAdmin && editMode && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute top-4 right-4 z-10 bg-background rounded-full p-2 shadow-lg border-2 border-primary hover:scale-110 transition-transform"
            aria-label={`Rediger steg ${number}`}
          >
            <Pencil className="h-5 w-5 text-primary" />
          </button>
        )}
        
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <IconComponent className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        
        <div className="mb-4">
          <div className="text-sm font-medium text-primary mb-2">
            Steg {number}
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            {displayTitle}
          </h3>
          
          <p className="text-muted-foreground font-medium">
            {displayDescription}
          </p>
        </div>
      </Card>
      
      <ProcessStepEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        section={section}
        currentData={{
          title: displayTitle,
          description: displayDescription
        }}
        stepNumber={number}
      />
    </>
  );
};

export const ProcessSection = () => {
  const { editMode, isAdmin } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { content: heading } = useEditableContent('home-sections', 'how-it-works-heading');
  
  const displayHeading = heading || 'Slik fungerer det';
  
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="bg-card rounded-2xl shadow-lg border border-border/50 p-8 md:p-12">
        <div className="relative text-center mb-12">
          {isAdmin && editMode && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="absolute top-0 right-4 z-10 bg-background rounded-full p-2 shadow-lg border-2 border-primary hover:scale-110 transition-transform"
              aria-label="Rediger Slik fungerer det overskrift"
            >
              <Pencil className="h-5 w-5 text-primary" />
            </button>
          )}
          
          <h2 id="process-heading" className="heading-section">
            {displayHeading}
          </h2>
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
            onClick={() => window.location.href = '/tilbud'}
          >
            Kom i gang nå
          </Button>
        </div>
        </div>
      </div>
      
      <SectionHeadingEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        section="home-sections"
        currentData={{
          heading: displayHeading
        }}
        sectionLabel="Slik fungerer det"
      />
    </section>
  );
};