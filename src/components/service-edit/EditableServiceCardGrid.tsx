import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { useEditMode } from "@/contexts/EditModeContext";
import { useEditableContent } from "@/hooks/useEditableContent";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ServiceCard {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  services: string[];
  targetAudience: string;
  popular?: boolean;
  price?: string;
}

const EditableServiceCardGrid = () => {
  const { editMode } = useEditMode();
  const [isEditing, setIsEditing] = useState(false);
  const { content, updateContent } = useEditableContent("service-cards-grid", "data");

  const defaultServices: ServiceCard[] = [
    {
      id: "vaktmester",
      title: "Vaktmestertjenester",
      subtitle: "Profesjonell eiendomspleie og vedlikehold",
      icon: "🔧",
      services: [
        "Daglig/ukentlig/månedlig tilsyn av bygg",
        "Renhold av fellesarealer og uteområder",
        "Mindre reparasjoner og vedlikehold",
        "Vintervedlikehold (strøing, snørydding)",
        "Inspeksjonsrapporter og dokumentasjon"
      ],
      targetAudience: "Borettslag, sameier, næringseiendom"
    },
    {
      id: "tomrer",
      title: "Tømrertjenester",
      subtitle: "Kvalitetssnekring og konstruksjonsarbeid",
      icon: "🔨",
      services: [
        "Bygging og reparasjon av terrasser",
        "Montering av dører, vinduer og innredning",
        "Takarbeid og taktekking",
        "Renovering av bad og kjøkken (trearbeid)",
        "Laftekonstruksjoner og vedskjul"
      ],
      targetAudience: "Privatpersoner, bedrifter, boligselskaper"
    },
    {
      id: "blikk",
      title: "Blikkenslagertjenester",
      subtitle: "Sikker taktekningsløsninger og vannsystemer",
      icon: "💧",
      services: [
        "Montering og vedlikehold av takrenner",
        "Beslag og blikk på tak og vegger",
        "Tetting og vannsikring",
        "Ventilasjonsarbeider",
        "Inspeksjon av tak og blikkarbeider"
      ],
      targetAudience: "Eiendomsselskaper, borettslag, privatpersoner"
    },
    {
      id: "takrennerens",
      title: "Takrennerens",
      subtitle: "Profesjonell rensing og vedlikehold av takrenner",
      icon: "🌧️",
      services: [
        "Grundig rensing av alle takrenner",
        "Inspeksjon av beslag og feste",
        "Fjerning av løv, mose og rusk",
        "Sjekk av nedløpsrør",
        "Rapport om eventuelle skader"
      ],
      price: "3 390 kr",
      targetAudience: "Eneboligeiere, rekkehus, mindre bygg",
      popular: true
    }
  ];

  const services: ServiceCard[] = content ? JSON.parse(content) : defaultServices;
  const [editedServices, setEditedServices] = useState<ServiceCard[]>(services);

  const handleSave = async () => {
    await updateContent(JSON.stringify(editedServices));
    setIsEditing(false);
  };

  const updateService = (index: number, field: keyof ServiceCard, value: any) => {
    const updated = [...editedServices];
    updated[index] = { ...updated[index], [field]: value };
    setEditedServices(updated);
  };

  const updateServiceItem = (serviceIndex: number, itemIndex: number, value: string) => {
    const updated = [...editedServices];
    updated[serviceIndex].services[itemIndex] = value;
    setEditedServices(updated);
  };

  return (
    <>
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 max-w-7xl relative">
          <div className="bg-card rounded-2xl shadow-lg border border-border/50 p-8 md:p-12">
            {editMode && (
              <button
                onClick={() => setIsEditing(true)}
                className="absolute top-6 right-6 z-10 p-2 bg-primary/10 hover:bg-primary/20 rounded-full border-2 border-primary transition-all hover:scale-110"
                aria-label="Rediger tjenestekort"
              >
                <Pencil className="h-5 w-5 text-primary" />
              </button>
            )}

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              {services.map((service, index) => (
                <Card 
                  key={service.id}
                  id={service.id}
                  className={`group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative scroll-mt-24 p-6 min-h-[520px] flex flex-col animate-fade-in overflow-hidden ${
                    service.popular ? 'border-primary border-2 shadow-lg' : 'border-border'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {service.popular && (
                    <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 text-xs z-10">
                      Populær
                    </Badge>
                  )}
                  
                  <div className="flex justify-start mb-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                      <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{service.icon}</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h3 className="text-xl font-bold mb-1 line-clamp-1">{service.title}</h3>
                    {service.subtitle && (
                      <p className="text-sm text-muted-foreground font-light italic line-clamp-2">{service.subtitle}</p>
                    )}
                  </div>

                  {service.price && (
                    <div className="mb-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <p className="text-xs text-muted-foreground mb-1">Fast pris for enebolig</p>
                      <p className="text-2xl font-bold text-primary">Fra {service.price}</p>
                    </div>
                  )}

                  <div className="space-y-2 mb-4 flex-grow overflow-hidden">
                    {service.services.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm leading-snug line-clamp-1">{item}</span>
                      </div>
                    ))}
                  </div>

                  {service.targetAudience && (
                    <p className="text-xs text-muted-foreground mb-4 italic border-t border-border pt-3 line-clamp-1">
                      <span className="font-semibold">Målgruppe:</span> {service.targetAudience}
                    </p>
                  )}

                  <Link to={`/tjenester/${service.id}`} className="mt-auto">
                    <Button variant="outline" className="w-full hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors duration-300">
                      Les mer
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rediger tjenestekort</DialogTitle>
          </DialogHeader>
          <div className="space-y-8">
            {editedServices.map((service, serviceIndex) => (
              <div key={service.id} className="border-b pb-6">
                <h3 className="text-lg font-semibold mb-4">{service.title}</h3>
                
                <div className="grid gap-4">
                  <div>
                    <Label>Tittel</Label>
                    <Input
                      value={service.title}
                      onChange={(e) => updateService(serviceIndex, 'title', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label>Undertittel</Label>
                    <Input
                      value={service.subtitle}
                      onChange={(e) => updateService(serviceIndex, 'subtitle', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label>Ikon (emoji)</Label>
                    <Input
                      value={service.icon}
                      onChange={(e) => updateService(serviceIndex, 'icon', e.target.value)}
                    />
                  </div>

                  {service.price && (
                    <div>
                      <Label>Pris</Label>
                      <Input
                        value={service.price}
                        onChange={(e) => updateService(serviceIndex, 'price', e.target.value)}
                      />
                    </div>
                  )}

                  <div>
                    <Label>Målgruppe</Label>
                    <Input
                      value={service.targetAudience}
                      onChange={(e) => updateService(serviceIndex, 'targetAudience', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Tjenester (maks 5 vises)</Label>
                    {service.services.map((item, itemIndex) => (
                      <Input
                        key={itemIndex}
                        value={item}
                        onChange={(e) => updateServiceItem(serviceIndex, itemIndex, e.target.value)}
                        className="mb-2"
                      />
                    ))}
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

export default EditableServiceCardGrid;
