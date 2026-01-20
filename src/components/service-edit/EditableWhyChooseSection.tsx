import { useState } from "react";
import { CheckCircle2, Pencil, EyeOff } from "lucide-react";
import { useEditMode } from "@/contexts/EditModeContext";
import { useEditableContent } from "@/hooks/useEditableContent";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { isItemEmpty } from "@/lib/gridUtils";

interface WhyChooseItem {
  title: string;
  description: string;
}

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

  // Dynamic grid class based on visible count
  const getGridClass = () => {
    const count = visibleItems.length;
    if (count === 1) return 'flex justify-center';
    if (count === 2) return 'flex flex-wrap justify-center gap-8';
    return 'flex flex-wrap justify-center gap-8';
  };

  // Dynamic card width class
  const getCardWidthClass = () => {
    const count = visibleItems.length;
    if (count === 1) return 'w-full max-w-sm';
    if (count === 2) return 'w-full md:w-[calc(50%-1rem)] max-w-sm';
    return 'w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] max-w-sm';
  };

  const handleSave = async () => {
    await updateContent(JSON.stringify(editedItems));
    setIsEditing(false);
  };

  const updateItem = (index: number, field: keyof WhyChooseItem, value: string) => {
    const updated = [...editedItems];
    updated[index] = { ...updated[index], [field]: value };
    setEditedItems(updated);
  };

  // Don't render section if no visible items
  if (visibleItems.length === 0 && !(isAdmin && editMode)) {
    return null;
  }

  return (
    <>
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 relative">
          {isAdmin && editMode && (
            <button
              onClick={() => setIsEditing(true)}
              className="absolute top-2 right-2 z-10 p-2 bg-primary/10 hover:bg-primary/20 rounded-full border-2 border-primary transition-all hover:scale-110"
              aria-label="Rediger hvorfor-seksjon"
            >
              <Pencil className="h-5 w-5 text-primary" />
            </button>
          )}

          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-16">
            {heading}
          </h2>
          
          <div className={`${getGridClass()} max-w-5xl mx-auto`}>
            {visibleItems.map((item, index) => {
              const isHidden = isItemEmpty(item.title, item.description);
              
              return (
                <div 
                  key={index} 
                  className={`text-center p-6 rounded-xl card-hover-lift ${getCardWidthClass()}
                    bg-cyan-50/60 dark:bg-cyan-950/30 
                    border border-cyan-200/60 dark:border-cyan-800/40
                    dark:ring-1 dark:ring-white/5
                    ${isHidden && isAdmin && editMode ? 'opacity-50 border-2 border-dashed border-muted-foreground' : ''}`}
                >
                  {/* Hidden indicator for admin */}
                  {isHidden && isAdmin && editMode && (
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-2">
                      <EyeOff className="h-3 w-3" />
                      <span>Skjult</span>
                    </div>
                  )}
                  
                  <div className="w-16 h-16 rounded-full bg-cyan-500 dark:bg-cyan-600 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">
                    {item.description}
                  </p>
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
