import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, Calculator, CheckCircle } from "lucide-react";
import { useEditableContent } from "@/hooks/useEditableContent";
import { useEditMode } from "@/contexts/EditModeContext";
import { Pencil } from "lucide-react";
import { ProcessStepEditModal } from "@/components/ProcessStepEditModal";
import { SectionHeadingEditModal } from "@/components/SectionHeadingEditModal";
import { useSequentialReveal } from "@/hooks/useScrollAnimation";

// Component for each process step
const ProcessStep = ({ number, section, defaultTitle, defaultDescription, icon, style }: {
  number: number;
  section: string;
  defaultTitle: string;
  defaultDescription: string;
  icon: any;
  style: React.CSSProperties;
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
      <div style={style}>
        <Card 
          className="card-professional p-5 md:p-6 text-center card-hover-lift relative bg-primary/5 dark:bg-primary/10 perf-contain h-full"
        >
          {isAdmin && editMode && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="absolute top-3 right-3 z-10 bg-background rounded-full p-2 shadow-lg border-2 border-primary hover:scale-110 transition-transform"
              aria-label={`Rediger steg ${number}`}
            >
              <Pencil className="h-4 w-4 text-primary" />
            </button>
          )}
          
          {/* Large step number for mobile */}
          <div className="flex justify-center mb-3 md:mb-4">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-primary rounded-full flex items-center justify-center relative">
              <IconComponent className="h-7 w-7 md:h-8 md:w-8 text-primary-foreground" />
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-secondary text-white text-xs font-bold rounded-full flex items-center justify-center md:hidden">
                {number}
              </span>
            </div>
          </div>
          
          <div className="mb-3 md:mb-4">
            <div className="text-sm font-medium text-primary mb-1 md:mb-2 hidden md:block">
              Steg {number}
            </div>
            <h3 className="text-lg md:text-xl font-bold text-foreground mb-1 md:mb-2">
              {displayTitle}
            </h3>
            
            <p className="text-sm md:text-base text-muted-foreground font-medium">
              {displayDescription}
            </p>
          </div>
        </Card>
      </div>
      
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
  const { ref, isVisible, getItemStyle } = useSequentialReveal(3, { threshold: 0.2 });
  
  const displayHeading = heading || 'Slik fungerer det';
  
  return (
    <section className="py-12 md:py-16 section-mobile" ref={ref}>
      <div className="container mx-auto px-4">
        <div className={`bg-card rounded-2xl shadow-lg border border-border/50 p-6 md:p-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="relative text-center mb-8 md:mb-12">
          {isAdmin && editMode && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="absolute top-0 right-4 z-10 bg-background rounded-full p-2 shadow-lg border-2 border-primary hover:scale-110 transition-transform"
              aria-label="Rediger Slik fungerer det overskrift"
            >
              <Pencil className="h-5 w-5 text-primary" />
            </button>
          )}
          
          <h2 id="process-heading" className="heading-section text-2xl md:text-3xl lg:text-4xl">
            {displayHeading}
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Enkelt, trygt og forutsigbart
          </p>
        </div>

        {/* Mobile: Vertical stack, Desktop: Grid */}
        <div className="flex flex-col gap-6 md:grid md:grid-cols-3 md:gap-8 mb-8 md:mb-12">
          <ProcessStep
            number={1}
            section="how-it-works-step-1"
            defaultTitle="Ta kontakt"
            defaultDescription="Ring oss eller send inn skjema"
            icon={Phone}
            style={getItemStyle(0)}
          />
          
          <ProcessStep
            number={2}
            section="how-it-works-step-2"
            defaultTitle="Få tilbud"
            defaultDescription="Tilbud tilpasset ditt behov"
            icon={Calculator}
            style={getItemStyle(1)}
          />
          
          <ProcessStep
            number={3}
            section="how-it-works-step-3"
            defaultTitle="Vi løser det"
            defaultDescription="Profesjonell utførelse"
            icon={CheckCircle}
            style={getItemStyle(2)}
          />
        </div>

        <div className="text-center" style={getItemStyle(3)}>
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