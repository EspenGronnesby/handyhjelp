import { useState } from "react";
import { CheckCircle2, ArrowRight, Calendar, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EditButton } from "@/components/ui/EditButton";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEditMode } from "@/contexts/EditModeContext";
import { useEditableContent } from "@/hooks/useEditableContent";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GradientHeaderCard } from "@/components/ui/GradientHeaderCard";
import { useStaggeredGridReveal } from "@/hooks/useScrollAnimation";

interface ComparisonData {
  mainHeading: string;
  subheading: string;
  oneTimeTitle: string;
  oneTimeItems: string[];
  fixedTitle: string;
  fixedItems: string[];
  ctaButtonText: string;
}

const EditableComparisonSection = () => {
  const { editMode } = useEditMode();
  const [isEditing, setIsEditing] = useState(false);
  const { content, updateContent } = useEditableContent("comparison-section", "data");

  const defaultData: ComparisonData = {
    mainHeading: "Fast avtale = 10% rabatt",
    subheading: "Få forutsigbare kostnader og prioritert service",
    oneTimeTitle: "Engangsjobb",
    oneTimeItems: [
      "Fleksibel bestilling",
      "Ingen binding",
      "Standard timepriser",
      "Betaler kun for utført arbeid"
    ],
    fixedTitle: "Fast avtale",
    fixedItems: [
      "10% rabatt på alle tjenester",
      "Prioritert service",
      "Fast kontaktperson",
      "Planlagt vedlikehold",
      "Forutsigbare kostnader"
    ],
    ctaButtonText: "Få tilbud på fast avtale"
  };

  const data: ComparisonData = content ? JSON.parse(content) : defaultData;
  const [editedData, setEditedData] = useState<ComparisonData>(data);

  const handleSave = async () => {
    await updateContent(JSON.stringify(editedData));
    setIsEditing(false);
  };

  const updateItem = (list: 'oneTimeItems' | 'fixedItems', index: number, value: string) => {
    const updated = { ...editedData };
    updated[list][index] = value;
    setEditedData(updated);
  };

  const { ref, getItemStyle } = useStaggeredGridReveal(2, 2, { threshold: 0.15 });

  return (
    <>
      <section className="py-10 md:py-20 bg-background">
        <div className="container mx-auto px-4 relative">
          {editMode && (
            <EditButton
              onClick={() => setIsEditing(true)}
              ariaLabel="Rediger sammenligning"
            />
          )}

          <SectionHeading
            icon={Sparkles}
            gradient="from-amber-500 via-orange-500 to-rose-600"
            title={data.mainHeading}
            subtitle={data.subheading}
            align="center"
            className="mb-10 md:mb-14"
          />

          <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
            <Link to="/tilbud" style={getItemStyle(0)} className="block group/link">
              <GradientHeaderCard
                icon={Calendar}
                gradient="from-slate-500 via-zinc-600 to-gray-700"
                title={data.oneTimeTitle}
              >
                <ul className="space-y-3 mt-1 flex-1">
                  {data.oneTimeItems.map((item, idx) => (
                    item && (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm md:text-base text-muted-foreground">{item}</span>
                      </li>
                    )
                  ))}
                </ul>
                <div className="pt-4 mt-auto text-center text-sm text-primary font-medium flex items-center justify-center gap-1 group-hover/link:underline">
                  Send forespørsel
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                </div>
              </GradientHeaderCard>
            </Link>

            <Link to="/fast-avtale" style={getItemStyle(1)} className="block group/link">
              <GradientHeaderCard
                icon={Sparkles}
                gradient="from-emerald-500 via-teal-500 to-cyan-600"
                title={data.fixedTitle}
                badge="Anbefalt"
                highlight
              >
                <ul className="space-y-3 mt-1 flex-1">
                  {data.fixedItems.map((item, idx) => (
                    item && (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                        <span className="text-sm md:text-base text-muted-foreground">{item}</span>
                      </li>
                    )
                  ))}
                </ul>
                <div className="pt-4 mt-auto text-center text-sm text-success font-medium flex items-center justify-center gap-1 group-hover/link:underline">
                  Be om fast avtale
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                </div>
              </GradientHeaderCard>
            </Link>
          </div>

          <div className="text-center mt-10 md:mt-12">
            <Link to="/fast-avtale">
              <Button variant="cta" size="lg" className="text-base md:text-lg px-10 group/btn">
                {data.ctaButtonText}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rediger sammenligningsseksjon</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label>Hovedoverskrift</Label>
              <Input
                value={editedData.mainHeading}
                onChange={(e) => setEditedData({ ...editedData, mainHeading: e.target.value })}
              />
            </div>

            <div>
              <Label>Underoverskrift</Label>
              <Input
                value={editedData.subheading}
                onChange={(e) => setEditedData({ ...editedData, subheading: e.target.value })}
              />
            </div>

            <div className="border-b pb-4">
              <h3 className="text-sm font-semibold mb-3">Engangsjobb</h3>
              <div className="space-y-3">
                <div>
                  <Label>Tittel</Label>
                  <Input
                    value={editedData.oneTimeTitle}
                    onChange={(e) => setEditedData({ ...editedData, oneTimeTitle: e.target.value })}
                  />
                </div>
                {editedData.oneTimeItems.map((item, index) => (
                  <Input
                    key={index}
                    value={item}
                    onChange={(e) => updateItem('oneTimeItems', index, e.target.value)}
                    placeholder={`Punkt ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="border-b pb-4">
              <h3 className="text-sm font-semibold mb-3">Fast avtale</h3>
              <div className="space-y-3">
                <div>
                  <Label>Tittel</Label>
                  <Input
                    value={editedData.fixedTitle}
                    onChange={(e) => setEditedData({ ...editedData, fixedTitle: e.target.value })}
                  />
                </div>
                {editedData.fixedItems.map((item, index) => (
                  <Input
                    key={index}
                    value={item}
                    onChange={(e) => updateItem('fixedItems', index, e.target.value)}
                    placeholder={`Punkt ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label>CTA-knapp tekst</Label>
              <Input
                value={editedData.ctaButtonText}
                onChange={(e) => setEditedData({ ...editedData, ctaButtonText: e.target.value })}
              />
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

export default EditableComparisonSection;
