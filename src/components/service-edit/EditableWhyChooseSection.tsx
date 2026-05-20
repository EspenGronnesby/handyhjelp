import { useState } from "react";
import { Award, MapPin, Shield, EyeOff, type LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EditButton } from "@/components/ui/EditButton";
import { useEditMode } from "@/contexts/EditModeContext";
import { useEditableContent } from "@/hooks/useEditableContent";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { isItemEmpty } from "@/lib/gridUtils";
import { GradientHeaderCard } from "@/components/ui/GradientHeaderCard";
import { useStaggeredGridReveal } from "@/hooks/useScrollAnimation";

interface WhyChooseItem {
  title: string;
  description: string;
}

// Visual identity per slot — kept stable across renders so each card has the
// same look every time the user visits. Title/description are still editable.
const slotVisuals: { icon: LucideIcon; gradient: string }[] = [
  { icon: Award, gradient: "from-cyan-500 via-blue-500 to-indigo-600" },
  { icon: MapPin, gradient: "from-emerald-500 via-teal-500 to-cyan-600" },
  { icon: Shield, gradient: "from-amber-500 via-orange-500 to-rose-600" },
];

const EditableWhyChooseSection = () => {
  const { editMode, isAdmin } = useEditMode();
  const [isEditing, setIsEditing] = useState(false);
  const { content, updateContent } = useEditableContent("why-choose-section", "data");

  const defaultItems: WhyChooseItem[] = [
    {
      title: "Erfarne fagfolk",
      description: "Over 20 års erfaring i bransjen med sertifiserte håndverkere"
    },
    {
      title: "Konkurransedyktige priser",
      description: "Kvalitet til riktig pris – vi garanterer gode priser uten å gå på kompromiss med kvalitet"
    },
    {
      title: "Rask respons",
      description: "Vi er der når du trenger oss – svartid på 1-3 virkedager"
    }
  ];

  const items: WhyChooseItem[] = content ? JSON.parse(content) : defaultItems;
  const [editedItems, setEditedItems] = useState<WhyChooseItem[]>(items);
  const [heading, setHeading] = useState("Hvorfor velge HandyHjelp?");

  // Filter visible items (non-empty title and description)
  const visibleItems = items.filter(item =>
    isAdmin && editMode ? true : !isItemEmpty(item.title, item.description)
  );

  const handleSave = async () => {
    await updateContent(JSON.stringify(editedItems));
    setIsEditing(false);
  };

  const updateItem = (index: number, field: keyof WhyChooseItem, value: string) => {
    const updated = [...editedItems];
    updated[index] = { ...updated[index], [field]: value };
    setEditedItems(updated);
  };

  // Reveal-once fade-in via IntersectionObserver
  const { ref, getItemStyle } = useStaggeredGridReveal(visibleItems.length, 3, { threshold: 0.15 });

  if (visibleItems.length === 0 && !(isAdmin && editMode)) {
    return null;
  }

  return (
    <>
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4 relative">
          {isAdmin && editMode && (
            <EditButton
              onClick={() => setIsEditing(true)}
              ariaLabel="Rediger hvorfor-seksjon"
            />
          )}

          <SectionHeading
            icon={Award}
            gradient="from-cyan-500 via-blue-500 to-indigo-600"
            title={heading}
            align="center"
            className="mb-10 md:mb-14"
          />

          <div
            ref={ref}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto"
          >
            {visibleItems.map((item, index) => {
              const isHidden = isItemEmpty(item.title, item.description);
              const visual = slotVisuals[index % slotVisuals.length];

              return (
                <div
                  key={index}
                  style={getItemStyle(index)}
                  className={isHidden && isAdmin && editMode ? "opacity-50" : ""}
                >
                  <GradientHeaderCard
                    icon={visual.icon}
                    gradient={visual.gradient}
                    title={item.title}
                  >
                    {isHidden && isAdmin && editMode && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        <EyeOff className="h-3 w-3" />
                        <span>Skjult</span>
                      </div>
                    )}
                    <p className="text-sm md:text-base text-muted-foreground">
                      {item.description}
                    </p>
                  </GradientHeaderCard>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rediger Hvorfor velge oss-seksjon</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label>Overskrift</Label>
              <Input
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                maxLength={100}
              />
            </div>

            {editedItems.map((item, index) => (
              <div key={index} className="border-b pb-4">
                <h3 className="text-sm font-semibold mb-3">Punkt {index + 1}</h3>
                <div className="space-y-3">
                  <div>
                    <Label>Tittel</Label>
                    <Input
                      value={item.title}
                      onChange={(e) => updateItem(index, 'title', e.target.value)}
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <Label>Beskrivelse</Label>
                    <Textarea
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      maxLength={200}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex gap-4">
              <Button onClick={handleSave} className="flex-1">Lagre endringer</Button>
              <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1">Avbryt</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditableWhyChooseSection;
