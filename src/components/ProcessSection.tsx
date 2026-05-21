import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Calculator, CheckCircle, type LucideIcon } from "lucide-react";
import { useEditableContent } from "@/hooks/useEditableContent";
import { useEditMode } from "@/contexts/EditModeContext";
import { EditButton } from "@/components/ui/EditButton";
import { ProcessStepEditModal } from "@/components/ProcessStepEditModal";
import { SectionHeadingEditModal } from "@/components/SectionHeadingEditModal";
import { useStaggeredGridReveal } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Workflow } from "lucide-react";

// Per-step card — gradient header with large icon + step number, followed
// by title and description. Fully static; no continuous scroll-driven motion.
const ProcessStepCard = ({
  stepNumber,
  section,
  title,
  description,
  icon: Icon,
  gradient,
  style,
}: {
  stepNumber: number;
  section: string;
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  style: React.CSSProperties;
}) => {
  const { editMode, isAdmin } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div style={style} className="h-full">
        <div className="glass-card relative h-full !overflow-visible group flex flex-col">
          {isAdmin && editMode && (
            <EditButton
              onClick={() => setIsModalOpen(true)}
              ariaLabel={`Rediger steg ${stepNumber}`}
            />
          )}

          {/* Gradient header with icon and step indicator */}
          <div
            className={cn(
              "relative w-full aspect-[5/3] rounded-xl overflow-hidden mb-4 bg-gradient-to-br",
              gradient
            )}
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "16px 16px",
              }}
            />
            <div className="absolute top-4 left-4 text-white/80 text-sm font-semibold tracking-widest">
              0{stepNumber}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon
                className="text-white/95 drop-shadow-lg w-16 h-16 md:w-20 md:h-20 transition-transform duration-300 group-hover:scale-110"
                strokeWidth={1.5}
              />
            </div>
          </div>

          <div className="p-4 md:p-6 pt-0 flex-1 flex flex-col">
            <div className="text-xs font-semibold text-primary mb-1">
              Steg {stepNumber}
            </div>
            <h3 className="text-lg md:text-xl font-bold text-foreground mb-2 font-heading">
              {title}
            </h3>
            <p className="text-sm md:text-base text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
      </div>

      <ProcessStepEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        section={section}
        currentData={{ title, description }}
        stepNumber={stepNumber}
      />
    </>
  );
};

export const ProcessSection = () => {
  const { editMode, isAdmin } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { content: heading } = useEditableContent('home-sections', 'how-it-works-heading');

  const { content: step1Title } = useEditableContent('how-it-works-step-1', 'title');
  const { content: step1Desc } = useEditableContent('how-it-works-step-1', 'description');
  const { content: step2Title } = useEditableContent('how-it-works-step-2', 'title');
  const { content: step2Desc } = useEditableContent('how-it-works-step-2', 'description');
  const { content: step3Title } = useEditableContent('how-it-works-step-3', 'title');
  const { content: step3Desc } = useEditableContent('how-it-works-step-3', 'description');

  const displayHeading = heading || 'Slik fungerer det';

  const steps = [
    {
      section: 'how-it-works-step-1',
      title: step1Title || 'Ta kontakt',
      description: step1Desc || 'Ring oss eller send inn skjema — vi svarer raskt og hjelper deg med å beskrive jobben.',
      icon: Phone,
      gradient: 'from-cyan-500 via-blue-500 to-indigo-600',
    },
    {
      section: 'how-it-works-step-2',
      title: step2Title || 'Få tilbud',
      description: step2Desc || 'Du får et tydelig tilbud tilpasset ditt behov — ingen skjulte gebyrer eller overraskelser.',
      icon: Calculator,
      gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    },
    {
      section: 'how-it-works-step-3',
      title: step3Title || 'Vi løser det',
      description: step3Desc || 'Erfarne fagfolk kommer på avtalt tid og utfører jobben profesjonelt — du slipper bekymringene.',
      icon: CheckCircle,
      gradient: 'from-amber-500 via-orange-500 to-rose-600',
    },
  ];

  // One-time fade-in + glide-up when the grid enters view.
  const { ref, getItemStyle } = useStaggeredGridReveal(steps.length, 3, { threshold: 0.15 });

  return (
    <section className="py-10 md:py-24">
      <div className="container mx-auto px-4">
        <div className="relative mb-8 md:mb-12">
          {isAdmin && editMode && (
            <EditButton onClick={() => setIsModalOpen(true)} ariaLabel="Rediger Slik fungerer det overskrift" />
          )}

          <SectionHeading
            icon={Workflow}
            gradient="from-emerald-500 via-teal-500 to-cyan-600"
            title={displayHeading}
            subtitle="Enkelt, trygt og forutsigbart"
            align="center"
          />
        </div>

        <div
          ref={ref}
          className="swim-lane md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:px-0 md:pb-0 md:[&>*]:w-auto max-w-6xl md:mx-auto"
        >
          {steps.map((step, idx) => (
            <ProcessStepCard
              key={step.section}
              stepNumber={idx + 1}
              section={step.section}
              title={step.title}
              description={step.description}
              icon={step.icon}
              gradient={step.gradient}
              style={getItemStyle(idx)}
            />
          ))}
        </div>

        <div className="text-center mt-8 md:mt-16">
          <Button
            size="lg"
            className="bg-success hover:bg-success-hover text-success-foreground min-h-11 px-8 py-4"
            onClick={() => window.location.href = '/tilbud'}
          >
            Kom i gang nå
          </Button>
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
