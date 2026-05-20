import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, EyeOff, ArrowRight } from "lucide-react";
import { EditButton } from "@/components/ui/EditButton";
import { Link } from "react-router-dom";
import { useEditMode } from "@/contexts/EditModeContext";
import { useEditableContent } from "@/hooks/useEditableContent";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getServiceConfig, getServiceGradient } from "@/lib/serviceIcons";
import { useStaggeredGridReveal } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

interface ServiceCard {
  id: string;
  title: string;
  subtitle: string;
  icon: string; // Kept for backwards compatibility in data, but not used for display
  services: string[];
  targetAudience: string;
  popular?: boolean;
  price?: string;
}

const EditableServiceCardGrid = () => {
  const { editMode, isAdmin } = useEditMode();
  const [isEditing, setIsEditing] = useState(false);
  const { content, updateContent } = useEditableContent("service-cards-grid", "data");

  const defaultServices: ServiceCard[] = [
    {
      id: "vaktmester",
      title: "Vaktmestertjenester",
      subtitle: "Profesjonell eiendomspleie og vedlikehold",
      icon: "vaktmester",
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
      icon: "tomrer",
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
      icon: "blikk",
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
      icon: "takrennerens",
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

  // Check if a service card is hidden (empty title and no services)
  const isServiceHidden = (service: ServiceCard): boolean => {
    const titleEmpty = !service.title || service.title.trim() === '';
    const servicesEmpty = !service.services || service.services.every(s => !s || s.trim() === '');
    return titleEmpty && servicesEmpty;
  };

  // Get visible services for non-admin users
  const visibleServices = services.filter(service =>
    isAdmin && editMode ? true : !isServiceHidden(service)
  );

  // Grid layout based on visible count
  const getGridClass = () => {
    const count = visibleServices.length;
    if (count === 1) return 'flex justify-center';
    if (count === 2) return 'grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto';
    if (count === 3) return 'grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8';
    return 'grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8';
  };

  const handleSave = async () => {
    await updateContent(JSON.stringify(editedServices));
    setIsEditing(false);
  };

  const updateService = (index: number, field: keyof ServiceCard, value: string | string[]) => {
    const updated = [...editedServices];
    updated[index] = { ...updated[index], [field]: value };
    setEditedServices(updated);
  };

  const updateServiceItem = (serviceIndex: number, itemIndex: number, value: string) => {
    const updated = [...editedServices];
    updated[serviceIndex].services[itemIndex] = value;
    setEditedServices(updated);
  };

  // One-time fade-in via IntersectionObserver
  const { ref, getItemStyle } = useStaggeredGridReveal(visibleServices.length, 2, { threshold: 0.1 });

  // Don't render section if no visible services
  if (visibleServices.length === 0 && !(isAdmin && editMode)) {
    return null;
  }

  return (
    <>
      <section className="py-16 md:py-20 bg-muted" ref={ref}>
        <div className="container mx-auto px-4 max-w-7xl relative">
          <div className="bg-card rounded-2xl shadow-lg border border-border/50 p-6 md:p-10 dark:ring-1 dark:ring-white/5">
            {isAdmin && editMode && (
              <EditButton
                onClick={() => setIsEditing(true)}
                ariaLabel="Rediger tjenestekort"
              />
            )}

            <div className={getGridClass()}>
              {visibleServices.map((service, index) => {
                const isHidden = isServiceHidden(service);
                const config = getServiceConfig(service.id);
                const Icon = config.icon;
                const gradient = getServiceGradient(service.id);

                return (
                  <div
                    key={service.id}
                    id={service.id}
                    style={getItemStyle(index)}
                    className="h-full scroll-mt-24"
                  >
                    <div
                      className={cn(
                        "glass-card relative h-full !overflow-visible group flex flex-col",
                        service.popular ? "!border-success !border-2" : "",
                        isHidden && isAdmin && editMode ? "opacity-50 !border-dashed !border-muted-foreground" : ""
                      )}
                    >
                      {/* Hidden indicator for admin */}
                      {isHidden && isAdmin && editMode && (
                        <div className="absolute top-4 left-4 z-10 flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          <EyeOff className="h-3 w-3" />
                          <span>Skjult</span>
                        </div>
                      )}

                      {service.popular && !isHidden && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-success text-success-foreground text-xs font-semibold px-3 py-1 rounded-full z-10">
                          Populær
                        </div>
                      )}

                      {/* Gradient header — static, no tilt */}
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
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Icon
                            className="text-white/95 drop-shadow-lg w-16 h-16 md:w-20 md:h-20 transition-transform duration-300 group-hover:scale-110"
                            strokeWidth={1.5}
                          />
                        </div>
                      </div>

                      <div className="p-4 md:p-6 pt-0 flex-1 flex flex-col">
                        <h3 className="text-lg md:text-xl font-bold text-foreground mb-1 font-heading line-clamp-1">
                          {service.title}
                        </h3>
                        {service.subtitle && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {service.subtitle}
                          </p>
                        )}

                        {service.price && (
                          <div className="mb-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                            <p className="text-xs text-muted-foreground mb-1">Fast pris for enebolig</p>
                            <p className="text-xl font-bold text-primary">Fra {service.price}</p>
                          </div>
                        )}

                        <ul className="space-y-2 mb-4 flex-grow">
                          {service.services.slice(0, 4).map((item, idx) => (
                            item && (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                                <span className="text-muted-foreground leading-snug line-clamp-1">{item}</span>
                              </li>
                            )
                          ))}
                        </ul>

                        {service.targetAudience && (
                          <p className="text-xs text-muted-foreground mb-4 italic border-t border-border pt-3 line-clamp-1">
                            <span className="font-semibold">Målgruppe:</span> {service.targetAudience}
                          </p>
                        )}

                        <Link to={`/tjenester/${service.id}`} className="mt-auto">
                          <Button
                            variant="outline"
                            className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground group/btn"
                          >
                            Les mer
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                    <Label>Tjenester (maks 4 vises)</Label>
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
