import { useState } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { EditButton } from "@/components/ui/EditButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEditMode } from "@/contexts/EditModeContext";
import { useEditableContent } from "@/hooks/useEditableContent";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

  return (
    <>
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 relative">
          {editMode && (
            <EditButton
              onClick={() => setIsEditing(true)}
              ariaLabel="Rediger sammenligning"
            />
          )}

          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              {data.mainHeading}
            </h2>
            <p className="text-muted-foreground text-lg">
              {data.subheading}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Link to="/tilbud" className="block group">
              <Card className="p-6 card-hover-lift h-full cursor-pointer transition-all hover:border-primary/50 hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-2xl">{data.oneTimeTitle}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.oneTimeItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                      <span className="text-base">{item}</span>
                    </div>
                  ))}
                  <div className="pt-4 text-center">
                    <span className="text-sm text-primary font-medium group-hover:underline flex items-center justify-center gap-1">
                      Send forespørsel
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/fast-avtale" className="block group">
              <Card className="border-primary border-2 shadow-lg p-6 card-hover-lift h-full cursor-pointer transition-all hover:shadow-xl">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-2xl">{data.fixedTitle}</CardTitle>
                    <Badge className="bg-primary text-primary-foreground px-3 py-1">Spar 10%</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.fixedItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                      <span className="text-base">{item}</span>
                    </div>
                  ))}
                  <div className="pt-4 text-center">
                    <span className="text-sm text-primary font-medium group-hover:underline flex items-center justify-center gap-1">
                      Be om fast avtale
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="text-center mt-12">
            <Link to="/fast-avtale">
              <Button variant="cta" size="lg" className="text-lg px-10">
                {data.ctaButtonText}
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
