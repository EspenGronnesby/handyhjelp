import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, Home, Building2, User, Phone, Mail } from "lucide-react";

interface FormData {
  type: "private" | "business" | null;
  name: string;
  email: string;
  phone: string;
  description: string;
}

export const QuoteForm = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    type: null,
    name: "",
    email: "",
    phone: "",
    description: ""
  });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    toast({
      title: "Takk for henvendelsen!",
      description: "Vi kontakter deg innen 2 timer i åpningstiden med et uforpliktende tilbud.",
      duration: 5000,
    });
    // Reset form
    setStep(1);
    setFormData({
      type: null,
      name: "",
      email: "",
      phone: "",
      description: ""
    });
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.type !== null;
      case 2:
        return formData.name && formData.email && formData.phone;
      case 3:
        return formData.description.length > 10;
      default:
        return false;
    }
  };

  return (
    <Card className="form-professional">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-foreground">Få gratis tilbud</h3>
        <div className="text-sm text-muted-foreground">
          {step}/3: {step === 1 && "Kunde"}
          {step === 2 && "Kontaktinfo"}
          {step === 3 && "Beskrivelse"}
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4 animate-fade-in-up">
          <Label className="text-base font-medium">Privat eller bedrift?</Label>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={formData.type === "private" ? "default" : "outline"}
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => setFormData({ ...formData, type: "private" })}
            >
              <Home className="h-6 w-6" />
              <span>Privat</span>
            </Button>
            <Button
              variant={formData.type === "business" ? "default" : "outline"}
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => setFormData({ ...formData, type: "business" })}
            >
              <Building2 className="h-6 w-6" />
              <span>Bedrift</span>
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 animate-fade-in-up">
          <Label className="text-base font-medium">Dine kontaktopplysninger</Label>
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Fullt navn"
                className="pl-10"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="E-postadresse"
                className="pl-10"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="tel"
                placeholder="Telefonnummer"
                className="pl-10"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 animate-fade-in-up">
          <Label className="text-base font-medium">Beskriv oppdraget</Label>
          <Textarea
            placeholder="Fortell oss om jobben som skal gjøres, når det passer og eventuelle spesielle ønsker..."
            className="min-h-32"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <p className="text-sm text-muted-foreground">
            Jo mer detaljer, desto mer nøyaktig blir tilbudet.
          </p>
        </div>
      )}

      <div className="flex justify-between pt-6 border-t">
        {step > 1 && (
          <Button variant="outline" onClick={handleBack}>
            Tilbake
          </Button>
        )}
        <div className="ml-auto">
          {step < 3 ? (
            <Button 
              onClick={handleNext} 
              disabled={!isStepValid()}
              className="bg-success hover:bg-success-hover text-success-foreground"
            >
              Neste <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={!isStepValid()}
              className="bg-success hover:bg-success-hover text-success-foreground"
            >
              Send forespørsel
            </Button>
          )}
        </div>
      </div>

            {/* Privacy Note - Clean and minimal */}
            <p className="text-xs text-hero-text-muted/80 mt-6 text-center max-w-md mx-auto leading-relaxed">
              Vi svarer som regel innen 2 timer i åpningstiden. Dine opplysninger deles aldri med tredjeparter.
            </p>
    </Card>
  );
};