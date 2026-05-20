import { useState } from "react";
import { CheckCircle2, Receipt } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EditButton } from "@/components/ui/EditButton";
import { useEditMode } from "@/contexts/EditModeContext";
import { useEditableContent } from "@/hooks/useEditableContent";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GradientHeaderCard } from "@/components/ui/GradientHeaderCard";
import { useStaggeredGridReveal } from "@/hooks/useScrollAnimation";

interface PricingData {
  heading: string;
  includedTitle: string;
  includedItems: string[];
  separateTitle: string;
  separateItems: string[];
}

const EditablePricingDetails = () => {
  const { editMode } = useEditMode();
  const [isEditing, setIsEditing] = useState(false);
  const { content, updateContent } = useEditableContent("pricing-details", "data");

  const defaultData: PricingData = {
    heading: "Hva inkluderer prisen?",
    includedTitle: "Inkludert i timeprisen",
    includedItems: [
      "Fagkyndig arbeidskraft",
      "Standard verktøy og utstyr",
      "Opprydding etter arbeid",
      "Kvalitetskontroll",
      "Forsikring og garantier"
    ],
    separateTitle: "Faktureres separat",
    separateItems: [
      "Materialer (estimat oppgis)",
      "Kjøring over 5 km (10 kr/km)",
      "Avfallshåndtering (etter volum)",
      "Ekstra tid uten avtalt pris (+50 kr/t)",
      "Akuttservice kveld/helg (+200 kr)"
    ]
  };

  const data: PricingData = content ? JSON.parse(content) : defaultData;
  const [editedData, setEditedData] = useState<PricingData>(data);

  const handleSave = async () => {
    await updateContent(JSON.stringify(editedData));
    setIsEditing(false);
  };

  const updateItem = (list: 'includedItems' | 'separateItems', index: number, value: string) => {
    const updated = { ...editedData };
    updated[list][index] = value;
    setEditedData(updated);
  };

  const { ref, getItemStyle } = useStaggeredGridReveal(2, 2, { threshold: 0.15 });

  return (
    <>
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4 relative">
          {editMode && (
            <EditButton
              onClick={() => setIsEditing(true)}
              ariaLabel="Rediger prisdetaljer"
            />
          )}

          <div className="max-w-5xl mx-auto">
            <SectionHeading
              icon={Receipt}
              gradient="from-emerald-500 via-teal-500 to-cyan-600"
              title={data.heading}
              align="center"
              className="mb-10 md:mb-14"
            />

            <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div style={getItemStyle(0)}>
                <GradientHeaderCard
                  icon={CheckCircle2}
                  gradient="from-emerald-500 via-teal-500 to-cyan-600"
                  title={data.includedTitle}
                >
                  <ul className="space-y-3 mt-1">
                    {data.includedItems.map((item, idx) => (
                      item && (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                          <span className="text-sm md:text-base leading-snug text-muted-foreground">{item}</span>
                        </li>
                      )
                    ))}
                  </ul>
                </GradientHeaderCard>
              </div>

              <div style={getItemStyle(1)}>
                <GradientHeaderCard
                  icon={Receipt}
                  gradient="from-amber-500 via-orange-500 to-rose-600"
                  title={data.separateTitle}
                >
                  <ul className="space-y-3 mt-1">
                    {data.separateItems.map((item, idx) => (
                      item && (
                        <li key={idx} className="flex items-start gap-2">
                          <Receipt className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                          <span className="text-sm md:text-base leading-snug text-muted-foreground">{item}</span>
                        </li>
                      )
                    ))}
                  </ul>
                </GradientHeaderCard>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rediger prisdetaljer</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label>Hovedoverskrift</Label>
              <Input
                value={editedData.heading}
                onChange={(e) => setEditedData({ ...editedData, heading: e.target.value })}
              />
            </div>

            <div className="border-b pb-4">
              <h3 className="text-sm font-semibold mb-3">Inkludert i prisen</h3>
              <div className="space-y-3">
                <div>
                  <Label>Tittel</Label>
                  <Input
                    value={editedData.includedTitle}
                    onChange={(e) => setEditedData({ ...editedData, includedTitle: e.target.value })}
                  />
                </div>
                {editedData.includedItems.map((item, index) => (
                  <Input
                    key={index}
                    value={item}
                    onChange={(e) => updateItem('includedItems', index, e.target.value)}
                    placeholder={`Punkt ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="border-b pb-4">
              <h3 className="text-sm font-semibold mb-3">Faktureres separat</h3>
              <div className="space-y-3">
                <div>
                  <Label>Tittel</Label>
                  <Input
                    value={editedData.separateTitle}
                    onChange={(e) => setEditedData({ ...editedData, separateTitle: e.target.value })}
                  />
                </div>
                {editedData.separateItems.map((item, index) => (
                  <Input
                    key={index}
                    value={item}
                    onChange={(e) => updateItem('separateItems', index, e.target.value)}
                    placeholder={`Punkt ${index + 1}`}
                  />
                ))}
              </div>
            </div>

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

export default EditablePricingDetails;
