import { useState } from "react";
import { ShieldCheck, BadgeCheck, Sparkles, Award } from "lucide-react";
import { useEditMode } from "@/contexts/EditModeContext";
import { useEditableContent } from "@/hooks/useEditableContent";
import { EditButton } from "@/components/ui/EditButton";
import { SectionEditModal } from "@/components/SectionEditModal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useFadeInUp } from "@/hooks/useScrollAnimation";

// Mr. Handyman-inspirert "Vår garanti"-seksjon. Etablerer tillit gjennom en
// klart formulert promise + tre konkrete punkter.
export const GuaranteeSection = () => {
  const { editMode, isAdmin } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { content: heading } = useEditableContent("guarantee", "heading");
  const { content: promise } = useEditableContent("guarantee", "promise");
  const { content: point1 } = useEditableContent("guarantee", "point_1");
  const { content: point2 } = useEditableContent("guarantee", "point_2");
  const { content: point3 } = useEditableContent("guarantee", "point_3");

  const displayHeading = heading || "Vår garanti til deg";
  const displayPromise =
    promise ||
    "Hvis jobben ikke er gjort riktig, gjør vi det om — uten ekstra kostnad. Det er vårt løfte til deg.";
  const displayPoint1 = point1 || "Forsikret og sertifisert arbeid";
  const displayPoint2 = point2 || "Fast pris uten skjulte kostnader";
  const displayPoint3 = point3 || "Garanti på alt utført arbeid";

  const { ref, style } = useFadeInUp({ threshold: 0.15 });

  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          style={style}
          className="max-w-4xl mx-auto relative"
        >
          {isAdmin && editMode && (
            <EditButton
              onClick={() => setIsModalOpen(true)}
              ariaLabel="Rediger Vår garanti"
            />
          )}

          <SectionHeading
            icon={Award}
            gradient="from-emerald-500 via-teal-500 to-cyan-600"
            title={displayHeading}
          />

          <div className="glass-card p-6 md:p-8 !border-success !border-2">
            <p className="text-lg md:text-xl text-foreground leading-relaxed mb-6 font-medium">
              "{displayPromise}"
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 pt-2">
              {[
                { icon: ShieldCheck, text: displayPoint1 },
                { icon: BadgeCheck, text: displayPoint2 },
                { icon: Sparkles, text: displayPoint3 },
              ].map(({ icon: Icon, text }, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Icon
                    className="h-5 w-5 text-success shrink-0 mt-0.5"
                    strokeWidth={2}
                  />
                  <span className="text-sm md:text-base text-foreground font-medium">
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SectionEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Rediger Vår garanti-seksjon"
        fields={[
          { section: "guarantee", contentKey: "heading", label: "Overskrift", value: displayHeading, maxLength: 60 },
          { section: "guarantee", contentKey: "promise", label: "Hovedlofte", value: displayPromise, multiline: true, maxLength: 300 },
          { section: "guarantee", contentKey: "point_1", label: "Punkt 1", value: displayPoint1, maxLength: 80 },
          { section: "guarantee", contentKey: "point_2", label: "Punkt 2", value: displayPoint2, maxLength: 80 },
          { section: "guarantee", contentKey: "point_3", label: "Punkt 3", value: displayPoint3, maxLength: 80 },
        ]}
      />
    </section>
  );
};
