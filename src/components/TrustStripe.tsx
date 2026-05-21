import { useState } from "react";
import { ShieldCheck, MapPin, BadgePercent, UserRound } from "lucide-react";
import { useEditMode } from "@/contexts/EditModeContext";
import { useEditableContent } from "@/hooks/useEditableContent";
import { EditButton } from "@/components/ui/EditButton";
import { SectionEditModal } from "@/components/SectionEditModal";
import { useFadeInUp } from "@/hooks/useScrollAnimation";

// Tynn band rett under hero med 4 kjerne-trust-budskap. Mr. Handyman-stil:
// kompakt, ikke-distraherende, men umiddelbart tillitsforsterkende.
// Hvert budskap er editable via SectionEditModal.

const ITEMS = [
  { icon: ShieldCheck, key: "item_1", default: "Forsikret & sertifisert" },
  { icon: MapPin, key: "item_2", default: "Lokal i Kristiansand" },
  { icon: BadgePercent, key: "item_3", default: "Faste avtaler — 10% rabatt" },
  { icon: UserRound, key: "item_4", default: "Fast kontaktperson" },
];

export const TrustStripe = () => {
  const { editMode, isAdmin } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { content: item1 } = useEditableContent("trust-stripe", "item_1");
  const { content: item2 } = useEditableContent("trust-stripe", "item_2");
  const { content: item3 } = useEditableContent("trust-stripe", "item_3");
  const { content: item4 } = useEditableContent("trust-stripe", "item_4");

  const items = [
    { icon: ITEMS[0].icon, text: item1 || ITEMS[0].default },
    { icon: ITEMS[1].icon, text: item2 || ITEMS[1].default },
    { icon: ITEMS[2].icon, text: item3 || ITEMS[2].default },
    { icon: ITEMS[3].icon, text: item4 || ITEMS[3].default },
  ];

  const { ref, style } = useFadeInUp({ threshold: 0.15 });

  return (
    <>
      <section
        ref={ref}
        style={style}
        className="relative bg-card border-y border-border/60 py-4 md:py-5"
      >
        {isAdmin && editMode && (
          <EditButton
            onClick={() => setIsModalOpen(true)}
            ariaLabel="Rediger trust-stripe"
          />
        )}

        {/* Mobile: marquee. Desktop: 1×4 grid (uendret fra dagens). */}
        <div
          className="md:hidden marquee marquee-fade"
          style={{ '--marquee-duration': '25s' } as React.CSSProperties}
        >
          {/* Hidden, non-animated copy for screen readers — keeps the actual
              content accessible without reading the duplicated marquee. */}
          <ul className="sr-only">
            {items.map(({ text }, idx) => (
              <li key={idx}>{text}</li>
            ))}
          </ul>
          <div className="marquee-track" aria-hidden="true">
            {[...items, ...items].map(({ icon: Icon, text }, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 shrink-0 px-4"
              >
                <Icon
                  className="h-5 w-5 text-primary shrink-0"
                  strokeWidth={2}
                />
                <span className="text-sm font-medium text-foreground whitespace-nowrap">
                  {text}
                </span>
                <span className="text-muted-foreground/40 ml-4">•</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden md:block container mx-auto px-4">
          <div className="grid grid-cols-4 gap-6">
            {items.map(({ icon: Icon, text }, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 justify-start"
              >
                <Icon
                  className="h-6 w-6 text-primary shrink-0"
                  strokeWidth={2}
                />
                <span className="text-sm font-medium text-foreground">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Rediger trust-stripe"
        fields={[
          { section: "trust-stripe", contentKey: "item_1", label: "Punkt 1", value: items[0].text, maxLength: 60, placeholder: ITEMS[0].default },
          { section: "trust-stripe", contentKey: "item_2", label: "Punkt 2", value: items[1].text, maxLength: 60, placeholder: ITEMS[1].default },
          { section: "trust-stripe", contentKey: "item_3", label: "Punkt 3", value: items[2].text, maxLength: 60, placeholder: ITEMS[2].default },
          { section: "trust-stripe", contentKey: "item_4", label: "Punkt 4", value: items[3].text, maxLength: 60, placeholder: ITEMS[3].default },
        ]}
      />
    </>
  );
};
