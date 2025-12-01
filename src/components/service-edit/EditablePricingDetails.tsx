import { useState } from "react";
import { CheckCircle2, ArrowRight, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEditMode } from "@/contexts/EditModeContext";
import { useEditableContent } from "@/hooks/useEditableContent";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface PricingData {
  heading: string;
  includedTitle: string;
  includedItems: string[];
  separateTitle: string;
  separateItems: string[];
}

const EditablePricingDetails = () => {
  const { isEditMode } = useEditMode();
  const [isEditing, setIsEditing] = useState(false);
  const { content, updateContent } = useEditableContent("pricing-details");

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

  return (
    <>
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 relative">
          {isEditMode && (
            <button
              onClick={() => setIsEditing(true)}
              className="absolute top-2 right-2 z-10 p-2 bg-primary/10 hover:bg-primary/20 rounded-full border-2 border-primary transition-all hover:scale-110"
              aria-label="Rediger prisdetaljer"
            >
              <Pencil className="h-5 w-5 text-primary" />
            </button>
          )}

          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-16">
              {data.heading}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-xl">{data.includedTitle}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.includedItems.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                      <span className="text-base leading-relaxed">{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-xl">{data.separateTitle}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.separateItems.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <ArrowRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-base leading-relaxed">{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
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
